import { execSync } from 'child_process';
import { ScenarioDef, RunResult } from './types.js';

export async function runScenario(scenario: ScenarioDef): Promise<RunResult[]> {
    const results: RunResult[] = [];
    console.log(`Running scenario: ${scenario.name} (${scenario.runs} times)...`);

    for (let i = 0; i < scenario.runs; i++) {
        let output = "";

        // 1. REAL MODE: If user provided an exec command
        if (scenario.exec) {
            try {
                // We pass the PROMPT as an environment variable to the user's script
                output = execSync(scenario.exec, {
                    encoding: 'utf-8',
                    env: { ...process.env, PROMPT: scenario.prompt },
                    stdio: ['ignore', 'pipe', 'ignore'] // Clean output, ignore stderr
                });
            } catch (error: any) {
                console.error(`Execution failed: ${error.message}`);
                output = "ERROR_IN_EXECUTION";
            }
        }
        // 2. DEMO MODE: If no exec provided, fallback to mock (so new users can try it)
        else {
            output = "Mock Response " + Math.random().toString(36).substring(7);
        }

        results.push({
            scenario: scenario.name,
            output: output.trim(),
            length: output.length,
            timestamp: new Date().toISOString()
        });
    }

    return results;
}