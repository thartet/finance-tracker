import { Router } from 'express';
import prisma from '../prisma/client';

const router = Router();

router.get('/', async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: 'desc' }
  });
  res.json(transactions);
});

router.post('/', async (req, res) => {
  const { label, amount, category } = req.body;
  const transaction = await prisma.transaction.create({
    data: { label, amount, category }
  });
  res.json(transaction);
});

export default router;
