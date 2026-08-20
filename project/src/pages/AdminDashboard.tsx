import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile, Job } from '@/lib/types';
import {
  Users,
  Briefcase,
  Heart,
  Building2,
  Shield,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    seekers: 0,
    recruiters: 0,
    jobs: 0,
    swipes: 0,
    applications: 0,
  });
  const [recentUsers, setRecentUsers] = useState<Profile[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: profiles }, { count: jobCount }, { count: swipeCount }, { count: appCount }] =
        await Promise.all([
          supabase.from('profiles').select('*').order('created_at', { ascending: false }),
          supabase.from('jobs').select('*', { count: 'exact', head: true }),
          supabase.from('swipes').select('*', { count: 'exact', head: true }),
          supabase.from('applications').select('*', { count: 'exact', head: true }),
        ]);

      const profilesData = (profiles as Profile[]) || [];
      setRecentUsers(profilesData.slice(0, 10));
      setStats({
        users: profilesData.length,
        seekers: profilesData.filter((p) => p.role === 'seeker').length,
        recruiters: profilesData.filter((p) => p.role === 'recruiter').length,
        jobs: jobCount || 0,
        swipes: swipeCount || 0,
        applications: appCount || 0,
      });

      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      setRecentJobs((jobsData as Job[]) || []);

      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="w-8 h-8 border-3 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Job Seekers', value: stats.seekers, icon: Briefcase, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Recruiters', value: stats.recruiters, icon: Building2, color: 'bg-amber-50 text-amber-600' },
    { label: 'Active Jobs', value: stats.jobs, icon: Briefcase, color: 'bg-violet-50 text-violet-600' },
    { label: 'Total Swipes', value: stats.swipes, icon: Heart, color: 'bg-rose-50 text-rose-600' },
    { label: 'Applications', value: stats.applications, icon: TrendingUp, color: 'bg-teal-50 text-teal-600' },
  ];

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Platform overview and moderation</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            Recent Users
          </h2>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No users yet</p>
          ) : (
            <div className="space-y-2">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 py-2">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    {user.role === 'admin' ? (
                      <Shield className="w-4 h-4 text-slate-500" />
                    ) : user.role === 'recruiter' ? (
                      <Building2 className="w-4 h-4 text-slate-500" />
                    ) : (
                      <Briefcase className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user.full_name || 'Unnamed'}
                    </p>
                    <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent jobs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-slate-400" />
            Recent Jobs
          </h2>
          {recentJobs.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No jobs posted yet</p>
          ) : (
            <div className="space-y-2">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center gap-3 py-2">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{job.title}</p>
                    <p className="text-xs text-slate-400 truncate">{job.company}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${job.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {job.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
