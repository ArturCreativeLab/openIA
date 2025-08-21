import React from 'react';
import Window from './Window';
import { SystemMonitorIcon } from './icons';

const SystemMonitorApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const sessionData = sessionStorage.getItem('app_session');
  const session = sessionData ? JSON.parse(sessionData) : null;

  return (
    <Window 
      title="Monitor del Sistema (Modo Dios)" 
      icon={<SystemMonitorIcon />} 
      onClose={onClose} 
      initialSize={{ width: '450px', height: '300px' }}
      initialPosition={{ x: 300, y: 80 }}
    >
      <div className="p-4 bg-black text-green-400 font-mono text-sm h-full overflow-y-auto">
        <p>&gt; Cargando información de la sesión...</p>
        {session ? (
          <>
            <p className="mt-2 text-yellow-400">-- SESIÓN ACTIVA --</p>
            <p>&gt; Usuario: <span className="text-white">{session.user?.name}</span></p>
            <p>&gt; Email: <span className="text-white">{session.user?.email}</span></p>
            <p>&gt; Privilegios: <span className="text-red-500 font-bold">{session.isGodMode ? 'MODO DIOS' : 'Estándar'}</span></p>
            <p className="mt-2 text-yellow-400">-- DATOS CRUDOS --</p>
            <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(session, null, 2)}</pre>
          </>
        ) : (
          <p className="text-red-500">&gt; ERROR: No se pudo cargar la sesión.</p>
        )}
      </div>
    </Window>
  );
};

export default SystemMonitorApp;
