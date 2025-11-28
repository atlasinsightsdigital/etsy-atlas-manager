
export type User = {
  id: string; 
  name: string; 
  email: string;
  role: 'admin' | 'user';
  createdAt: string; 
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
};

export type CapitalEntry = {
  id: string;
  createdAt: string; 
  transactionDate: string;
  type: 'payout' | 'loan' | 'withdraw';
  amount: number;
  source: string;
  submittedBy: string; 
  notes?: string;
  locked: boolean;
};
