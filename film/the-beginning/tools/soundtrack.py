"""Score + sound design for THE BEGINNING, synthesized from scratch.

Every cue below is timed to the picture in film.js (scene starts are listed
in SCENE). Mixes in build/narration.wav and build/whispers.wav from
narration.py and writes build/soundtrack.wav.

    python3 tools/soundtrack.py
"""
import os

import numpy as np
from scipy.signal import butter, sosfilt, lfilter, fftconvolve

from common import SR, BUILD, write_wav, read_stereo

DUR = 65.0
N = int(DUR * SR)
rng = np.random.default_rng(2024)

# Picture sync points (seconds) — keep in step with SCENES in film.js.
SCENE = dict(chaos=0.0, chaos_word=5.9, gaia=14.1, sunrise=17.0, uranus=19.7, titans=24.7,
             titan_cut=28.1, cyclops=29.2, hundred=30.1, imprison=31.3, walls=33.2, slam=34.45,
             cronus=36.4, hand_close=37.1, reveal=38.3, raise_=39.9, sky=40.75, flash=41.55,
             reign=43.4, newborns=48.5, hidden=51.8, cradle=54.3, lightning_far=55.6,
             zeus=56.3, eyes=57.5, reflect=58.25, strike=58.75, breach=60.6, final_bolt=62.3,
             cut=63.4)


# ----------------------------------------------------------------- helpers
def new():
    return np.zeros((2, N), dtype=np.float64)


def idx(t):
    return int(np.clip(t, 0, DUR) * SR)


def place(bus, t, sig, gain=1.0, pan=0.0):
    """Add mono or stereo `sig` into `bus` at time t with constant-power pan."""
    s = idx(t)
    if sig.ndim == 1:
        gl, gr = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
        sig = np.stack([sig * gl, sig * gr]) * np.sqrt(2)
    n = min(sig.shape[1], N - s)
    if n > 0:
        bus[:, s:s + n] += sig[:, :n] * gain


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def env_points(dur, pts):
    """Piecewise-linear envelope from [(time, level), ...]."""
    t = tt(dur)
    xs, ys = zip(*pts)
    return np.interp(t, xs, ys)


def global_env(pts):
    t = np.arange(N) / SR
    xs, ys = zip(*pts)
    return np.interp(t, xs, ys)


def filt(x, kind, f, order=2):
    sos = butter(order, f, btype=kind, fs=SR, output='sos')
    return sosfilt(sos, x, axis=-1)


def noise(dur, color='white', seed=None):
    r = np.random.default_rng(seed) if seed is not None else rng
    x = r.standard_normal(int(dur * SR))
    if color == 'brown':
        x = np.cumsum(x)
        x = filt(x, 'high', 15)
        x /= np.max(np.abs(x)) + 1e-9
    elif color == 'pink':
        x = lfilter([0.049922035, -0.095993537, 0.050612699, -0.004408786], [1, -2.494956002, 2.017265875, -0.522189400], x)
        x /= np.max(np.abs(x)) + 1e-9
    return x


def sweep(x, f0, f1, kind='band', q=1.5, block=512):
    """Time-varying filter by block-wise coefficient changes (log sweep)."""
    out = np.zeros_like(x)
    n_blocks = int(np.ceil(len(x) / block))
    zi = None
    for b in range(n_blocks):
        k = b / max(1, n_blocks - 1)
        f = f0 * (f1 / f0) ** k
        if kind == 'band':
            sos = butter(1, [f / (1 + 0.5 / q), f * (1 + 0.5 / q)], btype='band', fs=SR, output='sos')
        else:
            sos = butter(2, f, btype=kind, fs=SR, output='sos')
        if zi is None or zi.shape[0] != sos.shape[0]:
            zi = np.zeros((sos.shape[0], 2))
        seg = x[b * block:(b + 1) * block]
        y, zi = sosfilt(sos, seg, zi=zi)
        out[b * block:b * block + len(y)] = y
    return out


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


NOTE = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6,
        'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}


def hz(name):
    p, o = name[:-1], int(name[-1])
    return midi(12 * (o + 1) + NOTE[p])


def reverb_ir(seconds, decay, seed, lp=6000, pre=0.02):
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = r.standard_normal((2, n)) * np.exp(-t / decay)
    ir = filt(ir, 'low', lp)
    # Darken the tail progressively.
    tail = filt(ir, 'low', 1800)
    mixk = np.clip(t / seconds, 0, 1)
    ir = ir * (1 - mixk) + tail * mixk
    ir[:, :int(pre * SR)] = 0
    return ir / np.sqrt(np.sum(ir ** 2) / 2)


def reverb(bus, ir, wet):
    out = np.stack([fftconvolve(bus[0], ir[0])[:N], fftconvolve(bus[1], ir[1])[:N]])
    return out * wet


# ------------------------------------------------------------- instruments
def strings(freqs, dur, attack=1.5, release=2.0, bright=1.0, voices=5, trem=0.0, level=1.0):
    """Ensemble strings: detuned additive saws with vibrato."""
    t = tt(dur)
    out = np.zeros((2, len(t)))
    for f in freqs:
        for v in range(voices):
            det = f * (1 + (rng.random() - 0.5) * 0.012)
            vib = 1 + 0.0035 * np.sin(2 * np.pi * (4.6 + rng.random()) * t + rng.random() * 6) * np.clip(t / 1.5, 0, 1)
            phase = 2 * np.pi * np.cumsum(det * vib) / SR
            sig = np.zeros_like(t)
            nh = int(min(24, 9000 / det))
            for h in range(1, nh + 1):
                sig += np.sin(h * phase + rng.random() * 6) / h * np.exp(-h * 0.11 / bright)
            pan = (v / max(1, voices - 1) - 0.5) * 1.2
            out[0] += sig * np.sqrt((1 - pan) / 2)
            out[1] += sig * np.sqrt((1 + pan) / 2)
    e = np.minimum(np.clip(t / attack, 0, 1), np.clip((dur - t) / release, 0, 1))
    if trem:
        e = e * (0.65 + 0.35 * np.sign(np.sin(2 * np.pi * trem * t)) * 0.5 + 0.175)
    out = filt(out * e, 'low', 2400 * bright)
    return out / (len(freqs) * voices) * level * 1.6


def choir(freqs, dur, vowel='ah', attack=1.2, release=1.8, voices=6, level=1.0):
    """Male choir: glottal harmonic series shaped by vowel formants."""
    F = {'ah': [(700, 110, 1.0), (1100, 120, 0.5), (2500, 170, 0.18)],
         'oh': [(450, 90, 1.0), (800, 100, 0.45), (2830, 170, 0.08)],
         'oo': [(325, 80, 1.0), (700, 90, 0.25), (2530, 170, 0.05)]}[vowel]
    t = tt(dur)
    out = np.zeros((2, len(t)))
    for f in freqs:
        for v in range(voices):
            det = f * (1 + (rng.random() - 0.5) * 0.02)
            vib = 1 + 0.006 * np.sin(2 * np.pi * (5.0 + rng.random() * 0.8) * t + rng.random() * 6)
            drift = 1 + 0.003 * np.sin(2 * np.pi * 0.2 * t + rng.random() * 6)
            phase = 2 * np.pi * np.cumsum(det * vib * drift) / SR
            sig = np.zeros_like(t)
            for h in range(1, int(4000 / det)):
                fh = h * det
                a = sum(g * np.exp(-((fh - fc) / bw) ** 2 / 2) for fc, bw, g in F) + 0.02
                sig += np.sin(h * phase) * a / h ** 0.6
            # Breath in the voice.
            sig += filt(rng.standard_normal(len(t)), 'band', [F[0][0], F[1][0] + 600]) * 0.04
            pan = (v / max(1, voices - 1) - 0.5) * 1.4
            out[0] += sig * np.sqrt((1 - pan) / 2)
            out[1] += sig * np.sqrt((1 + pan) / 2)
    e = np.minimum(np.clip(t / attack, 0, 1), np.clip((dur - t) / release, 0, 1)) ** 1.5
    return out * e / (len(freqs) * voices) * level * 0.5


def lyre(f, dur=3.0, bright=0.5):
    """Plucked gut string (Karplus-Strong) with a wooden body resonance."""
    n = int(dur * SR)
    L = int(SR / f)
    exc = np.zeros(n)
    burst = rng.standard_normal(L) * np.hanning(L)
    exc[:L] = filt(burst, 'low', 1500 + 4000 * bright)
    g = 0.996
    a = np.zeros(L + 2)
    a[0] = 1
    a[L] = -g / 2
    a[L + 1] = -g / 2
    y = lfilter([1], a, exc)
    y = y + 0.35 * filt(y, 'band', [180, 420])
    y *= np.exp(-np.arange(n) / SR / 1.4)
    return y / (np.max(np.abs(y)) + 1e-9)


def frame_drum(pitch=70, dur=1.6, slap=0.4, seed=None):
    t = tt(dur)
    f = pitch * (1 + 0.8 * np.exp(-t * 30))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.0)
    head = np.sin(2 * np.pi * np.cumsum(f * 1.59) / SR) * np.exp(-t * 9) * 0.35
    r = np.random.default_rng(seed)
    sl = filt(r.standard_normal(len(t)), 'band', [300, 2800]) * np.exp(-t * 45) * slap
    return (body + head + sl) * 0.9


def boom(dur=5.0, f0=48, f1=26, level=1.0):
    """Enormous cinematic low impact."""
    t = tt(dur)
    f = f1 + (f0 - f1) * np.exp(-t * 2.2)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 0.9)
    thump = filt(noise(dur, 'brown'), 'low', 180) * np.exp(-t * 2.5) * 1.4
    crack = filt(noise(dur), 'band', [200, 3000]) * np.exp(-t * 18) * 0.5
    x = sub + thump + crack
    return np.tanh(x * 1.5) * level


def orch_hit(freqs, dur=3.5, level=1.0):
    """Brass + low strings stab."""
    t = tt(dur)
    x = np.zeros_like(t)
    for f in freqs:
        for d in (-0.004, 0, 0.005):
            ph = 2 * np.pi * np.cumsum(np.full_like(t, f * (1 + d))) / SR
            for h in range(1, 18):
                x += np.sin(h * ph) / h ** 1.1 * np.exp(-h * 0.12)
    e = np.clip(t / 0.015, 0, 1) * (0.35 + 0.65 * np.exp(-t * 2.2)) * np.clip((dur - t) / 1.0, 0, 1)
    x = filt(x * e, 'low', 2600)
    return x / (len(freqs) * 3) * level


def metal_clang(f0=82, dur=4.0, level=1.0):
    t = tt(dur)
    x = np.zeros_like(t)
    for r, a, dcy in [(1, 1, 1.2), (2.76, 0.6, 1.6), (5.4, 0.45, 2.3), (8.93, 0.3, 3.2), (13.34, 0.2, 4.5), (1.5, 0.4, 1.0)]:
        x += a * np.sin(2 * np.pi * f0 * r * t + rng.random() * 6) * np.exp(-t * dcy)
    x += filt(noise(dur), 'band', [800, 5000]) * np.exp(-t * 30) * 0.6
    return x * level * 0.5


def thunder(dur=6.0, crack=1.0, dist=0.0, seed=None):
    """Crack + rolling rumble. dist 0 (overhead) .. 1 (far)."""
    r = np.random.default_rng(seed)
    t = tt(dur)
    rum = filt(noise(dur, 'brown', seed), 'low', lerp(420, 160, dist))
    # Rolling: a chain of random swells.
    envr = np.zeros_like(t)
    tc = 0.0
    while tc < dur:
        amp = r.uniform(0.4, 1.0) * np.exp(-tc / (dur * 0.45))
        w = r.uniform(0.25, 0.9)
        envr += amp * np.exp(-((t - tc - w) / w) ** 2)
        tc += r.uniform(0.2, 0.7)
    envr *= np.clip(t / lerp(0.05, 0.6, dist), 0, 1)
    x = rum * envr * 1.4
    if crack > 0:
        c = filt(r.standard_normal(len(t)), 'high', 900) * np.exp(-t * 7) * crack * (1 - dist)
        c += filt(r.standard_normal(len(t)), 'band', [150, 1400]) * np.exp(-t * 3) * crack * (1 - dist) * 0.8
        x += c
    st = np.stack([x, np.roll(x, int(0.013 * SR)) * 0.9])
    return st


def lerp(a, b, k):
    return a + (b - a) * k


def ping(f, dur=2.2):
    t = tt(dur)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.4) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 5)
    return x * np.clip(t / 0.003, 0, 1)


def heartbeat(dur):
    t = tt(dur)
    x = np.zeros_like(t)
    return x


# ================================================================ SCORE
music, sfx = new(), new()

# ---- Chaos: sub-bass drone that grows as the universe grows.
drone_t = tt(DUR)
drone_env = global_env([(0, 0), (0.8, 0), (5.5, 0.35), (7, 0.55), (14, 0.7), (24, 0.8), (31, 0.9),
                        (43, 1.0), (51.79, 1.1), (51.8, 0), (DUR, 0)])
drone = (np.sin(2 * np.pi * hz('D1') * drone_t + 0.3 * np.sin(2 * np.pi * 0.07 * drone_t))
         + 0.5 * np.sin(2 * np.pi * hz('A1') * drone_t * 1.0015)
         + 0.25 * np.sin(2 * np.pi * hz('D2') * drone_t * 0.999))
drone *= (0.8 + 0.2 * np.sin(2 * np.pi * 0.11 * drone_t)) * drone_env
music += np.stack([drone, drone]) * 0.32

# Near-inaudible rumble under the first black frames.
rum = filt(noise(DUR, 'brown', 5), 'low', 70) * global_env([(0, 0), (0.3, 0.25), (6, 0.5), (14, 0.35), (15, 0.2), (51.7, 0.2), (51.8, 0), (DUR, 0)])
sfx += np.stack([rum, np.roll(rum, 400)]) * 0.5

# Wind across the void (distant, enormous, stereo).
wl = filt(noise(DUR, 'pink', 6), 'band', [180, 900])
wr = filt(noise(DUR, 'pink', 7), 'band', [180, 900])
wlfo = 0.6 + 0.4 * np.sin(2 * np.pi * 0.09 * drone_t) * np.sin(2 * np.pi * 0.031 * drone_t + 1)
wenv = global_env([(0, 0), (2, 0.06), (7, 0.16), (13, 0.22), (14.5, 0.08), (19.7, 0.1), (21, 0.3), (24.5, 0.22),
                   (25, 0.05), (31, 0.05), (51.8, 0.05), (51.81, 0), (DUR, 0)])
sfx += np.stack([wl, wr]) * wlfo * wenv

# "Chaos": the dark clouds begin to churn.
sw = sweep(noise(6.0, 'pink', 8), 90, 700, 'band', q=1.2) * env_points(6, [(0, 0), (1.5, 0.6), (3, 0.8), (6, 0)])
place(sfx, SCENE['chaos_word'] - 0.2, np.stack([sw, np.roll(sw, 700)]), 0.8)

# Faint golden particles in the void.
for k in range(14):
    tp = 7.4 + rng.random() * 6.2
    place(sfx, tp, ping(hz('A6') * [1, 1.5, 2, 1.335][k % 4], 1.6), 0.015 + rng.random() * 0.01, rng.uniform(-0.9, 0.9))

# ---- Gaia: first light, stone, soil, water, a heartbeat.
rise = sweep(noise(2.2, 'pink', 9), 200, 1400, 'band', q=2) * env_points(2.2, [(0, 0), (1.8, 0.5), (2.2, 0)])
place(sfx, 12.8, rise, 0.35)
grind = filt(noise(4.0, 'brown', 10), 'low', 380) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 7 * tt(4.0)) * rng.random(len(tt(4.0))) ** 0.3))
grind *= env_points(4.0, [(0, 0), (0.6, 1), (3, 0.7), (4, 0)])
place(sfx, SCENE['gaia'] + 0.3, np.stack([grind, filt(grind, 'low', 250)]), 0.55)
# Water: bubbling stream.
for k in range(130):
    tp = SCENE['gaia'] + 1.6 + rng.random() * 4.2
    d = 0.02 + rng.random() * 0.03
    f = 500 + rng.random() * 900
    t = tt(d)
    b = np.sin(2 * np.pi * np.cumsum(f * (1 + t * 25)) / SR) * np.exp(-t * 90) * np.hanning(len(t)) ** 0.3
    place(sfx, tp, b, 0.03, 0.5 + rng.uniform(-0.3, 0.3))
brook = filt(noise(5.6, 'white', 11), 'band', [1200, 5000]) * env_points(5.6, [(0, 0), (1.5, 0.05), (5.6, 0.04)])
place(sfx, SCENE['gaia'] + 1.2, np.stack([brook, np.roll(brook, 300)]), 0.8)
# Heartbeat of the Earth.
for k in range(7):
    tp = SCENE['gaia'] + 0.4 + k * 1.02
    for j, (dt, a) in enumerate([(0, 1.0), (0.26, 0.7)]):
        place(sfx, tp + dt, frame_drum(38, 0.6, 0.0, seed=k * 2 + j), 0.22 * a * min(1, (k + 1) / 3))
# Warm low strings as the sun breaks.
place(music, SCENE['gaia'] + 0.8, strings([hz('D2'), hz('A2'), hz('D3'), hz('F3')], 6.0, attack=2.5, release=1.5, bright=0.6), 0.5)
# Lyre: an ancient phrase in D dorian as the eye opens.
lyre_phrase = [('D4', 0), ('A4', 0.42), ('F4', 0.84), ('E4', 1.26), ('D4', 1.68), ('A3', 2.3), ('C4', 2.72), ('D4', 3.2)]
for n, dt in lyre_phrase:
    place(music, SCENE['sunrise'] + 0.2 + dt, lyre(hz(n), 3.0, 0.5), 0.1, -0.35)

# ---- Uranus: the sky unfolds; stars ignite as crystal.
place(music, SCENE['uranus'], strings([hz('Bb1'), hz('F2'), hz('D3'), hz('A3')], 5.6, attack=1.5, release=1.6, bright=0.8), 0.5)
place(music, SCENE['uranus'] + 1.5, choir([hz('D3'), hz('A3')], 4.2, 'oo', attack=1.5, voices=5), 0.5)
airy = sweep(noise(5.0, 'pink', 12), 300, 3000, 'band', q=1) * env_points(5, [(0, 0), (2, 0.5), (5, 0.1)])
place(sfx, SCENE['uranus'] + 0.2, np.stack([airy, np.roll(airy, 900)]), 0.45)
penta = [hz(n) for n in ['D6', 'E6', 'A6', 'B6', 'D7', 'E7', 'A5']]
for k in range(90):
    # Density follows the ignition sweep.
    u = rng.random() ** 0.7
    tp = SCENE['uranus'] + 0.8 + u * 3.6
    place(sfx, tp, ping(penta[rng.integers(len(penta))], 2.0), 0.02 + 0.02 * rng.random(), rng.uniform(-1, 1))

# ---- Titans: ceremonial drums, distant chant, bronze.
bpm = 72.0
beat = 60 / bpm
pattern = [(0, 1.0, 60), (1, 0.55, 80), (1.5, 0.45, 85), (2, 0.9, 62), (3, 0.5, 80), (3.5, 0.6, 70)]
bar = 0
while True:
    t0 = SCENE['titans'] + 0.1 + bar * 4 * beat
    if t0 > SCENE['imprison'] - 0.2:
        break
    for b, a, p in pattern:
        tp = t0 + b * beat
        if tp < SCENE['imprison']:
            place(music, tp, frame_drum(p, 1.4, 0.5, seed=int(tp * 100)), 0.5 * a * min(1, 0.5 + bar * 0.25), rng.uniform(-0.3, 0.3))
    bar += 1
place(music, SCENE['titans'], strings([hz('D2'), hz('A2'), hz('D3')], 3.6, attack=1.0, release=0.8, bright=0.9), 0.55)
place(music, SCENE['titan_cut'] - 0.3, strings([hz('Eb2'), hz('Bb2'), hz('G3')], 3.4, attack=0.4, release=1.0, bright=1.0), 0.6)
place(music, SCENE['titans'] + 0.4, choir([hz('D2'), hz('A2')], 6.4, 'oh', attack=1.5, release=1.2, voices=6), 0.9)
for tc in (SCENE['titan_cut'], SCENE['hundred']):
    place(music, tc, boom(3.0, 60, 34), 0.5)
    place(music, tc, metal_clang(110, 2.5), 0.25)
# Cyclops eye: a vast groan of flesh.
gr = sweep(noise(1.2, 'brown', 13), 90, 260, 'low') * env_points(1.2, [(0, 0), (0.3, 1), (1.2, 0)])
place(sfx, SCENE['cyclops'] + 0.05, gr, 0.6)

# ---- Imprisonment: darkness, grinding stone, the slam.
place(music, SCENE['imprison'], strings([hz('D2'), hz('Eb3'), hz('A2'), hz('D3')], 5.2, attack=0.8, release=0.6, bright=0.7, trem=7), 0.55)
place(music, SCENE['imprison'] + 0.3, choir([hz('D2'), hz('Eb3')], 4.8, 'oo', attack=1.0, release=0.4, voices=5), 0.6)
scrape = filt(noise(1.3, 'brown', 14), 'low', 500) * env_points(1.3, [(0, 0), (0.3, 0.7), (1.25, 1), (1.3, 0)])
place(sfx, SCENE['walls'], np.stack([scrape, scrape]), 0.9)
place(sfx, SCENE['slam'], boom(5.0, 55, 28, 1.0), 1.0)
place(music, SCENE['slam'], frame_drum(45, 2.0, 1.0, seed=1), 0.8)
debris = filt(noise(2.5, 'white', 15), 'band', [300, 4000]) * env_points(2.5, [(0, 1), (0.2, 0.4), (2.5, 0)])
place(sfx, SCENE['slam'] + 0.05, np.stack([debris, np.roll(debris, 600)]), 0.25)
# Gaia's anger: cracking stone.
for k in range(16):
    tp = SCENE['slam'] + 0.5 + rng.random() * 1.6
    c = filt(noise(0.08, 'white'), 'band', [600, 4000]) * np.exp(-tt(0.08) * 60)
    place(sfx, tp, c, 0.12, rng.uniform(-0.8, 0.8))

# ---- Cronus: deep metallic impact on the cut, bronze scraping, choir.
place(sfx, SCENE['cronus'], metal_clang(55, 5.0, 1.0), 0.9)
place(sfx, SCENE['cronus'], boom(4.0, 50, 30), 0.7)
br = filt(noise(1.9, 'white', 16), 'band', [1800, 7000])
br = sum(filt(br, 'band', [f * 0.97, f * 1.03]) * a for f, a in [(1250, 1), (2900, 0.8), (4700, 0.6)])
br *= env_points(1.9, [(0, 0), (0.4, 0.3), (0.9, 1), (1.5, 0.4), (1.9, 0)]) * (0.6 + 0.4 * np.sin(2 * np.pi * 11 * tt(1.9)) ** 2)
place(sfx, SCENE['cronus'] + 0.1, br, 0.6, 0.2)
grip = filt(noise(0.5, 'brown', 17), 'band', [120, 900]) * env_points(0.5, [(0, 0), (0.1, 1), (0.5, 0)])
place(sfx, SCENE['hand_close'] + 0.6, grip, 0.4)
place(music, SCENE['reveal'] - 0.2, choir([hz('A1'), hz('E2'), hz('A2')], 5.0, 'oh', attack=0.8, release=0.6, voices=7), 1.0)
place(music, SCENE['reveal'], strings([hz('A1'), hz('E2'), hz('Bb2'), hz('E3')], 3.4, attack=0.6, release=0.4, bright=1.1, trem=9), 0.6)
for k, tp in enumerate(np.arange(SCENE['reveal'], SCENE['flash'], beat / 2)):
    place(music, tp, frame_drum(62 if k % 2 == 0 else 78, 1.0, 0.6, seed=300 + k), 0.35 + 0.35 * k / 10)
place(sfx, SCENE['raise_'] + 0.1, sweep(noise(0.8, 'pink', 18), 600, 4000, 'band', q=2) * env_points(0.8, [(0, 0), (0.7, 1), (0.8, 0)]), 0.35)
place(sfx, SCENE['sky'], thunder(1.2, 0, 0.6, seed=19) * 0.6)
# The overthrow: celestial flash.
place(sfx, SCENE['flash'], boom(6.0, 60, 25, 1.2), 1.0)
place(music, SCENE['flash'], orch_hit([hz('D2'), hz('A2'), hz('D3'), hz('Eb3')], 2.4), 0.8)
place(sfx, SCENE['flash'], thunder(3.5, 1.0, 0.1, seed=20) * 0.7)
for k in range(60):  # stars scattering: glassy shards panned wide
    place(sfx, SCENE['flash'] + 0.2 + rng.random() * 1.5, ping(penta[rng.integers(len(penta))] * 0.5, 1.2), 0.025, rng.uniform(-1, 1))

# ---- Reign of Cronus: paranoia builds.
reign_dur = SCENE['hidden'] - SCENE['reign']
place(music, SCENE['reign'], strings([hz('D2'), hz('A2'), hz('D3'), hz('F3')], reign_dur + 0.05, attack=1.2, release=0.05, bright=0.8, trem=8), 0.45)
place(music, SCENE['reign'] + 3.5, strings([hz('Eb3'), hz('Bb3')], reign_dur - 3.45, attack=2.0, release=0.05, bright=1.0, trem=10), 0.4)
place(music, SCENE['reign'] + 1.0, choir([hz('D2'), hz('A2'), hz('D3')], reign_dur - 0.95, 'oo', attack=2.5, release=0.05, voices=6), 0.8)
tp, k = SCENE['reign'] + 0.4, 0
while tp < SCENE['hidden'] - 0.05:
    prog = (tp - SCENE['reign']) / reign_dur
    place(music, tp, frame_drum(58 if k % 3 == 0 else 74, 0.9, 0.6, seed=500 + k), 0.3 + 0.5 * prog)
    if k % 4 == 3:
        place(music, tp, metal_clang(160, 0.8), 0.06 + 0.1 * prog)
    tp += 60 / (80 + 70 * prog ** 1.5) / (2 if prog > 0.6 else 1)
    k += 1
# Ostinato low strings, rising chromatically.
for i, n in enumerate(['D2', 'Eb2', 'E2', 'F2']):
    t0 = SCENE['reign'] + 2.0 + i * 1.6
    for j in range(int(1.6 / 0.2)):
        place(music, t0 + j * 0.2, strings([hz(n)], 0.2, attack=0.01, release=0.08, bright=1.2, voices=3), 0.35)
# Newborns vanishing into shadow: soft reversed swells.
for i in range(5):
    t0 = SCENE['reign'] + 5.1 + i * 0.55
    s = ping(hz('A5') * [1, 1.122, 1.26, 1.5, 1.68][i], 1.2)[::-1]
    place(sfx, t0 + 0.2, s, 0.03, 0.6 - i * 0.2)

# ---- Hidden child: HARD CUT to silence. Rain, torch, a distant roll.
hid_dur = SCENE['strike'] - SCENE['hidden']
rain = filt(noise(hid_dur + 0.4, 'white', 21), 'band', [1200, 9000])
rain_env = env_points(hid_dur + 0.4, [(0, 0.10), (4.5, 0.08), (5.0, 0.03), (hid_dur, 0.02), (hid_dur + 0.4, 0)])
drops = np.zeros_like(rain)
for k in range(400):
    i = rng.integers(len(drops) - 200)
    drops[i:i + 60] += np.exp(-np.arange(60) / 8) * rng.uniform(0.3, 1)
drops = filt(drops, 'band', [1500, 7000])
r2 = rain * rain_env + drops * rain_env * 2
place(sfx, SCENE['hidden'], np.stack([r2 * 0.6, np.roll(r2, 500)]), 1.0, 0)
crackle = np.zeros(int(4.6 * SR))
for k in range(90):
    i = rng.integers(len(crackle) - 400)
    crackle[i:i + 300] += rng.standard_normal(300) * np.exp(-np.arange(300) / 30) * rng.uniform(0.2, 1)
crackle = filt(crackle, 'band', [700, 6000]) + filt(noise(4.6, 'brown', 22), 'low', 300) * 0.25
place(sfx, SCENE['hidden'], crackle, 0.12, -0.6)
steps = [SCENE['hidden'] + 0.3 + i * 0.55 for i in range(4)]
for tp in steps:
    place(sfx, tp, filt(noise(0.12, 'brown'), 'low', 600) * np.exp(-tt(0.12) * 30), 0.1, 0.2)
place(music, SCENE['cradle'] + 0.1, lyre(hz('D4'), 3.0, 0.3), 0.05, -0.2)
place(music, SCENE['cradle'] + 0.6, lyre(hz('A4'), 3.0, 0.3), 0.035, -0.2)
place(sfx, SCENE['lightning_far'] + 0.4, thunder(4.0, 0, 0.9, seed=23) * 0.35)

# ---- Zeus: silence... then the strike.
tone = np.sin(2 * np.pi * hz('D5') * tt(1.4)) * env_points(1.4, [(0, 0), (1.2, 0.5), (1.4, 0)])
place(music, SCENE['eyes'], tone, 0.02)
place(sfx, SCENE['reflect'], filt(noise(0.3, 'white'), 'high', 3000) * np.exp(-tt(0.3) * 20), 0.04)
place(sfx, SCENE['strike'], boom(6.0, 52, 24, 1.3), 1.2)
place(music, SCENE['strike'], orch_hit([hz('D1'), hz('D2'), hz('A2'), hz('D3'), hz('F#3')], 3.5), 1.0)
place(sfx, SCENE['strike'] + 0.05, thunder(5.5, 1.2, 0.0, seed=24) * 1.0)
# Rise through the storm.
whoosh = sweep(noise(1.9, 'pink', 25), 150, 2500, 'band', q=1.2) * env_points(1.9, [(0, 0), (1.5, 1), (1.9, 0.2)])
place(sfx, SCENE['breach'] - 1.6, np.stack([whoosh, np.roll(whoosh, 500)]), 0.5)
# Olympus: heavenly light.
bright_dur = DUR - SCENE['breach']
place(music, SCENE['breach'] - 0.1, strings([hz('D2'), hz('A2'), hz('F#3'), hz('A3'), hz('E4')], bright_dur - 0.2, attack=0.8, release=2.2, bright=1.3), 0.6)
place(music, SCENE['breach'], choir([hz('D3'), hz('F#3'), hz('A3')], bright_dur - 0.3, 'ah', attack=0.7, release=2.2, voices=7), 1.1)
for k, n in enumerate(['D4', 'F#4', 'A4', 'D5', 'E5', 'A4']):
    place(music, SCENE['breach'] + 0.3 + k * 0.28, lyre(hz(n), 3.0, 0.7), 0.07, 0.3)
place(music, SCENE['breach'], frame_drum(50, 2.0, 0.3, seed=900), 0.6)
place(sfx, SCENE['final_bolt'] + 0.5, thunder(3.5, 0.3, 0.75, seed=26) * 0.7)
# Final thunder rolls on after the cut to black.
place(sfx, SCENE['cut'] - 0.1, thunder(DUR - SCENE['cut'] + 0.1, 0.2, 0.55, seed=27) * 0.8)

# Everything musical is removed from the hidden-child cut until the strike.
mute = global_env([(0, 1), (SCENE['hidden'] - 0.001, 1), (SCENE['hidden'], 0.0), (SCENE['cradle'], 0.0),
                   (SCENE['cradle'] + 0.01, 1), (SCENE['zeus'], 1), (SCENE['zeus'] + 0.4, 0.15), (SCENE['strike'] - 0.01, 0.15),
                   (SCENE['strike'], 1), (DUR, 1)])
music *= mute
# Music ends with the picture, apart from its reverb tail.
music *= global_env([(0, 1), (SCENE['cut'], 1), (SCENE['cut'] + 0.25, 0), (DUR, 0)])

# ---------------------------------------------------------------- mix
narr = read_stereo(os.path.join(BUILD, 'narration.wav'))[:, :N]
whis = read_stereo(os.path.join(BUILD, 'whispers.wav'))[:, :N]
narr = np.pad(narr, ((0, 0), (0, N - narr.shape[1])))
whis = np.pad(whis, ((0, 0), (0, N - whis.shape[1])))

hall = reverb_ir(5.5, 1.6, 1, lp=7000)
room = reverb_ir(1.6, 0.35, 2, lp=5000, pre=0.012)
music = music + reverb(music, hall, 0.45)
# Hard cut to silence must stay silent: gate the reverb tail of what came before.
tail_gate = global_env([(0, 1), (SCENE['hidden'] - 0.001, 1), (SCENE['hidden'] + 0.12, 0.0), (SCENE['cradle'], 0.0), (SCENE['cradle'] + 0.01, 1), (DUR, 1)])
music *= tail_gate
sfx_pre_hidden = sfx * global_env([(0, 1), (SCENE['hidden'] - 0.001, 1), (SCENE['hidden'], 0), (DUR, 0)])
sfx_rev = reverb(sfx_pre_hidden, hall, 0.3) * tail_gate + reverb(sfx - sfx_pre_hidden, room, 0.25)
sfx = sfx + sfx_rev
narr = narr + reverb(narr, room, 0.12) + reverb(narr, hall, 0.05)
whis = whis + reverb(whis, hall, 0.5)

# Duck music under the narrator.
env = np.abs(narr[0])
env = filt(env, 'low', 6)
speaking = np.clip(env / 0.08, 0, 1)
music *= 1 - 0.5 * speaking
sfx *= 1 - 0.3 * speaking

bed = music * 0.55 + sfx * 0.6 + whis * 1.0
voice = narr * 1.0
# Report how far the bed sits under the voice while he speaks.
for a0 in range(0, int(DUR), 4):
    sl = slice(int(a0 * SR), int((a0 + 4) * SR))
    m = speaking[sl] > 0.5
    if m.sum() > SR * 0.3:
        vb, bb = filt(voice[0, sl], 'band', [300, 4000]), filt(bed[0, sl], 'band', [300, 4000])
        rv = np.sqrt(np.mean(vb[m] ** 2)); rb = np.sqrt(np.mean(bb[m] ** 2))
        print(f'{a0:3d}-{a0 + 4:<3d}s voice/bed {20 * np.log10(rv / (rb + 1e-9)):5.1f} dB')
mix = bed + voice
# Glue: gentle soft clip, then normalize.
mix = np.tanh(mix * 0.9) / 0.9
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.89
write_wav(os.path.join(BUILD, 'soundtrack.wav'), mix.astype(np.float32))
for name, bus in [('music', music), ('sfx', sfx)]:
    write_wav(os.path.join(BUILD, f'stem_{name}.wav'), (bus / (np.max(np.abs(bus)) + 1e-9) * 0.89).astype(np.float32))
print('wrote build/soundtrack.wav')
