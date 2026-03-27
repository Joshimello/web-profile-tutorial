import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('*', cors())

// --- Helpers ---

/** Simple djb2-style hash → deterministic unsigned int from any string */
function hashId(id: string): number {
  let hash = 5381
  for (let i = 0; i < id.length; i++) {
    hash = (Math.imul(hash, 33) ^ id.charCodeAt(i)) >>> 0
  }
  return hash
}

/** Linear-congruential PRNG seeded by a number — returns values in [0, 1) */
function seededRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

// Fixed reference timestamp so date fields stay consistent across calls
const REF_DATE = new Date('2025-01-01T00:00:00Z').getTime()

const MAPS = ['Dust2', 'Mirage', 'Inferno', 'Nuke', 'Overpass', 'Vertigo', 'Ancient', 'Anubis']
const RANKS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster']
const ADJECTIVES = ['Shadow', 'Neon', 'Iron', 'Pixel', 'Vortex', 'Zenith', 'Ghost', 'Arcane', 'Storm', 'Cyber']
const NOUNS = ['Strike', 'Blast', 'Warden', 'Prowler', 'Viper', 'Raider', 'Spectre', 'Hunter', 'Breaker', 'Knight']

function makeUsername(rng: () => number): string {
  const adj = ADJECTIVES[Math.floor(rng() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(rng() * NOUNS.length)]
  const num = Math.floor(rng() * 999)
  return `${adj}${noun}${num}`
}

/** Returns error rate (0–1) from the ?success= query param (clamped 0–100, default 40% error). */
function errorRate(c: { req: { query: (key: string) => string | undefined } }): number {
  const raw = c.req.query('success')
  if (raw === undefined) return 0.4
  const clamped = Math.min(100, Math.max(0, Number(raw)))
  return isNaN(clamped) ? 0.4 : 1 - clamped / 100
}

// --- Routes ---

/**
 * GET /player/:id
 *
 * Possible responses (random per request, data consistent per id):
 *   60%  200  Player object
 *   20%  404  Player not found
 *   20%  500  Internal server error
 */
app.get('/player/:id', async (c) => {
  const id = c.req.param('id')
  const hash = hashId(id)
  const rng = seededRng(hash)
  const err = errorRate(c)

  await delay(Math.floor(Math.random() * 3000))

  const roll = Math.random()

  if (roll < err / 2) {
    return c.json({ error: 'Player not found' }, 404)
  }

  if (roll < err) {
    return c.json({ error: 'Internal server error' }, 500)
  }

  const wins = Math.floor(rng() * 500) + 50
  const losses = Math.floor(rng() * 200) + 20

  return c.json({
    id,
    username: makeUsername(rng),
    rank: RANKS[Math.floor(rng() * RANKS.length)],
    level: Math.floor(rng() * 100) + 1,
    wins,
    losses,
    winRate: Number(((wins / (wins + losses)) * 100).toFixed(1)),
  })
})

/**
 * GET /player/:id/matches
 *
 * Possible responses (random per request, data consistent per id):
 *   60%  200  { matches: Match[] }
 *   20%  500  Internal server error
 *   20%  hangs 5 s             — triggers client-side timeout
 */
app.get('/player/:id/matches', async (c) => {
  const id = c.req.param('id')
  const hash = hashId(id)
  const rng = seededRng(hash ^ 0xdeadbeef)
  const err = errorRate(c)

  const roll = Math.random()

  if (roll < err / 2) {
    await delay(5000)
    return c.json({ matches: [] })
  }

  await delay(Math.floor(Math.random() * 3000))

  if (roll < err) {
    return c.json({ error: 'Internal server error' }, 500)
  }

  const matchCount = Math.floor(rng() * 8) + 3

  const matches = Array.from({ length: matchCount }, (_, i) => {
    const mr = seededRng(hash ^ (i * 0x1234567))
    const kills = Math.floor(mr() * 30)
    const deaths = Math.floor(mr() * 20) + 1
    return {
      matchId: `m_${(hash >>> 0).toString(16).padStart(8, '0')}_${i}`,
      result: mr() > 0.45 ? 'win' : 'loss',
      map: MAPS[Math.floor(mr() * MAPS.length)],
      durationSeconds: Math.floor(mr() * 2400) + 600,
      kills,
      deaths,
      kd: Number((kills / deaths).toFixed(2)),
      playedAt: new Date(REF_DATE - Math.floor(mr() * 60 * 24 * 60 * 60 * 1000)).toISOString(),
    }
  })

  return c.json({ matches })
})

/**
 * GET /leaderboard
 *
 * Always returns fresh random data (no id — every call is different).
 *
 * Possible responses (random per request):
 *   60%  200  Leaderboard object
 *   40%  hangs 5 s             — triggers client-side timeout
 */
app.get('/leaderboard', async (c) => {
  const err = errorRate(c)
  const roll = Math.random()

  if (roll < err) {
    await delay(5000)
    return c.json({ error: 'Request timed out' }, 504)
  }

  await delay(Math.floor(Math.random() * 3000))

  const season = Math.floor(Math.random() * 12) + 1
  const entryCount = Math.floor(Math.random() * 15) + 5

  const entries = Array.from({ length: entryCount }, (_, i) => ({
    rank: i + 1,
    playerId: `p_${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`,
    username: makeUsername(Math.random.bind(Math)),
    score: Math.floor(Math.random() * 9000) + 1000,
  }))

  entries.sort((a, b) => b.score - a.score)
  entries.forEach((e, i) => { e.rank = i + 1 })

  return c.json({
    name: `Season ${season} Global Leaderboard`,
    season: `S${season}`,
    updatedAt: new Date().toISOString(),
    entries,
  })
})

export default app
