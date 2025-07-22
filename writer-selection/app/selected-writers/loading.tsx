export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center relative z-10">
          <h1 className="mb-4 text-4xl font-light tracking-wide text-gray-900 md:text-5xl">Loading...</h1>
          <p className="text-lg text-gray-600 font-light">Preparing your selected writers</p>
        </div>
        <div className="relative mb-16 min-h-[700px] md:min-h-[800px] lg:min-h-[900px] xl:min-h-[1000px] border border-gray-200 rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-inner flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </div>
    </div>
  )
}
