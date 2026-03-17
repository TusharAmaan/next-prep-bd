# Multi-User Licensing System Documentation

## Overview

This is a complete multi-user licensing system for Next.js applications built with Supabase and Stripe. It supports three license tiers with different feature sets, pricing models, and user capacity levels.

## System Architecture

### Components

1. **License Types**
   - **Personal**: Single user, basic features, ৳999/month
   - **Team**: Up to 5 users, advanced features, analytics, ৳4,999/month
   - **Institution**: Up to 100 users, unlimited features, SSO, custom branding, ৳49,999/month

2. **Database Schema**
   - `licenses`: Main license records
   - `license_members`: Users within a license
   - `license_invitations`: Pending member invitations
   - `profiles`: Extended user profiles with license info

3. **API Endpoints**
   - `/api/licenses/manage`: License and member management
   - `/api/licenses/payment`: Stripe payment processing
   - `/api/licenses/webhooks/stripe`: Webhook handling

4. **Components**
   - `LicensePurchase`: License purchase UI
   - `LicenseManagement`: Team member management UI

## Setup Instructions

### 1. Prerequisites

```bash
npm install stripe @stripe/react-stripe-js stripe-js
npm install next-auth @supabase/supabase-js
```

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the migration:
   ```bash
   cat migrations/001_create_licensing_system.sql | psql $DATABASE_URL
   ```
   Or paste the contents of `migrations/001_create_licensing_system.sql` into Supabase SQL Editor

3. Enable RLS (Row Level Security) for all licensing tables
4. Set up authentication

### 3. Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Create products for each license type:
   - Product: Personal License
   - Product: Team License
   - Product: Institution License
3. Create recurring price plans for each (monthly billing)
4. Get your API keys from Settings > API Keys
5. Set up webhook endpoint:
   - URL: `https://yourdomain.com/api/licenses/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`

### 4. Environment Variables

Copy `.env.example-licensing` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
STRIPE_PUBLIC_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=your_domain
```

### 5. Update NextAuth Configuration

If using NextAuth, ensure your session includes user ID:

```typescript
// pages/api/auth/[...nextauth].ts
callbacks: {
  jwt: async ({ token, user }) => {
    if (user) {
      token.sub = user.id; // Ensure user ID is in token
    }
    return token;
  },
}
```

## Feature Usage

### For End Users

#### Purchase a License
1. Navigate to `/license-purchase`
2. Select desired plan
3. Complete Stripe checkout
4. License automatically activated

#### Manage Team Members
1. Go to license management page (e.g., `/license-management`)
2. Invite team members by email
3. Remove members as needed
4. Track usage and remaining seats

### For Developers

#### Check License Status

```typescript
import { getUserLicense, isLicenseActive } from '@/lib/licenseUtils';

const license = await getUserLicense(userId);
if (license && isLicenseActive(license)) {
  // User has valid license
}
```

#### Check Feature Access

```typescript
import { hasFeatureAccess, validateFeatureQuota } from '@/lib/licenseUtils';

const hasAccess = await hasFeatureAccess(userId, 'courses');

// With quota checking
const quota = await validateFeatureQuota(userId, 'courses', currentUsageCount);
if (quota.allowed) {
  // User can use feature
  console.log(`${quota.remaining} uses remaining`);
}
```

#### Get License Information

```typescript
import { getLicenseMembers, getUserLicense } from '@/lib/licenseUtils';

const license = await getUserLicense(userId);
const members = await getLicenseMembers(license.id);
```

#### Track License Usage

```typescript
import { trackLicenseUsage } from '@/lib/licenseUtils';

await trackLicenseUsage(userId, 'course_created', {
  courseId: 'xyz',
  title: 'My Course'
});
```

## API Reference

### GET /api/licenses/manage

**Parameters:**
- `userId` (required): User ID
- `action` (optional): 'list' or 'my-license'

**Example:**
```bash
GET /api/licenses/manage?userId=123&action=my-license
```

**Response:**
```json
{
  "license": {
    "id": "lic_123",
    "type": "team",
    "max_users": 5,
    "status": "active",
    "expires_at": "2024-12-31T23:59:59Z"
  },
  "members": [...]
}
```

### POST /api/licenses/manage

**Actions:**

#### Purchase
```json
{
  "userId": "123",
  "action": "purchase",
  "licenseType": "team"
}
```

#### Add Member
```json
{
  "userId": "123",
  "action": "add-member",
  "email": "user@example.com"
}
```

#### Remove Member
```json
{
  "userId": "123",
  "action": "remove-member",
  "memberId": "mem_123"
}
```

#### Accept Invitation
```json
{
  "userId": "456",
  "action": "accept-invitation",
  "invitationId": "inv_123"
}
```

### POST /api/licenses/payment

**Actions:**

#### Create Checkout
```json
{
  "userId": "123",
  "licenseType": "team",
  "action": "create-checkout"
}
```

#### Retrieve Session
```json
{
  "sessionId": "cs_test_...",
  "action": "retrieve-session"
}
```

## Database Schema

### licenses table
- `id`: UUID (Primary Key)
- `owner_id`: UUID (FK to auth.users)
- `type`: VARCHAR (personal, team, institution)
- `max_users`: INTEGER
- `status`: VARCHAR (active, suspended, expired)
- `stripe_subscription_id`: VARCHAR
- `purchased_at`: TIMESTAMP
- `expires_at`: TIMESTAMP
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### license_members table
- `id`: UUID (Primary Key)
- `license_id`: UUID (FK to licenses)
- `user_id`: UUID (FK to auth.users)
- `role`: VARCHAR (admin, member)
- `added_at`: TIMESTAMP

### license_invitations table
- `id`: UUID (Primary Key)
- `license_id`: UUID (FK to licenses)
- `invited_email`: VARCHAR
- `status`: VARCHAR (pending, accepted, rejected)
- `invited_by`: UUID (FK to auth.users)
- `created_at`: TIMESTAMP
- `expires_at`: TIMESTAMP

## Security Considerations

1. **Row Level Security (RLS)**
   - All tables have RLS enabled
   - Users can only see their own licenses and licenses they're members of
   - Only license owners can manage members

2. **Webhook Verification**
   - Stripe webhook signatures verified using secret key
   - Webhook endpoint should be publicly accessible but rate-limited

3. **API Authentication**
   - All endpoints should verify user authentication
   - userId parameter should match authenticated user
   - Consider adding middleware to verify ownership

## Customization

### Adding New License Types

1. Update `LICENSE_CONFIG.TYPES` in `licenseConfig.ts`
2. Add features in `LICENSE_CONFIG.FEATURES`
3. Update pricing in `LICENSE_CONFIG.PRICING`
4. Add feature access in `FEATURE_ACCESS`
5. Create Stripe product and price
6. Update database migration if needed

### Modifying Pricing

Edit prices in `licenseConfig.ts`:
```typescript
PRICING: {
  personal: 1499,  // New price in BDT
  team: 5999,
  institution: 59999,
}
```

Then update Stripe prices to match.

### Changing Billing Cycle

```typescript
BILLING_CYCLE: 7,  // Change to 7 days for weekly billing
```

## Monitoring & Maintenance

### Key Metrics to Track

1. Active licenses by type
2. Member churn rate
3. Failed payment attempts
4. License upgrade/downgrade rate
5. Trial conversion rate

### Regular Tasks

1. **Monthly**: Review subscription metrics
2. **Weekly**: Check webhook delivery status
3. **Daily**: Monitor payment failures
4. **Quarterly**: Review pricing strategy

## Troubleshooting

### License Not Appearing After Purchase

1. Check Stripe webhook delivery logs
2. Verify `stripe_subscription_id` is saved to database
3. Check license status (should be 'active')
4. Ensure `expires_at` is in future

### Members Not Showing

1. Verify license membership query permissions
2. Check RLS policies on `license_members` table
3. Ensure user has logged in since membership was added

### Stripe Checkout Not Working

1. Verify Stripe keys are correct
2. Check that products exist in Stripe
3. Verify webhook secret is correct
4. Check browser console for client-side errors

## Advanced Features (Future Enhancements)

- [ ] License usage analytics dashboard
- [ ] Custom invoicing and billing
- [ ] License transfer/migration
- [ ] Volume discounts for institutions
- [ ] Integration with popular payment gateways (bKash, Nagad)
- [ ] Automated license renewal reminders
- [ ] Multi-currency support
- [ ] License sharing/delegation

## Support

For issues or questions:
1. Check this documentation
2. Review API response errors
3. Check Supabase dashboard logs
4. Check Stripe dashboard for webhook errors
5. Review browser console for client-side errors

## License

This licensing system is part of the Next-Prep-BD application.
