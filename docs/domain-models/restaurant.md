# Restaurant

## Meaning

A saved place the user may want to visit.

The model represents the user's saved candidate, not a globally complete restaurant record.

## Initial Fields

- `id`
- `name`
- `source_url`
- `source_type`
- `genre`
- `area`
- `nearest_station`
- `address`
- `price_range`
- `desire_level`
- `visited`
- `visit_count`
- `archived`
- `created_at`
- `last_suggested_at`
- `last_visited_at`

## Notes

- `source_url` should be retained even when metadata extraction fails.
- Missing metadata should not block saving.
- Tags and visit history should be modeled separately.

