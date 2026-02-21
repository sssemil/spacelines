export const TEXTURE_WIDTH = 1024
export const TEXTURE_HEIGHT = 512

type CanvasCoords = {
  readonly x: number
  readonly y: number
}

export const geoToCanvasCoords = (lon: number, lat: number): CanvasCoords => ({
  x: ((180 - lon) / 360) * TEXTURE_WIDTH,
  y: ((90 - lat) / 180) * TEXTURE_HEIGHT,
})

type GeoPolygon = readonly (readonly [number, number])[]

type LandGeometry =
  | { readonly type: 'Polygon'; readonly coordinates: readonly GeoPolygon[] }
  | { readonly type: 'MultiPolygon'; readonly coordinates: readonly (readonly GeoPolygon[])[] }

type LandFeature = {
  readonly type: 'Feature'
  readonly geometry: LandGeometry
}

type LandGeoJson = {
  readonly type: 'FeatureCollection'
  readonly features: readonly LandFeature[]
}

const LAND_COLOR = 'rgba(51, 255, 51, 1.0)'

const drawPolygon = (ctx: CanvasRenderingContext2D, ring: GeoPolygon) => {
  if (ring.length === 0) return
  const first = geoToCanvasCoords(ring[0][0], ring[0][1])
  ctx.moveTo(first.x, first.y)
  for (let i = 1; i < ring.length; i++) {
    const pt = geoToCanvasCoords(ring[i][0], ring[i][1])
    ctx.lineTo(pt.x, pt.y)
  }
  ctx.closePath()
}

export const drawLandMasses = (
  canvas: HTMLCanvasElement,
  geojson: LandGeoJson,
): void => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = TEXTURE_WIDTH
  canvas.height = TEXTURE_HEIGHT
  ctx.clearRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT)
  ctx.fillStyle = LAND_COLOR

  for (const feature of geojson.features) {
    const { geometry } = feature
    if (geometry.type === 'Polygon') {
      ctx.beginPath()
      for (const ring of geometry.coordinates) {
        drawPolygon(ctx, ring)
      }
      ctx.fill()
    } else {
      for (const polygon of geometry.coordinates) {
        ctx.beginPath()
        for (const ring of polygon) {
          drawPolygon(ctx, ring)
        }
        ctx.fill()
      }
    }
  }
}
