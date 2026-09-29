// Configuration for APK Expiration
// Set EXPIRY_DAYS to the number of days the APK should be valid after build/first launch.

// Default expiry duration in days
export const EXPIRY_DAYS = 4;

// Build Date/Timestamp (Timestamp when this build was created: 2026-09-29T17:42:00)
// The hardcoded expiry timestamp guarantees the app expires 4 days after build even if app data is cleared.
export const BUILD_TIMESTAMP = new Date('2026-09-29T17:42:00').getTime();

// Target fixed expiration date (4 days from build date: 2026-10-03T17:42:00)
// Set to null to use dynamic calculation (BUILD_TIMESTAMP + EXPIRY_DAYS * 86400000)
export const HARDCODED_EXPIRY_DATE = new Date(BUILD_TIMESTAMP + EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

// Enable or disable expiry check (set to true to enable expiration)
export const IS_EXPIRY_ENABLED = true;

// Developer / Support Contact Info shown on Expiry Screen
export const CONTACT_INFO = {
  developer: "FlickerMeter Team",
  email: "support@flickermeter.app",
  message: "App 4 days trial period is complete. Please update your APK."
};
