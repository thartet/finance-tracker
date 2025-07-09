// app/recurrents/page.tsx
'use client';

import { useState } from 'react';

export default function RecurrentsPage() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [interval, setInterval] = useState('monthly');

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3001/api/recurring-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, amount, startDate, interval }),
      });

      if (res.ok) {
        setSuccess(true);
        setDescription('');
        setAmount('');
        setStartDate('');
      } else {
        const data = await res.json();
        setError(data.error || 'Erreur');
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'envoi");
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ajouter une dépense récurrente</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow rounded p-4">
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Montant"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <select
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="monthly">Mensuel</option>
          <option value="annual">Annuel</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Ajouter
        </button>
      </form>

      {success && <p className="text-green-600 mt-4">Dépense récurrente ajoutée !</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </main>
  );
}
