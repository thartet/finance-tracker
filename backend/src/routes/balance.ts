import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Obtenir le solde initial
router.get('/', async (req, res) => {
  const setting = await prisma.balanceSetting.findFirst();
  res.json(setting ?? { initial: 0 });
});

// Mettre à jour ou créer le solde initial
router.put('/', async (req, res) => {
  try {
    const { initial } = req.body;

    if (typeof initial === 'undefined') {
      return res.status(400).json({ error: 'Le champ initial est requis' });
    }

    const initialNumber = parseFloat(initial);
    if (isNaN(initialNumber)) {
      return res.status(400).json({ error: 'Le champ initial doit être un nombre' });
    }

    const existing = await prisma.balanceSetting.findFirst();
    let result;

    if (existing) {
      result = await prisma.balanceSetting.update({
        where: { id: existing.id },
        data: { initial: initialNumber },
      });
    } else {
      result = await prisma.balanceSetting.create({ data: { initial: initialNumber } });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du solde initial' });
  }
});

export default router;
