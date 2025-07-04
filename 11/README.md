# Audio Transcriber & Analyzer Console App

This Node.js console application allows you to:
- Accept a spoken audio file (wav/mp3/m4a)
- Transcribe it using OpenAI's Whisper API
- Summarize the transcription using GPT
- Extract custom statistics:
  - Total word count
  - Speaking speed (words per minute)
  - Frequently mentioned topics
- Save each transcription in a separate file
- Save the summary in a separate Markdown file
- Save the analytics in a separate JSON file
- Return only the file paths for summary and analytics in the console

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your OpenAI API key:**
   - Copy your OpenAI API key to a `.env` file in this directory:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     ```

3. **Run the app:**
   ```bash
   npm start
   ```

4. **Follow the prompt to enter the path to your audio file.**

## Notes
- Transcripts, summaries, and analytics are saved in the `transcripts/` folder.
- Speaking speed is calculated for all major audio formats (wav, mp3, m4a, etc.).
- Frequently mentioned topics are extracted using basic NLP (stopwords removed).
- The console will only display the file paths for the generated summary and analytics files. 