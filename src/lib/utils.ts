import { clsx, type ClassValue } from "clsx";
import { createHash } from "crypto";
import { twMerge } from "tailwind-merge";
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 10); // Generates an 8-character random string
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUniqueId(prefix: string): string {
  // Step 1: Create a base string using the current timestamp (milliseconds) and a random UUID
  const baseString = `${prefix}${Date.now()}_${generateRandomString()}`;
  // Step 2: Hash the base string using SHA256
  const hash = createHash("sha256");
  hash.update(baseString);
  const hashString = hash.digest("hex");
  // Step 3: Use the prefix + 16 - prefix.length characters from the hash
  const requiredLength = 16;
  const id = prefix + hashString.substring(0, requiredLength - prefix.length);
  return id;
}
