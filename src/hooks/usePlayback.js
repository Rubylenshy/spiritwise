import { useCallback } from 'react'
import { useNowPlaying } from '../context/AudioContext'
import useQueueStore from '../store/queueStore'

function shuffled(items) {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Start playback from a list without opening the player page — tile play
 * buttons and the Play / Shuffle buttons on series and playlists.
 * The sermon already in the player only toggles: re-fetching its detail would
 * mint a new audio URL mid-playback.
 */
export function usePlayback() {
  const { currentId, playing, togglePlay, playFromQueue } = useNowPlaying()

  const playSermon = useCallback((sermon) => {
    if (sermon.id === currentId) togglePlay()
    else playFromQueue(sermon.id)
  }, [currentId, togglePlay, playFromQueue])

  // Plays the first sermon and replaces the queue with the rest, in order
  // (or shuffled). Only the sermons passed in — i.e. the pages loaded so far.
  const playAll = useCallback((sermons, { shuffle = false } = {}) => {
    if (!sermons.length) return
    const [first, ...rest] = shuffle ? shuffled(sermons) : sermons
    const queue = useQueueStore.getState()
    queue.clear()
    rest.forEach((sermon) => queue.add(sermon))
    if (first.id === currentId) {
      if (!playing) togglePlay()
    } else {
      playFromQueue(first.id)
    }
  }, [currentId, playing, togglePlay, playFromQueue])

  return { currentId, playing, playSermon, playAll }
}
