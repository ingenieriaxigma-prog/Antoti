/**
 * Integration Test: Presupuesto y Tracking
 * 
 * Flujo probado:
 * 1. Usuario crea un presupuesto de $500,000 para "Alimentación"
 * 2. Crea gasto de $100,000 (20% usado)
 * 3. Verifica que el presupuesto muestra 20% de uso
 * 4. Crea gasto de $150,000 (50% usado total)
 * 5. Verifica que el presupuesto muestra 50% de uso
 * 6. Crea gasto de $200,000 (90% usado total - excede threshold 80%)
 * 7. Verifica alerta de threshold excedido
 * 8. Crea gasto de $100,000 (110% usado - excede presupuesto)
 * 9. Verifica alerta de presupuesto excedido
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../../setup/test-utils';
import { supabase } from '../../../utils/supabase/client';
import { generateTestEmail } from '../../setup/mock-data';
import App from '../../../App';

describe('Integration Test: Presupuesto y Tracking', () => {
  let testUserId: string;
  let testEmail: string;
  let testPassword: string;
  let accessToken: string;
  let accountId: string;
  let categoryId: string;
  let budgetId: string;

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
          balance: 2000000, // 2 millones para tener suficiente
          icon: 'building-2',
          color: '#10b981',
        }),
      }
    );
    
    const accountData = await accountResponse.json();
    accountId = accountData.id;
    
    // Crear categoría de gastos
    const categoryResponse = await fetch(
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
    
    const categoryData = await categoryResponse.json();
    categoryId = categoryData.id;
  });

  afterEach(async () => {
    if (testUserId) {
      await supabase.from('transactions').delete().eq('user_id', testUserId);
      await supabase.from('budgets').delete().eq('user_id', testUserId);
      await supabase.from('accounts').delete().eq('user_id', testUserId);
      await supabase.from('categories').delete().eq('user_id', testUserId);
    }
  });

  it('debe crear presupuesto y trackear gastos con alertas correctas', async () => {
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
    
    // 2. Navegar a Presupuestos
    const presupuestosButton = screen.getByLabelText(/presupuestos/i);
    await user.click(presupuestosButton);
    
    await waitFor(() => {
      expect(screen.getByText(/mis presupuestos/i)).toBeInTheDocument();
    });
    
    // 3. Crear nuevo presupuesto
    const newBudgetButton = screen.getByRole('button', { name: /nuevo presupuesto/i });
    await user.click(newBudgetButton);
    
    await waitFor(() => {
      expect(screen.getByText(/crear presupuesto/i)).toBeInTheDocument();
    });
    
    // 4. Seleccionar categoría "Alimentación"
    const categorySelect = screen.getByLabelText(/categoría/i);
    await user.click(categorySelect);
    
    await waitFor(() => {
      expect(screen.getByText(/alimentación test/i)).toBeInTheDocument();
    });
    
    await user.click(screen.getByText(/alimentación test/i));
    
    // 5. Ingresar monto del presupuesto: $500,000
    const amountInput = screen.getByLabelText(/monto del presupuesto/i);
    await user.type(amountInput, '500000');
    
    // 6. Configurar threshold de alerta: 80%
    const thresholdInput = screen.getByLabelText(/alerta cuando se alcance/i);
    await user.clear(thresholdInput);
    await user.type(thresholdInput, '80');
    
    // 7. Guardar presupuesto
    const saveBudgetButton = screen.getByRole('button', { name: /crear presupuesto/i });
    await user.click(saveBudgetButton);
    
    // 8. Verificar confirmación
    await waitFor(() => {
      expect(screen.getByText(/presupuesto creado exitosamente/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // 9. Verificar que el presupuesto aparece en la lista
    await waitFor(() => {
      expect(screen.getByText(/alimentación test/i)).toBeInTheDocument();
      expect(screen.getByText(/500\.000/i)).toBeInTheDocument();
      expect(screen.getByText(/0%/i)).toBeInTheDocument(); // 0% usado inicialmente
    });
    
    // 10. Guardar ID del presupuesto para verificaciones posteriores
    const { data: budgets } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', testUserId)
      .eq('category_id', categoryId);
    
    budgetId = budgets![0].id;
    
    // ==============================================
    // FASE 1: Crear gasto de $100,000 (20% usado)
    // ==============================================
    
    // 11. Volver al dashboard
    const dashboardButton = screen.getByLabelText(/inicio|dashboard/i);
    await user.click(dashboardButton);
    
    await waitFor(() => {
      expect(screen.getByText(/balance total/i)).toBeInTheDocument();
    });
    
    // 12. Crear primera transacción de gasto
    const newTransactionButton = screen.getByLabelText(/nueva transacción/i);
    await user.click(newTransactionButton);
    
    await waitFor(() => {
      expect(screen.getByText(/tipo de transacción/i)).toBeInTheDocument();
    });
    
    // 13. Seleccionar Gasto
    const gastoTab = screen.getByRole('button', { name: /gasto/i });
    await user.click(gastoTab);
    
    // 14. Ingresar monto: $100,000
    const amountField = screen.getByText(/monto/i);
    await user.click(amountField);
    
    await user.click(screen.getAllByText('1')[0]); // 1
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    
    // 15. Seleccionar cuenta
    const accountField = screen.getByText(/seleccionar cuenta/i);
    await user.click(accountField);
    await waitFor(() => expect(screen.getByText(/cuenta test/i)).toBeInTheDocument());
    await user.click(screen.getByText(/cuenta test/i));
    
    // 16. Seleccionar categoría Alimentación
    const categoryField = screen.getByText(/seleccionar categoría/i);
    await user.click(categoryField);
    await waitFor(() => expect(screen.getByText(/alimentación test/i)).toBeInTheDocument());
    await user.click(screen.getByText(/alimentación test/i));
    
    // 17. Seleccionar subcategoría
    await waitFor(() => expect(screen.getByText(/supermercado/i)).toBeInTheDocument());
    await user.click(screen.getByText(/supermercado/i));
    
    // 18. Guardar transacción
    const saveTransactionButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveTransactionButton);
    
    await waitFor(() => {
      expect(screen.getByText(/transacción creada exitosamente/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // 19. Verificar presupuesto actualizado al 20%
    await user.click(presupuestosButton);
    
    await waitFor(() => {
      expect(screen.getByText(/20%/i)).toBeInTheDocument(); // 100k / 500k = 20%
    });
    
    // 20. Verificar visualmente que NO hay alerta (aún no excede 80%)
    expect(screen.queryByText(/alerta|advertencia|cuidado/i)).not.toBeInTheDocument();
    
    // ==============================================
    // FASE 2: Crear gasto de $150,000 (50% usado total)
    // ==============================================
    
    // 21. Crear segunda transacción
    await user.click(dashboardButton);
    await user.click(newTransactionButton);
    
    await waitFor(() => {
      expect(screen.getByText(/tipo de transacción/i)).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('button', { name: /gasto/i }));
    
    // 22. Ingresar $150,000
    const amountField2 = screen.getByText(/monto/i);
    await user.click(amountField2);
    
    await user.click(screen.getAllByText('1')[0]); // 1
    await user.click(screen.getAllByText('5')[0]); // 5
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    
    // 23. Seleccionar cuenta y categoría
    await user.click(screen.getByText(/seleccionar cuenta/i));
    await waitFor(() => expect(screen.getByText(/cuenta test/i)).toBeInTheDocument());
    await user.click(screen.getByText(/cuenta test/i));
    
    await user.click(screen.getByText(/seleccionar categoría/i));
    await waitFor(() => expect(screen.getByText(/alimentación test/i)).toBeInTheDocument());
    await user.click(screen.getByText(/alimentación test/i));
    
    await waitFor(() => expect(screen.getByText(/restaurantes/i)).toBeInTheDocument());
    await user.click(screen.getByText(/restaurantes/i));
    
    // 24. Guardar
    await user.click(screen.getByRole('button', { name: /guardar/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/transacción creada exitosamente/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // 25. Verificar presupuesto al 50%
    await user.click(presupuestosButton);
    
    await waitFor(() => {
      expect(screen.getByText(/50%/i)).toBeInTheDocument(); // 250k / 500k = 50%
    });
    
    // ==============================================
    // FASE 3: Crear gasto de $200,000 (90% usado - ALERTA)
    // ==============================================
    
    // 26. Crear tercera transacción (excederá threshold de 80%)
    await user.click(dashboardButton);
    await user.click(newTransactionButton);
    
    await waitFor(() => {
      expect(screen.getByText(/tipo de transacción/i)).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('button', { name: /gasto/i }));
    
    // 27. Ingresar $200,000
    const amountField3 = screen.getByText(/monto/i);
    await user.click(amountField3);
    
    await user.click(screen.getAllByText('2')[0]); // 2
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    
    // 28. Seleccionar cuenta y categoría
    await user.click(screen.getByText(/seleccionar cuenta/i));
    await waitFor(() => expect(screen.getByText(/cuenta test/i)).toBeInTheDocument());
    await user.click(screen.getByText(/cuenta test/i));
    
    await user.click(screen.getByText(/seleccionar categoría/i));
    await waitFor(() => expect(screen.getByText(/alimentación test/i)).toBeInTheDocument());
    await user.click(screen.getByText(/alimentación test/i));
    
    await waitFor(() => expect(screen.getByText(/supermercado/i)).toBeInTheDocument());
    await user.click(screen.getByText(/supermercado/i));
    
    // 29. Guardar
    await user.click(screen.getByRole('button', { name: /guardar/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/transacción creada exitosamente/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // 30. Verificar presupuesto al 90% con ALERTA
    await user.click(presupuestosButton);
    
    await waitFor(() => {
      expect(screen.getByText(/90%/i)).toBeInTheDocument(); // 450k / 500k = 90%
    });
    
    // 31. Verificar que HAY alerta visual (excedió 80%)
    await waitFor(() => {
      expect(screen.getByText(/alerta|advertencia|cuidado|excedido/i)).toBeInTheDocument();
    });
    
    // ==============================================
    // FASE 4: Crear gasto de $100,000 (110% - EXCEDE)
    // ==============================================
    
    // 32. Crear cuarta transacción (excederá presupuesto)
    await user.click(dashboardButton);
    await user.click(newTransactionButton);
    
    await waitFor(() => {
      expect(screen.getByText(/tipo de transacción/i)).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('button', { name: /gasto/i }));
    
    // 33. Ingresar $100,000
    const amountField4 = screen.getByText(/monto/i);
    await user.click(amountField4);
    
    await user.click(screen.getAllByText('1')[0]); // 1
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    
    // 34. Seleccionar cuenta y categoría
    await user.click(screen.getByText(/seleccionar cuenta/i));
    await waitFor(() => expect(screen.getByText(/cuenta test/i)).toBeInTheDocument());
    await user.click(screen.getByText(/cuenta test/i));
    
    await user.click(screen.getByText(/seleccionar categoría/i));
    await waitFor(() => expect(screen.getByText(/alimentación test/i)).toBeInTheDocument());
    await user.click(screen.getByText(/alimentación test/i));
    
    await waitFor(() => expect(screen.getByText(/restaurantes/i)).toBeInTheDocument());
    await user.click(screen.getByText(/restaurantes/i));
    
    // 35. Guardar
    await user.click(screen.getByRole('button', { name: /guardar/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/transacción creada exitosamente/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // 36. Verificar presupuesto al 110% con ALERTA ROJA
    await user.click(presupuestosButton);
    
    await waitFor(() => {
      expect(screen.getByText(/110%/i)).toBeInTheDocument(); // 550k / 500k = 110%
    });
    
    // 37. Verificar alerta de presupuesto excedido
    await waitFor(() => {
      expect(screen.getByText(/excedido|superado/i)).toBeInTheDocument();
    });
    
    // 38. Verificar en base de datos
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', testUserId)
      .eq('type', 'expense')
      .eq('category', categoryId);
    
    expect(error).toBeNull();
    expect(transactions).toHaveLength(4);
    
    const totalSpent = transactions!.reduce((sum, t) => sum + t.amount, 0);
    expect(totalSpent).toBe(550000); // 100k + 150k + 200k + 100k
    
    // 39. Verificar budget en base de datos
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', budgetId)
      .single();
    
    expect(budgetError).toBeNull();
    expect(budget).toMatchObject({
      user_id: testUserId,
      category_id: categoryId,
      amount: 500000,
      alert_threshold: 80,
    });
  });
});
