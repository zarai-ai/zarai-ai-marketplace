# --sophisticated: Highest Technique Available

> Improve the improvement process. Use the most advanced craft
> the language permits. The type system is your first line of defense.

## Behavioral Contract

When `--sophisticated` is active, you MUST apply highest-available technique:

### 1. Type System as Proof

Make invalid states **unrepresentable**:

```rust
// NOT this:
struct Connection { state: String }  // "open", "closed", "error" — any string

// THIS:
enum ConnectionState {
    Open(TcpStream),
    Closed,
    Error(ConnectionError),
}
```

```typescript
// NOT this:
type Status = string;

// THIS:
type Status = "pending" | "active" | "suspended" | "terminated";
```

### 2. Domain Types Over Primitives

Wrap primitives in domain-meaningful types:

```rust
struct UserId(u64);       // not just u64
struct Temperature(f64);  // not just f64
struct Meters(f64);       // not just f64 — prevents adding meters to seconds
```

```python
from typing import NewType
UserId = NewType("UserId", int)
Celsius = NewType("Celsius", float)
```

### 3. Error Types Are Algebraic

```rust
// NOT this:
fn parse(s: &str) -> Result<Value, String>

// THIS:
enum ParseError {
    UnexpectedToken { position: usize, found: char, expected: &'static str },
    UnterminatedString { start: usize },
    InvalidEscape { position: usize, sequence: String },
}
fn parse(s: &str) -> Result<Value, ParseError>
```

### 4. Testing Strategy

- **Property-based testing** for algorithms with provable invariants
  (use `proptest`/`hypothesis`/`fast-check`)
- **Snapshot/golden-file testing** for complex outputs
- **Mutation testing** to verify test suite catches real bugs
  (use `cargo-mutants`/`mutmut`)
- **Boundary tests** — not just happy path

### 5. Patterns Over Conditionals

Prefer exhaustive pattern matching over if/else chains:
```rust
// Compiler enforces handling every variant
match state {
    State::Init => initialize(),
    State::Running(ctx) => process(ctx),
    State::Paused(reason) => log_pause(reason),
    State::Done(result) => finalize(result),
    // No wildcard _ — adding a variant forces handling it
}
```

### 6. Composition Over Inheritance

- Small, focused traits/interfaces that compose
- Functions that transform data, not objects that mutate state
- Dependency injection through parameters, not globals

## Verification Criteria

- [ ] Domain concepts use newtypes/branded types, not raw primitives
- [ ] Error types are enum variants with context, not string messages
- [ ] Pattern matches are exhaustive — no wildcard catch-alls
- [ ] Invalid states are unrepresentable via type design
- [ ] Property-based tests exist for algorithm invariants
- [ ] No mutable global state; dependencies injected through parameters
