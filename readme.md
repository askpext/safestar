<p align="center">
  <h1 align="center">SafeStar</h1>
  <p align="center"><strong>The "Git" for AI Behavior.</strong></p>
  <p align="center">Snapshot, version, and diff AI model outputs. Detect drift before your users do.</p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/safestar"><img src="https://img.shields.io/npm/v/safestar.svg" alt="npm version"></a>
  <a href="https://github.com/your-username/safestar/actions"><img src="https://github.com/your-username/safestar/workflows/AI%20Guardrails/badge.svg" alt="Build Status"></a>
  <a href="https://opensource.org/licenses/ISC"><img src="https://img.shields.io/badge/License-ISC-blue.svg" alt="License: ISC"></a>
</p>

---

## Why SafeStar?

You updated a prompt. Tests pass. You deploy. Three days later, users complain the bot is "acting weird."

**The problem:** Traditional tests don't catch AI behavior drift—subtle changes in tone, verbosity, or consistency that emerge over time or after model updates.

**SafeStar fixes this** by treating AI outputs like code:
- 📸 **Snapshot** a known-good baseline
- 🔍 **Diff** against it in CI/CD
- 🚨 **Fail the build** if behavior drifts beyond tolerance

No SaaS. No external dependencies. Works with any CLI command.

---

## Installation

```bash
npm install --save-dev safestar
```

---

## Quick Start

### 1. Define a Scenario

Create `scenarios/refund.yaml`:

```yaml
name: refund_bot_test
description: Ensure the refund bot doesn't hallucinate or get rude.

prompt: "I want a refund immediately."

# Run your AI however you want—Python, Node, curl, anything
exec: "python3 scripts/my_agent.py"

# Test multiple times to catch variance
runs: 5

# Heuristic guardrails
checks:
  max_length: 200
  must_contain:
    - "refund"
  must_not_contain:
    - "I am just an AI"
```

> **Note:** SafeStar passes the prompt via `process.env.PROMPT` (or equivalent in your language).

### 2. Run & Baseline

Run your scenario:
```bash
npx safestar run scenarios/refund.yaml
```

Happy with the output? Lock it as your gold standard:
```bash
npx safestar baseline refund_bot_test
```

### 3. Diff in CI/CD

```bash
npx safestar diff scenarios/refund.yaml
```

**Example output:**
```
--- SAFESTAR REPORT ---
Status: FAIL

Metrics:
  Avg Length: 45 chars
  Drift:      +210% vs baseline (WARNING)
  Variance:   9.8 (High instability)

Violations:
  - must_not_contain "sorry sorry": failed in 2 runs
```

---

## Checks Reference

| Check | Description |
|-------|-------------|
| `max_length` | Fail if output exceeds N characters |
| `must_contain` | Fail if any string is missing from output |
| `must_not_contain` | Fail if any string is found in output |

---

## `exec` Examples

SafeStar works with anything that prints to stdout:

```yaml
# Python
exec: "python3 bot.py"

# Node.js
exec: "node agent.js"

# cURL (test an API directly)
exec: "curl -s https://api.openai.com/v1/chat/completions -H 'Authorization: Bearer $OPENAI_KEY' -d '{\"model\":\"gpt-4\",\"messages\":[{\"role\":\"user\",\"content\":\"$PROMPT\"}]}'"

# Any CLI
exec: "./my-binary --prompt \"$PROMPT\""
```

---

## GitHub Actions

```yaml
name: AI Guardrails
on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx safestar diff scenarios/refund.yaml
```

---

## Philosophy

- **Zero dependencies** – Runs anywhere Node runs
- **No SaaS** – Your data stays on your machine
- **Language agnostic** – If it prints to stdout, SafeStar can test it
- **Git-native** – Baselines are `.json` files you commit

---

## License

ISC