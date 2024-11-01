// File: src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DocumentsList from './components/DocumentList'; // Document list page
import Editor from './components/Editor';  // Document editor page

const App = () => {
    return (
        <Router>
            <div>
                <Routes>
                    {/* Route for the document list page */}
                    <Route path="/" element={<DocumentsList />} />

                    {/* Dynamic route for document editor by document ID */}
                    <Route path="/:documentId" element={<Editor />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
