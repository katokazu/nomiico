# Database Schema Draft

## Tables

Initial candidate tables:

- `restaurants`
- `tags`
- `restaurant_tags`
- `visits`
- `decision_sessions`
- `decision_candidates`

## Restaurant Data

See [../domain-models/restaurant.md](../domain-models/restaurant.md).

## Decision Data

See [../domain-models/decision-session.md](../domain-models/decision-session.md).

## Open Questions

- Should source metadata be stored as structured columns, raw JSON, or both?
- Should tags be user-defined, system-defined, or mixed?
- How should archived candidates affect decision sessions?

