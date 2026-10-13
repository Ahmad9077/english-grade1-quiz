"""Generate the narration clips with ElevenLabs into public/audio: Arabic instructions with
Maryam Essa (Kuwaiti) and English letters, words and praise with Alice (British educator).

Usage (from the project root):
  python3 scripts/generate-audio.py [--only id1,id2] [--dry-run]

Clips whose text is unchanged since the last run are skipped, so a rerun costs nothing.
Raw API output is kept in .audio-raw/ (git-ignored) so loudness and trimming can be
reprocessed without spending characters. The API key is read from ~/.elevenlabs.env.
"""
import concurrent.futures as futures
import hashlib
import json
import os
import subprocess
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'audio')
RAW = os.path.join(ROOT, '.audio-raw')
MANIFEST = os.path.join(OUT, 'manifest.json')
# Arabic: the Kuwaiti voice the user approved for «بصمة وأثر». English: Alice, which the
# family chose on 2026-10-13 because she reads lone letters as letter names ("A", not "uh").
VOICES = {
    'ar': {'id': 'w0uhBAmNIG5kUDeaFEsA', 'name': 'Maryam Essa - Kuwaiti Calm & Warm'},
    'en': {'id': 'Xb7hH8MSUJpSbSDYk0k2', 'name': 'Alice - Clear, Engaging Educator'},
}
MODEL = 'eleven_v4'
SETTINGS = {'stability': 0.5, 'similarity_boost': 0.8, 'style': 0.2}
# Explanations and single letters are read a little slower so a young learner can follow them.
SPEED = {
    'en/fact/': 0.88, 'en/letter/': 0.9, 'en/word/': 0.9, 'en/num/': 0.92, 'en/ui/': 0.95,
    'ar/q/': 0.94, 'ar/t/': 0.92, 'ar/ui/': 0.96, 'ar/mean/': 0.94,
}
SAFETY_MARGIN = 400
CREDITS_PER_CHAR = 0.34


def api_key():
    with open(os.path.expanduser('~/.elevenlabs.env')) as handle:
        for line in handle:
            if line.startswith('ELEVENLABS_API_KEY='):
                return line.split('=', 1)[1].strip()
    sys.exit('ELEVENLABS_API_KEY is missing from ~/.elevenlabs.env')


def request(url, key, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers={'xi-api-key': key, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=90) as response:
        return response.read()


def settings_for(cue_id):
    speed = next(value for prefix, value in SPEED.items() if cue_id.startswith(prefix))
    return {**SETTINGS, 'speed': speed}


def voice_for(cue_id):
    return VOICES[cue_id.split('/', 1)[0]]


def text_hash(text, cue_id):
    settings = json.dumps(settings_for(cue_id), sort_keys=True)
    return hashlib.sha256(f"{voice_for(cue_id)['id']}|{MODEL}|{settings}|{text}".encode()).hexdigest()[:16]


def process(raw_path, out_path):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    trim = 'silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.06'
    chain = f'{trim},areverse,{trim},areverse,loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_dur=0.08'
    subprocess.run(
        ['ffmpeg', '-loglevel', 'error', '-y', '-i', raw_path, '-af', chain, '-ac', '1', '-ar', '44100', '-b:a', '64k', out_path],
        check=True,
    )
    probe = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out_path],
        capture_output=True, text=True, check=True,
    )
    return round(float(probe.stdout.strip()) * 1000)


def main():
    cues = json.loads(subprocess.run(
        ['node', 'scripts/list-audio-cues.ts', '--json'], cwd=ROOT, capture_output=True, text=True, check=True,
    ).stdout)
    only = None
    if '--only' in sys.argv:
        only = set(sys.argv[sys.argv.index('--only') + 1].split(','))
        cues = [cue for cue in cues if cue['id'] in only]

    manifest = {'voices': VOICES, 'model': MODEL, 'settings': SETTINGS, 'clips': {}}
    if os.path.exists(MANIFEST):
        manifest['clips'] = json.load(open(MANIFEST)).get('clips', {})

    todo = [cue for cue in cues if manifest['clips'].get(cue['id'], {}).get('hash') != text_hash(cue['text'], cue['id'])
            or not os.path.exists(os.path.join(OUT, cue['id'] + '.mp3'))]
    cost = sum(len(cue['text']) for cue in todo)
    print(f'{len(cues)} clips, {len(todo)} to generate, {cost} characters')
    if '--dry-run' in sys.argv or not todo:
        return

    key = api_key()
    sub = json.loads(request('https://api.elevenlabs.io/v1/user/subscription', key))
    remaining = sub['character_limit'] - sub['character_count']
    # eleven_v4 bills about a quarter credit per character in Arabic and English (measured Oct 2026); plan for a third.
    estimate = round(cost * CREDITS_PER_CHAR)
    if estimate + SAFETY_MARGIN > remaining:
        sys.exit(f'Stopping: about {estimate} credits needed but only {remaining} remain this cycle.')
    print(f'about {estimate} of {remaining} remaining credits')

    def generate(cue):
        raw_path = os.path.join(RAW, cue['id'] + '.mp3')
        os.makedirs(os.path.dirname(raw_path), exist_ok=True)
        cached = os.path.exists(raw_path) and open(raw_path + '.hash').read() == text_hash(cue['text'], cue['id']) \
            if os.path.exists(raw_path + '.hash') else False
        if not cached:
            audio = request(
                f"https://api.elevenlabs.io/v1/text-to-speech/{voice_for(cue['id'])['id']}?output_format=mp3_44100_128", key,
                {'text': cue['text'], 'model_id': MODEL, 'language_code': cue['lang'], 'voice_settings': settings_for(cue['id'])},
            )
            with open(raw_path, 'wb') as handle:
                handle.write(audio)
            with open(raw_path + '.hash', 'w') as handle:
                handle.write(text_hash(cue['text'], cue['id']))
        out_path = os.path.join(OUT, cue['id'] + '.mp3')
        duration = process(raw_path, out_path)
        return cue, duration, os.path.getsize(out_path)

    done = 0
    with futures.ThreadPoolExecutor(max_workers=3) as pool:
        for cue, duration, size in pool.map(generate, todo):
            manifest['clips'][cue['id']] = {'text': cue['text'], 'hash': text_hash(cue['text'], cue['id']), 'durationMs': duration, 'bytes': size}
            done += 1
            if done % 20 == 0:
                print(f'  {done}/{len(todo)}')

    valid = {cue['id'] for cue in json.loads(subprocess.run(
        ['node', 'scripts/list-audio-cues.ts', '--json'], cwd=ROOT, capture_output=True, text=True, check=True,
    ).stdout)}
    manifest['clips'] = {cid: entry for cid, entry in sorted(manifest['clips'].items()) if cid in valid}
    with open(MANIFEST, 'w', encoding='utf-8') as handle:
        json.dump(manifest, handle, ensure_ascii=False, indent=2)
        handle.write('\n')
    print(f'Generated {done} clips.')


if __name__ == '__main__':
    main()
