'use client';

import type { FFmpeg, FFFSType } from '@ffmpeg/ffmpeg';

export const MAX_MEDIA_SIZE = 50 * 1024 * 1024;
const POSTER_TIMEOUT_MS = 60_000;

type ProgressHandler = (progress: number) => void;

let ffmpegPromise: Promise<FFmpeg> | null = null;

export function validateMediaSize(file: File) {
  if (file.size > MAX_MEDIA_SIZE) {
    throw new Error(`${file.name} excede o limite de 50 MB.`);
  }
}

export async function compressImage(file: File, onProgress: ProgressHandler) {
  validateMediaSize(file);
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
    throw new Error(`Formato de imagem não suportado: ${file.type || 'desconhecido'}. Use JPG, PNG, WebP ou AVIF.`);
  }

  onProgress(5);
  const { default: imageCompression } = await import('browser-image-compression');
  const compressed = await imageCompression(file, {
    fileType: 'image/webp',
    maxSizeMB: 2,
    maxWidthOrHeight: 2560,
    initialQuality: 0.82,
    useWebWorker: true,
    onProgress,
  });

  if (compressed.size > MAX_MEDIA_SIZE) {
    throw new Error(`Não foi possível reduzir ${file.name} para menos de 50 MB.`);
  }

  const name = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-_]+/gi, '-');
  return new File([compressed], `${name || 'imagem'}.webp`, { type: 'image/webp' });
}

async function getFFmpeg() {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: '/vendor/ffmpeg/ffmpeg-core.js',
        wasmURL: '/vendor/ffmpeg/ffmpeg-core.wasm',
      });
      return ffmpeg;
    })();
  }

  try {
    return await ffmpegPromise;
  } catch (error) {
    ffmpegPromise = null;
    throw error;
  }
}

function readVideoDuration(file: File) {
  return new Promise<number>((resolve, reject) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('O navegador demorou para ler o vídeo. Tente novamente ou use um arquivo MP4.'));
    }, 15000);

    function cleanup() {
      window.clearTimeout(timeout);
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(objectUrl);
    }

    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();
      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error('O vídeo não informa uma duração válida.'));
        return;
      }
      resolve(duration);
    };
    video.onerror = () => {
      cleanup();
      reject(new Error('O navegador não conseguiu ler a duração deste vídeo. Tente exportá-lo como MP4.'));
    };
    video.src = objectUrl;
  });
}

function generateVideoPoster(file: File, duration: number, name: string) {
  return new Promise<File>((resolve, reject) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('A geração da imagem de prévia excedeu 1 minuto. Tente novamente.'));
    }, POSTER_TIMEOUT_MS);

    function cleanup() {
      window.clearTimeout(timeout);
      video.onloadedmetadata = null;
      video.onseeked = null;
      video.onerror = null;
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(objectUrl);
    }

    video.preload = 'auto';
    video.muted = true;
    video.onloadedmetadata = () => {
      if (!Number.isFinite(video.duration) || video.videoWidth <= 0 || video.videoHeight <= 0) {
        cleanup();
        reject(new Error('O vídeo comprimido não tem dimensões válidas para gerar a imagem de prévia.'));
        return;
      }
      try {
        video.currentTime = Math.min(1, duration / 2);
      } catch {
        cleanup();
        reject(new Error('O navegador não conseguiu acessar um frame do vídeo para gerar a imagem de prévia.'));
      }
    };
    video.onseeked = () => {
      try {
        const scale = Math.min(1, 1280 / video.videoWidth, 1280 / video.videoHeight);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
        canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          cleanup();
          reject(new Error('O navegador não conseguiu preparar a imagem de prévia do vídeo.'));
          return;
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          cleanup();
          if (!blob) {
            reject(new Error('O navegador não conseguiu codificar a imagem de prévia do vídeo.'));
            return;
          }
          resolve(new File([blob], name, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.82);
      } catch {
        cleanup();
        reject(new Error('O navegador encontrou um erro ao gerar a imagem de prévia do vídeo.'));
      }
    };
    video.onerror = () => {
      cleanup();
      reject(new Error('O navegador não conseguiu ler o vídeo comprimido para gerar a imagem de prévia.'));
    };
    video.src = objectUrl;
  });
}

export async function compressVideo(file: File, onProgress: ProgressHandler) {
  if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
    throw new Error(`Formato de vídeo não suportado: ${file.type || 'desconhecido'}. Use MP4, WebM ou MOV.`);
  }

  onProgress(5);
  const duration = await readVideoDuration(file);
  const ffmpeg = await getFFmpeg();
  const id = crypto.randomUUID();
  const inputDirectory = `/input-${id}`;
  const inputPath = `${inputDirectory}/${file.name}`;
  const outputName = `video-${id}.mp4`;
  const compressionProgress = ({ time }: { progress: number; time: number }) => {
    const processedSeconds = time / 1_000_000;
    const ratio = Math.min(1, Math.max(0, processedSeconds / duration));
    onProgress(ratio >= 0.98 ? 85 : 8 + Math.floor(ratio * 76));
  };

  let video: File;
  try {
    onProgress(8);
    ffmpeg.on('progress', compressionProgress);
    await ffmpeg.createDir(inputDirectory);
    await ffmpeg.mount('WORKERFS' as FFFSType, { files: [file] }, inputDirectory);
    const targetTotalKbps = Math.floor((MAX_MEDIA_SIZE * 8 * 0.88) / duration / 1000);
    if (targetTotalKbps < 40) {
      throw new Error('Este vídeo é longo demais para caber em 50 MB com qualidade aceitável. Reduza a duração e tente novamente.');
    }
    const audioKbps = Math.min(96, Math.max(16, Math.floor(targetTotalKbps * 0.12)));
    const videoKbps = Math.min(8000, Math.max(16, targetTotalKbps - audioKbps));
    const compressionStartedAt = Date.now();
    const timeoutUnits = Math.max(1, Math.ceil(file.size / MAX_MEDIA_SIZE), Math.ceil(duration / 300));
    const compressionTimeoutMs = Math.min(timeoutUnits * 15 * 60 * 1000, 2_147_000_000);
    const exitCode = await ffmpeg.exec([
      '-i', inputPath,
      '-vf', "scale='trunc(min(1280,iw)/2)*2':-2,fps=30",
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-b:v', `${videoKbps}k`,
      '-maxrate', `${videoKbps}k`,
      '-bufsize', `${videoKbps * 2}k`,
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', `${audioKbps}k`,
      outputName,
    ], compressionTimeoutMs);
    if (exitCode !== 0) {
      if (Date.now() - compressionStartedAt >= compressionTimeoutMs) {
        throw new Error('O tempo máximo de compressão deste arquivo foi excedido. Tente novamente ou reduza sua resolução/duração.');
      }
      throw new Error('Não foi possível comprimir este vídeo no navegador. Tente novamente ou use um arquivo menor.');
    }

    ffmpeg.off('progress', compressionProgress);
    onProgress(85);
    const videoData = await ffmpeg.readFile(outputName);
    if (typeof videoData === 'string') throw new Error('O arquivo de vídeo comprimido está inválido.');
    video = new File([new Uint8Array(videoData)], `${id}.mp4`, { type: 'video/mp4' });
    if (video.size > MAX_MEDIA_SIZE) {
      throw new Error('O vídeo continua acima de 50 MB após a compressão. Tente reduzir a duração.');
    }
    ffmpeg.off('progress', compressionProgress);
  } finally {
    ffmpeg.off('progress', compressionProgress);
    ffmpeg.terminate();
    ffmpegPromise = null;
  }

  onProgress(92);
  const poster = await generateVideoPoster(video, duration, `${id}-poster.jpg`);
  onProgress(100);
  return { video, poster };
}
