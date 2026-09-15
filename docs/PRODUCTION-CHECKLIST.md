# Production Checklist

## Application

- [ ] Production environment variables are configured in the deployment platform.
- [ ] Client API URL points to the production API.
- [ ] CORS contains only trusted frontend origins.
- [ ] HTTPS is enabled everywhere.
- [ ] Production logging is enabled without sensitive payloads.

## Authentication

- [ ] Strong JWT secrets are configured.
- [ ] Refresh tokens use secure, HTTP-only cookies.
- [ ] Password reset links expire.
- [ ] Disabled accounts cannot authenticate.

## Database

- [ ] MongoDB Atlas/network access is restricted.
- [ ] Database backups are enabled.
- [ ] Required indexes are present.
- [ ] Connection credentials are stored as secrets.

## Booking

- [ ] Seat locking expiration is verified.
- [ ] Concurrent seat selection is tested.
- [ ] Duplicate booking/retry behavior is tested.
- [ ] Payment failure paths are reconciled.

## Operations

- [ ] CI is green on the release commit.
- [ ] Health/readiness checks are monitored.
- [ ] Dependency alerts are reviewed.
- [ ] A rollback procedure is known before deployment.
