'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface LicenseMember {
  id: string;
  user_id: string;
  role: 'admin' | 'member';
  added_at: string;
  profiles?: {
    full_name: string;
    email: string;
    avatar_url: string;
  };
}

interface License {
  id: string;
  type: string;
  max_users: number;
  status: string;
  purchased_at: string;
  expires_at: string;
}

export default function LicenseManagement() {
  const { data: session } = useSession();
  const [license, setLicense] = useState<License | null>(null);
  const [members, setMembers] = useState<LicenseMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch license and members
  useEffect(() => {
    if (session?.user?.id) {
      fetchLicense();
    }
  }, [session?.user?.id]);

  const fetchLicense = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/licenses/manage?userId=${session?.user?.id}&action=my-license`
      );
      const data = await res.json();
      setLicense(data.license);
      setMembers(data.members || []);
    } catch (error) {
      console.error('Failed to fetch license:', error);
    } finally {
      setLoading(false);
    }
  };

  // Invite user to license
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteEmail.trim()) {
      setMessage('Please enter an email address');
      return;
    }

    if (members.length >= (license?.max_users || 1)) {
      setMessage('License is at capacity');
      return;
    }

    try {
      setInviteLoading(true);
      const res = await fetch('/api/licenses/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id,
          action: 'add-member',
          email: inviteEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`Error: ${data.error}`);
        return;
      }

      setMessage(data.message);
      setInviteEmail('');
      await fetchLicense();
    } catch (error) {
      console.error('Invite error:', error);
      setMessage('Failed to send invite');
    } finally {
      setInviteLoading(false);
    }
  };

  // Remove member from license
  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      const res = await fetch('/api/licenses/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id,
          action: 'remove-member',
          memberId: memberId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(`Error: ${data.error}`);
        return;
      }

      setMessage('Member removed successfully');
      await fetchLicense();
    } catch (error) {
      console.error('Remove error:', error);
      setMessage('Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!license) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-700">
            No active license found. Please{' '}
            <a href="/license-purchase" className="font-bold underline">
              purchase a license
            </a>{' '}
            to get started.
          </p>
        </div>
      </div>
    );
  }

  const availableSeats = (license?.max_users || 1) - members.length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* License Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-gray-600 text-sm font-semibold uppercase mb-1">
              License Type
            </h2>
            <p className="text-3xl font-bold text-gray-900">
              {license.type.charAt(0).toUpperCase() + license.type.slice(1)}
            </p>
          </div>
          <div>
            <h3 className="text-gray-600 text-sm font-semibold uppercase mb-1">
              License Status
            </h3>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <p className="text-lg font-semibold text-gray-900">
                {license.status}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-gray-600 text-sm font-semibold uppercase mb-1">
              Users
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {members.length} / {license.max_users}
            </p>
          </div>
          <div>
            <h3 className="text-gray-600 text-sm font-semibold uppercase mb-1">
              Expires
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(license.expires_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded">
          {message}
        </div>
      )}

      {/* Invite Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Add Team Member
        </h3>

        {availableSeats > 0 ? (
          <form onSubmit={handleInviteMember} className="flex gap-2">
            <input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={inviteLoading}
            />
            <button
              type="submit"
              disabled={inviteLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {inviteLoading ? 'Sending...' : 'Invite'}
            </button>
          </form>
        ) : (
          <p className="text-red-600">
            All available seats are in use. Upgrade your license to add more
            members.
          </p>
        )}

        <p className="text-sm text-gray-600 mt-2">
          {availableSeats} seat{availableSeats !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-xl font-bold text-gray-900">Team Members</h3>
        </div>

        <div className="divide-y">
          {members.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No team members yet
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="p-6 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  {member.profiles?.avatar_url && (
                    <img
                      src={member.profiles.avatar_url}
                      alt={member.profiles.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {member.profiles?.full_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {member.profiles?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-semibold">
                    {member.role}
                  </span>

                  {member.role !== 'admin' && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-600 hover:text-red-700 font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upgrade Button */}
      <div className="mt-8 text-center">
        <a
          href="/license-purchase"
          className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-8 py-3 rounded-lg hover:shadow-lg transition-shadow"
        >
          Upgrade License
        </a>
      </div>
    </div>
  );
}
