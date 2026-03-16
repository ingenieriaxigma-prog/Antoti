/**
 * Category Validation Schemas
 * 
 * Zod schemas for runtime validation of categories and subcategories.
 */

import { z } from 'zod';

/**
 * Category type enum
 */
export const CategoryTypeSchema = z.enum(['income', 'expense']);

/**
 * Subcategory schema (without ID for creation)
 */
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

/**
 * Full subcategory schema (with ID)
 */
export const SubcategorySchema = SubcategoryCreateSchema.merge(
  z.object({
    id: z.string().uuid('ID de subcategoría inválido'),
  })
);

/**
 * Base category schema (without ID)
 */
export const CategoryCreateSchema = z.object({
  name: z.string()
    .min(1, 'El nombre de la categoría es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim(),
  type: CategoryTypeSchema,
  icon: z.string()
    .min(1, 'El ícono es requerido')
    .max(50, 'El ícono es inválido')
    .regex(/^[A-Z][a-zA-Z0-9]*$/, 'El ícono debe ser un nombre válido de Lucide (ej: Home, User, Settings)'),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'El color debe ser un código hexadecimal válido (#RRGGBB)')
    .default('#3b82f6'),
  emoji: z.string()
    .max(10, 'El emoji es inválido')
    .optional(),
  subcategories: z.array(SubcategoryCreateSchema).optional(),
});

/**
 * Full category schema (with ID)
 */
export const CategorySchema = CategoryCreateSchema.merge(
  z.object({
    id: z.string().uuid('ID de categoría inválido'),
    subcategories: z.array(SubcategorySchema).optional(),
  })
);

/**
 * Update category schema (partial)
 */
export const CategoryUpdateSchema = CategorySchema.partial().required({ id: true });

/**
 * Update subcategory schema (partial)
 */
export const SubcategoryUpdateSchema = SubcategorySchema.partial().required({ id: true });

/**
 * Bulk category creation schema
 */
export const BulkCategoryCreateSchema = z.object({
  categories: z.array(CategoryCreateSchema)
    .min(1, 'Debe haber al menos una categoría')
    .max(50, 'No se pueden crear más de 50 categorías a la vez'),
});

/**
 * Category filter schema
 */
export const CategoryFilterSchema = z.object({
  type: CategoryTypeSchema.optional(),
  searchTerm: z.string().max(50).optional(),
  hasSubcategories: z.boolean().optional(),
});

/**
 * Add subcategory to category schema
 */
export const AddSubcategorySchema = z.object({
  categoryId: z.string().uuid('ID de categoría inválido'),
  subcategory: SubcategoryCreateSchema.omit({ categoryId: true }),
});

/**
 * Remove subcategory schema
 */
export const RemoveSubcategorySchema = z.object({
  categoryId: z.string().uuid('ID de categoría inválido'),
  subcategoryId: z.string().uuid('ID de subcategoría inválido'),
});

/**
 * Type exports for TypeScript inference
 */
export type CategoryType = z.infer<typeof CategoryTypeSchema>;
export type SubcategoryCreate = z.infer<typeof SubcategoryCreateSchema>;
export type SubcategoryData = z.infer<typeof SubcategorySchema>;
export type SubcategoryUpdate = z.infer<typeof SubcategoryUpdateSchema>;
export type CategoryCreate = z.infer<typeof CategoryCreateSchema>;
export type CategoryData = z.infer<typeof CategorySchema>;
export type CategoryUpdate = z.infer<typeof CategoryUpdateSchema>;
export type BulkCategoryCreate = z.infer<typeof BulkCategoryCreateSchema>;
export type CategoryFilter = z.infer<typeof CategoryFilterSchema>;
export type AddSubcategory = z.infer<typeof AddSubcategorySchema>;
export type RemoveSubcategory = z.infer<typeof RemoveSubcategorySchema>;