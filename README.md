# Mimicry AI

> AI-Powered Design Automation Platform for the Hackathon Challenge

![Mimicry](https://img.shields.io/badge/Powered%20by-Gemini%203%20Pro-blue)
![LangGraph](https://img.shields.io/badge/Built%20with-LangGraph-green)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black)

## Overview

Mimicry AI is an intelligent design assistant that generates professional UI mockups, marketing materials, and visual assets that match your existing brand style. Upload your designs, describe what you need, and watch AI create stunning, on-brand designs in seconds.

## Features

### Design Asset Ingestion
- Drag & drop upload for images and documents
- Automatic style extraction using Gemini Vision
- Support for PNG, JPG, SVG, PDF, and text documents

### AI-Powered Style Analysis
- **Color Palette Extraction**: Primary, secondary, accent, and background colors
- **Typography Analysis**: Font styles, hierarchy, and text treatments
- **Layout Patterns**: Grid systems, spacing, and alignment
- **Brand Elements**: Consistent design motifs and patterns

### Design Generation
- **UI Mockups**: Mobile and web app screens
- **Marketing Banners**: Promotional graphics
- **Landing Pages**: Hero sections and full pages
- **Dashboards**: Data visualization panels
- **User Flows**: Multi-screen journey diagrams

### Export & Sharing
- Download as PNG or JPG
- Copy base64 for API integration
- Share directly from the app

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 15 Frontend                       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ Upload Zone │  │    Studio    │  │      Gallery       │  │
│  └─────────────┘  └──────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              LangGraph Agent (Claude + Gemini)               │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────────┐   │
│  │ Style Analyzer│  │Image Generator│  │ Knowledge Store │   │
│  └──────────────┘  └───────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Backend (LangGraph Agent)
- **LLM**: Anthropic Claude (Sonnet 4)
- **Image Generation**: Gemini 3 Pro Image Preview
- **Vector Store**: ChromaDB for knowledge storage
- **Framework**: LangGraph with react agent

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **State**: Zustand
- **API Client**: LangGraph SDK

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Anthropic API Key
- Google AI API Key

### Backend Setup

1. Navigate to the hackathon directory:
```bash
cd hackathon
```

2. Create environment file:
```bash
cp env.example .env
```

3. Add your API keys to `.env`:
```env
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_API_KEY=your-google-key
```

4. Install dependencies:
```bash
pip install -e .
```

5. Deploy to LangGraph Cloud or run locally:
```bash
langgraph dev
```

### Frontend Setup

1. Navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set the LangGraph API URL (create `.env.local`):
```env
NEXT_PUBLIC_LANGGRAPH_API_URL=https://your-langgraph-endpoint.langgraph.app
```

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

### 1. Upload Brand Assets
Start by uploading your existing designs, screenshots, or brand guidelines. The AI will analyze them to understand your visual style.

### 2. Generate New Designs
Use the chat interface in the Studio tab to describe what you need:
- "Create a mobile onboarding screen for a fitness app"
- "Design a marketing banner for our summer sale"
- "Generate a dashboard showing user analytics"

### 3. Export Your Designs
Download generated designs in your preferred format or copy the base64 for API integration.

## Project Structure

```
hackathon/
├── app/                          # LangGraph Backend
│   ├── config.py                 # Configuration
│   ├── graph.py                  # Agent definition
│   └── tools/
│       ├── image_generator.py    # Gemini image generation
│       ├── style_analyzer.py     # Vision-based style analysis
│       └── knowledge_store.py    # Document storage
├── frontend/                     # Next.js App
│   ├── src/
│   │   ├── app/                  # Pages
│   │   ├── components/           # UI Components
│   │   └── lib/                  # Utilities
│   └── package.json
├── pyproject.toml
└── langgraph.json
```

## API Endpoints

The LangGraph agent exposes the following tools:

| Tool | Description |
|------|-------------|
| `generate_design_image` | Generate new designs with Gemini |
| `analyze_design_style` | Extract style from uploaded images |
| `store_knowledge` | Store brand guidelines |
| `retrieve_knowledge` | Search stored documents |

## Demo Prompts

Try these prompts to see Mimicry in action:

1. **UI Mockup**: "Create a modern login screen for a banking app with a dark theme"
2. **Marketing**: "Design a promotional banner for a new feature launch"
3. **Dashboard**: "Generate a sales analytics dashboard with charts and KPIs"
4. **User Flow**: "Create a 3-screen onboarding flow for a photo editing app"

## Hackathon Challenge Alignment

This solution addresses all key requirements:

✅ **Design Asset Ingestion** - Full upload system with preview  
✅ **Knowledge Integration** - ChromaDB-powered document storage  
✅ **Prompt-Based Generation** - Natural language chat interface  
✅ **AI-Driven Output** - Gemini 3 Pro image generation  
✅ **Export Functionality** - Multiple format downloads  
✅ **Editing & Refinement** - Iterative chat for adjustments  

## License

MIT

---

Built with ❤️ for the Design Automation Hackathon

