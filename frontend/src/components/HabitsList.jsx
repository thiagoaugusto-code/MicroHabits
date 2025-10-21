import { useEffect, useState } from "react";
import { api } from "../api";


export default function HabitsList () {
    const [habits, setHabits] = useState([]);
    const [newHabit, setNewHabit] = useState('');



    //Listar hábitos ao carregar o componente
    useEffect(() => {      
        fetchHabits();
    }, []);

    const fetchHabits = async () => {
        try {
            const res = await api.get('/habits?userId=1');
            setHabits(res.data);
        } catch (error) {
            console.error("Erro ao buscar hábitos:", error);
        }
    };



    //Adicionar novo hábito
    const addHabit = async () => {
        if (!newHabit) return;

        try {
            await api.post('/habits', {name: newHabit, userId: 1});
            setNewHabit('');
            fetchHabits();
        } catch (error) {
            console.error("Erro ao adicionar hábito:", error);
        }
    };


    //Deletar hábito
    const deleteHabit = async (habitId) => {
        try {
            await api.delete(`/habits/${habitId}`);
            fetchHabits();
        } catch (error) {
            console.error("Erro ao deletar hábito:", error);
        }
    };


        return (
            <div>
                <h2>Meus Hábitos</h2>
                <input type="text" placeholder="Novo Habito" name="Habits" value={newHabit} onChange={(e) => setNewHabit(e.target.value)} />
                <button onClick={addHabit}>Adicionar Hábito</button>
                <ul>
                    {habits.map((habit) => (
                        <li key={habit.id}>
                            <span>{habit.title}</span>
                            <button onClick={() => deleteHabit(habit.id)}>Deletar</button>
                        </li>
                    ))}
                </ul>
            </div>
        );
}