'use client';
import { useEffect, useState } from 'react';

type Transaction = {
  id: number;
  label: string;
  amount: number;
  category: string;
  date: string;
};

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/transactions')
      .then((res) => res.json())
      .then(setTransactions);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Mes transactions</h1>
      <ul className="space-y-2">
        {transactions.map((tx) => (
          <li key={tx.id} className="bg-white shadow p-2 rounded">
            <div>{tx.label}</div>
            <div className="text-sm text-gray-500">
              {tx.amount} € — {tx.category}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}