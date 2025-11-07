import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, User, Phone, Mail, DollarSign, Search, Loader } from 'lucide-react'
import api from '../services/api'

export default function NuevoCliente() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [loadingCedula, setLoadingCedula] = useState(false)
  const [fotoCedula, setFotoCedula] = useState(null)
  const [formData, setFormData] = useState({
    cedula: '',
    nombre_empresa: '',
    contacto_nombre: '',
    telefono: '',
    email: '',
    plan: 'Basico',
    precio_mensual: '',
    fecha_inicio: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/clientes', {
        ...formData,
        precio_mensual: parseFloat(formData.precio_mensual)
      })
      
      alert('Cliente creado exitosamente')
      navigate('/clientes')
    } catch (error) {
      alert('Error al crear cliente: ' + (error.response?.data?.detail || error.message))
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const buscarCedula = async () => {
    const cedula = formData.cedula.replace(/-/g, '')
    
    if (!cedula || cedula.length !== 11) {
      alert('Por favor ingresa una cédula válida (11 dígitos)')
      return
    }

    setLoadingCedula(true)
    
    try {
      // Intentar con API del backend (que consultará la JCE)
      const response = await api.get(`/cedula/${cedula}`)
      
      if (response.data && response.data.success) {
        const persona = response.data.data
        
        // Llenar automáticamente los campos
        setFormData(prev => ({
          ...prev,
          contacto_nombre: persona.nombre_completo || persona.nombres,
          nombre_empresa: prev.nombre_empresa || persona.nombres?.split(' ')[0] || ''
        }))
        
        // Cargar foto si está disponible
        if (persona.foto) {
          setFotoCedula(persona.foto)
        }
        
        alert('✅ Datos cargados exitosamente')
      } else {
        // Si no se encuentra, permitir ingreso manual
        alert('⚠️ No se pudo consultar la cédula automáticamente.\n\nPuedes ingresar los datos manualmente.')
      }
    } catch (error) {
      console.error('Error al buscar cédula:', error)
      // Permitir continuar con ingreso manual
      alert('⚠️ No se pudo consultar la cédula en este momento.\n\nPuedes continuar ingresando los datos manualmente.')
    } finally {
      setLoadingCedula(false)
    }
  }

  const formatCedula = (value) => {
    // Eliminar todo excepto números
    const numbers = value.replace(/\D/g, '')
    
    // Formatear como XXX-XXXXXXX-X
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 10) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 10)}-${numbers.slice(10, 11)}`
  }

  const handleCedulaChange = (e) => {
    const formatted = formatCedula(e.target.value)
    setFormData(prev => ({ ...prev, cedula: formatted }))
  }

  const planes = [
    { value: 'Basico', label: 'Básico', precio: 100 },
    { value: 'Premium', label: 'Premium', precio: 150 },
    { value: 'Empresarial', label: 'Empresarial', precio: 200 }
  ]

  const handlePlanChange = (e) => {
    const plan = e.target.value
    const planData = planes.find(p => p.value === plan)
    setFormData(prev => ({
      ...prev,
      plan: plan,
      precio_mensual: planData ? planData.precio.toString() : ''
    }))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/clientes')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver a clientes
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Cliente</h1>
        <p className="text-gray-600 mt-1">Registra un nuevo cliente que rentará el sistema</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Búsqueda por Cédula */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Search className="h-5 w-5 mr-2 text-blue-600" />
            Búsqueda por Cédula (Opcional)
          </h2>
          
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cédula de Identidad
              </label>
              <input
                type="text"
                value={formData.cedula}
                onChange={handleCedulaChange}
                className="input"
                placeholder="000-0000000-0"
                maxLength="13"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ingresa la cédula para intentar cargar datos automáticamente (opcional)
              </p>
            </div>
            
            <div className="pt-7">
              <button
                type="button"
                onClick={buscarCedula}
                disabled={loadingCedula || !formData.cedula}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                {loadingCedula ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Buscar</span>
                  </>
                )}
              </button>
            </div>

            {fotoCedula && (
              <div className="pt-7">
                <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-blue-300 shadow-lg">
                  <img 
                    src={fotoCedula} 
                    alt="Foto de cédula" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información de la Empresa */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-primary-600" />
            Información de la Empresa
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Empresa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre_empresa"
                value={formData.nombre_empresa}
                onChange={handleChange}
                required
                className="input"
                placeholder="Ej: Colmado El Buen Precio"
              />
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-primary-600" />
            Información de Contacto
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Contacto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contacto_nombre"
                value={formData.contacto_nombre}
                onChange={handleChange}
                required
                className="input"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  className="input pl-10"
                  placeholder="809-555-1234"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="contacto@empresa.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Plan y Precio */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-primary-600" />
            Plan y Precio
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan <span className="text-red-500">*</span>
              </label>
              <select
                name="plan"
                value={formData.plan}
                onChange={handlePlanChange}
                required
                className="input"
              >
                {planes.map(plan => (
                  <option key={plan.value} value={plan.value}>
                    {plan.label} - ${plan.precio}/mes
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Mensual <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="precio_mensual"
                  value={formData.precio_mensual}
                  onChange={handleChange}
                  step="0.01"
                  required
                  className="input pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Al crear el cliente se generará automáticamente:
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4">
            <li>• Una licencia única para el sistema</li>
            <li>• El primer pago pendiente</li>
            <li>• Fecha de vencimiento (30 días desde la fecha de inicio)</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/clientes')}
            className="flex-1 btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear Cliente'}
          </button>
        </div>
      </form>
    </div>
  )
}
