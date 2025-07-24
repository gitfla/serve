"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import WriterSelection from "@/components/WriterSelection"
import Conversation from "@/components/Conversation"
import { useConversationStore } from "@/src/store/conversationStore"
import { checkConversationExists } from "@/services/api"

export default function HomePage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const queryConversationId = searchParams.get("conversationId")

    const {
        conversationId: storeId,
        writers,
        setConversationData,
    } = useConversationStore()

    const [view, setView] = useState<"selection" | "conversation">("selection")
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        setHydrated(true)
    }, [])

    useEffect(() => {
        if (!hydrated || !queryConversationId) return

        const numericId = Number(queryConversationId)
        if (!numericId || writers.length > 0) return

        const restore = async () => {
            const { valid } = await checkConversationExists(numericId)
            if (valid) {
                // Optionally fetch writer list
                const writerList = await fetch(`/api/conversations/${numericId}/writers`).then(res => res.json())
                setConversationData(numericId, writerList)
                setView("conversation")
            }
        }

        restore()
    }, [hydrated, queryConversationId])

    useEffect(() => {
        if (!hydrated || !queryConversationId) return
        const numericId = Number(queryConversationId)

        if (numericId === storeId && writers.length > 0) {
            setView("conversation")
        }
    }, [hydrated, storeId, writers, queryConversationId])

    return view === "selection" ? (
        <WriterSelection
            onConversationStart={(id) => {
                router.push(`?conversationId=${id}`, { scroll: false, shallow: true })
                setView("conversation")
            }}
        />
    ) : (
        <Conversation conversationId={Number(queryConversationId)} initialWriters={writers} />
    )
}
