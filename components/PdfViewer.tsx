import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Document, Page } from 'react-pdf';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { EditableBlock } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface PdfViewerProps {
  file: File;
  editableBlocks: EditableBlock[];
  onBlockClick: (block: EditableBlock) => void;
  onPageRender: (pageImageBase64: string) => void;
  isLoading: boolean;
  loadingMessage: string;
  currentPage: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  totalPages: number;
  setTotalPages: (pages: number) => void;
  setEditableBlocks: (blocks: EditableBlock[]) => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
  file,
  editableBlocks,
  onBlockClick,
  onPageRender,
  isLoading,
  loadingMessage,
  currentPage,
  onPrevPage,
  onNextPage,
  totalPages,
  setTotalPages,
  setEditableBlocks,
}) => {
  const [scale, setScale] = useState(1.0);
  const pageRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = ({ numPages }: PDFDocumentProxy) => {
    setTotalPages(numPages);
  };

  const capturePageAsImage = useCallback(() => {
    if (pageRef.current) {
      const canvas = pageRef.current.querySelector('canvas');
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onPageRender(dataUrl.split(',')[1]); // Send only base64 part
      }
    }
  }, [onPageRender]);

  useEffect(() => {
      setEditableBlocks([]);
      // A small timeout allows the canvas to be ready before capturing
      const timer = setTimeout(() => {
        capturePageAsImage();
      }, 500);
      return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, file]);


  return (
    <div className="w-full flex flex-col items-center space-y-4">
      <div className="w-full max-w-4xl p-2 bg-slate-800 rounded-lg shadow-lg relative flex flex-col items-center">
        <div 
          ref={pageRef} 
          className="relative w-full h-full flex justify-center"
          style={{ transform: `scale(${scale})` }}
        >
          <Document file={file} onLoadSuccess={onDocumentLoadSuccess} loading={<LoadingSpinner message="Cargando PDF..." />}>
            <Page pageNumber={currentPage} renderTextLayer={false}/>
          </Document>
          
          {isLoading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20">
              <LoadingSpinner message={loadingMessage} />
            </div>
          )}
          
          <div className="absolute top-0 left-0 w-full h-full z-10">
            {editableBlocks.map(block => (
              <div
                key={block.id}
                onClick={() => onBlockClick(block)}
                className="absolute border-2 border-transparent hover:border-purple-500 hover:bg-purple-500/20 cursor-pointer transition-all duration-200 rounded-sm"
                style={{
                  left: `${block.bbox.x}px`,
                  top: `${block.bbox.y}px`,
                  width: `${block.bbox.width}px`,
                  height: `${block.bbox.height}px`,
                }}
              >
                <div className="w-full h-full select-none text-transparent">{block.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {totalPages > 0 && (
        <div className="flex items-center justify-center space-x-4 p-2 bg-slate-800 rounded-full shadow-md">
          <button onClick={onPrevPage} disabled={currentPage <= 1} className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors">
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <span className="font-mono text-lg">
            {currentPage} / {totalPages}
          </span>
          <button onClick={onNextPage} disabled={currentPage >= totalPages} className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors">
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;