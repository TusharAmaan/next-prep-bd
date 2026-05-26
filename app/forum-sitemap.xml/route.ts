import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // Use a direct Supabase instance for generating the sitemap
  // We use the anon key since we only want public threads
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // In a real scenario with 10k+ threads, we would chunk this using query params
  // e.g. /forum-sitemap.xml?page=1
  // For this blueprint, we demonstrate a basic fetch of the latest 50,000 threads
  const { data: threads } = await supabase
    .from('forum_threads')
    .select('id, updated_at')
    .order('updated_at', { ascending: false })
    .limit(50000);

  if (!threads) {
    return new Response('Error fetching threads', { status: 500 });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${threads.map((thread) => `
    <url>
      <loc>https://nextprepbd.com/forum/thread/${thread.id}</loc>
      <lastmod>${new Date(thread.updated_at).toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
    </url>
  `).join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
