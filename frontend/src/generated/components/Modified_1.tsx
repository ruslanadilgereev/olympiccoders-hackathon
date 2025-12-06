import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

// Custom Logo Component to match the screenshot style
const Logo = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wifi/Signal waves above */}
    <path d="M16 12C18.5 9.5 29.5 9.5 32 12" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
    <path d="M20 16C21.5 14.5 26.5 14.5 28 16" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
    
    {/* Envelope body */}
    <rect x="10" y="20" width="28" height="18" rx="4" stroke="#2563EB" strokeWidth="3" fill="none" />
    <path d="M10 22L24 31L38 22" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      {/* Main Card Container */}
      <div className="w-full max-w-[340px] bg-white rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] p-8 relative">
        
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-8">
          <div className="shrink-0">
            <Logo />
          </div>
          <div className="flex flex-col text-slate-800">
            <span className="text-xl font-medium leading-tight tracking-tight">Welcome</span>
            <span className="text-xl font-bold leading-tight tracking-tight">Back</span>
          </div>
        </div>

        {/* Form Section */}
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          
          {/* Email Input */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
              <Mail size={18} />
            </div>
            <input 
              type="email" 
              placeholder="Email Address"
              className="w-full bg-slate-50 border border-blue-200 text-slate-700 placeholder-gray-400 text-sm rounded-full py-3.5 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
              <Lock size={18} />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-blue-200 text-slate-700 placeholder-gray-400 text-sm rounded-full py-3.5 pl-11 pr-12 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Login Button */}
          <button 
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full py-3.5 shadow-[0_10px_20px_-5px_rgba(220,38,38,0.4)] active:scale-[0.98] transition-all mt-2 text-sm"
          >
            Log In
          </button>

          {/* Forgot Password */}
          <div className="text-center mt-3">
            <a href="#" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
              Forgot password?
            </a>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-500">
              Don't have an account?{' '}
              <a href="#" className="text-blue-600 font-bold hover:underline">
                Sign up
              </a>
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
