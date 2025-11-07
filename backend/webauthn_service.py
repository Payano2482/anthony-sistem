"""
Servicio de WebAuthn para autenticación biométrica real
Soporta Touch ID, Face ID, y sensores de huella en Android
"""

import json
import base64
from typing import Optional, Dict, Any
from webauthn import (
    generate_registration_options,
    verify_registration_response,
    generate_authentication_options,
    verify_authentication_response,
    options_to_json
)
from webauthn.helpers.structs import (
    PublicKeyCredentialDescriptor,
    UserVerificationRequirement,
    AuthenticatorSelectionCriteria,
    ResidentKeyRequirement,
    AuthenticatorAttachment
)
from webauthn.helpers.cose import COSEAlgorithmIdentifier

# Configuración del servidor
RP_ID = "localhost"  # Cambiar en producción
RP_NAME = "Anthony Sistem"
ORIGIN = "http://localhost:3000"  # Cambiar en producción

# Almacenamiento temporal de credenciales (en producción usar base de datos)
credentials_db = {}
challenges_db = {}


def generate_registration_challenge(user_id: str, username: str) -> Dict[str, Any]:
    """
    Genera un desafío para registrar una nueva credencial biométrica
    """
    try:
        options = generate_registration_options(
            rp_id=RP_ID,
            rp_name=RP_NAME,
            user_id=user_id.encode('utf-8'),
            user_name=username,
            user_display_name=username,
            authenticator_selection=AuthenticatorSelectionCriteria(
                authenticator_attachment=AuthenticatorAttachment.PLATFORM,
                resident_key=ResidentKeyRequirement.PREFERRED,
                user_verification=UserVerificationRequirement.PREFERRED
            ),
            supported_pub_key_algs=[
                COSEAlgorithmIdentifier.ECDSA_SHA_256,
                COSEAlgorithmIdentifier.RSASSA_PKCS1_v1_5_SHA_256,
            ],
        )
        
        # Guardar el challenge para verificación posterior
        challenge_str = base64.b64encode(options.challenge).decode('utf-8')
        challenges_db[user_id] = challenge_str
        
        # Convertir a JSON serializable
        options_json = options_to_json(options)
        
        return {
            "success": True,
            "options": json.loads(options_json)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def verify_registration(user_id: str, credential: Dict[str, Any]) -> Dict[str, Any]:
    """
    Verifica y guarda una credencial biométrica registrada
    """
    try:
        # Obtener el challenge guardado
        challenge = challenges_db.get(user_id)
        if not challenge:
            return {
                "success": False,
                "error": "Challenge no encontrado"
            }
        
        # Verificar la respuesta
        verification = verify_registration_response(
            credential=credential,
            expected_challenge=base64.b64decode(challenge),
            expected_origin=ORIGIN,
            expected_rp_id=RP_ID,
        )
        
        # Guardar la credencial
        credential_id = base64.b64encode(verification.credential_id).decode('utf-8')
        credentials_db[user_id] = {
            "credential_id": credential_id,
            "public_key": base64.b64encode(verification.credential_public_key).decode('utf-8'),
            "sign_count": verification.sign_count,
            "aaguid": verification.aaguid
        }
        
        # Limpiar el challenge
        del challenges_db[user_id]
        
        return {
            "success": True,
            "credential_id": credential_id
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def generate_authentication_challenge(user_id: str) -> Dict[str, Any]:
    """
    Genera un desafío para autenticación biométrica
    """
    try:
        # Verificar si el usuario tiene credenciales
        user_credential = credentials_db.get(user_id)
        if not user_credential:
            return {
                "success": False,
                "error": "No hay credenciales registradas"
            }
        
        # Crear descriptor de credencial
        credential_id = base64.b64decode(user_credential["credential_id"])
        allow_credentials = [
            PublicKeyCredentialDescriptor(id=credential_id)
        ]
        
        options = generate_authentication_options(
            rp_id=RP_ID,
            allow_credentials=allow_credentials,
            user_verification=UserVerificationRequirement.PREFERRED
        )
        
        # Guardar el challenge
        challenge_str = base64.b64encode(options.challenge).decode('utf-8')
        challenges_db[f"auth_{user_id}"] = challenge_str
        
        # Convertir a JSON
        options_json = options_to_json(options)
        
        return {
            "success": True,
            "options": json.loads(options_json)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def verify_authentication(user_id: str, credential: Dict[str, Any]) -> Dict[str, Any]:
    """
    Verifica una autenticación biométrica
    """
    try:
        # Obtener el challenge guardado
        challenge = challenges_db.get(f"auth_{user_id}")
        if not challenge:
            return {
                "success": False,
                "error": "Challenge no encontrado"
            }
        
        # Obtener la credencial guardada
        user_credential = credentials_db.get(user_id)
        if not user_credential:
            return {
                "success": False,
                "error": "Credencial no encontrada"
            }
        
        # Verificar la autenticación
        verification = verify_authentication_response(
            credential=credential,
            expected_challenge=base64.b64decode(challenge),
            expected_origin=ORIGIN,
            expected_rp_id=RP_ID,
            credential_public_key=base64.b64decode(user_credential["public_key"]),
            credential_current_sign_count=user_credential["sign_count"]
        )
        
        # Actualizar el contador de firmas
        credentials_db[user_id]["sign_count"] = verification.new_sign_count
        
        # Limpiar el challenge
        del challenges_db[f"auth_{user_id}"]
        
        return {
            "success": True,
            "verified": True
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def has_credentials(user_id: str) -> bool:
    """
    Verifica si un usuario tiene credenciales biométricas registradas
    """
    return user_id in credentials_db


def delete_credentials(user_id: str) -> bool:
    """
    Elimina las credenciales biométricas de un usuario
    """
    if user_id in credentials_db:
        del credentials_db[user_id]
        return True
    return False
