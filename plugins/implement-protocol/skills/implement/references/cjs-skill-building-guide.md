# Building Claude Code Skills with .cjs Tooling

A practical guide to using Node.js CommonJS modules as the backbone of Claude Code
skills, commands, and plugins. Derived from studying GSD v1.30.0 (`~/.claude/get-shit-done/`)
and the official Claude Code plugin architecture (code.claude.com/docs/en/plugins).

## Why .cjs?

Claude Code skills are `.md` files — system prompts that Claude follows. But Markdown
alone can't:
- Parse structured arguments (`--flags`, value params, combos)
- Read/validate configuration files
- Aggregate context from multiple sources into one JSON blob
- Enforce constraints before Claude even sees the prompt

`.cjs` files fill this gap. They're Node.js scripts that Claude runs via `bash` tool
calls. They accept arguments, return structured JSON, and exit with meaningful codes.
Claude reads the JSON output and uses it to make decisions.

**Why CJS over ESM?** CommonJS (`require()`) works everywhere Node.js runs without
`package.json` configuration. ESM requires `"type": "module"` or `.mjs` extension.
For standalone utility scripts that live outside a proper npm project, CJS is simpler.

## Architecture: The Three-Layer Pattern

```
User Input (natural language + --flags)
         |
         v
[Slash Command .md]           Layer 3: Entry point in ~/.claude/commands/
   $ARGUMENTS passthrough        Thin. Runs bash to call Layer 1.
         |                       Instructs Claude on workflow.
         v
[.cjs Tool Scripts]           Layer 1: Pure data providers
   scripts/parse.cjs             Parse args, read config, return JSON.
   scripts/init.cjs              Aggregate context into one blob.
         |                       NEVER make behavioral decisions.
         v
[Skill .md + Flag .md]        Layer 2: Behavioral contracts
   SKILL.md                      Auto-activation definition.
   flags/*.md                    Behavioral modes Claude reads
                                 based on Layer 1 output.
```

### Layer 1: .cjs Data Providers

These scripts do ONE thing: accept input, return structured JSON. They have zero
AI logic. They don't decide what Claude should do — they provide the data Claude
needs to decide.

**Key principles:**
- Zero npm dependencies (use only Node.js built-ins: `fs`, `path`, `process`)
- Accept input from `process.argv` or `stdin`
- Return JSON on `stdout`
- Use `stderr` for error messages
- Exit codes: 0 = success, 1 = missing required input, 2 = validation error

### Layer 2: Behavioral Contracts (.md files)

These are the actual instructions Claude follows. They live in the skill directory
and are loaded dynamically based on Layer 1 output.

**Key principle:** Claude reads these files with the `Read` tool or `cat` in bash.
They are NOT always loaded — they're loaded conditionally based on what the .cjs
parser says is active.

### Layer 3: Slash Command Entry Points

Thin `.md` files in `~/.claude/commands/` that:
1. Tell Claude to run the .cjs parser
2. Tell Claude how to interpret the JSON output
3. Tell Claude which .md contracts to load based on results
4. Define the overall workflow

## How to Build It: Step by Step

### Step 1: Define Your Flag/Argument Schema

Create a `registry.json` in your skill directory:

```json
{
  "version": "1.0.0",
  "flags": {
    "myFlag": {
      "description": "What this flag does",
      "file": "flags/myFlag.md",
      "type": "constraint",
      "short": "One-line summary for help output",
      "verification": ["How to prove this flag was honored"]
    }
  },
  "flag_combinations": {
    "preset_name": ["flag1", "flag2", "flag3"]
  }
}
```

### Step 2: Write the Parser (.cjs)

```javascript
#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// Load registry relative to script location
const SKILL_ROOT = path.resolve(__dirname, '..');
const registry = JSON.parse(
  fs.readFileSync(path.join(SKILL_ROOT, 'registry.json'), 'utf8')
);

// Tokenize: respect quoted strings
function tokenize(raw) {
  const tokens = [];
  let current = '';
  let inQuote = false;
  let quoteChar = '';
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (!inQuote && (ch === '"' || ch === "'")) {
      inQuote = true;
      quoteChar = ch;
    } else if (inQuote && ch === quoteChar) {
      inQuote = false;
    } else if (!inQuote && /\s/.test(ch)) {
      if (current.length > 0) { tokens.push(current); current = ''; }
    } else {
      current += ch;
    }
  }
  if (current.length > 0) tokens.push(current);
  return tokens;
}

// Separate flags from task description
const tokens = tokenize(process.argv.slice(2).join(' '));
const knownFlags = Object.keys(registry.flags);
const flags = {};
const taskTokens = [];

for (const token of tokens) {
  if (token.startsWith('--')) {
    const name = token.slice(2);
    // Check combos
    const combo = registry.flag_combinations?.[name];
    if (combo) { for (const f of combo) flags[f] = true; continue; }
    // Check individual flags (case-insensitive)
    const match = knownFlags.find(k => k.toLowerCase() === name.toLowerCase());
    if (match) flags[match] = true;
    // Unknown flags: handle however you want
  } else {
    taskTokens.push(token);
  }
}

// Output
const result = {
  task: taskTokens.join(' ') || null,
  activeFlags: knownFlags.filter(f => flags[f]),
  flagFiles: knownFlags.filter(f => flags[f]).map(f =>
    path.join(SKILL_ROOT, registry.flags[f].file)
  )
};

process.stdout.write(JSON.stringify(result, null, 2) + '\n');
```

**GSD's version** (`gsd-tools.cjs` lines 166-194) uses two parsing functions:
- `parseNamedArgs(args, valueFlags, booleanFlags)` — separates flags that consume
  a value (`--phase 3`) from boolean flags (`--force`)
- `parseMultiwordArg(args, flag)` — collects all tokens after a flag until the next
  `--` flag, for multi-word values like `--name My Project Name`

### Step 3: Write Behavioral Contracts

Each flag gets its own `.md` file in `flags/`:

```markdown
# --myFlag: Human-Readable Name

## Behavioral Contract

When `--myFlag` is active, you MUST:
1. [Specific behavior change]
2. [Another specific behavior change]

## Verification Criteria
- [ ] [How to prove this was followed]
- [ ] [Another verifiable check]
```

**Key:** These must be VERIFIABLE. Not vibes — checkboxes with evidence.

### Step 4: Write the Slash Command

`~/.claude/commands/my-skill.md`:

```markdown
---
description: One-line description shown in /help
argument-hint: '"task" [--flags...]'
---

## STEP 1: PARSE
Run: node "$HOME/.claude/skills/my-skill/scripts/parse.cjs" $ARGUMENTS

## STEP 2: LOAD CONTRACTS
For each flag in activeFlags, read the corresponding file from flagFiles.

## STEP 3: EXECUTE
[Your workflow here, with all active contracts binding]

## STEP 4: VERIFY
Produce checklist from all active flag verification criteria.
```

### Step 5: Write the SKILL.md (Optional Auto-Activation)

If you want Claude to use the skill automatically (not just via slash command),
add a `SKILL.md` in the skill root:

```markdown
---
name: my-skill
description: "Triggers on: keyword1, keyword2, keyword3. Does: [what it does]."
---

[Skill documentation — under 500 lines per Anthropic best practice]
```

## Advanced Pattern: The Init Aggregator

GSD's most powerful pattern is the `init` command. Instead of Claude making N separate
tool calls to check state, each workflow has a single `init <workflow>` command:

```javascript
// In gsd-tools.cjs, 'init execute-phase' returns:
{
  executorModel: "opus",
  verifierModel: "sonnet",
  phase: { number: "3", name: "Auth System", plans: [...] },
  config: { parallelization: true, branching: "per-plan" },
  milestone: { name: "v1.0", planDir: ".planning/" },
  exists: { research: true, plan: true, verification: false }
}
```

One call, everything Claude needs. This eliminates the N+1 problem where Claude
wastes tokens on sequential tool calls that could be batched.

**How to apply this:** If your skill needs to check multiple things before deciding
what to do, write an `init.cjs` that aggregates all of them:

```javascript
// scripts/init.cjs
const result = {
  config: loadConfig(),
  state: checkCurrentState(),
  dependencies: resolveDeps(),
  permissions: checkAccess()
};
process.stdout.write(JSON.stringify(result, null, 2));
```

## The --pick Pattern (Replace jq)

GSD includes a `--pick` flag that extracts a single field from JSON output using
dot-notation. This replaces the need for `jq` (which may not be installed):

```bash
# Instead of:
node gsd-tools.cjs state json | jq '.current_phase'

# Use:
node gsd-tools.cjs state json --pick current_phase
```

Implementation (supports dot-notation and array indexing):

```javascript
function pickField(obj, path) {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}
```

## Anti-Hallucination Guardrail

Critical for flag-based skills. Without this, Claude may activate flags just because
they're documented in the prompt:

```markdown
**Active flags must be derived from `$ARGUMENTS`:**
- A flag is active ONLY if its literal `--` token is present in `$ARGUMENTS`
- Do NOT infer that a flag is active just because it is documented here
- If no flags are present, run with baseline behavior only
```

GSD uses this exact pattern in `execute-phase.md`:

> `--wave N` is active only if the literal `--wave` token is present in `$ARGUMENTS`
> Do not infer that a flag is active just because it is documented in this prompt

## Security Considerations

GSD includes `security.cjs` for:
- **Path traversal prevention**: Validate all paths stay within expected directories
- **Prompt injection scanning**: Check for injection patterns in user-provided values
- **Shell argument validation**: Sanitize values before using in shell commands
- **Safe JSON parsing**: Wrap `JSON.parse` to handle malformed input

For skills that take user input and pass it to shell commands:
```javascript
// NEVER do this:
exec(`git commit -m "${userMessage}"`);

// DO this:
execFile('git', ['commit', '-m', userMessage]);
```

## Directory Layout Reference

### Standalone Skill (personal use, short /name)
```
~/.claude/commands/my-skill.md       # /my-skill entry point
~/.claude/skills/my-skill/
  SKILL.md                            # Auto-activation
  registry.json                       # Config/flag schema
  scripts/parse.cjs                   # Argument parser
  flags/*.md                          # Behavioral contracts
  references/*.md                     # Progressive disclosure docs
```

### Plugin (distributable, namespaced /plugin:name)
```
my-plugin/
  .claude-plugin/plugin.json          # Manifest (name, version, author)
  commands/my-skill.md                # /my-plugin:my-skill
  skills/my-skill/SKILL.md            # Auto-activation
  hooks/hooks.json                    # Event handlers
  .mcp.json                           # MCP server configs
  settings.json                       # Default settings
```

### GSD-Style Infrastructure (heavyweight)
```
~/.claude/get-shit-done/
  bin/gsd-tools.cjs                   # Main CLI router (900+ lines)
  bin/lib/*.cjs                       # Library modules (17 files)
  VERSION
~/.claude/commands/gsd/               # 30+ slash commands
  execute-phase.md
  plan-phase.md
  ...
```

## When to Use Each Pattern

| Complexity | Pattern | Example |
|-----------|---------|---------|
| Simple (1-2 flags) | Inline in .md, no .cjs | `/review --strict` |
| Medium (3-6 flags) | registry.json + parse.cjs | `/implement --tesla --robust` |
| Complex (10+ commands) | Full CLI router like gsd-tools.cjs | GSD's 30+ commands |
| Distributable | Plugin with .claude-plugin/plugin.json | Antigravity skills |

## Plugin Environment Variables

When your skill ships as a plugin, hardcoded paths like `$HOME/.claude/skills/...`
break because plugins are cached at install time. Use these variables instead:

- **`${CLAUDE_PLUGIN_ROOT}`** — absolute path to your plugin's install directory.
  Use for referencing bundled scripts, configs, and flag files.
- **`${CLAUDE_PLUGIN_DATA}`** — persistent directory that survives plugin updates.
  Use for installed deps (`node_modules`), caches, generated state.

```markdown
## In your command .md:
node "${CLAUDE_PLUGIN_ROOT}/skills/implement/scripts/parse.cjs" $ARGUMENTS
cat "${CLAUDE_PLUGIN_ROOT}/skills/implement/flags/tesla.md"
```

```json
// In hooks.json or .mcp.json:
{ "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh" }
```

Both are substituted inline in skill content, agent content, hook commands, and
MCP/LSP configs. Both are also exported as environment variables to subprocesses.

## User-Configurable Plugin Options

Plugins can prompt users for config values at install time via `userConfig` in
`plugin.json`. Values are available as `${user_config.KEY}` in configs and as
`CLAUDE_PLUGIN_OPTION_<KEY>` env vars:

```json
{
  "userConfig": {
    "api_endpoint": { "description": "Your API endpoint", "sensitive": false },
    "api_token": { "description": "API auth token", "sensitive": true }
  }
}
```

Sensitive values go to system keychain. Non-sensitive to `settings.json`.

## Common Pitfalls

1. **Putting infrastructure in commands/** — Commands should be thin entry points.
   Infrastructure goes in `skills/` or a dedicated directory.

2. **Making .cjs scripts that decide behavior** — .cjs scripts return data. Claude
   decides behavior. Keep this separation clean.

3. **Not testing the parser standalone** — Always verify:
   ```bash
   node parse.cjs "test task" --flag1 --flag2
   node parse.cjs  # no args (should show help)
   node parse.cjs "test" --unknownFlag  # should warn
   ```

4. **Forgetting the anti-hallucination guardrail** — Without it, Claude activates
   flags just because they exist in the prompt documentation.

5. **Over-engineering** — If you only need 2 flags, you don't need a .cjs parser.
   Just check `$ARGUMENTS` inline in the .md file. Add .cjs when you outgrow that.

## References

- Official Claude Code plugin docs: https://code.claude.com/docs/en/plugins
- Plugin reference: https://code.claude.com/docs/en/plugins-reference
- Skills reference: https://code.claude.com/docs/en/skills
- GSD source: `~/.claude/get-shit-done/bin/gsd-tools.cjs`
- Antigravity skills: `~/.gemini/antigravity/skills/`
- Antigravity skill-creator: `~/.gemini/antigravity/skills/skill-creator/SKILL.md`
- Antigravity skill-developer: `~/.gemini/antigravity/skills/skill-developer/SKILL.md`
