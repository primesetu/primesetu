/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation     :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import logo from "@/assets/logo.png";

export default function Login({
  onLogin,
}: {
  onLogin: (role: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bootStep, setBootStep] = useState(0);

  // Cinematic Boot Sequence
  useEffect(() => {
    const steps = [
      "Initializing Sovereign Kernel...",
      "Securing Node Handshake...",
      "Loading Institutional Masters...",
      "Ready for Authorization"
    ];
    if (bootStep < steps.length - 1) {
      const timer = setTimeout(() => setBootStep(s => s + 1), 800);
      return () => clearTimeout(timer);
    }
  }, [bootStep]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Dev Bypass for testing
      if (username === 'admin' && password === 'admin') {
        onLogin("MANAGER");
        return;
      }
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: username.includes("@") ? username : `${username}@primesetu.io`,
        password: password,
      });

      if (authError) throw authError;

      if (data.user) {
        const role = data.user.user_metadata?.role || "CASHIER";
        onLogin(role);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Check Terminal Credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 overflow-hidden font-sans"
         style={{ background: 'var(--bg-base)' }}>

      {/* ── Background grid ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px]"
             style={{ background: 'rgba(99,102,241,0.06)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px]"
             style={{ background: 'rgba(99,102,241,0.04)' }} />
        <div className="absolute inset-0"
             style={{
               backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(to right, var(--border-subtle) 1px, transparent 1px)',
               backgroundSize: '48px 48px',
               maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 60%, transparent 100%)'
             }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* ── Card ── */}
        <div className="p-8 rounded-2xl" style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-default)' }}>

          {/* Logo + title */}
          <div className="text-center mb-8">
            <div className="inline-flex w-12 h-12 rounded-xl items-center justify-center mb-4"
                 style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>
              <Zap size={20} style={{ color: 'var(--accent-light)' }} />
            </div>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              PrimeSetu
            </h1>
            <AnimatePresence mode="wait">
              <motion.p
                key={bootStep}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs mt-1"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {["Initializing...", "Securing node...", "Loading masters...", "Ready for authorization"][bootStep]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-3 rounded-lg mb-5"
              style={{ background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <AlertCircle size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--red)' }} />
              <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="flabel mb-1.5">Username / Email</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                     style={{ color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  className="finput pl-9"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="flabel mb-1.5">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-tertiary)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="finput pl-9"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 h-9 rounded-lg font-medium text-sm transition-all disabled:opacity-50"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign in <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-4 flex items-center justify-between"
               style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={12} style={{ color: 'var(--text-tertiary)' }} />
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>AES-256</span>
            </div>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>AITDL Network</span>
          </div>
        </div>

        {/* Node status */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }} />
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Node 01 · Secure</span>
        </div>
      </motion.div>
    </div>
  );
}
