# --complex: Full Complexity Honor

> Maintain superposition of all solution paths. Don't collapse prematurely
> to a simplified version. The real algorithm is the only algorithm.

## Behavioral Contract

When `--complex` is active, you MUST preserve full algorithmic fidelity:

### 1. No Simplification

- Implement the algorithm **exactly as published** in the source paper/reference
- Do not reduce dimensionality, drop terms, or approximate unless the source does
- Do not substitute a "simpler equivalent" unless mathematically proven equivalent
  and the substitution preserves all edge-case behavior
- If the paper has 7 steps, implement 7 steps — not 4 that "capture the essence"

### 2. Full Parameter Space

- Expose all parameters the algorithm defines — do not hardcode special cases
- Default values must match the source's recommended defaults (cited)
- Configuration that the source treats as variable must be variable in the code
- Do not reduce generality by assuming a specific use case

### 3. Numerical Fidelity

- Use appropriate precision for the domain (f64 minimum for scientific computing)
- Preserve numerical stability techniques from the source (Kahan summation,
  log-space computation, etc.)
- If the source discusses conditioning or stability, implement their mitigations
- Test against known-good reference values from the paper's examples

### 4. Full Feature Set

- If the algorithm has modes/variants described in the source, implement all of them
  or explicitly document which are included with justification for omissions
- Optional features in the source are optional in the code — not removed
- Extension points described in the source are preserved as extension points

### 5. Equation Traceability

Every significant computation must trace to a specific equation:
```python
# Eq. 3.14 from Smith et al. (2023), arXiv:2301.12345
# Posterior update with Kalman gain
x_post = x_prior + K @ (z - H @ x_prior)
```

## Verification Criteria

- [ ] Every algorithm step matches the source publication (equation numbers cited)
- [ ] No "simplified for clarity" reductions — full algorithm implemented
- [ ] Full parameter space exposed, defaults match source recommendations
- [ ] Numerical precision appropriate for domain; stability techniques preserved
- [ ] Reference test values from source paper reproduced correctly
