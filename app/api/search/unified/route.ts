import { createClient } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

function scoreRelevance(query: string, title: string, description: string = ''): number {
  const q = query.toLowerCase();
  const t = (title || '').toLowerCase();
  const d = (description || '').toLowerCase();
  
  let score = 0;
  if (t === q) score += 100;
  else if (t.startsWith(q)) score += 80;
  else if (t.includes(q)) score += 50;
  
  if (d.includes(q)) score += 20;
  
  return score;
}

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const q = (sp.get('q') || '').trim();
    const type = sp.get('type') || 'all';
    const page = Math.max(1, parseInt(sp.get('page') || '1'));
    const limit = 10;
    const offset = (page - 1) * limit;

    if (!q) {
      return NextResponse.json({ results: [], total: 0 });
    }

    const supabase = await createClient();
    const qLower = `%${q.toLowerCase()}%`;

    const queries: Promise<any>[] = [];

    // 1. BLOGS (resources table, type='blog')
    if (type === 'all' || type === 'blog') {
      queries.push(
        Promise.resolve(supabase.from('resources')
          .select('id, title, teaser, seo_description, created_at')
          .eq('type', 'blog')
          .ilike('title', qLower)
          .limit(20)
          .then(res => (res.data || []).map(i => ({
            ...i, type: 'blog', displayType: 'Blog', 
            url: `/blog/${i.id}`, 
            description: (i.seo_description || i.teaser || '') as string,
            score: scoreRelevance(q, i.title, i.seo_description)
          }))))
      );
    }

    // 2. NEWS
    if (type === 'all' || type === 'news') {
      queries.push(
        Promise.resolve(supabase.from('news')
          .select('id, title, excerpt, seo_description, created_at, category')
          .ilike('title', qLower)
          .limit(20)
          .then(res => (res.data || []).map(i => ({
            ...i, type: 'news', displayType: 'News',
            url: `/news/${i.id}`,
            description: (i.seo_description || i.excerpt || '') as string,
            score: scoreRelevance(q, i.title, i.seo_description)
          }))))
      );
    }

    // 3. COURSES
    if (type === 'all' || type === 'course') {
      queries.push(
        Promise.resolve(supabase.from('courses')
          .select('id, title, description, instructor_name, created_at')
          .ilike('title', qLower)
          .limit(20)
          .then(res => (res.data || []).map(i => ({
            ...i, type: 'course', displayType: 'Course',
            url: `/courses/${i.id}`,
            description: (i.description || `Course by ${i.instructor_name || 'Expert'}`) as string,
            score: scoreRelevance(q, i.title, i.description)
          }))))
      );
    }

    // 4. EBOOKS
    if (type === 'all' || type === 'ebook') {
      queries.push(
        Promise.resolve(supabase.from('ebooks')
          .select('id, title, description, author, created_at')
          .ilike('title', qLower)
          .limit(20)
          .then(res => (res.data || []).map(i => ({
            ...i, type: 'ebook', displayType: 'Ebook',
            url: `/ebooks/${i.id}`,
            description: (i.description || `Ebook by ${i.author || 'Educator'}`) as string,
            score: scoreRelevance(q, i.title, i.description)
          }))))
      );
    }

    // 5. UPDATES (segment_updates join segments)
    if (type === 'all' || type === 'update') {
      queries.push(
        Promise.resolve(supabase.from('segment_updates')
          .select('id, title, content_body, type, created_at, segments(slug)')
          .ilike('title', qLower)
          .limit(20)
          .then(res => (res.data || []).map(i => {
             const segment: any = Array.isArray(i.segments) ? i.segments[0] : i.segments;
             return {
                ...i, type: 'update', displayType: 'Update',
                url: `/resources/${segment?.slug || 'general'}/updates/${i.id}`,
                description: i.content_body?.substring(0, 160).replace(/<[^>]*>/g, '') || '',
                score: scoreRelevance(q, i.title, i.content_body)
             };
          })))
      );
    }

    // 6. LESSON PLANS (curriculum - subjects table)
    if (type === 'all' || type === 'lesson_plan') {
      queries.push(
        Promise.resolve(supabase.from('subjects')
          .select('id, title, groups(segments(title))')
          .ilike('title', qLower)
          .limit(20)
          .then(res => (res.data || []).map(i => {
             const group: any = Array.isArray(i.groups) ? i.groups[0] : i.groups;
             const segment = group ? (Array.isArray(group.segments) ? group.segments[0] : group.segments) : null;
             return {
                ...i, type: 'lesson_plan', displayType: 'Lesson Plan',
                url: `/curriculum/${i.id}`,
                description: `Curriculum for ${i.title} (${segment?.title || 'General'})`,
                score: scoreRelevance(q, i.title),
                created_at: new Date().toISOString()
             };
          })))
      );
    }

    // 7. QUESTIONS (resources type='question' + question_bank)
    if (type === 'all' || type === 'question') {
      // Resource-based questions
      const q1 = Promise.resolve(supabase.from('resources')
        .select('id, title, seo_description, created_at')
        .eq('type', 'question')
        .ilike('title', qLower)
        .limit(10)
        .then(res => (res.data || []).map(i => ({
          ...i, type: 'question', displayType: 'Question',
          url: `/question/${i.id}`,
          description: (i.seo_description || '') as string,
          score: scoreRelevance(q, i.title, i.seo_description)
        }))));

      // Dedicated question_bank
      const q2 = Promise.resolve(supabase.from('question_bank')
        .select('id, question_text, created_at')
        .ilike('question_text', qLower)
        .limit(10)
        .then(res => (res.data || []).map(i => ({
          ...i, title: i.question_text.substring(0, 100).replace(/<[^>]*>/g, '') + '...',
          type: 'question', displayType: 'Question',
          url: `/question/${i.id}`,
          description: i.question_text.replace(/<[^>]*>/g, ''),
          score: scoreRelevance(q, i.question_text.replace(/<[^>]*>/g, ''))
        }))));

      queries.push(Promise.all([q1, q2]).then(results => results.flat()));
    }

    const allResults = (await Promise.all(queries)).flat();

    // Sort by relevance score, then by date
    allResults.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const paginated = allResults.slice(offset, offset + limit);

    return NextResponse.json({
      results: paginated,
      total: allResults.length,
      page,
      limit
    });

  } catch (error) {
    console.error('Unified search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
