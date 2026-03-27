# Async & Await — Tutorial

A teaching resource for learning `async/await`, error handling, and real-world fetch behaviour in the browser.

Students build a frontend that fetches player and leaderboard data from a live API, handling loading states, HTTP errors, and timeouts along the way.

## Structure

```
/               React demo app (reference UI built with shadcn/ui)
/server         Hono API deployed to Cloudflare Pages
/public         Minimal plain HTML reference implementation
TODO.md         Student assignment sheet with API docs and grading rubric
```

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /player/:id` | Player profile — may return 404 or 500 |
| `GET /player/:id/matches` | Match history — may return 500 or hang |
| `GET /leaderboard` | Global leaderboard — may hang |

All endpoints have a random 0–3s delay and a ~40% chance of returning an error or hanging for 5 seconds, making them good practice for real-world async patterns.

A `?success=100` query param forces a successful response, and `?success=0` forces an error — useful for testing.

## Student Assignment

See [TODO.md](./TODO.md) for the full assignment, API documentation, and grading rubric.

## API Server

Built with [Hono](https://hono.dev) and deployed on Cloudflare Pages. To run locally:

```bash
cd server
bun install
bun run dev
```

## Demo App

A reference implementation built with React, Vite, and shadcn/ui.

```bash
bun install
bun run dev
```
