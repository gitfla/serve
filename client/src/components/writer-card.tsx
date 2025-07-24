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
    containerRef: React.RefObject<HTMLDivElement | null> // Reference to the parent container
    isTransitioning: boolean // Prop to control transition phase
    selectedWriters: number[] // Prop to determine order in final list
    appState: "selection" | "transitioning" | "conversation" // New prop to know the current app state
    lastSpeakingWriterId?: number | null // New prop to track which writer spoke last
}

// Desktop constants (original)
const DESKTOP_CARD_WIDTH = 200
const DESKTOP_CARD_HEIGHT = 150
const DESKTOP_FINAL_LEFT_OFFSET = 50
const DESKTOP_FINAL_VERTICAL_SPACING = 20

// Mobile constants
const MOBILE_CARD_WIDTH = 120
const MOBILE_CARD_HEIGHT = 90
const MOBILE_FINAL_LEFT_OFFSET = 20
const MOBILE_FINAL_TOP_OFFSET = 20
const MOBILE_FINAL_HORIZONTAL_SPACING = 15

const INITIAL_SPEED_MIN = 0.03
const INITIAL_SPEED_MAX = 0.08
const BOUNCE_SPEED_FACTOR = 1
const TRANSITION_DURATION_SECONDS = 2.0

export function WriterCard({
                               writer,
                               isSelected,
                               isDisabled,
                               onSelect,
                               containerRef,
                               isTransitioning,
                               selectedWriters,
                               appState,
                               lastSpeakingWriterId,
                           }: WriterCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const currentPosition = useRef({ x: 0, y: 0 })
    const [displayPosition, setDisplayPosition] = useState({ x: 0, y: 0 })
    const direction = useRef({ dx: 0, dy: 0 })
    const animationFrameId = useRef<number | null>(null)
    const frozenPosition = useRef<{ x: number; y: number } | null>(null)
    const [isMobile, setIsMobile] = useState(false)

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768) // Tailwind's md breakpoint
        }

        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    // Get responsive values based on screen size
    const getResponsiveValues = useCallback(() => {
        if (isMobile) {
            return {
                cardWidth: MOBILE_CARD_WIDTH,
                cardHeight: MOBILE_CARD_HEIGHT,
                finalLeftOffset: MOBILE_FINAL_LEFT_OFFSET,
                finalTopOffset: MOBILE_FINAL_TOP_OFFSET,
                finalVerticalSpacing: DESKTOP_FINAL_VERTICAL_SPACING, // Not used on mobile
                finalHorizontalSpacing: MOBILE_FINAL_HORIZONTAL_SPACING,
            }
        } else {
            return {
                cardWidth: DESKTOP_CARD_WIDTH,
                cardHeight: DESKTOP_CARD_HEIGHT,
                finalLeftOffset: DESKTOP_FINAL_LEFT_OFFSET,
                finalTopOffset: DESKTOP_FINAL_LEFT_OFFSET, // Same as left for desktop
                finalVerticalSpacing: DESKTOP_FINAL_VERTICAL_SPACING,
                finalHorizontalSpacing: 0, // Not used on desktop
            }
        }
    }, [isMobile])

    const animate = useCallback(() => {
        if (!cardRef.current || !containerRef.current) {
            animationFrameId.current = requestAnimationFrame(animate)
            return
        }

        // Stop bouncing if transitioning or in conversation mode
        if (isTransitioning || appState === "conversation") {
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
    }, [isTransitioning, containerRef, appState])

    useEffect(() => {
        if (!containerRef.current) return

        const containerRect = containerRef.current.getBoundingClientRect()
        const { cardWidth, cardHeight } = getResponsiveValues()

        // Initialize random position and direction within container bounds
        const initialX = Math.random() * (containerRect.width - cardWidth - 40) + 20
        const initialY = Math.random() * (containerRect.height - cardHeight - 40) + 20
        currentPosition.current = { x: initialX, y: initialY }
        setDisplayPosition({ x: initialX, y: initialY })

        const initialDx =
            (Math.random() > 0.5 ? 1 : -1) * (INITIAL_SPEED_MIN + Math.random() * (INITIAL_SPEED_MAX - INITIAL_SPEED_MIN))
        const initialDy =
            (Math.random() > 0.5 ? 1 : -1) * (INITIAL_SPEED_MIN + Math.random() * (INITIAL_SPEED_MAX - INITIAL_SPEED_MIN))
        direction.current = { dx: initialDx, dy: initialDy }

        // Start animation only if in selection mode
        if (appState === "selection") {
            animationFrameId.current = requestAnimationFrame(animate)
        }

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current)
            }
        }
    }, [animate, containerRef, appState, getResponsiveValues])

    // Freeze the current position when transitioning starts
    useEffect(() => {
        if (isTransitioning && !isSelected && frozenPosition.current === null) {
            // Freeze unselected cards at their current position when transition starts
            frozenPosition.current = { ...displayPosition }
        } else if (appState === "selection") {
            // Reset frozen position when back to selection mode
            frozenPosition.current = null
        }
    }, [isTransitioning, isSelected, displayPosition, appState])

    // Calculate transition styles for cards during the Continue animation
    const getTransitionStyle = useCallback(() => {
        if (appState === "selection") {
            // In selection mode, use normal positioning
            return {}
        }

        if (isTransitioning || appState === "conversation") {
            if (!isSelected) {
                // Unselected cards: fade out from their frozen position
                const frozenPos = frozenPosition.current || displayPosition
                return {
                    transform: `translate(${frozenPos.x}px, ${frozenPos.y}px)`,
                    opacity: appState === "conversation" ? 0 : 0, // Keep them invisible in conversation mode
                    transition: `opacity ${TRANSITION_DURATION_SECONDS}s ease-out`,
                    pointerEvents: "none" as const,
                }
            } else {
                // Selected cards: different positioning for mobile vs desktop
                const indexInSelection = selectedWriters.indexOf(writer.id)
                if (indexInSelection === -1) return {}

                const { finalLeftOffset, finalTopOffset, finalVerticalSpacing, finalHorizontalSpacing, cardWidth } =
                    getResponsiveValues()

                let finalX, finalY

                if (isMobile) {
                    // Mobile: horizontal layout at top
                    finalX = finalLeftOffset + indexInSelection * (cardWidth + finalHorizontalSpacing)
                    finalY = finalTopOffset
                } else {
                    // Desktop: vertical layout on left
                    finalX = finalLeftOffset
                    finalY = finalTopOffset + indexInSelection * (DESKTOP_CARD_HEIGHT + finalVerticalSpacing)
                }

                return {
                    transform: `translate(${finalX}px, ${finalY}px)`,
                    transition: isTransitioning ? `transform ${TRANSITION_DURATION_SECONDS}s ease-in-out` : "none",
                    zIndex: 100 + indexInSelection,
                }
            }
        }

        return {}
    }, [
        isTransitioning,
        isSelected,
        selectedWriters,
        writer.id,
        appState,
        displayPosition,
        getResponsiveValues,
        isMobile,
    ])

    // Check if this writer is currently speaking
    const isSpeaking = appState === "conversation" && lastSpeakingWriterId === writer.id

    // Calculate checkmark opacity for smooth transitions
    const getCheckmarkOpacity = () => {
        if (appState === "selection") {
            return isSelected ? 1 : 0
        } else if (appState === "transitioning") {
            // Fade out the checkmark during transition
            return 0
        }
        // In conversation mode, checkmark should be invisible
        return 0
    }

    // Calculate speaking icon opacity
    const getSpeakingIconOpacity = () => {
        if (appState === "conversation" && isSpeaking) {
            return 1
        }
        return 0
    }

    const { cardWidth, cardHeight } = getResponsiveValues()

    return (
        <div
            ref={cardRef}
            className="absolute"
            style={{
                // Use different positioning logic based on state
                ...(appState === "selection" && !isTransitioning
                    ? { transform: `translate(${displayPosition.x}px, ${displayPosition.y}px)` }
                    : {}),
                ...getTransitionStyle(), // Apply transition styles which will override the transform if needed
            }}
        >
            <Card
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl rounded-[3rem] relative ${
                    isSelected
                        ? "border-gray-800 bg-gray-900 text-white shadow-2xl scale-105"
                        : isDisabled
                            ? "cursor-not-allowed opacity-40 border-gray-200 backdrop-blur-sm hover:border-gray-400"
                            : "border-gray-200 bg-white/80 backdrop-blur-sm hover:border-gray-400 shadow-lg"
                }`}
                style={{ width: cardWidth, height: cardHeight }}
                onClick={() => !isDisabled && appState === "selection" && onSelect(writer.id)} // Only allow clicks in selection mode
            >
                {/* Selection Checkmark - Top Right Corner */}
                <div
                    className="absolute top-6 right-5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center transition-opacity duration-500 ease-in-out"
                    style={{
                        opacity: getCheckmarkOpacity(),
                    }}
                >
                    <Check className="h-3 w-3 text-white" />
                </div>

                <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
                    <div className="relative">
                        <h3
                            className={`${isMobile ? "text-lg" : "text-xl"} font-medium ${isSelected ? "text-white" : "text-gray-900"}`}
                        >
                            {writer.name}
                        </h3>
                        {/* Speaking Icon - Top Right of Name */}
                        <div
                            className="absolute -top-6 -right-3 transition-opacity duration-500 ease-in-out"
                            style={{
                                opacity: getSpeakingIconOpacity(),
                            }}
                        >
                            <span className="text-lg animate-pulse">💬</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
