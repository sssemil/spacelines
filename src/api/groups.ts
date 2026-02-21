export type SatelliteGroup = {
  readonly id: string
  readonly label: string
  readonly query: string
}

export const SATELLITE_GROUPS: readonly SatelliteGroup[] = [
  { id: 'stations', label: 'Space Stations', query: 'GROUP=stations' },
  { id: 'active', label: 'Active Satellites', query: 'GROUP=active' },
  { id: 'starlink', label: 'Starlink', query: 'GROUP=starlink' },
  { id: 'oneweb', label: 'OneWeb', query: 'GROUP=oneweb' },
  { id: 'gps', label: 'GPS', query: 'GROUP=gps-ops' },
  { id: 'glonass', label: 'GLONASS', query: 'GROUP=glo-ops' },
  { id: 'galileo', label: 'Galileo', query: 'GROUP=galileo' },
  { id: 'beidou', label: 'Beidou', query: 'GROUP=beidou' },
  { id: 'weather', label: 'Weather', query: 'GROUP=weather' },
  { id: 'resource', label: 'Earth Resources', query: 'GROUP=resource' },
  { id: 'debris', label: 'Debris', query: 'SPECIAL=debris' },
]

export const CELESTRAK_BASE_URL = 'https://celestrak.org/NORAD/elements/gp.php'
