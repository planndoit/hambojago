import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function hashSecret(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

export function createEditToken() {
  return randomBytes(32).toString("base64url");
}

export function isValidPin(pin: string) {
  return /^\d{4}$/.test(pin);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");

  return `scrypt:${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, derivedKey] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !derivedKey) {
    return false;
  }

  const derivedKeyBuffer = Buffer.from(derivedKey, "hex");
  const passwordBuffer = scryptSync(password, salt, 64);

  return (
    derivedKeyBuffer.length === passwordBuffer.length &&
    timingSafeEqual(derivedKeyBuffer, passwordBuffer)
  );
}
