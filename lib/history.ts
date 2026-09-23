export interface ChatTurn {
  id: string;
  prompt: string;
  image: string;
  category: string;
  createdAt: number;
  // Ausente en turnos guardados antes de esta versión — se asume "1:1".
  aspectRatio?: string;
  // Presentes solo en ediciones (ver ImageEditPanel): editOf es el turno del
  // que es edición inmediata, rootId es la imagen original del hilo. Un
  // turno sin estos campos es una generación normal (turno raíz).
  editOf?: string;
  rootId?: string;
}

export interface Chat {
  id: string;
  turns: ChatTurn[];
  createdAt: number;
  updatedAt: number;
}

export const HISTORY_STORAGE_KEY = "ia-images-history";
export const MAX_HISTORY = 12; // chats guardados
export const MAX_TURNS_PER_CHAT = 20; // generaciones guardadas por chat
