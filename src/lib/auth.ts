/**
 * Client-Side Authentication & Session Manager
 * Simulates signed JWT tokens, role-based access control (RBAC), and HIPAA timeout safeguards.
 */

import { UserRole, StaffMember } from "../types";

export interface JwtTokenPayload {
  sub: string; // Staff ID or User ID
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  designation?: string;
  licenseNumber?: string;
  accessTier?: string;
  iat: number; // Issued at timestamp (seconds)
  exp: number; // Expires at timestamp (seconds)
  jti: string; // Unique JWT identifier
  iss: string; // Issuer
  scopes: string[];
}

export interface AuthSession {
  token: string;
  payload: JwtTokenPayload;
  isValid: boolean;
  expiresInMinutes: number;
}

const JWT_STORAGE_KEY = "peoples_hospital_jwt_token";
const SESSION_EXPIRY_MINUTES = 60; // 60-minute HIPAA security timeout

/**
 * Encodes a mock JWT string: `header.payload.signature`
 */
export function generateMockJwt(staff: StaffMember): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = nowSec + SESSION_EXPIRY_MINUTES * 60;

  const header = {
    alg: "HS256",
    typ: "JWT",
    enc: "AES-256-GCM",
  };

  const payload: JwtTokenPayload = {
    sub: staff.id,
    name: staff.name,
    email: staff.email,
    role: staff.role,
    department: staff.department,
    designation: staff.designation,
    licenseNumber: staff.licenseNumber,
    accessTier: staff.accessTier || "Clinical Specialist",
    iat: nowSec,
    exp: expSec,
    jti: `jwt-${Math.random().toString(36).substring(2, 9)}-${nowSec}`,
    iss: "https://auth.peopleshospital.org",
    scopes: getRoleScopes(staff.role),
  };

  const b64Header = btoa(JSON.stringify(header));
  const b64Payload = btoa(JSON.stringify(payload));
  const signature = btoa(`sig_${staff.id}_${nowSec}_256bit_sha`);

  return `${b64Header}.${b64Payload}.${signature}`;
}

/**
 * Decodes and validates a mock JWT token.
 */
export function decodeMockJwt(token: string): JwtTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const jsonStr = atob(parts[1]);
    const payload: JwtTokenPayload = JSON.parse(jsonStr);

    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp < nowSec) {
      console.warn("JWT token has expired under HIPAA security timeout rules.");
      return null;
    }

    return payload;
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
}

/**
 * Returns role scopes for HIPAA role-based authorization.
 */
export function getRoleScopes(role: UserRole): string[] {
  switch (role) {
    case "admin":
      return [
        "admin:read",
        "admin:write",
        "patient:inquiries:manage",
        "patient:intake:review",
        "system:audit:read",
        "alerts:dispatch",
        "billing:manage",
      ];
    case "doctor":
      return [
        "doctor:clinical:access",
        "prescriptions:write",
        "patient:records:read",
        "patient:records:update",
        "appointments:manage",
      ];
    case "pharmacist":
      return [
        "pharmacy:inventory:manage",
        "prescriptions:verify",
        "prescriptions:dispense",
        "drug_safety:audit",
      ];
    case "lab_tech":
      return [
        "laboratory:tests:manage",
        "laboratory:samples:track",
        "laboratory:results:publish",
      ];
    case "patient":
      return ["patient:self:read", "patient:self:update", "appointments:request"];
    default:
      return ["guest:browse"];
  }
}

/**
 * Saves active JWT session to storage.
 */
export function saveAuthToken(token: string): void {
  try {
    sessionStorage.setItem(JWT_STORAGE_KEY, token);
    localStorage.setItem(JWT_STORAGE_KEY, token);
  } catch (err) {
    console.error("Storage error:", err);
  }
}

/**
 * Clears active JWT session.
 */
export function clearAuthToken(): void {
  try {
    sessionStorage.removeItem(JWT_STORAGE_KEY);
    localStorage.removeItem(JWT_STORAGE_KEY);
  } catch (err) {
    console.error("Storage error:", err);
  }
}

/**
 * Retrieves the current valid session, or null if unauthenticated / expired.
 */
export function getCurrentAuthSession(): AuthSession | null {
  try {
    const token = sessionStorage.getItem(JWT_STORAGE_KEY) || localStorage.getItem(JWT_STORAGE_KEY);
    if (!token) return null;

    const payload = decodeMockJwt(token);
    if (!payload) {
      clearAuthToken();
      return null;
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const remainingMin = Math.max(0, Math.round((payload.exp - nowSec) / 60));

    return {
      token,
      payload,
      isValid: true,
      expiresInMinutes: remainingMin,
    };
  } catch (err) {
    return null;
  }
}
