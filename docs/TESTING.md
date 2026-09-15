# Testing Strategy

## Test Pyramid

### Unit tests

Business rules should be tested close to the service or utility that owns them. High-value examples include seat expiration, authorization decisions, validation boundaries and token handling.

### Integration tests

Exercise controller → service → repository flows against an isolated test database where practical. Verify status codes, response contracts and persistence effects.

### End-to-end tests

Cover critical user journeys such as registration, login, event discovery, seat selection and booking. Keep these flows focused on user-visible behavior.

## Booking Scenarios

At minimum, verify:

1. Two users cannot successfully lock the same seat.
2. An expired lock becomes available again.
3. A user cannot book another user's lock.
4. Duplicate seat labels in one request are handled safely.
5. Successful booking updates seat and event state consistently.
6. Socket updates are emitted after relevant state changes.

## Test Data

Use isolated test users, events and seats. Never run destructive tests against production data.
