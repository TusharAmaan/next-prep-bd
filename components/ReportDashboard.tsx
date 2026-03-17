'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface SavedReport {
  id: string;
  name: string;
  type: string;
  export_format: string;
  created_at: string;
}

export default function ReportDashboard() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');

  useEffect(() => {
    if (session?.user?.id) {
      fetchReports();
    }
  }, [session?.user?.id]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports/generate?action=list-reports&limit=100');

      if (!res.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await res.json();
      setReports(data.reports || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-report',
          reportId,
        }),
      });

      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
      }
    } catch (err) {
      console.error('Error deleting report:', err);
    }
  };

  const handleDownloadReport = async (reportId: string, reportName: string, format: string) => {
    try {
      const res = await fetch(`/api/reports/generate?action=get-report&reportId=${reportId}`);

      if (res.ok) {
        const data = await res.json();
        const element = document.createElement('a');
        const file = new Blob([JSON.stringify(data.report)], { type: 'application/json' });
        element.href = URL.createObjectURL(file);
        element.download = `${reportName}-${new Date().getTime()}.${format}`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    } catch (err) {
      console.error('Error downloading report:', err);
    }
  };

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredReports =
    filter === 'all'
      ? reports
      : reports.filter((r) => r.type.toLowerCase().includes(filter.toLowerCase()));

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'created_at') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reports</h1>
        <p className="text-gray-600">View and manage your saved reports</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
          {error}
        </div>
      )}

      {/* No Reports */}
      {sortedReports.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first report to get started with data insights
          </p>
          <a
            href="/reports/create"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
          >
            Create Report
          </a>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Type
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Types</option>
                <option value="student">Student Performance</option>
                <option value="course">Course Analytics</option>
                <option value="revenue">Revenue Analysis</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="created_at">Most Recent</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="grid gap-4">
            {sortedReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{report.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        {report.type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span>
                        Format: <strong>{report.export_format.toUpperCase()}</strong>
                      </span>
                      <span>
                        Created: <strong>{getDateLabel(report.created_at)}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() =>
                        handleDownloadReport(
                          report.id,
                          report.name,
                          report.export_format
                        )
                      }
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-semibold"
                      title="Download Report"
                    >
                      ⬇️ Download
                    </button>

                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-semibold"
                      title="Delete Report"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Stats Footer */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            <p className="text-sm text-gray-600">Total Reports</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {[...new Set(reports.map((r) => r.type))].length}
            </p>
            <p className="text-sm text-gray-600">Report Types</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {reports.filter((r) => new Date(r.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                .length}
            </p>
            <p className="text-sm text-gray-600">Created This Week</p>
          </div>
        </div>
      </div>
    </div>
  );
}
