"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"

interface WriterCardProps {
  writer: { id: number; name: string }
  isSelected: boolean
  isDisabled: boolean
  onSelect: (id: number) => void
  containerRef: React.RefObject<HTMLDivElement> // Reference to the parent container
  isTransitioning: boolean // New prop to control transition phase
  selectedWriters: number[] // New prop to determine order in final list
}

const CARD_WIDTH = 200 // Fixed width for the oval card
const CARD_HEIGHT = 150 // Fixed height for the oval card
const INITIAL_SPEED_MIN = 0.03 // Minimum initial speed (controlled bouncing)
const INITIAL_SPEED_MAX = 0.08 // Maximum initial speed (controlled bouncing)
const BOUNCE_SPEED_FACTOR = 1 // Factor to adjust speed after bounce (1 means no change)
const FINAL_LEFT_OFFSET = 50 // Pixels from the left edge for the final list
const FINAL_VERTICAL_SPACING = 20 // Pixels between stacked cards

// ANIMATION SPEED CONTROL VARIABLE - Adjust this to change transition duration
const TRANSITION_DURATION_SECONDS = 2.0 // Main control for animation speed

export function WriterCard({
  writer,
  isSelected,
  isDisabled,
  onSelect,
  containerRef,
  isTransitioning,
  selectedWriters,
}: WriterCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const currentPosition = useRef({ x: 0, y: 0 })
  const [displayPosition, setDisplayPosition] = useState({ x: 0, y: 0 })
  const direction = useRef({ dx: 0, dy: 0 })
  const animationFrameId = useRef<number | null>(null)

  const animate = useCallback(() => {
    if (!cardRef.current || !containerRef.current) {
      animationFrameId.current = requestAnimationFrame(animate)
      return
    }

    // Stop bouncing if a transition is active
    if (isTransitioning) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
      return
    }

    const containerRect = containerRef.current.getBoundingClientRect()
    const cardRect = cardRef.current.getBoundingClientRect()

    let newX = currentPosition.current.x + direction.current.dx
    let newY = currentPosition.current.y + direction.current.dy

    // Collision with horizontal boundaries
    if (newX + cardRect.width > containerRect.width || newX < 0) {
      direction.current.dx *= -BOUNCE_SPEED_FACTOR
      newX = Math.max(0, Math.min(newX, containerRect.width - cardRect.width))
    }

    // Collision with vertical boundaries
    if (newY + cardRect.height > containerRect.height || newY < 0) {
      direction.current.dy *= -BOUNCE_SPEED_FACTOR
      newY = Math.max(0, Math.min(newY, containerRect.height - cardRect.height))
    }

    currentPosition.current = { x: newX, y: newY }
    setDisplayPosition({ x: newX, y: newY })
    animationFrameId.current = requestAnimationFrame(animate)
  }, [isTransitioning, containerRef])

  useEffect(() => {
    if (!containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()

    // Initialize random position and direction within container bounds
    const initialX = Math.random() * (containerRect.width - CARD_WIDTH - 40) + 20
    const initialY = Math.random() * (containerRect.height - CARD_HEIGHT - 40) + 20
    currentPosition.current = { x: initialX, y: initialY }
    setDisplayPosition({ x: initialX, y: initialY })

    const initialDx =
      (Math.random() > 0.5 ? 1 : -1) * (INITIAL_SPEED_MIN + Math.random() * (INITIAL_SPEED_MAX - INITIAL_SPEED_MIN))
    const initialDy =
      (Math.random() > 0.5 ? 1 : -1) * (INITIAL_SPEED_MIN + Math.random() * (INITIAL_SPEED_MAX - INITIAL_SPEED_MIN))
    direction.current = { dx: initialDx, dy: initialDy }

    // Start animation only if not already transitioning
    if (!isTransitioning) {
      animationFrameId.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [animate, containerRef, isTransitioning])

  // Calculate transition styles for cards during the Continue animation
  const getTransitionStyle = useCallback(() => {
    if (!isTransitioning) return {}

    if (!isSelected) {
      // Unselected cards: smooth fade out only
      return {
        opacity: 0,
        transition: `opacity ${TRANSITION_DURATION_SECONDS}s ease-out`,
        pointerEvents: "none" as const, // Make them unclickable during transition
      }
    } else {
      // Selected cards: move to vertical list on the left while maintaining visual state
      const indexInSelection = selectedWriters.indexOf(writer.id)
      if (indexInSelection === -1) return {} // Should not happen if isSelected is true

      const finalX = FINAL_LEFT_OFFSET
      const finalY = FINAL_LEFT_OFFSET + indexInSelection * (CARD_HEIGHT + FINAL_VERTICAL_SPACING)

      return {
        transform: `translate(${finalX}px, ${finalY}px)`,
        transition: `transform ${TRANSITION_DURATION_SECONDS}s ease-in-out`,
        zIndex: 100 + indexInSelection, // Ensure selected cards are on top
      }
    }
  }, [isTransitioning, isSelected, selectedWriters, writer.id])

  return (
    <div
      ref={cardRef}
      className="absolute"
      style={{
        transform: `translate(${displayPosition.x}px, ${displayPosition.y}px)`,
        ...getTransitionStyle(), // Apply transition styles
      }}
    >
      <Card
        className={`cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl rounded-[3rem] ${
          isSelected
            ? "border-gray-800 bg-gray-900 text-white shadow-2xl scale-105"
            : isDisabled
              ? "cursor-not-allowed opacity-40"
              : "border-gray-200 bg-white/80 backdrop-blur-sm hover:border-gray-400 shadow-lg"
        }`}
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
        onClick={() => !isDisabled && !isTransitioning && onSelect(writer.id)} // Disable clicks during transition
      >
        <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
          <h3 className={`text-xl font-medium mb-2 ${isSelected ? "text-white" : "text-gray-900"}`}>{writer.name}</h3>
          {isSelected && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white mt-4 animate-pulse">
              <Check className="h-5 w-5 text-gray-900" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
