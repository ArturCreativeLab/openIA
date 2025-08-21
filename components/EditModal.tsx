import React, { useState, useEffect } from 'react';
import type { EditableBlock } from '../types';

interface EditModalProps {
  block: EditableBlock;
  onSave: (updatedBlock: EditableBlock) => void;
  onClose: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ block, onSave, onClose }) => {
  const [content, setContent] = useState(block.content);

  useEffect(() => {
    setContent(block.content);
  }, [block]);

  const handleSave = () => {
    onSave({ ...block, content });
  };
  
  // Handle Escape key press to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fade-in-scale 0.3s forwards' }}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-slate-100">Editar Contenido</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 p-3 bg-slate-900 border border-slate-700 rounded-md text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-y transition-colors"
            autoFocus
          />
        </div>
        <div className="flex justify-end space-x-4 bg-slate-900/50 p-4 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-700 text-slate-200 font-semibold rounded-lg hover:bg-slate-600 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default EditModal;