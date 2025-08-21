import React from 'react';
import Window from './Window';
import { NotepadIcon } from './icons';

const NotepadApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <Window 
      title="Sin título - Bloc de notas" 
      icon={<NotepadIcon />} 
      onClose={onClose} 
      initialSize={{ width: '500px', height: '400px' }}
      initialPosition={{ x: 150, y: 50 }}
    >
      <textarea 
        className="w-full h-full bg-white text-black font-mono text-sm border-2 border-l-[#808080] border-t-[#808080] border-r-white border-b-white focus:outline-none resize-none p-1" 
        spellCheck="false"
      />
    </Window>
  );
};

export default NotepadApp;