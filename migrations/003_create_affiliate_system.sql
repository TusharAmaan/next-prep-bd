-- Create affiliate system tables
-- Tables: affiliates, referrals, commissions, payouts, fraud_detection_logs

-- Affiliates table: Core affiliate information
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code VARCHAR(8) NOT NULL UNIQUE,
  tier VARCHAR(50) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'flagged')),
  
  -- Core stats
  total_referrals INT DEFAULT 0,
  total_earnings NUMERIC(12, 2) DEFAULT 0,
  total_clicks INT DEFAULT 0,
  
  -- Earnings breakdown
  pending_earnings NUMERIC(12, 2) DEFAULT 0,
  paid_earnings NUMERIC(12, 2) DEFAULT 0,
  held_earnings NUMERIC(12, 2) DEFAULT 0,
  
  -- Tier progression
  tier_updated_at TIMESTAMP DEFAULT NOW(),
  last_payout_date TIMESTAMP,
  
  -- Fraud tracking
  fraud_score NUMERIC(5, 2) DEFAULT 0,
  flagged_at TIMESTAMP,
  flag_reason VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT email_not_empty CHECK (user_id IS NOT NULL)
);

CREATE INDEX idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX idx_affiliates_tier ON affiliates(tier);
CREATE INDEX idx_affiliates_status ON affiliates(status);
CREATE INDEX idx_affiliates_total_earnings ON affiliates(total_earnings DESC);
CREATE INDEX idx_affiliates_created_at ON affiliates(created_at DESC);

-- Referral clicks table: Track individual referral link clicks
CREATE TABLE IF NOT EXISTS referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  referral_code VARCHAR(8) NOT NULL,
  
  -- Click metadata
  clicked_at TIMESTAMP DEFAULT NOW(),
  source_url VARCHAR(2048),
  referrer_url VARCHAR(2048),
  ip_address INET,
  user_agent VARCHAR(512),
  country_code VARCHAR(2),
  
  -- Cookie tracking (30-day window)
  cookie_token VARCHAR(64) NOT NULL,
  cookie_expires_at TIMESTAMP NOT NULL,
  
  -- Device/Browser info for fraud detection
  device_type VARCHAR(50), -- 'mobile', 'desktop', 'tablet'
  browser_type VARCHAR(100),
  
  CONSTRAINT clock_check CHECK (clicked_at <= NOW())
);

CREATE INDEX idx_referral_clicks_affiliate_id ON referral_clicks(affiliate_id);
CREATE INDEX idx_referral_clicks_referral_code ON referral_clicks(referral_code);
CREATE INDEX idx_referral_clicks_cookie_token ON referral_clicks(cookie_token);
CREATE INDEX idx_referral_clicks_clicked_at ON referral_clicks(clicked_at DESC);
CREATE INDEX idx_referral_clicks_cookie_expires ON referral_clicks(cookie_expires_at);

-- Referrals table: Converted clicks (user registered/purchased)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Referral source
  referral_code VARCHAR(8) NOT NULL,
  click_id UUID REFERENCES referral_clicks(id) ON DELETE SET NULL,
  
  -- License/Plan info
  license_type VARCHAR(50) NOT NULL, -- 'personal', 'team', 'institution'
  license_id UUID REFERENCES licenses(id) ON DELETE SET NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'chargeback', 'refunded', 'cancelled')),
  
  -- Commission eligibility
  eligible_for_commission BOOLEAN DEFAULT TRUE,
  ineligible_reason VARCHAR(255),
  
  -- Timestamps
  referred_at TIMESTAMP DEFAULT NOW(),
  purchase_completed_at TIMESTAMP,
  chargeback_at TIMESTAMP,
  
  CONSTRAINT different_users CHECK (affiliate_id != referred_user_id)
);

CREATE INDEX idx_referrals_affiliate_id ON referrals(affiliate_id);
CREATE INDEX idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX idx_referrals_referral_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_referred_at ON referrals(referred_at DESC);
CREATE INDEX idx_referrals_license_id ON referrals(license_id);

-- Commissions table: Individual commission records
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  
  -- Commission details
  commission_amount NUMERIC(12, 2) NOT NULL,
  commission_percentage NUMERIC(5, 2) NOT NULL,
  base_amount NUMERIC(12, 2) NOT NULL, -- License price before commission
  currency VARCHAR(3) DEFAULT 'BDT',
  
  -- Affiliate tier at time of commission
  tier_at_time VARCHAR(50) NOT NULL,
  
  -- Status & Hold Period
  status VARCHAR(50) DEFAULT 'held' CHECK (status IN ('held', 'released', 'pending', 'paid', 'cancelled')),
  hold_until TIMESTAMP NOT NULL, -- 7-day hold from creation
  released_at TIMESTAMP,
  
  -- Bonuses applied
  seasonal_bonus_percentage NUMERIC(5, 2) DEFAULT 0,
  milestone_bonus_amount NUMERIC(12, 2) DEFAULT 0,
  total_amount_with_bonuses NUMERIC(12, 2) NOT NULL,
  
  -- Payout status
  payout_id UUID REFERENCES payouts(id) ON DELETE SET NULL,
  paid_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_amounts CHECK (commission_amount > 0 AND base_amount > 0)
);

CREATE INDEX idx_commissions_affiliate_id ON commissions(affiliate_id);
CREATE INDEX idx_commissions_referral_id ON commissions(referral_id);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_commissions_hold_until ON commissions(hold_until);
CREATE INDEX idx_commissions_created_at ON commissions(created_at DESC);
CREATE INDEX idx_commissions_payout_id ON commissions(payout_id);
CREATE INDEX idx_commissions_released_at ON commissions(released_at);

-- Payouts table: Monthly payout records
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  
  -- Payout details
  payout_amount NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BDT',
  
  -- Payout method
  payout_method VARCHAR(50) NOT NULL CHECK (payout_method IN ('bank_transfer', 'bkash', 'nagad', 'rocket', 'stripe')),
  payment_account VARCHAR(255), -- bKash number, bank account, etc.
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Payout cycle
  payout_month VARCHAR(7) NOT NULL, -- 'YYYY-MM'
  requested_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Commission aggregation
  commission_count INT NOT NULL,
  commission_ids UUID[] NOT NULL,
  
  -- Reference info
  gateway_transaction_id VARCHAR(255),
  gateway_response JSONB,
  
  -- Failure tracking
  failure_reason VARCHAR(255),
  retry_count INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_payout CHECK (payout_amount > 0)
);

CREATE INDEX idx_payouts_affiliate_id ON payouts(affiliate_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_payout_month ON payouts(payout_month);
CREATE INDEX idx_payouts_requested_at ON payouts(requested_at DESC);
CREATE INDEX idx_payouts_created_at ON payouts(created_at DESC);

-- Fraud Detection Logs table: Fraud scoring and tracking
CREATE TABLE IF NOT EXISTS fraud_detection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  
  -- Fraud indicators
  fraud_type VARCHAR(50) NOT NULL CHECK (fraud_type IN (
    'high_refund_rate',
    'high_chargeback_rate',
    'suspicious_traffic',
    'velocity_abuse',
    'invalid_source',
    'click_spam',
    'self_referral'
  )),
  
  -- Scoring
  fraud_score NUMERIC(5, 2) NOT NULL,
  score_reason VARCHAR(255),
  
  -- Details
  detected_at TIMESTAMP DEFAULT NOW(),
  suspicious_data JSONB, -- Additional context (IP, email domain, etc.)
  action_taken VARCHAR(100) CHECK (action_taken IN ('flagged', 'suspended', 'warned', 'investigated', 'cleared')),
  action_date TIMESTAMP,
  
  -- Resolution
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  resolution_notes VARCHAR(512),
  resolved_by VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fraud_logs_affiliate_id ON fraud_detection_logs(affiliate_id);
CREATE INDEX idx_fraud_logs_fraud_type ON fraud_detection_logs(fraud_type);
CREATE INDEX idx_fraud_logs_detected_at ON fraud_detection_logs(detected_at DESC);
CREATE INDEX idx_fraud_logs_resolved ON fraud_detection_logs(resolved);

-- Row Level Security Policies

-- Affiliates RLS: Users can only view their own affiliate profile
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own affiliate profile"
  ON affiliates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate profile"
  ON affiliates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Referral Clicks RLS: Affiliates can view their own clicks
ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own referral clicks"
  ON referral_clicks FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

-- Referrals RLS: Affiliates can view their referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own referrals"
  ON referrals FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Referred users can view their referral"
  ON referrals FOR SELECT
  USING (auth.uid() = referred_user_id);

-- Commissions RLS: Affiliates can view their commissions
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own commissions"
  ON commissions FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

-- Payouts RLS: Affiliates can view their payouts
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own payouts"
  ON payouts FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

-- Fraud Logs RLS: Only admins can view
ALTER TABLE fraud_detection_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all fraud logs"
  ON fraud_detection_logs FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Trigger: Update affiliates.updated_at on commission creation
CREATE OR REPLACE FUNCTION update_affiliate_stats_on_commission()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE affiliates
  SET 
    total_earnings = total_earnings + NEW.total_amount_with_bonuses,
    held_earnings = held_earnings + NEW.total_amount_with_bonuses,
    updated_at = NOW()
  WHERE id = NEW.affiliate_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_affiliate_on_commission
  AFTER INSERT ON commissions
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_stats_on_commission();

-- Trigger: Update affiliate stats when commission is released
CREATE OR REPLACE FUNCTION release_held_commission()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'released' AND OLD.status = 'held' THEN
    UPDATE affiliates
    SET 
      held_earnings = held_earnings - NEW.total_amount_with_bonuses,
      pending_earnings = pending_earnings + NEW.total_amount_with_bonuses,
      updated_at = NOW()
    WHERE id = NEW.affiliate_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_release_held_commission
  AFTER UPDATE ON commissions
  FOR EACH ROW
  EXECUTE FUNCTION release_held_commission();

-- Trigger: Update affiliate tier based on referral count
CREATE OR REPLACE FUNCTION update_affiliate_tier()
RETURNS TRIGGER AS $$
DECLARE
  referral_count INT;
  new_tier VARCHAR;
BEGIN
  SELECT COUNT(*) INTO referral_count
  FROM referrals
  WHERE affiliate_id = NEW.affiliate_id AND status = 'active';
  
  -- Determine tier based on referral count
  IF referral_count >= 200 THEN
    new_tier := 'platinum';
  ELSIF referral_count >= 50 THEN
    new_tier := 'gold';
  ELSIF referral_count >= 10 THEN
    new_tier := 'silver';
  ELSE
    new_tier := 'bronze';
  END IF;
  
  -- Update tier if changed
  UPDATE affiliates
  SET 
    tier = new_tier,
    tier_updated_at = CASE WHEN tier != new_tier THEN NOW() ELSE tier_updated_at END,
    updated_at = NOW()
  WHERE id = NEW.affiliate_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_affiliate_tier
  AFTER INSERT ON referrals
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION update_affiliate_tier();

-- Trigger: Auto-update affiliate fraud score based on fraud logs
CREATE OR REPLACE FUNCTION update_affiliate_fraud_score()
RETURNS TRIGGER AS $$
DECLARE
  total_score NUMERIC;
BEGIN
  SELECT SUM(fraud_score) INTO total_score
  FROM fraud_detection_logs
  WHERE affiliate_id = NEW.affiliate_id AND resolved = FALSE;
  
  UPDATE affiliates
  SET 
    fraud_score = COALESCE(total_score, 0),
    status = CASE 
      WHEN COALESCE(total_score, 0) >= 70 THEN 'suspended'
      WHEN COALESCE(total_score, 0) >= 50 THEN 'flagged'
      ELSE 'active'
    END,
    updated_at = NOW()
  WHERE id = NEW.affiliate_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_fraud_score
  AFTER INSERT ON fraud_detection_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_fraud_score();

-- Create view for affiliate earnings summary
CREATE OR REPLACE VIEW affiliate_earnings_summary AS
SELECT 
  a.id,
  a.user_id,
  a.referral_code,
  a.tier,
  a.total_referrals,
  a.total_earnings,
  a.pending_earnings,
  a.paid_earnings,
  a.held_earnings,
  (a.held_earnings + a.pending_earnings) as available_for_payout,
  COUNT(DISTINCT r.id) as active_referrals,
  COUNT(DISTINCT CASE WHEN r.status = 'active' THEN r.id END) as eligible_referrals,
  COUNT(DISTINCT CASE WHEN r.status = 'chargeback' THEN r.id END) as chargebacks,
  COUNT(DISTINCT CASE WHEN r.status = 'refunded' THEN r.id END) as refunds
FROM affiliates a
LEFT JOIN referrals r ON a.id = r.affiliate_id
GROUP BY a.id, a.user_id, a.referral_code, a.tier, a.total_referrals, 
         a.total_earnings, a.pending_earnings, a.paid_earnings, a.held_earnings;

-- Create view for leaderboard
CREATE OR REPLACE VIEW affiliate_leaderboard AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY a.total_earnings DESC) as rank,
  a.id,
  a.user_id,
  a.referral_code,
  a.tier,
  a.total_earnings,
  a.total_referrals,
  COUNT(DISTINCT r.id) as recent_referrals,
  a.created_at
FROM affiliates a
LEFT JOIN referrals r ON a.id = r.affiliate_id 
  AND r.referred_at >= NOW() - INTERVAL '30 days'
WHERE a.status = 'active'
GROUP BY a.id, a.user_id, a.referral_code, a.tier, 
         a.total_earnings, a.total_referrals, a.created_at
ORDER BY a.total_earnings DESC;
