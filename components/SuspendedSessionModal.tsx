import React from 'react';
import { AlertTriangleIcon } from './icons';

interface SuspendedSessionModalProps {
  onReactivate: () => void;
  onLogout: () => void;
  reason: 'duplicate' | 'inactivity' | null;
}

const SuspendedSessionModal: React.FC<SuspendedSessionModalProps> = ({ onReactivate, onLogout, reason }) => {
  const title = reason === 'inactivity' ? 'Sesión Suspendida por Inactividad' : 'Sesión Suspendida';
  const message = reason === 'inactivity'
    ? 'Tu sesión ha sido suspendida por inactividad. Reactiva la sesión para continuar.'
    : 'Tu sesión está activa en otra pestaña o dispositivo. Puedes reactivar la sesión aquí o cerrar la sesión.';

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="suspended-session-modal-title"
    >
      <div
        className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        style={{ animation: 'fade-in-scale 0.3s forwards' }}
      >
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-900/50 mb-4">
            <AlertTriangleIcon className="h-8 w-8 text-yellow-400" />
          </div>
          <h2 id="suspended-session-modal-title" className="text-2xl font-bold mb-2 text-slate-100">
            {title}
          </h2>
          <p className="text-slate-400 mb-6">
            {message}
          </p>
        </div>
        <div className="flex justify-end space-x-4 bg-slate-900/50 p-4 rounded-b-xl">
          <button
            onClick={onLogout}
            className="px-5 py-2 bg-slate-700 text-slate-200 font-semibold rounded-lg hover:bg-slate-600 transition-colors duration-200"
          >
            Salir
          </button>
          <button
            onClick={onReactivate}
            className="px-5 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500"
            autoFocus
          >
            Reactivar Sesión
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

export default SuspendedSessionModal;