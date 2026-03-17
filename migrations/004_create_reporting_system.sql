-- Create advanced reporting system tables
-- Tables: reports, scheduled_reports, report_exports, report_alerts, report_templates

-- Reports table: Saved user-created reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Report metadata
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100) NOT NULL, -- 'student_performance', 'course_analytics', etc.
  subtype VARCHAR(100),
  
  -- Report definition
  data JSONB, -- Filters, configurations, custom SQL
  visualizations JSONB, -- Array of visualization definitions
  export_format VARCHAR(50) DEFAULT 'json', -- 'pdf', 'csv', 'xlsx', 'json'
  
  -- Sharing & permissions
  is_public BOOLEAN DEFAULT FALSE,
  shared_with UUID[] DEFAULT ARRAY[]::uuid[],
  permissions VARCHAR(50) DEFAULT 'private', -- 'private', 'shared', 'public'
  
  -- Status & timestamps
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'error', 'scheduled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_generated_at TIMESTAMP,
  
  CONSTRAINT report_name_not_empty CHECK (name IS NOT NULL AND name != '')
);

CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_is_public ON reports(is_public);

-- Scheduled Reports table: Automated report generation and delivery
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  
  -- Schedule definition
  schedule VARCHAR(100) NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
  frequency VARCHAR(100), -- 'daily', 'weekly-monday', 'monthly-15', etc.
  recurrence_pattern VARCHAR(255),
  
  -- Delivery options
  delivery_method VARCHAR(50) DEFAULT 'email', -- 'email', 'slack', 'webhook'
  recipients TEXT[] NOT NULL, -- Email addresses or webhook URLs
  slack_channel VARCHAR(255),
  webhook_url VARCHAR(2048),
  
  -- Status
  enabled BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP,
  run_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  
  -- Error tracking
  last_error_message TEXT,
  last_error_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scheduled_reports_user_id ON scheduled_reports(user_id);
CREATE INDEX idx_scheduled_reports_enabled ON scheduled_reports(enabled);
CREATE INDEX idx_scheduled_reports_next_run_at ON scheduled_reports(next_run_at);
CREATE INDEX idx_scheduled_reports_report_id ON scheduled_reports(report_id);

-- Report Exports table: Track all exports for audit and storage
CREATE TABLE IF NOT EXISTS report_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Export details
  export_format VARCHAR(50) NOT NULL, -- 'pdf', 'csv', 'xlsx', 'json'
  file_size INT,
  file_url VARCHAR(2048),
  file_path VARCHAR(512),
  
  -- Storage location
  storage_provider VARCHAR(50), -- 's3', 'gcs', 'azure', 'local'
  storage_key VARCHAR(512),
  
  -- Metrics
  record_count INT,
  generation_time_ms INT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  error_message TEXT,
  
  -- Retention
  expires_at TIMESTAMP,
  retention_days INT DEFAULT 30,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_report_exports_report_id ON report_exports(report_id);
CREATE INDEX idx_report_exports_user_id ON report_exports(user_id);
CREATE INDEX idx_report_exports_status ON report_exports(status);
CREATE INDEX idx_report_exports_expires_at ON report_exports(expires_at);
CREATE INDEX idx_report_exports_created_at ON report_exports(created_at DESC);

-- Report Alerts table: Monitoring and alerting on report metrics
CREATE TABLE IF NOT EXISTS report_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Alert definition
  name VARCHAR(255) NOT NULL,
  description TEXT,
  metric_name VARCHAR(255) NOT NULL, -- 'revenue', 'churn_rate', 'engagement_rate', etc.
  metric_type VARCHAR(50), -- 'numeric', 'percentage', 'currency'
  
  -- Condition
  condition VARCHAR(50) NOT NULL CHECK (condition IN (
    'exceeds',
    'below',
    'equals',
    'increases_by',
    'decreases_by',
    'changed'
  )),
  threshold NUMERIC(12, 2),
  threshold_percent NUMERIC(5, 2),
  
  -- Severity
  severity VARCHAR(50) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Trigger scope
  applies_to VARCHAR(50), -- 'all', 'course_id', 'user_type', 'license_tier'
  applies_to_value UUID,
  
  -- Notification settings
  notify_via TEXT[] DEFAULT ARRAY['email']::text[],
  notification_recipients TEXT[] NOT NULL,
  
  -- Status & tracking
  enabled BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMP,
  trigger_count INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_report_alerts_user_id ON report_alerts(user_id);
CREATE INDEX idx_report_alerts_enabled ON report_alerts(enabled);
CREATE INDEX idx_report_alerts_metric_name ON report_alerts(metric_name);

-- Report Audit Log table: Track all access and modifications
CREATE TABLE IF NOT EXISTS report_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Action details
  action VARCHAR(50) NOT NULL CHECK (action IN (
    'created',
    'viewed',
    'edited',
    'exported',
    'shared',
    'deleted',
    'scheduled',
    'executed'
  )),
  action_details JSONB,
  
  -- IP and user agent
  ip_address INET,
  user_agent VARCHAR(512),
  
  -- Changes (for edit actions)
  changes_made JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_report_audit_log_report_id ON report_audit_log(report_id);
CREATE INDEX idx_report_audit_log_user_id ON report_audit_log(user_id);
CREATE INDEX idx_report_audit_log_action ON report_audit_log(action);
CREATE INDEX idx_report_audit_log_created_at ON report_audit_log(created_at DESC);

-- Row Level Security Policies

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports or reports shared with them
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (
    auth.uid() = user_id
    OR is_public = TRUE
    OR auth.uid() = ANY(shared_with)
  );

CREATE POLICY "Users can create own reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  USING (auth.uid() = user_id);

-- Scheduled Reports RLS
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scheduled reports"
  ON scheduled_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own scheduled reports"
  ON scheduled_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled reports"
  ON scheduled_reports FOR UPDATE
  USING (auth.uid() = user_id);

-- Report Exports RLS
ALTER TABLE report_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exports"
  ON report_exports FOR SELECT
  USING (auth.uid() = user_id);

-- Report Alerts RLS
ALTER TABLE report_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts"
  ON report_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own alerts"
  ON report_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Report Audit Log RLS
ALTER TABLE report_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
  ON report_audit_log FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Triggers

-- Auto-update reports.updated_at
CREATE OR REPLACE FUNCTION update_reports_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reports_timestamp
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_reports_timestamp();

-- Auto-log report access
CREATE OR REPLACE FUNCTION log_report_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO report_audit_log (report_id, user_id, action, action_details)
  VALUES (
    NEW.id,
    auth.uid(),
    'viewed',
    jsonb_build_object('export_format', NEW.export_format)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Views

-- View: Reports Summary
CREATE OR REPLACE VIEW reports_summary AS
SELECT 
  r.id,
  r.user_id,
  r.name,
  r.type,
  r.status,
  count(DISTINCT re.id) as export_count,
  max(re.created_at) as last_export_at,
  r.created_at,
  r.last_generated_at
FROM reports r
LEFT JOIN report_exports re ON r.id = re.report_id
GROUP BY r.id, r.user_id, r.name, r.type, r.status, r.created_at, r.last_generated_at;

-- View: Scheduled Reports Status
CREATE OR REPLACE VIEW scheduled_reports_status AS
SELECT 
  sr.id,
  sr.user_id,
  r.name as report_name,
  sr.frequency,
  sr.enabled,
  sr.last_run_at,
  sr.next_run_at,
  sr.run_count,
  sr.failed_count,
  CASE WHEN sr.failed_count > 0 THEN TRUE ELSE FALSE END as has_errors,
  sr.last_error_message
FROM scheduled_reports sr
JOIN reports r ON sr.report_id = r.id;

-- View: Recent Exports
CREATE OR REPLACE VIEW recent_exports AS
SELECT 
  re.id,
  re.user_id,
  r.name as report_name,
  re.export_format,
  re.file_size,
  re.record_count,
  re.generation_time_ms,
  re.status,
  re.created_at
FROM report_exports re
JOIN reports r ON re.report_id = r.id
WHERE re.created_at >= NOW() - INTERVAL '30 days'
ORDER BY re.created_at DESC;

-- Indexes for performance

-- Composite indexes for common queries
CREATE INDEX idx_reports_user_status ON reports(user_id, status);
CREATE INDEX idx_reports_user_type ON reports(user_id, type);
CREATE INDEX idx_scheduled_reports_user_enabled ON scheduled_reports(user_id, enabled);
