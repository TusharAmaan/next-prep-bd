-- Licensing System Tables

-- Create licenses table
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('personal', 'team', 'institution')),
  max_users INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired')),
  purchased_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create license members table
CREATE TABLE IF NOT EXISTS license_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(license_id, user_id)
);

-- Create license invitations table
CREATE TABLE IF NOT EXISTS license_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  invited_email VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
  UNIQUE(license_id, invited_email)
);

-- Create indexes
CREATE INDEX idx_licenses_owner_id ON licenses(owner_id);
CREATE INDEX idx_licenses_status ON licenses(status);
CREATE INDEX idx_license_members_license_id ON license_members(license_id);
CREATE INDEX idx_license_members_user_id ON license_members(user_id);
CREATE INDEX idx_license_invitations_license_id ON license_invitations(license_id);
CREATE INDEX idx_license_invitations_status ON license_invitations(status);

-- Add stripe customer ID to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- Add license_id to profiles for quick lookup
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_license_id UUID REFERENCES licenses(id);

-- Create function to auto-update license member count
CREATE OR REPLACE FUNCTION sync_license_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE licenses SET updated_at = NOW() WHERE id = NEW.license_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE licenses SET updated_at = NOW() WHERE id = OLD.license_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for license member updates
CREATE TRIGGER trigger_license_member_sync
AFTER INSERT OR DELETE ON license_members
FOR EACH ROW EXECUTE FUNCTION sync_license_member_count();

-- Create function to check license capacity
CREATE OR REPLACE FUNCTION check_license_capacity(p_license_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_max_users INTEGER;
  v_current_users INTEGER;
BEGIN
  SELECT max_users INTO v_max_users FROM licenses WHERE id = p_license_id;
  SELECT COUNT(*) INTO v_current_users FROM license_members WHERE license_id = p_license_id;
  
  RETURN v_current_users < v_max_users;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) Policies
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_invitations ENABLE ROW LEVEL SECURITY;

-- License read policy: users can see their own licenses or licenses they're a member of
CREATE POLICY license_read_policy ON licenses
FOR SELECT USING (
  owner_id = auth.uid() OR
  id IN (
    SELECT license_id FROM license_members WHERE user_id = auth.uid()
  )
);

-- License write policy: only owner can update their license
CREATE POLICY license_write_policy ON licenses
FOR UPDATE USING (owner_id = auth.uid());

-- License member read policy
CREATE POLICY license_member_read_policy ON license_members
FOR SELECT USING (
  license_id IN (
    SELECT id FROM licenses WHERE owner_id = auth.uid() OR
    id IN (SELECT license_id FROM license_members WHERE user_id = auth.uid())
  )
);

-- License member write policy: owner can manage members
CREATE POLICY license_member_write_policy ON license_members
FOR INSERT WITH CHECK (
  license_id IN (SELECT id FROM licenses WHERE owner_id = auth.uid())
);

-- License member delete policy
CREATE POLICY license_member_delete_policy ON license_members
FOR DELETE USING (
  license_id IN (SELECT id FROM licenses WHERE owner_id = auth.uid())
);

-- License invitation read policy
CREATE POLICY license_invitation_read_policy ON license_invitations
FOR SELECT USING (
  invited_email = auth.jwt() ->> 'email' OR
  license_id IN (SELECT id FROM licenses WHERE owner_id = auth.uid())
);

-- License invitation write policy
CREATE POLICY license_invitation_write_policy ON license_invitations
FOR INSERT WITH CHECK (
  license_id IN (SELECT id FROM licenses WHERE owner_id = auth.uid())
);

-- License invitation delete policy
CREATE POLICY license_invitation_delete_policy ON license_invitations
FOR DELETE USING (
  license_id IN (SELECT id FROM licenses WHERE owner_id = auth.uid())
);
