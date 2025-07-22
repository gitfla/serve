"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Writer {
  id: number
  name: string
}

const allWriters: Writer[] = [
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

const CARD_WIDTH = 200 // Same as WriterCard
const CARD_HEIGHT = 150 // Same as WriterCard
const FINAL_LEFT_OFFSET = 50 // Same as WriterCard
const FINAL_VERTICAL_SPACING = 20 // Same as WriterCard

export default function SelectedWritersPage() {
  const searchParams = useSearchParams()
  const selectedWriterIds = searchParams.getAll("writerId").map(Number)
  const selectedWriters = allWriters.filter((writer) => selectedWriterIds.includes(writer.id))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header - Same styling as original page */}
        <div className="mb-12 text-center relative z-10">
          <h1 className="mb-4 text-4xl font-light tracking-wide text-gray-900 md:text-5xl">Selected Writers</h1>
          <p className="text-lg text-gray-600 font-light">Your chosen writers are displayed on the left</p>
        </div>

        {/* Container - Same styling as original page */}
        <div className="relative mb-16 min-h-[700px] md:min-h-[800px] lg:min-h-[900px] xl:min-h-[1000px] border border-gray-200 rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-inner">
          {/* Selected Writers positioned exactly like the end of transition */}
          {selectedWriters.map((writer, index) => {
            const finalX = FINAL_LEFT_OFFSET
            const finalY = FINAL_LEFT_OFFSET + index * (CARD_HEIGHT + FINAL_VERTICAL_SPACING)

            return (
              <div
                key={writer.id}
                className="absolute"
                style={{
                  transform: `translate(${finalX}px, ${finalY}px)`,
                  zIndex: 100 + index,
                }}
              >
                <Card
                  className="border-gray-800 bg-gray-900 text-white shadow-2xl scale-105 rounded-[3rem]"
                  style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
                >
                  <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
                    <h3 className="text-xl font-medium mb-2 text-white">{writer.name}</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white mt-4 animate-pulse">
                      <Check className="h-5 w-5 text-gray-900" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* Action Section */}
        <div className="text-center relative z-10">
          <Link href="/">
            <Button
              size="lg"
              className="min-w-[250px] h-14 text-lg font-medium rounded-full transition-all duration-300 hover:shadow-lg"
            >
              Select Different Writers
            </Button>
          </Link>
        </div>

        {/* Additional content area - you can add more functionality here */}
        <div className="mt-12 text-center">
          <p className="text-lg text-gray-600 font-light">
            You have selected {selectedWriters.length} writer{selectedWriters.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  )
}
