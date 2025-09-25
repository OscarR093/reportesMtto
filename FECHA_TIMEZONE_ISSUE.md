# Problema de Zona Horaria en Fechas de Actividades

## Descripción del Problema

Las fechas de las actividades pendientes se mostraban un día antes en la interfaz de "Mis Actividades Pendientes" (MyPendingActivities), mientras que en la gestión de actividades para administradores se mostraban correctamente.

## Causa Raíz

1. Las fechas se almacenan en la base de datos en formato UTC
2. Al recuperar las fechas en el frontend, se convierten automáticamente a la zona horaria local (GMT-6 para Ciudad de México)
3. Las fechas programadas sin hora específica (solo fecha) se interpretaban como 00:00 UTC, lo que al convertir a la zona horaria local mostraba el día anterior en ciertos horarios

Ejemplo de problema:
- Fecha almacenada: "2025-09-27" 
- Al convertirse a Date object: "Fri Sep 26 2025 18:00:00 GMT-0600"
- Resultado: Se mostraba "26/09/2025" en lugar de "27/09/2025"

## Solución Implementada

En el archivo `frontend/src/pages/MyPendingActivities.jsx`, se modificó la forma de manejar las fechas programadas:

```javascript
// Antes
{new Date(activity.scheduled_date).toLocaleDateString('es-ES')}

// Después
{activity.scheduled_date instanceof Date 
  ? activity.scheduled_date.toLocaleDateString('es-ES')
  : new Date(activity.scheduled_date + 'T00:00:00').toLocaleDateString('es-ES')}
```

Esto asegura que las fechas se interpreten correctamente sin cambio de día por zona horaria.

## Solución a Futuro

La solución ideal sería:

1. **Almacenar fechas con información de zona horaria** en lugar de solo fechas simples
2. **Convertir las fechas al guardar en la base de datos** en lugar de al recuperarlas
3. **Establecer una zona horaria estándar** para todas las fechas programadas en el sistema

Esto evitaría problemas de interpretación de fechas y proporcionaría una experiencia más consistente para usuarios en diferentes zonas horarias.

## Impacto

- La interfaz de "Mis Actividades Pendientes" ahora muestra las fechas correctamente
- No se afectaron otras funcionalidades del sistema
- La solución es local al componente MyPendingActivities