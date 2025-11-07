import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6">
        {/* Mensaje de Bienvenida */}
        <div className="space-y-2">
          <h1 className="text-5xl font-bold">
            <span className="text-gray-700">Bienvenido,</span>{' '}
            <span className="text-primary-700">{user?.nombre_completo || 'Usuario'}</span>
          </h1>
          <p className="text-xl text-gray-600">
            {new Date().toLocaleDateString('es-DO', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Mensaje adicional */}
        <div className="mt-8">
          <p className="text-lg text-gray-500">
            Selecciona una opción del menú para comenzar
          </p>
        </div>
      </div>
    </div>
  )
}
