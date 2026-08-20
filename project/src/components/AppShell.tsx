import { useState, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import {
  Sparkles,
  Heart,
  LayoutGrid,
  Bell,
  User,
  Briefcase,
  Users,
  Shield,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

type NavItem = {
  id: string;
  label: string;
  icon: typeof Heart;
  roles: string[];
};

const navItems: NavItem[] = [
  { id: 'discover', label: 'Discover', icon: Heart, roles: ['seeker'] },
  { id: 'applications', label: 'Applications', icon: LayoutGrid, roles: ['seeker'] },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['seeker'] },
  { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['seeker'] },
  { id: 'profile', label: 'Profile', icon: User, roles: ['seeker'] },
  { id: 'recruiter', label: 'Dashboard', icon: Briefcase, roles: ['recruiter'] },
  { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['recruiter'] },
  { id: 'profile', label: 'Profile', icon: User, roles: ['recruiter'] },
  { id: 'admin', label: 'Dashboard', icon: Shield, roles: ['admin'] },
  { id: 'profile', label: 'Profile', icon: User, roles: ['admin'] },
];

interface AppShellProps {
  activeView: string;
  onNavigate: (view: string) => void;
  children: ReactNode;
}

export default function AppShell({
  activeView,
  onNavigate,
  children,
}: AppShellProps) {
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const items = navItems.filter((item) =>
    item.roles.includes(profile?.role || 'seeker'),
  );

  const roleIcon =
    profile?.role === 'recruiter'
      ? Users
      : profile?.role === 'admin'
        ? Shield
        : Briefcase;

  const RoleIcon = roleIcon;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-screen">
        <div className="p-5 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">SwipeX</span>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id + item.label}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-rose-50 text-rose-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <RoleIcon className="w-4 h-4 text-slate-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-slate-400 capitalize">
                {profile?.role}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">SwipeX</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 -mr-2 text-slate-600"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-black/40"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute top-14 right-0 left-0 bg-white shadow-lg p-3 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return (
                <button
                  key={item.id + item.label}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-rose-50 text-rose-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
