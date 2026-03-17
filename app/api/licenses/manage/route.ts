import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface License {
  type: 'personal' | 'team' | 'institution';
  seats: number;
  features: string[];
  maxUsers: number;
  price: number;
}

const LICENSE_TYPES: Record<string, License> = {
  personal: {
    type: 'personal',
    seats: 1,
    features: ['Basic courses', 'Limited quizzes', 'Community access'],
    maxUsers: 1,
    price: 999, // BDT per month
  },
  team: {
    type: 'team',
    seats: 5,
    features: [
      'Unlimited courses',
      'All quizzes',
      'Team analytics',
      'Priority support',
      'Custom content',
    ],
    maxUsers: 5,
    price: 4999, // BDT per month
  },
  institution: {
    type: 'institution',
    seats: 100,
    features: [
      'Unlimited everything',
      'Admin dashboard',
      'Advanced analytics',
      'API access',
      '24/7 support',
      'SSO integration',
      'Custom branding',
    ],
    maxUsers: 100,
    price: 49999, // BDT per month
  },
};

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId') || '';
    const action = request.nextUrl.searchParams.get('action') || 'list';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    if (action === 'list') {
      return NextResponse.json({
        licenses: Object.values(LICENSE_TYPES),
      });
    }

    if (action === 'my-license') {
      // Get user's current license
      const { data: license, error } = await supabase
        .from('licenses')
        .select('*')
        .eq('owner_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!license) {
        return NextResponse.json({ license: null, members: [] });
      }

      // Get license members
      const { data: members } = await supabase
        .from('license_members')
        .select('*, profiles(id, full_name, email, avatar_url)')
        .eq('license_id', license.id)
        .order('added_at', { ascending: false });

      return NextResponse.json({
        license,
        members: members || [],
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('License fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch license info' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, licenseType, members, email } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    if (action === 'purchase') {
      if (!licenseType || !LICENSE_TYPES[licenseType]) {
        return NextResponse.json(
          { error: 'Invalid license type' },
          { status: 400 }
        );
      }

      const licenseTemplate = LICENSE_TYPES[licenseType];

      // Create license
      const { data: license, error: createError } = await supabase
        .from('licenses')
        .insert({
          owner_id: userId,
          type: licenseType,
          max_users: licenseTemplate.maxUsers,
          status: 'active',
          purchased_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add owner as first member
      await supabase.from('license_members').insert({
        license_id: license.id,
        user_id: userId,
        role: 'admin',
        added_at: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        license,
        message: `${licenseType} license purchased successfully`,
      });
    }

    if (action === 'add-member') {
      if (!email) {
        return NextResponse.json(
          { error: 'Email required' },
          { status: 400 }
        );
      }

      // Get user's license
      const { data: license } = await supabase
        .from('licenses')
        .select('*')
        .eq('owner_id', userId)
        .single();

      if (!license) {
        return NextResponse.json(
          { error: 'License not found' },
          { status: 404 }
        );
      }

      // Check if license has available seats
      const { count: memberCount } = await supabase
        .from('license_members')
        .select('*', { count: 'exact' })
        .eq('license_id', license.id);

      if ((memberCount || 0) >= license.max_users) {
        return NextResponse.json(
          { error: 'License seats full' },
          { status: 400 }
        );
      }

      // Find user by email
      const { data: invitedUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (!invitedUser) {
        // Create invitation for non-existing user
        const { error: inviteError } = await supabase
          .from('license_invitations')
          .insert({
            license_id: license.id,
            invited_email: email,
            invited_by: userId,
            status: 'pending',
            created_at: new Date().toISOString(),
          });

        if (inviteError) throw inviteError;

        return NextResponse.json({
          success: true,
          message: `Invitation sent to ${email}`,
          type: 'invitation',
        });
      }

      // Add existing user as member
      const { error: addError } = await supabase
        .from('license_members')
        .insert({
          license_id: license.id,
          user_id: invitedUser.id,
          role: 'member',
          added_at: new Date().toISOString(),
        });

      if (addError) throw addError;

      return NextResponse.json({
        success: true,
        message: `${email} added to license`,
        type: 'added',
      });
    }

    if (action === 'remove-member') {
      const { memberId } = body;

      if (!memberId) {
        return NextResponse.json(
          { error: 'memberId required' },
          { status: 400 }
        );
      }

      // Verify ownership
      const { data: member } = await supabase
        .from('license_members')
        .select('license_id, licenses(owner_id)')
        .eq('id', memberId)
        .single();

      if (!member || member.licenses?.owner_id !== userId) {
        return NextResponse.json(
          { error: 'Not authorized' },
          { status: 403 }
        );
      }

      // Remove member
      const { error } = await supabase
        .from('license_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      return NextResponse.json({ success: true, message: 'Member removed' });
    }

    if (action === 'accept-invitation') {
      const { invitationId } = body;

      if (!invitationId) {
        return NextResponse.json(
          { error: 'invitationId required' },
          { status: 400 }
        );
      }

      // Get invitation
      const { data: invitation, error: getError } = await supabase
        .from('license_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (getError) throw getError;

      if (invitation.status !== 'pending') {
        return NextResponse.json(
          { error: 'Invalid invitation' },
          { status: 400 }
        );
      }

      // Add user to license
      const { error: addError } = await supabase
        .from('license_members')
        .insert({
          license_id: invitation.license_id,
          user_id: userId,
          role: 'member',
          added_at: new Date().toISOString(),
        });

      if (addError) throw addError;

      // Mark invitation as accepted
      await supabase
        .from('license_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);

      return NextResponse.json({
        success: true,
        message: 'License invitation accepted',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('License action error:', error);
    return NextResponse.json(
      { error: 'Action failed' },
      { status: 500 }
    );
  }
}
