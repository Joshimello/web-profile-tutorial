import { useState } from 'react'
import { AlertCircle, Trophy, Swords, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const BASE = 'http://localhost:8787'

// --- Types ---

type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T }

type Player = {
  id: string
  username: string
  rank: string
  level: number
  wins: number
  losses: number
  winRate: number
}

type Match = {
  matchId: string
  result: 'win' | 'loss'
  map: string
  durationSeconds: number
  kills: number
  deaths: number
  kd: number
  playedAt: string
}

type Leaderboard = {
  name: string
  season: string
  updatedAt: string
  entries: { rank: number; playerId: string; username: string; score: number }[]
}

// --- Helpers ---

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
  return data as T
}

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// --- Sub-components ---

function ErrorBox({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

function PlayerCard({ state }: { state: AsyncState<Player> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4" /> Player
        </CardTitle>
      </CardHeader>
      <CardContent>
        {state.status === 'idle' && (
          <p className="text-sm text-muted-foreground">Enter a username and press Load.</p>
        )}
        {state.status === 'loading' && (
          <div className="space-y-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-6 pt-1">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-20" />)}
            </div>
          </div>
        )}
        {state.status === 'error' && <ErrorBox message={state.message} />}
        {state.status === 'success' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl font-semibold">{state.data.username}</h2>
              <Badge variant="secondary">{state.data.rank}</Badge>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Level', value: state.data.level },
                { label: 'Wins', value: state.data.wins },
                { label: 'Losses', value: state.data.losses },
                { label: 'Win Rate', value: `${state.data.winRate}%` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-muted px-3 py-2">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-lg font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MatchesCard({ state }: { state: AsyncState<{ matches: Match[] }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Swords className="h-4 w-4" /> Matches
        </CardTitle>
      </CardHeader>
      <CardContent>
        {state.status === 'idle' && (
          <p className="text-sm text-muted-foreground">Enter a username and press Load.</p>
        )}
        {state.status === 'loading' && (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
          </div>
        )}
        {state.status === 'error' && <ErrorBox message={state.message} />}
        {state.status === 'success' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {state.data.matches.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matches found for this player.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Result</TableHead>
                    <TableHead>Map</TableHead>
                    <TableHead>K / D</TableHead>
                    <TableHead>Ratio</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.data.matches.map((m) => (
                    <TableRow key={m.matchId}>
                      <TableCell>
                        <Badge variant={m.result === 'win' ? 'default' : 'destructive'}>
                          {m.result}
                        </Badge>
                      </TableCell>
                      <TableCell>{m.map}</TableCell>
                      <TableCell>{m.kills} / {m.deaths}</TableCell>
                      <TableCell>{m.kd}</TableCell>
                      <TableCell>{fmt(m.durationSeconds)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LeaderboardCard({ state }: { state: AsyncState<Leaderboard> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4" />
          {state.status === 'success' ? state.data.name : 'Leaderboard'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {state.status === 'idle' && (
          <p className="text-sm text-muted-foreground">Enter a username and press Load.</p>
        )}
        {state.status === 'loading' && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
          </div>
        )}
        {state.status === 'error' && <ErrorBox message={state.message} />}
        {state.status === 'success' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.data.entries.map((e) => (
                  <TableRow key={e.playerId}>
                    <TableCell className="font-medium text-muted-foreground">
                      {e.rank <= 3
                        ? ['🥇', '🥈', '🥉'][e.rank - 1]
                        : e.rank}
                    </TableCell>
                    <TableCell>{e.username}</TableCell>
                    <TableCell className="text-right font-mono">{e.score.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// --- App ---

export default function App() {
  const [username, setUsername] = useState('')
  const [player, setPlayer] = useState<AsyncState<Player>>({ status: 'idle' })
  const [matches, setMatches] = useState<AsyncState<{ matches: Match[] }>>({ status: 'idle' })
  const [leaderboard, setLeaderboard] = useState<AsyncState<Leaderboard>>({ status: 'idle' })

  async function load() {
    const id = username.trim()
    if (!id) return

    setPlayer({ status: 'loading' })
    setMatches({ status: 'idle' })
    setLeaderboard({ status: 'idle' })

    try {
      const playerData = await apiFetch<Player>(`${BASE}/player/${id}`)
      setPlayer({ status: 'success', data: playerData })
    } catch (err) {
      setPlayer({ status: 'error', message: String((err as Error).message) })
    }

    setMatches({ status: 'loading' })

    try {
      const matchesData = await apiFetch<{ matches: Match[] }>(`${BASE}/player/${id}/matches`)
      setMatches({ status: 'success', data: matchesData })
    } catch (err) {
      setMatches({ status: 'error', message: String((err as Error).message) })
    }

    setLeaderboard({ status: 'loading' })

    try {
      const leaderboardData = await apiFetch<Leaderboard>(`${BASE}/leaderboard`)
      setLeaderboard({ status: 'success', data: leaderboardData })
    } catch (err) {
      setLeaderboard({ status: 'error', message: String((err as Error).message) })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 space-y-8">

        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Player Lookup</h1>
          <p className="text-muted-foreground text-sm">Search for a player to view their profile, match history, and leaderboard standings.</p>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Enter username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
          />
          <Button onClick={load}>Load</Button>
        </div>

        <div className="space-y-4">
          <PlayerCard state={player} />
          <MatchesCard state={matches} />
          <LeaderboardCard state={leaderboard} />
        </div>

      </div>
    </div>
  )
}
