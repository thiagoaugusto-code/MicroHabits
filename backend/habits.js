const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();
const authenticateToken = require('./authMiddleware/authM');

// Aplicar middleware de autenticação a todas as rotas
router.use(authenticateToken);

// Criar hábito
router.post('/', async (req, res) => {
    const { title, userId, category, frequency } = req.body;

    if (!title || !userId) {
        return res.status(400).json({ error: 'Nome e userId são obrigatórios' });
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
                userId: Number(userId),
                category: category || null,
                frequency: frequency || null
            },
        });
        res.json(habit);
    } catch (error) {
        console.error("❌ Erro ao criar hábito:", error);
        res.status(400).json({ error: 'Erro ao criar hábito', details: error.message });
    }
});

// Listar hábitos com filtros
router.get('/', async (req, res) => {
    const { userId, category, frequency, status } = req.query;
    if (!userId) {
        return res.status(400).json({ error: 'userId é obrigatório' });
    }

    const where = { userId: Number(userId) };
    if (category) where.category = category;
    if (frequency) where.frequency = frequency;
    if (status === 'completed') where.completions = { some: {} };
    else if (status === 'pending') where.completions = { none: {} };

    try {
        const habits = await prisma.habit.findMany({
            where,
            include: { completions: true },
            orderBy: { createdAt: 'desc' },
        });

        const result = habits.map(habit => ({
            ...habit,
            completed: habit.completions.length > 0,
        }));

        res.json(result);
    } catch (error) {
        console.error('❌ Erro ao buscar hábitos:', error);
        res.status(400).json({ error: 'Erro ao buscar hábitos', details: error.message });
    }
});

// Atualizar hábito
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, category, frequency, complete } = req.body;

    try {
        const habit = await prisma.habit.update({
            where: { id: Number(id) },
            data: { title, category, frequency, complete },
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
        await prisma.habitCompletion.deleteMany({ where: { habitId: Number(id) } });
        await prisma.habit.delete({ where: { id: Number(id) } });
        res.json({ message: 'Hábito deletado com sucesso' });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao deletar hábito', details: error.message });
    }
});

// Marcar hábito como feito (evita duplicar no mesmo dia)
router.post('/:id/complete', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'userId é obrigatório' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    try {
        const alreadyCompleted = await prisma.habitCompletion.findFirst({
            where: {
                habitId: Number(id),
                userId: Number(userId),
                completedAt: { gte: startOfDay }
            },
        });

        if (alreadyCompleted) {
            return res.status(400).json({ error: 'Hábito já foi completado hoje' });
        }

        const completion = await prisma.habitCompletion.create({
            data: {
                habitId: Number(id),
                userId: Number(userId),
                completedAt: new Date(),
            },
        });

        res.json(completion);
    } catch (error) {
        console.error("❌ Erro ao marcar hábito como feito:", error);
        res.status(400).json({ error: 'Erro ao marcar hábito', details: error.message });
    }
});

// Desmarcar hábito
router.delete('/:id/complete', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    try {
        await prisma.habitCompletion.deleteMany({
            where: { habitId: Number(id), userId: Number(userId) },
        });
        res.json({ message: 'Hábito desmarcado' });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao desmarcar hábito', details: error.message });
    }
});

// progresso do dia
router.get('/progress/:userId', async (req, res) => {
    const { userId } = req.params;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    try {
        const totalHabits = await prisma.habit.count({ where: { userId: Number(userId) } });
        const completedHabits = await prisma.habitCompletion.count({
            where: {
                userId: Number(userId),
                completedAt: { gte: startOfDay },
            },
        });

        const progress = totalHabits === 0 ? 0 : Math.round((completedHabits / totalHabits) * 100);

        res.json({ totalHabits, completedHabits, progress });
    } catch (error) {
        console.error('❌ Erro ao buscar progresso:', error);
        res.status(400).json({ error: 'Erro ao buscar progresso', details: error.message });
    }
});


// Estatísticas de hábitos
router.get('/stats/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const habits = await prisma.habit.findMany({
            where: { userId: Number(userId) },
            include: { completions: true },
        });

        // Função: calcular streak (dias consecutivos)
        const calculateStreak = (completions) => {
            if (!completions.length) return 0;

            const sorted = completions
                .map(c => new Date(c.completedAt))
                .sort((a, b) => b - a);

            let streak = 1;
            for (let i = 1; i < sorted.length; i++) {
                const diffDays = Math.floor((sorted[i - 1] - sorted[i]) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) streak++;
                else if (diffDays > 1) break;
            }
            return streak;
        };

        // Datas de referência
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Completos da semana/mês
        const weeklyCompletions = await prisma.habitCompletion.count({
            where: {
                userId: Number(userId),
                completedAt: { gte: startOfWeek },
            },
        });

        const monthlyCompletions = await prisma.habitCompletion.count({
            where: {
                userId: Number(userId),
                completedAt: { gte: startOfMonth },
            },
        });

        // Categoria mais frequente
        const categoryCounts = habits.reduce((acc, habit) => {
            if (habit.category) {
                acc[habit.category] = (acc[habit.category] || 0) + 1;
            }
            return acc;
        }, {});

        const topCategory =
            Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

        // Montar resposta
        const habitStats = habits.map(habit => ({
            id: habit.id,
            title: habit.title,
            category: habit.category,
            streak: calculateStreak(habit.completions),
            totalCompletions: habit.completions.length,
        }));

        res.json({
            totalHabits: habits.length,
            topCategory,
            weeklyCompletions,
            monthlyCompletions,
            habits: habitStats,
        });
    } catch (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
        res.status(400).json({ error: 'Erro ao buscar estatísticas', details: error.message });
    }
});




module.exports = router;
