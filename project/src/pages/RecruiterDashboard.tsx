import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Job, Application, ApplicationStatus, CompanyType, JobType, WorkMode, ExperienceLevel } from '@/lib/types';
import {
  companyTypeLabels,
  jobTypeLabels,
  workModeLabels,
  experienceLevelLabels,
  applicationStatusLabels,
  applicationStatusColors,
  formatSalary,
  timeAgo,
} from '@/lib/utils';
import {
  Briefcase,
  Plus,
  Building2,
  Users,
  TrendingUp,
  X,
  Eye,
  Trash2,
  Loader2,
  Inbox,
} from 'lucide-react';

interface JobWithStats extends Job {
  applicant_count: number;
}

export default function RecruiterDashboard() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<JobWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobWithStats | null>(null);
  const [applicants, setApplicants] = useState<(Application & { profile: { full_name: string; skills: string[] } })[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [companyType, setCompanyType] = useState<CompanyType>('startup');
  const [description, setDescription] = useState('');
  const [jobType, setJobType] = useState<JobType>('full_time');
  const [workMode, setWorkMode] = useState<WorkMode>('remote');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState(0);
  const [salaryMax, setSalaryMax] = useState(0);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('mid');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    async function loadJobs() {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('recruiter_id', profile?.id || '')
        .order('created_at', { ascending: false });

      const jobsData = data as Job[] || [];

      const jobsWithStats = await Promise.all(
        jobsData.map(async (job) => {
          const { count } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', job.id);
          return { ...job, applicant_count: count || 0 };
        }),
      );

      setJobs(jobsWithStats);
      setLoading(false);
    }
    loadJobs();
  }, [profile?.id]);

  async function handlePostJob(e: React.FormEvent) {
    e.preventDefault();
    setPosting(true);

    const skills = skillsRequired.split(',').map((s) => s.trim()).filter(Boolean);

    const { data } = await supabase
      .from('jobs')
      .insert({
        recruiter_id: profile?.id,
        title,
        company,
        company_type: companyType,
        description,
        job_type: jobType,
        work_mode: workMode,
        location,
        salary_min: salaryMin,
        salary_max: salaryMax,
        experience_level: experienceLevel,
        skills_required: skills,
        is_active: true,
      })
      .select('*')
      .single();

    if (data) {
      setJobs((prev) => [{ ...(data as Job), applicant_count: 0 }, ...prev]);
    }

    // Reset form
    setTitle('');
    setCompany('');
    setDescription('');
    setLocation('');
    setSalaryMin(0);
    setSalaryMax(0);
    setSkillsRequired('');
    setPosting(false);
    setShowPostModal(false);
  }

  async function loadApplicants(jobId: string) {
    const { data } = await supabase
      .from('applications')
      .select('*, profile:profiles(full_name, skills)')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });
    setApplicants((data as (Application & { profile: { full_name: string; skills: string[] } })[]) || []);
  }

  async function updateApplicantStatus(appId: string, status: ApplicationStatus) {
    await supabase.from('applications').update({ status }).eq('id', appId);
    setApplicants((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status } : a)),
    );
  }

  async function deleteJob(jobId: string) {
    await supabase.from('jobs').delete().eq('id', jobId);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    setSelectedJob(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="w-8 h-8 border-3 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  const totalApplicants = jobs.reduce((sum, j) => sum + j.applicant_count, 0);

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recruiter Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your job postings and applicants</p>
        </div>
        <button
          onClick={() => setShowPostModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          Post a Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{jobs.length}</p>
              <p className="text-xs text-slate-400">Active Jobs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalApplicants}</p>
              <p className="text-xs text-slate-400">Total Applicants</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {jobs.length > 0 ? Math.round(totalApplicants / jobs.length) : 0}
              </p>
              <p className="text-xs text-slate-400">Avg per Job</p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs list */}
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500 text-sm mb-4">No job postings yet</p>
          <button
            onClick={() => setShowPostModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600"
          >
            <Plus className="w-4 h-4" />
            Post your first job
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm truncate">{job.title}</h3>
                <p className="text-slate-500 text-xs truncate">{job.company}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-slate-400">{jobTypeLabels[job.job_type]}</span>
                  <span className="text-xs text-slate-400">{workModeLabels[job.work_mode]}</span>
                  <span className="text-xs text-slate-400">{timeAgo(job.posted_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-medium text-slate-600">{job.applicant_count}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedJob(job);
                    loadApplicants(job.id);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800"
                >
                  View
                </button>
                <button
                  onClick={() => deleteJob(job.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post job modal */}
      {showPostModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowPostModal(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-slate-900">Post a New Job</h2>
              <button
                onClick={() => setShowPostModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePostJob} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Company</label>
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    placeholder="e.g. Acme Inc"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Type</label>
                  <select
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value as CompanyType)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm"
                  >
                    {Object.entries(companyTypeLabels).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe the role and responsibilities..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Type</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value as JobType)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm"
                  >
                    {Object.entries(jobTypeLabels).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Work Mode</label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm"
                  >
                    {Object.entries(workModeLabels).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm"
                  >
                    {Object.entries(experienceLevelLabels).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Salary Min</label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Salary Max</label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Required Skills (comma-separated)</label>
                <input
                  value={skillsRequired}
                  onChange={(e) => setSkillsRequired(e.target.value)}
                  placeholder="React, TypeScript, Node.js"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={posting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-medium text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {posting ? 'Posting...' : 'Post Job'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Applicants modal */}
      {selectedJob && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedJob.title}</h2>
                <p className="text-sm text-slate-500">{selectedJob.company}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4">
                {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
              </p>
              {applicants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <Users className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-sm">No applicants yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applicants.map((app) => (
                    <div key={app.id} className="p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {app.profile?.full_name || 'Anonymous'}
                          </p>
                          {app.profile?.skills && app.profile.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {app.profile.skills.slice(0, 4).map((s) => (
                                <span key={s} className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-600">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${applicationStatusColors[app.status]}`}>
                          {applicationStatusLabels[app.status]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(['applied', 'interview', 'shortlisted', 'offer', 'rejected'] as ApplicationStatus[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => updateApplicantStatus(app.id, s)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                              app.status === s
                                ? applicationStatusColors[s] + ' border-transparent'
                                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {applicationStatusLabels[s]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
