import React from 'react'
import type { Writer } from '../types'

type ConversationProps = {
    writers: Writer[]
}

const Conversation: React.FC<ConversationProps> = ({ writers }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Talking with:</h2>
            <ul className="list-disc list-inside text-gray-700">
                {writers.map(writer => (
                    <li key={writer.writerId}>{writer.writerName}</li>
                ))}
            </ul>

            {/* You can add more UI for user input, chat bubbles, etc. */}
        </div>
    )
}

export default Conversation