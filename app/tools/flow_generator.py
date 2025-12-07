"""Flow/Process Diagram Generator Tool.

This module provides tools for generating process flow diagrams
with nodes, edges, and swimlanes - essential for visualizing
complex workflows like DQAI and Carveout processes.
"""

import json
import time
from typing import Optional
from langchain_core.tools import tool
from google import genai
from google.genai import types

from app.config import GOOGLE_API_KEY

# Initialize Gemini client
client = genai.Client(
    api_key=GOOGLE_API_KEY,
    http_options={"timeout": 60000},
)

GEMINI_MODEL = "gemini-2.5-pro"


def log_progress(tool_name: str, step: str, details: str = ""):
    """Log progress for tool execution."""
    timestamp = time.strftime("%H:%M:%S")
    if details:
        print(f"  [{timestamp}] 🔄 [{tool_name}] {step}: {details}")
    else:
        print(f"  [{timestamp}] 🔄 [{tool_name}] {step}")


# Schema for flow specification
FLOW_SPEC_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {
            "type": "string",
            "description": "Title of the flow diagram"
        },
        "description": {
            "type": "string",
            "description": "Brief description of the flow"
        },
        "swimlanes": {
            "type": "array",
            "items": {"type": "string"},
            "description": "List of swimlane labels (actors/systems)"
        },
        "nodes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "label": {"type": "string"},
                    "type": {
                        "type": "string",
                        "enum": ["start", "end", "process", "decision", "data", "manual"]
                    },
                    "swimlane": {"type": "string"},
                    "description": {"type": "string"}
                },
                "required": ["id", "label", "type", "swimlane"]
            },
            "description": "List of nodes in the flow"
        },
        "edges": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "from": {"type": "string"},
                    "to": {"type": "string"},
                    "label": {"type": "string"},
                    "condition": {"type": "string"}
                },
                "required": ["from", "to"]
            },
            "description": "List of connections between nodes"
        }
    },
    "required": ["title", "swimlanes", "nodes", "edges"]
}


@tool
def generate_flow_spec(
    use_case: str,
    steps: Optional[list[str]] = None,
    actors: Optional[list[str]] = None,
    additional_context: Optional[str] = None,
) -> dict:
    """
    Generate a structured flow/process diagram specification.
    
    Creates a JSON specification for a process flow diagram with nodes,
    edges, and swimlanes. This is useful for visualizing complex workflows
    like DQAI data transfer or Carveout processes.
    
    Args:
        use_case: Name of the use case (e.g., "DQAI", "Carveout", "Data Transfer")
        steps: Optional list of high-level steps to include in the flow
        actors: Optional list of actors/systems involved (for swimlanes)
                e.g., ["OCC", "Export Handling App", "Mediator", "IMP"]
        additional_context: Optional additional context or requirements
    
    Returns:
        dict containing:
        - success: Boolean
        - flow_spec: The complete flow specification as JSON
        - node_count: Number of nodes generated
        - swimlanes: List of swimlanes
    """
    try:
        log_progress("GENERATE_FLOW_SPEC", "Starting", f"Use case: {use_case}")
        
        # Build prompt for flow generation
        prompt = f"""Generate a structured process flow diagram specification for the following use case:

USE CASE: {use_case}
"""
        
        if steps:
            prompt += f"\nSTEPS TO INCLUDE:\n" + "\n".join(f"- {s}" for s in steps)
        
        if actors:
            prompt += f"\nACTORS/SYSTEMS (use as swimlanes):\n" + "\n".join(f"- {a}" for a in actors)
        else:
            # Default actors for common use cases
            if "DQAI" in use_case.upper() or "DATA TRANSFER" in use_case.upper():
                prompt += """
ACTORS/SYSTEMS (use as swimlanes):
- OCC (Operations Control Center)
- Export Handling App
- Mediator
- JiVS IMP (Import)
"""
            elif "CARVEOUT" in use_case.upper():
                prompt += """
ACTORS/SYSTEMS (use as swimlanes):
- User
- Carveout System
- Data Store
- Results Handler
"""
        
        if additional_context:
            prompt += f"\nADDITIONAL CONTEXT:\n{additional_context}"
        
        prompt += """

Generate a complete flow specification with:
1. Clear start and end nodes
2. Process nodes for each major step
3. Decision nodes where the flow branches
4. Data nodes for data stores or databases
5. Edges connecting all nodes with appropriate labels
6. Each node assigned to the correct swimlane

Make the flow comprehensive but not overwhelming (aim for 8-15 nodes).

Return the flow specification in the structured JSON format specified."""
        
        log_progress("GENERATE_FLOW_SPEC", "Step 1/2", "Calling Gemini API...")
        
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.4,
                max_output_tokens=4096,
                response_mime_type="application/json",
                response_schema=FLOW_SPEC_SCHEMA,
            ),
        )
        
        log_progress("GENERATE_FLOW_SPEC", "Step 2/2", "Processing response...")
        
        flow_spec = json.loads(response.text)
        
        log_progress("GENERATE_FLOW_SPEC", "Complete", 
                    f"Generated {len(flow_spec.get('nodes', []))} nodes, {len(flow_spec.get('swimlanes', []))} swimlanes")
        
        return {
            "success": True,
            "flow_spec": flow_spec,
            "node_count": len(flow_spec.get("nodes", [])),
            "edge_count": len(flow_spec.get("edges", [])),
            "swimlanes": flow_spec.get("swimlanes", []),
            "ai_notes": f"Generated flow diagram '{flow_spec.get('title')}' with {len(flow_spec.get('nodes', []))} nodes across {len(flow_spec.get('swimlanes', []))} swimlanes.",
        }
        
    except Exception as e:
        error_msg = str(e)
        log_progress("GENERATE_FLOW_SPEC", "Error", error_msg)
        return {
            "success": False,
            "error": f"Failed to generate flow spec: {error_msg}",
        }


@tool
def generate_flow_component(
    flow_spec: dict,
    component_name: str = "FlowDiagram",
    style_variant: str = "default",
) -> dict:
    """
    Generate a React component that renders a flow diagram from a flow specification.
    
    Takes a flow specification (from generate_flow_spec) and creates a React
    component that visualizes the flow diagram.
    
    Args:
        flow_spec: The flow specification dictionary with nodes, edges, swimlanes
        component_name: Name for the generated component
        style_variant: Visual style variant ("default", "dark", "minimal")
    
    Returns:
        dict containing:
        - success: Boolean
        - code: The React component code
        - component_name: Name of the generated component
    """
    try:
        log_progress("GENERATE_FLOW_COMPONENT", "Starting", f"Component: {component_name}")
        
        # Build prompt for component generation
        prompt = f"""Generate a React + Tailwind CSS component that renders a process flow diagram.

FLOW SPECIFICATION:
{json.dumps(flow_spec, indent=2)}

REQUIREMENTS:
1. Create a clean, professional flow diagram visualization
2. Use Tailwind CSS for all styling
3. Implement horizontal swimlanes (rows) for each actor/system
4. Show nodes as appropriate shapes:
   - start/end: Rounded pill shapes
   - process: Rectangles
   - decision: Diamond shapes (rotated squares)
   - data: Parallelograms or cylinder shapes
5. Draw edges as lines/arrows between nodes
6. Include labels on nodes and important edges
7. Use a color scheme that distinguishes different node types
8. Style variant: {style_variant}

TECHNICAL REQUIREMENTS:
- Use TypeScript
- No external diagram libraries (pure React + Tailwind + SVG)
- Component should be self-contained
- Include a legend explaining node types
- Make it responsive

Generate complete, runnable React code."""

        log_progress("GENERATE_FLOW_COMPONENT", "Step 1/2", "Generating component...")
        
        component_schema = {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "Complete React + Tailwind component code"
                },
                "description": {
                    "type": "string",
                    "description": "Brief description of the component"
                }
            },
            "required": ["code", "description"]
        }
        
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=8192,
                response_mime_type="application/json",
                response_schema=component_schema,
            ),
        )
        
        log_progress("GENERATE_FLOW_COMPONENT", "Step 2/2", "Processing response...")
        
        result = json.loads(response.text)
        code = result.get("code", "")
        
        log_progress("GENERATE_FLOW_COMPONENT", "Complete", f"Generated {len(code)} chars of code")
        
        return {
            "success": True,
            "code": code,
            "component_name": component_name,
            "description": result.get("description", ""),
            "ai_notes": f"Generated flow diagram component '{component_name}' visualizing the process flow.",
        }
        
    except Exception as e:
        error_msg = str(e)
        log_progress("GENERATE_FLOW_COMPONENT", "Error", error_msg)
        return {
            "success": False,
            "error": f"Failed to generate flow component: {error_msg}",
        }


# Pre-defined flow templates for common use cases
FLOW_TEMPLATES = {
    "dqai_transfer": {
        "title": "DQAI Data Transfer Flow",
        "description": "Data quality and transfer process between SAP and target systems",
        "swimlanes": ["OCC", "Export Handling App", "Mediator", "JiVS IMP"],
        "nodes": [
            {"id": "start", "label": "Start Transfer", "type": "start", "swimlane": "OCC"},
            {"id": "export_init", "label": "Initialize Export", "type": "process", "swimlane": "OCC"},
            {"id": "sap_export", "label": "SAP Data Export", "type": "data", "swimlane": "Export Handling App"},
            {"id": "validate", "label": "Validate Data", "type": "process", "swimlane": "Export Handling App"},
            {"id": "valid_check", "label": "Valid?", "type": "decision", "swimlane": "Export Handling App"},
            {"id": "transform", "label": "Transform Data", "type": "process", "swimlane": "Mediator"},
            {"id": "route", "label": "Route to Target", "type": "process", "swimlane": "Mediator"},
            {"id": "import", "label": "Import to IMP", "type": "data", "swimlane": "JiVS IMP"},
            {"id": "verify", "label": "Verify Import", "type": "process", "swimlane": "JiVS IMP"},
            {"id": "update_status", "label": "Update Status", "type": "process", "swimlane": "OCC"},
            {"id": "end_success", "label": "Transfer Complete", "type": "end", "swimlane": "OCC"},
            {"id": "end_error", "label": "Transfer Failed", "type": "end", "swimlane": "OCC"},
        ],
        "edges": [
            {"from": "start", "to": "export_init"},
            {"from": "export_init", "to": "sap_export"},
            {"from": "sap_export", "to": "validate"},
            {"from": "validate", "to": "valid_check"},
            {"from": "valid_check", "to": "transform", "label": "Yes"},
            {"from": "valid_check", "to": "end_error", "label": "No"},
            {"from": "transform", "to": "route"},
            {"from": "route", "to": "import"},
            {"from": "import", "to": "verify"},
            {"from": "verify", "to": "update_status"},
            {"from": "update_status", "to": "end_success"},
        ]
    },
    "carveout": {
        "title": "Carveout Process Flow",
        "description": "Data carveout and extraction process",
        "swimlanes": ["User", "Carveout System", "Data Store", "Results Handler"],
        "nodes": [
            {"id": "start", "label": "Start Carveout", "type": "start", "swimlane": "User"},
            {"id": "define_filter", "label": "Define Filters", "type": "manual", "swimlane": "User"},
            {"id": "validate_filter", "label": "Validate Filters", "type": "process", "swimlane": "Carveout System"},
            {"id": "filter_ok", "label": "Valid?", "type": "decision", "swimlane": "Carveout System"},
            {"id": "query_data", "label": "Query Data", "type": "data", "swimlane": "Data Store"},
            {"id": "extract", "label": "Extract Records", "type": "process", "swimlane": "Carveout System"},
            {"id": "transform", "label": "Transform Data", "type": "process", "swimlane": "Carveout System"},
            {"id": "package", "label": "Package Results", "type": "process", "swimlane": "Results Handler"},
            {"id": "generate_report", "label": "Generate Report", "type": "process", "swimlane": "Results Handler"},
            {"id": "end_success", "label": "Carveout Complete", "type": "end", "swimlane": "User"},
            {"id": "end_error", "label": "Carveout Failed", "type": "end", "swimlane": "User"},
        ],
        "edges": [
            {"from": "start", "to": "define_filter"},
            {"from": "define_filter", "to": "validate_filter"},
            {"from": "validate_filter", "to": "filter_ok"},
            {"from": "filter_ok", "to": "query_data", "label": "Yes"},
            {"from": "filter_ok", "to": "end_error", "label": "No"},
            {"from": "query_data", "to": "extract"},
            {"from": "extract", "to": "transform"},
            {"from": "transform", "to": "package"},
            {"from": "package", "to": "generate_report"},
            {"from": "generate_report", "to": "end_success"},
        ]
    }
}


@tool
def get_flow_template(template_name: str) -> dict:
    """
    Get a pre-defined flow template for common use cases.
    
    Args:
        template_name: Name of the template ("dqai_transfer" or "carveout")
    
    Returns:
        dict containing the flow specification template
    """
    template_name = template_name.lower().replace(" ", "_").replace("-", "_")
    
    if template_name in FLOW_TEMPLATES:
        return {
            "success": True,
            "flow_spec": FLOW_TEMPLATES[template_name],
            "ai_notes": f"Loaded pre-defined flow template: {template_name}",
        }
    
    return {
        "success": False,
        "error": f"Template '{template_name}' not found",
        "available_templates": list(FLOW_TEMPLATES.keys()),
    }


@tool
def list_flow_templates() -> dict:
    """
    List all available pre-defined flow templates.
    
    Returns:
        dict with list of available templates and their descriptions
    """
    templates = []
    for name, spec in FLOW_TEMPLATES.items():
        templates.append({
            "name": name,
            "title": spec.get("title"),
            "description": spec.get("description"),
            "node_count": len(spec.get("nodes", [])),
            "swimlanes": spec.get("swimlanes", []),
        })
    
    return {
        "success": True,
        "templates": templates,
        "count": len(templates),
        "ai_notes": f"Found {len(templates)} pre-defined flow templates.",
    }


# ============================================================================
# WORKFLOW PLAN TOOLS - For visual progress tracking of multi-screen generation
# ============================================================================

# Store active workflow plans for updates
_active_workflow_plans: dict[str, dict] = {}


def _generate_workflow_component_code(title: str, steps: list[dict]) -> str:
    """
    Generate a React component that displays a workflow plan with progress tracking.
    
    This creates a self-contained component with step data embedded,
    allowing updates by regenerating with modified step statuses.
    """
    # Serialize steps data for embedding in the component
    steps_json = json.dumps(steps, indent=2)
    
    component_code = f'''import React from 'react';

// Workflow Plan: {title}
// This component displays the generation workflow with progress tracking

interface WorkflowStep {{
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'complete';
  linkedComponentId?: string;
  linkedComponentName?: string;
}}

const workflowSteps: WorkflowStep[] = {steps_json};

const statusConfig = {{
  pending: {{
    bg: 'bg-zinc-800',
    border: 'border-zinc-600 border-dashed',
    text: 'text-zinc-400',
    icon: '○',
    iconColor: 'text-zinc-500',
  }},
  in_progress: {{
    bg: 'bg-blue-950',
    border: 'border-blue-500 border-solid',
    text: 'text-blue-300',
    icon: '◐',
    iconColor: 'text-blue-400 animate-pulse',
  }},
  complete: {{
    bg: 'bg-emerald-950',
    border: 'border-emerald-500 border-solid',
    text: 'text-emerald-300',
    icon: '✓',
    iconColor: 'text-emerald-400',
  }},
}};

export default function WorkflowPlan() {{
  const completedCount = workflowSteps.filter(s => s.status === 'complete').length;
  const progress = Math.round((completedCount / workflowSteps.length) * 100);

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        {{/* Header */}}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">📋 {title}</h1>
          <p className="text-zinc-400 mb-4">Generation Workflow Plan</p>
          
          {{/* Progress Bar */}}
          <div className="w-full bg-zinc-800 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{{{ width: `${{progress}}%` }}}}
            />
          </div>
          <p className="text-sm text-zinc-500">
            {{completedCount}} of {{workflowSteps.length}} steps complete ({{progress}}%)
          </p>
        </div>

        {{/* Workflow Steps */}}
        <div className="space-y-4">
          {{workflowSteps.map((step, index) => {{
            const config = statusConfig[step.status];
            return (
              <div key={{step.id}} className="relative">
                {{/* Connector Line */}}
                {{index < workflowSteps.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-8 bg-zinc-700" />
                )}}
                
                {{/* Step Card */}}
                <div 
                  className={{`${{config.bg}} ${{config.border}} border-2 rounded-xl p-4 transition-all duration-300`}}
                >
                  <div className="flex items-start gap-4">
                    {{/* Step Number & Icon */}}
                    <div className="flex flex-col items-center">
                      <div className={{`w-12 h-12 rounded-full ${{config.bg}} border-2 ${{config.border}} flex items-center justify-center`}}>
                        <span className={{`text-xl ${{config.iconColor}}`}}>{{config.icon}}</span>
                      </div>
                      <span className="text-xs text-zinc-500 mt-1">Step {{index + 1}}</span>
                    </div>
                    
                    {{/* Step Content */}}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={{`font-semibold ${{config.text}}`}}>{{step.title}}</h3>
                        {{step.status === 'complete' && step.linkedComponentName && (
                          <span className="text-xs bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded-full">
                            → {{step.linkedComponentName}}
                          </span>
                        )}}
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">{{step.description}}</p>
                      
                      {{/* Status Badge */}}
                      <div className="mt-2">
                        <span className={{`text-xs px-2 py-1 rounded ${{
                          step.status === 'pending' ? 'bg-zinc-700 text-zinc-400' :
                          step.status === 'in_progress' ? 'bg-blue-900 text-blue-300' :
                          'bg-emerald-900 text-emerald-300'
                        }}`}}>
                          {{step.status === 'pending' ? '⏳ Pending' :
                            step.status === 'in_progress' ? '🔄 In Progress' :
                            '✅ Complete'}}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }})}}
        </div>

        {{/* Legend */}}
        <div className="mt-8 p-4 bg-zinc-900 rounded-lg">
          <h4 className="text-sm font-medium text-zinc-400 mb-2">Legend</h4>
          <div className="flex gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">○</span>
              <span className="text-zinc-500">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">◐</span>
              <span className="text-zinc-500">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span className="text-zinc-500">Complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}}
'''
    return component_code


def _save_workflow_to_sandbox(code: str, name: str, description: str = "") -> dict:
    """Save workflow component to the frontend sandbox."""
    import urllib.request
    import urllib.error
    
    SANDBOX_API_URL = "http://localhost:3000/api/generate"
    
    try:
        data = {
            "code": code,
            "name": name,
            "prompt": description,
        }
        
        req_data = json.dumps(data).encode('utf-8')
        
        req = urllib.request.Request(
            SANDBOX_API_URL,
            data=req_data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        return {"success": False, "error": str(e)}


def _get_workflow_component_id() -> Optional[str]:
    """Find the current WorkflowPlan component ID by name."""
    import urllib.request
    import urllib.error
    
    SANDBOX_API_URL = "http://localhost:3000/api/generate"
    
    try:
        req = urllib.request.Request(SANDBOX_API_URL, method='GET')
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
            components = result.get("components", [])
            # Find WorkflowPlan by name
            for comp in components:
                if comp.get("name") == "WorkflowPlan" or comp.get("filename") == "WorkflowPlan.tsx":
                    return comp.get("id")
            return None
    except Exception as e:
        log_progress("WORKFLOW", "Warning", f"Could not find WorkflowPlan component: {e}")
        return None


def _update_workflow_in_sandbox(code: str, component_id: Optional[str] = None) -> dict:
    """Update existing workflow component in the sandbox.
    
    First tries to find the current WorkflowPlan component by name,
    since the ID can change when files are updated.
    
    IMPORTANT: This function updates the component code in-place,
    preserving the step statuses embedded in the code.
    """
    import urllib.request
    import urllib.error
    
    SANDBOX_API_URL = "http://localhost:3000/api/generate"
    
    try:
        # Always look up the current component ID by name (IDs can change!)
        current_id = _get_workflow_component_id()
        if not current_id:
            log_progress("WORKFLOW", "Warning", "WorkflowPlan component not found, creating new")
            # Create new - the code already contains the correct step statuses
            return _save_workflow_to_sandbox(code, "WorkflowPlan", "Workflow plan update")
        
        data = {"code": code}
        url = f"{SANDBOX_API_URL}?id={current_id}"
        req_data = json.dumps(data).encode('utf-8')
        
        req = urllib.request.Request(
            url,
            data=req_data,
            headers={'Content-Type': 'application/json'},
            method='PUT'
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        log_progress("WORKFLOW", "Error", f"Update failed: {e}")
        return {"success": False, "error": str(e)}


@tool
def generate_workflow_plan(
    task_description: str,
    steps: list[str],
    step_descriptions: Optional[list[str]] = None,
) -> dict:
    """
    Generate a visual workflow plan diagram for multi-screen generation tasks.
    
    CALL THIS FIRST when generating multiple screens! This creates a visual
    workflow diagram that shows all planned steps. The diagram is displayed
    in the preview panel and updates as you complete each step.
    
    Args:
        task_description: Brief description of the overall task 
                         (e.g., "Create 4 screens for user management flow")
        steps: List of step/screen names to generate
               (e.g., ["Login", "Dashboard", "Settings", "Profile"])
        step_descriptions: Optional list of descriptions for each step
                          (same length as steps)
    
    Returns:
        dict containing:
        - success: Boolean
        - workflow_id: ID to use with update_workflow_step
        - component_id: ID of the workflow diagram component
        - steps: List of step objects with their IDs
        - preview_url: URL to view the workflow diagram
    
    Example:
        generate_workflow_plan(
            task_description="User management screens",
            steps=["Login", "Dashboard", "Settings", "Profile"],
            step_descriptions=[
                "Login form with email and password",
                "Main dashboard with metrics",
                "User settings page",
                "User profile page"
            ]
        )
    """
    try:
        log_progress("GENERATE_WORKFLOW_PLAN", "Starting", f"Task: {task_description}")
        
        # Generate workflow ID
        workflow_id = f"workflow_{int(time.time())}"
        
        # Check if there's an existing active workflow with completed steps
        # Don't accidentally overwrite progress
        for existing_id, existing_workflow in _active_workflow_plans.items():
            existing_steps = existing_workflow.get("steps", [])
            completed_count = sum(1 for s in existing_steps if s.get("status") == "complete")
            if completed_count > 0:
                log_progress("GENERATE_WORKFLOW_PLAN", "Info", 
                            f"Found existing workflow '{existing_id}' with {completed_count} completed steps")
        
        # Build step objects with detailed descriptions connected to the task
        workflow_steps = []
        total_steps = len(steps)
        
        for i, step_name in enumerate(steps):
            step_desc = ""
            if step_descriptions and i < len(step_descriptions):
                step_desc = step_descriptions[i]
            else:
                # Generate rich, contextual 2-3 sentence descriptions connected to the overall task
                # The description explains: what it accomplishes, how it connects to the flow, key elements
                
                step_name_lower = step_name.lower()
                
                # Position-based context
                if i == 0:
                    position_context = f"As the first screen in '{task_description}', this establishes the visual foundation. "
                    flow_context = "All subsequent screens will inherit the header, navigation styling, and color palette defined here."
                elif i == total_steps - 1:
                    position_context = f"As the final step of '{task_description}', this screen concludes the workflow. "
                    flow_context = "It should provide clear completion feedback and any summary/result information."
                else:
                    prev_step = steps[i-1] if i > 0 else "the previous step"
                    position_context = f"Following '{prev_step}' in the '{task_description}' flow, this screen continues the user journey. "
                    flow_context = f"It maintains visual consistency while presenting the '{step_name}' functionality."
                
                # Content-based guidance based on common screen types
                if any(x in step_name_lower for x in ['login', 'signin', 'sign-in', 'auth']):
                    content_guidance = "Include email/password fields, submit button with primary accent color, and any branding elements. "
                elif any(x in step_name_lower for x in ['dashboard', 'home', 'overview']):
                    content_guidance = "Display key metrics, status cards, and quick action buttons. Use the table and card patterns from the reference. "
                elif any(x in step_name_lower for x in ['settings', 'config', 'preferences']):
                    content_guidance = "Organize settings into logical groups with clear labels. Include toggles, inputs, and save/cancel actions. "
                elif any(x in step_name_lower for x in ['profile', 'account', 'user']):
                    content_guidance = "Show user avatar, editable profile fields, and account management options. "
                elif any(x in step_name_lower for x in ['list', 'table', 'data']):
                    content_guidance = "Present data in a structured table format with headers, sorting, and action buttons per row. "
                elif any(x in step_name_lower for x in ['form', 'create', 'add', 'new']):
                    content_guidance = "Include input fields with proper labels, validation states, and submit/cancel buttons. "
                elif any(x in step_name_lower for x in ['detail', 'view', 'info']):
                    content_guidance = "Display detailed information with clear hierarchy, related data, and edit/action options. "
                elif any(x in step_name_lower for x in ['transfer', 'sync', 'export', 'import']):
                    content_guidance = "Show progress indicators, status badges, and control buttons (start/pause/stop). "
                elif any(x in step_name_lower for x in ['analysis', 'report', 'analytics']):
                    content_guidance = "Display charts, metrics, and analysis results with filtering options. "
                elif any(x in step_name_lower for x in ['test', 'acceptance', 'review']):
                    content_guidance = "Include checklist items, approval buttons, and status tracking elements. "
                elif any(x in step_name_lower for x in ['scope', 'plan', 'project']):
                    content_guidance = "Show project structure, scope items, and management controls. "
                elif any(x in step_name_lower for x in ['deploy', 'implementation', 'phase']):
                    content_guidance = "Display deployment status, system selection, and phase management controls. "
                elif any(x in step_name_lower for x in ['handover', 'complete', 'final']):
                    content_guidance = "Include summary information, completion confirmation, and next steps guidance. "
                else:
                    content_guidance = f"Include all UI elements appropriate for a '{step_name}' screen based on the design references. "
                
                step_desc = f"{position_context}{flow_context} {content_guidance}Match the exact colors, shadows, and button styles from the Business DNA."
            
            workflow_steps.append({
                "id": f"step-{i+1}",
                "title": step_name,
                "description": step_desc,
                "status": "pending",
                "linkedComponentId": None,
                "linkedComponentName": None,
            })
        
        log_progress("GENERATE_WORKFLOW_PLAN", "Step 1/3", f"Created {len(workflow_steps)} workflow steps")
        
        # Generate the React component
        log_progress("GENERATE_WORKFLOW_PLAN", "Step 2/3", "Generating workflow diagram component...")
        component_code = _generate_workflow_component_code(task_description, workflow_steps)
        
        # Save to sandbox
        log_progress("GENERATE_WORKFLOW_PLAN", "Step 3/3", "Saving to sandbox...")
        sandbox_result = _save_workflow_to_sandbox(
            component_code, 
            "WorkflowPlan",
            f"Workflow plan for: {task_description}"
        )
        
        component_id = None
        preview_url = "/preview"
        file_path = "src/generated/components/WorkflowPlan.tsx"
        
        if sandbox_result.get("success"):
            component_id = sandbox_result.get("component", {}).get("id")
            preview_url = sandbox_result.get("previewUrl", preview_url)
            file_path = sandbox_result.get("filePath", file_path)
            log_progress("GENERATE_WORKFLOW_PLAN", "Complete", f"Saved workflow diagram: {file_path}")
        else:
            log_progress("GENERATE_WORKFLOW_PLAN", "Warning", f"Sandbox save failed: {sandbox_result.get('error')}")
        
        # Store workflow data for updates
        _active_workflow_plans[workflow_id] = {
            "task_description": task_description,
            "steps": workflow_steps,
            "component_id": component_id,
        }
        
        return {
            "success": True,
            "workflow_id": workflow_id,
            "component_id": component_id,
            "steps": [{"id": s["id"], "title": s["title"]} for s in workflow_steps],
            "step_count": len(workflow_steps),
            "preview_url": f"http://localhost:3000{preview_url}",
            "file_path": file_path,
            "ai_notes": f"Created workflow plan with {len(workflow_steps)} steps. Use update_workflow_step(workflow_id='{workflow_id}', step_id='step-1', ...) after completing each screen.",
        }
        
    except Exception as e:
        error_msg = str(e)
        log_progress("GENERATE_WORKFLOW_PLAN", "Error", error_msg)
        return {
            "success": False,
            "error": f"Failed to generate workflow plan: {error_msg}",
        }


@tool
def update_workflow_step(
    workflow_id: str,
    step_id: str,
    status: str = "complete",
    linked_component_id: Optional[str] = None,
    linked_component_name: Optional[str] = None,
) -> dict:
    """
    Update a step in the workflow plan to show progress.
    
    Call this AFTER completing each screen generation to update the workflow
    diagram. The step will be marked with the new status (green for complete)
    and can optionally link to the generated component.
    
    Args:
        workflow_id: The workflow_id returned from generate_workflow_plan
        step_id: The step ID to update (e.g., "step-1", "step-2")
        status: New status - "pending", "in_progress", or "complete"
        linked_component_id: Optional ID of the generated component to link
        linked_component_name: Optional name of the generated component to display
    
    Returns:
        dict containing:
        - success: Boolean
        - step_updated: The step ID that was updated
        - new_status: The new status
        - progress: Current completion percentage
    
    Example:
        # After generating LoginScreen with component_id "abc123":
        update_workflow_step(
            workflow_id="workflow_123",
            step_id="step-1",
            status="complete",
            linked_component_id="abc123",
            linked_component_name="LoginScreen"
        )
    """
    try:
        log_progress("UPDATE_WORKFLOW_STEP", "Starting", f"Workflow: {workflow_id}, Step: {step_id} → {status}")
        
        # Get workflow data
        if workflow_id not in _active_workflow_plans:
            return {
                "success": False,
                "error": f"Workflow '{workflow_id}' not found. Available: {list(_active_workflow_plans.keys())}",
            }
        
        workflow = _active_workflow_plans[workflow_id]
        steps = workflow["steps"]
        component_id = workflow.get("component_id")
        
        # Find and update the step (with regression protection)
        step_found = False
        for step in steps:
            if step["id"] == step_id:
                # CRITICAL: Never allow status regression from "complete" to anything else
                # This prevents the bug where completed steps turn grey again
                current_status = step.get("status", "pending")
                if current_status == "complete" and status != "complete":
                    log_progress("UPDATE_WORKFLOW_STEP", "Warning", 
                                f"Prevented status regression: {step_id} staying 'complete' (tried to set '{status}')")
                    # Keep it complete, but still update linked component info if provided
                    if linked_component_id:
                        step["linkedComponentId"] = linked_component_id
                    if linked_component_name:
                        step["linkedComponentName"] = linked_component_name
                else:
                    step["status"] = status
                    if linked_component_id:
                        step["linkedComponentId"] = linked_component_id
                    if linked_component_name:
                        step["linkedComponentName"] = linked_component_name
                step_found = True
                break
        
        if not step_found:
            return {
                "success": False,
                "error": f"Step '{step_id}' not found in workflow. Available: {[s['id'] for s in steps]}",
            }
        
        log_progress("UPDATE_WORKFLOW_STEP", "Step 1/2", f"Updated step {step_id} to {status}")
        
        # Calculate progress
        completed = sum(1 for s in steps if s["status"] == "complete")
        progress = round((completed / len(steps)) * 100)
        
        # Regenerate and update the component
        if component_id:
            log_progress("UPDATE_WORKFLOW_STEP", "Step 2/2", "Updating workflow diagram...")
            component_code = _generate_workflow_component_code(workflow["task_description"], steps)
            update_result = _update_workflow_in_sandbox(component_code, component_id)
            
            if update_result.get("success"):
                log_progress("UPDATE_WORKFLOW_STEP", "Complete", f"Progress: {progress}%")
            else:
                log_progress("UPDATE_WORKFLOW_STEP", "Warning", f"Update failed: {update_result.get('error')}")
        
        return {
            "success": True,
            "step_updated": step_id,
            "new_status": status,
            "progress": progress,
            "completed_steps": completed,
            "total_steps": len(steps),
            "ai_notes": f"Step '{step_id}' marked as {status}. Progress: {completed}/{len(steps)} ({progress}%)",
        }
        
    except Exception as e:
        error_msg = str(e)
        log_progress("UPDATE_WORKFLOW_STEP", "Error", error_msg)
        return {
            "success": False,
            "error": f"Failed to update workflow step: {error_msg}",
        }


