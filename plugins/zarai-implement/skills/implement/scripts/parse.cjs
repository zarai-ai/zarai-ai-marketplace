#!/usr/bin/env node
// implement-parse.cjs — Argument parser for /implement skill
// Returns structured JSON: task description, active flags, flag file paths.
// Zero dependencies. Validates against registry.json.
//
// Usage:
//   node parse.cjs "create a thing" --tesla --robust
//   node parse.cjs create a thing --tesla --robust
//   echo "args" | node parse.cjs --stdin
'use strict';

const fs = require('fs');
const path = require('path');

const SKILL_ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(SKILL_ROOT, 'registry.json');

function loadRegistry() {
  const raw = fs.readFileSync(REGISTRY_PATH, 'utf8');
  return JSON.parse(raw);
}

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
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }
  if (current.length > 0) tokens.push(current);
  return tokens;
}

function resolveCombo(name, registry) {
  const combos = registry.flag_combinations || {};
  if (combos[name]) return combos[name];
  return null;
}

function parse(raw, registry) {
  const tokens = tokenize(raw);
  const knownFlags = Object.keys(registry.flags);
  const comboNames = Object.keys(registry.flag_combinations || {});

  const flags = {};
  const taskTokens = [];
  const unknownFlags = [];
  const expandedCombos = [];

  for (const token of tokens) {
    if (!token.startsWith('--')) {
      taskTokens.push(token);
      continue;
    }

    const name = token.slice(2);

    // Check combo first
    const combo = resolveCombo(name, registry);
    if (combo) {
      expandedCombos.push({ name, expandsTo: combo });
      for (const f of combo) {
        flags[f] = true;
      }
      continue;
    }

    // Check known flag (case-insensitive match with canonical name)
    const canonical = knownFlags.find(
      k => k.toLowerCase() === name.toLowerCase()
    );
    if (canonical) {
      flags[canonical] = true;
    } else {
      unknownFlags.push(name);
    }
  }

  // Default: no flags specified = ALL flags active (maximum quality bar).
  // Flags exist to scale DOWN from the default, not scale up.
  const noFlagsSpecified = Object.keys(flags).length === 0 && expandedCombos.length === 0;
  if (noFlagsSpecified) {
    for (const name of knownFlags) {
      flags[name] = true;
    }
  }

  // Fill inactive flags
  for (const name of knownFlags) {
    if (!(name in flags)) flags[name] = false;
  }

  const activeFlags = knownFlags.filter(f => flags[f]);
  const flagFiles = activeFlags.map(f =>
    path.join(SKILL_ROOT, registry.flags[f].file)
  );

  const flagDetails = {};
  for (const f of activeFlags) {
    const def = registry.flags[f];
    flagDetails[f] = {
      short: def.short,
      type: def.type,
      file: path.join(SKILL_ROOT, def.file),
      verification: def.verification
    };
  }

  return {
    task: taskTokens.join(' ').trim() || null,
    flags,
    activeFlags,
    flagCount: activeFlags.length,
    flagDetails,
    flagFiles,
    unknownFlags,
    expandedCombos,
    registry: {
      version: registry.version,
      availableFlags: knownFlags,
      availableCombos: comboNames
    }
  };
}

function main() {
  const registry = loadRegistry();
  let raw;

  if (process.argv.includes('--stdin')) {
    raw = fs.readFileSync(0, 'utf8').trim();
  } else {
    raw = process.argv.slice(2).join(' ');
  }

  if (!raw || raw.trim().length === 0) {
    const help = {
      error: 'No arguments provided',
      usage: 'node parse.cjs "task description" [--flags...]',
      availableFlags: Object.entries(registry.flags).map(([k, v]) => ({
        flag: `--${k}`,
        type: v.type,
        short: v.short
      })),
      combos: Object.entries(registry.flag_combinations || {}).map(
        ([k, v]) => ({ combo: `--${k}`, expands: v.map(f => `--${f}`) })
      )
    };
    process.stdout.write(JSON.stringify(help, null, 2) + '\n');
    process.exit(1);
  }

  const result = parse(raw, registry);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');

  if (result.unknownFlags.length > 0) {
    process.stderr.write(
      `Unknown flags: ${result.unknownFlags.map(f => '--' + f).join(', ')}\n`
    );
    process.stderr.write(
      `Available: ${result.registry.availableFlags.map(f => '--' + f).join(', ')}\n`
    );
    process.stderr.write(
      `Combos: ${result.registry.availableCombos.map(f => '--' + f).join(', ')}\n`
    );
    process.exit(2);
  }

  if (!result.task) {
    process.stderr.write('No task description provided.\n');
    process.exit(1);
  }
}

main();
