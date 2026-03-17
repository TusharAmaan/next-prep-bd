-- Regional Payment System Tables

-- Create regional settings table
CREATE TABLE IF NOT EXISTS regional_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(2) NOT NULL UNIQUE,
  currency VARCHAR(3) NOT NULL,
  currency_symbol VARCHAR(5),
  timezone VARCHAR(50),
  vat_rate DECIMAL(5, 4) DEFAULT 0,
  gst_rate DECIMAL(5, 4) DEFAULT 0,
  sales_tax_rate DECIMAL(5, 4) DEFAULT 0,
  min_payment DECIMAL(12, 2),
  max_payment DECIMAL(12, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payment gateway configurations table
CREATE TABLE IF NOT EXISTS payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name VARCHAR(255) NOT NULL UNIQUE,
  gateway_type VARCHAR(50),
  supported_countries VARCHAR(255),
  api_key VARCHAR(255),
  api_secret VARCHAR(255) ENCRYPTED,
  merchant_id VARCHAR(255),
  webhook_secret VARCHAR(255) ENCRYPTED,
  fee_percentage DECIMAL(5, 4),
  fee_fixed DECIMAL(12, 2),
  min_amount DECIMAL(12, 2),
  max_amount DECIMAL(12, 2),
  settlement_cycle INTEGER, -- days
  is_active BOOLEAN DEFAULT TRUE,
  is_production BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create region-specific pricing table
CREATE TABLE IF NOT EXISTS regional_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(2) NOT NULL,
  license_type VARCHAR(50) NOT NULL,
  base_price DECIMAL(12, 2) NOT NULL,
  local_price DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(country_code, license_type)
);

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  license_id UUID REFERENCES licenses(id),
  transaction_id VARCHAR(255) UNIQUE,
  gateway_name VARCHAR(255) NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  currency VARCHAR(3),
  amount DECIMAL(12, 2) NOT NULL,
  amount_in_usd DECIMAL(12, 2),
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  gateway_fee DECIMAL(12, 2) DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  reference_id VARCHAR(255),
  response_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  refunded_at TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Create exchange rates history table
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency VARCHAR(3) NOT NULL,
  target_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(18, 8) NOT NULL,
  source VARCHAR(50),
  recorded_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  INDEX idx_currencies (base_currency, target_currency),
  INDEX idx_recorded_at (recorded_at)
);

-- Create payment settlement records table
CREATE TABLE IF NOT EXISTS payment_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name VARCHAR(255) NOT NULL,
  settlement_date DATE NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  total_fees DECIMAL(12, 2),
  total_refunds DECIMAL(12, 2),
  transaction_count INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  settlement_reference VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  settled_at TIMESTAMP,
  INDEX idx_gateway (gateway_name),
  INDEX idx_settlement_date (settlement_date)
);

-- Create fraud detection logs table
CREATE TABLE IF NOT EXISTS fraud_detection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  transaction_id VARCHAR(255),
  risk_level VARCHAR(20),
  flags JSONB,
  action_taken VARCHAR(255),
  reviewed_at TIMESTAMP,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_risk_level (risk_level)
);

-- Create regional compliance logs table
CREATE TABLE IF NOT EXISTS compliance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  country_code VARCHAR(2) NOT NULL,
  compliance_type VARCHAR(50),
  documents_verified JSONB,
  verification_status VARCHAR(20),
  verified_at TIMESTAMP,
  expires_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_country (country_code)
);

-- Create indexes
CREATE INDEX idx_transactions_gateway ON payment_transactions(gateway_name);
CREATE INDEX idx_transactions_country ON payment_transactions(country_code);
CREATE INDEX idx_settlements_gateway ON payment_settlements(gateway_name);
CREATE INDEX idx_regional_pricing ON regional_pricing(country_code);

-- RLS (Row Level Security) Policies
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_detection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_logs ENABLE ROW LEVEL SECURITY;

-- Payment transactions RLS: users can see their own transactions
CREATE POLICY transaction_read_policy ON payment_transactions
FOR SELECT USING (user_id = auth.uid());

-- Fraud detection RLS: only admins can view
CREATE POLICY fraud_read_policy ON fraud_detection_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Compliance logs RLS: users can see their own, admins can see all
CREATE POLICY compliance_read_policy ON compliance_logs
FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Create function to update regional settings timestamp
CREATE OR REPLACE FUNCTION update_regional_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for regional settings
CREATE TRIGGER trigger_regional_settings_update
BEFORE UPDATE ON regional_settings
FOR EACH ROW EXECUTE FUNCTION update_regional_settings_timestamp();

-- Insert default regional settings
INSERT INTO regional_settings (country_code, currency, currency_symbol, timezone) VALUES
  ('BD', 'BDT', '৳', 'Asia/Dhaka'),
  ('IN', 'INR', '₹', 'Asia/Kolkata'),
  ('PK', 'PKR', '₨', 'Asia/Karachi'),
  ('US', 'USD', '$', 'America/New_York'),
  ('GB', 'GBP', '£', 'Europe/London'),
  ('AE', 'AED', 'د.إ', 'Asia/Dubai'),
  ('SG', 'SGD', '$', 'Asia/Singapore')
ON CONFLICT DO NOTHING;

-- Insert regional pricing
INSERT INTO regional_pricing (country_code, license_type, base_price, local_price, currency) VALUES
  ('BD', 'personal', 9.99, 999, 'BDT'),
  ('BD', 'team', 49.99, 4999, 'BDT'),
  ('BD', 'institution', 499.99, 49999, 'BDT'),
  ('IN', 'personal', 9.99, 799, 'INR'),
  ('IN', 'team', 49.99, 3999, 'INR'),
  ('IN', 'institution', 499.99, 39999, 'INR'),
  ('PK', 'personal', 9.99, 1999, 'PKR'),
  ('PK', 'team', 49.99, 9999, 'PKR'),
  ('PK', 'institution', 499.99, 99999, 'PKR'),
  ('US', 'personal', 9.99, 9.99, 'USD'),
  ('US', 'team', 49.99, 49.99, 'USD'),
  ('US', 'institution', 499.99, 499.99, 'USD'),
  ('GB', 'personal', 7.99, 7.99, 'GBP'),
  ('GB', 'team', 39.99, 39.99, 'GBP'),
  ('GB', 'institution', 399.99, 399.99, 'GBP'),
  ('AE', 'personal', 35.99, 35.99, 'AED'),
  ('AE', 'team', 179.99, 179.99, 'AED'),
  ('AE', 'institution', 1799.99, 1799.99, 'AED'),
  ('SG', 'personal', 13.99, 13.99, 'SGD'),
  ('SG', 'team', 69.99, 69.99, 'SGD'),
  ('SG', 'institution', 699.99, 699.99, 'SGD')
ON CONFLICT DO NOTHING;
