import { createHash, randomBytes } from "crypto";

export function hashSecret(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

export function createEditToken() {
  return randomBytes(32).toString("base64url");
}

export function isValidPin(pin: string) {
  return /^\d{4}$/.test(pin);
}
