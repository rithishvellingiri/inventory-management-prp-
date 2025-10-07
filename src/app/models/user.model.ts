export interface User {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: 'admin' | 'user';
  createdAt: Date;
}
