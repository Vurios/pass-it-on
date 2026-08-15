import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Broadcast, PaperPlaneTilt, Plugs, Smiley } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { BigButton } from '../components/BigButton.jsx'
import { Card } from '../components/Card.jsx'
import { ErrorState } from '../components/ErrorState.jsx'
import { LoadingState } from '../components/LoadingState.jsx'
import { createHostRoom, joinPlayerRoom } from '../realtime/transport.js'

function addLog(setLogs, direction, message, metadata = {}) {
  const entry = {
    id: crypto.randomUUID(),
    time: new Date().toLocaleTimeString(),
    direction,
    type: message.type,
    clockOffset: metadata.clockOffset ?? 0,
  }
  setLogs((current) => [entry, ...current].slice(0, 12))
}

export function TransportTestScreen() {
  const queryCode = new URLSearchParams(window.location.search).get('room') ?? ''
  const connectionRef = useRef(null)
  const unsubscribeRef = useRef(null)
  const [role, setRole] = useState(null)
  const [roomCode, setRoomCode] = useState(queryCode.toUpperCase())
  const [name, setName] = useState('Test Player')
  const [logs, setLogs] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => () => {
    unsubscribeRef.current?.()
    connectionRef.current?.leave()
  }, [])

  const connect = async (nextRole) => {
    setBusy(true)
    setError('')
    try {
      const connection = nextRole === 'host'
        ? await createHostRoom()
        : await joinPlayerRoom({ roomCode, name, avatar: 'fox' })
      connectionRef.current = connection
      unsubscribeRef.current = connection.subscribe((message, metadata) => {
        addLog(setLogs, 'received', message, metadata)
      })
      setRole(nextRole)
      setRoomCode(connection.roomCode)
    } catch (connectionError) {
      setError(connectionError.message)
    } finally {
      setBusy(false)
    }
  }

  const sendState = async () => {
    const message = {
      type: 'state',
      snapshot: {
        currentPhase: 'transport-test',
        currentRoundId: null,
        timerEndsAt: null,
        players: [],
        publicQuestion: { text: 'Broadcast reached the player window.' },
        reveal: null,
      },
    }
    try {
      await connectionRef.current.send(message)
      addLog(setLogs, 'sent', message)
    } catch (sendError) {
      setError(sendError.message)
    }
  }

  const sendAnswer = async () => {
    const message = { type: 'answer', round: 'transport-test', intent: { choice: 'A' } }
    try {
      await connectionRef.current.send(message)
      addLog(setLogs, 'sent', message, { clockOffset: connectionRef.current.getClockOffset() })
    } catch (sendError) {
      setError(sendError.message)
    }
  }

  const sendReaction = async () => {
    const message = { type: 'react', reaction: '👏' }
    try {
      await connectionRef.current.send(message)
      addLog(setLogs, 'sent', message, { clockOffset: connectionRef.current.getClockOffset() })
    } catch (sendError) {
      setError(sendError.message)
    }
  }

  const leave = async () => {
    unsubscribeRef.current?.()
    await connectionRef.current?.leave()
    connectionRef.current = null
    unsubscribeRef.current = null
    setRole(null)
    setLogs([])
  }

  if (busy) return <LoadingState message="Connecting the test window..." />
  if (error) return <ErrorState message="The realtime test connection failed." actionLabel="Back to test" onAction={() => setError('')} />

  return (
    <main className="dot-grid min-h-[100dvh] bg-cream px-5 py-8 text-ink">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg font-bold uppercase tracking-[0.08em]">Disposable test page</p>
            <h1 className="font-display text-4xl font-bold sm:text-5xl">Realtime transport check</h1>
          </div>
          <BigButton as={Link} to="/" variant="sunshine" className="w-auto gap-2">
            <ArrowLeft size={24} weight="bold" aria-hidden="true" />
            Back
          </BigButton>
        </div>

        {!role ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card fill="white" tilt="left" className="p-7">
              <Broadcast size={52} weight="fill" aria-hidden="true" />
              <h2 className="mt-4 font-display text-3xl font-bold">Window one: host</h2>
              <p className="mt-3 font-body text-lg font-medium">Claims a safe four-letter room and sends state snapshots.</p>
              <BigButton variant="coral" className="mt-6" onClick={() => connect('host')} disabled={busy}>
                Create test room
              </BigButton>
            </Card>

            <Card fill="white" tilt="right" className="p-7">
              <Plugs size={52} weight="fill" aria-hidden="true" />
              <h2 className="mt-4 font-display text-3xl font-bold">Window two: player</h2>
              <label className="mt-5 block font-body text-base font-bold" htmlFor="test-room-code">Room code</label>
              <input
                id="test-room-code"
                value={roomCode}
                maxLength={4}
                onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
                className="mt-2 min-h-16 w-full rounded-[14px] border-chunky border-ink bg-cream px-4 font-display text-3xl font-bold uppercase shadow-hard-sm focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink"
              />
              <label className="mt-5 block font-body text-base font-bold" htmlFor="test-player-name">Player name</label>
              <input
                id="test-player-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 min-h-16 w-full rounded-[14px] border-chunky border-ink bg-cream px-4 font-body text-xl font-bold shadow-hard-sm focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink"
              />
              <BigButton variant="ocean" className="mt-6" onClick={() => connect('player')} disabled={busy || roomCode.length !== 4}>
                Join test room
              </BigButton>
            </Card>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Card fill="white" tilt="left" className="p-7">
              <p className="font-body text-base font-bold uppercase tracking-[0.08em]">Connected as {role}</p>
              <p className="mt-3 font-display text-6xl font-bold tracking-[0.12em]">{roomCode}</p>
              <p className="mt-4 font-body text-lg font-medium">Open another window at:</p>
              <p className="mt-2 break-all font-body text-base font-bold">/transport-test?room={roomCode}</p>

              <div className="mt-7 grid gap-4">
                {role === 'host' ? (
                  <BigButton variant="coral" onClick={sendState} className="gap-2">
                    <PaperPlaneTilt size={26} weight="fill" aria-hidden="true" />
                    Send state
                  </BigButton>
                ) : (
                  <>
                    <BigButton variant="ocean" onClick={sendAnswer}>Send answer</BigButton>
                    <BigButton variant="lime" onClick={sendReaction} className="gap-2">
                      <Smiley size={26} weight="fill" aria-hidden="true" />
                      Send reaction
                    </BigButton>
                  </>
                )}
                <BigButton variant="sunshine" onClick={leave}>Leave room</BigButton>
              </div>
            </Card>

            <Card fill="white" className="p-7">
              <h2 className="font-display text-3xl font-bold">Message log</h2>
              <div className="mt-5 grid gap-3" aria-live="polite">
                {logs.length === 0 ? (
                  <p className="font-body text-lg font-medium">Waiting for a message from the other window.</p>
                ) : logs.map((entry) => (
                  <div key={entry.id} className="rounded-[12px] border-chunky border-ink bg-cream p-3 font-body">
                    <p className="font-bold">{entry.time}: {entry.direction} {entry.type}</p>
                    {entry.type === 'state' && <p className="mt-1 text-sm font-semibold">Clock offset: {entry.clockOffset} ms</p>}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

      </div>
    </main>
  )
}
