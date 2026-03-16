/**
 * Form Types
 * 
 * Type definitions for form states and handlers.
 */

/**
 * Generic form field state
 */
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

/**
 * Form state
 */
export interface FormState<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
}

/**
 * Form handlers
 */
export interface FormHandlers<T extends Record<string, any>> {
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (e?: React.FormEvent) => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  resetForm: () => void;
  validateField: (field: keyof T) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
}

/**
 * Transaction form values
 */
export interface TransactionFormValues {
  type: 'income' | 'expense' | 'transfer';
  amount: string;
  category?: string;
  subcategory?: string;
  account: string;
  toAccount?: string;
  date: string;
  note?: string;
}

/**
 * Budget form values
 */
export interface BudgetFormValues {
  categoryId: string;
  amount: string;
  period: 'monthly' | 'yearly';
  alertThreshold: string;
}

/**
 * Account form values
 */
export interface AccountFormValues {
  name: string;
  type: 'cash' | 'bank' | 'card' | 'digital';
  balance: string;
  icon: string;
  color: string;
}

/**
 * Category form values
 */
export interface CategoryFormValues {
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  emoji?: string;
}

/**
 * Subcategory form values
 */
export interface SubcategoryFormValues {
  name: string;
  categoryId: string;
  emoji?: string;
}

/**
 * Login form values
 */
export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Signup form values
 */
export interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

/**
 * Reset password form values
 */
export interface ResetPasswordFormValues {
  email: string;
}

/**
 * Change password form values
 */
export interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Filter form values
 */
export interface FilterFormValues {
  type?: 'income' | 'expense' | 'transfer';
  accountId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: string;
  maxAmount?: string;
  searchTerm?: string;
}

/**
 * Form validation rule
 */
export interface ValidationRule<T = any> {
  validate: (value: T, formValues?: Record<string, any>) => boolean | Promise<boolean>;
  message: string;
}

/**
 * Field validation rules
 */
export interface FieldValidationRules<T = any> {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  custom?: ValidationRule<T>[];
}

/**
 * Form validation schema
 */
export type FormValidationSchema<T extends Record<string, any>> = {
  [K in keyof T]?: FieldValidationRules<T[K]>;
};

/**
 * Form config
 */
export interface FormConfig<T extends Record<string, any>> {
  initialValues: T;
  validationSchema?: FormValidationSchema<T>;
  onSubmit: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
}

/**
 * Select option
 */
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  icon?: string;
  color?: string;
}

/**
 * Multi-step form state
 */
export interface MultiStepFormState<T extends Record<string, any>> {
  currentStep: number;
  totalSteps: number;
  stepData: Partial<T>[];
  canGoNext: boolean;
  canGoPrev: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

/**
 * Multi-step form handlers
 */
export interface MultiStepFormHandlers {
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}
