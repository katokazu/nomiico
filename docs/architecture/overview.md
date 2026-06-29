# Architecture Overview

## Status

Technology choices are not finalized.

## Expected System Responsibilities

- Save restaurant candidates from URL or manual input
- Store user-owned restaurant data
- Support decision modes
- Support visit records
- Support notifications or resurfacing logic
- Integrate with external map URLs

## Initial Architecture Questions

- Mobile-first app, web app, or both?
- Where should metadata extraction happen?
- What backend should store user data?
- How should notifications be scheduled?
- What auth model is needed for MVP?

## Constraints

- Saving must be fast.
- External services should be used where they are already better, such as maps and navigation.
- The app should not depend on perfect metadata extraction.

