import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { ScenarioSchema, ScenarioDef } from './types.js';

const RUNS_DIR = '.safestar/runs';
const BASELINE_DIR = '.baselines';

export function ensureDirs() {
    if (!fs.existsSync(RUNS_DIR)) fs.mkdirSync(RUNS_DIR, { recursive: true });
    if (!fs.existsSync(BASELINE_DIR)) fs.mkdirSync(BASELINE_DIR, { recursive: true });
}

export function loadScenario(filepath: string): ScenarioDef {
    const content = fs.readFileSync(filepath, 'utf-8');
    const raw = yaml.load(content);
    return ScenarioSchema.parse(raw);
}

export function saveRuns(scenarioName: string, runs: any[]) {
    const targetDir = path.join(RUNS_DIR, scenarioName);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const filename = `run_${Date.now()}.json`;
    fs.writeFileSync(path.join(targetDir, filename), JSON.stringify(runs, null, 2));
    return path.join(targetDir, filename);
}

export function saveBaseline(scenarioName: string, runs: any[]) {
    const targetDir = path.join(BASELINE_DIR, scenarioName);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const filename = 'latest.json';
    fs.writeFileSync(path.join(targetDir, filename), JSON.stringify(runs, null, 2));
}

export function loadBaseline(scenarioName: string): any[] | null {
    const filepath = path.join(BASELINE_DIR, scenarioName, 'latest.json');
    if (!fs.existsSync(filepath)) return null;
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

export function loadLatestRun(scenarioName: string): any[] | null {
    const targetDir = path.join(RUNS_DIR, scenarioName);
    if (!fs.existsSync(targetDir)) return null;

    const files = fs.readdirSync(targetDir).sort().reverse();
    if (files.length === 0) return null;

    return JSON.parse(fs.readFileSync(path.join(targetDir, files[0]), 'utf-8'));
}