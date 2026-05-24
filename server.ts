import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Lazy initialization of Gemini API Client to prevent startup crashes if key is omitted
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY' && key.trim() !== '') {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // AI Architect endpoint - uses Gemini server-side to customize Spring Boot / Kubernetes templates
  app.post('/api/architect/generate', async (req, res) => {
    try {
      const { templateName, code, instructions, language } = req.body;
      const client = getGeminiClient();

      if (!client) {
        // Fallback generator in case no API key is specified in user Secrets
        return res.json({
          code: code + `\n\n// [AI Architect Demo Mode - Credentials Not Configured]\n// Added customized functionality: "${instructions}"\n// Save your API Key in Settings > Secrets to enable complete Gemini generation!`,
          feedback: `You are in offline demo mode. To enable real production AI generation, please assign your GEMINI_API_KEY inside the Secrets tab. However, the system simulated accepting your request: "${instructions}" for ${templateName}.`,
        });
      }

      const promptSystem = `You are a Principal Cloud Architect specializing in Java Enterprise, Spring Boot 3.x, Spring Cloud (Consul, Config Server, Gateway), Kubernetes orchestration, and Kafka streams.
Your goal is to modify the provided user code snippet or configuration template based strictly on the user's instructions.
Output ONLY the resulting updated code file inside a standard markdown code block. Do not provide extensive conversational preambles.
At the end of your response, add a short "Architect Advisor Notes" section describing the architectural impact (e.g., transaction stability, concurrency handling, database index suggestions) under 150 words.`;

      const userPrompt = `
File Name: ${templateName}
Coding Language: ${language}

Original Template Code:
\`\`\`
${code}
\`\`\`

User Request: "${instructions}"

Please implement the requested changes, keeping it robust, type-safe, matching standard enterprise Spring Boot / Kubernetes / CI-CD architecture conventions. Return updated file.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: promptSystem,
          temperature: 0.2,
        },
      });

      const fullOutput = response.text || '';
      
      // Parse markdown blocks
      let cleanCode = '';
      let notes = 'Architect updates successfully created.';
      
      // Extract code block
      const codeRegex = /```[a-z]*\n([\s\S]*?)```/;
      const match = fullOutput.match(codeRegex);
      if (match && match[1]) {
        cleanCode = match[1].trim();
      } else {
        cleanCode = fullOutput;
      }

      // Check for Architect Notes block
      const notesIndex = fullOutput.toLowerCase().indexOf('architect advisor notes');
      if (notesIndex !== -1) {
        notes = fullOutput.substring(notesIndex).replace(/`/g, '').trim();
      } else {
        notes = "Successfully added requested adjustments to standard Spring template and audited file structure.";
      }

      res.json({
        code: cleanCode,
        feedback: notes
      });

    } catch (error: any) {
      console.error('Gemini call failure:', error);
      res.status(500).json({
        error: error.message || 'Unable to complete code generation.',
        feedback: 'An unexpected backend error occurred during execution.'
      });
    }
  });

  // Serve static files and route fallback
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
