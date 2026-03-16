/**
 * Account Validation Schemas
 * 
 * Zod schemas for runtime validation of accounts.
 */

import { z } from 'zod';

/**
 * Account type enum
 */
export const AccountTypeSchema = z.enum(['cash', 'bank', 'card', 'digital']);

/**
 * Base account schema (without ID)
 */
export const AccountCreateSchema = z.object({
  name: z.string()
    .min(1, 'El nombre de la cuenta es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim(),
  type: AccountTypeSchema,
  balance: z.number()
    .finite('El balance debe ser un número válido')
    .default(0),
  icon: z.string()
    .min(1, 'El ícono es requerido')
    .max(50, 'El ícono es inválido'),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'El color debe ser un código hexadecimal válido (#RRGGBB)')
    .default('#3b82f6'),
});

/**
 * Full account schema (with ID)
 */
export const AccountSchema = AccountCreateSchema.merge(
  z.object({
    id: z.string().uuid('ID de cuenta inválido'),
  })
);

/**
 * Update account schema (partial)
 */
export const AccountUpdateSchema = AccountSchema.partial().required({ id: true });

/**
 * Bulk account creation schema
 */
export const BulkAccountCreateSchema = z.object({
  accounts: z.array(AccountCreateSchema)
    .min(1, 'Debe haber al menos una cuenta')
    .max(20, 'No se pueden crear más de 20 cuentas a la vez'),
});

/**
 * Account balance update schema
 */
export const AccountBalanceUpdateSchema = z.object({
  accountId: z.string().uuid('ID de cuenta inválido'),
  amount: z.number().finite('El monto debe ser un número válido'),
  operation: z.enum(['add', 'subtract', 'set']),
});

/**
 * Account filter schema
 */
export const AccountFilterSchema = z.object({
  type: AccountTypeSchema.optional(),
  minBalance: z.number().optional(),
  maxBalance: z.number().optional(),
  searchTerm: z.string().max(50).optional(),
});
// ⚠️ TEMPORALMENTE COMENTADO - Los refinements causan error con .partial() en Figma Make
// .refine(
//   (data) => {
//     if (data.minBalance !== undefined && data.maxBalance !== undefined) {
//       return data.minBalance <= data.maxBalance;
//     }
//     return true;
//   },
//   {
//     message: 'El balance mínimo debe ser menor al balance máximo',
//     path: ['maxBalance'],
//   }
// );

/**
 * Type exports for TypeScript inference
 */
export type AccountType = z.infer<typeof AccountTypeSchema>;
export type AccountCreate = z.infer<typeof AccountCreateSchema>;
export type AccountData = z.infer<typeof AccountSchema>;
export type AccountUpdate = z.infer<typeof AccountUpdateSchema>;
export type BulkAccountCreate = z.infer<typeof BulkAccountCreateSchema>;
export type AccountBalanceUpdate = z.infer<typeof AccountBalanceUpdateSchema>;
export type AccountFilter = z.infer<typeof AccountFilterSchema>;