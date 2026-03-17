# Advanced Reporting System Documentation

## Overview

The Advanced Reporting System provides comprehensive analytics, predictive insights, and flexible report generation across all platform features. Users can create custom reports, schedule automated delivery, set up alerts, and export data in multiple formats.

**Key Capabilities:**
- Multiple report types with specialized metrics
- Predictive analytics (churn, revenue forecast, trends)
- Flexible date ranges and time period aggregations
- Custom segmentation and filtering
- Multi-format export (PDF, CSV, XLSX, JSON)
- Scheduled report delivery via email/Slack/webhooks
- Real-time alerting on key metrics
- Full audit logging for compliance
- Role-based access control with sharing

---

## Report Types

### 1. Student Performance Report

**Purpose:** Track individual or cohort learning progress and achievement

**Available Subtypes:**
- `overall_scores` - Overall assessment scores by student
- `course_completion_rates` - Track completion progress
- `quiz_performance` - Quiz attempt analysis and scoring
- `progress_timeline` - Learning velocity over time
- `learning_velocity` - Rate of progress
- `skill_mastery` - Skill-based achievement tracking

**Key Metrics:**
| Metric | Type | Description |
|--------|------|-------------|
| Total Enrollments | Count | Courses student is enrolled in |
| Completed Courses | Count | Finished courses |
| Completion Rate | Percentage | % of enrolled courses completed |
| Average Progress | Percentage | Avg progress across all courses |
| Total Quiz Attempts | Count | Number of quiz submissions |
| Average Quiz Score | Percentage | Mean score across all quizzes |

**Example Usage:**
```bash
curl -X POST https://nextprepbd.com/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "generate",
    "reportType": "student_performance",
    "subtype": "overall_scores",
    "dateRange": "last_30_days",
    "format": "pdf",
    "reportName": "Monthly Student Progress",
    "saveReport": true
  }'
```

---

### 2. Course Analytics Report

**Purpose:** Monitor course enrollment, engagement, and completion metrics

**Available Subtypes:**
- `enrollment_trends` - Enrollment growth over time
- `completion_rates` - Course completion analysis
- `engagement_metrics` - User engagement by module/section
- `content_popularity` - Most viewed lessons
- `quiz_difficulty_analysis` - Quiz performance patterns
- `student_feedback_summary` - Review aggregation

**Key Metrics:**
| Metric | Type | Description |
|--------|------|-------------|
| Total Enrollments | Count | Total students enrolled |
| Completion Rate | Percentage | % of students who completed |
| Avg Progress | Percentage | Mean completion % across all students |
| Total Quiz Attempts | Count | Quiz submissions across course |
| Avg Quiz Score | Percentage | Mean score on course quizzes |
| Active Enrollments | Count | In-progress students |

**Example Usage:**
```bash
curl -X POST https://nextprepbd.com/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "generate",
    "reportType": "course_analytics",
    "subtype": "engagement_metrics",
    "courseId": "course-uuid",
    "dateRange": "last_month",
    "format": "xlsx",
    "reportName": "Python 101 Course Analytics"
  }'
```

---

### 3. Revenue Analysis Report

**Purpose:** Financial analytics including sales, payment methods, and forecasts

**Available Subtypes:**
- `daily_revenue` - Revenue by day
- `monthly_revenue` - Monthly totals
- `revenue_by_source` - Breakdown by product/license tier
- `revenue_by_course` - Revenue attributed to courses
- `revenue_forecast` - Predictive revenue trends
- `churn_analysis` - Lost revenue analysis

**Key Metrics:**
| Metric | Type | Description |
|--------|------|-------------|
| Total Revenue | Currency | All completed transactions |
| Transaction Count | Count | Number of transactions |
| Average Order Value | Currency | Mean transaction amount |
| Revenue by Method | Breakdown | Revenue per payment gateway |
| Daily Avg Revenue | Currency | Mean daily revenue |

**Example Usage:**
```bash
curl -X POST https://nextprepbd.com/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "generate",
    "reportType": "revenue_analysis",
    "subtype": "monthly_revenue",
    "dateRange": "last_quarter",
    "format": "pdf",
    "reportName": "Q1 Financial Summary",
    "saveReport": true
  }'
```

---

### 4. Affiliate Performance Report

**Purpose:** Track affiliate earnings, commission status, and fraud indicators

**Available Subtypes:**
- `top_performers` - Best earning affiliates
- `commission_payouts` - Payout history and status
- `referral_trends` - Referral volume over time
- `fraud_detection` - Flag high-risk affiliates
- `tier_distribution` - Affiliates by tier
- `seasonal_performance` - Performance patterns

**Key Metrics:**
| Metric | Type | Description |
|--------|------|-------------|
| Total Referrals | Count | Active successful referrals |
| Total Commissions | Currency | Total earnings |
| Pending Commissions | Currency | In 7-day hold |
| Paid Out | Currency | Released payouts |
| Fraud Score | Score | Risk indicator (0-100) |
| Tier | Categorical | Bronze/Silver/Gold/Platinum |

---

### 5. User Engagement Report

**Purpose:** Monitor user activity, retention, and adoption metrics

**Available Subtypes:**
- `daily_active_users` - DAU trends
- `session_duration` - Time spent on platform
- `feature_usage` - Feature adoption rates
- `retention_cohorts` - Multi-month retention cohorts
- `churn_prediction` - Churn risk scoring
- `user_lifecycle` - User stage analysis

**Key Metrics:**
| Metric | Type | Description |
|--------|------|-------------|
| Daily Active Users | Count | Unique users per day |
| Monthly Active Users | Count | Unique users per month |
| Avg Session Duration | Time | Mean session length |
| Engagement Rate | Percentage | % of users active |
| Retention Rate | Percentage | % remaining after period |
| Churn Risk | Score | User dropout likelihood (0-100) |

---

## Predictive Analytics

### Churn Prediction

**Purpose:** Identify users likely to stop engaging

**Algorithm:**
- Analyzes 90-day historical data
- Predicts 30-day churn likelihood
- Factors: engagement level, login frequency, completion rate, session trends

**Model Output:**
```json
{
  "userId": "user-uuid",
  "riskScore": 78,
  "risk": "high",
  "factors": {
    "daysInactive": 28,
    "lowSessionCount": true,
    "lowCompletionRate": true,
    "infrequentLogins": true
  }
}
```

**Confidence:**
- High Risk: Score ≥ 70 (70% likelihood)
- Medium Risk: 50 ≤ Score < 70 (50-70% likelihood)
- Low Risk: Score < 50 (<50% likelihood)

---

### Revenue Forecast

**Purpose:** Project future revenue trends

**Algorithm:**
- Exponential smoothing on historical daily revenue
- 30-90 day forecasts available
- Provides confidence intervals (±20%)

**Model Output:**
```json
{
  "date": "2024-02-15",
  "forecast": 125000,
  "lower": 100000,
  "upper": 150000
}
```

**Accuracy Factors:**
- Minimum 60 days data required
- Seasonal patterns included
- Adjusts for anomalies

---

### Learning Time Estimate

**Purpose:** Predict time needed to complete course

**Algorithm:**
- Uses 75th percentile of completion times
- Accounts for course difficulty and prerequisites
- Personalized by user skill level

**Output:**
```json
{
  "courseId": "course-uuid",
  "estimatedHours": 32,
  "confidenceLevel": 0.82,
  "factors": {
    "difficulty": "intermediate",
    "userSkillLevel": "beginner",
    "prerequisites": 2
  }
}
```

---

## Date Ranges

### Preset Ranges

| Key | Label | Calculation |
|-----|-------|-------------|
| `today` | Today | Current day only |
| `yesterday` | Yesterday | Previous day |
| `last_7_days` | Last 7 Days | Past 7 calendar days |
| `last_30_days` | Last 30 Days | Past 30 days |
| `last_90_days` | Last 90 Days | Past 90 days |
| `last_6_months` | Last 6 Months | Past 180 days |
| `last_year` | Last 12 Months | Past 365 days |
| `this_month` | This Month | Current calendar month |
| `last_month` | Last Month | Previous calendar month |
| `this_quarter` | This Quarter | Current 3-month quarter |
| `last_quarter` | Last Quarter | Previous quarter |
| `this_year` | This Year | Current calendar year |
| `ytd` | Year to Date | Jan 1 to today |

### Custom Date Ranges

```json
{
  "type": "custom",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

---

## Time Series Aggregation

Reports can aggregate data by time period:

```typescript
// Daily aggregation
aggregateAsTimeSeries(data, 'created_at', 'amount', 'daily')
// Result: [{ date: '2024-01-15', value: 12500 }, ...]

// Weekly aggregation
aggregateAsTimeSeries(data, 'created_at', 'amount', 'weekly')
// Result: [{ date: '2024-01-08', value: 87500 }, ...]

// Monthly aggregation
aggregateAsTimeSeries(data, 'created_at', 'amount', 'monthly')
// Result: [{ date: '2024-01', value: 375000 }, ...]
```

---

## Export Formats

### PDF
- Page size: A4 (customizable)
- Includes charts, tables, metadata
- Ideal for sharing and printing

### CSV
- UTF-8 encoding
- Headers included
- Comma-delimited
- Ideal for spreadsheets

### XLSX
- Microsoft Excel format
- Formatted headers and data
- Auto-width columns
- Frozen header row

### JSON
- Pretty-printed
- Includes metadata
- Flat or nested structure
- Ideal for programmatic access

### Email
- Sends report via email
- Options: attach file, embed table, link to download
- Scheduled delivery supported

---

## Scheduled Reports

### Setup

```bash
curl -X POST https://nextprepbd.com/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "schedule-report",
    "reportId": "report-uuid",
    "schedule": "09:00",
    "frequency": "daily",
    "recipients": ["manager@company.com"]
  }'
```

### Frequency Options

- **Daily**: Every day at specified time
- **Weekly**: Specific day at specified time
- **Monthly**: Specific date at specified time
- **Quarterly**: First day of quarter
- **Custom**: Via cron expression

### Delivery Methods

| Method | Configuration | Use Case |
|--------|---------------|----------|
| Email | Recipients list | Individual Users |
| Slack | Channel webhook | Team channels |
| Webhook | POST endpoint | Custom integrations |

### Status Tracking

Each schedule tracks:
- Last run time
- Next scheduled run
- Run count (total executions)
- Failed count
- Last error message

---

## Real-Time Alerts

### Creating an Alert

```bash
curl -X POST https://nextprepbd.com/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create-alert",
    "name": "High Churn Alert",
    "metric": "churn_rate",
    "condition": "exceeds",
    "threshold": 5,
    "severity": "high",
    "recipients": ["alert@company.com"]
  }'
```

### Alert Conditions

| Operator | Example |
|----------|---------|
| `exceeds` | Revenue exceeds ৳100k/day |
| `below` | Engagement below 40% |
| `equals` | Tier equals Platinum |
| `increases_by` | Revenue increases by 20% |
| `decreases_by` | Users decrease by 10% |
| `changed` | Any change detected |

### Severity Levels

- **Low**: Informational, no action needed
- **Medium**: Review recommended
- **High**: Requires attention
- **Critical**: Immediate action required

---

## Segmentation

Reports can be segmented by:

| Segment | Values |
|---------|--------|
| By Course | Course ID |
| By Instructor | Instructor ID |
| By User Type | Student, Instructor, Admin |
| By License Tier | Personal, Team, Institution |
| By Country | 2-letter country code |
| By Region | Geographic region |
| By Cohort | Enrollment cohort |
| By Subscription | Active, Inactive, Paused |

**Example:**
```json
{
  "segment": "by_license_tier",
  "values": ["personal", "team", "institution"]
}
```

---

## API Reference

### GET /api/reports/generate

**Fetch saved reports**

```bash
curl https://nextprepbd.com/api/reports/generate?action=list-reports&limit=50&offset=0
```

**Response:**
```json
{
  "reports": [
    {
      "id": "report-uuid",
      "name": "Monthly Revenue Report",
      "type": "revenue_analysis",
      "export_format": "pdf",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "count": 1
}
```

---

**Get report by ID**

```bash
curl https://nextprepbd.com/api/reports/generate?action=get-report&reportId=report-uuid
```

---

**Get available report types**

```bash
curl https://nextprepbd.com/api/reports/generate?action=get-report-types
```

---

**Get subtypes for report type**

```bash
curl "https://nextprepbd.com/api/reports/generate?action=get-report-types&type=student_performance"
```

---

### POST /api/reports/generate

**Generate a report**

```bash
curl -X POST https://nextprepbd.com/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "generate",
    "reportType": "student_performance",
    "subtype": "overall_scores",
    "dateRange": "last_30_days",
    "format": "pdf",
    "reportName": "Monthly Performance Review",
    "saveReport": true
  }'
```

---

**Save a report**

```bash
curl -X POST https://nextprepbd.com/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "save-report",
    "reportName": "Weekly Status Report",
    "reportType": "revenue_analysis",
    "format": "xlsx"
  }'
```

---

**Delete a report**

```bash
curl -X POST https://nextprepbd.com/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "delete-report",
    "reportId": "report-uuid"
  }'
```

---

**Schedule automated reports**

```bash
curl -X POST https://nextprepbd.com/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "schedule-report",
    "reportId": "report-uuid",
    "schedule": "09:00",
    "frequency": "daily",
    "recipients": ["manager@company.com"]
  }'
```

---

## Components

### ReportBuilder

Main UI for creating custom reports

**Props:**
```typescript
interface ReportBuilderProps {
  onReportGenerated?: (report: any) => void;
}
```

**Features:**
- Template quick-start
- Report type selection
- Subtype selection
- Date range picker
- Export format selection
- Save option
- Generate button

**Usage:**
```typescript
import ReportBuilder from '@/components/ReportBuilder';

export default function Page() {
  return <ReportBuilder />;
}
```

---

### ReportDashboard

View and manage saved reports

**Features:**
- List all reports
- Filter by type
- Sort by date/name
- Download reports
- Delete reports
- View report metadata

**Usage:**
```typescript
import ReportDashboard from '@/components/ReportDashboard';

export default function Page() {
  return <ReportDashboard />;
}
```

---

## Setup Instructions

### 1. Database Migration

```bash
psql $DATABASE_URL < migrations/004_create_reporting_system.sql
```

Verify tables:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema='public' AND (
  table_name LIKE '%report%' 
  OR table_name IN ('scheduled_reports', 'report_alerts')
);
```

### 2. Environment Variables

Add to `.env.local`:

```
# Reporting Configuration
NEXT_PUBLIC_REPORTING_ENABLED=true
NEXT_PUBLIC_REPORT_CACHE_TTL=3600
NEXT_PUBLIC_MAX_EXPORT_RECORDS=100000

# Predictive Analytics
NEXT_PUBLIC_CHURN_PREDICTION_ENABLED=true
NEXT_PUBLIC_REVENUE_FORECAST_ENABLED=true

# Export Storage (optional - defaults to in-memory)
REPORT_EXPORT_STORAGE=local # or 's3', 'gcs'
REPORT_EXPORT_RETENTION_DAYS=30

# Email for scheduled reports
SENDGRID_API_KEY=...
```

### 3. Routes Setup

```typescript
// app/reports/page.tsx
import ReportDashboard from '@/components/ReportDashboard';
export default function Page() {
  return <ReportDashboard />;
}

// app/reports/create/page.tsx
import ReportBuilder from '@/components/ReportBuilder';
export default function Page() {
  return <ReportBuilder />;
}
```

### 4. Cron Jobs

Set up daily cleanup of expired exports:

```typescript
// app/api/cron/cleanup-exports/route.ts
export async function GET(req: NextRequest) {
  if (req.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { data, error } = await supabase
    .from('report_exports')
    .delete()
    .lt('expires_at', new Date().toISOString());

  return Response.json({ deleted: data?.length || 0 });
}
```

---

## Performance Optimization

### Caching Strategy

Reports are cached based on type:
- Static reports: 1 hour
- Metrics: 30 minutes
- Forecasts: 24 hours
- Aggregations: 2 hours

### Data Limits

| Limit | Value |
|-------|-------|
| Max data points in chart | 10,000 |
| Max export records | 100,000 |
| Max concurrent exports | 5 per user |
| Max report name length | 255 characters |
| Max stored reports | 1000 per user |

### Query Optimization

- Pre-aggregated metrics tables
- Indexed date ranges
- Connection pooling
- Query timeout: 5 minutes

---

## Troubleshooting

### Report Not Generating

**Check:**
1. User authentication (requires valid session)
2. Database connectivity
3. Date range validity
4. Required fields present

```sql
SELECT * FROM reports WHERE user_id = 'user-uuid';
```

### Slow Report Generation

**Solutions:**
1. Reduce date range
2. Add segmentation filters
3. Use aggregated data
4. Check database indexes

### Export File Not Downloaded

**Check:**
1. File generated successfully (check `report_exports` table)
2. Required headers present
3. Browser security settings

---

## Compliance & Security

### Data Privacy

- RLS policies isolate user data
- Audit logs track all access
- No personal data in export metadata
- GDPR-compliant data retention

### Audit Logging

All actions logged:
- Report creation/editing/deletion
- Export generation
- Access attempts
- Email delivery

### Role-Based Access

| Role | Permissions |
|------|-------------|
| Viewer | View own reports |
| Editor | Create/edit own reports |
| Manager | Share team reports |
| Admin | Full system access |

---

## Support

- Email: support@nextprepbd.com
- Documentation: https://docs.nextprepbd.com/reporting
- Status Page: https://status.nextprepbd.com
