/**
 * Backend Validation Utilities
 * 
 * Utilities for validating request data in the server.
 * Uses Zod schemas for runtime validation.
 */

import { z } from 'npm:zod@3.22.4';

/**
 * Validation error response helper
 */
export function validationError(errors: z.ZodError) {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Errores de validación',
        details: {
          errors: errors.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
            value: err.path.length > 0 ? undefined : err,
          })),
        },
      },
    }),
    {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Validate request body with Zod schema
 */
export async function validateRequestBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<{ success: true; data: z.infer<T> } | { success: false; response: Response }> {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, response: validationError(error) };
    }
    return {
      success: false,
      response: new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'El cuerpo de la solicitud no es JSON válido',
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    };
  }
}

/**
 * Validate URL parameters with Zod schema
 */
export function validateParams<T extends z.ZodTypeAny>(
  params: Record<string, string>,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; response: Response } {
  try {
    const parsed = schema.parse(params);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, response: validationError(error) };
    }
    return {
      success: false,
      response: new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_PARAMS',
            message: 'Parámetros de URL inválidos',
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    };
  }
}

/**
 * Common schemas for backend validation
 */

// UUID parameter schema
export const UuidParamSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

// Pagination schema
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Date range schema
export const DateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: 'La fecha de inicio debe ser anterior a la fecha de fin',
    path: ['endDate'],
  }
);

// Transaction schemas (matching frontend)
export const TransactionTypeSchema = z.enum(['income', 'expense', 'transfer']);

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
}).refine(
  (data) => {
    if (data.type === 'transfer') {
      return !!data.toAccount;
    }
    return true;
  },
  {
    message: 'Las transferencias requieren una cuenta destino',
    path: ['toAccount'],
  }
).refine(
  (data) => {
    if (data.type === 'transfer' && data.toAccount) {
      return data.account !== data.toAccount;
    }
    return true;
  },
  {
    message: 'La cuenta origen y destino deben ser diferentes',
    path: ['toAccount'],
  }
).refine(
  (data) => {
    if (data.type !== 'transfer') {
      return !!data.category;
    }
    return true;
  },
  {
    message: 'La categoría es requerida para ingresos y gastos',
    path: ['category'],
  }
);

export const TransactionUpdateSchema = TransactionCreateSchema.partial().merge(
  z.object({ id: z.string().uuid('ID de transacción inválido') })
);

// Budget schemas
export const BudgetPeriodSchema = z.enum(['monthly', 'yearly']);

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

export const BudgetUpdateSchema = BudgetCreateSchema.partial().merge(
  z.object({ id: z.string().uuid('ID de presupuesto inválido') })
);

// Account schemas
export const AccountTypeSchema = z.enum(['cash', 'bank', 'card', 'digital']);

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

export const AccountUpdateSchema = AccountCreateSchema.partial().merge(
  z.object({ id: z.string().uuid('ID de cuenta inválido') })
);

// Category schemas
export const CategoryTypeSchema = z.enum(['income', 'expense']);

export const SubcategoryCreateSchema = z.object({
  name: z.string()
    .min(1, 'El nombre de la subcategoría es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim(),
  categoryId: z.string().uuid('ID de categoría inválido'),
  emoji: z.string()
    .max(10, 'El emoji es inválido')
    .optional(),
});

export const CategoryCreateSchema = z.object({
  name: z.string()
    .min(1, 'El nombre de la categoría es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim(),
  type: CategoryTypeSchema,
  icon: z.string()
    .min(1, 'El ícono es requerido')
    .max(50, 'El ícono es inválido'),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'El color debe ser un código hexadecimal válido (#RRGGBB)')
    .default('#3b82f6'),
  emoji: z.string()
    .max(10, 'El emoji es inválido')
    .optional(),
  subcategories: z.array(SubcategoryCreateSchema).optional(),
});

export const CategoryUpdateSchema = CategoryCreateSchema.partial().merge(
  z.object({ id: z.string().uuid('ID de categoría inválido') })
);