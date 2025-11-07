import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Phone, Mail, Calendar } from 'lucide-react'
import api from '../services/api'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [filteredClientes, setFilteredClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  useEffect(() => {
    loadClientes()
  }, [])

  useEffect(() => {
    filterClientes()
  }, [searchTerm, filtroEstado, clientes])

  const loadClientes = async () => {
    try {
      const response = await api.get('/clientes')
      setClientes(response.data)
    } catch (error) {
      console.error('Error loading clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterClientes = () => {
    let filtered = clientes

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(cliente =>
        cliente.nombre_empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.contacto_nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por estado
    if (filtroEstado !== 'todos') {
      filtered = filtered.filter(cliente => {
        if (filtroEstado === 'al_dia') {
          return cliente.dias_hasta_vencimiento > 3
        } else if (filtroEstado === 'por_vencer') {
          return cliente.dias_hasta_vencimiento >= 0 && cliente.dias_hasta_vencimiento <= 3
        } else if (filtroEstado === 'atrasados') {
          return cliente.dias_hasta_vencimiento < 0
        }
        return true
      })
    }

    setFilteredClientes(filtered)
  }

  const getEstadoBadge = (dias) => {
    if (dias === null) return { color: 'badge-secondary', text: 'Sin pagos', icon: '⚪' }
    if (dias < 0) return { color: 'badge-danger', text: `${Math.abs(dias)} días atraso`, icon: '🔴' }
    if (dias <= 3) return { color: 'badge-warning', text: `Vence en ${dias} días`, icon: '🟡' }
    return { color: 'badge-success', text: 'Al día', icon: '🟢' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando clientes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">{filteredClientes.length} clientes encontrados</p>
        </div>
        <Link to="/clientes/nuevo" className="btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Nuevo Cliente</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Filter */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="input"
          >
            <option value="todos">Todos los clientes</option>
            <option value="al_dia">Al día</option>
            <option value="por_vencer">Por vencer</option>
            <option value="atrasados">Atrasados</option>
          </select>
        </div>
      </div>

      {/* Clientes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClientes.map((cliente) => {
          const estado = getEstadoBadge(cliente.dias_hasta_vencimiento)
          return (
            <Link
              key={cliente.id}
              to={`/clientes/${cliente.id}`}
              className="card hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">{cliente.nombre_empresa}</h3>
                <span className={`badge ${estado.color}`}>
                  {estado.icon}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {cliente.telefono}
                </div>
                
                {cliente.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {cliente.email}
                  </div>
                )}

                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {estado.text}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm text-gray-600">Plan: {cliente.plan}</span>
                <span className="text-lg font-bold text-primary-600">
                  ${cliente.precio_mensual}/mes
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {filteredClientes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron clientes</p>
        </div>
      )}
    </div>
  )
}
