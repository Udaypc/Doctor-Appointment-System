"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAllDoctors,
  getCities,
  getSpecializations,
  searchDoctors,
} from "@/lib/api";
import { isDoctor } from "@/lib/auth";
import {
  Search,
  MapPin,
  Star,
  Clock,
  ChevronRight,
  Stethoscope,
  Award,
  Calendar,
} from "lucide-react";
import Link from "next/link";

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
  url: string;
  contact: string;
  email: string;
  averageRating?: number;
  reviewCount?: number;
  doctorAppointmentSchedules: Array<{
    id: number;
    date: string;
    time_Slots: Array<{ id: number; time: string }>;
  }>;
}

export default function HomePage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<DoctorDto[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchSpec, setSearchSpec] = useState("");
  const [searchCity, setSearchCity] = useState("");

  useEffect(() => {
    if (isDoctor()) router.push("/doctor/dashboard");
  }, [router]);

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const [docRes, specRes, cityRes] = await Promise.all([
          getAllDoctors(),
          getSpecializations(),
          getCities(),
        ]);
        setDoctors(docRes.data);
        setSpecializations(specRes.data);
        setCities(cityRes.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await searchDoctors({
        specialization: searchSpec || undefined,
        city: searchCity || undefined,
      });
      setDoctors(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const nextAvailableDate = (doctor: DoctorDto) => {
    const schedules = doctor.doctorAppointmentSchedules;
    if (!schedules || schedules.length === 0) return "No slots available";
    const sorted = [...schedules].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sorted[0]?.date
      ? new Date(sorted[0].date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "No slots";
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              Book a Doctor Appointment
              <br />
              <span className="text-blue-200">in Minutes</span>
            </h1>
            <p className="text-blue-100 text-lg max-w-xl mx-auto">
              Find verified doctors near you, check availability, and book
              instantly.
            </p>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl shadow-xl p-2 max-w-3xl mx-auto flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 relative">
              <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                className="w-full pl-9 pr-3 py-3 rounded-xl text-slate-700 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={searchSpec}
                onChange={(e) => setSearchSpec(e.target.value)}
              >
                <option value="">All Specializations</option>
                {specializations.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                className="w-full pl-9 pr-3 py-3 rounded-xl text-slate-700 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors text-sm"
            >
              <Search size={16} />
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Specialization browse */}
      {specializations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pt-10 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-5">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-1.5">
                Specialties
              </p>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Browse by specialty
              </h2>
              <p className="text-sm text-slate-500 mt-1.5 max-w-md">
                Jump straight to the care you need — filter doctors by field.
              </p>
            </div>
            {searchSpec && (
              <button
                type="button"
                onClick={async () => {
                  setSearchSpec("");
                  setLoading(true);
                  try {
                    const res = await getAllDoctors();
                    setDoctors(res.data);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors self-start sm:self-auto"
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {specializations.map((spec) => {
              const active = searchSpec === spec;
              return (
                <button
                  key={spec}
                  type="button"
                  onClick={() => {
                    setSearchSpec(spec);
                    searchDoctors({ specialization: spec }).then((r) =>
                      setDoctors(r.data)
                    );
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                    active
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50/80"
                  }`}
                >
                  {spec}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <Stethoscope size={20} />, label: "Doctors", value: `${doctors.length}+` },
            { icon: <Star size={20} />, label: "Specializations", value: `${specializations.length}+` },
            { icon: <MapPin size={20} />, label: "Cities", value: `${cities.length}+` },
            { icon: <Calendar size={20} />, label: "Appointments", value: "24/7" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3"
            >
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                {stat.icon}
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Doctor cards */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {loading ? "Searching..." : `Available Doctors (${doctors.length})`}
          </h2>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-slate-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-slate-200 rounded mb-2" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Stethoscope size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No doctors found</p>
            <p className="text-sm">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                nextDate={nextAvailableDate(doctor)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function DoctorCard({
  doctor,
  nextDate,
}: {
  doctor: DoctorDto;
  nextDate: string;
}) {
  const initials = doctor.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link
      href={`/doctor/${doctor.id}`}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-5 flex flex-col gap-4 group"
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-base group-hover:text-blue-700 transition-colors truncate">
            Dr. {doctor.name}
          </h3>
          <p className="text-blue-600 text-sm font-medium">
            {doctor.specialization}
          </p>
          <p className="text-amber-600 text-xs font-medium mt-1 flex items-center gap-1">
            <Star size={12} className="fill-amber-500 text-amber-500" />
            {(doctor.averageRating ?? 0) > 0
              ? `${Number(doctor.averageRating).toFixed(1)} (${doctor.reviewCount ?? 0})`
              : "No ratings yet"}
          </p>
          <p className="text-slate-400 text-xs mt-0.5 truncate">
            {doctor.qualification}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Award size={14} className="text-amber-500 shrink-0" />
          <span>{doctor.experience} years experience</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-slate-400 shrink-0" />
          <span className="truncate">
            {doctor.area}, {doctor.city}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-green-500 shrink-0" />
          <span className="text-green-700 font-medium">
            Next: {nextDate}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">{doctor.address}</span>
        <span className="text-blue-600 flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all">
          Book <ChevronRight size={14} />
        </span>
      </div>
    </Link>
  );
}
