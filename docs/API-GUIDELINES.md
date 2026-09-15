# API Guidelines

## Response Contract

Successful endpoints should prefer a predictable envelope:

```json
{
  "success": true,
  "data": {}
}
```

Errors should expose a safe, user-facing message and should not leak stack traces, secrets or database internals.

## Versioning

All public API routes should remain under the versioned API prefix. Breaking changes should receive a new version rather than silently changing an existing contract.

## Validation

Validate body, route parameters and query parameters before business logic. Reject unexpected or malformed values early.

## Authentication

Use the access token for protected requests. Refresh tokens must be treated as credentials and stored using secure, HTTP-only cookies in production.

## Pagination

Collection endpoints should use bounded page sizes and return enough metadata for clients to navigate result sets without repeatedly fetching unbounded datasets.

## Idempotency

Payment, booking and other state-changing operations should be designed so client retries cannot accidentally create duplicate business records.
