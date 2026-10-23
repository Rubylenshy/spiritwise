import { useRef, useEffect } from 'react'

export default function FrequencyVisualiser({ analyserNode, active }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const BAR_COUNT = 16

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (!active || !analyserNode) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const barW = canvas.width / BAR_COUNT
      const gap = 2
      ctx.fillStyle = 'rgba(90, 122, 168, 0.2)'
      for (let i = 0; i < BAR_COUNT; i++) {
        ctx.fillRect(i * barW + gap / 2, canvas.height - 3, barW - gap, 3)
      }
      return
    }

    const bufferLength = analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      analyserNode.getByteFrequencyData(dataArray)
      const ctx = canvas.getContext('2d')
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)
      const barW = width / BAR_COUNT
      const gap = 2
      for (let i = 0; i < BAR_COUNT; i++) {
        const dataIdx = Math.floor((i / BAR_COUNT) * (bufferLength * 0.5))
        const value = dataArray[dataIdx] / 255
        const barH = Math.max(3, value * height)
        const gradient = ctx.createLinearGradient(0, height - barH, 0, height)
        gradient.addColorStop(0, `rgba(201, 168, 76, ${0.4 + value * 0.6})`)
        gradient.addColorStop(1, `rgba(201, 168, 76, 0.2)`)
        ctx.fillStyle = gradient
        const x = i * barW + gap / 2
        ctx.beginPath()
        ctx.roundRect?.(x, height - barH, barW - gap, barH, 2)
        ctx.fill()
      }
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [analyserNode, active])

  return (
    <canvas ref={canvasRef} width={200} height={40} className="opacity-80"
            style={{ imageRendering: 'pixelated' }} />
  )
}
