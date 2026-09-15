# Security Policy

## Supported Versions

Security fixes are applied to the actively maintained `main` branch.

## Reporting a Vulnerability

Please do not publish exploitable security details in a public issue. Report the issue privately through the repository owner's available GitHub contact channel and include:

- affected component or endpoint
- reproduction steps
- impact assessment
- logs or screenshots with secrets removed
- a suggested mitigation, if known

## Security Baseline

- Never commit credentials, API keys, JWT secrets or tokens.
- Keep production secrets in the deployment platform's secret manager.
- Use HTTPS in production.
- Restrict CORS to trusted frontend origins.
- Keep dependencies patched.
- Validate untrusted request input at the API boundary.
- Apply authentication and authorization to protected resources.
- Rotate compromised credentials immediately.
