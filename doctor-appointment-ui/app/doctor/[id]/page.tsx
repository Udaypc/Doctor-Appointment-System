"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getDoctorById,
  getBookingsByDoctor,
  getDoctorRatings,
  addRating,
  initiateBooking,
} from "@/lib/api";
import { getUser, isPatient, getEntityId } from "@/lib/auth";
import toast from "react-hot-toast";
import {
  MapPin,
  Phone,
  Mail,
  Award,
  Calendar,
  Clock,
  ChevronLeft,
  Loader2,
  Stethoscope,
  CheckCircle,
  Star,
} from "lucide-react";
import Link from "next/link";
import StarRatingInput from "@/components/StarRatingInput";

interface TimeSlot {
  id: number;
  time: string;
}

interface Schedule {
  id: number;
  date: string;
  time_Slots: TimeSlot[];
}

interface DoctorDto {
  id: number;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  city: string;
  area: string;
  state: string;
  address: string;
  contact: string;
  email: string;
  averageRating?: number;
  reviewCount?: number;
  doctorAppointmentSchedules: Schedule[];
}

interface ReviewItem {
  id: number;
  patientId: number;
  rating: number;
  comment?: string;
  createdAt: string;
}

interface BookingLite {
  date: string;
  time: string;
  status: string;
}

const normalizeTime = (t: string) => (t || "").slice(0, 5);

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorDto | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [bookedKeys, setBookedKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const refreshRatings = async (doctorId: number) => {
    const ratingsRes = await getDoctorRatings(doctorId);
    const ratingData = ratingsRes.data as {
      averageRating?: number;
      reviewCount?: number;
      reviews?: ReviewItem[];
    };
    setAverageRating(ratingData.averageRating ?? 0);
    setReviewCount(ratingData.reviewCount ?? 0);
    const list = Array.isArray(ratingData.reviews) ? ratingData.reviews : [];
    setReviews(list);
    const patientId = getEntityId();
    if (patientId) {
      setAlreadyRated(list.some((r) => Number(r.patientId) === patientId));
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const doctorId = Number(id);
        const [doctorRes, bookingsRes] = await Promise.all([
          getDoctorById(doctorId),
          getBookingsByDoctor(doctorId).catch(() => ({ data: [] })),
        ]);

        const booked = new Set(
          (Array.isArray(bookingsRes.data) ? bookingsRes.data : [])
            .filter(
              (b: BookingLite) =>
                b.status === "PENDING" || b.status === "CONFIRMED"
            )
            .map((b: BookingLite) => `${b.date}|${normalizeTime(b.time)}`)
        );

        setBookedKeys(booked);
        setDoctor(doctorRes.data as DoctorDto);
        await refreshRatings(doctorId).catch(() => undefined);
      } catch {
        toast.error("Doctor not found");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const isSlotBooked = (date: string, time: string) =>
    bookedKeys.has(`${date}|${normalizeTime(time)}`);

  const user = getUser();

  const handleAddRating = async () => {
    if (!user) {
      toast.error("Please login to rate");
      router.push("/login");
      return;
    }
    if (!isPatient()) {
      toast.error("Only patients can rate doctors");
      return;
    }
    if (ratingValue < 1) {
      toast.error("Please select a star rating");
      return;
    }
    const patientId = getEntityId();
    if (!patientId) {
      toast.error("Patient account not linked. Please log out and log in again.");
      return;
    }
    setSubmittingRating(true);
    try {
      await addRating({
        doctorId: Number(id),
        patientId,
        rating: ratingValue,
        comment: ratingComment.trim() || undefined,
      });
      await refreshRatings(Number(id));
      setRatingComment("");
      setRatingValue(0);
      setShowReviewForm(false);
      toast.success("Rating added");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: string } })?.response?.data ||
        "Failed to add rating";
      toast.error(typeof msg === "string" ? msg : "Failed to add rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleBook = async () => {
    if (!user) {
      toast.error("Please login to book an appointment");
      router.push("/login");
      return;
    }
    if (!isPatient()) {
      toast.error("Only patients can book appointments");
      return;
    }
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time slot");
      return;
    }
    if (isSlotBooked(selectedDate, selectedTime)) {
      toast.error("This slot is already booked");
      return;
    }

    setBooking(true);
    try {
      const patientId = getEntityId();
      if (!patientId) {
        toast.error("Patient account not linked. Please log out and log in again.");
        return;
      }

      await initiateBooking(
        Number(id),
        patientId,
        selectedDate,
        selectedTime + ":00"
      );

      toast.success("Appointment booked (demo payment)");
      router.push("/payment/success");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: string } })?.response?.data ||
        (err instanceof Error ? err.message : null) ||
        "Booking failed. Please try again.";
      toast.error(typeof msg === "string" ? msg : "Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p>Doctor not found</p>
        <Link href="/" className="text-blue-600 hover:underline text-sm mt-2 block">
          Go back
        </Link>
      </div>
    );
  }

  const initials = doctor.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sortedSchedules = [...(doctor.doctorAppointmentSchedules || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const slotsForDate = selectedDate
    ? sortedSchedules.find((s) => s.date === selectedDate)?.time_Slots ?? []
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ChevronLeft size={16} /> Back to Search
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Doctor Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                {initials}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-900">
                  Dr. {doctor.name}
                </h1>
                <p className="text-blue-600 font-semibold text-lg">
                  {doctor.specialization}
                </p>
                <p className="text-slate-500 text-sm mt-0.5">
                  {doctor.qualification}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mt-6">
              <InfoItem icon={<Award size={16} className="text-amber-500" />} label={`${doctor.experience} years experience`} />
              <InfoItem icon={<MapPin size={16} className="text-slate-400" />} label={`${doctor.area}, ${doctor.city}, ${doctor.state}`} />
              <InfoItem icon={<Phone size={16} className="text-green-500" />} label={doctor.contact} />
              <InfoItem icon={<Mail size={16} className="text-blue-400" />} label={doctor.email} />
            </div>

            {doctor.address && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Clinic Address
                </p>
                <p className="text-sm text-slate-700">{doctor.address}</p>
              </div>
            )}
          </div>

          {/* About */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Stethoscope size={18} className="text-blue-600" />
              About Dr. {doctor.name.split(" ")[0]}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Dr. {doctor.name} is a specialist in {doctor.specialization} with{" "}
              {doctor.experience} years of experience. Qualified as{" "}
              {doctor.qualification}, they practice at {doctor.address} in{" "}
              {doctor.city}.
            </p>
          </div>

          {/* Ratings */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Ratings & reviews</h2>
                <p className="text-sm text-slate-500 mt-1">
                  What patients are saying about Dr. {doctor.name.split(" ")[0]}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900 leading-none">
                    {reviewCount > 0 ? averageRating.toFixed(1) : "—"}
                  </p>
                  <div className="flex justify-center gap-0.5 mt-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          reviewCount > 0 && i < Math.round(averageRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {reviewCount} review{reviewCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </div>

            {user && isPatient() && !alreadyRated && !showReviewForm && (
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(true);
                  setRatingValue(0);
                  setRatingComment("");
                }}
                className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-700 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Write a review
              </button>
            )}

            {user && isPatient() && !alreadyRated && showReviewForm && (
              <div className="mb-6 rounded-xl border border-slate-200 p-4 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-2">
                    Overall rating
                  </p>
                  <StarRatingInput value={ratingValue} onChange={setRatingValue} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Your review <span className="font-normal text-slate-400">(optional)</span>
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
                    onClick={handleAddRating}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submittingRating ? "Submitting..." : "Submit"}
                  </button>
                  <button
                    type="button"
                    disabled={submittingRating}
                    onClick={() => {
                      setShowReviewForm(false);
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

            {user && isPatient() && alreadyRated && (
              <p className="text-sm text-slate-500 mb-5">
                Thanks — you’ve already reviewed this doctor.
              </p>
            )}

            {reviews.length === 0 ? (
              <p className="text-sm text-slate-400">No reviews yet.</p>
            ) : (
              <div className="space-y-5">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="pb-5 border-b border-slate-100 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400">
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
                      </span>
                    </div>
                    {review.comment ? (
                      <p className="text-sm text-slate-700 leading-relaxed">{review.comment}</p>
                    ) : (
                      <p className="text-sm text-slate-400">No written review</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-20">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar size={17} className="text-blue-600" />
              Book Appointment
            </h2>

            {sortedSchedules.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                No available slots
              </p>
            ) : (
              <>
                {/* Date selector */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Select Date
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sortedSchedules.map((schedule) => {
                      const d = new Date(schedule.date);
                      const isSelected = selectedDate === schedule.date;
                      return (
                        <button
                          key={schedule.id}
                          onClick={() => {
                            setSelectedDate(schedule.date);
                            setSelectedTime(null);
                          }}
                          className={`flex flex-col items-center px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          <span className="text-[10px] opacity-75">
                            {d.toLocaleDateString("en-IN", { weekday: "short" })}
                          </span>
                          <span className="font-bold">
                            {d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time slots */}
                {selectedDate && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Select Time
                    </p>
                    {slotsForDate.length === 0 ? (
                      <p className="text-xs text-slate-400">No slots for this date</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {slotsForDate.map((slot) => {
                          const timeStr = slot.time.slice(0, 5);
                          const taken = selectedDate
                            ? isSlotBooked(selectedDate, timeStr)
                            : false;
                          const isSelected = !taken && selectedTime === timeStr;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              disabled={taken}
                              title={taken ? "Already booked" : undefined}
                              onClick={() => {
                                if (!taken) setSelectedTime(timeStr);
                              }}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                taken
                                  ? "border-slate-100 bg-slate-100 text-slate-400 cursor-not-allowed line-through opacity-70"
                                  : isSelected
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                              }`}
                            >
                              <Clock size={11} />
                              {timeStr}
                              {taken ? " · Booked" : ""}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Summary */}
                {selectedDate && selectedTime && (
                  <div className="bg-blue-50 rounded-xl p-3 mb-4 text-sm text-blue-900">
                    <p className="font-semibold">Appointment Summary</p>
                    <p className="text-xs mt-1 text-blue-700">
                      {new Date(selectedDate).toLocaleDateString("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      at {selectedTime}
                    </p>
                    <p className="text-xs mt-0.5 text-blue-700">
                      Consultation fee: ₹500 (demo — no real charge)
                    </p>
                  </div>
                )}

                <button
                  onClick={handleBook}
                  disabled={booking || !selectedDate || !selectedTime}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {booking ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} />
                      Confirm Booking
                    </>
                  )}
                </button>

                {!user && (
                  <p className="text-center text-xs text-slate-400 mt-2">
                    <Link href="/login" className="text-blue-600 hover:underline">
                      Sign in
                    </Link>{" "}
                    to book
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      {icon}
      <span className="truncate">{label}</span>
    </div>
  );
}
