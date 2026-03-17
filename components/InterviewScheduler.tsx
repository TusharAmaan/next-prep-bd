'use client';

import React, { useState, useEffect } from 'react';
import { INTERVIEW_PREP_CONFIG } from '@/lib/interviewPrepConfig';
import { getAvailableTutors } from '@/lib/interviewPrepUtils';

interface InterviewSchedulerProps {
  studentId: string;
  onSuccess?: () => void;
}

export default function InterviewScheduler({ studentId, onSuccess }: InterviewSchedulerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableTutors, setAvailableTutors] = useState<any[]>([]);
  const [tutorsLoading, setTutorsLoading] = useState(false);

  const [config, setConfig] = useState({
    interviewType: 'technical' as string,
    difficulty: 'intermediate' as string,
    format: 'verbal' as string,
    duration: 60 as number,
    scheduledDate: '',
    scheduledTime: '',
    selectedTutor: '',
    preferredCategories: [] as string[],
  });

  // Get available tutors when date/time changes
  useEffect(() => {
    if (config.scheduledDate && config.scheduledTime) {
      fetchAvailableTutors();
    }
  }, [config.scheduledDate, config.scheduledTime]);

  const fetchAvailableTutors = async () => {
    try {
      setTutorsLoading(true);
      const startDate = new Date(`${config.scheduledDate}T${config.scheduledTime}`);
      const endDate = new Date(startDate.getTime() + config.duration * 60000);

      const response = await fetch(
        `/api/interviews?action=available-tutors&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&interviewType=${config.interviewType}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setAvailableTutors(data.tutors || []);
      }
    } catch (err) {
      console.error('Error fetching tutors:', err);
    } finally {
      setTutorsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setConfig(prev => {
      const categories = prev.preferredCategories.includes(category)
        ? prev.preferredCategories.filter(c => c !== category)
        : [...prev.preferredCategories, category];
      return { ...prev, preferredCategories: categories };
    });
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!config.selectedTutor || !config.scheduledDate || !config.scheduledTime) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const scheduledTime = new Date(`${config.scheduledDate}T${config.scheduledTime}`);

      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          action: 'schedule',
          studentId,
          tutorId: config.selectedTutor,
          interviewType: config.interviewType,
          scheduledTime: scheduledTime.toISOString(),
          duration: config.duration,
          format: config.format,
          preferredCategories: config.preferredCategories,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Interview scheduled successfully!');
        setConfig({
          interviewType: 'technical',
          difficulty: 'intermediate',
          format: 'verbal',
          duration: 60,
          scheduledDate: '',
          scheduledTime: '',
          selectedTutor: '',
          preferredCategories: [],
        });
        onSuccess?.();
      } else {
        setError(data.error || 'Failed to schedule interview');
      }
    } catch (err) {
      console.error('Error scheduling interview:', err);
      setError('An error occurred while scheduling the interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Schedule Interview</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSchedule} className="space-y-6">
        {/* Interview Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interview Type <span className="text-red-500">*</span>
          </label>
          <select
            value={config.interviewType}
            onChange={e => handleInputChange('interviewType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(INTERVIEW_PREP_CONFIG.INTERVIEW_TYPES).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level <span className="text-red-500">*</span>
          </label>
          <select
            value={config.difficulty}
            onChange={e => handleInputChange('difficulty', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(INTERVIEW_PREP_CONFIG.DIFFICULTY_LEVELS).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>

        {/* Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interview Format <span className="text-red-500">*</span>
          </label>
          <select
            value={config.format}
            onChange={e => handleInputChange('format', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(INTERVIEW_PREP_CONFIG.INTERVIEW_FORMATS).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (minutes)
          </label>
          <select
            value={config.duration}
            onChange={e => handleInputChange('duration', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(INTERVIEW_PREP_CONFIG.DURATION_TEMPLATES).map(([key, { label, minutes }]) => (
              <option key={key} value={minutes}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Preferred Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preferred Categories (Optional)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(INTERVIEW_PREP_CONFIG.QUESTION_CATEGORIES).slice(0, 8).map(([key, value]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.preferredCategories.includes(key)}
                  onChange={() => handleCategoryToggle(key)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{value}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={config.scheduledDate}
            onChange={e => handleInputChange('scheduledDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={config.scheduledTime}
            onChange={e => handleInputChange('scheduledTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tutor Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Tutor <span className="text-red-500">*</span>
          </label>
          {tutorsLoading ? (
            <div className="text-sm text-gray-500">Loading available tutors...</div>
          ) : availableTutors.length > 0 ? (
            <select
              value={config.selectedTutor}
              onChange={e => handleInputChange('selectedTutor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a tutor --</option>
              {availableTutors.map(tutor => (
                <option key={tutor.id} value={tutor.id}>
                  {tutor.name} - Rating: {tutor.rating || 'N/A'}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-orange-600">
              No tutors available for selected date and time. Please choose a different time.
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Scheduling...' : 'Schedule Interview'}
          </button>
          <button
            type="reset"
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-semibold text-blue-900 mb-2">Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Schedule at least 1 hour in advance</li>
          <li>• Choose relevant categories for focused preparation</li>
          <li>• Ensure you have a quiet place for the interview</li>
          <li>• Test your microphone and camera before the interview</li>
        </ul>
      </div>
    </div>
  );
}
