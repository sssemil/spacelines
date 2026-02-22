import { useState, useEffect } from 'react'
import { gstime } from 'satellite.js'
import * as THREE from 'three'
import { useSatelliteStore } from '../../store/satellite-store'
import { useGroundStationStore } from '../../store/ground-station-store'
import { useCameraStore } from '../../store/camera-store'
import { propagatePosition } from '../../orbital/propagator'
import { geoToScenePosition } from '../../scene/earth/ground-stations'
import { formatAltitude, formatVelocity, formatCoordinate } from '../../utils/formatters'
import type { SatellitePosition } from '../../types/satellite'
import type { GroundStation } from '../../schemas/ground-station'

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

const computeStationWorldPosition = (station: GroundStation): THREE.Vector3 => {
  const [x, y, z] = geoToScenePosition(station.lng, station.lat)
  const localPos = new THREE.Vector3(x, y, z)
  const rotation = gstime(new Date())
  localPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation)
  return localPos
}

const StationDetail = ({ station }: { readonly station: GroundStation }) => {
  const clearSelection = useGroundStationStore((s) => s.clearSelection)
  const flyTo = useCameraStore((s) => s.flyTo)

  const handleTrack = () => {
    const worldPos = computeStationWorldPosition(station)
    flyTo({ x: worldPos.x, y: worldPos.y, z: worldPos.z })
  }

  return (
    <div className="panel detail-panel">
      <div className="detail-header">
        <h2 className="detail-name">{station.name}</h2>
        <button className="close-btn" onClick={clearSelection}>
          &times;
        </button>
      </div>

      <div className="detail-grid">
        <div className="detail-row">
          <span className="detail-label">Station ID</span>
          <span className="detail-value">{station.id}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Status</span>
          <span className="detail-value">{station.status}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Latitude</span>
          <span className="detail-value">{formatCoordinate(station.lat, 'lat')}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Longitude</span>
          <span className="detail-value">{formatCoordinate(station.lng, 'lon')}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Altitude</span>
          <span className="detail-value">{station.altitude} m</span>
        </div>
      </div>

      <button className="track-btn" onClick={handleTrack}>
        Track Station
      </button>
    </div>
  )
}

const SatelliteDetail = () => {
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

export const DetailPanel = () => {
  const selectedStation = useGroundStationStore((s) => s.getSelectedStation())

  if (selectedStation) {
    return <StationDetail station={selectedStation} />
  }

  return <SatelliteDetail />
}
