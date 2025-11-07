import { useState, useEffect } from 'react'
import { BarChart3, PieChart, TrendingUp, Download, RefreshCw, Activity } from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval } from 'date-fns'
import api from '../services/api'
import html2canvas from 'html2canvas'
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts'

export default function ReportesGraficos() {
  const [loading, setLoading] = useState(true)
  const [actualizando, setActualizando] = useState(false)
  const [clientes, setClientes] = useState([])
  const [pagos, setPagos] = useState([])
  const [tipoGrafico, setTipoGrafico] = useState('lineas')
  const [periodo, setPeriodo] = useState({
    inicio: format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd'),
    fin: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  })

  useEffect(() => {
    loadData()
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      actualizarDatos()
    }, 30000)
    return () => clearInterval(interval)
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

  const actualizarDatos = async () => {
    setActualizando(true)
    await loadData()
    setTimeout(() => setActualizando(false), 500)
  }

  // Datos para gráfico de líneas - Ingresos mensuales
  const datosIngresosMensuales = () => {
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

      const pendientesMes = pagos
        .filter(p => {
          const fechaPago = new Date(p.fecha_pago)
          return fechaPago.getMonth() === mes.getMonth() &&
                 fechaPago.getFullYear() === mes.getFullYear() &&
                 p.estado === 'Pendiente'
        })
        .reduce((sum, p) => sum + p.monto, 0)

      return {
        mes: format(mes, 'MMM yyyy'),
        ingresos: parseFloat(ingresosMes.toFixed(2)),
        pendientes: parseFloat(pendientesMes.toFixed(2))
      }
    })
  }

  // Datos para gráfico de barras - Por plan
  const datosIngresosPorPlan = () => {
    const planes = ['Basico', 'Premium', 'Empresarial']
    
    return planes.map(plan => {
      const ingresosPlan = pagos
        .filter(p => p.cliente_plan === plan && p.estado === 'Pagado')
        .reduce((sum, p) => sum + p.monto, 0)

      const clientesPlan = clientes.filter(c => c.plan === plan).length

      return {
        plan,
        ingresos: parseFloat(ingresosPlan.toFixed(2)),
        clientes: clientesPlan
      }
    })
  }

  // Datos para gráfico circular - Estados de pago
  const datosEstadosPago = () => {
    const estados = ['Pagado', 'Pendiente', 'Atrasado']
    const colores = ['#10b981', '#f59e0b', '#ef4444']
    
    return estados.map((estado, index) => ({
      name: estado,
      value: pagos.filter(p => p.estado === estado).length,
      color: colores[index]
    }))
  }

  // Datos para área - Tendencia acumulada
  const datosTendenciaAcumulada = () => {
    const datos = datosIngresosMensuales()
    let acumulado = 0
    
    return datos.map(item => {
      acumulado += item.ingresos
      return {
        mes: item.mes,
        acumulado: parseFloat(acumulado.toFixed(2))
      }
    })
  }

  const exportarGrafico = async () => {
    const elemento = document.getElementById('graficos-contenido')
    if (!elemento) return

    try {
      const canvas = await html2canvas(elemento, {
        backgroundColor: '#ffffff',
        scale: 2
      })

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `reporte-grafico-${format(new Date(), 'yyyy-MM-dd-HHmm')}.png`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      })
    } catch (error) {
      console.error('Error al exportar:', error)
    }
  }

  const calcularEstadisticas = () => {
    const totalIngresos = pagos
      .filter(p => p.estado === 'Pagado')
      .reduce((sum, p) => sum + p.monto, 0)

    const totalPendiente = pagos
      .filter(p => p.estado === 'Pendiente' || p.estado === 'Atrasado')
      .reduce((sum, p) => sum + p.monto, 0)

    const clientesActivos = clientes.filter(c => c.estado === 'Activo').length
    const promedioMensual = datosIngresosMensuales().reduce((sum, m) => sum + m.ingresos, 0) / datosIngresosMensuales().length

    return {
      totalIngresos,
      totalPendiente,
      clientesActivos,
      promedioMensual
    }
  }

  const stats = calcularEstadisticas()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando gráficos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Activity className={`h-8 w-8 mr-3 text-primary-600 ${actualizando ? 'animate-pulse' : ''}`} />
            Reportes en Vivo
          </h1>
          <p className="text-gray-600 mt-1">Gráficos y estadísticas actualizados en tiempo real</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={actualizarDatos}
            disabled={actualizando}
            className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${actualizando ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          <button
            onClick={exportarGrafico}
            className="btn-primary flex items-center space-x-2"
          >
            <Download className="h-5 w-5" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Indicador de actualización en vivo */}
      <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Datos en Tiempo Real</p>
              <p className="text-sm text-gray-600">Actualización automática cada 30 segundos</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">Última actualización: {format(new Date(), 'HH:mm:ss')}</p>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90">Total Ingresos</p>
          <p className="text-3xl font-bold">${stats.totalIngresos.toFixed(2)}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90">Clientes Activos</p>
          <p className="text-3xl font-bold">{stats.clientesActivos}</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <p className="text-sm opacity-90">Pendiente</p>
          <p className="text-3xl font-bold">${stats.totalPendiente.toFixed(2)}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90">Promedio Mensual</p>
          <p className="text-3xl font-bold">${stats.promedioMensual.toFixed(2)}</p>
        </div>
      </div>

      {/* Selector de Gráfico */}
      <div className="card">
        <div className="flex space-x-2">
          <button
            onClick={() => setTipoGrafico('lineas')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tipoGrafico === 'lineas'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📈 Líneas
          </button>
          <button
            onClick={() => setTipoGrafico('barras')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tipoGrafico === 'barras'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Barras
          </button>
          <button
            onClick={() => setTipoGrafico('circular')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tipoGrafico === 'circular'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🥧 Circular
          </button>
          <button
            onClick={() => setTipoGrafico('area')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tipoGrafico === 'area'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📉 Área
          </button>
        </div>
      </div>

      {/* Gráficos */}
      <div id="graficos-contenido" className="space-y-6">
        {/* Gráfico de Líneas - Ingresos Mensuales */}
        {tipoGrafico === 'lineas' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              📈 Ingresos Mensuales (Tendencia)
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={datosIngresosMensuales()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ingresos" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Ingresos"
                  dot={{ fill: '#3b82f6', r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="pendientes" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Pendientes"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráfico de Barras - Por Plan */}
        {tipoGrafico === 'barras' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              📊 Ingresos por Plan
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={datosIngresosPorPlan()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="plan" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ingresos" fill="#10b981" name="Ingresos ($)" />
                <Bar dataKey="clientes" fill="#6366f1" name="Clientes (#)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráfico Circular - Estados */}
        {tipoGrafico === 'circular' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              🥧 Distribución de Estados de Pago
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <RechartsPie>
                <Pie
                  data={datosEstadosPago()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {datosEstadosPago().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráfico de Área - Tendencia Acumulada */}
        {tipoGrafico === 'area' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              📉 Ingresos Acumulados
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={datosTendenciaAcumulada()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="acumulado" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                  name="Acumulado ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
