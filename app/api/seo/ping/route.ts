import { NextResponse } from 'next/server';
import { siteConfig } from '@/lib/seo-utils';

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'nextprepbd-indexnow-key-123';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const targetUrl = url.startsWith('http') ? url : `${siteConfig.url}${url.startsWith('/') ? '' : '/'}${url}`;
    const results: any = {};

    // 1. IndexNow (Bing, Yandex, Seznam, Naver)
    try {
      const indexNowRes = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          host: new URL(siteConfig.url).hostname,
          key: INDEXNOW_KEY,
          keyLocation: `${siteConfig.url}/${INDEXNOW_KEY}.txt`,
          urlList: [targetUrl]
        })
      });
      results.indexnow = indexNowRes.status === 200 ? 'success' : `failed: ${indexNowRes.statusText}`;
    } catch (e: any) {
      results.indexnow = `error: ${e.message}`;
    }

    // 2. Google Indexing API
    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      try {
        const { google } = await import('googleapis');
        
        const jwtClient = new google.auth.JWT({
          email: process.env.GOOGLE_CLIENT_EMAIL,
          key: process.env.GOOGLE_PRIVATE_KEY.replace(/^"|"$/g, '').replace(/\\n/g, '\n'),
          scopes: ['https://www.googleapis.com/auth/indexing']
        });

        await jwtClient.authorize();

        const indexing = google.indexing({
          version: 'v3',
          auth: jwtClient,
        });

        const res = await indexing.urlNotifications.publish({
          requestBody: {
            url: targetUrl,
            type: 'URL_UPDATED',
          },
        });
        
        results.google = `success: ${res.status}`;
      } catch (e: any) {
        results.google = `error: ${e.message}. Ensure 'googleapis' is installed via npm.`;
      }
    } else {
      results.google = 'skipped: Google credentials not configured in ENV.';
    }

    return NextResponse.json({ success: true, url: targetUrl, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
