#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { ensureDirs, loadScenario, saveRuns, saveBaseline, loadBaseline, loadLatestRun } from './utils.js';
import { runScenario } from './runner.js';
import { evaluate } from './evaluator.js';
const program = new Command();
program
    .name('safestar')
    .description('Snapshot and diff AI behavior')
    .version('1.0.0');
// COMMAND: RUN
program.command('run <scenarioPath>')
    .description('Execute a scenario and save runs locally')
    .action(async (scenarioPath) => {
    try {
        ensureDirs();
        const scenario = loadScenario(scenarioPath);
        const results = await runScenario(scenario);
        const savedPath = saveRuns(scenario.name, results);
        console.log(chalk.green(`✓ Runs completed. Saved to ${savedPath}`));
        // Auto-run diff logic to show immediate feedback
        const baseline = loadBaseline(scenario.name);
        const report = evaluate(scenario, results, baseline);
        printReport(report);
    }
    catch (e) {
        console.error(chalk.red('Error:'), e.message);
    }
});
// COMMAND: BASELINE
program.command('baseline <scenarioName>')
    .description('Promote the latest run to be the new baseline')
    .action((scenarioName) => {
    try {
        const latest = loadLatestRun(scenarioName);
        if (!latest) {
            console.log(chalk.red('No runs found. Run "safestar run <scenario>" first.'));
            return;
        }
        saveBaseline(scenarioName, latest);
        console.log(chalk.green(`✓ Baseline updated for ${scenarioName}`));
    }
    catch (e) {
        console.error(chalk.red('Error:'), e.message);
    }
});
// COMMAND: DIFF
program.command('diff <scenarioPath>')
    .description('Compare latest runs against baseline')
    .action((scenarioPath) => {
    try {
        const scenario = loadScenario(scenarioPath);
        const current = loadLatestRun(scenario.name);
        const baseline = loadBaseline(scenario.name);
        if (!current) {
            console.error(chalk.red('No current runs found.'));
            return;
        }
        const report = evaluate(scenario, current, baseline);
        printReport(report);
    }
    catch (e) {
        console.error(chalk.red('Error:'), e.message);
    }
});
// Helper to pretty print the report
function printReport(report) {
    console.log(chalk.bold('\n--- SAFESTAR REPORT ---'));
    if (report.status === 'FAIL')
        console.log(`Status: ${chalk.red.bold('FAIL')}`);
    else if (report.status === 'WARN')
        console.log(`Status: ${chalk.yellow.bold('WARN')}`);
    else
        console.log(`Status: ${chalk.green.bold('PASS')}`);
    console.log(`\nMetrics:`);
    console.log(`  Avg Length: ${report.length.current} chars`);
    if (report.length.baseline > 0) {
        const color = report.length.deltaPercent > 0 ? chalk.yellow : chalk.blue;
        console.log(`  Drift:      ${color(report.length.deltaPercent + '%')} vs baseline`);
    }
    console.log(`  Variance:   ${report.variance.score} (std dev)`);
    if (report.violations.length > 0) {
        console.log(chalk.red(`\nViolations:`));
        report.violations.forEach((v) => {
            console.log(`  - ${v.check}: failed in ${v.count} runs`);
        });
    }
    else {
        console.log(chalk.green(`\nNo heuristic violations.`));
    }
    console.log('-----------------------\n');
}
program.parse();
