import { useLocation, useNavigate } from "react-router-dom";
import Conversation from "../components/Conversation.tsx";


const ConversationPage = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const writers = location.state?.writers || []
    if (!writers.length) {
        return (
            <div className="text-center mt-10">
                <p className="text-red-600">No writers selected. Please return to the home page.</p>
                <button
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={() => navigate('/')}
                >
                    Go Back
                </button>
            </div>
        )
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">💬 Conversation Mode</h1>
            <p className="mb-4 text-gray-700">
                You're now talking with: {writers.map(w => w.writerName).join(', ')}
            </p>

            {/* Add conversation UI here */}
        </div>
    )
}

export default ConversationPage
