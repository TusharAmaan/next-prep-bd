# Affiliate Program System Documentation

## Overview

The Affiliate Program is a referral-based commission system that incentivizes users to refer others to purchase licenses. The system features tiered commissions, seasonal bonuses, milestone rewards, and fraud detection to protect against abuse.

**Key Features:**
- 4 commission tiers (Bronze → Platinum) with increasing percentages (20% → 35%)
- Seasonal bonuses (June-Aug +10%, Nov +15%, Dec +20%)
- Milestone bonuses (+৳10k to +৳500k based on referral count)
- 7-day commission hold period to prevent chargeback fraud
- Monthly payouts on the 15th (minimum ৳5,000)
- 30-day referral cookie window for click tracking
- Multi-factor fraud scoring system
- Real-time leaderboard with weekly/monthly/all-time periods
- Geographic tracking and device fingerprinting

---

## Architecture

### Database Schema

**Core Tables:**

1. **`affiliates`** - Affiliate accounts and statistics
   - `id`: UUID primary key
   - `user_id`: Reference to auth.users (unique)
   - `referral_code`: 8-character unique referral code
   - `tier`: Current tier (bronze/silver/gold/platinum)
   - `status`: Account status (active/suspended/flagged)
   - `total_referrals`: Count of successful referrals
   - `total_earnings`: Total commission earned
   - `pending_earnings`: Available for immediate payout
   - `paid_earnings`: Already paid out
   - `held_earnings`: Currently in 7-day hold period
   - `fraud_score`: 0-100 fraud risk score
   - Indexes: user_id, referral_code, tier, total_earnings

2. **`referral_clicks`** - Track individual link clicks
   - `id`: UUID primary key
   - `affiliate_id`: Reference to affiliates
   - `referral_code`: Copied from affiliate for quick lookup
   - `cookie_token`: 64-char unique identifier
   - `cookie_expires_at`: 30 days from click
   - `ip_address`: INET type for CIDR queries
   - `device_type`: mobile/desktop/tablet
   - `browser_type`: Chrome, Firefox, Safari, etc.
   - Indexes: affiliate_id, referral_code, cookie_token, clicked_at

3. **`referrals`** - Converted referral clicks
   - `id`: UUID primary key
   - `affiliate_id`: Reference to affiliates
   - `referred_user_id`: Reference to auth.users
   - `click_id`: Optional reference to referral_clicks
   - `license_id`: Which license was purchased
   - `status`: active/chargeback/refunded/cancelled
   - `eligible_for_commission`: Boolean flag (can be set to false for fraud)
   - Indexes: affiliate_id, referred_user_id, status

4. **`commissions`** - Individual commission records
   - `id`: UUID primary key
   - `affiliate_id`: Reference to affiliates
   - `referral_id`: Reference to referrals
   - `commission_amount`: Base commission (% of license)
   - `commission_percentage`: The % used (20-35%)
   - `tier_at_time`: Tier at commission creation (for audit)
   - `status`: held/released/pending/paid/cancelled
   - `hold_until`: When 7-day hold expires
   - `seasonal_bonus_percentage`: Extra % applied
   - `milestone_bonus_amount`: Extra fixed amount
   - `total_amount_with_bonuses`: Final payout amount
   - Indexes: affiliate_id, status, hold_until, created_at

5. **`payouts`** - Monthly payout records
   - `id`: UUID primary key
   - `affiliate_id`: Reference to affiliates
   - `payout_amount`: Total amount paid
   - `payout_method`: bank_transfer/bkash/nagad/rocket/stripe
   - `payout_month`: 'YYYY-MM' format
   - `status`: pending/processing/completed/failed/cancelled
   - `commission_ids`: UUID[] array of included commissions
   - `gateway_transaction_id`: Receipt from payment gateway
   - Indexes: affiliate_id, status, payout_month

6. **`fraud_detection_logs`** - Fraud scoring audit trail
   - `id`: UUID primary key
   - `affiliate_id`: Reference to affiliates
   - `fraud_type`: high_refund_rate, high_chargeback_rate, suspicious_traffic, etc.
   - `fraud_score`: Points added (0-100 scale)
   - `suspicious_data`: JSONB with detected anomalies
   - `resolved`: Whether issue was investigated
   - Indexes: affiliate_id, fraud_type, resolved

### Row-Level Security (RLS)

- **affiliates**: Users see only their own profile
- **referral_clicks**: Affiliates see their own clicks
- **referrals**: Affiliates see their referrals; referred users see their referral record
- **commissions**: Affiliates see their own commissions
- **payouts**: Affiliates see their own payouts
- **fraud_detection_logs**: Admins only

### Automated Triggers

1. **`update_affiliate_stats_on_commission`**
   - When commission created: increment total_earnings, held_earnings

2. **`release_held_commission`**
   - When commission status changes to 'released': move from held to pending

3. **`update_affiliate_tier`**
   - After new referral: recalculate tier based on active referral count
   - Tier progression: 10+ refs (Silver), 50+ (Gold), 200+ (Platinum)

4. **`update_affiliate_fraud_score`**
   - After fraud log created: recalculate total fraud score and update status

---

## Commission Tiers

| Tier | % Rate | Referrals* | Monthly Bonus | Eligible Kickback | Benefits |
|------|--------|-----------|--------------|-------------------|----------|
| **Bronze** | 20% | 1+ | — | — | Base program member |
| **Silver** | 25% | 10+ | ৳5,000 | ৳500/ref | +5% commission |
| **Gold** | 30% | 50+ | ৳15,000 | ৳1,000/ref | +10% commission, badge |
| **Platinum** | 35% | 200+ | ৳50,000 | ৳2,000/ref | +15% commission, white-glove support |

*Referrals = Active (non-refunded, non-chargeback) referral count

### Tier Progression

Tiers are **automatically upgraded** based on total active referral count:

```
1-9 referrals → Bronze (20%)
10-49 referrals → Silver (25%)
50-199 referrals → Gold (30%)
200+ referrals → Platinum (35%)
```

- Tier updates trigger 1-2 days after referral threshold crossed
- Downgrade happens if active referrals drop (e.g., refund lowers count below threshold)
- Tier changes are tracked in `tier_updated_at` and `tier_at_time` fields

---

## Commission Calculation

### Base Formula

```
Commission = License Price × Commission Percentage (tier-based)
```

### Example Scenarios

**Scenario 1: Silver tier affiliate, Personal license (৳9,999)**
```
Commission = ৳9,999 × 0.25 = ৳2,499.75
```

**Scenario 2: Gold tier, June (seasonal +10%)**
```
License Price = ৳49,999
Commission % = 0.30
Seasonal Bonus = +0.10
Total Rate = 0.30 + 0.10 = 0.40
Commission = ৳49,999 × 0.40 = ৳19,999.60
```

**Scenario 3: Platinum tier with milestone bonus (100 referrals)**
```
Base Commission = ৳99,999 × 0.35 = ৳34,999.65
Seasonal Bonus (None) = 0
Milestone Bonus (100 refs) = ৳100,000
Total = ৳34,999.65 + ৳100,000 = ৳134,999.65
```

### Hold Period

All commissions enter "held" status for **7 days**:

```
Commission Created:    2024-01-10 14:30 UTC
Hold Until:           2024-01-17 14:30 UTC
Released To Pending:  2024-01-17 14:31 UTC (automatic)
```

The hold period protects against chargeback fraud (average chargeback window = 120 days, but most occur within 7 days).

### Seasonal Bonuses

Applied automatically when commission is created:

```
January:    × 1.00 (no bonus)
February:   × 1.00 (no bonus)
March:      × 1.00 (no bonus)
April:      × 1.00 (no bonus)
May:        × 1.00 (no bonus)
June:       × 1.10 (+10% bonus)
July:       × 1.10 (+10% bonus)
August:     × 1.10 (+10% bonus)
September:  × 1.00 (no bonus)
October:    × 1.00 (no bonus)
November:   × 1.15 (+15% bonus)
December:   × 1.20 (+20% bonus)
```

### Milestone Bonuses

One-time bonuses triggered when referral count reaches thresholds:

| Threshold | Bonus | Frequency |
|-----------|-------|-----------|
| 10 referrals | ৳10,000 | Once |
| 50 referrals | ৳50,000 | Once |
| 100 referrals | ৳100,000 | Once |
| 500 referrals | ৳500,000 | Once |

Milestone bonus is applied to the commission that crosses the threshold:

```
Affiliate reaches 100th referral with ৳50,000 license
Base Commission = ৳50,000 × 0.30 = ৳15,000
Milestone Bonus (100 ref threshold) = ৳100,000
Total = ৳115,000
```

---

## Referral Flow

### 1. Affiliate Signup

```bash
POST /api/affiliate/manage
Content-Type: application/json

{
  "userId": "user-uuid",
  "action": "create-account"
}
```

**Response:**
```json
{
  "affiliate": {
    "id": "affiliate-uuid",
    "user_id": "user-uuid",
    "referral_code": "ABC12DEF",
    "tier": "bronze",
    "status": "active"
  },
  "referral_link": "https://nextprepbd.com?ref=ABC12DEF"
}
```

### 2. Affiliate Gets Referral Link

Two methods:

**Method A: Standard Link**
```
https://nextprepbd.com?ref=ABC12DEF
```

**Method B: Generate Custom Link**
```bash
POST /api/affiliate/manage
{
  "userId": "user-uuid",
  "action": "generate-link",
  "customPath": "/signup?source=referral"
}
```

### 3. Referral Click Tracking

When user visits referral link:

1. Frontend captures click metadata (IP, user-agent, device, source)
2. Creates `cookie_token` and sets it for 30 days
3. Records in `referral_clicks` table
4. Sets session: `affiliate_code: ABC12DEF`

```javascript
// Frontend code example
async function trackReferralClick(code) {
  const metadata = {
    ip_address: userIP,
    user_agent: navigator.userAgent,
    device_type: detectDevice(),
    browser_type: detectBrowser(),
    source_url: document.referrer
  };
  
  const res = await fetch('/api/referral/track', {
    method: 'POST',
    body: JSON.stringify({ code, ...metadata })
  });
}
```

### 4. Conversion (User Signs Up/Purchases)

When user completes signup with referral code in session:

```bash
POST /api/affiliate/manage
{
  "action": "create-referral",
  "referredUserId": "new-user-uuid",
  "affiliateCode": "ABC12DEF",
  "licenseType": "personal",
  "licenseId": "license-uuid"
}
```

**Validation:**
- Referral code exists and NOT suspended/flagged
- User not self-referral (affiliate_id != referred_user_id)
- Click occurred within 30 days
- No duplicate referral for same user

### 5. Commission Created

```bash
POST /api/affiliate/manage
{
  "action": "record-commission",
  "referralId": "referral-uuid",
  "licensePrice": 9999,
  "currency": "BDT"
}
```

- Commission enters "held" status
- Hold timer set to now + 7 days
- `held_earnings` incremented
- Fraud detection runs (on every commission record)

### 6. Commission Released

After 7-day hold expires:

- Cron job runs `/api/affiliate/manage` with `action=release-held`
- Commission status changes to "released"
- Amount moves from `held_earnings` to `pending_earnings`
- Available for next monthly payout cycle

### 7. Monthly Payout

On 15th of each month:

```bash
POST /api/affiliate/manage
{
  "action": "request-payout",
  "affiliateId": "affiliate-uuid",
  "payoutMethod": "bkash",
  "paymentAccount": "01XXXXXXXXX"
}
```

**Validation:**
- Minimum ৳5,000 available
- Status is "active" (not suspended/flagged)
- No active chargebacks under investigation

**Process:**
1. Aggregate all "released" commissions for this month
2. Create `payouts` record with status "pending"
3. Call payment gateway (Stripe/bKash/etc.)
4. On success: status → "processing"
5. On settlement: status → "completed", set `completed_at`
6. Update affiliate: `paid_earnings` += payout_amount

---

## Fraud Detection

### Four-Factor Scoring System

**Factor 1: Refund Rate**
```
Active Referrals = 10
Refunded Referrals = 3
Refund Rate = 3/10 = 30%

If >= 50%: +30 fraud points
If 30-50%:  +10 fraud points
If < 30%:   +0 fraud points
```

**Factor 2: Chargeback Rate**
```
Chargebacks = 2
Active Referrals = 10
Chargeback Rate = 2/10 = 20%

If >= 5 chargebacks: +40 fraud points
If 3-5 chargebacks:  +20 fraud points
If < 3 chargebacks:  +0 fraud points
```

**Factor 3: Invalid Traffic**
```
Clicks = 100
Referrals = 5
Conversion Rate = 5/100 = 5%

If < 0.5%: +15 fraud points (spam detection)
If 0.5-1%: +5 fraud points
If > 1%:   +0 fraud points
```

**Factor 4: Velocity Abuse**
```
Clicks in Last Hour = 50
Referrals Completed Today = 20

If 50+ clicks/hour: +25 fraud points (click spam)
If 10+ refs/day:    +15 fraud points (velocity spike)
```

### Fraud Score Thresholds

```
0-30:   Green (No action)
31-50:  Yellow (Flagged - manual review queue)
51-70:  Orange (Suspended - payouts blocked, pending review)
71+:    Red (Terminated - account banned)
```

### Fraud Resolution

When flagged affiliate disputes or provides explanation:

```json
{
  "fraud_log_id": "log-uuid",
  "resolution_notes": "Valid traffic from blog referral",
  "action": "cleared"  // New status: active
}
```

Clears fraud points if legitimate reason verified.

---

## API Endpoints

### GET /api/affiliate/manage

**Fetch affiliate profile and statistics**

```bash
curl "https://nextprepbd.com/api/affiliate/manage?userId=user-uuid&action=profile"
```

**Response:**
```json
{
  "profile": {
    "id": "affiliate-uuid",
    "referral_code": "ABC12DEF",
    "tier": "gold",
    "status": "active",
    "total_referrals": 75,
    "total_earnings": 187500,
    "created_at": "2024-01-01T10:00:00Z"
  },
  "stats": {
    "totalClicks": 1500,
    "totalReferrals": 75,
    "purchasedReferrals": 75,
    "conversionRate": 5.0,
    "ctr": 15.8,  // Click-through rate
    "epc": 125.0  // Earnings per click
  },
  "earnings": {
    "total": 187500,
    "pending": 45000,
    "paid": 142500,
    "available": 45000
  }
}
```

**Parameters:**
- `userId` (required): UUID of authenticated user
- `action=profile` (required)

---

**Fetch leaderboard**

```bash
curl "https://nextprepbd.com/api/affiliate/manage?action=top-affiliates&period=month&limit=10"
```

**Response:**
```json
{
  "affiliates": [
    {
      "rank": 1,
      "id": "affiliate-uuid",
      "user_name": "John Doe",
      "tier": "platinum",
      "total_earnings": 1250000,
      "total_referrals": 450
    },
    {
      "rank": 2,
      "id": "affiliate-uuid",
      "user_name": "Jane Smith",
      "tier": "gold",
      "total_earnings": 945000,
      "total_referrals": 315
    }
  ]
}
```

**Parameters:**
- `action=top-affiliates` (required)
- `period`: week | month | all-time (default: month)
- `limit`: 1-100 (default: 10)

---

### POST /api/affiliate/manage

**Create affiliate account**

```bash
curl -X POST "https://nextprepbd.com/api/affiliate/manage" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "action": "create-account"
  }'
```

**Response:**
```json
{
  "affiliate": {
    "id": "affiliate-uuid",
    "referral_code": "ABC12DEF",
    "tier": "bronze",
    "status": "active"
  },
  "referral_link": "https://nextprepbd.com?ref=ABC12DEF"
}
```

**Errors:**
- `400`: Missing userId
- `409`: User already an affiliate
- `500`: Database error

---

**Record referral conversion**

```bash
curl -X POST "https://nextprepbd.com/api/affiliate/manage" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create-referral",
    "affiliateCode": "ABC12DEF",
    "referredUserId": "new-user-uuid",
    "licenseType": "personal",
    "licenseId": "license-uuid"
  }'
```

**Response:**
```json
{
  "referral": {
    "id": "referral-uuid",
    "affiliate_id": "affiliate-uuid",
    "referred_user_id": "new-user-uuid",
    "status": "active"
  },
  "commission": {
    "id": "commission-uuid",
    "amount": 2499.75,
    "status": "held",
    "hold_until": "2024-01-17T14:30:00Z"
  }
}
```

**Errors:**
- `400`: Invalid affiliate code, self-referral detected
- `404`: Affiliate not found
- `409`: User already referred by this affiliate

---

**Request payout**

```bash
curl -X POST "https://nextprepbd.com/api/affiliate/manage" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "action": "request-payout",
    "payoutMethod": "bkash",
    "paymentAccount": "01XXXXXXXXX"
  }'
```

**Response:**
```json
{
  "payout": {
    "id": "payout-uuid",
    "amount": 125000,
    "status": "pending",
    "payout_month": "2024-01",
    "requested_at": "2024-01-15T14:30:00Z"
  }
}
```

**Validation:**
- Minimum available: ৳5,000
- Affiliate status: active (not flagged/suspended)
- No active fraud investigations

**Errors:**
- `400`: Insufficient balance, invalid account
- `403`: Account suspended due to fraud
- `404`: Affiliate not found

---

**Generate/update referral links**

```bash
curl -X POST "https://nextprepbd.com/api/affiliate/manage" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "action": "generate-link",
    "linkType": "custom",
    "customPath": "/resources/python-course"
  }'
```

**Response:**
```json
{
  "standardLink": "https://nextprepbd.com?ref=ABC12DEF",
  "customLink": "https://nextprepbd.com/resources/python-course?ref=ABC12DEF"
}
```

---

## Components

### AffiliateDashboard

Main affiliate interface showing profile, earnings, and referral links.

**Props:**
```typescript
interface AffiliateDashboardProps {
  userId: string;
}
```

**Features:**
- Real-time earnings display (total/pending/paid)
- Tier badge with next milestone
- One-click copy referral links
- Payout request button (enabled if balance ≥ ৳5,000)
- Tabs: Overview, Referral Links, Marketing Materials, Settings

**Example Usage:**
```typescript
import AffiliateDashboard from '@/components/AffiliateDashboard';

export default function Page() {
  return <AffiliateDashboard />;
}
```

---

### AffiliateLeaderboard

Real-time leaderboard showing top performers.

**Features:**
- Period selector (Week/Month/All-Time)
- Tier badges with color coding
- Medal icons for top 3
- Commission tier comparison table
- Explanatory footer

**Example Usage:**
```typescript
import AffiliateLeaderboard from '@/components/AffiliateLeaderboard';

export default function Page() {
  return <AffiliateLeaderboard />;
}
```

---

## Setup Instructions

### 1. Database Migration

Run the migration file to create all tables, indexes, and RLS policies:

```bash
# Using psql
psql $DATABASE_URL < migrations/003_create_affiliate_system.sql

# Or run in Supabase dashboard (SQL Editor)
```

Verify tables created:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema='public' AND table_name LIKE '%affiliate%' 
OR table_name IN ('referrals', 'commissions', 'payouts', 'fraud_detection_logs');
```

### 2. Environment Variables

Add to `.env.local`:

```
# Affiliate Config (optional - uses defaults in config file)
NEXT_PUBLIC_AFFILIATE_COMMISSION_HOLD_DAYS=7
NEXT_PUBLIC_AFFILIATE_MIN_PAYOUT=5000
NEXT_PUBLIC_AFFILIATE_PAYOUT_DAY=15

# Existing vars (reuse for affiliate)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Payout methods (if not using Stripe default)
# BKASH_API_KEY=...
# NAGAD_API_KEY=...
```

### 3. Routes Setup

Mount routes in app:

```typescript
// app/affiliate/page.tsx
import AffiliateDashboard from '@/components/AffiliateDashboard';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function Page() {
  const session = await auth();
  if (!session) redirect('/login');
  
  return <AffiliateDashboard />;
}

// app/affiliate/leaderboard/page.tsx
import AffiliateLeaderboard from '@/components/AffiliateLeaderboard';

export default function Page() {
  return <AffiliateLeaderboard />;
}
```

### 4. Referral Tracking (Frontend Integration)

Add tracking to referral link click:

```typescript
// hooks/useReferralTracking.ts
export function useReferralTracking() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('ref');
    
    if (code) {
      // Store in session storage (30-day cookie in backend)
      sessionStorage.setItem('affiliate_code', code);
      
      // Track click
      fetch('/api/referral/track', {
        method: 'POST',
        body: JSON.stringify({
          code,
          ip: await getClientIP(),
          userAgent: navigator.userAgent,
          source: document.referrer
        })
      });
    }
  }, []);
}
```

### 5. Payout Processing (Server Cron)

Set up daily payout release:

```typescript
// app/api/cron/release-commissions/route.ts
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: Request) {
  // Verify cron secret
  if (req.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Release commissions where hold_until <= now
  const { data, error } = await supabase
    .from('commissions')
    .update({ status: 'released', released_at: new Date().toISOString() })
    .eq('status', 'held')
    .lte('hold_until', new Date().toISOString());

  return Response.json({ 
    released: data?.length || 0,
    error: error?.message 
  });
}
```

Then configure with Vercel Cron or third-party service:

```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/release-commissions",
    "schedule": "0 * * * *"
  }]
}
```

---

## Testing

### Unit Tests - Commission Calculation

```typescript
test('Silver tier: 25% of ৳10,000', () => {
  const commission = calculateCommission(10000, 'silver');
  expect(commission).toBe(2500);
});

test('Platinum + Seasonal Bonus (December): +20%', () => {
  const commission = calculateCommission(
    10000, 
    'platinum',
    '2024-12-15'
  );
  expect(commission).toBe(10000 * 0.35 * 1.20); // 4200
});

test('Milestone Bonus: 100 refs = +৳100k', () => {
  const milestone = getMilestoneBonus(100);
  expect(milestone).toBe(100000);
});
```

### Integration Tests - Referral Flow

```typescript
test('Create referral from click', async () => {
  // 1. Create affiliate
  const affiliate = await createAffiliateAccount(userId);
  
  // 2. Record click
  await recordReferralClick(affiliate.referral_code);
  
  // 3. Create referral
  const referral = await createReferral(
    affiliate.referral_code,
    newUserId,
    'personal'
  );
  
  expect(referral.status).toBe('active');
  expect(referral.eligible_for_commission).toBe(true);
});

test('Fraud detection: 50% refund rate', async () => {
  // Create 10 referrals, 5 refunded
  const fraudScore = await checkFraudRisk(affiliateId);
  expect(fraudScore).toBe(30); // High refund rate
});
```

---

## Troubleshooting

### Affiliate account not showing up

**Check:**
1. RLS policy on `affiliates` table allows SELECT for auth.uid()
2. User is authenticated (auth.uid() is not null)
3. Record exists in `affiliates` with correct user_id

```sql
SELECT * FROM affiliates WHERE user_id = 'user-uuid';
```

### Commission not releasing after 7 days

**Check:**
1. Verify cron job is running
2. Check `commissions` table for records with `status='held'`
3. Verify `hold_until` timestamp is in past

```sql
SELECT id, status, hold_until, NOW() 
FROM commissions 
WHERE hold_until < NOW() AND status = 'held';
```

### Payout minimum not met

**Check:**
```sql
SELECT 
  a.id,
  a.pending_earnings,
  a.held_earnings,
  (a.pending_earnings + a.held_earnings) as available
FROM affiliates a
WHERE user_id = 'user-uuid';
```

Need pending + held earnings ≥ ৳5,000

### Fraud score stuck high

**Check:**
1. Verify fraud_detection_logs for unresolved issues
2. Manually correct if false positive

```sql
-- Clear fraud score (admin only)
UPDATE affiliates
SET fraud_score = 0, status = 'active'
WHERE id = 'affiliate-uuid';

UPDATE fraud_detection_logs
SET resolved = TRUE, resolution_notes = 'False positive - manual review'
WHERE affiliate_id = 'affiliate_uuid' AND resolved = FALSE;
```

---

## Support & Contact

- Email: support@nextprepbd.com
- Documentation: https://docs.nextprepbd.com/affiliate
- Status Page: https://status.nextprepbd.com
