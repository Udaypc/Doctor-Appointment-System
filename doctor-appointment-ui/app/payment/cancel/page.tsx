"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="text-red-500" size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-slate-500 text-sm mb-8">
          Your payment was cancelled. Your appointment has not been confirmed.
          You can try again or choose a different slot.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Find Another Doctor
          </Link>
          <Link
            href="/patient/appointments"
            className="text-slate-600 font-medium py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm"
          >
            My Appointments
          </Link>
        </div>
      </div>
    </div>
  );
}
