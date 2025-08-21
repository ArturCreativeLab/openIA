import React, { useState, useRef, useEffect } from 'react';
import { FingerprintIcon, QrCodeIcon, KeyIcon, FaceScanIcon, GoogleIcon, MicIcon, ShieldIcon, SmartphoneIcon, CodeIcon } from './icons';
import QrScanner from './QrScanner';
import QrGenerator from './QrGenerator';
import FacialRecognition from './FacialRecognition';
import { useTutorial } from '../hooks/useTutorial';
import { authService, type Session } from '../services/authService';
import VoiceRecognition from './VoiceRecognition';
import LoadingSpinner from './LoadingSpinner';

interface BiometricLoginProps {
  onSuccess: (session: Session) => void;
}

type LoginMode = 'fingerprint' | 'qr' | 'key' | 'face' | 'google' | 'voice' | 'mobile-auth';
type QrFlowState = 'none' | 'initiator-challenge' | 'initiator-response' | 'authorizer-scan' | 'authorizer-provide';

const BiometricLogin: React.FC<BiometricLoginProps> = ({ onSuccess }) => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [statusText, setStatusText] = useState('');
  const [loginMode, setLoginMode] = useState<LoginMode>('fingerprint');
  const [isFingerprintSupported, setIsFingerprintSupported] = useState<boolean | null>(null);
  const [isGodModeActivating, setIsGodModeActivating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { triggerActivity } = useTutorial();

  // States for God Mode 2FA
  const [isAwaitingCoreAccess, setIsAwaitingCoreAccess] = useState(false);
  const [coreUsername, setCoreUsername] = useState('');
  const [corePassword, setCorePassword] = useState('');
  const [coreAccessError, setCoreAccessError] = useState('');
  const [pendingGodModeSession, setPendingGodModeSession] = useState<Session | null>(null);

  // States for Secure QR Flow
  const [qrFlowState, setQrFlowState] = useState<QrFlowState>('none');
  const [qrChallengeId, setQrChallengeId] = useState<string | null>(null);

  useEffect(() => {
    const checkSupport = async () => {
      if (window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        try {
          const supported = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsFingerprintSupported(supported);
        } catch (e) {
            console.error("Error checking authenticator availability:", e);
            setIsFingerprintSupported(false);
        }
      } else {
        setIsFingerprintSupported(false);
      }
    };
    checkSupport();
  }, []);

  useEffect(() => {
    if (isGodModeActivating || isAwaitingCoreAccess || qrFlowState !== 'none') return;
    setStatus('idle');
    switch (loginMode) {
      case 'fingerprint':
        if (isFingerprintSupported === null) {
          setStatusText('Comprobando compatibilidad del sensor...');
        } else if (isFingerprintSupported) {
          setStatusText('Verificación biométrica requerida');
        } else {
          setStatusText('Sensor de huella no disponible en este dispositivo.');
        }
        break;
      case 'qr':
        setStatusText('Inicia una conexión segura para acceder');
        break;
      case 'mobile-auth':
        setStatusText('Autoriza un dispositivo para iniciar sesión');
        break;
      case 'key':
        setStatusText('Sube tu llave biológica');
        break;
      case 'face':
        setStatusText('Coloca tu rostro en el recuadro');
        break;
      case 'google':
        setStatusText('Inicia sesión con tu cuenta de Google');
        break;
      case 'voice':
        setStatusText('Di "Abrir sistema operativo" para sellar el acceso');
        break;
    }
  }, [loginMode, isFingerprintSupported, isGodModeActivating, isAwaitingCoreAccess, qrFlowState]);

  useEffect(() => {
    if (isGodModeActivating || isAwaitingCoreAccess) return;

    if (loginMode === 'google' && (window as any).google) {
      const google = (window as any).google;
      
      google.accounts.id.initialize({
        client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
        callback: (response: any) => {
          const session = authService.verifyGoogleCredential(response.credential);
          if (session) {
            if (session.isGodMode) {
                setPendingGodModeSession(session);
                setIsAwaitingCoreAccess(true);
            } else {
                setStatus('success');
                setStatusText('Verificación Exitosa.');
                setTimeout(() => onSuccess(session), 1000);
            }
          } else {
              setStatus('error');
              setStatusText('Error al verificar la sesión de Google.');
          }
        },
      });

      google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'outline', size: 'large', type: 'standard', text: 'signin_with', shape: 'pill' }
      );
    }
  }, [loginMode, onSuccess, isGodModeActivating, isAwaitingCoreAccess]);

  const handleCoreAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (coreUsername === 'admin' && corePassword === 'admin') {
        setCoreAccessError('');
        setIsAwaitingCoreAccess(false);
        
        setIsGodModeActivating(true);
        setStatus('scanning');
        setStatusText('MODO DIOS DETECTADO...');
        
        setTimeout(() => {
            setStatusText('INICIANDO PROTOCOLO DE PRIVILEGIOS ELEVADOS...');
        }, 1500);

        setTimeout(() => {
            setStatus('success');
            setStatusText('ACCESO CONCEDIDO.');
        }, 3500);
        
        if (pendingGodModeSession) {
            setTimeout(() => onSuccess(pendingGodModeSession), 4500);
        }
    } else {
        setCoreAccessError('Credenciales de núcleo incorrectas.');
        setCorePassword('');
    }
  };

  const handleGenericSuccess = () => {
    const genericSession: Session = {
        isAuthenticated: true,
        isGodMode: false,
        user: {
            email: 'standard.user@system.local',
            name: 'Standard User',
            picture: '',
        }
    };
    setStatus('success');
    setStatusText('Verificación Exitosa.');
    setTimeout(() => onSuccess(genericSession), 1000);
  };
  
  const resetQrFlow = () => {
    setQrFlowState('none');
    setQrChallengeId(null);
    setStatus('idle');
  };

  const handleQrScan = (data: string) => {
    try {
      const parsed = JSON.parse(data);

      if (qrFlowState === 'initiator-response' && parsed.type === 'authResponse' && parsed.challengeId === qrChallengeId) {
        setStatus('success');
        setStatusText('Autorización recibida. Acceso Concedido.');
        const sessionFromQr = parsed.session as Session;
        if (!sessionFromQr || !sessionFromQr.user) throw new Error("Invalid session in QR response.");
        setTimeout(() => onSuccess(sessionFromQr), 1500);
      } else if (qrFlowState === 'authorizer-scan' && parsed.type === 'authRequest' && parsed.challengeId) {
        setQrChallengeId(parsed.challengeId);
        setQrFlowState('authorizer-provide');
      } else {
        throw new Error('Código QR no válido para este paso.');
      }
    } catch (e: any) {
      setStatus('error');
      setStatusText(e.message || 'No se pudo leer el código QR.');
      setTimeout(() => {
        resetQrFlow();
      }, 3000);
    }
  };

  const handleFingerprintScan = async () => {
    if (!isFingerprintSupported) return;

    setStatus('scanning');
    setStatusText('Esperando la huella para sellar el acceso...');

    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const credential = await navigator.credentials.get({
            publicKey: {
                challenge,
                rpId: window.location.hostname,
                userVerification: 'required',
            },
        });
        
        if (credential) {
            setStatus('success');
            setStatusText('Contrato Sellado. Verificación Exitosa.');
            setTimeout(handleGenericSuccess, 1500);
        } else {
            throw new Error('No se recibió la credencial biométrica.');
        }

    } catch (err) {
        setStatus('idle');
        if (err instanceof DOMException && err.name === 'NotAllowedError') {
            setStatusText('Verificación cancelada por el usuario.');
        } else {
            setStatus('error');
            setStatusText('Error de autenticación biométrica. Inténtalo de nuevo.');
            console.error("WebAuthn Error:", err);
        }
    }
  };
  
  const handleKeyUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setStatus('scanning');
      setStatusText('Verificando llave...');
      setTimeout(() => {
        handleGenericSuccess();
      }, 1500);
    }
  };
  
  const renderLoginMethod = () => {
    if (isGodModeActivating) {
        return (
            <div className="flex flex-col items-center text-center">
                <div className="relative w-40 h-40 flex items-center justify-center">
                    <ShieldIcon className="w-24 h-24 text-yellow-400" />
                    <div className="absolute inset-0 rounded-full border-4 border-yellow-500 animate-pulse-scanner opacity-75"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-yellow-300 animate-ping opacity-50"></div>
                </div>
            </div>
        );
    }
    
    if (qrFlowState !== 'none') {
        const CancelButton = () => (
             <button onClick={resetQrFlow} className="mt-4 text-sm text-slate-500 hover:text-slate-300">Cancelar</button>
        );
        switch (qrFlowState) {
            case 'initiator-challenge':
                const challengePayload = JSON.stringify({ type: 'authRequest', challengeId: qrChallengeId, name: 'AI PDF Editor' });
                return (
                    <div className="flex flex-col items-center text-center">
                        <QrGenerator data={challengePayload} />
                        <p className="mt-4 text-slate-300 max-w-sm"><b>Paso 1/2:</b> Escanee este código usando la opción "Autorizar con QR" en su dispositivo de confianza.</p>
                        <button onClick={() => setQrFlowState('initiator-response')} className="mt-4 px-5 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-200">Siguiente</button>
                        <CancelButton />
                    </div>
                );
            case 'initiator-response':
                return (
                    <div className="flex flex-col items-center text-center">
                        <p className="mb-4 text-slate-300 max-w-sm"><b>Paso 2/2:</b> Ahora, escanee el código de autorización que se muestra en su otro dispositivo.</p>
                        <QrScanner onScan={handleQrScan} />
                        <CancelButton />
                    </div>
                );
            case 'authorizer-scan':
                return (
                    <div className="flex flex-col items-center text-center">
                         <p className="mb-4 text-slate-300 max-w-sm"><b>Paso 1/2:</b> Escanee el código del dispositivo al que desea dar acceso.</p>
                        <QrScanner onScan={handleQrScan} />
                        <CancelButton />
                    </div>
                );
            case 'authorizer-provide':
                const mockSession: Session = {
                    isAuthenticated: true, isGodMode: false,
                    user: { email: 'qr.user@system.local', name: 'Usuario QR', picture: '' }
                };
                const responsePayload = JSON.stringify({ type: 'authResponse', challengeId: qrChallengeId, session: mockSession });
                return (
                    <div className="flex flex-col items-center text-center">
                         <p className="mb-4 text-slate-300 max-w-sm"><b>Paso 2/2:</b> ¡Listo! Muestre este código para completar el inicio de sesión.</p>
                        <QrGenerator data={responsePayload} />
                        <CancelButton />
                    </div>
                );
        }
    }
    
    switch (loginMode) {
      case 'qr':
      case 'mobile-auth':
        return <LoadingSpinner message="Iniciando conexión segura..." />;
      case 'face':
        return <FacialRecognition onSuccess={handleGenericSuccess} />;
      case 'voice':
        return <VoiceRecognition onSuccess={handleGenericSuccess} />;
      case 'google':
        return (
          <div className="flex flex-col items-center justify-center min-h-[160px]">
            <div id="google-signin-button"></div>
          </div>
        );
      case 'key':
        return (
            <div className="flex flex-col items-center">
                <button
                  onClick={handleKeyUploadClick}
                  disabled={status !== 'idle'}
                  className="relative w-40 h-40 rounded-full border-4 border-slate-700 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:cursor-not-allowed group"
                >
                    <KeyIcon
                        className={`w-20 h-20 transition-colors duration-300 ${
                          status === 'idle' ? 'text-slate-500 group-hover:text-purple-400' : ''
                        } ${status === 'scanning' ? 'text-purple-400' : ''} ${
                          status === 'success' ? 'text-green-400' : ''
                        }`}
                    />
                     {status === 'scanning' && (
                        <div className="absolute inset-0 rounded-full border-4 border-purple-500 animate-pulse-scanner"></div>
                    )}
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".key,.pem,.cert"
                />
            </div>
        );
      case 'fingerprint':
      default:
        return (
          <button
            onClick={handleFingerprintScan}
            disabled={status !== 'idle' || !isFingerprintSupported}
            className="relative w-40 h-40 rounded-full border-4 border-slate-700 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:cursor-not-allowed group disabled:opacity-50"
            aria-label="Iniciar autenticación con huella digital"
          >
            <FingerprintIcon
              className={`w-20 h-20 transition-colors duration-300 ${
                status === 'idle' ? 'text-slate-500 group-hover:text-purple-400' : ''
              } ${status === 'scanning' ? 'text-purple-400' : ''} ${
                status === 'success' ? 'text-green-400' : ''
              } ${!isFingerprintSupported ? 'text-slate-800' : ''}`}
            />
            {status === 'scanning' && (
              <div className="absolute inset-0 rounded-full border-4 border-purple-500 animate-pulse-scanner"></div>
            )}
          </button>
        );
    }
  };

  const handleModeChange = (mode: LoginMode) => {
    if (status === 'scanning') return;
    
    resetQrFlow();
    
    if (mode !== loginMode) {
        triggerActivity('switchAuth');
    }
    setLoginMode(mode);

    if (mode === 'qr') {
        const challenge = `gnetkey_challenge_${Date.now()}_${Math.random()}`;
        setQrChallengeId(challenge);
        setQrFlowState('initiator-challenge');
    } else if (mode === 'mobile-auth') {
        setQrFlowState('authorizer-scan');
    }
  };

  const SegmentedControlButton: React.FC<{
    mode: LoginMode;
    label: string;
    icon: React.ReactNode;
  }> = ({ mode, label, icon }) => (
    <button
      onClick={() => handleModeChange(mode)}
      className={`flex-1 md:flex-initial flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500 ${
        loginMode === mode && qrFlowState === 'none'
          ? 'bg-purple-600 text-white'
          : 'text-slate-300 hover:bg-slate-700'
      }`}
    >
      {icon}
      <span className="ml-2 hidden md:inline">{label}</span>
    </button>
  );
  
  const renderCoreAccessScreen = () => (
    <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
            <CodeIcon className="w-16 h-16 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
            Acceso al Núcleo
        </h2>
        <p className="text-slate-400 mb-6">Se requieren credenciales de administrador.</p>
        
        <form onSubmit={handleCoreAccessSubmit} className="space-y-4">
            <div>
                <input
                    type="text"
                    value={coreUsername}
                    onChange={(e) => setCoreUsername(e.target.value)}
                    placeholder="Usuario"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    autoFocus
                    autoComplete="off"
                />
            </div>
            <div>
                <input
                    type="password"
                    value={corePassword}
                    onChange={(e) => setCorePassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    autoComplete="current-password"
                />
            </div>
            {coreAccessError && <p className="text-red-400 text-sm">{coreAccessError}</p>}
            <button
                type="submit"
                className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
                Verificar
            </button>
        </form>
    </div>
  );

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-200 p-4">
      <div className="text-center w-full max-w-lg">
        {isAwaitingCoreAccess ? renderCoreAccessScreen() : (
          <>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-4">
              {isGodModeActivating ? 'Activando Privilegios Elevados' : qrFlowState !== 'none' ? 'Conexión Segura GNetKey' : 'Acceso al Sistema'}
            </h1>
            <p className={`text-slate-400 mb-8 h-6 transition-opacity duration-300 ${status === 'error' ? 'text-red-400' : isGodModeActivating ? 'font-mono text-yellow-300' : status === 'success' ? 'text-green-400' : ''}`}>
              {statusText || (status === 'success' ? 'Verificación Exitosa' : status === 'scanning' ? 'Verificando...' : '')}
            </p>
            
            <div className="mb-8 min-h-[256px] flex items-center justify-center">
                {renderLoginMethod()}
            </div>

            {(!isGodModeActivating && !isAwaitingCoreAccess && qrFlowState === 'none') && (
                <div className="flex flex-row flex-wrap justify-center gap-2 bg-slate-800 p-2 rounded-xl w-full max-w-xl mx-auto">
                    <SegmentedControlButton 
                        mode="fingerprint" 
                        label="Huella" 
                        icon={<FingerprintIcon className="w-5 h-5" />} 
                    />
                    <SegmentedControlButton 
                        mode="face" 
                        label="Facial" 
                        icon={<FaceScanIcon className="w-5 h-5" />} 
                    />
                    <SegmentedControlButton 
                        mode="google" 
                        label="Google" 
                        icon={<GoogleIcon className="w-5 h-5" />} 
                    />
                    <SegmentedControlButton 
                        mode="voice" 
                        label="Voz" 
                        icon={<MicIcon className="w-5 h-5" />} 
                    />
                    <SegmentedControlButton 
                        mode="qr" 
                        label="Iniciar con QR" 
                        icon={<QrCodeIcon className="w-5 h-5" />} 
                    />
                    <SegmentedControlButton 
                        mode="mobile-auth" 
                        label="Autorizar con QR" 
                        icon={<SmartphoneIcon className="w-5 h-5" />} 
                    />
                    <SegmentedControlButton 
                        mode="key" 
                        label="Llave" 
                        icon={<KeyIcon className="w-5 h-5" />} 
                    />
                </div>
            )}
          </>
        )}
      </div>
      <style>{`
        @keyframes pulse-scanner {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

export default BiometricLogin;