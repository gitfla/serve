import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Writer } from "../../app/types"

interface ConversationStore {
    conversationId: number | null
    writers: Writer[]
    setConversationData: (id: number, writers: Writer[]) => void
    clearConversationData: () => void
}

export const useConversationStore = create(
    persist<ConversationStore>(
        (set) => ({
            conversationId: null,
            writers: [],
            setConversationData: (id, writers) => set({ conversationId: id, writers }),
            clearConversationData: () => set({ conversationId: null, writers: [] }),
        }),
        {
            name: "conversation-storage",
            storage: typeof window !== "undefined" ? sessionStorage : undefined,
        },
    ),
)
