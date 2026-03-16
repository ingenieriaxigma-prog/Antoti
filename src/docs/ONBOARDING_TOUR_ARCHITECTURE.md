# 🎓 Arquitectura de Tours Multi-Pantalla - Oti

## 📋 Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Tour Actual del Dashboard](#tour-actual-del-dashboard)
3. [Arquitectura Profesional Recomendada](#arquitectura-profesional-recomendada)
4. [Implementación Paso a Paso](#implementación-paso-a-paso)
5. [Best Practices](#best-practices)

---

## 🎯 Visión General

Actualmente Oti tiene un **tour completo de onboarding** en el Dashboard con 13 pasos que guía a los nuevos usuarios por las funciones principales. Ahora queremos **extender este sistema** a otras pantallas de forma profesional.

### ✅ Tour Actual (Dashboard)
- ✨ 13 pasos con spotlight dinámico
- 🎯 Anillos de pulso verdes esmeralda
- 📍 Scroll automático a elementos
- 🌙 Soporte Dark Mode
- 💾 Guardado en `localStorage`
- ♻️ Repetible haciendo clic en logo de Oti

---

## 🏗️ Arquitectura Profesional Recomendada

### **Opción 1: Tours Contextuales por Pantalla** ⭐ RECOMENDADO

Cada pantalla importante tiene su **propio mini-tour** que se activa **la primera vez** que el usuario visita esa sección.

#### 📦 Estructura:
```
/components/onboarding/
├── OnboardingTour.tsx          (Tour principal del Dashboard - ya existe)
├── useTour.tsx                 (Hook reutilizable para gestionar tours)
├── TourSpotlight.tsx           (Componente de spotlight reutilizable)
└── tours/
    ├── dashboardTourSteps.ts   (Steps del Dashboard)
    ├── budgetsTourSteps.ts     (Steps de Presupuestos)
    ├── statisticsTourSteps.ts  (Steps de Estadísticas)
    ├── accountsTourSteps.ts    (Steps de Cuentas)
    └── otiChatTourSteps.ts     (Steps de OtiChat)
```

#### 💾 LocalStorage Keys:
```typescript
'oti_tour_dashboard_completed'    // Tour principal
'oti_tour_budgets_completed'      // Tour de Presupuestos
'oti_tour_statistics_completed'   // Tour de Estadísticas
'oti_tour_accounts_completed'     // Tour de Cuentas
'oti_tour_otichat_completed'      // Tour de OtiChat
```

#### ✨ Ventajas:
- ✅ **No abruma** al usuario con un tour de 50 pasos
- ✅ **Contexto específico**: Aprende sobre Presupuestos cuando entra a Presupuestos
- ✅ **Progresivo**: Descubrimiento gradual de funciones
- ✅ **Fácil mantenimiento**: Cada pantalla maneja su propio tour
- ✅ **Reutilizable**: Un solo componente `<TourSpotlight>` para todas las pantallas

---

### **Opción 2: Tour Global con Navegación Automática**

Un tour largo que **navega automáticamente** entre pantallas mostrando las funciones de cada sección.

#### ✨ Ventajas:
- ✅ Un solo tour completo y estructurado
- ✅ El usuario ve TODA la app de una vez

#### ❌ Desventajas:
- ⚠️ Demasiado largo (puede cansar al usuario)
- ⚠️ Requiere navegación automática (puede desorientar)
- ⚠️ Difícil de mantener si hay muchas pantallas

---

### **Opción 3: Tour Híbrido** (Combinación de 1 y 2)

- **Tour principal del Dashboard** (ya existe) que presenta las bases
- Al final del tour, se muestra un mensaje: *"Cuando visites otras secciones, te mostraremos un mini-tour específico"*
- Cada pantalla tiene su **mini-tour contextual** que se activa la primera vez

#### ✨ Ventajas:
- ✅ Lo mejor de ambos mundos
- ✅ Tour inicial corto y enfocado
- ✅ Aprendizaje contextual en cada pantalla
- ✅ No requiere navegación automática

---

## 🚀 Implementación Paso a Paso

### **FASE 1: Crear Hook Reutilizable `useTour`**

Este hook manejará la lógica común de todos los tours.

```typescript
// /components/onboarding/useTour.tsx
import { useState, useEffect } from 'react';

interface UseTourOptions {
  storageKey: string;
  enabled?: boolean;
}

export function useTour({ storageKey, enabled = true }: UseTourOptions) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    
    const tourCompleted = localStorage.getItem(storageKey);
    if (!tourCompleted) {
      // Pequeño delay para que el DOM se monte
      setTimeout(() => setIsActive(true), 500);
    }
  }, [storageKey, enabled]);

  const completeTour = () => {
    localStorage.setItem(storageKey, 'true');
    setIsActive(false);
  };

  const resetTour = () => {
    localStorage.removeItem(storageKey);
    setIsActive(true);
    setCurrentStep(0);
  };

  const nextStep = (totalSteps: number) => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return {
    isActive,
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    completeTour,
    resetTour,
  };
}
```

---

### **FASE 2: Crear Componente Reutilizable `TourSpotlight`**

Un componente genérico que puede usarse en **cualquier pantalla**.

```typescript
// /components/onboarding/TourSpotlight.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface TourStep {
  id: string;
  target: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightPadding?: number;
}

interface TourSpotlightProps {
  steps: TourStep[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isActive: boolean;
  darkMode?: boolean;
}

export function TourSpotlight({ 
  steps, 
  currentStep, 
  onNext, 
  onPrev, 
  onSkip, 
  isActive,
  darkMode = false 
}: TourSpotlightProps) {
  // ... Toda la lógica de spotlight, anillos de pulso, tooltips ...
  // (Copiar la implementación actual de OnboardingTour.tsx)
  
  if (!isActive) return null;
  
  return (
    // ... JSX del spotlight ...
  );
}
```

---

### **FASE 3: Definir Steps por Pantalla**

Cada pantalla tiene un archivo con sus pasos específicos.

```typescript
// /components/onboarding/tours/budgetsTourSteps.ts
import { Target, DollarSign, Calendar, TrendingDown } from 'lucide-react';

export const budgetsTourSteps = [
  {
    id: 'budgets-welcome',
    target: '',
    title: '¡Bienvenido a Presupuestos! 🎯',
    description: 'Aquí puedes crear y controlar presupuestos mensuales para cada categoría de gastos.',
    icon: <Target className="w-6 h-6" />,
    placement: 'center',
  },
  {
    id: 'create-budget',
    target: 'create-budget-button',
    title: 'Crea tu Primer Presupuesto 💰',
    description: 'Toca el botón "+" para crear un presupuesto. Define un límite mensual y Oti te alertará cuando te acerques.',
    icon: <DollarSign className="w-6 h-6" />,
    placement: 'top',
    highlightPadding: 12,
  },
  {
    id: 'budget-card',
    target: 'budget-card-0',
    title: 'Seguimiento Visual 📊',
    description: 'Cada presupuesto muestra una barra de progreso. Verde = bien, amarillo = cuidado, rojo = límite superado.',
    icon: <TrendingDown className="w-6 h-6" />,
    placement: 'bottom',
    highlightPadding: 16,
  },
  // ... más steps ...
];
```

---

### **FASE 4: Usar en Cada Pantalla**

```typescript
// /features/budgets/components/BudgetsScreen.tsx
import { useTour } from '../../../components/onboarding/useTour';
import { TourSpotlight } from '../../../components/onboarding/TourSpotlight';
import { budgetsTourSteps } from '../../../components/onboarding/tours/budgetsTourSteps';

export default function BudgetsScreen() {
  const { 
    isActive, 
    currentStep, 
    nextStep, 
    prevStep, 
    completeTour 
  } = useTour({ 
    storageKey: 'oti_tour_budgets_completed',
    enabled: true // Solo se activa la PRIMERA vez que visitas esta pantalla
  });

  return (
    <div>
      {/* ... Tu pantalla normal ... */}
      
      {/* Tour contextual */}
      <TourSpotlight
        steps={budgetsTourSteps}
        currentStep={currentStep}
        onNext={() => nextStep(budgetsTourSteps.length)}
        onPrev={prevStep}
        onSkip={completeTour}
        isActive={isActive}
        darkMode={darkMode}
      />
    </div>
  );
}
```

---

## 🎯 Best Practices

### 1. **Duración Ideal de Tours**
- ✅ **Tour principal (Dashboard)**: 10-15 pasos máximo
- ✅ **Tours contextuales**: 3-5 pasos por pantalla
- ❌ **Evitar**: Tours de más de 20 pasos (cansan al usuario)

### 2. **Timing de Activación**
```typescript
// ✅ BUENO: Delay de 500ms para que el DOM se estabilice
setTimeout(() => setIsActive(true), 500);

// ❌ MALO: Activar inmediatamente (puede no encontrar elementos)
setIsActive(true);
```

### 3. **Mensajes Claros y Concisos**
```typescript
// ✅ BUENO
description: 'Toca el botón "+" para crear un presupuesto mensual.'

// ❌ MALO (muy largo)
description: 'En esta sección puedes gestionar tus presupuestos mensuales. Los presupuestos te permiten establecer límites de gasto para diferentes categorías y Oti te enviará notificaciones cuando estés cerca de alcanzar el límite. Para crear un presupuesto, simplemente toca el botón "+" que se encuentra en la esquina superior derecha...'
```

### 4. **Reinicio de Tours**
Permitir al usuario **repetir cualquier tour** desde la pantalla de Configuración:

```typescript
// Pantalla de Configuración
<button onClick={() => {
  localStorage.removeItem('oti_tour_budgets_completed');
  navigate('/budgets');
}}>
  🎓 Repetir Tour de Presupuestos
</button>
```

### 5. **Analytics (Opcional)**
Trackear qué tours completan los usuarios:

```typescript
const completeTour = () => {
  localStorage.setItem(storageKey, 'true');
  
  // Analytics (opcional)
  analytics.track('tour_completed', {
    tour_name: storageKey,
    steps_completed: currentStep + 1,
    completion_time: Date.now() - startTime,
  });
  
  setIsActive(false);
};
```

---

## 📱 Ejemplo de Pantallas con Tours

### Pantallas Prioritarias para Tours:
1. ✅ **Dashboard** (ya implementado) - Tour principal
2. 🎯 **Budgets** - Crear y gestionar presupuestos
3. 📊 **Statistics** - Entender gráficos y análisis
4. 💬 **OtiChat** - Cómo chatear con el asistente IA
5. 💳 **Accounts** - Gestión de cuentas bancarias
6. 👥 **Family Groups** - Finanzas colaborativas

### Pantallas que NO necesitan tour:
- ⚙️ **Settings** - Es autoexplicativo
- 👤 **Profile** - Formulario simple

---

## 🎨 Personalización de Colores

Mantener la **paleta verde esmeralda** en todos los tours:

```css
/* Colores consistentes */
--tour-primary: #10b981;        /* Verde esmeralda */
--tour-glow: rgba(16, 185, 129, 0.5);
--tour-border: #10b981;
```

---

## 🔄 Flujo Completo del Usuario

### Primera Visita a Oti:
1. Usuario entra al Dashboard
2. Se muestra el **tour principal** (13 pasos)
3. Al completar, el usuario explora libremente
4. Cuando entra a **Presupuestos** por primera vez → Mini-tour de 4 pasos
5. Cuando entra a **Estadísticas** por primera vez → Mini-tour de 3 pasos
6. Y así sucesivamente...

### Visitas Posteriores:
- ✅ Tours ya completados NO se muestran
- ✅ Usuario puede **repetir cualquier tour** desde:
  - Logo de Oti (tour del Dashboard)
  - Botón "Ayuda" en cada pantalla (tour contextual)

---

## 📊 Métricas de Éxito

Para medir la efectividad de los tours:

```typescript
// Métricas recomendadas
interface TourMetrics {
  tour_started: boolean;
  tour_completed: boolean;
  steps_viewed: number;
  time_spent: number; // milliseconds
  skip_rate: number; // % de usuarios que saltaron
  completion_rate: number; // % de usuarios que completaron
}
```

---

## 🚀 Plan de Implementación Sugerido

### **Semana 1: Infraestructura**
- ✅ Crear `useTour` hook
- ✅ Refactorizar `OnboardingTour.tsx` para extraer `TourSpotlight`
- ✅ Crear estructura de carpetas `/tours/`

### **Semana 2: Tours Prioritarios**
- ✅ Tour de Presupuestos (3-4 pasos)
- ✅ Tour de Estadísticas (3-4 pasos)

### **Semana 3: Tours Secundarios**
- ✅ Tour de OtiChat (2-3 pasos)
- ✅ Tour de Accounts (2-3 pasos)

### **Semana 4: Pulido y Testing**
- ✅ Botones "Repetir Tour" en cada pantalla
- ✅ Testing en diferentes tamaños de pantalla
- ✅ Ajustes de UX según feedback

---

## 💡 Conclusión

La **Opción 1 (Tours Contextuales)** es la más profesional porque:
- ✅ No abruma al usuario
- ✅ Aprendizaje progresivo y contextual
- ✅ Fácil de mantener y escalar
- ✅ Mejor UX (tours cortos y específicos)
- ✅ Usado por apps como **Notion**, **Figma**, **Linear**

**Siguiente paso recomendado:**  
Implementar el tour de **Presupuestos** como prueba de concepto usando esta arquitectura.

---

**Documentado por:** Sistema de Onboarding Oti  
**Fecha:** Noviembre 2024  
**Versión:** 1.0
