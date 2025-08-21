import React, { useEffect, useRef, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { FaceScanIcon } from './icons';

interface FacialRecognitionProps {
  onSuccess: () => void;
}

const FacialRecognition: React.FC<FacialRecognitionProps> = ({ onSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'requesting' | 'scanning' | 'success' | 'error'>('requesting');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startScan = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setStatus('scanning');
            // Simulate a successful scan after a delay
            setTimeout(() => {
              setStatus('success');
              setTimeout(onSuccess, 1000);
            }, 3000);
          }
        } else {
            throw new Error('La cámara no es compatible con este navegador.');
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError('No se pudo acceder a la cámara. Por favor, comprueba los permisos.');
        setStatus('error');
      }
    };

    startScan();

    return () => {
      // Cleanup: stop the camera stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onSuccess]);

  const renderContent = () => {
    switch (status) {
      case 'requesting':
        return <LoadingSpinner message="Accediendo a la cámara..." />;
      case 'error':
        return <p className="text-red-400">{error}</p>;
      case 'success':
         return (
            <div className="flex flex-col items-center justify-center text-green-400">
                <FaceScanIcon className="w-20 h-20 mb-4" />
                <p className="text-lg font-semibold">Rostro Verificado</p>
            </div>
        );
      case 'scanning':
        return (
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-lg overflow-hidden border-4 border-slate-700">
            <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" muted playsInline />
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-4/5 h-5/6 border-4 border-purple-400 rounded-[50%] animate-pulse-scanner-box"
                style={{
                  boxShadow: '0 0 0 1000px rgba(22, 29, 47, 0.7)'
                }}
              ></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {renderContent()}
       <style>{`
        @keyframes pulse-scanner-box {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(0.98);
          }
        }
      `}</style>
    </div>
  );
};

export default FacialRecognition;
