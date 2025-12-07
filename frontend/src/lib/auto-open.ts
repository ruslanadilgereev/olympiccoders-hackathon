/**
 * Auto-open functionality for generated components
 */

const PREVIEW_BASE_URL = typeof window !== 'undefined' 
  ? `${window.location.origin}/preview`
  : 'http://localhost:3000/preview';

/**
 * Open the preview page for a generated component
 */
export function openPreview(componentId?: string) {
  const url = componentId 
    ? `${PREVIEW_BASE_URL}?id=${componentId}`
    : PREVIEW_BASE_URL;
  
  // Open in new tab
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Open preview in same window
 */
export function navigateToPreview(componentId?: string) {
  const url = componentId 
    ? `${PREVIEW_BASE_URL}?id=${componentId}`
    : PREVIEW_BASE_URL;
  
  window.location.href = url;
}

/**
 * Save code to the API (for persistence and live preview polling)
 * Does NOT auto-open a new tab - the inline preview handles display
 */
export async function saveAndPreview(
  code: string,
  name?: string,
  prompt?: string,
  threadId?: string
): Promise<{ success: boolean; componentId?: string; previewUrl?: string; error?: string }> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, name, prompt, threadId }),
    });

    const data = await response.json();

    if (data.success) {
      // Don't auto-open new tab - the inline preview will poll and display the code
      return {
        success: true,
        componentId: data.component.id,
        previewUrl: data.previewUrl,
      };
    }

    return { success: false, error: data.error || 'Failed to save component' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Check if preview should auto-open based on user preference
 */
export function shouldAutoOpen(): boolean {
  if (typeof window === 'undefined') return false;
  
  const preference = localStorage.getItem('sandbox-auto-open');
  // Default to true if not set
  return preference !== 'false';
}

/**
 * Set auto-open preference
 */
export function setAutoOpen(enabled: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sandbox-auto-open', String(enabled));
}

