import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoadingState } from './components/LoadingState.jsx'
import { LandingScreen } from './screens/LandingScreen.jsx'
import { SoloScreen } from './screens/SoloScreen.jsx'

const HostScreen = lazy(() => (
  import('./screens/HostScreen.jsx')
    .then((module) => ({ default: module.HostScreen }))
))
const PlayerScreen = lazy(() => (
  import('./screens/PlayerScreen.jsx')
    .then((module) => ({ default: module.PlayerScreen }))
))
const TransportTestScreen = lazy(() => (
  import('./screens/TransportTestScreen.jsx')
    .then((module) => ({ default: module.TransportTestScreen }))
))

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingScreen />} />
      <Route
        path="/host"
        element={(
          <Suspense fallback={<LoadingState host message="Opening host screen..." />}>
            <HostScreen />
          </Suspense>
        )}
      />
      <Route
        path="/player"
        element={(
          <Suspense fallback={<LoadingState message="Opening player screen..." />}>
            <PlayerScreen />
          </Suspense>
        )}
      />
      <Route path="/solo" element={<SoloScreen />} />
      <Route
        path="/transport-test"
        element={(
          <Suspense fallback={<LoadingState message="Opening transport test..." />}>
            <TransportTestScreen />
          </Suspense>
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
