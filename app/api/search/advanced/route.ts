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

    // Set default limit if undefined
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const searchTerm = `%${filters.q}%`;
    const results: any[] = [];

    // 1. Search RESOURCES with filters
    const resourcesQuery = supabase
      .from('resources')
      .select(
        'id, slug, title, type, description, content_url, created_at, seo_description, tags, likes_count, view_count, subjects(id, title), segments(id, slug, title)'
      )
      .or(`title.ilike.${searchTerm},seo_title.ilike.${searchTerm},description.ilike.${searchTerm}`);

    const resourcesFilter = applyFilters(resourcesQuery, filters);
    const resourcesResult = await resourcesFilter.range(offset, offset + limit + 10);

    // 2. Search NEWS with filters
    const newsQuery = supabase
      .from('news')
      .select(
        `id, slug, title, category, created_at, seo_description, tags, views, segments(id, slug, title)`
      )
      .or(`title.ilike.${searchTerm},seo_title.ilike.${searchTerm}`);

    const newsFilter = applyFilters(newsQuery, filters);
    const newsResult = await newsFilter.range(offset, offset + Math.floor(limit / 2));

    // 3. Search COURSES with filters
    const coursesQuery = supabase
      .from('courses')
      .select(
        `id, slug, title, instructor, created_at, seo_description, tags, enrollment_count, difficulty_level, segments(id, slug, title)`
      )
      .or(`title.ilike.${searchTerm},seo_title.ilike.${searchTerm},description.ilike.${searchTerm}`);

    const coursesFilter = applyFilters(coursesQuery, filters);
    const coursesResult = await coursesFilter.range(offset, offset + Math.floor(limit / 2));

    // 4. Search EBOOKS with filters
    const ebooksQuery = supabase
      .from('ebooks')
      .select(
        `id, slug, title, author, created_at, seo_description, tags, downloads, segments(id, slug, title)`
      )
      .or(`title.ilike.${searchTerm},seo_title.ilike.${searchTerm},author.ilike.${searchTerm}`);

    const ebooksFilter = applyFilters(ebooksQuery, filters);
    const ebooksResult = await ebooksFilter.range(offset, offset + Math.floor(limit / 3));

    // Normalize and score results
    if (resourcesResult.data) {
      resourcesResult.data.forEach((item: any) => {
        results.push({
          id: item.id,
          title: item.title,
          type: 'resource',
          subtype: item.type,
          url: `/question/${item.slug || item.id}`,
          date: item.created_at,
          description: item.seo_description || item.description || '',
          tags: item.tags || [],
          sourceTable: 'Resources',
          popularity: item.likes_count || 0,
          relevanceScore: scoreRelevance(filters.q, item.title, item.description || ''),
          segment: item.segments?.title,
          subject: item.subjects?.title,
        });
      });
    }

    if (newsResult.data) {
      newsResult.data.forEach((item: any) => {
        results.push({
          id: item.id,
          title: item.title,
          type: 'news',
          subtype: item.category,
          url: `/news/${item.slug || item.id}`,
          date: item.created_at,
          description: item.seo_description || '',
          tags: item.tags || [],
          sourceTable: 'News',
          popularity: item.views || 0,
          relevanceScore: scoreRelevance(filters.q, item.title, ''),
          segment: item.segments?.title,
        });
      });
    }

    if (coursesResult.data) {
      coursesResult.data.forEach((item: any) => {
        results.push({
          id: item.id,
          title: item.title,
          type: 'course',
          subtype: 'Online',
          url: `/courses/${item.slug || item.id}`,
          date: item.created_at,
          description: item.seo_description || '',
          tags: item.tags || [],
          sourceTable: 'Courses',
          popularity: item.enrollment_count || 0,
          relevanceScore: scoreRelevance(filters.q, item.title, ''),
          segment: item.segments?.title,
          difficulty: item.difficulty_level,
        });
      });
    }

    if (ebooksResult.data) {
      ebooksResult.data.forEach((item: any) => {
        results.push({
          id: item.id,
          title: item.title,
          type: 'ebook',
          subtype: 'PDF',
          url: `/ebooks/${item.slug || item.id}`,
          date: item.created_at,
          description: `By ${item.author}`,
          tags: item.tags || [],
          sourceTable: 'eBooks',
          popularity: item.downloads || 0,
          relevanceScore: scoreRelevance(filters.q, item.title, item.author || ''),
          segment: item.segments?.title,
        });
      });
    }

    // Sort results based on sortBy parameter
    if (filters.sortBy === 'relevance') {
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } else if (filters.sortBy === 'date') {
      results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (filters.sortBy === 'popularity') {
      results.sort((a, b) => b.popularity - a.popularity);
    }

    // Slice for pagination
    const paginatedResults = results.slice(offset, offset + limit);

    return NextResponse.json({
      results: paginatedResults,
      total: results.length,
      facets: {
        types: Array.from(new Set(results.map((r) => r.type))),
        segments: Array.from(new Set(results.map((r) => r.segment).filter(Boolean))),
        difficulties: Array.from(new Set(results.map((r) => r.difficulty).filter(Boolean))),
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
