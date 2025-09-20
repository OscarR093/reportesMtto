# BUG REPORT: Problema con Filtro de Turnos en Reportes

## Fecha
viernes, 19 de septiembre de 2025

## Descripción del Problema
Los reportes creados en la madrugada del día 20 de septiembre de 2025 (por ejemplo, a las 2:06 AM y 2:46 AM) están apareciendo en la vista del día 21 de septiembre en lugar de aparecer en la vista del día 19 de septiembre, como debería ser según la lógica de turnos establecida.

## Contexto
Se implementó un sistema de visualización de reportes por turnos donde:
- **Turno Matutino**: 6:00 AM - 5:59 PM del día seleccionado
- **Turno Vespertino**: 6:00 PM del día anterior - 5:59 AM del día seleccionado

Cuando se selecciona una fecha X, se espera ver:
1. Turno matutino del día X (6:00 AM - 5:59 PM del día X)
2. Turno vespertino del día X (6:00 PM del día X-1 - 5:59 AM del día X)

## Comportamiento Esperado
Cuando se selecciona el día **19/09/2025**:
- Los reportes creados el **19/09/2025 a las 2:06 AM** y **2:46 AM** deberían aparecer en el **turno vespertino del 19/09/2025**

## Comportamiento Actual
Cuando se selecciona el día **19/09/2025**:
- Los reportes creados el **19/09/2025 a las 2:06 AM** y **2:46 AM** aparecen en la vista del **día 21/09/2025**

## Pasos para Reproducir
1. Crear un reporte el día 19/09/2025 a las 2:06 AM
2. Crear otro reporte el día 19/09/2025 a las 2:46 AM
3. Ir a la página de reportes
4. Seleccionar el día 19/09/2025
5. Observar que los reportes no aparecen en ninguna de las vistas
6. Seleccionar el día 21/09/2025
7. Observar que los reportes aparecen en alguna de las vistas del día 21

## Archivos Relevantes
- `/src/services/reportService.js` - Lógica de filtrado por turnos
- `/frontend/src/pages/Reports.jsx` - Componente de interfaz de usuario
- `/src/controllers/reportController.js` - Controlador de reportes

## Código Actual en reportService.js
```javascript
// Para turno vespertino
} else if (filters.shift === 'evening') {
  // Turno vespertino: 18:00 del día anterior - 5:59 del día seleccionado
  // Cuando seleccionamos el día X para el turno vespertino, queremos ver:
  // - Las horas de 18:00 del día X-1 hasta las 5:59 del día X
  const previousDay = new Date(selectedDate);
  previousDay.setDate(previousDay.getDate() - 1);
  
  shiftStart = new Date(previousDay);
  shiftStart.setHours(18, 0, 0, 0);
  shiftEnd = new Date(selectedDate);
  shiftEnd.setHours(5, 59, 59, 999);
}
```

## Posibles Causas
1. Error en la lógica de cálculo de fechas para el filtro de turnos
2. Confusión en la interpretación de qué día representa cada turno
3. Problema en la zona horaria de las fechas
4. Error en la forma en que se pasan los parámetros del frontend al backend

## Impacto
- Los supervisores no pueden ver correctamente los reportes organizados por turnos
- La información no se muestra en el contexto correcto para la supervisión
- Confusión en la interpretación de los datos de productividad por turnos

## Solución Propuesta
Revisar y corregir la lógica de filtrado en `/src/services/reportService.js` para que:
1. Cuando se selecciona el día X, el turno vespertino muestre reportes del 18:00 del día X-1 al 5:59 del día X
2. Verificar que las fechas se estén pasando correctamente desde el frontend
3. Asegurar que no haya problemas de zona horaria en el cálculo de fechas

## Notas Adicionales
Este problema es crítico para la funcionalidad de supervisión por turnos y debe resolverse para garantizar que los reportes se muestren en el contexto correcto según la lógica de turnos establecida.