import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

function scoreRelevance(query: string, title: string, extra: string): number {
  const q = query.toLowerCase();
  const t = (title || '').toLowerCase();
  let score = 0;
  if (t === q) score += 100;
  else if (t.startsWith(q)) score += 80;
  else if (t.includes(q)) score += 50;
  if ((extra || '').toLowerCase().includes(q)) score += 20;
  return score;
}

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const q = (sp.get('q') || '').trim();
    const sortBy = (sp.get('sortBy') as 'relevance' | 'date' | 'popularity') || 'relevance';
    const limit = Math.min(parseInt(sp.get('limit') || '50') || 50, 100);
    const offset = Math.max(parseInt(sp.get('offset') || '0') || 0, 0);
    const filterType = sp.get('type') || '';
    const filterSegment = sp.get('segment') || '';

    if (!q) {
      return NextResponse.json({ results: [], total: 0, facets: { types: [], segments: [], difficulties: [] } });
    }

    const isHashtag = q.startsWith('#');
    const searchTerm = isHashtag ? q.substring(1) : q;
    const words = searchTerm.split(/\s+/).filter(w => w.length >= 2);
    
    let combined: any[] = [];

    // Helper: build ilike conditions for a set of columns
    const buildOr = (columns: string[], ws: string[]): string => {
      const parts: string[] = [];
      for (const w of ws) {
        for (const col of columns) {
          parts.push(`${col}.ilike.%${w}%`);
        }
      }
      return parts.join(',');
    };

    // ── 1. RESOURCES ──
    if (!filterType || filterType === 'resource') {
      try {
        let rq = supabase.from('resources').select('id, title, slug, type, description, seo_description, tags, likes_count, created_at, subjects(title), segments(title)');
        if (filterSegment) rq = rq.eq('segment_id', filterSegment);
        
        if (isHashtag) {
          rq = rq.contains('tags', [searchTerm]);
        } else if (words.length > 0) {
          rq = rq.or(buildOr(['title'], words));
        }

        const { data, error } = await rq.limit(50);
        if (error) console.error('Resources search error:', error.message);
        
        if (data) {
          // Client-side filter for multi-word relevance
          const filtered = words.length > 1 ? data.filter((item: any) => {
            const text = `${item.title} ${item.description || ''} ${item.seo_description || ''}`.toLowerCase();
            return words.some(w => text.includes(w.toLowerCase()));
          }) : data;
          
          filtered.forEach((item: any) => {
            combined.push({
              id: item.id, title: item.title, type: 'resource', subtype: item.type,
              url: `/question/${item.slug || item.id}`, date: item.created_at,
              description: item.seo_description || item.description || '',
              tags: item.tags || [], popularity: item.likes_count || 0,
              relevanceScore: scoreRelevance(q, item.title, item.description || ''),
              segment: item.segments?.title, subject: item.subjects?.title,
            });
          });
        }
      } catch (e) { console.error('Resources query failed:', e); }
    }

    // ── 2. NEWS ──
    if (!filterType || filterType === 'news') {
      try {
        let nq = supabase.from('news').select('id, title, slug, category, seo_title, seo_description, views, created_at, segments(title)');
        if (filterSegment) nq = nq.eq('segment_id', filterSegment);
        
        if (words.length > 0) {
          nq = nq.or(buildOr(['title', 'seo_title'], words));
        }

        const { data, error } = await nq.limit(30);
        if (error) console.error('News search error:', error.message);
        
        if (data) {
          data.forEach((item: any) => {
            combined.push({
              id: item.id, title: item.title, type: 'news', subtype: item.category,
              url: `/news/${item.slug || item.id}`, date: item.created_at,
              description: item.seo_description || '', tags: [],
              popularity: item.views || 0,
              relevanceScore: scoreRelevance(q, item.title, item.seo_description || ''),
              segment: item.segments?.title,
            });
          });
        }
      } catch (e) { console.error('News query failed:', e); }
    }

    // ── 3. COURSES ──
    if (!filterType || filterType === 'course') {
      try {
        let cq = supabase.from('courses').select('id, title, slug, description, seo_description, tags, enrollment_count, difficulty_level, created_at, segments(title)');
        if (filterSegment) cq = cq.eq('segment_id', filterSegment);
        
        if (isHashtag) {
          cq = cq.contains('tags', [searchTerm]);
        } else if (words.length > 0) {
          cq = cq.or(buildOr(['title'], words));
        }

        const { data, error } = await cq.limit(30);
        if (error) console.error('Courses search error:', error.message);
        
        if (data) {
          data.forEach((item: any) => {
            combined.push({
              id: item.id, title: item.title, type: 'course',
              url: `/courses/${item.slug || item.id}`, date: item.created_at,
              description: item.seo_description || item.description || '',
              tags: item.tags || [], popularity: item.enrollment_count || 0,
              relevanceScore: scoreRelevance(q, item.title, item.description || ''),
              segment: item.segments?.title, difficulty: item.difficulty_level,
            });
          });
        }
      } catch (e) { console.error('Courses query failed:', e); }
    }

    // ── 4. EBOOKS ──
    if (!filterType || filterType === 'ebook') {
      try {
        let eq2 = supabase.from('ebooks').select('id, title, slug, author, description, seo_description, tags, downloads, created_at, segments(title)');
        if (filterSegment) eq2 = eq2.eq('segment_id', filterSegment);
        
        if (isHashtag) {
          eq2 = eq2.contains('tags', [searchTerm]);
        } else if (words.length > 0) {
          eq2 = eq2.or(buildOr(['title', 'author'], words));
        }

        const { data, error } = await eq2.limit(30);
        if (error) console.error('Ebooks search error:', error.message);
        
        if (data) {
          data.forEach((item: any) => {
            combined.push({
              id: item.id, title: item.title, type: 'ebook',
              url: `/ebooks/${item.slug || item.id}`, date: item.created_at,
              description: item.seo_description || `By ${item.author}`,
              tags: item.tags || [], popularity: item.downloads || 0,
              relevanceScore: scoreRelevance(q, item.title, item.author || ''),
              segment: item.segments?.title,
            });
          });
        }
      } catch (e) { console.error('Ebooks query failed:', e); }
    }

    // Sort
    if (sortBy === 'relevance') combined.sort((a, b) => b.relevanceScore - a.relevanceScore);
    else if (sortBy === 'date') combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    else if (sortBy === 'popularity') combined.sort((a, b) => b.popularity - a.popularity);

    const paginated = combined.slice(offset, offset + limit);

    // Suggestion for zero results
    let suggestion = null;
    if (combined.length === 0 && q.length > 3) {
      try {
        const { data } = await supabase.rpc('get_search_suggestion', { search_term: q });
        if (data) suggestion = data;
      } catch (e) {}
    }

    return NextResponse.json({
      results: paginated,
      total: combined.length,
      suggestion,
      facets: {
        types: Array.from(new Set(combined.map(r => r.type))),
        segments: Array.from(new Set(combined.map(r => r.segment).filter(Boolean))),
        difficulties: Array.from(new Set(combined.map(r => r.difficulty).filter(Boolean))),
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
