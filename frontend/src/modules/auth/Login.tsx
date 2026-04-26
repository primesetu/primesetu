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
import {
  Lock,
  User,
  Terminal,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Zap,
  Globe,
  Cpu
} from "lucide-react";
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
    <div className="fixed inset-0 z-[200] bg-[#0a0a0c] flex items-center justify-center p-6 overflow-hidden font-sans">
      
      {/* ── CINEMATIC BACKGROUND ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-gold/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-navy/20 blur-[150px] rounded-full" />
        
        {/* Animated Grid Lines (Tesla Style) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        {/* ── SYSTEM STATUS BAR ── */}
        <div className="flex justify-between items-center px-8 mb-8">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
             <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">System Secure · Node 01</span>
          </div>
          <div className="flex items-center gap-4 text-[9px] font-black text-white/20 uppercase tracking-widest">
             <span className="flex items-center gap-1"><Globe size={10}/> ASIA/MUMBAI</span>
             <span className="flex items-center gap-1"><Cpu size={10}/> OS 2.4.0</span>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden">
          
          {/* Internal Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-gold/5 blur-3xl rounded-full" />

          <div className="text-center mb-12">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex w-24 h-24 bg-gradient-to-br from-brand-gold to-saffron rounded-[2.5rem] items-center justify-center shadow-[0_20px_40px_-10px_rgba(244,162,97,0.3)] mb-8"
            >
              <Zap className="w-10 h-10 text-navy fill-navy" />
            </motion.div>
            
            <h1 className="text-5xl font-black text-white tracking-tighter mb-3" style={{ fontFamily: 'var(--font-tesla)' }}>
              PrimeSetu
            </h1>
            
            <AnimatePresence mode="wait">
               <motion.p 
                 key={bootStep}
                 initial={{ opacity: 0, y: 5 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -5 }}
                 className="text-[10px] text-brand-gold font-black uppercase tracking-[0.5em] h-4"
               >
                 {["INITIALIZING...", "SECURING NODE...", "LOADING MASTERS...", "READY FOR AUTH"][bootStep]}
               </motion.p>
            </AnimatePresence>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl flex items-start gap-4"
              >
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-rose-200 leading-relaxed uppercase tracking-wider">
                  {error}
                </p>
              </motion.div>
            )}

            <div className="space-y-3">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] ml-6">
                Terminal ID
              </label>
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-brand-gold transition-colors" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="USERNAME_X01"
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-16 pr-8 py-5 text-sm font-black text-white outline-none focus:border-brand-gold/50 focus:bg-white/5 transition-all shadow-2xl placeholder:text-white/10 tracking-widest uppercase"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] ml-6">
                Security Token
              </label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-brand-gold transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-16 pr-8 py-5 text-sm font-black text-white outline-none focus:border-brand-gold/50 focus:bg-white/5 transition-all shadow-2xl placeholder:text-white/10 tracking-widest"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-20 bg-brand-gold text-navy rounded-3xl font-black text-xs tracking-[0.4em] uppercase shadow-[0_20px_40px_-10px_rgba(244,162,97,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-navy border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Establish Connection
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3 text-white/20">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">
                AES-256 Encrypted
              </span>
            </div>
            <div className="text-[9px] font-black text-white/10 uppercase tracking-widest italic">
              Property of AITDL Network
            </div>
          </div>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12 text-[9px] text-white/20 font-black tracking-[0.5em] uppercase"
        >
          PrimeSetu Retail OS • Institutional Build
        </motion.p>
      </motion.div>
    </div>
  );
}
