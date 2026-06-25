-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  full_name text,
  role text DEFAULT 'tutor'::text CHECK (role = ANY (ARRAY['tutor'::text, 'admin'::text, 'pending'::text, 'student'::text])),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  bio text,
  phone text,
  institution text,
  batch text,
  whatsapp text,
  status text DEFAULT 'active'::text,
  current_goal text,
  city text,
  country text,
  location_updated_at timestamp with time zone,
  goal text,
  is_featured boolean DEFAULT false,
  hourly_rate text,
  admin_notes text,
  date_of_birth date,
  interested_segments ARRAY,
  academic_records jsonb DEFAULT '[]'::jsonb,
  social_links jsonb DEFAULT '{}'::jsonb,
  skills ARRAY,
  subjects jsonb DEFAULT '[]'::jsonb,
  subscription_plan text DEFAULT 'free'::text,
  subscription_status text DEFAULT 'active'::text,
  subscription_expiry timestamp with time zone,
  is_trial_used boolean DEFAULT false,
  max_questions integer DEFAULT 50,
  current_question_count integer DEFAULT 0,
  monthly_question_count integer DEFAULT 0,
  last_reset_date timestamp with time zone DEFAULT now(),
  stripe_customer_id character varying,
  current_license_id uuid,
  target_exam text,
  target_group_id bigint,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_active_date timestamp with time zone,
  gamification_points integer DEFAULT 0,
  gamification_rank text DEFAULT 'Novice'::text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_current_license_id_fkey FOREIGN KEY (current_license_id) REFERENCES public.licenses(id),
  CONSTRAINT profiles_target_group_id_fkey FOREIGN KEY (target_group_id) REFERENCES public.groups(id)
);
CREATE TABLE public.segments (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  icon_url text,
  routine_url text,
  syllabus_url text,
  results_url text,
  CONSTRAINT segments_pkey PRIMARY KEY (id)
);
CREATE TABLE public.subjects (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  segment_id bigint,
  title text NOT NULL,
  slug text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  group_id bigint,
  icon_url text,
  view_count integer DEFAULT 0,
  CONSTRAINT subjects_pkey PRIMARY KEY (id),
  CONSTRAINT subjects_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id),
  CONSTRAINT subjects_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id)
);
CREATE TABLE public.resources (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  subject_id bigint,
  title text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['pdf'::text, 'video'::text, 'blog'::text, 'question'::text])),
  content_url text,
  is_premium boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  content_body text,
  tags ARRAY,
  seo_title text,
  seo_description text,
  segment_id bigint,
  group_id bigint,
  category text,
  slug text,
  author_id uuid,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  admin_feedback text,
  rejected_at timestamp with time zone,
  deletion_warning_sent boolean DEFAULT false,
  cover_url text,
  pdf_url text,
  video_url text,
  CONSTRAINT resources_pkey PRIMARY KEY (id),
  CONSTRAINT resources_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT resources_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id),
  CONSTRAINT resources_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT resources_profile_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.groups (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  segment_id bigint,
  title text NOT NULL,
  slug text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  icon_url text,
  CONSTRAINT groups_pkey PRIMARY KEY (id),
  CONSTRAINT groups_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id)
);
CREATE TABLE public.news (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  title text NOT NULL,
  content text,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  category text DEFAULT 'General'::text,
  tags ARRAY DEFAULT '{}'::text[],
  seo_title text,
  seo_description text,
  slug text,
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  views integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  likes integer DEFAULT 0,
  is_breaking boolean DEFAULT false,
  scheduled_at timestamp with time zone,
  status text DEFAULT 'published'::text,
  author_id uuid,
  CONSTRAINT news_pkey PRIMARY KEY (id),
  CONSTRAINT news_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id)
);
CREATE TABLE public.categories (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  type text DEFAULT 'general'::text,
  segment_id bigint,
  group_id bigint,
  subject_id bigint,
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id),
  CONSTRAINT categories_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT categories_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);
CREATE TABLE public.ebooks (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  title text NOT NULL,
  author text,
  category text NOT NULL,
  subject text,
  cover_url text,
  pdf_url text NOT NULL,
  downloads integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  description text,
  tags ARRAY,
  seo_title text,
  seo_description text,
  slug text,
  status text,
  author_id uuid,
  CONSTRAINT ebooks_pkey PRIMARY KEY (id),
  CONSTRAINT ebooks_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id)
);
CREATE TABLE public.courses (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  title text NOT NULL,
  instructor text,
  price text DEFAULT 'Free'::text,
  duration text,
  enrollment_link text,
  thumbnail_url text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  discount_price text,
  tags ARRAY DEFAULT '{}'::text[],
  seo_title text,
  seo_description text,
  category text,
  slug text,
  tutor_id uuid,
  is_published boolean DEFAULT false,
  level text DEFAULT 'Beginner'::text,
  language text DEFAULT 'English'::text,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'pending'::text, 'approved'::text, 'rejected'::text])),
  admin_feedback text,
  rejected_at timestamp with time zone,
  price_type text DEFAULT 'free'::text CHECK (price_type = ANY (ARRAY['free'::text, 'one_time'::text, 'subscription'::text])),
  total_lessons integer DEFAULT 0,
  total_duration_mins integer DEFAULT 0,
  certificate_template text DEFAULT 'template_1'::text,
  image_url text,
  custom_certificate_id uuid,
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.profiles(id),
  CONSTRAINT courses_custom_certificate_id_fkey FOREIGN KEY (custom_certificate_id) REFERENCES public.certificate_designs(id)
);
CREATE TABLE public.messages (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT messages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.segment_updates (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  segment_id bigint,
  title text NOT NULL,
  type text NOT NULL,
  content_body text,
  attachment_url text,
  tags ARRAY DEFAULT '{}'::text[],
  seo_title text,
  seo_description text,
  slug text,
  author_id uuid,
  status text DEFAULT 'approved'::text,
  CONSTRAINT segment_updates_pkey PRIMARY KEY (id),
  CONSTRAINT segment_updates_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id),
  CONSTRAINT segment_updates_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id)
);
CREATE TABLE public.donations (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  name text NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL,
  transaction_id text NOT NULL UNIQUE,
  message text,
  status text DEFAULT 'pending'::text,
  is_anonymous boolean DEFAULT false,
  donor_name text,
  is_approved boolean DEFAULT false,
  is_top_donor boolean DEFAULT false,
  CONSTRAINT donations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['admin'::text, 'editor'::text, 'tutor'::text, 'institute'::text, 'student'::text])),
  token text NOT NULL UNIQUE,
  invited_by uuid,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '7 days'::interval),
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT invitations_pkey PRIMARY KEY (id),
  CONSTRAINT invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id)
);
CREATE TABLE public.feedbacks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  full_name text,
  role text,
  category text CHECK (category = ANY (ARRAY['bug'::text, 'feature'::text, 'content'::text, 'general'::text])),
  message text NOT NULL,
  status text DEFAULT 'new'::text CHECK (status = ANY (ARRAY['new'::text, 'read'::text, 'archived'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT feedbacks_pkey PRIMARY KEY (id),
  CONSTRAINT feedbacks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.post_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  post_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_likes_pkey PRIMARY KEY (id),
  CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.likes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  resource_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT likes_pkey PRIMARY KEY (id),
  CONSTRAINT likes_profile_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT likes_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id)
);
CREATE TABLE public.system_updates (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  version_number text NOT NULL,
  title text,
  content text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  is_published boolean DEFAULT false,
  CONSTRAINT system_updates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.activity_logs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  actor_id uuid NOT NULL,
  action_type text NOT NULL,
  details text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT activity_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id)
);
CREATE TABLE public.course_modules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id bigint NOT NULL,
  title text NOT NULL,
  description text,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT course_modules_pkey PRIMARY KEY (id),
  CONSTRAINT course_modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.course_lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  module_id uuid,
  title text NOT NULL,
  slug text,
  lesson_type text DEFAULT 'text'::text CHECK (lesson_type = ANY (ARRAY['text'::text, 'video'::text, 'pdf'::text, 'quiz'::text])),
  content_body text,
  video_url text,
  attachment_url text,
  is_free_preview boolean DEFAULT false,
  duration_minutes integer DEFAULT 0,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  course_id bigint,
  CONSTRAINT course_lessons_pkey PRIMARY KEY (id),
  CONSTRAINT course_lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT course_lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.course_modules(id)
);
CREATE TABLE public.quiz_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL,
  question_text text NOT NULL,
  question_type text DEFAULT 'single_choice'::text CHECK (question_type = ANY (ARRAY['single_choice'::text, 'multiple_choice'::text])),
  points integer DEFAULT 10,
  order_index integer DEFAULT 0,
  CONSTRAINT quiz_questions_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_questions_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.course_lessons(id)
);
CREATE TABLE public.quiz_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL,
  option_text text NOT NULL,
  is_correct boolean DEFAULT false,
  explanation text,
  CONSTRAINT quiz_options_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz_questions(id)
);
CREATE TABLE public.question_bank (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  segment_id bigint,
  group_id bigint,
  subject_id bigint,
  topic_tag text,
  difficulty text DEFAULT 'medium'::text CHECK (difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text])),
  question_type text NOT NULL CHECK (question_type = ANY (ARRAY['mcq'::text, 'descriptive'::text, 'passage'::text])),
  parent_id uuid,
  question_text text NOT NULL,
  explanation text,
  marks integer DEFAULT 1,
  CONSTRAINT question_bank_pkey PRIMARY KEY (id),
  CONSTRAINT question_bank_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id),
  CONSTRAINT question_bank_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT question_bank_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT question_bank_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.question_bank(id)
);
CREATE TABLE public.question_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL,
  option_text text NOT NULL,
  is_correct boolean DEFAULT false,
  order_index integer DEFAULT 0,
  CONSTRAINT question_options_pkey PRIMARY KEY (id),
  CONSTRAINT question_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question_bank(id)
);
CREATE TABLE public.resource_questions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  resource_id bigint NOT NULL,
  question_id uuid NOT NULL,
  order_index integer DEFAULT 0,
  CONSTRAINT resource_questions_pkey PRIMARY KEY (id),
  CONSTRAINT resource_questions_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id),
  CONSTRAINT resource_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question_bank(id)
);
CREATE TABLE public.badges (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  description text,
  icon_key text NOT NULL,
  criteria_type text,
  criteria_value integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT badges_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_badges (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  badge_id bigint NOT NULL,
  awarded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_badges_pkey PRIMARY KEY (id),
  CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badges(id),
  CONSTRAINT user_badges_profile_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.transactions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'BDT'::text,
  payment_method text NOT NULL,
  transaction_id text,
  sender_number text,
  plan_type text NOT NULL,
  status text DEFAULT 'pending'::text,
  admin_note text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_profile_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.exam_papers (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  title text NOT NULL,
  institute_name text,
  duration text,
  total_marks integer,
  questions jsonb NOT NULL,
  settings jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_finalized boolean DEFAULT false,
  CONSTRAINT exam_papers_pkey PRIMARY KEY (id),
  CONSTRAINT exam_papers_profile_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.exams (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  tutor_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL DEFAULT 'Untitled Exam'::text,
  institute_name text,
  duration text,
  total_marks integer,
  questions jsonb NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  is_finalized boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  subject text,
  chapter text,
  segment text,
  mcq_count integer DEFAULT 0,
  duration_minutes integer,
  segment_id bigint,
  group_id bigint,
  subject_id bigint,
  exam_type text CHECK (exam_type = ANY (ARRAY['topic'::text, 'subject'::text, 'model_test'::text, 'past_question'::text])),
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'unpublished'::text, 'scheduled'::text])),
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  resource_id bigint,
  CONSTRAINT exams_pkey PRIMARY KEY (id),
  CONSTRAINT exams_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id),
  CONSTRAINT exams_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT exams_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT exams_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES auth.users(id),
  CONSTRAINT exams_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id)
);
CREATE TABLE public.payment_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  plan_name text NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL,
  transaction_id text,
  sender_number text,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payment_requests_pkey PRIMARY KEY (id),
  CONSTRAINT payment_requests_profile_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.licenses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['personal'::character varying, 'team'::character varying, 'institution'::character varying]::text[])),
  max_users integer NOT NULL,
  status character varying NOT NULL DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'suspended'::character varying, 'expired'::character varying]::text[])),
  purchased_at timestamp without time zone DEFAULT now(),
  expires_at timestamp without time zone NOT NULL,
  stripe_subscription_id character varying,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT licenses_pkey PRIMARY KEY (id),
  CONSTRAINT licenses_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id)
);
CREATE TABLE public.license_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  license_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role character varying NOT NULL DEFAULT 'member'::character varying CHECK (role::text = ANY (ARRAY['admin'::character varying, 'member'::character varying]::text[])),
  added_at timestamp without time zone DEFAULT now(),
  CONSTRAINT license_members_pkey PRIMARY KEY (id),
  CONSTRAINT license_members_license_id_fkey FOREIGN KEY (license_id) REFERENCES public.licenses(id),
  CONSTRAINT license_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.license_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  license_id uuid NOT NULL,
  invited_email character varying NOT NULL,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'accepted'::character varying, 'rejected'::character varying]::text[])),
  invited_by uuid NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  expires_at timestamp without time zone DEFAULT (now() + '7 days'::interval),
  CONSTRAINT license_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT license_invitations_license_id_fkey FOREIGN KEY (license_id) REFERENCES public.licenses(id),
  CONSTRAINT license_invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id)
);
CREATE TABLE public.regional_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  country_code character varying NOT NULL UNIQUE,
  currency character varying NOT NULL,
  currency_symbol character varying,
  timezone character varying,
  vat_rate numeric DEFAULT 0,
  gst_rate numeric DEFAULT 0,
  sales_tax_rate numeric DEFAULT 0,
  min_payment numeric,
  max_payment numeric,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT regional_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.regional_pricing (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  country_code character varying NOT NULL,
  license_type character varying NOT NULL,
  base_price numeric NOT NULL,
  local_price numeric NOT NULL,
  currency character varying NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT regional_pricing_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payment_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  license_id uuid,
  transaction_id character varying UNIQUE,
  gateway_name character varying NOT NULL,
  country_code character varying NOT NULL,
  currency character varying,
  amount numeric NOT NULL,
  amount_in_usd numeric,
  tax_amount numeric DEFAULT 0,
  gateway_fee numeric DEFAULT 0,
  status character varying NOT NULL DEFAULT 'pending'::character varying,
  payment_method character varying,
  reference_id character varying,
  response_data jsonb,
  error_message text,
  created_at timestamp without time zone DEFAULT now(),
  completed_at timestamp without time zone,
  refunded_at timestamp without time zone,
  CONSTRAINT payment_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT payment_transactions_license_id_fkey FOREIGN KEY (license_id) REFERENCES public.licenses(id),
  CONSTRAINT payment_transactions_profile_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.exchange_rates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  base_currency character varying NOT NULL,
  target_currency character varying NOT NULL,
  rate numeric NOT NULL,
  source character varying,
  recorded_at timestamp without time zone DEFAULT now(),
  expires_at timestamp without time zone,
  CONSTRAINT exchange_rates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payment_settlements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  gateway_name character varying NOT NULL,
  settlement_date date NOT NULL,
  total_amount numeric NOT NULL,
  total_fees numeric,
  total_refunds numeric,
  transaction_count integer,
  status character varying NOT NULL DEFAULT 'pending'::character varying,
  settlement_reference character varying,
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  settled_at timestamp without time zone,
  CONSTRAINT payment_settlements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name character varying NOT NULL,
  description text,
  type character varying NOT NULL,
  subtype character varying,
  data jsonb,
  visualizations jsonb,
  export_format character varying DEFAULT 'json'::character varying,
  is_public boolean DEFAULT false,
  shared_with ARRAY DEFAULT ARRAY[]::uuid[],
  permissions character varying DEFAULT 'private'::character varying,
  status character varying DEFAULT 'draft'::character varying CHECK (status::text = ANY (ARRAY['draft'::character varying, 'completed'::character varying, 'error'::character varying, 'scheduled'::character varying]::text[])),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  last_generated_at timestamp without time zone,
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.scheduled_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  report_id uuid NOT NULL,
  schedule character varying NOT NULL,
  frequency character varying,
  recurrence_pattern character varying,
  delivery_method character varying DEFAULT 'email'::character varying,
  recipients ARRAY NOT NULL,
  slack_channel character varying,
  webhook_url character varying,
  enabled boolean DEFAULT true,
  last_run_at timestamp without time zone,
  next_run_at timestamp without time zone,
  run_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  last_error_message text,
  last_error_at timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT scheduled_reports_pkey PRIMARY KEY (id),
  CONSTRAINT scheduled_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT scheduled_reports_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id)
);
CREATE TABLE public.report_exports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL,
  user_id uuid NOT NULL,
  export_format character varying NOT NULL,
  file_size integer,
  file_url character varying,
  file_path character varying,
  storage_provider character varying,
  storage_key character varying,
  record_count integer,
  generation_time_ms integer,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'generating'::character varying, 'completed'::character varying, 'failed'::character varying]::text[])),
  error_message text,
  expires_at timestamp without time zone,
  retention_days integer DEFAULT 30,
  created_at timestamp without time zone DEFAULT now(),
  completed_at timestamp without time zone,
  CONSTRAINT report_exports_pkey PRIMARY KEY (id),
  CONSTRAINT report_exports_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id),
  CONSTRAINT report_exports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.report_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name character varying NOT NULL,
  description text,
  metric_name character varying NOT NULL,
  metric_type character varying,
  condition character varying NOT NULL CHECK (condition::text = ANY (ARRAY['exceeds'::character varying, 'below'::character varying, 'equals'::character varying, 'increases_by'::character varying, 'decreases_by'::character varying, 'changed'::character varying]::text[])),
  threshold numeric,
  threshold_percent numeric,
  severity character varying DEFAULT 'medium'::character varying CHECK (severity::text = ANY (ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying]::text[])),
  applies_to character varying,
  applies_to_value uuid,
  notify_via ARRAY DEFAULT ARRAY['email'::text],
  notification_recipients ARRAY NOT NULL,
  enabled boolean DEFAULT true,
  last_triggered_at timestamp without time zone,
  trigger_count integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT report_alerts_pkey PRIMARY KEY (id),
  CONSTRAINT report_alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.report_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL,
  user_id uuid,
  action character varying NOT NULL CHECK (action::text = ANY (ARRAY['created'::character varying, 'viewed'::character varying, 'edited'::character varying, 'exported'::character varying, 'shared'::character varying, 'deleted'::character varying, 'scheduled'::character varying, 'executed'::character varying]::text[])),
  action_details jsonb,
  ip_address inet,
  user_agent character varying,
  changes_made jsonb,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT report_audit_log_pkey PRIMARY KEY (id),
  CONSTRAINT report_audit_log_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id),
  CONSTRAINT report_audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.payouts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL,
  payout_amount numeric NOT NULL,
  currency character varying DEFAULT 'BDT'::character varying,
  payout_method character varying NOT NULL,
  payment_account character varying,
  status character varying DEFAULT 'pending'::character varying,
  payout_month character varying NOT NULL,
  requested_at timestamp without time zone DEFAULT now(),
  processed_at timestamp without time zone,
  completed_at timestamp without time zone,
  commission_count integer NOT NULL,
  commission_ids ARRAY NOT NULL,
  gateway_transaction_id character varying,
  gateway_response jsonb,
  failure_reason character varying,
  retry_count integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT payouts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.news_votes (
  id bigint NOT NULL DEFAULT nextval('news_votes_id_seq'::regclass),
  news_id bigint,
  user_id uuid,
  vote_type character varying CHECK (vote_type::text = ANY (ARRAY['upvote'::character varying, 'downvote'::character varying]::text[])),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT news_votes_pkey PRIMARY KEY (id),
  CONSTRAINT news_votes_news_id_fkey FOREIGN KEY (news_id) REFERENCES public.news(id),
  CONSTRAINT news_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.lecture_sheets (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  segment_id bigint,
  group_id bigint,
  subject_id bigint,
  description text,
  file_url text NOT NULL,
  thumbnail_url text,
  access_type text DEFAULT 'public'::text CHECK (access_type = ANY (ARRAY['public'::text, 'restricted'::text])),
  allowed_batches ARRAY DEFAULT '{}'::text[],
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lecture_sheets_pkey PRIMARY KEY (id),
  CONSTRAINT lecture_sheets_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id),
  CONSTRAINT lecture_sheets_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT lecture_sheets_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);
CREATE TABLE public.lecture_sheet_access (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lecture_sheet_id bigint NOT NULL,
  user_id uuid NOT NULL,
  granted_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lecture_sheet_access_pkey PRIMARY KEY (id),
  CONSTRAINT lecture_sheet_access_profile_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT lecture_sheet_access_lecture_sheet_id_fkey FOREIGN KEY (lecture_sheet_id) REFERENCES public.lecture_sheets(id)
);
CREATE TABLE public.lecture_sheet_requests (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  segment_id bigint NOT NULL,
  group_id bigint,
  subject_id bigint,
  topic text NOT NULL,
  comment text,
  user_deadline timestamp with time zone,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'taking_time'::text, 'completed'::text, 'published'::text])),
  admin_deadline timestamp with time zone,
  admin_response text,
  linked_sheet_id bigint,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lecture_sheet_requests_pkey PRIMARY KEY (id),
  CONSTRAINT lecture_sheet_requests_profile_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT lecture_sheet_requests_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id),
  CONSTRAINT lecture_sheet_requests_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT lecture_sheet_requests_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT lecture_sheet_requests_linked_sheet_id_fkey FOREIGN KEY (linked_sheet_id) REFERENCES public.lecture_sheets(id)
);
CREATE TABLE public.user_bookmarks (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  item_type text NOT NULL,
  item_id text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_bookmarks_pkey PRIMARY KEY (id),
  CONSTRAINT user_bookmarks_profile_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.lesson_plan_units (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  subject_id bigint,
  title text NOT NULL,
  version text NOT NULL DEFAULT 'bn'::text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lesson_plan_units_pkey PRIMARY KEY (id),
  CONSTRAINT lesson_plan_units_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);
CREATE TABLE public.lesson_plan_lessons (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  unit_id bigint,
  title text NOT NULL,
  version text NOT NULL DEFAULT 'bn'::text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lesson_plan_lessons_pkey PRIMARY KEY (id),
  CONSTRAINT lesson_plan_lessons_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.lesson_plan_units(id)
);
CREATE TABLE public.lesson_plan_contents (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  lesson_id bigint,
  title text NOT NULL,
  content_body text,
  type text DEFAULT 'passage'::text,
  linked_exam_id uuid,
  linked_sheet_id bigint,
  version text NOT NULL DEFAULT 'bn'::text,
  order_index integer NOT NULL DEFAULT 0,
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lesson_plan_contents_pkey PRIMARY KEY (id),
  CONSTRAINT lesson_plan_contents_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lesson_plan_lessons(id),
  CONSTRAINT lesson_plan_contents_linked_sheet_id_fkey FOREIGN KEY (linked_sheet_id) REFERENCES public.lecture_sheets(id)
);
CREATE TABLE public.lesson_plan_subject_books (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  subject_id bigint,
  title text NOT NULL,
  subtitle text,
  url text,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lesson_plan_subject_books_pkey PRIMARY KEY (id),
  CONSTRAINT lesson_plan_subject_books_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);
CREATE TABLE public.course_contents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lesson_id uuid,
  content_type text CHECK (content_type = ANY (ARRAY['video'::text, 'article'::text, 'quiz'::text, 'resource'::text, 'live_link'::text])),
  title text NOT NULL,
  video_url text,
  article_body text,
  quiz_id uuid,
  resource_url text,
  live_link_url text,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT course_contents_pkey PRIMARY KEY (id),
  CONSTRAINT course_contents_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.course_lessons(id),
  CONSTRAINT course_contents_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.question_bank(id)
);
CREATE TABLE public.course_enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  course_id bigint,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'completed'::text, 'canceled'::text])),
  access_until timestamp with time zone,
  enrolled_at timestamp with time zone DEFAULT now(),
  CONSTRAINT course_enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT course_enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT course_enrollments_profile_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.course_user_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  content_id uuid,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  time_spent_seconds integer DEFAULT 0,
  quiz_score numeric,
  CONSTRAINT course_user_progress_pkey PRIMARY KEY (id),
  CONSTRAINT course_user_progress_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.course_contents(id),
  CONSTRAINT course_user_progress_profile_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.course_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id bigint,
  user_id uuid,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT course_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT course_reviews_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT course_reviews_profile_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.course_certificates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  course_id bigint,
  certificate_code text UNIQUE,
  issued_at timestamp with time zone DEFAULT now(),
  CONSTRAINT course_certificates_pkey PRIMARY KEY (id),
  CONSTRAINT course_certificates_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT course_certificates_profile_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.lesson_plan_subject_courses (
  id bigint NOT NULL DEFAULT nextval('lesson_plan_subject_courses_id_seq'::regclass),
  subject_id bigint NOT NULL,
  course_id bigint NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lesson_plan_subject_courses_pkey PRIMARY KEY (id),
  CONSTRAINT lesson_plan_subject_courses_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT lesson_plan_subject_courses_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.certificate_designs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  design_json jsonb NOT NULL,
  preview_image text,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT certificate_designs_pkey PRIMARY KEY (id),
  CONSTRAINT certificate_designs_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  post_id uuid,
  post_type text,
  user_id uuid,
  content text NOT NULL,
  parent_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  item_type text,
  item_id text,
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id),
  CONSTRAINT comments_profile_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.search_analytics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  query text NOT NULL,
  result_count integer DEFAULT 0,
  user_segment text,
  timestamp timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT search_analytics_pkey PRIMARY KEY (id)
);
CREATE TABLE public.newsletter_subscribers (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  email text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notifications (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'general'::text,
  target_role text DEFAULT 'all'::text,
  target_exam text,
  action_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);
CREATE TABLE public.exam_requests (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  student_id uuid,
  segment text NOT NULL,
  subject text NOT NULL,
  chapter text,
  details text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'completed'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  priority text DEFAULT 'standard'::text CHECK (priority = ANY (ARRAY['standard'::text, 'high'::text, 'urgent'::text])),
  CONSTRAINT exam_requests_pkey PRIMARY KEY (id),
  CONSTRAINT exam_requests_profile_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.exam_attempts (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  student_id uuid,
  exam_id bigint,
  score numeric DEFAULT 0,
  total_marks integer DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  answers jsonb NOT NULL,
  correct_count integer DEFAULT 0,
  wrong_count integer DEFAULT 0,
  performance_metrics jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT exam_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT exam_attempts_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id),
  CONSTRAINT exam_attempts_profile_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.student_analytics (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  student_id uuid,
  subject text NOT NULL,
  chapter text,
  total_attempts integer DEFAULT 0,
  avg_score numeric DEFAULT 0,
  strength_score numeric DEFAULT 0,
  weakness_score numeric DEFAULT 0,
  last_attempt_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_analytics_pkey PRIMARY KEY (id),
  CONSTRAINT student_analytics_profile_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.micro_exams (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  content_id bigint,
  title text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  passing_score integer DEFAULT 70,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT micro_exams_pkey PRIMARY KEY (id),
  CONSTRAINT micro_exams_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.lesson_plan_contents(id)
);
CREATE TABLE public.user_curriculum_progress (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  content_id bigint,
  status text DEFAULT 'not_started'::text,
  exam_score integer,
  completed_at timestamp with time zone,
  last_accessed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_curriculum_progress_pkey PRIMARY KEY (id),
  CONSTRAINT user_curriculum_progress_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.lesson_plan_contents(id),
  CONSTRAINT user_curriculum_progress_profile_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.question_of_the_day (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  question_id uuid,
  scheduled_date date NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT question_of_the_day_pkey PRIMARY KEY (id),
  CONSTRAINT question_of_the_day_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question_bank(id)
);
CREATE TABLE public.user_question_reports (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid,
  question_id uuid,
  reason text NOT NULL,
  comment text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'resolved'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_question_reports_pkey PRIMARY KEY (id),
  CONSTRAINT user_question_reports_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question_bank(id),
  CONSTRAINT user_question_reports_profile_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.forum_threads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid NOT NULL,
  thread_type text NOT NULL CHECK (thread_type = ANY (ARRAY['standard'::text, 'study_strategy'::text, 'question_post'::text, 'reading_comprehension'::text])),
  question_format text CHECK (question_format = ANY (ARRAY['descriptive'::text, 'reading_comprehension'::text, 'mcq'::text])),
  segment_id bigint,
  group_id bigint,
  subject_id bigint,
  question_bank_id uuid,
  difficulty text CHECK (difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text])),
  upvotes integer DEFAULT 0,
  views integer DEFAULT 0,
  is_pinned boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  seo_title text,
  seo_description text,
  seo_tags ARRAY,
  CONSTRAINT forum_threads_pkey PRIMARY KEY (id),
  CONSTRAINT forum_threads_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id),
  CONSTRAINT forum_threads_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id),
  CONSTRAINT forum_threads_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT forum_threads_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT forum_threads_question_bank_id_fkey FOREIGN KEY (question_bank_id) REFERENCES public.question_bank(id)
);
CREATE TABLE public.forum_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL,
  author_id uuid NOT NULL,
  parent_id uuid,
  content text NOT NULL,
  upvotes integer DEFAULT 0,
  is_expert_reply boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT forum_comments_pkey PRIMARY KEY (id),
  CONSTRAINT forum_comments_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.forum_threads(id),
  CONSTRAINT forum_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id),
  CONSTRAINT forum_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.forum_comments(id)
);
CREATE TABLE public.forum_tags (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT forum_tags_pkey PRIMARY KEY (id)
);
CREATE TABLE public.forum_thread_tags (
  thread_id uuid NOT NULL,
  tag_id bigint NOT NULL,
  CONSTRAINT forum_thread_tags_pkey PRIMARY KEY (thread_id, tag_id),
  CONSTRAINT forum_thread_tags_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.forum_threads(id),
  CONSTRAINT forum_thread_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.forum_tags(id)
);
CREATE TABLE public.forum_thread_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL,
  question_bank_id uuid NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT forum_thread_questions_pkey PRIMARY KEY (id),
  CONSTRAINT forum_thread_questions_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.forum_threads(id),
  CONSTRAINT forum_thread_questions_question_bank_id_fkey FOREIGN KEY (question_bank_id) REFERENCES public.question_bank(id)
);
CREATE TABLE public.forum_question_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL,
  user_id uuid NOT NULL,
  selected_option_id uuid,
  is_correct boolean NOT NULL,
  time_spent_seconds integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  question_id uuid,
  CONSTRAINT forum_question_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT forum_question_attempts_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question_bank(id),
  CONSTRAINT forum_question_attempts_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.forum_threads(id),
  CONSTRAINT forum_question_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT forum_question_attempts_selected_option_id_fkey FOREIGN KEY (selected_option_id) REFERENCES public.question_options(id)
);
CREATE TABLE public.user_forum_bookmarks (
  user_id uuid NOT NULL,
  thread_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_forum_bookmarks_pkey PRIMARY KEY (user_id, thread_id),
  CONSTRAINT user_forum_bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT user_forum_bookmarks_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.forum_threads(id)
);
CREATE TABLE public.forum_moderation_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  thread_id uuid,
  comment_id uuid,
  reason text NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'resolved'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT forum_moderation_reports_pkey PRIMARY KEY (id),
  CONSTRAINT forum_moderation_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id),
  CONSTRAINT forum_moderation_reports_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.forum_threads(id),
  CONSTRAINT forum_moderation_reports_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.forum_comments(id)
);
CREATE TABLE public.forum_upvotes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  thread_id uuid,
  comment_id uuid,
  author_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT forum_upvotes_pkey PRIMARY KEY (id),
  CONSTRAINT forum_upvotes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT forum_upvotes_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.forum_threads(id),
  CONSTRAINT forum_upvotes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.forum_comments(id),
  CONSTRAINT forum_upvotes_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.forum_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  thread_id uuid,
  comment_id uuid,
  reason text NOT NULL,
  details text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'resolved'::text, 'dismissed'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT forum_reports_pkey PRIMARY KEY (id),
  CONSTRAINT forum_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id),
  CONSTRAINT forum_reports_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.forum_threads(id),
  CONSTRAINT forum_reports_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.forum_comments(id)
);