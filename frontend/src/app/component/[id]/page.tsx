'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Component Preview Page
 * 
 * Redirects to the API preview route which generates standalone HTML
 * that works reliably with runtime-generated components.
 * 
 * The previous approach using next/dynamic imports doesn't work for
 * files created at runtime because Next.js can't resolve dynamic
 * import paths that don't exist at build time.
 */
export default function PreviewComponentPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    // Redirect to the API preview route which renders standalone HTML
    // This works because it compiles JSX on-the-fly with Babel standalone
    window.location.href = `/api/preview/${id}`;
  }, [id, router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-zinc-700 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-zinc-400 text-sm">Loading preview...</p>
      </div>
    </div>
  );
}
