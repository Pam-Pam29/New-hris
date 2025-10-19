import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CareersPage from './pages/Careers';
import ApplyPage from './pages/Apply';

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Application routes - must come before catch-all routes */}
                <Route path="/careers/:companyDomain/apply/:jobId" element={<ApplyPage />} />
                <Route path="/:companyDomain/apply/:jobId" element={<ApplyPage />} />

                {/* Company-specific routes */}
                <Route path="/careers/:companyDomain" element={<CareersPage />} />
                <Route path="/jobs/:companyDomain" element={<CareersPage />} />
                <Route path="/:companyDomain" element={<CareersPage />} />

                {/* Default route (first company or company selector) */}
                <Route path="/" element={<CareersPage />} />
                <Route path="/careers" element={<CareersPage />} />
                <Route path="/jobs" element={<CareersPage />} />

                <Route path="*" element={
                    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                            <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
                            <a
                                href="/careers"
                                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Back to Careers
                            </a>
                        </div>
                    </div>
                } />
            </Routes>
        </Router>
    );
}

