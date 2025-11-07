import { useState, useEffect } from 'react'
import { BarChart3, PieChart, TrendingUp, Download, Calendar, FileText } from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval } from 'date-fns'
import api from '../services/api'
import html2canvas from 'html2canvas'

export default function Reportes() {
  const [loading, setLoading] = useState(true)
  const [clientes, setClientes] = useState([])
  const [pagos, setPagos] = useState([])
  const [tipoReporte, setTipoReporte] = useState('mensual')
  const [periodo, setPeriodo] = useState({
    inicio: format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd'),
    fin: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const clientesRes = await api.get('/clientes')
      const todosLosPagos = []
      
      for (const cliente of clientesRes.data) {
        try {
          const pagosCliente = await api.get(`/clientes/${cliente.id}/pagos`)
          todosLosPagos.push(...pagosCliente.data.map(p => ({
            ...p,
            cliente_nombre: cliente.nombre_empresa,
            cliente_plan: cliente.plan
          })))
        } catch (error) {
          console.error(`Error cargando pagos del cliente ${cliente.id}:`, error)
        }
      }
      
      setClientes(clientesRes.data)
      setPagos(todosLosPagos)
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularIngresosPorMes = () => {
    const meses = eachMonthOfInterval({
      start: new Date(periodo.inicio),
      end: new Date(periodo.fin)
    })

    return meses.map(mes => {
      const ingresosMes = pagos
        .filter(p => {
          const fechaPago = new Date(p.fecha_pago)
          return fechaPago.getMonth() === mes.getMonth() &&
                 fechaPago.getFullYear() === mes.getFullYear() &&
                 p.estado === 'Pagado'
        })
        .reduce((sum, p) => sum + p.monto, 0)

      return {
        mes: format(mes, 'MMM yyyy'),
        ingresos: ingresosMes
      }
    })
  }

  const calcularIngresosPorPlan = () => {
    const planes = ['Basico', 'Premium', 'Empresarial']
    
    return planes.map(plan => {
      const ingresosPlan = pagos
        .filter(p => p.cliente_plan === plan && p.estado === 'Pagado')
        .reduce((sum, p) => sum + p.monto, 0)

      return {
        plan,
        ingresos: ingresosPlan,
        clientes: clientes.filter(c => c.plan === plan).length
      }
    })
  }

  const calcularTopClientes = () => {
    const clientesConIngresos = clientes.map(cliente => {
      const ingresos = pagos
        .filter(p => p.cliente_nombre === cliente.nombre_empresa && p.estado === 'Pagado')
        .reduce((sum, p) => sum + p.monto, 0)

      return {
        ...cliente,
        ingresos
      }
    })

    return clientesConIngresos
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, 10)
  }

  const calcularEstadisticasGenerales = () => {
    const totalIngresos = pagos
      .filter(p => p.estado === 'Pagado')
      .reduce((sum, p) => sum + p.monto, 0)

    const totalPendiente = pagos
      .filter(p => p.estado === 'Pendiente' || p.estado === 'Atrasado')
      .reduce((sum, p) => sum + p.monto, 0)

    const clientesActivos = clientes.filter(c => c.estado === 'Activo').length
    const clientesSuspendidos = clientes.filter(c => c.estado === 'Suspendido').length

    const promedioIngresoPorCliente = clientesActivos > 0 ? totalIngresos / clientesActivos : 0

    return {
      totalIngresos,
      totalPendiente,
      clientesActivos,
      clientesSuspendidos,
      promedioIngresoPorCliente,
      totalClientes: clientes.length
    }
  }

  const exportarReporte = async () => {
    const elemento = document.getElementById('reporte-contenido')
    if (!elemento) return

    try {
      const canvas = await html2canvas(elemento, {
        backgroundColor: '#ffffff',
        scale: 2
      })

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `reporte-${tipoReporte}-${format(new Date(), 'yyyy-MM-dd')}.png`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      })
    } catch (error) {
      console.error('Error al exportar:', error)
    }
  }

  const ingresosPorMes = calcularIngresosPorMes()
  const ingresosPorPlan = calcularIngresosPorPlan()
  const topClientes = calcularTopClientes()
  const stats = calcularEstadisticasGenerales()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generando reportes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600 mt-1">Análisis y estadísticas del negocio</p>
        </div>
        <button
          onClick={exportarReporte}
          className="btn-primary flex items-center space-x-2"
        >
          <Download className="h-5 w-5" />
          <span>Exportar Reporte</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Reporte
            </label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
              className="input"
            >
              <option value="mensual">Ingresos Mensuales</option>
              <option value="planes">Por Plan</option>
              <option value="clientes">Top Clientes</option>
              <option value="general">Estadísticas Generales</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={periodo.inicio}
              onChange={(e) => setPeriodo({...periodo, inicio: e.target.value})}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={periodo.fin}
              onChange={(e) => setPeriodo({...periodo, fin: e.target.value})}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Contenido del Reporte */}
      <div id="reporte-contenido" className="space-y-6">
        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Total Ingresos</p>
            <p className="text-2xl font-bold text-blue-700">${stats.totalIngresos.toFixed(2)}</p>
          </div>
          <div className="card bg-green-50 border-green-200">
            <p className="text-sm text-green-600 font-medium">Clientes Activos</p>
            <p className="text-2xl font-bold text-green-700">{stats.clientesActivos}</p>
          </div>
          <div className="card bg-yellow-50 border-yellow-200">
            <p className="text-sm text-yellow-600 font-medium">Pendiente</p>
            <p className="text-2xl font-bold text-yellow-700">${stats.totalPendiente.toFixed(2)}</p>
          </div>
          <div className="card bg-purple-50 border-purple-200">
            <p className="text-sm text-purple-600 font-medium">Promedio/Cliente</p>
            <p className="text-2xl font-bold text-purple-700">${stats.promedioIngresoPorCliente.toFixed(2)}</p>
          </div>
        </div>

        {/* Reporte Mensual */}
        {tipoReporte === 'mensual' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2 text-primary-600" />
              Ingresos Mensuales
            </h2>
            <div className="space-y-3">
              {ingresosPorMes.map((item, index) => {
                const maxIngresos = Math.max(...ingresosPorMes.map(i => i.ingresos))
                const porcentaje = maxIngresos > 0 ? (item.ingresos / maxIngresos) * 100 : 0

                return (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.mes}</span>
                      <span className="text-sm font-semibold text-gray-900">${item.ingresos.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-primary-600 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Reporte por Planes */}
        {tipoReporte === 'planes' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <PieChart className="h-6 w-6 mr-2 text-primary-600" />
              Ingresos por Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ingresosPorPlan.map((item, index) => (
                <div key={index} className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
                  <h3 className="text-lg font-semibold text-primary-900 mb-2">{item.plan}</h3>
                  <p className="text-3xl font-bold text-primary-700 mb-2">${item.ingresos.toFixed(2)}</p>
                  <p className="text-sm text-primary-600">{item.clientes} clientes</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Clientes */}
        {tipoReporte === 'clientes' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-primary-600" />
              Top 10 Clientes
            </h2>
            <div className="space-y-3">
              {topClientes.map((cliente, index) => (
                <div key={cliente.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{cliente.nombre_empresa}</p>
                      <p className="text-sm text-gray-600">{cliente.plan}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${cliente.ingresos.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Total generado</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estadísticas Generales */}
        {tipoReporte === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Financiero</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Ingresos:</span>
                  <span className="font-semibold text-green-600">${stats.totalIngresos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pendiente:</span>
                  <span className="font-semibold text-yellow-600">${stats.totalPendiente.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Promedio por Cliente:</span>
                  <span className="font-semibold text-blue-600">${stats.promedioIngresoPorCliente.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Clientes</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Clientes:</span>
                  <span className="font-semibold text-gray-900">{stats.totalClientes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Activos:</span>
                  <span className="font-semibold text-green-600">{stats.clientesActivos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Suspendidos:</span>
                  <span className="font-semibold text-red-600">{stats.clientesSuspendidos}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
