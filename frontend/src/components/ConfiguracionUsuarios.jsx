import { useState } from 'react'
import { Users, UserPlus, Shield, Edit, Trash2, Key } from 'lucide-react'

export default function ConfiguracionUsuarios() {
  const [usuarios, setUsuarios] = useState([
    {
      id: 1,
      nombre: 'Antonio Payano',
      email: 'admin@anthonysystem.com',
      rol: 'Administrador',
      estado: 'Activo',
      permisos: ['todos']
    }
  ])

  const [mostrarModal, setMostrarModal] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'Operador',
    permisos: []
  })

  const roles = [
    {
      nombre: 'Administrador',
      descripcion: 'Acceso completo al sistema',
      permisos: ['todos'],
      color: 'red'
    },
    {
      nombre: 'Gerente',
      descripcion: 'Gestión de clientes y reportes',
      permisos: ['clientes', 'pagos', 'reportes', 'contabilidad'],
      color: 'blue'
    },
    {
      nombre: 'Operador',
      descripcion: 'Operaciones básicas',
      permisos: ['clientes', 'pagos'],
      color: 'green'
    },
    {
      nombre: 'Contador',
      descripcion: 'Solo contabilidad y reportes',
      permisos: ['contabilidad', 'reportes'],
      color: 'purple'
    }
  ]

  const permisosDisponibles = [
    { id: 'clientes', nombre: 'Gestión de Clientes', icono: '👥' },
    { id: 'pagos', nombre: 'Registro de Pagos', icono: '💰' },
    { id: 'notificaciones', nombre: 'Notificaciones', icono: '🔔' },
    { id: 'contabilidad', nombre: 'Contabilidad', icono: '📊' },
    { id: 'reportes', nombre: 'Reportes', icono: '📈' },
    { id: 'configuracion', nombre: 'Configuración', icono: '⚙️' },
    { id: 'usuarios', nombre: 'Gestión de Usuarios', icono: '👤' }
  ]

  const agregarUsuario = () => {
    if (!formData.nombre || !formData.email || !formData.password) {
      alert('Por favor completa todos los campos')
      return
    }

    const rolSeleccionado = roles.find(r => r.nombre === formData.rol)
    const nuevoUsuario = {
      id: Date.now(),
      nombre: formData.nombre,
      email: formData.email,
      rol: formData.rol,
      estado: 'Activo',
      permisos: rolSeleccionado.permisos
    }

    setUsuarios([...usuarios, nuevoUsuario])
    setMostrarModal(false)
    setFormData({ nombre: '', email: '', password: '', rol: 'Operador', permisos: [] })
    alert('✅ Usuario creado exitosamente')
  }

  const eliminarUsuario = (id) => {
    if (id === 1) {
      alert('❌ No puedes eliminar el usuario administrador principal')
      return
    }
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      setUsuarios(usuarios.filter(u => u.id !== id))
      alert('✅ Usuario eliminado')
    }
  }

  const cambiarEstado = (id) => {
    setUsuarios(usuarios.map(u => 
      u.id === id ? { ...u, estado: u.estado === 'Activo' ? 'Inactivo' : 'Activo' } : u
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Users className="h-6 w-6 mr-2 text-primary-600" />
            Gestión de Usuarios y Roles
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {usuarios.length} usuario(s) registrado(s)
          </p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <UserPlus className="h-5 w-5" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Roles Disponibles */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary-600" />
          Roles del Sistema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((rol) => (
            <div key={rol.nombre} className={`p-4 rounded-lg border-2 border-${rol.color}-200 bg-${rol.color}-50`}>
              <h4 className={`font-semibold text-${rol.color}-900 mb-2`}>{rol.nombre}</h4>
              <p className="text-sm text-gray-600 mb-3">{rol.descripcion}</p>
              <div className="space-y-1">
                {rol.permisos[0] === 'todos' ? (
                  <span className="text-xs bg-white px-2 py-1 rounded">✅ Todos los permisos</span>
                ) : (
                  rol.permisos.map(p => (
                    <div key={p} className="text-xs bg-white px-2 py-1 rounded inline-block mr-1">
                      {permisosDisponibles.find(pd => pd.id === p)?.icono} {p}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de Usuarios */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usuarios Activos</h3>
        <div className="space-y-3">
          {usuarios.map((usuario) => (
            <div
              key={usuario.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{usuario.nombre}</p>
                  <p className="text-sm text-gray-600">{usuario.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      usuario.rol === 'Administrador' ? 'bg-red-100 text-red-700' :
                      usuario.rol === 'Gerente' ? 'bg-blue-100 text-blue-700' :
                      usuario.rol === 'Operador' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {usuario.rol}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      usuario.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {usuario.estado}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => cambiarEstado(usuario.id)}
                  className={`p-2 rounded-lg ${
                    usuario.estado === 'Activo' 
                      ? 'text-yellow-600 hover:bg-yellow-50' 
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                  title={usuario.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                >
                  <Key className="h-5 w-5" />
                </button>
                <button
                  onClick={() => eliminarUsuario(usuario.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Eliminar"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permisos Detallados */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Permisos del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {permisosDisponibles.map((permiso) => (
            <div key={permiso.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">{permiso.icono}</span>
              <div>
                <p className="font-medium text-gray-900">{permiso.nombre}</p>
                <p className="text-xs text-gray-600">ID: {permiso.id}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Nuevo Usuario */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Nuevo Usuario</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="input"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input"
                  placeholder="juan@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="input"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({...formData, rol: e.target.value})}
                  className="input"
                >
                  {roles.map(rol => (
                    <option key={rol.nombre} value={rol.nombre}>
                      {rol.nombre} - {rol.descripcion}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setMostrarModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={agregarUsuario}
                className="flex-1 btn-primary"
              >
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
