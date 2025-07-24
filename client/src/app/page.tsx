"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {useRouter, useSearchParams} from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WriterCard } from "@/components/writer-card"
import { Conversation } from "@/components/conversation"
import {
  fetchWriters,
  getProcessingWriters,
  startConversation,
  getConversationDetails,
  getConversationMessages,
} from "./services/api"
import type { Writer, ConversationMessage } from "./types"
import { useConversationStore } from "../store/conversationStore"

// Constants for consistent positioning
const TRANSITION_DURATION_SECONDS = 2.0

// Desktop constants (original)
const DESKTOP_CARD_WIDTH = 200
const DESKTOP_CARD_HEIGHT = 150
const DESKTOP_FINAL_LEFT_OFFSET = 50
const DESKTOP_FINAL_VERTICAL_SPACING = 20

// Mobile constants
const MOBILE_CARD_WIDTH = 120
const MOBILE_CARD_HEIGHT = 90
const MOBILE_FINAL_TOP_OFFSET = 20
const MOBILE_CARDS_AREA_HEIGHT = MOBILE_FINAL_TOP_OFFSET + MOBILE_CARD_HEIGHT + 20

type AppState = "selection" | "transitioning" | "conversation" | "loading-conversation"

export default function WriterSelection() {
  const [writers, setWriters] = useState<Writer[]>([])
  const [selectedWriters, setSelectedWriters] = useState<number[]>([])
  const [processingWriterIds, setProcessingWriterIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appState, setAppState] = useState<AppState>("selection")
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null)
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([])
  const [initialCheckDone, setInitialCheckDone] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const { setConversationData, setLastSpeakingWriter, lastSpeakingWriterId, clearConversationData } =
      useConversationStore()

  // Extract conversation ID from URL once and memoize it
  const urlConversationId = searchParams.get("conversationId")

  const hasInitializedRef = useRef(false)

  useEffect(() => {
    if (hasInitializedRef.current) return

    const initializeConversation = async () => {
      console.log("[init] initializeConversation() called")
      const idStr = searchParams.get("conversationId")

      if (!idStr) {
        console.log("No conversationId in URL — skipping init")
        setAppState("selection")
        setInitialCheckDone(true)
        hasInitializedRef.current = true
        return
      }

      const id = Number(idStr)
      if (isNaN(id)) {
        console.warn("Invalid conversationId")
        setAppState("selection")
        setInitialCheckDone(true)
        hasInitializedRef.current = true
        return
      }

      setAppState("loading-conversation")

      try {
        const [conversationData, messagesData] = await Promise.all([
          getConversationDetails(id),
          getConversationMessages(id),
        ])

        console.log("Conversation data loaded:", { conversationData, messagesData })

        if (!conversationData || !Array.isArray(conversationData.writers)) {
          throw new Error("Invalid conversation data structure")
        }

        setConversationMessages(Array.isArray(messagesData) ? messagesData : [])
        setCurrentConversationId(id)
        setSelectedWriters(conversationData.writers.map((w) => w.writerId))
        setConversationData(id, conversationData.writers)

        const lastSystemMessage = messagesData
            .filter((msg) => msg.sender === "system" && msg.writerId)
            .pop()

        if (lastSystemMessage?.writerId) {
          setLastSpeakingWriter(lastSystemMessage.writerId)
        }

        setAppState("conversation")
      } catch (err: any) {
        console.error("Error loading conversation:", err)

        if (err.response?.status === 404) {
          setError("Conversation not found. Please start a new conversation.")
        } else {
          setError(`Failed to load conversation: ${err.message || "Unknown error"}. Please try again.`)
        }

        setAppState("selection")
      }

      setInitialCheckDone(true)
      hasInitializedRef.current = true
    }

    initializeConversation()
  }, [searchParams])

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
    const updateContainerSize = () => {
      if (containerRef.current) {
        containerRef.current.style.width = `${window.innerWidth}px`
        containerRef.current.style.height = `${window.innerHeight}px`
      }
    }

    updateContainerSize()
    window.addEventListener("resize", updateContainerSize)
    return () => window.removeEventListener("resize", updateContainerSize)
  }, [])

  const isProcessing = useCallback((writerId: number) => processingWriterIds.includes(writerId), [processingWriterIds])

  const handleWriterSelect = useCallback(
      (writerId: number) => {
        if (appState !== "selection") return

        setSelectedWriters((prev) => {
          if (prev.includes(writerId)) {
            return prev.filter((id) => id !== writerId)
          } else if (prev.length < 3) {
            return [...prev, writerId]
          }
          return prev
        })
      },
      [appState],
  )

  const handleStartConversation = useCallback(async () => {
    if (!selectedWriters.length || appState !== "selection") return

    setAppState("transitioning")

    try {
      const selectedWriterObjects = writers.filter((w) => selectedWriters.includes(w.writerId))
      const { conversationId } = await startConversation(selectedWriterObjects)

      // Store conversation data in memory (not persisted)
      setConversationData(conversationId, selectedWriterObjects)
      setCurrentConversationId(conversationId)
      setConversationMessages([]) // New conversation starts with empty messages

      // Update URL with search params only - stay on the same page
      const newUrl = `/?conversationId=${conversationId}`
      window.history.pushState(null, "", newUrl)

      // Wait for transition animation, then switch to conversation mode
      setTimeout(() => {
        setAppState("conversation")
      }, TRANSITION_DURATION_SECONDS * 1000)
    } catch (err) {
      setError("Failed to start conversation. Please try again.")
      setAppState("selection")
    }
  }, [selectedWriters, appState, writers, setConversationData])

  const router = useRouter()

  const handleNewConversation = useCallback(() => {
    console.log("search param:", urlConversationId)
    // ✅ Properly clear URL using Next.js router
    router.replace("/")

    // Then reset state
    setAppState("selection")
    setSelectedWriters([])
    setCurrentConversationId(null)
    setConversationMessages([])
    setError(null)
    setInitialCheckDone(false)

    clearConversationData()
  }, [clearConversationData, router])

  // Callback to receive the last speaking writer ID from Conversation component
  const handleWriterSpoke = useCallback(
      (writerId: number) => {
        setLastSpeakingWriter(writerId)
      },
      [setLastSpeakingWriter],
  )

  const hasSelectedWriters = selectedWriters.length > 0
  const canStartConversation = hasSelectedWriters && appState === "selection"
  const isTransitioning = appState === "transitioning"
  const isInConversation = appState === "conversation"
  const isLoadingConversation = appState === "loading-conversation"

  if (loading || isLoadingConversation) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-lg text-gray-600 font-light">
            {loading ? "Loading writers..." : "Loading conversation..."}
          </div>
        </div>
    )
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-lg text-red-600 font-light bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-red-200">
            {error}
            <Button onClick={() => setError(null)} variant="ghost" className="mt-4 text-red-500 hover:text-red-700">
              Dismiss
            </Button>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
        {/* Writer Cards - Always present but positioned based on state */}
        <div ref={containerRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 10 }}>
          {writers.map((writer) => {
            const isSelected = selectedWriters.includes(writer.writerId)

            return (
                <WriterCard
                    key={writer.writerId}
                    writer={{ id: writer.writerId, name: writer.writerName }}
                    isSelected={isSelected}
                    isDisabled={
                        isProcessing(writer.writerId) || (selectedWriters.length >= 3 && !isSelected) || isInConversation
                    }
                    onSelect={handleWriterSelect}
                    containerRef={containerRef}
                    isTransitioning={isTransitioning}
                    selectedWriters={selectedWriters}
                    appState={appState}
                    lastSpeakingWriterId={lastSpeakingWriterId}
                />
            )
          })}
        </div>

        {/* Main Content Overlay */}
        <div className="relative z-20 min-h-screen flex md:flex-row flex-col pointer-events-none">
          {/* Selection Mode UI */}
          {(appState === "selection" || appState === "transitioning") && (
              <div className="w-full flex flex-col">
                {/* Top Section - Instruction text and selection status */}
                {!isTransitioning && (
                    <div className="pt-8 pb-4 px-8 md:flex md:items-center md:justify-between">
                      {/* Desktop layout */}
                      <div className="flex-1 hidden md:block">
                        {!hasSelectedWriters && (
                            <p className="text-gray-500 text-lg font-light bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 inline-block shadow-lg border border-gray-200">
                              Please select at least one writer to start conversation
                            </p>
                        )}
                      </div>

                      <div className="hidden md:flex items-center gap-3">
                        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
                          <span className="text-gray-600 font-medium">Selected:</span>
                          <Badge variant="secondary" className="text-lg px-3 py-1 font-medium">
                            {selectedWriters.length}/3
                          </Badge>
                        </div>
                        {selectedWriters.length === 3 && (
                            <Badge
                                variant="outline"
                                className="text-amber-700 border-amber-300 bg-amber-50/90 backdrop-blur-sm"
                            >
                              Maximum reached
                            </Badge>
                        )}
                      </div>

                      {/* Mobile layout */}
                      <div className="md:hidden flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg border border-gray-200">
                          <span className="text-gray-600 font-medium text-sm">Selected:</span>
                          <Badge variant="secondary" className="text-sm px-2 py-0.5 font-medium">
                            {selectedWriters.length}/3
                          </Badge>
                          {selectedWriters.length === 3 && (
                              <Badge
                                  variant="outline"
                                  className="text-amber-700 border-amber-300 bg-amber-50/90 backdrop-blur-sm text-xs px-2 py-0.5"
                              >
                                Max
                              </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Bottom Action Section - Both Desktop and Mobile */}
                {hasSelectedWriters && !isTransitioning && (
                    <div className="pb-16 px-8 flex justify-center pointer-events-auto">
                      <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setSelectedWriters([])}
                            className="text-gray-500 hover:text-gray-700 font-light bg-white/60 backdrop-blur-sm hover:bg-white/80 md:h-14 h-12 md:px-6 px-4 rounded-full md:text-base text-sm"
                        >
                          {/* Desktop text */}
                          <span className="hidden md:inline">Clear Selection</span>
                          {/* Mobile text */}
                          <span className="md:hidden">Clear</span>
                        </Button>

                        <Button
                            onClick={handleStartConversation}
                            disabled={!canStartConversation}
                            size="lg"
                            className="md:min-w-[250px] min-w-[180px] md:h-14 h-12 md:text-lg text-base font-medium rounded-full transition-all duration-300 hover:shadow-lg disabled:opacity-50"
                        >
                          {isTransitioning ? (
                              <>
                                <span className="hidden md:inline">Starting Conversation...</span>
                                <span className="md:hidden">Starting...</span>
                              </>
                          ) : (
                              <>
                                <span className="hidden md:inline">Start Conversation</span>
                                <span className="md:hidden">Start Chat</span>
                              </>
                          )}
                        </Button>
                      </div>
                    </div>
                )}

                {/* Mobile instruction text - positioned above buttons */}
                {!hasSelectedWriters && !isTransitioning && (
                    <div className="md:hidden pb-6 px-4 flex justify-center">
                      <p className="text-gray-500 text-sm font-light bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200 text-center">
                        Select writers to start
                      </p>
                    </div>
                )}
              </div>
          )}

          {/* Conversation Mode UI */}
          {isInConversation && currentConversationId && (
              <>
                {/* Desktop Layout */}
                <div className="hidden md:flex w-full">
                  {/* Left space for writer cards and New Conversation button */}
                  <div
                      style={{ width: DESKTOP_FINAL_LEFT_OFFSET + DESKTOP_CARD_WIDTH + 50 }}
                      className="flex-shrink-0 relative pointer-events-auto flex items-end justify-center"
                  >
                    {/* New Conversation Button - Aligned with Talk/Listen buttons */}
                    <div className="pb-8 mb-1">
                      <Button
                          variant="ghost"
                          onClick={handleNewConversation}
                          className="transition-transform duration-200 ease-in-out hover:scale-105 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg border border-gray-200"
                      >
                        New Conversation
                      </Button>
                    </div>
                  </div>

                  {/* Conversation area */}
                  <div className="flex-1 flex flex-col pointer-events-auto">
                    {/* Conversation Component */}
                    <div className="flex-1 mx-4 mt-4 mb-4 overflow-hidden">
                      <Conversation
                          conversationId={currentConversationId}
                          initialWriters={writers.filter((w) => selectedWriters.includes(w.writerId))}
                          initialMessages={conversationMessages}
                          onWriterSpoke={handleWriterSpoke}
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden flex flex-col w-full">
                  {/* Top space reserved for writer cards */}
                  <div style={{ height: MOBILE_CARDS_AREA_HEIGHT }} className="flex-shrink-0" />

                  {/* New Conversation Button - Above chat messages */}
                  <div className="px-4 pb-2 pointer-events-auto flex justify-center">
                    <Button
                        variant="ghost"
                        onClick={handleNewConversation}
                        className="transition-transform duration-200 ease-in-out hover:scale-105 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg border border-gray-200"
                    >
                      New Conversation
                    </Button>
                  </div>

                  {/* Conversation area - Takes remaining space */}
                  <div className="flex-1 flex flex-col pointer-events-auto px-4 pb-4 min-h-0">
                    <div className="flex-1 overflow-hidden">
                      <Conversation
                          conversationId={currentConversationId}
                          initialWriters={writers.filter((w) => selectedWriters.includes(w.writerId))}
                          initialMessages={conversationMessages}
                          onWriterSpoke={handleWriterSpoke}
                      />
                    </div>
                  </div>
                </div>
              </>
          )}
        </div>
      </div>
  )
}
