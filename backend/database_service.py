"""
Servicio de Base de Datos
Operaciones CRUD y lógica de negocio
"""
import sqlite3
from datetime import date, datetime, timedelta
from typing import List, Optional
import secrets
from config import settings

class DatabaseService:
    def __init__(self):
        self.db_path = settings.DATABASE_PATH
    
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def generate_license_key(self) -> str:
        return f"AS-{secrets.token_hex(8).upper()}"
    
    def create_cliente(self, cliente_data: dict) -> dict:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        licencia_key = self.generate_license_key()
        
        cursor.execute("""
            INSERT INTO clientes_renta 
            (nombre_empresa, contacto_nombre, telefono, email, cedula, plan, precio_mensual, fecha_inicio, licencia_key)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            cliente_data['nombre_empresa'],
            cliente_data['contacto_nombre'],
            cliente_data['telefono'],
            cliente_data.get('email'),
            cliente_data.get('cedula'),
            cliente_data['plan'],
            cliente_data['precio_mensual'],
            cliente_data['fecha_inicio'],
            licencia_key
        ))
        
        cliente_id = cursor.lastrowid
        fecha_exp = datetime.strptime(cliente_data['fecha_inicio'], '%Y-%m-%d').date() + timedelta(days=30)
        
        cursor.execute("""
            INSERT INTO licencias 
            (cliente_renta_id, licencia_key, fecha_activacion, fecha_expiracion, estado)
            VALUES (?, ?, ?, ?, 'Activa')
        """, (cliente_id, licencia_key, cliente_data['fecha_inicio'], fecha_exp))
        
        cursor.execute("""
            INSERT INTO pagos_renta 
            (cliente_renta_id, monto, fecha_pago, fecha_vencimiento, estado)
            VALUES (?, ?, ?, ?, 'Pendiente')
        """, (cliente_id, cliente_data['precio_mensual'], cliente_data['fecha_inicio'], fecha_exp))
        
        conn.commit()
        cursor.execute("SELECT * FROM clientes_renta WHERE id = ?", (cliente_id,))
        cliente = dict(cursor.fetchone())
        conn.close()
        return cliente
    
    def get_clientes(self, estado: Optional[str] = None) -> List[dict]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT c.*, 
                   (SELECT fecha_vencimiento FROM pagos_renta 
                    WHERE cliente_renta_id = c.id AND estado = 'Pendiente' 
                    ORDER BY fecha_vencimiento ASC LIMIT 1) as proximo_pago
            FROM clientes_renta c
        """
        
        if estado:
            query += " WHERE c.estado = ?"
            cursor.execute(query + " ORDER BY c.nombre_empresa", (estado,))
        else:
            cursor.execute(query + " ORDER BY c.nombre_empresa")
        
        clientes = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        today = date.today()
        for cliente in clientes:
            if cliente['proximo_pago']:
                proximo = datetime.strptime(cliente['proximo_pago'], '%Y-%m-%d').date()
                cliente['dias_hasta_vencimiento'] = (proximo - today).days
            else:
                cliente['dias_hasta_vencimiento'] = None
        
        return clientes
    
    def get_cliente(self, cliente_id: int) -> Optional[dict]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT c.*, 
                   (SELECT fecha_vencimiento FROM pagos_renta 
                    WHERE cliente_renta_id = c.id AND estado = 'Pendiente' 
                    ORDER BY fecha_vencimiento ASC LIMIT 1) as proximo_pago
            FROM clientes_renta c WHERE c.id = ?
        """, (cliente_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            cliente = dict(row)
            if cliente['proximo_pago']:
                proximo = datetime.strptime(cliente['proximo_pago'], '%Y-%m-%d').date()
                cliente['dias_hasta_vencimiento'] = (proximo - date.today()).days
            return cliente
        return None
    
    def update_cliente(self, cliente_id: int, update_data: dict) -> Optional[dict]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        fields = []
        values = []
        for key, value in update_data.items():
            if value is not None:
                fields.append(f"{key} = ?")
                values.append(value)
        
        if not fields:
            return self.get_cliente(cliente_id)
        
        values.append(cliente_id)
        query = f"UPDATE clientes_renta SET {', '.join(fields)}, ultima_modificacion = CURRENT_TIMESTAMP WHERE id = ?"
        
        cursor.execute(query, values)
        conn.commit()
        conn.close()
        
        return self.get_cliente(cliente_id)
    
    def create_pago(self, pago_data: dict, username: str) -> dict:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO pagos_renta 
            (cliente_renta_id, monto, fecha_pago, fecha_vencimiento, metodo_pago, referencia, estado, notas, registrado_por)
            VALUES (?, ?, ?, ?, ?, ?, 'Pagado', ?, ?)
        """, (
            pago_data['cliente_renta_id'], pago_data['monto'],
            pago_data['fecha_pago'], pago_data['fecha_vencimiento'],
            pago_data.get('metodo_pago'), pago_data.get('referencia'),
            pago_data.get('notas'), username
        ))
        
        pago_id = cursor.lastrowid
        
        cursor.execute("""
            UPDATE pagos_renta SET estado = 'Pagado' 
            WHERE cliente_renta_id = ? AND estado = 'Pendiente' AND fecha_vencimiento <= ?
        """, (pago_data['cliente_renta_id'], pago_data['fecha_pago']))
        
        fecha_siguiente = datetime.strptime(pago_data['fecha_vencimiento'], '%Y-%m-%d').date() + timedelta(days=30)
        cursor.execute("""
            INSERT INTO pagos_renta 
            (cliente_renta_id, monto, fecha_pago, fecha_vencimiento, estado)
            VALUES (?, ?, ?, ?, 'Pendiente')
        """, (pago_data['cliente_renta_id'], pago_data['monto'], fecha_siguiente, fecha_siguiente))
        
        cursor.execute("""
            UPDATE licencias SET fecha_expiracion = ?, estado = 'Activa'
            WHERE cliente_renta_id = ?
        """, (fecha_siguiente, pago_data['cliente_renta_id']))
        
        cursor.execute("""
            UPDATE clientes_renta SET estado = 'Activo'
            WHERE id = ? AND estado = 'Suspendido'
        """, (pago_data['cliente_renta_id'],))
        
        conn.commit()
        cursor.execute("SELECT * FROM pagos_renta WHERE id = ?", (pago_id,))
        pago = dict(cursor.fetchone())
        conn.close()
        return pago
    
    def get_pagos_cliente(self, cliente_id: int, limit: int = 6) -> List[dict]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM pagos_renta 
            WHERE cliente_renta_id = ? 
            ORDER BY fecha_vencimiento DESC LIMIT ?
        """, (cliente_id, limit))
        
        pagos = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return pagos
    
    def verify_license(self, licencia_key: str) -> dict:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT l.*, c.nombre_empresa, c.estado as cliente_estado
            FROM licencias l
            JOIN clientes_renta c ON l.cliente_renta_id = c.id
            WHERE l.licencia_key = ?
        """, (licencia_key,))
        
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return {"valid": False, "message": "Licencia no encontrada"}
        
        licencia = dict(row)
        
        cursor.execute("UPDATE licencias SET ultima_conexion = CURRENT_TIMESTAMP WHERE licencia_key = ?", (licencia_key,))
        conn.commit()
        conn.close()
        
        if licencia['cliente_estado'] == 'Suspendido':
            return {"valid": False, "message": "Licencia suspendida por falta de pago"}
        
        if licencia['estado'] == 'Expirada':
            return {"valid": False, "message": "Licencia expirada"}
        
        fecha_exp = datetime.strptime(licencia['fecha_expiracion'], '%Y-%m-%d').date()
        if fecha_exp < date.today():
            return {"valid": False, "message": "Licencia vencida"}
        
        return {
            "valid": True,
            "message": "Licencia activa",
            "empresa": licencia['nombre_empresa'],
            "expira": licencia['fecha_expiracion']
        }
    
    def suspend_license(self, cliente_id: int) -> bool:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("UPDATE licencias SET estado = 'Suspendida' WHERE cliente_renta_id = ?", (cliente_id,))
        cursor.execute("UPDATE clientes_renta SET estado = 'Suspendido' WHERE id = ?", (cliente_id,))
        
        conn.commit()
        conn.close()
        return True
    
    def get_dashboard_data(self) -> dict:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        mes_actual = date.today().replace(day=1)
        cursor.execute("""
            SELECT 
                SUM(CASE WHEN estado = 'Pagado' THEN monto ELSE 0 END) as cobrado,
                SUM(CASE WHEN estado = 'Pendiente' THEN monto ELSE 0 END) as pendiente
            FROM pagos_renta WHERE fecha_vencimiento >= ?
        """, (mes_actual,))
        
        resumen = cursor.fetchone()
        cobrado = resumen['cobrado'] or 0
        pendiente = resumen['pendiente'] or 0
        
        today = date.today()
        tres_dias = today + timedelta(days=3)
        
        cursor.execute("""
            SELECT COUNT(*) as total FROM clientes_renta WHERE estado = 'Activo'
        """)
        total_clientes = cursor.fetchone()['total']
        
        cursor.execute("""
            SELECT SUM(precio_mensual) as total FROM clientes_renta WHERE estado = 'Activo'
        """)
        ingresos_proyectados = cursor.fetchone()['total'] or 0
        
        conn.close()
        
        return {
            "resumen_mes": {
                "por_cobrar": cobrado + pendiente,
                "cobrado": cobrado,
                "pendiente": pendiente
            },
            "estado_clientes": {
                "al_dia": 0,
                "por_vencer": 0,
                "atrasados": 0
            },
            "total_clientes": total_clientes,
            "ingresos_proyectados": ingresos_proyectados
        }

db_service = DatabaseService()
