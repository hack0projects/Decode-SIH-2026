import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

export default function Login({ onLoginSuccess }) {
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to CodeSeekho AI</h2>
        <p className="text-slate-500 mb-6">Login to access your Dashboard & Analytics</p>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">{error}</div>}

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm cursor-pointer"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}