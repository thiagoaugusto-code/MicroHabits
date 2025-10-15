const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth');
    

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'MicroHabits API online' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});