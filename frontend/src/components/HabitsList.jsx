import { useEffect, useState } from "react";
import { api } from "../api";

export default function HabitsList() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editingHabitName, setEditingHabitName] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState('');
  const [status, setStatus] = useState('');

    //leitura segura do localStorage e tratamento do userId
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id || user?.userId || user?.sub;

  // Debug temporário pra conferir o que vem do token
  console.log("Usuário no localStorage:", user);
  console.log("ID do usuário detectado:", userId);

  useEffect(() => {
    if (userId) fetchHabits();
  }, [userId, category, frequency, status]);

  const fetchHabits = async () => {
    try {
      const queryParams = new URLSearchParams({ userId,
        ...(category && { category }),
        ...(frequency && { frequency }),
        ...(status && { status }),
       }).toString();


      const res = await api.get(`/habits?${queryParams}`);
      setHabits(res.data);
    } catch (error) {
      console.error("Erro ao buscar hábitos:", error);
    }
  };
  //Adicionar habito
  const addHabit = async () => {
    if (!newHabit.trim()) {
      alert('O nome do hábito não pode ser vazio.');
      return;
    }

    
    console.log("Enviando hábito:", { title: newHabit, userId });

    try {
      const res = await api.post('/habits', { title: newHabit, userId });
      setHabits(prev => [...prev, res.data]);
      setNewHabit('');
    } catch (error) {
      console.error("Erro ao adicionar hábito:", error);
    }
  };

  //Deletar habito
  const deleteHabit = async (habitId) => {
    try {
      await api.delete(`/habits/${habitId}`);
      setHabits(prev => prev.filter(habit => habit.id !== habitId));
    } catch (error) {
      console.error("Erro ao deletar hábito:", error);
    }
  };

  const startEditing = (habit) => {
    setEditingHabitId(habit.id);
    setEditingHabitName(habit.title);
  }

  //Salvar habito editado
  const saveHabit = async (habitId) => {
    if (!editingHabitName.trim()) {
      alert('O nome do hábito não pode ser vazio.');
      return;
    }
    try {
      await api.patch(`/habits/${habitId}`, { title: editingHabitName });
      setHabits(prev => prev.map(habit => habit.id === habitId ? { ...habit, title: editingHabitName } : habit));
      setEditingHabitId(null);
      setEditingHabitName('');
    } catch (error) {
      console.error("Erro ao atualizar hábito:", error);
    }
};

    //Marcar habito como feito
    const toggleComplete = async (habitId, isCompleted) => {
    try {
      if (isCompleted) {
        // Desmarcar
        await api.delete(`/habits/${habitId}/complete`, { data: { userId } });
      } else {
        // Marcar
        await api.post(`/habits/${habitId}/complete`, { userId });
      }
      // Atualiza o estado local
      setHabits(prev =>
        prev.map(habit =>
          habit.id === habitId ? { ...habit, completed: !isCompleted } : habit
        )
      );
    } catch (error) {
      console.error("Erro ao marcar/desmarcar hábito:", error);
    }
  };
  

  return (
    <div>
      <h2>Meus Hábitos</h2>
      <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value=''>Todas as Categorias</option>
          <option value='Saúde'>Saúde</option>
          <option value='Estudos'>Estudos</option>
          <option value='Trabalho'>Trabaho</option>
          <option value="Pessoal">Pessoal</option>
        </select>

        <select value={frequency} onChange={e => setFrequency(e.target.value)}>
          <option value=''>Todas as Frequências</option>
          <option value='Diário'>Diário</option>
          <option value='Semanal'>Semanal</option>
          <option value='Mensal'>Mensal</option>
        </select>

        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value=''>Todos os Status</option>
          <option value='completed'>Completados</option>
          <option value='pending'>Pendentes</option>
        </select>
      </div>



      <input
        type="text"
        placeholder="Novo Hábito"
        value={newHabit}
        onChange={e => setNewHabit(e.target.value)}
      />
      <button onClick={addHabit}>Adicionar Hábito</button>

      <ul>
        {habits.map(habit => (
            <li key={habit.id}>
            {editingHabitId === habit.id ? (
                <>
                    <input value={editingHabitName} onChange={e => setEditingHabitName(e.target.value)} />
                    <button onClick={() => saveHabit(habit.id)}>Salvar</button>
                </>
            ) : (
                <>
                <input type="checkbox" checked={habit.completed || false} 
                onChange={() => toggleComplete(habit.id, habit.completed)}
                />
                    <span style={{ textDecoration: habit.completed ? 'line-through' : 'none'}}>{habit.title}</span>
                    <button onClick={() => startEditing(habit)}>Editar</button>
                </>
            )}
            <small>Frequência: {habit.frequency || "-"}</small>
            <small>Criado em: {new Date(habit.createdAt).toLocaleDateString()}</small>
            <button onClick={() => deleteHabit(habit.id)}>Deletar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
