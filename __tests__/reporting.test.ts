import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDateRange,
  aggregateData,
  segmentData,
  aggregateAsTimeSeries,
  predictChurn,
  forecastRevenue,
  calculatePercentageChange,
  calculateGrowthRate,
  calculateCompoundGrowthRate,
  detectOutliers,
  normalizeData,
  calculateTrendLine,
} from '@/lib/reportingUtils';
import { REPORTING_CONFIG } from '@/lib/reportingConfig';

describe('Reporting System', () => {
  // ============ Date Range Tests ============

  describe('getDateRange', () => {
    it('should return correct range for last_30_days', () => {
      const range = getDateRange('last_30_days');
      expect(range.dayCount).toBeGreaterThanOrEqual(29);
      expect(range.dayCount).toBeLessThanOrEqual(31);
    });

    it('should return correct range for this_month', () => {
      const range = getDateRange('this_month');
      const now = new Date();
      expect(range.startDate.getMonth()).toBe(now.getMonth());
      expect(range.endDate.getMonth()).toBe(now.getMonth());
    });

    it('should return correct range for ytd', () => {
      const range = getDateRange('ytd');
      const now = new Date();
      expect(range.startDate.getMonth()).toBe(0); // January
      expect(range.endDate.getMonth()).toBe(now.getMonth());
    });

    it('should return correct range for last_7_days', () => {
      const range = getDateRange('last_7_days');
      expect(range.dayCount).toBe(7);
    });

    it('should have matching date boundaries', () => {
      const range = getDateRange('last_30_days');
      expect(range.startDate <= range.endDate).toBe(true);
    });
  });

  // ============ Data Aggregation Tests ============

  describe('aggregateData', () => {
    const testData = [
      { value: 100 },
      { value: 200 },
      { value: 300 },
      { value: 400 },
      { value: 500 },
    ];

    it('should calculate sum correctly', () => {
      const result = aggregateData(testData, 'sum', 'value');
      expect(result).toBe(1500);
    });

    it('should calculate average correctly', () => {
      const result = aggregateData(testData, 'average', 'value');
      expect(result).toBe(300);
    });

    it('should calculate minimum correctly', () => {
      const result = aggregateData(testData, 'minimum', 'value');
      expect(result).toBe(100);
    });

    it('should calculate maximum correctly', () => {
      const result = aggregateData(testData, 'maximum', 'value');
      expect(result).toBe(500);
    });

    it('should count correctly', () => {
      const result = aggregateData(testData, 'count', 'value');
      expect(result).toBe(5);
    });

    it('should calculate median correctly', () => {
      const result = aggregateData(testData, 'median', 'value');
      expect(result).toBe(300);
    });

    it('should handle empty data', () => {
      const result = aggregateData([], 'sum', 'value');
      expect(result).toBe(0);
    });

    it('should handle null/undefined values', () => {
      const data = [{ value: 100 }, { value: null }, { value: 200 }];
      const result = aggregateData(data, 'sum', 'value');
      expect(result).toBe(300);
    });
  });

  // ============ Segmentation Tests ============

  describe('segmentData', () => {
    const data = [
      { type: 'A', value: 100 },
      { type: 'B', value: 200 },
      { type: 'A', value: 150 },
      { type: 'C', value: 300 },
      { type: 'B', value: 250 },
    ];

    it('should segment data by key', () => {
      const result = segmentData(data, 'type');
      expect(Object.keys(result)).toEqual(['A', 'B', 'C']);
    });

    it('should group all items in correct segments', () => {
      const result = segmentData(data, 'type');
      expect(result['A'].length).toBe(2);
      expect(result['B'].length).toBe(2);
      expect(result['C'].length).toBe(1);
    });

    it('should preserve item data', () => {
      const result = segmentData(data, 'type');
      expect(result['A'][0].value).toBe(100);
      expect(result['A'][1].value).toBe(150);
    });
  });

  // ============ Time Series Aggregation Tests ============

  describe('aggregateAsTimeSeries', () => {
    const data = [
      { date: '2024-01-15T10:00:00Z', revenue: 1000 },
      { date: '2024-01-15T14:00:00Z', revenue: 2000 },
      { date: '2024-01-16T10:00:00Z', revenue: 1500 },
      { date: '2024-01-16T14:00:00Z', revenue: 2500 },
    ];

    it('should aggregate to daily periods', () => {
      const result = aggregateAsTimeSeries(data, 'date', 'revenue', 'daily');
      expect(result.length).toBe(2);
      expect(result[0].date).toBe('2024-01-15');
      expect(result[1].date).toBe('2024-01-16');
    });

    it('should calculate average correctly in time series', () => {
      const result = aggregateAsTimeSeries(data, 'date', 'revenue', 'daily');
      expect(result[0].value).toBe(1500); // (1000 + 2000) / 2
      expect(result[1].value).toBe(2000); // (1500 + 2500) / 2
    });
  });

  // ============ Churn Prediction Tests ============

  describe('predictChurn', () => {
    it('should identify high churn risk', () => {
      const users = [
        {
          id: 'user1',
          last_activity: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
          session_count: 2,
          completion_rate: 0.2,
          days_as_member: 60,
        },
      ];

      const result = predictChurn(users, 0.7);
      expect(result[0].risk).toBe('high');
      expect(result[0].riskScore).toBeGreaterThan(70);
    });

    it('should identify low churn risk', () => {
      const users = [
        {
          id: 'user2',
          last_activity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          session_count: 15,
          completion_rate: 0.85,
          days_as_member: 90,
        },
      ];

      const result = predictChurn(users, 0.7);
      expect(result[0].risk).toBe('low');
      expect(result[0].riskScore).toBeLessThan(50);
    });

    it('should identify medium churn risk', () => {
      const users = [
        {
          id: 'user3',
          last_activity: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          session_count: 8,
          completion_rate: 0.5,
          days_as_member: 45,
        },
      ];

      const result = predictChurn(users, 0.7);
      expect(result[0].risk).toBe('medium');
      expect(result[0].riskScore).toBeGreaterThanOrEqual(50);
      expect(result[0].riskScore).toBeLessThan(70);
    });
  });

  // ============ Revenue Forecast Tests ============

  describe('forecastRevenue', () => {
    const historicalData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue: 10000 + Math.random() * 5000,
    }));

    it('should generate forecast points', () => {
      const forecast = forecastRevenue(historicalData, 15);
      expect(forecast.length).toBe(15);
    });

    it('should have valid forecast structure', () => {
      const forecast = forecastRevenue(historicalData, 10);
      forecast.forEach((point) => {
        expect(point.date).toBeDefined();
        expect(point.forecast).toBeDefined();
        expect(point.lower).toBeDefined();
        expect(point.upper).toBeDefined();
      });
    });

    it('should create confidence interval', () => {
      const forecast = forecastRevenue(historicalData, 5);
      forecast.forEach((point) => {
        expect(point.lower).toBeLessThan(point.forecast);
        expect(point.forecast).toBeLessThan(point.upper);
      });
    });

    it('should handle insufficient data', () => {
      const shortData = [{ date: '2024-01-01', revenue: 10000 }];
      const forecast = forecastRevenue(shortData, 10);
      // Should return empty or fallback
      expect(Array.isArray(forecast)).toBe(true);
    });
  });

  // ============ Percentage Change Tests ============

  describe('calculatePercentageChange', () => {
    it('should calculate positive change', () => {
      const change = calculatePercentageChange(150, 100);
      expect(change).toBe(50); // 50% increase
    });

    it('should calculate negative change', () => {
      const change = calculatePercentageChange(75, 100);
      expect(change).toBe(-25); // 25% decrease
    });

    it('should handle zero previous value', () => {
      const change = calculatePercentageChange(100, 0);
      expect(change).toBe(0);
    });

    it('should handle identical values', () => {
      const change = calculatePercentageChange(100, 100);
      expect(change).toBe(0);
    });
  });

  // ============ Growth Rate Tests ============

  describe('calculateGrowthRate', () => {
    it('should calculate positive growth', () => {
      const growth = calculateGrowthRate([100, 110, 120, 150]);
      expect(growth).toBeGreaterThan(0);
    });

    it('should calculate negative growth', () => {
      const growth = calculateGrowthRate([100, 90, 80, 70]);
      expect(growth).toBeLessThan(0);
    });

    it('should handle single value', () => {
      const growth = calculateGrowthRate([100]);
      expect(growth).toBe(0);
    });

    it('should calculate from first to last', () => {
      const growth = calculateGrowthRate([100, 200]);
      expect(growth).toBe(100); // 100% growth
    });
  });

  // ============ CAGR Tests ============

  describe('calculateCompoundGrowthRate', () => {
    it('should calculate CAGR correctly', () => {
      const cagr = calculateCompoundGrowthRate(1000, 2000, 5);
      expect(cagr).toBeGreaterThan(0);
      expect(cagr).toBeLessThan(100);
    });

    it('should handle no growth', () => {
      const cagr = calculateCompoundGrowthRate(1000, 1000, 5);
      expect(cagr).toBe(0);
    });

    it('should handle zero starting value', () => {
      const cagr = calculateCompoundGrowthRate(0, 1000, 5);
      expect(cagr).toBe(0);
    });
  });

  // ============ Outlier Detection Tests ============

  describe('detectOutliers', () => {
    it('should detect outliers above mean', () => {
      const values = [10, 12, 11, 13, 12, 1000]; // 1000 is outlier
      const outliers = detectOutliers(values, 2);
      expect(outliers).toContain(1000);
    });

    it('should detect outliers below mean', () => {
      const values = [100, 102, 101, 103, 102, -500]; // -500 is outlier
      const outliers = detectOutliers(values, 2);
      expect(outliers).toContain(-500);
    });

    it('should not flag normal variation', () => {
      const values = [100, 101, 99, 102, 98, 101];
      const outliers = detectOutliers(values, 2);
      expect(outliers.length).toBe(0);
    });
  });

  // ============ Data Normalization Tests ============

  describe('normalizeData', () => {
    it('should normalize to 0-1 range', () => {
      const values = [10, 20, 30, 40, 50];
      const normalized = normalizeData(values);

      expect(Math.min(...normalized)).toBe(0);
      expect(Math.max(...normalized)).toBe(1);
    });

    it('should preserve order', () => {
      const values = [50, 10, 30];
      const normalized = normalizeData(values);

      expect(normalized[0] > normalized[1]).toBe(true);
      expect(normalized[1] < normalized[2]).toBe(true);
    });

    it('should handle identical values', () => {
      const values = [100, 100, 100];
      const normalized = normalizeData(values);

      normalized.forEach((n) => {
        expect(n).toBe(0);
      });
    });
  });

  // ============ Trend Line Tests ============

  describe('calculateTrendLine', () => {
    const linearPoints = [
      { x: 1, y: 2 },
      { x: 2, y: 4 },
      { x: 3, y: 6 },
      { x: 4, y: 8 },
    ];

    it('should calculate correct slope', () => {
      const { slope } = calculateTrendLine(linearPoints);
      expect(slope).toBeCloseTo(2, 0); // y = 2x
    });

    it('should calculate correct intercept', () => {
      const { intercept } = calculateTrendLine(linearPoints);
      expect(intercept).toBeCloseTo(0, 1);
    });

    it('should calculate R² for perfect fit', () => {
      const { r2 } = calculateTrendLine(linearPoints);
      expect(r2).toBeCloseTo(1, 1); // Perfect fit
    });

    it('should handle scattered data', () => {
      const scatteredPoints = [
        { x: 1, y: 1 },
        { x: 2, y: 4 },
        { x: 3, y: 2 },
        { x: 4, y: 7 },
      ];

      const { r2 } = calculateTrendLine(scatteredPoints);
      expect(r2).toBeLessThan(1);
      expect(r2).toBeGreaterThan(0);
    });

    it('should handle insufficient points', () => {
      const { slope } = calculateTrendLine([{ x: 1, y: 2 }]);
      expect(slope).toBe(0);
    });
  });

  // ============ Integration Tests ============

  describe('Report Generation Integration', () => {
    it('should aggregate daily revenue data', () => {
      const revenue = [
        { date: '2024-01-15', amount: 1000 },
        { date: '2024-01-15', amount: 500 },
        { date: '2024-01-16', amount: 1500 },
      ];

      const result = aggregateAsTimeSeries(revenue, 'date', 'amount', 'daily');
      expect(result[0].value).toBe(750); // (1000 + 500) / 2
      expect(result[1].value).toBe(1500);
    });

    it('should segment and aggregate', () => {
      const data = [
        { type: 'A', value: 100 },
        { type: 'B', value: 200 },
        { type: 'A', value: 150 },
      ];

      const segmented = segmentData(data, 'type');
      const avgA = aggregateData(segmented['A'], 'average', 'value');
      const avgB = aggregateData(segmented['B'], 'average', 'value');

      expect(avgA).toBe(125);
      expect(avgB).toBe(200);
    });

    it('should calculate variance in metrics', () => {
      const values = [100, 110, 120, 130, 140];
      const growth = calculateGrowthRate(values);
      const changePercent = calculatePercentageChange(values[values.length - 1], values[0]);

      expect(growth).toBeCloseTo(changePercent, 1);
    });
  });

  // ============ Configuration Tests ============

  describe('Report Configuration', () => {
    it('should have valid report types', () => {
      Object.values(REPORTING_CONFIG.REPORT_TYPES).forEach((type) => {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });
    });

    it('should have export formats', () => {
      expect(Object.keys(REPORTING_CONFIG.EXPORT_FORMATS).length).toBeGreaterThan(0);
    });

    it('should have date range presets', () => {
      expect(Object.keys(REPORTING_CONFIG.DATE_RANGES).length).toBeGreaterThan(0);
    });

    it('should have visualization types', () => {
      expect(Object.keys(REPORTING_CONFIG.VISUALIZATION_TYPES).length).toBeGreaterThan(5);
    });
  });
});
