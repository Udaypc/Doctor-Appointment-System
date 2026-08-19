import axios from "axios";

// Use Next.js rewrite proxy (/api -> gateway) to avoid browser CORS issues
const GATEWAY = "/api";

export const api = axios.create({
  baseURL: GATEWAY,
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only force logout on 401 for protected write/auth failures — never for simple reads
    if (err.response?.status === 401 && typeof window !== "undefined") {
      const url = String(err.config?.url || "");
      const method = String(err.config?.method || "get").toLowerCase();
      const isAuthLogin = url.includes("/auth/login");
      const isRead =
        method === "get" ||
        url.includes("/search/") ||
        url.includes("/getPatientByEmail") ||
        url.includes("/getDoctorByEmail") ||
        url.includes("/bookings/");
      const path = window.location.pathname;
      if (!isAuthLogin && !isRead && path !== "/login" && path !== "/register") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("doctorId");
        localStorage.removeItem("patientId");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const login = (email: string, password: string, role: string) =>
  api.post("/auth/api/v1/auth/login", { email, password, role });

export const linkEntityId = (email: string, entityId: number) =>
  api.put("/auth/api/v1/auth/entity-id", { email, entityId });

export const registerPatient = (data: {
  name: string;
  email: string;
  contact: number;
  password: string;
}) => api.post("/patient/api/v1/patient/registerPatient", data);

export const registerDoctor = (data: object) =>
  api.post("/doctor/api/v1/doctor/register", data);

// ─── Doctors ──────────────────────────────────────────────────────────────────
export const getAllDoctors = () =>
  api.get("/doctor/api/v1/search/getAllDoctors");

export const getDoctorById = (id: number) =>
  api.get(`/doctor/api/v1/search/getDoctorById/${id}`);

export const getDoctorByEmail = (email: string) =>
  api.get("/doctor/api/v1/search/getDoctorByEmail", { params: { email } });

export const searchDoctors = (params: {
  specialization?: string;
  city?: string;
  area?: string;
}) => api.get("/doctor/api/v1/search/search", { params });

export const getSpecializations = () =>
  api.get("/doctor/api/v1/search/specializations");

export const getCities = () => api.get("/doctor/api/v1/search/cities");

export const getAreasByCity = (city: string) =>
  api.get("/doctor/api/v1/search/areas", { params: { city } });

export const getAvailableSlots = (doctorId: number, date: string) =>
  api.get("/doctor/api/v1/search/available-slots", {
    params: { doctorId, date },
  });

// ─── Patients ─────────────────────────────────────────────────────────────────
export const getPatientProfile = () =>
  api.get("/patient/api/v1/patient/profile");

export const getPatientByEmail = (email: string) =>
  api.get("/patient/api/v1/patient/getPatientByEmail", { params: { email } });

export const getPatientById = (id: number) =>
  api.get("/patient/api/v1/patient/getPatientById", { params: { id } });

export const updatePatient = (data: object) =>
  api.put("/patient/api/v1/patient/updatePatient", data);

export const updateDoctor = (data: object) =>
  api.put("/doctor/api/v1/doctor/updateDoctor", data);

export const addSchedule = (
  doctorId: number,
  data: { date: string; time_Slots: { time: string }[] }
) =>
  api.post("/doctor/api/v1/doctor/schedules", data, {
    params: { doctorId },
  });

export const deleteSchedule = (scheduleId: number) =>
  api.delete(`/doctor/api/v1/doctor/schedules/${scheduleId}`);

export const addSlot = (scheduleId: number, time: string) =>
  api.post(`/doctor/api/v1/doctor/schedules/${scheduleId}/slots`, { time });

export const deleteSlot = (slotId: number) =>
  api.delete(`/doctor/api/v1/doctor/slots/${slotId}`);

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const getDoctorRatings = (doctorId: number) =>
  api.get(`/doctor/api/v1/reviews/doctor/${doctorId}`);

export const createReview = (data: {
  doctorId: number;
  patientId: number;
  bookingId?: number;
  rating: number;
  comment?: string;
}) => api.post("/doctor/api/v1/reviews/addRating", data);

export const addRating = createReview;

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const initiateBooking = (
  doctorId: number,
  patientId: number,
  date: string,
  time: string
) =>
  api.post("/booking/api/v1/bookings/initiate", null, {
    params: { doctorId, patientId, date, time },
  });

export const getBookingsByPatient = (patientId: number) =>
  api.get(`/booking/api/v1/bookings/patient/${patientId}`);

export const getBookingsByDoctor = (doctorId: number) =>
  api.get(`/booking/api/v1/bookings/doctor/${doctorId}`);

export const cancelBooking = (id: number) =>
  api.put(`/booking/api/v1/bookings/${id}/cancel`);

export const getBookingById = (id: number) =>
  api.get(`/booking/api/v1/bookings/${id}`);

// ─── Payment ──────────────────────────────────────────────────────────────────
export const createPaymentSession = (data: {
  name: string;
  amount: number;
  quantity: number;
  currency: string;
  bookingId: number;
}) => api.post("/payment/product/v1/checkout", data);
