import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import HomePage from './pages/HomePage'
import UploadPage from './pages/UploadPage'
import ConversationPage from './pages/ConversationPage'

export default function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="flex justify-between items-center px-6 py-4 shadow-sm bg-white">
                    <h1 className="text-xl font-bold text-gray-800">WriterBot</h1>
                    <nav className="flex gap-6">
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                isActive
                                    ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1'
                                    : 'text-gray-600 hover:text-gray-800'
                            }
                            end
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to="/upload"
                            className={({ isActive }) =>
                                isActive
                                    ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1'
                                    : 'text-gray-600 hover:text-gray-800'
                            }
                        >
                            Upload
                        </NavLink>
                        <NavLink
                            to="/conversation"
                            className={({ isActive }) =>
                                isActive
                                    ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1'
                                    : 'text-gray-600 hover:text-gray-800'
                            }
                        >
                            Conversation
                        </NavLink>
                    </nav>
                </header>

                {/* Main Content */}
                <main className="p-6 max-w-6xl mx-auto">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/upload" element={<UploadPage />} />
                        <Route path="/conversation/:conversationId" element={<ConversationPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    )
}