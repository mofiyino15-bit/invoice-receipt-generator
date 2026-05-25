import React, { useState } from "react";
import BokLogo from "./BokLogo";

interface SignUpProps {
  onNavigate: (route: string, params?: Record<string, any>) => void;
}

export default function SignUp({ onNavigate }: SignUpProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please specify a valid email address";
    }
    if (!company.trim()) newErrors.company = "Company/Business name is required";
    if (!password || password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Registration successful in mock ecosystem! Logging you in...");
      onNavigate("dashboard");
    }, 1200);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white select-none" id="signup-container-root">
      {/* LEFT PANEL: Shared clouds background */}
      <div className="relative hidden md:flex md:w-1/2 h-full overflow-hidden" id="signup-left-panel">
        <img
          src="/src/assets/images/ribbon_backdrop_1779651790316.png"
          alt="Serene skies with ribbon"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        {/* Centered large WELCOME display overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-8 bg-black/5">
          <h2 className="text-white text-5xl lg:text-7xl font-sans tracking-[0.25em] font-extrabold uppercase text-center select-none">
            WELCOME
          </h2>
        </div>
      </div>

      {/* RIGHT PANEL: Pure white aesthetic form */}
      <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center bg-white px-6 sm:px-16 py-12 relative overflow-y-auto" id="signup-right-panel">
        
        {/* Back navigation button */}
        <div className="absolute top-6 left-6" id="signup-top-back-nav">
          <button
            onClick={() => onNavigate("login")}
            className="flex items-center gap-1.5 text-xs font-bold text-grey-500 hover:text-grey-900 transition-colors uppercase tracking-widest cursor-pointer"
          >
            &larr; Back to login
          </button>
        </div>

        <div className="w-full max-w-[380px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5" id="signup-brandmark-header">
            <BokLogo size={16} />
            <span className="text-xl font-bold tracking-tight text-grey-900 uppercase font-sans">Bōk</span>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-grey-900 tracking-tight font-sans">Sign Up</h1>
            <p className="text-xs text-grey-450 font-secondary">Start drafting clean ledger settlements today</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" id="signup-form">
            {/* Full Name */}
            <div className="space-y-1">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    const next = { ...errors };
                    delete next.name;
                    setErrors(next);
                  }
                }}
                className={`w-full bg-transparent border-b py-2.5 text-sm text-grey-900 placeholder-grey-450 focus:outline-none focus:border-grey-900 transition-colors font-sans ${
                  errors.name ? "border-red-500" : "border-grey-100"
                }`}
              />
              {errors.name && <p className="text-[11px] text-red-600 font-bold mt-1">{errors.name}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <input
                type="text"
                placeholder="Email Address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    const next = { ...errors };
                    delete next.email;
                    setErrors(next);
                  }
                }}
                className={`w-full bg-transparent border-b py-2.5 text-sm text-grey-900 placeholder-grey-450 focus:outline-none focus:border-grey-900 transition-colors font-sans ${
                  errors.email ? "border-red-500" : "border-grey-100"
                }`}
              />
              {errors.email && <p className="text-[11px] text-red-600 font-bold mt-1">{errors.email}</p>}
            </div>

            {/* Business Name */}
            <div className="space-y-1">
              <input
                type="text"
                placeholder="Business/Company Name"
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  if (errors.company) {
                    const next = { ...errors };
                    delete next.company;
                    setErrors(next);
                  }
                }}
                className={`w-full bg-transparent border-b py-2.5 text-sm text-grey-900 placeholder-grey-450 focus:outline-none focus:border-grey-900 transition-colors font-sans ${
                  errors.company ? "border-red-500" : "border-grey-100"
                }`}
              />
              {errors.company && <p className="text-[11px] text-red-600 font-bold mt-1">{errors.company}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    const next = { ...errors };
                    delete next.password;
                    setErrors(next);
                  }
                }}
                className={`w-full bg-transparent border-b py-2.5 text-sm text-grey-900 placeholder-grey-450 focus:outline-none focus:border-grey-900 transition-colors font-sans ${
                  errors.password ? "border-red-500" : "border-grey-100"
                }`}
              />
              {errors.password && <p className="text-[11px] text-red-600 font-bold mt-1">{errors.password}</p>}
            </div>

            {/* Submit Button - matching web app buttons: px-5 py-2.5, rounded-lg, font-semibold */}
            <button
               type="submit"
               disabled={loading}
               className="w-full px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-grey-300 text-white font-semibold rounded-lg text-sm tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500/10 mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <span>Register</span>
              )}
            </button>
          </form>

          {/* Toggle Switcher */}
          <div className="text-center pt-2" id="signup-footer-switcher">
            <p className="text-sm text-grey-500 font-secondary">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => onNavigate("login")}
                className="text-grey-900 font-bold ml-1 hover:text-black hover:underline cursor-pointer transition-all"
              >
                Login
              </button>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
