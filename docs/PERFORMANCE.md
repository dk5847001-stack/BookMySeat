# Performance Guidelines

## Database

- Prefer repository queries that return only required fields for large collections.
- Keep indexes aligned with frequent filters and sort patterns.
- Avoid unbounded collection endpoints.
- Use lean reads for read-only MongoDB responses where document methods are unnecessary.

## API

- Validate and bound pagination parameters.
- Keep controllers thin to avoid duplicated work.
- Avoid synchronous CPU-heavy work in request handlers.
- Move recurring maintenance work into controlled background processes.

## Frontend

- Use RTK Query caching and tag invalidation instead of unnecessary duplicate requests.
- Lazy-load large route-level features when appropriate.
- Avoid rendering large seat maps without virtualization when event capacity becomes substantial.
- Keep images optimized and use responsive dimensions.

## Real-Time

Socket rooms should be scoped to the user, event or administrator audience that needs the update. Do not broadcast private booking information to global rooms.
