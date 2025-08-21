import React from 'react';
import BiometricLogin from './components/BiometricLogin';
import OperatingSystemUI from './components/OperatingSystemUI';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationContainer from './components/NotificationContainer';
import { useSessionManager } from './hooks/useSessionManager';
import SuspendedSessionModal from './components/SuspendedSessionModal';
import InactivityModal from './components/InactivityModal';
import { useInactivityTimer } from './hooks/useInactivityTimer';
import type { Session } from './services/authService';


const AppContent: React.FC = () => {
  const { 
    isAuthenticated, 
    isGodMode, 
    isSuspended, 
    suspensionReason, 
    login, 
    logout, 
    reactivate, 
    suspend 
  } = useSessionManager();

  const { isWarningVisible, handleStay, countdown } = useInactivityTimer({
    onTimeout: suspend,
    enabled: isAuthenticated && !isSuspended,
    timeout: 300000,
    warningTime: 60000,
  });

  const handleLogin = async (session: Session) => {
    await login(session);
  };

  return (
    <div className="relative">
      {!isAuthenticated ? (
        <BiometricLogin onSuccess={handleLogin} />
      ) : (
        <OperatingSystemUI onLogout={logout} isGodMode={isGodMode} />
      )}
      {isSuspended && <SuspendedSessionModal reason={suspensionReason} onReactivate={reactivate} onLogout={logout} />}
      {isWarningVisible && !isSuspended && (
        <InactivityModal
          countdown={countdown}
          onStay={handleStay}
          onLogout={logout}
        />
      )}
      <NotificationContainer />
    </div>
  );
}

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
};

export default App;
