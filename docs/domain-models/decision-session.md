# Decision Session

## Meaning

A temporary interaction where one or more users decide which restaurant to visit.

## Candidate Modes

- `gacha`
- `swipe`
- `draft`
- `vote`
- `tournament`
- `roulette`

## Initial Fields

- `id`
- `mode`
- `status`
- `decided_restaurant_id`
- `created_at`
- `completed_at`

## Candidate Data

Each session can have multiple candidates with score and rank.

## Notes

- Decision sessions are not just analytics. They are part of the product's core value.
- Group decision features can be delayed until after the single-user decision experience works well.

