/**
 * @module status
 * Status management, state machines, and workflow logic utilities.
 * Framework-agnostic, zero-dependency.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatusColor = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'orange' | 'purple';

export interface StatusConfig<S extends string> {
  label: string;
  color: StatusColor;
  terminal?: boolean;          // no transitions out of this state
  description?: string;
}

export interface TransitionConfig<S extends string, E extends string> {
  from: S | S[];
  event: E;
  to: S;
  guard?: (context: unknown) => boolean;
  onTransition?: (from: S, to: S, context: unknown) => void;
}

export interface StateMachine<S extends string, E extends string> {
  current: S;
  can: (event: E, context?: unknown) => boolean;
  transition: (event: E, context?: unknown) => StateMachine<S, E>;
  getConfig: () => StatusConfig<S>;
  history: S[];
}

export interface WorkflowStage<S extends string> {
  id: S;
  label: string;
  order: number;
  completed?: boolean;
  skipped?: boolean;
}

export interface PipelineResult<T> {
  success: boolean;
  value: T | null;
  error: string | null;
  steps: { name: string; passed: boolean; error?: string }[];
}

// ─── Status Registry ──────────────────────────────────────────────────────────

/** Create a typed status registry and helper utilities. */
export function createStatusRegistry<S extends string>(
  configs: Record<S, StatusConfig<S>>
) {
  return {
    /** Get the full config for a status. */
    get(status: S): StatusConfig<S> {
      return configs[status];
    },

    /** Get display label. */
    label(status: S): string {
      return configs[status]?.label ?? status;
    },

    /** Get status color. */
    color(status: S): StatusColor {
      return configs[status]?.color ?? 'gray';
    },

    /** Check if a status is terminal (no further transitions). */
    isTerminal(status: S): boolean {
      return configs[status]?.terminal === true;
    },

    /** List all non-terminal statuses. */
    activeStatuses(): S[] {
      return (Object.keys(configs) as S[]).filter((s) => !configs[s].terminal);
    },

    /** List all terminal statuses. */
    terminalStatuses(): S[] {
      return (Object.keys(configs) as S[]).filter((s) => configs[s].terminal === true);
    },

    /** Get all statuses as an array of [id, config] entries. */
    all(): [S, StatusConfig<S>][] {
      return Object.entries(configs) as [S, StatusConfig<S>][];
    },
  };
}

// ─── Finite State Machine ─────────────────────────────────────────────────────

/** Create a typed finite state machine. */
export function createStateMachine<S extends string, E extends string>(
  initial: S,
  statusConfigs: Record<S, StatusConfig<S>>,
  transitions: TransitionConfig<S, E>[]
): StateMachine<S, E> {
  const history: S[] = [initial];
  let current = initial;

  function getApplicableTransitions(event: E, from: S) {
    return transitions.filter((t) => {
      const fromStates = Array.isArray(t.from) ? t.from : [t.from];
      return t.event === event && fromStates.includes(from);
    });
  }

  function can(event: E, context: unknown = {}): boolean {
    return getApplicableTransitions(event, current).some(
      (t) => !t.guard || t.guard(context)
    );
  }

  function transition(event: E, context: unknown = {}): StateMachine<S, E> {
    const applicable = getApplicableTransitions(event, current);
    const matched = applicable.find((t) => !t.guard || t.guard(context));
    if (!matched) {
      throw new Error(`No valid transition for event "${event}" from state "${current}".`);
    }
    const prev = current;
    current = matched.to;
    history.push(current);
    matched.onTransition?.(prev, current, context);
    return machine;
  }

  function getConfig(): StatusConfig<S> {
    return statusConfigs[current];
  }

  const machine: StateMachine<S, E> = {
    get current() { return current; },
    get history() { return [...history]; },
    can,
    transition,
    getConfig,
  };

  return machine;
}

// ─── Pre-built Status Sets ────────────────────────────────────────────────────

/** Common order/lifecycle statuses. */
export const ORDER_STATUSES = createStatusRegistry({
  draft:      { label: 'Draft',      color: 'gray'   },
  pending:    { label: 'Pending',    color: 'yellow' },
  confirmed:  { label: 'Confirmed',  color: 'blue'   },
  processing: { label: 'Processing', color: 'blue'   },
  shipped:    { label: 'Shipped',    color: 'purple' },
  delivered:  { label: 'Delivered',  color: 'green',  terminal: true },
  cancelled:  { label: 'Cancelled',  color: 'red',    terminal: true },
  refunded:   { label: 'Refunded',   color: 'orange', terminal: true },
});

/** Common project/task statuses. */
export const TASK_STATUSES = createStatusRegistry({
  backlog:     { label: 'Backlog',     color: 'gray'   },
  todo:        { label: 'To Do',       color: 'blue'   },
  in_progress: { label: 'In Progress', color: 'yellow' },
  in_review:   { label: 'In Review',   color: 'purple' },
  blocked:     { label: 'Blocked',     color: 'red'    },
  done:        { label: 'Done',        color: 'green',  terminal: true },
  cancelled:   { label: 'Cancelled',   color: 'gray',   terminal: true },
});

/** Common compliance/audit statuses. */
export const COMPLIANCE_STATUSES = createStatusRegistry({
  not_started:  { label: 'Not Started',  color: 'gray'   },
  in_progress:  { label: 'In Progress',  color: 'blue'   },
  under_review: { label: 'Under Review', color: 'yellow' },
  approved:     { label: 'Approved',     color: 'green',  terminal: true },
  rejected:     { label: 'Rejected',     color: 'red',    terminal: true },
  expired:      { label: 'Expired',      color: 'orange', terminal: true },
});

/** Common ticket/support statuses. */
export const TICKET_STATUSES = createStatusRegistry({
  open:        { label: 'Open',        color: 'blue'   },
  in_progress: { label: 'In Progress', color: 'yellow' },
  pending:     { label: 'Pending',     color: 'orange' },
  on_hold:     { label: 'On Hold',     color: 'gray'   },
  resolved:    { label: 'Resolved',    color: 'green',  terminal: true },
  closed:      { label: 'Closed',      color: 'gray',   terminal: true },
});

/** Common inspection / field service statuses. */
export const INSPECTION_STATUSES = createStatusRegistry({
  scheduled:  { label: 'Scheduled',  color: 'blue'   },
  en_route:   { label: 'En Route',   color: 'yellow' },
  on_site:    { label: 'On Site',    color: 'orange' },
  completed:  { label: 'Completed',  color: 'green',  terminal: true },
  failed:     { label: 'Failed',     color: 'red',    terminal: true },
  rescheduled:{ label: 'Rescheduled',color: 'purple' },
  cancelled:  { label: 'Cancelled',  color: 'gray',   terminal: true },
});

// ─── Priority System ──────────────────────────────────────────────────────────

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';

export const PRIORITY_CONFIG: Record<PriorityLevel, { label: string; color: StatusColor; weight: number }> = {
  critical: { label: 'Critical', color: 'red',    weight: 5 },
  high:     { label: 'High',     color: 'orange', weight: 4 },
  medium:   { label: 'Medium',   color: 'yellow', weight: 3 },
  low:      { label: 'Low',      color: 'blue',   weight: 2 },
  none:     { label: 'None',     color: 'gray',   weight: 1 },
};

/** Sort items by priority weight (highest first). */
export function sortByPriority<T>(items: T[], getPriority: (item: T) => PriorityLevel): T[] {
  return [...items].sort(
    (a, b) => PRIORITY_CONFIG[getPriority(b)].weight - PRIORITY_CONFIG[getPriority(a)].weight
  );
}

// ─── Workflow Progress ────────────────────────────────────────────────────────

/** Calculate progress through a sequential workflow. */
export function calcWorkflowProgress<S extends string>(
  stages: WorkflowStage<S>[],
  currentStage: S
): { percent: number; completedStages: number; totalStages: number; isComplete: boolean } {
  const sorted = [...stages].sort((a, b) => a.order - b.order);
  const totalStages = sorted.length;
  const currentIdx = sorted.findIndex((s) => s.id === currentStage);
  const completedStages = currentIdx === -1 ? 0 : currentIdx;
  const isComplete = currentIdx === totalStages - 1;

  return {
    percent: totalStages === 0 ? 0 : Math.round((completedStages / totalStages) * 100),
    completedStages,
    totalStages,
    isComplete,
  };
}

// ─── Validation Pipeline ──────────────────────────────────────────────────────

export interface PipelineStep<T> {
  name: string;
  run: (value: T) => boolean | string | Promise<boolean | string>;
}

/** Run a value through a sequential validation/processing pipeline. */
export async function runPipeline<T>(
  value: T,
  steps: PipelineStep<T>[]
): Promise<PipelineResult<T>> {
  const stepResults: PipelineResult<T>['steps'] = [];

  for (const step of steps) {
    const result = await Promise.resolve(step.run(value));
    const passed = result === true;
    const error = typeof result === 'string' ? result : passed ? undefined : `Step "${step.name}" failed.`;
    stepResults.push({ name: step.name, passed, error });
    if (!passed) {
      return {
        success: false,
        value: null,
        error: error ?? `Pipeline failed at step: ${step.name}`,
        steps: stepResults,
      };
    }
  }

  return { success: true, value, error: null, steps: stepResults };
}

// ─── Risk Scoring ─────────────────────────────────────────────────────────────

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface RiskFactor {
  name: string;
  score: number;   // 0–100
  weight: number;  // relative weight
}

export interface RiskAssessment {
  weightedScore: number;
  level: RiskLevel;
  factors: RiskFactor[];
}

/** Calculate a weighted risk score from multiple factors. */
export function assessRisk(factors: RiskFactor[]): RiskAssessment {
  const totalWeight = factors.reduce((s, f) => s + f.weight, 0);
  const weightedScore = totalWeight === 0
    ? 0
    : Math.round(factors.reduce((s, f) => s + f.score * (f.weight / totalWeight), 0));

  const level: RiskLevel =
    weightedScore >= 75 ? 'critical' :
    weightedScore >= 50 ? 'high' :
    weightedScore >= 25 ? 'medium' : 'low';

  return { weightedScore, level, factors };
}

// ─── SLA / Deadline Tracking ──────────────────────────────────────────────────

export type SLAStatus = 'on_track' | 'at_risk' | 'breached';

export interface SLAResult {
  status: SLAStatus;
  percentElapsed: number;
  hoursRemaining: number;
  isBreached: boolean;
}

/**
 * Evaluate SLA status.
 * @param createdAt   When the item was created
 * @param deadline    When it must be resolved
 * @param atRiskThreshold  Fraction (0–1) of elapsed time that triggers "at risk" warning
 */
export function evaluateSLA(
  createdAt: Date,
  deadline: Date,
  atRiskThreshold = 0.8
): SLAResult {
  const now = Date.now();
  const total = deadline.getTime() - createdAt.getTime();
  const elapsed = now - createdAt.getTime();
  const percentElapsed = total <= 0 ? 100 : Math.min(100, Math.round((elapsed / total) * 100));
  const hoursRemaining = Math.max(0, Math.round((deadline.getTime() - now) / 3600000 * 100) / 100);
  const isBreached = now > deadline.getTime();

  const status: SLAStatus = isBreached
    ? 'breached'
    : percentElapsed >= atRiskThreshold * 100
    ? 'at_risk'
    : 'on_track';

  return { status, percentElapsed, hoursRemaining, isBreached };
}
