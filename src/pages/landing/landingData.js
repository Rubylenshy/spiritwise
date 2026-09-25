/**
 * Static media + demo content for the landing page.
 * Asset URLs come from the landing design template (the background video
 * lives in src/components/VideoBackground.jsx).
 */

export const MEDIA = {
  heroArt: 'https://images.unsplash.com/photo-1710319586590-89a5652c4c94?w=800&q=80',
  art2: 'https://images.unsplash.com/photo-1625014618427-fbc980b974f5?w=320&q=80',
  art3: 'https://images.unsplash.com/photo-1650473395434-8674d953ef2f?w=320&q=80',
  art4: 'https://images.unsplash.com/photo-1722269160081-5bce2d5fdde2?w=320&q=80',
  art5: 'https://images.unsplash.com/photo-1618397746666-63405ce5d015?w=320&q=80',
  seriesCover: 'https://images.unsplash.com/photo-1619472376731-3ca648a34b69?w=800&q=80',
}

// Demo sermons for the landing player card (durations in seconds)
export const DEMO_SERMONS = [
  { id: 1, title: 'Renewed Strength', speaker: 'Pastor James Adeyemi', scripture: 'Isaiah 40:31', duration: 3124, art: MEDIA.heroArt },
  { id: 2, title: 'Rooted in Love', speaker: 'Rev. Grace Okafor', scripture: 'Ephesians 3:17', duration: 2410, art: MEDIA.art2 },
  { id: 3, title: 'Faith That Moves', speaker: 'Pastor Daniel Mensah', scripture: 'Mark 11:23', duration: 2785, art: MEDIA.art3 },
  { id: 4, title: 'The Upper Room', speaker: 'Bishop Ruth Adeleke', scripture: 'Acts 2:1-4', duration: 3310, art: MEDIA.art4 },
  { id: 5, title: 'Still Waters', speaker: 'Pastor James Adeyemi', scripture: 'Psalm 23', duration: 1968, art: MEDIA.art5 },
]

export const DEMO_SERIES = {
  title: 'Foundations',
  speaker: 'Pastor James Adeyemi',
  sermonCount: 7,
  cover: MEDIA.seriesCover,
  preview: DEMO_SERMONS.slice(0, 3),
}

// Same formatting as the app's player (m:ss, h:mm:ss from an hour up).
export { formatDuration as formatTime } from '../../lib/format'
