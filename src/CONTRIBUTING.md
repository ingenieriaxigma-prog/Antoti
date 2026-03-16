# 🤝 Guía de Contribución - Oti Finanzas Personales

¡Gracias por tu interés en contribuir a Oti! Este documento te guiará a través del proceso de contribución.

---

## 📋 Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
3. [Proceso de Desarrollo](#proceso-de-desarrollo)
4. [Guías de Estilo](#guías-de-estilo)
5. [Reportar Bugs](#reportar-bugs)
6. [Sugerir Features](#sugerir-features)
7. [Pull Requests](#pull-requests)
8. [Configuración del Entorno](#configuración-del-entorno)

---

## 📜 Código de Conducta

### Nuestro Compromiso

Nosotros, como miembros, contribuyentes y administradores nos comprometemos a hacer de la participación en nuestra comunidad una experiencia libre de acoso para todo el mundo.

### Comportamiento Esperado

✅ Usar lenguaje acogedor e inclusivo  
✅ Respetar diferentes puntos de vista y experiencias  
✅ Aceptar críticas constructivas con gracia  
✅ Enfocarse en lo que es mejor para la comunidad  
✅ Mostrar empatía hacia otros miembros de la comunidad  

### Comportamiento Inaceptable

❌ Lenguaje o imágenes sexualizadas  
❌ Comentarios insultantes o despectivos (trolling)  
❌ Acoso público o privado  
❌ Publicar información privada de otros  
❌ Conducta que podría considerarse inapropiada en un entorno profesional  

---

## 🎯 ¿Cómo puedo contribuir?

Hay muchas formas de contribuir a Oti:

### 1. Reportar Bugs 🐛

¿Encontraste un bug? ¡Repórtalo! Ver [Reportar Bugs](#reportar-bugs)

### 2. Sugerir Features ✨

¿Tienes una idea para una nueva funcionalidad? Ver [Sugerir Features](#sugerir-features)

### 3. Mejorar Documentación 📖

La documentación siempre puede mejorar:
- Corregir typos
- Agregar ejemplos
- Aclarar instrucciones confusas
- Traducir a otros idiomas

### 4. Contribuir Código 💻

- Fix de bugs
- Implementar nuevas features
- Mejorar performance
- Refactorizar código

### 5. Ayudar en la Comunidad 💬

- Responder preguntas en Issues
- Ayudar a otros contribuyentes
- Compartir el proyecto en redes sociales

---

## 🔄 Proceso de Desarrollo

### 1. Fork del Repositorio

```bash
# Click en "Fork" en GitHub
# Luego clona tu fork
git clone https://github.com/TU_USUARIO/oti-finanzas.git
cd oti-finanzas
```

### 2. Agregar Upstream Remote

```bash
git remote add upstream https://github.com/OTI_OFICIAL/oti-finanzas.git
git fetch upstream
```

### 3. Crear una Rama

```bash
# Actualizar main
git checkout main
git pull upstream main

# Crear rama para tu feature
git checkout -b feature/nombre-descriptivo

# O para un bugfix
git checkout -b fix/nombre-del-bug
```

### 4. Hacer Cambios

```bash
# Haz tus cambios
# Asegúrate de seguir las guías de estilo

# Ejecuta los tests
npm run test

# Verifica TypeScript
npm run type-check

# Verifica el build
npm run build
```

### 5. Commit

```bash
# Stage tus cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: agregar búsqueda de transacciones"
```

Ver [Convención de Commits](#convención-de-commits) para el formato correcto.

### 6. Push y Pull Request

```bash
# Push a tu fork
git push origin feature/nombre-descriptivo

# Abre un Pull Request en GitHub
```

---

## 📝 Guías de Estilo

### TypeScript

✅ **Usar TypeScript para todo el código**

```typescript
// ✅ BIEN - Tipos explícitos
interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
}

function createTransaction(data: Transaction): Promise<Transaction> {
  // ...
}

// ❌ MAL - Sin tipos
function createTransaction(data) {
  // ...
}
```

### Nomenclatura

```typescript
// Componentes: PascalCase
TransactionsList.tsx
AccountCard.tsx

// Hooks: camelCase con prefijo "use"
useTransactions.ts
useFormValidation.ts

// Services: camelCase con sufijo ".service"
transaction.service.ts
budget.service.ts

// Utils: camelCase
dateUtils.ts
formatting.ts

// Constants: UPPER_SNAKE_CASE
const MAX_BUDGET_AMOUNT = 10000000;
const DEFAULT_CURRENCY = 'COP';
```

### Estructura de Archivos

```typescript
/**
 * ComponentName.tsx
 * 
 * Descripción breve del componente
 * 
 * @example
 * <ComponentName prop1="value" />
 */

// 1. Imports externos
import React from 'react';
import { motion } from 'framer-motion';

// 2. Imports internos
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks';

// 3. Imports del feature
import { useTransactions } from '../hooks';

// 4. Types
interface ComponentNameProps {
  // ...
}

// 5. Component
export function ComponentName({ ...props }: ComponentNameProps) {
  // Hooks
  // Effects
  // Handlers
  // Render
}
```

### Feature-First Architecture

Al agregar nuevas funcionalidades, sigue la arquitectura Feature-First:

```
/features/tu-feature/
├── components/
│   ├── TuFeatureScreen.tsx
│   ├── TuFeatureList.tsx
│   └── index.ts
├── hooks/
│   ├── useTuFeature.ts
│   └── index.ts
├── services/
│   ├── tu-feature.service.ts
│   └── index.ts
├── types/
│   ├── tu-feature.types.ts
│   └── index.ts
└── index.ts
```

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para detalles completos.

### Comentarios y Documentación

```typescript
/**
 * Calcula el balance total de una cuenta
 * 
 * @param accountId - ID de la cuenta
 * @param transactions - Array de transacciones
 * @returns Balance total de la cuenta
 * 
 * @example
 * const balance = calculateBalance('123', transactions);
 * // Returns: 150000
 */
function calculateBalance(
  accountId: string,
  transactions: Transaction[]
): number {
  // ...
}
```

### Convención de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato
<tipo>(<scope>): <descripción>

# Tipos
feat:     Nueva funcionalidad
fix:      Bug fix
docs:     Cambios en documentación
style:    Formato, punto y coma faltante, etc
refactor: Refactorización de código
test:     Agregar tests
chore:    Cambios en build, herramientas, etc

# Ejemplos
feat(transactions): agregar filtro por fecha
fix(budgets): corregir cálculo de progreso
docs(readme): actualizar guía de instalación
style(components): formatear código con prettier
refactor(hooks): simplificar useTransactions
test(services): agregar tests de AccountService
chore(deps): actualizar dependencias
```

### ESLint y Prettier

```bash
# Verificar linting
npm run lint

# Fix automático
npm run lint:fix

# Formatear código
npm run format
```

---

## 🐛 Reportar Bugs

### Antes de Reportar

1. **Verifica que sea un bug nuevo** - Busca en [Issues](https://github.com/OTI_OFICIAL/oti-finanzas/issues)
2. **Actualiza a la última versión** - El bug podría estar resuelto
3. **Intenta reproducirlo** - Asegúrate que sea consistente

### Template de Bug Report

```markdown
## Descripción del Bug
Descripción clara y concisa del problema.

## Pasos para Reproducir
1. Ir a '...'
2. Click en '....'
3. Scroll hasta '....'
4. Ver error

## Comportamiento Esperado
Qué debería suceder.

## Comportamiento Actual
Qué está sucediendo.

## Screenshots
Si aplica, agrega screenshots.

## Entorno
- Navegador: [e.g. Chrome 120]
- Dispositivo: [e.g. iPhone 13]
- OS: [e.g. iOS 16]
- Versión de Oti: [e.g. 3.1.0]

## Información Adicional
Cualquier otro contexto sobre el problema.
```

---

## ✨ Sugerir Features

### Antes de Sugerir

1. **Verifica si ya existe** - Busca en [Issues](https://github.com/OTI_OFICIAL/oti-finanzas/issues)
2. **Lee el roadmap** - Podría estar planeado en [ROADMAP.md](./PROXIMOS_PASOS_PRODUCCION.md)

### Template de Feature Request

```markdown
## ¿Es tu feature relacionado a un problema?
Descripción clara del problema. Ej: "Me frustra que..."

## Solución Propuesta
Descripción clara de lo que quieres que suceda.

## Alternativas Consideradas
Otras soluciones o features que has considerado.

## Contexto Adicional
Screenshots, mockups, o contexto adicional.

## Impacto Esperado
- [ ] Alta prioridad
- [ ] Media prioridad
- [ ] Baja prioridad

## Estimación de Esfuerzo
- [ ] Pequeño (< 4 horas)
- [ ] Mediano (1-3 días)
- [ ] Grande (> 1 semana)
```

---

## 🔀 Pull Requests

### Checklist antes de Enviar

- [ ] He leído la guía de contribución
- [ ] Mi código sigue el estilo del proyecto
- [ ] He agregado tests que prueban mi fix/feature
- [ ] Todos los tests nuevos y existentes pasan
- [ ] He actualizado la documentación
- [ ] He agregado entrada en CHANGELOG.md
- [ ] Mi commit sigue la convención de commits
- [ ] He probado en diferentes navegadores/dispositivos

### Template de Pull Request

```markdown
## Descripción
Descripción clara de los cambios realizados.

## Tipo de Cambio
- [ ] Bug fix (cambio no-breaking que soluciona un issue)
- [ ] Nuevo feature (cambio no-breaking que agrega funcionalidad)
- [ ] Breaking change (fix o feature que causa que funcionalidad existente cambie)
- [ ] Documentación

## ¿Cómo se ha probado?
Descripción de las pruebas realizadas.

## Checklist
- [ ] Tests pasan localmente
- [ ] He agregado tests para mi código
- [ ] He actualizado la documentación
- [ ] Mi código sigue el estilo del proyecto

## Screenshots (si aplica)
Agregar screenshots de los cambios UI.

## Issues Relacionados
Fixes #123
Related to #456
```

### Proceso de Review

1. **Automático:** Tests y linting se ejecutan automáticamente
2. **Manual:** Un maintainer revisará tu código
3. **Feedback:** Podrías recibir comentarios para mejorar
4. **Aprobación:** Una vez aprobado, será mergeado
5. **Merge:** Tu código será parte del proyecto! 🎉

---

## ⚙️ Configuración del Entorno

### Prerrequisitos

```bash
# Versiones requeridas
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
```

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/oti-finanzas.git
cd oti-finanzas

# 2. Instalar dependencias
npm install

# 3. Copiar .env.example
cp .env.example .env

# 4. Configurar variables de entorno
# Edita .env con tus credenciales

# 5. Setup de base de datos
# Ejecutar scripts en /sql-migrations/

# 6. Iniciar en desarrollo
npm run dev
```

### Variables de Entorno

```env
# Supabase (obligatorio)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key

# OpenAI (obligatorio para features IA)
VITE_OPENAI_API_KEY=sk-...

# Opcional
VITE_APP_VERSION=3.1.0
```

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Solo unit tests
npm run test:unit

# Solo integration tests
npm run test:integration
```

### Build

```bash
# Build para producción
npm run build

# Preview del build
npm run preview

# Type check
npm run type-check

# Lint
npm run lint
```

---

## 📚 Recursos Adicionales

### Documentación

- [Arquitectura](./ARCHITECTURE.md)
- [Guía de Desarrollador](./docs/DEVELOPER_GUIDE.md)
- [Guía de Testing](./tests/TESTING_GUIDE.md)
- [FAQ](./docs/FAQ.md)

### Tecnologías Principales

- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/docs)
- [Vitest](https://vitest.dev/)

### Comunidad

- 💬 [Discord](#) (próximamente)
- 📧 Email: dev@oti-finanzas.com
- 🐦 Twitter: [@oti_finanzas](#)

---

## 🙏 Agradecimientos

Gracias por contribuir a Oti! Cada contribución hace que el proyecto sea mejor. 🎉

---

## ❓ Preguntas

¿Tienes preguntas sobre cómo contribuir?

- Abre un [GitHub Issue](https://github.com/OTI_OFICIAL/oti-finanzas/issues)
- Envía un email a dev@oti-finanzas.com
- Únete a nuestro [Discord](#)

---

**Última actualización:** Diciembre 30, 2025  
**Mantenido por:** Equipo de Desarrollo Oti
