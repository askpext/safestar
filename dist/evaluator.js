export function evaluate(scenario, currentRuns, baselineRuns) {
    const report = {
        scenario: scenario.name,
        status: 'PASS',
        length: { baseline: 0, current: 0, deltaPercent: 0 },
        variance: { score: 0 },
        violations: []
    };
    const currentLengths = currentRuns.map(r => r.length);
    const avgCurrent = currentLengths.reduce((a, b) => a + b, 0) / currentLengths.length;
    const squareDiffs = currentLengths.map(v => Math.pow(v - avgCurrent, 2));
    const variance = Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / currentLengths.length);
    report.length.current = Math.round(avgCurrent);
    report.variance.score = parseFloat(variance.toFixed(2));
    if (baselineRuns) {
        const baseLengths = baselineRuns.map(r => r.length);
        const avgBase = baseLengths.reduce((a, b) => a + b, 0) / baseLengths.length;
        report.length.baseline = Math.round(avgBase);
        if (avgBase > 0) {
            report.length.deltaPercent = Math.round(((avgCurrent - avgBase) / avgBase) * 100);
        }
        if (Math.abs(report.length.deltaPercent) > 50) {
            report.status = 'WARN';
        }
    }
    const violations = {};
    currentRuns.forEach(run => {
        if (scenario.checks?.max_length && run.length > scenario.checks.max_length) {
            violations['max_length'] = (violations['max_length'] || 0) + 1;
        }
        scenario.checks?.must_contain?.forEach(word => {
            if (!run.output.toLowerCase().includes(word.toLowerCase())) {
                violations[`must_contain: "${word}"`] = (violations[`must_contain: "${word}"`] || 0) + 1;
            }
        });
        scenario.checks?.must_not_contain?.forEach(word => {
            if (run.output.toLowerCase().includes(word.toLowerCase())) {
                violations[`must_not_contain: "${word}"`] = (violations[`must_not_contain: "${word}"`] || 0) + 1;
            }
        });
    });
    Object.entries(violations).forEach(([check, count]) => {
        report.violations.push({ check, count });
        if (count > 0)
            report.status = 'FAIL';
    });
    return report;
}
