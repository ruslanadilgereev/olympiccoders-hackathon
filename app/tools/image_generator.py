"""Gemini/Imagen Image Generator Tool for design generation."""

import base64
import os
import uuid
from typing import Optional
from datetime import datetime

from langchain_core.tools import tool
from google import genai
from google.genai import types

from app.config import GOOGLE_API_KEY


# Initialize Gemini client
client = genai.Client(api_key=GOOGLE_API_KEY)

# Store generated images in memory for the session
_generated_images: dict[str, dict] = {}


def _save_image(image_data: bytes, filename: str) -> str:
    """Save image to the outputs directory and return the path."""
    output_dir = os.path.join(os.path.dirname(__file__), "..", "..", "outputs")
    os.makedirs(output_dir, exist_ok=True)
    
    filepath = os.path.join(output_dir, filename)
    with open(filepath, "wb") as f:
        f.write(image_data)
    
    return filepath


@tool
def generate_design_image(
    prompt: str,
    style_context: Optional[str] = None,
    design_type: str = "ui_mockup",
    aspect_ratio: str = "16:9",
) -> dict:
    """
    Generate a new design image using Gemini 3 Pro Image or Imagen 4.
    
    This tool creates UI mockups, marketing banners, app screens, and other
    design assets based on a text description and optional style context.
    
    Args:
        prompt: Detailed description of the design to generate. Be specific about
                layout, colors, elements, and purpose.
        style_context: Optional style information extracted from existing designs
                      (colors, typography, layout patterns). Pass the output from
                      analyze_design_style here for consistent branding.
        design_type: Type of design to generate. Options:
                    - "ui_mockup": Mobile or web app screen
                    - "marketing_banner": Promotional banner or ad
                    - "landing_page": Website landing page section
                    - "icon_set": App icons or UI icons
                    - "user_flow": Multi-screen user flow diagram
                    - "dashboard": Data dashboard or admin panel
        aspect_ratio: Image aspect ratio. Options: "1:1", "16:9", "9:16", "4:3", "3:4"
    
    Returns:
        dict with:
        - image_id: Unique identifier for the generated image
        - image_base64: Base64 encoded image data
        - filepath: Path where the image was saved
        - metadata: Generation metadata including prompt and settings
    """
    # Build the full prompt with design expertise
    system_prompt = """You are an expert UI/UX designer creating high-fidelity design mockups.
Generate clean, modern, professional designs with:
- Clear visual hierarchy
- Consistent spacing and alignment
- Modern typography
- Appropriate color contrast
- Professional polish suitable for production use"""

    # Add style context if provided
    full_prompt = f"{system_prompt}\n\n"
    
    if style_context:
        full_prompt += f"STYLE GUIDE TO FOLLOW:\n{style_context}\n\n"
    
    # Add design type specific instructions
    design_instructions = {
        "ui_mockup": "Create a pixel-perfect mobile or web app UI screen with realistic content, proper spacing, and interactive elements clearly visible.",
        "marketing_banner": "Design an eye-catching marketing banner with bold typography, compelling visuals, and a clear call-to-action.",
        "landing_page": "Create a modern landing page section with hero imagery, headline, subtext, and CTA button.",
        "icon_set": "Design a cohesive set of icons with consistent style, stroke width, and visual language.",
        "user_flow": "Create a multi-screen user flow showing connected app screens with navigation arrows.",
        "dashboard": "Design a data-rich dashboard with charts, metrics cards, and organized data visualization.",
    }
    
    full_prompt += f"DESIGN TYPE: {design_type}\n"
    full_prompt += f"INSTRUCTIONS: {design_instructions.get(design_type, design_instructions['ui_mockup'])}\n\n"
    full_prompt += f"USER REQUEST:\n{prompt}"

    try:
        # Try Gemini 3 Pro Image first (native image generation with text understanding)
        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=full_prompt,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )
        
        # Extract image from response
        image_data = None
        response_text = ""
        
        for part in response.candidates[0].content.parts:
            if hasattr(part, "inline_data") and part.inline_data:
                image_data = part.inline_data.data
            elif hasattr(part, "text") and part.text:
                response_text = part.text
        
        if not image_data:
            # Fallback to Imagen 4 for pure image generation
            return _generate_with_imagen(full_prompt, aspect_ratio, design_type)
        
        # Generate unique ID and save image
        image_id = f"design_{uuid.uuid4().hex[:8]}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        filename = f"{image_id}.png"
        filepath = _save_image(image_data, filename)
        
        # Store in memory
        image_base64 = base64.b64encode(image_data).decode("utf-8")
        _generated_images[image_id] = {
            "image_base64": image_base64,
            "filepath": filepath,
            "prompt": prompt,
            "design_type": design_type,
            "created_at": datetime.now().isoformat(),
        }
        
        return {
            "success": True,
            "image_id": image_id,
            "image_base64": image_base64,
            "filepath": filepath,
            "ai_notes": response_text,
            "model_used": "gemini-3-pro-image-preview",
            "metadata": {
                "prompt": prompt,
                "design_type": design_type,
                "aspect_ratio": aspect_ratio,
                "style_context_used": bool(style_context),
            },
        }
        
    except Exception as e:
        # Try Imagen 4 as fallback
        try:
            return _generate_with_imagen(full_prompt, aspect_ratio, design_type)
        except Exception as e2:
            return {
                "error": f"Image generation failed: {str(e)}. Imagen fallback also failed: {str(e2)}",
                "prompt": prompt,
            }


def _generate_with_imagen(prompt: str, aspect_ratio: str, design_type: str) -> dict:
    """Generate image using Imagen 4 model."""
    response = client.models.generate_images(
        model="imagen-4.0-generate-001",
        prompt=prompt,
        config=types.GenerateImagesConfig(
            number_of_images=1,
            aspect_ratio=aspect_ratio,
            safety_filter_level="BLOCK_ONLY_HIGH",
        ),
    )
    
    if not response.generated_images:
        return {
            "error": "No image was generated by Imagen",
            "prompt": prompt,
        }
    
    # Get the generated image
    generated_image = response.generated_images[0]
    image_bytes = generated_image.image.image_bytes
    
    # Generate unique ID and save image
    image_id = f"design_{uuid.uuid4().hex[:8]}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    filename = f"{image_id}.png"
    filepath = _save_image(image_bytes, filename)
    
    # Store in memory
    image_base64 = base64.b64encode(image_bytes).decode("utf-8")
    _generated_images[image_id] = {
        "image_base64": image_base64,
        "filepath": filepath,
        "prompt": prompt,
        "design_type": design_type,
        "created_at": datetime.now().isoformat(),
    }
    
    return {
        "success": True,
        "image_id": image_id,
        "image_base64": image_base64,
        "filepath": filepath,
        "ai_notes": "Image generated successfully using Imagen 4",
        "model_used": "imagen-4.0-generate-001",
        "metadata": {
            "prompt": prompt,
            "design_type": design_type,
            "aspect_ratio": aspect_ratio,
        },
    }


@tool  
def get_generated_image(image_id: str) -> dict:
    """
    Retrieve a previously generated image by its ID.
    
    Args:
        image_id: The unique identifier returned from generate_design_image
        
    Returns:
        dict with image data and metadata, or error if not found
    """
    if image_id in _generated_images:
        return {
            "success": True,
            **_generated_images[image_id],
        }
    return {
        "error": f"Image with ID '{image_id}' not found",
        "available_ids": list(_generated_images.keys()),
    }


@tool
def list_generated_images() -> dict:
    """
    List all images generated in the current session.
    
    Returns:
        dict with list of image IDs and their metadata (without full image data)
    """
    return {
        "count": len(_generated_images),
        "images": [
            {
                "image_id": img_id,
                "design_type": data["design_type"],
                "prompt": data["prompt"][:100] + "..." if len(data["prompt"]) > 100 else data["prompt"],
                "created_at": data["created_at"],
                "filepath": data["filepath"],
            }
            for img_id, data in _generated_images.items()
        ],
    }
