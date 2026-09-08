import type { Session, User } from '@supabase/supabase-js';
import type { Job, Profile, UserRole } from './types';
import { INITIAL_DEMO_JOBS, DEMO_PROFILES, DEMO_USERS } from './mockData';

const KEY_JOBS = 'swipex_jobs';
const KEY_PROFILES = 'swipex_profiles';
const KEY_USERS = 'swipex_users';
const KEY_SWIPES = 'swipex_swipes';
const KEY_APPLICATIONS = 'swipex_applications';
const KEY_RESUMES = 'swipex_resumes';
const KEY_NOTIFICATIONS = 'swipex_notifications';
const KEY_SESSION = 'swipex_session';

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Ignore localStorage quota errors
  }
}

// Seed initial state
export function initMockStorage() {
  if (!localStorage.getItem(KEY_JOBS)) {
    setItem(KEY_JOBS, INITIAL_DEMO_JOBS);
  }
  if (!localStorage.getItem(KEY_PROFILES)) {
    setItem(KEY_PROFILES, DEMO_PROFILES);
  }
  if (!localStorage.getItem(KEY_USERS)) {
    setItem(KEY_USERS, DEMO_USERS);
  }
  if (!localStorage.getItem(KEY_SWIPES)) {
    setItem(KEY_SWIPES, []);
  }
  if (!localStorage.getItem(KEY_APPLICATIONS)) {
    // Pre-populate 2 demo applications for Alex Johnson
    setItem(KEY_APPLICATIONS, [
      {
        id: 'demo-app-1',
        user_id: 'seeker-demo-id',
        job_id: '11111111-0000-0000-0000-000000000001',
        status: 'applied',
        cover_letter: '',
        applied_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      },
      {
        id: 'demo-app-2',
        user_id: 'seeker-demo-id',
        job_id: '11111111-0000-0000-0000-000000000002',
        status: 'interview',
        cover_letter: '',
        applied_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        created_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
      },
    ]);
  }
  if (!localStorage.getItem(KEY_RESUMES)) {
    setItem(KEY_RESUMES, [
      {
        id: 'demo-resume-1',
        user_id: 'seeker-demo-id',
        file_url: 'https://storage.local/resumes/resume-alex-v1.pdf',
        file_name: 'Alex_Johnson_Frontend_Resume.pdf',
        version: 1,
        parsed_skills: ['React', 'TypeScript', 'CSS', 'JavaScript', 'Git'],
        parsed_text: '',
        ats_score: 85,
        is_primary: true,
        created_at: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
      },
    ]);
  }
  if (!localStorage.getItem(KEY_NOTIFICATIONS)) {
    setItem(KEY_NOTIFICATIONS, [
      {
        id: 'demo-notif-1',
        user_id: 'seeker-demo-id',
        message: 'Welcome to SwipeX! Explore curated jobs and swipe to apply.',
        type: 'info',
        read: false,
        link_id: null,
        created_at: new Date().toISOString(),
      },
      {
        id: 'demo-notif-2',
        user_id: 'seeker-demo-id',
        message: 'Figma moved your application to the Interview stage!',
        type: 'interview',
        read: false,
        link_id: '11111111-0000-0000-0000-000000000002',
        created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      },
    ]);
  }
}

type AuthCallback = (event: string, session: Session | null) => void;
const authSubscribers: Set<AuthCallback> = new Set();

function notifyAuthSubscribers(event: string, session: Session | null) {
  authSubscribers.forEach((cb) => {
    try {
      cb(event, session);
    } catch {
      // Ignore callback errors
    }
  });
}

function makeSession(user: { id: string; email: string; role: UserRole; full_name: string }): Session {
  return {
    access_token: 'mock-token-' + user.id,
    refresh_token: 'mock-refresh-' + user.id,
    expires_in: 86400,
    expires_at: Math.floor(Date.now() / 1000) + 86400,
    token_type: 'bearer',
    user: {
      id: user.id,
      email: user.email,
      app_metadata: {},
      user_metadata: {
        role: user.role,
        full_name: user.full_name,
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User,
  };
}

class MockQueryBuilder {
  private tableName: string;
  private filters: Array<(item: Record<string, unknown>) => boolean> = [];
  private orderField: string | null = null;
  private orderAscending = true;
  private limitCount: number | null = null;
  private isSingle = false;
  private isMaybeSingle = false;
  private isHead = false;
  private selectCols = '*';

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  private getTableKey(): string {
    switch (this.tableName) {
      case 'jobs':
        return KEY_JOBS;
      case 'profiles':
        return KEY_PROFILES;
      case 'swipes':
        return KEY_SWIPES;
      case 'applications':
        return KEY_APPLICATIONS;
      case 'resumes':
        return KEY_RESUMES;
      case 'notifications':
        return KEY_NOTIFICATIONS;
      default:
        return 'swipex_' + this.tableName;
    }
  }

  private getItems(): Record<string, unknown>[] {
    initMockStorage();
    return getItem<Record<string, unknown>[]>(this.getTableKey(), []);
  }

  private setItems(items: Record<string, unknown>[]): void {
    setItem(this.getTableKey(), items);
  }

  select(columns = '*', options?: { count?: 'exact'; head?: boolean }) {
    this.selectCols = columns;
    if (options?.head) this.isHead = true;
    return this;
  }

  eq(field: string, val: unknown) {
    this.filters.push((item) => item[field] === val);
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderField = field;
    this.orderAscending = options?.ascending ?? true;
    return this;
  }

  limit(n: number) {
    this.limitCount = n;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  async insert(data: Record<string, unknown> | Record<string, unknown>[]) {
    const items = this.getItems();
    const rows = Array.isArray(data) ? data : [data];
    const inserted: Record<string, unknown>[] = rows.map((row) => ({
      id: (row.id as string) || crypto.randomUUID(),
      created_at: (row.created_at as string) || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...row,
    }));
    this.setItems([...inserted, ...items]);
    return {
      data: Array.isArray(data) ? inserted : inserted[0],
      error: null,
      select: () => ({
        single: async () => ({ data: inserted[0], error: null }),
      }),
    };
  }

  async upsert(data: Record<string, unknown>) {
    const items = this.getItems();
    const id = data.id || crypto.randomUUID();
    const existingIdx = items.findIndex((i) => i.id === id);

    let result: Record<string, unknown>;
    if (existingIdx >= 0) {
      result = { ...items[existingIdx], ...data, updated_at: new Date().toISOString() };
      items[existingIdx] = result;
    } else {
      result = { id, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...data };
      items.unshift(result);
    }
    this.setItems(items);
    return { data: result, error: null };
  }

  async update(updates: Record<string, unknown>) {
    const items = this.getItems();
    const updated = items.map((item) => {
      const match = this.filters.every((fn) => fn(item));
      if (match) {
        return { ...item, ...updates, updated_at: new Date().toISOString() };
      }
      return item;
    });
    this.setItems(updated);
    return { data: null, error: null };
  }

  async delete() {
    const items = this.getItems();
    const remaining = items.filter((item) => !this.filters.every((fn) => fn(item)));
    this.setItems(remaining);
    return { data: null, error: null };
  }

  // Execute query (thenable for await)
  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?: ((value: { data: unknown; count: number | null; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    const promise = (async () => {
      let items = this.getItems();

      // Apply filters
      if (this.filters.length > 0) {
        items = items.filter((item) => this.filters.every((fn) => fn(item)));
      }

      const totalCount = items.length;

      // Handle joins if requested
      if (this.tableName === 'applications') {
        const jobs = getItem<Job[]>(KEY_JOBS, INITIAL_DEMO_JOBS);
        const profiles = getItem<Profile[]>(KEY_PROFILES, DEMO_PROFILES);

        items = items.map((app) => {
          const joined: Record<string, unknown> = { ...app };
          if (this.selectCols.includes('job:jobs')) {
            joined.job = jobs.find((j) => j.id === app.job_id) || null;
          }
          if (this.selectCols.includes('profile:profiles')) {
            const prof = profiles.find((p) => p.id === app.user_id);
            joined.profile = prof ? { full_name: prof.full_name, skills: prof.skills } : null;
          }
          return joined;
        });
      }

      // Order
      if (this.orderField) {
        const field = this.orderField;
        const asc = this.orderAscending;
        items.sort((a, b) => {
          const valA = a[field] ?? '';
          const valB = b[field] ?? '';
          if (valA < valB) return asc ? -1 : 1;
          if (valA > valB) return asc ? 1 : -1;
          return 0;
        });
      }

      // Limit
      if (this.limitCount !== null) {
        items = items.slice(0, this.limitCount);
      }

      if (this.isHead) {
        return { data: null, count: totalCount, error: null };
      }

      if (this.isSingle || this.isMaybeSingle) {
        return { data: items[0] || null, count: totalCount, error: null };
      }

      return { data: items, count: totalCount, error: null };
    })();

    return promise.then(onfulfilled, onrejected);
  }
}

export const mockSupabase = {
  from(tableName: string) {
    return new MockQueryBuilder(tableName);
  },

  storage: {
    from() {
      return {
        async upload(filePath: string, file: File) {
          // Store fake public URL
          let url = '';
          try {
            url = URL.createObjectURL(file);
          } catch {
            url = 'https://storage.local/resumes/' + filePath;
          }
          sessionStorage.setItem('resume_url_' + filePath, url);
          return { data: { path: filePath }, error: null };
        },
        getPublicUrl(filePath: string) {
          const publicUrl =
            sessionStorage.getItem('resume_url_' + filePath) ||
            'https://storage.local/resumes/' + filePath;
          return { data: { publicUrl } };
        },
      };
    },
  },

  auth: {
    async getSession(): Promise<{ data: { session: Session | null }; error: null }> {
      initMockStorage();
      const saved = getItem<Session | null>(KEY_SESSION, null);
      return { data: { session: saved }, error: null };
    },

    onAuthStateChange(callback: AuthCallback) {
      initMockStorage();
      authSubscribers.add(callback);
      // Immediately invoke with current session
      const current = getItem<Session | null>(KEY_SESSION, null);
      if (current) {
        setTimeout(() => callback('INITIAL_SESSION', current), 0);
      }
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authSubscribers.delete(callback);
            },
          },
        },
      };
    },

    async signInWithPassword({
      email,
      password,
    }: {
      email: string;
      password: string;
    }): Promise<{ data: { session: Session | null; user: User | null }; error: { message: string } | null }> {
      initMockStorage();
      if (!password) {
        return { data: { session: null, user: null }, error: { message: 'Password is required' } };
      }

      const users = getItem<Array<{ id: string; email: string; role: UserRole; full_name: string; password?: string }>>(
        KEY_USERS,
        DEMO_USERS,
      );

      let found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      // If user not in list, auto-create Seeker profile so sign-in never blocks testing
      if (!found) {
        const id = crypto.randomUUID();
        const full_name = email.split('@')[0].replace('.', ' ');
        const newUser = {
          id,
          email,
          role: 'seeker' as UserRole,
          full_name,
        };
        users.push(newUser);
        setItem(KEY_USERS, users);

        const profiles = getItem<Profile[]>(KEY_PROFILES, DEMO_PROFILES);
        profiles.push({
          id,
          role: 'seeker',
          full_name,
          avatar_url: '',
          skills: ['JavaScript', 'React'],
          experience_years: 2,
          education: '',
          bio: '',
          portfolio_links: [],
          location: 'Remote',
          phone: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setItem(KEY_PROFILES, profiles);
        found = newUser;
      }

      const session = makeSession(found);
      setItem(KEY_SESSION, session);
      notifyAuthSubscribers('SIGNED_IN', session);

      return {
        data: { session, user: session.user },
        error: null,
      };
    },

    async signUp({
      email,
      password,
      options,
    }: {
      email: string;
      password: string;
      options?: { data?: { full_name?: string; role?: UserRole } };
    }): Promise<{ data: { session: Session | null; user: User | null }; error: { message: string } | null }> {
      initMockStorage();
      if (password.length < 6) {
        return { data: { session: null, user: null }, error: { message: 'Password must be at least 6 characters' } };
      }
      const users = getItem<Array<{ id: string; email: string; role: UserRole; full_name: string }>>(
        KEY_USERS,
        DEMO_USERS,
      );

      const id = crypto.randomUUID();
      const role: UserRole = options?.data?.role || 'seeker';
      const full_name = options?.data?.full_name || email.split('@')[0];

      const newUser = { id, email, role, full_name };
      // Replace or add
      const filtered = users.filter((u) => u.email.toLowerCase() !== email.toLowerCase());
      filtered.push(newUser);
      setItem(KEY_USERS, filtered);

      // Create profile
      const profiles = getItem<Profile[]>(KEY_PROFILES, DEMO_PROFILES);
      const profIdx = profiles.findIndex((p) => p.id === id);
      const newProfile: Profile = {
        id,
        role,
        full_name,
        avatar_url: '',
        skills: role === 'seeker' ? ['React', 'TypeScript'] : ['Recruiting'],
        experience_years: 2,
        education: '',
        bio: '',
        portfolio_links: [],
        location: '',
        phone: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (profIdx >= 0) {
        profiles[profIdx] = newProfile;
      } else {
        profiles.push(newProfile);
      }
      setItem(KEY_PROFILES, profiles);

      const session = makeSession(newUser);
      setItem(KEY_SESSION, session);
      notifyAuthSubscribers('SIGNED_IN', session);

      return {
        data: { session, user: session.user },
        error: null,
      };
    },

    async signOut(): Promise<{ error: null }> {
      setItem(KEY_SESSION, null);
      notifyAuthSubscribers('SIGNED_OUT', null);
      return { error: null };
    },
  },
};
