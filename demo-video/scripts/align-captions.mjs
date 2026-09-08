import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

// Keep the approved transcript; use local Whisper timings only to align its phrases.
const script = JSON.parse(await readFile('content/script.json', 'utf8'));
const transcriptPath = process.argv[2] ?? 'out/continuity-review/voice-transcript.json';
const transcript = JSON.parse(await readFile(transcriptPath, 'utf8'));
const normalized = text => text.toLowerCase().replace(/[^a-z0-9]/g, '');
const wordsOf = text => text.split(/\s+/u).map(normalized).filter(Boolean);
const spoken = [];
for (const segment of transcript.transcription) {
  let word;
  for (const token of segment.tokens) {
    if (token.text.startsWith('[_')) continue;
    if (/^\s/u.test(token.text) || !word) {
      if (word && normalized(word.text)) spoken.push(word);
      word = { text: token.text, start: token.offsets.from, end: token.offsets.to };
    } else {
      word.text += token.text;
      word.end = Math.max(word.end, token.offsets.to);
    }
  }
  if (word && normalized(word.text)) spoken.push(word);
}
const expected = script.flatMap(scene => wordsOf(scene.narration));
const actual = spoken.map(word => normalized(word.text));
const dp = Array.from({ length: expected.length + 1 }, () => new Uint16Array(actual.length + 1));
for (let i = expected.length - 1; i >= 0; i--) for (let j = actual.length - 1; j >= 0; j--) {
  dp[i][j] = expected[i] === actual[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
}
const matches = new Map();
let i = 0, j = 0;
while (i < expected.length && j < actual.length) {
  if (expected[i] === actual[j]) { matches.set(i++, j++); }
  else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
  else j++;
}
assert(matches.size / expected.length > 0.9, 'Voice/transcript mismatch: inspect the transcription before aligning captions.');
const captions = [];
const checks = [];
let offset = 0;
for (const scene of script) {
  assert.deepEqual(wordsOf(scene.captions.join(' ')), wordsOf(scene.narration), `${scene.id}: captions must preserve the approved narration.`);
  const sceneStart = scene.startFrame / 30 * 1000;
  const sceneEnd = (scene.startFrame + scene.durationInFrames) / 30 * 1000;
  for (const text of scene.captions) {
    const words = wordsOf(text);
    const aligned = words.map((_, n) => matches.get(offset + n)).filter(n => n !== undefined).map(n => spoken[n]);
    assert(aligned.length / words.length >= 0.6, `Insufficient alignment for ${text}`);
    const startMs = Math.round(Math.max(sceneStart + 30, aligned[0].start - 80));
    const endMs = Math.round(Math.min(sceneEnd - 50, Math.max(startMs + 650, aligned.at(-1).end + 120)));
    assert(endMs > startMs, `${text}: invalid timing`);
    captions.push({ text, startMs, endMs, timestampMs: null, confidence: null, pageBreakAfter: true });
    checks.push({ scene: scene.id, text, matchedWords: aligned.length, words: words.length, startMs, endMs });
    offset += words.length;
  }
}
for (let n = 0; n < captions.length - 1; n++) {
  captions[n].endMs = Math.min(captions[n].endMs, captions[n + 1].startMs - 1);
  assert(captions[n].endMs - captions[n].startMs >= 400, `Caption too short: ${captions[n].text}`);
}
await writeFile('public/captions.json', JSON.stringify(captions, null, 2)+'\n');
await writeFile('out/continuity-review/caption-alignment.json', JSON.stringify({ source: transcriptPath, matchedWords: matches.size, totalWords: expected.length, checks }, null, 2)+'\n');
process.stdout.write(`Aligned ${captions.length} captions; ${matches.size}/${expected.length} words matched local transcription.\n`);
