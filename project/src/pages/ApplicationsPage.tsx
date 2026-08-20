import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Application, ApplicationStatus, Job } from '@/lib/types';
import {
  applicationStatusLabels,
  applicationStatusColors,
  formatSalary,
  timeAgo,
  jobTypeLabels,
  workModeLabels,
} from '@/lib/utils';
import {
  LayoutGrid,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  ChevronRight,
  Inbox,
} from 'lucide-react';

const statusOrder: ApplicationStatus[] = [
  'saved',
  'applied',
  'interview',
  'shortlisted',
  'offer',
  'rejected',
];

const statusFlow: Record<ApplicationStatus, ApplicationStatus[]> = {
  saved: ['applied', 'rejected'],
  applied: ['interview', 'shortlisted', 'rejected'],
  interview: ['shortlisted', 'offer', 'rejected'],
  shortlisted: ['offer', 'rejected'],
  offer: [],
  rejected: [],
};

export default function ApplicationsPage() {
  const { profile } = useAuth();
  const [applications, setApplications] = useState<
    (Application & { job: Job })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('applications')
        .select('*, job:jobs(*)')
        .eq('user_id', profile?.id || '')
        .order('updated_at', { ascending: false });

      setApplications((data as (Application & { job: Job })[]) || []);
      setLoading(false);
    }
    load();
  }, [profile?.id]);

  async function updateStatus(appId: string, status: ApplicationStatus) {
    const updates: Partial<Application> = { status };
    if (status === 'applied' && !applications.find((a) => a.id === appId)?.applied_at) {
      updates.applied_at = new Date().toISOString();
    }
    await supabase.from('applications').update(updates).eq('id', appId);
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, ...updates } : a)),
    );
  }

  const filtered = filter === 'all'
    ? applications
    : applications.filter((a) => a.status === filter);

  const selectedApp = applications.find((a) => a.id === selected);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="w-8 h-8 border-3 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
        <p className="text-slate-500 text-sm mt-1">
          Track and manage your job applications
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            filter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All ({applications.length})
        </button>
        {statusOrder.map((status) => {
          const count = applications.filter((a) => a.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {applicationStatusLabels[status]} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500 text-sm">
            No applications here yet. Start swiping to save jobs!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div
              key={app.id}
              onClick={() => setSelected(app.id)}
              className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm truncate">
                  {app.job.title}
                </h3>
                <p className="text-slate-500 text-xs truncate">{app.job.company}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {app.job.location || workModeLabels[app.job.work_mode]}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {formatSalary(app.job.salary_min, app.job.salary_max, app.job.currency)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${applicationStatusColors[app.status]}`}
                >
                  {applicationStatusLabels[app.status]}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo(app.updated_at)}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Detail drawer */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-7 h-7 text-slate-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedApp.job.title}</h2>
                  <p className="text-slate-500 text-sm">{selectedApp.job.company}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                  Application Timeline
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="text-sm text-slate-600">
                      Saved — {timeAgo(selectedApp.created_at)}
                    </span>
                  </div>
                  {selectedApp.applied_at && (
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="text-sm text-slate-600">
                        Applied — {timeAgo(selectedApp.applied_at)}
                      </span>
                    </div>
                  )}
                  {selectedApp.status !== 'saved' && (
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        selectedApp.status === 'rejected' ? 'bg-rose-500' :
                        selectedApp.status === 'offer' ? 'bg-emerald-500' :
                        'bg-amber-500'
                      }`} />
                      <span className="text-sm text-slate-600">
                        {applicationStatusLabels[selectedApp.status]} — {timeAgo(selectedApp.updated_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status actions */}
              {selectedApp.status !== 'rejected' && selectedApp.status !== 'offer' && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    Update Status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {statusFlow[selectedApp.status].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          updateStatus(selectedApp.id, status);
                          setSelected(null);
                        }}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all hover:scale-105 ${
                          applicationStatusColors[status]
                        } border-transparent`}
                      >
                        Mark as {applicationStatusLabels[status]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelected(null)}
                className="w-full mt-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
