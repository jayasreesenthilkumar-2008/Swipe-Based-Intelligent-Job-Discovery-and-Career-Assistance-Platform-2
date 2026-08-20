import { useState } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import AuthPage from '@/pages/AuthPage';
import AppShell from '@/components/AppShell';
import SwipeInterface from '@/pages/SwipeInterface';
import ApplicationsPage from '@/pages/ApplicationsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import ProfilePage from '@/pages/ProfilePage';
import RecruiterDashboard from '@/pages/RecruiterDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import AnalyticsPage from '@/pages/AnalyticsPage';
import { Sparkles } from 'lucide-react';

function AppContent() {
  const { session, profile, loading } = useAuth();
  const [view, setView] = useState('discover');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm text-slate-400">Loading SwipeX...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  const role = profile?.role || 'seeker';

  const getDefaultView = () => {
    if (role === 'recruiter') return 'recruiter';
    if (role === 'admin') return 'admin';
    return 'discover';
  };

  const activeView = view || getDefaultView();

  const renderView = () => {
    switch (activeView) {
      case 'discover':
        return <SwipeInterface />;
      case 'applications':
        return <ApplicationsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'recruiter':
        return <RecruiterDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return role === 'recruiter' ? (
          <RecruiterDashboard />
        ) : role === 'admin' ? (
          <AdminDashboard />
        ) : (
          <SwipeInterface />
        );
    }
  };

  return (
    <AppShell activeView={activeView} onNavigate={setView}>
      {renderView()}
    </AppShell>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
