import { createClient } from '@supabase/supabase-js';
import { LICENSE_CONFIG, FEATURE_ACCESS, LICENSE_ERRORS } from '@/lib/licenseConfig';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface License {
  id: string;
  type: string;
  status: string;
  expires_at: string;
  max_users: number;
}

/**
 * Get user's active license
 */
export async function getUserLicense(userId: string): Promise<License | null> {
  try {
    const { data: license, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('owner_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return license || null;
  } catch (error) {
    console.error('Error fetching user license:', error);
    return null;
  }
}

/**
 * Check if user has access to a feature
 */
export async function hasFeatureAccess(
  userId: string,
  feature: string
): Promise<boolean> {
  try {
    const license = await getUserLicense(userId);

    if (!license) {
      return false; // No license = no access
    }

    // Check if license is valid
    if (license.status !== 'active') {
      return false;
    }

    const expiryDate = new Date(license.expires_at);
    if (expiryDate < new Date()) {
      return false; // License expired
    }

    // Check feature access based on license type
    const licenseFeatures = FEATURE_ACCESS[license.type as keyof typeof FEATURE_ACCESS];

    if (!licenseFeatures) {
      return false;
    }

    // Feature exists in license type's available features
    return feature in licenseFeatures;
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
}

/**
 * Validate license is still active
 */
export function isLicenseActive(license: License): boolean {
  if (license.status !== 'active') {
    return false;
  }

  const expiryDate = new Date(license.expires_at);
  return expiryDate > new Date();
}

/**
 * Get license remaining days
 */
export function getLicenseRemainingDays(license: License): number {
  const expiryDate = new Date(license.expires_at);
  const today = new Date();
  const timeDiff = expiryDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

/**
 * Check if license will warn expiry soon
 */
export function shouldShowExpiryWarning(license: License): boolean {
  const remainingDays = getLicenseRemainingDays(license);
  return remainingDays <= 7 && remainingDays > 0;
}

/**
 * Get all members of a license
 */
export async function getLicenseMembers(licenseId: string) {
  try {
    const { data: members, error } = await supabase
      .from('license_members')
      .select('*, users(id, full_name, email)')
      .eq('license_id', licenseId)
      .order('added_at', { ascending: false });

    if (error) throw error;

    return members || [];
  } catch (error) {
    console.error('Error fetching license members:', error);
    return [];
  }
}

/**
 * Check if user is a member of a license
 */
export async function isLicenseMember(
  userId: string,
  licenseId: string
): Promise<boolean> {
  try {
    const { data: member } = await supabase
      .from('license_members')
      .select('id')
      .eq('license_id', licenseId)
      .eq('user_id', userId)
      .single();

    return !!member;
  } catch (error) {
    console.error('Error checking license membership:', error);
    return false;
  }
}

/**
 * Check license capacity
 */
export async function checkLicenseCapacity(licenseId: string): Promise<boolean> {
  try {
    const { data: license } = await supabase
      .from('licenses')
      .select('max_users')
      .eq('id', licenseId)
      .single();

    if (!license) {
      return false;
    }

    const { count: memberCount } = await supabase
      .from('license_members')
      .select('*', { count: 'exact' })
      .eq('license_id', licenseId);

    return (memberCount || 0) < license.max_users;
  } catch (error) {
    console.error('Error checking license capacity:', error);
    return false;
  }
}

/**
 * Get pending invitations for a user
 */
export async function getPendingInvitations(userEmail: string) {
  try {
    const { data: invitations, error } = await supabase
      .from('license_invitations')
      .select('*, licenses(type, max_users)')
      .eq('invited_email', userEmail)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString());

    if (error) throw error;

    return invitations || [];
  } catch (error) {
    console.error('Error fetching pending invitations:', error);
    return [];
  }
}

/**
 * Validate feature access with quota
 */
export async function validateFeatureQuota(
  userId: string,
  feature: string,
  currentUsage: number
): Promise<{ allowed: boolean; remaining: number; error?: string }> {
  try {
    const license = await getUserLicense(userId);

    if (!license || !isLicenseActive(license)) {
      return {
        allowed: false,
        remaining: 0,
        error: LICENSE_ERRORS.INVALID_LICENSE,
      };
    }

    const featureAccess = FEATURE_ACCESS[license.type as keyof typeof FEATURE_ACCESS];

    if (!featureAccess || !(feature in featureAccess)) {
      return {
        allowed: false,
        remaining: 0,
        error: LICENSE_ERRORS.LIMIT_EXCEEDED,
      };
    }

    const featureLimit = (featureAccess as any)[feature];

    if (featureLimit.max === Infinity) {
      return { allowed: true, remaining: Infinity };
    }

    const remaining = featureLimit.max - currentUsage;

    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
    };
  } catch (error) {
    console.error('Error validating feature quota:', error);
    return {
      allowed: false,
      remaining: 0,
      error: 'Failed to validate feature quota',
    };
  }
}

/**
 * Get license upgrade suggestion
 */
export function getSuggestedUpgrade(currentType: string): string | null {
  const upgradeMap: Record<string, string> = {
    personal: 'team',
    team: 'institution',
  };

  return upgradeMap[currentType] || null;
}

/**
 * Format license type for display
 */
export function formatLicenseType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Get license features for display
 */
export function getLicenseFeatures(licenseType: string): string[] {
  return LICENSE_CONFIG.FEATURES[licenseType as keyof typeof LICENSE_CONFIG.FEATURES] || [];
}

/**
 * Track license usage event
 */
export async function trackLicenseUsage(
  userId: string,
  action: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    const license = await getUserLicense(userId);

    if (!license) return;

    await supabase.from('license_usage_logs').insert({
      license_id: license.id,
      user_id: userId,
      action,
      details: JSON.stringify(details),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error tracking license usage:', error);
  }
}
