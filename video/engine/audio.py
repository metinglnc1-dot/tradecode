#!/usr/bin/env python3
"""Audio stage: synthesise sound effects in code and mix them with the voice.

Usage: python engine/audio.py out/<episode>
Reads plan.json (sfx events) and voice.wav, writes audio.wav (48 kHz).
"""
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 48000


def t_axis(d):
    return np.arange(int(d * SR)) / SR


def env(d, a=0.005, decay=6.0):
    t = t_axis(d)
    return np.minimum(t / a, 1) * np.exp(-t * decay)


def sweep(f0, f1, d, curve=1.0):
    t = t_axis(d)
    f = f0 + (f1 - f0) * (t / d) ** curve
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def noise(d, seed=1):
    return np.random.default_rng(seed).standard_normal(int(d * SR))


def bandpass(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x))


def moving_bandpass(x, centers, width=0.6, blocks=24):
    out = np.zeros_like(x)
    n = len(x) // blocks
    win = np.hanning(2 * n)
    for b in range(blocks):
        s = max(0, b * n - n // 2)
        seg = x[s:s + 2 * n]
        c = centers[min(b, len(centers) - 1)]
        y = bandpass(seg, c * (1 - width), c * (1 + width)) * win[:len(seg)]
        out[s:s + len(seg)] += y
    return out


def sfx_bell(**_):
    d, f = 1.6, 880.0
    t = t_axis(d)
    parts = [(1, 1.0, 2.2), (2.76, 0.5, 3.2), (5.40, 0.3, 4.5), (8.93, 0.15, 6)]
    return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) for r, a, k in parts) * 0.5


def sfx_ding(**_):
    d = 0.8
    t = t_axis(d)
    return (np.sin(2 * np.pi * 1568 * t) + 0.35 * np.sin(2 * np.pi * 3136 * t)) * env(d, 0.002, 5.5) * 0.6


def sfx_thud(**_):
    d = 0.22
    x = sweep(140, 55, d, 0.5) * env(d, 0.002, 18)
    click = bandpass(noise(d, 3), 800, 4000) * env(d, 0.001, 90) * 0.4
    return (x + click) * 0.9


def sfx_coin(**_):
    d = 0.42
    t = t_axis(d)
    out = np.zeros(int(d * SR))
    for k, (off, f) in enumerate([(0.0, 3150), (0.07, 4210)]):
        tt = t[: len(t) - int(off * SR)]
        tone = (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 1.48 * tt)
                + 0.25 * np.sin(2 * np.pi * f * 2.11 * tt)) * np.exp(-tt * 11)
        out[int(off * SR):] += tone * (0.6 if k else 0.45)
    return out * 0.5


def sfx_whoosh(dur=0.5, **_):
    d = max(0.3, dur)
    n = noise(d, 5)
    centers = np.concatenate([np.linspace(500, 2600, 12), np.linspace(2600, 900, 12)])
    x = moving_bandpass(n, centers)
    t = t_axis(d)
    shape = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.6
    return x / (np.max(np.abs(x)) or 1) * shape * 0.45


def sfx_pop(**_):
    d = 0.14
    x = sweep(380, 1250, d, 0.35) * env(d, 0.002, 30)
    click = noise(d, 7) * env(d, 0.0005, 300) * 0.2
    return (x + click) * 0.7


def sfx_boing(**_):
    d = 0.6
    t = t_axis(d)
    f = 170 + 140 * (1 - np.exp(-t * 9)) + 28 * np.sin(2 * np.pi * 13 * t) * np.exp(-t * 3)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return x * env(d, 0.004, 5) * 0.6


def sfx_sad(**_):
    notes = [(392, 0.32), (370, 0.32), (349, 0.32), (330, 0.9)]
    out = []
    for i, (f, d) in enumerate(notes):
        t = t_axis(d)
        vib = 1 + (0.012 * np.sin(2 * np.pi * 6 * t) if i == 3 else 0)
        ph = 2 * np.pi * np.cumsum(f * vib) / SR
        tone = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph) + 0.15 * np.sin(4 * ph)
        a = np.minimum(t / 0.03, 1) * np.minimum((d - t) / 0.06, 1)
        if i == 3:
            a *= np.exp(-t * 1.2)
        out.append(tone * a)
    return np.concatenate(out) * 0.28


def sfx_tick(**_):
    d = 0.05
    return bandpass(noise(d, 11), 2000, 7000) * env(d, 0.0005, 160) * 0.5


def sfx_scribble(dur=0.8, **_):
    d = max(0.2, dur)
    t = t_axis(d)
    n = bandpass(noise(d, 13), 1800, 6500)
    strokes = 0.55 + 0.45 * np.sin(2 * np.pi * 7.5 * t + 2 * np.sin(2 * np.pi * 1.3 * t))
    edge = np.minimum(t / 0.04, 1) * np.minimum((d - t) / 0.06, 1)
    return n / (np.max(np.abs(n)) or 1) * strokes * edge * 0.16


SFX = {k[4:]: v for k, v in globals().items() if k.startswith("sfx_")}


def main():
    out_dir = Path(sys.argv[1])
    plan = json.loads((out_dir / "plan.json").read_text())
    total = int((plan["duration"] + 0.1) * SR)
    mix = np.zeros(total)

    voice, vsr = sf.read(out_dir / "voice.wav")
    voice = np.interp(np.arange(int(len(voice) * SR / vsr)) * vsr / SR, np.arange(len(voice)), voice)
    mix[: min(total, len(voice))] += voice[:total]

    sfx_bus = np.zeros(total)
    for ev in plan["sfx"]:
        fn = SFX.get(ev["name"])
        if not fn:
            print("audio: unknown sfx", ev["name"])
            continue
        x = fn(dur=ev.get("dur", 0.5))
        s = int(ev["t"] * SR)
        if s >= total:
            continue
        x = x[: total - s]
        sfx_bus[s: s + len(x)] += x * ev.get("gain", 1.0)
    mix += sfx_bus * 0.55

    fade = int(0.25 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)
    mix = mix / max(1.0, np.max(np.abs(mix)) / 0.95)
    sf.write(out_dir / "audio.wav", mix.astype(np.float32), SR, subtype="PCM_16")
    print(f"audio: {len(plan['sfx'])} sfx mixed, {plan['duration']:.2f}s")


if __name__ == "__main__":
    main()
