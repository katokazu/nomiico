# API Design Draft

## Status

No API implementation exists yet.

## Candidate Resources

- Restaurants
- Tags
- Visits
- Decision sessions
- Decision candidates

## Design Principles

- Saving should tolerate partial data.
- Decision endpoints should return immediately useful candidates.
- APIs should distinguish user-owned saved records from external restaurant data.

## Open Questions

- REST, RPC, GraphQL, or framework-native actions?
- Should metadata extraction be synchronous or asynchronous?
- Should decision scoring happen server-side or client-side for MVP?

