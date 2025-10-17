import { useState,} from 'react'
import Register from './components/Register.jsx'
import Login from './components/Login.jsx'
import HabitsList from './components/HabitsList.jsx'
import './index.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  if (!token) {
    return (
      <div>
        <Login setToken={setToken} />
        <Register />
      </div>
    );
  }

  return <HabitsList />;
}

export default App;