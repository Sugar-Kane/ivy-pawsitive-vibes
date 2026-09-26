"""Narration for THE BEGINNING.

Synthesizes each phrase with Piper TTS, deepens it into a baritone with
rubberband (formants preserved), adds soft breaths and places every phrase at
its cue time on a 48 kHz stereo stem.

    python3 tools/narration.py --voice path/to/en_US-ryan-high.onnx

Writes build/narration.wav and build/narration_cues.json.
"""
import argparse
import json
import os
import subprocess
import tempfile
import wave

import numpy as np
from scipy.signal import butter, sosfilt, resample_poly

from common import FFMPEG, SR, BUILD, write_wav

# (pause before phrase in seconds, text, speed). Phrases are packed back to
# back; the pause is measured from the end of the previous phrase. The
# resulting cue times (build/narration_cues.json) are what film.js is cut to.
CUES = [
    (0.70, "Before Olympus.", 1.00),
    (0.40, "Before Zeus.", 1.00),
    (0.40, "Before even the sky and the sea...", 1.00),
    (0.30, "there was Chaos.", 0.95),
    (0.55, "Not chaos as we know it,", 1.02),
    (0.18, "but a vast, silent emptiness.", 1.00),
    (0.40, "A darkness without shape, boundary, or time.", 1.00),
    (0.60, "And from that endless void emerged Gaia, the Earth.", 1.02),
    (0.35, "Ancient, powerful, and alive.", 0.98),
    (0.55, "From Gaia came Uranus, the star-filled Sky,", 1.02),
    (0.15, "stretching himself across the heavens.", 1.00),
    (0.50, "Together, Earth and Sky gave birth to mighty beings:", 1.04),
    (0.22, "the Titans, the Cyclopes, and the Hundred-Handed Ones.", 1.04),
    (0.50, "But Uranus feared the power of his own children,", 1.04),
    (0.12, "and imprisoned them deep within the Earth.", 1.02),
    (0.85, "Gaia turned to her Titan son, Cronus.", 1.00),
    (0.60, "Cronus overthrew his father, and seized control of creation.", 1.05),
    (0.65, "But power brought fear.", 0.98),
    (0.25, "A prophecy warned Cronus that one of his own children would overthrow him.", 1.08),
    (0.45, "So Cronus swallowed each child at birth.", 1.03),
    (1.00, "Until one escaped.", 0.92),
    (0.55, "Hidden away by his mother...", 0.95),
    (0.85, "a child named Zeus opened his eyes.", 0.97),
    (0.60, "And soon...", 0.92),
    (0.30, "the age of the Olympian gods would begin.", 0.98),
]

# Phrases after which the narrator takes an audible breath.
BREATH_BEFORE = {0, 4, 7, 9, 11, 13, 15, 17, 18, 20, 22, 23}

# Whispered prophecy fragments (rendered as unvoiced speech, panned around).
WHISPERS = [
    (45.35, "one of your children", -0.8),
    (46.30, "will overthrow you", 0.7),
    (47.10, "your son", -0.35),
    (47.85, "overthrow", 0.9),
    (48.75, "a child", -0.9),
    (49.70, "one of your own", 0.45),
    (50.60, "your son", 0.1),
]


def piper(voice, text, length_scale, out):
    subprocess.run(
        ["python3", "-m", "piper", "-m", voice, "-f", out,
         "--length-scale", str(length_scale), "--noise-scale", "0.62",
         "--noise-w-scale", "0.75"],
        input=text.encode(), check=True, capture_output=True)


def read_wav(path):
    with wave.open(path) as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)
    return x.astype(np.float32) / 32768.0, sr


def deepen(src, dst, speed):
    # Lower pitch ~3 semitones, keep formants so it stays human, then retime.
    subprocess.run(
        [FFMPEG, "-y", "-loglevel", "error", "-i", src, "-af",
         f"aresample=48000,rubberband=pitch=0.84:tempo={speed}:formant=preserved:pitchq=quality,"
         "equalizer=f=110:t=q:w=1.1:g=4,equalizer=f=3200:t=q:w=1.5:g=-2.5,"
         "highpass=f=55,lowpass=f=9500", "-ac", "1", "-ar", str(SR), dst],
        check=True)


def trim(x, thresh=0.012):
    idx = np.where(np.abs(x) > thresh)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(0.03 * SR))
    b = min(len(x), idx[-1] + int(0.12 * SR))
    return x[a:b]


def breath(rng, dur=0.42):
    n = int(dur * SR)
    noise = rng.standard_normal(n).astype(np.float32)
    sos = butter(2, [700, 3800], btype="band", fs=SR, output="sos")
    b = sosfilt(sos, noise)
    t = np.linspace(0, 1, n)
    env = np.sin(np.pi * t) ** 1.6 * (0.6 + 0.4 * np.sin(np.pi * t * 0.5))
    return b * env * 0.018


def whisper(x):
    """Replace phase with noise so voiced speech becomes a breathy whisper."""
    n_fft, hop = 1024, 256
    win = np.hanning(n_fft).astype(np.float32)
    pad = np.concatenate([np.zeros(n_fft), x, np.zeros(n_fft)])
    frames = range(0, len(pad) - n_fft, hop)
    out = np.zeros(len(pad), dtype=np.float32)
    rng = np.random.default_rng(7)
    for i in frames:
        mag = np.abs(np.fft.rfft(pad[i:i + n_fft] * win))
        ph = rng.uniform(-np.pi, np.pi, len(mag))
        out[i:i + n_fft] += np.fft.irfft(mag * np.exp(1j * ph)).astype(np.float32) * win
    out = out[n_fft:n_fft + len(x)]
    sos = butter(2, 900, btype="high", fs=SR, output="sos")
    out = sosfilt(sos, out)
    return out / (np.max(np.abs(out)) + 1e-9) * 0.5


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", required=True)
    ap.add_argument("--length-scale", type=float, default=0.99)
    args = ap.parse_args()

    total = 66.0
    L = np.zeros(int(total * SR), dtype=np.float32)
    R = np.zeros_like(L)
    W = np.zeros((2, len(L)), dtype=np.float32)
    rng = np.random.default_rng(3)
    cues_out = []
    prev_end = 0.0
    with tempfile.TemporaryDirectory() as tmp:
        for i, (pause, text, speed) in enumerate(CUES):
            raw, deep = os.path.join(tmp, "raw.wav"), os.path.join(tmp, "deep.wav")
            piper(args.voice, text, args.length_scale, raw)
            deepen(raw, deep, speed)
            x, _ = read_wav(deep)
            x = trim(x)
            # Gentle saturation for warmth, then level.
            x = np.tanh(x * 1.6) / np.tanh(1.6)
            x = x / (np.max(np.abs(x)) + 1e-9) * 0.62
            t0 = prev_end + pause
            if i in BREATH_BEFORE and pause >= 0.4:
                b = breath(rng, min(0.42, pause - 0.05))
                s = int((t0 - len(b) / SR - 0.03) * SR)
                L[s:s + len(b)] += b
                R[s:s + len(b)] += b * 0.92
            s = int(t0 * SR)
            L[s:s + len(x)] += x
            R[s:s + len(x)] += x
            end = t0 + len(x) / SR
            print(f"{i + 1:2d} {t0:6.2f} -> {end:6.2f}  ({len(x) / SR:4.2f}s) {text}")
            cues_out.append({"start": round(t0, 3), "end": round(end, 3), "text": text})
            prev_end = end

        for t0, text, pan in WHISPERS:
            raw = os.path.join(tmp, "w.wav")
            piper(args.voice, text, 1.25, raw)
            x, sr = read_wav(raw)
            x = resample_poly(x, SR, sr).astype(np.float32)
            x = whisper(trim(x, 0.02)) * 0.16
            s = int(t0 * SR)
            gl, gr = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
            W[0, s:s + len(x)] += x * gl
            W[1, s:s + len(x)] += x * gr

    os.makedirs(BUILD, exist_ok=True)
    write_wav(os.path.join(BUILD, "narration.wav"), np.stack([L, R]))
    write_wav(os.path.join(BUILD, "whispers.wav"), W)
    with open(os.path.join(BUILD, "narration_cues.json"), "w") as f:
        json.dump(cues_out, f, indent=1)


if __name__ == "__main__":
    main()
