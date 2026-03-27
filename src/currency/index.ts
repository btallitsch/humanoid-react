/**
 * @module currency
 * Currency and unit conversion utilities.
 * Exchange rates are static/reference — for live rates, swap in an API call.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type LengthUnit = 'mm' | 'cm' | 'm' | 'km' | 'in' | 'ft' | 'yd' | 'mi';
export type WeightUnit = 'mg' | 'g' | 'kg' | 'lb' | 'oz' | 'ton' | 'tonne';
export type TemperatureUnit = 'C' | 'F' | 'K';
export type VolumeUnit = 'ml' | 'l' | 'tsp' | 'tbsp' | 'fl_oz' | 'cup' | 'pt' | 'qt' | 'gal';
export type SpeedUnit = 'mps' | 'kph' | 'mph' | 'knot';
export type AreaUnit = 'mm2' | 'cm2' | 'm2' | 'km2' | 'in2' | 'ft2' | 'yd2' | 'acre' | 'ha';
export type TimeUnit = 'ms' | 's' | 'min' | 'hr' | 'day' | 'week' | 'month' | 'year';
export type DataUnit = 'bit' | 'byte' | 'kb' | 'mb' | 'gb' | 'tb' | 'pb';
export type EnergyUnit = 'j' | 'kj' | 'cal' | 'kcal' | 'wh' | 'kwh' | 'btu';
export type PressureUnit = 'pa' | 'kpa' | 'bar' | 'psi' | 'atm' | 'mmhg';

// ─── Generic Converter Factory ────────────────────────────────────────────────

/** Create a converter from a table of unit-to-base-unit factors. */
function makeConverter<U extends string>(toBase: Record<U, number>) {
  return function convert(value: number, from: U, to: U): number {
    const base = value * toBase[from];
    return base / toBase[to];
  };
}

// ─── Length ───────────────────────────────────────────────────────────────────

const lengthToMeters: Record<LengthUnit, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

/** Convert length between units. */
export const convertLength = makeConverter(lengthToMeters);

// ─── Weight / Mass ────────────────────────────────────────────────────────────

const weightToGrams: Record<WeightUnit, number> = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  lb: 453.592,
  oz: 28.3495,
  ton: 907184.74,   // short ton (US)
  tonne: 1000000,   // metric tonne
};

/** Convert weight/mass between units. */
export const convertWeight = makeConverter(weightToGrams);

// ─── Temperature ──────────────────────────────────────────────────────────────

/** Convert temperature between Celsius, Fahrenheit, and Kelvin. */
export function convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit): number {
  if (from === to) return value;

  // Convert to Celsius first
  let celsius: number;
  switch (from) {
    case 'C': celsius = value; break;
    case 'F': celsius = (value - 32) * (5 / 9); break;
    case 'K': celsius = value - 273.15; break;
  }

  // Convert Celsius to target
  switch (to) {
    case 'C': return Math.round(celsius! * 1000) / 1000;
    case 'F': return Math.round((celsius! * (9 / 5) + 32) * 1000) / 1000;
    case 'K': return Math.round((celsius! + 273.15) * 1000) / 1000;
  }
}

// ─── Volume ───────────────────────────────────────────────────────────────────

const volumeToML: Record<VolumeUnit, number> = {
  ml: 1,
  l: 1000,
  tsp: 4.92892,
  tbsp: 14.7868,
  fl_oz: 29.5735,
  cup: 236.588,
  pt: 473.176,
  qt: 946.353,
  gal: 3785.41,
};

/** Convert volume between units. */
export const convertVolume = makeConverter(volumeToML);

// ─── Speed ────────────────────────────────────────────────────────────────────

const speedToMPS: Record<SpeedUnit, number> = {
  mps: 1,
  kph: 1 / 3.6,
  mph: 0.44704,
  knot: 0.514444,
};

/** Convert speed between units. */
export const convertSpeed = makeConverter(speedToMPS);

// ─── Area ─────────────────────────────────────────────────────────────────────

const areaToSqM: Record<AreaUnit, number> = {
  mm2: 0.000001,
  cm2: 0.0001,
  m2: 1,
  km2: 1000000,
  in2: 0.00064516,
  ft2: 0.092903,
  yd2: 0.836127,
  acre: 4046.86,
  ha: 10000,
};

/** Convert area between units. */
export const convertArea = makeConverter(areaToSqM);

// ─── Time ─────────────────────────────────────────────────────────────────────

const timeToSeconds: Record<TimeUnit, number> = {
  ms: 0.001,
  s: 1,
  min: 60,
  hr: 3600,
  day: 86400,
  week: 604800,
  month: 2592000,  // 30-day month
  year: 31536000,  // 365-day year
};

/** Convert time between units. */
export const convertTime = makeConverter(timeToSeconds);

// ─── Data / Storage ───────────────────────────────────────────────────────────

const dataToBytes: Record<DataUnit, number> = {
  bit: 0.125,
  byte: 1,
  kb: 1024,
  mb: 1048576,
  gb: 1073741824,
  tb: 1099511627776,
  pb: 1125899906842624,
};

/** Convert data sizes between units. */
export const convertData = makeConverter(dataToBytes);

// ─── Energy ───────────────────────────────────────────────────────────────────

const energyToJoules: Record<EnergyUnit, number> = {
  j: 1,
  kj: 1000,
  cal: 4.184,
  kcal: 4184,
  wh: 3600,
  kwh: 3600000,
  btu: 1055.06,
};

/** Convert energy between units. */
export const convertEnergy = makeConverter(energyToJoules);

// ─── Pressure ─────────────────────────────────────────────────────────────────

const pressureToPa: Record<PressureUnit, number> = {
  pa: 1,
  kpa: 1000,
  bar: 100000,
  psi: 6894.76,
  atm: 101325,
  mmhg: 133.322,
};

/** Convert pressure between units. */
export const convertPressure = makeConverter(pressureToPa);

// ─── Currency (Static Reference Rates) ───────────────────────────────────────

/**
 * Static USD reference exchange rates.
 * Replace with a live API (e.g., Open Exchange Rates, Fixer.io) in production.
 */
export const REFERENCE_RATES_TO_USD: Record<string, number> = {
  USD: 1,
  EUR: 1.09,
  GBP: 1.27,
  JPY: 0.0067,
  CAD: 0.74,
  AUD: 0.65,
  CHF: 1.12,
  CNY: 0.14,
  INR: 0.012,
  MXN: 0.058,
  BRL: 0.20,
  KRW: 0.00075,
  SGD: 0.74,
  HKD: 0.128,
  NOK: 0.094,
  SEK: 0.094,
  DKK: 0.146,
  NZD: 0.60,
  ZAR: 0.055,
  AED: 0.272,
};

/** Convert between currencies using reference (static) rates. */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number> = REFERENCE_RATES_TO_USD
): number {
  const fromRate = rates[from.toUpperCase()];
  const toRate = rates[to.toUpperCase()];
  if (!fromRate) throw new Error(`Unknown currency: ${from}`);
  if (!toRate) throw new Error(`Unknown currency: ${to}`);
  return Math.round((amount * fromRate / toRate) * 10000) / 10000;
}

/** List all available currency codes from a rates table. */
export function listCurrencies(rates: Record<string, number> = REFERENCE_RATES_TO_USD): string[] {
  return Object.keys(rates).sort();
}

// ─── Cooking & Recipe Conversions ─────────────────────────────────────────────

/** Convert US cup fractions to a readable string: 0.75 → "¾ cup". */
export function formatCupFraction(value: number): string {
  const fractions: [number, string][] = [
    [1, '1 cup'],
    [0.75, '¾ cup'],
    [0.6667, '⅔ cup'],
    [0.5, '½ cup'],
    [0.3333, '⅓ cup'],
    [0.25, '¼ cup'],
    [0.125, '⅛ cup'],
  ];
  const closest = fractions.reduce((prev, curr) =>
    Math.abs(curr[0] - value) < Math.abs(prev[0] - value) ? curr : prev
  );
  return closest[1];
}

// ─── Fuel Economy ─────────────────────────────────────────────────────────────

/** Convert MPG to L/100km. */
export function mpgToL100km(mpg: number): number {
  return Math.round((235.214 / mpg) * 100) / 100;
}

/** Convert L/100km to MPG. */
export function l100kmToMpg(l100km: number): number {
  return Math.round((235.214 / l100km) * 100) / 100;
}
