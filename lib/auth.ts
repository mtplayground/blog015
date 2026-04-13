import { timingSafeEqual } from "node:crypto";

function getAdminPasswordFromEnv(): string {
  const name = "ADMIN_PASSWORD";
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function safeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a, "utf8");
  const bBuffer = Buffer.from(b, "utf8");
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }
  return timingSafeEqual(aBuffer, bBuffer);
}

export function verifyAdminPassword(inputPassword: string): boolean {
  const configuredPassword = getAdminPasswordFromEnv();
  return safeEqual(configuredPassword, inputPassword);
}
