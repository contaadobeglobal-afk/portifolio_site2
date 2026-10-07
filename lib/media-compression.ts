'use client';

import type { FFmpeg } from '@ffmpeg/ffmpeg';

export const MAX_MEDIA_SIZE = 50 * 1024 * 1024;

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

async function getFFmpeg(onProgress: ProgressHandler) {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const ffmpeg = new FFmpeg();
      ffmpeg.on('progress', ({ progress }) => onProgress(Math.min(85, Math.max(5, Math.round(progress * 80)))));
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

export async function compressVideo(file: File, onProgress: ProgressHandler) {
  validateMediaSize(file);
  if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
    throw new Error(`Formato de vídeo não suportado: ${file.type || 'desconhecido'}. Use MP4, WebM ou MOV.`);
  }

  const ffmpeg = await getFFmpeg(onProgress);
  const id = crypto.randomUUID();
  const extension = file.type === 'video/webm' ? 'webm' : file.type === 'video/quicktime' ? 'mov' : 'mp4';
  const inputName = `input-${id}.${extension}`;
  const outputName = `video-${id}.mp4`;
  const posterName = `poster-${id}.jpg`;

  try {
    onProgress(8);
    await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
    const probeCode = await ffmpeg.ffprobe([
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      inputName,
      '-o', `duration-${id}.txt`,
    ]);
    if (probeCode !== 0) throw new Error('Não foi possível ler a duração do vídeo.');

    const durationText = await ffmpeg.readFile(`duration-${id}.txt`, 'utf8');
    const duration = Number(durationText);
    if (!Number.isFinite(duration) || duration <= 0) throw new Error('A duração do vídeo é inválida.');

    const targetTotalKbps = Math.floor((MAX_MEDIA_SIZE * 8 * 0.88) / duration / 1000);
    if (targetTotalKbps < 40) {
      throw new Error('Este vídeo é longo demais para caber em 50 MB com qualidade aceitável. Reduza a duração e tente novamente.');
    }
    const audioKbps = Math.min(96, Math.max(16, Math.floor(targetTotalKbps * 0.12)));
    const videoKbps = Math.min(8000, Math.max(16, targetTotalKbps - audioKbps));
    const exitCode = await ffmpeg.exec([
      '-i', inputName,
      '-vf', "scale='trunc(min(1920,iw)/2)*2':-2,fps=30",
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-b:v', `${videoKbps}k`,
      '-maxrate', `${videoKbps}k`,
      '-bufsize', `${videoKbps * 2}k`,
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', `${audioKbps}k`,
      '-movflags', '+faststart',
      outputName,
    ]);
    if (exitCode !== 0) throw new Error('Não foi possível comprimir este vídeo no navegador.');

    const videoData = await ffmpeg.readFile(outputName);
    if (typeof videoData === 'string') throw new Error('O arquivo de vídeo comprimido está inválido.');
    const video = new File([new Uint8Array(videoData)], `${id}.mp4`, { type: 'video/mp4' });
    if (video.size > MAX_MEDIA_SIZE) {
      throw new Error('O vídeo continua acima de 50 MB após a compressão. Tente reduzir a duração.');
    }

    onProgress(92);
    const posterCode = await ffmpeg.exec([
      '-ss', String(Math.min(1, duration / 2)),
      '-i', outputName,
      '-frames:v', '1',
      '-vf', "scale='trunc(min(1280,iw)/2)*2':-2",
      '-q:v', '5',
      posterName,
    ]);
    if (posterCode !== 0) throw new Error('O vídeo foi comprimido, mas não foi possível gerar a imagem de prévia.');

    const posterData = await ffmpeg.readFile(posterName);
    if (typeof posterData === 'string') throw new Error('A imagem de prévia do vídeo está inválida.');
    const poster = new File([new Uint8Array(posterData)], `${id}-poster.jpg`, { type: 'image/jpeg' });
    onProgress(100);
    return { video, poster };
  } finally {
    ffmpeg.terminate();
    ffmpegPromise = null;
  }
}
