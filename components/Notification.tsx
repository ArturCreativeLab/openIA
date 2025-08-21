import React, { useEffect, useState } from 'react';
import { LightbulbIcon, XIcon } from './icons';
import { NotificationType } from '../contexts/NotificationContext';

interface NotificationProps {
  notification: NotificationType;
  onDismiss: (id: number) => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(notification.id), 300);
    }, notification.duration || 5000);

    return () => clearTimeout(timer);
  }, [notification.id, notification.duration, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(notification.id), 300);
  };

  const animationClass = isExiting
    ? 'animate-slide-out'
    : 'animate-slide-in';

  return (
    <div
      className={`relative w-full max-w-sm rounded-lg shadow-2xl overflow-hidden mb-4 ${animationClass}`}
      role="alert"
    >
      <div className="absolute top-0 left-0 bottom-0 w-2 bg-purple-500"></div>
      <div className="flex items-start p-4 bg-slate-800">
        <div className="flex-shrink-0 pt-0.5">
          <LightbulbIcon className="w-6 h-6 text-purple-400" />
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-base font-bold text-slate-100">{notification.title}</p>
          <p className="mt-1 text-sm text-slate-300">{notification.message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={handleDismiss}
            className="inline-flex rounded-md text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500"
            aria-label="Cerrar"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-out {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        .animate-slide-out {
          animation: slide-out 0.3s ease-in forwards;
        }
      `}</style>
    </div>
  );
};

export default Notification;