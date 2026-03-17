'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { REPORTING_CONFIG } from '@/lib/reportingConfig';

interface ReportConfig {
  name: string;
  type: string;
  subtype: string;
  dateRange: string;
  format: string;
  saveReport: boolean;
  filters?: Record<string, any>;
}

export default function ReportBuilder() {
  const { data: session } = useSession();
  const [config, setConfig] = useState<ReportConfig>({
    name: '',
    type: REPORTING_CONFIG.REPORT_TYPES.STUDENT_PERFORMANCE,
    subtype: 'overall_scores',
    dateRange: 'last_30_days',
    format: 'pdf',
    saveReport: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reportTypes, setReportTypes] = useState<Record<string, string>>({});
  const [subtypes, setSubtypes] = useState<string[]>([]);
  const [templates, setTemplates] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchSubtypes(config.type);
  }, [config.type]);

  const fetchOptions = async () => {
    try {
      const [typesRes, templatesRes] = await Promise.all([
        fetch('/api/reports/generate?action=get-report-types'),
        fetch('/api/reports/generate?action=get-templates'),
      ]);

      if (typesRes.ok) {
        const typeData = await typesRes.json();
        setReportTypes(typeData.types);
      }

      if (templatesRes.ok) {
        const templateData = await templatesRes.json();
        setTemplates(templateData.templates);
      }
    } catch (err) {
      console.error('Error fetching options:', err);
    }
  };

  const fetchSubtypes = async (type: string) => {
    try {
      const res = await fetch(`/api/reports/generate?action=get-report-types&type=${type}`);
      if (res.ok) {
        const data = await res.json();
        setSubtypes(data.subtypes || []);
        if (data.subtypes?.length > 0) {
          setConfig((prev) => ({ ...prev, subtype: data.subtypes[0] }));
        }
      }
    } catch (err) {
      console.error('Error fetching subtypes:', err);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError('');

      if (!config.name) {
        setError('Please enter a report name');
        return;
      }

      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          ...config,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }

      const data = await res.json();
      setSuccess(`Report "${config.name}" generated successfully!`);

      // Download file if applicable
      if (config.format !== 'email') {
        const element = document.createElement('a');
        const file = new Blob([data.export.data], { type: data.export.contentType });
        element.href = URL.createObjectURL(file);
        element.download = data.export.filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }

      // Reset form
      setTimeout(() => {
        setConfig({
          name: '',
          type: REPORTING_CONFIG.REPORT_TYPES.STUDENT_PERFORMANCE,
          subtype: 'overall_scores',
          dateRange: 'last_30_days',
          format: 'pdf',
          saveReport: true,
        });
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const connectTemplate = (templateKey: string) => {
    const template = templates[templateKey];
    setConfig((prev) => ({
      ...prev,
      name: template.name,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Custom Report</h1>
        <p className="text-gray-600">
          Build reports tailored to your needs with flexible filtering and visualizations
        </p>
      </div>

      {/* Templates Section */}
      {Object.entries(templates).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Templates</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(templates).map(([key, template]: any) => (
              <div
                key={key}
                onClick={() => connectTemplate(key)}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <p className="font-semibold text-gray-900 mb-1">{template.name}</p>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <button className="text-blue-500 hover:underline text-sm font-semibold">
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 mb-6">
          {success}
        </div>
      )}

      {/* Report Configuration Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Report Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Report Name *
          </label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            placeholder="e.g., Monthly Revenue Analysis, Q1 Performance Report"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Report Type */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Report Type *
            </label>
            <select
              value={config.type}
              onChange={(e) => setConfig({ ...config, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(reportTypes).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          {/* Report Subtype */}
          {subtypes.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Report Focus
              </label>
              <select
                value={config.subtype}
                onChange={(e) => setConfig({ ...config, subtype: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {subtypes.map((subtype) => (
                  <option key={subtype} value={subtype}>
                    {subtype.replace(/_/g, ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Date Range & Format */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date Range *
            </label>
            <select
              value={config.dateRange}
              onChange={(e) => setConfig({ ...config, dateRange: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(REPORTING_CONFIG.DATE_RANGES).map(([key, value]: any) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Export Format
            </label>
            <select
              value={config.format}
              onChange={(e) => setConfig({ ...config, format: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(REPORTING_CONFIG.EXPORT_FORMATS).map(([key, value]) => (
                <option key={key} value={value}>
                  {key}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Save Report Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="saveReport"
            checked={config.saveReport}
            onChange={(e) => setConfig({ ...config, saveReport: e.target.checked })}
            className="h-4 w-4 text-blue-500 rounded border-gray-300"
          />
          <label htmlFor="saveReport" className="ml-2 text-sm text-gray-700">
            Save this report for future reference
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {loading ? 'Generating Report...' : 'Generate Report'}
          </button>

          <button
            onClick={() =>
              setConfig({
                name: '',
                type: REPORTING_CONFIG.REPORT_TYPES.STUDENT_PERFORMANCE,
                subtype: 'overall_scores',
                dateRange: 'last_30_days',
                format: 'pdf',
                saveReport: true,
              })
            }
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use templates for quick report generation with recommended settings</li>
          <li>• Save frequently generated reports for easy access</li>
          <li>• Export to PDF for sharing with stakeholders</li>
          <li>• Email reports can be scheduled for automatic delivery</li>
        </ul>
      </div>
    </div>
  );
}
