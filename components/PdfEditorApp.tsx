import React, { useState, useCallback } from 'react';
import { pdfjs } from 'react-pdf';
import FileUpload from './FileUpload';
import PdfViewer from './PdfViewer';
import EditModal from './EditModal';
import type { EditableBlock } from '../types';
import { analyzePageImage } from '../services/geminiService';
import { useTutorial } from '../hooks/useTutorial';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Setup PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfEditorAppProps {
    onClose: () => void;
}

const PdfEditorApp: React.FC<PdfEditorAppProps> = ({ onClose }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [editableBlocks, setEditableBlocks] = useState<EditableBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<EditableBlock | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const { triggerActivity } = useTutorial();

  const resetState = useCallback((fullReset: boolean = true) => {
    if (fullReset) {
      setPdfFile(null);
    }
    setEditableBlocks([]);
    setSelectedBlock(null);
    setIsLoading(false);
    setLoadingMessage('');
    setError(null);
    setCurrentPage(1);
    setTotalPages(0);
  }, []);
  
  const handleCloseEditor = useCallback(() => {
    resetState(true);
    onClose();
  }, [onClose, resetState]);

  const handleFileChange = (file: File) => {
    resetState(false);
    setPdfFile(file);
    triggerActivity('uploadSuccess');
  };

  const analyzePdfPage = useCallback(async (pageImageBase64: string) => {
    setIsLoading(true);
    setLoadingMessage('Analizando la estructura del documento con IA...');
    setError(null);
    setEditableBlocks([]);

    try {
      const blocks = await analyzePageImage(pageImageBase64);
      setEditableBlocks(blocks);
      triggerActivity('analysisSuccess');
    } catch (err) {
      console.error(err);
      setError('No se pudo analizar el documento. Por favor, intente con otro archivo.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [triggerActivity]);

  const handleBlockClick = (block: EditableBlock) => {
    setSelectedBlock(block);
  };

  const handleUpdateBlock = (updatedBlock: EditableBlock) => {
    triggerActivity('firstEdit');
    setEditableBlocks(prevBlocks =>
      prevBlocks.map(b => (b.id === updatedBlock.id ? updatedBlock : b))
    );
    setSelectedBlock(null);
  };

  const handleCloseModal = () => {
    setSelectedBlock(null);
  };

  const handlePrevPage = () => {
    if (totalPages > 1) triggerActivity('multiPage');
    setCurrentPage(p => Math.max(1, p - 1));
  };
  
  const handleNextPage = () => {
    if (totalPages > 1) triggerActivity('multiPage');
    setCurrentPage(p => Math.min(totalPages, p + 1));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-7xl mb-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          Editor Visual de PDF con IA
        </h1>
        <p className="text-slate-400 mt-2">Sube un PDF para comenzar a editar su contenido de forma interactiva.</p>
      </header>
      
      <main className="w-full max-w-7xl flex-grow flex flex-col items-center justify-center">
        {!pdfFile ? (
          <FileUpload onFileSelect={handleFileChange} />
        ) : (
          <div className="w-full flex flex-col items-center">
            <PdfViewer
              file={pdfFile}
              editableBlocks={editableBlocks}
              onBlockClick={handleBlockClick}
              onPageRender={analyzePdfPage}
              isLoading={isLoading}
              loadingMessage={loadingMessage}
              currentPage={currentPage}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
              totalPages={totalPages}
              setTotalPages={setTotalPages}
              setEditableBlocks={setEditableBlocks}
            />
            {error && <p className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
            <button
              onClick={handleCloseEditor}
              className="mt-8 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-orange-500"
            >
              Volver al Escritorio
            </button>
          </div>
        )}
      </main>

      {selectedBlock && (
        <EditModal
          block={selectedBlock}
          onSave={handleUpdateBlock}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default PdfEditorApp;