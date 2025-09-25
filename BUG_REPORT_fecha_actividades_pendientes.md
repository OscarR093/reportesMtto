# Bug Report: Desplazamiento de fechas en actividades pendientes

## Descripción del Problema

Al asignar una fecha programada a una actividad pendiente, la fecha mostrada en la interfaz se adelanta o retrasa un día respecto a la fecha seleccionada por el usuario.

## Módulos Implicados

- `/src/services/pendingService.js` - Función `assignPendingActivity`
- `/src/models/Pending.js` - Definición del modelo y métodos relacionados con fechas
- `/frontend/src/pages/PendingActivities.jsx` - Componente de la interfaz para mostrar y asignar actividades

## Casos de Uso Afectados

1. Asignación de actividades pendientes con fecha programada
2. Visualización de la fecha programada en la lista de actividades
3. Exportación de actividades a Excel

## Comportamiento Actual

- Fecha seleccionada en el formulario: "Lunes 29"
- Fecha mostrada después de la asignación: "Domingo 28" o "Martes 30"

## Comportamiento Esperado

- Fecha seleccionada en el formulario: "Lunes 29"
- Fecha mostrada después de la asignación: "Lunes 29"

## Posibles Causas

- Conversión de zona horaria entre cliente y servidor
- Manejo inadecuado del tipo de dato DATE en la base de datos
- Formateo indebido de fechas en el modelo o servicio
- Almacenamiento de fechas en formato UTC que se convierte a la zona horaria local

## Contexto del Problema

- El problema afecta tanto la visualización en la interfaz como el almacenamiento en la base de datos
- Puede estar relacionado con el manejo de fechas en Sequelize y PostgreSQL
- El problema puede estar influenciado por la zona horaria configurada en el servidor o cliente