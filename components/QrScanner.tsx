import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import LoadingSpinner from './LoadingSpinner';

interface QrScannerProps {
  onScan: (data: string) => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<ReturnType<typeof requestAnimationFrame>>();
  const [cameraStatus, setCameraStatus] = useState<'requesting' | 'streaming' | 'error'>('requesting');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (context) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            onScan(code.data);
            return; // Stop scanning
          }
        }
      }
      animationFrameId.current = requestAnimationFrame(tick);
    };

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('La cámara no es compatible con este navegador.');
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setCameraStatus('streaming');
            animationFrameId.current = requestAnimationFrame(tick);
          };
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError('No se pudo acceder a la cámara. Por favor, comprueba los permisos.');
        setCameraStatus('error');
      }
    };

    startCamera();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onScan]);

  if (cameraStatus === 'requesting') {
    return <LoadingSpinner message="Accediendo a la cámara..." />;
  }

  if (cameraStatus === 'error') {
    return <p className="text-red-400 text-center max-w-xs">{error}</p>;
  }

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-lg overflow-hidden border-4 border-slate-700">
      <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
      <div className="absolute top-1/2 left-1/2 w-4/5 h-4/5 -translate-x-1/2 -translate-y-1/2 border-4 border-purple-400 rounded-md animate-pulse-scanner-box"></div>
       <style>{`
        .bg-grid-pattern {
            background-image:
                linear-gradient(to right, rgba(128, 90, 213, 0.2) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(128, 90, 213, 0.2) 1px, transparent 1px);
            background-size: 20px 20px;
        }
        @keyframes pulse-scanner-box {
          0%, 100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(0.98);
          }
        }
      `}</style>
    </div>
  );
};

export default QrScanner;
