import { useEffect, useState } from "react";
import { api } from "../api";
import './Css/HabitsList.css';

export default function HabitsList() {
  const [habits, setHabits] = useState([]);
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editingHabitName, setEditingHabitName] = useState('');

  const [filterCategory, setFilterCategory] = useState('');
  const [filterFrequency, setFilterFrequency] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('');
  const [newHabitFrequency, setNewHabitFrequency] = useState('');

    //leitura segura do localStorage e tratamento do userId
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id || user?.userId || user?.sub;

  const completedCount = habits.filter(habit => habit.completed).length;
  const totalCount = habits.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Debug temporário pra conferir o que vem do token
  console.log("Usuário no localStorage:", user);
  console.log("ID do usuário detectado:", userId);

  useEffect(() => {
    if (userId) fetchHabits();
  }, [userId, filterCategory, filterFrequency, filterStatus]);

  const fetchHabits = async () => {
    try {
      const queryParams = new URLSearchParams({ userId,
        ...(filterCategory && { category: filterCategory }),
        ...(filterFrequency && { frequency: filterFrequency }),
        ...(filterStatus && { status: filterStatus }),
       }).toString();


      const res = await api.get(`/habits?${queryParams}`);
      setHabits(res.data.map(habit => ({
        ...habit,
        completed: habit.completions && habit.completions.length > 0
      })));
    } catch (error) {
      console.error("Erro ao buscar hábitos:", error);
    }
  };

  //Adicionar habito
  const addHabit = async () => {
    if (!newHabitTitle.trim()) return alert('O nome do hábito não pode ser vazio.');
    if (!newHabitCategory) return alert('Por favor, selecione uma categoria para o hábito.');
    if (!newHabitFrequency) return alert('Por favor, selecione uma frequência para o hábito.');
      
    console.log("Enviando hábito:", { title: newHabitTitle, userId, category: newHabitCategory, frequency: newHabitFrequency }); // Confirmação de envio

    try {
      const res = await api.post('/habits', { title: newHabitTitle, 
        userId, 
        category: newHabitCategory || null, 
        frequency: newHabitFrequency || null });

        setHabits(prev => [...prev, {...res.data, completed: false}]);
        setNewHabitTitle('');
        setNewHabitCategory('');
        setNewHabitFrequency('');

        fetchHabits();
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

    <div className="habists-container">

      <div>
        <h2>Meus Hábitos</h2>
        <div >
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value=''>Todas as Categorias</option>
            <option value='Saúde'>Saúde</option>
            <option value='Estudos'>Estudos</option>
            <option value='Trabalho'>Trabalho</option>
            <option value="Pessoal">Pessoal</option>
          </select>

          <select value={filterFrequency} onChange={e => setFilterFrequency(e.target.value)}>
            <option value=''>Todas as Frequências</option>
            <option value='Diário'>Diário</option>
            <option value='Semanal'>Semanal</option>
            <option value='Mensal'>Mensal</option>
          </select>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value=''>Todos os Status</option>
            <option value='completed'>Completados</option>
            <option value='pending'>Pendentes</option>
          </select>
        </div>

        <div className="new-habit-section">

          <input
            className="new-habits-input"
            type="text"
            placeholder="Novo Hábito"
            value={newHabitTitle}
            onChange={e => setNewHabitTitle(e.target.value)}
          />
          <div className="habit-input-group">
            <select value={newHabitCategory} onChange={e => setNewHabitCategory(e.target.value)} required>
                <option value="">Categoria</option>
                <option value='Saúde'>Saúde</option>
                <option value='Estudos'>Estudos</option>
                <option value='Trabalho'>Trabalho</option>
                <option value='Pessoal'>Pessoal</option>
              </select>

              <select value={newHabitFrequency} onChange={e => setNewHabitFrequency(e.target.value)} required>
                <option value="">Frequência</option>
                <option value='Diário'>Diário</option>
                <option value='Semanal'>Semanal</option>
                <option value='Mensal'>Mensal</option>
              </select>
            <button onClick={addHabit}>Adicionar Hábito</button>
          </div>
        </div>

        <div className="progress-info">
          {completedCount} de {totalCount} Hábitos concluidos ({Math.round(progress)}%)
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>


        <div className="habits-list">
          {habits.map(habit => (
              <div key={habit.id} className={`habit-card ${habit.category?.toLowerCase() || ''}`}
              style={{ backgroundColor: habit.completed ? '#eafbea' : 'white'}}>

              {editingHabitId === habit.id ? (
                  <>
                      <input value={editingHabitName} onChange={e => setEditingHabitName(e.target.value)} />
                      <button onClick={() => saveHabit(habit.id)}>Salvar</button>
                  </>
              ) : (
                  <>
                  <div className="habit-title-container">
                    <input type="checkbox" checked={habit.completed || false} 
                    onChange={() => toggleComplete(habit.id, habit.completed)}
                    />
                        <span className={`habit-title ${habit.completed ? 'completed' : ''}`}
                        >{habit.title}</span>
                  </div>
                  <div className="habit-info">
                    <p>📂 Categoria: {habit.category || "-"}</p>
                    <p>⏰ Frequência: {habit.frequency || "-"}</p>
                    <p>🗓️ Criado em: {new Date(habit.createdAt).toLocaleDateString()}</p>
                  </div>     
              <div className="habit-actions">
                <button onClick={() => startEditing(habit)}>Editar</button>
                <button className="delete" onClick={() => deleteHabit(habit.id)}>Deletar</button>
              </div>
                  </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
