import { SpaceScene } from './scene/space-scene'
import { SearchPanel } from './ui/panels/search-panel'
import { FilterPanel } from './ui/panels/filter-panel'
import { DetailPanel } from './ui/panels/detail-panel'
import { StatsBar } from './ui/panels/stats-bar'
import { useSatelliteData } from './hooks/use-satellite-data'
import { useSatelliteStore } from './store/satellite-store'
import './app.css'

const LoadingOverlay = () => (
  <div className="loading-overlay">
    <div className="loading-spinner" />
    <div className="loading-text">Loading orbital data...</div>
  </div>
)

const ErrorOverlay = ({ message }: { message: string }) => (
  <div className="error-overlay">
    <div className="error-text">{message}</div>
    <button className="retry-btn" onClick={() => window.location.reload()}>
      Retry
    </button>
  </div>
)

export const App = () => {
  useSatelliteData()
  const loading = useSatelliteStore((s) => s.loading)
  const error = useSatelliteStore((s) => s.error)

  return (
    <div className="app">
      <SpaceScene />

      <div className="ui-overlay">
        <div className="top-bar">
          <div className="logo">
            <span className="logo-text">SPACELINES</span>
            <span className="logo-sub">Real-Time Orbital Tracker</span>
          </div>
          <SearchPanel />
        </div>

        <FilterPanel />
        <DetailPanel />
        <StatsBar />
      </div>

      {loading && <LoadingOverlay />}
      {error && <ErrorOverlay message={error} />}
    </div>
  )
}

export default App
