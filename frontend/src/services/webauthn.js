/**
 * Servicio de WebAuthn para autenticación biométrica REAL
 * Soporta Touch ID, Face ID, y sensores de huella en Android
 */

import axios from 'axios'

// Funciones helper para conversión de datos
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * Verifica si el navegador soporta WebAuthn
 */
export function isWebAuthnSupported() {
  return window.PublicKeyCredential !== undefined &&
         navigator.credentials !== undefined
}

/**
 * Verifica si el dispositivo tiene autenticador de plataforma (Touch ID, Face ID, huella)
 */
export async function isPlatformAuthenticatorAvailable() {
  if (!isWebAuthnSupported()) {
    return false
  }
  
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch (error) {
    console.error('Error verificando autenticador:', error)
    return false
  }
}

/**
 * Registra una nueva credencial biométrica
 */
export async function registerBiometric(token) {
  try {
    // 1. Obtener opciones del servidor
    const response = await axios.post('/api/webauthn/register/begin', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const options = response.data
    
    // 2. Convertir challenge y user.id a ArrayBuffer
    options.challenge = base64ToArrayBuffer(options.challenge)
    options.user.id = base64ToArrayBuffer(options.user.id)
    
    // Convertir excludeCredentials si existen
    if (options.excludeCredentials) {
      options.excludeCredentials = options.excludeCredentials.map(cred => ({
        ...cred,
        id: base64ToArrayBuffer(cred.id)
      }))
    }
    
    // 3. Llamar a la API del navegador (AQUÍ SE USA EL SENSOR REAL)
    const credential = await navigator.credentials.create({
      publicKey: options
    })
    
    if (!credential) {
      throw new Error('No se pudo crear la credencial')
    }
    
    // 4. Preparar datos para enviar al servidor
    const credentialData = {
      id: credential.id,
      rawId: arrayBufferToBase64(credential.rawId),
      response: {
        clientDataJSON: arrayBufferToBase64(credential.response.clientDataJSON),
        attestationObject: arrayBufferToBase64(credential.response.attestationObject)
      },
      type: credential.type
    }
    
    // 5. Enviar credencial al servidor para verificación
    const verifyResponse = await axios.post('/api/webauthn/register/complete', credentialData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    return {
      success: true,
      message: verifyResponse.data.message
    }
    
  } catch (error) {
    console.error('Error al registrar biometría:', error)
    
    let message = 'Error al registrar credencial biométrica'
    
    if (error.name === 'NotAllowedError') {
      message = 'Permiso denegado. Por favor, permite el acceso al sensor biométrico.'
    } else if (error.name === 'NotSupportedError') {
      message = 'Tu dispositivo no soporta autenticación biométrica.'
    } else if (error.name === 'InvalidStateError') {
      message = 'Ya existe una credencial registrada para este dispositivo.'
    } else if (error.response) {
      message = error.response.data.detail || message
    }
    
    return {
      success: false,
      error: message
    }
  }
}

/**
 * Autentica con credencial biométrica
 */
export async function authenticateBiometric(username) {
  try {
    // 1. Obtener opciones del servidor
    const response = await axios.post(`/api/webauthn/auth/begin?username=${username}`)
    
    const options = response.data
    
    // 2. Convertir challenge y allowCredentials
    options.challenge = base64ToArrayBuffer(options.challenge)
    
    if (options.allowCredentials) {
      options.allowCredentials = options.allowCredentials.map(cred => ({
        ...cred,
        id: base64ToArrayBuffer(cred.id)
      }))
    }
    
    // 3. Llamar a la API del navegador (SENSOR REAL)
    const assertion = await navigator.credentials.get({
      publicKey: options
    })
    
    if (!assertion) {
      throw new Error('No se pudo obtener la credencial')
    }
    
    // 4. Preparar datos para enviar
    const assertionData = {
      id: assertion.id,
      rawId: arrayBufferToBase64(assertion.rawId),
      response: {
        clientDataJSON: arrayBufferToBase64(assertion.response.clientDataJSON),
        authenticatorData: arrayBufferToBase64(assertion.response.authenticatorData),
        signature: arrayBufferToBase64(assertion.response.signature),
        userHandle: assertion.response.userHandle ? 
                    arrayBufferToBase64(assertion.response.userHandle) : null
      },
      type: assertion.type
    }
    
    // 5. Enviar al servidor para verificación
    const verifyResponse = await axios.post(
      `/api/webauthn/auth/complete?username=${username}`,
      assertionData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    
    return {
      success: true,
      token: verifyResponse.data.access_token,
      tokenType: verifyResponse.data.token_type
    }
    
  } catch (error) {
    console.error('Error al autenticar con biometría:', error)
    
    let message = 'Error al autenticar con biometría'
    
    if (error.name === 'NotAllowedError') {
      message = 'Autenticación cancelada o permiso denegado.'
    } else if (error.name === 'NotSupportedError') {
      message = 'Tu dispositivo no soporta autenticación biométrica.'
    } else if (error.response) {
      message = error.response.data.detail || message
    }
    
    return {
      success: false,
      error: message
    }
  }
}

/**
 * Verifica si el usuario tiene credenciales registradas
 */
export async function hasCredentials(token) {
  try {
    const response = await axios.get('/api/webauthn/has-credentials', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    return response.data.has_credentials
  } catch (error) {
    console.error('Error al verificar credenciales:', error)
    return false
  }
}

/**
 * Elimina las credenciales biométricas del usuario
 */
export async function deleteCredentials(token) {
  try {
    await axios.delete('/api/webauthn/credentials', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    return {
      success: true,
      message: 'Credenciales eliminadas exitosamente'
    }
  } catch (error) {
    console.error('Error al eliminar credenciales:', error)
    
    return {
      success: false,
      error: error.response?.data?.detail || 'Error al eliminar credenciales'
    }
  }
}
