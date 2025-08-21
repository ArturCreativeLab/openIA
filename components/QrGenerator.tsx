import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import LoadingSpinner from './LoadingSpinner';

interface QrGeneratorProps {
  data: string | null;
}

const QrGenerator: React.FC<QrGeneratorProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
     if (data && canvasRef.current) {
         QRCode.toCanvas(canvasRef.current, data, { errorCorrectionLevel: 'H', width: 224, margin: 2 })
            .catch(err => console.error("Failed to generate QR code:", err));
     }
  }, [data]);


  if (!data) {
    return <LoadingSpinner message="Generando código QR..." />;
  }

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default QrGenerator;
