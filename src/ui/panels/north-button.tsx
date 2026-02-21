import { useCameraStore } from '../../store/camera-store'

export const NorthButton = () => {
  const sunTrackMode = useCameraStore((s) => s.sunTrackMode)
  const enableSunTrack = useCameraStore((s) => s.enableSunTrack)

  if (sunTrackMode) return null

  return (
    <button className="north-btn" onClick={enableSunTrack}>
      North
    </button>
  )
}
