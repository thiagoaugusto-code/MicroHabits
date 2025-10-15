const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();




const router = express.Router();
require('dotenv').config();

//registro
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hash },
        });
        res.json({ message: 'Usuario criado', userId: user.id });
    } catch (error) {
        res.json({ error: 'Erro ao criar usuario', details: error.message });
    }
});

//login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.json({ error: 'Usuario nao encontrado' });    

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.json({ error: 'Senha incorreta' });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login bem-sucedido', token });
    } catch (error) {
        res.status(500).json({ error: 'Erro no login', details: error.message });   
    }
});

module.exports = router;