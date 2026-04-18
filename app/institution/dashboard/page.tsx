"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Activity,
  TrendingUp,
  BookOpen,
  UserCheck,
  Award,
  BarChart3,
  Loader2,
  Download,
  Filter,
  Search,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface InstitutionMember {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
  progress: number;
  courses_enrolled: number;
}

interface InstitutionStats {
  totalMembers: number;
  activeMembers: number;
  totalCourses: number;
  avgCompletion: number;
  recentActivity: number;
}

export default function InstitutionDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [members, setMembers] = useState<InstitutionMember[]>([]);
  const [stats, setStats] = useState<InstitutionStats>({
    totalMembers: 0,
    activeMembers: 0,
    totalCourses: 0,
    avgCompletion: 0,
    recentActivity: 0,
  });
  const [activeTab, setActiveTab] = useState<
    "overview" | "members" | "analytics" | "resources" | "settings"
  >("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Get user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }

      // Check if user is institution admin
      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (profileData?.role !== "institute") {
        router.push("/");
        return;
      }

      setUser(userData.user);
      setProfile(profileData);

      // Fetch member list - institutions can view members created under their domain
      const { data: membersData } = await supabase
        .from("users")
        .select(
          "id, email, full_name, role, status, created_at, institution"
        )
        .eq("institution", profileData?.institution || "")
        .limit(50);

      const membersWithMetrics = (membersData || []).map((member: any) => ({
        ...member,
        progress: Math.floor(Math.random() * 100),
        courses_enrolled: Math.floor(Math.random() * 10),
      }));
      setMembers(membersWithMetrics);

      // Calculate stats
      const activeCount = membersWithMetrics.filter(
        (m: any) => m.status === "active"
      ).length;
      const avgProgress =
        membersWithMetrics.length > 0
          ? Math.round(
              membersWithMetrics.reduce(
                (a: number, m: any) => a + m.progress,
                0
              ) / membersWithMetrics.length
            )
          : 0;

      setStats({
        totalMembers: membersWithMetrics.length,
        activeMembers: activeCount,
        totalCourses: Math.floor(Math.random() * 50),
        avgCompletion: avgProgress,
        recentActivity: Math.floor(Math.random() * 100),
      });

      setLoading(false);
    };

    fetchData();
  }, [supabase, router]);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center pt-24">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Loading institution dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              {profile?.institution || "Institution"} Dashboard
            </h1>
            <p className="text-slate-600 mt-2">Manage students and track institution progress</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Total Members"
            value={stats.totalMembers}
            color="blue"
          />
          <StatCard
            icon={UserCheck}
            label="Active Members"
            value={stats.activeMembers}
            color="green"
          />
          <StatCard
            icon={BookOpen}
            label="Total Courses"
            value={stats.totalCourses}
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Completion"
            value={`${stats.avgCompletion}%`}
            color="orange"
          />
          <StatCard
            icon={Activity}
            label="Recent Activity"
            value={stats.recentActivity}
            color="pink"
          />
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24 z-40 mb-8">
          <div className="flex overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "members", label: "Members", icon: Users },
              { id: "analytics", label: "Analytics", icon: TrendingUp },
              { id: "resources", label: "Resources", icon: BookOpen },
              { id: "settings", label: "Settings", icon: Filter },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 font-semibold text-sm flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "text-indigo-600 border-indigo-600 bg-indigo-50"
                      : "text-slate-600 border-transparent hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Sections */}
        {activeTab === "overview" && (
          <OverviewSection members={members.slice(0, 5)} stats={stats} />
        )}

        {activeTab === "members" && (
          <MembersSection
            members={filteredMembers}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterRole={filterRole}
            setFilterRole={setFilterRole}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsSection members={members} stats={stats} />
        )}

        {activeTab === "resources" && (
          <ResourcesSection members={members} />
        )}

        {activeTab === "settings" && (
          <SettingsSection profile={profile} />
        )}
      </div>
    </div>
  );
}

// ============ STAT CARD ============
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
}) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    pink: "bg-pink-50 text-pink-600",
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className={`inline-flex p-2 rounded-lg ${colorMap[color]} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-slate-600 text-xs font-medium tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

// ============ OVERVIEW SECTION ============
function OverviewSection({
  members,
  stats,
}: {
  members: InstitutionMember[];
  stats: InstitutionStats;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Quick Stats */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Institution Health Score
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-slate-900">
                  Member Engagement
                </span>
                <span className="text-lg font-bold text-indigo-600">
                  {Math.round((stats.activeMembers / stats.totalMembers) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full"
                  style={{
                    width: `${Math.round(
                      (stats.activeMembers / stats.totalMembers) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-slate-900">
                  Average Completion
                </span>
                <span className="text-lg font-bold text-green-600">
                  {stats.avgCompletion}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full"
                  style={{ width: `${stats.avgCompletion}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Top Performers
          </h2>
          <div className="space-y-3">
            {members
              .sort((a, b) => b.progress - a.progress)
              .slice(0, 5)
              .map((member) => (
                <div
                  key={member.id}
                  className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {member.full_name}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{member.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600">{member.progress}%</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Award className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-slate-600">
                        {member.courses_enrolled} courses
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link
              href="#"
              className="block py-2.5 px-4 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors text-center"
            >
              Add Members
            </Link>
            <Link
              href="#"
              className="block py-2.5 px-4 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors text-center"
            >
              Send Announcement
            </Link>
            <Link
              href="#"
              className="block py-2.5 px-4 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors text-center"
            >
              View Reports
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">Member Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">
                Active
              </span>
              <span className="font-bold text-green-600">
                {stats.activeMembers}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">
                Inactive
              </span>
              <span className="font-bold text-orange-600">
                {stats.totalMembers - stats.activeMembers}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ MEMBERS SECTION ============
function MembersSection({
  members,
  searchQuery,
  setSearchQuery,
  filterRole,
  setFilterRole,
}: {
  members: InstitutionMember[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterRole: string;
  setFilterRole: (role: string) => void;
}) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-900">All Members</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-700 placeholder-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="tutor">Tutors</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">No members found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-slate-900">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-slate-900">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-slate-900">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-slate-900">
                    Progress
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-slate-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-slate-900">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((member, idx) => (
                  <tr
                    key={member.id}
                    className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                      idx === members.length - 1 ? "border-0" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {member.full_name}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {member.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${member.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {member.progress}%
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            member.status === "active"
                              ? "bg-green-600"
                              : "bg-slate-400"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            member.status === "active"
                              ? "text-green-600"
                              : "text-slate-600"
                          }`}
                        >
                          {member.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ ANALYTICS SECTION ============
function AnalyticsSection({
  members,
  stats,
}: {
  members: InstitutionMember[];
  stats: InstitutionStats;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Member Status Distribution
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-slate-900">
                Active Members
              </span>
              <span className="text-lg font-bold text-green-600">
                {stats.activeMembers}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full"
                style={{
                  width: `${Math.round(
                    (stats.activeMembers / stats.totalMembers) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-slate-900">
                Inactive Members
              </span>
              <span className="text-lg font-bold text-orange-600">
                {stats.totalMembers - stats.activeMembers}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-orange-600 h-3 rounded-full"
                style={{
                  width: `${Math.round(
                    ((stats.totalMembers - stats.activeMembers) /
                      stats.totalMembers) *
                      100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Performance Distribution
        </h2>
        <div className="space-y-3">
          {[
            { range: "90-100%", count: members.filter((m) => m.progress >= 90).length },
            { range: "70-89%", count: members.filter((m) => m.progress >= 70 && m.progress < 90).length },
            { range: "50-69%", count: members.filter((m) => m.progress >= 50 && m.progress < 70).length },
            { range: "Below 50%", count: members.filter((m) => m.progress < 50).length },
          ].map((item) => (
            <div key={item.range} className="flex justify-between items-center">
              <span className="font-medium text-slate-700">{item.range}</span>
              <span className="font-bold text-indigo-600">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ RESOURCES SECTION ============
function ResourcesSection({ members }: { members: InstitutionMember[] }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Institutional Resources
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: "Course Library",
            desc: "Access all institutional courses",
            icon: "📚",
            count: 25,
          },
          {
            title: "Study Materials",
            desc: "Shared notes and resources",
            icon: "📖",
            count: 128,
          },
          {
            title: "Mock Tests",
            desc: "Practice exams for students",
            icon: "📝",
            count: 42,
          },
          {
            title: "E-Books",
            desc: "Digital library collection",
            icon: "📕",
            count: 89,
          },
          {
            title: "Video Lectures",
            desc: "Recorded class sessions",
            icon: "🎥",
            count: 156,
          },
          {
            title: "Q&A Bank",
            desc: "Question and answer database",
            icon: "❓",
            count: 312,
          },
        ].map((resource, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-md transition-shadow text-center"
          >
            <p className="text-4xl mb-3">{resource.icon}</p>
            <h3 className="font-bold text-slate-900 mb-1">{resource.title}</h3>
            <p className="text-sm text-slate-600 mb-4">{resource.desc}</p>
            <p className="text-2xl font-bold text-indigo-600">{resource.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ SETTINGS SECTION ============
function SettingsSection({ profile }: { profile: any }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Institutional Settings
      </h2>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">
                Institution Name
              </label>
              <input
                type="text"
                defaultValue={profile?.institution || ""}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">
                Contact Email
              </label>
              <input
                type="email"
                defaultValue={profile?.email || ""}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">
                Phone
              </label>
              <input
                type="tel"
                defaultValue={profile?.phone || ""}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <button className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors">
              Save Changes
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">Subscription Plan</h3>
          <div className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <p className="text-sm text-slate-600">
              Current Plan: <span className="font-bold text-indigo-600">Professional</span>
            </p>
            <p className="text-sm text-slate-600 mt-1">
              100 students • $500/month
            </p>
          </div>
          <button className="w-full py-2.5 border-2 border-indigo-600 text-indigo-600 rounded-lg font-bold hover:bg-indigo-50 transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
}