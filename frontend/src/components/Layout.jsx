import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Users, LogOut, Building2, Bell, DollarSign, BarChart3, Settings } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Notificaciones', href: '/notificaciones', icon: Bell },
    { name: 'Contabilidad', href: '/contabilidad', icon: DollarSign },
    { name: 'Reportes', href: '/reportes', icon: BarChart3 },
    { name: 'Configuración', href: '/configuracion', icon: Settings },
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Fijo arriba */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-primary-700" />
              <div>
                <h1 className="text-xl font-bold">
                  <span className="text-accent-600">Anthony</span>{' '}
                  <span className="text-primary-800">Sistem</span>
                </h1>
                <p className="text-xs text-primary-600">Convertimos tus ideas en soluciones tecnológicas</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation - Fijo debajo del header */}
      <nav className="bg-white border-b border-gray-200 fixed top-16 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive(item.href)
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content - Con padding para compensar header y nav fijos */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-32 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
