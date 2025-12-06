export default function TestComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-purple-900 to-zinc-900 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">It Works! 🎉</h1>
        <p className="text-zinc-400 text-lg max-w-md">
          This component was generated and saved via the API.
          Hot reload is active!
        </p>
      </div>
    </div>
  );
}