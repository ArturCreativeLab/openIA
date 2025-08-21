import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import type { Session } from '../services/authService';

const SESSION_KEY = 'app_session';
const SESSION_ID_REF_KEY = 'app_session_id_ref'; // A unique ID for the tab's session instance, not the user session itself.

// Helper function to create a SHA-256 hash of a string using the Web Crypto API.
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export const useSessionManager = () => {
  const getInitialSession = (): Session | null => {
    try {
      const storedSession = sessionStorage.getItem(SESSION_KEY);
      return storedSession ? JSON.parse(storedSession) : null;
    } catch {
      return null;
    }
  };

  const [session, setSession] = useState<Session | null>(getInitialSession());
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState<'duplicate' | 'inactivity' | null>(null);
  
  const channelRef = useRef<BroadcastChannel | null>(null);
  const sessionIdRef = useRef<string | null>(sessionStorage.getItem(SESSION_ID_REF_KEY));
  const { addNotification } = useNotification();

  const handleIncomingMessage = useCallback((event: MessageEvent) => {
    if (event.data.type === 'NEW_LOGIN' && event.data.sessionId !== sessionIdRef.current) {
      if (session) {
        setIsSuspended(true);
        setSuspensionReason('duplicate');
      }
    }
  }, [session]);

  useEffect(() => {
    if (!channelRef.current) {
        channelRef.current = new BroadcastChannel('session_manager');
    }
    const channel = channelRef.current;

    channel.addEventListener('message', handleIncomingMessage);
    
    return () => {
      channel.removeEventListener('message', handleIncomingMessage);
    };
  }, [handleIncomingMessage]);

  const login = useCallback(async (newSession: Session) => {
    const newSessionId = `session_${Date.now()}_${Math.random()}`;
    sessionIdRef.current = newSessionId;
    sessionStorage.setItem(SESSION_ID_REF_KEY, newSessionId);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
    setIsSuspended(false);
    setSuspensionReason(null);
    channelRef.current?.postMessage({ type: 'NEW_LOGIN', sessionId: newSessionId });

    const identityHash = await sha256(JSON.stringify(newSession.user));
    addNotification(
      'Identidad Digital Sellada',
      `Tu sesión ha sido asegurada con un sello criptográfico. Sello: ${identityHash.substring(0, 16)}...`,
      8000
    );
  }, [addNotification]);

  const logout = useCallback(() => {
    sessionIdRef.current = null;
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_ID_REF_KEY);
    setSession(null);
    setIsSuspended(false);
    setSuspensionReason(null);
  }, []);

  const suspend = useCallback(() => {
    if (session && !isSuspended) {
      setIsSuspended(true);
      setSuspensionReason('inactivity');
    }
  }, [session, isSuspended]);

  const reactivate = useCallback(async () => {
    const currentSession = getInitialSession();
    if (currentSession) {
        await login(currentSession);
    }
  }, [login]);

  return { 
      isAuthenticated: !!session, 
      isGodMode: session?.isGodMode ?? false,
      user: session?.user,
      isSuspended, 
      suspensionReason, 
      login, 
      logout, 
      reactivate, 
      suspend 
    };
};
