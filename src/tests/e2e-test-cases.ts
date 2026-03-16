/**
 * E2E Test Cases - End-to-End Testing
 * 
 * Define escenarios de prueba de flujos completos de usuario
 * desde el inicio hasta el resultado final
 * 
 * Cada test simula acciones reales de usuario y valida:
 * - Interacciones UI
 * - Llamadas al backend
 * - Cambios de estado
 * - Navegación
 * - Persistencia de datos
 */

export type E2ETestStep = {
  action: string;
  description: string;
  validate?: (result: any) => Promise<boolean>;
  expectedResult?: string;
  critical?: boolean; // Si falla, abortar el test
};

export type E2ETestCase = {
  id: string;
  category: 'auth' | 'transactions' | 'budgets' | 'accounts' | 'categories' | 'navigation' | 'sync' | 'voice' | 'chat' | 'filters';
  title: string;
  description: string;
  preconditions?: string[];
  steps: E2ETestStep[];
  cleanup?: () => Promise<void>;
  timeout?: number; // ms
  priority?: 'high' | 'medium' | 'low';
};

/**
 * Colección de casos de prueba E2E
 */
export const E2E_TEST_CASES: Record<string, E2ETestCase> = {
  // ========================================
  // AUTH FLOWS
  // ========================================
  'auth-signup-flow': {
    id: 'auth-signup-flow',
    category: 'auth',
    title: 'Registro de Usuario Completo',
    description: 'Flujo completo de registro desde el inicio hasta dashboard',
    priority: 'high',
    timeout: 10000,
    steps: [
      {
        action: 'navigate_to_signup',
        description: 'Navegar a pantalla de registro',
        expectedResult: 'Formulario de registro visible'
      },
      {
        action: 'fill_signup_form',
        description: 'Llenar formulario con datos válidos',
        expectedResult: 'Campos completados correctamente'
      },
      {
        action: 'submit_signup',
        description: 'Enviar formulario de registro',
        expectedResult: 'Usuario creado exitosamente',
        critical: true
      },
      {
        action: 'verify_redirect',
        description: 'Verificar redirección a dashboard',
        expectedResult: 'Usuario en dashboard con sesión activa'
      },
      {
        action: 'verify_default_data',
        description: 'Verificar datos iniciales (cuentas, categorías)',
        expectedResult: 'Datos predeterminados creados'
      }
    ]
  },

  'auth-login-flow': {
    id: 'auth-login-flow',
    category: 'auth',
    title: 'Login de Usuario Existente',
    description: 'Flujo de inicio de sesión con credenciales válidas',
    priority: 'high',
    timeout: 8000,
    preconditions: ['Usuario ya registrado'],
    steps: [
      {
        action: 'navigate_to_login',
        description: 'Navegar a pantalla de login',
        expectedResult: 'Formulario de login visible'
      },
      {
        action: 'fill_login_form',
        description: 'Ingresar email y contraseña',
        expectedResult: 'Credenciales ingresadas'
      },
      {
        action: 'submit_login',
        description: 'Enviar formulario',
        expectedResult: 'Sesión iniciada exitosamente',
        critical: true
      },
      {
        action: 'verify_session',
        description: 'Verificar sesión activa',
        expectedResult: 'Access token presente'
      },
      {
        action: 'verify_user_data',
        description: 'Verificar datos del usuario cargados',
        expectedResult: 'Transacciones, cuentas y presupuestos visibles'
      }
    ]
  },

  // ========================================
  // TRANSACTION FLOWS
  // ========================================
  'transaction-create-income-flow': {
    id: 'transaction-create-income-flow',
    category: 'transactions',
    title: 'Crear Transacción de Ingreso',
    description: 'Flujo completo de creación de ingreso desde dashboard',
    priority: 'high',
    timeout: 8000,
    steps: [
      {
        action: 'open_transaction_form',
        description: 'Abrir formulario desde SpeedDial o botón',
        expectedResult: 'Formulario de transacción visible'
      },
      {
        action: 'select_income_type',
        description: 'Seleccionar tipo "Ingreso"',
        expectedResult: 'Tipo ingreso seleccionado'
      },
      {
        action: 'fill_amount',
        description: 'Ingresar monto (ej: 5000)',
        expectedResult: 'Monto válido ingresado'
      },
      {
        action: 'select_category',
        description: 'Seleccionar categoría de ingreso',
        expectedResult: 'Categoría seleccionada'
      },
      {
        action: 'select_account',
        description: 'Seleccionar cuenta destino',
        expectedResult: 'Cuenta seleccionada'
      },
      {
        action: 'add_note',
        description: 'Agregar nota opcional',
        expectedResult: 'Nota agregada'
      },
      {
        action: 'submit_transaction',
        description: 'Guardar transacción',
        expectedResult: 'Transacción creada exitosamente',
        critical: true
      },
      {
        action: 'verify_in_list',
        description: 'Verificar transacción en lista',
        expectedResult: 'Transacción visible en lista de transacciones'
      },
      {
        action: 'verify_account_balance',
        description: 'Verificar actualización de saldo',
        expectedResult: 'Saldo de cuenta incrementado'
      },
      {
        action: 'verify_sync',
        description: 'Verificar sincronización con backend',
        expectedResult: 'Transacción guardada en Supabase'
      }
    ]
  },

  'transaction-create-expense-flow': {
    id: 'transaction-create-expense-flow',
    category: 'transactions',
    title: 'Crear Transacción de Gasto',
    description: 'Flujo completo de creación de gasto con categoría y subcategoría',
    priority: 'high',
    timeout: 8000,
    steps: [
      {
        action: 'open_transaction_form',
        description: 'Abrir formulario de transacción',
        expectedResult: 'Formulario visible'
      },
      {
        action: 'select_expense_type',
        description: 'Seleccionar tipo "Gasto"',
        expectedResult: 'Tipo gasto seleccionado'
      },
      {
        action: 'fill_amount',
        description: 'Ingresar monto negativo (ej: 1500)',
        expectedResult: 'Monto válido'
      },
      {
        action: 'select_category',
        description: 'Seleccionar categoría de gasto',
        expectedResult: 'Categoría seleccionada'
      },
      {
        action: 'select_subcategory',
        description: 'Seleccionar subcategoría opcional',
        expectedResult: 'Subcategoría seleccionada'
      },
      {
        action: 'select_account',
        description: 'Seleccionar cuenta origen',
        expectedResult: 'Cuenta seleccionada'
      },
      {
        action: 'submit_transaction',
        description: 'Guardar gasto',
        expectedResult: 'Gasto creado exitosamente',
        critical: true
      },
      {
        action: 'verify_account_balance',
        description: 'Verificar saldo reducido',
        expectedResult: 'Saldo de cuenta decrementado'
      },
      {
        action: 'verify_budget_impact',
        description: 'Verificar impacto en presupuesto de categoría',
        expectedResult: 'Presupuesto actualizado con nuevo gasto'
      }
    ]
  },

  'transaction-transfer-flow': {
    id: 'transaction-transfer-flow',
    category: 'transactions',
    title: 'Transferencia Entre Cuentas',
    description: 'Flujo de transferencia de fondos entre dos cuentas',
    priority: 'medium',
    timeout: 8000,
    steps: [
      {
        action: 'open_transaction_form',
        description: 'Abrir formulario',
        expectedResult: 'Formulario visible'
      },
      {
        action: 'select_transfer_type',
        description: 'Seleccionar tipo "Transferencia"',
        expectedResult: 'Tipo transferencia seleccionado'
      },
      {
        action: 'fill_amount',
        description: 'Ingresar monto a transferir',
        expectedResult: 'Monto válido'
      },
      {
        action: 'select_from_account',
        description: 'Seleccionar cuenta origen',
        expectedResult: 'Cuenta origen seleccionada'
      },
      {
        action: 'select_to_account',
        description: 'Seleccionar cuenta destino (diferente)',
        expectedResult: 'Cuenta destino seleccionada'
      },
      {
        action: 'submit_transfer',
        description: 'Ejecutar transferencia',
        expectedResult: 'Transferencia creada exitosamente',
        critical: true
      },
      {
        action: 'verify_from_balance',
        description: 'Verificar saldo cuenta origen reducido',
        expectedResult: 'Saldo origen decrementado'
      },
      {
        action: 'verify_to_balance',
        description: 'Verificar saldo cuenta destino incrementado',
        expectedResult: 'Saldo destino incrementado'
      }
    ]
  },

  'transaction-edit-flow': {
    id: 'transaction-edit-flow',
    category: 'transactions',
    title: 'Editar Transacción Existente',
    description: 'Flujo de edición de una transacción previamente creada',
    priority: 'medium',
    timeout: 8000,
    preconditions: ['Transacción existente en el sistema'],
    steps: [
      {
        action: 'navigate_to_transactions',
        description: 'Ir a lista de transacciones',
        expectedResult: 'Lista visible'
      },
      {
        action: 'select_transaction',
        description: 'Seleccionar transacción para editar',
        expectedResult: 'Transacción seleccionada'
      },
      {
        action: 'open_edit_form',
        description: 'Abrir formulario de edición',
        expectedResult: 'Formulario con datos precargados'
      },
      {
        action: 'modify_amount',
        description: 'Cambiar monto',
        expectedResult: 'Nuevo monto ingresado'
      },
      {
        action: 'modify_category',
        description: 'Cambiar categoría',
        expectedResult: 'Nueva categoría seleccionada'
      },
      {
        action: 'submit_changes',
        description: 'Guardar cambios',
        expectedResult: 'Transacción actualizada',
        critical: true
      },
      {
        action: 'verify_updated_in_list',
        description: 'Verificar cambios en lista',
        expectedResult: 'Transacción muestra nuevos valores'
      },
      {
        action: 'verify_balance_recalculated',
        description: 'Verificar recálculo de saldo',
        expectedResult: 'Saldo actualizado correctamente'
      }
    ]
  },

  'transaction-delete-flow': {
    id: 'transaction-delete-flow',
    category: 'transactions',
    title: 'Eliminar Transacción',
    description: 'Flujo de eliminación de transacción con confirmación',
    priority: 'low',
    timeout: 6000,
    preconditions: ['Transacción existente'],
    steps: [
      {
        action: 'select_transaction',
        description: 'Seleccionar transacción a eliminar',
        expectedResult: 'Transacción seleccionada'
      },
      {
        action: 'click_delete',
        description: 'Click en botón eliminar',
        expectedResult: 'Modal de confirmación aparece'
      },
      {
        action: 'confirm_deletion',
        description: 'Confirmar eliminación',
        expectedResult: 'Transacción eliminada',
        critical: true
      },
      {
        action: 'verify_removed_from_list',
        description: 'Verificar ausencia en lista',
        expectedResult: 'Transacción no visible'
      },
      {
        action: 'verify_balance_adjusted',
        description: 'Verificar ajuste de saldo',
        expectedResult: 'Saldo revertido a estado anterior'
      }
    ]
  },

  // ========================================
  // BUDGET FLOWS
  // ========================================
  'budget-create-monthly-flow': {
    id: 'budget-create-monthly-flow',
    category: 'budgets',
    title: 'Crear Presupuesto Mensual',
    description: 'Flujo completo de creación de presupuesto mensual',
    priority: 'high',
    timeout: 8000,
    steps: [
      {
        action: 'navigate_to_budgets',
        description: 'Navegar a sección de presupuestos',
        expectedResult: 'Vista de presupuestos visible'
      },
      {
        action: 'click_create_budget',
        description: 'Click en crear presupuesto',
        expectedResult: 'Formulario de presupuesto visible'
      },
      {
        action: 'select_category',
        description: 'Seleccionar categoría de gasto',
        expectedResult: 'Categoría seleccionada'
      },
      {
        action: 'select_monthly_period',
        description: 'Seleccionar período mensual',
        expectedResult: 'Período mensual seleccionado'
      },
      {
        action: 'fill_amount',
        description: 'Ingresar monto del presupuesto',
        expectedResult: 'Monto válido ingresado'
      },
      {
        action: 'set_alert_threshold',
        description: 'Configurar umbral de alerta (ej: 80%)',
        expectedResult: 'Alerta configurada'
      },
      {
        action: 'submit_budget',
        description: 'Guardar presupuesto',
        expectedResult: 'Presupuesto creado exitosamente',
        critical: true
      },
      {
        action: 'verify_in_list',
        description: 'Verificar presupuesto en lista',
        expectedResult: 'Presupuesto visible con progreso 0%'
      }
    ]
  },

  'budget-alert-trigger-flow': {
    id: 'budget-alert-trigger-flow',
    category: 'budgets',
    title: 'Activación de Alerta de Presupuesto',
    description: 'Flujo que valida la activación de alertas al superar umbral',
    priority: 'high',
    timeout: 10000,
    preconditions: ['Presupuesto con umbral de alerta configurado'],
    steps: [
      {
        action: 'create_expense_below_threshold',
        description: 'Crear gasto que no supera umbral',
        expectedResult: 'Gasto creado, sin alerta'
      },
      {
        action: 'verify_no_alert',
        description: 'Verificar que no hay alerta',
        expectedResult: 'Sin notificación de alerta'
      },
      {
        action: 'create_expense_above_threshold',
        description: 'Crear gasto que supera umbral (ej: 85%)',
        expectedResult: 'Gasto creado',
        critical: true
      },
      {
        action: 'verify_alert_triggered',
        description: 'Verificar activación de alerta',
        expectedResult: 'Notificación de alerta visible'
      },
      {
        action: 'verify_budget_warning_ui',
        description: 'Verificar UI de advertencia en presupuesto',
        expectedResult: 'Presupuesto muestra estado de alerta'
      }
    ]
  },

  // ========================================
  // ACCOUNT FLOWS
  // ========================================
  'account-create-flow': {
    id: 'account-create-flow',
    category: 'accounts',
    title: 'Crear Cuenta Nueva',
    description: 'Flujo completo de creación de cuenta bancaria',
    priority: 'high',
    timeout: 6000,
    steps: [
      {
        action: 'navigate_to_accounts',
        description: 'Navegar a sección de cuentas',
        expectedResult: 'Vista de cuentas visible'
      },
      {
        action: 'click_create_account',
        description: 'Click en crear cuenta',
        expectedResult: 'Formulario de cuenta visible'
      },
      {
        action: 'fill_account_name',
        description: 'Ingresar nombre de cuenta',
        expectedResult: 'Nombre ingresado'
      },
      {
        action: 'select_account_type',
        description: 'Seleccionar tipo (banco, efectivo, tarjeta)',
        expectedResult: 'Tipo seleccionado'
      },
      {
        action: 'fill_initial_balance',
        description: 'Ingresar saldo inicial',
        expectedResult: 'Saldo inicial ingresado'
      },
      {
        action: 'select_icon_color',
        description: 'Seleccionar ícono y color',
        expectedResult: 'Personalización completada'
      },
      {
        action: 'submit_account',
        description: 'Guardar cuenta',
        expectedResult: 'Cuenta creada exitosamente',
        critical: true
      },
      {
        action: 'verify_in_list',
        description: 'Verificar cuenta en lista',
        expectedResult: 'Cuenta visible con saldo inicial'
      },
      {
        action: 'verify_in_dashboard',
        description: 'Verificar cuenta en dashboard',
        expectedResult: 'Cuenta aparece en resumen de cuentas'
      }
    ]
  },

  // ========================================
  // CATEGORY FLOWS
  // ========================================
  'category-create-with-subcategories-flow': {
    id: 'category-create-with-subcategories-flow',
    category: 'categories',
    title: 'Crear Categoría con Subcategorías',
    description: 'Flujo de creación de categoría y subcategorías',
    priority: 'medium',
    timeout: 8000,
    steps: [
      {
        action: 'navigate_to_categories',
        description: 'Navegar a sección de categorías',
        expectedResult: 'Vista de categorías visible'
      },
      {
        action: 'click_create_category',
        description: 'Click en crear categoría',
        expectedResult: 'Formulario visible'
      },
      {
        action: 'fill_category_name',
        description: 'Ingresar nombre de categoría',
        expectedResult: 'Nombre ingresado'
      },
      {
        action: 'select_type',
        description: 'Seleccionar tipo (ingreso/gasto)',
        expectedResult: 'Tipo seleccionado'
      },
      {
        action: 'select_icon_emoji_color',
        description: 'Personalizar con ícono, emoji y color',
        expectedResult: 'Personalización completada'
      },
      {
        action: 'add_subcategory_1',
        description: 'Agregar primera subcategoría',
        expectedResult: 'Subcategoría 1 agregada'
      },
      {
        action: 'add_subcategory_2',
        description: 'Agregar segunda subcategoría',
        expectedResult: 'Subcategoría 2 agregada'
      },
      {
        action: 'submit_category',
        description: 'Guardar categoría',
        expectedResult: 'Categoría creada con subcategorías',
        critical: true
      },
      {
        action: 'verify_in_list',
        description: 'Verificar categoría en lista',
        expectedResult: 'Categoría visible con subcategorías expandibles'
      }
    ]
  },

  // ========================================
  // NAVIGATION FLOWS
  // ========================================
  'navigation-full-app-flow': {
    id: 'navigation-full-app-flow',
    category: 'navigation',
    title: 'Navegación Completa de la App',
    description: 'Flujo de navegación por todas las pantallas principales',
    priority: 'medium',
    timeout: 12000,
    steps: [
      {
        action: 'start_at_dashboard',
        description: 'Iniciar en dashboard',
        expectedResult: 'Dashboard visible'
      },
      {
        action: 'navigate_to_transactions',
        description: 'Navegar a transacciones',
        expectedResult: 'Vista de transacciones cargada'
      },
      {
        action: 'navigate_to_budgets',
        description: 'Navegar a presupuestos',
        expectedResult: 'Vista de presupuestos cargada'
      },
      {
        action: 'navigate_to_accounts',
        description: 'Navegar a cuentas',
        expectedResult: 'Vista de cuentas cargada'
      },
      {
        action: 'navigate_to_statistics',
        description: 'Navegar a estadísticas',
        expectedResult: 'Vista de estadísticas cargada'
      },
      {
        action: 'navigate_to_settings',
        description: 'Navegar a configuración',
        expectedResult: 'Vista de configuración cargada'
      },
      {
        action: 'navigate_back_to_dashboard',
        description: 'Volver a dashboard',
        expectedResult: 'Dashboard visible nuevamente'
      },
      {
        action: 'verify_navigation_history',
        description: 'Verificar historial de navegación',
        expectedResult: 'Historial correcto mantenido'
      }
    ]
  },

  // ========================================
  // FILTER FLOWS
  // ========================================
  'filter-transactions-flow': {
    id: 'filter-transactions-flow',
    category: 'filters',
    title: 'Filtrado de Transacciones',
    description: 'Flujo completo de aplicación de filtros',
    priority: 'medium',
    timeout: 8000,
    steps: [
      {
        action: 'navigate_to_transactions',
        description: 'Ir a transacciones',
        expectedResult: 'Lista completa visible'
      },
      {
        action: 'open_filters',
        description: 'Abrir panel de filtros',
        expectedResult: 'Panel de filtros visible'
      },
      {
        action: 'select_expense_type',
        description: 'Filtrar por tipo "Gasto"',
        expectedResult: 'Filtro aplicado'
      },
      {
        action: 'verify_filtered_results',
        description: 'Verificar solo gastos visibles',
        expectedResult: 'Solo transacciones tipo gasto'
      },
      {
        action: 'add_category_filter',
        description: 'Agregar filtro por categoría',
        expectedResult: 'Filtro de categoría aplicado'
      },
      {
        action: 'verify_combined_filters',
        description: 'Verificar filtros combinados',
        expectedResult: 'Resultados cumplen ambos filtros'
      },
      {
        action: 'add_date_range',
        description: 'Agregar rango de fechas',
        expectedResult: 'Filtro de fecha aplicado'
      },
      {
        action: 'verify_final_results',
        description: 'Verificar resultados finales',
        expectedResult: 'Resultados cumplen todos los filtros'
      },
      {
        action: 'clear_filters',
        description: 'Limpiar todos los filtros',
        expectedResult: 'Lista completa restaurada'
      }
    ]
  },

  // ========================================
  // SYNC FLOWS
  // ========================================
  'sync-data-flow': {
    id: 'sync-data-flow',
    category: 'sync',
    title: 'Sincronización de Datos con Supabase',
    description: 'Flujo de sincronización completa con backend',
    priority: 'high',
    timeout: 10000,
    steps: [
      {
        action: 'create_offline_transaction',
        description: 'Crear transacción (simular offline)',
        expectedResult: 'Transacción en cola de sincronización'
      },
      {
        action: 'verify_pending_sync',
        description: 'Verificar estado pendiente',
        expectedResult: 'Indicador de sincronización pendiente'
      },
      {
        action: 'trigger_sync',
        description: 'Activar sincronización manual',
        expectedResult: 'Proceso de sincronización iniciado',
        critical: true
      },
      {
        action: 'verify_syncing_state',
        description: 'Verificar estado sincronizando',
        expectedResult: 'UI muestra estado "sincronizando"'
      },
      {
        action: 'wait_for_completion',
        description: 'Esperar finalización',
        expectedResult: 'Sincronización completada'
      },
      {
        action: 'verify_success_state',
        description: 'Verificar estado exitoso',
        expectedResult: 'UI muestra "sincronizado"'
      },
      {
        action: 'verify_data_in_backend',
        description: 'Verificar datos en Supabase',
        expectedResult: 'Datos persistidos en backend'
      }
    ]
  },

  // ========================================
  // VOICE FLOWS
  // ========================================
  'voice-command-to-transaction-flow': {
    id: 'voice-command-to-transaction-flow',
    category: 'voice',
    title: 'Comando de Voz a Transacción',
    description: 'Flujo de reconocimiento de voz y creación de transacción',
    priority: 'medium',
    timeout: 10000,
    steps: [
      {
        action: 'activate_voice_input',
        description: 'Activar entrada de voz desde SpeedDial',
        expectedResult: 'Modal de voz activo, escuchando'
      },
      {
        action: 'speak_command',
        description: 'Decir comando (ej: "Gasto 1500 supermercado")',
        expectedResult: 'Voz reconocida'
      },
      {
        action: 'verify_transcription',
        description: 'Verificar transcripción correcta',
        expectedResult: 'Texto transcrito visible'
      },
      {
        action: 'parse_command',
        description: 'Parsear comando a datos estructurados',
        expectedResult: 'Datos extraídos: tipo, monto, categoría',
        critical: true
      },
      {
        action: 'show_confirmation',
        description: 'Mostrar confirmación de datos',
        expectedResult: 'Modal de confirmación con datos parseados'
      },
      {
        action: 'confirm_creation',
        description: 'Confirmar creación de transacción',
        expectedResult: 'Transacción creada desde voz'
      },
      {
        action: 'verify_transaction_created',
        description: 'Verificar transacción en lista',
        expectedResult: 'Transacción visible con datos correctos'
      }
    ]
  },

  // ========================================
  // CHAT FLOWS
  // ========================================
  'chat-oti-conversation-flow': {
    id: 'chat-oti-conversation-flow',
    category: 'chat',
    title: 'Conversación con Asistente Oti',
    description: 'Flujo de chat con Oti para consulta financiera',
    priority: 'medium',
    timeout: 12000,
    steps: [
      {
        action: 'open_oti_chat',
        description: 'Abrir chat de Oti desde SpeedDial',
        expectedResult: 'Chat visible con historial'
      },
      {
        action: 'send_greeting',
        description: 'Enviar saludo inicial',
        expectedResult: 'Mensaje enviado'
      },
      {
        action: 'receive_oti_response',
        description: 'Recibir respuesta de Oti',
        expectedResult: 'Oti responde con saludo',
        critical: true
      },
      {
        action: 'ask_budget_status',
        description: 'Preguntar estado de presupuestos',
        expectedResult: 'Mensaje enviado'
      },
      {
        action: 'receive_budget_info',
        description: 'Recibir información de presupuestos',
        expectedResult: 'Oti responde con datos de presupuestos'
      },
      {
        action: 'ask_for_suggestion',
        description: 'Pedir sugerencia financiera',
        expectedResult: 'Mensaje enviado'
      },
      {
        action: 'receive_suggestion',
        description: 'Recibir sugerencia personalizada',
        expectedResult: 'Oti responde con sugerencias'
      },
      {
        action: 'verify_context_maintained',
        description: 'Verificar que Oti mantiene contexto',
        expectedResult: 'Respuestas coherentes con conversación'
      }
    ]
  }
};

/**
 * Obtener tests por categoría
 */
export function getTestsByCategory(category: E2ETestCase['category']): E2ETestCase[] {
  return Object.values(E2E_TEST_CASES).filter(test => test.category === category);
}

/**
 * Obtener tests por prioridad
 */
export function getTestsByPriority(priority: 'high' | 'medium' | 'low'): E2ETestCase[] {
  return Object.values(E2E_TEST_CASES).filter(test => test.priority === priority);
}

/**
 * Estadísticas de tests
 */
export function getTestStats() {
  const tests = Object.values(E2E_TEST_CASES);
  
  return {
    total: tests.length,
    byCategory: {
      auth: tests.filter(t => t.category === 'auth').length,
      transactions: tests.filter(t => t.category === 'transactions').length,
      budgets: tests.filter(t => t.category === 'budgets').length,
      accounts: tests.filter(t => t.category === 'accounts').length,
      categories: tests.filter(t => t.category === 'categories').length,
      navigation: tests.filter(t => t.category === 'navigation').length,
      sync: tests.filter(t => t.category === 'sync').length,
      voice: tests.filter(t => t.category === 'voice').length,
      chat: tests.filter(t => t.category === 'chat').length,
      filters: tests.filter(t => t.category === 'filters').length,
    },
    byPriority: {
      high: tests.filter(t => t.priority === 'high').length,
      medium: tests.filter(t => t.priority === 'medium').length,
      low: tests.filter(t => t.priority === 'low').length,
    },
    totalSteps: tests.reduce((sum, test) => sum + test.steps.length, 0)
  };
}
