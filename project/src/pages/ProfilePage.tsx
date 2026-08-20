import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Resume } from '@/lib/types';
import {
  User,
  Upload,
  FileText,
  Trash2,
  Star,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lightbulb,
} from 'lucide-react';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [experienceYears, setExperienceYears] = useState(
    profile?.experience_years || 0,
  );
  const [education, setEducation] = useState(profile?.education || '');
  const [skillsInput, setSkillsInput] = useState(
    (profile?.skills || []).join(', '),
  );
  const [portfolioInput, setPortfolioInput] = useState(
    (profile?.portfolio_links || []).join(', '),
  );
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    ats_score: number;
    parsed_skills: string[];
    suggestions: string[];
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadResumes() {
      const { data } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', profile?.id || '')
        .order('created_at', { ascending: false });
      setResumes((data as Resume[]) || []);
    }
    loadResumes();
  }, [profile?.id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const portfolio = portfolioInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        bio,
        location,
        experience_years: experienceYears,
        education,
        skills,
        portfolio_links: portfolio,
      })
      .eq('id', profile?.id);

    await refreshProfile();
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${profile?.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file);

    if (uploadError) {
      setUploadError('Failed to upload file. Please try again.');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    const version = resumes.length + 1;
    const { data: resumeData } = await supabase
      .from('resumes')
      .insert({
        user_id: profile?.id,
        file_url: urlData.publicUrl,
        file_name: file.name,
        version,
        is_primary: resumes.length === 0,
      })
      .select('*')
      .single();

    if (resumeData) {
      const newResume = resumeData as Resume;
      setResumes((prev) => [newResume, ...prev]);

      // Analyze resume with edge function
      setAnalyzing(newResume.id);
      try {
        const fileText = await file.text();
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-resume`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              resumeId: newResume.id,
              resumeText: fileText,
            }),
          },
        );

        if (response.ok) {
          const result = await response.json();
          if (result.ats_score !== undefined) {
            setResumes((prev) =>
              prev.map((r) =>
                r.id === newResume.id
                  ? {
                      ...r,
                      ats_score: result.ats_score,
                      parsed_skills: result.parsed_skills,
                    }
                  : r,
              ),
            );
            setAnalysisResult(result);
            await refreshProfile();
          }
        }
      } catch {
        // Analysis failed silently — resume is still uploaded
      }
      setAnalyzing(null);
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function setPrimary(id: string) {
    await supabase
      .from('resumes')
      .update({ is_primary: false })
      .eq('user_id', profile?.id || '');
    await supabase
      .from('resumes')
      .update({ is_primary: true })
      .eq('id', id);
    setResumes((prev) =>
      prev.map((r) => ({ ...r, is_primary: r.id === id })),
    );
  }

  async function deleteResume(id: string) {
    await supabase.from('resumes').delete().eq('id', id);
    setResumes((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your information and resumes
        </p>
      </div>

      {/* Profile info */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <User className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">
              {profile?.full_name || 'Your name'}
            </p>
            <p className="text-sm text-slate-400 capitalize">{profile?.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Years of Experience
            </label>
            <input
              type="number"
              min="0"
              value={experienceYears}
              onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Education
            </label>
            <input
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. B.S. Computer Science"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Skills (comma-separated)
            </label>
            <input
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="React, TypeScript, Node.js"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Portfolio Links (comma-separated)
            </label>
            <input
              value={portfolioInput}
              onChange={(e) => setPortfolioInput(e.target.value)}
              placeholder="https://github.com/user, https://portfolio.com"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell employers about yourself..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : savedMsg ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : null}
            {saving ? 'Saving...' : savedMsg ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Resumes */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Resumes</h2>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-all disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        {uploadError && (
          <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-lg px-4 py-2.5 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {uploadError}
          </div>
        )}

        {resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <FileText className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-slate-500 text-sm mb-1">No resumes uploaded yet</p>
            <p className="text-slate-400 text-xs">
              Upload a PDF or DOCX to get AI-powered ATS scoring
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200"
              >
                <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-rose-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {resume.file_name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">
                      Version {resume.version}
                    </span>
                    {analyzing === resume.id ? (
                      <span className="text-xs font-medium text-blue-600 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Analyzing...
                      </span>
                    ) : (
                      <>
                        {resume.ats_score > 0 && (
                          <span className="text-xs text-slate-400">|</span>
                        )}
                        {resume.ats_score > 0 && (
                          <span className="text-xs font-medium text-emerald-600">
                            ATS Score: {resume.ats_score}%
                          </span>
                        )}
                        {resume.is_primary && (
                          <span className="text-xs font-medium text-amber-600 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            Primary
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {!resume.is_primary && (
                  <button
                    onClick={() => setPrimary(resume.id)}
                    title="Set as primary"
                    className="p-2 text-slate-400 hover:text-amber-500 transition-colors"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteResume(resume.id)}
                  title="Delete"
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ATS Analysis modal */}
      {analysisResult && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setAnalysisResult(null)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" />
                Resume Analysis
              </h2>
              <button
                onClick={() => setAnalysisResult(null)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {/* ATS Score */}
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                  analysisResult.ats_score >= 75 ? 'bg-emerald-100' :
                  analysisResult.ats_score >= 50 ? 'bg-amber-100' : 'bg-rose-100'
                }`}>
                  <span className={`text-2xl font-bold ${
                    analysisResult.ats_score >= 75 ? 'text-emerald-700' :
                    analysisResult.ats_score >= 50 ? 'text-amber-700' : 'text-rose-700'
                  }`}>
                    {analysisResult.ats_score}%
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">ATS Match Score</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {analysisResult.ats_score >= 75
                      ? 'Excellent! Your resume is well-optimized.'
                      : analysisResult.ats_score >= 50
                        ? 'Good. Some improvements can boost your score.'
                        : 'Needs work. See suggestions below.'}
                  </p>
                </div>
              </div>

              {/* Extracted skills */}
              {analysisResult.parsed_skills.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    Detected Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.parsed_skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Improvement Suggestions
                </p>
                <ul className="space-y-2">
                  {analysisResult.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setAnalysisResult(null)}
                className="w-full mt-5 py-3 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
