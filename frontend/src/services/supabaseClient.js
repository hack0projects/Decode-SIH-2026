import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;
let isMock = false;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Connected to Supabase client successfully.');
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    isMock = true;
  }
} else {
  console.warn('Supabase credentials not found in .env — running in mock mode.');
  isMock = true;
}

export { supabase };

export const videoService = {
  getChapterVideoUrl: async (chapterTitle = '', grade = '8', language = 'English') => {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const fallbackUrl = baseUrl
      ? `${baseUrl}/storage/v1/object/public/sih_videos/videos/v2_dd8d0e3f-7390-4728-b544-62ca31235894.mp4`
      : null;

    if (!supabase) return fallbackUrl;
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const titleLower = (chapterTitle || '').toLowerCase();
        
        // 1. Keyword Specific Matching
        if (titleLower.includes('while') || titleLower.includes('loop')) {
          const match = data.find(v => v.title.toLowerCase().includes('while') || v.title.toLowerCase().includes('loop'));
          if (match) return match.video_url;
        }
        if (titleLower.includes('for')) {
          const match = data.find(v => v.title.toLowerCase().includes('for loop'));
          if (match) return match.video_url;
        }
        if (language.toLowerCase() === 'punjabi' || language.toLowerCase() === 'pa') {
          const match = data.find(v => v.title.includes('ਜਮਾਤ'));
          if (match) return match.video_url;
        }

        // 2. Deterministic Hash Mapping by chapter title & grade so each class/chapter gets a distinct video!
        let hash = 0;
        const seed = `${chapterTitle}_class_${grade}_${language}`;
        for (let i = 0; i < seed.length; i++) {
          hash = (hash * 31 + seed.charCodeAt(i)) % 2147483647;
        }
        const index = Math.abs(hash) % data.length;
        return data[index].video_url;
      }
    } catch (err) {
      console.warn('Supabase video fetch fallback error:', err);
    }
    return fallbackUrl;
  }
};

// Local mock database helpers
const getLocalUsers = () => {
  const users = localStorage.getItem('codeseekho_mock_users');
  return users ? JSON.parse(users) : [];
};

const saveLocalUsers = (users) => {
  localStorage.setItem('codeseekho_mock_users', JSON.stringify(users));
};

export const authService = {
  isMock: () => isMock,

  signUp: async (email, password, role = 'student', fullName = '') => {
    if (!isMock && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role, full_name: fullName }
        }
      });
      if (error) throw error;
      return data;
    } else {
      // Local implementation
      const users = getLocalUsers();
      if (users.find(u => u.email === email)) {
        throw new Error('User already exists');
      }
      const newUser = { id: Math.random().toString(36).substring(7), email, password, role, fullName };
      users.push(newUser);
      saveLocalUsers(users);
      
      // Auto login
      localStorage.setItem('codeseekho_current_session', JSON.stringify(newUser));
      return { user: newUser, session: { access_token: 'mock-token' } };
    }
  },

  signIn: async (email, password) => {
    if (!isMock && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return data;
    } else {
      // Local implementation
      const users = getLocalUsers();
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      localStorage.setItem('codeseekho_current_session', JSON.stringify(user));
      return { user, session: { access_token: 'mock-token' } };
    }
  },

  signOut: async () => {
    if (!isMock && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    localStorage.removeItem('codeseekho_current_session');
  },

  getCurrentUser: async () => {
    if (!isMock && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } else {
      const session = localStorage.getItem('codeseekho_current_session');
      return session ? JSON.parse(session) : null;
    }
  }
};
