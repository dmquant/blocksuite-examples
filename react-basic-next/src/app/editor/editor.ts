import { AffineEditorContainer } from '@blocksuite/presets';
import { Doc, Schema } from '@blocksuite/store';
import { DocCollection } from '@blocksuite/store';
import { createContext, useContext } from 'react';
import { AffineSchemas } from '@blocksuite/blocks';
import '@blocksuite/presets/themes/affine.css';

export interface EditorContextType {
  editor: AffineEditorContainer | null;
  collection: DocCollection | null;
  updateCollection: (newCollection: DocCollection) => void;
}

export const EditorContext = createContext<EditorContextType | null>(null);

export function useEditor() {
  return useContext(EditorContext);
}

export function initEditor() {
  const schema = new Schema().register(AffineSchemas);
  const collection = new DocCollection({ schema });
  collection.meta.initialize();

  const createInitialPage = (doc: Doc) => {
    doc.load(() => {
      const pageBlockId = doc.addBlock('affine:page', {});
      doc.addBlock('affine:surface', {}, pageBlockId);
      const noteId = doc.addBlock('affine:note', {}, pageBlockId);
      doc.addBlock('affine:paragraph', {}, noteId);
    });
  };

  const doc = collection.createDoc({ id: 'page1' });
  createInitialPage(doc);

  const editor = new AffineEditorContainer();
  editor.doc = doc;

  collection.createDoc = function(options = {}) {
    const newDoc = DocCollection.prototype.createDoc.call(this, options);
    createInitialPage(newDoc);
    return newDoc;
  };

  editor.slots.docLinkClicked.on(({ docId }) => {
    const target = <Doc>collection.getDoc(docId);
    editor.doc = target;
  });

  return { editor, collection };
}
