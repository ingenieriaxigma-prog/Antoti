/**
 * Category Types
 * 
 * TypeScript type definitions for the categories feature
 */

/**
 * Category type (income or expense)
 */
export type CategoryType = 'income' | 'expense';

/**
 * Subcategory within a category
 */
export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  emoji?: string;
}

/**
 * Main category entity
 */
export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  emoji?: string;
  subcategories?: Subcategory[];
  isSystem?: boolean; // ✅ Marca categorías del sistema (no editables/borrables)
}

/**
 * Form data for creating/updating categories
 */
export type CategoryFormData = Omit<Category, 'id' | 'subcategories'>;

/**
 * Props for Category components
 */
export interface CategoriesScreenProps {
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (categoryId: string, updates: Partial<Category>) => void;
  onDeleteCategory: (categoryId: string) => boolean;
  onNavigate: (screen: string) => void;
  onSelectCategory?: (categoryId: string) => void;
}

export interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  onSelect?: (categoryId: string) => void;
}

export interface CategoryFormProps {
  show: boolean;
  editingCategory: Category | null;
  categoryName: string;
  categoryEmoji: string;
  categoryType: CategoryType;
  categoryColor: string;
  onCategoryNameChange: (name: string) => void;
  onCategoryEmojiChange: (emoji: string) => void;
  onCategoryTypeChange: (type: CategoryType) => void;
  onCategoryColorChange: (color: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  colorOptions: string[];
}

export interface CategoryListProps {
  title: string;
  categories: Category[];
  icon: React.ComponentType<{ className?: string }>;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  onSelect?: (categoryId: string) => void;
}