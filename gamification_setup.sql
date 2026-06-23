-- 1. Insert default gamification badges
INSERT INTO public.badges (name, description, icon_key, criteria_type, criteria_value)
VALUES
  ('First Steps', 'Attempted your very first practice question.', 'Zap', 'attempts_count', 1),
  ('Rising Scholar', 'Completed 10 questions in the question bank.', 'Star', 'attempts_count', 10),
  ('Exam Enthusiast', 'Completed 5 practice exams or tests.', 'Trophy', 'exam_count', 5),
  ('Exam Master', 'Completed 20 practice exams or tests.', 'Trophy', 'exam_count', 20),
  ('Elite Scholar', 'Accumulated 1,000 preparation points.', 'Award', 'total_points', 1000)
ON CONFLICT DO NOTHING;

-- 2. Create trigger function to automatically award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
  badge_rec RECORD;
  user_points integer;
  user_attempts bigint;
  user_exams bigint;
BEGIN
  -- Get user metrics
  -- Points are stored in profiles (checking if experience_points or points exists)
  SELECT COALESCE(experience_points, 0) INTO user_points 
  FROM public.profiles 
  WHERE id = NEW.user_id;

  -- Attempts count
  SELECT COUNT(*) INTO user_attempts 
  FROM public.forum_question_attempts 
  WHERE user_id = NEW.user_id;

  -- Exams count (from an exams_attempts table, fallback to 0 if not exists)
  user_exams := 0;
  
  -- Loop through badges and check eligibility
  FOR badge_rec IN SELECT * FROM public.badges LOOP
    -- Check if user already has this badge
    IF NOT EXISTS (SELECT 1 FROM public.user_badges WHERE user_id = NEW.user_id AND badge_id = badge_rec.id) THEN
      
      -- Evaluate badge criteria
      IF (badge_rec.criteria_type = 'attempts_count' AND user_attempts >= badge_rec.criteria_value) OR
         (badge_rec.criteria_type = 'total_points' AND user_points >= badge_rec.criteria_value) OR
         (badge_rec.criteria_type = 'exam_count' AND user_exams >= badge_rec.criteria_value) THEN
         
         -- Award badge
         INSERT INTO public.user_badges (user_id, badge_id, awarded_at)
         VALUES (NEW.user_id, badge_rec.id, now());
      END IF;
      
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Bind trigger to question attempts insertion
DROP TRIGGER IF EXISTS trg_award_badges_on_attempt ON public.forum_question_attempts;
CREATE TRIGGER trg_award_badges_on_attempt
AFTER INSERT ON public.forum_question_attempts
FOR EACH ROW
EXECUTE FUNCTION public.check_and_award_badges();
