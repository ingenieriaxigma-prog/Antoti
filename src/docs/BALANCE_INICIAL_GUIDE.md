# 💰 Guía: Registro de Saldo Inicial

## ✅ Cambios Implementados

Hemos mejorado el sistema de cuentas para mantener **trazabilidad completa** de todas tus finanzas.

### 🎯 ¿Qué cambió?

El campo "Balance Inicial" en el formulario de cuentas ahora está **deshabilitado**. Esto significa que:

- ❌ Ya no puedes establecer un balance inicial directamente al crear/editar una cuenta
- ✅ Las cuentas siempre inician en $0
- ✅ Todo saldo debe registrarse como una **transacción**

### 🤔 ¿Por qué este cambio?

**Beneficios de este enfoque:**

1. **Trazabilidad Total**: Cada peso en tu cuenta tiene un registro de origen
2. **Auditoría Completa**: Puedes rastrear exactamente de dónde vino cada monto
3. **Sin Saldos Mágicos**: No hay dinero "que apareció de la nada"
4. **Mejor Control**: Evitas errores de saldos negativos inesperados
5. **Práctica Contable Correcta**: Todo movimiento financiero debe tener un registro

---

## 📥 PARA DINERO QUE TIENES (Cuentas Positivas)

### Paso 1: Crear la Cuenta
1. Ve a **Mis Cuentas**
2. Toca el botón **"+ Nueva Cuenta"**
3. Selecciona el tipo (Efectivo, Banco, Tarjeta, Digital)
4. Ingresa el nombre de la cuenta
5. El balance inicial estará en **$0** (deshabilitado)
6. Guarda la cuenta

### Paso 2: Registrar el Saldo como Transacción
1. Ve a **Transacciones**
2. Toca el botón **"+"** para crear una nueva transacción
3. Selecciona **"Ingreso"**
4. Elige la **categoría que mejor represente** tu saldo inicial:
   - **💼 Salario**: Si es sueldo que tenías guardado
   - **💰 Inversiones**: Si es un portafolio de inversiones
   - **🎁 Regalos y Extras**: Si es dinero que recibiste de regalo
   - **💻 Freelance/Independiente**: Si es dinero de trabajos independientes
   - O cualquier otra que tenga sentido para tu caso
5. Selecciona la cuenta que acabas de crear
6. Ingresa el monto que tenías en esa cuenta
7. Ajusta la fecha si es necesario
8. En las notas, especifica que es un "Saldo inicial"
9. Guarda la transacción

### Ejemplo Práctico

**Escenario**: Tienes $500,000 en tu billetera física que quieres registrar en Oti.

```
1. Crear Cuenta:
   - Tipo: Efectivo
   - Nombre: "Mi Billetera"
   - Balance Inicial: $0 (automático)

2. Registrar Saldo Inicial:
   - Tipo: Ingreso
   - Categoría: 💼 Salario (o la que mejor se ajuste)
   - Cuenta: Mi Billetera
   - Monto: $500,000
   - Fecha: Hoy
   - Nota: "Saldo inicial - dinero que tenía al empezar a usar Oti"
```

✅ **Resultado**: Tu cuenta "Mi Billetera" ahora muestra $500,000 y tienes un registro completo del origen del dinero.

---

## 📤 PARA DEUDAS Y PRÉSTAMOS (Cuentas Negativas)

### Paso 1: Crear la Cuenta de Deudas
1. Ve a **Mis Cuentas**
2. Toca el botón **"+ Nueva Cuenta"**
3. Selecciona el tipo que mejor represente la deuda:
   - **💳 Tarjeta de Crédito**: Para deudas de tarjetas
   - **🏦 Cuenta Bancaria**: Para préstamos bancarios (hipotecas, créditos)
   - **💰 Digital**: Para préstamos personales o con amigos/familia
4. Ingresa el nombre descriptivo (ej: "Deuda con Juan", "Hipoteca Casa", "Visa Gold")
5. El balance inicial estará en **$0** (deshabilitado)
6. Guarda la cuenta

### Paso 2: Registrar la Deuda Inicial
1. Ve a **Transacciones**
2. Toca el botón **"+"** para crear una nueva transacción
3. Selecciona **"Gasto"** (porque ese dinero ya lo gastaste o lo debes)
4. Categoría: **💳 Préstamos y Créditos**
5. Selecciona la cuenta de deuda que acabas de crear
6. Ingresa el monto que debes
7. Ajusta la fecha al día que adquiriste la deuda
8. En las notas: "Saldo inicial - Préstamo de [nombre] desde [fecha]"
9. Guarda la transacción

✅ **Resultado**: Tu cuenta de deuda muestra un saldo **negativo** (correcto, debes dinero).

### Paso 3: Pagar la Deuda (con TRANSFERENCIAS)

Cuando vayas a pagar la deuda, usa **TRANSFERENCIAS** para rastrear de dónde sale el dinero:

1. Ve a **Transacciones**
2. Toca el botón **"+"** → Selecciona **"Transferencia"**
3. **Desde**: Tu cuenta con dinero (Efectivo, Banco, etc.)
4. **Hacia**: La cuenta de deuda (ej: "Deuda con Juan")
5. **Monto**: Cuánto vas a pagar
6. **Nota**: "Pago de deuda - Abono parcial" o "Pago total"
7. Guarda la transferencia

✅ **Resultado**:
- Tu cuenta de efectivo/banco **disminuye**
- Tu cuenta de deuda se acerca a $0 (reduces lo que debes)

### Ejemplo Práctico: Deuda con un Amigo

**Escenario**: Tu amigo Juan te prestó $500,000 hace 3 meses.

```
1. Crear Cuenta:
   - Tipo: Digital (💰)
   - Nombre: "Deuda con Juan"
   - Balance Inicial: $0 (automático)

2. Registrar Deuda Inicial:
   - Tipo: Gasto
   - Categoría: 💳 Préstamos y Créditos
   - Cuenta: Deuda con Juan
   - Monto: $500,000
   - Fecha: Hace 3 meses (ajustar fecha)
   - Nota: "Saldo inicial - Préstamo de Juan desde septiembre 2024"

Resultado: La cuenta "Deuda con Juan" muestra -$500,000

3. Pagar $100,000:
   - Tipo: Transferencia
   - Desde: Efectivo
   - Hacia: Deuda con Juan
   - Monto: $100,000
   - Nota: "Pago parcial a Juan"

Resultado:
   - Efectivo: reduce $100,000
   - Deuda con Juan: pasa de -$500,000 a -$400,000
```

✅ **Resultado final**: Sabes exactamente cuánto debes y de qué cuenta pagaste.

---

## 🏦 Más Ejemplos por Tipo de Cuenta

### Efectivo en Billetera (Dinero que TIENES)
```
1. Crear Cuenta: Efectivo - "Mi Billetera"
2. Registrar Saldo:
   - Tipo: Ingreso
   - Categoría: 💼 Salario
   - Monto: $500,000
   - Nota: "Saldo inicial - Dinero que tenía guardado"
```

### Cuenta Bancaria (Dinero que TIENES)
```
1. Crear Cuenta: Cuenta Bancaria - "Bancolombia Ahorros"
2. Registrar Saldo:
   - Tipo: Ingreso
   - Categoría: 💼 Salario
   - Monto: $2,500,000
   - Nota: "Saldo inicial al 30/12/2024 - Balance bancario"
```

### Portafolio de Inversiones (Dinero que TIENES)
```
1. Crear Cuenta: Inversiones - "Acciones Colcap"
2. Registrar Saldo:
   - Tipo: Ingreso
   - Categoría: 💰 Inversiones
   - Monto: $5,000,000
   - Nota: "Saldo inicial - Portafolio de inversiones actual"
```

### Deuda de Tarjeta de Crédito (Dinero que DEBES)
```
1. Crear Cuenta: Tarjeta de Crédito - "Visa Gold"
2. Registrar Deuda:
   - Tipo: Gasto
   - Categoría: 💳 Préstamos y Créditos
   - Monto: $800,000
   - Nota: "Saldo inicial - Deuda tarjeta al corte diciembre"
   
Resultado: La cuenta muestra -$800,000 (debes)

3. Pagar $200,000:
   - Tipo: Transferencia
   - Desde: Bancolombia Ahorros
   - Hacia: Visa Gold
   - Monto: $200,000
   
Resultado: 
   - Bancolombia: reduce $200,000
   - Visa Gold: -$600,000 (debes menos)
```

### Préstamo Hipotecario (Dinero que DEBES)
```
1. Crear Cuenta: Cuenta Bancaria (🏦) - "Hipoteca Apartamento"
2. Registrar Deuda:
   - Tipo: Gasto
   - Categoría: 💳 Préstamos y Créditos
   - Subcategoría: Créditos Bancarios
   - Monto: $80,000,000
   - Nota: "Saldo inicial - Hipoteca pendiente desde 2020"
   
3. Pago Mensual de $1,500,000:
   - Tipo: Transferencia
   - Desde: Bancolombia Ahorros
   - Hacia: Hipoteca Apartamento
   - Monto: $1,500,000
   - Nota: "Cuota mensual enero 2025"
```

---

## ❓ Preguntas Frecuentes

### ¿Cómo registro deudas o préstamos?

Para registrar **deudas iniciales**:
1. Crea una cuenta usando el tipo más apropiado:
   - **Tarjeta de Crédito** para deudas de tarjetas
   - **Cuenta Bancaria** para hipotecas y créditos bancarios
   - **Digital** para préstamos personales o con amigos
2. Registra un **GASTO** (no ingreso) con el monto de la deuda
3. Usa la categoría **💳 Préstamos y Créditos**
4. En notas: "Saldo inicial - [Descripción de la deuda]"
5. Para pagar, usa **TRANSFERENCIAS** desde tu cuenta con dinero hacia la cuenta de deuda

---

### ¿Cómo registro un PRÉSTAMO NUEVO que acabo de recibir?

**Escenario:** Te prestaron $1,500,000 y el dinero entró a tu cuenta bancaria (aún NO lo has gastado).

#### ❌ **NO uses INGRESO:**
Si registras como ingreso, tu balance subirá $1,500,000 pero NO se registrará la deuda. Tu app mostrará que tienes más dinero del real.

#### ✅ **USA TRANSFERENCIA (Método Correcto):**

**Paso 1: Crear la cuenta del préstamo**
```
Tipo: Cuenta Bancaria o Digital
Nombre: "Préstamo Banco X" o "Préstamo de Juan"
Balance inicial: $0
```

**Paso 2: Registrar la transferencia**
```
Tipo: Transferencia
Desde: Préstamo Banco X
Hacia: Banco Principal (donde recibiste el dinero)
Monto: $1,500,000
Nota: "Desembolso préstamo - Recibido el 30/12/2024"
```

**Resultado Final:**
```
💰 Préstamo Banco X:    -$1,500,000  (debes)
🏦 Banco Principal:    +$1,500,000  (tienes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Balance Neto:              $0    (correcto)
```

**¿Por qué esto es correcto?**
- ✅ Registra la deuda (cuenta negativa)
- ✅ Registra el dinero disponible (cuenta positiva)
- ✅ Balance neto = $0 (porque debes lo que tienes)
- ✅ Trazabilidad completa del origen del dinero
- ✅ Cuando gastes ese dinero, tu balance bajará normalmente
- ✅ Cuando pagues el préstamo, harás transferencia inversa

**Ejemplo Completo:**
```
1. Recibir préstamo:
   Transferencia: "Préstamo Banco X" → "Banco Principal" ($1,500,000)
   
2. Gastar parte del dinero:
   Gasto: $200,000 en "Hogar" desde "Banco Principal"
   
   Estado actual:
   - Préstamo Banco X: -$1,500,000 (sigues debiendo todo)
   - Banco Principal: $1,300,000 (gastaste $200k)
   
3. Pagar cuota del préstamo:
   Transferencia: "Banco Principal" → "Préstamo Banco X" ($100,000)
   
   Estado final:
   - Préstamo Banco X: -$1,400,000 (debes menos)
   - Banco Principal: $1,200,000 (pagaste cuota)
```

---

### ¿Cómo sé si un ingreso debe registrarse como Ingreso o como Transferencia?

**Usa INGRESO cuando:**
- ✅ El dinero es realmente tuyo (salario, venta, regalo)
- ✅ NO tienes que devolverlo
- ✅ Aumenta tu patrimonio real

**Ejemplos:** Salario, freelance, venta de productos, regalos, inversiones.

**Usa TRANSFERENCIA cuando:**
- ✅ El dinero viene de una DEUDA (préstamo)
- ✅ Tienes que devolverlo
- ✅ NO aumenta tu patrimonio (solo cambia de forma)

**Ejemplos:** Préstamo bancario, adelanto de tarjeta, préstamo de amigo, crédito de consumo.

---

### ¿Puedo tener una cuenta con saldo negativo?

**Sí**, puedes tener cuentas con saldo negativo, especialmente para deudas y préstamos. Esto es correcto y necesario para mantener una trazabilidad completa de tus finanzas.

---

## 🎓 Mejores Prácticas

### ✅ Hazlo Bien

- Registra el saldo inicial inmediatamente después de crear la cuenta
- Usa una categoría que tenga sentido contextual para el origen del dinero
- Agrega notas descriptivas claras (ej: "Saldo inicial al 30/12/2024")
- Verifica el monto antes de guardar
- Sé consistente con tus registros

### ❌ Evita

- Usar categorías sin sentido contextual (ej: "Salud" para registrar efectivo)
- Crear múltiples transacciones pequeñas en lugar de una sola
- No registrar el saldo inicial (dejará tu cuenta en $0)
- Usar fechas futuras para saldos iniciales
- Olvidar agregar notas explicativas

## 🛟 Soporte

Si tienes dudas o necesitas ayuda:

1. **Pregúntale a Oti**: Nuestro asistente de IA puede guiarte paso a paso
2. **Tutorial Visual**: Revisa el tour del producto en Ajustes
3. **Centro de Ayuda**: Encuentra más guías en Ajustes → Centro de Ayuda

---

**Última actualización**: 30 de diciembre de 2024
**Versión**: 2.0.0 - Sistema de Trazabilidad Completa