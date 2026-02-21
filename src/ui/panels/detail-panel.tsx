import { useState, useEffect } from 'react'
import { useSatelliteStore } from '../../store/satellite-store'
import { useCameraStore } from '../../store/camera-store'
import { propagatePosition } from '../../orbital/propagator'
import { formatAltitude, formatVelocity, formatCoordinate } from '../../utils/formatters'
import type { SatellitePosition } from '../../types/satellite'

const CATEGORY_DISPLAY: Record<string, string> = {
  station: 'Space Station',
  starlink: 'Starlink',
  oneweb: 'OneWeb',
  gps: 'GPS Navigation',
  glonass: 'GLONASS Navigation',
  galileo: 'Galileo Navigation',
  beidou: 'Beidou Navigation',
  weather: 'Weather',
  'earth-observation': 'Earth Observation',
  communications: 'Communications',
  debris: 'Debris',
  'rocket-body': 'Rocket Body',
  unknown: 'Unknown',
}

export const DetailPanel = () => {
  const selectedSatellite = useSatelliteStore((s) => s.getSelectedSatellite())
  const clearSelection = useSatelliteStore((s) => s.clearSelection)
  const flyTo = useCameraStore((s) => s.flyTo)
  const [position, setPosition] = useState<SatellitePosition | null>(null)

  useEffect(() => {
    if (!selectedSatellite) {
      setPosition(null)
      return
    }

    const update = () => {
      const pos = propagatePosition(selectedSatellite.satrec, new Date())
      setPosition(pos)
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [selectedSatellite])

  if (!selectedSatellite) return null

  return (
    <div className="panel detail-panel">
      <div className="detail-header">
        <h2 className="detail-name">{selectedSatellite.name}</h2>
        <button className="close-btn" onClick={clearSelection}>
          &times;
        </button>
      </div>

      <div className="detail-grid">
        <div className="detail-row">
          <span className="detail-label">NORAD ID</span>
          <span className="detail-value">{selectedSatellite.id}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Designator</span>
          <span className="detail-value">{selectedSatellite.intlDesignator}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Type</span>
          <span className="detail-value">
            {CATEGORY_DISPLAY[selectedSatellite.category] ?? selectedSatellite.category}
          </span>
        </div>

        {position && (
          <>
            <div className="detail-row">
              <span className="detail-label">Altitude</span>
              <span className="detail-value">{formatAltitude(position.geodetic.altitude)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Velocity</span>
              <span className="detail-value">{formatVelocity(position.velocity)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Latitude</span>
              <span className="detail-value">
                {formatCoordinate(position.geodetic.latitude, 'lat')}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Longitude</span>
              <span className="detail-value">
                {formatCoordinate(position.geodetic.longitude, 'lon')}
              </span>
            </div>
          </>
        )}
      </div>

      {position && (
        <button
          className="track-btn"
          onClick={() => flyTo(position.scene)}
        >
          Track Satellite
        </button>
      )}
    </div>
  )
}
