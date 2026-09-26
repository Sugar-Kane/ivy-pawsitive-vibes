#!/usr/bin/env bash
# Rebuild THE BEGINNING end to end: narration -> score/mix -> frames -> MP4.
# Needs: python3 (numpy scipy piper-tts imageio-ffmpeg), node + playwright/chromium,
# and a Piper voice model, e.g. en_US-ryan-high.onnx from rhasspy/piper-voices.
set -euo pipefail
cd "$(dirname "$0")"
VOICE=${VOICE:?set VOICE=/path/to/en_US-ryan-high.onnx}
FFMPEG=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
python3 tools/narration.py --voice "$VOICE"
python3 tools/soundtrack.py
node tools/render.mjs
LOUD="loudnorm=I=-16:TP=-1.5:LRA=14"
"$FFMPEG" -y -loglevel error -i build/soundtrack.wav -filter:a "$LOUD" -ar 48000 -c:a aac -b:a 192k assets/soundtrack.m4a
"$FFMPEG" -y -loglevel error -i build/picture.mp4 -i build/soundtrack.wav -filter:a "$LOUD" -ar 48000 \
  -c:v copy -c:a aac -b:a 256k -movflags +faststart the-beginning.mp4
echo "wrote the-beginning.mp4"
