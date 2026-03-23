import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface SearchFilters {
  q: string;
  segment?: string;
  group?: string;
  subject?: string;
  type?: string;
  difficulty?: string;
  sortBy?: 'relevance' | 'date' | 'popularity';
  limit?: number;
  offset?: number;
}

// Relevance scoring helper
function scoreRelevance(query: string, title: string, content: string): number {
  const queryLower = query.toLowerCase();
  let score = 0;

  // Exact match in title (highest priority)
  if (title.toLowerCase() === queryLower) score += 100;
  // Title starts with query
  else if (title.toLowerCase().startsWith(queryLower)) score += 80;
  // Title contains query word
  else if (title.toLowerCase().includes(queryLower)) score += 50;

  // Content contains query (lower priority)
  if (content?.toLowerCase().includes(queryLower)) score += 20;

  return score;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters: SearchFilters = {
      q: searchParams.get('q') || '',
      segment: searchParams.get('segment') || undefined,
      group: searchParams.get('group') || undefined,
      subject: searchParams.get('subject') || undefined,
      type: searchParams.get('type') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      sortBy: (searchParams.get('sortBy') as 'relevance' | 'date' | 'popularity') || 'relevance',
      limit: Math.min(parseInt(searchParams.get('limit') || '50') || 50, 100),
      offset: Math.max(parseInt(searchParams.get('offset') || '0') || 0, 0),
    };

    if (!filters.q || filters.q.trim().length === 0) {
      return NextResponse.json({ results: [], total: 0, facets: { types: [], segments: [], difficulties: [] } });
    }

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    const searchTerm = `%${filters.q}%`;
    const words = filters.q.trim().split(/\s+/).filter(w => w.length > 2);
    
    // Create robust OR conditions for multiple words
    const searchConditions = words.length > 0
      ? words.map(w => `title.ilike.%${w}%,seo_title.ilike.%${w}%,description.ilike.%${w}%`).join(',')
      : `title.ilike.${searchTerm},seo_title.ilike.${searchTerm},description.ilike.${searchTerm}`;

    let combinedResults: any[] = [];

    // 1. Search RESOURCES
    const { data: resourcesData } = await applyFilters(
      supabase.from('resources').select('*, subjects(title), segments(title)'),
      filters
    ).or(searchConditions).range(0, 50);

    // 2. Search NEWS
    const { data: newsData } = await applyFilters(
      supabase.from('news').select('*, segments(title)'),
      filters
    ).or(words.length > 0 ? words.map(w => `title.ilike.%${w}%,seo_title.ilike.%${w}%`).join(',') : `title.ilike.${searchTerm},seo_title.ilike.${searchTerm}`).range(0, 30);

    // 3. Search COURSES
    const { data: coursesData } = await applyFilters(
      supabase.from('courses').select('*, segments(title)'),
      filters
    ).or(searchConditions).range(0, 30);

    // 4. Search EBOOKS
    const { data: ebooksData } = await applyFilters(
      supabase.from('ebooks').select('*, segments(title)'),
      filters
    ).or(words.length > 0 ? words.map(w => `title.ilike.%${w}%,author.ilike.%${w}%`).join(',') : `title.ilike.${searchTerm},author.ilike.${searchTerm}`).range(0, 30);

    // Normalize Results
    if (resourcesData) {
      resourcesData.forEach((item: any) => {
        combinedResults.push({
          id: item.id,
          title: item.title,
          type: 'resource',
          subtype: item.type,
          url: `/question/${item.slug || item.id}`,
          date: item.created_at,
          description: item.seo_description || item.description || '',
          tags: item.tags || [],
          popularity: item.likes_count || 0,
          relevanceScore: scoreRelevance(filters.q, item.title, item.description || ''),
          segment: item.segments?.title,
          subject: item.subjects?.title,
        });
      });
    }

    if (newsData) {
      newsData.forEach((item: any) => {
        combinedResults.push({
          id: item.id,
          title: item.title,
          type: 'news',
          subtype: item.category,
          url: `/news/${item.slug || item.id}`,
          date: item.created_at,
          description: item.seo_description || '',
          tags: item.tags || [],
          popularity: item.views || 0,
          relevanceScore: scoreRelevance(filters.q, item.title, ''),
          segment: item.segments?.title,
        });
      });
    }

    if (coursesData) {
      coursesData.forEach((item: any) => {
        combinedResults.push({
          id: item.id,
          title: item.title,
          type: 'course',
          url: `/courses/${item.slug || item.id}`,
          date: item.created_at,
          description: item.seo_description || '',
          tags: item.tags || [],
          popularity: item.enrollment_count || 0,
          relevanceScore: scoreRelevance(filters.q, item.title, ''),
          segment: item.segments?.title,
          difficulty: item.difficulty_level,
        });
      });
    }

    if (ebooksData) {
      ebooksData.forEach((item: any) => {
        combinedResults.push({
          id: item.id,
          title: item.title,
          type: 'ebook',
          url: `/ebooks/${item.slug || item.id}`,
          date: item.created_at,
          description: `By ${item.author}`,
          tags: item.tags || [],
          popularity: item.downloads || 0,
          relevanceScore: scoreRelevance(filters.q, item.title, item.author || ''),
          segment: item.segments?.title,
        });
      });
    }

    // Sort
    if (filters.sortBy === 'relevance') {
      combinedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } else if (filters.sortBy === 'date') {
      combinedResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (filters.sortBy === 'popularity') {
      combinedResults.sort((a, b) => b.popularity - a.popularity);
    }

    const paginated = combinedResults.slice(offset, offset + limit);

    let suggestion = null;
    if (combinedResults.length === 0 && filters.q.length > 3) {
      try {
        const { data, error } = await supabase.rpc('get_search_suggestion', { search_term: filters.q });
        if (!error && data) suggestion = data;
      } catch (e) {}
    }

    return NextResponse.json({
      results: paginated,
      total: combinedResults.length,
      suggestion,
      facets: {
        types: Array.from(new Set(combinedResults.map((r) => r.type))),
        segments: Array.from(new Set(combinedResults.map((r) => r.segment).filter(Boolean))),
        difficulties: Array.from(new Set(combinedResults.map((r) => r.difficulty).filter(Boolean))),
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

function applyFilters(query: any, filters: SearchFilters) {
  if (filters.segment) query = query.eq('segment_id', filters.segment);
  if (filters.type) query = query.eq('type', filters.type);
  if (filters.difficulty) query = query.eq('difficulty_level', filters.difficulty);
  return query;
}
