const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();


// criar habito
router.post('/', async (req, res) => {
    console.log("Corpo da requisição:", req.body); // Log do corpo da requisição
    const { title, userId} = req.body;
    if (!title || !userId) {
        return res.status(400).json({ error: 'Nome e userId são obrigatórios' });
    }
    console.log("Recebendo hábito:", title, userId); // Confirmação de recebimento

    try {
        const habit = await prisma.habit.create({
            data: { title, userId: Number(userId) },
        });
        res.json(habit);
    } catch (error) {
        console.error("Erro ao criar hábito:", error); // Log do erro
        res.status(400).json({ error: 'Erro ao criar habito', details: error.message });
    }
});

//Listar habitos
router.get('/', async (req, res) => {
    const { userId } = req.query;
    try {
        const habits = await prisma.habit.findMany({
            where: { userId: Number(userId) },
        });
        res.json(habits);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao listar habitos', details: error.message });
    }
});


//Atualizar habito
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const habit = await prisma.habit.update({
            where: { id: Number(id) },
            data,
        });
        res.json(habit);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar habito', details: error.message });
    }
});

//Deletar habito
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        //Primeiro deletar os completions associados ao hábito
        await prisma.habitCompletion.deleteMany({
            where: { habitId: Number(id) },
        });
        //Depois deletar o hábito em si
        await prisma.habit.delete({
            where: { id: Number(id) },
        });
        res.json({ message: 'Habito deletado' });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao deletar habito', details: error.message });
    }
});

//Marcar habito como feito
router.post('/:id/complete', async (req, res) => {
    const { id } = req.params;
    const {userId} = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'userId é obrigatório' });
    }

    try {
        const completion = await prisma.habitCompletion.create({
            data: {
                habitId: Number(id),
                userId: Number(userId),
                completedAt: new Date(),
            },
        });
        res.json(completion);
    } catch (error) {
        console.error("Erro ao marcar hábito como feito:", error); // Log do erro
        res.status(400).json({ error: 'Erro ao marcar habito como feito', details: error.message });
    }
});

//Desmarcar habito como feito
router.delete('/:id/complete', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'userId é obrigatório' });
    }
    try {
        await prisma.habitCompletion.deleteMany({
            where: {    
                habitId: Number(id),
                userId: Number(userId),
            },
        });
        res.json({ message: 'Habito desmarcado como feito' });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao desmarcar habito como feito', details: error.message });
    }
});

module.exports = router;