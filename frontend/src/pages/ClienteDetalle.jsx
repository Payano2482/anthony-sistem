import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, Phone, Mail, Calendar, DollarSign, 
  CreditCard, CheckCircle, XCircle, Lock, Unlock, FileImage, Bell 
} from 'lucide-react'
import { format } from 'date-fns'
import api from '../services/api'
import ReciboImagen from '../components/ReciboImagen'
import NotificacionPago from '../components/NotificacionPago'

export default function ClienteDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState(null)
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [reciboSeleccionado, setReciboSeleccionado] = useState(null)
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false)

  useEffect(() => {
    loadCliente()
    loadPagos()
  }, [id])

  const loadCliente = async () => {
    try {
      const response = await api.get(`/clientes/${id}`)
      setCliente(response.data)
    } catch (error) {
      console.error('Error loading cliente:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPagos = async () => {
    try {
      const response = await api.get(`/clientes/${id}/pagos`)
      setPagos(response.data)
    } catch (error) {
      console.error('Error loading pagos:', error)
    }
  }

  const handleSuspender = async () => {
    if (!confirm('¿Estás seguro de suspender el acceso de este cliente?')) return

    try {
      await api.post(`/clientes/${id}/suspend`)
      alert('Cliente suspendido exitosamente')
      loadCliente()
    } catch (error) {
      alert('Error al suspender cliente')
    }
  }

  const getEstadoBadge = (dias) => {
    if (dias === null) return { color: 'bg-gray-100 text-gray-800', text: 'Sin pagos', icon: '⚪' }
    if (dias < 0) return { color: 'bg-red-100 text-red-800', text: `${Math.abs(dias)} días atraso`, icon: '🔴' }
    if (dias <= 3) return { color: 'bg-yellow-100 text-yellow-800', text: `Vence en ${dias} días`, icon: '🟡' }
    return { color: 'bg-green-100 text-green-800', text: 'Al día', icon: '🟢' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cliente no encontrado</p>
      </div>
    )
  }

  const estado = getEstadoBadge(cliente.dias_hasta_vencimiento)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/clientes')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver a clientes
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{cliente.nombre_empresa}</h1>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información de Contacto */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h2>
          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <Phone className="h-5 w-5 mr-3 text-gray-400" />
              <a href={`tel:${cliente.telefono}`} className="hover:text-primary-600">
                {cliente.telefono}
              </a>
            </div>
            {cliente.email && (
              <div className="flex items-center text-gray-700">
                <Mail className="h-5 w-5 mr-3 text-gray-400" />
                <a href={`mailto:${cliente.email}`} className="hover:text-primary-600">
                  {cliente.email}
                </a>
              </div>
            )}
            <div className="flex items-center text-gray-700">
              <Calendar className="h-5 w-5 mr-3 text-gray-400" />
              <span>Contacto: {cliente.contacto_nombre}</span>
            </div>
          </div>
        </div>

        {/* Plan Contratado */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan Contratado</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Plan</p>
              <p className="text-lg font-semibold text-gray-900">{cliente.plan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Precio Mensual</p>
              <p className="text-2xl font-bold text-primary-600">${cliente.precio_mensual}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fecha de Inicio</p>
              <p className="text-gray-900">{cliente.fecha_inicio}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Licencia</p>
              <p className="text-xs font-mono text-gray-700 bg-gray-100 p-2 rounded">
                {cliente.licencia_key}
              </p>
            </div>
          </div>
        </div>

        {/* Estado de Pago */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado de Pago</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${estado.color} mt-1`}>
                {estado.icon} {estado.text}
              </span>
            </div>
            {cliente.proximo_pago && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Próximo Pago</p>
                  <p className="text-gray-900">{cliente.proximo_pago}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Días Restantes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {cliente.dias_hasta_vencimiento}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Historial de Pagos */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de Pagos</h2>
        <div className="space-y-3">
          {pagos.map((pago) => (
            <div
              key={pago.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                {pago.estado === 'Pagado' ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {format(new Date(pago.fecha_vencimiento), 'MMMM yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {pago.estado} • {pago.metodo_pago || 'Pendiente'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${pago.monto}</p>
                  {pago.referencia && (
                    <p className="text-xs text-gray-500">{pago.referencia}</p>
                  )}
                </div>
                {pago.estado === 'Pagado' && (
                  <button
                    onClick={() => setReciboSeleccionado(pago)}
                    className="btn-primary flex items-center space-x-1 text-sm py-2 px-3"
                    title="Generar recibo"
                  >
                    <FileImage className="h-4 w-4" />
                    <span>Recibo</span>
                  </button>
                )}
              </div>
            </div>
          ))}
          {pagos.length === 0 && (
            <p className="text-center text-gray-500 py-4">No hay pagos registrados</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <a
          href={`tel:${cliente.telefono}`}
          className="btn-secondary flex items-center space-x-2"
        >
          <Phone className="h-5 w-5" />
          <span>Llamar</span>
        </a>
        
        <a
          href={`https://wa.me/${cliente.telefono.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary flex items-center space-x-2"
        >
          <Mail className="h-5 w-5" />
          <span>WhatsApp</span>
        </a>
        
        <button
          onClick={() => setMostrarNotificacion(true)}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span>Enviar Notificación</span>
        </button>
        
        <Link
          to={`/clientes/${id}/pago`}
          className="btn-primary flex items-center space-x-2"
        >
          <DollarSign className="h-5 w-5" />
          <span>Registrar Pago</span>
        </Link>
        
        {cliente.estado === 'Activo' ? (
          <button
            onClick={handleSuspender}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Lock className="h-5 w-5" />
            <span>Suspender Acceso</span>
          </button>
        ) : (
          <span className="flex items-center space-x-2 bg-gray-400 text-white font-medium py-2 px-4 rounded-lg">
            <Lock className="h-5 w-5" />
            <span>Suspendido</span>
          </span>
        )}
      </div>

      {/* Modal de Recibo */}
      {reciboSeleccionado && (
        <ReciboImagen
          pago={reciboSeleccionado}
          cliente={cliente}
          onClose={() => setReciboSeleccionado(null)}
        />
      )}

      {/* Modal de Notificación */}
      {mostrarNotificacion && (
        <NotificacionPago
          cliente={cliente}
          onClose={() => setMostrarNotificacion(false)}
        />
      )}
    </div>
  )
}
