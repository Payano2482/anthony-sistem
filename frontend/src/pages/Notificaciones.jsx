import { useState, useEffect } from 'react'
import { Bell, Send, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { format, addDays, differenceInDays } from 'date-fns'
import api from '../services/api'

export default function Notificaciones() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    loadClientes()
  }, [])

  const loadClientes = async () => {
    try {
      const response = await api.get('/clientes')
      setClientes(response.data)
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular próximo vencimiento
  const calcularProximoVencimiento = (fechaInicio) => {
    const inicio = new Date(fechaInicio)
    const hoy = new Date()
    const diasDesdeInicio = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24))
    const mesesCompletos = Math.floor(diasDesdeInicio / 30)
    const proximoVencimiento = new Date(inicio)
    proximoVencimiento.setDate(proximoVencimiento.getDate() + ((mesesCompletos + 1) * 30))
    return proximoVencimiento
  }

  // Contar días laborables (excluyendo sábados y domingos)
  const contarDiasLaborables = (fechaInicio, fechaFin) => {
    let diasLaborables = 0
    let fechaActual = new Date(fechaInicio)
    
    while (fechaActual <= fechaFin) {
      const diaSemana = fechaActual.getDay()
      // 0 = Domingo, 6 = Sábado
      if (diaSemana !== 0 && diaSemana !== 6) {
        diasLaborables++
      }
      fechaActual.setDate(fechaActual.getDate() + 1)
    }
    
    return diasLaborables
  }

  // Filtrar clientes que necesitan notificación (5 días laborables DESPUÉS del vencimiento)
  const clientesParaNotificar = clientes.filter(cliente => {
    const proximoVencimiento = calcularProximoVencimiento(cliente.fecha_inicio)
    const hoy = new Date()
    
    // Solo si ya venció
    if (proximoVencimiento >= hoy) return false
    
    // Contar días laborables desde el vencimiento hasta hoy
    const diasLaborablesVencidos = contarDiasLaborables(proximoVencimiento, hoy)
    
    // Notificar si han pasado exactamente 5 días laborables o más
    return diasLaborablesVencidos >= 5
  })

  // Clientes vencidos pero aún no llegan a 5 días laborables
  const clientesVencidos = clientes.filter(cliente => {
    const proximoVencimiento = calcularProximoVencimiento(cliente.fecha_inicio)
    const hoy = new Date()
    
    // Solo si ya venció
    if (proximoVencimiento >= hoy) return false
    
    // Contar días laborables desde el vencimiento
    const diasLaborablesVencidos = contarDiasLaborables(proximoVencimiento, hoy)
    
    // Vencidos pero aún no llegan a 5 días laborables
    return diasLaborablesVencidos < 5
  })

  const enviarNotificacionAutomatica = async (cliente) => {
    setEnviando(true)
    try {
      // Aquí podrías integrar con una API de WhatsApp o Email
      // Por ahora, solo simulamos el envío
      
      const proximoVencimiento = calcularProximoVencimiento(cliente.fecha_inicio)
      const diasLaborablesVencidos = contarDiasLaborables(proximoVencimiento, new Date())
      
      const mensaje = `⚠️ *NOTIFICACIÓN DE PAGO VENCIDO - ANTHONY SISTEM*

Hola ${cliente.contacto_nombre},

Tu pago mensual está VENCIDO:

💰 *Monto:* $${cliente.precio_mensual}
📅 *Fecha de vencimiento:* ${format(proximoVencimiento, 'dd/MM/yyyy')}
⏰ *Días laborables vencidos:* ${diasLaborablesVencidos}

🚫 *Tu servicio está suspendido por falta de pago*

*Deposita en cualquiera de estas cuentas:*

🔴 *BHD León*
Cuenta: 06584350073
A nombre de: Antonio Payano

🔵 *Banreservas*
Cuenta: 9608461925
A nombre de: Antonio Payano

📱 Después de depositar, envía tu comprobante por WhatsApp.

Gracias por tu preferencia.
_Anthony System_`

      // Abrir WhatsApp con el mensaje
      const telefono = cliente.telefono.replace(/\D/g, '')
      const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`
      window.open(url, '_blank')
      
      alert(`✅ Notificación preparada para ${cliente.nombre_empresa}`)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al enviar notificación')
    } finally {
      setEnviando(false)
    }
  }

  const enviarNotificacionMasiva = async () => {
    if (!confirm(`¿Enviar notificación a ${clientesParaNotificar.length} clientes?`)) {
      return
    }

    setEnviando(true)
    for (const cliente of clientesParaNotificar) {
      await enviarNotificacionAutomatica(cliente)
      // Esperar 2 segundos entre cada envío
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    setEnviando(false)
    alert('✅ Notificaciones enviadas')
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
        <h1 className="text-3xl font-bold text-gray-900">Notificaciones Automáticas</h1>
        <p className="text-gray-600 mt-1">
          Sistema de notificaciones para clientes con 5 días laborables de mora (después del vencimiento)
        </p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Listos para Notificar</p>
              <p className="text-3xl font-bold text-red-700">{clientesParaNotificar.length}</p>
              <p className="text-xs text-red-600 mt-1">≥ 5 días laborables de mora</p>
            </div>
            <Bell className="h-12 w-12 text-red-500" />
          </div>
        </div>

        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Vencidos Recientes</p>
              <p className="text-3xl font-bold text-yellow-700">{clientesVencidos.length}</p>
              <p className="text-xs text-yellow-600 mt-1">{'<'} 5 días laborables de mora</p>
            </div>
            <Clock className="h-12 w-12 text-yellow-500" />
          </div>
        </div>

        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Al Día</p>
              <p className="text-3xl font-bold text-green-700">
                {clientes.length - clientesParaNotificar.length - clientesVencidos.length}
              </p>
              <p className="text-xs text-green-600 mt-1">Sin notificaciones pendientes</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Acción Masiva */}
      {clientesParaNotificar.length > 0 && (
        <div className="card bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🔔 Notificaciones Pendientes
              </h3>
              <p className="text-gray-600">
                Hay {clientesParaNotificar.length} cliente(s) que necesitan ser notificados
              </p>
            </div>
            <button
              onClick={enviarNotificacionMasiva}
              disabled={enviando}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
              <span>{enviando ? 'Enviando...' : 'Enviar a Todos'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Lista de Clientes para Notificar */}
      {clientesParaNotificar.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔴 Clientes con 5+ Días Laborables de Mora (Listos para Notificar)
          </h2>
          <div className="space-y-3">
            {clientesParaNotificar.map(cliente => {
              const proximoVencimiento = calcularProximoVencimiento(cliente.fecha_inicio)
              const diasLaborables = contarDiasLaborables(proximoVencimiento, new Date())
              
              return (
                <div
                  key={cliente.id}
                  className="flex items-center justify-between p-4 bg-red-50 border border-red-300 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                      <Bell className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{cliente.nombre_empresa}</p>
                      <p className="text-sm text-gray-600">{cliente.contacto_nombre}</p>
                      <p className="text-xs text-red-600 font-medium">
                        Vencido: {format(proximoVencimiento, 'dd/MM/yyyy')} 
                        ({diasLaborables} día{diasLaborables !== 1 ? 's' : ''} laborable{diasLaborables !== 1 ? 's' : ''} de mora)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${cliente.precio_mensual}</p>
                      <p className="text-xs text-gray-500">{cliente.plan}</p>
                    </div>
                    <button
                      onClick={() => enviarNotificacionAutomatica(cliente)}
                      disabled={enviando}
                      className="btn-primary flex items-center space-x-2 text-sm disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      <span>Enviar</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Clientes Vencidos */}
      {clientesVencidos.length > 0 && (
        <div className="card border-2 border-red-300">
          <h2 className="text-xl font-semibold text-red-900 mb-4">
            ⚠️ Clientes Vencidos (Atención Urgente)
          </h2>
          <div className="space-y-3">
            {clientesVencidos.map(cliente => {
              const proximoVencimiento = calcularProximoVencimiento(cliente.fecha_inicio)
              const diasVencidos = Math.abs(differenceInDays(new Date(), proximoVencimiento))
              
              return (
                <div
                  key={cliente.id}
                  className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{cliente.nombre_empresa}</p>
                      <p className="text-sm text-gray-600">{cliente.contacto_nombre}</p>
                      <p className="text-xs text-red-600 font-medium">
                        Vencido hace {diasVencidos} día{diasVencidos !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-bold text-red-700">${cliente.precio_mensual}</p>
                      <p className="text-xs text-gray-500">{cliente.plan}</p>
                    </div>
                    <button
                      onClick={() => enviarNotificacionAutomatica(cliente)}
                      disabled={enviando}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 text-sm disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      <span>Urgente</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Sin Notificaciones */}
      {clientesParaNotificar.length === 0 && clientesVencidos.length === 0 && (
        <div className="card text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ¡Todo al día!
          </h3>
          <p className="text-gray-600">
            No hay clientes que requieran notificaciones en este momento
          </p>
        </div>
      )}
    </div>
  )
}
