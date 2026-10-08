import { createClient } from '@/lib/supabase/client';

function getPortfolioObjectPath(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const marker = '/storage/v1/object/public/portfolio/';
    const markerIndex = pathname.indexOf(marker);
    return markerIndex === -1 ? null : decodeURIComponent(pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

export async function removeUnreferencedPortfolioMedia(urls: string[]) {
  const candidatePaths = [...new Set(urls.map(getPortfolioObjectPath).filter((path): path is string => Boolean(path)))];
  if (candidatePaths.length === 0) return;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('cover_url,gallery_urls,video_url');
  if (error) throw new Error(`Não foi possível verificar o uso das mídias: ${error.message}`);

  const referencedPaths = new Set(
    (data ?? []).flatMap(project =>
      [project.cover_url, ...(project.gallery_urls ?? []), project.video_url]
        .filter((url): url is string => Boolean(url))
        .map(getPortfolioObjectPath)
        .filter((path): path is string => Boolean(path)),
    ),
  );
  const unusedPaths = candidatePaths.filter(path => !referencedPaths.has(path));
  if (unusedPaths.length === 0) return;

  const { error: removalError } = await supabase.storage.from('portfolio').remove(unusedPaths);
  if (removalError) throw new Error(`Não foi possível remover as mídias antigas: ${removalError.message}`);
}
