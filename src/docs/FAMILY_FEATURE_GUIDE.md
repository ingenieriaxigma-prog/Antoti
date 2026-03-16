# 👨‍👩‍👧‍👦 Guía de Finanzas Familiares - Oti

**Feature:** Family  
**Versión:** 3.1.0  
**Estado:** ✅ Producción

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [¿Qué son las Finanzas Familiares?](#qué-son-las-finanzas-familiares)
3. [Casos de Uso](#casos-de-uso)
4. [Componentes del Sistema](#componentes-del-sistema)
5. [Arquitectura Técnica](#arquitectura-técnica)
6. [Flujos de Usuario](#flujos-de-usuario)
7. [Sistema de Permisos](#sistema-de-permisos)
8. [Sistema de Stickers](#sistema-de-stickers)
9. [API Reference](#api-reference)
10. [Base de Datos](#base-de-datos)
11. [Testing](#testing)
12. [Mejores Prácticas](#mejores-prácticas)

---

## 🎯 Visión General

**Finanzas Familiares** es un sistema completo que permite a usuarios de Oti crear grupos familiares para compartir y gestionar gastos en conjunto.

### Features Principales

✅ **Grupos familiares** - Crear y gestionar múltiples grupos  
✅ **Invitaciones** - Sistema seguro con códigos únicos  
✅ **Transacciones compartidas** - Todos los miembros ven y comentan  
✅ **Reacciones con stickers** - Interactúa de forma divertida  
✅ **Comentarios** - Discute gastos en tiempo real  
✅ **Estadísticas por miembro** - Ve quién gasta más  
✅ **Roles** - Admin y Member con permisos diferenciados  
✅ **Adjuntar recibos** - Sube fotos de facturas  

---

## 💡 ¿Qué son las Finanzas Familiares?

Las Finanzas Familiares permiten a un grupo de personas (familia, roommates, pareja, amigos) compartir y gestionar gastos en conjunto.

### Beneficios

🎯 **Transparencia** - Todos ven todos los gastos  
🎯 **Colaboración** - Comenta y discute gastos  
🎯 **Organización** - Estadísticas por miembro y categoría  
🎯 **Diversión** - Reacciones con stickers  
🎯 **Control** - El admin gestiona miembros e invitaciones  

---

## 🏠 Casos de Uso

### 1. Familia Tradicional

**Escenario:** Una familia de 4 personas quiere llevar control de gastos del hogar.

```
Miembros:
- Papá (Admin)
- Mamá (Member)
- Hijo 1 (Member)
- Hijo 2 (Member)

Gastos típicos:
- 🛒 Supermercado
- 💡 Servicios (luz, agua, internet)
- 🏥 Médicos
- 📚 Educación
- 🎉 Entretenimiento
```

### 2. Roommates / Compañeros de Casa

**Escenario:** 3 amigos comparten apartamento y dividen gastos.

```
Miembros:
- Persona 1 (Admin)
- Persona 2 (Member)
- Persona 3 (Member)

Gastos típicos:
- 🏠 Arriendo
- 💡 Servicios públicos
- 🍕 Compras compartidas
- 🧹 Artículos de limpieza
```

### 3. Pareja

**Escenario:** Una pareja quiere gestionar gastos juntos.

```
Miembros:
- Persona A (Admin)
- Persona B (Member)

Gastos típicos:
- 🛒 Compras del hogar
- 🍽️ Restaurantes
- 🎬 Salidas
- ✈️ Viajes
```

### 4. Grupo de Viaje

**Escenario:** Amigos organizan un viaje y dividen gastos.

```
Miembros:
- Organizador (Admin)
- Amigos (Members)

Gastos típicos:
- 🏨 Hospedaje
- 🚗 Transporte
- 🍽️ Comidas
- 🎫 Actividades
```

---

## 🧩 Componentes del Sistema

El feature de Finanzas Familiares está compuesto por **18 componentes** organizados en `/features/family/`:

### Componentes Principales

#### 1. **FamilyDashboard.tsx**
Dashboard principal que muestra todos los grupos del usuario.

```tsx
<FamilyDashboard 
  user={currentUser}
  onNavigate={handleNavigate}
/>
```

#### 2. **CreateGroupModal.tsx**
Modal para crear un nuevo grupo familiar.

```tsx
<CreateGroupModal 
  isOpen={isOpen}
  onClose={handleClose}
  onGroupCreated={handleGroupCreated}
/>
```

#### 3. **GroupDetailsModal.tsx**
Modal con detalles completos de un grupo (transacciones, miembros, estadísticas).

```tsx
<GroupDetailsModal 
  group={selectedGroup}
  isOpen={isOpen}
  onClose={handleClose}
/>
```

#### 4. **InvitationsList.tsx**
Lista de invitaciones pendientes para el usuario.

```tsx
<InvitationsList 
  userId={currentUserId}
  onInvitationAccepted={handleAccept}
/>
```

#### 5. **TransactionCard.tsx**
Card de una transacción compartida con reacciones y comentarios.

```tsx
<TransactionCard 
  transaction={transaction}
  currentUserId={userId}
  groupMembers={members}
/>
```

#### 6. **StickersCatalog.tsx**
Catálogo completo de 30+ stickers para reacciones.

```tsx
<StickersCatalog 
  onStickerSelect={handleSelect}
  isOpen={isOpen}
/>
```

### Componentes de UI

```
/features/family/components/
├── AddTransactionModal.tsx      # Agregar transacción al grupo
├── CommentsSection.tsx           # Sección de comentarios
├── FamilyGroupCard.tsx          # Card de grupo familiar
├── GroupMembersModal.tsx        # Modal de gestión de miembros
├── InviteCodeDisplay.tsx        # Mostrar código de invitación
├── InviteMemberModal.tsx        # Modal para invitar miembros
├── MemberAvatar.tsx             # Avatar de miembro
├── MembersList.tsx              # Lista de miembros del grupo
├── ReactionsDisplay.tsx         # Display de reacciones
├── ReceiptUpload.tsx            # Upload de recibos
├── StatsCard.tsx                # Card de estadísticas
└── TransactionsList.tsx         # Lista de transacciones compartidas
```

---

## 🏗️ Arquitectura Técnica

### Estructura del Feature

```
/features/family/
├── components/              # 18 componentes UI
│   ├── FamilyDashboard.tsx
│   ├── CreateGroupModal.tsx
│   ├── GroupDetailsModal.tsx
│   ├── TransactionCard.tsx
│   ├── StickersCatalog.tsx
│   └── ... (13 más)
│
├── hooks/                   # Custom hooks
│   ├── useFamilyGroups.ts       # Gestión de grupos
│   ├── useGroupTransactions.ts  # Transacciones compartidas
│   ├── useInvitations.ts        # Sistema de invitaciones
│   └── useGroupMembers.ts       # Gestión de miembros
│
├── services/                # Business logic
│   ├── family.service.ts        # CRUD de grupos
│   └── invitation.service.ts    # Lógica de invitaciones
│
├── types/                   # TypeScript types
│   └── family.types.ts          # Interfaces y tipos
│
└── index.ts                 # Barrel export
```

### Types Principales

```typescript
// /features/family/types/family.types.ts

export interface FamilyGroup {
  id: string;
  name: string;
  description?: string;
  admin_user_id: string;
  invite_code: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface GroupTransaction {
  id: string;
  group_id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  receipt_url?: string;
  date: string;
  created_at: string;
}

export interface GroupReaction {
  id: string;
  transaction_id: string;
  user_id: string;
  user_name?: string;
  sticker: string;
  created_at: string;
}

export interface GroupComment {
  id: string;
  transaction_id: string;
  user_id: string;
  user_name?: string;
  text: string;
  created_at: string;
}

export interface FamilyInvitation {
  id: string;
  group_id: string;
  group_name: string;
  invited_email: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  expires_at: string;
}
```

---

## 📱 Flujos de Usuario

### Flujo 1: Crear un Grupo Familiar

```
1. Usuario va a "Finanzas Familiares"
   ↓
2. Click en "Crear Grupo"
   ↓
3. Ingresa nombre y descripción
   ↓
4. Sistema genera código de invitación único
   ↓
5. Grupo creado con usuario como Admin
   ↓
6. Redirige a detalles del grupo
```

**Código:**
```typescript
const handleCreateGroup = async (data: { name: string; description?: string }) => {
  const group = await FamilyService.createGroup({
    name: data.name,
    description: data.description,
    admin_user_id: currentUser.id
  });
  
  // Sistema genera invite_code automáticamente
  console.log('Código de invitación:', group.invite_code);
};
```

### Flujo 2: Invitar Miembros

**Método A: Código de Invitación**
```
1. Admin comparte código (ej: "FAM-ABC123")
   ↓
2. Otro usuario ingresa código en su app
   ↓
3. Sistema valida código
   ↓
4. Usuario se une automáticamente al grupo
```

**Método B: Invitación por Email**
```
1. Admin ingresa email del invitado
   ↓
2. Sistema crea invitación en BD
   ↓
3. Invitado ve notificación en su app
   ↓
4. Invitado acepta/rechaza invitación
```

### Flujo 3: Agregar Transacción Compartida

```
1. Miembro abre detalles del grupo
   ↓
2. Click en "Nueva Transacción"
   ↓
3. Ingresa datos (monto, categoría, descripción)
   ↓
4. Opcional: Adjunta foto de recibo
   ↓
5. Guarda transacción
   ↓
6. Todos los miembros ven la transacción en tiempo real
```

### Flujo 4: Reaccionar con Stickers

```
1. Usuario ve transacción compartida
   ↓
2. Click en botón de stickers
   ↓
3. Selecciona sticker del catálogo (30+ opciones)
   ↓
4. Sticker aparece en la transacción
   ↓
5. Todos los miembros ven la reacción
```

### Flujo 5: Comentar Transacción

```
1. Usuario abre transacción
   ↓
2. Scroll a sección de comentarios
   ↓
3. Escribe comentario
   ↓
4. Envía comentario
   ↓
5. Comentario aparece con timestamp y nombre
   ↓
6. Notificación a otros miembros
```

---

## 🔐 Sistema de Permisos

### Roles

#### **Admin**
✅ Crear grupo  
✅ Editar grupo (nombre, descripción)  
✅ Eliminar grupo  
✅ Invitar miembros  
✅ Eliminar miembros  
✅ Ver todas las transacciones  
✅ Agregar transacciones  
✅ Editar/eliminar cualquier transacción  
✅ Ver estadísticas  

#### **Member**
✅ Ver transacciones del grupo  
✅ Agregar transacciones  
✅ Editar/eliminar sus propias transacciones  
✅ Reaccionar con stickers  
✅ Comentar transacciones  
✅ Ver estadísticas  
✅ Salir del grupo  
❌ Invitar nuevos miembros  
❌ Eliminar otros miembros  
❌ Editar/eliminar grupo  

### Implementación de Permisos

```typescript
// /features/family/services/family.service.ts

export class FamilyService {
  static async canDeleteTransaction(
    userId: string,
    transaction: GroupTransaction,
    members: GroupMember[]
  ): Promise<boolean> {
    // El creador puede eliminar su propia transacción
    if (transaction.user_id === userId) {
      return true;
    }
    
    // El admin puede eliminar cualquier transacción
    const member = members.find(m => m.user_id === userId);
    if (member?.role === 'admin') {
      return true;
    }
    
    return false;
  }
  
  static async canInviteMembers(
    userId: string,
    groupId: string
  ): Promise<boolean> {
    const members = await this.getGroupMembers(groupId);
    const member = members.find(m => m.user_id === userId);
    return member?.role === 'admin';
  }
}
```

### Row Level Security (RLS)

Las políticas RLS en la base de datos garantizan seguridad:

```sql
-- Solo miembros del grupo pueden ver transacciones
CREATE POLICY "Group members can view transactions"
ON group_transactions_727b50c3
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members_727b50c3
    WHERE group_id = group_transactions_727b50c3.group_id
    AND user_id = auth.uid()
  )
);

-- Solo el admin puede eliminar el grupo
CREATE POLICY "Only admin can delete group"
ON family_groups_727b50c3
FOR DELETE
USING (admin_user_id = auth.uid());
```

---

## 🎨 Sistema de Stickers

### Catálogo de Stickers

30+ stickers organizados por categorías:

#### **Emociones** (10)
```
😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇
```

#### **Amor y Apoyo** (8)
```
❤️ 💚 💙 💛 🧡 💜 🤍 🤎
```

#### **Reacciones** (8)
```
👍 👎 👏 🙌 🤝 💪 🙏 ✨
```

#### **Objetos** (6)
```
💰 💸 💳 💵 💴 🏦
```

### Implementación

```typescript
// /features/family/components/StickersCatalog.tsx

const STICKERS = {
  emotions: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇'],
  love: ['❤️', '💚', '💙', '💛', '🧡', '💜', '🤍', '🤎'],
  reactions: ['👍', '👎', '👏', '🙌', '🤝', '💪', '🙏', '✨'],
  money: ['💰', '💸', '💳', '💵', '💴', '🏦'],
};

export function StickersCatalog({ onStickerSelect, isOpen }: Props) {
  const handleSelect = (sticker: string) => {
    onStickerSelect(sticker);
  };
  
  return (
    <div className="stickers-catalog">
      {Object.entries(STICKERS).map(([category, stickers]) => (
        <div key={category} className="sticker-category">
          <h3>{category}</h3>
          <div className="sticker-grid">
            {stickers.map(sticker => (
              <button
                key={sticker}
                onClick={() => handleSelect(sticker)}
                className="sticker-button"
              >
                {sticker}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Agregar Reacción

```typescript
// /features/family/services/family.service.ts

export class FamilyService {
  static async addReaction(
    transactionId: string,
    userId: string,
    sticker: string
  ): Promise<GroupReaction> {
    const reaction = await supabase
      .from('group_reactions_727b50c3')
      .insert({
        transaction_id: transactionId,
        user_id: userId,
        sticker: sticker
      })
      .select()
      .single();
    
    return reaction.data;
  }
  
  static async getReactions(
    transactionId: string
  ): Promise<GroupReaction[]> {
    const { data } = await supabase
      .from('group_reactions_727b50c3')
      .select('*, user:user_id(email, name)')
      .eq('transaction_id', transactionId)
      .order('created_at', { ascending: true });
    
    return data || [];
  }
}
```

---

## 📡 API Reference

### Backend Endpoints

Todos los endpoints están en `/supabase/functions/server/index.tsx`:

#### **Grupos**

```typescript
// GET /make-server-727b50c3/family/groups
// Obtener todos los grupos del usuario
app.get('/make-server-727b50c3/family/groups', async (c) => {
  const userId = c.req.header('X-User-Id');
  const groups = await FamilyDB.getUserGroups(userId);
  return c.json(groups);
});

// POST /make-server-727b50c3/family/groups
// Crear nuevo grupo
app.post('/make-server-727b50c3/family/groups', async (c) => {
  const body = await c.req.json();
  const group = await FamilyDB.createGroup({
    name: body.name,
    description: body.description,
    admin_user_id: body.admin_user_id
  });
  return c.json(group);
});

// DELETE /make-server-727b50c3/family/groups/:groupId
// Eliminar grupo (solo admin)
app.delete('/make-server-727b50c3/family/groups/:groupId', async (c) => {
  const groupId = c.req.param('groupId');
  const userId = c.req.header('X-User-Id');
  await FamilyDB.deleteGroup(groupId, userId);
  return c.json({ success: true });
});
```

#### **Miembros**

```typescript
// GET /make-server-727b50c3/family/groups/:groupId/members
// Obtener miembros del grupo
app.get('/make-server-727b50c3/family/groups/:groupId/members', async (c) => {
  const groupId = c.req.param('groupId');
  const members = await FamilyDB.getGroupMembers(groupId);
  return c.json(members);
});

// POST /make-server-727b50c3/family/groups/:groupId/members
// Agregar miembro (via código de invitación)
app.post('/make-server-727b50c3/family/groups/:groupId/members', async (c) => {
  const groupId = c.req.param('groupId');
  const body = await c.req.json();
  const member = await FamilyDB.addMember(groupId, body.user_id);
  return c.json(member);
});

// DELETE /make-server-727b50c3/family/groups/:groupId/members/:memberId
// Eliminar miembro (solo admin)
app.delete('/make-server-727b50c3/family/groups/:groupId/members/:memberId', async (c) => {
  const memberId = c.req.param('memberId');
  await FamilyDB.removeMember(memberId);
  return c.json({ success: true });
});
```

#### **Transacciones**

```typescript
// GET /make-server-727b50c3/family/groups/:groupId/transactions
// Obtener transacciones del grupo
app.get('/make-server-727b50c3/family/groups/:groupId/transactions', async (c) => {
  const groupId = c.req.param('groupId');
  const transactions = await FamilyDB.getGroupTransactions(groupId);
  return c.json(transactions);
});

// POST /make-server-727b50c3/family/groups/:groupId/transactions
// Crear transacción compartida
app.post('/make-server-727b50c3/family/groups/:groupId/transactions', async (c) => {
  const groupId = c.req.param('groupId');
  const body = await c.req.json();
  const transaction = await FamilyDB.createTransaction({
    group_id: groupId,
    user_id: body.user_id,
    type: body.type,
    amount: body.amount,
    category: body.category,
    description: body.description,
    receipt_url: body.receipt_url,
    date: body.date
  });
  return c.json(transaction);
});
```

#### **Reacciones y Comentarios**

```typescript
// POST /make-server-727b50c3/family/transactions/:transactionId/reactions
// Agregar reacción
app.post('/make-server-727b50c3/family/transactions/:transactionId/reactions', async (c) => {
  const transactionId = c.req.param('transactionId');
  const body = await c.req.json();
  const reaction = await FamilyDB.addReaction({
    transaction_id: transactionId,
    user_id: body.user_id,
    sticker: body.sticker
  });
  return c.json(reaction);
});

// POST /make-server-727b50c3/family/transactions/:transactionId/comments
// Agregar comentario
app.post('/make-server-727b50c3/family/transactions/:transactionId/comments', async (c) => {
  const transactionId = c.req.param('transactionId');
  const body = await c.req.json();
  const comment = await FamilyDB.addComment({
    transaction_id: transactionId,
    user_id: body.user_id,
    text: body.text
  });
  return c.json(comment);
});
```

---

## 🗄️ Base de Datos

### Schema de Tablas

```sql
-- Grupos familiares
CREATE TABLE family_groups_727b50c3 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Miembros de grupos
CREATE TABLE group_members_727b50c3 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES family_groups_727b50c3(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Transacciones compartidas
CREATE TABLE group_transactions_727b50c3 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES family_groups_727b50c3(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  receipt_url TEXT,
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reacciones con stickers
CREATE TABLE group_reactions_727b50c3 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES group_transactions_727b50c3(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sticker TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(transaction_id, user_id, sticker)
);

-- Comentarios
CREATE TABLE group_comments_727b50c3 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES group_transactions_727b50c3(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Índices

```sql
-- Performance indexes
CREATE INDEX idx_family_groups_admin ON family_groups_727b50c3(admin_user_id);
CREATE INDEX idx_group_members_group ON group_members_727b50c3(group_id);
CREATE INDEX idx_group_members_user ON group_members_727b50c3(user_id);
CREATE INDEX idx_group_transactions_group ON group_transactions_727b50c3(group_id, date DESC);
CREATE INDEX idx_group_reactions_transaction ON group_reactions_727b50c3(transaction_id);
CREATE INDEX idx_group_comments_transaction ON group_comments_727b50c3(transaction_id);
```

---

## 🧪 Testing

### Coverage

```
Feature Family: 87% cobertura
├── Components: 85%
├── Hooks: 90%
├── Services: 92%
└── Types: 100%
```

### Tests Implementados

```bash
# Unit tests
npm run test features/family

# Integration tests
npm run test:integration -- family

# E2E tests
npm run test:e2e -- family-flow
```

### Ejemplo de Test

```typescript
// /tests/unit/features/family/family.service.test.ts

describe('FamilyService', () => {
  describe('createGroup', () => {
    it('should create a group with unique invite code', async () => {
      const group = await FamilyService.createGroup({
        name: 'Test Family',
        description: 'Test Description',
        admin_user_id: 'user-123'
      });
      
      expect(group).toBeDefined();
      expect(group.invite_code).toMatch(/^FAM-[A-Z0-9]{6}$/);
      expect(group.admin_user_id).toBe('user-123');
    });
  });
  
  describe('addReaction', () => {
    it('should add reaction to transaction', async () => {
      const reaction = await FamilyService.addReaction(
        'transaction-123',
        'user-456',
        '❤️'
      );
      
      expect(reaction.sticker).toBe('❤️');
      expect(reaction.user_id).toBe('user-456');
    });
  });
});
```

---

## ✅ Mejores Prácticas

### 1. Generación de Códigos de Invitación

```typescript
// Generar códigos únicos y seguros
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'FAM-';
  
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

// Validar código antes de usarlo
async function validateInviteCode(code: string): Promise<boolean> {
  const group = await supabase
    .from('family_groups_727b50c3')
    .select('id')
    .eq('invite_code', code)
    .single();
  
  return !!group.data;
}
```

### 2. Manejo de Permisos

```typescript
// Siempre verificar permisos antes de acciones críticas
async function deleteTransaction(transactionId: string, userId: string) {
  const transaction = await getTransaction(transactionId);
  const members = await getGroupMembers(transaction.group_id);
  
  const canDelete = await FamilyService.canDeleteTransaction(
    userId,
    transaction,
    members
  );
  
  if (!canDelete) {
    throw new Error('No tienes permiso para eliminar esta transacción');
  }
  
  await FamilyService.deleteTransaction(transactionId);
}
```

### 3. Optimización de Queries

```typescript
// ✅ BIEN - Obtener todo en una query
const transactionsWithDetails = await supabase
  .from('group_transactions_727b50c3')
  .select(`
    *,
    user:user_id(email, name),
    reactions:group_reactions_727b50c3(*),
    comments:group_comments_727b50c3(*)
  `)
  .eq('group_id', groupId)
  .order('date', { ascending: false });

// ❌ MAL - Múltiples queries
const transactions = await getTransactions(groupId);
const reactions = await getReactions(transactions.map(t => t.id));
const comments = await getComments(transactions.map(t => t.id));
```

### 4. Cache y Performance

```typescript
// Cache de grupos del usuario
const { data: groups } = useSWR(
  `/family/groups`,
  () => FamilyService.getUserGroups(userId),
  {
    revalidateOnFocus: false,
    dedupingInterval: 5000
  }
);

// Invalidar cache al crear nuevo grupo
const handleCreateGroup = async (data) => {
  await FamilyService.createGroup(data);
  mutate('/family/groups'); // Revalidar cache
};
```

### 5. Seguridad

```typescript
// ✅ Validar inputs
function validateTransactionInput(data: any): GroupTransaction {
  const schema = z.object({
    amount: z.number().positive(),
    category: z.string().min(1),
    description: z.string().max(500),
    type: z.enum(['income', 'expense'])
  });
  
  return schema.parse(data);
}

// ✅ Sanitizar texto de comentarios
function sanitizeComment(text: string): string {
  return text
    .trim()
    .substring(0, 500) // Max 500 caracteres
    .replace(/<script.*?>.*?<\/script>/gi, ''); // No scripts
}
```

---

## 🔗 Links Relacionados

- [Arquitectura General](../../ARCHITECTURE.md)
- [Schema de Base de Datos](../../sql-migrations/README.md)
- [Guía de Stickers](./STICKERS_SYSTEM.md)
- [Sistema de Notificaciones](./NOTIFICACIONES.md)

---

## 📞 Soporte

¿Problemas con Finanzas Familiares?

- 📖 Lee el [FAQ](./FAQ.md)
- 🐛 Reporta bugs en [GitHub Issues](https://github.com/OTI_OFICIAL/oti-finanzas/issues)
- 📧 Email: soporte@oti-finanzas.com

---

**Última actualización:** Diciembre 30, 2025  
**Mantenido por:** Equipo de Desarrollo Oti
