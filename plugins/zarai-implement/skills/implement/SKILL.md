---
name: implement
description: "Implementation task with behavioral flags. Activates when user needs to implement features, algorithms, or systems with quality controls. Flags: --tesla (mental laboratory), --noFallbacks (zero stubs), --robust (edge cases), --verbose (cite sources), --complex (full algorithm), --sophisticated (advanced types). Combos: --all, --defense_grade, --production, --research."
---

# Implement Skill

Implementation task runner with real behavioral flag system. Each `--flag` activates
a verifiable behavioral mode backed by its own contract file.

## When to Use

- User invokes `/implement` with a task description and optional flags
- User asks to implement a feature, algorithm, or system with quality requirements
- User needs high-precision, research-grade, or production-grade code

## Quick Reference

| Flag | Mode | Effect |
|------|------|--------|
| `--tesla` | Master | Build entire solution in mind before writing |
| `--noFallbacks` | Constraint | Zero stubs, zero `except: pass`, zero shells |
| `--robust` | Quality | Every edge case, boundary, and error path handled |
| `--verbose` | Output | Cite every algorithm, derive every constant |
| `--complex` | Fidelity | Real algorithm from source, no simplification |
| `--sophisticated` | Technique | Advanced types, property-based testing, algebraic errors |

### Combos

| Combo | Expands to |
|-------|-----------|
| `--all` | All 6 flags |
| `--defense_grade` | tesla + noFallbacks + robust + complex + sophisticated |
| `--production` | noFallbacks + robust |
| `--research` | tesla + verbose + complex |

## Architecture

```
~/.claude/skills/implement/
  SKILL.md              <- you are here
  registry.json         <- flag metadata, combos, Tesla mappings
  scripts/parse.cjs     <- Node.js argument parser (zero deps)
  flags/
    tesla.md            <- --tesla behavioral contract
    noFallbacks.md      <- --noFallbacks behavioral contract
    robust.md           <- --robust behavioral contract
    verbose.md          <- --verbose behavioral contract
    complex.md          <- --complex behavioral contract
    sophisticated.md    <- --sophisticated behavioral contract
  references/
    guide.md            <- comprehensive guide
```

## How It Works

1. User types `/implement "task description" --flags...`
2. `commands/implement.md` runs `parse.cjs` with `$ARGUMENTS`
3. Parser returns JSON: task, active flags, flag file paths
4. Claude reads each active flag's `.md` contract
5. Claude executes with all behavioral modes composed

## Adding New Flags

1. Create `flags/new-flag.md` with behavioral contract
2. Add entry to `registry.json` under `flags`
3. Optionally add to combo presets in `flag_combinations`
4. Test: `node ~/.claude/skills/implement/scripts/parse.cjs "test" --new-flag`
