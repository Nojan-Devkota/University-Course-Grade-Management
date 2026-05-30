"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  MapPin,
  Hash,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createStudent } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    student_number: "",
    email: "",
    password: "",
    home_address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createStudent({
        ...form,
        home_address: form.home_address || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#ff6b8b] via-[#ff9a76] to-[#fff382] flex items-center justify-center p-4 relative overflow-hidden font-sans text-zinc-950 selection:bg-zinc-950 selection:text-white">

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md my-12"
      >
        <Link href="/" className="flex items-center justify-center gap-3 mb-8 group">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] group-hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
              <GraduationCap className="w-6 h-6 text-zinc-950" />
            </div>
          </div>
          <span className="text-3xl font-black text-zinc-950 tracking-tight uppercase">
            UniGrade
          </span>
        </Link>

        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl uppercase tracking-tighter">Create Account</CardTitle>
            <CardDescription className="text-zinc-950 font-bold">Register as a new student</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-8"
                >
                  <CheckCircle2 className="w-16 h-16 text-[#6ee7b7] mb-4" />
                  <h3 className="text-xl font-black uppercase tracking-tight text-zinc-950 mb-2">
                    Registration Successful!
                  </h3>
                  <p className="text-sm font-bold text-zinc-600">Redirecting to login...</p>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 rounded-xl bg-[#ff4b4b] border-2 border-zinc-950 text-white font-bold text-sm shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-black uppercase text-zinc-950">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-950 font-bold" />
                        <Input
                          value={form.first_name}
                          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                          placeholder="John"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black uppercase text-zinc-950">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-950 font-bold" />
                        <Input
                          value={form.last_name}
                          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                          placeholder="Doe"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase text-zinc-950">Student Number</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-950 font-bold" />
                      <Input
                        value={form.student_number}
                        onChange={(e) => setForm({ ...form, student_number: e.target.value })}
                        placeholder="AO1234567"
                        pattern="^AO\d{7}$"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase text-zinc-950">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-950 font-bold" />
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="john.doe@university.edu"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase text-zinc-950">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-950 font-bold" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Min. 8 characters"
                        className="pl-10 pr-10"
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-950 hover:text-zinc-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase text-zinc-950">
                      Home Address <span className="text-zinc-500">(Optional)</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-950 font-bold" />
                      <Input
                        value={form.home_address}
                        onChange={(e) => setForm({ ...form, home_address: e.target.value })}
                        placeholder="123 Main St, Anytown, USA"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 uppercase tracking-tight"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-6 text-center">
              <p className="text-sm font-bold text-zinc-950">
                Already have an account?{" "}
                <Link href="/login" className="text-[#ec4899] hover:text-zinc-950 hover:underline transition-colors font-black uppercase">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
