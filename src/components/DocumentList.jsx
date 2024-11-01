import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DocumentsList = () => {
    const [documents, setDocuments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch document list from backend with full URL
        axios.get('http://localhost:5000/api/documents') // Specify the full backend URL
            .then(response => {
                console.log(response);
                setDocuments(response.data);
            })
            .catch(error => {
                console.error('Error fetching documents', error);
            });
    }, []);

    const handleDocumentClick = (documentId) => {
        // Navigate to the editor page for the selected document
        navigate(`/${documentId}`);
    };

    const handleCreateDocument = () => {
        // Create a new document in the backend with full URL
        axios.post('http://localhost:5000/api/documents', { title: 'Untitled' }) // Specify the full backend URL
            .then(response => {
                const newDocumentId = response.data._id;
                // Navigate to the editor for the newly created document
                navigate(`/${newDocumentId}`);
            })
            .catch(error => {
                console.error('Error creating new document', error);
            });
    };

    return (
        <div>
            <h1>Documents List</h1>
            <button onClick={handleCreateDocument}>Create New Document</button>
            <ul>
                {documents.map(doc => (
                    <li key={doc._id} onClick={() => handleDocumentClick(doc._id)}>
                        {doc.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DocumentsList;
