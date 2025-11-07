import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import NuevoCliente from './pages/NuevoCliente'
import ClienteDetalle from './pages/ClienteDetalle'
import RegistrarPago from './pages/RegistrarPago'
import Notificaciones from './pages/Notificaciones'
import Contabilidad from './pages/Contabilidad'
import Reportes from './pages/ReportesGraficos'
import Configuracion from './pages/Configuracion'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="clientes/nuevo" element={<NuevoCliente />} />
            <Route path="clientes/:id" element={<ClienteDetalle />} />
            <Route path="clientes/:id/pago" element={<RegistrarPago />} />
            <Route path="notificaciones" element={<Notificaciones />} />
            <Route path="contabilidad" element={<Contabilidad />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="configuracion" element={<Configuracion />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
