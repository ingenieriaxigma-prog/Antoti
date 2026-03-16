/**
 * Integration Test: Crear Transacción Completa
 * 
 * Flujo probado:
 * 1. Usuario hace login
 * 2. Navega a "Nueva Transacción"
 * 3. Selecciona tipo (ingreso/gasto)
 * 4. Ingresa monto
 * 5. Selecciona cuenta
 * 6. Selecciona categoría
 * 7. Guarda transacción
 * 8. Verifica que aparece en el dashboard
 * 9. Verifica que el balance se actualizó
 * 10. Verifica que se guardó en Supabase
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../../setup/test-utils';
import { supabase } from '../../../utils/supabase/client';
import { generateTestEmail, generateTestId } from '../../setup/mock-data';
import App from '../../../App';

describe('Integration Test: Crear Transacción', () => {
  let testUserId: string;
  let testEmail: string;
  let testPassword: string;
  let accountId: string;
  let categoryId: string;

  beforeEach(async () => {
    // Generar credenciales únicas para este test
    testEmail = generateTestEmail();
    testPassword = 'TestPassword123!';
    
    // Crear usuario de prueba
    const signupResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          name: 'Test User',
        }),
      }
    );
    
    const signupData = await signupResponse.json();
    testUserId = signupData.user.id;
    
    // Crear cuenta de prueba
    const accountResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/accounts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signupData.access_token}`,
        },
        body: JSON.stringify({
          name: 'Cuenta Test',
          type: 'bank',
          balance: 1000000,
          icon: 'building-2',
          color: '#10b981',
        }),
      }
    );
    
    const accountData = await accountResponse.json();
    accountId = accountData.id;
    
    // Crear categoría de prueba
    const categoryResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/categories`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signupData.access_token}`,
        },
        body: JSON.stringify({
          name: 'Salario Test',
          type: 'income',
          icon: 'briefcase',
          color: '#10b981',
          subcategories: ['Sueldo', 'Bonos'],
        }),
      }
    );
    
    const categoryData = await categoryResponse.json();
    categoryId = categoryData.id;
  });

  afterEach(async () => {
    // Limpiar datos de prueba
    if (testUserId) {
      await supabase.from('transactions').delete().eq('user_id', testUserId);
      await supabase.from('accounts').delete().eq('user_id', testUserId);
      await supabase.from('categories').delete().eq('user_id', testUserId);
      // En producción también eliminaríamos el usuario
    }
  });

  it('debe crear un ingreso completo y mostrarlo en el dashboard', async () => {
    const user = userEvent.setup();
    
    // 1. Renderizar app
    renderWithProviders(<App />);
    
    // 2. Esperar a que cargue la pantalla de login
    await waitFor(() => {
      expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
    });
    
    // 3. Hacer login
    const emailInput = screen.getByPlaceholderText(/correo electrónico/i);
    const passwordInput = screen.getByPlaceholderText(/contraseña/i);
    const loginButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    await user.type(emailInput, testEmail);
    await user.type(passwordInput, testPassword);
    await user.click(loginButton);
    
    // 4. Esperar a que cargue el dashboard
    await waitFor(() => {
      expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // 5. Verificar que estamos en el dashboard
    await waitFor(() => {
      expect(screen.getByText(/balance total/i)).toBeInTheDocument();
    });
    
    // 6. Navegar a Nueva Transacción (Speed Dial o botón)
    const newTransactionButton = screen.getByLabelText(/nueva transacción/i);
    await user.click(newTransactionButton);
    
    // 7. Esperar a que cargue el formulario
    await waitFor(() => {
      expect(screen.getByText(/tipo de transacción/i)).toBeInTheDocument();
    });
    
    // 8. Seleccionar tipo "Ingreso"
    const ingresoTab = screen.getByRole('button', { name: /ingreso/i });
    await user.click(ingresoTab);
    
    // 9. Ingresar monto usando el teclado personalizado
    const amountField = screen.getByText(/monto/i);
    await user.click(amountField);
    
    // Simular clicks en el teclado numérico
    const key5 = screen.getAllByText('5')[0]; // Primer "5" que encuentre
    const key0 = screen.getAllByText('0')[0];
    
    await user.click(key5); // 5
    await user.click(key0); // 0
    await user.click(key0); // 0
    await user.click(key0); // 0
    await user.click(key0); // 0
    await user.click(key0); // 0
    // Resultado: 500000
    
    // 10. Seleccionar cuenta
    const accountField = screen.getByText(/seleccionar cuenta/i);
    await user.click(accountField);
    
    await waitFor(() => {
      expect(screen.getByText(/cuenta test/i)).toBeInTheDocument();
    });
    
    const accountOption = screen.getByText(/cuenta test/i);
    await user.click(accountOption);
    
    // 11. Seleccionar categoría
    const categoryField = screen.getByText(/seleccionar categoría/i);
    await user.click(categoryField);
    
    await waitFor(() => {
      expect(screen.getByText(/salario test/i)).toBeInTheDocument();
    });
    
    const categoryOption = screen.getByText(/salario test/i);
    await user.click(categoryOption);
    
    // 12. Seleccionar subcategoría
    await waitFor(() => {
      expect(screen.getByText(/sueldo/i)).toBeInTheDocument();
    });
    
    const subcategoryOption = screen.getByText(/sueldo/i);
    await user.click(subcategoryOption);
    
    // 13. Agregar nota
    const noteInput = screen.getByPlaceholderText(/agregar nota/i);
    await user.type(noteInput, 'Salario mensual de prueba');
    
    // 14. Guardar transacción
    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);
    
    // 15. Esperar confirmación y retorno al dashboard
    await waitFor(() => {
      expect(screen.getByText(/transacción creada exitosamente/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(screen.getByText(/balance total/i)).toBeInTheDocument();
    });
    
    // 16. Verificar que la transacción aparece en el dashboard
    await waitFor(() => {
      expect(screen.getByText(/500.000/i)).toBeInTheDocument(); // Formato de moneda
      expect(screen.getByText(/salario mensual de prueba/i)).toBeInTheDocument();
    });
    
    // 17. Verificar que el balance se actualizó correctamente
    // Balance inicial: 1,000,000 + Ingreso: 500,000 = 1,500,000
    await waitFor(() => {
      expect(screen.getByText(/1\.500\.000/i)).toBeInTheDocument();
    });
    
    // 18. Verificar en la base de datos que se guardó correctamente
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', testUserId)
      .eq('type', 'income')
      .eq('amount', 500000);
    
    expect(error).toBeNull();
    expect(transactions).toHaveLength(1);
    expect(transactions![0]).toMatchObject({
      user_id: testUserId,
      type: 'income',
      amount: 500000,
      account: accountId,
      category: categoryId,
      subcategory: 'Sueldo',
      note: 'Salario mensual de prueba',
    });
    
    // 19. Verificar que la cuenta se actualizó
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountId)
      .single();
    
    expect(accountError).toBeNull();
    expect(account!.balance).toBe(1500000); // 1,000,000 + 500,000
  });

  it('debe crear un gasto completo y actualizar el balance correctamente', async () => {
    const user = userEvent.setup();
    
    // 1. Renderizar y hacer login (similar al test anterior)
    renderWithProviders(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
    });
    
    const emailInput = screen.getByPlaceholderText(/correo electrónico/i);
    const passwordInput = screen.getByPlaceholderText(/contraseña/i);
    const loginButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    await user.type(emailInput, testEmail);
    await user.type(passwordInput, testPassword);
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/balance total/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // 2. Crear categoría de gasto
    const categoryResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/categories`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          name: 'Alimentación Test',
          type: 'expense',
          icon: 'utensils',
          color: '#f97316',
          subcategories: ['Supermercado'],
        }),
      }
    );
    
    const expenseCategoryData = await categoryResponse.json();
    const expenseCategoryId = expenseCategoryData.id;
    
    // 3. Navegar a Nueva Transacción
    const newTransactionButton = screen.getByLabelText(/nueva transacción/i);
    await user.click(newTransactionButton);
    
    await waitFor(() => {
      expect(screen.getByText(/tipo de transacción/i)).toBeInTheDocument();
    });
    
    // 4. Seleccionar tipo "Gasto"
    const gastoTab = screen.getByRole('button', { name: /gasto/i });
    await user.click(gastoTab);
    
    // 5. Ingresar monto: 150,000
    const amountField = screen.getByText(/monto/i);
    await user.click(amountField);
    
    const key1 = screen.getAllByText('1')[0];
    const key5 = screen.getAllByText('5')[0];
    const key0 = screen.getAllByText('0')[0];
    
    await user.click(key1); // 1
    await user.click(key5); // 5
    await user.click(key0); // 0
    await user.click(key0); // 0
    await user.click(key0); // 0
    await user.click(key0); // 0
    // Resultado: 150000
    
    // 6. Seleccionar cuenta
    const accountField = screen.getByText(/seleccionar cuenta/i);
    await user.click(accountField);
    
    await waitFor(() => {
      expect(screen.getByText(/cuenta test/i)).toBeInTheDocument();
    });
    
    await user.click(screen.getByText(/cuenta test/i));
    
    // 7. Seleccionar categoría de gasto
    const categoryField = screen.getByText(/seleccionar categoría/i);
    await user.click(categoryField);
    
    await waitFor(() => {
      expect(screen.getByText(/alimentación test/i)).toBeInTheDocument();
    });
    
    await user.click(screen.getByText(/alimentación test/i));
    
    // 8. Seleccionar subcategoría
    await waitFor(() => {
      expect(screen.getByText(/supermercado/i)).toBeInTheDocument();
    });
    
    await user.click(screen.getByText(/supermercado/i));
    
    // 9. Agregar nota
    const noteInput = screen.getByPlaceholderText(/agregar nota/i);
    await user.type(noteInput, 'Compras del mes');
    
    // 10. Guardar
    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);
    
    // 11. Verificar confirmación
    await waitFor(() => {
      expect(screen.getByText(/transacción creada exitosamente/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // 12. Verificar balance actualizado
    // Balance inicial: 1,000,000 - Gasto: 150,000 = 850,000
    await waitFor(() => {
      expect(screen.getByText(/850\.000/i)).toBeInTheDocument();
    });
    
    // 13. Verificar en base de datos
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', testUserId)
      .eq('type', 'expense')
      .eq('amount', 150000);
    
    expect(error).toBeNull();
    expect(transactions).toHaveLength(1);
    expect(transactions![0].note).toBe('Compras del mes');
  });
});
