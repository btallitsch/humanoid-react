# @your-org/utils

A comprehensive, cross-industry React/TypeScript utility library. Zero runtime dependencies. Fully typed. Tree-shakeable via grouped modules.

---

## Installation

```bash
# Copy the `src/` folder into your project, then import by module path:
# e.g. src/utils/date, src/utils/financial, etc.
```

Configure path aliases in `tsconfig.json` (already included):

```json
{
  "paths": {
    "@utils/date":       ["src/date/index.ts"],
    "@utils/financial":  ["src/financial/index.ts"],
    "@utils/validation": ["src/validation/index.ts"],
    "@utils/formatting": ["src/formatting/index.ts"],
    "@utils/string":     ["src/string/index.ts"],
    "@utils/array":      ["src/array/index.ts"],
    "@utils/currency":   ["src/currency/index.ts"],
    "@utils/status":     ["src/status/index.ts"]
  }
}
```

---

## Modules

### `@utils/date`
Date/time parsing, formatting, arithmetic, and business logic.

```ts
import { formatShort, timeAgo, addBusinessDays, businessDaysBetween, getQuarter } from '@utils/date'

formatShort('2024-03-15')              // "Mar 15, 2024"
timeAgo('2024-01-01')                  // "3 months ago"
addBusinessDays(new Date(), 5)         // Date 5 business days from now
businessDaysBetween('2024-01-01', '2024-01-31')  // 23
getQuarter(new Date())                 // 1 | 2 | 3 | 4
```

**Key exports:** `toDate`, `isValidDate`, `formatDate`, `formatShort`, `formatLong`, `formatISO`, `formatTime`, `timeAgo`, `addDuration`, `subtractDuration`, `diffDates`, `startOfDay`, `endOfDay`, `startOfMonth`, `endOfMonth`, `startOfWeek`, `isSameDay`, `isToday`, `isPast`, `isFuture`, `isWithinRange`, `isWeekend`, `isWeekday`, `businessDaysBetween`, `addBusinessDays`, `dateRange`, `getQuarter`, `getFiscalYearStart`

---

### `@utils/financial`
Rounding, percentages, margins, tax, interest, amortization, ROI, and statistics.

```ts
import { grossMargin, amortizationSchedule, calcROI, npv, mean, stdDev } from '@utils/financial'

grossMargin(10000, 6000)               // 40 (percent)
amortizationSchedule(200000, 6.5, 360) // Full 30yr mortgage schedule
calcROI(10000, 13500)                  // { roi: 0.35, roiPercent: 35, netProfit: 3500 }
npv(10, [-10000, 3000, 4000, 5000])    // Net present value
mean([10, 20, 30, 40])                 // 25
stdDev([10, 20, 30, 40])               // 12.91
```

**Key exports:** `round`, `roundUp`, `roundDown`, `clamp`, `percentOf`, `percentChange`, `grossMargin`, `markupPercent`, `priceFromMarkup`, `priceFromMargin`, `calcTax`, `addTax`, `removeTax`, `simpleInterest`, `compoundInterest`, `futureValue`, `monthlyPayment`, `amortizationSchedule`, `calcROI`, `breakEven`, `npv`, `mean`, `median`, `mode`, `stdDev`, `normalize`

---

### `@utils/validation`
Composable validators for forms, schemas, and business rules.

```ts
import { compose, validateSchema, required, isEmail, minLength, isStrongPassword } from '@utils/validation'

// Compose validators
const emailValidator = compose(required(), isEmail())
emailValidator('bad-email')           // { valid: false, message: 'Enter a valid email address.' }

// Schema validation
const result = validateSchema(formData, {
  email: compose(required(), isEmail()),
  password: compose(required(), isStrongPassword()),
  age: compose(required(), min(18)),
})
result.valid    // boolean
result.errors   // Record<string, string>
```

**Key exports:** `compose`, `validate`, `validateSchema`, `required`, `minLength`, `maxLength`, `min`, `max`, `pattern`, `isEmail`, `isURL`, `isPhone`, `isUSZip`, `isUUID`, `isAlphanumeric`, `isNumericString`, `isCreditCard`, `isEIN`, `isSSN`, `isDate`, `isFutureDate`, `isPastDate`, `oneOf`, `notOneOf`, `isPositive`, `isInteger`, `isStrongPassword`

---

### `@utils/formatting`
Numbers, currency, file sizes, phones, addresses, CSV, and display helpers.

```ts
import { formatCurrency, formatFileSize, formatList, toCSV, maskString } from '@utils/formatting'

formatCurrency(1499.99, 'USD')         // "$1,499.99"
formatFileSize(1536000)                // "1.5 MB"
formatList(['apples', 'bananas', 'cherries'])  // "apples, bananas, and cherries"
maskString('4242424242424242', 4)      // "************4242"
toCSV([{ name: 'Bill', age: 30 }])     // CSV string
```

**Key exports:** `formatNumber`, `formatCompact`, `formatPercent`, `formatOrdinal`, `formatCurrency`, `parseCurrency`, `formatFileSize`, `parseFileSize`, `formatUSPhone`, `formatAddressOneLine`, `formatFullName`, `getInitials`, `formatID`, `randomCode`, `formatList`, `toCSV`, `fromCSV`, `maskString`, `truncate`, `pluralize`

---

### `@utils/string`
Case transforms, search, extraction, slugs, similarity, and template interpolation.

```ts
import { toCamelCase, toSlug, levenshtein, interpolate, extractEmails } from '@utils/string'

toCamelCase('hello-world')             // "helloWorld"
toSlug('Hello World! 🚀')              // "hello-world"
levenshtein('kitten', 'sitting')       // 3
interpolate('Hello, {name}!', { name: 'Bill' }) // "Hello, Bill!"
extractEmails('Contact me at bill@example.com') // ["bill@example.com"]
```

**Key exports:** `toCamelCase`, `toPascalCase`, `toSnakeCase`, `toKebabCase`, `toTitleCase`, `toSentenceCase`, `normalizeWhitespace`, `includesCI`, `equalsCI`, `countOccurrences`, `reverse`, `truncateMiddle`, `stripHtml`, `escapeHtml`, `removeDiacritics`, `toSlug`, `extractEmails`, `extractURLs`, `extractNumbers`, `levenshtein`, `similarityScore`, `splitMulti`, `interpolate`, `wordCount`

---

### `@utils/array`
Grouping, sorting, deduplication, set operations, object transformation.

```ts
import { groupBy, sortByMultiple, chunk, deepMerge, flattenObject } from '@utils/array'

groupBy(orders, 'status')              // { pending: [...], shipped: [...] }
sortByMultiple(items, [{ key: 'priority', direction: 'desc' }, { key: 'name' }])
chunk([1, 2, 3, 4, 5], 2)             // [[1, 2], [3, 4], [5]]
deepMerge(defaults, overrides)
flattenObject({ a: { b: { c: 1 } } }) // { "a.b.c": 1 }
```

**Key exports:** `unique`, `uniqueBy`, `groupBy`, `countBy`, `sortBy`, `sortByMultiple`, `compact`, `partition`, `filterDefined`, `chunk`, `take`, `takeLast`, `intersection`, `difference`, `union`, `flatten`, `flattenDeep`, `keyBy`, `pluck`, `sum`, `zip`, `shuffle`, `sample`, `move`, `pick`, `omit`, `deepClone`, `deepMerge`, `flattenObject`, `unflattenObject`, `removeNullish`, `isEmpty`, `deepEqual`, `invertObject`, `renameKeys`

---

### `@utils/currency`
Unit conversions across length, weight, temperature, volume, speed, area, time, data, energy, pressure, and currency.

```ts
import { convertLength, convertTemperature, convertCurrency } from '@utils/currency'

convertLength(100, 'cm', 'in')         // 39.37
convertTemperature(100, 'C', 'F')      // 212
convertCurrency(100, 'USD', 'EUR')     // ~91.74 (reference rates)
convertData(1, 'gb', 'mb')             // 1024
```

**Key exports:** `convertLength`, `convertWeight`, `convertTemperature`, `convertVolume`, `convertSpeed`, `convertArea`, `convertTime`, `convertData`, `convertEnergy`, `convertPressure`, `convertCurrency`, `listCurrencies`, `REFERENCE_RATES_TO_USD`, `mpgToL100km`, `l100kmToMpg`

---

### `@utils/status`
Status registries, finite state machines, priority systems, SLA tracking, and risk scoring.

```ts
import { createStatusRegistry, createStateMachine, evaluateSLA, assessRisk, TASK_STATUSES } from '@utils/status'

// Use a pre-built registry
TASK_STATUSES.label('in_progress')     // "In Progress"
TASK_STATUSES.color('blocked')         // "red"

// Create a custom state machine
const machine = createStateMachine('draft', statusConfigs, transitions)
machine.can('submit')                  // boolean
machine.transition('submit')           // new state

// SLA tracking
evaluateSLA(createdAt, deadline)       // { status: 'at_risk', percentElapsed: 85, hoursRemaining: 2.5 }

// Risk scoring
assessRisk([
  { name: 'compliance', score: 80, weight: 2 },
  { name: 'financial', score: 40, weight: 1 },
])  // { weightedScore: 67, level: 'high', factors: [...] }
```

**Key exports:** `createStatusRegistry`, `createStateMachine`, `ORDER_STATUSES`, `TASK_STATUSES`, `COMPLIANCE_STATUSES`, `TICKET_STATUSES`, `INSPECTION_STATUSES`, `PRIORITY_CONFIG`, `sortByPriority`, `calcWorkflowProgress`, `runPipeline`, `assessRisk`, `evaluateSLA`

---

## Design Principles

- **Zero runtime dependencies** — uses native JS/TS and `Intl` APIs only
- **Fully typed** — strict TypeScript, no `any`
- **Tree-shakeable** — import only what you use from each module
- **Composable** — validators, converters, and state machines are built to chain
- **Framework-agnostic** — works with React, Vue, Svelte, or vanilla TS

---

## License

MIT
