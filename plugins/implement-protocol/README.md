<div align="center">

<img src="assets/cover.png" width="100%" alt="ZARAI AI Marketplace — Precision developer tools for Claude Code" />

<br/>

<img src="assets/zarai-avatar.png" width="80" alt="ZARAI AI" />

# ZARAI AI Plugin Marketplace

**Precision developer tools for Claude Code.**

Built to deploy. Not to demo.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-v1.0.33+-purple.svg)](https://code.claude.com)
[![ZARAI AI](https://img.shields.io/badge/zarai.ai-Practical%20AI-ff3366.svg)](https://zarai.ai)

</div>

---

## What This Is

A Claude Code plugin marketplace by [ZARAI AI](https://zarai.ai).

## Install

```bash
# Add the marketplace
/plugin marketplace add zarai-ai/zarai-ai-marketplace

# Install a plugin
/plugin install implement-protocol@zarai-ai
```

Or test locally:

```bash
claude --plugin-dir ./plugins/implement-protocol
```

---

## Plugins

### implement-protocol

Implementation task runner with a behavioral flag system. Six flags, each mapped to a Tesla-method consciousness dimension. Each flag activates a verifiable quality mode backed by its own contract file.

```
/zarai-implement:implement "build the auth system" --tesla --robust
```

**The default is maximum quality.** No flags = all flags active. Flags exist to scale *down* from the maximum, not up. The baseline is perfection. You relax constraints deliberately, never accidentally.

<div align="center">
<img src="assets/concept-flags.png" width="800" alt="Six behavioral flags as crystalline constructs in the ZARAI gradient" />
</div>

#### Flags

| Flag | Mode | What Changes |
|------|------|-------------|
| `--tesla` | Master | Build entire solution mentally before writing. No exploratory coding. |
| `--noFallbacks` | Constraint | Zero `except: pass`, zero stubs, zero shells. Every path is the real path. |
| `--robust` | Quality | Every edge case, boundary value, and error path handled exhaustively. |
| `--verbose` | Output | Cite every algorithm. Derive every constant. Document every tradeoff. |
| `--complex` | Fidelity | Full algorithm from source publication. No "simplified for clarity." |
| `--sophisticated` | Technique | Advanced types, algebraic errors, property-based testing. |

#### Combos

| Combo | Expands To |
|-------|-----------|
| `--all` | All 6 flags |
| `--apex` | tesla + noFallbacks + robust + complex + sophisticated |
| `--production` | noFallbacks + robust |
| `--research` | tesla + verbose + complex |

#### How It Works

1. You type `/zarai-implement:implement "task" --flags`
2. A zero-dependency Node.js parser extracts the task and resolves flags (including combo expansion)
3. Claude reads each active flag's behavioral contract `.md` file
4. All contracts bind simultaneously for the session
5. Implementation executes under those constraints
6. Verification checklist produced with evidence for every criterion

#### Architecture

```
plugins/implement-protocol/
  .claude-plugin/plugin.json       Manifest
  commands/implement.md            Slash command entry point
  skills/implement/
    SKILL.md                       Auto-activation skill
    registry.json                  Flag metadata + combos
    scripts/parse.cjs              Argument parser (0 deps)
    flags/
      tesla.md                     Mental laboratory protocol
      noFallbacks.md               Zero fallback tolerance
      robust.md                    Edge case obsession
      verbose.md                   Transparent reasoning
      complex.md                   Full complexity honor
      sophisticated.md             Highest technique available
    references/
      cjs-skill-building-guide.md  How to build .cjs-backed skills
```

---

## For Plugin Authors

The `references/cjs-skill-building-guide.md` included with zarai-implement documents the three-layer architecture pattern used here:

- **Layer 1** (.cjs scripts) — Parse arguments, return structured JSON. Zero AI logic.
- **Layer 2** (.md contracts) — Behavioral contracts Claude reads conditionally.
- **Layer 3** (slash command .md) — Thin entry point that orchestrates layers 1 and 2.

This pattern is derived from studying the GSD framework (v1.30.0) and the official Claude Code plugin specification.

---

## Philosophy

> "When I get an idea I start at once building it up in my imagination. I change the construction, make improvements and even operate the device in my mind."
> — Nikola Tesla, *My Inventions* (1919)

Every flag in this system maps to a dimension of Tesla's mental laboratory method. Not as metaphor, but as operational protocol. The `--tesla` flag literally requires building the complete solution in extended thinking before writing a single line. The `--noFallbacks` flag literally bans every form of implementation theater.

The quality bar is not aspirational. It is the floor.

---

## About

**ZARAI AI** — precision AI tools for developers who ship.

- Web: [zarai.ai](https://zarai.ai)
- Marketplace: `zarai-ai`
- First plugin: `zarai-implement` v1.0.0

<sub>A product of [EchoAI Labs](https://echoai-labs.com). MIT License.</sub>

---

<div align="center">

*Built to deploy. Not to demo.*

</div>
