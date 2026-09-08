import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { Recorder, addCaptureStyles, assemble } from './capture-recorder.mjs';

const appUrl = process.env.CITIZEN_APP_URL ?? 'http://127.0.0.1:3177';
const clips = new URL('../public/clips/', import.meta.url).pathname;
const review = new URL('../out/continuity-review/', import.meta.url).pathname;
const temp = await mkdtemp(join(tmpdir(), 'citizen-continuity-capture-'));
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1060, height: 800 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const captures = [];
const captureOnly = new Set((process.env.CAPTURE_ONLY ?? '').split(',').filter(Boolean));
class ReplayRecorder extends Recorder {
  async frame() { this.count += 1; }
  async hold(ms) { this.count += Math.max(1, Math.round(ms / 1000 * 30)); }
}
const go = async (path) => {
  await page.goto(`${appUrl}${path}`, { waitUntil: 'networkidle' });
  await addCaptureStyles(page);
};
const selectPerson = async (name) => {
  await go('/start');
  await page.getByRole('button', { name: new RegExp(name) }).click();
  await page.getByRole('button', { name: 'Open profile', exact: true }).click();
  await page.waitForURL('**/home');
};
const graph = async () => page.evaluate(() => JSON.parse(localStorage.getItem('citizen-of-india-graph')).state.graph);
const record = async (name, frames, run) => {
  const dir = join(temp, name);
  await mkdir(dir, { recursive: true });
  const recording = captureOnly.size === 0 || captureOnly.has(name);
  const rec = recording ? new Recorder(page, dir, true) : new ReplayRecorder(page, dir, false);
  await run(rec);
  assert(rec.count <= frames, `${name}: ${rec.count} frames exceed ${frames}`);
  if (rec.count < frames) await rec.hold((frames - rec.count) / 30 * 1000);
  assert.equal(rec.count, frames);
  if (recording) {
    await assemble(dir, join(clips, `${name}.mp4`));
    await page.screenshot({ path: join(review, `${name}-end.png`) });
  }
  captures.push({ name, frames, seconds: frames / 30 });
  process.stdout.write(`${recording ? "captured" : "replayed"} ${name}: ${frames} frames\n`);
  await rm(dir, { recursive: true, force: true });
};

try {
  await mkdir(clips, { recursive: true });
  await mkdir(review, { recursive: true });
  // Replay the film's earlier actions through the real UI, not fabricated graph updates.
  await selectPerson('Arjun Sharma');
  await go('/workflows/obligations');
  await page.getByRole('button', { name: 'Review payment', exact: true }).click();
  await page.getByRole('button', { name: 'Pay in demo', exact: true }).click();
  await page.getByRole('heading', { name: 'Challan paid', exact: true }).waitFor();
  await go('/workflows/marriage');
  await page.getByRole('button', { name: 'Invite Priya', exact: true }).click();
  await selectPerson('Priya Patel');
  await go('/workflows/marriage');
  await page.getByRole('button', { name: 'I consent', exact: true }).click();
  await selectPerson('Arjun Sharma');
  await go('/workflows/marriage');
  await page.getByRole('button', { name: 'Sunita Sharma', exact: true }).click();
  await page.getByRole('button', { name: 'Kavita Verma', exact: true }).click();
  await page.getByRole('button', { name: 'Continue with these records', exact: true }).click();
  await page.getByRole('button', { name: 'Book and pay', exact: true }).click();
  await page.getByRole('button', { name: 'Register marriage', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Register marriage', exact: true }).click();
  await page.getByRole('heading', { name: 'Marriage registered', exact: true }).waitFor();
  process.stdout.write('Replayed challan and marriage.\n');

  await go('/workflows/record-correction');
  await page.getByRole('button', { name: 'Send correction request', exact: true }).click();
  const sent = page.getByRole('heading', { name: 'Correction request sent', exact: true });
  await sent.waitFor();
  await sent.evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 108));
  await record('18-case-pending', 180, async rec => { await rec.hold(6000); });
  let current = await graph();
  const pan = current.nodes.find(n => n.id === 'doc:arjun-pan');
  assert.equal(pan.attrs.holderName, 'ARJUN KUMAR SHARMA');
  assert.equal(pan.verification.state, 'pending');

  await record('19-case-followup', 240, async rec => {
    await rec.click(page.getByRole('button', { name: 'No, not yet', exact: true }), 600);
    await page.getByText('Still unresolved', { exact: true }).waitFor();
    await rec.hold(500);
    await rec.click(page.getByRole('link', { name: 'Raise a grievance', exact: true }), 100);
    await page.getByRole('heading', { name: 'Which record is this about?', exact: true }).waitFor();
    await rec.click(page.getByRole('button', { name: 'Continue', exact: true }), 200);
    await rec.scrollTo(page.getByRole('textbox', { name: 'What you are sending', exact: true }), 110, 600);
  });
  current = await graph();
  const original = current.nodes.find(n => n.id === 'app:pan-name-correction');
  assert.equal(original.attrs.citizenOutcome, 'unresolved');
  const note = `My PAN still shows ARJUN KUMAR SHARMA. Please review correction ${original.attrs.reference} and tell me the next step.`;
  const textbox = page.getByRole('textbox', { name: 'What you are sending', exact: true });
  await textbox.fill(note);
  await page.getByRole('checkbox', { name: /Try one failed send/ }).check();
  await textbox.evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 95));
  const beforeFailure = await graph();
  await writeFile(join(review, "before-failure.json"), JSON.stringify(beforeFailure));
  await record('20-case-recovery', 330, async rec => {
    await rec.hold(300);
    await rec.click(page.getByRole('button', { name: 'Lodge the grievance in the demo', exact: true }), 800);
    await page.getByRole('alert').filter({ hasText: 'Nothing was submitted' }).waitFor();
    assert.deepEqual(await graph(), beforeFailure);
    assert.equal(await textbox.inputValue(), note);
    await rec.hold(2200);
    await page.reload({ waitUntil: 'networkidle' });
    await addCaptureStyles(page);
    await textbox.waitFor();
    await writeFile(join(review, 'after-reload.json'), JSON.stringify(await graph()));
    assert.equal(await textbox.inputValue(), note);
    assert.deepEqual(await graph(), beforeFailure);
    await rec.scrollTo(textbox, 95, 300);
    await rec.hold(1600);
    await rec.click(page.getByRole('button', { name: 'Lodge the grievance in the demo', exact: true }), 500);
    const complete = page.getByRole('heading', { name: 'Grievance lodged', exact: true });
    await complete.waitFor();
    await rec.scrollTo(complete, 110, 400);
  });
  current = await graph();
  const followups = current.nodes.filter(n => n.type === 'application' && n.attrs.kind === 'grievance' && n.attrs.relatedTo === original.id);
  assert.equal(followups.length, 1);
  assert.equal(current.nodes.find(n => n.id === original.id).attrs.citizenOutcome, 'unresolved');
  assert.equal(current.events.filter(e => e.procedureId === 'grievance').length, 1);

  await page.getByRole('link', { name: 'View case brief', exact: true }).click();
  await page.getByRole('heading', { name: 'Case brief', exact: true }).waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
  await record('21-case-brief', 343, async rec => {
    await rec.hold(2000);
    await rec.scrollTo(page.getByRole('heading', { name: 'Supporting records', exact: true }), 110, 700);
    await rec.hold(1100);
    await rec.scrollTo(page.getByRole('heading', { name: 'Follow-ups on the same matter', exact: true }), 110, 700);
    await rec.hold(2200);
    await rec.scrollTo(page.getByRole('heading', { name: 'What happened, in order', exact: true }), 110, 600);
    await rec.hold(1800);
    await rec.scrollTo(page.getByRole('button', { name: 'Print / save as PDF', exact: true }), 110, 500);
  });
  await page.pdf({ path: join(review, 'case-brief.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
  process.stdout.write('Verified failure preserved graph/draft; retry created exactly one follow-up. Exported case brief.\n');

  // The unchanged family segment follows the new continuity sequence in the film.
  await go('/you');
  await page.getByRole('button', { name: 'Ask Sunita for access', exact: true }).click();
  await selectPerson('Sunita Sharma');
  await go('/you');
  await page.getByRole('button', { name: 'Share with Arjun', exact: true }).click();
  await selectPerson('Arjun Sharma');
  await go('/you');
  await page.getByRole('button', { name: 'Act for Sunita', exact: true }).click();
  await page.getByText('You are acting for Sunita', { exact: true }).waitFor();
  await selectPerson('Sunita Sharma');
  await go('/you');
  await page.getByRole('button', { name: 'Revoke', exact: true }).click();
  await selectPerson('Arjun Sharma');
  await page.setViewportSize({ width: 1920, height: 1080 });
  await go('/activity');
  const during = page.getByRole('heading', { name: 'During this demo', exact: true });
  await during.evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 96));
  await record('22-continuity-timeline', 240, async rec => {
    await rec.hold(2000);
    await rec.scrollBy(500, 2600);
  });
  assert.deepEqual(errors, []);
  await writeFile(join(review, 'capture-verification.json'), JSON.stringify({ appUrl, captures, unchangedPanName: pan.attrs.holderName, originalReference: original.attrs.reference, followupReference: followups[0].attrs.reference, followupCount: followups.length, failurePreservedGraph: true, reloadPreservedDraft: true, pageErrors: errors }, null, 2)+'\n');
} finally {
  await browser.close();
  await rm(temp, { recursive: true, force: true });
}
