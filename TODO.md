# Async & Await — Student TODO

Build a small frontend that fetches player data from a live API and displays it in the browser.
The goal is to practice `async/await`, error handling, and working with real-world API behaviour.

**API base URL:** `https://profile-5lv.pages.dev`

---

## Endpoints

### `GET /player/:id`

Returns profile data for a given player ID.

```
https://profile-5lv.pages.dev/player/josh
```

Example success response `200`:

```json
{
  "id": "josh",
  "username": "ShadowStrike42",
  "rank": "Gold",
  "level": 74,
  "wins": 312,
  "losses": 98,
  "winRate": 76.1
}
```

Possible errors: `404 Player not found`, `500 Internal server error`

---

### `GET /player/:id/matches`

Returns the match history for a given player ID.

```
https://profile-5lv.pages.dev/player/josh/matches
```

Example success response `200`:

```json
{
  "matches": [
    {
      "matchId": "m_abc123_0",
      "result": "win",
      "map": "Dust2",
      "durationSeconds": 1842,
      "kills": 18,
      "deaths": 7,
      "kd": 2.57,
      "playedAt": "2024-11-03T14:22:00.000Z"
    }
  ]
}
```

> The `matches` array may be empty — this is a valid response, not an error.

Possible errors: `500 Internal server error`, request takes too long **(timeout)**

---

### `GET /leaderboard`

Returns the current global leaderboard. No ID required.

```
https://profile-5lv.pages.dev/leaderboard
```

Example success response `200`:

```json
{
  "name": "Season 7 Global Leaderboard",
  "season": "S7",
  "updatedAt": "2024-12-31T00:00:00.000Z",
  "entries": [
    {
      "rank": 1,
      "playerId": "p_a1b2c3",
      "username": "IronSpectre99",
      "score": 9801
    },
    {
      "rank": 2,
      "playerId": "p_d4e5f6",
      "username": "NeonBlast7",
      "score": 9450
    }
  ]
}
```

Possible errors: request takes too long **(timeout)**

---

## Tasks

### 1. Basic fetch

- Create an HTML page with a text input and a Load button
- When the button is clicked, fetch `/player/:id` using the value from the input
- Display the returned data on the page

### 2. Show a loading state

- While the request is in flight, show a loading indicator
- Clear it once the response arrives (success or error)

### 3. Handle HTTP errors

- A successful `fetch()` does **not** throw on `4xx`/`5xx` — you need to check `response.ok`
- If the response is not ok, read the error message from the JSON body and display it clearly

### 4. Load all three sections independently

- Fetch `/player/:id`, `/player/:id/matches`, and `/leaderboard` on the same button click
- Each section should load and display **independently** — if one fails, the other two must still show their results

### 5. Handle timeouts

- Some requests will hang for a long time
- Any request that takes longer than **3 seconds** should be cancelled and show a timeout message

---

## Grading Rubric (100 pts)

### 1. Basic fetch — 40 pts

- Username input and button
- Fetches all 3 endpoints on click
- Data is displayed (in any format)

### 2. Loading state — 15 pts

- A loading indicator is shown while each request is in flight
- It clears once the response arrives

### 3. Handle HTTP errors — 15 pts

- Checks `response.ok`, not just whether `fetch()` threw
- Error message from the response body is shown to the user

### 4. Independent loading — 15 pts

- All 3 sections load independently
- A failure in one does not prevent the other two from showing their result

### 5. Timeouts — 15 pts

- Requests exceeding 3 seconds are cancelled
- A timeout message is shown in the affected section

---

## Tips

- `fetch()` only throws on **network failure** — not on `404` or `500`. Always check `response.ok`.
- `await` pauses **one** function, not the whole page. Think about where you place it.
- To load sections independently, do **not** `await` one before starting the next.
- The player data for a given ID is always the same — use this to verify your display logic.

---

## Testing

Add `?success=100` to any URL to force a `200` response every time:

```
https://profile-5lv.pages.dev/player/josh?success=100
```

Use `?success=0` to force errors every time:

```
https://profile-5lv.pages.dev/player/josh?success=0
```

This lets you test your error and success states reliably before handling the real random behaviour.
