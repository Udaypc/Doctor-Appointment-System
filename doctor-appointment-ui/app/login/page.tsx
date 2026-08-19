"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  login,
  getDoctorByEmail,
  getPatientByEmail,
  linkEntityId,
} from "@/lib/api";
import { setUser, getUser, isDoctor } from "@/lib/auth";
import toast from "react-hot-toast";
import { Stethoscope, Eye, EyeOff, Loader2 } from "lucide-react";

async function resolveEntityId(
  email: string,
  role: string,
  existingId?: number | null
): Promise<number | null> {
  if (existingId != null) return existingId;

  const doctorRole =
    role === "Doctor" || role === "ROLE_DOCTOR" || role === "doctor";
  try {
    if (doctorRole) {
      const res = await getDoctorByEmail(email);
      return res.data?.id ?? null;
    }
    const res = await getPatientByEmail(email);
    return res.data?.id ?? null;
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", role: "ROLE_PATIENT" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) return;
    if (isDoctor()) router.push("/doctor/dashboard");
    else router.push("/");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form.email, form.password, form.role);
      const { message: token, role, entityId } = res.data;

      let resolvedId: number | null =
        entityId != null ? Number(entityId) : null;

      // Backfill entityId for older accounts that don't have it yet
      if (resolvedId == null) {
        resolvedId = await resolveEntityId(form.email, role, null);
        if (resolvedId != null) {
          try {
            const linked = await linkEntityId(form.email, resolvedId);
            setUser({
              email: form.email,
              role: linked.data.role || role,
              token: linked.data.message || token,
              entityId: linked.data.entityId ?? resolvedId,
            });
          } catch {
            setUser({ email: form.email, role, token, entityId: resolvedId });
          }
        } else {
          setUser({ email: form.email, role, token, entityId: null });
        }
      } else {
        setUser({ email: form.email, role, token, entityId: resolvedId });
      }

      toast.success("Welcome back!");
      const doctorRole =
        role === "Doctor" || role === "ROLE_DOCTOR" || role === "doctor";
      if (doctorRole) {
        router.push("/doctor/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      const message =
        typeof data === "string" && data.trim()
          ? data
          : "Invalid email or password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-500 text-sm mt-1">
              Sign in with your email — role is detected automatically
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-600 font-semibold hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
