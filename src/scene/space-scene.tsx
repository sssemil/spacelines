import { Canvas } from '@react-three/fiber'
import { EarthGlobe } from './earth/earth-globe'
import { EarthLandmass } from './earth/earth-landmass'
import { EarthCoastlines } from './earth/earth-coastlines'
import { GroundStations } from './earth/ground-stations'
import { StarField } from './effects/star-field'
import { SatellitePoints } from './satellites/satellite-points'
import { SelectedSatellite } from './satellites/selected-satellite'
import { SatelliteLabels } from './satellites/satellite-labels'
import { CameraController } from './camera/camera-controller'
import { Moon } from './celestial/moon'

export const SpaceScene = () => {
  return (
    <Canvas
      camera={{
        fov: 45,
        near: 0.01,
        far: 200,
        position: [0, 1.5, 4],
      }}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      style={{ background: '#000000' }}
    >
      <ambientLight intensity={0.3} />

      <StarField />
      <Moon />
      <EarthGlobe />
      <EarthLandmass />
      <EarthCoastlines />
      <GroundStations />
      <SatellitePoints />
      <SelectedSatellite />
      <SatelliteLabels />
      <CameraController />
    </Canvas>
  )
}
