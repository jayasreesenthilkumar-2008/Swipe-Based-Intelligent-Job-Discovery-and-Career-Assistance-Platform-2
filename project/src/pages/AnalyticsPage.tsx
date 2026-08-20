import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Application, Swipe, Resume, Job } from '@/lib/types';
import {
  applicationStatusLabels,
  applicationStatusColors,
  getMatchColor,
} from '@/lib/utils';
import {
  BarChart3,
  Heart,
  FileText,
  TrendingUp,
  Target,
  Award,
  Clock,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { profile } = useAuth();
  const [swipes, setSwipes] = useState<Swipe[]>([]);
  const [applications, setApplications] = useState<(Application & { job: Job })[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: swipeData }, { data: appData }, { data: resumeData }] = await Promise.all([
        supabase.from('swipes').select('*').eq('user_id', profile?.id || ''),
        supabase.from('applications').select('*, job:jobs(*)').eq('user_id', profile?.id || ''),
        supabase.from('resumes').select('*').eq('user_id', profile?.id || ''),
      ]);

      setSwipes((swipeData as Swipe[]) || []);
      setApplications((appData as (Application & { job: Job })[]) || []);
      setResumes((resumeData as Resume[]) || []);
      setLoading(false);
    }
    load();
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="w-8 h-8 border-3 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  const rightSwipes = swipes.filter((s) => s.direction === 'right').length;
  const leftSwipes = swipes.filter((s) => s.direction === 'left').length;
  const swipeRate = swipes.length > 0 ? Math.round((rightSwipes / swipes.length) * 100) : 0;

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topResume = resumes.find((r) => r.is_primary) || resumes[0];
  const atsScore = topResume?.ats_score || 0;
  const atsColor = getMatchColor(atsScore);

  // Skill frequency from applications
  const skillFreq: Record<string, number> = {};
  applications.forEach((app) => {
    app.job?.skills_required?.forEach((s) => {
      skillFreq[s] = (skillFreq[s] || 0) + 1;
    });
  });
  const topSkills = Object.entries(skillFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const statCards = [
    { label: 'Total Swipes', value: swipes.length, icon: Heart, color: 'bg-rose-50 text-rose-600' },
    { label: 'Saved Jobs', value: rightSwipes, icon: Target, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Applications', value: applications.length, icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
    { label: 'Swipe Rate', value: `${swipeRate}%`, icon: BarChart3, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Insights into your job search activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${card.color}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <p className="text-xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Swipe breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            Swipe Activity
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-600">Saved (Right)</span>
                <span className="font-medium text-emerald-600">{rightSwipes}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all"
                  style={{ width: `${swipes.length > 0 ? (rightSwipes / swipes.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-600">Skipped (Left)</span>
                <span className="font-medium text-rose-600">{leftSwipes}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all"
                  style={{ width: `${swipes.length > 0 ? (leftSwipes / swipes.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ATS Score */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Resume ATS Score
          </h2>
          {atsScore > 0 ? (
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${atsColor.bg}`}>
                <span className={`text-2xl font-bold ${atsColor.text}`}>{atsScore}%</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-600">
                  {atsScore >= 75
                    ? 'Excellent! Your resume is well-optimized for ATS systems.'
                    : atsScore >= 50
                      ? 'Good start. There are some improvements you can make.'
                      : 'Your resume needs optimization. Check suggestions below.'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {topResume?.file_name || 'Primary resume'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <FileText className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">Upload a resume to get your ATS score</p>
            </div>
          )}
        </div>

        {/* Application status breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Application Status
          </h2>
          {applications.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No applications yet</p>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${applicationStatusColors[status as keyof typeof applicationStatusColors]}`}>
                    {applicationStatusLabels[status as keyof typeof applicationStatusLabels]}
                  </span>
                  <span className="text-sm font-medium text-slate-700">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top skills */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-400" />
            Most Common Skills in Your Jobs
          </h2>
          {topSkills.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No data yet</p>
          ) : (
            <div className="space-y-2">
              {topSkills.map(([skill, count]) => {
                const maxCount = topSkills[0][1];
                return (
                  <div key={skill}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{skill}</span>
                      <span className="font-medium text-slate-500">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-400 to-violet-500 rounded-full"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
