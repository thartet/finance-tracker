import cors from 'cors';
import express from 'express';
import transactionsRouter from './routes/transactions';
import balanceRouter from './routes/balance';
import cron from 'node-cron';

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS', 'PUT'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));


app.use(express.json());

app.use('/api', transactionsRouter);
app.use('/api/balance', balanceRouter);

app.listen(3001, '0.0.0.0', () => {
  console.log('Server listening on http://localhost:3001');
});