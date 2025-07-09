// cron/monthlyRecurringJob.ts
import prisma from '../prisma/client';

export async function runMonthlyRecurringJob() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0, 23, 59, 59);

  const recurrents = await prisma.recurringExpense.findMany({
    where: {
      interval: 'monthly',
      startDate: { lte: lastDay },
      OR: [{ endDate: null }, { endDate: { gte: firstDay } }],
    },
  });

  for (const rec of recurrents) {
    const existing = await prisma.transaction.findFirst({
      where: {
        recurringId: rec.id,
        date: { gte: firstDay, lte: lastDay },
      },
    });

    if (!existing) {
      await prisma.transaction.create({
        data: {
          label: rec.description || 'Dépense récurrente',
          amount: rec.amount,
          date: new Date(),
          category: 'Fixe',
          recurringId: rec.id,
        },
      });
    }
  }
}
