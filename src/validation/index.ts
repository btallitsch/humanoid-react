/**
 * @module validation
 * Schema-less, dependency-free validation utilities for forms, data, and business rules.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ValidationResult = { valid: true } | { valid: false; message: string };

export type Validator<T = unknown> = (value: T) => ValidationResult;

export interface FieldValidation {
  field: string;
  result: ValidationResult;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

// ─── Core Builder ─────────────────────────────────────────────────────────────

/** Compose multiple validators into one; returns first failure or valid. */
export function compose<T>(...validators: Validator<T>[]): Validator<T> {
  return (value: T) => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.valid) return result;
    }
    return { valid: true };
  };
}

/** Run a validator and return the error message or null. */
export function validate<T>(value: T, ...validators: Validator<T>[]): string | null {
  const composed = compose(...validators);
  const result = composed(value);
  return result.valid ? null : result.message;
}

/** Validate an object against a schema of validators, returns all errors. */
export function validateSchema<T extends Record<string, unknown>>(
  data: T,
  schema: Partial<Record<keyof T, Validator<unknown>>>
): SchemaValidationResult {
  const errors: Record<string, string> = {};

  for (const [field, validator] of Object.entries(schema) as [keyof T, Validator<unknown>][]) {
    if (!validator) continue;
    const result = validator(data[field]);
    if (!result.valid) {
      errors[field as string] = result.message;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ─── Primitives ───────────────────────────────────────────────────────────────

/** Fails if value is null, undefined, empty string, or empty array. */
export function required(message = 'This field is required'): Validator {
  return (value) => {
    if (value === null || value === undefined) return { valid: false, message };
    if (typeof value === 'string' && value.trim() === '') return { valid: false, message };
    if (Array.isArray(value) && value.length === 0) return { valid: false, message };
    return { valid: true };
  };
}

/** Minimum string length. */
export function minLength(min: number, message?: string): Validator<string> {
  return (value) =>
    value.length >= min
      ? { valid: true }
      : { valid: false, message: message ?? `Must be at least ${min} characters.` };
}

/** Maximum string length. */
export function maxLength(max: number, message?: string): Validator<string> {
  return (value) =>
    value.length <= max
      ? { valid: true }
      : { valid: false, message: message ?? `Must be no more than ${max} characters.` };
}

/** Numeric min value. */
export function min(minVal: number, message?: string): Validator<number> {
  return (value) =>
    value >= minVal
      ? { valid: true }
      : { valid: false, message: message ?? `Must be at least ${minVal}.` };
}

/** Numeric max value. */
export function max(maxVal: number, message?: string): Validator<number> {
  return (value) =>
    value <= maxVal
      ? { valid: true }
      : { valid: false, message: message ?? `Must be no more than ${maxVal}.` };
}

/** Must match a regex pattern. */
export function pattern(regex: RegExp, message = 'Invalid format.'): Validator<string> {
  return (value) =>
    regex.test(value)
      ? { valid: true }
      : { valid: false, message };
}

// ─── String Formats ───────────────────────────────────────────────────────────

/** Valid email address. */
export function isEmail(message = 'Enter a valid email address.'): Validator<string> {
  return pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, message);
}

/** Valid URL (http/https). */
export function isURL(message = 'Enter a valid URL.'): Validator<string> {
  return (value) => {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol)
        ? { valid: true }
        : { valid: false, message };
    } catch {
      return { valid: false, message };
    }
  };
}

/** Valid phone number (E.164 or common US/international formats). */
export function isPhone(message = 'Enter a valid phone number.'): Validator<string> {
  return pattern(/^\+?[\d\s\-().]{7,20}$/, message);
}

/** US ZIP code (5-digit or ZIP+4). */
export function isUSZip(message = 'Enter a valid US ZIP code.'): Validator<string> {
  return pattern(/^\d{5}(-\d{4})?$/, message);
}

/** Valid UUID v4. */
export function isUUID(message = 'Must be a valid UUID.'): Validator<string> {
  return pattern(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    message
  );
}

/** Alphanumeric only. */
export function isAlphanumeric(message = 'Must contain only letters and numbers.'): Validator<string> {
  return pattern(/^[a-zA-Z0-9]+$/, message);
}

/** Must only contain letters. */
export function isAlpha(message = 'Must contain only letters.'): Validator<string> {
  return pattern(/^[a-zA-Z]+$/, message);
}

/** Must be a numeric string. */
export function isNumericString(message = 'Must be a numeric value.'): Validator<string> {
  return pattern(/^-?\d+(\.\d+)?$/, message);
}

// ─── Financial Validators ─────────────────────────────────────────────────────

/** Valid credit card number (Luhn algorithm). */
export function isCreditCard(message = 'Enter a valid credit card number.'): Validator<string> {
  return (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return { valid: false, message };
    let sum = 0;
    let alternate = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0 ? { valid: true } : { valid: false, message };
  };
}

/** Valid EIN (Employer Identification Number): XX-XXXXXXX */
export function isEIN(message = 'Enter a valid EIN (XX-XXXXXXX).'): Validator<string> {
  return pattern(/^\d{2}-\d{7}$/, message);
}

/** Valid SSN (Social Security Number): XXX-XX-XXXX */
export function isSSN(message = 'Enter a valid SSN (XXX-XX-XXXX).'): Validator<string> {
  return pattern(/^\d{3}-\d{2}-\d{4}$/, message);
}

// ─── Date Validators ──────────────────────────────────────────────────────────

/** Validates that the value is a valid date. */
export function isDate(message = 'Enter a valid date.'): Validator<unknown> {
  return (value) => {
    const d = new Date(value as string | number);
    return isNaN(d.getTime()) ? { valid: false, message } : { valid: true };
  };
}

/** Validates that the date is in the future. */
export function isFutureDate(message = 'Date must be in the future.'): Validator<unknown> {
  return (value) => {
    const d = new Date(value as string | number);
    return d.getTime() > Date.now() ? { valid: true } : { valid: false, message };
  };
}

/** Validates that the date is in the past. */
export function isPastDate(message = 'Date must be in the past.'): Validator<unknown> {
  return (value) => {
    const d = new Date(value as string | number);
    return d.getTime() < Date.now() ? { valid: true } : { valid: false, message };
  };
}

// ─── Business Logic Validators ────────────────────────────────────────────────

/** Value must be one of a set of allowed values. */
export function oneOf<T>(allowedValues: T[], message?: string): Validator<T> {
  return (value) =>
    allowedValues.includes(value)
      ? { valid: true }
      : {
          valid: false,
          message: message ?? `Must be one of: ${allowedValues.join(', ')}.`,
        };
}

/** Value must not be one of the disallowed values. */
export function notOneOf<T>(disallowedValues: T[], message?: string): Validator<T> {
  return (value) =>
    !disallowedValues.includes(value)
      ? { valid: true }
      : {
          valid: false,
          message: message ?? `Cannot be one of: ${disallowedValues.join(', ')}.`,
        };
}

/** Validates a positive number. */
export function isPositive(message = 'Must be a positive number.'): Validator<number> {
  return (value) => (value > 0 ? { valid: true } : { valid: false, message });
}

/** Validates a non-negative number (zero or positive). */
export function isNonNegative(message = 'Must be zero or a positive number.'): Validator<number> {
  return (value) => (value >= 0 ? { valid: true } : { valid: false, message });
}

/** Validates an integer. */
export function isInteger(message = 'Must be a whole number.'): Validator<number> {
  return (value) => (Number.isInteger(value) ? { valid: true } : { valid: false, message });
}

/** Validates a strong password (min 8 chars, uppercase, lowercase, digit, special char). */
export function isStrongPassword(message?: string): Validator<string> {
  return (value) => {
    const errors: string[] = [];
    if (value.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(value)) errors.push('an uppercase letter');
    if (!/[a-z]/.test(value)) errors.push('a lowercase letter');
    if (!/\d/.test(value)) errors.push('a number');
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) errors.push('a special character');
    return errors.length === 0
      ? { valid: true }
      : { valid: false, message: message ?? `Password must include: ${errors.join(', ')}.` };
  };
}
