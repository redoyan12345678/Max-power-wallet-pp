
export interface User {
  id: string; // MPxxxxx
  name: string;
  email: string;
  phone: string;
  avatar: string;
  balance: number;
  isActive: boolean;
  referralCode: string;
  referrerId?: string;
  role: 'user' | 'admin';
  joinedAt: number;
  password?: string;
  commissionProcessed?: boolean; // New flag to track client-side distribution
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'activation' | 'withdrawal' | 'admin_add';
  amount: number;
  method: 'bkash' | 'nagad' | 'admin';
  mobileNumber: string;
  trxId?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  referralCodeUsed?: string;
}

export enum ViewState {
  HOME = 'home',
  WALLET = 'wallet',
  REFERRALS = 'referrals',
  STRUCTURE = 'structure',
  PROFILE = 'profile',
  LEVELS = 'levels'
}
