/**
 * Budget Validation Schemas
 * 
 * Zod schemas for runtime validation of budgets.
 */

import { z } from 'zod';

/**
 * Budget period enum
 */
export const BudgetPeriodSchema = z.enum(['monthly', 'yearly']);

/**
 * Base budget schema (without ID)
 */
export const BudgetCreateSchema = z.object({
  categoryId: z.string().uuid('ID de categoría inválido'),
  amount: z.number()
    .positive('El monto del presupuesto debe ser mayor a 0')
    .finite('El monto debe ser un número válido')
    .max(999999999999, 'El monto del presupuesto es demasiado grande'),
  period: BudgetPeriodSchema,
  alertThreshold: z.number()
    .min(1, 'El umbral de alerta debe ser al menos 1%')
    .max(100, 'El umbral de alerta no puede exceder 100%')
    .int('El umbral de alerta debe ser un número entero')
    .default(80)
    .optional(),
});

/**
 * Full budget schema (with ID)
 */
export const BudgetSchema = BudgetCreateSchema.merge(
  z.object({
    id: z.string().uuid('ID de presupuesto inválido'),
  })
);

/**
 * Update budget schema (partial)
 */
export const BudgetUpdateSchema = BudgetSchema.partial().required({ id: true });

/**
 * Bulk budget creation schema
 */
export const BulkBudgetCreateSchema = z.object({
  budgets: z.array(BudgetCreateSchema)
    .min(1, 'Debe haber al menos un presupuesto')
    .max(50, 'No se pueden crear más de 50 presupuestos a la vez'),
});

/**
 * Budget filter schema
 */
export const BudgetFilterSchema = z.object({
  categoryId: z.string().uuid().optional(),
  period: BudgetPeriodSchema.optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
});
// ⚠️ TEMPORALMENTE COMENTADO - Los refinements causan error con .partial() en Figma Make
// .refine(
//   (data) => {
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
 * Budget status calculation input schema
 */
export const BudgetStatusInputSchema = z.object({
  budgetAmount: z.number().positive(),
  spent: z.number().nonnegative('El gasto no puede ser negativo'),
  alertThreshold: z.number().min(1).max(100).default(80),
});

/**
 * Type exports for TypeScript inference
 */
export type BudgetPeriod = z.infer<typeof BudgetPeriodSchema>;
export type BudgetCreate = z.infer<typeof BudgetCreateSchema>;
export type BudgetData = z.infer<typeof BudgetSchema>;
export type BudgetUpdate = z.infer<typeof BudgetUpdateSchema>;
export type BulkBudgetCreate = z.infer<typeof BulkBudgetCreateSchema>;
export type BudgetFilter = z.infer<typeof BudgetFilterSchema>;
export type BudgetStatusInput = z.infer<typeof BudgetStatusInputSchema>;