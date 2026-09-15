# Architecture

EventX Ultra separates transport concerns from business logic and persistence.

## Request Flow

```text
React UI
  ↓
RTK Query API module
  ↓
Versioned Express route
  ↓
Validation / authentication middleware
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Mongoose model → MongoDB
```

## Real-Time Flow

```text
Client Socket.io connection
        ↓
Socket authentication
        ↓
User / admin / event room
        ↓
Domain service emits event
        ↓
Connected clients receive update
```

## Design Principles

### Controllers stay thin
Controllers translate HTTP requests into service calls and shape HTTP responses. Domain rules should remain in services.

### Services own business rules
Seat locking, expiration, booking state changes and related side effects belong in services so the same rules can be reused outside a specific HTTP route.

### Repositories own persistence
Repositories centralize MongoDB queries and indexes, keeping database details out of controllers and most business logic.

### Validation happens at the boundary
Zod schemas reject malformed input before it reaches business logic.

### API versioning protects clients
Versioned routes allow the server contract to evolve without silently breaking existing consumers.
