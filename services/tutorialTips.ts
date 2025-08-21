export type ActivityId = 'welcome' | 'uploadSuccess' | 'analysisSuccess' | 'multiPage' | 'firstEdit' | 'switchAuth';

interface TutorialTip {
  title: string;
  message: string;
  duration?: number;
}

export const tutorialTips: Record<ActivityId, TutorialTip> = {
  welcome: {
    title: '¡Bienvenido!',
    message: 'Para empezar, haz clic en el ícono "Editor PDF" en el dock para lanzar la aplicación.',
    duration: 8000,
  },
  uploadSuccess: {
    title: '¡Archivo Cargado!',
    message: 'Tu PDF está listo. La IA analizará la página actual para encontrar texto editable.',
    duration: 7000,
  },
  analysisSuccess: {
    title: 'Análisis Completo',
    message: 'Puedes hacer clic en los bloques de texto resaltados para editar su contenido.',
    duration: 7000,
  },
  multiPage: {
    title: 'Navegación de Páginas',
    message: 'Este documento tiene varias páginas. Usa las flechas de abajo para navegar entre ellas.',
    duration: 8000,
  },
  firstEdit: {
    title: '¡Primera Edición Guardada!',
    message: 'El sistema aprende de tus acciones para mejorar tu experiencia y seguridad.',
    duration: 8000,
  },
  switchAuth: {
    title: 'Seguridad Adaptativa',
    message: '¡Bien hecho! Explorar diferentes métodos de acceso fortalece la seguridad del sistema.',
    duration: 8000,
  },
};