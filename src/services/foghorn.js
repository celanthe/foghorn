/**
 * Foghorn audio playback service
 * 
 * TODO: Replace placeholder with real foghorn recording
 * Need: Pre-2000s Falmouth foghorn, NOT the new recording
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
    console.log('[foghorn] Audio loaded successfully');
  } catch (error) {
    console.error('[foghorn] Failed to load audio:', error);
    throw new Error('Could not load foghorn audio');
  }
}

/**
 * Play foghorn sound
 * @returns {Promise<void>}
 */
export async function playFoghorn() {
  await initAudio();
  
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
    console.warn('[foghorn] No audio loaded, cannot play');
    return;
  }
  
  // Create new source
  currentSource = audioContext.createBufferSource();
  currentSource.buffer = audioBuffer;
  currentSource.connect(audioContext.destination);
  currentSource.start(0);
  
  console.log('[foghorn] Playing foghorn sound');
  
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
