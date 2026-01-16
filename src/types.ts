import { z } from 'zod';

// 1. Zod Schema for the User's YAML Scenario
export const ScenarioSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    prompt: z.string(),
    // NEW: The command to execute (e.g., "python bot.py")
    exec: z.string().optional(),
    runs: z.number().int().min(1).default(5),
    checks: z.object({
        max_length: z.number().optional(),
        must_contain: z.array(z.string()).optional(),
        must_not_contain: z.array(z.string()).optional(),
    }).optional()
});

export type ScenarioDef = z.infer<typeof ScenarioSchema>;

export interface RunResult {
    scenario: string;
    output: string;
    length: number;
    timestamp: string;
}

export interface Baseline {
    scenario: string;
    createdAt: string;
    runs: RunResult[];
    stats: {
        avgLength: number;
    };
}

export interface DiffReport {
    scenario: string;
    status: 'PASS' | 'FAIL' | 'WARN';
    length: {
        baseline: number;
        current: number;
        deltaPercent: number;
    };
    variance: {
        score: number;
    };
    violations: {
        check: string;
        count: number;
    }[];
}