import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import type { UserRole } from '@/lib/types';
import {
  Briefcase,
  Users,
  Shield,
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const roles: {
  value: UserRole;
  label: string;
  desc: string;
  icon: typeof Briefcase;
}[] = [
  {
    value: 'seeker',
    label: 'Job Seeker',
    desc: 'Swipe and discover jobs',
    icon: Briefcase,
  },
  {
    value: 'recruiter',
    label: 'Recruiter',
    desc: 'Post jobs and manage hiring',
    icon: Users,
  },
  {
    value: 'admin',
    label: 'Admin',
    desc: 'Oversee the platform',
    icon: Shield,
  },
];

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('seeker');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your name');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName.trim(), role);
      if (error) setError(error);
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              SwipeX
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            Swipe right on your next opportunity
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Mode toggle */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'signin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Sign In
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    I am a...
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {roles.map((r) => {
                      const Icon = r.icon;
                      return (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setRole(r.value)}
                          className={`p-3 rounded-xl border-2 transition-all text-center ${
                            role === r.value
                              ? 'border-rose-500 bg-rose-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 mx-auto mb-1 ${
                              role === r.value
                                ? 'text-rose-500'
                                : 'text-slate-400'
                            }`}
                          />
                          <div
                            className={`text-xs font-medium ${
                              role === r.value
                                ? 'text-rose-700'
                                : 'text-slate-600'
                            }`}
                          >
                            {r.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm"
              />
            </div>

            {error && (
              <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-rose-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'signup' ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-5">
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() =>
                setMode(mode === 'signup' ? 'signin' : 'signup')
              }
              className="text-rose-500 font-medium hover:underline"
            >
              {mode === 'signup' ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
