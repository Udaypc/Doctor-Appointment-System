export interface AuthUser {
  email: string;
  role: string;
  token: string;
  /** Patient ID or Doctor ID from the respective microservice */
  entityId?: number | null;
}

function parseJwtPayload(token: string): { sub?: string; role?: string; entityId?: number } {
  try {
    const part = token.split(".")[1];
    if (!part) return {};
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as {
      sub?: string;
      role?: string;
      entityId?: number;
    };
    return payload;
  } catch {
    return {};
  }
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as AuthUser;
    // Prefer entityId from JWT claim if missing on stored user
    if ((user.entityId == null || user.entityId === undefined) && user.token) {
      const payload = parseJwtPayload(user.token);
      if (payload.entityId != null) {
        user.entityId = payload.entityId;
      }
    }
    return user;
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser) {
  // Sync entityId from token when present
  if ((user.entityId == null || user.entityId === undefined) && user.token) {
    const payload = parseJwtPayload(user.token);
    if (payload.entityId != null) {
      user.entityId = payload.entityId;
    }
  }
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", user.token);
}

export function clearUser() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("doctorId");
  localStorage.removeItem("patientId");
}

export function getEntityId(): number | null {
  const user = getUser();
  if (user?.entityId != null && !Number.isNaN(Number(user.entityId))) {
    return Number(user.entityId);
  }
  return null;
}

export function isLoggedIn(): boolean {
  return !!getUser();
}

export function isPatient(): boolean {
  const user = getUser();
  return (
    user?.role === "ROLE_PATIENT" ||
    user?.role === "Patient" ||
    user?.role === "patient"
  );
}

export function isDoctor(): boolean {
  const user = getUser();
  return (
    user?.role === "Doctor" ||
    user?.role === "ROLE_DOCTOR" ||
    user?.role === "doctor"
  );
}
