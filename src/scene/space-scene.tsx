import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { EarthGlobe } from './earth/earth-globe'
import { StarField } from './effects/star-field'
import { SatellitePoints } from './satellites/satellite-points'
import { SelectedSatellite } from './satellites/selected-satellite'
import { CameraController } from './camera/camera-controller'

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
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      style={{ background: '#000008' }}
    >
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />

      <StarField />
      <EarthGlobe />
      <SatellitePoints />
      <SelectedSatellite />
      <CameraController />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={0.8}
        />
        <Vignette darkness={0.6} offset={0.3} />
      </EffectComposer>
    </Canvas>
  )
}
