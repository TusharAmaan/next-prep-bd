import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  scheduleInterview,
  rescheduleInterview,
  selectInterviewQuestions,
  scoreInterviewResponse,
  generatePerformanceReport,
  generateAutoFeedback,
  analyzePerformanceByCategory,
  getNextStepRecommendations,
  updateInterviewStatus,
  getAvailableTutors,
  calculateConsistencyMetrics,
} from '@/lib/interviewPrepUtils';

const supabase = createClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get interview list
    if (action === 'list-interviews') {
      const limit = parseInt(searchParams.get('limit') || '10');
      const offset = parseInt(searchParams.get('offset') || '0');
      const status = searchParams.get('status');
      const role = searchParams.get('role') || 'student'; // student or tutor

      let query = supabase
        .from('interviews')
        .select('*', { count: 'exact' });

      if (role === 'student') {
        query = query.eq('student_id', user.id);
      } else if (role === 'tutor') {
        query = query.eq('tutor_id', user.id);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data: interviews, count, error } = await query
        .order('scheduled_time', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        interviews,
        count,
        limit,
        offset,
      });
    }

    // Get interview details
    if (action === 'get-interview') {
      const interviewId = searchParams.get('interviewId');
      if (!interviewId) {
        return NextResponse.json(
          { error: 'interviewId is required' },
          { status: 400 }
        );
      }

      const { data: interview, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', interviewId)
        .single();

      if (error) throw error;

      // Check authorization
      if (
        interview.student_id !== user.id &&
        interview.tutor_id !== user.id
      ) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        interview,
      });
    }

    // Get available tutors
    if (action === 'available-tutors') {
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const interviewType = searchParams.get('interviewType');

      if (!startDate || !endDate || !interviewType) {
        return NextResponse.json(
          { error: 'startDate, endDate, and interviewType are required' },
          { status: 400 }
        );
      }

      const tutors = await getAvailableTutors(startDate, endDate, interviewType);
      return NextResponse.json({
        success: true,
        tutors,
      });
    }

    // Get performance report
    if (action === 'performance-report') {
      const studentId = searchParams.get('studentId') || user.id;
      const days = parseInt(searchParams.get('days') || '30');

      // Check authorization
      if (studentId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const report = await generatePerformanceReport(studentId, days);
      return NextResponse.json({
        success: true,
        report,
      });
    }

    // Get questions for interview
    if (action === 'get-questions') {
      const interviewId = searchParams.get('interviewId');
      if (!interviewId) {
        return NextResponse.json(
          { error: 'interviewId is required' },
          { status: 400 }
        );
      }

      const { data: interview, error: interviewError } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', interviewId)
        .single();

      if (interviewError) throw interviewError;

      if (
        interview.student_id !== user.id &&
        interview.tutor_id !== user.id
      ) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { data: questions, error } = await supabase
        .from('interview_question_sets')
        .select('questions')
        .eq('interview_id', interviewId)
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        questions: questions?.questions || [],
      });
    }

    // Get recommendations
    if (action === 'get-recommendations') {
      const recommendations = await getNextStepRecommendations(user.id);
      return NextResponse.json({
        success: true,
        recommendations,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Interview GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // Schedule interview
    if (action === 'schedule') {
      const { studentId, tutorId, interviewType, scheduledTime, duration, format } = body;

      if (!studentId || !tutorId || !interviewType || !scheduledTime || !duration) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const result = await scheduleInterview(
        studentId,
        tutorId,
        interviewType,
        scheduledTime,
        duration,
        format
      );

      return NextResponse.json({
        success: true,
        interview: result.interview,
      });
    }

    // Reschedule interview
    if (action === 'reschedule') {
      const { interviewId, newScheduledTime, newDuration } = body;

      if (!interviewId || !newScheduledTime) {
        return NextResponse.json(
          { error: 'interviewId and newScheduledTime are required' },
          { status: 400 }
        );
      }

      // Verify authorization
      const { data: interview } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', interviewId)
        .single();

      if (!interview || (interview.student_id !== user.id && interview.tutor_id !== user.id)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const result = await rescheduleInterview(interviewId, newScheduledTime, newDuration);
      return NextResponse.json({ success: true, ...result });
    }

    // Submit feedback
    if (action === 'submit-feedback') {
      const { interviewId, feedbackType, content, rating } = body;

      if (!interviewId || !feedbackType || !content) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('interview_feedback')
        .insert({
          interview_id: interviewId,
          user_id: user.id,
          feedback_type: feedbackType,
          content,
          rating,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Feedback submitted successfully',
      });
    }

    // Score interview
    if (action === 'score-interview') {
      const { interviewId, evaluatorScores, rubricType, comments } = body;

      if (!interviewId || !evaluatorScores || !rubricType) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const scoreResult = scoreInterviewResponse([], rubricType, evaluatorScores);

      // Generate auto feedback
      const autoFeedback = generateAutoFeedback(scoreResult.percentage / 100, [], scoreResult);

      // Update interview with score and feedback
      const { error: updateError } = await supabase
        .from('interviews')
        .update({
          final_score: scoreResult.percentage,
          rubric_scores: scoreResult.scores,
          tutor_comments: comments,
          auto_feedback: autoFeedback,
          last_updated_by: user.id,
          last_updated_at: new Date().toISOString(),
        })
        .eq('id', interviewId);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        score: scoreResult,
        feedback: autoFeedback,
      });
    }

    // Get recommendations
    if (action === 'get-recommendations') {
      const recommendations = await getNextStepRecommendations(user.id);
      return NextResponse.json({
        success: true,
        recommendations,
      });
    }

    // Select questions
    if (action === 'select-questions') {
      const { interviewType, difficulty, categories, numQuestions } = body;

      if (!interviewType || !difficulty || !categories || !numQuestions) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const questions = await selectInterviewQuestions(
        interviewType,
        difficulty,
        categories,
        numQuestions
      );

      return NextResponse.json({
        success: true,
        questions,
      });
    }

    // Cancel interview
    if (action === 'cancel') {
      const { interviewId } = body;

      if (!interviewId) {
        return NextResponse.json(
          { error: 'interviewId is required' },
          { status: 400 }
        );
      }

      // Verify authorization
      const { data: interview } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', interviewId)
        .single();

      if (!interview || (interview.student_id !== user.id && interview.tutor_id !== user.id)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const result = await updateInterviewStatus(interviewId, 'cancelled');
      return NextResponse.json({ success: true, ...result });
    }

    // Complete interview
    if (action === 'complete') {
      const { interviewId, finalScore, recordingUrl } = body;

      if (!interviewId) {
        return NextResponse.json(
          { error: 'interviewId is required' },
          { status: 400 }
        );
      }

      const result = await updateInterviewStatus(interviewId, 'completed', {
        final_score: finalScore,
        recording_url: recordingUrl,
        completed_at: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Interview POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { interviewId, updateData } = body;

    if (!interviewId || !updateData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify authorization
    const { data: interview } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', interviewId)
      .single();

    if (!interview || (interview.tutor_id !== user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('interviews')
      .update({
        ...updateData,
        last_updated_at: new Date().toISOString(),
      })
      .eq('id', interviewId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Interview PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get('interviewId');

    if (!interviewId) {
      return NextResponse.json(
        { error: 'interviewId is required' },
        { status: 400 }
      );
    }

    // Verify authorization
    const { data: interview } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', interviewId)
      .single();

    if (!interview || (interview.student_id !== user.id && interview.tutor_id !== user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete
    const { error } = await supabase
      .from('interviews')
      .update({ status: 'cancelled' })
      .eq('id', interviewId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Interview DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
