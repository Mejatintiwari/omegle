export interface Message {
  text: string;
  isSelf: boolean;
}

export interface Stats {
  onlineUsers: number;
  activeChats: number;
}