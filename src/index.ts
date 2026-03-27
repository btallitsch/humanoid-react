/**
 * @packageDocumentation
 * Cross-industry React/TypeScript utility library.
 *
 * Grouped module imports (recommended):
 *   import { formatDate, timeAgo } from '@utils/date'
 *   import { round, grossMargin } from '@utils/financial'
 *   import { required, isEmail } from '@utils/validation'
 *   import { formatCurrency, toCSV } from '@utils/formatting'
 *   import { toCamelCase, toSlug } from '@utils/string'
 *   import { groupBy, sortBy, deepMerge } from '@utils/array'
 *   import { convertLength, convertTemperature } from '@utils/currency'
 *   import { createStateMachine, evaluateSLA } from '@utils/status'
 *
 * Or barrel import everything:
 *   import * as Utils from '@your-org/utils'
 */

export * as DateUtils from './date/index';
export * as FinancialUtils from './financial/index';
export * as ValidationUtils from './validation/index';
export * as FormattingUtils from './formatting/index';
export * as StringUtils from './string/index';
export * as ArrayUtils from './array/index';
export * as CurrencyUtils from './currency/index';
export * as StatusUtils from './status/index';
