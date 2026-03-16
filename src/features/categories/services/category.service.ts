/**
 * CategoryService - Business Logic for Categories
 * 
 * Handles category-related operations and utilities
 */

import type { Category, CategoryType } from '../types';

export class CategoryService {
  /**
   * Generate a unique ID for a category
   */
  static generateCategoryId(): string {
    return crypto.randomUUID();
  }

  /**
   * Filter categories by type
   */
  static filterByType(categories: Category[], type: CategoryType): Category[] {
    return categories.filter(c => c.type === type);
  }

  /**
   * Get income categories
   */
  static getIncomeCategories(categories: Category[]): Category[] {
    return this.filterByType(categories, 'income');
  }

  /**
   * Get expense categories
   */
  static getExpenseCategories(categories: Category[]): Category[] {
    return this.filterByType(categories, 'expense');
  }

  /**
   * Find category by ID
   */
  static getCategoryById(categoryId: string, categories: Category[]): Category | undefined {
    return categories.find(c => c.id === categoryId);
  }

  /**
   * Get category name by ID
   */
  static getCategoryName(categoryId: string, categories: Category[]): string {
    return this.getCategoryById(categoryId, categories)?.name || 'Categoría eliminada';
  }

  /**
   * Check if category name is duplicate
   */
  static isDuplicateName(
    name: string, 
    type: CategoryType, 
    categories: Category[],
    excludeCategoryId?: string
  ): boolean {
    return categories.some(
      c => c.name.toLowerCase() === name.trim().toLowerCase() && 
           c.type === type &&
           c.id !== excludeCategoryId
    );
  }

  /**
   * Get categories with subcategories
   */
  static getCategoriesWithSubcategories(categories: Category[]): Category[] {
    return categories.filter(c => (c.subcategories || []).length > 0);
  }

  /**
   * Get categories without subcategories
   */
  static getCategoriesWithoutSubcategories(categories: Category[]): Category[] {
    return categories.filter(c => (c.subcategories || []).length === 0);
  }

  /**
   * Count subcategories in a category
   */
  static getSubcategoryCount(category: Category): number {
    return (category.subcategories || []).length;
  }

  /**
   * Sort categories alphabetically
   */
  static sortByName(categories: Category[], ascending = true): Category[] {
    const sorted = [...categories].sort((a, b) => 
      a.name.localeCompare(b.name, 'es')
    );
    return ascending ? sorted : sorted.reverse();
  }

  /**
   * Sort categories by subcategory count
   */
  static sortBySubcategoryCount(categories: Category[], ascending = false): Category[] {
    const sorted = [...categories].sort((a, b) => {
      const countA = this.getSubcategoryCount(a);
      const countB = this.getSubcategoryCount(b);
      return countA - countB;
    });
    return ascending ? sorted : sorted.reverse();
  }

  /**
   * Search categories by name
   */
  static searchCategories(categories: Category[], query: string): Category[] {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return categories;

    return categories.filter(category =>
      category.name.toLowerCase().includes(lowerQuery) ||
      category.emoji?.includes(lowerQuery)
    );
  }

  /**
   * Validate category data
   */
  static validateCategory(data: Partial<Category>): string | null {
    if (!data.name || !data.name.trim()) {
      return 'El nombre es requerido';
    }

    if (data.name.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }

    if (data.name.trim().length > 50) {
      return 'El nombre no puede tener más de 50 caracteres';
    }

    if (!data.type || !['income', 'expense'].includes(data.type)) {
      return 'El tipo debe ser ingreso o gasto';
    }

    if (!data.color) {
      return 'El color es requerido';
    }

    return null;
  }

  /**
   * Get color options for categories
   */
  static getColorOptions(): string[] {
    return [
      '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
      '#06b6d4', '#f43f5e', '#84cc16', '#f97316', '#14b8a6', '#a855f7',
    ];
  }

  /**
   * Get default category color
   */
  static getDefaultColor(): string {
    return this.getColorOptions()[0];
  }
}
