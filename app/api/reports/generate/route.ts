import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import {
  generateStudentPerformanceReport,
  generateCourseAnalyticsReport,
  generateRevenueAnalysisReport,
  saveReportToDatabase,
  formatDataForCSV,
  formatDataForJSON,
} from '@/lib/reportingUtils';
import { REPORTING_CONFIG } from '@/lib/reportingConfig';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action');
    const reportId = searchParams.get('reportId');

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ============ FETCH SAVED REPORT ============
    if (action === 'get-report' && reportId) {
      const { data: report, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Report not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ report });
    }

    // ============ LIST USER REPORTS ============
    if (action === 'list-reports') {
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      const { data: reports, error } = await supabase
        .from('reports')
        .select('id, name, type, export_format, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch reports' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        reports,
        count: reports?.length || 0,
      });
    }

    // ============ GET AVAILABLE TEMPLATES ============
    if (action === 'get-templates') {
      return NextResponse.json({
        templates: REPORTING_CONFIG.TEMPLATES,
      });
    }

    // ============ GET REPORT TYPES ============
    if (action === 'get-report-types') {
      const reportType = searchParams.get('type');

      if (reportType) {
        const subtypes = REPORTING_CONFIG.REPORT_SUBTYPES[
          reportType as keyof typeof REPORTING_CONFIG.REPORT_SUBTYPES
        ] || [];
        return NextResponse.json({ subtypes });
      }

      return NextResponse.json({
        types: REPORTING_CONFIG.REPORT_TYPES,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/reports/generate:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      reportType,
      subtype,
      dateRange,
      format,
      reportName,
      filters,
      studentId,
      courseId,
    } = body;

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ============ GENERATE REPORT ============
    if (action === 'generate') {
      if (!reportType || !dateRange) {
        return NextResponse.json(
          { error: 'Missing required fields: reportType, dateRange' },
          { status: 400 }
        );
      }

      let reportData: any;

      // Generate based on report type
      switch (reportType) {
        case REPORTING_CONFIG.REPORT_TYPES.STUDENT_PERFORMANCE:
          if (!studentId && reportType === REPORTING_CONFIG.REPORT_TYPES.STUDENT_PERFORMANCE) {
            reportData = await generateStudentPerformanceReport(
              user.id,
              dateRange,
              subtype || 'overall_scores'
            );
          } else if (studentId) {
            reportData = await generateStudentPerformanceReport(
              studentId,
              dateRange,
              subtype || 'overall_scores'
            );
          }
          break;

        case REPORTING_CONFIG.REPORT_TYPES.COURSE_ANALYTICS:
          if (!courseId) {
            return NextResponse.json(
              { error: 'courseId required for course analytics report' },
              { status: 400 }
            );
          }
          reportData = await generateCourseAnalyticsReport(
            courseId,
            dateRange,
            subtype || 'engagement_metrics'
          );
          break;

        case REPORTING_CONFIG.REPORT_TYPES.REVENUE_ANALYSIS:
          reportData = await generateRevenueAnalysisReport(
            dateRange,
            subtype || 'daily_revenue'
          );
          break;

        default:
          return NextResponse.json(
            { error: `Report type '${reportType}' not supported yet` },
            { status: 400 }
          );
      }

      // Format export data
      let exportData = reportData;
      let contentType = 'application/json';
      let filename = `${reportName || reportType}-${new Date().getTime()}`;

      if (format === REPORTING_CONFIG.EXPORT_FORMATS.CSV) {
        exportData = formatDataForCSV(reportData.data || []);
        contentType = 'text/csv';
        filename = `${filename}.csv`;
      } else if (format === REPORTING_CONFIG.EXPORT_FORMATS.JSON) {
        exportData = formatDataForJSON([reportData]);
        filename = `${filename}.json`;
      }

      // Save to database if requested
      if (body.saveReport) {
        await saveReportToDatabase(
          user.id,
          reportName || `${reportType} Report`,
          reportType,
          reportData,
          format || 'json'
        );
      }

      return NextResponse.json({
        success: true,
        report: reportData,
        export: {
          data: exportData,
          format,
          filename,
          contentType,
        },
      });
    }

    // ============ SAVE REPORT ============
    if (action === 'save-report') {
      if (!reportName || !reportType) {
        return NextResponse.json(
          { error: 'Missing required fields: reportName, reportType' },
          { status: 400 }
        );
      }

      const { data: report, error } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          name: reportName,
          type: reportType,
          data: filters || {},
          export_format: format || 'json',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to save report' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        report,
      });
    }

    // ============ DELETE REPORT ============
    if (action === 'delete-report') {
      if (!reportId) {
        return NextResponse.json(
          { error: 'Missing reportId' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)
        .eq('user_id', user.id);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to delete report' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // ============ SCHEDULE REPORT ============
    if (action === 'schedule-report') {
      const {
        reportId: scheduleReportId,
        schedule,
        frequency,
        recipients,
      } = body;

      if (!scheduleReportId || !schedule) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Check user's scheduled report limit
      const { count: scheduleCount, error: countError } = await supabase
        .from('scheduled_reports')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      if (countError) {
        return NextResponse.json(
          { error: 'Failed to check schedule count' },
          { status: 500 }
        );
      }

      if ((scheduleCount || 0) >= REPORTING_CONFIG.LIMITS.MAX_SCHEDULED_REPORTS_PER_USER) {
        return NextResponse.json(
          {
            error: `Maximum scheduled reports limit (${REPORTING_CONFIG.LIMITS.MAX_SCHEDULED_REPORTS_PER_USER}) reached`,
          },
          { status: 400 }
        );
      }

      // Create schedule
      const { data: scheduledReport, error: scheduleError } = await supabase
        .from('scheduled_reports')
        .insert({
          user_id: user.id,
          report_id: scheduleReportId,
          schedule,
          frequency: frequency || 'weekly',
          recipients: recipients || [user.email],
          enabled: true,
          created_at: new Date().toISOString(),
          next_run_at: calculateNextRunTime(schedule),
        })
        .select()
        .single();

      if (scheduleError) {
        return NextResponse.json(
          { error: 'Failed to schedule report' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        scheduledReport,
      });
    }

    // ============ UPDATE REPORT SCHEDULE ============
    if (action === 'update-schedule') {
      const { reportId: scheduleId, enabled } = body;

      if (!scheduleId) {
        return NextResponse.json(
          { error: 'Missing scheduleId' },
          { status: 400 }
        );
      }

      const { data: updated, error } = await supabase
        .from('scheduled_reports')
        .update({ enabled })
        .eq('id', scheduleId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update schedule' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        scheduledReport: updated,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/reports/generate:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============ HELPER FUNCTIONS ============

function calculateNextRunTime(schedule: string): string {
  const now = new Date();

  // Parse schedule string (e.g., "09:00", "monday-09:00", "15-09:00")
  const parts = schedule.split('-');

  if (parts.length === 1) {
    // Time only (daily)
    const [hours, minutes] = parts[0].split(':').map(Number);
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);

    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next.toISOString();
  }

  // More complex scheduling logic would go here
  return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
}
