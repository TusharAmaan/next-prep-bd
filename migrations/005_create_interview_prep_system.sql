-- Interview Prep Module Database Schema
-- Migration: 005_create_interview_prep_system.sql

-- ============ CREATE INTERVIEWS TABLE ============
CREATE TABLE IF NOT EXISTS interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interview_type VARCHAR(50) NOT NULL,
  difficulty VARCHAR(50) DEFAULT 'intermediate',
  format VARCHAR(50) NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status VARCHAR(50) DEFAULT 'draft',
  
  -- Performance Data
  final_score DECIMAL(5, 2),
  rubric_scores JSONB,
  auto_feedback JSONB,
  tutor_comments TEXT,
  
  -- Recording & Metadata
  recording_url TEXT,
  transcription TEXT,
  meeting_room_id VARCHAR(255),
  
  -- Tracking
  question_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  completed_at TIMESTAMP WITH TIME ZONE,
  last_updated_by UUID,
  last_updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interviews_student_id ON interviews(student_id);
CREATE INDEX idx_interviews_tutor_id ON interviews(tutor_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_scheduled_time ON interviews(scheduled_time);
CREATE INDEX idx_interviews_interview_type ON interviews(interview_type);
CREATE INDEX idx_interviews_difficulty ON interviews(difficulty);
CREATE INDEX idx_interviews_created_at ON interviews(created_at);
CREATE INDEX idx_interviews_student_status ON interviews(student_id, status);
CREATE INDEX idx_interviews_tutor_scheduled ON interviews(tutor_id, scheduled_time);

-- ============ CREATE INTERVIEW QUESTIONS TABLE ============
CREATE TABLE IF NOT EXISTS interview_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_type VARCHAR(50) NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  expected_answer TEXT,
  hints TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Metadata
  time_limit_seconds INTEGER DEFAULT 300,
  follow_up_questions TEXT[] DEFAULT ARRAY[]::TEXT[],
  related_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  difficulty_rating DECIMAL(3, 2),
  
  -- Quality Control
  active BOOLEAN DEFAULT TRUE,
  verified BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2),
  created_by UUID REFERENCES auth.users(id),
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interview_questions_type ON interview_questions(interview_type);
CREATE INDEX idx_interview_questions_difficulty ON interview_questions(difficulty);
CREATE INDEX idx_interview_questions_category ON interview_questions(category);
CREATE INDEX idx_interview_questions_active ON interview_questions(active);
CREATE INDEX idx_interview_questions_verified ON interview_questions(verified);
CREATE INDEX idx_interview_questions_type_difficulty_category 
  ON interview_questions(interview_type, difficulty, category);

-- ============ CREATE INTERVIEW QUESTION SETS TABLE ============
CREATE TABLE IF NOT EXISTS interview_question_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID NOT NULL UNIQUE REFERENCES interviews(id) ON DELETE CASCADE,
  questions JSONB NOT NULL, -- Array of question objects
  total_questions INTEGER NOT NULL,
  question_ids UUID[] NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interview_question_sets_interview_id ON interview_question_sets(interview_id);

-- ============ CREATE INTERVIEW FEEDBACK TABLE ============
CREATE TABLE IF NOT EXISTS interview_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback_type VARCHAR(50) NOT NULL, -- strengths, areas_for_improvement, etc.
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_anonymous BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interview_feedback_interview_id ON interview_feedback(interview_id);
CREATE INDEX idx_interview_feedback_user_id ON interview_feedback(user_id);
CREATE INDEX idx_interview_feedback_type ON interview_feedback(feedback_type);

-- ============ CREATE INTERVIEW RESPONSES TABLE ============
CREATE TABLE IF NOT EXISTS interview_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Response Data
  response_text TEXT,
  response_code TEXT,
  response_json JSONB,
  response_video_url TEXT,
  response_recording_url TEXT,
  
  -- Timing
  time_spent_seconds INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  
  -- Evaluation
  score DECIMAL(5, 2),
  evaluator_feedback TEXT,
  evaluated_by UUID REFERENCES auth.users(id),
  evaluated_at TIMESTAMP WITH TIME ZONE,
  
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interview_responses_interview_id ON interview_responses(interview_id);
CREATE INDEX idx_interview_responses_question_id ON interview_responses(question_id);
CREATE INDEX idx_interview_responses_student_id ON interview_responses(student_id);
CREATE INDEX idx_interview_responses_score ON interview_responses(score);

-- ============ CREATE INTERVIEW PERFORMANCE TABLE ============
CREATE TABLE IF NOT EXISTS interview_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Aggregate Stats
  total_interviews INTEGER DEFAULT 0,
  completed_interviews INTEGER DEFAULT 0,
  average_score DECIMAL(5, 2),
  highest_score DECIMAL(5, 2),
  lowest_score DECIMAL(5, 2),
  
  -- Streaks & Consistency
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_passed INTEGER DEFAULT 0,
  pass_rate DECIMAL(5, 2),
  consistency_score DECIMAL(5, 2),
  
  -- Category Performance
  category_performance JSONB, -- { category: { avg_score, attempts } }
  type_performance JSONB, -- { interview_type: { avg_score, attempts } }
  
  -- Progress
  improvement_rate DECIMAL(5, 2),
  recommended_next_step JSONB,
  
  last_interview_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interview_performance_student_id ON interview_performance(student_id);

-- ============ CREATE INTERVIEW AUDIT LOG TABLE ============
CREATE TABLE IF NOT EXISTS interview_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID REFERENCES interviews(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- created, started, completed, scored, etc.
  action_details JSONB,
  ip_address INET,
  user_agent TEXT,
  changes_made JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interview_audit_log_interview_id ON interview_audit_log(interview_id);
CREATE INDEX idx_interview_audit_log_user_id ON interview_audit_log(user_id);
CREATE INDEX idx_interview_audit_log_action ON interview_audit_log(action);
CREATE INDEX idx_interview_audit_log_created_at ON interview_audit_log(created_at);

-- ============ CREATE INTERVIEW ALERTS TABLE ============
CREATE TABLE IF NOT EXISTS interview_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- low_performance, scheduling_conflict, etc.
  severity VARCHAR(50) NOT NULL, -- critical, high, medium, low
  message TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interview_alerts_interview_id ON interview_alerts(interview_id);
CREATE INDEX idx_interview_alerts_severity ON interview_alerts(severity);
CREATE INDEX idx_interview_alerts_is_resolved ON interview_alerts(is_resolved);

-- ============ CREATE ROW LEVEL SECURITY POLICIES ============

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_audit_log ENABLE ROW LEVEL SECURITY;

-- Interviews RLS: Students view own interviews, tutors view their assigned interviews, admins view all
CREATE POLICY interviews_student_select ON interviews FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = tutor_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY interviews_student_insert ON interviews FOR INSERT
  WITH CHECK (auth.uid() = student_id OR auth.uid() = tutor_id);

CREATE POLICY interviews_update ON interviews FOR UPDATE
  USING (auth.uid() = student_id OR auth.uid() = tutor_id)
  WITH CHECK (auth.uid() = student_id OR auth.uid() = tutor_id);

-- Feedback RLS
CREATE POLICY feedback_select ON interview_feedback FOR SELECT
  USING (
    auth.uid() IN (
      SELECT student_id FROM interviews WHERE id = interview_id
    ) OR
    auth.uid() IN (
      SELECT tutor_id FROM interviews WHERE id = interview_id
    ) OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY feedback_insert ON interview_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Responses RLS
CREATE POLICY responses_select ON interview_responses FOR SELECT
  USING (
    auth.uid() = student_id OR
    auth.uid() IN (
      SELECT tutor_id FROM interviews WHERE id = interview_id
    ) OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY responses_insert ON interview_responses FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY responses_update ON interview_responses FOR UPDATE
  USING (auth.uid() = student_id OR auth.uid() IN (SELECT tutor_id FROM interviews WHERE id = interview_id))
  WITH CHECK (auth.uid() = student_id OR auth.uid() IN (SELECT tutor_id FROM interviews WHERE id = interview_id));

-- Performance RLS
CREATE POLICY performance_select ON interview_performance FOR SELECT
  USING (auth.uid() = student_id OR auth.jwt() ->> 'role' = 'admin');

-- Audit Log RLS: Only admins can view
CREATE POLICY audit_log_select ON interview_audit_log FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============ CREATE TRIGGERS ============

-- Update interview updated_at timestamp
CREATE OR REPLACE FUNCTION update_interview_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER interview_updated_at_trigger
BEFORE UPDATE ON interviews
FOR EACH ROW
EXECUTE FUNCTION update_interview_updated_at();

-- Log interview actions to audit log
CREATE OR REPLACE FUNCTION log_interview_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO interview_audit_log (
    interview_id,
    user_id,
    action,
    ip_address,
    user_agent
  ) VALUES (
    NEW.id,
    COALESCE(auth.uid(), NEW.last_updated_by),
    CASE
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN TG_OP = 'UPDATE' THEN 'updated'
    END,
    current_setting('request.ip')::inet,
    current_setting('request.headers')::json ->> 'user-agent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER interview_audit_trigger
AFTER INSERT OR UPDATE ON interviews
FOR EACH ROW
EXECUTE FUNCTION log_interview_action();

-- Update performance stats when interview completes
CREATE OR REPLACE FUNCTION update_performance_on_interview_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO interview_performance (student_id) VALUES (NEW.student_id)
    ON CONFLICT (student_id) DO UPDATE SET
      total_interviews = interview_performance.total_interviews + 1,
      completed_interviews = interview_performance.completed_interviews + 1,
      average_score = (
        (interview_performance.average_score * interview_performance.completed_interviews + COALESCE(NEW.final_score, 0)) /
        (interview_performance.completed_interviews + 1)
      ),
      highest_score = GREATEST(interview_performance.highest_score, COALESCE(NEW.final_score, 0)),
      lowest_score = LEAST(COALESCE(interview_performance.lowest_score, 100), COALESCE(NEW.final_score, 100)),
      last_interview_at = NOW(),
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER performance_update_trigger
AFTER UPDATE ON interviews
FOR EACH ROW
EXECUTE FUNCTION update_performance_on_interview_complete();

-- ============ CREATE VIEWS ============

-- Interview summary for dashboards
CREATE OR REPLACE VIEW interview_summary AS
SELECT
  i.id,
  i.student_id,
  i.tutor_id,
  i.interview_type,
  i.difficulty,
  i.format,
  i.scheduled_time,
  i.status,
  i.final_score,
  COUNT(DISTINCT ir.id) as response_count,
  COUNT(DISTINCT iff.id) as feedback_count,
  i.created_at,
  i.updated_at
FROM interviews i
LEFT JOIN interview_responses ir ON i.id = ir.interview_id
LEFT JOIN interview_feedback iff ON i.id = iff.interview_id
GROUP BY i.id, i.student_id, i.tutor_id, i.interview_type, i.difficulty,
         i.format, i.scheduled_time, i.status, i.final_score, i.created_at, i.updated_at;

-- Performance metrics by student
CREATE OR REPLACE VIEW student_performance_metrics AS
SELECT
  ip.student_id,
  ip.total_interviews,
  ip.completed_interviews,
  ip.average_score,
  ip.highest_score,
  ip.lowest_score,
  ip.pass_rate,
  ip.consistency_score,
  ip.improvement_rate,
  ip.current_streak,
  ip.longest_streak,
  ROUND((ip.completed_interviews::DECIMAL / NULLIF(ip.total_interviews, 0)) * 100, 2) as completion_rate
FROM interview_performance ip;

-- ============ GRANTS ============

GRANT SELECT ON interviews TO authenticated;
GRANT INSERT ON interviews TO authenticated;
GRANT UPDATE ON interviews TO authenticated;
GRANT SELECT ON interview_questions TO authenticated;
GRANT SELECT ON interview_feedback TO authenticated;
GRANT INSERT ON interview_feedback TO authenticated;
GRANT SELECT ON interview_responses TO authenticated;
GRANT INSERT ON interview_responses TO authenticated;
GRANT UPDATE ON interview_responses TO authenticated;
GRANT SELECT ON interview_performance TO authenticated;
GRANT SELECT ON interview_summary TO authenticated;
GRANT SELECT ON student_performance_metrics TO authenticated;
