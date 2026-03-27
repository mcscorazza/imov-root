import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<h1>Bem-vindo ao Dashboard iMov!</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;