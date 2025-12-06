#!/usr/bin/env node
/**
 * Cursor Sandbox - Image to Code Generator
 * 
 * Usage:
 *   node generate.js <image-path> [component-name] [--no-open]
 * 
 * Examples:
 *   node generate.js screenshots/dashboard.png
 *   node generate.js ui.jpg LoginPage
 *   node generate.js design.png MyComponent --no-open
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { exec } = require('child_process');

// Configuration
const LANGGRAPH_URL = process.env.LANGGRAPH_URL || 'http://127.0.0.1:2024';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Parse arguments
const args = process.argv.slice(2);
const imagePath = args.find(a => !a.startsWith('--'));
const componentName = args.find((a, i) => i > 0 && !a.startsWith('--')) || `Generated_${Date.now()}`;
const noOpen = args.includes('--no-open');

// Colors
const colors = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function log(emoji, message, color = 'white') {
  console.log(`  ${emoji} ${colors[color]}${message}${colors.reset}`);
}

function httpRequest(url, options, body) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = client.request(parsedUrl, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function openBrowser(url) {
  const command = process.platform === 'win32' 
    ? `start "" "${url}"` 
    : process.platform === 'darwin' 
    ? `open "${url}"` 
    : `xdg-open "${url}"`;
  
  exec(command, (err) => {
    if (err) console.error('Failed to open browser:', err);
  });
}

async function main() {
  console.log('');
  console.log(`  ${colors.magenta}🎨 Cursor Sandbox - Image to Code Generator${colors.reset}`);
  console.log(`  ${colors.gray}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log('');

  // Validate image
  if (!imagePath) {
    log('❌', 'Usage: node generate.js <image-path> [component-name] [--no-open]', 'red');
    process.exit(1);
  }

  const resolvedPath = path.isAbsolute(imagePath) ? imagePath : path.join(process.cwd(), imagePath);
  
  if (!fs.existsSync(resolvedPath)) {
    log('❌', `Image not found: ${resolvedPath}`, 'red');
    process.exit(1);
  }

  log('⚡', `Loading image: ${path.basename(resolvedPath)}`, 'cyan');

  // Read and encode image
  const imageBuffer = fs.readFileSync(resolvedPath);
  const imageBase64 = imageBuffer.toString('base64');
  const imageSizeKB = Math.round(imageBuffer.length / 1024);
  log('ℹ️', `Image size: ${imageSizeKB}KB`, 'yellow');

  // Determine MIME type
  const ext = path.extname(resolvedPath).toLowerCase();
  const mimeType = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[ext] || 'image/jpeg';

  // Step 1: Create thread
  log('⚡', 'Creating LangGraph thread...', 'cyan');
  
  let threadId;
  try {
    const threadRes = await httpRequest(`${LANGGRAPH_URL}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, '{}');
    threadId = threadRes.data.thread_id;
    log('ℹ️', `Thread ID: ${threadId}`, 'yellow');
  } catch (err) {
    log('❌', `Failed to connect to LangGraph at ${LANGGRAPH_URL}`, 'red');
    log('ℹ️', 'Start with: uv run langgraph dev --allow-blocking', 'yellow');
    process.exit(1);
  }

  // Step 2: Send image for code generation
  log('⚡', 'Sending to Gemini for React + Tailwind generation...', 'cyan');

  const input = {
    input: {
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Convert this UI screenshot to React + Tailwind code' },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } }
        ]
      }]
    }
  };

  try {
    // Run the agent (blocking)
    const runRes = await httpRequest(`${LANGGRAPH_URL}/threads/${threadId}/runs/wait`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify(input));

    // Extract code from response
    let generatedCode = null;
    const messages = runRes.data?.messages || [];
    
    for (const msg of messages) {
      // Check tool messages for code
      if (msg.type === 'tool' && msg.content) {
        try {
          const toolResult = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
          if (toolResult.code) {
            generatedCode = toolResult.code;
          }
        } catch {}
      }
      
      // Check AI messages for code blocks
      if (msg.type === 'ai' && typeof msg.content === 'string') {
        const codeMatch = msg.content.match(/```(?:tsx|jsx|typescript|javascript)?\s*([\s\S]*?)```/);
        if (codeMatch) {
          generatedCode = codeMatch[1].trim();
        }
      }
    }

    if (!generatedCode) {
      log('❌', 'No code was generated', 'red');
      log('ℹ️', 'Try using the frontend directly at ' + FRONTEND_URL, 'yellow');
      process.exit(1);
    }

    log('✅', `Generated ${generatedCode.length} characters of code`, 'green');

    // Step 3: Save to frontend
    log('⚡', 'Saving component to frontend...', 'cyan');

    const saveRes = await httpRequest(`${FRONTEND_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({
      code: generatedCode,
      name: componentName,
      prompt: 'Convert this UI screenshot to React + Tailwind code'
    }));

    if (!saveRes.data.success) {
      log('❌', 'Failed to save component', 'red');
      process.exit(1);
    }

    const previewUrl = `${FRONTEND_URL}${saveRes.data.previewUrl}`;
    log('✅', `Component saved: ${saveRes.data.filePath}`, 'green');

    // Step 4: Open browser
    if (!noOpen) {
      log('⚡', 'Opening preview in browser...', 'cyan');
      openBrowser(previewUrl);
    }

    console.log('');
    console.log(`  ${colors.gray}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    log('✅', 'Done! Component generated successfully.', 'green');
    console.log('');
    console.log(`  ${colors.gray}📁 File: ${colors.white}frontend/src/generated/components/${componentName}.tsx`);
    console.log(`  ${colors.gray}🌐 Preview: ${colors.cyan}${previewUrl}${colors.reset}`);
    console.log('');

  } catch (err) {
    log('❌', `Generation failed: ${err.message}`, 'red');
    process.exit(1);
  }
}

main().catch(console.error);

