"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  getDoctorByEmail,
  getPatientByEmail,
  getDoctorById,
  getPatientById,
  updatePatient,
  updateDoctor,
} from "@/lib/api";
import { getUser, isDoctor, getEntityId, type AuthUser } from "@/lib/auth";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Stethoscope,
  Pencil,
  X,
  Check,
  Calendar,
  ChevronRight,
} from "lucide-react";

interface PatientProfile {
  id: number;
  name: string;
  email: string;
  contact: number | string;
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
  url?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);

  const [patientForm, setPatientForm] = useState({ name: "", contact: "" });
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    contact: "",
    specialization: "",
    qualification: "",
    experience: "",
    address: "",
    city: "",
    area: "",
    state: "",
  });

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    setSessionUser(user);

    const load = async () => {
      try {
        const entityId = getEntityId();
        if (isDoctor()) {
          const res = entityId
            ? await getDoctorById(entityId)
            : await getDoctorByEmail(user.email);
          const data = res.data as DoctorProfile;
          setDoctor(data);
          setDoctorForm({
            name: data.name || "",
            contact: data.contact || "",
            specialization: data.specialization || "",
            qualification: data.qualification || "",
            experience: String(data.experience ?? ""),
            address: data.address || "",
            city: data.city || "",
            area: data.area || "",
            state: data.state || "",
          });
        } else {
          const res = entityId
            ? await getPatientById(entityId)
            : await getPatientByEmail(user.email);
          const data = res.data as PatientProfile;
          setPatient(data);
          setPatientForm({
            name: data.name || "",
            contact: String(data.contact ?? ""),
          });
        }
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status && status !== 404) {
          console.error("Profile load failed", err);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const startEdit = () => {
    if (doctor) {
      setDoctorForm({
        name: doctor.name || "",
        contact: doctor.contact || "",
        specialization: doctor.specialization || "",
        qualification: doctor.qualification || "",
        experience: String(doctor.experience ?? ""),
        address: doctor.address || "",
        city: doctor.city || "",
        area: doctor.area || "",
        state: doctor.state || "",
      });
    }
    if (patient) {
      setPatientForm({
        name: patient.name || "",
        contact: String(patient.contact ?? ""),
      });
    }
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const savePatient = async () => {
    if (!patient) return;
    if (!patientForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!/^\d{10}$/.test(patientForm.contact)) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    setSaving(true);
    try {
      const res = await updatePatient({
        id: patient.id,
        name: patientForm.name.trim(),
        email: patient.email,
        contact: Number(patientForm.contact),
      });
      setPatient(res.data);
      setEditing(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const saveDoctor = async () => {
    if (!doctor) return;
    if (!doctorForm.name.trim() || !doctorForm.specialization.trim()) {
      toast.error("Name and specialization are required");
      return;
    }
    if (!/^\d{10}$/.test(doctorForm.contact)) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    setSaving(true);
    try {
      await updateDoctor({
        id: doctor.id,
        name: doctorForm.name.trim(),
        email: doctor.email,
        contact: doctorForm.contact,
        specialization: doctorForm.specialization.trim(),
        qualification: doctorForm.qualification.trim(),
        experience: Number(doctorForm.experience) || 0,
        address: doctorForm.address.trim(),
        city: doctorForm.city.trim(),
        area: doctorForm.area.trim(),
        state: doctorForm.state.trim(),
      });
      // Refresh display from form / re-fetch
      const entityId = getEntityId() || doctor.id;
      const res = await getDoctorById(entityId);
      setDoctor(res.data);
      setEditing(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const displayName =
    doctor?.name || patient?.name || sessionUser?.email?.split("@")[0] || "User";
  const roleLabel = isDoctor() ? "Doctor" : "Patient";

  const initials = (name?: string) =>
    (name || "U")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50";

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        {(doctor || patient) && !editing && (
          <button
            type="button"
            onClick={startEdit}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
          >
            <Pencil size={15} />
            Edit
          </button>
        )}
        {editing && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100"
            >
              <X size={15} />
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={doctor ? saveDoctor : savePatient}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              Save
            </button>
          </div>
        )}
      </div>

      {doctor ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
              {initials(editing ? doctorForm.name : doctor.name)}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <input
                  className={inputCls + " font-semibold"}
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                  placeholder="Full name"
                />
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-900">{doctor.name}</h2>
                  <p className="text-blue-600 font-medium text-sm mt-0.5 flex items-center gap-1.5">
                    <Stethoscope size={14} />
                    {doctor.specialization}
                  </p>
                  <p className="text-slate-500 text-sm mt-1">Doctor account</p>
                </>
              )}
            </div>
          </div>

          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Email (read-only)">
                <input className={inputCls + " opacity-70"} value={doctor.email} disabled />
              </Field>
              <Field label="Phone">
                <input
                  className={inputCls}
                  maxLength={10}
                  value={doctorForm.contact}
                  onChange={(e) =>
                    setDoctorForm({
                      ...doctorForm,
                      contact: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
              </Field>
              <Field label="Specialization">
                <input
                  className={inputCls}
                  value={doctorForm.specialization}
                  onChange={(e) =>
                    setDoctorForm({ ...doctorForm, specialization: e.target.value })
                  }
                />
              </Field>
              <Field label="Experience (years)">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={doctorForm.experience}
                  onChange={(e) =>
                    setDoctorForm({ ...doctorForm, experience: e.target.value })
                  }
                />
              </Field>
              <Field label="Qualification" className="sm:col-span-2">
                <input
                  className={inputCls}
                  value={doctorForm.qualification}
                  onChange={(e) =>
                    setDoctorForm({ ...doctorForm, qualification: e.target.value })
                  }
                />
              </Field>
              <Field label="Address" className="sm:col-span-2">
                <input
                  className={inputCls}
                  value={doctorForm.address}
                  onChange={(e) =>
                    setDoctorForm({ ...doctorForm, address: e.target.value })
                  }
                />
              </Field>
              <Field label="State">
                <input
                  className={inputCls}
                  value={doctorForm.state}
                  onChange={(e) => setDoctorForm({ ...doctorForm, state: e.target.value })}
                />
              </Field>
              <Field label="City">
                <input
                  className={inputCls}
                  value={doctorForm.city}
                  onChange={(e) => setDoctorForm({ ...doctorForm, city: e.target.value })}
                />
              </Field>
              <Field label="Area" className="sm:col-span-2">
                <input
                  className={inputCls}
                  value={doctorForm.area}
                  onChange={(e) => setDoctorForm({ ...doctorForm, area: e.target.value })}
                />
              </Field>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <Row icon={<Mail size={16} />} label="Email" value={doctor.email} />
              <Row icon={<Phone size={16} />} label="Phone" value={doctor.contact} />
              <Row
                icon={<Award size={16} />}
                label="Qualification"
                value={`${doctor.qualification} · ${doctor.experience} yrs`}
              />
              <Row
                icon={<MapPin size={16} />}
                label="Location"
                value={`${doctor.area}, ${doctor.city}, ${doctor.state}`}
              />
              <Row icon={<MapPin size={16} />} label="Address" value={doctor.address} />
            </div>
          )}
        </div>
      ) : patient ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
              {initials(editing ? patientForm.name : patient.name)}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <input
                  className={inputCls + " font-semibold"}
                  value={patientForm.name}
                  onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                  placeholder="Full name"
                />
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
                  <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
                    <User size={14} />
                    Patient account
                  </p>
                </>
              )}
            </div>
          </div>

          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Email (read-only)">
                <input className={inputCls + " opacity-70"} value={patient.email} disabled />
              </Field>
              <Field label="Phone">
                <input
                  className={inputCls}
                  maxLength={10}
                  value={patientForm.contact}
                  onChange={(e) =>
                    setPatientForm({
                      ...patientForm,
                      contact: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
              </Field>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <Row icon={<Mail size={16} />} label="Email" value={patient.email} />
              <Row
                icon={<Phone size={16} />}
                label="Phone"
                value={String(patient.contact)}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xl shrink-0">
              {initials(displayName)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
              <p className="text-slate-500 text-sm mt-1">{roleLabel} account</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <Row
              icon={<Mail size={16} />}
              label="Email"
              value={sessionUser?.email || "—"}
            />
            <Row icon={<User size={16} />} label="Role" value={roleLabel} />
          </div>
        </div>
      )}

      {patient && !editing && (
        <Link
          href="/patient/appointments"
          className="mt-4 flex items-center justify-between gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:border-blue-200 hover:bg-blue-50/40 transition-colors group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Calendar size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 text-sm">My Appointments</p>
              <p className="text-xs text-slate-500 mt-0.5">
                View upcoming visits and booking history
              </p>
            </div>
          </div>
          <ChevronRight
            size={18}
            className="text-slate-400 group-hover:text-blue-600 shrink-0 transition-colors"
          />
        </Link>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-slate-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-slate-800 font-medium mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );
}
