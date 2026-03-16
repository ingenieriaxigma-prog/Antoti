/**
 * Category Constants
 * 
 * ✅ FUENTE ÚNICA DE VERDAD para categorías y subcategorías
 * Incluye IDs, emojis, colores, e íconos para toda la aplicación
 * 
 * Updated: November 2025 - Comprehensive categories for Colombian/Latin American users
 */

import { Category } from '../types';

/**
 * Color options for categories
 */
export const CATEGORY_COLORS = [
  '#10b981', // green
  '#3b82f6', // blue
  '#f59e0b', // orange
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f43f5e', // rose
  '#84cc16', // lime
  '#f97316', // orange-600
  '#14b8a6', // teal
  '#a855f7', // violet
  '#6366f1', // indigo
  '#6b7280', // gray
] as const;

/**
 * Default income categories for Latin America
 * 6 main categories with subcategories
 * ✅ Incluye IDs consistentes para evitar conflictos
 */
export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  // ✅ CATEGORÍA DEL SISTEMA: Saldo Inicial (no editable, no borrable)
  { 
    id: '11111111-1111-4111-a111-111111111110',
    name: 'Saldo Inicial', 
    type: 'income', 
    icon: 'wallet', 
    color: '#10b981',
    emoji: '💰',
    isSystem: true, // Marca como categoría del sistema
    subcategories: [
      { id: '11111111-1111-4111-a111-111111111001', name: 'Efectivo', categoryId: '11111111-1111-4111-a111-111111111110', emoji: '💵' },
      { id: '11111111-1111-4111-a111-111111111002', name: 'Banco', categoryId: '11111111-1111-4111-a111-111111111110', emoji: '🏦' },
      { id: '11111111-1111-4111-a111-111111111003', name: 'Ahorros', categoryId: '11111111-1111-4111-a111-111111111110', emoji: '🐷' },
      { id: '11111111-1111-4111-a111-111111111004', name: 'Inversiones', categoryId: '11111111-1111-4111-a111-111111111110', emoji: '📈' },
    ]
  },
  { 
    id: '11111111-1111-4111-a111-111111111111',
    name: 'Salario', 
    type: 'income', 
    icon: 'briefcase', 
    color: '#10b981',
    emoji: '💼',
    subcategories: [
      { id: '11111111-1111-4111-a111-111111111101', name: 'Sueldo Base', categoryId: '11111111-1111-4111-a111-111111111111', emoji: '💵' },
      { id: '11111111-1111-4111-a111-111111111102', name: 'Horas Extras', categoryId: '11111111-1111-4111-a111-111111111111', emoji: '⏰' },
      { id: '11111111-1111-4111-a111-111111111103', name: 'Bonos', categoryId: '11111111-1111-4111-a111-111111111111', emoji: '🎁' },
      { id: '11111111-1111-4111-a111-111111111104', name: 'Comisiones', categoryId: '11111111-1111-4111-a111-111111111111', emoji: '💰' },
      { id: '11111111-1111-4111-a111-111111111105', name: 'Prima', categoryId: '11111111-1111-4111-a111-111111111111', emoji: '✨' },
    ]
  },
  { 
    id: '11111111-1111-4111-a111-111111111112',
    name: 'Freelance/Independiente', 
    type: 'income', 
    icon: 'laptop', 
    color: '#3b82f6',
    emoji: '💻',
    subcategories: [
      { id: '11111111-1111-4111-a111-111111111201', name: 'Proyectos', categoryId: '11111111-1111-4111-a111-111111111112', emoji: '🚀' },
      { id: '11111111-1111-4111-a111-111111111202', name: 'Consultoría', categoryId: '11111111-1111-4111-a111-111111111112', emoji: '💼' },
      { id: '11111111-1111-4111-a111-111111111203', name: 'Servicios Profesionales', categoryId: '11111111-1111-4111-a111-111111111112', emoji: '🎯' },
    ]
  },
  { 
    id: '11111111-1111-4111-a111-111111111113',
    name: 'Ventas', 
    type: 'income', 
    icon: 'shopping-bag', 
    color: '#f59e0b',
    emoji: '🏪',
    subcategories: [
      { id: '11111111-1111-4111-a111-111111111301', name: 'Productos', categoryId: '11111111-1111-4111-a111-111111111113', emoji: '📦' },
      { id: '11111111-1111-4111-a111-111111111302', name: 'Servicios', categoryId: '11111111-1111-4111-a111-111111111113', emoji: '🛠️' },
      { id: '11111111-1111-4111-a111-111111111303', name: 'Comisiones', categoryId: '11111111-1111-4111-a111-111111111113', emoji: '💵' },
    ]
  },
  { 
    id: '11111111-1111-4111-a111-111111111114',
    name: 'Regalos y Extras', 
    type: 'income', 
    icon: 'gift', 
    color: '#ec4899',
    emoji: '🎁',
    subcategories: [
      { id: '11111111-1111-4111-a111-111111111401', name: 'Regalos', categoryId: '11111111-1111-4111-a111-111111111114', emoji: '🎁' },
      { id: '11111111-1111-4111-a111-111111111402', name: 'Bonos', categoryId: '11111111-1111-4111-a111-111111111114', emoji: '💝' },
      { id: '11111111-1111-4111-a111-111111111403', name: 'Premios', categoryId: '11111111-1111-4111-a111-111111111114', emoji: '🏆' },
      { id: '11111111-1111-4111-a111-111111111404', name: 'Aguinaldo', categoryId: '11111111-1111-4111-a111-111111111114', emoji: '🎉' },
    ]
  },
  { 
    id: '11111111-1111-4111-a111-111111111115',
    name: 'Inversiones', 
    type: 'income', 
    icon: 'trending-up', 
    color: '#8b5cf6',
    emoji: '💰',
    subcategories: [
      { id: '11111111-1111-4111-a111-111111111501', name: 'Dividendos', categoryId: '11111111-1111-4111-a111-111111111115', emoji: '📊' },
      { id: '11111111-1111-4111-a111-111111111502', name: 'Intereses', categoryId: '11111111-1111-4111-a111-111111111115', emoji: '💹' },
      { id: '11111111-1111-4111-a111-111111111503', name: 'Rendimientos', categoryId: '11111111-1111-4111-a111-111111111115', emoji: '📈' },
      { id: '11111111-1111-4111-a111-111111111504', name: 'Criptomonedas', categoryId: '11111111-1111-4111-a111-111111111115', emoji: '₿' },
    ]
  },
  { 
    id: '11111111-1111-4111-a111-111111111116',
    name: 'Arrendamiento', 
    type: 'income', 
    icon: 'home', 
    color: '#14b8a6',
    emoji: '🏠',
    subcategories: [
      { id: '11111111-1111-4111-a111-111111111601', name: 'Propiedades', categoryId: '11111111-1111-4111-a111-111111111116', emoji: '🏢' },
      { id: '11111111-1111-4111-a111-111111111602', name: 'Vehículos', categoryId: '11111111-1111-4111-a111-111111111116', emoji: '🚗' },
    ]
  },
];

/**
 * Default expense categories for Latin America
 * 12 main categories with subcategories
 * ✅ Incluye IDs consistentes para evitar conflictos
 */
export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { 
    id: '22222222-2222-4222-a222-222222222221',
    name: 'Vivienda', 
    type: 'expense', 
    icon: 'home', 
    color: '#ef4444',
    emoji: '🏠',
    subcategories: [
      { id: '22222222-2222-4222-a222-222222222101', name: 'Arriendo/Alquiler', categoryId: '22222222-2222-4222-a222-222222222221', emoji: '🏠' },
      { id: '22222222-2222-4222-a222-222222222102', name: 'Hipoteca', categoryId: '22222222-2222-4222-a222-222222222221', emoji: '🏦' },
      { id: '22222222-2222-4222-a222-222222222103', name: 'Predial/Impuestos', categoryId: '22222222-2222-4222-a222-222222222221', emoji: '📋' },
      { id: '22222222-2222-4222-a222-222222222104', name: 'Administración', categoryId: '22222222-2222-4222-a222-222222222221', emoji: '🏢' },
      { id: '22222222-2222-4222-a222-222222222105', name: 'Seguros', categoryId: '22222222-2222-4222-a222-222222222221', emoji: '🛡️' },
    ]
  },
  { 
    id: '22222222-2222-4222-a222-222222222222',
    name: 'Hogar', 
    type: 'expense', 
    icon: 'shopping-cart', 
    color: '#10b981',
    emoji: '🛒',
    subcategories: [
      { id: '22222222-2222-4222-a222-222222222201', name: 'Mercado/Supermercado', categoryId: '22222222-2222-4222-a222-222222222222', emoji: '🛒' },
      { id: '22222222-2222-4222-a222-222222222202', name: 'Productos de Aseo', categoryId: '22222222-2222-4222-a222-222222222222', emoji: '🧹' },
      { id: '22222222-2222-4222-a222-222222222203', name: 'Empleada Doméstica', categoryId: '22222222-2222-4222-a222-222222222222', emoji: '👩‍🍳' },
      { id: '22222222-2222-4222-a222-222222222204', name: 'Muebles y Decoración', categoryId: '22222222-2222-4222-a222-222222222222', emoji: '🛋️' },
      { id: '22222222-2222-4222-a222-222222222205', name: 'Reparaciones', categoryId: '22222222-2222-4222-a222-222222222222', emoji: '🔧' },
    ]
  },
  { 
    id: '22222222-2222-4222-a222-222222222223',
    name: 'Servicios', 
    type: 'expense', 
    icon: 'zap', 
    color: '#f59e0b',
    emoji: '⚡',
    subcategories: [
      { id: '22222222-2222-4222-a222-222222222301', name: 'Agua', categoryId: '22222222-2222-4222-a222-222222222223', emoji: '💧' },
      { id: '22222222-2222-4222-a222-222222222302', name: 'Luz/Electricidad', categoryId: '22222222-2222-4222-a222-222222222223', emoji: '💡' },
      { id: '22222222-2222-4222-a222-222222222303', name: 'Gas', categoryId: '22222222-2222-4222-a222-222222222223', emoji: '🔥' },
      { id: '22222222-2222-4222-a222-222222222304', name: 'Internet', categoryId: '22222222-2222-4222-a222-222222222223', emoji: '🌐' },
      { id: '22222222-2222-4222-a222-222222222305', name: 'Celular/Teléfono', categoryId: '22222222-2222-4222-a222-222222222223', emoji: '📱' },
      { id: '22222222-2222-4222-a222-222222222306', name: 'TV/Streaming', categoryId: '22222222-2222-4222-a222-222222222223', emoji: '📺' },
    ]
  },
  { 
    id: '22222222-2222-4222-a222-222222222224',
    name: 'Alimentación', 
    type: 'expense', 
    icon: 'utensils', 
    color: '#f43f5e',
    emoji: '🍔',
    subcategories: [
      { id: '22222222-2222-4222-a222-222222222401', name: 'Mercado', categoryId: '22222222-2222-4222-a222-222222222224', emoji: '🛒' },
      { id: '22222222-2222-4222-a222-222222222402', name: 'Restaurantes', categoryId: '22222222-2222-4222-a222-222222222224', emoji: '🍽️' },
      { id: '22222222-2222-4222-a222-222222222403', name: 'Cafeterías', categoryId: '22222222-2222-4222-a222-222222222224', emoji: '☕' },
      { id: '22222222-2222-4222-a222-222222222404', name: 'Domicilios', categoryId: '22222222-2222-4222-a222-222222222224', emoji: '🚴' },
      { id: '22222222-2222-4222-a222-222222222405', name: 'Snacks y Bebidas', categoryId: '22222222-2222-4222-a222-222222222224', emoji: '🍿' },
    ]
  },
  { 
    id: '22222222-2222-4222-a222-222222222225',
    name: 'Transporte', 
    type: 'expense', 
    icon: 'car', 
    color: '#3b82f6',
    emoji: '🚗',
    subcategories: [
      { id: '22222222-2222-4222-a222-222222222501', name: 'Gasolina', categoryId: '22222222-2222-4222-a222-222222222225', emoji: '⛽' },
      { id: '22222222-2222-4222-a222-222222222502', name: 'Transporte Público', categoryId: '22222222-2222-4222-a222-222222222225', emoji: '🚌' },
      { id: '22222222-2222-4222-a222-222222222503', name: 'Taxi/Uber', categoryId: '22222222-2222-4222-a222-222222222225', emoji: '🚕' },
      { id: '22222222-2222-4222-a222-222222222504', name: 'Peajes', categoryId: '22222222-2222-4222-a222-222222222225', emoji: '🛣️' },
      { id: '22222222-2222-4222-a222-222222222505', name: 'Parqueadero', categoryId: '22222222-2222-4222-a222-222222222225', emoji: '🅿️' },
      { id: '22222222-2222-4222-a222-222222222506', name: 'Mantenimiento Vehículo', categoryId: '22222222-2222-4222-a222-222222222225', emoji: '🔧' },
    ]
  },
  { 
    id: '22222222-2222-4222-a222-222222222226',
    name: 'Salud', 
    type: 'expense', 
    icon: 'heart', 
    color: '#ec4899',
    emoji: '❤️',
    subcategories: [
      { id: '22222222-2222-4222-a222-222222222601', name: 'Medicamentos', categoryId: '22222222-2222-4222-a222-222222222226', emoji: '💊' },
      { id: '22222222-2222-4222-a222-222222222602', name: 'Consultas', categoryId: '22222222-2222-4222-a222-222222222226', emoji: '🏥' },
      { id: '22222222-2222-4222-a222-222222222603', name: 'EPS/Seguro', categoryId: '22222222-2222-4222-a222-222222222226', emoji: '🏥' },
      { id: '22222222-2222-4222-a222-222222222604', name: 'Odontología', categoryId: '22222222-2222-4222-a222-222222222226', emoji: '🦷' },
      { id: '22222222-2222-4222-a222-222222222605', name: 'Gimnasio', categoryId: '22222222-2222-4222-a222-222222222226', emoji: '💪' },
    ]
  },
  { 
    id: '22222222-2222-4222-a222-222222222227',
    name: 'Educación', 
    type: 'expense', 
    icon: 'book-open', 
    color: '#8b5cf6',
    emoji: '📚',
    subcategories: [
      { id: '22222222-2222-4222-a222-222222222701', name: 'Matrícula', categoryId: '22222222-2222-4222-a222-222222222227', emoji: '🎓' },
      { id: '22222222-2222-4222-a222-222222222702', name: 'Pensión', categoryId: '22222222-2222-4222-a222-222222222227', emoji: '🏫' },
      { id: '22222222-2222-4222-a222-222222222703', name: 'Cursos', categoryId: '22222222-2222-4222-a222-222222222227', emoji: '📖' },
      { id: '22222222-2222-4222-a222-222222222704', name: 'Libros', categoryId: '22222222-2222-4222-a222-222222222227', emoji: '📚' },
      { id: '22222222-2222-4222-a222-222222222705', name: 'Material Escolar', categoryId: '22222222-2222-4222-a222-222222222227', emoji: '✏️' },
    ]
  },
  { 
    id: '22222222-2222-4222-a222-222222222228',
    name: 'Ropa y Cuidado Personal', 
    type: 'expense', 
    icon: 'shirt', 
    color: '#06b6d4',
    emoji: '👔',
    subcategories: [
      { id: '22222222-2222-4222-a222-222222222801', name: 'Ropa', categoryId: '22222222-2222-4222-a222-222222222228', emoji: '👕' },
      { id: '22222222-2222-4222-a222-222222222802', name: 'Zapatos', categoryId: '22222222-2222-4222-a222-222222222228', emoji: '👟' },
      { id: '22222222-2222-4222-a222-222222222803', name: 'Peluquería/Barbería', categoryId: '22222222-2222-4222-a222-222222222228', emoji: '💇' },
      { id: '22222222-2222-4222-a222-222222222804', name: 'Cuidado Personal', categoryId: '22222222-2222-4222-a222-222222222228', emoji: '🧴' },
    ]
  },
  { 
    id: '22222222-2222-4222-a222-222222222229',
    name: 'Entretenimiento', 
    type: 'expense', 
    icon: 'film', 
    color: '#a855f7',
    emoji: '🎮',
    subcategories: [
      { id: '22222222-2222-4222-a222-222222222901', name: 'Cine', categoryId: '22222222-2222-4222-a222-222222222229', emoji: '🎬' },
      { id: '22222222-2222-4222-a222-222222222902', name: 'Eventos', categoryId: '22222222-2222-4222-a222-222222222229', emoji: '🎉' },
      { id: '22222222-2222-4222-a222-222222222903', name: 'Hobbies', categoryId: '22222222-2222-4222-a222-222222222229', emoji: '🎨' },
      { id: '22222222-2222-4222-a222-222222222904', name: 'Deportes', categoryId: '22222222-2222-4222-a222-222222222229', emoji: '⚽' },
      { id: '22222222-2222-4222-a222-222222222905', name: 'Viajes', categoryId: '22222222-2222-4222-a222-222222222229', emoji: '✈️' },
    ]
  },
  { 
    id: '22222222-2222-4222-a222-222222222230',
    name: 'Tecnología', 
    type: 'expense', 
    icon: 'smartphone', 
    color: '#6366f1',
    emoji: '📱',
    subcategories: [
      { id: '22222222-2222-4222-a222-222222223001', name: 'Electrónicos', categoryId: '22222222-2222-4222-a222-222222222230', emoji: '📱' },
      { id: '22222222-2222-4222-a222-222222223002', name: 'Software', categoryId: '22222222-2222-4222-a222-222222222230', emoji: '💻' },
      { id: '22222222-2222-4222-a222-222222223003', name: 'Suscripciones', categoryId: '22222222-2222-4222-a222-222222222230', emoji: '📲' },
      { id: '22222222-2222-4222-a222-222222223004', name: 'Reparaciones', categoryId: '22222222-2222-4222-a222-222222222230', emoji: '🔧' },
    ]
  },
  { 
    id: '22222222-2222-4222-a222-222222222231',
    name: 'Ayudas y Regalos', 
    type: 'expense', 
    icon: 'hand-helping', 
    color: '#84cc16',
    emoji: '🤝',
    subcategories: [
      { id: '22222222-2222-4222-a222-222222223101', name: 'Ayudas Familiares', categoryId: '22222222-2222-4222-a222-222222222231', emoji: '👨‍👩‍👧' },
      { id: '22222222-2222-4222-a222-222222223102', name: 'Regalos', categoryId: '22222222-2222-4222-a222-222222222231', emoji: '🎁' },
      { id: '22222222-2222-4222-a222-222222223103', name: 'Donaciones', categoryId: '22222222-2222-4222-a222-222222222231', emoji: '💝' },
      { id: '22222222-2222-4222-a222-222222223104', name: 'Préstamos a Terceros', categoryId: '22222222-2222-4222-a222-222222222231', emoji: '💸' },
    ]
  },
  { 
    id: '22222222-2222-4222-a222-222222222233',
    name: 'Transferencias a Terceros', 
    type: 'expense', 
    icon: 'send', 
    color: '#f97316',
    emoji: '💸',
    subcategories: [
      { id: '22222222-2222-4222-a222-222222223301', name: 'Transferencias Bancarias', categoryId: '22222222-2222-4222-a222-222222222233', emoji: '🏦' },
      { id: '22222222-2222-4222-a222-222222223302', name: 'Envíos Internacionales', categoryId: '22222222-2222-4222-a222-222222222233', emoji: '🌍' },
      { id: '22222222-2222-4222-a222-222222223303', name: 'Pagos a Proveedores', categoryId: '22222222-2222-4222-a222-222222222233', emoji: '🏪' },
      { id: '22222222-2222-4222-a222-222222223304', name: 'Envíos de Dinero', categoryId: '22222222-2222-4222-a222-222222222233', emoji: '💰' },
    ]
  },
  { 
    id: '22222222-2222-4222-a222-222222222232',
    name: 'Préstamos y Créditos', 
    type: 'expense', 
    icon: 'credit-card', 
    color: '#6b7280',
    emoji: '💳',
    subcategories: [
      { id: '22222222-2222-4222-a222-222222223201', name: 'Préstamos Personales', categoryId: '22222222-2222-4222-a222-222222222232', emoji: '💰' },
      { id: '22222222-2222-4222-a222-222222223202', name: 'Deudas de Tarjetas', categoryId: '22222222-2222-4222-a222-222222222232', emoji: '💳' },
      { id: '22222222-2222-4222-a222-222222223203', name: 'Créditos Bancarios', categoryId: '22222222-2222-4222-a222-222222222232', emoji: '🏦' },
      { id: '22222222-2222-4222-a222-222222223204', name: 'Préstamos de Amigos/Familia', categoryId: '22222222-2222-4222-a222-222222222232', emoji: '🤝' },
    ]
  },
];

/**
 * ✅ TODAS las categorías por defecto (INGRESOS + GASTOS)
 * Esta es la fuente única de verdad que se usa en toda la aplicación
 */
export const DEFAULT_CATEGORIES: Category[] = [
  ...DEFAULT_INCOME_CATEGORIES,
  ...DEFAULT_EXPENSE_CATEGORIES,
];

/**
 * Category keywords for AI voice recognition (Spanish/Latin America)
 */
export const CATEGORY_KEYWORDS = {
  // INGRESOS
  'Salario': ['salario', 'sueldo', 'pago mensual', 'nómina', 'quincenal', 'prima', 'bonificación'],
  'Freelance/Independiente': ['freelance', 'proyecto', 'consultoría', 'independiente', 'trabajo independiente'],
  'Ventas': ['venta', 'vendí', 'emprendimiento', 'negocio', 'comercio'],
  'Regalos y Extras': ['regalo', 'bono', 'lotería', 'rifa', 'extra', 'aguinaldo'],
  'Inversiones': ['inversión', 'dividendo', 'interés', 'rendimiento', 'acciones', 'cripto'],
  'Arrendamiento': ['arriendo', 'alquiler', 'renta', 'arrendamiento'],
  
  // GASTOS
  'Vivienda': ['arriendo', 'alquiler', 'hipoteca', 'predial', 'administración', 'condominio'],
  'Hogar': ['mercado', 'supermercado', 'empleada', 'aseo', 'limpieza', 'muebles'],
  'Servicios': ['luz', 'agua', 'gas', 'internet', 'celular', 'teléfono', 'streaming', 'netflix'],
  'Alimentación': ['comida', 'restaurante', 'almuerzo', 'cena', 'desayuno', 'café', 'domicilio'],
  'Transporte': ['taxi', 'uber', 'bus', 'metro', 'gasolina', 'combustible', 'peaje', 'parqueadero'],
  'Salud': ['médico', 'doctor', 'medicina', 'farmacia', 'eps', 'prepagada', 'gimnasio', 'dentista'],
  'Educación': ['colegio', 'universidad', 'curso', 'libro', 'matrícula', 'pensión'],
  'Ropa y Cuidado Personal': ['ropa', 'zapatos', 'calzado', 'peluquería', 'salón', 'estética'],
  'Entretenimiento': ['cine', 'película', 'concierto', 'fiesta', 'salida', 'videojuego', 'hobby'],
  'Tecnología': ['celular', 'computador', 'tablet', 'software', 'app', 'reparación'],
  'Ayudas y Regalos': ['ayuda', 'prestado', 'regalo', 'donación', 'familia'],
  'Transferencias a Terceros': ['transferencia', 'envío', 'pago', 'proveedor', 'enviar', 'envié', 'transferí', 'pagué', 'pagar', 'remesa', 'giro'],
  'Préstamos y Créditos': ['préstamo', 'crédito', 'deuda', 'tarjeta', 'banco', 'amigo', 'familia'],
} as const;