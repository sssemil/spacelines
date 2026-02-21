type Cell = readonly number[]

export class SpatialIndex {
  private readonly cellSize: number
  private readonly cells = new Map<string, number[]>()
  private positions: Float32Array = new Float32Array(0)
  private count = 0

  constructor(cellSize: number) {
    this.cellSize = cellSize
  }

  build(positions: Float32Array, count: number): void {
    this.cells.clear()
    this.positions = positions
    this.count = count

    for (let i = 0; i < count; i++) {
      const x = positions[i * 3]
      const y = positions[i * 3 + 1]
      const z = positions[i * 3 + 2]
      const key = this.cellKey(x, y, z)

      const cell = this.cells.get(key)
      if (cell) {
        cell.push(i)
      } else {
        this.cells.set(key, [i])
      }
    }
  }

  findNearest(
    x: number,
    y: number,
    z: number,
    maxDistance: number = Infinity,
  ): number {
    if (this.count === 0) return -1

    const cx = Math.floor(x / this.cellSize)
    const cy = Math.floor(y / this.cellSize)
    const cz = Math.floor(z / this.cellSize)

    let bestIndex = -1
    let bestDist = maxDistance * maxDistance

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const key = `${cx + dx},${cy + dy},${cz + dz}`
          const cell: Cell | undefined = this.cells.get(key)
          if (!cell) continue

          for (const idx of cell) {
            const px = this.positions[idx * 3] - x
            const py = this.positions[idx * 3 + 1] - y
            const pz = this.positions[idx * 3 + 2] - z
            const dist = px * px + py * py + pz * pz

            if (dist < bestDist) {
              bestDist = dist
              bestIndex = idx
            }
          }
        }
      }
    }

    return bestIndex
  }

  private cellKey(x: number, y: number, z: number): string {
    return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)},${Math.floor(z / this.cellSize)}`
  }
}
