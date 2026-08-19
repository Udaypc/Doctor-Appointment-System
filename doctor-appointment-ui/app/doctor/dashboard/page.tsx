"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getBookingsByDoctor,
  getDoctorById,
  getDoctorByEmail,
  addSchedule,
  deleteSchedule,
  addSlot,
  deleteSlot,
} from "@/lib/api";
import { getUser, isDoctor, getEntityId } from "@/lib/auth";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Stethoscope,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Award,
  Plus,
  Trash2,
  X,
} from "lucide-react";

interface Booking {
  id: number;
  doctorId: number;
  patientId: number;
  doctorName: string;
  patientName: string;
  specialization: string;
  address: string;
  date: string;
  time: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}

interface TimeSlot {
  id: number;
  time: string;
}

interface Schedule {
  id: number;
  date: string;
  time_Slots: TimeSlot[];
}

interface DoctorProfile {
  id: number;
  name: string;
  email: string;
  contact: string;
  specialization: string;
  qualification: string;
  experience: number;
  address: string;
  city: string;
  area: string;
  state: string;
  doctorAppointmentSchedules?: Schedule[];
}

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    color: "bg-amber-100 text-amber-800",
    icon: <AlertCircle size={13} />,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle size={13} />,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: <XCircle size={13} />,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-blue-100 text-blue-800",
    icon: <CheckCircle size={13} />,
  },
};

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [busy, setBusy] = useState(false);

  const [newDate, setNewDate] = useState("");
  const [newTimes, setNewTimes] = useState<string[]>([""]);
  const [slotDrafts, setSlotDrafts] = useState<Record<number, string>>({});

  const refreshDoctor = async (doctorId: number) => {
    const doctorRes = await getDoctorById(doctorId);
    const profile = doctorRes.data as DoctorProfile;
    setDoctorProfile(profile);
    const list = Array.isArray(profile.doctorAppointmentSchedules)
      ? [...profile.doctorAppointmentSchedules].sort((a, b) =>
          a.date.localeCompare(b.date)
        )
      : [];
    setSchedules(list);
    return profile;
  };

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (!isDoctor()) {
      router.push("/");
      return;
    }

    const loadDashboard = async () => {
      try {
        const doctorId = getEntityId();
        let profile: DoctorProfile | null = null;

        if (doctorId) {
          profile = await refreshDoctor(doctorId);
          const bookingsRes = await getBookingsByDoctor(doctorId);
          setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
        } else {
          const doctorRes = await getDoctorByEmail(user.email);
          profile = doctorRes.data as DoctorProfile;
          if (profile?.id) {
            await refreshDoctor(profile.id);
            const bookingsRes = await getBookingsByDoctor(profile.id);
            setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
          }
        }

        if (profile) setDoctorProfile(profile);
      } catch {
        console.error("Dashboard load failed");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  const doctorId = doctorProfile?.id;

  const handleAddSchedule = async () => {
    if (!doctorId) return;
    if (!newDate) {
      toast.error("Pick a date");
      return;
    }
    const times = newTimes.map((t) => t.trim()).filter(Boolean);
    if (times.length === 0) {
      toast.error("Add at least one time");
      return;
    }
    setBusy(true);
    try {
      await addSchedule(doctorId, {
        date: newDate,
        time_Slots: times.map((time) => ({ time: time.length === 5 ? `${time}:00` : time })),
      });
      await refreshDoctor(doctorId);
      setNewDate("");
      setNewTimes([""]);
      toast.success("Schedule added");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: string } })?.response?.data ||
        "Failed to add schedule";
      toast.error(typeof msg === "string" ? msg : "Failed to add schedule");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!doctorId) return;
    if (!confirm("Remove this entire date and all its slots?")) return;
    setBusy(true);
    try {
      await deleteSchedule(scheduleId);
      await refreshDoctor(doctorId);
      toast.success("Schedule removed");
    } catch {
      toast.error("Failed to remove schedule");
    } finally {
      setBusy(false);
    }
  };

  const handleAddSlot = async (scheduleId: number) => {
    if (!doctorId) return;
    const time = (slotDrafts[scheduleId] || "").trim();
    if (!time) {
      toast.error("Pick a time");
      return;
    }
    setBusy(true);
    try {
      await addSlot(scheduleId, time.length === 5 ? `${time}:00` : time);
      await refreshDoctor(doctorId);
      setSlotDrafts((prev) => ({ ...prev, [scheduleId]: "" }));
      toast.success("Slot added");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: string } })?.response?.data ||
        "Failed to add slot";
      toast.error(typeof msg === "string" ? msg : "Failed to add slot");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    if (!doctorId) return;
    setBusy(true);
    try {
      await deleteSlot(slotId);
      await refreshDoctor(doctorId);
      toast.success("Slot removed");
    } catch {
      toast.error("Failed to remove slot");
    } finally {
      setBusy(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const todayBookings = bookings.filter((b) => b.date === today);
  const upcoming = bookings.filter(
    (b) => b.date > today && (b.status === "CONFIRMED" || b.status === "PENDING")
  );
  const total = bookings.length;
  const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;

  const filtered =
    filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const inputCls =
    "px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your appointments and schedule
        </p>
      </div>

      {doctorProfile && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
              {doctorProfile.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-900">{doctorProfile.name}</h2>
              <p className="text-blue-600 font-medium text-sm mt-0.5">
                {doctorProfile.specialization}
              </p>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                <Award size={14} />
                {doctorProfile.qualification} · {doctorProfile.experience} yrs experience
              </p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400" />
                  {doctorProfile.area}, {doctorProfile.city}, {doctorProfile.state}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" />
                  {doctorProfile.contact}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" />
                  {doctorProfile.email}
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-2">{doctorProfile.address}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: <Calendar size={20} className="text-blue-600" />,
            label: "Today",
            value: todayBookings.length,
            bg: "bg-blue-50",
          },
          {
            icon: <TrendingUp size={20} className="text-green-600" />,
            label: "Upcoming",
            value: upcoming.length,
            bg: "bg-green-50",
          },
          {
            icon: <CheckCircle size={20} className="text-indigo-600" />,
            label: "Confirmed",
            value: confirmed,
            bg: "bg-indigo-50",
          },
          {
            icon: <Users size={20} className="text-purple-600" />,
            label: "Total",
            value: total,
            bg: "bg-purple-50",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4"
          >
            <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Manage Schedule */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            Manage Schedule
          </h2>
        </div>

        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 mb-6">
          <p className="text-sm font-medium text-slate-700 mb-3">Add a new date</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">Date</label>
              <input
                type="date"
                min={today}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className={inputCls + " w-full"}
              />
            </div>
            <div className="flex-[2]">
              <label className="block text-xs text-slate-500 mb-1">Times</label>
              <div className="flex flex-wrap gap-2">
                {newTimes.map((t, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <input
                      type="time"
                      value={t}
                      onChange={(e) => {
                        const next = [...newTimes];
                        next[i] = e.target.value;
                        setNewTimes(next);
                      }}
                      className={inputCls}
                    />
                    {newTimes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setNewTimes(newTimes.filter((_, idx) => idx !== i))}
                        className="p-1.5 text-slate-400 hover:text-red-500"
                        aria-label="Remove time"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setNewTimes([...newTimes, ""])}
                  className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Plus size={14} /> Time
                </button>
              </div>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={handleAddSchedule}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 shrink-0"
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Add date
            </button>
          </div>
        </div>

        {schedules.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Clock size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No slots yet. Add a date above to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="rounded-xl border border-slate-100 p-4"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      {new Date(schedule.date + "T00:00:00").toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {schedule.time_Slots?.length || 0} slot
                      {(schedule.time_Slots?.length || 0) === 1 ? "" : "s"}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-60"
                  >
                    <Trash2 size={13} />
                    Remove date
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {[...(schedule.time_Slots || [])]
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((slot) => (
                      <span
                        key={slot.id}
                        className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full text-sm bg-blue-50 text-blue-800 border border-blue-100"
                      >
                        <Clock size={12} />
                        {slot.time?.slice(0, 5)}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-1 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-600 disabled:opacity-60"
                          aria-label={`Remove ${slot.time}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-50">
                  <input
                    type="time"
                    value={slotDrafts[schedule.id] || ""}
                    onChange={(e) =>
                      setSlotDrafts((prev) => ({
                        ...prev,
                        [schedule.id]: e.target.value,
                      }))
                    }
                    className={inputCls}
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleAddSlot(schedule.id)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-60"
                  >
                    <Plus size={13} />
                    Add slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's appointments */}
      {todayBookings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            Today&apos;s Schedule
          </h2>
          <div className="space-y-3">
            {todayBookings
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((b) => (
                <AppointmentCard key={b.id} booking={b} />
              ))}
          </div>
        </div>
      )}

      {/* All appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            All Appointments
          </h2>
          <div className="flex gap-2 flex-wrap">
            {["ALL", "PENDING", "CONFIRMED", "CANCELLED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filter === s
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Stethoscope size={40} className="mx-auto mb-3 opacity-30" />
            <p>No appointments found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((b) => (
                <AppointmentCard key={b.id} booking={b} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentCard({ booking }: { booking: Booking }) {
  const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
  const patientInitials = (booking.patientName || "P")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
        {patientInitials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 text-sm">
          {booking.patientName || `Patient #${booking.patientId}`}
        </p>
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {new Date(booking.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {booking.time?.slice(0, 5)}
          </span>
        </div>
      </div>
      <span
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${config.color}`}
      >
        {config.icon}
        {config.label}
      </span>
    </div>
  );
}
