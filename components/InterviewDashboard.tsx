'use client';

import React, { useState, useEffect } from 'react';
import { INTERVIEW_PREP_CONFIG } from '@/lib/interviewPrepConfig';

interface Interview {
  id: string;
  interview_type: string;
  scheduled_time: string;
  status: string;
  final_score?: number;
  tutor_id?: string;
  student_id?: string;
  duration_minutes: number;
  format: string;
}

interface InterviewDashboardProps {
  userId: string;
  role?: 'student' | 'tutor';
}

export default function InterviewDashboard({
  userId,
  role = 'student',
}: InterviewDashboardProps) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchInterviews();
  }, [filter, sortBy, role]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const statusFilter = filter !== 'all' ? `&status=${filter}` : '';
      const response = await fetch(
        `/api/interviews?action=list-interviews&role=${role}${statusFilter}&limit=50`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        let sorted = data.interviews || [];
        if (sortBy === 'date') {
          sorted.sort((a: Interview, b: Interview) =>
            new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime()
          );
        } else if (sortBy === 'score') {
          sorted.sort((a: Interview, b: Interview) =>
            (b.final_score || 0) - (a.final_score || 0)
          );
        }
        setInterviews(sorted);
      } else {
        setError(data.error || 'Failed to fetch interviews');
      }
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError('An error occurred while fetching interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = (interviewId: string) => {
    // Open reschedule modal or navigate to form
    console.log('Reschedule interview:', interviewId);
  };

  const handleCancel = async (interviewId: string) => {
    if (!window.confirm('Are you sure you want to cancel this interview?')) return;

    try {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          action: 'cancel',
          interviewId,
        }),
      });

      if (response.ok) {
        setInterviews(interviews.filter(i => i.id !== interviewId));
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to cancel interview');
      }
    } catch (err) {
      console.error('Error cancelling interview:', err);
      setError('An error occurred while cancelling the interview');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: string } = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      rescheduled: 'bg-purple-100 text-purple-800',
    };

    return statusConfig[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 85) return 'text-green-600 font-semibold';
    if (score >= 70) return 'text-blue-600 font-semibold';
    if (score >= 60) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading interviews...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {role === 'student' ? 'My Interviews' : 'Scheduled Interviews'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Status:</label>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            {Object.entries(INTERVIEW_PREP_CONFIG.INTERVIEW_STATUS).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Date (Newest)</option>
            <option value="score">Score (Highest)</option>
          </select>
        </div>
      </div>

      {/* Interviews List */}
      {interviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No interviews found</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md">
            Schedule New Interview
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map(interview => (
            <div
              key={interview.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Interview Type</p>
                  <p className="font-semibold text-lg">
                    {INTERVIEW_PREP_CONFIG.INTERVIEW_TYPES[
                      interview.interview_type as keyof typeof INTERVIEW_PREP_CONFIG.INTERVIEW_TYPES
                    ] || interview.interview_type}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Scheduled Time</p>
                  <p className="font-semibold text-lg">{formatDateTime(interview.scheduled_time)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                      interview.status
                    )}`}
                  >
                    {INTERVIEW_PREP_CONFIG.INTERVIEW_STATUS[
                      interview.status as keyof typeof INTERVIEW_PREP_CONFIG.INTERVIEW_STATUS
                    ] || interview.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">{interview.duration_minutes} minutes</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Format</p>
                  <p className="font-medium">
                    {INTERVIEW_PREP_CONFIG.INTERVIEW_FORMATS[
                      interview.format as keyof typeof INTERVIEW_PREP_CONFIG.INTERVIEW_FORMATS
                    ] || interview.format}
                  </p>
                </div>

                {interview.final_score && (
                  <div>
                    <p className="text-sm text-gray-600">Score</p>
                    <p className={`text-xl font-bold ${getScoreColor(interview.final_score)}`}>
                      {interview.final_score.toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                {interview.status === 'scheduled' && (
                  <>
                    <button
                      onClick={() => handleReschedule(interview.id)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md font-medium transition"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleCancel(interview.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-md font-medium transition"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {interview.status === 'completed' && (
                  <button className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-md font-medium transition">
                    View Feedback
                  </button>
                )}

                <button className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md font-medium transition ml-auto">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Total Interviews</p>
          <p className="text-2xl font-bold text-blue-900">{interviews.length}</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Completed</p>
          <p className="text-2xl font-bold text-green-900">
            {interviews.filter(i => i.status === 'completed').length}
          </p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-600 font-medium">Scheduled</p>
          <p className="text-2xl font-bold text-yellow-900">
            {interviews.filter(i => i.status === 'scheduled').length}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">Average Score</p>
          <p className="text-2xl font-bold text-purple-900">
            {interviews.filter(i => i.final_score).length > 0
              ? (
                  interviews
                    .filter(i => i.final_score)
                    .reduce((sum, i) => sum + (i.final_score || 0), 0) /
                  interviews.filter(i => i.final_score).length
                ).toFixed(1)
              : 'N/A'}
            %
          </p>
        </div>
      </div>
    </div>
  );
}
