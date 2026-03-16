/**
 * Test Utilities
 * 
 * Helpers para renderizar componentes con todos los Providers necesarios
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import { AppProvider } from '../../contexts/AppContext';
import { UIProvider } from '../../contexts/UIContext';

/**
 * Wrapper con todos los Providers de la app
 */
function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>
        <UIProvider>
          {children}
        </UIProvider>
      </AppProvider>
    </AuthProvider>
  );
}

/**
 * Custom render que incluye todos los Providers
 * 
 * @example
 * const { getByText } = renderWithProviders(<MyComponent />);
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

/**
 * Re-export de todo lo que necesitamos de testing library
 */
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

/**
 * Helper: Esperar a que desaparezca el loading
 */
export async function waitForLoadingToFinish() {
  const { queryByText } = await import('@testing-library/react');
  // Esperar a que no haya ningún "Cargando..." en pantalla
  await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Helper: Login de usuario de prueba
 */
export async function loginTestUser(email: string = 'test@example.com', password: string = 'Test123456') {
  const { screen, waitFor } = await import('@testing-library/react');
  const userEvent = (await import('@testing-library/user-event')).default;
  
  // Buscar inputs de login
  const emailInput = screen.getByLabelText(/email|correo/i);
  const passwordInput = screen.getByLabelText(/contraseña|password/i);
  const loginButton = screen.getByRole('button', { name: /iniciar sesión|login/i });
  
  // Llenar formulario
  await userEvent.type(emailInput, email);
  await userEvent.type(passwordInput, password);
  await userEvent.click(loginButton);
  
  // Esperar a que cargue el dashboard
  await waitFor(() => {
    expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
  }, { timeout: 5000 });
}

/**
 * Helper: Navegar a una pantalla
 */
export async function navigateToScreen(screenName: string) {
  const { screen } = await import('@testing-library/react');
  const userEvent = (await import('@testing-library/user-event')).default;
  
  const button = screen.getByLabelText(new RegExp(screenName, 'i'));
  await userEvent.click(button);
}

/**
 * Helper: Limpiar base de datos de prueba
 * (Para tests de integración)
 */
export async function cleanupTestDatabase(userId: string) {
  const { supabase } = await import('../../utils/supabase/client');
  
  // Eliminar transacciones de prueba
  await supabase.from('transactions').delete().eq('user_id', userId);
  
  // Eliminar presupuestos de prueba
  await supabase.from('budgets').delete().eq('user_id', userId);
  
  // Eliminar cuentas de prueba (excepto las default)
  await supabase.from('accounts').delete().eq('user_id', userId);
  
  // Eliminar categorías de prueba
  await supabase.from('categories').delete().eq('user_id', userId);
}

/**
 * Helper: Crear usuario de prueba
 */
export async function createTestUser(email: string, password: string, name: string = 'Test User') {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ email, password, name }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create test user');
  }
  
  return await response.json();
}

/**
 * Helper: Eliminar usuario de prueba
 */
export async function deleteTestUser(userId: string) {
  // Primero limpiar sus datos
  await cleanupTestDatabase(userId);
  
  // Luego eliminar el usuario (requiere service role key, solo en CI/CD)
  // En desarrollo, los usuarios de prueba se pueden acumular
}
