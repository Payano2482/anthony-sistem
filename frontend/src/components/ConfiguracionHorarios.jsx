import { useState } from 'react'
import { Clock, Sun, Moon, Calendar, Save, AlertTriangle } from 'lucide-react'

export default function ConfiguracionHorarios() {
  const [horarios, setHorarios] = useState({
    lunes: { activo: true, inicio: '08:00', fin: '18:00' },
    martes: { activo: true, inicio: '08:00', fin: '18:00' },
    miercoles: { activo: true, inicio: '08:00', fin: '18:00' },
    jueves: { activo: true, inicio: '08:00', fin: '18:00' },
    viernes: { activo: true, inicio: '08:00', fin: '18:00' },
    sabado: { activo: false, inicio: '08:00', fin: '13:00' },
    domingo: { activo: false, inicio: '00:00', fin: '00:00' }
  })

  const [restricciones, setRestricciones] = useState({
    bloquearFueraHorario: true,
    permitirEmergencias: true,
    notificarBloqueo: true,
    horarioNocturno: false
  })

  const dias = [
    { key: 'lunes', nombre: 'Lunes' },
    { key: 'martes', nombre: 'Martes' },
    { key: 'miercoles', nombre: 'Miércoles' },
    { key: 'jueves', nombre: 'Jueves' },
    { key: 'viernes', nombre: 'Viernes' },
    { key: 'sabado', nombre: 'Sábado' },
    { key: 'domingo', nombre: 'Domingo' }
  ]

  const actualizarHorario = (dia, campo, valor) => {
    setHorarios({
      ...horarios,
      [dia]: {
        ...horarios[dia],
        [campo]: valor
      }
    })
  }

  const guardarConfiguracion = () => {
    // Guardar en localStorage por ahora
    localStorage.setItem('horarios_sistema', JSON.stringify(horarios))
    localStorage.setItem('restricciones_sistema', JSON.stringify(restricciones))
    alert('✅ Configuración de horarios guardada exitosamente')
  }

  const verificarAccesoActual = () => {
    const ahora = new Date()
    const diaActual = ahora.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase()
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes()
    
    const horarioDia = horarios[diaActual]
    if (!horarioDia || !horarioDia.activo) {
      return { permitido: false, razon: 'Día no laborable' }
    }

    const [horaInicio, minInicio] = horarioDia.inicio.split(':').map(Number)
    const [horaFin, minFin] = horarioDia.fin.split(':').map(Number)
    const minutosInicio = horaInicio * 60 + minInicio
    const minutosFin = horaFin * 60 + minFin

    if (horaActual < minutosInicio) {
      return { permitido: false, razon: `Horario inicia a las ${horarioDia.inicio}` }
    }
    if (horaActual > minutosFin) {
      return { permitido: false, razon: `Horario terminó a las ${horarioDia.fin}` }
    }

    return { permitido: true, razon: 'Acceso permitido' }
  }

  const estadoAcceso = verificarAccesoActual()

  return (
    <div className="space-y-6">
      {/* Estado Actual */}
      <div className={`card ${estadoAcceso.permitido ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              estadoAcceso.permitido ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {estadoAcceso.permitido ? (
                <Sun className="h-8 w-8 text-green-600" />
              ) : (
                <Moon className="h-8 w-8 text-red-600" />
              )}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${
                estadoAcceso.permitido ? 'text-green-900' : 'text-red-900'
              }`}>
                {estadoAcceso.permitido ? '✅ Sistema Activo' : '🚫 Sistema Bloqueado'}
              </h3>
              <p className={`text-sm ${
                estadoAcceso.permitido ? 'text-green-700' : 'text-red-700'
              }`}>
                {estadoAcceso.razon}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Hora actual: {new Date().toLocaleTimeString('es-ES')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-semibold text-yellow-900">Restricción de Horarios</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Cuando el sistema está fuera de horario, no se podrá acceder a ninguna funcionalidad.
              Solo los administradores con permisos especiales pueden acceder en modo emergencia.
            </p>
          </div>
        </div>
      </div>

      {/* Configuración de Horarios */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Calendar className="h-6 w-6 mr-2 text-primary-600" />
          Horarios Laborables
        </h2>

        <div className="space-y-4">
          {dias.map(({ key, nombre }) => (
            <div key={key} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-32">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={horarios[key].activo}
                    onChange={(e) => actualizarHorario(key, 'activo', e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="font-medium text-gray-900">{nombre}</span>
                </label>
              </div>

              <div className="flex items-center space-x-2 flex-1">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Inicio</label>
                  <input
                    type="time"
                    value={horarios[key].inicio}
                    onChange={(e) => actualizarHorario(key, 'inicio', e.target.value)}
                    disabled={!horarios[key].activo}
                    className="input text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <span className="text-gray-400 mt-5">→</span>

                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Fin</label>
                  <input
                    type="time"
                    value={horarios[key].fin}
                    onChange={(e) => actualizarHorario(key, 'fin', e.target.value)}
                    disabled={!horarios[key].activo}
                    className="input text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600">
                {horarios[key].activo ? (
                  <span className="text-green-600 font-medium">Activo</span>
                ) : (
                  <span className="text-gray-400">Inactivo</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Restricciones Adicionales */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Clock className="h-6 w-6 mr-2 text-primary-600" />
          Restricciones y Permisos
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Bloquear Fuera de Horario</p>
              <p className="text-sm text-gray-600">Impedir acceso completamente fuera del horario configurado</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={restricciones.bloquearFueraHorario}
                onChange={(e) => setRestricciones({...restricciones, bloquearFueraHorario: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Permitir Acceso de Emergencia</p>
              <p className="text-sm text-gray-600">Administradores pueden acceder en caso de emergencia</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={restricciones.permitirEmergencias}
                onChange={(e) => setRestricciones({...restricciones, permitirEmergencias: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Notificar Intentos de Acceso Bloqueados</p>
              <p className="text-sm text-gray-600">Enviar alerta cuando alguien intente acceder fuera de horario</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={restricciones.notificarBloqueo}
                onChange={(e) => setRestricciones({...restricciones, notificarBloqueo: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Modo Horario Nocturno</p>
              <p className="text-sm text-gray-600">Permitir trabajo en horario nocturno (22:00 - 06:00)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={restricciones.horarioNocturno}
                onChange={(e) => setRestricciones({...restricciones, horarioNocturno: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <button
          onClick={guardarConfiguracion}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="h-5 w-5" />
          <span>Guardar Configuración</span>
        </button>
      </div>
    </div>
  )
}
