import { useRef } from 'react'
import html2canvas from 'html2canvas'
import { Download, Share2, X } from 'lucide-react'
import { format } from 'date-fns'

export default function ReciboImagen({ pago, cliente, onClose }) {
  const reciboRef = useRef(null)

  const generarImagen = async () => {
    if (!reciboRef.current) return

    try {
      const canvas = await html2canvas(reciboRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      })

      // Convertir a blob
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `recibo-${cliente.nombre_empresa}-${pago.fecha_pago}.png`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      })
    } catch (error) {
      console.error('Error al generar imagen:', error)
      alert('Error al generar el recibo')
    }
  }

  const compartir = async () => {
    if (!reciboRef.current) return

    try {
      const canvas = await html2canvas(reciboRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      })

      canvas.toBlob(async (blob) => {
        const file = new File([blob], `recibo-${cliente.nombre_empresa}.png`, { type: 'image/png' })
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Recibo de Pago',
            text: `Recibo de pago - ${cliente.nombre_empresa}`
          })
        } else {
          // Fallback: descargar
          generarImagen()
        }
      })
    } catch (error) {
      console.error('Error al compartir:', error)
      alert('No se pudo compartir. Se descargará el recibo.')
      generarImagen()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Recibo de Pago</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Recibo */}
        <div className="p-6">
          <div ref={reciboRef} className="bg-white p-8 border-4 border-primary-600 rounded-lg">
            {/* Header del Recibo */}
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
              <p className="text-sm text-gray-500 mt-2">RNC: 000-0000000-0</p>
            </div>

            {/* Título */}
            <div className="text-center mb-8">
              <div className="inline-block bg-green-100 border-2 border-green-600 rounded-lg px-6 py-3">
                <h2 className="text-2xl font-bold text-green-800">RECIBO DE PAGO</h2>
              </div>
              <p className="text-gray-600 mt-2">No. {String(pago.id).padStart(6, '0')}</p>
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
                  <p className="text-sm text-gray-600">Teléfono:</p>
                  <p className="font-semibold text-gray-900">{cliente.telefono}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plan:</p>
                  <p className="font-semibold text-gray-900">{cliente.plan}</p>
                </div>
              </div>
            </div>

            {/* Detalles del Pago */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                DETALLES DEL PAGO
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha de Pago:</span>
                  <span className="font-semibold text-gray-900">
                    {format(new Date(pago.fecha_pago), 'dd/MM/yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Método de Pago:</span>
                  <span className="font-semibold text-gray-900">{pago.metodo_pago || 'N/A'}</span>
                </div>
                {pago.referencia && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Referencia:</span>
                    <span className="font-semibold text-gray-900">{pago.referencia}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Período:</span>
                  <span className="font-semibold text-gray-900">
                    {format(new Date(pago.fecha_vencimiento), 'MMMM yyyy')}
                  </span>
                </div>
              </div>
            </div>

            {/* Monto Total */}
            <div className="bg-primary-50 border-2 border-primary-600 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-gray-900">MONTO PAGADO:</span>
                <span className="text-4xl font-bold text-primary-600">
                  ${pago.monto.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Notas */}
            {pago.notas && (
              <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Notas:</p>
                <p className="text-gray-900">{pago.notas}</p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t-2 border-gray-300 pt-6 mt-6">
              <div className="text-center text-sm text-gray-600">
                <p className="mb-2">✅ Pago recibido y procesado exitosamente</p>
                <p className="mb-2">Próximo vencimiento: {format(new Date(pago.fecha_vencimiento), 'dd/MM/yyyy')}</p>
                <p className="text-xs text-gray-500 mt-4">
                  Este recibo es válido como comprobante de pago
                </p>
                <p className="text-xs text-gray-500">
                  Generado el {format(new Date(), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            </div>

            {/* Firma */}
            <div className="mt-8 pt-6 border-t border-gray-300">
              <div className="flex justify-between items-end">
                <div className="text-center">
                  <div className="border-t-2 border-gray-400 w-48 mb-2"></div>
                  <p className="text-sm text-gray-600">Firma Autorizada</p>
                  <p className="text-xs text-gray-500">Anthony System</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Licencia: {cliente.licencia_key}</p>
                </div>
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
