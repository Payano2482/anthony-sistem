import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, Filter } from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import api from '../services/api'

export default function Contabilidad() {
  const [loading, setLoading] = useState(true)
  const [pagos, setPagos] = useState([])
  const [clientes, setClientes] = useState([])
  const [filtros, setFiltros] = useState({
    fechaInicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    fechaFin: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    estado: 'todos',
    cliente: 'todos'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [pagosRes, clientesRes] = await Promise.all([
        api.get('/clientes'),
        api.get('/clientes')
      ])
      
      // Obtener todos los pagos de todos los clientes
      const todosLosPagos = []
      for (const cliente of clientesRes.data) {
        try {
          const pagosCliente = await api.get(`/clientes/${cliente.id}/pagos`)
          todosLosPagos.push(...pagosCliente.data.map(p => ({
            ...p,
            cliente_nombre: cliente.nombre_empresa,
            cliente_id: cliente.id
          })))
        } catch (error) {
          console.error(`Error cargando pagos del cliente ${cliente.id}:`, error)
        }
      }
      
      setPagos(todosLosPagos)
      setClientes(clientesRes.data)
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const pagosFiltrados = pagos.filter(pago => {
    const fechaPago = new Date(pago.fecha_pago)
    const fechaInicio = new Date(filtros.fechaInicio)
    const fechaFin = new Date(filtros.fechaFin)
    
    const cumpleFecha = fechaPago >= fechaInicio && fechaPago <= fechaFin
    const cumpleEstado = filtros.estado === 'todos' || pago.estado === filtros.estado
    const cumpleCliente = filtros.cliente === 'todos' || pago.cliente_id === parseInt(filtros.cliente)
    
    return cumpleFecha && cumpleEstado && cumpleCliente
  })

  const calcularEstadisticas = () => {
    const totalIngresos = pagosFiltrados
      .filter(p => p.estado === 'Pagado')
      .reduce((sum, p) => sum + p.monto, 0)
    
    const totalPendiente = pagosFiltrados
      .filter(p => p.estado === 'Pendiente')
      .reduce((sum, p) => sum + p.monto, 0)
    
    const totalAtrasado = pagosFiltrados
      .filter(p => p.estado === 'Atrasado')
      .reduce((sum, p) => sum + p.monto, 0)
    
    return { totalIngresos, totalPendiente, totalAtrasado }
  }

  const stats = calcularEstadisticas()

  const exportarExcel = () => {
    const csv = [
      ['Fecha', 'Cliente', 'Monto', 'Estado', 'Método', 'Referencia'].join(','),
      ...pagosFiltrados.map(p => [
        format(new Date(p.fecha_pago), 'dd/MM/yyyy'),
        p.cliente_nombre,
        p.monto,
        p.estado,
        p.metodo_pago || '',
        p.referencia || ''
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `contabilidad-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Contabilidad</h1>
        <p className="text-gray-600 mt-1">Gestión financiera y control de ingresos</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Ingresos</p>
              <p className="text-3xl font-bold text-green-700">${stats.totalIngresos.toFixed(2)}</p>
              <p className="text-xs text-green-600 mt-1">{pagosFiltrados.filter(p => p.estado === 'Pagado').length} pagos</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pendiente</p>
              <p className="text-3xl font-bold text-yellow-700">${stats.totalPendiente.toFixed(2)}</p>
              <p className="text-xs text-yellow-600 mt-1">{pagosFiltrados.filter(p => p.estado === 'Pendiente').length} pagos</p>
            </div>
            <Calendar className="h-12 w-12 text-yellow-500" />
          </div>
        </div>

        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Atrasado</p>
              <p className="text-3xl font-bold text-red-700">${stats.totalAtrasado.toFixed(2)}</p>
              <p className="text-xs text-red-600 mt-1">{pagosFiltrados.filter(p => p.estado === 'Atrasado').length} pagos</p>
            </div>
            <TrendingDown className="h-12 w-12 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </h2>
          <button
            onClick={exportarExcel}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="h-5 w-5" />
            <span>Exportar CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
              className="input"
            >
              <option value="todos">Todos</option>
              <option value="Pagado">Pagado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Atrasado">Atrasado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente
            </label>
            <select
              value={filtros.cliente}
              onChange={(e) => setFiltros({...filtros, cliente: e.target.value})}
              className="input"
            >
              <option value="todos">Todos</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre_empresa}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Pagos */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Transacciones ({pagosFiltrados.length})
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referencia
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagosFiltrados.map((pago) => (
                <tr key={pago.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(pago.fecha_pago), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pago.cliente_nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${pago.monto.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {pago.metodo_pago || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${
                      pago.estado === 'Pagado' ? 'badge-success' :
                      pago.estado === 'Pendiente' ? 'badge-warning' :
                      'badge-danger'
                    }`}>
                      {pago.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {pago.referencia || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay transacciones para mostrar</p>
          </div>
        )}
      </div>
    </div>
  )
}
