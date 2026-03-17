# Interview Prep Module Documentation

## Overview

The Interview Prep Module provides a comprehensive platform for conducting, evaluating, and tracking interview preparation activities. It supports multiple interview types, difficulty levels, and evaluation methods with detailed performance analytics.

## Features

### Core Capabilities

- **Multiple Interview Types**: Technical, Behavioral, System Design, Case Studies, Coding Challenges, Communication, Domain-Specific, HR Rounds, and more
- **Flexible Scheduling**: Schedule interviews with real-time tutor availability checking and conflict detection
- **Question Management**: Extensive question library with categorization, difficulty levels, and quality control
- **Scoring & Evaluation**: Customizable rubrics with weighted scoring criteria
- **Performance Analytics**: Comprehensive student performance tracking with insights and recommendations
- **Recording & Transcription**: Automatic interview recording and optional transcription
- **Feedback System**: Structured feedback from tutors with auto-generated insights
- **Student Consistency Metrics**: Track streaks, improvement rates, and learning patterns

## Interview Types

### 1. Technical Interviews
- **Focus**: Coding, algorithms, data structures, problem-solving
- **Categories**: Arrays, Linked Lists, Trees, Graphs, Dynamic Programming, System Design, Database Design
- **Format**: Coding Challenge, Pair Programming, Code Review, Whiteboard
- **Duration**: 30-90 minutes

### 2. Behavioral Interviews
- **Focus**: Soft skills, communication, teamwork, leadership, conflict resolution
- **Categories**: Leadership, Teamwork, Communication, Conflict Resolution, Time Management, Adaptability
- **Format**: Verbal Interview, Take-Home Assignment
- **Duration**: 30-60 minutes

### 3. System Design Interviews
- **Focus**: Architecture, scalability, trade-offs, distributed systems
- **Categories**: API Design, Microservices, Cloud Computing, Distributed Systems
- **Format**: Verbal Interview, Whiteboard, Design Document
- **Duration**: 60-90 minutes

### 4. Case Study Interviews
- **Focus**: Problem-solving, business analysis, estimation
- **Categories**: Case Analysis, Market Sizing, Business Logic
- **Format**: Verbal Interview, Presentation
- **Duration**: 45-60 minutes

### 5. HR/Behavioral Round
- **Focus**: Background, experience, career goals, culture fit
- **Categories**: Background, Career Goals, Company Culture, Availability
- **Format**: Verbal Interview, Take-Home Assignment
- **Duration**: 30-45 minutes

### 6. Coding Challenge
- **Focus**: Real-world problem-solving under time constraints
- **Categories**: Various Programming Topics
- **Format**: Coding Challenge
- **Duration**: 60-180 minutes (usually take-home)

## Scheduling

### How to Schedule an Interview

1. **Navigate to Interview Scheduler**
   ```
   /interview-scheduler
   ```

2. **Fill in Details**
   - Select Interview Type (required)
   - Choose Difficulty Level (required)
   - Select Format (required)
   - Choose Duration from presets
   - Select Preferred Categories (optional)

3. **Choose Date & Time**
   - Select minimum 1 hour in advance
   - System automatically checks tutor availability
   - Available tutors display based on selection

4. **Confirm**
   - Review details and select tutor
   - Click Schedule Interview
   - Confirmation email sent to both student and tutor

### Conflict Detection

The system automatically:
- Checks tutor availability for selected time
- Checks student availability (no other scheduled interviews)
- Prevents double-booking
- Suggests alternative time slots if conflict detected

### Rescheduling

```bash
POST /api/interviews
{
  "action": "reschedule",
  "interviewId": "uuid",
  "newScheduledTime": "2026-04-01T10:00:00Z",
  "newDuration": 60
}
```

## Scoring & Evaluation

### Rubric System

#### Technical Coding Rubric
- **Correctness** (25%): Solution works correctly on all test cases
- **Efficiency** (20%): Time and space complexity optimization
- **Code Quality** (20%): Readability, maintainability, best practices
- **Testing** (15%): Edge case handling and test coverage
- **Communication** (20%): Explanation and problem-solving approach

#### Behavioral Rubric
- **Content** (30%): Relevance and quality of examples
- **Structure** (20%): Logical organization and flow
- **Communication** (25%): Clarity and articulation
- **Authenticity** (15%): Genuine examples and experiences
- **Growth Mindset** (10%): Evidence of learning and development

#### System Design Rubric
- **Requirements** (15%): Understanding of functional/non-functional requirements
- **Architecture** (25%): System architecture and design decisions
- **Scalability** (20%): Scalability and performance optimization
- **Trade-offs** (20%): Analysis of design trade-offs
- **Communication** (20%): Clear explanation of reasoning

### Scoring Process

1. **Tutor evaluates** interview using rubric
2. **System automatically**:
   - Calculates weighted scores
   - Generates performance-based feedback
   - Identifies strengths and areas for improvement
   - Updates student performance metrics

3. **Feedback provided** to student with:
   - Overall score and percentage
   - Rubric breakdown
   - Strengths identified
   - Specific improvement areas
   - Actionable suggestions

### Rating Scales

**Five-Point Scale** (Default)
- 5: Excellent
- 4: Good
- 3: Average
- 2: Below Average
- 1: Poor

## Performance Analytics

### Student Dashboard

Access via: `/student/dashboard`

**Key Metrics Displayed**:
- Total interviews conducted
- Completion rate
- Average score
- Highest/lowest scores
- Current improvement trend
- Current streak (consecutive passes)
- Performance by interview type
- Performance by topic/category

### Performance Report API

```bash
GET /api/interviews?action=performance-report&studentId={id}&days=30
```

**Response**:
```json
{
  "studentId": "uuid",
  "period": { "startDate": "...", "endDate": "..." },
  "totalInterviews": 12,
  "completedInterviews": 10,
  "averageScore": 78.5,
  "scoresByType": {
    "technical": 82.3,
    "behavioral": 74.1,
    "system_design": 79.8
  },
  "improvementRate": 12.5,
  "passRate": 83,
  "performanceTrend": [...],
  "strengthCategories": ["dynamic_programming", "system_design"],
  "weakCategories": ["bit_manipulation", "behavioral"]
}
```

### Performance by Category

```bash
GET /api/interviews?action=category-analysis&studentId={id}
```

Analyzes performance across all question categories:
- Average score per category
- Number of attempts per category
- Trend over time
- Identification of strengths and weaknesses

### Recommendations

```bash
GET /api/interviews?action=get-recommendations
```

System provides personalized recommendations based on:
- Weak categories requiring focus
- Recommended difficulty progression
- Suggested interview types to practice
- Customization suggestions

## API Reference

### Base URL
```
/api/interviews
```

### Authentication
All endpoints require Bearer token:
```
Authorization: Bearer {token}
```

### GET Endpoints

#### List Interviews
```bash
GET /api/interviews?action=list-interviews&role=student&limit=10&offset=0&status=scheduled
```

**Query Parameters**:
- `action`: "list-interviews" (required)
- `role`: "student" or "tutor" (default: "student")
- `status`: Optional filter (scheduled, completed, cancelled, etc.)
- `limit`: Results per page (default: 10)
- `offset`: Pagination offset (default: 0)

**Response**:
```json
{
  "success": true,
  "interviews": [...],
  "count": 42,
  "limit": 10,
  "offset": 0
}
```

#### Get Interview Details
```bash
GET /api/interviews?action=get-interview&interviewId={id}
```

**Response**:
```json
{
  "success": true,
  "interview": {
    "id": "uuid",
    "student_id": "uuid",
    "tutor_id": "uuid",
    "interview_type": "technical",
    "scheduled_time": "2026-04-01T10:00:00Z",
    "status": "scheduled",
    "final_score": 85.5,
    "rubric_scores": {...},
    "completed_at": "2026-04-01T11:00:00Z",
    "auto_feedback": {...},
    "tutor_comments": "..."
  }
}
```

#### Get Available Tutors
```bash
GET /api/interviews?action=available-tutors&startDate={iso}&endDate={iso}&interviewType=technical
```

**Response**:
```json
{
  "success": true,
  "tutors": [
    {
      "id": "uuid",
      "name": "John Doe",
      "rating": 4.8,
      "specializations": ["technical", "system_design"],
      "availability_slots": 3
    }
  ]
}
```

#### Get Performance Report
```bash
GET /api/interviews?action=performance-report&studentId={id}&days=30
```

#### Get Interview Questions
```bash
GET /api/interviews?action=get-questions&interviewId={id}
```

### POST Endpoints

#### Schedule Interview
```bash
POST /api/interviews
{
  "action": "schedule",
  "studentId": "uuid",
  "tutorId": "uuid",
  "interviewType": "technical",
  "scheduledTime": "2026-04-01T10:00:00Z",
  "duration": 60,
  "format": "verbal",
  "preferredCategories": ["arrays_strings", "trees_graphs"]
}
```

#### Reschedule Interview
```bash
POST /api/interviews
{
  "action": "reschedule",
  "interviewId": "uuid",
  "newScheduledTime": "2026-04-02T14:00:00Z",
  "newDuration": 90
}
```

#### Submit Feedback
```bash
POST /api/interviews
{
  "action": "submit-feedback",
  "interviewId": "uuid",
  "feedbackType": "strengths",
  "content": "Great problem-solving approach...",
  "rating": 5
}
```

#### Score Interview
```bash
POST /api/interviews
{
  "action": "score-interview",
  "interviewId": "uuid",
  "rubricType": "technical_coding",
  "evaluatorScores": {
    "correctness": 5,
    "efficiency": 4,
    "code_quality": 5,
    "testing": 4,
    "communication": 5
  },
  "comments": "Excellent solution with optimal complexity..."
}
```

**Response**:
```json
{
  "success": true,
  "score": {
    "totalScore": 95.5,
    "maxScore": 100,
    "percentage": 95.5,
    "scores": {
      "correctness": { "score": 5, "weight": 25, "weighted": 25 },
      "efficiency": { "score": 4, "weight": 20, "weighted": 16 }
    }
  },
  "feedback": {
    "strengths": ["Strong efficiency", "Excellent code quality"],
    "improvements": [],
    "suggestions": ["Consider advanced optimization techniques"],
    "rating": "Exceptional"
  }
}
```

#### Get Recommendations
```bash
POST /api/interviews
{
  "action": "get-recommendations"
}
```

#### Cancel Interview
```bash
POST /api/interviews
{
  "action": "cancel",
  "interviewId": "uuid"
}
```

#### Complete Interview
```bash
POST /api/interviews
{
  "action": "complete",
  "interviewId": "uuid",
  "finalScore": 85.5,
  "recordingUrl": "https://..."
}
```

## React Components

### InterviewScheduler

**Location**: `/components/InterviewScheduler.tsx`

**Props**:
```typescript
interface InterviewSchedulerProps {
  studentId: string;
  onSuccess?: () => void;
}
```

**Usage**:
```tsx
import InterviewScheduler from '@/components/InterviewScheduler';

export default function Page() {
  return (
    <InterviewScheduler
      studentId={userId}
      onSuccess={() => console.log('Interview scheduled')}
    />
  );
}
```

**Features**:
- Interview type selection from config
- Difficulty and format dropdowns
- Duration selection from presets
- Category preference multi-select
- Real-time tutor availability checking
- Date/time picker with minimum advance notice
- Auto-download confirmation
- Loading and error states
- Form validation

### InterviewDashboard

**Location**: `/components/InterviewDashboard.tsx`

**Props**:
```typescript
interface InterviewDashboardProps {
  userId: string;
  role?: 'student' | 'tutor';
}
```

**Usage**:
```tsx
import InterviewDashboard from '@/components/InterviewDashboard';

export default function Page() {
  return (
    <InterviewDashboard
      userId={userId}
      role="student"
    />
  );
}
```

**Features**:
- List all interviews with filtering by status
- Sort by date or score
- Display status with badge colors
- Show final scores for completed interviews
- Action buttons: reschedule, cancel, view details
- Statistics footer (total, completed, scheduled, average)
- Responsive grid layout
- Loading and error states

## Database Schema

### tables
1. `interviews` - Main interview records
2. `interview_questions` - Question library
3. `interview_question_sets` - Questions assigned to specific interview
4. `interview_feedback` - Feedback from tutors and peers
5. `interview_responses` - Student responses during interview
6. `interview_performance` - Aggregated student performance stats
7. `interview_audit_log` - Audit trail of all actions
8. `interview_alerts` - System alerts for issues

### Key Indexes
- `idx_interviews_student_id`: Fast lookups by student
- `idx_interviews_tutor_id`: Fast lookups by tutor
- `idx_interviews_scheduled_time`: Efficient scheduling queries
- `idx_interview_questions_type_difficulty_category`: Question selection performance
- `idx_interview_performance_student_id`: Quick performance lookups

### Row-Level Security
- Students can only view their own interviews
- Tutors can view interviews they're assigned to
- Students can only edit their own responses
- Admins have full access to audit logs

## Setup Instructions

### 1. Run Database Migration

```bash
# Connect to Supabase and run migration
psql -h db.supabase.co -U postgres -d your_db < migrations/005_create_interview_prep_system.sql
```

### 2. Add Routes

```typescript
// app/interview-scheduler/page.tsx
import InterviewScheduler from '@/components/InterviewScheduler';
import { getUser } from '@/utils/auth';

export default async function Page() {
  const user = await getUser();
  return <InterviewScheduler studentId={user.id} />;
}

// app/interviews/page.tsx
import InterviewDashboard from '@/components/InterviewDashboard';
import { getUser } from '@/utils/auth';

export default async function Page() {
  const user = await getUser();
  return <InterviewDashboard userId={user.id} role="student" />;
}
```

### 3. Import Utilities

```typescript
// In components that need to integrate with interviews
import {
  scheduleInterview,
  generatePerformanceReport,
  calculateConsistencyMetrics,
  getNextStepRecommendations,
} from '@/lib/interviewPrepUtils';
```

### 4. Environment Configuration

Add to `.env.local`:
```
NEXT_PUBLIC_INTERVIEW_PREP_ENABLED=true
NEXT_PUBLIC_INTERVIEW_MIN_PREP_TIME_MINUTES=60
NEXT_PUBLIC_INTERVIEW_MAX_CONCURRENT=5
NEXT_PUBLIC_INTERVIEW_RECORDING_ENABLED=true
NEXT_PUBLIC_INTERVIEW_TRANSCRIPTION_ENABLED=true
INTERVIEW_QUESTION_POOL_MIN=200
INTERVIEW_UPDATE_PERFORMANCE_FREQUENCY=hourly
```

## Best Practices

### For Students

1. **Prepare in Advance**
   - Schedule interviews at least 1 hour in advance
   - Review recommended topics before interview
   - Test equipment (microphone, camera) beforehand

2. **Choose Appropriate Difficulty**
   - Start with Beginner if new to interview prep
   - Progress to Intermediate after 3+ passes
   - Jump to Advanced only after mastering Intermediate

3. **Track Progress**
   - Review performance reports weekly
   - Focus on identified weak categories
   - Maintain consistent practice (streaks)

4. **Use Feedback Effectively**
   - Read tutor feedback immediately after each interview
   - Implement suggestions in next practice session
   - Ask tutor for clarification on unclear points

### For Tutors

1. **Consistent Evaluation**
   - Use rubrics consistently across all students
   - Provide specific, actionable feedback
   - Document scores and rationale

2. **Detailed Feedback**
   - Highlight strengths first
   - Provide 2-3 specific improvement areas
   - Include concrete suggestions

3. **Timely Scoring**
   - Grade interviews within 24 hours
   - Send feedback to students promptly
   - Update performance metrics immediately

## Troubleshooting

### Issue: Interview Scheduling Fails

**Symptoms**: "Scheduling conflict exists" error even when time appears free

**Solution**:
1. Check if tutor has overlapping interview (consider 15-min buffer)
2. Verify both student and tutor availability
3. Try scheduling 30 minutes later
4. Check system for existing draft interviews that might block

### Issue: Questions Not Loading

**Symptoms**: "Question pool exhausted" error

**Solution**:
1. Ensure question library has been populated
2. Check if all questions are marked as `active = true`
3. Verify sufficient questions exist for selected difficulty/category
4. Try different categories or difficulty level

### Issue: Scores Not Updating

**Symptoms**: Student performance metrics not reflecting recent interview scores

**Solution**:
1. Verify interview status is "completed"
2. Check that final_score has been set
3. Refresh browser cache
4. Check database for trigger execution in audit log

### Issue: Feedback Not Visible to Student

**Symptoms**: Auto-generated feedback not appearing after scoring

**Solution**:
1. Ensure interview is marked as "completed"
2. Verify feedback generation completed (check logs)
3. Check browser cache
4. Verify student has permission to view interview

## Performance Optimization

### Caching Strategy
- Interview list: 1 hour cache
- Performance metrics: 2 hours cache
- Question pool: 24 hours cache
- Recommendations: 1 hour cache

### Database Query Optimization
- Use indexes on (student_id, status) for list queries
- Leverage partitioning for large interview tables
- Use views for aggregated analytics

### Frontend Optimization
- Lazy load interview details
- Paginate interview lists (50 per page max)
- Cache user's own performance data
- Debounce filter/sort operations

## Security Considerations

### Data Privacy
- All interview content encrypted in transit
- Row-Level Security ensures users see only own data
- GDPR-compliant data retention policies
- Audit logging for compliance

### Access Control
- API-level authentication required
- Role-based permissions (student, tutor, admin)
- Interview participants restricted to authorized users
- Admin-only access to audit logs

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review performance report for specific metrics
3. Contact support with interview ID and timestamp
4. Check audit logs for system-level issues
