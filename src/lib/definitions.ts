import { FieldValue, Timestamp } from "firebase/firestore";

// Helper type to represent a Firestore Timestamp or a string for serialization
type FirestoreDate = string | Timestamp | FieldValue;

export type User = {
  id: string; 
  name: string; 
  email: string;
  role: 'admin' | 'user';
  createdAt: any;
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
  createdAt?: FirestoreDate;
  updatedAt?: FirestoreDate;
};

export type CapitalEntry = {
  id: string;
  createdAt: FirestoreDate;
  transactionDate: string;
  type: 'Deposit' | 'Withdrawal';
  amount: number;
  source: 'Etsy Payout' | 'Loan' | 'Dividend' | 'Investment';
  submittedBy: string; 
  notes?: string;
};
