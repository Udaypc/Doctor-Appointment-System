"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerPatient, getSpecializations, getCities } from "@/lib/api";
import { getUser, isDoctor, isLoggedIn } from "@/lib/auth";
import toast from "react-hot-toast";
import { Stethoscope, Eye, EyeOff, Loader2, Plus, Minus } from "lucide-react";
import { useEffect } from "react";

type Role = "patient" | "doctor";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("patient");

  useEffect(() => {
    if (!isLoggedIn()) return;
    if (isDoctor()) router.push("/doctor/dashboard");
    else router.push("/");
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
            <p className="text-slate-500 text-sm mt-1">Join DocBook today</p>
          </div>

          {/* Role toggle */}
          <div className="flex rounded-xl border border-slate-200 p-1 mb-6 bg-slate-50">
            {(["patient", "doctor"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                  role === r
                    ? "bg-white shadow text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {role === "patient" ? (
            <PatientRegisterForm onSuccess={() => router.push("/login")} />
          ) : (
            <DoctorRegisterForm onSuccess={() => router.push("/login")} />
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function PatientRegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerPatient({
        name: form.name,
        email: form.email,
        contact: Number(form.contact),
        password: form.password,
      });
      toast.success("Account created! Please sign in.");
      onSuccess();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: string; status?: number } };
      const msg = axiosErr?.response?.data || "Registration failed. Email may already exist.";
      toast.error(typeof msg === "string" ? msg : "Registration failed. Email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="John Doe"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
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
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone (10 digits)</label>
        <input
          type="tel"
          required
          maxLength={10}
          value={form.contact}
          onChange={(e) => setForm({ ...form, contact: e.target.value.replace(/\D/g, "") })}
          placeholder="9876543210"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            onClick={() => setShowPw(!showPw)}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Creating account..." : "Create Patient Account"}
      </button>
    </form>
  );
}

function DoctorRegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    qualification: "",
    contact: "",
    experience: "",
    url: "https://",
    address: "",
    state: "",
    city: "",
    area: "",
  });

  const [schedules, setSchedules] = useState([
    { date: "", time_Slots: [{ time: "" }] },
  ]);

  useEffect(() => {
    Promise.all([getSpecializations(), getCities()]).then(([s, c]) => {
      setSpecializations(s.data);
      setCities(c.data);
    });
  }, []);

  const addSchedule = () =>
    setSchedules([...schedules, { date: "", time_Slots: [{ time: "" }] }]);

  const removeSchedule = (i: number) =>
    setSchedules(schedules.filter((_, idx) => idx !== i));

  const addSlot = (si: number) => {
    const updated = [...schedules];
    updated[si].time_Slots.push({ time: "" });
    setSchedules(updated);
  };

  const removeSlot = (si: number, ti: number) => {
    const updated = [...schedules];
    updated[si].time_Slots = updated[si].time_Slots.filter((_, idx) => idx !== ti);
    setSchedules(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        experience: Number(form.experience),
        doctorAppointmentSchedules: schedules,
      };
      const { registerDoctor } = await import("@/lib/api");
      await registerDoctor(payload);
      toast.success("Doctor registered! Please sign in.");
      onSuccess();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: string; status?: number } };
      const msg = axiosErr?.response?.data || "Registration failed. Please try again.";
      toast.error(typeof msg === "string" ? msg : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Full Name</label>
          <input required className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dr. John Smith" />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input type="email" required className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="dr@hospital.com" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Password</label>
          <input type="password" required className={inputCls} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input required maxLength={10} className={inputCls} value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value.replace(/\D/g, "") })} placeholder="9876543210" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Specialization</label>
          <input required className={inputCls} value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="Cardiology" list="spec-list" />
          <datalist id="spec-list">
            {specializations.map((s) => <option key={s} value={s} />)}
          </datalist>
        </div>
        <div>
          <label className={labelCls}>Experience (years)</label>
          <input type="number" min="0" required className={inputCls} value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="5" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Qualification</label>
        <input required className={inputCls} value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="MBBS, MD - Cardiology" />
      </div>

      <div>
        <label className={labelCls}>Clinic Address</label>
        <input required className={inputCls} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Medical Centre, Main Road" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>State</label>
          <input required className={inputCls} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="Maharashtra" />
        </div>
        <div>
          <label className={labelCls}>City</label>
          <input required className={inputCls} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Mumbai" list="city-list" />
          <datalist id="city-list">
            {cities.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div>
          <label className={labelCls}>Area</label>
          <input required className={inputCls} value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Andheri" />
        </div>
      </div>

      {/* Schedules */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-700">Appointment Schedules</label>
          <button type="button" onClick={addSchedule} className="text-xs text-blue-600 flex items-center gap-1 font-medium">
            <Plus size={13} /> Add Date
          </button>
        </div>
        {schedules.map((schedule, si) => (
          <div key={si} className="border border-slate-200 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="date"
                required
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={schedule.date}
                onChange={(e) => {
                  const updated = [...schedules];
                  updated[si].date = e.target.value;
                  setSchedules(updated);
                }}
              />
              {schedules.length > 1 && (
                <button type="button" onClick={() => removeSchedule(si)} className="text-red-400 hover:text-red-600">
                  <Minus size={16} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {schedule.time_Slots.map((slot, ti) => (
                <div key={ti} className="flex items-center gap-1">
                  <input
                    type="time"
                    required
                    className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={slot.time}
                    onChange={(e) => {
                      const updated = [...schedules];
                      updated[si].time_Slots[ti].time = e.target.value;
                      setSchedules(updated);
                    }}
                  />
                  {schedule.time_Slots.length > 1 && (
                    <button type="button" onClick={() => removeSlot(si, ti)} className="text-red-400">
                      <Minus size={12} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addSlot(si)} className="text-blue-600 text-xs flex items-center gap-1 px-2 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50">
                <Plus size={12} /> Slot
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Registering..." : "Register as Doctor"}
      </button>
    </form>
  );
}
