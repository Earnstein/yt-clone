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

export function formatDuration(duration: number): string {
  const hours = Math.floor(duration / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export const snakeCaseToTitleCase = (str?: string | null): string => {
  if (!str) return "_ _";
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function formatDate(
  date: Date | string | number | undefined | null,
  opts: Intl.DateTimeFormatOptions = {},
  separator?: string // Optional separator parameter
): string {
  // Handle undefined or null date
  if (!date) {
    return ""; // Return empty string or an alternative default message
  }

  const newDate = new Date(date);

  // If the separator is provided, format the date with custom separators
  if (separator) {
    const year = new Intl.DateTimeFormat("en-US", {
      year: opts.year ?? "numeric",
    }).format(newDate);
    const month = new Intl.DateTimeFormat("en-US", {
      month: opts.month ?? "2-digit",
    }).format(newDate);
    const day = new Intl.DateTimeFormat("en-US", {
      day: opts.day ?? "2-digit",
    }).format(newDate);
    return `${day}${separator}${month}${separator}${year}`;
  }

  // Default formatting if no separator is provided
  return new Intl.DateTimeFormat("en-US", {
    month: opts.month ?? "long",
    day: opts.day ?? "numeric",
    year: opts.year ?? "numeric",
    ...opts,
  }).format(newDate);
}
