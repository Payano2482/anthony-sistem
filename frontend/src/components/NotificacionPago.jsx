import { useRef } from 'react'
import html2canvas from 'html2canvas'
import { Download, Share2, X } from 'lucide-react'
import { format } from 'date-fns'

export default function NotificacionPago({ cliente, onClose }) {
  const notificacionRef = useRef(null)

  const generarImagen = async () => {
    if (!notificacionRef.current) return

    try {
      const canvas = await html2canvas(notificacionRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      })

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `notificacion-pago-${cliente.nombre_empresa}-${format(new Date(), 'yyyy-MM-dd')}.png`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      })
    } catch (error) {
      console.error('Error al generar imagen:', error)
      alert('Error al generar la notificación')
    }
  }

  const compartir = async () => {
    if (!notificacionRef.current) return

    try {
      const canvas = await html2canvas(notificacionRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      })

      canvas.toBlob(async (blob) => {
        const file = new File([blob], `notificacion-pago-${cliente.nombre_empresa}.png`, { type: 'image/png' })
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Notificación de Pago',
            text: `Recordatorio de pago - ${cliente.nombre_empresa}`
          })
        } else {
          generarImagen()
        }
      })
    } catch (error) {
      console.error('Error al compartir:', error)
      generarImagen()
    }
  }

  // Calcular próximo vencimiento (30 días desde fecha_inicio)
  const calcularProximoVencimiento = () => {
    const fechaInicio = new Date(cliente.fecha_inicio)
    const hoy = new Date()
    const diasDesdeInicio = Math.floor((hoy - fechaInicio) / (1000 * 60 * 60 * 24))
    const mesesCompletos = Math.floor(diasDesdeInicio / 30)
    const proximoVencimiento = new Date(fechaInicio)
    proximoVencimiento.setDate(proximoVencimiento.getDate() + ((mesesCompletos + 1) * 30))
    return proximoVencimiento
  }

  const proximoVencimiento = calcularProximoVencimiento()
  const diasRestantes = Math.ceil((proximoVencimiento - new Date()) / (1000 * 60 * 60 * 24))
  const estaVencido = diasRestantes < 0
  const estaProximo = diasRestantes <= 3 && diasRestantes >= 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Notificación de Pago</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Notificación */}
        <div className="p-6">
          <div ref={notificacionRef} className="bg-white p-8 border-4 border-orange-500 rounded-lg">
            {/* Header */}
            <div className="text-center border-b-2 border-primary-700 pb-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-primary-700 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">AS</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                <span className="text-accent-600">Anthony</span>{' '}
                <span className="text-primary-800">Sistem</span>
              </h1>
              <p className="text-lg text-primary-600">Convertimos tus ideas en soluciones tecnológicas</p>
            </div>

            {/* Alerta */}
            <div className={`text-center mb-8 p-6 rounded-lg ${
              estaVencido ? 'bg-red-100 border-2 border-red-600' : 
              estaProximo ? 'bg-yellow-100 border-2 border-yellow-600' : 
              'bg-blue-100 border-2 border-blue-600'
            }`}>
              <h2 className={`text-3xl font-bold mb-2 ${
                estaVencido ? 'text-red-800' : 
                estaProximo ? 'text-yellow-800' : 
                'text-blue-800'
              }`}>
                {estaVencido ? '⚠️ PAGO VENCIDO' : 
                 estaProximo ? '⏰ PAGO PRÓXIMO A VENCER' : 
                 '📢 RECORDATORIO DE PAGO'}
              </h2>
              <p className="text-lg text-gray-700">
                {estaVencido ? `Vencido hace ${Math.abs(diasRestantes)} días` :
                 estaProximo ? `Vence en ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}` :
                 'Próximo pago pendiente'}
              </p>
            </div>

            {/* Información del Cliente */}
            <div className="mb-6 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                INFORMACIÓN DEL CLIENTE
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Empresa:</p>
                  <p className="font-semibold text-gray-900">{cliente.nombre_empresa}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contacto:</p>
                  <p className="font-semibold text-gray-900">{cliente.contacto_nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plan:</p>
                  <p className="font-semibold text-gray-900">{cliente.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monto Mensual:</p>
                  <p className="font-semibold text-gray-900 text-xl">${cliente.precio_mensual}</p>
                </div>
              </div>
            </div>

            {/* Monto a Pagar */}
            <div className="bg-orange-50 border-2 border-orange-600 rounded-lg p-6 mb-6">
              <div className="text-center">
                <p className="text-lg text-gray-700 mb-2">MONTO A PAGAR</p>
                <p className="text-5xl font-bold text-orange-600">
                  ${cliente.precio_mensual}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Fecha límite: {format(proximoVencimiento, 'dd/MM/yyyy')}
                </p>
              </div>
            </div>

            {/* Cuentas Bancarias */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                💳 DEPOSITA EN CUALQUIERA DE ESTAS CUENTAS
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BHD León */}
                <div className="bg-white border-2 border-red-500 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-3">
                    <div className="bg-red-600 text-white font-bold text-xl px-4 py-2 rounded">
                      BHD LEÓN
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Cuenta de Ahorro</p>
                    <p className="text-2xl font-bold text-gray-900 tracking-wider">
                      06584350073
                    </p>
                    <p className="text-sm text-gray-700 mt-2 font-medium">
                      Antonio Payano
                    </p>
                  </div>
                </div>

                {/* Banreservas */}
                <div className="bg-white border-2 border-blue-600 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-3">
                    <div className="bg-blue-600 text-white font-bold text-xl px-4 py-2 rounded">
                      BANRESERVAS
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Cuenta de Ahorro</p>
                    <p className="text-2xl font-bold text-gray-900 tracking-wider">
                      9608461925
                    </p>
                    <p className="text-sm text-gray-700 mt-2 font-medium">
                      Antonio Payano
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instrucciones */}
            <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-800 mb-2">📱 DESPUÉS DE DEPOSITAR:</h4>
              <ol className="text-sm text-green-900 space-y-1 ml-4">
                <li>1. Toma foto del comprobante de depósito</li>
                <li>2. Envíalo por WhatsApp</li>
                <li>3. Tu servicio será renovado inmediatamente</li>
              </ol>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-300 pt-6 mt-6">
              <div className="text-center text-sm text-gray-600">
                <p className="mb-2">
                  ⚠️ {estaVencido ? 'Tu servicio está suspendido por falta de pago' :
                       estaProximo ? 'Tu servicio se suspenderá si no pagas a tiempo' :
                       'Mantén tu servicio activo pagando a tiempo'}
                </p>
                <p className="text-xs text-gray-500 mt-4">
                  Generado el {format(new Date(), 'dd/MM/yyyy HH:mm')}
                </p>
                <p className="text-xs text-gray-500">
                  Anthony System - Gestión de Rentas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-4">
          <button
            onClick={generarImagen}
            className="flex-1 btn-secondary flex items-center justify-center space-x-2"
          >
            <Download className="h-5 w-5" />
            <span>Descargar</span>
          </button>
          <button
            onClick={compartir}
            className="flex-1 btn-primary flex items-center justify-center space-x-2"
          >
            <Share2 className="h-5 w-5" />
            <span>Compartir</span>
          </button>
        </div>
      </div>
    </div>
  )
}
