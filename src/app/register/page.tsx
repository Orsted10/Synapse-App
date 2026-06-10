"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Lock, Mail, User, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        }
      }
    });

    if (error) {
      alert(error.message);
      setIsLoading(false);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex items-center justify-center relative transition-colors duration-300">
      
      {/* Premium Background Gradient Blob */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="z-10 w-full max-w-[420px] p-8 glass-panel rounded-2xl premium-shadow relative"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-accent text-white rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg font-bold text-2xl">
            S
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Create an account
          </h1>
          <p className="text-muted text-sm">
            Join the Synapse Society
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground block">
              Email Address
            </label>
            <div className="flex items-center bg-secondary/50 p-3 rounded-xl border border-subtle focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all relative overflow-hidden group">
              <Mail size={18} className="text-muted group-focus-within:text-accent mr-3 transition-colors" />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none outline-none text-foreground w-full placeholder:text-muted"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground block">
              Username
            </label>
            <div className="flex items-center bg-secondary/50 p-3 rounded-xl border border-subtle focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all relative overflow-hidden group">
              <User size={18} className="text-muted group-focus-within:text-accent mr-3 transition-colors" />
              <input 
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-transparent border-none outline-none text-foreground w-full placeholder:text-muted"
                placeholder="What should we call you?"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground block">
              Password
            </label>
            <div className="flex items-center bg-secondary/50 p-3 rounded-xl border border-subtle focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all relative overflow-hidden group">
              <Lock size={18} className="text-muted group-focus-within:text-accent mr-3 transition-colors" />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-none outline-none text-foreground w-full placeholder:text-muted"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-accent hover:bg-accent-hover text-white transition-all py-3 rounded-xl flex items-center justify-center gap-2 font-medium shadow-md disabled:opacity-70 disabled:hover:bg-accent"
          >
            {isLoading ? "Creating account..." : "Continue"}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-muted">
          Already have an account? <Link href="/login" className="text-accent hover:text-accent-hover font-medium ml-1 transition-colors">Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
}
