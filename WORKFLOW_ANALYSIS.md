# OCC Hackathon App - Complete Workflow Analysis

## 🎯 What Your App SHOULD Do

### Expected User Flow

1. **User uploads screenshot images** (showing OCC system UI style/design)
2. **User provides a German prompt** describing 4 separate scenes:
   - Szene 1: Systemzuordnung (System Assignment)
   - Szene 2: Installation & Umgebungsaufbau (Installation & Environment Setup)
   - Szene 3: Datenübertragung (Data Transfer)
   - Szene 4: Analyse & Ergebnisse (Analysis & Results)

3. **App should generate 4 SEPARATE static React components** - one for each scene, matching the uploaded design style

4. **User can view each component** in the preview page and navigate between them

---

## ✅ What Your App CURRENTLY Does

### Current Architecture

```
User → Frontend (Next.js) → API → LangGraph Agent (Gemini) → Code Generator
                                                               ↓
                                      Saves to: frontend/src/generated/components/
                                                               ↓
                                      Updates: frontend/src/generated/registry.json
                                                               ↓
                                      Preview: /preview page shows all components
```

### Current Workflow

1. ✅ **Image Upload**: Works - stores images in base64
2. ✅ **Multi-Scene Detection**: Agent system prompt has logic to detect multiple scenes
3. ✅ **`generate_multiple_screens` Tool**: Exists and generates separate components
4. ✅ **Component Storage**: Saves to `frontend/src/generated/components/`
5. ✅ **Registry Management**: Updates `registry.json` with component metadata
6. ✅ **Preview Page**: Shows all generated components with navigation

---

## 🔍 Current Agent Behavior

### System Prompt Instructions (from `app/graph.py`)

The agent is correctly instructed to:

```python
## CRITICAL: MULTIPLE SCREENS/SCENES IN PROMPT

**When the user's prompt describes multiple screens, scenes, or steps:**
- Use `generate_multiple_screens` instead of single component
- Create SEPARATE, STATIC React components (one per scene)
- Do NOT create interactive app with tabs/navigation
- Each component is standalone and static
```

### Detection Logic

Agent should detect keywords like:
- "Scene 1", "Scene 2", "Szene 1", "Szene 2" ✅
- "Four scenes", "4 screens" ✅
- Multiple distinct UI states/views ✅

---

## 🎨 What Should Happen with Your German Prompt

### Expected Behavior

1. **Agent receives**:
   - Uploaded images (OCC UI style reference)
   - German prompt with 4 scenes (Szene 1-4)

2. **Agent should**:
   - Detect "Szene 1", "Szene 2", etc. → triggers multi-screen mode
   - Extract style from uploaded images
   - Call `generate_multiple_screens()` with:
     ```python
     screen_descriptions=[
       "Szene 1: Systemzuordnung - Dashboard view showing...",
       "Szene 2: Installation & Umgebungsaufbau - Progress view...",
       "Szene 3: Datenübertragung - Transfer status view...",
       "Szene 4: Analyse & Ergebnisse - Analytics dashboard..."
     ]
     ```

3. **Tool generates**:
   - `OCCScene1.tsx` - System assignment dashboard
   - `OCCScene2.tsx` - Installation progress view
   - `OCCScene3.tsx` - Data transfer monitoring
   - `OCCScene4.tsx` - Analysis results with charts

4. **Components are**:
   - Static (no navigation between them)
   - Consistent visual style (from uploaded images)
   - Synthetic/mock data (as required)
   - Saved to `frontend/src/generated/components/`

5. **Preview page shows**:
   - All 4 components in sidebar
   - Grouped as "OCCScene" (1-4)
   - Navigation arrows to cycle through scenes
   - Live preview in iframe

---

## 🐛 Potential Issues & Solutions

### Issue 1: Agent Might Not Detect Multi-Scene Intent

**Symptom**: Agent creates one big interactive component instead of 4 separate ones

**Cause**: German keywords "Szene" might not be detected, or agent interprets as single app

**Solution**: Agent system prompt already has this covered, but verify:
```python
# In app/graph.py line ~105
"Szene 1", "Szene 2", etc.  # ✅ Already mentioned
```

**Fix if needed**: Ensure agent prompt parsing is case-insensitive and detects German terms

---

### Issue 2: Image Style Not Applied to Generated Components

**Symptom**: Components don't match uploaded image style

**Cause**: Style extraction not passed to `generate_multiple_screens`

**Current Flow**:
1. User uploads images → stored in state
2. Agent should analyze images for style
3. Pass style description to `style_reference` parameter

**Verify**: Check if agent is analyzing images BEFORE generating screens

---

### Issue 3: Preview Page Flickering (FIXED ✅)

**Status**: Already fixed in previous conversation
- Removed infinite re-render loops
- Consolidated duplicate fetching
- Added proper loading states
- Memoized Sandpack components

---

### Issue 4: Gallery Delete Not Working (FIXED ✅)

**Status**: Already fixed
- Added DELETE API endpoint
- Deletes files from server
- Updates registry.json
- Proper error handling

---

## 🧪 Testing Your Workflow

### Test Case 1: Basic Multi-Scene Generation

1. Upload 1-2 OCC UI screenshots
2. Paste your German prompt (4 Szenen)
3. **Expected**: Agent calls `generate_multiple_screens` with 4 descriptions
4. **Expected**: 4 separate `.tsx` files created
5. **Expected**: Preview page shows all 4 in sidebar

### Test Case 2: Style Consistency

1. Upload OCC screenshots with specific color scheme (e.g., dark blue, orange accents)
2. Generate 4 scenes
3. **Expected**: All 4 components use the same colors/style from uploaded images

### Test Case 3: Preview Navigation

1. After generating 4 scenes
2. Open `/preview` page
3. **Expected**: 
   - Sidebar shows "OCCScene (4)"
   - Can click through scenes 1-4
   - Forward/back arrows work
   - No flickering

---

## 📋 Checklist for Your Specific Use Case

- ✅ Agent system prompt mentions "Szene" detection
- ✅ `generate_multiple_screens` tool exists and works
- ✅ Preview page groups components correctly
- ✅ Preview page has navigation arrows
- ✅ Components saved to proper directory
- ✅ Registry.json updated with metadata
- ⚠️ **TO VERIFY**: Agent actually calls `generate_multiple_screens` for your German prompt
- ⚠️ **TO VERIFY**: Style from uploaded images is extracted and applied

---

## 🔧 Recommended Next Steps

### 1. Test the Full Workflow

Run your exact scenario:
```bash
# Start backend
cd c:\Projekte\hackathon
langgraph dev

# Start frontend (separate terminal)
cd c:\Projekte\hackathon\frontend
npm run dev
```

### 2. Check Agent Logs

When you submit your prompt, watch the terminal for:
```
🔄 [GENERATE_MULTIPLE_SCREENS] Starting: Generating 4 screens
🔄 [GENERATE_MULTIPLE_SCREENS] Screen 1/4: Szene 1...
```

If you DON'T see this, the agent is not detecting multi-scene intent.

### 3. Verify Tool Call

Check if agent response shows:
```
Tool: generate_multiple_screens
Args: {
  "screen_descriptions": [...],
  "base_component_name": "OCCScene"
}
```

### 4. Check Generated Files

After generation:
```
frontend/src/generated/components/
  - OCCScene1.tsx  ← Should exist
  - OCCScene2.tsx  ← Should exist
  - OCCScene3.tsx  ← Should exist
  - OCCScene4.tsx  ← Should exist

frontend/src/generated/registry.json  ← Should list all 4
```

---

## 💡 If Multi-Scene Detection Fails

### Manual Override

If the agent doesn't automatically detect your German prompt as multi-scene, you can:

**Option A**: Make the prompt more explicit:
```
Create 4 SEPARATE screens. DO NOT create one interactive app.

Screen 1: [Szene 1 description]
Screen 2: [Szene 2 description]
Screen 3: [Szene 3 description]
Screen 4: [Szene 4 description]
```

**Option B**: Tell the agent explicitly:
```
Use the generate_multiple_screens tool to create 4 separate static components.
```

---

## 🎯 Summary

**Your app is CORRECTLY architected** for the workflow you described. The key components are:

1. ✅ Multi-scene detection in agent
2. ✅ `generate_multiple_screens` tool
3. ✅ Preview page with navigation
4. ✅ Component storage and registry

**The main thing to verify**: Does the agent actually recognize your German prompt and call the right tool?

**Test by**: Submitting your exact prompt and checking backend logs for `GENERATE_MULTIPLE_SCREENS` messages.

If it's NOT calling the multi-screen tool, we need to adjust the agent's prompt parsing logic to better detect German scene descriptions.
