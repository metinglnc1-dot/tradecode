#!/usr/bin/env python3
"""Voice stage: Kokoro TTS per line, Whisper word timing, mouth envelope.

Usage: python engine/voice.py out/<episode>/lines.json out/<episode>
Writes voice.wav and timings.json into the output folder.
"""
import difflib
import hashlib
import json
import re
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
VOICE_VERSION = "3"  # bump when TTS post-processing changes so cached voices are rebuilt


def norm(s):
    s = s.lower().replace("×", "x")
    return re.sub(r"[^a-z0-9%]", "", s)


def caption_tokens(caption):
    """Split caption text into words. *stars* mark key words (shown yellow)."""
    out, key = [], False
    for raw in caption.split():
        if raw.startswith("*"):
            key = True
        closing = "*" in raw[1:] if raw.startswith("*") else "*" in raw
        clean = raw.replace("*", "")
        out.append({
            "text": re.sub(r"[.,;:]+$", "", clean),
            "key": key,
            "brk": bool(re.search(r"[.,?!:;]$", clean)),
            "norm": norm(clean),
        })
        if closing:
            key = False
    return [w for w in out if w["text"]]


def trim(a, sr, thr=0.006):
    # generous pre-roll: soft onsets (f, b, g, t) start well below the threshold
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0:
        return a
    s = max(0, idx[0] - int(0.09 * sr))
    e = min(len(a), idx[-1] + int(0.06 * sr))
    return a[s:e]


def resample(a, sr, to):
    n = int(round(len(a) * to / sr))
    return np.interp(np.linspace(0, len(a) - 1, n), np.arange(len(a)), a).astype(np.float32)


def align(words, wh, dur):
    """Give every caption word a start/end using whisper words where they match."""
    cap = [w["norm"] for w in words]
    hyp = [norm(w.word) for w in wh]
    times = [None] * len(words)
    sm = difflib.SequenceMatcher(None, cap, hyp, autojunk=False)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                times[i1 + k] = (wh[j1 + k].start, wh[j1 + k].end)
        elif op == "replace":
            a, b = wh[j1].start, wh[j2 - 1].end
            lens = [max(1, len(words[i]["norm"])) for i in range(i1, i2)]
            tot, acc = sum(lens), 0
            for k, i in enumerate(range(i1, i2)):
                s = a + (b - a) * acc / tot
                acc += lens[k]
                times[i] = (s, a + (b - a) * acc / tot)
    # fill gaps (words whisper skipped) by character share between known neighbours
    i = 0
    while i < len(words):
        if times[i] is not None:
            i += 1
            continue
        j = i
        while j < len(words) and times[j] is None:
            j += 1
        a = times[i - 1][1] if i > 0 else 0.0
        b = times[j][0] if j < len(words) else dur
        lens = [max(1, len(words[k]["norm"])) for k in range(i, j)]
        tot, acc = sum(lens), 0
        for k in range(i, j):
            s = a + (b - a) * acc / tot
            acc += lens[k - i]
            times[k] = (s, a + (b - a) * acc / tot)
        i = j
    # keep monotonic
    last = 0.0
    for k, (s, e) in enumerate(times):
        s = max(s, last)
        e = max(e, s + 0.05)
        times[k] = (s, min(e, dur))
        last = s
    return times


def mouth_envelope(a, sr, n_frames):
    win = int(0.045 * sr)
    env = np.zeros(n_frames, dtype=np.float32)
    for f in range(n_frames):
        c = int(f / FPS * sr)
        seg = a[max(0, c - win // 2): c + win // 2]
        env[f] = np.sqrt(np.mean(seg ** 2)) if len(seg) else 0
    voiced = env[env > 0.01]
    ref = np.percentile(voiced, 92) if len(voiced) else 1
    env = np.clip(env / ref, 0, 1)
    env[env < 0.08] = 0
    env = env ** 0.7
    out = np.zeros_like(env)
    v = 0.0
    for i, x in enumerate(env):  # fast attack, softer release
        v = x if x > v else v * 0.55 + x * 0.45
        out[i] = v
    return [round(float(x), 3) for x in out]


def main():
    lines_path, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
    spec = json.loads(lines_path.read_text())
    cfg = spec["voice"]
    key = hashlib.sha1((VOICE_VERSION + json.dumps(spec, sort_keys=True)).encode()).hexdigest()
    tpath = out_dir / "timings.json"
    if tpath.exists() and json.loads(tpath.read_text()).get("hash") == key and (out_dir / "voice.wav").exists():
        print("voice: cached")
        return

    from kokoro_onnx import Kokoro
    from faster_whisper import WhisperModel

    tts = Kokoro(str(ROOT / "models/kokoro-v1.0.onnx"), str(ROOT / "models/voices-v1.0.bin"))
    asr = WhisperModel("tiny.en", device="cpu", compute_type="int8", download_root=str(ROOT / "models/whisper"))

    sr = 24000
    lead, gap = cfg.get("lead", 0.4), cfg.get("gap", 0.22)
    pieces, lines, cursor = [np.zeros(int(lead * sr), np.float32)], [], lead
    for i, ln in enumerate(spec["lines"]):
        # Kokoro swallows the first phoneme of every call ("Four" is heard as "or");
        # a leading "... " gives it a silent lead-in that trim() removes afterwards.
        primer = cfg.get("primer", "... ")
        audio, sr_ = tts.create(primer + ln["say"], voice=ln.get("voice", cfg["name"]),
                                speed=ln.get("speed", cfg.get("speed", 1.25)), lang="en-us")
        assert sr_ == sr
        audio = trim(np.asarray(audio, np.float32), sr)
        dur = len(audio) / sr
        segs, _ = asr.transcribe(resample(audio, sr, 16000), word_timestamps=True, language="en",
                                 condition_on_previous_text=False, vad_filter=False)
        wh = [w for s in segs for w in s.words if w.start < dur - 0.02]
        words = caption_tokens(ln.get("caption", ln["say"]))
        times = align(words, wh, dur)
        lines.append({
            "start": round(cursor, 3), "end": round(cursor + dur, 3),
            "say": ln["say"],
            "words": [{"text": w["text"], "key": w["key"], "brk": w["brk"],
                       "start": round(cursor + s, 3), "end": round(cursor + e, 3)}
                      for w, (s, e) in zip(words, times)],
            "heard": " ".join(w.word.strip() for w in wh),
        })
        pieces.append(audio)
        pause = ln.get("pauseAfter", gap)
        pieces.append(np.zeros(int(pause * sr), np.float32))
        cursor += dur + pause
        print(f"  line {i + 1}: {dur:.2f}s  heard: {lines[-1]['heard']}")

    voice = np.concatenate(pieces)
    peak = np.max(np.abs(voice)) or 1
    voice = voice / peak * 0.89
    sf.write(out_dir / "voice.wav", voice, sr, subtype="PCM_16")
    voice_end = lines[-1]["end"]
    n_frames = int(np.ceil((len(voice) / sr + 10) * FPS))
    tpath.write_text(json.dumps({
        "hash": key, "fps": FPS, "voiceEnd": voice_end, "lines": lines,
        "mouth": mouth_envelope(voice, sr, n_frames),
    }))
    print(f"voice: {voice_end:.2f}s of speech")


if __name__ == "__main__":
    main()
