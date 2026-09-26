import os
import wave

import numpy as np

try:
    import imageio_ffmpeg
    FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
except ImportError:  # fall back to a system ffmpeg (needs librubberband)
    FFMPEG = "ffmpeg"

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "build")


def write_wav(path, stereo):
    """Write a (2, n) float array as 16-bit PCM."""
    x = np.clip(stereo, -1, 1)
    pcm = (x.T * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def read_stereo(path):
    with wave.open(path) as w:
        n = w.getnframes()
        x = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32) / 32768.0
        ch = w.getnchannels()
    return x.reshape(-1, ch).T
