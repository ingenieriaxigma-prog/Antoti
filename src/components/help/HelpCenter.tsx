/**
 * Help Center - Centro de Ayuda Integrado
 * 
 * ✅ MEJORADO:
 * - Sidebar colapsable con botón toggle
 * - Colores corregidos para dark mode
 * - Más espacio para el contenido
 * - Mobile responsive
 */

import { useState } from 'react';
import {
  Search,
  BookOpen,
  Video,
  MessageCircle,
  ChevronRight,
  ExternalLink,
  Mail,
  HelpCircle,
  Lightbulb,
  FileText,
  X,
  Menu,
  Mic,
  Target
} from 'lucide-react';

type HelpCategory = 'getting-started' | 'transactions' | 'budgets' | 'accounts' | 'stats' | 'voice' | 'chat' | 'settings';

type HelpArticle = {
  id: string;
  category: HelpCategory;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
};

const HELP_ARTICLES: HelpArticle[] = [
  // Getting Started
  {
    id: 'create-account',
    category: 'getting-started',
    title: 'Crear tu cuenta',
    description: 'Aprende cómo registrarte en Oti',
    content: `
## Cómo crear tu cuenta

1. Haz clic en **"Crear cuenta"**
2. Completa el formulario con:
   - Nombre completo
   - Email (será tu usuario)
   - Contraseña (mínimo 8 caracteres)
3. Acepta términos y condiciones
4. Haz clic en **"Registrarse"**

✅ ¡Tu cuenta está lista!
    `
  },
  {
    id: 'first-steps',
    category: 'getting-started',
    title: 'Primeros pasos después del registro',
    description: 'Qué hacer después de crear tu cuenta',
    content: `
## Primeros pasos

Después de registrarte, te recomendamos:

### 1. Completa el tour del producto
El tour interactivo te mostrará las funciones principales.

### 2. Crea tus cuentas
- Ve a **Cuentas → + Nueva cuenta**
- Agrega tu efectivo, banco, tarjetas, etc.

### 3. Personaliza categorías
- Ve a **Configuración → Categorías**
- Agrega categorías personalizadas si necesitas

### 4. Registra tu primera transacción
- Tap en el botón **+**
- Registra un ingreso o gasto

### 5. Establece presupuestos
- Ve a **Presupuestos → + Nuevo presupuesto**
- Define límites mensuales

¡Ya estás listo para usar Oti! 🎉
    `
  },

  // Transactions
  {
    id: 'create-transaction',
    category: 'transactions',
    title: 'Crear una transacción',
    description: 'Registra ingresos, gastos y transferencias',
    content: `
## Crear transacción

### Paso 1: Tap en el botón "Oti"

Tap en el botón verde **"Oti"** (esquina inferior derecha) para ver las opciones disponibles:

- 💬 **Chat con Oti**
- 🎤 **Crear por Voz**
- 📷 **Crear por Imagen**
- ✏️ **Crear Manual**

### Método 1: Crear Manual ✏️

1. Selecciona **"Crear Manual"**
2. Selecciona el tipo:
   - 📥 Ingreso
   - 📤 Gasto
   - 🔄 Transferencia
3. Completa los campos:
   - Monto
   - Categoría
   - Cuenta
   - Fecha
   - Descripción (opcional)
4. Tap en **"Guardar"**

### Método 2: Crear por Voz 🎤

1. Selecciona **"Crear por Voz"**
2. Di tu comando, por ejemplo:
   - "Gasto 1500 en supermercado"
   - "Ingreso 50000 de salario"
   - "Transferencia 5000 de efectivo a banco"
3. Confirma la transacción

### Método 3: Crear por Imagen 📷

1. Selecciona **"Crear por Imagen"**
2. Sube una foto o PDF de tu extracto bancario
3. Oti extraerá las transacciones automáticamente con IA
4. Revisa y confirma

### Método 4: Chat con Oti 💬

1. Selecciona **"Chat con Oti"**
2. Escribe tu solicitud en lenguaje natural:
   - "Registra un gasto de 2000 en restaurante"
   - "Agrega un ingreso de 10000 por freelance"
3. Oti creará la transacción por ti

✅ ¡Elige el método que más te convenga!
    `
  },
  {
    id: 'edit-transaction',
    category: 'transactions',
    title: 'Editar o eliminar transacción',
    description: 'Modifica transacciones existentes',
    content: `
## Editar transacción

1. Tap en la transacción
2. Modifica los campos deseados
3. Tap en **"Guardar cambios"**

## Eliminar transacción

1. Swipe la transacción hacia la izquierda
2. Tap en el ícono de basura 🗑️
3. Confirma la eliminación

⚠️ **Nota:** La eliminación es permanente.
    `
  },

  // Budgets
  {
    id: 'create-budget',
    category: 'budgets',
    title: 'Crear un presupuesto',
    description: 'Establece límites de gasto mensuales',
    content: `
## Crear presupuesto

1. Ve a **Presupuestos**
2. Tap en **"+ Nuevo presupuesto"**
3. Completa:
   - **Categoría**: Ej. Alimentación
   - **Monto**: Ej. $15,000
   - **Alertas**: % para notificación (ej. 80%)
4. Tap en **"Crear"**

✅ Oti comenzará a trackear automáticamente.

## Estados del presupuesto

- 🟢 Verde (0-70%): Todo bien
- 🟡 Amarillo (70-100%): Cerca del límite
- 🔴 Rojo (>100%): Presupuesto superado
    `
  },

  // Voice
  {
    id: 'voice-commands',
    category: 'voice',
    title: 'Comandos de voz',
    description: 'Lista de comandos soportados',
    content: `
## Comandos de voz soportados

### Registrar gasto
- "Gasto 1500 en supermercado"
- "Gasto 450 en restaurante"
- "Gasto 800 en gasolina"

### Registrar ingreso
- "Ingreso 50000 de salario"
- "Ingreso 10000 de freelance"
- "Ingreso 5000 de propina"

### Transferencia
- "Transferencia 5000 de efectivo a banco"
- "Transferencia 2000 de banco principal a ahorro"

### Consultar balance
- "Cuál es mi balance"
- "Cuánto tengo en banco"
- "Cuánto gasté este mes"

## Tips para mejor reconocimiento

✅ Habla claro y sin prisa
✅ Usa palabras clave: "Gasto", "Ingreso", "Transferencia"
✅ Menciona el monto primero
✅ Evita ruido de fondo
    `
  },

  // Chat
  {
    id: 'chat-oti',
    category: 'chat',
    title: 'Cómo usar el chat con Oti',
    description: 'Aprende a interactuar con tu asistente',
    content: `
## Chat con Oti

Oti es un asistente financiero dotado de inteligencia artificial.

### ¿Qué puede hacer?

✅ Responder preguntas financieras
✅ Dar consejos de ahorro
✅ Analizar tus gastos
✅ Sugerir presupuestos
✅ Explicar conceptos financieros

### Ejemplos de preguntas

**Consultas:**
- "¿Cuánto gasté en alimentación este mes?"
- "Muéstrame mis gastos de la semana"
- "¿Cuál es mi balance total?"

**Análisis:**
- "Analiza mis gastos del mes"
- "¿En qué gasto más?"
- "¿Cómo están mis presupuestos?"

**Consejos:**
- "¿Cómo puedo ahorrar más?"
- "Dame tips para reducir gastos"
- "¿Debería ajustar mis presupuestos?"

### Tips

💡 Sé específico para mejores respuestas
💡 Puedes hacer preguntas de seguimiento
💡 Oti aprende de tus datos reales
    `
  },

  // Settings
  {
    id: 'export-data',
    category: 'settings',
    title: 'Exportar tus datos',
    description: 'Descarga backup de tus finanzas',
    content: `
## Exportar datos

1. Ve a **Configuración → Datos**
2. Tap en **"Exportar datos"**
3. Selecciona formato:
   - **JSON**: Formato completo
   - **CSV**: Para Excel
   - **PDF**: Reporte legible
4. Descarga el archivo

## ¿Qué incluye?

✅ Todas tus transacciones
✅ Presupuestos
✅ Cuentas y balances
✅ Categorías personalizadas
✅ Configuración

💡 **Tip:** Exporta regularmente como backup.
    `
  }
];

const FAQ_ITEMS = [
  {
    question: '¿Oti es gratis?',
    answer: 'Sí, Oti es completamente gratuito y sin anuncios.'
  },
  {
    question: '¿Mis datos están seguros?',
    answer: 'Sí, usamos encriptación de extremo a extremo y cumplimos con estándares de seguridad bancaria. Tus datos nunca se comparten con terceros.'
  },
  {
    question: '¿Puedo usar Oti sin internet?',
    answer: 'Sí, Oti funciona offline. Tus datos se sincronizarán automáticamente cuando te reconectes.'
  },
  {
    question: '¿Oti se conecta a mi banco?',
    answer: 'No, Oti NO se conecta directamente a tu banco. Tú registras manualmente tus transacciones o las importas desde extractos.'
  },
  {
    question: '¿Puedo cambiar la moneda?',
    answer: 'Sí, en Configuración → General → Moneda puedes seleccionar tu moneda preferida.'
  },
  {
    question: '¿Qué hago si perdí mi contraseña?',
    answer: 'En la pantalla de login, haz clic en "¿Olvidaste tu contraseña?" y sigue las instrucciones para recuperarla.'
  },
  {
    question: '¿Puedo compartir mi cuenta con familia?',
    answer: 'Actualmente no, pero es una feature que agregaremos pronto en futuras actualizaciones.'
  },
  {
    question: '¿Oti funciona en iOS y Android?',
    answer: 'Sí, Oti es una Progressive Web App (PWA) que funciona en cualquier dispositivo con navegador.'
  }
];

type HelpCenterProps = {
  onClose: () => void;
  isOpen: boolean;
};

export function HelpCenter({ onClose, isOpen }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | 'all' | 'faq'>('all');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // ✅ NUEVO: Control sidebar

  // Don't render if not open
  if (!isOpen) return null;

  // Filter articles
  const filteredArticles = HELP_ARTICLES.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || selectedCategory === 'faq' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Categories
  const categories = [
    { id: 'all', name: 'Todo', icon: BookOpen },
    { id: 'getting-started', name: 'Primeros Pasos', icon: Lightbulb },
    { id: 'transactions', name: 'Transacciones', icon: FileText },
    { id: 'budgets', name: 'Presupuestos', icon: Target },
    { id: 'voice', name: 'Voz', icon: Mic },
    { id: 'chat', name: 'Chat', icon: MessageCircle },
    { id: 'faq', name: 'FAQ', icon: HelpCircle },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Centro de Ayuda
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Encuentra respuestas y aprende a usar Oti
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar ayuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex relative">
          {/* ✅ SIDEBAR OVERLAY (Mobile/Colapsable) */}
          {isSidebarOpen && (
            <div 
              className="absolute inset-0 bg-black/20 z-10 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* ✅ SIDEBAR - Colapsable */}
          <div className={`
            absolute lg:relative z-20
            w-64 sm:w-72 h-full
            bg-white dark:bg-gray-800 
            border-r border-gray-200 dark:border-gray-700
            overflow-y-auto
            transition-transform duration-300
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="p-3 sm:p-4 space-y-1">
              <div className="flex items-center justify-between mb-3 lg:hidden">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Categorías</h3>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id as any);
                      setSelectedArticle(null);
                      setIsSidebarOpen(false); // Close on mobile
                    }}
                    className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all text-left ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                Acciones Rápidas
              </p>
              <div className="space-y-2">
                <a
                  href="mailto:soporte@oti.app"
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contactar soporte</span>
                </a>
                
              </div>
            </div>
          </div>

          {/* ✅ MAIN CONTENT */}
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {/* ✅ TOGGLE SIDEBAR BUTTON (Mobile) */}
            <div className="lg:hidden sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <Menu className="w-5 h-5" />
                <span>
                  {categories.find(c => c.id === selectedCategory)?.name || 'Categorías'}
                </span>
              </button>
            </div>

            {selectedArticle ? (
              // ✅ ARTICLE VIEW
              <div className="p-4 sm:p-6 lg:p-8">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline mb-6"
                >
                  ← Volver
                </button>
                
                <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                  {selectedArticle.title}
                </h1>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6">
                  {selectedArticle.description}
                </p>

                {selectedArticle.videoUrl && (
                  <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 flex items-center gap-3">
                    <Video className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Video tutorial disponible
                      </p>
                      <a
                        href={selectedArticle.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Ver video →
                      </a>
                    </div>
                  </div>
                )}

                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                  {selectedArticle.content.split('\n').map((line, index) => {
                    if (line.startsWith('## ')) {
                      return (
                        <h2 key={index} className="text-xl sm:text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                          {line.replace('## ', '')}
                        </h2>
                      );
                    }
                    if (line.startsWith('### ')) {
                      return (
                        <h3 key={index} className="text-lg sm:text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">
                          {line.replace('### ', '')}
                        </h3>
                      );
                    }
                    if (line.startsWith('- ') || line.startsWith('✅ ') || line.startsWith('⚠️ ') || line.startsWith('💡 ') || line.startsWith('🟢 ') || line.startsWith('🟡 ') || line.startsWith('🔴 ')) {
                      return (
                        <li key={index} className="ml-4 text-gray-700 dark:text-gray-300">
                          {line.substring(2)}
                        </li>
                      );
                    }
                    if (line.trim() === '') {
                      return <br key={index} />;
                    }
                    if (line.includes('**')) {
                      // Bold text
                      const parts = line.split('**');
                      return (
                        <p key={index} className="mb-3 text-gray-700 dark:text-gray-300">
                          {parts.map((part, i) => 
                            i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900 dark:text-white">{part}</strong> : part
                          )}
                        </p>
                      );
                    }
                    return <p key={index} className="mb-3 text-gray-700 dark:text-gray-300">{line}</p>;
                  })}
                </div>
              </div>
            ) : selectedCategory === 'faq' ? (
              // ✅ FAQ VIEW
              <div className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Preguntas Frecuentes
                </h2>
                <div className="space-y-3">
                  {FAQ_ITEMS.map((faq, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <span className="font-medium pr-4 text-gray-900 dark:text-white">
                          {faq.question}
                        </span>
                        <ChevronRight
                          className={`w-5 h-5 flex-shrink-0 transition-transform text-gray-500 dark:text-gray-400 ${
                            expandedFaq === index ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                      {expandedFaq === index && (
                        <div className="px-4 pb-4 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // ✅ ARTICLES LIST
              <div className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  {selectedCategory === 'all' ? 'Todos los artículos' : categories.find(c => c.id === selectedCategory)?.name}
                </h2>

                {filteredArticles.length === 0 ? (
                  <div className="text-center py-12">
                    <HelpCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No se encontraron artículos
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:gap-4">
                    {filteredArticles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="text-left p-4 sm:p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1.5 text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {article.description}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex-shrink-0 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}