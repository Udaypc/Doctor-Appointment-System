"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600" size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Appointment Confirmed!
        </h1>
        <p className="text-slate-500 text-sm mb-8">
          Your slot is booked. Payment was simulated for demo — no real charge
          was made.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/patient/appointments"
            className="bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            View My Appointments
          </Link>
          <Link
            href="/"
            className="text-slate-600 font-medium py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm"
          >
            Book Another Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
