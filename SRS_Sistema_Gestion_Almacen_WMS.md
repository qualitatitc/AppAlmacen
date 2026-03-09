**DOCUMENTO DE ESPECIFICACIÓN**  
**DE REQUERIMIENTOS DE SOFTWARE**

**Sistema de Gestión de Almacén (WMS)**

| Versión: | 1.0 |
| :---- | :---- |
| **Fecha:** | 08/03/2026 |
| **Estado:** | Borrador |
| **Estándar:** | IEEE 830 |
| **Plataforma:** | Web (Supabase) |
| **Clasificación:** | Interno |

# **Tabla de Contenidos**

1\. INTRODUCCIÓN

   1.1. Propósito

   1.2. Alcance del Sistema

   1.3. Definiciones, Acrónimos y Abreviaturas

   1.4. Referencias

   1.5. Visión General del Documento

2\. DESCRIPCIÓN GENERAL

   2.1. Perspectiva del Producto

   2.2. Funciones del Producto

   2.3. Características de los Usuarios

   2.4. Restricciones Generales

   2.5. Suposiciones y Dependencias

3\. REQUERIMIENTOS FUNCIONALES

   3.1. Gestión de Inventario

   3.2. Control de Ubicaciones

   3.3. Gestión de Pedidos

   3.4. Generación de Reportes y KPIs

   3.5. Integración con Sistemas de Identificación

   3.6. Generación de Etiquetas

   3.7. Visualización 3D del Almacén

4\. REQUERIMIENTOS NO FUNCIONALES

   4.1. Seguridad

   4.2. Rendimiento

   4.3. Escalabilidad

   4.4. Usabilidad

   4.5. Compatibilidad

   4.6. Mantenibilidad

5\. REGLAS DE NEGOCIO

6\. CASOS DE USO PRINCIPALES

   6.1. Recepción y Ubicación de Mercancía

   6.2. Búsqueda y Localización de Piezas

   6.3. Gestión de Espacio Automática

7\. ANEXOS

# **1\. INTRODUCCIÓN**

## **1.1. Propósito**

El presente documento tiene como propósito establecer las especificaciones completas de los requerimientos de software para el Sistema de Gestión de Almacén (Warehouse Management System \- WMS). Este documento está dirigido a:

* Equipo de desarrollo: como guía técnica para la implementación del sistema  
* Gerencia operativa: para comprender el alcance y capacidades del sistema  
* Personal de almacén: como referencia de las funcionalidades disponibles  
* Equipo de control de calidad: para validar que el sistema cumple con los requisitos establecidos

## **1.2. Alcance del Sistema**

El Sistema de Gestión de Almacén (WMS) es una aplicación web moderna diseñada para optimizar la gestión integral de almacenes de piezas industriales. El sistema proporcionará:

* Localización exacta en tiempo real de cada pieza almacenada  
* Identificación única mediante códigos de barras, QR o RFID  
* Gestión óptima del espacio físico del almacén  
* Control de cantidades y stock por ubicación específica  
* Trazabilidad completa de movimientos de mercancía  
* Visualización gráfica 3D del almacén y ubicación de pallets  
* Generación automática de listados y reportes operativos  
* Interfaz moderna, intuitiva y responsive para acceso desde cualquier dispositivo

El sistema NO incluirá en su versión inicial: gestión de recursos humanos, facturación, contabilidad ni integración con sistemas ERP externos.

## **1.3. Definiciones, Acrónimos y Abreviaturas**

| Término | Definición |
| :---- | :---- |
| **WMS** | Warehouse Management System \- Sistema de Gestión de Almacén |
| **SKU** | Stock Keeping Unit \- Unidad de Mantenimiento de Stock |
| **FIFO** | First In, First Out \- Primero en Entrar, Primero en Salir |
| **Picking** | Proceso de selección y extracción de productos del almacén |
| **Packing** | Proceso de empaquetado de productos para su envío |
| **QR** | Quick Response \- Código de Respuesta Rápida |
| **RFID** | Radio Frequency Identification \- Identificación por Radiofrecuencia |
| **KPI** | Key Performance Indicator \- Indicador Clave de Rendimiento |
| **Pallet** | Plataforma de carga utilizada para almacenar y transportar mercancía |
| **API** | Application Programming Interface \- Interfaz de Programación de Aplicaciones |
| **UI/UX** | User Interface/User Experience \- Interfaz de Usuario/Experiencia de Usuario |
| **Supabase** | Plataforma de desarrollo que proporciona base de datos PostgreSQL y autenticación |
| **PostgreSQL** | Sistema de gestión de bases de datos relacional de código abierto |

## **1.4. Referencias**

* IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications  
* Documentación oficial de Supabase: https://supabase.com/docs  
* PostgreSQL Documentation: https://www.postgresql.org/docs/  
* Estándares de códigos de barras GS1  
* ISO 9001:2015 \- Sistemas de Gestión de Calidad

## **1.5. Visión General del Documento**

Este documento está estructurado según el estándar IEEE 830 y se organiza de la siguiente manera:

* Sección 1 (Introducción): Proporciona una visión general del documento y del sistema  
* Sección 2 (Descripción General): Describe los factores que afectan al producto y sus requisitos  
* Sección 3 (Requerimientos Funcionales): Detalla las funcionalidades específicas del sistema  
* Sección 4 (Requerimientos No Funcionales): Establece los requisitos de rendimiento, seguridad y calidad  
* Sección 5 (Reglas de Negocio): Define las políticas y restricciones operativas  
* Sección 6 (Casos de Uso): Ilustra escenarios de uso del sistema  
* Sección 7 (Anexos): Información complementaria y diagramas

# **2\. DESCRIPCIÓN GENERAL**

## **2.1. Perspectiva del Producto**

El WMS es un sistema independiente diseñado específicamente para la gestión de almacenes de piezas industriales. Está construido como una aplicación web moderna utilizando:

* Backend: Supabase (PostgreSQL \+ API REST automática \+ Autenticación)  
* Frontend: Framework web moderno con interfaz responsive  
* Visualización 3D: Motor gráfico para representación tridimensional del almacén  
* Integración hardware: Compatibilidad con lectores de códigos de barras, QR y RFID

El sistema opera de forma autónoma y no requiere integración obligatoria con otros sistemas empresariales, aunque está diseñado con APIs abiertas para futuras integraciones.

## **2.2. Funciones del Producto**

Las funciones principales del sistema incluyen:

* Gestión completa del inventario con control de entradas, salidas y ajustes  
* Sistema de ubicaciones jerárquico (almacén → pasillo → estantería → nivel → posición)  
* Asignación automática e inteligente de ubicaciones basada en disponibilidad y características del producto  
* Búsqueda y localización instantánea de piezas con múltiples criterios  
* Visualización 3D interactiva del almacén mostrando ocupación en tiempo real  
* Generación de reportes operativos y analíticos  
* Cálculo automático de KPIs de eficiencia del almacén  
* Gestión de pedidos con procesos de picking y packing  
* Trazabilidad completa de movimientos de mercancía  
* Generación e impresión de etiquetas con códigos de barras/QR  
* Auditorías de inventario con detección de discrepancias  
* Aplicación de reglas FIFO para rotación de stock  
* Gestión de usuarios con roles y permisos diferenciados

## **2.3. Características de los Usuarios**

| Tipo de Usuario | Nivel Técnico | Funciones Principales | Permisos |
| :---- | :---- | :---- | :---- |
| **Administrador** | Alto | Configuración del sistema, gestión de usuarios, auditorías completas | Lectura/Escritura Total |
| **Supervisor de Almacén** | Medio-Alto | Supervisión de operaciones, generación de reportes, resolución de incidencias | Lectura Total, Escritura Limitada |
| **Operador de Almacén** | Medio | Recepción, ubicación, picking, packing, movimientos de mercancía | Lectura/Escritura Operativa |
| **Inventarista** | Medio | Conteos de inventario, ajustes, auditorías | Lectura Total, Escritura de Ajustes |
| **Consultor** | Bajo-Medio | Consulta de disponibilidad, ubicaciones, reportes básicos | Solo Lectura |

## **2.4. Restricciones Generales**

* Arquitectura técnica: El sistema debe utilizar Supabase como plataforma de backend  
* Acceso: La aplicación debe ser accesible únicamente vía navegador web (responsive design)  
* Conectividad: Requiere conexión a Internet para funcionar (no disponible modo offline)  
* Navegadores soportados: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+  
* Idioma: Interfaz en español como idioma principal  
* Cumplimiento normativo: Debe cumplir con RGPD para protección de datos personales  
* Hardware de identificación: Compatible con lectores USB y Bluetooth estándar

## **2.5. Suposiciones y Dependencias**

Suposiciones:

* Los usuarios tienen conocimientos básicos de operaciones de almacén  
* El almacén cuenta con estructura física claramente identificada  
* Existe conexión a Internet estable en el almacén  
* Los productos pueden ser identificados de forma única  
* El personal cuenta con dispositivos para acceder al sistema (PC, tablets, smartphones)

Dependencias:

* Disponibilidad y rendimiento de la plataforma Supabase  
* Funcionamiento correcto de lectores de códigos de barras/QR/RFID  
* Calidad de la conexión a Internet  
* Navegadores web actualizados en dispositivos cliente  
* Estructura física del almacén previamente definida y configurada en el sistema

# **3\. REQUERIMIENTOS FUNCIONALES**

Esta sección describe detalladamente las funcionalidades que el sistema debe proporcionar. Cada requerimiento se identifica con un código único para su trazabilidad.

## **3.1. Gestión de Inventario**

### **RF-INV-001: Registro de Entrada de Mercancía**

Descripción: El sistema debe permitir registrar la entrada de mercancía al almacén.

Entradas:

* Código/SKU del producto  
* Descripción del producto  
* Cantidad recibida  
* Unidad de medida  
* Número de lote (opcional)  
* Fecha de fabricación/caducidad (opcional)  
* Proveedor  
* Documento de referencia (albarán, orden de compra)

Procesamiento:

* Validar que el producto existe en el catálogo o permitir crear uno nuevo  
* Generar número único de entrada  
* Asignar automáticamente ubicación temporal de recepción  
* Actualizar stock total del producto  
* Registrar timestamp y usuario que realiza la operación  
* Generar etiquetas de identificación si es necesario

Salidas:

* Confirmación de entrada registrada  
* Número de entrada generado  
* Etiquetas para identificación de pallets/productos  
* Actualización de stock en tiempo real

Prioridad: Alta

### **RF-INV-002: Registro de Salida de Mercancía**

Descripción: El sistema debe permitir registrar la salida de mercancía del almacén.

Entradas:

* Código/SKU del producto  
* Cantidad a extraer  
* Ubicación de origen  
* Motivo de salida (venta, transferencia, merma, etc.)  
* Documento de referencia (orden de venta, vale de salida)

Procesamiento:

* Verificar disponibilidad de stock en la ubicación especificada  
* Aplicar regla FIFO si aplica  
* Generar número único de salida  
* Actualizar stock del producto y liberar espacio en ubicación  
* Registrar timestamp y usuario  
* Validar que no se genere stock negativo

Salidas:

* Confirmación de salida registrada  
* Número de salida generado  
* Actualización de stock y ubicaciones  
* Documento de salida imprimible

Prioridad: Alta

### **RF-INV-003: Ajustes de Inventario**

Descripción: El sistema debe permitir realizar ajustes manuales de inventario.

Entradas:

* Producto y ubicación afectados  
* Cantidad registrada en sistema (automático)  
* Cantidad física real (conteo)  
* Motivo del ajuste  
* Observaciones  
* Autorización (para ajustes significativos)

Procesamiento:

* Calcular diferencia entre stock teórico y real  
* Registrar ajuste con trazabilidad completa  
* Actualizar stock a cantidad real  
* Generar alerta si la diferencia supera umbral configurado  
* Requerir autorización de supervisor para ajustes mayores

Prioridad: Alta

### **RF-INV-004: Transferencias entre Ubicaciones**

Descripción: El sistema debe permitir mover mercancía entre diferentes ubicaciones dentro del almacén sin modificar el stock total.

Funcionalidades:

* Seleccionar producto, cantidad, ubicación origen y destino  
* Validar disponibilidad en origen y espacio en destino  
* Actualizar cantidades en ambas ubicaciones  
* Registrar movimiento con trazabilidad  
* Permitir transferencias parciales  
* Sugerir ubicación destino óptima automáticamente

Prioridad: Media

### **RF-INV-005: Consulta de Stock**

Descripción: El sistema debe proporcionar consultas de stock en tiempo real.

Capacidades de búsqueda:

* Por código/SKU de producto  
* Por descripción (búsqueda parcial)  
* Por ubicación específica  
* Por rango de fechas de entrada  
* Por lote  
* Por proveedor  
* Filtros combinados

Información mostrada:

* Stock total del producto  
* Stock por ubicación  
* Ubicaciones donde se encuentra  
* Cantidad disponible vs. reservada  
* Fecha de última entrada/salida  
* Stock mínimo y punto de reorden  
* Visualización en mapa 3D

Prioridad: Alta

## **3.2. Control de Ubicaciones**

### **RF-UBI-001: Estructura Jerárquica de Ubicaciones**

Descripción: El sistema debe gestionar una estructura jerárquica de ubicaciones con múltiples niveles.

Niveles de jerarquía:

* Nivel 1: Almacén (puede haber múltiples almacenes)  
* Nivel 2: Zona/Área (ej: zona A, zona B)  
* Nivel 3: Pasillo (numeración o nomenclatura alfanumérica)  
* Nivel 4: Estantería/Rack  
* Nivel 5: Nivel/Altura (piso 1, piso 2, etc.)  
* Nivel 6: Posición/Columna (ubicación específica)

Código de ubicación: Formato estándar ALM-ZON-PAS-EST-NIV-POS (ej: A01-ZA-P01-E03-N02-C05)

Prioridad: Alta

### **RF-UBI-002: Configuración de Ubicaciones**

Descripción: El sistema debe permitir configurar las características de cada ubicación.

Atributos configurables:

* Código único de ubicación  
* Descripción  
* Tipo de ubicación (almacenaje, picking, recepción, expedición, cuarentena)  
* Dimensiones (largo, ancho, alto)  
* Capacidad máxima (peso y/o volumen)  
* Capacidad en pallets  
* Restricciones (temperatura, materiales peligrosos, etc.)  
* Estado (activa, inactiva, en mantenimiento)  
* Coordenadas 3D para visualización

Prioridad: Alta

### **RF-UBI-003: Asignación Automática de Ubicaciones**

Descripción: El sistema debe sugerir automáticamente la ubicación óptima para almacenar un producto basándose en criterios configurables.

Criterios de asignación:

* Disponibilidad de espacio suficiente  
* Proximidad a zonas de picking (para productos de alta rotación)  
* Compatibilidad con restricciones del producto  
* Balanceo de carga entre zonas  
* Minimización de distancias de traslado  
* Agrupación de productos similares  
* Aplicación de regla FIFO

El usuario puede aceptar la sugerencia o seleccionar manualmente otra ubicación.

Prioridad: Alta

### **RF-UBI-004: Gestión de Ocupación**

Descripción: El sistema debe controlar el nivel de ocupación de cada ubicación.

Funcionalidades:

* Calcular porcentaje de ocupación en tiempo real  
* Alertar cuando una ubicación alcanza su capacidad máxima  
* Prevenir asignaciones que excedan la capacidad  
* Mostrar mapa de calor de ocupación del almacén  
* Generar reportes de utilización de espacio  
* Identificar ubicaciones subutilizadas

Prioridad: Media

## **3.3. Gestión de Pedidos**

### **RF-PED-001: Creación de Pedidos de Salida**

Descripción: El sistema debe permitir crear pedidos de salida de mercancía.

Información del pedido:

* Número de pedido (manual o generado automáticamente)  
* Cliente/destino  
* Fecha de pedido y fecha de entrega requerida  
* Prioridad (normal, urgente)  
* Lista de productos con cantidades  
* Observaciones especiales  
* Estado (pendiente, en proceso, completado, cancelado)

Prioridad: Alta

### **RF-PED-002: Proceso de Picking**

Descripción: El sistema debe optimizar y guiar el proceso de recolección de productos.

Funcionalidades:

* Generar lista de picking ordenada por ubicaciones (ruta óptima)  
* Aplicar estrategias: picking por pedido, por lote, por zona  
* Mostrar ubicación exacta de cada producto en mapa 3D  
* Validar con escaneo de código de barras/QR  
* Registrar tiempo de picking por producto/pedido  
* Permitir picking parcial con registro de pendientes  
* Alertar sobre discrepancias entre cantidad solicitada y disponible  
* Aplicar automáticamente regla FIFO en selección de lotes

Prioridad: Alta

### **RF-PED-003: Proceso de Packing**

Descripción: El sistema debe facilitar el empaquetado de pedidos.

Funcionalidades:

* Verificar que todos los productos del pedido fueron recogidos  
* Sugerir tipo y tamaño de empaque  
* Registrar empaques utilizados  
* Generar etiqueta de envío  
* Registrar peso y dimensiones del paquete  
* Validar contenido mediante escaneo  
* Marcar pedido como listo para envío  
* Generar albarán de entrega

Prioridad: Media

### **RF-PED-004: Seguimiento de Pedidos**

Descripción: El sistema debe permitir rastrear el estado de los pedidos.

Información de seguimiento:

* Estado actual del pedido  
* Porcentaje de completitud  
* Productos pendientes de picking  
* Usuario asignado al pedido  
* Tiempos: creación, inicio picking, finalización, despacho  
* Historial de eventos del pedido  
* Alertas de retrasos respecto a fecha comprometida

Prioridad: Media

## **3.4. Generación de Reportes y KPIs**

### **RF-REP-001: Reporte de Stock Actual**

Descripción: Generar listado completo o filtrado del inventario actual.

Filtros disponibles:

* Por producto, categoría o familia  
* Por ubicación o zona  
* Por rango de fechas  
* Stock bajo mínimo  
* Stock sin movimiento (productos obsoletos)  
* Por proveedor

Formatos de salida: PDF, Excel, CSV

Prioridad: Alta

### **RF-REP-002: Reporte de Movimientos**

Descripción: Generar historial de movimientos de inventario.

Información incluida:

* Fecha y hora del movimiento  
* Tipo (entrada, salida, ajuste, transferencia)  
* Producto y cantidad  
* Ubicaciones (origen/destino)  
* Usuario que realizó el movimiento  
* Documento de referencia  
* Observaciones

Prioridad: Alta

### **RF-REP-003: Reporte de Rotación de Inventario**

Descripción: Analizar la velocidad de rotación de productos.

Métricas calculadas:

* Tasa de rotación (número de veces que se renueva el stock en un período)  
* Tiempo promedio de permanencia en almacén  
* Clasificación ABC de productos  
* Productos de alta, media y baja rotación  
* Productos sin movimiento en X días

Prioridad: Media

### **RF-REP-004: Dashboard de KPIs**

Descripción: Panel visual con indicadores clave de rendimiento.

KPIs incluidos:

* Nivel de ocupación del almacén (%)  
* Exactitud de inventario (%)  
* Tiempo promedio de picking por pedido  
* Pedidos completados vs. pendientes  
* Productos con stock bajo mínimo  
* Valor total del inventario  
* Movimientos del día/semana/mes  
* Eficiencia de uso de espacio  
* Tasa de error en picking  
* Cumplimiento de FIFO (%)

Visualización: Gráficos dinámicos, gauges, tablas interactivas

Actualización: Tiempo real

Prioridad: Media

### **RF-REP-005: Reporte de Auditoría**

Descripción: Generar reportes para auditorías de inventario.

Incluye:

* Comparación stock teórico vs. conteo físico  
* Discrepancias detectadas  
* Ajustes realizados  
* Historial de auditorías anteriores  
* Exactitud por producto/ubicación  
* Causas raíz de discrepancias

Prioridad: Media

## **3.5. Integración con Sistemas de Identificación**

### **RF-INT-001: Integración con Lectores de Códigos de Barras**

Descripción: El sistema debe soportar lectura de códigos de barras.

Funcionalidades:

* Captura de códigos mediante lectores USB o Bluetooth  
* Captura mediante cámara de dispositivos móviles  
* Soporte de formatos: EAN-13, EAN-8, Code 128, Code 39, UPC  
* Decodificación automática del código  
* Validación de formato y checksum  
* Búsqueda automática del producto en base de datos  
* Integración en todos los procesos (recepción, picking, auditoría, etc.)

Prioridad: Alta

### **RF-INT-002: Integración con Códigos QR**

Descripción: El sistema debe soportar lectura de códigos QR.

Capacidades:

* Lectura mediante cámara o lector dedicado  
* Generación de códigos QR con información extendida  
* Codificación de datos: SKU, lote, ubicación, fecha, cantidad  
* Decodificación automática  
* Uso en identificación de productos y ubicaciones

Prioridad: Media

### **RF-INT-003: Integración con RFID (Opcional)**

Descripción: El sistema debe ser compatible con tecnología RFID.

Funcionalidades:

* Lectura de etiquetas RFID pasivas  
* Lectura masiva (múltiples etiquetas simultáneas)  
* Asociación de tag RFID con producto/ubicación  
* Inventario rápido mediante portal RFID  
* Trazabilidad automática de movimientos

Prioridad: Baja (Fase futura)

## **3.6. Generación de Etiquetas**

### **RF-ETI-001: Diseño de Plantillas de Etiquetas**

Descripción: El sistema debe permitir diseñar plantillas de etiquetas personalizadas.

Elementos configurables:

* Código de barras o QR  
* Descripción del producto  
* SKU  
* Cantidad  
* Ubicación  
* Lote  
* Fecha de entrada/caducidad  
* Logo de empresa  
* Campos personalizados

Tamaños soportados: A4, etiquetas adhesivas estándar (40x30mm, 50x25mm, etc.)

Prioridad: Alta

### **RF-ETI-002: Impresión de Etiquetas**

Descripción: El sistema debe permitir imprimir etiquetas.

Funcionalidades:

* Impresión individual o en lote  
* Vista previa antes de imprimir  
* Selección de impresora (térmica, láser, inkjet)  
* Configuración de cantidad de copias  
* Generación de PDF para impresión posterior  
* Impresión automática tras recepción de mercancía

Prioridad: Alta

## **3.7. Visualización 3D del Almacén**

### **RF-3D-001: Representación Tridimensional del Almacén**

Descripción: El sistema debe generar una vista 3D interactiva del almacén.

Características:

* Modelo 3D navegable del almacén completo  
* Representación de estanterías, pasillos y zonas  
* Visualización de pallets/productos en sus ubicaciones  
* Código de colores por nivel de ocupación  
* Zoom, rotación y navegación libre  
* Vista de planta (2D superior) y vista perspectiva  
* Búsqueda visual de productos (resaltado en mapa)  
* Información emergente al seleccionar una ubicación  
* Filtros visuales (por producto, zona, estado)

Tecnología: WebGL o Three.js

Actualización: Tiempo real

Prioridad: Alta

### **RF-3D-002: Simulación de Rutas de Picking**

Descripción: Visualizar la ruta óptima de picking en el mapa 3D.

Funcionalidades:

* Trazar ruta visual entre ubicaciones de un pedido  
* Mostrar secuencia de picking  
* Calcular distancia total a recorrer  
* Permitir optimización de ruta con diferentes algoritmos  
* Mostrar ubicación actual del operador (si hay tracking)

Prioridad: Media

# **4\. REQUERIMIENTOS NO FUNCIONALES**

## **4.1. Seguridad**

### **RNF-SEG-001: Autenticación de Usuarios**

El sistema debe implementar autenticación segura mediante Supabase Auth.

Requisitos:

* Autenticación mediante email y contraseña  
* Políticas de contraseña robustas (mínimo 8 caracteres, mayúsculas, números, caracteres especiales)  
* Recuperación segura de contraseña mediante email  
* Autenticación multifactor (MFA) opcional  
* Bloqueo de cuenta tras múltiples intentos fallidos  
* Cierre de sesión automático por inactividad (configurable)

### **RNF-SEG-002: Autorización y Control de Acceso**

El sistema debe implementar control de acceso basado en roles (RBAC).

Requisitos:

* Definición de roles: Administrador, Supervisor, Operador, Inventarista, Consultor  
* Permisos granulares por módulo y funcionalidad  
* Restricción de acceso a datos según rol  
* Registro de auditoría de accesos y acciones de usuarios  
* Imposibilidad de elevar privilegios sin autorización

### **RNF-SEG-003: Protección de Datos**

El sistema debe proteger la información almacenada.

Medidas:

* Cifrado de datos en tránsito (TLS 1.3)  
* Cifrado de datos en reposo en Supabase  
* Cumplimiento con RGPD para datos personales  
* Anonimización de datos en reportes cuando sea aplicable  
* Políticas de retención de datos configurables  
* Copias de seguridad automáticas diarias  
* Plan de recuperación ante desastres

### **RNF-SEG-004: Auditoría**

El sistema debe registrar todas las operaciones críticas.

Eventos auditables:

* Inicio y cierre de sesión  
* Creación, modificación y eliminación de datos  
* Ajustes de inventario  
* Cambios de configuración  
* Acceso a reportes sensibles  
* Timestamp, usuario, IP y acción realizada

## **4.2. Rendimiento**

### **RNF-REN-001: Tiempo de Respuesta**

El sistema debe garantizar tiempos de respuesta aceptables.

Requisitos:

* Consultas simples (búsqueda de producto): \< 2 segundos  
* Operaciones de escritura (registrar entrada/salida): \< 3 segundos  
* Generación de reportes simples: \< 5 segundos  
* Generación de reportes complejos: \< 15 segundos  
* Carga de visualización 3D: \< 5 segundos  
* Actualización de dashboard en tiempo real: \< 1 segundo

Medición: percentil 95 bajo condiciones normales de carga

### **RNF-REN-002: Capacidad de Procesamiento**

El sistema debe soportar la carga operativa esperada.

Capacidades:

* Soporte para hasta 100,000 SKUs distintos  
* Gestión de hasta 500,000 ubicaciones  
* Registro de hasta 10,000 movimientos diarios  
* Hasta 50 usuarios concurrentes sin degradación  
* Generación de hasta 100 reportes simultáneos

## **4.3. Escalabilidad**

### **RNF-ESC-001: Escalabilidad Horizontal**

El sistema debe poder escalar para soportar crecimiento del negocio sin rediseño arquitectónico.

Requisitos:

* Arquitectura basada en Supabase que escala automáticamente  
* Diseño de base de datos optimizado con índices apropiados  
* Paginación en consultas que retornan grandes volúmenes de datos  
* Carga lazy de elementos en visualización 3D  
* Posibilidad de multi-tenancy para múltiples almacenes

## **4.4. Usabilidad**

### **RNF-USA-001: Interfaz Intuitiva**

La interfaz debe ser clara, moderna e intuitiva.

Principios de diseño:

* Diseño centrado en el usuario  
* Navegación simple y consistente  
* Terminología clara y específica del dominio  
* Retroalimentación visual inmediata de acciones  
* Manejo de errores amigable con mensajes claros  
* Ayuda contextual y tooltips  
* Shortcuts de teclado para operaciones frecuentes

### **RNF-USA-002: Accesibilidad**

El sistema debe cumplir con estándares de accesibilidad web.

Requisitos:

* Cumplimiento con WCAG 2.1 nivel AA  
* Navegación completa mediante teclado  
* Soporte para lectores de pantalla  
* Contraste de colores adecuado  
* Tamaño de fuentes ajustable  
* Textos alternativos en imágenes

### **RNF-USA-003: Capacitación Mínima**

Los usuarios deben poder utilizar las funciones básicas del sistema con capacitación mínima (\< 4 horas).

## **4.5. Compatibilidad**

### **RNF-COM-001: Responsive Design**

La interfaz debe adaptarse a diferentes tamaños de pantalla.

Dispositivos soportados:

* Computadoras de escritorio (1920x1080 y superiores)  
* Laptops (1366x768 mínimo)  
* Tablets (iPad, Android tablets)  
* Smartphones (iOS, Android) con pantalla mínima 5 pulgadas

### **RNF-COM-002: Navegadores Web**

Compatibilidad con navegadores modernos:

* Google Chrome 90 o superior  
* Mozilla Firefox 88 o superior  
* Apple Safari 14 o superior  
* Microsoft Edge 90 o superior

### **RNF-COM-003: Integración con Hardware**

Compatibilidad con dispositivos de identificación:

* Lectores de códigos de barras USB (HID)  
* Lectores Bluetooth  
* Cámaras integradas en dispositivos móviles  
* Impresoras térmicas de etiquetas (Zebra, Brother, etc.)  
* Lectores RFID (fase futura)

## **4.6. Mantenibilidad**

### **RNF-MAN-001: Código Mantenible**

El código debe seguir buenas prácticas de desarrollo.

Requisitos:

* Código modular y componentizado  
* Nomenclatura clara y consistente  
* Comentarios en código complejo  
* Documentación técnica actualizada  
* Control de versiones con Git  
* Pruebas unitarias y de integración  
* Análisis estático de código

### **RNF-MAN-002: Monitoreo**

El sistema debe incluir capacidades de monitoreo.

Aspectos monitoreados:

* Disponibilidad del sistema (uptime)  
* Tiempos de respuesta  
* Errores y excepciones  
* Uso de recursos (CPU, memoria, almacenamiento)  
* Número de usuarios activos  
* Operaciones ejecutadas por segundo

### **RNF-MAN-003: Disponibilidad**

El sistema debe garantizar alta disponibilidad.

Objetivo: 99.5% de uptime (equivalente a \~3.6 horas de downtime al mes)

Mantenimientos programados: ventanas de mantenimiento fuera de horario operativo

# **5\. REGLAS DE NEGOCIO**

Esta sección define las políticas y restricciones operativas que el sistema debe hacer cumplir automáticamente.

## **RN-001: Aplicación de FIFO (First In, First Out)**

Descripción: El sistema debe asegurar que los productos que ingresaron primero sean los primeros en salir, para minimizar obsolescencia y caducidad.

Implementación:

* Al crear un pedido de salida, el sistema debe sugerir automáticamente los lotes/pallets más antiguos  
* En el proceso de picking, ordenar las ubicaciones priorizando fechas de entrada más antiguas  
* Alertar al usuario si intenta seleccionar un lote más nuevo habiendo stock de lotes más antiguos  
* Generar reporte de cumplimiento de FIFO como KPI  
* Permitir override manual solo con autorización de supervisor (quedando registrado)

Excepciones: Productos sin fecha de caducidad pueden manejarse con mayor flexibilidad

## **RN-002: Validación de Stock Negativo**

Descripción: El sistema NO debe permitir que el stock de ningún producto en ninguna ubicación sea negativo.

Controles:

* Validar disponibilidad antes de confirmar cualquier salida  
* Bloquear salidas que excedan stock disponible  
* En transferencias, validar stock en ubicación origen  
* Mostrar advertencia clara si el usuario intenta una operación que generaría stock negativo

## **RN-003: Unicidad de Ubicaciones**

Descripción: Cada ubicación debe tener un código único e inequívoco en el sistema.

Regla: No pueden existir dos ubicaciones con el mismo código

Validación: Al crear o modificar ubicaciones, el sistema debe verificar que el código no esté duplicado

## **RN-004: Trazabilidad Completa**

Descripción: Todas las operaciones que modifiquen stock deben quedar registradas con trazabilidad completa.

Información obligatoria en cada registro:

* Timestamp exacto (fecha y hora)  
* Usuario que ejecuta la operación  
* Tipo de operación (entrada, salida, ajuste, transferencia)  
* Producto afectado  
* Cantidad  
* Ubicaciones involucradas  
* Documento de referencia (cuando aplique)  
* Observaciones

No se permite la eliminación de registros históricos, solo marcado como anulados

## **RN-005: Capacidad Máxima de Ubicaciones**

Descripción: El sistema debe prevenir la asignación de mercancía a ubicaciones que excedan su capacidad máxima configurada.

Validaciones:

* Calcular espacio ocupado actual \+ espacio requerido por nuevo producto  
* Comparar contra capacidad máxima de la ubicación  
* Bloquear asignación si se excede capacidad  
* Alertar al usuario y sugerir ubicaciones alternativas  
* Permitir override solo con autorización especial (quedando registrado)

## **RN-006: Productos con Lote Obligatorio**

Descripción: Ciertos productos deben tener obligatoriamente un número de lote asignado (especialmente productos perecederos o con trazabilidad regulatoria).

Configuración: Marcar productos que requieren lote obligatorio en el catálogo

Validación: El sistema debe exigir número de lote al registrar entrada de estos productos

## **RN-007: Stock de Seguridad**

Descripción: El sistema debe alertar cuando el stock de un producto cae por debajo del nivel mínimo configurado.

Comportamiento:

* Configurar stock mínimo y punto de reorden por producto  
* Generar alerta automática cuando stock \<= mínimo  
* Incluir productos con stock bajo en dashboard y reportes  
* Enviar notificaciones a usuarios autorizados  
* Sugerir cantidad de reorden automáticamente

## **RN-008: Restricciones por Tipo de Ubicación**

Descripción: Ciertas ubicaciones están reservadas para tipos específicos de mercancía.

Ejemplos:

* Zona de cuarentena: solo productos pendientes de inspección  
* Zona de productos peligrosos: solo materiales con clasificación de peligrosidad  
* Zona de temperatura controlada: solo productos que requieren refrigeración  
* Zona de picking: productos de alta rotación

Validación: El sistema debe verificar compatibilidad antes de asignar productos a ubicaciones con restricciones

## **RN-009: Autorización de Ajustes Significativos**

Descripción: Los ajustes de inventario que superen un umbral de diferencia porcentual o absoluta deben requerir autorización de un supervisor.

Parámetros configurables:

* Umbral de diferencia porcentual (ej: 10%)  
* Umbral de diferencia absoluta (ej: 100 unidades)  
* Umbral de valor monetario (ej: €1000)

Proceso: Si un ajuste supera umbral, el sistema debe requerir aprobación de un usuario con rol de Supervisor o superior antes de aplicarlo

## **RN-010: Integridad Referencial**

Descripción: El sistema debe mantener la integridad referencial de los datos.

Reglas:

* No se puede eliminar un producto que tenga stock en alguna ubicación  
* No se puede eliminar una ubicación que contenga mercancía  
* No se puede eliminar un usuario si tiene operaciones registradas (solo inactivar)  
* No se puede cambiar el código de un producto si tiene movimientos históricos

# **6\. CASOS DE USO PRINCIPALES**

Esta sección describe los escenarios de uso más importantes del sistema, ilustrando cómo interactúan los usuarios con el WMS para realizar operaciones clave.

## **6.1. UC-001: Recepción y Ubicación de Mercancía**

| ID | UC-001 |
| :---- | :---- |
| **Nombre** | Recepción y Ubicación de Mercancía |
| **Actor Principal** | Operador de Almacén |
| **Actores Secundarios** | Sistema de asignación automática |
| **Descripción** | El operador recibe mercancía, la registra en el sistema y la ubica en el almacén |
| **Precondiciones** | • Usuario autenticado con rol de Operador• Albarán o documento de entrada disponible• Producto existe en catálogo o se puede crear |
| **Postcondiciones** | • Mercancía registrada en el sistema• Stock actualizado• Mercancía ubicada físicamente• Etiqueta de identificación generada |
| **Prioridad** | Alta |

### **Flujo Principal:**

1\. El operador accede al módulo 'Recepción de Mercancía'

2\. El operador escanea o ingresa el código del producto recibido

3\. El sistema muestra información del producto (descripción, imagen, características)

4\. El operador ingresa la cantidad recibida, número de lote (si aplica) y fecha de caducidad

5\. El operador registra el documento de referencia (número de albarán)

6\. El sistema genera automáticamente un número de entrada único

7\. El sistema sugiere ubicación óptima para almacenar el producto basándose en:  
   • Disponibilidad de espacio  
   • Características del producto  
   • Proximidad a zona de picking  
   • Regla FIFO

8\. El operador puede aceptar la ubicación sugerida o seleccionar una manualmente en el mapa 3D

9\. El sistema genera etiqueta con código de barras/QR que incluye: SKU, lote, ubicación, fecha

10\. El operador imprime la etiqueta y la adhiere al pallet/producto

11\. El operador traslada físicamente la mercancía a la ubicación asignada

12\. El operador confirma la ubicación mediante escaneo del código de ubicación

13\. El sistema actualiza el stock y marca la mercancía como ubicada

14\. El sistema muestra confirmación y actualiza la visualización 3D del almacén

### **Flujos Alternativos:**

A1: Producto no existe en catálogo

* En el paso 2, si el producto no existe, el sistema ofrece crearlo  
* El operador ingresa datos del nuevo producto: descripción, categoría, dimensiones, peso  
* El sistema asigna un SKU único automáticamente o permite ingreso manual  
* Se continúa con el paso 3 del flujo principal

A2: No hay espacio en la ubicación sugerida

* En el paso 7, si la ubicación sugerida está llena, el sistema ofrece alternativas  
* El operador selecciona de la lista de ubicaciones alternativas ordenadas por conveniencia  
* Se continúa con el paso 9

A3: Discrepancia en cantidad recibida

* En el paso 4, si la cantidad recibida difiere de la esperada, el sistema genera alerta  
* El operador registra la discrepancia y observaciones  
* El sistema notifica al supervisor  
* Se continúa con el proceso normal

### **Flujos de Excepción:**

E1: Fallo en la impresora de etiquetas

* En el paso 9, si la impresora falla, el sistema guarda la etiqueta en formato PDF  
* El operador puede reimprimir posteriormente  
* El proceso continúa permitiendo completar la ubicación

E2: Pérdida de conexión

* Si se pierde la conexión durante el proceso, el sistema muestra mensaje de error  
* Los datos ingresados se mantienen en caché del navegador  
* Al restaurar conexión, el usuario puede continuar desde donde quedó

## **6.2. UC-002: Búsqueda y Localización de Piezas**

| ID | UC-002 |
| :---- | :---- |
| **Nombre** | Búsqueda y Localización de Piezas |
| **Actor Principal** | Operador de Almacén / Consultor |
| **Descripción** | El usuario busca un producto específico y visualiza su ubicación exacta en el almacén |
| **Precondiciones** | • Usuario autenticado• Producto existe en el sistema |
| **Postcondiciones** | • Usuario conoce ubicación exacta del producto• Cantidad disponible confirmada |
| **Prioridad** | Alta |

### **Flujo Principal:**

1\. El usuario accede al módulo 'Búsqueda de Productos'

2\. El usuario ingresa criterio de búsqueda:  
   • Escaneo de código de barras/QR  
   • Ingreso manual de SKU  
   • Búsqueda por descripción (texto parcial)

3\. El sistema ejecuta la búsqueda en tiempo real

4\. El sistema muestra lista de resultados coincidentes con:  
   • Imagen del producto  
   • Descripción  
   • SKU  
   • Stock total disponible  
   • Número de ubicaciones donde se encuentra

5\. El usuario selecciona el producto deseado

6\. El sistema muestra pantalla de detalle con:  
   • Información completa del producto  
   • Stock total y por ubicación  
   • Tabla de ubicaciones con cantidades  
   • Historial reciente de movimientos

7\. El sistema muestra la visualización 3D del almacén

8\. En el mapa 3D, las ubicaciones que contienen el producto se resaltan con color distintivo

9\. El usuario puede hacer clic en cada ubicación para ver detalles:  
   • Cantidad exacta en esa ubicación  
   • Número de lote  
   • Fecha de entrada  
   • Ruta sugerida desde posición actual

10\. El usuario puede generar instrucciones de navegación para llegar a la ubicación

11\. El sistema muestra la ruta óptima en el mapa 3D con flechas direccionales

### **Flujos Alternativos:**

A1: Múltiples productos coinciden con la búsqueda

* En el paso 4, el sistema muestra todos los resultados en lista paginada  
* El usuario puede refinar la búsqueda agregando más criterios  
* El usuario puede ordenar resultados por relevancia, SKU o descripción

A2: Producto sin stock

* En el paso 6, si el producto no tiene stock, el sistema lo indica claramente  
* El sistema muestra fecha de última salida  
* El sistema puede sugerir productos alternativos o equivalentes

A3: Producto en múltiples ubicaciones con FIFO aplicable

* En el paso 8, el sistema ordena ubicaciones por fecha de entrada (más antiguo primero)  
* Resalta visualmente la ubicación con stock más antiguo como prioritaria  
* Muestra indicador de 'Recomendado FIFO'

## **6.3. UC-003: Asignación Automática de Ubicación**

| ID | UC-003 |
| :---- | :---- |
| **Nombre** | Asignación Automática de Ubicación Óptima |
| **Actor Principal** | Sistema (Algoritmo de optimización) |
| **Actores Secundarios** | Operador de Almacén |
| **Descripción** | El sistema calcula y sugiere automáticamente la mejor ubicación para almacenar un producto |
| **Precondiciones** | • Producto a ubicar está registrado• Características del producto conocidas• Estructura del almacén configurada |
| **Postcondiciones** | • Ubicación óptima sugerida al usuario |
| **Prioridad** | Alta |

### **Flujo Principal (Algoritmo):**

1\. El sistema recibe solicitud de asignación con:  
   • Producto (SKU, dimensiones, peso)  
   • Cantidad a ubicar  
   • Características especiales (temperatura, peligrosidad, etc.)

2\. El sistema recupera todas las ubicaciones activas del almacén

3\. El sistema filtra ubicaciones descartando aquellas que:  
   • No tienen espacio suficiente  
   • No cumplen restricciones del producto (temperatura, tipo, etc.)  
   • Están marcadas como inactivas o en mantenimiento

4\. Para cada ubicación candidata, el sistema calcula puntuación basada en:  
   • Espacio disponible (mejor si queda \~20% libre, peor si queda casi vacío o lleno al límite)  
   • Rotación del producto (productos de alta rotación cerca de zona picking)  
   • Distancia a zona de picking/expedición  
   • Agrupación con mismo producto o familia  
   • Balanceo de carga (evitar sobrecargar zonas específicas)  
   • Accesibilidad (preferir niveles medios sobre muy altos o muy bajos)  
   • Cumplimiento de FIFO (si aplica, ubicaciones que mantengan orden cronológico)

5\. El sistema ordena ubicaciones por puntuación descendente

6\. El sistema selecciona las 3 mejores ubicaciones como sugerencias

7\. El sistema genera visualización en mapa 3D resaltando ubicaciones sugeridas

8\. El sistema presenta al operador:  
   • Ubicación recomendada principal (con máxima puntuación)  
   • 2 alternativas adicionales  
   • Explicación breve de por qué se recomienda cada una

9\. El operador selecciona una de las opciones o busca manualmente otra ubicación

### **Criterios de Optimización Detallados:**

| Criterio | Peso | Descripción |
| :---- | :---- | :---- |
| **Espacio disponible** | 25% | Preferir ubicaciones con espacio adecuado (no muy llenas ni muy vacías) |
| **Rotación del producto** | 20% | Productos de alta rotación cerca de zonas de picking |
| **Distancia** | 15% | Minimizar distancia a recorrer |
| **Agrupación** | 15% | Agrupar productos iguales o de misma familia |
| **Cumplimiento FIFO** | 10% | Mantener orden cronológico para productos con caducidad |
| **Accesibilidad** | 10% | Preferir niveles de fácil acceso |
| **Balanceo de carga** | 5% | Distribuir uniformemente en el almacén |

### **Flujos Alternativos:**

A1: No hay ubicaciones disponibles con espacio suficiente

* En el paso 3, si todas las ubicaciones compatibles están llenas, el sistema:  
* Genera alerta de 'Capacidad insuficiente'  
* Sugiere realizar reubicación de productos existentes  
* Sugiere habilitar nuevas ubicaciones  
* Permite registro temporal en zona de recepción mientras se libera espacio

A2: Operador rechaza todas las sugerencias

* En el paso 9, el operador puede activar el selector manual de ubicaciones  
* El sistema muestra mapa 3D completo con filtros  
* El operador selecciona ubicación manualmente  
* El sistema valida que cumple requisitos mínimos (espacio, restricciones)  
* Si no cumple, muestra advertencia y pide confirmación

# **7\. ANEXOS**

## **Anexo A: Glosario Técnico Ampliado**

| Término | Definición |
| :---- | :---- |
| **Almacén** | Espacio físico destinado al almacenamiento de mercancías |
| **Ubicación** | Posición específica dentro del almacén identificada por código único |
| **Pallet** | Plataforma horizontal de madera o plástico para transporte y almacenaje |
| **Lote** | Conjunto de productos fabricados en el mismo proceso productivo |
| **Trazabilidad** | Capacidad de seguir el recorrido de un producto a través de toda la cadena |
| **Dashboard** | Panel de control visual con métricas e indicadores clave |
| **Responsive** | Diseño web que se adapta a diferentes tamaños de pantalla |
| **API REST** | Interfaz de programación que usa protocolo HTTP para comunicación |
| **PostgreSQL** | Sistema de base de datos relacional de código abierto |
| **Supabase** | Plataforma backend que proporciona base de datos, auth y APIs |
| **WebGL** | Tecnología para renderizar gráficos 3D en navegadores web |
| **Three.js** | Librería JavaScript para crear gráficos 3D |
| **WCAG** | Web Content Accessibility Guidelines \- Pautas de accesibilidad web |
| **RGPD** | Reglamento General de Protección de Datos de la UE |
| **TLS** | Transport Layer Security \- Protocolo de seguridad para comunicaciones |
| **HID** | Human Interface Device \- Dispositivo de interfaz humana |
| **EAN** | European Article Number \- Sistema de códigos de barras europeo |
| **UPC** | Universal Product Code \- Sistema de códigos de barras norteamericano |

## **Anexo B: Modelo de Datos Conceptual**

Entidades principales del sistema:

* • Producto: SKU, descripción, categoría, dimensiones, peso, requiere\_lote, stock\_minimo, rotacion  
* • Ubicacion: codigo, descripcion, tipo, dimensiones, capacidad\_max, estado, coordenadas\_3d, almacen\_id  
* • Inventario: producto\_id, ubicacion\_id, cantidad, lote, fecha\_entrada, fecha\_caducidad  
* • Movimiento: id, tipo, producto\_id, cantidad, ubicacion\_origen, ubicacion\_destino, usuario\_id, timestamp, documento\_ref  
* • Pedido: numero, cliente, fecha\_pedido, fecha\_entrega, prioridad, estado  
* • LineaPedido: pedido\_id, producto\_id, cantidad\_solicitada, cantidad\_servida, ubicacion\_picking  
* • Usuario: id, email, nombre, rol, estado, fecha\_creacion  
* • Etiqueta: id, producto\_id, ubicacion\_id, lote, fecha\_generacion, codigo\_barras

Nota: Este es un modelo conceptual simplificado. El modelo físico implementado en PostgreSQL incluirá índices, claves foráneas, triggers y constraints adicionales.

## **Anexo C: Tecnologías y Stack Técnico**

| Componente | Tecnología Propuesta |
| :---- | :---- |
| **Backend / Base de Datos** | Supabase (PostgreSQL 15+) |
| **Autenticación** | Supabase Auth |
| **Frontend Framework** | React 18+ o Vue 3+ |
| **Visualización 3D** | Three.js / React Three Fiber |
| **Gráficos y Charts** | Recharts / Chart.js |
| **UI Components** | Shadcn/ui / Material-UI / Ant Design |
| **Estilos** | Tailwind CSS |
| **Gestión de Estado** | Zustand / Pinia |
| **Generación de PDF** | jsPDF / pdfmake |
| **Exportación Excel** | SheetJS (xlsx) |
| **Códigos de Barras** | JsBarcode / react-barcode |
| **Códigos QR** | qrcode.react / qrcode-generator |
| **Testing** | Jest / Vitest \+ React Testing Library |
| **Control de Versiones** | Git / GitHub |
| **Despliegue** | Vercel / Netlify (frontend) \+ Supabase (backend) |

## **Anexo D: Plan de Implementación Sugerido**

Fases propuestas para el desarrollo:

FASE 1: MVP (Minimum Viable Product) \- 8-10 semanas

* Configuración de infraestructura (Supabase, repositorio, CI/CD)  
* Autenticación y gestión de usuarios  
* Módulo de productos (catálogo básico)  
* Estructura de ubicaciones jerárquica  
* Registro de entradas y salidas de mercancía  
* Consulta de stock básica  
* Interfaz responsive básica

FASE 2: Funcionalidades Core \- 6-8 semanas

* Asignación automática de ubicaciones  
* Transferencias entre ubicaciones  
* Ajustes de inventario  
* Visualización 2D del almacén (mapa de planta)  
* Generación de reportes básicos  
* Integración con lectores de códigos de barras  
* Generación de etiquetas básicas

FASE 3: Gestión de Pedidos \- 6-8 semanas

* Creación de pedidos de salida  
* Proceso de picking optimizado  
* Proceso de packing  
* Seguimiento de pedidos  
* Aplicación de regla FIFO  
* Dashboard de KPIs básico

FASE 4: Visualización Avanzada \- 4-6 semanas

* Visualización 3D completa del almacén  
* Navegación interactiva en 3D  
* Búsqueda visual de productos  
* Simulación de rutas de picking  
* Mapa de calor de ocupación

FASE 5: Optimización y Features Avanzadas \- 4-6 semanas

* Reportes avanzados y analítica  
* Auditorías de inventario  
* Optimización de rendimiento  
* Integración con códigos QR  
* Plantillas de etiquetas personalizables  
* Exportación masiva de datos  
* Configuración avanzada de permisos

Tiempo total estimado: 28-38 semanas (\~7-9 meses)

## **Anexo E: Roles y Permisos**

| Módulo | Admin | Supervisor | Operador | Inventarista | Consultor |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Gestión Usuarios** | RW | R | \- | \- | \- |
| **Configuración** | RW | R | \- | \- | \- |
| **Productos** | RW | RW | R | R | R |
| **Ubicaciones** | RW | RW | R | R | R |
| **Entradas** | RW | RW | RW | R | R |
| **Salidas** | RW | RW | RW | R | R |
| **Transferencias** | RW | RW | RW | R | \- |
| **Ajustes** | RW | RW | R\* | RW | \- |
| **Pedidos** | RW | RW | RW | R | R |
| **Reportes** | RW | RW | R | R | R |
| **Auditoría Logs** | RW | R | \- | \- | \- |

Leyenda:

* RW: Lectura y Escritura completa  
* R: Solo Lectura  
* R\*: Lectura y escritura limitada (requiere autorización para ajustes grandes)  
* \-: Sin acceso

## **Anexo F: Control de Versiones del Documento**

| Versión | Fecha | Autor | Cambios |
| :---- | :---- | :---- | :---- |
| **1.0** | 08/03/2026 | Analista de Sistemas | Versión inicial del documento SRS |

## **Aprobaciones**

| Rol | Nombre | Firma / Fecha |
| :---- | :---- | :---- |
|  |  |  |
|  |  |  |
|  |  |  |
| **Gerente de Proyecto** | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Responsable de Operaciones** | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Responsable de TI** | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |

