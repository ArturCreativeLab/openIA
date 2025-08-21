import React from 'react';
import { XIcon } from './icons';

interface WindowProps {
  title: string;
  icon: React.ReactElement;
  onClose: () => void;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: string; height?: string };
  className?: string;
}

const Window: React.FC<WindowProps> = ({ title, icon, onClose, children, initialPosition, initialSize, className }) => {
  return (
    <div 
      className={`absolute bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-black border-b-black shadow-lg flex flex-col z-20 ${className}`}
      style={{ 
        top: initialPosition?.y || 100, 
        left: initialPosition?.x || 100,
        width: initialSize?.width || '400px',
        height: initialSize?.height,
      }}
    >
      <div className="flex items-center justify-between bg-gradient-to-r from-[#000080] to-[#1084d0] p-1 text-white font-bold text-sm select-none h-6">
        <div className="flex items-center truncate">
          {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-4 h-4' })}
          <span className="ml-1 truncate">{title}</span>
        </div>
        <button onClick={onClose} className="bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-black border-b-black w-5 h-5 flex items-center justify-center font-bold text-black focus:outline-none active:border-t-black active:border-l-black active:border-r-white active:border-b-white">
          <XIcon className="w-3 h-3" strokeWidth={3} />
        </button>
      </div>
      <div className="p-0.5 flex-grow relative">
        {children}
      </div>
    </div>
  );
};

export default Window;