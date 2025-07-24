import { create } from "zustand"
import type { Writer } from "../app/types"

interface ConversationStore {
    conversationId: number | null
    writers: Writer[]
    lastSpeakingWriterId: number | null
    setConversationData: (id: number, writers: Writer[]) => void
    setLastSpeakingWriter: (writerId: number) => void
    clearConversationData: () => void
}

export const useConversationStore = create<ConversationStore>((set) => ({
    conversationId: null,
    writers: [],
    lastSpeakingWriterId: null,
    setConversationData: (id, writers) => set({ conversationId: id, writers }),
    setLastSpeakingWriter: (writerId) => set({ lastSpeakingWriterId: writerId }),
    clearConversationData: () => set({ conversationId: null, writers: [], lastSpeakingWriterId: null }),
}))
