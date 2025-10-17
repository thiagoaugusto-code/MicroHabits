import { useEffect, useState } from "react";
import { api } from "../api";


export default function HabitsList () {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHabits = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await api.get('/habits?userId=1', { //Substituir pelo jwt
                    headers: {Authorization: `Bearer ${token}`}
                    
                });
                setHabits(res.data);
            } catch (error) {
                alert('Erro ao buscar hábitos: ' + (error.response?.data?.message || error.message));
            } 
        };
            
        fetchHabits();
    }, []);

        return (
            <div>
                <h2>Meus Hábitos</h2>
                <ul>
                    {habits.map(habit => (
                        <li key={habit.totle}>
                            {habit.description}
                        </li>
                    ))}
                </ul>
            </div>
        );
}