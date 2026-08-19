"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getBookingsByPatient,
  cancelBooking,
  createReview,
  getDoctorRatings,
} from "@/lib/api";
import { getUser, isPatient, getEntityId } from "@/lib/auth";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  MapPin,
  Loader2,
  XCircle,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  Star,
} from "lucide-react";
import Link from "next/link";
import StarRatingInput from "@/components/StarRatingInput";

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

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending Payment",
    color: "bg-amber-100 text-amber-800",
    icon: <AlertCircle size={14} />,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle size={14} />,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: <XCircle size={14} />,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-blue-100 text-blue-800",
    icon: <CheckCircle size={14} />,
  },
};

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [profileMissing, setProfileMissing] = useState(false);
  const [ratedDoctors, setRatedDoctors] = useState<Set<number>>(new Set());
  const [ratingBookingId, setRatingBookingId] = useState<number | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (!isPatient()) {
      router.push("/doctor/dashboard");
      return;
    }

    const fetchBookings = async () => {
      try {
        const patientId = getEntityId();
        if (!patientId) {
          setProfileMissing(true);
          setBookings([]);
          return;
        }
        const bookingsRes = await getBookingsByPatient(patientId);
        const list: Booking[] = Array.isArray(bookingsRes.data)
          ? bookingsRes.data
          : [];
        setBookings(list);

        const doctorIds = [...new Set(list.map((b) => b.doctorId).filter(Boolean))];
        const rated = new Set<number>();
        await Promise.all(
          doctorIds.map(async (doctorId) => {
            try {
              const res = await getDoctorRatings(doctorId);
              const reviews = res.data?.reviews || [];
              if (
                reviews.some(
                  (r: { patientId: number }) => Number(r.patientId) === patientId
                )
              ) {
                rated.add(doctorId);
              }
            } catch {
              // ignore
            }
          })
        );
        setRatedDoctors(rated);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 404) {
          setProfileMissing(true);
          setBookings([]);
        } else {
          console.error("Appointments load failed", err);
          toast.error("Failed to load appointments. Please try again.");
          setBookings([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [router]);

  const handleCancel = async (bookingId: number) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    setCancelling(bookingId);
    try {
      await cancelBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "CANCELLED" } : b
        )
      );
      toast.success("Appointment cancelled");
    } catch {
      toast.error("Failed to cancel appointment");
    } finally {
      setCancelling(null);
    }
  };

  const handleSubmitRating = async (booking: Booking) => {
    const patientId = getEntityId();
    if (!patientId) {
      toast.error("Patient account not linked");
      return;
    }
    if (ratingValue < 1) {
      toast.error("Please select a star rating");
      return;
    }
    setSubmittingRating(true);
    try {
      await createReview({
        doctorId: booking.doctorId,
        patientId,
        bookingId: booking.id,
        rating: ratingValue,
        comment: ratingComment.trim() || undefined,
      });
      setRatedDoctors((prev) => new Set(prev).add(booking.doctorId));
      setRatingBookingId(null);
      setRatingComment("");
      setRatingValue(0);
      toast.success("Thanks for your rating!");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: string } })?.response?.data ||
        "Failed to submit rating";
      toast.error(typeof msg === "string" ? msg : "Failed to submit rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  const upcoming = bookings.filter(
    (b) =>
      (b.status === "CONFIRMED" || b.status === "PENDING") &&
      b.date >= new Date().toISOString().slice(0, 10)
  ).length;

  const filtered =
    filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (profileMissing) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Patient profile not found</h1>
        <p className="text-slate-500 text-sm mb-6">
          This account is not linked to a patient profile. Please register as a patient
          or log in again.
        </p>
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-slate-500 text-sm mt-1">
            {upcoming} upcoming appointment{upcoming !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Book New
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === s
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
            }`}
          >
            {s === "ALL" ? "All" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG].label}
            <span className="ml-1.5 opacity-70">
              ({s === "ALL" ? bookings.length : bookings.filter((b) => b.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Stethoscope size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No appointments found</p>
          <Link href="/" className="text-blue-600 hover:underline text-sm mt-2 block">
            Find a Doctor
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((booking) => {
              const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
              const initials = (booking.doctorName || "D")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const canRate =
                (booking.status === "CONFIRMED" || booking.status === "COMPLETED") &&
                !ratedDoctors.has(booking.doctorId);
              const isRating = ratingBookingId === booking.id;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            Dr. {booking.doctorName || `Doctor #${booking.doctorId}`}
                          </h3>
                          <p className="text-blue-600 text-sm">
                            {booking.specialization || "Specialist"}
                          </p>
                        </div>
                        <span
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`}
                        >
                          {config.icon}
                          {config.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          {new Date(booking.date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} className="text-slate-400" />
                          {booking.time?.slice(0, 5)}
                        </span>
                        {booking.address && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-slate-400" />
                            <span className="truncate max-w-[200px]">
                              {booking.address}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {(booking.status === "PENDING" || canRate || isRating || ratedDoctors.has(booking.doctorId)) && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                      {booking.status === "PENDING" && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancelling === booking.id}
                          className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                        >
                          {cancelling === booking.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <XCircle size={14} />
                          )}
                          Cancel Appointment
                        </button>
                      )}

                      {ratedDoctors.has(booking.doctorId) &&
                        (booking.status === "CONFIRMED" || booking.status === "COMPLETED") && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Star size={12} className="fill-amber-500 text-amber-500" />
                            You rated this doctor
                          </p>
                        )}

                      {canRate && !isRating && (
                        <button
                          type="button"
                          onClick={() => {
                            setRatingBookingId(booking.id);
                            setRatingValue(0);
                            setRatingComment("");
                          }}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50"
                        >
                          Write a review
                        </button>
                      )}

                      {isRating && (
                        <div className="rounded-xl border border-slate-200 p-4 space-y-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900 mb-2">
                              Overall rating
                            </p>
                            <StarRatingInput
                              value={ratingValue}
                              onChange={setRatingValue}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                              Your review{" "}
                              <span className="font-normal text-slate-400">(optional)</span>
                            </label>
                            <textarea
                              value={ratingComment}
                              onChange={(e) => setRatingComment(e.target.value)}
                              maxLength={500}
                              rows={3}
                              placeholder="Share details of your experience"
                              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={submittingRating || ratingValue < 1}
                              onClick={() => handleSubmitRating(booking)}
                              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {submittingRating ? "Saving..." : "Submit"}
                            </button>
                            <button
                              type="button"
                              disabled={submittingRating}
                              onClick={() => {
                                setRatingBookingId(null);
                                setRatingValue(0);
                                setRatingComment("");
                              }}
                              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
