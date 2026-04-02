# --robust: Edge Case Obsession

> Difficulties catalyze enhancement rather than strain. Every edge case
> you handle is a feature. Every boundary you test is armor.

## Behavioral Contract

When `--robust` is active, you MUST handle these categories exhaustively:

### 1. Input Boundaries

For every function that accepts external or user-derived input:
- **Empty/zero/null**: What happens with `""`, `0`, `null`, `None`, `[]`, `{}`?
- **Boundary values**: min, max, min-1, max+1, off-by-one
- **Type edges**: NaN, Infinity, -Infinity, MAX_SAFE_INTEGER, very long strings
- **Unicode**: multi-byte characters, RTL text, emoji, zero-width joiners
- **Adversarial**: SQL injection attempts, path traversal, control characters

### 2. State Boundaries

- **Concurrent access**: What if two callers hit this simultaneously?
- **Partial state**: What if the previous operation crashed halfway?
- **Ordering**: What if operations arrive out of expected order?
- **Reentrance**: What if this function is called while it's already running?

### 3. Resource Boundaries

- **File handles**: Opened files must be closed (use context managers/RAII/defer)
- **Network connections**: Timeout, retry with backoff, connection pool exhaustion
- **Memory**: Large inputs must not cause unbounded allocation
- **Disk**: Check available space before large writes; handle full disk

### 4. Error Propagation

- Every external call (I/O, network, IPC) must have explicit error handling
- Error messages must include: what operation, what input, suggested fix
- Errors at boundaries (public API) include context; internal errors propagate

### 5. Cleanup Guarantees

- Use RAII (Rust), context managers (Python), try-finally (JS/TS), defer (Go)
- Temporary files cleaned up even on panic/exception
- Database transactions rolled back on error
- Lock release guaranteed

## Verification Criteria

- [ ] Every public function documents or handles empty/null/zero input
- [ ] Boundary values identified and tested for numeric parameters
- [ ] Resource cleanup uses language-appropriate RAII/finally pattern
- [ ] External calls have timeout + error handling
- [ ] Error messages include operation context and input that caused failure
