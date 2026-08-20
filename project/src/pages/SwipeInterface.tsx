import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Job, JobWithMatch, Resume, SwipeDirection, CompanyType, JobType, WorkMode, ExperienceLevel } from '@/lib/types';
import {
  calculateMatchScore,
  formatSalary,
  timeAgo,
  getMatchColor,
  companyTypeLabels,
  jobTypeLabels,
  workModeLabels,
  experienceLevelLabels,
} from '@/lib/utils';
import {
  Heart,
  X,
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  Building2,
  Zap,
  Star,
  RotateCcw,
  Info,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

interface SwipeCardProps {
  job: JobWithMatch;
  index: number;
  isTop: boolean;
  onSwipe: (direction: SwipeDirection) => void;
  dragState: { x: number; y: number };
  setDragState: (s: { x: number; y: number }) => void;
}

function SwipeCard({
  job,
  index,
  isTop,
  onSwipe,
  dragState,
  setDragState,
}: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const matchScore = job.match_score ?? 0;
  const matchColor = getMatchColor(matchScore);

  const rotation = isTop ? dragState.x * 0.06 : 0;
  const opacity = isTop ? 1 - Math.abs(dragState.x) / 500 : 1;
  const swipeRightOpacity = isTop
    ? Math.max(0, Math.min(1, dragState.x / 100))
    : 0;
  const swipeLeftOpacity = isTop
    ? Math.max(0, Math.min(1, -dragState.x / 100))
    : 0;

  function handlePointerDown(e: React.PointerEvent) {
    if (!isTop) return;
    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    cardRef.current?.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging.current || !isTop) return;
    setDragState({
      x: e.clientX - startPos.current.x,
      y: e.clientY - startPos.current.y,
    });
  }

  function handlePointerUp() {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragState.x > 120) {
      onSwipe('right');
    } else if (dragState.x < -120) {
      onSwipe('left');
    }
    setDragState({ x: 0, y: 0 });
  }

  const scale = 1 - index * 0.04;
  const translateY = index * 12;

  return (
    <div
      ref={cardRef}
      className="absolute inset-0"
      style={{
        transform: `translateY(${translateY}px) scale(${scale})`,
        zIndex: 10 - index,
        opacity: isTop ? opacity : 1,
        pointerEvents: isTop ? 'auto' : 'none',
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col cursor-grab active:cursor-grabbing select-none"
        style={{
          transform: `rotate(${rotation}deg) translateX(${isTop ? dragState.x : 0}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
        }}
      >
        {/* Swipe indicators */}
        {isTop && (
          <>
            <div
              className="absolute top-4 left-4 z-20 border-3 border-emerald-500 rounded-xl px-3 py-1.5 rotate-[-12deg] pointer-events-none"
              style={{ opacity: swipeRightOpacity }}
            >
              <span className="text-emerald-500 font-bold text-lg flex items-center gap-1">
                <Heart className="w-5 h-5 fill-emerald-500" /> SAVE
              </span>
            </div>
            <div
              className="absolute top-4 right-4 z-20 border-3 border-rose-500 rounded-xl px-3 py-1.5 rotate-[12deg] pointer-events-none"
              style={{ opacity: swipeLeftOpacity }}
            >
              <span className="text-rose-500 font-bold text-lg flex items-center gap-1">
                <X className="w-5 h-5" /> SKIP
              </span>
            </div>
          </>
        )}

        {/* Header gradient */}
        <div className="h-32 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 relative shrink-0">
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
            }}
          />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${matchColor.bg} ${matchColor.text}`}>
              {matchScore}% match
            </span>
          </div>
          <div className="absolute -bottom-6 left-6 w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center">
            <Building2 className="w-7 h-7 text-slate-400" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pt-8 pb-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {job.title}
            </h2>
          </div>
          <p className="text-slate-500 font-medium text-sm mb-3">{job.company}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
              <Briefcase className="w-3 h-3" />
              {jobTypeLabels[job.job_type]}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
              <MapPin className="w-3 h-3" />
              {job.location || workModeLabels[job.work_mode]}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
              <Building2 className="w-3 h-3" />
              {companyTypeLabels[job.company_type]}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
              <Star className="w-3 h-3" />
              {experienceLevelLabels[job.experience_level]}
            </span>
          </div>

          {/* Salary + time */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5 text-slate-700">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-sm">
                {formatSalary(job.salary_min, job.salary_max, job.currency)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              {timeAgo(job.posted_at)}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-4">
            {job.description}
          </p>

          {/* Skills */}
          <div className="mb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {job.skills_required.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SwipeInterface() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<JobWithMatch[]>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [dragState, setDragState] = useState({ x: 0, y: 0 });
  const [lastSwipe, setLastSwipe] = useState<{
    job: JobWithMatch;
    direction: SwipeDirection;
  } | null>(null);
  const [showDetail, setShowDetail] = useState<JobWithMatch | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    companyType: '' as CompanyType | '',
    jobType: '' as JobType | '',
    workMode: '' as WorkMode | '',
    experienceLevel: '' as ExperienceLevel | '',
    skill: '',
    location: '',
    sortByMatch: false,
  });

  const allJobsRef = useRef<JobWithMatch[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: resumeData } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', profile?.id || '')
        .eq('is_primary', true)
        .maybeSingle();
      setResume(resumeData as Resume | null);

      const { data: swipeData } = await supabase
        .from('swipes')
        .select('job_id')
        .eq('user_id', profile?.id || '');

      const swipedSet = new Set((swipeData || []).map((s) => s.job_id));
      setSwipedIds(swipedSet);

      const { data: jobData } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('posted_at', { ascending: false });

      const jobsWithScores = (jobData as Job[] || []).map((job) => ({
        ...job,
        match_score: calculateMatchScore(job, profile, resumeData as Resume | null),
      }));

      allJobsRef.current = jobsWithScores;
      setJobs(jobsWithScores);
      setLoading(false);
    }
    loadData();
  }, [profile, resume?.id]);

  async function handleSwipe(direction: SwipeDirection) {
    const currentJob = jobs[0];
    if (!currentJob) return;

    setLastSwipe({ job: currentJob, direction });

    await supabase.from('swipes').insert({
      user_id: profile?.id,
      job_id: currentJob.id,
      direction,
    });

    if (direction === 'right') {
      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('user_id', profile?.id || '')
        .eq('job_id', currentJob.id)
        .maybeSingle();

      if (!existing) {
        await supabase.from('applications').insert({
          user_id: profile?.id,
          job_id: currentJob.id,
          status: 'saved',
        });

        await supabase.from('notifications').insert({
          user_id: profile?.id,
          message: `You saved ${currentJob.title} at ${currentJob.company}`,
          type: 'match',
          link_id: currentJob.id,
        });
      }
    }

    setSwipedIds((prev) => new Set(prev).add(currentJob.id));
    setJobs((prev) => prev.slice(1));
    setDragState({ x: 0, y: 0 });
  }

  async function undoSwipe() {
    if (!lastSwipe) return;
    const { job, direction } = lastSwipe;

    await supabase
      .from('swipes')
      .delete()
      .eq('user_id', profile?.id || '')
      .eq('job_id', job.id);

    if (direction === 'right') {
      await supabase
        .from('applications')
        .delete()
        .eq('user_id', profile?.id || '')
        .eq('job_id', job.id);
    }

    setSwipedIds((prev) => {
      const next = new Set(prev);
      next.delete(job.id);
      return next;
    });
    setJobs((prev) => [job, ...prev]);
    setLastSwipe(null);
  }

  const visibleJobs = useMemo(() => jobs.slice(0, 3), [jobs]);

  const activeFilterCount = Object.values(filters).filter((v) => v !== '' && v !== false).length;

  function applyFilters() {
    let filtered = [...allJobsRef.current];
    if (filters.companyType) filtered = filtered.filter((j) => j.company_type === filters.companyType);
    if (filters.jobType) filtered = filtered.filter((j) => j.job_type === filters.jobType);
    if (filters.workMode) filtered = filtered.filter((j) => j.work_mode === filters.workMode);
    if (filters.experienceLevel) filtered = filtered.filter((j) => j.experience_level === filters.experienceLevel);
    if (filters.skill) filtered = filtered.filter((j) => j.skills_required.some((s) => s.toLowerCase().includes(filters.skill.toLowerCase())));
    if (filters.location) filtered = filtered.filter((j) => j.location.toLowerCase().includes(filters.location.toLowerCase()));
    if (filters.sortByMatch) filtered.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    setJobs(filtered);
  }

  function clearFilters() {
    setFilters({
      companyType: '', jobType: '', workMode: '', experienceLevel: '', skill: '', location: '', sortByMatch: false,
    });
    setJobs(allJobsRef.current);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="w-8 h-8 border-3 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Discover Jobs</h1>
            <p className="text-slate-500 text-sm mt-1">
              Swipe right to save, left to skip — {jobs.length} jobs remaining
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeFilterCount > 0 || showFilters
                ? 'bg-rose-500 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/30 text-xs">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-4 bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Company Type</label>
                <select
                  value={filters.companyType}
                  onChange={(e) => setFilters({ ...filters, companyType: e.target.value as CompanyType | '' })}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                >
                  <option value="">Any</option>
                  {Object.entries(companyTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Job Type</label>
                <select
                  value={filters.jobType}
                  onChange={(e) => setFilters({ ...filters, jobType: e.target.value as JobType | '' })}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                >
                  <option value="">Any</option>
                  {Object.entries(jobTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Work Mode</label>
                <select
                  value={filters.workMode}
                  onChange={(e) => setFilters({ ...filters, workMode: e.target.value as WorkMode | '' })}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                >
                  <option value="">Any</option>
                  {Object.entries(workModeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Experience</label>
                <select
                  value={filters.experienceLevel}
                  onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value as ExperienceLevel | '' })}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                >
                  <option value="">Any</option>
                  {Object.entries(experienceLevelLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Skill</label>
                <input
                  value={filters.skill}
                  onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                  placeholder="e.g. React"
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Location</label>
                <input
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  placeholder="e.g. San Francisco"
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.sortByMatch}
                  onChange={(e) => setFilters({ ...filters, sortByMatch: e.target.checked })}
                  className="w-4 h-4 rounded accent-rose-500"
                />
                Sort by best match
              </label>
              <div className="flex gap-2">
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50"
                >
                  Clear
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Zap className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            You're all caught up!
          </h2>
          <p className="text-slate-500 text-sm mb-6 max-w-sm">
            You've swiped through every available job. Check back later for new
            postings, or review your saved jobs.
          </p>
          {lastSwipe && (
            <button
              onClick={undoSwipe}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Undo last swipe
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Card stack */}
          <div className="flex-1 flex items-center justify-center px-4 pb-4">
            <div className="relative w-full max-w-sm h-[520px]">
              {visibleJobs.map((job, index) => (
                <SwipeCard
                  key={job.id}
                  job={job}
                  index={index}
                  isTop={index === 0}
                  onSwipe={handleSwipe}
                  dragState={dragState}
                  setDragState={setDragState}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 pb-6 px-6">
            <button
              onClick={() => handleSwipe('left')}
              className="w-14 h-14 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-rose-500 hover:scale-110 hover:shadow-xl transition-all active:scale-95"
              title="Skip"
            >
              <X className="w-7 h-7" />
            </button>
            <button
              onClick={undoSwipe}
              disabled={!lastSwipe}
              className="w-12 h-12 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-500 hover:scale-110 hover:shadow-lg transition-all active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
              title="Undo"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowDetail(jobs[0])}
              className="w-12 h-12 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-500 hover:scale-110 hover:shadow-lg transition-all active:scale-95"
              title="Details"
            >
              <Info className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleSwipe('right')}
              className="w-14 h-14 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-emerald-500 hover:scale-110 hover:shadow-xl transition-all active:scale-95"
              title="Save"
            >
              <Heart className="w-7 h-7" />
            </button>
          </div>
        </>
      )}

      {/* Detail modal */}
      {showDetail && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowDetail(null)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-t-3xl relative shrink-0">
              <button
                onClick={() => setShowDetail(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 pb-6 -mt-8">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-3">
                <Building2 className="w-7 h-7 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{showDetail.title}</h2>
              <p className="text-slate-500 text-sm mb-3">{showDetail.company}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  {jobTypeLabels[showDetail.job_type]}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  {showDetail.location || workModeLabels[showDetail.work_mode]}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  {companyTypeLabels[showDetail.company_type]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 mb-4">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-sm">
                  {formatSalary(showDetail.salary_min, showDetail.salary_max, showDetail.currency)}
                </span>
                <span className="text-slate-300">|</span>
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400">{timeAgo(showDetail.posted_at)}</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {showDetail.description}
              </p>
              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Required Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {showDetail.skills_required.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleSwipe('left');
                    setShowDetail(null);
                  }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50"
                >
                  Skip
                </button>
                <button
                  onClick={() => {
                    handleSwipe('right');
                    setShowDetail(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm hover:shadow-lg"
                >
                  Save Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
