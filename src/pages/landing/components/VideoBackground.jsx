import { useEffect, useRef } from 'react'
import { MEDIA } from '../landingData'

/**
 * Fixed, full-viewport looping video behind the whole landing page.
 * The scrim keeps text legible in both themes; reduced-motion users get a
 * paused first frame instead of playback.
 */
export default function VideoBackground() {
  const videoRef = useRef(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      const video = videoRef.current
      if (!video) return
      if (mq.matches) video.pause()
      else video.play().catch(() => {})
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-screen z-[-10] bg-lp-bg" aria-hidden="true">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
      >
        <source src={MEDIA.video} type="video/mp4" />
        <source src={MEDIA.videoFallback} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-neutral-50/80 dark:bg-[#171717]/50" />
    </div>
  )
}
