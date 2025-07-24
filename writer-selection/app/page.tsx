"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WriterCard } from "@/components/writer-card"
import { fetchWriters, getProcessingWriters, startConversation } from "../services/api"
import type { Writer } from "./types"
import { useConversationStore } from "../src/store/conversationStore"

// ANIMATION SPEED CONTROL VARIABLE - Must match the one in WriterCard
const TRANSITION_DURATION_SECONDS = 2.0

export default function WriterSelection() {
  const [writers, setWriters] = useState<Writer[]>([])
  const [selectedWriters, setSelectedWriters] = useState<number[]>([])
  const [processingWriterIds, setProcessingWriterIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { setConversationData } = useConversationStore()

  // Prefetch the conversation route
  useEffect(() => {
    router.prefetch("/conversation")
  }, [router])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [writersData, processingData] = await Promise.all([fetchWriters(), getProcessingWriters()])
        setWriters(writersData)
        setProcessingWriterIds(processingData.writerIds)
      } catch (err: any) {
        setError("Failed to load writers. Please refresh the page.")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Set container ref to the entire viewport
  useEffect(() => {
    if (containerRef.current) {
      // Set container dimensions to full viewport
      containerRef.current.style.width = `${window.innerWidth}px`
      containerRef.current.style.height = `${window.innerHeight}px`
    }

    const handleResize = () => {
      if (containerRef.current) {
        containerRef.current.style.width = `${window.innerWidth}px`
        containerRef.current.style.height = `${window.innerHeight}px`
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isProcessing = (writerId: number) => processingWriterIds.includes(writerId)

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

  const handleStartConversation = async () => {
    if (!selectedWriters.length || isTransitioning) return

    setIsTransitioning(true)

    try {
      const selectedWriterObjects = writers.filter((w) => selectedWriters.includes(w.writerId))
      const { conversationId } = await startConversation(selectedWriterObjects)

      // Store writers + conversation ID in global store BEFORE navigation
      setConversationData(conversationId, selectedWriterObjects)

      // Wait for the transition animation, then navigate
      setTimeout(() => {
        // Use replace instead of push to prevent back button from showing loading state
        router.push(`/?conversationId=${conversationId}`, undefined, { shallow: true }); // ← URL update only
      }, TRANSITION_DURATION_SECONDS * 1000)
    } catch (err) {
      setError("Failed to start conversation. Please try again.")
      setIsTransitioning(false)
    }
  }

  const hasSelectedWriters = selectedWriters.length > 0
  const canStartConversation = hasSelectedWriters && !isTransitioning

  if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-lg text-gray-600 font-light">Loading writers...</div>
        </div>
    )
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-lg text-red-600 font-light bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-red-200">
            {error}
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
        {/* Full-screen container for floating cards - Higher z-index for interactivity */}
        <div ref={containerRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 10 }}>
          {writers.map((writer) => (
              <WriterCard
                  key={writer.writerId}
                  writer={{ id: writer.writerId, name: writer.writerName }}
                  isSelected={selectedWriters.includes(writer.writerId)}
                  isDisabled={
                      isProcessing(writer.writerId) ||
                      (selectedWriters.length >= 3 && !selectedWriters.includes(writer.writerId))
                  }
                  onSelect={handleWriterSelect}
                  containerRef={containerRef}
                  isTransitioning={isTransitioning}
                  selectedWriters={selectedWriters}
              />
          ))}
        </div>

        {/* Overlay content with even higher z-index and pointer-events-none for non-interactive areas */}
        <div className="relative z-20 min-h-screen flex flex-col pointer-events-none">
          {/* Top Section - Instruction text and selection status */}
          {!isTransitioning && (
              <div className="pt-8 pb-4 px-8 flex items-center justify-between">
                {/* Left side - Instruction text (only when no writers selected) */}
                <div className="flex-1">
                  {!hasSelectedWriters && (
                      <p className="text-gray-500 text-lg font-light bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 inline-block shadow-lg border border-gray-200">
                        Please select at least one writer to start conversation
                      </p>
                  )}
                </div>

                {/* Right side - Selection status */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
                    <span className="text-gray-600 font-medium">Selected:</span>
                    <Badge variant="secondary" className="text-lg px-3 py-1 font-medium">
                      {selectedWriters.length}/3
                    </Badge>
                  </div>
                  {selectedWriters.length === 3 && (
                      <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50/90 backdrop-blur-sm">
                        Maximum reached
                      </Badge>
                  )}
                </div>
              </div>
          )}

          {/* Spacer to push action section to bottom */}
          <div className="flex-1" />

          {/* Bottom Action Section - Only show when writers are selected */}
          {hasSelectedWriters && !isTransitioning && (
              <div className="pb-16 px-8 flex justify-center pointer-events-auto">
                <div className="flex items-center gap-4">
                  <Button
                      variant="ghost"
                      onClick={() => setSelectedWriters([])}
                      className="text-gray-500 hover:text-gray-700 font-light bg-white/60 backdrop-blur-sm hover:bg-white/80 h-14 px-6 rounded-full"
                  >
                    Clear Selection
                  </Button>

                  <Button
                      onClick={handleStartConversation}
                      disabled={!canStartConversation}
                      size="lg"
                      className="min-w-[250px] h-14 text-lg font-medium rounded-full transition-all duration-300 hover:shadow-lg disabled:opacity-50"
                  >
                    {isTransitioning ? "Starting Conversation..." : "Start Conversation"}
                  </Button>
                </div>
              </div>
          )}

          {/* Error display overlay */}
          {error && (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
                  <p className="text-red-600 font-medium">{error}</p>
                  <Button onClick={() => setError(null)} variant="ghost" className="mt-2 text-red-500 hover:text-red-700">
                    Dismiss
                  </Button>
                </div>
              </div>
          )}
        </div>
      </div>
  )
}
