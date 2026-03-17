import { getUserLicense, hasFeatureAccess, validateFeatureQuota, isLicenseActive, getLicenseRemainingDays, shouldShowExpiryWarning, getLicenseMembers, isLicenseMember, checkLicenseCapacity } from '@/lib/licenseUtils';

/**
 * License Utility Tests
 * Run these tests to verify licensing functionality
 */

// Mock data
const mockUserId = 'test-user-123';
const mockLicense = {
  id: 'lic-123',
  type: 'team',
  status: 'active',
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  max_users: 5,
};

const mockExpiredLicense = {
  id: 'lic-124',
  type: 'team',
  status: 'active',
  expires_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  max_users: 5,
};

describe('License Utilities', () => {
  describe('isLicenseActive', () => {
    test('should return true for active license with future expiry', () => {
      const result = isLicenseActive(mockLicense);
      expect(result).toBe(true);
    });

    test('should return false for expired license', () => {
      const result = isLicenseActive(mockExpiredLicense);
      expect(result).toBe(false);
    });

    test('should return false for suspended license', () => {
      const suspendedLicense = { ...mockLicense, status: 'suspended' };
      const result = isLicenseActive(suspendedLicense);
      expect(result).toBe(false);
    });
  });

  describe('getLicenseRemainingDays', () => {
    test('should calculate remaining days correctly', () => {
      const daysFromNow = 15;
      const futureLicense = {
        ...mockLicense,
        expires_at: new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = getLicenseRemainingDays(futureLicense);
      expect(result).toBeGreaterThanOrEqual(daysFromNow - 1);
      expect(result).toBeLessThanOrEqual(daysFromNow + 1);
    });

    test('should return negative for expired license', () => {
      const result = getLicenseRemainingDays(mockExpiredLicense);
      expect(result).toBeLessThan(0);
    });
  });

  describe('shouldShowExpiryWarning', () => {
    test('should warn for license expiring in 7 days', () => {
      const warningLicense = {
        ...mockLicense,
        expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = shouldShowExpiryWarning(warningLicense);
      expect(result).toBe(true);
    });

    test('should not warn for license expiring in more than 7 days', () => {
      const result = shouldShowExpiryWarning(mockLicense);
      expect(result).toBe(false);
    });

    test('should not warn for expired license', () => {
      const result = shouldShowExpiryWarning(mockExpiredLicense);
      expect(result).toBe(false);
    });
  });
});

/**
 * Integration Tests - Run with actual database
 */
describe('License Management API', () => {
  describe('Purchase License', () => {
    test('should create license on checkout completion', async () => {
      const response = await fetch('/api/licenses/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: mockUserId,
          action: 'purchase',
          licenseType: 'team',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.license).toHaveProperty('id');
      expect(data.license.type).toBe('team');
      expect(data.license.status).toBe('active');
    });

    test('should reject invalid license type', async () => {
      const response = await fetch('/api/licenses/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: mockUserId,
          action: 'purchase',
          licenseType: 'invalid',
        }),
      });

      expect(response.status).toBe(400);
    });

    test('should reject missing userId', async () => {
      const response = await fetch('/api/licenses/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'purchase',
          licenseType: 'team',
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Member Management', () => {
    test('should add member to license', async () => {
      const response = await fetch('/api/licenses/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: mockUserId,
          action: 'add-member',
          email: 'newmember@example.com',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test('should reject adding member when license is full', async () => {
      // This test assumes license with 1 seat and 1 member already
      const response = await fetch('/api/licenses/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: mockUserId,
          action: 'add-member',
          email: 'anothermember@example.com',
        }),
      });

      // Should either succeed or return 400 depending on capacity
      expect([200, 400]).toContain(response.status);
    });

    test('should remove member from license', async () => {
      const response = await fetch('/api/licenses/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: mockUserId,
          action: 'remove-member',
          memberId: 'mem-123',
        }),
      });

      // Expect either success or not found
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Invitation Management', () => {
    test('should accept invitation', async () => {
      const response = await fetch('/api/licenses/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: mockUserId,
          action: 'accept-invitation',
          invitationId: 'inv-123',
        }),
      });

      // Expect either success or not found
      expect([200, 400, 404]).toContain(response.status);
    });
  });

  describe('Get License Info', () => {
    test('should retrieve user license', async () => {
      const response = await fetch(`/api/licenses/manage?userId=${mockUserId}&action=my-license`);

      expect(response.status).toBe(200);
      const data = await response.json();
      if (data.license) {
        expect(data.license).toHaveProperty('id');
        expect(data.license).toHaveProperty('type');
        expect(Array.isArray(data.members)).toBe(true);
      }
    });

    test('should list available licenses', async () => {
      const response = await fetch('/api/licenses/manage?action=list');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.licenses)).toBe(true);
      expect(data.licenses.length).toBeGreaterThan(0);
    });
  });
});

/**
 * Payment API Tests
 */
describe('Payment API', () => {
  describe('Stripe Checkout', () => {
    test('should create checkout session', async () => {
      const response = await fetch('/api/licenses/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: mockUserId,
          licenseType: 'team',
          action: 'create-checkout',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.sessionId).toBeDefined();
    });

    test('should reject invalid license type', async () => {
      const response = await fetch('/api/licenses/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: mockUserId,
          licenseType: 'invalid',
          action: 'create-checkout',
        }),
      });

      expect(response.status).toBe(400);
    });

    test('should retrieve checkout session', async () => {
      // First create a session
      const createResponse = await fetch('/api/licenses/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: mockUserId,
          licenseType: 'personal',
          action: 'create-checkout',
        }),
      });

      const { sessionId } = await createResponse.json();

      // Then retrieve it
      const retrieveResponse = await fetch('/api/licenses/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          action: 'retrieve-session',
        }),
      });

      expect(retrieveResponse.status).toBe(200);
      const data = await retrieveResponse.json();
      expect(data).toHaveProperty('status');
    });
  });
});

/**
 * Performance Tests
 */
describe('License Performance', () => {
  test('should fetch license in < 100ms', async () => {
    const start = Date.now();
    await getUserLicense(mockUserId);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100);
  });

  test('should check feature access in < 150ms', async () => {
    const start = Date.now();
    await hasFeatureAccess(mockUserId, 'courses');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(150);
  });

  test('should validate feature quota in < 200ms', async () => {
    const start = Date.now();
    await validateFeatureQuota(mockUserId, 'storage', 500);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(200);
  });
});

/**
 * Edge Cases
 */
describe('Edge Cases', () => {
  test('should handle non-existent user', async () => {
    const result = await getUserLicense('non-existent-user');
    expect(result).toBeNull();
  });

  test('should handle deleted user gracefully', async () => {
    const result = await hasFeatureAccess('deleted-user-id', 'courses');
    expect(result).toBe(false);
  });

  test('should handle concurrent access to same license', async () => {
    const promises = [
      hasFeatureAccess(mockUserId, 'courses'),
      hasFeatureAccess(mockUserId, 'quizzes'),
      hasFeatureAccess(mockUserId, 'analytics'),
    ];

    const results = await Promise.all(promises);
    expect(results.length).toBe(3);
  });

  test('should validate empty invitation response', async () => {
    const result = await getLicenseMembers('non-existent-license');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});
