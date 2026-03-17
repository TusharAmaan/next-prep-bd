# Regional Payments System Documentation

## Overview

The Regional Payments System enables multi-currency, multi-region payment processing with support for local payment methods and compliant tax handling. It supports 7+ countries with region-specific pricing, payment gateways, and regulatory compliance.

## Supported Regions

### South Asia
- **Bangladesh (BD)**
  - Currency: BDT (৳)
  - Payment Methods: bKash, Nagad, Rocket, Stripe, Bank Transfer
  - Tax: 15% VAT
  
- **India (IN)**
  - Currency: INR (₹)
  - Payment Methods: Razorpay, UPI, Stripe, PayPal
  - Tax: 18% GST
  
- **Pakistan (PK)**
  - Currency: PKR (₨)
  - Payment Methods: Easypaisa, JazzCash, Stripe
  - Tax: 17% Sales Tax

### Global & Regional
- **United States (US)** - USD
- **United Kingdom (GB)** - GBP
- **United Arab Emirates (AE)** - AED
- **Singapore (SG)** - SGD

## Supported Payment Gateways

### Mobile Money (Bangladesh)
- **bKash**
  - Fee: 1.5%
  - Max: 100,000 BDT
  - Settlement: 1 day
  
- **Nagad**
  - Fee: 1.5%
  - Max: 200,000 BDT
  - Settlement: 1 day
  
- **Rocket**
  - Fee: 1.5%
  - Max: 50,000 BDT
  - Settlement: 1 day

### India
- **Razorpay**
  - Fee: 2% + ₹0
  - Supports: INR, USD
  - Features: Recurring, Tokenization
  
- **UPI**
  - Fee: 0%
  - Instant processing

### Pakistan
- **Easypaisa** - Fee: 2%
- **JazzCash** - Fee: 2%

### Global
- **Stripe** - Fee: 2.9% + $0.30
- **PayPal** - Fee: 3.4% + $0.30
- **Telr (Middle East)** - Fee: 2.5% + AED 2

## Pricing Strategy

### Regional Pricing Model
Prices are automatically adjusted based on local purchasing power:

```
Personal Plan:
- Bangladesh: ৳999
- India: ₹799
- Pakistan: ₨1,999
- US: $9.99
- UK: £7.99
- UAE: د.إ 35.99
- Singapore: $13.99
```

### Price Calculation
```
Total = Subtotal + Tax + Gateway Fee

Where:
- Subtotal = Base Price × Quantity
- Tax = Subtotal × Regional Tax Rate
- Gateway Fee = (Subtotal × Fee %) + Fixed Fee
```

## Setup Instructions

### 1. Environment Variables

```env
# Regional Payment Configuration
REGIONAL_CURRENCY_AUTO_DETECT=true
EXCHANGE_RATE_API_KEY=your_api_key
EXCHANGE_RATE_UPDATE_INTERVAL=3600

# bKash (Bangladesh)
BKASH_API_URL=https://checkout.sandbox.bka.sh/api/v1.2.0
BKASH_APP_KEY=your_app_key
BKASH_APP_SECRET=your_app_secret
BKASH_MERCHANT_ID=your_merchant_id

# Nagad (Bangladesh)
NAGAD_MERCHANT_ID=your_merchant_id
NAGAD_MERCHANT_KEY=your_merchant_key

# Razorpay (India)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_key_secret

# Other gateways...
```

### 2. Database Setup

Run migrations:
```bash
# Apply regional payments migration
psql $DATABASE_URL < migrations/002_create_regional_payments.sql
```

### 3. Load Exchange Rates

Create a cron job to update exchange rates:

```typescript
// pages/api/cron/update-exchange-rates.ts
import { updateExchangeRates } from '@/lib/exchangeRates';

export default async function handler(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await updateExchangeRates();
  return NextResponse.json({ success: true });
}
```

## API Endpoints

### Get Regional Pricing

```bash
GET /api/payments/regional?country=BD&plan=personal&quantity=1
```

Response:
```json
{
  "plan": "personal",
  "country": "BD",
  "pricing": {
    "originalAmount": 999,
    "originalCurrency": "BDT",
    "total": 1148.85,
    "breakdown": {
      "subtotal": 999,
      "tax": 149.85,
      "gatewayFee": 0,
      "total": 1148.85
    }
  },
  "formattedTotal": "৳1,148.85"
}
```

### Get Available Gateways

```bash
GET /api/payments/regional?country=BD&action=gateways
```

Response:
```json
{
  "country": "BD",
  "availableGateways": [
    "bkash",
    "nagad",
    "rocket",
    "stripe"
  ]
}
```

### Recommend Gateway

```bash
GET /api/payments/regional?country=BD&action=recommend&amount=500
```

Response:
```json
{
  "country": "BD",
  "amount": 500,
  "recommendedGateway": "bkash"
}
```

### Validate Payment Amount

```bash
POST /api/payments/regional
Content-Type: application/json

{
  "countryCode": "BD",
  "amount": 999,
  "gatewayId": "bkash",
  "action": "validate"
}
```

Response:
```json
{
  "valid": true
}
```

### Process Payment

```bash
POST /api/payments/regional
Content-Type: application/json

{
  "countryCode": "BD",
  "amount": 1148.85,
  "gatewayId": "bkash",
  "action": "quote"
}
```

## Component Usage

### Regional Checkout Component

```typescript
import RegionalCheckout from '@/components/RegionalCheckout';

export default function CheckoutPage() {
  return (
    <RegionalCheckout
      licensePlan="team"
      countryCode="BD"
      quantity={1}
      onSuccess={(details) => console.log('Payment successful', details)}
    />
  );
}
```

### Pricing Display Component

```typescript
import RegionalPricingDisplay from '@/components/RegionalPricingDisplay';

export default function PricingPage() {
  return (
    <RegionalPricingDisplay
      countryCode="BD"
      licensePlan="personal"
      showBreakdown={true}
      showTaxInfo={true}
    />
  );
}
```

## Tax Handling

### Tax Calculation

Tax is automatically calculated based on regional configuration:

| Region | Tax Type | Rate |
|--------|----------|------|
| Bangladesh | VAT | 15% |
| India | GST | 18% |
| Pakistan | Sales Tax | 17% |
| UAE | VAT | 5% |
| Singapore | GST | 8% |
| UK | VAT | 20% |

### Tax Compliance

Tax information is:
- Included in final price quote
- Itemized in invoices
- Recorded in payment transactions
- Reported in regional compliance logs

## Fraud Detection

### Risk Assessment

The system checks for:

**Large Transactions**
- BD: Over ৳500,000
- IN: Over ₹100,000
- US: Over $5,000

**Transaction Velocity**
- Max 5 transactions per hour
- Max 50 transactions per day
- Max 3 different cards per day

**Daily Limits**
- BD: ৳2,000,000
- IN: ₹500,000
- US: $50,000

### Risk Levels

- **Low**: Normal transaction pattern
- **Medium**: Some anomalies detected (additional verification may be required)
- **High**: Multiple risk factors (manual review recommended)

## Regional Compliance

### Required Data Residency

- Bangladesh: Data must be stored in BD
- India: RBI guidelines for data localization
- EU countries: GDPR compliance required
- All: Regular compliance audit logs

### KYC/AML Requirements

```typescript
const requirements = {
  BD: ['NID', 'TIN'],
  IN: ['PAN', 'GSTIN', 'AADHAR'],
  PK: ['CNIC', 'NTN'],
  US: ['SSN', 'DL'],
  GB: ['Passport', 'Proof of Address'],
};
```

## Settlement & Payouts

### Settlement Cycles

| Gateway | Cycle | Min Amount |
|---------|-------|-----------|
| bKash | 1 day | ৳1,000 |
| Nagad | 1 day | ৳1,000 |
| Razorpay | 1 day | ₹10,000 |
| Stripe | 1 day | $10 |

### Settlement Process

1. Transactions are batched daily
2. Fees are deducted
3. Refunds are offset
4. Net amount is settled to merchant account
5. Settlement confirmation is logged

## Exchange Rates

### Rate Management

Exchange rates are:
- Updated hourly via external API
- Cached for 1 hour
- Logged with timestamp
- Used for USD conversion only

```typescript
// Get cached rates
const rates = await getExchangeRates();

// Convert currency
const usdAmount = convertCurrency(999, 'BDT', 'USD');
```

### Rate API Integration

Supported providers:
- Open Exchange Rates
- XE.com API
- OANDA
- Fixer.io

## Security

### Payment Data Security

- All sensitive data encrypted in transit (TLS 1.3+)
- API keys stored in environment variables
- Webhook signatures verified
- PCI DSS compliance for credit cards
- Tokenization for recurring payments

### Fraud Prevention

- Rate limiting on payment endpoints
- IP geolocation checks
- 3D Secure for card payments
- Device fingerprinting available
- Anomaly detection logging

## Troubleshooting

### Common Issues

**No payment methods showing**
- Check country code is correct
- Verify gateways are configured
- Check API credentials

**Incorrect pricing**
- Verify exchange rates are updated
- Check tax rates in regional settings
- Confirm currency configuration

**Payment declined**
- Check fraud risk level
- Verify amount within limits
- Confirm KYC requirements met

**Webhook not received**
- Verify webhook URL is accessible
- Check signature secret is correct
- Review gateway webhook settings

## Analytics & Reporting

### Transaction Analytics

```typescript
// Total revenue by country
const byCountry = await supabase
  .from('payment_transactions')
  .select('country_code, sum(amount_in_usd)')
  .group_by('country_code');

// Gateway performance
const byGateway = await supabase
  .from('payment_transactions')
  .select('gateway_name, count(*), avg(amount_in_usd)')
  .group_by('gateway_name');

// Success rate by region
const successRate = await supabase
  .from('payment_transactions')
  .select('country_code, status, count(*)')
  .group_by('country_code', 'status');
```

## Testing

### Test Cards

**bKash Test Account**
- Number: 01XXXXXXXXX (17 digits)
- PIN: 1234

**Razorpay Test Cards**
- Visa: 4111 1111 1111 1111
- Mastercard: 5105 1051 0510 5100

**Stripe Test**
- Card: 4242 4242 4242 4242
- CVC: Any 3 digits

## Performance

- Pricing calculation: < 50ms
- Gateway availability check: < 100ms
- Exchange rate lookup: < 30ms
- Payment processing: < 2s (depending on gateway)
- Settlement: Same day or next day

## Support & Monitoring

### Key Metrics

- Payment success rate
- Average processing time
- Gateway uptime
- Error rate by gateway
- Revenue by region

### Alerts

- Failed payment batches
- Gateway downtime
- Unusual fraud flags
- Settlement discrepancies
- Compliance violations

## Future Enhancements

- Cryptocurrency payments (if applicable)
- More local payment methods
- AI-based fraud detection
- Automated compliance reporting
- Multi-currency wallets
- Subscription management
- Invoicing system
