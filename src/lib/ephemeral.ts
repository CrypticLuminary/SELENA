export const SUBMISSION_RECEIPT_KEY = "selena_submission_receipt";

export function clearEphemeralSensitiveState(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SUBMISSION_RECEIPT_KEY);
  } catch {
    // Storage may be unavailable; there is nothing else to clear here.
  }
}
