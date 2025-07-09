import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './prisma/client';

import transactionsRouter from './routes/transactions';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000'
  }));

app.get('/transactions', async (req, res) => {
const transactions = await prisma.transaction.findMany();
res.json(transactions);
});

app.listen(3001, () => {
console.log('Backend listening on http://localhost:3001');
});


