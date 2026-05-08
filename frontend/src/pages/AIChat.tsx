export default function AIChat() {
  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-16 md:pb-0">
      <header className="bg-white p-4 shadow-sm z-10 border-b">
        <h1 className="text-xl font-bold text-center text-green-700">Farm AI Assistant</h1>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100 max-w-md">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon!</h2>
          <p className="text-gray-600">
            We are fine-tuning our agricultural AI models to give you the best organic farming advice. Check back shortly for updates.
          </p>
        </div>
      </main>
    </div>
  )
}
