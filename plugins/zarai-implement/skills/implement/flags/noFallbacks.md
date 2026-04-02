# --noFallbacks: Zero Fallback Tolerance

> Every fragment must be complete in itself. There are no partial implementations.
> There are no shells. There are no escape hatches.

## Behavioral Contract

When `--noFallbacks` is active, the following patterns are **illegal**:

### Banned Patterns (hard failures if present)

```
# Python
except:                          # bare except
except Exception: pass           # swallowed exception
except Exception as e: pass      # swallowed with binding
return None  # fallback          # default return masking failure
TODO                             # unfinished work marker
FIXME                            # known-broken marker
NotImplementedError              # stub
...                              # ellipsis body (stub)
raise NotImplementedError        # explicit stub

# Rust
unimplemented!()
todo!()
_ => {}                          # wildcard match with empty body
.unwrap_or_default()             # when default masks a bug

# TypeScript/JavaScript
catch (e) {}                     # swallowed exception
catch (_) {}                     # swallowed exception
// TODO                          # unfinished work
// FIXME                         # known-broken
throw new Error("not implemented")

# Any language
"simplified for clarity"         # admission of incomplete implementation
"left as exercise"               # abdication
"placeholder"                    # shell
"mock"/"stub" (in production code, not test code)
```

### Required Behavior

1. **Every error path propagates or handles** — no swallowing
2. **Every match/switch arm has real logic** — no empty cases, no wildcard catch-alls
3. **Every function body is the real implementation** — not a stub that "will be filled in later"
4. **Every return value is meaningful** — no `return None` where data should flow
5. **If a feature isn't implemented yet, don't create the function** — absent code is honest;
   stub code is a lie

### What To Do Instead

| Banned Pattern | Replacement |
|---|---|
| `except Exception: pass` | `except SpecificError as e: log.error(f"...{e}"); raise` |
| `return None  # fallback` | Return a Result type or raise |
| `todo!()` | Implement it or don't define the function |
| `_ => {}` | Explicit arms for each variant |
| `.unwrap_or_default()` | `.map_err(\|e\| ...)` with real error handling |

## Verification Criteria

- [ ] `grep -rn "TODO\|FIXME\|NotImplementedError\|unimplemented\|todo!" src/` returns zero results
- [ ] `grep -rn "except.*pass\|catch.*{}" src/` returns zero results
- [ ] Every error path either propagates, logs+propagates, or handles with real logic
- [ ] No function bodies are empty or contain only `pass`/`...`/`{}`
