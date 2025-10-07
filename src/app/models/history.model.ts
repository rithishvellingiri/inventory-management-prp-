export interface History {
  id: string;
  userId?: string;
  userName?: string;
  actionType: string;
  description: string;
  createdAt: Date;
}
