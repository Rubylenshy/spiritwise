import { useEffect, useRef } from 'react'

/*
 * Midjourney's CDN sends a same-origin resource policy, so browsers refuse to
 * play the hotlinked URL. Save the file to public/videos/landing-bg.mp4 — the
 * local copy is tried first, the CDN URL is only a fallback.
 */
const VIDEO_SRC = '/videos/landing-bg.mp4'
const VIDEO_FALLBACK = 'https://cdn.midjourney.com/video/4b8627e3-f2e2-44a5-aa3c-557cf281e638/1.mp4'

/**
 * Fixed, full-viewport looping video behind the page (design-system layer 1).
 * The scrim keeps text legible in both themes — `dense` makes it stronger for
 * content-heavy app pages. Reduced-motion users get a paused first frame.
 */
export default function VideoBackground({ dense = false }) {
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
    <div className="fixed top-0 left-0 w-full h-screen z-[-10] bg-spirit-900" aria-hidden="true">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
      >
        <source src={VIDEO_SRC} type="video/mp4" />
        <source src={VIDEO_FALLBACK} type="video/mp4" />
      </video>
      <div
        className={`absolute inset-0 ${
          dense ? 'bg-neutral-50/[0.88] dark:bg-[#171717]/70' : 'bg-neutral-50/80 dark:bg-[#171717]/50'
        }`}
      />
    </div>
  )
}
