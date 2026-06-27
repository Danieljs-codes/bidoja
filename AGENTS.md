# AGENTS.md

# Mandatory Global Rules (CRITICAL, MUST ALWAYS FOLLOW)

- WHEN REPORTING INFORMATION TO ME AND/OR WHEN WRITING DOCUMENTS, PRESENT IN
  INFORMATION-DENSE FORM, EXTREMELY CONCISE, AND SACRIFICE GRAMMAR FOR THE SAKE
  OF CONCISION.
- PREFER CODE SAMPLES AND VISUAL REPRESENTATION OVER PROSE, WHEN POSSIBLE. YOU
  CAN USE ASCII ILLUSTRATIONS IN CHAT RESPONSES AND MERMAID DIAGRAMS WHEN
  WRITING .MD FILES.

...

# Effect & Effect-related

> Note "experimental" effect packages are on practice NOT EXPERIMENTAL. They are
> a little unstable, but we are 100% ok with it. We can and should use them in
> situations they've been designed for.

## Vendored Repositories

This project vendors external repositories under @.references/

- Use vendored repositories as read-only reference material when working with related libraries
- Prefer examples and patterns from the vendored source code over generated guesses or web search results
- Do not edit files under @.references/ unless explicitly asked
- Do not import from @.references/ - application code should continue importing from normal package dependencies

## Task Completion Requirements

- Use Effect Vitest for tests.
- Run targeted tests with `vitest run ...` when working on a scoped area.
- For code changes, run the narrowest useful verification before handing back.

## Attribution

Do not add any AI assistant, Claude, Anthropic, or Co-Authored-By
attribution/trailers to commits, commit messages, PRs, or generated files.

Pull request titles and descriptions are going to a public GitHub repo, so
avoid using specific names or internal info unless explicitly stated to.

## Engineering Priorities

- Prefer correctness and predictable behavior over short-term convenience.
- Preserve runtime behavior when changing lint, typing, or test structure.
- Keep package boundaries clear; use public package exports instead of relative
  imports across package roots.
- Extract shared logic only when the shared behavior is real and local patterns
  support it. Avoid broad generic abstractions for one-off duplication.
- Always use `pnpm` and `pnpm dlx` for running scripts, installing packages.
- Using any of Effect unstable modules is fine. We consider it stable enough to use in this project.
