# THE BEGINNING — a story of Greek mythology

A 2.39:1, 24 fps animated short (~63 s of picture, with thunder ringing on under black to 65 s) running from primordial Chaos to the awakening of Zeus.

**Watch:** `the-beginning.mp4` (1920×804, H.264 + AAC stereo), or open `index.html` through any static server for the real-time version, which renders live in the browser.

Everything is procedural. No stock footage, samples or image-generation models are used.

| Layer | How it is made |
|---|---|
| Picture | `film.js`: a Canvas 2D renderer. Each frame is a pure function of time, so the live player and the offline capture draw identical frames. |
| Narration | `tools/narration.py`: Piper TTS (`en_US-ryan-high`), pitched down about 3 semitones with rubberband (formants preserved), EQ'd and warmed, with synthesized breaths. Phrases are packed with sentence and scene pauses. The prophecy whispers are the same voice with its phase randomized. |
| Score & sound | `tools/soundtrack.py`: additive strings, formant-synthesized male choir, Karplus-Strong lyre, frame drums, bronze and metallic hits, a sub drone, wind, water, heartbeat, rain, torch crackle and thunder, all synthesized in numpy and cut to the picture. Music ducks under the voice and stays at least 11 dB below it in the speech band. |
| Render | `tools/render.mjs`: headless Chromium → ffmpeg. `--stills 3,16.5` dumps review frames. `tools/contact.py` tiles them into a contact sheet. |

Rebuild everything with `VOICE=/path/to/en_US-ryan-high.onnx ./build.sh`.

## Cue sheet

| Time | Scene | Palette |
|---|---|---|
| 0:00 | Chaos: black, primordial dust, clouds churn on "Chaos" | obsidian, midnight, violet |
| 0:07 | The void: passing through cloud, slow roll, golden sparks | indigo |
| 0:14 | Gaia: land forms around a seed of light. Her reclining profile *is* the mountain range, and her eye opens as the first sun rises. | ochre, olive, limestone, gold |
| 0:19.7 | Uranus: tilt up, the sky unfolds, stars ignite, a figure of stars and blue air arches across the heavens | Aegean blue |
| 0:24.7 | The first children: a black-figure pottery frieze becomes a real, blood-red world. Then a Titan above the clouds, the Cyclops' eye, and the Hundred-Handed One in smoke. | terracotta, bronze, crimson |
| 0:31.3 | Imprisonment: Uranus looks down in fear, carved slabs slam shut over the abyss, and Gaia's stone face cracks from sorrow into anger | stone, ember red |
| 0:36.4 | Cronus: the bronze sickle, the hand closing on it, the reveal with Gaia behind, then flash cuts as the stars scatter | bronze, firelight |
| 0:43.4 | His reign: a temple relief. A younger shadow rises behind the throne, and the newborns vanish into his shadow. | crimson |
| 0:51.8 | Hard cut to silence: a cave on Crete, rain and torchlight, the child laid in a stone cradle | torch amber, storm blue |
| 0:56.3 | Zeus: the eye opens with lightning in the pupil. Strike, then his future silhouette, the rise through the storm, and Olympus above the clouds. | white, lightning blue, gold |
| 1:03.4 | Cut to black; thunder rolls on | |

## Honest limits

This is stylized 2D procedural animation (silhouettes, relief and painterly light), not photoreal CGI. The narrator is a neural TTS voice, not a human actor. The brief's full narration runs about 62 s at a deliberate pace, so the film is ~63 s rather than exactly 60.
