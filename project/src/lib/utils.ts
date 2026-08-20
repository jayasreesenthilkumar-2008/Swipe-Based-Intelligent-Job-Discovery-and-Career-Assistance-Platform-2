import type {
  Job,
  Profile,
  Resume,
  ApplicationStatus,
  ExperienceLevel,
  CompanyType,
  JobType,
  WorkMode,
} from './types';

export function formatSalary(min: number, max: number, currency: string): string {
  const symbol = currency === 'USD' ? '$' : currency + ' ';
  const fmt = (n: number) => {
    if (n >= 1000) return `${symbol}${(n / 1000).toFixed(0)}K`;
    return `${symbol}${n}`;
  };
  if (min === max && min > 0) return fmt(min);
  return `${fmt(min)} - ${fmt(max)}`;
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1 week ago';
  return `${weeks} weeks ago`;
}

export function getCompetitionLevel(applicantCount: number): {
  label: string;
  color: string;
} {
  if (applicantCount < 10) return { label: 'Low', color: 'text-emerald-600' };
  if (applicantCount < 30) return { label: 'Medium', color: 'text-amber-600' };
  return { label: 'High', color: 'text-rose-600' };
}

export function getMatchColor(score: number): {
  text: string;
  bg: string;
  ring: string;
} {
  if (score >= 75)
    return {
      text: 'text-emerald-700',
      bg: 'bg-emerald-100',
      ring: 'ring-emerald-500',
    };
  if (score >= 50)
    return {
      text: 'text-amber-700',
      bg: 'bg-amber-100',
      ring: 'ring-amber-500',
    };
  return {
    text: 'text-rose-700',
    bg: 'bg-rose-100',
    ring: 'ring-rose-500',
  };
}

export function calculateMatchScore(
  job: Job,
  profile: Profile | null,
  resume: Resume | null,
): number {
  const userSkills = new Set<string>(
    [
      ...(profile?.skills || []),
      ...(resume?.parsed_skills || []),
    ].map((s) => s.toLowerCase()),
  );

  if (userSkills.size === 0) return Math.floor(Math.random() * 30) + 50;

  const jobSkills = job.skills_required.map((s) => s.toLowerCase());
  const matched = jobSkills.filter((s) => userSkills.has(s)).length;
  const skillScore = jobSkills.length > 0 ? (matched / jobSkills.length) * 100 : 50;

  const levelMap: Record<ExperienceLevel, number> = {
    entry: 1,
    mid: 2,
    senior: 3,
    lead: 4,
  };
  const userLevel = Math.min(4, Math.max(1, Math.ceil((profile?.experience_years || 0) / 3)));
  const levelDiff = Math.abs(levelMap[job.experience_level] - userLevel);
  const levelScore = Math.max(0, 100 - levelDiff * 20);

  return Math.round(skillScore * 0.7 + levelScore * 0.3);
}

export const companyTypeLabels: Record<CompanyType, string> = {
  mnc: 'MNC',
  startup: 'Startup',
  new_startup: 'New Startup',
};

export const jobTypeLabels: Record<JobType, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  internship: 'Internship',
  contract: 'Contract',
};

export const workModeLabels: Record<WorkMode, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
};

export const experienceLevelLabels: Record<ExperienceLevel, string> = {
  entry: 'Entry level',
  mid: 'Mid level',
  senior: 'Senior',
  lead: 'Lead/Manager',
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  interview: 'Interview',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  offer: 'Offer',
};

export const applicationStatusColors: Record<ApplicationStatus, string> = {
  saved: 'bg-slate-100 text-slate-700',
  applied: 'bg-blue-100 text-blue-700',
  interview: 'bg-violet-100 text-violet-700',
  shortlisted: 'bg-amber-100 text-amber-700',
  rejected: 'bg-rose-100 text-rose-700',
  offer: 'bg-emerald-100 text-emerald-700',
};
