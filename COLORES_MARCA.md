# 🎨 Colores de Marca - Anthony Sistem

## 📘 Paleta de Colores Principal

### **Azul Primary (Color Principal)**
Usado para: Logo, títulos, botones principales, enlaces

```css
primary-50:  #eff6ff  (Fondo muy claro)
primary-100: #dbeafe  (Fondo claro)
primary-200: #bfdbfe  (Bordes suaves)
primary-300: #93c5fd  (Hover suave)
primary-400: #60a5fa  (Elementos secundarios)
primary-500: #3b82f6  (Color base)
primary-600: #2563eb  (Botones)
primary-700: #1d4ed8  (Logo, títulos principales) ⭐
primary-800: #1e40af  (Títulos oscuros) ⭐
primary-900: #1e3a8a  (Texto muy oscuro)
```

### **Rojo Accent (Color de Acento)**
Usado para: Alertas importantes, elementos destacados

```css
accent-50:  #fef2f2  (Fondo muy claro)
accent-100: #fee2e2  (Fondo claro)
accent-200: #fecaca  (Bordes suaves)
accent-300: #fca5a5  (Hover suave)
accent-400: #f87171  (Elementos secundarios)
accent-500: #ef4444  (Color base)
accent-600: #dc2626  (Alertas) ⭐
accent-700: #b91c1c  (Alertas importantes)
accent-800: #991b1b  (Texto de alerta)
accent-900: #7f1d1d  (Texto muy oscuro)
```

---

## 🎯 Uso de Colores por Elemento

### **Logo y Marca**
```
Icono:     primary-700 (#1d4ed8)
Título:    primary-800 (#1e40af)
Eslogan:   primary-600 (#2563eb)
```

### **Navegación**
```
Activo:    primary-600 (#2563eb)
Hover:     primary-700 (#1d4ed8)
Inactivo:  gray-600
```

### **Botones**
```
Primario:     bg-primary-600, hover:bg-primary-700
Secundario:   bg-gray-200, hover:bg-gray-300
Peligro:      bg-accent-600, hover:bg-accent-700
```

### **Títulos (h1, h2, h3)**
```
Color automático: primary-900 (#1e3a8a)
```

### **Textos**
```
Principal:    gray-900
Secundario:   gray-600
Terciario:    gray-500
Marca:        primary-700
Acento:       accent-600
```

### **Estados**
```
Éxito:    green-600
Advertencia: yellow-600
Error:    accent-600 (rojo)
Info:     primary-600 (azul)
```

---

## 📱 Aplicación en Componentes

### **Login**
- Fondo: `bg-gradient-to-br from-primary-50 to-primary-100`
- Logo círculo: `bg-primary-700`
- Título: `text-primary-800`
- Eslogan: `text-primary-600`

### **Header**
- Icono: `text-primary-700`
- Título: `text-primary-800`
- Eslogan: `text-primary-600`

### **Recibos**
- Borde: `border-primary-700`
- Logo círculo: `bg-primary-700`
- Título: `text-primary-800`
- Eslogan: `text-primary-600`

### **Notificaciones**
- Borde header: `border-primary-700`
- Logo círculo: `bg-primary-700`
- Título: `text-primary-800`
- Eslogan: `text-primary-600`

---

## 🎨 Ejemplos Visuales

### **Combinaciones Recomendadas**

#### **Título Principal**
```
Fondo: white
Texto: primary-800
Icono: primary-700
```

#### **Botón de Acción**
```
Fondo: primary-600
Texto: white
Hover: primary-700
```

#### **Alerta Importante**
```
Fondo: accent-50
Borde: accent-600
Texto: accent-800
```

#### **Tarjeta (Card)**
```
Fondo: white
Borde: gray-200
Título: primary-900
Texto: gray-600
```

---

## 🔧 Configuración Técnica

### **Tailwind Config**
Ubicación: `frontend/tailwind.config.js`

```javascript
colors: {
  primary: {
    // Azul - Color principal de la marca
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  accent: {
    // Rojo - Color de acento
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  }
}
```

### **CSS Global**
Ubicación: `frontend/src/index.css`

```css
h1, h2, h3 {
  @apply text-primary-900;
}

.brand-text {
  @apply text-primary-700 font-bold;
}

.brand-accent {
  @apply text-accent-600;
}
```

---

## ✅ Checklist de Consistencia

- ✅ Logo usa `primary-700`
- ✅ Títulos principales usan `primary-800`
- ✅ Eslogan usa `primary-600`
- ✅ Botones principales usan `primary-600`
- ✅ Alertas importantes usan `accent-600`
- ✅ Todos los h1, h2, h3 son `primary-900`
- ✅ Navegación activa usa `primary-600`
- ✅ Fondos de login usan gradiente `primary-50` a `primary-100`

---

## 🎯 Identidad de Marca

### **Anthony Sistem**
```
Nombre:   Anthony Sistem
Eslogan:  Convertimos tus ideas en soluciones tecnológicas
Colores:  Azul (#1d4ed8) + Rojo (#dc2626)
Fuente:   System fonts (sans-serif)
Estilo:   Moderno, profesional, tecnológico
```

### **Valores Visuales**
- **Azul**: Confianza, tecnología, profesionalismo
- **Rojo**: Acción, urgencia, importancia
- **Blanco**: Limpieza, claridad, simplicidad
- **Gris**: Balance, neutralidad, elegancia

---

**Última actualización:** 2025-01-07
**Versión:** 1.0
