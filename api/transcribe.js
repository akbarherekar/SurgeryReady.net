import OpenAI from 'openai';
import { writeFileSync, createReadStream, unlinkSync } from 'fs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const config = {
  api: { bodyParser: { sizeLimit: '2mb' } },
};

// Pre-seeds Whisper with medical vocabulary so drug names and conditions are
// transcribed correctly instead of being garbled phonetically.
const MEDICAL_PROMPT = [
  'Medical surgical intake form.',
  'Heart: atrial fibrillation, AFib, coronary artery disease, CAD, heart failure, CHF,',
  'valve disease, hypertension, recent MI, stent.',
  'Lung: COPD, emphysema, asthma, sleep apnea, OSA.',
  'Metabolic: type 1 diabetes, type 2 diabetes, thyroid disease, obesity.',
  'Blood thinners: apixaban, Eliquis, rivaroxaban, Xarelto, warfarin, Coumadin,',
  'clopidogrel, Plavix, aspirin, dabigatran, Pradaxa, enoxaparin, Lovenox,',
  'ticagrelor, Brilinta.',
  'Diabetes medications: semaglutide, Ozempic, Wegovy, tirzepatide, Mounjaro,',
  'liraglutide, Victoza, dulaglutide, Trulicity, rybelsus,',
  'empagliflozin, Jardiance, dapagliflozin, Farxiga, canagliflozin, Invokana,',
  'metformin, Glucophage, insulin, glipizide, glimepiride.',
  'Other: hemoglobin, anticoagulant, pheochromocytoma, hypothyroidism.',
].join(' ');

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).end(); return; }

  const { audio, type } = req.body || {};
  if (!audio) { res.status(400).json({ error: 'audio required' }); return; }

  const ext = (type || 'audio/webm').includes('mp4') ? 'm4a' : 'webm';
  const tmpPath = `/tmp/sr-audio-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    writeFileSync(tmpPath, Buffer.from(audio, 'base64'));
    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(tmpPath),
      model: 'whisper-1',
      language: 'en',
      prompt: MEDICAL_PROMPT,
    });
    res.json({ text: transcription.text });
  } catch (e) {
    console.error('Whisper error:', e);
    res.status(500).json({ error: 'Transcription failed' });
  } finally {
    try { unlinkSync(tmpPath); } catch (_) {}
  }
}
