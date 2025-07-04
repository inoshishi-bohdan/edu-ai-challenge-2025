import 'dotenv/config';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAI } from 'openai';
import natural from 'natural';
import { parseFile } from 'music-metadata';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TRANSCRIPTS_DIR = './transcripts';

async function promptAudioFile() {
  const { audioPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'audioPath',
      message: 'Enter the path to the spoken audio file (wav/mp3/m4a):',
      validate: (input) => fs.existsSync(input) || 'File does not exist.'
    }
  ]);
  return audioPath;
}

async function transcribeAudio(audioPath) {
  const fileStream = fs.createReadStream(audioPath);
  const response = await openai.audio.transcriptions.create({
    file: fileStream,
    model: 'whisper-1',
    response_format: 'text',
    language: 'en',
  });
  return response;
}

async function summarizeText(text) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-nano",
    messages: [
      { role: 'system', content: 'You are a helpful assistant that summarizes transcripts.' },
      { role: 'user', content: `Summarize the following transcript in 3-5 sentences:\n${text}` }
    ],
    max_tokens: 300,
    temperature: 0.5,
  });
  return completion.choices[0].message.content.trim();
}

function getWordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function getDurationInMinutes(audioPath) {
  // Use music-metadata for all supported file types
  try {
    const metadataPromise = parseFile(audioPath);
    return metadataPromise.then(metadata => {
      if (metadata.format.duration) {
        return metadata.format.duration / 60; // seconds to minutes
      }
      return null;
    }).catch(() => null);
  } catch {
    return null;
  }
}

function getSpeakingSpeed(wordCount, durationMinutes) {
  if (!durationMinutes || durationMinutes === 0) return null;
  return wordCount / durationMinutes;
}

function getFrequentTopics(text, topN = 5) {
  const tokenizer = new natural.WordTokenizer();
  const words = tokenizer.tokenize(text.toLowerCase());
  const stopwords = new Set(natural.stopwords);
  const freq = {};
  for (const word of words) {
    if (!stopwords.has(word) && word.match(/^[a-zA-Z]+$/)) {
      freq[word] = (freq[word] || 0) + 1;
    }
  }
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, topN).map(([topic, count]) => ({ topic, count }));
}

async function saveTranscript(text) {
  await fs.ensureDir(TRANSCRIPTS_DIR);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(TRANSCRIPTS_DIR, `transcript-${timestamp}.txt`);
  await fs.writeFile(filePath, text, 'utf8');
  return filePath;
}

async function saveSummary(summary) {
  await fs.ensureDir(TRANSCRIPTS_DIR);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(TRANSCRIPTS_DIR, `summary-${timestamp}.md`);
  await fs.writeFile(filePath, summary, 'utf8');
  return filePath;
}

async function saveAnalysis(analysis) {
  await fs.ensureDir(TRANSCRIPTS_DIR);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(TRANSCRIPTS_DIR, `analysis-${timestamp}.json`);
  await fs.writeJson(filePath, analysis, { spaces: 2 });
  return filePath;
}

async function main() {
  try {
    const audioPath = await promptAudioFile();
    console.log('Transcribing audio...');
    const transcript = await transcribeAudio(audioPath);
    console.log('Transcription complete. Saving...');
    const transcriptPath = await saveTranscript(transcript);
    console.log(`Transcript saved to: ${transcriptPath}`);

    console.log('Summarizing transcript...');
    const summary = await summarizeText(transcript);
    const summaryPath = await saveSummary(summary);
    console.log(`\nSummary saved to: ${summaryPath}`);

    const wordCount = getWordCount(transcript);
    const durationMinutes = await getDurationInMinutes(audioPath);
    const speakingSpeed = getSpeakingSpeed(wordCount, durationMinutes);
    const topics = getFrequentTopics(transcript);

    const analysis = {
      wordCount,
      durationMinutes,
      speakingSpeed,
      topics
    };
    const analysisPath = await saveAnalysis(analysis);
    console.log(`\nAnalysis saved to: ${analysisPath}`);
  } catch (err) {
    console.error('Error:', err.message || err);
  }
}

main(); 