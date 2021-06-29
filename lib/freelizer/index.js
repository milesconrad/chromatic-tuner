'use strict'

import { USER_MEDIA_CONSTRAINTS, FFT_SIZE } from './constants.js'
import { autoCorrelate } from './algorithm.js'

export const freelizer = async () => {
  let rafID
  let audioContext
  let analyser
  let callbacks = []

  const init = async () => {
    const stream = await navigator.mediaDevices.getUserMedia(
      USER_MEDIA_CONSTRAINTS
    )
    audioContext = new AudioContext()
    analyser = audioContext.createAnalyser()
    analyser.fftSize = FFT_SIZE
    audioContext.createMediaStreamSource(stream).connect(analyser)
  }

  const update = () => {
    const buffer = new Float32Array(FFT_SIZE)
    analyser.getFloatTimeDomainData(buffer)
    const frequency = autoCorrelate(buffer, audioContext.sampleRate)
    
    const array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    let total = 0;
    const length = array.length;
    for (let i = 0; i < length; i++) {
        total += array[i];
    }
    const volume = total / length;

    callbacks.forEach((fn) =>
      fn([frequency, volume])
    )
    rafID = requestAnimationFrame(update)

    let start = new Date().getTime();
    let stop = start + 100;
    while (start < stop) {
      start = new Date().getTime();
    }
  }

  await init()

  return {
    start: () => update(),
    stop: () => cancelAnimationFrame(rafID),
    subscribe: (fn) => (callbacks = [...callbacks, fn]),
    unsubscribe: (fn) => (callbacks = callbacks.filter((el) => el !== fn)),
  }
}