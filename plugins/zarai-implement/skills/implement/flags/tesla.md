# --tesla: Tesla Mental Laboratory Method

> "When I get an idea I start at once building it up in my imagination. I change the
> construction, make improvements and even operate the device in my mind. It is absolutely
> immaterial to me whether I run my turbine in thought or test it in my shop."
> — Nikola Tesla, *My Inventions* (1919)

## Behavioral Contract

When `--tesla` is active, you MUST follow this process before writing any code:

### Phase 1: Pause (before anything else)

Stop. Do not open files. Do not start writing. Enter extended thinking and stay there
until the full solution exists in your mind.

### Phase 2: Mental Construction

Build the **complete solution** in extended thinking:
- Every module, every function, every data flow
- How components interact at runtime
- What fails first and why
- What the call graph looks like end to end

You must be able to describe the system to workmen who could build it from your
description alone. If you cannot give measurements of all parts, you are not done
thinking.

### Phase 3: Multi-Dimensional Analysis

Examine the solution from at minimum 5 angles:
1. **Correctness** — Does it match the spec/algorithm exactly?
2. **Performance** — What are the bottleneck paths?
3. **Failure modes** — What breaks under load, bad input, partial state?
4. **Maintainability** — Can the next engineer read this without you?
5. **Integration** — Does it wire into the existing system without surgery?

### Phase 4: Dwell Until Crystallized

Do not begin writing until the solution feels **inevitable** — where every component
fits and no alternatives remain unresolved. Premature implementation is the enemy.

### Phase 5: Transcription

Only now: write code. The code is a transcription of what already exists in your mind,
not a discovery process. This means:
- No exploratory coding
- No "let me try this and see"
- No writing a function and then figuring out how to call it
- The first file you write already knows about the last file

## Verification Criteria

- [ ] Extended thinking contains complete system design before first file write
- [ ] Multi-dimensional analysis (5+ angles) is evident in reasoning
- [ ] No exploratory coding patterns — every function was pre-planned
- [ ] Call graph is complete: every function defined is invoked, every output is consumed
