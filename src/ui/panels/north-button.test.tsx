import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NorthButton } from './north-button'
import { useCameraStore } from '../../store/camera-store'

describe('NorthButton', () => {
  beforeEach(() => {
    useCameraStore.setState({
      target: null,
      isAnimating: false,
      sunTrackMode: true,
    })
  })

  it('should render button when sun tracking is off', () => {
    useCameraStore.setState({ sunTrackMode: false })

    render(<NorthButton />)

    expect(screen.getByRole('button', { name: /north/i })).toBeInTheDocument()
  })

  it('should not render when sun tracking is on', () => {
    render(<NorthButton />)

    expect(screen.queryByRole('button', { name: /north/i })).not.toBeInTheDocument()
  })

  it('should enable sun tracking when clicked', async () => {
    useCameraStore.setState({ sunTrackMode: false })

    render(<NorthButton />)
    await userEvent.click(screen.getByRole('button', { name: /north/i }))

    expect(useCameraStore.getState().sunTrackMode).toBe(true)
  })
})
