/**
 * Transaction Validation Schemas
 * 
 * Zod schemas for runtime validation of transactions.
 * These ensure data integrity at runtime, complementing TypeScript's compile-time checks.
 */

import { z } from 'zod';

/**
 * Transaction type enum
 */
export const TransactionTypeSchema = z.enum(['income', 'expense', 'transfer']);

/**
 * Base transaction schema (without ID)
 */
export const TransactionCreateSchema = z.object({
  type: TransactionTypeSchema,
  amount: z.number()
    .positive('El monto debe ser mayor a 0')
    .finite('El monto debe ser un número válido'),
  category: z.string().uuid('ID de categoría inválido').optional(),
  subcategory: z.string().uuid('ID de subcategoría inválido').optional(),
  account: z.string().uuid('ID de cuenta inválido'),
  toAccount: z.string().uuid('ID de cuenta destino inválido').optional(),
  date: z.string().datetime('Fecha inválida'),
  note: z.string().max(500, 'La nota no puede exceder 500 caracteres').optional(),
});
// ⚠️ TEMPORALMENTE COMENTADO - Los refinements causan error con .partial() en Figma Make
// .refine(
//   (data) => {
//     // If type is transfer, toAccount is required
//     if (data.type === 'transfer') {
//       return !!data.toAccount;
//     }
//     return true;
//   },
//   {
//     message: 'Las transferencias requieren una cuenta destino',
//     path: ['toAccount'],
//   }
// ).refine(
//   (data) => {
//     // If type is transfer, toAccount must be different from account
//     if (data.type === 'transfer' && data.toAccount) {
//       return data.account !== data.toAccount;
//     }
//     return true;
//   },
//   {
//     message: 'La cuenta origen y destino deben ser diferentes',
//     path: ['toAccount'],
//   }
// ).refine(
//   (data) => {
//     // If type is not transfer, category is required
//     if (data.type !== 'transfer') {
//       return !!data.category;
//     }
//     return true;
//   },
//   {
//     message: 'La categoría es requerida para ingresos y gastos',
//     path: ['category'],
//   }
// );

/**
 * Full transaction schema (with ID)
 */
export const TransactionSchema = TransactionCreateSchema.merge(
  z.object({
    id: z.string().uuid('ID de transacción inválido'),
  })
);

/**
 * Update transaction schema (partial)
 */
export const TransactionUpdateSchema = TransactionCreateSchema.partial().merge(
  z.object({
    id: z.string().uuid('ID de transacción inválido'),
  })
);

/**
 * Bulk transaction creation schema
 */
export const BulkTransactionCreateSchema = z.object({
  transactions: z.array(TransactionCreateSchema)
    .min(1, 'Debe haber al menos una transacción')
    .max(100, 'No se pueden crear más de 100 transacciones a la vez'),
});

/**
 * Transaction filter schema
 */
export const TransactionFilterSchema = z.object({
  type: TransactionTypeSchema.optional(),
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
  searchTerm: z.string().max(100).optional(),
});
// ⚠️ TEMPORALMENTE COMENTADO - Los refinements causan error con .partial() en Figma Make
// .refine(
//   (data) => {
//     // If both dates are provided, startDate must be before endDate
//     if (data.startDate && data.endDate) {
//       return new Date(data.startDate) <= new Date(data.endDate);
//     }
//     return true;
//   },
//   {
//     message: 'La fecha de inicio debe ser anterior a la fecha de fin',
//     path: ['endDate'],
//   }
// ).refine(
//   (data) => {
//     // If both amounts are provided, minAmount must be less than maxAmount
//     if (data.minAmount !== undefined && data.maxAmount !== undefined) {
//       return data.minAmount <= data.maxAmount;
//     }
//     return true;
//   },
//   {
//     message: 'El monto mínimo debe ser menor al monto máximo',
//     path: ['maxAmount'],
//   }
// );

/**
 * Type exports for TypeScript inference
 */
export type TransactionType = z.infer<typeof TransactionTypeSchema>;
export type TransactionCreate = z.infer<typeof TransactionCreateSchema>;
export type TransactionData = z.infer<typeof TransactionSchema>;
export type TransactionUpdate = z.infer<typeof TransactionUpdateSchema>;
export type BulkTransactionCreate = z.infer<typeof BulkTransactionCreateSchema>;
export type TransactionFilter = z.infer<typeof TransactionFilterSchema>;