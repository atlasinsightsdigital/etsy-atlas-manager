import { FieldValue } from "firebase/firestore";

export type User = {
  id: string; 
  name: string; 
  email: string;
  role: 'admin' | 'user';
  createdAt: string | FieldValue; 
};

export type Order = {
  id: string;
  etsyOrderId: string;
  orderDate: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderPrice: number;
  orderCost: number;
  shippingCost: number;
  additionalFees: number;
  notes?: string;
  trackingNumber?: string;
  createdAt?: string | FieldValue;
  updatedAt?: string | FieldValue;
};

export type CapitalEntry = {
  id: string;
  createdAt: string | FieldValue; 
  transactionDate: string;
  type: 'Deposit' | 'Withdrawal';
  amount: number;
  source: 'Etsy Payout' | 'Loan' | 'Dividend' | 'Investment';
  submittedBy: string; 
  notes?: string;
};
