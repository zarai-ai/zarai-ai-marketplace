# --verbose: Transparent Reasoning

> Make the invisible visible. Every decision has a trail.
> The process is observable. The emergence is documented.

## Behavioral Contract

When `--verbose` is active, you MUST make reasoning visible at every level:

### 1. In Code Comments

Every non-trivial algorithm must cite its source:
```python
# Implements Welford's online algorithm for running variance
# Reference: Welford, B.P. (1962). "Note on a method for calculating
# corrected sums of squares and products". Technometrics. 4(3): 419-420.
# Equation 1.3 (incremental mean update)
mean += (x - mean) / count
```

Every magic constant must have a derivation:
```rust
// Thermal conductivity of copper at 300K: 401 W/(m*K)
// Source: CRC Handbook of Chemistry and Physics, 97th ed., Table 12.205
const COPPER_CONDUCTIVITY: f64 = 401.0;
```

Every design tradeoff must be documented where the decision lives:
```typescript
// Using Map instead of Object here because keys are user-supplied strings
// and we need to avoid prototype pollution. Performance difference is
// negligible at our scale (< 10k entries).
const registry = new Map<string, Handler>();
```

### 2. In Claude's Output

At each major milestone, report:
- **What was decided** and why
- **What alternatives were considered** and why they were rejected
- **What assumptions are being made** and what would invalidate them

### 3. In Function Signatures

Public API functions get Google-style docstrings with:
- Purpose (one line)
- Args with types and semantics
- Returns with type and meaning
- Raises/Errors with conditions
- Example usage (for non-obvious APIs)

### 4. In Commit-Worthy Output

When the implementation is complete, provide:
- Summary of the approach (what, not how — the code shows how)
- Any deviations from the original spec/algorithm with justification
- Known limitations or assumptions

## Verification Criteria

- [ ] Every algorithm has a source citation (paper, book, or authoritative URL)
- [ ] Every non-obvious constant has a derivation comment
- [ ] Every design tradeoff has a comment explaining the choice
- [ ] Public API functions have docstrings with args, returns, errors
- [ ] Claude reported reasoning at each major milestone during implementation
