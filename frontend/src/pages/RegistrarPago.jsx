import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, DollarSign } from 'lucide-react'
import api from '../services/api'

export default function RegistrarPago() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    monto: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
    metodo_pago: 'Efectivo',
    referencia: '',
    notas: ''
  })

  useEffect(() => {
    loadCliente()
  }, [id])

  const loadCliente = async () => {
    try {
      const response = await api.get(`/clientes/${id}`)
      setCliente(response.data)
      
      // Pre-llenar el formulario
      setFormData(prev => ({
        ...prev,
        monto: response.data.precio_mensual.toString(),
        fecha_vencimiento: response.data.proximo_pago || ''
      }))
    } catch (error) {
      console.error('Error loading cliente:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/pagos', {
        cliente_renta_id: parseInt(id),
        ...formData,
        monto: parseFloat(formData.monto)
      })
      
      alert('Pago registrado exitosamente')
      navigate(`/clientes/${id}`)
    } catch (error) {
      alert('Error al registrar pago')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (!cliente) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(`/clientes/${id}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver al cliente
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Registrar Pago</h1>
        <p className="text-gray-600 mt-1">{cliente.nombre_empresa}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Cliente Info */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cliente</p>
              <p className="font-semibold text-gray-900">{cliente.nombre_empresa}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Monto mensual</p>
              <p className="text-2xl font-bold text-primary-600">${cliente.precio_mensual}</p>
            </div>
          </div>
        </div>

        {/* Monto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              step="0.01"
              required
              className="input pl-10"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Pago <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="fecha_pago"
              value={formData.fecha_pago}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Vencimiento <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="fecha_vencimiento"
              value={formData.fecha_vencimiento}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
        </div>

        {/* Método de Pago */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Método de Pago
          </label>
          <div className="space-y-2">
            {['Efectivo', 'Transferencia', 'Tarjeta'].map((metodo) => (
              <label key={metodo} className="flex items-center">
                <input
                  type="radio"
                  name="metodo_pago"
                  value={metodo}
                  checked={formData.metodo_pago === metodo}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700">{metodo}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Referencia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Referencia
          </label>
          <input
            type="text"
            name="referencia"
            value={formData.referencia}
            onChange={handleChange}
            className="input"
            placeholder="Número de referencia o comprobante"
          />
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas
          </label>
          <textarea
            name="notas"
            value={formData.notas}
            onChange={handleChange}
            rows={3}
            className="input"
            placeholder="Notas adicionales sobre el pago..."
          />
        </div>

        {/* Actions */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(`/clientes/${id}`)}
            className="flex-1 btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registrando...' : 'Confirmar Pago'}
          </button>
        </div>
      </form>
    </div>
  )
}
