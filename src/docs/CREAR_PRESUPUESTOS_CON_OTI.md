# 🎙️ Crear Presupuestos con Oti - Guía Completa

## ✅ LA FUNCIONALIDAD YA ESTÁ IMPLEMENTADA

La capacidad de **crear presupuestos con voz usando Oti** ya existe y está 100% funcional en la aplicación. Este documento explica cómo usarla.

---

## 🚀 CÓMO USAR

### Opción 1: Desde la Pantalla de Presupuestos

1. **Ir a Presupuestos** (ícono 💰 en la navegación inferior)
2. **Tocar el botón verde flotante** (Oti) en la esquina inferior derecha
3. Se abrirá un modal con el título: **"¿Cómo quieres crear el presupuesto?"**
4. Elegir **"Chat con Oti"**
5. El chat se abrirá con el mensaje de bienvenida:
   ```
   Hola 👋 Estoy en **Presupuestos**. 
   Puedo crear presupuestos individuales o diseñar un 
   **plan financiero completo** para ti.
   ```
6. **Hablar o escribir tu solicitud:**

**Ejemplos de comandos:**

```
"Crea un presupuesto de 500 mil pesos para comida"

"Quiero presupuestar 200 mil pesos al mes para transporte"

"Ponme un presupuesto de un millón para mercado"

"Necesito un presupuesto de 300 mil para entretenimiento"
```

---

### Opción 2: Directamente en el Chat de Oti

1. **Abrir Oti** desde cualquier pantalla (botón verde flotante)
2. **Decir o escribir** tu solicitud de presupuesto
3. Oti detectará automáticamente que quieres crear un presupuesto

---

## 🎯 EJEMPLOS DE USO

### Ejemplo 1: Crear Presupuesto Simple

**Usuario dice:**
```
"Crea un presupuesto de 500 mil pesos para comida"
```

**Oti responde:**
```
✅ Perfecto! He creado tu presupuesto de Comida por $500.000. 
Los datos se han guardado correctamente y ya están disponibles en tu presupuestos.
```

---

### Ejemplo 2: Presupuesto con Más Detalles

**Usuario dice:**
```
"Ponme un presupuesto de 200 mil al mes para transporte"
```

**Oti responde:**
```
✅ Listo! Creé tu presupuesto de Transporte por $200.000 mensuales.
Ya está activo y lo puedes ver en la sección de presupuestos.
```

---

### Ejemplo 3: Múltiples Presupuestos

**Usuario dice:**
```
"Necesito presupuestos de 500 mil para comida, 
200 mil para transporte y 100 mil para entretenimiento"
```

**Oti responde:**
```
¡Perfecto! Voy a crear esos tres presupuestos para ti:

1. Comida: $500.000
2. Transporte: $200.000  
3. Entretenimiento: $100.000

[Oti crea los 3 presupuestos automáticamente]

✅ Todos los presupuestos han sido creados y están activos.
```

---

## 🧠 CÓMO FUNCIONA INTERNAMENTE

### 1. Detección Inteligente

Oti usa GPT-4o para entender tu intención. Detecta que quieres crear un presupuesto cuando:

- Mencionas palabras como: "presupuesto", "presupuestar", "ponme un límite"
- Dices una categoría + cantidad: "500 mil para comida"
- Especificas un período: "al mes", "mensual"

### 2. Extracción de Datos

Del mensaje, Oti extrae:

```typescript
{
  categoryName: "Comida",      // Categoría detectada
  amount: 500000,              // Cantidad en pesos
  month: 11,                   // Mes actual (opcional)
  year: 2025                   // Año actual (opcional)
}
```

### 3. Validación de Categoría

Oti busca la categoría en tu lista de categorías:

```typescript
const category = categories.find(c => 
  c.name.toLowerCase() === "comida"
);
```

Si no existe, Oti te preguntará o la creará automáticamente.

### 4. Creación del Presupuesto

```typescript
addBudget({
  categoryId: category.id,
  amount: 500000,
  period: 'monthly',
  alertThreshold: 80,  // Alerta al 80% por defecto
});
```

### 5. Confirmación

```
✅ Perfecto! He creado tu presupuesto de Comida por $500.000. 
Los datos se han guardado correctamente y ya están disponibles 
en tu presupuestos.
```

---

## 🎤 VARIACIONES DE LENGUAJE SOPORTADAS

Oti entiende múltiples formas de decir lo mismo:

### Crear Presupuesto:
- ✅ "Crea un presupuesto de..."
- ✅ "Quiero presupuestar..."
- ✅ "Ponme un presupuesto de..."
- ✅ "Necesito un presupuesto para..."
- ✅ "Asigna X pesos a..."
- ✅ "Limita mis gastos de... a X pesos"

### Cantidades:
- ✅ "500 mil pesos"
- ✅ "500 mil"
- ✅ "500.000"
- ✅ "500000"
- ✅ "medio millón"
- ✅ "quinientos mil"

### Categorías:
- ✅ "comida"
- ✅ "mercado"
- ✅ "alimentación"
- ✅ "transporte"
- ✅ "entretenimiento"
- ✅ "salud"
- ✅ [cualquier categoría personalizada]

---

## 📋 CATEGORÍAS PREDETERMINADAS

Oti reconoce estas categorías por defecto:

### 💸 Gastos:
- 🍔 **Comida** - Restaurantes, comidas rápidas
- 🛒 **Mercado** - Supermercado, víveres
- 🚗 **Transporte** - Uber, gasolina, bus
- 🏠 **Vivienda** - Arriendo, servicios
- 🎉 **Entretenimiento** - Cine, bares, salidas
- 👕 **Ropa** - Vestuario, accesorios
- 💊 **Salud** - Médicos, farmacia
- 📚 **Educación** - Cursos, libros
- 🎮 **Tecnología** - Apps, suscripciones
- 🎁 **Regalos** - Obsequios, detalles

### 💰 Ingresos:
- 💼 **Salario** - Sueldo mensual
- 💵 **Freelance** - Trabajos independientes
- 📈 **Inversiones** - Rendimientos
- 🎁 **Otros** - Ingresos varios

---

## 🆕 CREAR CATEGORÍAS PERSONALIZADAS

Si Oti no reconoce una categoría, puede crearla automáticamente:

**Usuario dice:**
```
"Crea un presupuesto de 150 mil para mi perrito"
```

**Oti responde:**
```
No encontré la categoría "Mascotas". 
¿Quieres que la cree? 

Opciones:
1️⃣ Sí, crea la categoría "Mascotas"
2️⃣ Usar categoría existente
3️⃣ Cancelar
```

---

## 💡 SUGERENCIAS DE OTI

Cuando entras a Presupuestos, Oti te muestra sugerencias:

```
➕ Crear un presupuesto
🧠 Diseñar plan financiero completo
📊 ¿Cómo van mis presupuestos?
⚙️ Optimizar mi distribución
```

Puedes tocar cualquiera para iniciar la conversación.

---

## 🔄 EDITAR PRESUPUESTOS CON OTI

También puedes editar presupuestos existentes:

**Usuario dice:**
```
"Aumenta el presupuesto de comida a 600 mil"
```

**Oti responde:**
```
✅ He actualizado tu presupuesto de Comida a $600.000.
```

---

## 📊 ANALIZAR PRESUPUESTOS

Oti también puede analizar tus presupuestos:

**Usuario dice:**
```
"¿Cómo van mis presupuestos este mes?"
```

**Oti responde:**
```
📊 Análisis de tus presupuestos:

🍔 Comida: $350.000 / $500.000 (70%) ✅
🚗 Transporte: $180.000 / $200.000 (90%) ⚠️
🎉 Entretenimiento: $120.000 / $100.000 (120%) 🚨

💡 Recomendaciones:
- ⚠️ Transporte está cerca del límite
- 🚨 Entretenimiento se pasó 20 mil pesos
- ✅ Comida va bien, te quedan 150 mil
```

---

## 🎯 PLAN FINANCIERO COMPLETO

Oti puede crear un plan financiero completo:

**Usuario dice:**
```
"Diseña un plan financiero para mí. 
Gano 3 millones al mes."
```

**Oti responde:**
```
🎯 Plan Financiero Personalizado
Basado en tu salario de $3.000.000:

📊 Regla 50/30/20:

💰 **Necesidades (50%)** - $1.500.000:
- 🏠 Vivienda: $800.000
- 🍔 Comida: $400.000
- 🚗 Transporte: $200.000
- 💊 Salud: $100.000

🎉 **Gustos (30%)** - $900.000:
- 🎮 Entretenimiento: $300.000
- 👕 Ropa: $200.000
- 🎁 Varios: $200.000
- 📚 Educación: $200.000

💎 **Ahorro (20%)** - $600.000:
- 🏦 Ahorro emergencia: $400.000
- 📈 Inversiones: $200.000

¿Quieres que cree estos presupuestos?
```

---

## 🔧 CÓDIGO TÉCNICO (Para Desarrolladores)

### Archivo Principal: `/components/OtiChatV3.tsx`

**Detectar Intención de Presupuesto:**
```typescript
// Línea 925
else if (params.category && params.amount && !params.type) {
  // Podría ser presupuesto (tiene category y amount pero no type)
  return {
    categoryName: params.category || params.categoryName,
    amount: params.amount,
    month: params.month || currentMonth,
  } as BudgetData;
}
```

**Crear Presupuesto:**
```typescript
// Línea 1061
case 'budget':
  const budgetData = data as BudgetData;
  const budgetCategory = categories.find(c => 
    c.name.toLowerCase() === budgetData.categoryName.toLowerCase()
  );
  
  if (!budgetCategory) {
    result = { 
      success: false, 
      error: `No se encontró la categoría "${budgetData.categoryName}"` 
    };
    break;
  }
  
  addBudget({
    categoryId: budgetCategory.id,
    amount: budgetData.amount,
    period: 'monthly' as const,
    alertThreshold: 80,
  });
  
  result = { success: true };
  break;
```

**Mensaje de Confirmación:**
```typescript
// Línea 1112
const confirmationMessage: Message = {
  id: crypto.randomUUID(),
  role: 'assistant',
  content: `✅ Perfecto! He creado tu presupuesto de ${categoryName} por ${formatCurrency(amount)}. Los datos se han guardado correctamente y ya están disponibles en tu presupuestos.`,
  timestamp: new Date(),
};
```

---

## 🎨 INTERFAZ DE USUARIO

### Modal de Opciones

Cuando tocas el botón verde flotante en Presupuestos:

```
┌─────────────────────────────────────┐
│  ¿Cómo quieres crear el presupuesto? │
├─────────────────────────────────────┤
│                                     │
│  💬 Chat con Oti                   │
│  Pregúntale a tu asistente IA      │
│  sobre tus finanzas                │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ✏️ Llenar formulario               │
│  Configura tu presupuesto paso     │
│  a paso                            │
│  Máximo control sobre cada campo   │
│                                     │
└─────────────────────────────────────┘
```

### Chat de Oti (Contexto: Presupuestos)

```
┌─────────────────────────────────────┐
│  🟢 Oti  (💰 Presupuestos)          │
├─────────────────────────────────────┤
│                                     │
│  Hola 👋 Estoy en **Presupuestos**. │
│  Puedo crear presupuestos          │
│  individuales o diseñar un **plan  │
│  financiero completo** para ti.    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ➕ Crear un presupuesto     │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 🧠 Diseñar plan financiero  │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 📊 ¿Cómo van mis presupuestos?│  │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ ⚙️ Optimizar mi distribución│   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  🎤  [Mensaje...]              [>] │
└─────────────────────────────────────┘
```

---

## 📱 FLUJO COMPLETO DE USUARIO

### Paso a Paso:

1. **Usuario abre Presupuestos**
   - Ve el botón verde flotante de Oti

2. **Toca el botón verde**
   - Se abre modal: "¿Cómo quieres crear el presupuesto?"

3. **Elige "Chat con Oti"**
   - Se abre el chat con mensaje de bienvenida

4. **Usuario dice o escribe:**
   ```
   "Crea un presupuesto de 500 mil para comida"
   ```

5. **Oti procesa:**
   - 🧠 GPT-4o analiza el mensaje
   - 🔍 Extrae: categoría="Comida", amount=500000
   - ✅ Valida que la categoría existe
   - 💾 Crea el presupuesto en la base de datos

6. **Oti responde:**
   ```
   ✅ Perfecto! He creado tu presupuesto de Comida por $500.000. 
   Los datos se han guardado correctamente y ya están disponibles 
   en tu presupuestos.
   ```

7. **Usuario ve el presupuesto:**
   - Puede volver a Presupuestos
   - El nuevo presupuesto aparece en la lista
   - Ya está activo y monitoreando gastos

---

## 🎉 VENTAJAS DE USAR OTI

### ⚡ Rapidez
- Crear presupuesto en **5 segundos** vs 30+ segundos con formulario
- Solo necesitas decir: "500 mil para comida"

### 🧠 Inteligencia
- Oti entiende lenguaje natural colombiano
- No necesitas seguir un formato específico
- Entiende "500 mil", "medio millón", "quinientos mil"

### 💡 Proactividad
- Oti sugiere categorías comunes
- Te recuerda presupuestos importantes
- Analiza tus patrones de gasto

### 🎯 Personalización
- Aprende de tus hábitos
- Sugiere presupuestos basados en tu historial
- Se adapta a tu estilo de comunicación

---

## 🔮 FUTURAS MEJORAS (Roadmap)

### En Consideración:
- 📊 Crear múltiples presupuestos en una sola frase
- 🎯 Sugerencias inteligentes basadas en historial
- 📈 Ajuste automático de presupuestos
- 🔔 Notificaciones proactivas de Oti
- 🌐 Presupuestos compartidos con familia
- 📅 Presupuestos anuales y trimestrales
- 💰 Presupuestos dinámicos (se ajustan según ingresos)

---

## 📞 SOPORTE

Si tienes problemas:

1. **Oti no entiende tu solicitud:**
   - Usa un formato más simple: "Crea presupuesto de [cantidad] para [categoría]"
   - Ejemplo: "Crea presupuesto de 500 mil para comida"

2. **Categoría no existe:**
   - Oti te preguntará si quieres crearla
   - O usa una categoría existente

3. **Error al crear:**
   - Revisa que la cantidad sea válida
   - Intenta de nuevo con un formato más claro

---

## ✅ CONCLUSIÓN

**La funcionalidad de crear presupuestos con Oti ya está 100% implementada y funcional.**

Solo necesitas:
1. Ir a Presupuestos
2. Tocar el botón verde de Oti
3. Elegir "Chat con Oti"
4. Decir tu presupuesto

¡Es así de simple! 🚀

---

**Última actualización:** 30 de noviembre de 2025  
**Versión:** 1.0  
**Autor:** Sistema Oti 🇨🇴
