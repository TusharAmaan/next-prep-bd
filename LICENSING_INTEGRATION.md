# Integration Guide: Multi-User Licensing System

## Quick Start Integration

### 1. Add License Check Middleware

Create `middleware/licenseCheck.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function checkLicenseMiddleware(
  request: NextRequest,
  userId: string
) {
  const { data: license } = await supabase
    .from('licenses')
    .select('*')
    .eq('owner_id', userId)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .single();

  if (!license) {
    return new NextResponse('License required', { status: 403 });
  }

  return null; // Allow request
}
```

### 2. Protect Routes with License Check

Update route handlers to require valid license:

```typescript
// app/api/courses/create/route.ts
import { checkLicenseMiddleware } from '@/middleware/licenseCheck';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check license
  const licenseError = await checkLicenseMiddleware(request, userId);
  if (licenseError) {
    return licenseError;
  }

  // Process course creation...
}
```

### 3. Add License Status to User Dashboard

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getUserLicense, shouldShowExpiryWarning, getLicenseRemainingDays } from '@/lib/licenseUtils';

export function DashboardLicenseStatus() {
  const { data: session } = useSession();
  const [license, setLicense] = useState(null);
  const [warning, setWarning] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      loadLicense();
    }
  }, [session?.user?.id]);

  const loadLicense = async () => {
    const lic = await getUserLicense(session?.user?.id);
    setLicense(lic);
    setWarning(lic ? shouldShowExpiryWarning(lic) : false);
  };

  if (!license) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
        📋 No active license. <a href="/license-purchase" className="font-bold underline">Purchase one</a>
      </div>
    );
  }

  const daysLeft = getLicenseRemainingDays(license);

  return (
    <div className={`p-4 rounded border ${warning ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold">
            {license.type.toUpperCase()} License
          </p>
          <p className="text-sm">
            {daysLeft} days remaining
          </p>
        </div>
        {warning && (
          <button
            onClick={() => window.location.href = '/license-purchase'}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Renew
          </button>
        )}
      </div>
    </div>
  );
}
```

### 4. Feature Gating Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { hasFeatureAccess } from '@/lib/licenseUtils';

export function FeatureGate({ feature, children, fallback }: {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      checkAccess();
    }
  }, [session?.user?.id, feature]);

  const checkAccess = async () => {
    try {
      const access = await hasFeatureAccess(session?.user?.id, feature);
      setHasAccess(access);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!hasAccess) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded text-blue-800">
        <p className="font-semibold">Premium Feature</p>
        <p className="text-sm mb-2">This feature requires an active license</p>
        <a href="/license-purchase" className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
          Upgrade
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
```

### 5. Usage in Components

```typescript
import { FeatureGate } from '@/components/FeatureGate';
import { DashboardLicenseStatus } from '@/components/DashboardLicenseStatus';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* License status at top */}
      <DashboardLicenseStatus />

      {/* Protected features */}
      <FeatureGate 
        feature="analytics"
        fallback={<AnalyticsPlaceholder />}
      >
        <AnalyticsModule />
      </FeatureGate>

      <FeatureGate feature="courses">
        <CourseCreator />
      </FeatureGate>
    </div>
  );
}
```

## Integration Examples

### Integration with Admin Dashboard

```typescript
// components/admin/AdminDashboard.tsx
'use client';

import { useSession } from 'next-auth/react';
import LicenseManagement from '@/components/LicenseManagement';

export function AdminDashboard() {
  const { data: session } = useSession();

  if (session?.user?.role !== 'admin') {
    return <div>Access denied</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">License Management</h2>
        <LicenseManagement />
      </section>

      {/* Other admin sections */}
    </div>
  );
}
```

### Integration with Course Creator

```typescript
// components/CourseCreator.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { validateFeatureQuota } from '@/lib/licenseUtils';

export function CourseCreator() {
  const { data: session } = useSession();
  const [courseCount, setCourseCount] = useState(0);
  const [canCreateMore, setCanCreateMore] = useState(false);

  useEffect(() => {
    checkCourseQuota();
  }, [session?.user?.id]);

  const checkCourseQuota = async () => {
    const quota = await validateFeatureQuota(session?.user?.id, 'courses', courseCount);
    setCanCreateMore(quota.allowed);
  };

  const handleCreateCourse = async (courseData: any) => {
    if (!canCreateMore) {
      alert('You have reached your course limit. Upgrade your license to create more.');
      return;
    }

    // Create course...
    setCourseCount(courseCount + 1);
    await checkCourseQuota();
  };

  return (
    <div>
      <div className="p-4 bg-blue-50 rounded mb-4">
        <p>Courses: {courseCount} / {/* show limit */}</p>
      </div>

      <button 
        onClick={() => handleCreateCourse({})}
        disabled={!canCreateMore}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        Create Course
      </button>
    </div>
  );
}
```

### Integration with Settings Page

```typescript
// app/settings/page.tsx
import { DashboardLicenseStatus } from '@/components/DashboardLicenseStatus';
import LicenseManagement from '@/components/LicenseManagement';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">License & Billing</h2>
        <DashboardLicenseStatus />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Team Management</h2>
        <LicenseManagement />
      </section>
    </div>
  );
}
```

## Database Queries for Common Tasks

### Get All Active Licenses

```typescript
const { data: licenses } = await supabase
  .from('licenses')
  .select('*')
  .eq('status', 'active')
  .gt('expires_at', new Date().toISOString());
```

### Get License Statistics

```typescript
const { data: stats } = await supabase
  .from('licenses')
  .select('type, count(*)', { count: 'exact' })
  .group_by('type');
```

### Get All Members of a License

```typescript
const { data: members } = await supabase
  .from('license_members')
  .select(`
    *,
    profiles(id, full_name, email, avatar_url)
  `)
  .eq('license_id', licenseId)
  .order('added_at', { ascending: false });
```

### Get Pending Invitations

```typescript
const { data: invitations } = await supabase
  .from('license_invitations')
  .select('*, licenses(type)')
  .eq('status', 'pending')
  .gt('expires_at', new Date().toISOString());
```

### Find Users with Expiring Licenses

```typescript
const tomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

const { data: expiringLicenses } = await supabase
  .from('licenses')
  .select('*, profiles(email)')
  .eq('status', 'active')
  .gte('expires_at', tomorrow.toISOString())
  .lte('expires_at', nextWeek.toISOString());
```

## Error Handling Examples

```typescript
import { LICENSE_ERRORS } from '@/lib/licenseConfig';

async function handleFeatureAccess(userId: string, feature: string) {
  const license = await getUserLicense(userId);

  if (!license) {
    throw new Error(LICENSE_ERRORS.NO_LICENSE);
  }

  if (!isLicenseActive(license)) {
    throw new Error(LICENSE_ERRORS.INVALID_LICENSE);
  }

  const hasAccess = await hasFeatureAccess(userId, feature);

  if (!hasAccess) {
    throw new Error(LICENSE_ERRORS.LIMIT_EXCEEDED);
  }

  return true;
}
```

## UI Components for Common Actions

### License Status Badge

```typescript
import { License } from '@/types/license';
import { shouldShowExpiryWarning, getLicenseRemainingDays } from '@/lib/licenseUtils';

export function LicenseStatusBadge({ license }: { license: License }) {
  const isWarning = shouldShowExpiryWarning(license);
  const daysLeft = getLicenseRemainingDays(license);

  const bgColor = isWarning ? 'bg-orange-100' : 'bg-green-100';
  const textColor = isWarning ? 'text-orange-800' : 'text-green-800';
  const borderColor = isWarning ? 'border-orange-300' : 'border-green-300';

  return (
    <span className={`${bgColor} ${textColor} px-3 py-1 rounded-full text-sm border ${borderColor}`}>
      {license.type} • {daysLeft}d left
    </span>
  );
}
```

### Member Count Display

```typescript
import { License } from '@/types/license';

export function MemberCountDisplay({ license, members }: {
  license: License;
  members: any[];
}) {
  const percentage = (members.length / license.max_users) * 100;

  return (
    <div>
      <div className="flex justify-between mb-2">
        <p className="text-sm font-semibold">Team Members</p>
        <p className="text-sm text-gray-600">{members.length} / {license.max_users}</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

## Testing the Integration

```bash
# Run license tests
npm test -- __tests__/licensing.test.ts

# Run with coverage
npm test -- __tests__/licensing.test.ts --coverage

# Test payment flow
npm test -- __tests__/licensing.test.ts --testNamePattern="Payment"
```

## Deployment Checklist

- [ ] Database migrations applied in production
- [ ] Stripe API keys configured
- [ ] Webhook endpoint registered in Stripe
- [ ] Environment variables set in `.env.production`
- [ ] License purchase page tested
- [ ] Member management page tested
- [ ] Email invitations working
- [ ] License expiry warnings displayed
- [ ] Feature gating working correctly
- [ ] Stripe webhook handling verified
- [ ] Backup and disaster recovery plan in place
- [ ] License renewal process tested
- [ ] Analytics dashboard prepared

## Monitoring in Production

```typescript
// Add this to your monitoring/logging service
import { trackLicenseUsage } from '@/lib/licenseUtils';

export async function logLicenseEvent(
  userId: string,
  action: string,
  details?: any
) {
  await trackLicenseUsage(userId, action, details);
  
  // Also log to external service
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(`License: ${action}`, 'info', { userId, ...details });
  }
}
```

This integration guide covers the main scenarios. For more specific integrations, refer to the main documentation.
