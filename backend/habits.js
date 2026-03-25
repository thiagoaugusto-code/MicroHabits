const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();
const authenticateToken = require('./authMiddleware/authM');

// Middleware global
router.use(authenticateToken);

// Criar hábito
router.post('/', async (req, res) => {
    const { title, category, frequency } = req.body;
    const userId = req.user.userId;

    if (!title) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const validCategories = ["Saúde", "Estudos", "Trabalho", "Pessoal"];
    if (category && !validCategories.includes(category)) {
        return res.status(400).json({ error: 'Categoria inválida' });
    }

    const validFrequencies = ["Diário", "Semanal", "Mensal"];
    if (frequency && !validFrequencies.includes(frequency)) {
        return res.status(400).json({ error: 'Frequência inválida' });
    }

    try {
        const habit = await prisma.habit.create({
            data: {
                title,
                userId,
                category: category || null,
                frequency: frequency || null
            },
        });
        res.json(habit);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao criar hábito', details: error.message });
    }
});


// Listar hábitos (corrigido: completed = HOJE)
router.get('/', async (req, res) => {
    const userId = req.user.userId;
    const { category, frequency } = req.query;

    const where = { userId };
    if (category) where.category = category;
    if (frequency) where.frequency = frequency;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    try {
        const habits = await prisma.habit.findMany({
            where,
            include: { completions: true },
            orderBy: { createdAt: 'desc' },
        });

        const result = habits.map(habit => ({
            ...habit,
            completed: habit.completions.some(c =>
                new Date(c.completedAt) >= startOfDay
            ),
        }));

        res.json(result);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao buscar hábitos', details: error.message });
    }
});


// Atualizar hábito (REMOVIDO "complete")
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, category, frequency } = req.body;

    try {
        const habit = await prisma.habit.update({
            where: { id: Number(id) },
            data: { title, category, frequency },
        });
        res.json(habit);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar hábito', details: error.message });
    }
});


// Deletar hábito
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.habit.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Hábito deletado com sucesso' });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao deletar hábito', details: error.message });
    }
});


// ✅ COMPLETE — versão melhorada
router.post('/:id/complete', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const completion = await prisma.habitCompletion.upsert({
            where: {
                habitId_userId_completedAt: {
                    habitId: Number(id),
                    userId,
                    completedAt: today,
                }
            },
            update: {},
            create: {
                habitId: Number(id),
                userId,
                completedAt: today,
            },
        });

        res.json(completion);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao marcar hábito', details: error.message });
    }
});


// ❗ DESMARCAR — corrigido (só hoje)
router.delete('/:id/complete', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    try {
        await prisma.habitCompletion.deleteMany({
            where: {
                habitId: Number(id),
                userId,
                completedAt: { gte: startOfDay }
            },
        });

        res.json({ message: 'Hábito desmarcado' });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao desmarcar hábito', details: error.message });
    }
});


// Progresso do dia (sem userId na URL)
router.get('/progress', async (req, res) => {
    const userId = req.user.userId;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    try {
        const totalHabits = await prisma.habit.count({ where: { userId } });

        const completedHabits = await prisma.habitCompletion.count({
            where: {
                userId,
                completedAt: { gte: startOfDay },
            },
        });

        const progress = totalHabits === 0 ? 0 : Math.round((completedHabits / totalHabits) * 100);

        res.json({ totalHabits, completedHabits, progress });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao buscar progresso' });
    }
});

module.exports = router;