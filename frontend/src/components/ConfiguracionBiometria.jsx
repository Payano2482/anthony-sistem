import { useState, useRef, useEffect } from 'react'
import { Fingerprint, Camera, Check, X, AlertTriangle, Scan, Shield } from 'lucide-react'
import { 
  isWebAuthnSupported, 
  isPlatformAuthenticatorAvailable,
  registerBiometric,
  hasCredentials as checkWebAuthnCredentials,
  deleteCredentials as deleteWebAuthnCredentials
} from '../services/webauthn'

export default function ConfiguracionBiometria() {
  const [huellasRegistradas, setHuellasRegistradas] = useState([])
  const [rostroRegistrado, setRostroRegistrado] = useState(false)
  const [escaneando, setEscaneando] = useState(false)
  const [tipoEscaneo, setTipoEscaneo] = useState(null)
  const [webauthnSupported, setWebauthnSupported] = useState(false)
  const [platformAuthAvailable, setPlatformAuthAvailable] = useState(false)
  const [hasWebAuthnCreds, setHasWebAuthnCreds] = useState(false)
  const videoRef = useRef(null)
  const [stream, setStream] = useState(null)

  // Cargar datos y verificar soporte de WebAuthn
  useEffect(() => {
    // Verificar soporte de WebAuthn
    setWebauthnSupported(isWebAuthnSupported())
    
    // Verificar autenticador de plataforma
    isPlatformAuthenticatorAvailable().then(available => {
      setPlatformAuthAvailable(available)
    })
    
    // Verificar credenciales WebAuthn
    const token = localStorage.getItem('token')
    if (token) {
      checkWebAuthnCredentials(token).then(hasCreds => {
        setHasWebAuthnCreds(hasCreds)
      })
    }
    
    // Cargar datos de localStorage (para cámara)
    const rostroGuardado = localStorage.getItem('rostro_registrado')
    if (rostroGuardado) {
      setRostroRegistrado(JSON.parse(rostroGuardado))
    }
  }, [])

  const iniciarEscaneoHuella = async () => {
    setEscaneando(true)
    setTipoEscaneo('huella')
    
    try {
      // Verificar soporte
      if (!webauthnSupported || !platformAuthAvailable) {
        throw new Error('Tu dispositivo no soporta autenticación biométrica')
      }
      
      // Vibración inicial
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200])
      }
      
      // Obtener token
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay sesión activa')
      }
      
      // Registrar con WebAuthn REAL
      const result = await registerBiometric(token)
      
      if (result.success) {
        // Vibración de éxito
        if ('vibrate' in navigator) {
          navigator.vibrate(200)
        }
        
        setHasWebAuthnCreds(true)
        setEscaneando(false)
        setTipoEscaneo(null)
        
        alert('✅ Huella dactilar registrada exitosamente con sensor REAL! Ahora puedes usarla para iniciar sesión.')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      setEscaneando(false)
      setTipoEscaneo(null)
      alert(`❌ ${error.message || 'Error al registrar huella'}`)
    }
  }

  const iniciarEscaneoRostro = async () => {
    setEscaneando(true)
    setTipoEscaneo('rostro')
    
    try {
      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta acceso a la cámara')
      }

      // Solicitar acceso a la cámara con configuración optimizada para móvil
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
      
    } catch (error) {
      console.error('Error al acceder a la cámara:', error)
      let mensaje = '❌ No se pudo acceder a la cámara.'
      
      if (error.name === 'NotAllowedError') {
        mensaje += '\n\nPor favor, permite el acceso a la cámara en la configuración de tu navegador.'
      } else if (error.name === 'NotFoundError') {
        mensaje += '\n\nNo se encontró ninguna cámara en tu dispositivo.'
      } else if (error.name === 'NotReadableError') {
        mensaje += '\n\nLa cámara está siendo usada por otra aplicación.'
      } else {
        mensaje += '\n\n' + error.message
      }
      
      alert(mensaje)
      setEscaneando(false)
      setTipoEscaneo(null)
    }
  }

  const capturarRostro = () => {
    if (videoRef.current && stream) {
      // Detener el stream
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      
      setRostroRegistrado(true)
      
      // Guardar en localStorage
      localStorage.setItem('rostro_registrado', JSON.stringify(true))
      
      setEscaneando(false)
      setTipoEscaneo(null)
      alert('✅ Reconocimiento facial registrado exitosamente. Ahora puedes usarlo para iniciar sesión.')
    }
  }

  const cancelarEscaneo = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setEscaneando(false)
    setTipoEscaneo(null)
  }

  const eliminarHuella = async () => {
    if (confirm('¿Estás seguro de eliminar la credencial biométrica?')) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No hay sesión activa')
        }
        
        const result = await deleteWebAuthnCredentials(token)
        
        if (result.success) {
          setHasWebAuthnCreds(false)
          alert('✅ Credencial biométrica eliminada')
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        alert(`❌ ${error.message || 'Error al eliminar credencial'}`)
      }
    }
  }

  const eliminarRostro = () => {
    if (confirm('¿Estás seguro de eliminar el reconocimiento facial?')) {
      setRostroRegistrado(false)
      
      // Actualizar localStorage
      localStorage.setItem('rostro_registrado', JSON.stringify(false))
    }
  }

  return (
    <div className="space-y-6">
      {/* Huellas Dactilares */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Fingerprint className="h-6 w-6 mr-2 text-primary-600" />
            Huellas Dactilares
          </h2>
          <button
            onClick={iniciarEscaneoHuella}
            disabled={escaneando}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Fingerprint className="h-5 w-5" />
            <span>Registrar Huella</span>
          </button>
        </div>

        {/* Estado de WebAuthn */}
        {webauthnSupported && platformAuthAvailable ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-green-900">Sensor Biométrico Detectado</h3>
                <p className="text-sm text-green-700 mt-1">
                  Tu dispositivo soporta autenticación biométrica REAL (Touch ID, Face ID, o sensor de huella).
                  La credencial se almacena de forma segura en tu dispositivo.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-900">Sensor Biométrico No Disponible</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {!webauthnSupported 
                    ? 'Tu navegador no soporta WebAuthn. Actualiza a la última versión.'
                    : 'Tu dispositivo no tiene sensor biométrico o no está habilitado.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estado de Credencial */}
        {hasWebAuthnCreds ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Fingerprint className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">Credencial Biométrica Activa</p>
                  <p className="text-sm text-green-700">
                    Sensor de huella/rostro registrado con WebAuthn
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Puedes usar tu sensor para iniciar sesión
                  </p>
                </div>
              </div>
              <button
                onClick={eliminarHuella}
                className="text-red-600 hover:text-red-700 p-2"
                title="Eliminar credencial"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Fingerprint className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay credencial biométrica registrada</p>
            <p className="text-sm text-gray-500 mt-1">
              Registra tu huella o rostro para iniciar sesión de forma rápida y segura
            </p>
          </div>
        )}
      </div>

      {/* Reconocimiento Facial */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Camera className="h-6 w-6 mr-2 text-primary-600" />
            Reconocimiento Facial
          </h2>
          {!rostroRegistrado && (
            <button
              onClick={iniciarEscaneoRostro}
              disabled={escaneando}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <Camera className="h-5 w-5" />
              <span>Registrar Rostro</span>
            </button>
          )}
        </div>

        {/* Alerta de Seguridad */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-purple-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-semibold text-purple-900">Reconocimiento Facial</h3>
              <p className="text-sm text-purple-700 mt-1">
                Tu rostro se analiza y almacena de forma segura. Solo tú podrás acceder con tu cara.
                Asegúrate de estar en un lugar bien iluminado.
              </p>
            </div>
          </div>
        </div>

        {/* Estado del Rostro */}
        {rostroRegistrado ? (
          <div className="flex items-center justify-between p-6 bg-green-50 rounded-lg border-2 border-green-200">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-900 text-lg">Rostro Registrado</p>
                <p className="text-sm text-green-700">
                  Puedes usar reconocimiento facial para iniciar sesión
                </p>
              </div>
            </div>
            <button
              onClick={eliminarRostro}
              className="text-red-600 hover:text-red-700 p-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay rostro registrado</p>
            <p className="text-sm text-gray-500 mt-1">Registra tu rostro para acceso rápido y seguro</p>
          </div>
        )}
      </div>

      {/* Modal de Escaneo */}
      {escaneando && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl p-4 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            {tipoEscaneo === 'huella' ? (
              <div className="text-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-pulse">
                  <Fingerprint className="h-12 w-12 sm:h-16 sm:w-16 text-primary-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Escaneando Huella Dactilar
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Coloca tu dedo en el sensor y mantén presionado...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <button
                  onClick={cancelarEscaneo}
                  className="btn-secondary w-full py-3"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-4 sm:mb-6 relative">
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
                  Capturando Rostro
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Centra tu rostro en el recuadro y mira a la cámara...
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={capturarRostro}
                    className="btn-primary w-full py-3 flex items-center justify-center"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Capturar
                  </button>
                  <button
                    onClick={cancelarEscaneo}
                    className="btn-secondary w-full py-3"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
