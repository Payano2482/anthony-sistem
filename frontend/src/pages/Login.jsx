import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Building2, Lock, User, Fingerprint, Camera, Check } from 'lucide-react'
import { 
  isWebAuthnSupported, 
  isPlatformAuthenticatorAvailable,
  authenticateBiometric
} from '../services/webauthn'

export default function Login() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginBiometrico, setLoginBiometrico] = useState(false)
  const [tipoBiometria, setTipoBiometria] = useState(null)
  const [stream, setStream] = useState(null)
  const [webauthnAvailable, setWebauthnAvailable] = useState(false)
  const [rostroHabilitado, setRostroHabilitado] = useState(false)
  const videoRef = useRef(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  // Verificar si hay biometría habilitada
  useEffect(() => {
    // Verificar WebAuthn
    const checkWebAuthn = async () => {
      const supported = isWebAuthnSupported()
      const available = await isPlatformAuthenticatorAvailable()
      setWebauthnAvailable(supported && available)
    }
    
    checkWebAuthn()
    
    // Verificar rostro (cámara)
    const rostro = localStorage.getItem('rostro_registrado')
    if (rostro) {
      setRostroHabilitado(JSON.parse(rostro))
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError('Usuario o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  const handleLoginHuella = async () => {
    setLoginBiometrico(true)
    setTipoBiometria('huella')
    setError('')
    setLoading(true)

    try {
      // Vibración inicial
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200])
      }
      
      // Autenticar con WebAuthn REAL
      const result = await authenticateBiometric(username)
      
      if (result.success) {
        // Vibración de éxito
        if ('vibrate' in navigator) {
          navigator.vibrate(200)
        }
        
        // Guardar token
        localStorage.setItem('token', result.token)
        
        // Navegar al dashboard
        navigate('/')
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      console.error('Error:', err)
      setError(err.message || 'Error al autenticar con huella')
      setLoginBiometrico(false)
      setTipoBiometria(null)
      setLoading(false)
    }
  }

  const handleLoginRostro = async () => {
    setLoginBiometrico(true)
    setTipoBiometria('rostro')
    setError('')

    try {
      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta acceso a la cámara')
      }

      // Solicitar acceso a la cámara con configuración optimizada
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      
      // Esperar un momento para que el video esté listo
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.play().catch(err => {
            console.error('Error al reproducir video:', err)
          })
        }
      }, 100)
      
    } catch (err) {
      console.error('Error al acceder a la cámara:', err)
      let mensaje = 'No se pudo acceder a la cámara.'
      
      if (err.name === 'NotAllowedError') {
        mensaje = 'Permiso denegado. Permite el acceso a la cámara.'
      } else if (err.name === 'NotFoundError') {
        mensaje = 'No se encontró ninguna cámara.'
      } else if (err.name === 'NotReadableError') {
        mensaje = 'La cámara está siendo usada por otra aplicación.'
      }
      
      setError(mensaje)
      setLoginBiometrico(false)
      setTipoBiometria(null)
    }
  }

  const capturarYAutenticar = async () => {
    if (videoRef.current && stream) {
      // Detener el stream
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      
      setLoading(true)
      
      // Simulación de verificación facial
      setTimeout(async () => {
        try {
          await login('admin', 'admin123')
          navigate('/')
        } catch (err) {
          setError('Rostro no reconocido')
          setLoginBiometrico(false)
          setTipoBiometria(null)
        } finally {
          setLoading(false)
        }
      }, 1000)
    }
  }

  const cancelarBiometria = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setLoginBiometrico(false)
    setTipoBiometria(null)
    setLoading(false)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-700 rounded-full mb-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold">
              <span className="text-accent-600">Anthony</span>{' '}
              <span className="text-primary-800">Sistem</span>
            </h1>
            <p className="text-primary-600 mt-1">Convertimos tus ideas en soluciones tecnológicas</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input pl-10"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Separador y Botones Biométricos - Solo si están habilitados */}
          {(webauthnAvailable || rostroHabilitado) && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">O inicia sesión con</span>
                </div>
              </div>

              {/* Botones Biométricos */}
              <div className={`grid ${webauthnAvailable && rostroHabilitado ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                {webauthnAvailable && (
                  <button
                    type="button"
                    onClick={handleLoginHuella}
                    disabled={loading}
                    className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Fingerprint className="h-8 w-8 text-primary-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Huella/Biometría</span>
                  </button>
                )}
                
                {rostroHabilitado && (
                  <button
                    type="button"
                    onClick={handleLoginRostro}
                    disabled={loading}
                    className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className="h-8 w-8 text-primary-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Rostro</span>
                  </button>
                )}
              </div>
            </>
          )}

          {/* Info */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Credenciales por defecto:</p>
            <p className="font-mono text-xs mt-1">admin / admin123</p>
          </div>
        </div>
      </div>

      {/* Modal de Login Biométrico */}
      {loginBiometrico && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              {tipoBiometria === 'huella' ? (
                <>
                  <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Fingerprint className="h-12 w-12 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Autenticación por Huella
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Coloca tu dedo en el sensor de huella de tu dispositivo...
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full rounded-lg border-4 border-primary-600 bg-black"
                      style={{ maxHeight: '50vh' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-32 h-40 sm:w-48 sm:h-64 border-4 border-primary-600 rounded-lg opacity-50"></div>
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    Reconocimiento Facial
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">
                    Centra tu rostro en el recuadro y presiona "Autenticar"
                  </p>
                  {!loading && (
                    <button
                      onClick={capturarYAutenticar}
                      className="btn-primary w-full mb-3 py-3 flex items-center justify-center"
                    >
                      <Check className="h-5 w-5 mr-2" />
                      Autenticar
                    </button>
                  )}
                  {loading && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                    </div>
                  )}
                </>
              )}
              
              <button
                onClick={cancelarBiometria}
                disabled={loading}
                className="btn-secondary w-full py-3 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
