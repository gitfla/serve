"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WriterCard } from "@/components/writer-card"

interface Writer {
  id: number
  name: string
}

const writers: Writer[] = [
  { id: 1, name: "Maya Angelou" },
  { id: 2, name: "James Baldwin" },
  { id: 3, name: "Toni Morrison" },
  { id: 4, name: "Gabriel García Márquez" },
  { id: 5, name: "Virginia Woolf" },
  { id: 6, name: "Haruki Murakami" },
  { id: 7, name: "Chimamanda Ngozi Adichie" },
  { id: 8, name: "Jorge Luis Borges" },
  { id: 9, name: "Zadie Smith" },
  { id: 10, name: "Ocean Vuong" },
  { id: 11, name: "Elena Ferrante" },
  { id: 12, name: "Ta-Nehisi Coates" },
]

// ANIMATION SPEED CONTROL VARIABLE - Must match the one in WriterCard
const TRANSITION_DURATION_SECONDS = 2.0

export default function WriterSelection() {
  const [selectedWriters, setSelectedWriters] = useState<number[]>([])
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleWriterSelect = (writerId: number) => {
    // Prevent selection changes during transition
    if (isTransitioning) return

    setSelectedWriters((prev) => {
      if (prev.includes(writerId)) {
        return prev.filter((id) => id !== writerId)
      } else if (prev.length < 3) {
        return [...prev, writerId]
      }
      return prev
    })
  }

  const handleContinue = () => {
    if (!selectedWriters.length || isTransitioning) return

    setIsTransitioning(true)

    // Navigate to the results page after transition completes
    setTimeout(() => {
      const queryParams = new URLSearchParams()
      selectedWriters.forEach((id) => queryParams.append("writerId", id.toString()))
      router.push(`/selected-writers?${queryParams.toString()}`)
    }, TRANSITION_DURATION_SECONDS * 1000)
  }

  const canContinue = selectedWriters.length > 0 && !isTransitioning

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center relative z-10">
          <h1 className="mb-4 text-4xl font-light tracking-wide text-gray-900 md:text-5xl">Select Writers</h1>
          <p className="text-lg text-gray-600 font-light">Choose up to three writers to continue</p>
        </div>

        {/* Selection Status - Hidden during transition */}
        {!isTransitioning && (
          <div className="mb-8 flex items-center justify-center gap-6 relative z-10">
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-medium">Selected:</span>
              <Badge variant="secondary" className="text-lg px-3 py-1 font-medium">
                {selectedWriters.length}/3
              </Badge>
            </div>
            {selectedWriters.length === 3 && (
              <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                Maximum reached
              </Badge>
            )}
          </div>
        )}

        {/* Writers Container */}
        <div
          ref={containerRef}
          className="relative mb-16 min-h-[700px] md:min-h-[800px] lg:min-h-[900px] xl:min-h-[1000px] border border-gray-200 rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-inner"
        >
          {writers.map((writer) => (
            <WriterCard
              key={writer.id}
              writer={writer}
              isSelected={selectedWriters.includes(writer.id)}
              isDisabled={!selectedWriters.includes(writer.id) && selectedWriters.length >= 3}
              onSelect={handleWriterSelect}
              containerRef={containerRef}
              isTransitioning={isTransitioning}
              selectedWriters={selectedWriters}
            />
          ))}
        </div>

        {/* Action Section */}
        <div className="text-center relative z-10">
          {!canContinue && !isTransitioning && (
            <p className="mb-6 text-gray-500 text-lg font-light">Please select at least one writer to continue</p>
          )}

          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            size="lg"
            className="min-w-[250px] h-14 text-lg font-medium rounded-full transition-all duration-300 hover:shadow-lg disabled:opacity-50"
          >
            {isTransitioning ? "Transitioning..." : "Continue"}
          </Button>

          {selectedWriters.length > 0 && !isTransitioning && (
            <div className="mt-6">
              <Button
                variant="ghost"
                onClick={() => setSelectedWriters([])}
                className="text-gray-500 hover:text-gray-700 font-light"
              >
                Clear Selection
              </Button>
            </div>
          )}
        </div>

        {/* Selected Writers Summary - Hidden during transition */}
        {selectedWriters.length > 0 && !isTransitioning && (
          <div className="mt-12 rounded-2xl bg-white/60 backdrop-blur-sm p-8 shadow-lg border border-gray-200 relative z-10">
            <h3 className="mb-4 text-xl font-medium text-gray-900 text-center">Selected Writers:</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {selectedWriters.map((writerId) => {
                const writer = writers.find((w) => w.id === writerId)
                return writer ? (
                  <Badge key={writerId} variant="secondary" className="text-base px-4 py-2 font-medium">
                    {writer.name}
                  </Badge>
                ) : null
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
