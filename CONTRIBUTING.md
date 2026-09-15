# Contributing to EventX Ultra

## Before You Start

Read `docs/DEVELOPMENT.md` and `SECURITY.md`. Do not include secrets, generated artifacts, unrelated formatting changes or personal environment files in commits.

## Workflow

1. Start from an up-to-date `main` branch.
2. Create a focused feature or fix branch.
3. Keep changes small enough to review.
4. Add or update tests when behavior changes.
5. Run the relevant client/server validation locally.
6. Review `git diff` and `git status` before committing.
7. Open a pull request with a clear summary, testing evidence and known limitations.

## Commit Messages

Prefer concise conventional-style messages such as:

- `feat: add event search filters`
- `fix: prevent expired seat locks from being booked`
- `perf: add event listing index`
- `docs: improve deployment guide`
- `test: cover seat locking service`

## Pull Requests

A good PR should explain **what changed, why it changed, how it was tested, and any migration or deployment considerations**.
