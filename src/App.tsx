import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Permisionario from './pages/Permisionario'
import Consultar from './pages/Consultar'
import Pagar from './pages/Pagar'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/consultar" element={<Consultar />} />
        <Route path="/pagar" element={<Pagar />} />
        <Route
          path="/permisionario"
          element={
            <ProtectedRoute role="permisionario">
              <Permisionario />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="municipal">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
