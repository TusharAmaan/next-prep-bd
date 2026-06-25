import { createClient } from '@/lib/supabaseServer';
import { siteConfig } from '@/lib/seo-utils';

export async function GET() {
  const supabase = await createClient();
  const BASE_URL = siteConfig.url;

  try {
    // Fetch latest blogs, news, updates
    const [
      { data: blogs },
      { data: news },
      { data: updates }
    ] = await Promise.all([
      supabase.from('resources').select('id, title, seo_description, created_at').eq('type', 'blog').order('created_at', { ascending: false }).limit(20),
      supabase.from('news').select('id, title, description, created_at').order('created_at', { ascending: false }).limit(20),
      supabase.from('segment_updates').select('id, title, content_body, created_at').order('created_at', { ascending: false }).limit(20)
    ]);

    const items: Array<{ title: string; url: string; description: string; date: string }> = [];

    (blogs || []).forEach(post => {
      items.push({
        title: post.title,
        url: `${BASE_URL}/blog/${post.id}`,
        description: post.seo_description || 'New blog post from NextPrepBD',
        date: new Date(post.created_at).toUTCString()
      });
    });

    (news || []).forEach(item => {
      items.push({
        title: item.title,
        url: `${BASE_URL}/news/${item.id}`,
        description: item.description?.substring(0, 200) || 'Latest news',
        date: new Date(item.created_at).toUTCString()
      });
    });

    (updates || []).forEach(update => {
      items.push({
        title: update.title,
        url: `${BASE_URL}/update/${update.id}`,
        description: update.content_body?.replace(/<[^>]+>/g, '').substring(0, 200) || 'New update',
        date: new Date(update.created_at).toUTCString()
      });
    });

    // Sort globally by date
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const rssItems = items.map(item => `
      <item>
        <title><![CDATA[${item.title}]]></title>
        <link>${item.url}</link>
        <guid>${item.url}</guid>
        <pubDate>${item.date}</pubDate>
        <description><![CDATA[${item.description}]]></description>
      </item>
    `).join('');

    const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name} Feed</title>
    <link>${BASE_URL}</link>
    <description>${siteConfig.description}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

    return new Response(rssFeed, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      }
    });

  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new Response('Error generating feed', { status: 500 });
  }
}
