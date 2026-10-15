/**
 * Flow-Forge Schema Validator and Normalizer
 * Enforces structured data extraction, sanitizes input fields, and validates outputs.
 */

export class Validator {
  /**
   * Cleans and validates phone numbers into international E.164-compatible format
   */
  static normalizePhone(rawPhone) {
    if (!rawPhone) return null;
    const digits = String(rawPhone).replace(/[^\d+]/g, "");
    if (digits.startsWith("+")) return digits;
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
    return `+${digits}`;
  }

  /**
   * Validates email syntax
   */
  static isValidEmail(email) {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).trim().toLowerCase());
  }

  /**
   * Normalizes currency string or number to clean float
   */
  static normalizeCurrency(val) {
    if (val === null || val === undefined) return 0;
    if (typeof val === "number") return val;
    const cleaned = String(val).replace(/[^0-9.-]+/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Validates required fields in an object
   */
  static validateRequired(obj, requiredFields = []) {
    const missing = [];
    for (const field of requiredFields) {
      if (obj[field] === undefined || obj[field] === null || String(obj[field]).trim() === "") {
        missing.push(field);
      }
    }
    return {
      isValid: missing.length === 0,
      missing
    };
  }

  /**
   * Sanitizes text strings (prevents injection, strips trailing whitespace)
   */
  static sanitizeText(str) {
    if (!str) return "";
    return String(str).trim().replace(/[\x00-\x1F\x7F]/g, "");
  }
}
