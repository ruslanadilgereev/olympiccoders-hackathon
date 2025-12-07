"""Chart and Run History Helpers.

This module provides tools for generating trend charts and run history
components that are REQUIRED for the Design Automation Challenge.

Every use case should include:
- Trend Charts (transfers over time, carveout volume, etc.)
- Run History (past analyses with status, timestamp, results)
"""

import json
import time
from typing import Optional
from langchain_core.tools import tool
from google import genai
from google.genai import types

from app.config import GOOGLE_API_KEY
from app.tools.code_generator import save_to_sandbox

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


@tool
def generate_trend_chart_component(
    metric_name: str,
    time_range: str = "7 days",
    chart_type: str = "line",
    mock_data_points: int = 10,
    style_description: Optional[str] = None,
) -> dict:
    """
    Generate a React component for a trend chart.
    
    Creates a self-contained trend chart component with mock data.
    Use this when building dashboards that need to show metrics over time.
    
    Args:
        metric_name: Name of the metric to display (e.g., "Transfers", "Carveout Volume")
        time_range: Time range label (e.g., "7 days", "30 days", "1 year")
        chart_type: Type of chart ("line", "bar", "area")
        mock_data_points: Number of mock data points to generate
        style_description: Optional style hints (e.g., "dark theme", "minimal")
    
    Returns:
        dict containing:
        - success: Boolean
        - code: The React component code
        - component_name: Name of the generated component
    """
    try:
        log_progress("TREND_CHART", "Starting", f"Metric: {metric_name}")
        
        prompt = f"""Generate a React + Tailwind CSS trend chart component.

REQUIREMENTS:
- Metric Name: {metric_name}
- Time Range: {time_range}
- Chart Type: {chart_type}
- Include {mock_data_points} mock data points
- Style: {style_description or "modern, clean, dark-theme friendly"}

The component should:
1. Use SVG for the chart (no external charting libraries)
2. Show the metric value prominently
3. Display the trend (up/down arrow with percentage)
4. Include axis labels and grid lines
5. Support hover states on data points
6. Be fully self-contained with TypeScript
7. Use Tailwind CSS for styling
8. Include realistic mock data for {metric_name}
9. Show the time range label

Generate complete, runnable React code with a default export."""

        log_progress("TREND_CHART", "Step 1/2", "Generating component...")
        
        component_schema = {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "Complete React + Tailwind component code"
                },
                "component_name": {
                    "type": "string",
                    "description": "Name of the component"
                }
            },
            "required": ["code", "component_name"]
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
        
        log_progress("TREND_CHART", "Step 2/2", "Processing response...")
        
        result = json.loads(response.text)
        code = result.get("code", "")
        component_name = result.get("component_name", f"{metric_name.replace(' ', '')}TrendChart")
        
        log_progress("TREND_CHART", "Complete", f"Generated {len(code)} chars")
        
        # Save to sandbox
        log_progress("TREND_CHART", "Saving", f"Saving {component_name} to sandbox...")
        sandbox_result = save_to_sandbox(code, component_name, f"Trend chart for {metric_name}")
        
        preview_url = "/preview"
        file_path = f"src/generated/components/{component_name}.tsx"
        component_id = None
        
        if sandbox_result.get("success"):
            preview_url = sandbox_result.get("previewUrl", preview_url)
            file_path = sandbox_result.get("filePath", file_path)
            component_id = sandbox_result.get("component", {}).get("id")
            print(f"  📁 [SANDBOX] Saved to: {file_path}")
        else:
            print(f"  ⚠️ [SANDBOX] Save failed: {sandbox_result.get('error')}")
        
        return {
            "success": True,
            "code": code,
            "component_name": component_name,
            "component_id": component_id,
            "preview_url": f"http://localhost:3000{preview_url}",
            "file_path": file_path,
            "ai_notes": f"Generated trend chart component for '{metric_name}' showing {time_range} data.",
        }
        
    except Exception as e:
        error_msg = str(e)
        log_progress("TREND_CHART", "Error", error_msg)
        return {
            "success": False,
            "error": f"Failed to generate trend chart: {error_msg}",
        }


@tool
def generate_run_history_component(
    entity_type: str = "Analysis",
    columns: Optional[list[str]] = None,
    mock_rows: int = 5,
    include_status_badges: bool = True,
    style_description: Optional[str] = None,
) -> dict:
    """
    Generate a React component for displaying run history.
    
    Creates a table/list component showing past runs/analyses with
    timestamps, status, and results. Essential for any operational dashboard.
    
    Args:
        entity_type: Type of entity being tracked (e.g., "Analysis", "Transfer", "Carveout")
        columns: Custom columns to include. Default: ["Timestamp", "Status", "Duration", "Results"]
        mock_rows: Number of mock history rows to include
        include_status_badges: Whether to show colored status badges
        style_description: Optional style hints
    
    Returns:
        dict containing:
        - success: Boolean
        - code: The React component code
        - component_name: Name of the generated component
    """
    try:
        log_progress("RUN_HISTORY", "Starting", f"Entity: {entity_type}")
        
        default_columns = ["Timestamp", "Status", "Duration", "Results", "Actions"]
        cols = columns or default_columns
        
        prompt = f"""Generate a React + Tailwind CSS run history table component.

REQUIREMENTS:
- Entity Type: {entity_type}
- Columns: {', '.join(cols)}
- Include {mock_rows} mock history rows
- Status badges: {include_status_badges}
- Style: {style_description or "modern table with hover states, dark-theme friendly"}

The component should:
1. Display a table with the specified columns
2. Include realistic mock data for {entity_type} runs
3. Show status badges (Success=green, Failed=red, Running=blue, Pending=yellow)
4. Format timestamps nicely (e.g., "2 hours ago", "Dec 5, 2024")
5. Include duration in human-readable format
6. Show results summary or link
7. Optional action buttons (View Details, Re-run)
8. Support sorting by clicking column headers
9. Be fully self-contained with TypeScript
10. Use Tailwind CSS for styling

Mock data should include various statuses: some successful, some failed, one running.

Generate complete, runnable React code with a default export."""

        log_progress("RUN_HISTORY", "Step 1/2", "Generating component...")
        
        component_schema = {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "Complete React + Tailwind component code"
                },
                "component_name": {
                    "type": "string",
                    "description": "Name of the component"
                }
            },
            "required": ["code", "component_name"]
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
        
        log_progress("RUN_HISTORY", "Step 2/2", "Processing response...")
        
        result = json.loads(response.text)
        code = result.get("code", "")
        component_name = result.get("component_name", f"{entity_type.replace(' ', '')}History")
        
        log_progress("RUN_HISTORY", "Complete", f"Generated {len(code)} chars")
        
        # Save to sandbox
        log_progress("RUN_HISTORY", "Saving", f"Saving {component_name} to sandbox...")
        sandbox_result = save_to_sandbox(code, component_name, f"Run history for {entity_type}")
        
        preview_url = "/preview"
        file_path = f"src/generated/components/{component_name}.tsx"
        component_id = None
        
        if sandbox_result.get("success"):
            preview_url = sandbox_result.get("previewUrl", preview_url)
            file_path = sandbox_result.get("filePath", file_path)
            component_id = sandbox_result.get("component", {}).get("id")
            print(f"  📁 [SANDBOX] Saved to: {file_path}")
        else:
            print(f"  ⚠️ [SANDBOX] Save failed: {sandbox_result.get('error')}")
        
        return {
            "success": True,
            "code": code,
            "component_name": component_name,
            "component_id": component_id,
            "preview_url": f"http://localhost:3000{preview_url}",
            "file_path": file_path,
            "ai_notes": f"Generated run history component for '{entity_type}' with {mock_rows} mock entries.",
        }
        
    except Exception as e:
        error_msg = str(e)
        log_progress("RUN_HISTORY", "Error", error_msg)
        return {
            "success": False,
            "error": f"Failed to generate run history: {error_msg}",
        }


@tool
def generate_dashboard_with_charts(
    dashboard_name: str,
    metrics: list[str],
    include_run_history: bool = True,
    entity_type: str = "Analysis",
    style_description: Optional[str] = None,
) -> dict:
    """
    Generate a complete dashboard component with trend charts and run history.
    
    Creates an all-in-one dashboard component that includes:
    - Multiple trend charts for specified metrics
    - Run history table
    - Summary statistics
    
    This is the recommended way to create dashboards for the Design Automation Challenge.
    
    Args:
        dashboard_name: Name for the dashboard (e.g., "DQAI Dashboard", "Transfer Overview")
        metrics: List of metrics to show as charts (e.g., ["Transfers", "Success Rate", "Volume"])
        include_run_history: Whether to include run history section
        entity_type: Type of entity for run history
        style_description: Optional style hints
    
    Returns:
        dict containing:
        - success: Boolean
        - code: The React component code
        - component_name: Name of the generated component
    """
    try:
        log_progress("DASHBOARD", "Starting", f"Dashboard: {dashboard_name}")
        
        prompt = f"""Generate a complete React + Tailwind CSS dashboard component.

DASHBOARD: {dashboard_name}
METRICS TO DISPLAY: {', '.join(metrics)}
INCLUDE RUN HISTORY: {include_run_history}
ENTITY TYPE: {entity_type}
STYLE: {style_description or "modern, professional, dark-theme with blue accents"}

The dashboard should include:

1. HEADER SECTION:
   - Dashboard title
   - Time range selector (mock)
   - Refresh button

2. SUMMARY CARDS:
   - One card per metric showing current value and trend
   - Icons and colors to indicate health

3. TREND CHARTS SECTION:
   - One chart per metric showing data over time
   - Use SVG-based charts (no external libraries)
   - Responsive grid layout (2-3 charts per row)

4. RUN HISTORY SECTION (if enabled):
   - Table showing past runs
   - Status badges, timestamps, duration
   - Mock data with various statuses

5. TECHNICAL REQUIREMENTS:
   - TypeScript with proper types
   - Tailwind CSS for all styling
   - Self-contained (no external dependencies except React)
   - Realistic mock data
   - Responsive design
   - Hover states and subtle animations

Generate complete, runnable React code with a default export."""

        log_progress("DASHBOARD", "Step 1/2", "Generating component...")
        
        component_schema = {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "Complete React + Tailwind component code"
                },
                "component_name": {
                    "type": "string",
                    "description": "Name of the component"
                },
                "description": {
                    "type": "string",
                    "description": "Brief description of the dashboard"
                }
            },
            "required": ["code", "component_name"]
        }
        
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=16384,
                response_mime_type="application/json",
                response_schema=component_schema,
            ),
        )
        
        log_progress("DASHBOARD", "Step 2/2", "Processing response...")
        
        result = json.loads(response.text)
        code = result.get("code", "")
        component_name = result.get("component_name", dashboard_name.replace(" ", "") + "Dashboard")
        
        log_progress("DASHBOARD", "Complete", f"Generated {len(code)} chars")
        
        # Save to sandbox
        log_progress("DASHBOARD", "Saving", f"Saving {component_name} to sandbox...")
        sandbox_result = save_to_sandbox(code, component_name, f"Dashboard: {dashboard_name}")
        
        preview_url = "/preview"
        file_path = f"src/generated/components/{component_name}.tsx"
        component_id = None
        
        if sandbox_result.get("success"):
            preview_url = sandbox_result.get("previewUrl", preview_url)
            file_path = sandbox_result.get("filePath", file_path)
            component_id = sandbox_result.get("component", {}).get("id")
            print(f"  📁 [SANDBOX] Saved to: {file_path}")
        else:
            print(f"  ⚠️ [SANDBOX] Save failed: {sandbox_result.get('error')}")
        
        return {
            "success": True,
            "code": code,
            "component_name": component_name,
            "component_id": component_id,
            "preview_url": f"http://localhost:3000{preview_url}",
            "file_path": file_path,
            "description": result.get("description", ""),
            "metrics_included": metrics,
            "has_run_history": include_run_history,
            "ai_notes": f"Generated dashboard '{dashboard_name}' with {len(metrics)} metrics" + 
                       (" and run history" if include_run_history else ""),
        }
        
    except Exception as e:
        error_msg = str(e)
        log_progress("DASHBOARD", "Error", error_msg)
        return {
            "success": False,
            "error": f"Failed to generate dashboard: {error_msg}",
        }


