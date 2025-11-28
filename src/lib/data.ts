import type { User, Order, CapitalEntry } from './definitions';

export const users: Omit<User, 'createdAt'>[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@etsyatlas.com',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Store Manager',
    email: 'manager@etsyatlas.com',
    role: 'user',
  },
];

export const orders: Omit<Order, 'createdAt'>[] = [
  {
    id: '1',
    etsyOrderId: 'ORD78901',
    orderDate: '2023-10-23',
    status: 'Delivered',
    orderPrice: 150.0,
    orderCost: 70.0,
    shippingCost: 15.0,
    additionalFees: 5.0,
    notes: 'Customer requested gift wrapping.',
    trackingNumber: '1Z999AA10123456789',
  },
  {
    id: '2',
    etsyOrderId: 'ORD78902',
    orderDate: '2023-10-24',
    status: 'Shipped',
    orderPrice: 200.5,
    orderCost: 90.0,
    shippingCost: 20.0,
    additionalFees: 7.5,
    notes: 'Fragile item, handle with care.',
    trackingNumber: '1Z999AA10198765432',
  },
  {
    id: '3',
    etsyOrderId: 'ORD78903',
    orderDate: '2023-10-25',
    status: 'Pending',
    orderPrice: 75.25,
    orderCost: 30.0,
    shippingCost: 10.0,
    additionalFees: 2.25,
    notes: '',
  },
];

export const capitalEntries: Omit<CapitalEntry, 'createdAt'>[] = [
  {
    id: '1',
    transactionDate: '2023-10-01',
    type: 'Deposit',
    amount: 5000,
    source: 'Loan',
    submittedBy: 'admin@etsyatlas.com',
    notes: 'Initial capital injection.',
  },
  {
    id: '2',
    transactionDate: '2023-10-15',
    type: 'Deposit',
    amount: 1250.75,
    source: 'Etsy Payout',
    submittedBy: 'admin@etsyatlas.com',
    notes: 'First Etsy payout for October.',
  },
  {
    id: '3',
    transactionDate: '2023-11-01',
    type: 'Deposit',
    amount: 10000,
    source: 'Loan',
    submittedBy: 'admin@etsyatlas.com',
    notes: 'Small business loan for scaling.',
  },
   {
    id: '4',
    transactionDate: '2023-11-20',
    type: 'Withdrawal',
    amount: 800,
    source: 'Dividend',
    submittedBy: 'admin@etsyatlas.com',
    notes: 'Personal withdrawal.',
  },
];
