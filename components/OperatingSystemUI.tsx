import React, { useState, useEffect } from 'react';
import PdfEditorApp from './PdfEditorApp';
import NotepadApp from './NotepadApp';
import CalculatorApp from './CalculatorApp';
import MinesweeperApp from './MinesweeperApp';
import SystemMonitorApp from './SystemMonitorApp';
import { FileTextIcon, NotepadIcon, CalculatorIcon, MinesweeperIcon, SystemMonitorIcon, ShieldIcon } from './icons';
import { useTutorial } from '../hooks/useTutorial';
import BuyMeACoffee from './BuyMeACoffee';

interface OperatingSystemUIProps {
    onLogout: () => void;
    isGodMode: boolean;
}

type AppId = 'pdfEditor' | 'notepad' | 'calculator' | 'minesweeper' | 'systemMonitor';

const OperatingSystemUI: React.FC<OperatingSystemUIProps> = ({ onLogout, isGodMode }) => {
    const [openApp, setOpenApp] = useState<AppId | null>(null);
    const { triggerActivity } = useTutorial();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        triggerActivity('welcome');
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, [triggerActivity]);

    if (openApp === 'pdfEditor') {
        return <PdfEditorApp onClose={() => setOpenApp(null)} />;
    }

    const AppIconButton: React.FC<{ appId: AppId, label: string, icon: React.ReactNode }> = ({ appId, label, icon }) => (
        <button
            onDoubleClick={() => setOpenApp(appId)}
            className="flex flex-col items-center space-y-1 p-2 rounded w-24 h-24 justify-center focus:bg-blue-800/50 focus:outline-none"
            aria-label={`Abrir ${label}`}
        >
            {icon}
            <span className="text-sm text-white font-medium shadow-black [text-shadow:1px_1px_2px_var(--tw-shadow-color)]">{label}</span>
        </button>
    );

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-[#008080] text-slate-200 overflow-hidden relative font-[Tahoma,ui-sans-serif,system-ui,sans-serif]">
            {/* Desktop Icons */}
            <div className="absolute top-4 left-4 flex flex-col items-start space-y-2">
                <AppIconButton appId="pdfEditor" label="Editor PDF" icon={<FileTextIcon className="w-10 h-10 text-cyan-300" />} />
                <AppIconButton appId="notepad" label="Bloc de notas" icon={<NotepadIcon className="w-10 h-10 text-white" />} />
                <AppIconButton appId="calculator" label="Calculadora" icon={<CalculatorIcon className="w-10 h-10 text-white" />} />
                <AppIconButton appId="minesweeper" label="Buscaminas" icon={<MinesweeperIcon className="w-10 h-10 text-white" />} />
                {isGodMode && (
                    <AppIconButton appId="systemMonitor" label="Monitor Sistema" icon={<SystemMonitorIcon className="w-10 h-10 text-yellow-400" />} />
                )}
            </div>

            {/* App Windows */}
            {openApp === 'notepad' && <NotepadApp onClose={() => setOpenApp(null)} />}
            {openApp === 'calculator' && <CalculatorApp onClose={() => setOpenApp(null)} />}
            {openApp === 'minesweeper' && <MinesweeperApp onClose={() => setOpenApp(null)} />}
            {openApp === 'systemMonitor' && isGodMode && <SystemMonitorApp onClose={() => setOpenApp(null)} />}


            {/* Taskbar */}
            <footer className="absolute bottom-0 left-0 right-0 z-30 bg-[#C0C0C0] border-t-2 border-t-white p-1 flex items-center justify-between text-black">
                <div className="flex items-center">
                    <button className="flex items-center bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-black border-b-black px-2 py-0.5 font-bold active:border-t-black active:border-l-black active:border-r-white active:border-b-white focus:outline-none">
                        <img src="https://win98icons.alexmeub.com/icons/png/windows-0.png" alt="Start" className="w-6 h-6 mr-2"/>
                        <span className="text-sm">Inicio</span>
                    </button>
                    <BuyMeACoffee />
                    {isGodMode && (
                       <div className="ml-2 flex items-center" title="Modo Dios Activado">
                           <ShieldIcon className="w-5 h-5 text-yellow-600" />
                       </div>
                    )}
                </div>
                <div className="bg-[#808080] border-2 border-l-white border-t-white border-r-black border-b-black px-2 py-0.5 text-sm text-white">
                    {time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </footer>
        </div>
    );
};

export default OperatingSystemUI;
