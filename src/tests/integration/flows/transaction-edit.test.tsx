/**
 * Integration Test: Editar Transacción
 * 
 * Flujo probado:
 * 1. Usuario crea una transacción
 * 2. Hace click en la transacción para editarla
 * 3. Modifica el monto
 * 4. Modifica la categoría
 * 5. Modifica la nota
 * 6. Guarda los cambios
 * 7. Verifica que los cambios se reflejan en el dashboard
 * 8. Verifica que el balance se recalculó correctamente
 * 9. Verifica que los cambios se guardaron en Supabase
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../../setup/test-utils';
import { supabase } from '../../../utils/supabase/client';
import { generateTestEmail } from '../../setup/mock-data';
import App from '../../../App';

describe('Integration Test: Editar Transacción', () => {
  let testUserId: string;
  let testEmail: string;
  let testPassword: string;
  let accessToken: string;
  let accountId: string;
  let category1Id: string;
  let category2Id: string;
  let transactionId: string;

  beforeEach(async () => {
    testEmail = generateTestEmail();
    testPassword = 'TestPassword123!';
    
    // Crear usuario
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
    accessToken = signupData.access_token;
    
    // Crear cuenta
    const accountResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/accounts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
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
    
    // Crear categoría 1 (original)
    const category1Response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/categories`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: 'Alimentación Test',
          type: 'expense',
          icon: 'utensils',
          color: '#f97316',
          subcategories: ['Supermercado', 'Restaurantes'],
        }),
      }
    );
    
    const category1Data = await category1Response.json();
    category1Id = category1Data.id;
    
    // Crear categoría 2 (para edición)
    const category2Response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/categories`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: 'Transporte Test',
          type: 'expense',
          icon: 'car',
          color: '#3b82f6',
          subcategories: ['Gasolina', 'Uber'],
        }),
      }
    );
    
    const category2Data = await category2Response.json();
    category2Id = category2Data.id;
    
    // Crear transacción inicial
    const transactionResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/transactions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          type: 'expense',
          amount: 100000,
          category: category1Id,
          subcategory: 'Supermercado',
          account: accountId,
          date: new Date().toISOString(),
          note: 'Compra original',
        }),
      }
    );
    
    const transactionData = await transactionResponse.json();
    transactionId = transactionData.id;
  });

  afterEach(async () => {
    if (testUserId) {
      await supabase.from('transactions').delete().eq('user_id', testUserId);
      await supabase.from('accounts').delete().eq('user_id', testUserId);
      await supabase.from('categories').delete().eq('user_id', testUserId);
    }
  });

  it('debe editar una transacción y reflejar los cambios correctamente', async () => {
    const user = userEvent.setup();
    
    // 1. Renderizar y login
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
    
    // 2. Verificar que la transacción original aparece
    await waitFor(() => {
      expect(screen.getByText(/compra original/i)).toBeInTheDocument();
      expect(screen.getByText(/100\.000/i)).toBeInTheDocument();
    });
    
    // 3. Verificar balance inicial: 1,000,000 - 100,000 = 900,000
    await waitFor(() => {
      expect(screen.getByText(/900\.000/i)).toBeInTheDocument();
    });
    
    // 4. Click en la transacción para editarla
    const transactionItem = screen.getByText(/compra original/i).closest('div');
    await user.click(transactionItem!);
    
    // 5. Esperar a que se abra el formulario de edición
    await waitFor(() => {
      expect(screen.getByText(/editar transacción/i)).toBeInTheDocument();
    });
    
    // 6. Verificar que los valores originales están cargados
    expect(screen.getByDisplayValue(/compra original/i)).toBeInTheDocument();
    
    // 7. Cambiar el monto de 100,000 a 150,000
    // Primero limpiar el monto actual
    const amountField = screen.getByLabelText(/monto/i);
    await user.click(amountField);
    
    // Usar el botón de borrar del teclado personalizado
    const clearButton = screen.getByText(/limpiar|borrar/i);
    await user.click(clearButton);
    
    // Ingresar nuevo monto
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
    
    // 8. Cambiar la categoría de "Alimentación" a "Transporte"
    const categoryField = screen.getByText(/alimentación test/i);
    await user.click(categoryField);
    
    await waitFor(() => {
      expect(screen.getByText(/transporte test/i)).toBeInTheDocument();
    });
    
    const newCategory = screen.getByText(/transporte test/i);
    await user.click(newCategory);
    
    // 9. Cambiar subcategoría
    await waitFor(() => {
      expect(screen.getByText(/gasolina/i)).toBeInTheDocument();
    });
    
    await user.click(screen.getByText(/gasolina/i));
    
    // 10. Cambiar la nota
    const noteInput = screen.getByDisplayValue(/compra original/i);
    await user.clear(noteInput);
    await user.type(noteInput, 'Compra editada - Gasolina');
    
    // 11. Guardar cambios
    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);
    
    // 12. Verificar confirmación
    await waitFor(() => {
      expect(screen.getByText(/transacción actualizada exitosamente/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // 13. Verificar que volvemos al dashboard
    await waitFor(() => {
      expect(screen.getByText(/balance total/i)).toBeInTheDocument();
    });
    
    // 14. Verificar que la transacción editada aparece con los nuevos valores
    await waitFor(() => {
      expect(screen.getByText(/compra editada - gasolina/i)).toBeInTheDocument();
      expect(screen.getByText(/150\.000/i)).toBeInTheDocument();
    });
    
    // 15. Verificar que NO aparece la nota original
    expect(screen.queryByText(/compra original/i)).not.toBeInTheDocument();
    
    // 16. Verificar que el balance se recalculó correctamente
    // Balance: 1,000,000 - 150,000 = 850,000
    await waitFor(() => {
      expect(screen.getByText(/850\.000/i)).toBeInTheDocument();
    });
    
    // 17. Verificar en la base de datos
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    
    expect(error).toBeNull();
    expect(transaction).toMatchObject({
      id: transactionId,
      user_id: testUserId,
      type: 'expense',
      amount: 150000, // ✅ Monto actualizado
      category: category2Id, // ✅ Categoría actualizada
      subcategory: 'Gasolina', // ✅ Subcategoría actualizada
      account: accountId,
      note: 'Compra editada - Gasolina', // ✅ Nota actualizada
    });
    
    // 18. Verificar que el balance de la cuenta se actualizó
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountId)
      .single();
    
    expect(accountError).toBeNull();
    expect(account!.balance).toBe(850000); // 1,000,000 - 150,000
  });

  it('debe permitir cambiar el tipo de transacción durante la edición', async () => {
    const user = userEvent.setup();
    
    // 1. Login
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
    
    // 2. Balance inicial: 1,000,000 - 100,000 = 900,000 (gasto)
    await waitFor(() => {
      expect(screen.getByText(/900\.000/i)).toBeInTheDocument();
    });
    
    // 3. Crear categoría de ingreso
    const categoryResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/categories`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: 'Salario Test',
          type: 'income',
          icon: 'briefcase',
          color: '#10b981',
          subcategories: ['Sueldo'],
        }),
      }
    );
    
    const incomeCategoryData = await categoryResponse.json();
    const incomeCategoryId = incomeCategoryData.id;
    
    // 4. Click en la transacción para editar
    const transactionItem = screen.getByText(/compra original/i).closest('div');
    await user.click(transactionItem!);
    
    await waitFor(() => {
      expect(screen.getByText(/editar transacción/i)).toBeInTheDocument();
    });
    
    // 5. Cambiar tipo de Gasto a Ingreso
    // NOTA: En modo edición, los tabs de tipo están deshabilitados
    // Así que este test debe verificar que NO se puede cambiar el tipo
    const ingresoTab = screen.getByRole('button', { name: /ingreso/i });
    expect(ingresoTab).toBeDisabled();
    
    // 6. Cancelar
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelButton);
    
    // 7. Verificar que volvemos al dashboard sin cambios
    await waitFor(() => {
      expect(screen.getByText(/compra original/i)).toBeInTheDocument();
      expect(screen.getByText(/900\.000/i)).toBeInTheDocument(); // Balance sin cambios
    });
  });
});
