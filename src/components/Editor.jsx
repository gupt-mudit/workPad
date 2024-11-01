import React, { useEffect, useState } from 'react';
import Quill from 'quill';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { QuillBinding } from 'y-quill';
import { Box } from '@mui/material';
import styled from '@emotion/styled';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

const Component = styled.div`
    background: #F5F5F5;
`;

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'color': [] }, { 'background': [] }],
    ['clean'],
];

export const Editor = () => {
    const [socket, setSocket] = useState(null);
    const [quill, setQuill] = useState(null);
    const { documentId } = useParams(); // Get the document ID from the URL

    const initializeEditor = async (quill) => {
        const response = await fetch(`http://localhost:5000/api/documents/${documentId}`);
        if (response.ok) {
            const { state } = await response.json();
            if (state) {
                console.log("state:", state);
                quill.setContents(state); // Set the editor's content if it exists
                quill.enable(); // Enable the editor after setting content
            }
        } else {
            console.error('Failed to retrieve room state:', response.statusText);
        }
    };

    useEffect(() => {
        const ydoc = new Y.Doc();
        const provider = new WebsocketProvider(`ws://localhost:1234?roomName=${documentId}`, documentId, ydoc);
        const ytext = ydoc.getText('quill');

        // Using querySelector to attach Quill
        const quill = new Quill('#container', {
            theme: 'snow',
            modules: {
                cursors: true,
                toolbar: toolbarOptions,
            },
        });
        setQuill(quill);

        // Bind Yjs with Quill
        const quillBinding = new QuillBinding(ytext, quill);

        // Initialize the editor with state from MongoDB
        initializeEditor(quill);

        // Observe Yjs document changes
        ytext.observe((event) => {
            console.log('Yjs document updated:', event);
        });

        // Cleanup on unmount
        return () => {

            provider.destroy();
            ydoc.destroy();
            quillBinding.destroy();
        };
    }, [documentId]); // Depend on documentId to re-run effect on change

    // Initialize socket and ensure it's set
    useEffect(() => {
        const socketServer = io('http://localhost:9000');
        setSocket(socketServer);

        socketServer.on('connect', () => {
            console.log('Socket connected:', socketServer.id);
            socketServer.emit('join-room', documentId);
        });

        // Ensure proper cleanup
        return () => {
            if (socketServer) {
                socketServer.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        if (socket === null || quill === null) return;

        const interval = setInterval(() => {
            socket.emit('update-document', quill.getContents())
        }, 2000);

        return () => {
            clearInterval(interval);
        }
    }, [socket, quill]);

    return (
        <Component>
            <Box className='container' id='container' style={{ height: '400px' }}></Box>
        </Component>
    );
};

export default Editor;
