import cors from 'cors';
import express from 'express';
import transactionsRouter from './routes/transactions';
import { runMonthlyRecurringJob } from './cron/monthlyRecurringJob';
import cron from 'node-cron';

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));


app.use(express.json());

app.use('/api', transactionsRouter);

cron.schedule('0 0 1 * *', async () => {
    console.log('🌀 Exécution du job mensuel récurrent');
    await runMonthlyRecurringJob();
  });

app.listen(3001, '0.0.0.0', () => {
  console.log('Server listening on http://localhost:3001');
});