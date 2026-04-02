---
description: "Implementation task with behavioral flags: --tesla --noFallbacks --robust --verbose --complex --sophisticated. Combos: --all --apex --production --research. No flags = all flags (maximum quality)."
argument-hint: '"task description" [--flags...]'
---

ultrathink — ZARAI IMPLEMENT

## STEP 1: PARSE ARGUMENTS

Run the argument parser to extract task and active flags:

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/implement/scripts/parse.cjs" $ARGUMENTS
```

If parse.cjs exits with code 1 (no task), ask the user what to implement.
If parse.cjs exits with code 2 (unknown flags), show available flags and ask for correction.

**Default behavior:** No flags = ALL flags active (maximum quality bar).
Flags exist to scale DOWN from the default, not to scale up. If you only want
a subset, specify only those flags explicitly.

**Anti-hallucination guardrail:**
Active flags are determined SOLELY by the parser's JSON output.
Do NOT override or second-guess the parser's flag resolution.

## STEP 2: LOAD ACTIVE FLAG CONTRACTS

For each active flag in the parser's JSON output, read the corresponding flag file:

```bash
cat "${CLAUDE_PLUGIN_ROOT}/skills/implement/flags/tesla.md"
cat "${CLAUDE_PLUGIN_ROOT}/skills/implement/flags/noFallbacks.md"
```

Read each flag file SEQUENTIALLY. After reading each one, internalize its behavioral
contract. These contracts are BINDING for this implementation session.

## STEP 3: PLAN (MANDATORY)

Before writing any code:
1. If `--tesla` is active: full mental laboratory protocol (see tesla.md contract)
2. Otherwise: plan the implementation in extended thinking — modules, data flow, call graph
3. Read any source PDFs, exemplar files, or references needed for the task

## STEP 4: EXECUTE

Implement the task described in the parser's `task` field.

All active flag contracts apply simultaneously. Where contracts overlap, the more
restrictive requirement wins. For example:
- `--noFallbacks` + `--robust` = handle every edge case AND never use fallback patterns
- `--verbose` + `--complex` = cite every equation AND implement the full algorithm

## STEP 5: VERIFY

Produce a verification checklist. For each active flag, include that flag's verification
criteria (found in the flag .md file). Every criterion must have evidence.

### Baseline Criteria (always apply)

- [ ] Code compiles/runs with zero errors and zero warnings
- [ ] All functions defined are invoked (no orphaned code)
- [ ] Data flows end-to-end: input → processing → output (no dead ends)

### Flag-Specific Criteria

For each active flag, copy its verification criteria from the flag file and
provide evidence for each checkbox.

**FAIL = ANY UNCHECKED. Keep working until all pass.**
