export const getTransactions = async () => {
    const res = await fetch('http://localhost:3001/transactions');
    return res.json();
  };