import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import HomePage from './pages/HomePage'
import UploadPage from './pages/UploadPage'
import ConversationPage from './pages/ConversationPage'

export default function App() {
    return (
        <Router>
            <div className="p-4">
                <nav className="mb-6 flex gap-4 border-b pb-2">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            isActive ? 'text-blue-600 font-semibold' : 'text-gray-600'
                        }
                        end
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/upload"
                        className={({ isActive }) =>
                            isActive ? 'text-blue-600 font-semibold' : 'text-gray-600'
                        }
                    >
                        Upload
                    </NavLink>
                    <NavLink
                        to="/conversation"
                        className={({ isActive }) =>
                            isActive ? 'text-blue-600 font-semibold' : 'text-gray-600'
                        }
                    >
                        Conversation
                    </NavLink>
                </nav>

                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/conversation" element={<ConversationPage />} />
                </Routes>
            </div>
        </Router>
    )
}