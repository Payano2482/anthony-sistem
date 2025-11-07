import { useState } from 'react'
import { Settings, Fingerprint, Camera, User, Lock, Bell, Shield, Clock, Users } from 'lucide-react'
import ConfiguracionBiometria from '../components/ConfiguracionBiometria'
import ConfiguracionHorarios from '../components/ConfiguracionHorarios'
import ConfiguracionUsuarios from '../components/ConfiguracionUsuarios'

export default function Configuracion() {
  const [seccionActiva, setSeccionActiva] = useState('biometria')

  const secciones = [
    { id: 'biometria', nombre: 'Biometría', icono: Fingerprint },
    { id: 'horarios', nombre: 'Horarios', icono: Clock },
    { id: 'usuarios', nombre: 'Usuarios y Roles', icono: Users },
    { id: 'perfil', nombre: 'Perfil', icono: User },
    { id: 'seguridad', nombre: 'Seguridad', icono: Lock },
    { id: 'notificaciones', nombre: 'Notificaciones', icono: Bell },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">Personaliza tu sistema y seguridad</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menú Lateral - Responsive */}
        <div className="lg:col-span-1">
          {/* Versión móvil - Horizontal scroll */}
          <div className="lg:hidden overflow-x-auto pb-2">
            <div className="flex space-x-2 min-w-max">
              {secciones.map((seccion) => {
                const Icono = seccion.icono
                return (
                  <button
                    key={seccion.id}
                    onClick={() => setSeccionActiva(seccion.id)}
                    className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                      seccionActiva === seccion.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 border-2 border-gray-200'
                    }`}
                  >
                    <Icono className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">{seccion.nombre}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Versión desktop - Vertical */}
          <div className="hidden lg:block card space-y-2">
            {secciones.map((seccion) => {
              const Icono = seccion.icono
              return (
                <button
                  key={seccion.id}
                  onClick={() => setSeccionActiva(seccion.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    seccionActiva === seccion.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icono className="h-5 w-5" />
                  <span className="font-medium">{seccion.nombre}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Contenido */}
        <div className="lg:col-span-3">
          {seccionActiva === 'biometria' && <ConfiguracionBiometria />}
          {seccionActiva === 'horarios' && <ConfiguracionHorarios />}
          {seccionActiva === 'usuarios' && <ConfiguracionUsuarios />}
          
          {seccionActiva === 'perfil' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <User className="h-6 w-6 mr-2 text-primary-600" />
                Información del Perfil
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="input"
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="809-555-1234"
                  />
                </div>
                <button className="btn-primary">
                  Guardar Cambios
                </button>
              </div>
            </div>
          )}

          {seccionActiva === 'seguridad' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Lock className="h-6 w-6 mr-2 text-primary-600" />
                Seguridad
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Cambiar Contraseña</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña Actual
                      </label>
                      <input
                        type="password"
                        className="input"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        className="input"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        className="input"
                        placeholder="••••••••"
                      />
                    </div>
                    <button className="btn-primary">
                      Actualizar Contraseña
                    </button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Autenticación de Dos Factores</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">2FA Habilitado</p>
                      <p className="text-sm text-gray-600">Protección adicional para tu cuenta</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {seccionActiva === 'notificaciones' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Bell className="h-6 w-6 mr-2 text-primary-600" />
                Preferencias de Notificaciones
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Notificaciones por Email</p>
                    <p className="text-sm text-gray-600">Recibe alertas por correo electrónico</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Notificaciones WhatsApp</p>
                    <p className="text-sm text-gray-600">Recibe alertas por WhatsApp</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Alertas de Pagos Vencidos</p>
                    <p className="text-sm text-gray-600">Notificaciones de mora automáticas</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
