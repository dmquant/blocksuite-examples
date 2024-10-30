import { useEffect, useRef, useState } from 'react';
import { useEditor } from '../editor/context';

interface LayoutItem {
  id: string;
  type: 'text' | 'image';
  content: string;
  position: { x: number; y: number };
}

const FreeLayoutBlock = () => {
  const { editor } = useEditor()!;
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<LayoutItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleAddText = () => {
    const newItem: LayoutItem = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'New Text',
      position: { x: 50, y: 50 },
    };
    setItems([...items, newItem]);
  };

  const handleAddImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newItem: LayoutItem = {
            id: `image-${Date.now()}`,
            type: 'image',
            content: e.target?.result as string,
            position: { x: 50, y: 50 },
          };
          setItems([...items, newItem]);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleMouseDown = (id: string) => {
    setIsDragging(true);
    setDraggedItem(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && draggedItem && containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const x = e.clientX - container.left;
      const y = e.clientY - container.top;

      setItems(items.map(item => 
        item.id === draggedItem 
          ? { ...item, position: { x, y } }
          : item
      ));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedItem(null);
  };

  return (
    <div className="free-layout-block">
      <div className="toolbar">
        <button onClick={handleAddText}>Add Text</button>
        <button onClick={handleAddImage}>Add Image</button>
      </div>
      <div 
        ref={containerRef}
        className="layout-container"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {items.map(item => (
          <div
            key={item.id}
            className="layout-item"
            style={{
              position: 'absolute',
              left: item.position.x,
              top: item.position.y,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={() => handleMouseDown(item.id)}
          >
            {item.type === 'text' ? (
              <div
                contentEditable
                suppressContentEditableWarning
                className="text-content"
              >
                {item.content}
              </div>
            ) : (
              <img src={item.content} alt="" className="image-content" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreeLayoutBlock;