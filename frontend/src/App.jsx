import { useState, useEffect } from 'react'


export default function App() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    fetch('http://localhost:3000')
      .then(response => response.json())
      .then(data => setMsg(data.message))
      .catch(() => setMsg('API não alcançavel'));
  }, []);


  return (
    <div style = {{fontFamily: 'Inter, system-ui', padding: 40}}>
      <h1>MicroHabits esta vivo</h1>
      <p>{msg ?? 'Carregando API...'}</p>  
    </div>
  )
} 