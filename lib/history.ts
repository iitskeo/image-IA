export interface ChatTurn {
  id: string;
  prompt: string;
  image: string;
  category: string;
  createdAt: number;
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
