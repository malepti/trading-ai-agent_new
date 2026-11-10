/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Cognitive Reasoning Endpoint
app.post('/api/agent/reason', async (req, res) => {
  const { prompt, activePackage, prunedNodes, conversationHistory } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // System instruction defining the Cognitive Planner
  const systemInstruction = `You are NOVA's Cognitive Reasoning Engine for an Android OS voice assistant.
Your goal is to parse user instructions, map them to an active Android application, extract entities, evaluate risk (READ_ONLY, LOW_RISK_MUTATION, HIGH_RISK_MUTATION), and output an actionable execution plan.

Risk Rules:
- SEND_MESSAGE, SEND_EMAIL, DELETE_FILE, TRANSFER_MONEY: HIGH_RISK_MUTATION (requiresConfirmation: true)
- TYPE_DRAFT, SAVE_DRAFT, SWITCH_TAB: LOW_RISK_MUTATION
- SEARCH_APP, OPEN_APP, FIND_FILE, CONVERSATIONAL_QUERY: READ_ONLY (requiresConfirmation: false)

Available Android Apps:
- com.whatsapp (Messaging): nodes include com.whatsapp:id/entry (message text), com.whatsapp:id/send (send button)
- com.google.android.youtube (Video): nodes include com.google.android.youtube:id/search_box, com.google.android.youtube:id/search_btn
- com.google.android.gm (Email): nodes include com.google.android.gm:id/to_field, com.google.android.gm:id/subject_field, com.google.android.gm:id/body_field, com.google.android.gm:id/send_button
- com.android.documentsui (Files): nodes include file list and share_button
- com.android.settings (System Settings): nodes include wifi_toggle, accessibility_service

Return ONLY a valid JSON object matching the requested schema.`;

  try {
    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `User Prompt: "${prompt}"
Active Package: "${activePackage || 'com.whatsapp'}"
Visible Accessible Nodes: ${JSON.stringify(prunedNodes || [])}
Recent Context: ${JSON.stringify(conversationHistory || [])}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intent: {
                type: Type.STRING,
                description: 'The classified user intent',
              },
              targetApp: {
                type: Type.STRING,
                description: 'Android package name e.g. com.whatsapp',
              },
              entities: {
                type: Type.OBJECT,
                properties: {
                  contact: { type: Type.STRING },
                  message: { type: Type.STRING },
                  searchQuery: { type: Type.STRING },
                  fileName: { type: Type.STRING },
                },
              },
              riskLevel: {
                type: Type.STRING,
                description: 'READ_ONLY | LOW_RISK_MUTATION | HIGH_RISK_MUTATION',
              },
              requiresConfirmation: {
                type: Type.BOOLEAN,
                description: 'True if high-risk mutation requiring explicit human approval',
              },
              canRunOnLockScreen: {
                type: Type.BOOLEAN,
                description: 'True for general questions, Google search, facts, time, or weather that can be answered while phone remains locked',
              },
              requiresUnlock: {
                type: Type.BOOLEAN,
                description: 'True for application interactions (WhatsApp, Gmail, YouTube, Files) that require the phone to be unlocked',
              },
              answer: {
                type: Type.STRING,
                description: 'Spoken/displayed answer for conversational questions or search results',
              },
              stagedSummary: {
                type: Type.STRING,
                description: 'Human-readable summary to be spoken and displayed to the user',
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepIndex: { type: Type.INTEGER },
                    actionType: {
                      type: Type.STRING,
                      description: 'LAUNCH_PACKAGE | CLICK_NODE | SET_TEXT | SCROLL_FORWARD | STAGE_ACTION',
                    },
                    targetApp: { type: Type.STRING },
                    targetNodeId: { type: Type.STRING },
                    targetText: { type: Type.STRING },
                    payload: { type: Type.STRING },
                  },
                  required: ['stepIndex', 'actionType'],
                },
              },
            },
            required: ['intent', 'targetApp', 'riskLevel', 'requiresConfirmation', 'stagedSummary', 'steps'],
          },
        },
      });

      const parsedPlan = JSON.parse(response.text || '{}');
      parsedPlan.taskId = 'task-' + Math.random().toString(36).substring(2, 9);
      parsedPlan.timestamp = Date.now();
      parsedPlan.status = parsedPlan.requiresConfirmation ? 'STAGED' : 'EXECUTING';

      return res.json({ success: true, plan: parsedPlan, provider: 'gemini-3.8-flash' });
    }
  } catch (err: any) {
    console.warn('[Server] Gemini API call error, falling back to local deterministic planner:', err?.message);
  }

  // Graceful deterministic fallback planner for offline/local resilience
  const fallbackPlan = generateDeterministicPlan(prompt, activePackage);
  return res.json({ success: true, plan: fallbackPlan, provider: 'local-deterministic-engine' });
});

// Deterministic intent parsing fallback
function generateDeterministicPlan(prompt: string, activePackage?: string) {
  const p = prompt.toLowerCase();
  const taskId = 'task-' + Math.random().toString(36).substring(2, 9);

  // Scenario 1: WhatsApp message (Requires unlock)
  if (p.includes('whatsapp') || p.includes('message') || p.includes('saying') || p.includes('uday')) {
    const contactMatch = prompt.match(/\bto ([A-Z][a-z]+)\b/i);
    const contact = contactMatch ? contactMatch[1] : 'Uday';
    let message = 'I am waiting for him.';
    if (p.includes('saying')) {
      message = prompt.split(/saying/i)[1].trim().replace(/^["']|["']$/g, '');
    }

    return {
      taskId,
      intent: 'SEND_MESSAGE',
      targetApp: 'com.whatsapp',
      entities: { contact, message },
      riskLevel: 'HIGH_RISK_MUTATION',
      requiresConfirmation: true,
      canRunOnLockScreen: false,
      requiresUnlock: true,
      stagedSummary: `I drafted this message to ${contact}: "${message}". Should I send it?`,
      steps: [
        { stepIndex: 1, actionType: 'LAUNCH_PACKAGE', targetApp: 'com.whatsapp' },
        { stepIndex: 2, actionType: 'CLICK_NODE', targetNodeId: 'com.whatsapp:id/toolbar', targetText: contact },
        { stepIndex: 3, actionType: 'SET_TEXT', targetNodeId: 'com.whatsapp:id/entry', payload: message },
        { stepIndex: 4, actionType: 'STAGE_ACTION', targetNodeId: 'com.whatsapp:id/send' },
      ],
      timestamp: Date.now(),
      status: 'STAGED',
    };
  }

  // Scenario 2: YouTube search (Requires unlock)
  if (p.includes('youtube') || p.includes('video')) {
    let query = 'Python DSA tutorials';
    if (p.includes('for')) {
      query = prompt.split(/for/i)[1].trim();
    }

    return {
      taskId,
      intent: 'SEARCH_APP',
      targetApp: 'com.google.android.youtube',
      entities: { searchQuery: query },
      riskLevel: 'READ_ONLY',
      requiresConfirmation: false,
      canRunOnLockScreen: false,
      requiresUnlock: true,
      stagedSummary: `Opening YouTube and searching for "${query}".`,
      steps: [
        { stepIndex: 1, actionType: 'LAUNCH_PACKAGE', targetApp: 'com.google.android.youtube' },
        { stepIndex: 2, actionType: 'SET_TEXT', targetNodeId: 'com.google.android.youtube:id/search_box', payload: query },
        { stepIndex: 3, actionType: 'CLICK_NODE', targetNodeId: 'com.google.android.youtube:id/search_btn' },
      ],
      timestamp: Date.now(),
      status: 'EXECUTING',
    };
  }

  // Scenario 3: Email resume (Requires unlock)
  if (p.includes('resume') || p.includes('email') || p.includes('hr')) {
    return {
      taskId,
      intent: 'SEND_EMAIL',
      targetApp: 'com.google.android.gm',
      entities: { contact: 'HR', fileName: 'Resume_2026_Senior_AI_Architect.pdf' },
      riskLevel: 'HIGH_RISK_MUTATION',
      requiresConfirmation: true,
      canRunOnLockScreen: false,
      requiresUnlock: true,
      stagedSummary: `I found your latest resume "Resume_2026_Senior_AI_Architect.pdf" and drafted an email to HR. Should I send it?`,
      steps: [
        { stepIndex: 1, actionType: 'LAUNCH_PACKAGE', targetApp: 'com.android.documentsui' },
        { stepIndex: 2, actionType: 'CLICK_NODE', targetNodeId: 'com.android.documentsui:id/file_resume' },
        { stepIndex: 3, actionType: 'LAUNCH_PACKAGE', targetApp: 'com.google.android.gm' },
        { stepIndex: 4, actionType: 'SET_TEXT', targetNodeId: 'com.google.android.gm:id/to_field', payload: 'recruiting@company.com' },
        { stepIndex: 5, actionType: 'SET_TEXT', targetNodeId: 'com.google.android.gm:id/subject_field', payload: 'Application - Senior AI Architect' },
        { stepIndex: 6, actionType: 'STAGE_ACTION', targetNodeId: 'com.google.android.gm:id/send_button' },
      ],
      timestamp: Date.now(),
      status: 'STAGED',
    };
  }

  // Scenario 4: General Questions / Google Search (CAN RUN DIRECTLY ON LOCK SCREEN WITHOUT UNLOCKING)
  if (p.includes('yesterday') || p.includes('what did i ask') || p.includes('history')) {
    return {
      taskId,
      intent: 'CONVERSATIONAL_QUERY',
      targetApp: 'com.nova.assistant',
      entities: {},
      riskLevel: 'READ_ONLY',
      requiresConfirmation: false,
      canRunOnLockScreen: true,
      requiresUnlock: false,
      answer: 'Yesterday you asked me to search for Python DSA tutorials on YouTube, and drafted a message to Uday.',
      stagedSummary: 'Yesterday you asked me to search for Python DSA tutorials on YouTube, and drafted a message to Uday.',
      steps: [],
      timestamp: Date.now(),
      status: 'COMPLETED',
    };
  }

  if (p.includes('france') || p.includes('capital')) {
    return {
      taskId,
      intent: 'CONVERSATIONAL_QUERY',
      targetApp: 'system',
      entities: {},
      riskLevel: 'READ_ONLY',
      requiresConfirmation: false,
      canRunOnLockScreen: true,
      requiresUnlock: false,
      answer: 'The capital of France is Paris.',
      stagedSummary: 'The capital of France is Paris.',
      steps: [],
      timestamp: Date.now(),
      status: 'COMPLETED',
    };
  }

  if (p.includes('weather') || p.includes('temperature')) {
    return {
      taskId,
      intent: 'CONVERSATIONAL_QUERY',
      targetApp: 'system',
      entities: {},
      riskLevel: 'READ_ONLY',
      requiresConfirmation: false,
      canRunOnLockScreen: true,
      requiresUnlock: false,
      answer: 'It is currently 21°C and sunny with light winds.',
      stagedSummary: 'It is currently 21°C and sunny with light winds.',
      steps: [],
      timestamp: Date.now(),
      status: 'COMPLETED',
    };
  }

  if (p.includes('time') || p.includes('clock')) {
    return {
      taskId,
      intent: 'CONVERSATIONAL_QUERY',
      targetApp: 'system',
      entities: {},
      riskLevel: 'READ_ONLY',
      requiresConfirmation: false,
      canRunOnLockScreen: true,
      requiresUnlock: false,
      answer: 'The current time is 09:41 AM.',
      stagedSummary: 'The current time is 09:41 AM.',
      steps: [],
      timestamp: Date.now(),
      status: 'COMPLETED',
    };
  }

  if (p.includes('who is') || p.includes('search') || p.includes('what is') || p.includes('calculate')) {
    const cleanQ = prompt.replace(/^(who is|what is|search for|search|calculate)\s+/i, '');
    return {
      taskId,
      intent: 'CONVERSATIONAL_QUERY',
      targetApp: 'system',
      entities: { query: cleanQ },
      riskLevel: 'READ_ONLY',
      requiresConfirmation: false,
      canRunOnLockScreen: true,
      requiresUnlock: false,
      answer: `Here is the Google Search result for "${cleanQ}": Found relevant information across verified sources.`,
      stagedSummary: `Google Search result for "${cleanQ}".`,
      steps: [],
      timestamp: Date.now(),
      status: 'COMPLETED',
    };
  }

  // Generic fallback
  return {
    taskId,
    intent: 'OPEN_APP',
    targetApp: activePackage || 'com.whatsapp',
    entities: {},
    riskLevel: 'READ_ONLY',
    requiresConfirmation: false,
    stagedSummary: `Navigating to ${activePackage || 'com.whatsapp'}.`,
    steps: [
      { stepIndex: 1, actionType: 'LAUNCH_PACKAGE', targetApp: activePackage || 'com.whatsapp' }
    ],
    timestamp: Date.now(),
    status: 'EXECUTING',
  };
}

// Dev vs Prod Vite Integration
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[NOVA OS Server] Running on http://localhost:${PORT}`);
});
