"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Mail, Lock, User, ArrowRight, Eye, EyeOff, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { loginStudent, loginStaff } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [tab, setTab] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Student form
  const [email, setEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  // Staff form
  const [username, setUsername] = useState("");
  const [staffPassword, setStaffPassword] = useState("");

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await loginStudent(email.trim(), studentPassword);
      login(res.access_token, res.role);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await loginStaff(username.trim(), staffPassword);
      login(res.access_token, res.role);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
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

        {/* Login Card */}
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl uppercase tracking-tighter">Welcome Back</CardTitle>
            <CardDescription className="text-zinc-950 font-bold">
              Sign in to access your academic dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="student" className="gap-2 uppercase tracking-tight">
                  <User className="w-4 h-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="staff" className="gap-2 uppercase tracking-tight">
                  <Shield className="w-4 h-4" />
                  Staff
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 rounded-xl bg-[#ff4b4b] border-2 border-zinc-950 text-white font-bold text-sm shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <TabsContent value="student">
                <motion.form
                  key="student"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleStudentLogin}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase text-zinc-950" htmlFor="student-email">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-950 font-bold" />
                      <Input
                        id="student-email"
                        type="email"
                        placeholder="student@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase text-zinc-950" htmlFor="student-password">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-950 font-bold" />
                      <Input
                        id="student-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        className="pl-10 pr-10"
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
                  <Button
                    type="submit"
                    className="w-full h-12 uppercase tracking-tight"
                    disabled={loading}
                  >
                    {loading ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <>
                        Sign In as Student
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </motion.form>
              </TabsContent>

              <TabsContent value="staff">
                <motion.form
                  key="staff"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleStaffLogin}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase text-zinc-950" htmlFor="staff-username">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-950 font-bold" />
                      <Input
                        id="staff-username"
                        type="text"
                        placeholder="admin"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase text-zinc-950" htmlFor="staff-password">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-950 font-bold" />
                      <Input
                        id="staff-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        className="pl-10 pr-10"
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
                  <Button
                    type="submit"
                    className="w-full h-12 uppercase tracking-tight"
                    disabled={loading}
                  >
                    {loading ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <>
                        Sign In as Staff
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </motion.form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm font-bold text-zinc-950">
                New student?{" "}
                <Link href="/register" className="text-[#ec4899] hover:text-zinc-950 hover:underline transition-colors font-black uppercase">
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-zinc-950 uppercase tracking-tight"
        >
          <Shield className="w-4 h-4" />
          Secured with JWT • FERPA Compliant
        </motion.div>
      </motion.div>
    </div>
  );
}
