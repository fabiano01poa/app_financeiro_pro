/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'income' | 'expense';
export type AccountType = 'fixed' | 'variable';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: Date | string;
  dueDate?: number; // Added to make it editable/visible specifically for variable costs
  installments?: number;
  currentInstallment?: number;
  accountId?: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  expectedAmount: number;
  dueDate: number; // Day of the month
  status: 'paid' | 'pending';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  balance: number;
}
