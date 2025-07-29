import { Router } from 'express';
import prisma from '../prisma/client';

const router = Router();

// GET /api/transactions
router.get("/transactions", async (req, res) => {
    const { month } = req.query;
  
    let where = {};
  
    if (month) {
      const [year, monthNum] = (month as string).split("-").map(Number);
      const start = new Date(year, monthNum - 1, 1);
      const end = new Date(year, monthNum, 0, 23, 59, 59);
  
      where = {
        date: {
          gte: start,
          lte: end,
        },
      };
    }
  
    const txs = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
    });
  
    res.json(txs);
  });
  
// POST /api/transactions
router.post("/transactions", async (req, res) => {
    const { label, amount, date, category } = req.body;

    if (!label || !amount || !date || !category) {
        return res.status(400).json({ error: "Champs requis manquants" });
    }

    const tx = await prisma.transaction.create({
        data: {
        label,
        amount: parseFloat(amount),
        date: new Date(date),
        category,
        },
    });

    res.json(tx);
  });

// DELETE /api/transactions/:id
router.delete("/transactions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  
    try {
      await prisma.transaction.delete({ where: { id } });
      res.status(204).end(); // No content
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la suppression" });
    }
  });  

// GET /api/transactions/stats
router.get("/transactions/stats", async (req, res) => {
    const result = await prisma.$queryRaw<
      { month: string; total: number }[]
    >`
      SELECT 
        TO_CHAR(date, 'YYYY-MM') AS month,
        SUM(amount) AS total
      FROM "Transaction"
      GROUP BY month
      ORDER BY month;
    `;
  
    res.json(result);
  });  

export default router;