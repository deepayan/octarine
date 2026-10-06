/*
 * Octarine voice lifter: microphone pass-through to speakers for classroom audio lift.
 * Uses Web Audio API:
 *   MediaStreamAudioSourceNode -> BiquadFilter (high-pass ~100Hz rumble cut)
 *   -> DynamicsCompressorNode (feedback control / leveling) -> GainNode -> AudioDestinationNode
 * Also includes an AnalyserNode for volume metering and safety feedback monitoring.
 */
Octarine.define('voice', function (O) {
  'use strict';

  const st = Object.assign(
    { gain: 1.0, muted: false, deviceId: '', sinkId: '' },
    O.storage.get('voice', {})
  );
  const save = O.debounce(() => O.storage.set('voice', st), 300);

  let audioCtx = null;
  let stream = null;
  let sourceNode = null;
  let filterNode = null;
  let compressorNode = null;
  let gainNode = null;
  let analyserNode = null;
  let meterInterval = null;
  let enabled = false;
  let currentLevel = 0; // 0.0 to 1.0

  function createAudioPipeline(mediaStream) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) throw new Error('Web Audio API is not supported in this browser.');

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioCtx({ latencyHint: 'interactive' });
    }

    // Highpass filter to eliminate microphone handling noise and low rumble (< 100Hz)
    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'highpass';
    filterNode.frequency.setValueAtTime(100, audioCtx.currentTime);

    // Dynamics compressor for gentle peak control and preventing feedback spikes
    compressorNode = audioCtx.createDynamicsCompressor();
    compressorNode.threshold.setValueAtTime(-24, audioCtx.currentTime);
    compressorNode.knee.setValueAtTime(10, audioCtx.currentTime);
    compressorNode.ratio.setValueAtTime(12, audioCtx.currentTime);
    compressorNode.attack.setValueAtTime(0.003, audioCtx.currentTime);
    compressorNode.release.setValueAtTime(0.25, audioCtx.currentTime);

    // Master gain
    gainNode = audioCtx.createGain();
    applyGain();

    // Fast metering
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.5;

    sourceNode = audioCtx.createMediaStreamSource(mediaStream);

    // Connect graph:
    // source -> filter -> compressor -> gain -> destination
    //                                      \-> analyser
    sourceNode.connect(filterNode);
    filterNode.connect(compressorNode);
    compressorNode.connect(gainNode);
    gainNode.connect(analyserNode);
    gainNode.connect(audioCtx.destination);

    // Set audio sink ID if supported (Chromium setSinkId)
    if (st.sinkId && typeof audioCtx.setSinkId === 'function') {
      audioCtx.setSinkId(st.sinkId).catch((err) => {
        console.warn('Could not set output sink:', err);
      });
    }

    startMeter();
  }

  function applyGain() {
    if (!gainNode || !audioCtx) return;
    const targetGain = st.muted ? 0 : st.gain;
    gainNode.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.03);
  }

  function startMeter() {
    stopMeter();
    const data = new Uint8Array(analyserNode.frequencyBinCount);
    meterInterval = setInterval(() => {
      if (!analyserNode || !enabled) return;
      analyserNode.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += data[i];
      }
      const avg = sum / data.length;
      currentLevel = Math.min(1, avg / 128);
      O.emit('voice:meter', { level: currentLevel, muted: st.muted, gain: st.gain });
    }, 100);
  }

  function stopMeter() {
    if (meterInterval) {
      clearInterval(meterInterval);
      meterInterval = null;
    }
    currentLevel = 0;
  }

  async function openStream() {
    const constraints = {
      audio: {
        // We explicitly turn off heavy AEC/AGC if possible for natural speech passthrough,
        // but noiseSuppression helps reduce classroom fan hum.
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: true,
        deviceId: st.deviceId ? { exact: st.deviceId } : undefined
      },
      video: false
    };

    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      if (st.deviceId && (err.name === 'OverconstrainedError' || err.name === 'NotFoundError')) {
        st.deviceId = '';
        save();
        constraints.audio.deviceId = undefined;
        return navigator.mediaDevices.getUserMedia(constraints);
      }
      throw err;
    }
  }

  function cleanup() {
    stopMeter();
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    if (sourceNode) {
      sourceNode.disconnect();
      sourceNode = null;
    }
    if (filterNode) {
      filterNode.disconnect();
      filterNode = null;
    }
    if (compressorNode) {
      compressorNode.disconnect();
      compressorNode = null;
    }
    if (gainNode) {
      gainNode.disconnect();
      gainNode = null;
    }
    if (analyserNode) {
      analyserNode.disconnect();
      analyserNode = null;
    }
    if (audioCtx && audioCtx.state !== 'closed') {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
  }

  async function enable() {
    if (enabled) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      O.toast('Microphone access is not supported in this browser.');
      return;
    }

    try {
      stream = await openStream();
      createAudioPipeline(stream);
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      enabled = true;
      stream.getAudioTracks()[0].addEventListener('ended', () => disable());
      emit();
      O.toast('Voice lifter enabled. Caution: keep microphone away from speakers to prevent feedback.');
    } catch (err) {
      cleanup();
      O.toast('Microphone failed: ' + (err.message || err.name));
      disable();
    }
  }

  function disable() {
    enabled = false;
    cleanup();
    emit();
  }

  function setGain(val) {
    st.gain = O.clamp(parseFloat(val) || 0, 0, 3.0);
    applyGain();
    save();
    emit();
  }

  function setMuted(muted) {
    st.muted = !!muted;
    applyGain();
    save();
    emit();
  }

  function toggleMute() {
    setMuted(!st.muted);
  }

  async function devices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return { inputs: [], outputs: [] };
    const list = await navigator.mediaDevices.enumerateDevices();
    const inputs = list
      .filter((d) => d.kind === 'audioinput')
      .map((d, i) => ({ id: d.deviceId, label: d.label || `Microphone ${i + 1}` }));
    const outputs = list
      .filter((d) => d.kind === 'audiooutput')
      .map((d, i) => ({ id: d.deviceId, label: d.label || `Speaker / Output ${i + 1}` }));
    return { inputs, outputs };
  }

  async function setDevice(id) {
    st.deviceId = id || '';
    save();
    if (enabled) {
      cleanup();
      await enable();
    }
    emit();
  }

  async function setSinkId(id) {
    st.sinkId = id || '';
    save();
    if (audioCtx && typeof audioCtx.setSinkId === 'function') {
      try {
        await audioCtx.setSinkId(st.sinkId);
      } catch (e) {
        console.warn('Failed setting audio output sink:', e);
      }
    }
    emit();
  }

  function state() {
    return {
      enabled,
      gain: st.gain,
      muted: st.muted,
      level: currentLevel,
      deviceId: st.deviceId,
      sinkId: st.sinkId,
      sinkSupported: typeof AudioContext !== 'undefined' && typeof AudioContext.prototype.setSinkId === 'function'
    };
  }

  function emit() {
    O.emit('voice:change', state());
  }

  return {
    enable,
    disable,
    toggle: () => (enabled ? disable() : enable()),
    isEnabled: () => enabled,
    setGain,
    setMuted,
    toggleMute,
    devices,
    setDevice,
    setSinkId,
    state
  };
});
