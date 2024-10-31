'use client';

import { useEffect, useState } from 'react';
import { Doc } from '@blocksuite/store';
import { useEditor } from '../editor/context';
import ChatBot from './ChatBot';

const Sidebar = () => {
  const { collection, editor } = useEditor()!;
  const [docs, setDocs] = useState<Doc[]>([]);

  useEffect(() => {
    if (!collection || !editor) return;
    const updateDocs = () => {
      const docs = [...collection.docs.values()].map(blocks => blocks.getDoc());
      setDocs(docs);
    };
    updateDocs();

    const disposable = [
      collection.slots.docUpdated.on(updateDocs),
      editor.slots.docLinkClicked.on(updateDocs),
    ];

    return () => disposable.forEach(d => d.dispose());
  }, [collection, editor]);

  const createNewDoc = () => {
    if (!collection) return;
    const newDoc = collection.createDoc();
    if (editor) editor.doc = newDoc;
    const docs = [...collection.docs.values()].map(blocks => blocks.getDoc());
    setDocs(docs);
  };

  const removeDoc = (docToRemove: Doc, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent div's onClick
    if (!collection) return;
    
    collection.removeDoc(docToRemove.id);
    
    // If the removed doc was active, switch to another doc
    if (editor?.doc === docToRemove) {
      const remainingDocs = [...collection.docs.values()];
      if (remainingDocs.length > 0) {
        editor.doc = remainingDocs[0].getDoc();
      }
    }
    
    const updatedDocs = [...collection.docs.values()].map(blocks => blocks.getDoc());
    setDocs(updatedDocs);
  };

  return (
    <div className="sidebar">
      <div className="header">
        All Docs
        <button 
          className="new-doc-button" 
          onClick={createNewDoc}
        >
          New Page
        </button>
      </div>
      <div className="doc-list">
        {docs.map(doc => (
          <div
            className={`doc-item ${editor?.doc === doc ? 'active' : ''}`}
            key={doc.id}
            onClick={() => {
              if (editor) editor.doc = doc;
              const docs = [...collection.docs.values()].map(blocks =>
                blocks.getDoc()
              );
              setDocs(docs);
            }}
          >
            <div className="doc-item-content">
              <span>{doc.meta?.title || 'Untitled'}</span>
              <button 
                className="remove-doc-button"
                onClick={(e) => removeDoc(doc, e)}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="chat-section">
        <h3>AI Assistant</h3>
        <ChatBot />
      </div>
    </div>
  );
};

export default Sidebar;
