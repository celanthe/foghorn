/**
 * Foghorn audio playback service
 *
 * Recording: Nobska Lighthouse, Falmouth, MA (2018)
 * Source: Friends of Nobska Lighthouse — https://friendsofnobska.org/
 * Not the 1999 sound. Same lighthouse.
 */

let audioContext = null;
let audioBuffer = null;
let currentSource = null;

/**
 * Initialize audio context (call on user interaction)
 */
export async function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  // Resume if suspended (iOS requirement)
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
}

/**
 * Load foghorn audio file
 * @param {string} audioPath - Path to foghorn audio file
 */
export async function loadFoghorn(audioPath) {
  await initAudio();
  
  try {
    const response = await fetch(audioPath);
    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  } catch (error) {
    if (import.meta.env.DEV) console.error('[foghorn] Failed to load audio:', error);
    throw new Error('Could not load foghorn audio');
  }
}

/**
 * Play foghorn sound
 * Lazy-loads audio on first call (requires user gesture for AudioContext)
 * @param {string} [path] - Audio path to load if not already loaded
 * @returns {Promise<void>}
 */
export async function playFoghorn(path = null) {
  await initAudio();

  // Lazy-load audio on first play (inside user gesture — AudioContext works)
  if (!audioBuffer && path) {
    await loadFoghorn(path);
  }

  // Stop any currently playing sound
  if (currentSource) {
    try {
      currentSource.stop();
    } catch (e) {
      // Already stopped
    }
    currentSource = null;
  }

  if (!audioBuffer) {
    throw new Error('Foghorn audio could not be loaded');
  }
  
  // Create new source
  currentSource = audioContext.createBufferSource();
  currentSource.buffer = audioBuffer;
  currentSource.connect(audioContext.destination);
  currentSource.start(0);
  
  // Return promise that resolves when sound finishes
  return new Promise(resolve => {
    currentSource.onended = () => {
      currentSource = null;
      resolve();
    };
  });
}

/**
 * Stop foghorn if playing
 */
export function stopFoghorn() {
  if (currentSource) {
    try {
      currentSource.stop();
    } catch (e) {
      // Already stopped
    }
    currentSource = null;
  }
}

/**
 * Check if foghorn is currently playing
 */
export function isPlaying() {
  return currentSource !== null;
}
