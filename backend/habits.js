const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();


// criar habito
router.post('/', async (req, res) => {
    const { title, description, frequency, userId} = req.body;
    try {
        const habit = await prisma.habit.create({
            data: { title, description, frequency, userId: Number(userId) },
        });
        res.json(habit);
    } catch (error) {
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
        await prisma.habit.delete({
            where: { id: Number(id) },
        });
        res.json({ message: 'Habito deletado' });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao deletar habito', details: error.message });
    }
});

module.exports = router;