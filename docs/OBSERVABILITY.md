# Observability

EventX Ultra uses Winston for server-side application logging and Socket.io for real-time events.

## Logging Principles

- Log lifecycle events that help diagnose production failures.
- Include stable identifiers such as request, user or event IDs when available and safe.
- Never log passwords, access tokens, refresh tokens, cookies or payment secrets.
- Prefer structured metadata over concatenated diagnostic strings.

## Operational Signals

Monitor:

- application startup failures
- database connection failures
- elevated 4xx/5xx responses
- authentication failures
- seat-lock conflicts and expirations
- booking failures
- Socket.io connection/disconnection rates
- API latency for high-traffic endpoints

## Incident Response

When an incident occurs, preserve relevant sanitized logs, identify the first failing component, verify whether data consistency is affected, mitigate user impact, and document the root cause and corrective action.
