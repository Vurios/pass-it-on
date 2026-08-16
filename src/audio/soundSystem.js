import { Howl, Howler } from 'howler'

export const SOUND_CUES = Object.freeze({
  LOCK: 'lock',
  TICK: 'tick',
  URGENT_TICK: 'urgent_tick',
  CORRECT: 'correct',
  INCORRECT: 'incorrect',
  STREAK: 'streak',
  REVEAL: 'reveal',
  SCOREBOARD: 'scoreboard',
  BLIP: 'blip',
})

const SAMPLE_RATE = 16_000
const sounds = new Map()

function writeText(view, offset, value) {
  for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index))
}

function wavDataUri(duration, sampleAt) {
  const sampleCount = Math.floor(SAMPLE_RATE * duration)
  const buffer = new ArrayBuffer(44 + sampleCount * 2)
  const view = new DataView(buffer)
  writeText(view, 0, 'RIFF'); view.setUint32(4, 36 + sampleCount * 2, true); writeText(view, 8, 'WAVE')
  writeText(view, 12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true)
  view.setUint32(24, SAMPLE_RATE, true); view.setUint32(28, SAMPLE_RATE * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true)
  writeText(view, 36, 'data'); view.setUint32(40, sampleCount * 2, true)
  for (let index = 0; index < sampleCount; index += 1) {
    const sample = Math.max(-1, Math.min(1, sampleAt(index / SAMPLE_RATE, index)))
    view.setInt16(44 + index * 2, sample * 0x7fff, true)
  }
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return `data:audio/wav;base64,${btoa(binary)}`
}

function tone(frequency, time, decay = 7) {
  return Math.sin(2 * Math.PI * frequency * time) * Math.exp(-decay * time)
}

function noteSequence(time, notes, noteLength) {
  const noteIndex = Math.min(notes.length - 1, Math.floor(time / noteLength))
  const localTime = time - noteIndex * noteLength
  return tone(notes[noteIndex], localTime, 8)
}

function seededNoise(index) {
  const value = Math.sin(index * 12.9898 + 78.233) * 43758.5453
  return (value - Math.floor(value)) * 2 - 1
}

const definitions = {
  [SOUND_CUES.LOCK]: [0.08, (time, index) => tone(430, time, 48) * 0.2 + seededNoise(index) * Math.exp(-70 * time) * 0.04, 0.34],
  [SOUND_CUES.TICK]: [0.075, (time) => (tone(660, time, 54) + tone(990, time, 60) * 0.25) * 0.18, 0.28],
  [SOUND_CUES.URGENT_TICK]: [0.08, (time) => (tone(880, time, 40) + tone(1320, time, 45) * 0.35) * 0.25, 0.35],
  [SOUND_CUES.CORRECT]: [0.62, (time) => noteSequence(time, [440, 554, 659, 880], 0.145) * 0.2, 0.42],
  [SOUND_CUES.INCORRECT]: [0.34, (time, index) => tone(135, time, 11) * 0.22 + seededNoise(index) * Math.exp(-18 * time) * 0.025, 0.3],
  [SOUND_CUES.STREAK]: [0.45, (time) => noteSequence(time, [587, 880, 1174], 0.12) * 0.22, 0.4],
  [SOUND_CUES.REVEAL]: [0.82, (time, index) => {
    const beat = time % 0.105
    return (tone(120, beat, 34) * 0.12 + seededNoise(index) * Math.exp(-42 * beat) * 0.055) * (0.55 + time * 0.55)
  }, 0.34],
  [SOUND_CUES.SCOREBOARD]: [1.05, (time) => noteSequence(time, [392, 523, 659, 784, 1047], 0.2) * 0.19, 0.45],
  [SOUND_CUES.BLIP]: [0.18, (time) => (tone(470, time, 14) + tone(705, time, 18) * 0.45) * 0.16, 0.3],
}

function getSound(cue) {
  if (sounds.has(cue)) return sounds.get(cue)
  const definition = definitions[cue]
  if (!definition) return null
  const [duration, sampleAt, volume] = definition
  const sound = new Howl({ src: [wavDataUri(duration, sampleAt)], format: ['wav'], volume })
  sounds.set(cue, sound)
  return sound
}

export function setSoundMuted(muted) {
  Howler.mute(Boolean(muted))
}

export function playSound(cue) {
  getSound(cue)?.play()
}
