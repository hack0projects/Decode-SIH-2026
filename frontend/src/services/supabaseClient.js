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

// Hardcoded list of generated Supabase video assets for reliable instant playback
const ALL_13_SUPABASE_VIDEOS = [
  "https://onktfqpazmjtrpruefha.supabase.co/storage/v1/object/public/sih_videos/videos/v2_dd8d0e3f-7390-4728-b544-62ca31235894.mp4", // Class 8 Masterclass
  "https://onktfqpazmjtrpruefha.supabase.co/storage/v1/object/public/sih_videos/videos/v2_7718e55f-f911-47d6-bf03-cd42416f09a3.mp4", // Class 9 Consolidated
  "https://onktfqpazmjtrpruefha.supabase.co/storage/v1/object/public/sih_videos/videos/v2_008dfde6-b048-4e2a-9cce-39be8074d8c4.mp4", // Class 10 Masterclass
  "https://onktfqpazmjtrpruefha.supabase.co/storage/v1/object/public/sih_videos/videos/v2_9c0884e3-0661-4556-b62a-f8d8fa22b264.mp4", // Class 11 Summary
  "https://onktfqpazmjtrpruefha.supabase.co/storage/v1/object/public/sih_videos/videos/v2_8b5801dd-6eae-4636-a255-505c7049cfd8.mp4", // Class 12 Async
  "https://onktfqpazmjtrpruefha.supabase.co/storage/v1/object/public/sih_videos/videos/v2_02d2076c-b58b-4a11-a210-6d0b8ba6650a.mp4", // Python Ecosystem
  "https://onktfqpazmjtrpruefha.supabase.co/storage/v1/object/public/sih_videos/videos/v2_8a640aea-3f88-4af9-a3ff-ed3d5c93f372.mp4", // Python Guide
  "https://onktfqpazmjtrpruefha.supabase.co/storage/v1/object/public/sih_videos/videos/v2_97d3f53c-e888-42af-ba44-51194b078a8d.mp4", // Python Essentials
  "https://onktfqpazmjtrpruefha.supabase.co/storage/v1/object/public/sih_videos/videos/v2_6fd0425b-a4f6-450e-8cf8-d82a65bcd3b8.mp4", // Advanced Syntax
  "https://onktfqpazmjtrpruefha.supabase.co/storage/v1/object/public/sih_videos/videos/41de4ef5-3030-4318-843c-99be85a377f8.mp4", // Fundamentals
  "https://onktfqpazmjtrpruefha.supabase.co/storage/v1/object/public/sih_videos/videos/4fbae94a-483d-4c0d-9f2e-5f5a91d5def8.mp4", // For Loops
  "https://onktfqpazmjtrpruefha.supabase.co/storage/v1/object/public/sih_videos/videos/38de6480-5f49-4971-97fa-1582aafb6d15.mp4", // While Loops
  "https://onktfqpazmjtrpruefha.supabase.co/storage/v1/object/public/sih_videos/videos/v2_3d69df68-121f-4534-aa18-b7a92705bf70.mp4"  // Punjabi Masterclass
];

export const videoService = {
  getChapterVideoUrl: async (chapterTitle = '', grade = '8', language = 'English') => {
    const titleLower = (chapterTitle || '').toLowerCase();
    const langLower = (language || '').toLowerCase();
    const gradeStr = String(grade || '8');

    // 1. Language specific overrides
    if (langLower === 'punjabi' || langLower === 'pa') {
      return ALL_13_SUPABASE_VIDEOS[12];
    }

    // 2. Concept specific overrides
    if (titleLower.includes('while') || titleLower.includes('loop')) {
      return ALL_13_SUPABASE_VIDEOS[11]; // While Loops
    }
    if (titleLower.includes('for')) {
      return ALL_13_SUPABASE_VIDEOS[10]; // For Loops
    }

    // 3. Class/Grade specific overrides
    if (gradeStr === '8') {
      return ALL_13_SUPABASE_VIDEOS[0]; // Class 8 Masterclass
    }
    if (gradeStr === '9') {
      return ALL_13_SUPABASE_VIDEOS[1]; // Class 9 Consolidated
    }
    if (gradeStr === '10') {
      return ALL_13_SUPABASE_VIDEOS[2]; // Class 10 Masterclass
    }
    if (gradeStr === '11') {
      return ALL_13_SUPABASE_VIDEOS[3]; // Class 11 Summary
    }
    if (gradeStr === '12') {
      return ALL_13_SUPABASE_VIDEOS[4]; // Class 12 Async
    }

    // 4. Try live Supabase query if client is active
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          let hash = 0;
          const seed = `${chapterTitle}_class_${grade}_${language}`;
          for (let i = 0; i < seed.length; i++) {
            hash = (hash * 31 + seed.charCodeAt(i)) % 2147483647;
          }
          const index = Math.abs(hash) % data.length;
          return data[index].video_url;
        }
      } catch (err) {
        console.warn('Supabase video fetch query error:', err);
      }
    }

    // 5. Deterministic hash across all 13 hardcoded links fallback
    let hash = 0;
    const seed = `${chapterTitle}_class_${grade}_${language}`;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) % 2147483647;
    }
    const index = Math.abs(hash) % ALL_13_SUPABASE_VIDEOS.length;
    return ALL_13_SUPABASE_VIDEOS[index];
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
