/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  User,
  Terminal,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: username.includes("@") ? username : `${username}@primesetu.io`, // Allow terminal ID as prefix
          password: password,
        },
      );

      if (authError) throw authError;

      if (data.user) {
        const role = data.user.user_metadata?.role || "CASHIER";
        onLogin(role);
      }
    } catch (err: any) {
      setError(
        err.message || "Authentication failed. Please check your credentials.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#FAF7F2] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-navy/5 blur-[120px] rounded-full"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <div className="inline-flex w-24 h-24 bg-white rounded-[2.5rem] items-center justify-center shadow-2xl shadow-navy/10 mb-6 border border-navy/5">
            <img src={logo} alt="PrimeSetu Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-4xl font-serif font-black text-navy tracking-tight">
            PrimeSetu
          </h1>
          <p className="text-[10px] text-amber-600 font-black uppercase tracking-[0.4em] mt-2">
            Simple but Branded
          </p>
        </div>

        <div className="glass p-10 rounded-[3rem] shadow-2xl border border-white relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-saffron text-white px-6 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
            Sovereign Access
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-rose-700 leading-relaxed">
                  {error}
                </p>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-2">
                Terminal Identity
              </label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username / Terminal ID"
                  className="w-full bg-cream/50 border border-border rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none focus:border-navy focus:bg-white transition-all shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-2">
                Access Key
              </label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-cream/50 border border-border rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none focus:border-navy focus:bg-white transition-all shadow-inner"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-navy text-white py-5 rounded-2xl font-black text-xs tracking-widest shadow-2xl hover:bg-navy/90 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? "VERIFYING IDENTITY..." : "AUTHORIZE SESSION"}
              <ArrowRight className="w-4 h-4 text-gold" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-border flex items-center justify-center gap-2 text-muted">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-widest">
              End-to-End Encrypted Node
            </span>
          </div>
        </div>

        <p className="text-center mt-8 text-[9px] text-muted/60 font-medium tracking-tight">
          System Architect: Jawahar R. M. • © 2026 AITDL Network
        </p>
      </motion.div>
    </div>
  );
}
