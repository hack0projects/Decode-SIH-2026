import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;
let isMock = true;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY') {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    isMock = false;
    console.log('Connected to Supabase client successfully.');
  } catch (error) {
    console.error('Failed to initialize Supabase, switching to LocalStorage Mock:', error);
  }
}

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
