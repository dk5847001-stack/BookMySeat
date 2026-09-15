# Seat Booking Model

Seat selection is treated as a short-lived reservation before final booking.

## State Machine

```text
available → locked → booked
     ↑        │
     └────────┘
   expiration/release
```

## Locking Rules

- Requested labels are de-duplicated before processing.
- Only currently available seats can be locked.
- A lock expires after the configured lock window.
- Booking requires the seats to still be locked by the same authenticated user.
- Expired locks are released by the sweeper and during seat reads/lock operations.
- Seat updates are broadcast to the relevant event room through Socket.io.

## Consistency Considerations

Seat locking uses a conditional database update and checks the modified count. This protects against the common race where another request claims a seat between the availability check and the update.

The event aggregate counters must remain consistent with successful booking operations. Any future payment integration should make booking finalization idempotent and should reconcile failures rather than relying on client-side state.
