export default {
  common: {
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    close: "Cerrar",
    confirm: "Confirmar",
    back: "Volver",
    next: "Siguiente",
    previous: "Anterior",
    search: "Buscar",
    filter: "Filtrar",
    loading: "Cargando...",
    noData: "No hay datos",
    error: "Error",
    success: "Éxito",
    warning: "Advertencia",
    info: "Información"
  },
  
  auth: {
    login: "Iniciar Sesión",
    logout: "Cerrar Sesión",
    signup: "Registrarse",
    email: "Correo Electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar Contraseña",
    forgotPassword: "¿Olvidaste tu contraseña?",
    rememberMe: "Recordarme",
    loginSuccess: "Inicio de sesión exitoso",
    loginError: "Error al iniciar sesión",
    signupSuccess: "Registro exitoso",
    signupError: "Error al registrarse",
    logoutConfirm: "¿Estás seguro que deseas cerrar sesión?",
    name: "Nombre",
    welcomeBack: "¡Bienvenido de nuevo!",
    createAccount: "Crear cuenta",
    alreadyHaveAccount: "¿Ya tienes cuenta?",
    dontHaveAccount: "¿No tienes cuenta?"
  },
  
  navigation: {
    home: "Inicio",
    dashboard: "Dashboard",
    transactions: "Transacciones",
    accounts: "Cuentas",
    categories: "Categorías",
    budgets: "Presupuestos",
    budgetsShort: "Presup.",
    statistics: "Estadísticas",
    statisticsShort: "Estad.",
    settings: "Configuración",
    settingsShort: "Más",
    profile: "Perfil",
    help: "Ayuda"
  },
  
  dashboard: {
    title: "Dashboard",
    totalBalance: "Balance Total",
    income: "Ingresos",
    expenses: "Gastos",
    balance: "Balance", // ✅ AGREGADO
    savings: "Ahorros",
    recentTransactions: "Transacciones Recientes",
    monthlyOverview: "Resumen Mensual",
    budgetStatus: "Estado de Presupuestos",
    topCategories: "Categorías Principales",
    viewAll: "Ver Todas",
    thisMonth: "Este Mes",
    lastMonth: "Mes Anterior",
    thisYear: "Este Año"
  },
  
  transactions: {
    title: "Transacciones",
    newTransaction: "Nueva Transacción",
    editTransaction: "Editar Transacción",
    deleteTransaction: "Eliminar Transacción",
    transactionType: "Tipo de Transacción",
    amount: "Monto",
    category: "Categoría",
    subcategory: "Subcategoría",
    account: "Cuenta",
    fromAccount: "De la Cuenta",
    toAccount: "A la Cuenta",
    date: "Fecha",
    note: "Nota",
    addNote: "Agregar nota",
    selectCategory: "Seleccionar categoría",
    selectSubcategory: "Seleccionar subcategoría",
    selectAccount: "Seleccionar cuenta",
    types: {
      all: "Todas", // ✅ AGREGADO
      income: "Ingreso",
      expense: "Gasto",
      transfer: "Transferencia"
    },
    created: "Transacción creada exitosamente",
    updated: "Transacción actualizada exitosamente",
    deleted: "Transacción eliminada exitosamente",
    deleteConfirm: "¿Estás seguro que deseas eliminar esta transacción?",
    empty: "No hay transacciones", // ✅ AGREGADO
    noTransactions: "No hay transacciones",
    filterBy: "Filtrar por",
    all: "Todas",
    today: "Hoy",
    yesterday: "Ayer",
    thisWeek: "Esta Semana",
    lastWeek: "Semana Pasada",
    thisMonth: "Este Mes",
    lastMonth: "Mes Pasado",
    custom: "Personalizado"
  },
  
  accounts: {
    title: "Mis Cuentas",
    newAccount: "Nueva Cuenta",
    editAccount: "Editar Cuenta",
    deleteAccount: "Eliminar Cuenta",
    accountName: "Nombre de la Cuenta",
    accountType: "Tipo de Cuenta",
    balance: "Balance",
    initialBalance: "Balance Inicial",
    icon: "Icono",
    color: "Color",
    types: {
      cash: "Efectivo",
      bank: "Cuenta Bancaria",
      credit: "Préstamos, Deudas y Créditos",
      digital: "Billetera Digital",
      investment: "Inversión",
      other: "Otra"
    },
    created: "Cuenta creada exitosamente",
    updated: "Cuenta actualizada exitosamente",
    deleted: "Cuenta eliminada exitosamente",
    deleteConfirm: "¿Estás seguro que deseas eliminar esta cuenta?",
    noAccounts: "No hay cuentas",
    total: "Total en Cuentas",
    assets: "Activos", // ✅ NUEVO: Suma de cuentas con saldo positivo
    debts: "Deudas" // ✅ NUEVO: Suma de tarjetas de crédito/deudas
  },
  
  categories: {
    title: "Mis Categorías",
    newCategory: "Nueva Categoría",
    editCategory: "Editar Categoría",
    deleteCategory: "Eliminar Categoría",
    categoryName: "Nombre de la Categoría",
    categoryType: "Tipo de Categoría",
    icon: "Icono",
    color: "Color",
    subcategories: "Subcategorías",
    addSubcategory: "Agregar subcategoría",
    types: {
      income: "Ingreso",
      expense: "Gasto"
    },
    created: "Categoría creada exitosamente",
    updated: "Categoría actualizada exitosamente",
    deleted: "Categoría eliminada exitosamente",
    deleteConfirm: "¿Estás seguro que deseas eliminar esta categoría?",
    noCategories: "No hay categorías"
  },
  
  budgets: {
    title: "Mis Presupuestos",
    newBudget: "Nuevo Presupuesto",
    editBudget: "Editar Presupuesto",
    deleteBudget: "Eliminar Presupuesto",
    budgetAmount: "Monto del Presupuesto",
    period: "Período",
    category: "Categoría",
    alertThreshold: "Alerta cuando se alcance",
    spent: "Gastado",
    remaining: "Restante",
    exceeded: "Excedido",
    onTrack: "En camino",
    warning: "Advertencia",
    periods: {
      monthly: "Mensual",
      weekly: "Semanal",
      yearly: "Anual"
    },
    created: "Presupuesto creado exitosamente",
    updated: "Presupuesto actualizado exitosamente",
    deleted: "Presupuesto eliminado exitosamente",
    deleteConfirm: "¿Estás seguro que deseas eliminar este presupuesto?",
    noBudgets: "No hay presupuestos",
    budgetExceeded: "¡Presupuesto excedido!",
    budgetWarning: "Acercándose al límite del presupuesto",
    percentUsed: "{{percent}}% usado"
  },
  
  statistics: {
    title: "Estadísticas",
    overview: "Resumen General",
    income: "Ingresos", // ✅ AGREGADO
    expenses: "Gastos", // ✅ AGREGADO
    balance: "Balance",
    byCategory: "Por Categoría",
    byAccount: "Por Cuenta",
    trend: "Tendencia",
    thisMonth: "Este Mes",
    lastMonth: "Mes Pasado",
    thisYear: "Este Año",
    custom: "Personalizado",
    noData: "No hay datos para mostrar" // ✅ AGREGADO
  },
  
  settings: {
    title: "Configuración",
    general: "General",
    appearance: "Apariencia",
    security: "Seguridad",
    notifications: "Notificaciones",
    about: "Sobre",
    
    // Secciones
    generalConfig: "Configuración General",
    information: "Información",
    administration: "Administración",
    finances: "Finanzas",
    finance: "FINANZAS", // ✅ AGREGADO para headers de secciones
    dataAndSecurity: "Datos y Seguridad",
    localization: "Localización", // ✅ AGREGADO
    data: "Datos", // ✅ AGREGADO
    advanced: "Avanzado", // ✅ AGREGADO
    help: "Ayuda", // ✅ AGREGADO
    
    // Finanzas
    financialAdvisor: "Asesor Financiero IA",
    financialAdvisorDesc: "Análisis y consejos personalizados",
    aiAdvisor: "Asesor Financiero IA", // ✅ AGREGADO (alias)
    chatWithOti: "Chat con Oti",
    chatWithOtiDesc: "Pregunta sobre finanzas y uso de la app",
    otiChat: "Chat con Oti", // ✅ AGREGADO (alias)
    budgetsMenu: "Presupuestos",
    budgetsMenuDesc: "Gestionar límites mensuales",
    taxDeclaration: "Declaración de Renta",
    taxDeclarationDesc: "Gestión tributaria y educación fiscal",
    taxModule: "Declaración de Renta", // ✅ AGREGADO (alias)
    
    // Apariencia
    darkMode: "Modo Oscuro",
    darkModeEnabled: "Activado",
    darkModeDisabled: "Desactivado",
    colorTheme: "Tema de Color",
    
    // Configuración General
    currencyLabel: "Moneda",
    currencyValue: "COP - Peso Colombiano",
    languageLabel: "Idioma",
    languageValue: "Español",
    notificationsLabel: "Notificaciones",
    notificationsValue: "Activadas",
    
    // Seguridad
    securityMenu: "Seguridad",
    securityPinBiometric: "PIN/Huella",
    uploadBankStatement: "Cargar Extracto Bancario",
    uploadBankStatementDesc: "Importar transacciones desde extracto",
    importBankStatement: "Cargar Extracto Bancario", // ✅ AGREGADO (alias)
    exportToCSV: "Exportar a CSV",
    
    // Datos
    resetData: "Reiniciar Datos",
    resetDataDescription: "Poner saldos en cero y eliminar transacciones",
    resetDataConfirm: "¿Estás seguro que deseas reiniciar todos los datos?",
    resetDataSuccess: "Datos reiniciados correctamente",
    resetDataTitle: "¿Reiniciar todos los datos?",
    resetDataDetails: "Esta acción realizará lo siguiente:",
    resetDataDetail1: "Pondrá todos los saldos de las cuentas en $0",
    resetDataDetail2: "Eliminará todas las transacciones",
    resetDataDetail3: "Restablecerá las categorías y presupuestos por defecto",
    resetDataDetail4: "Mantendrá tus cuentas configuradas",
    resetDataWarning: "Esta acción no se puede deshacer.",
    resetDataButton: "Sí, reiniciar datos",
    storageUsed: "Almacenamiento usado", // ✅ AGREGADO
    
    // Información
    aboutApp: "Acerca de",
    versionNumber: "Versión 1.0.0",
    productTour: "Ver Tour de Producto",
    productTourDescription: "Volver a ver el tutorial",
    
    // Admin
    adminPanel: "Panel de Administración",
    adminPanelTitle: "Panel de Super Usuario",
    adminPanelDesc: "Gestionar usuarios y ver estadísticas del sistema",
    schemaTestingTitle: "Testing de Schemas",
    schemaTestingDesc: "Probar validaciones Zod interactivamente",
    autoTranslationTitle: "🌍 Auto-Traducción GPT-4",
    autoTranslationDesc: "Traducir automáticamente a EN y PT",
    
    // Sesión
    logout: "Cerrar Sesión",
    logoutDescription: "Salir de tu cuenta",
    logoutConfirm: "¿Estás seguro que deseas cerrar sesión?",
    logoutTitle: "¿Cerrar sesión?",
    logoutDetails: "Esta acción cerrará tu sesión actual.",
    logoutButton: "Sí, cerrar sesión",
    
    // Perfil
    editProfile: "Editar Perfil",
    profileName: "Nombre",
    profilePhoto: "Foto de Perfil",
    saveChanges: "Guardar Cambios",
    profileUpdated: "Perfil actualizado exitosamente",
    profileUpdateError: "Error al actualizar el perfil",
    
    // Botones comunes
    close: "Cerrar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    update: "Actualizar",
    
    language: "Idioma",
    languageDescription: "Selecciona tu idioma preferido",
    
    currency: "Moneda",
    currencyDescription: "Selecciona tu moneda principal",
    
    theme: "Tema",
    themeLight: "Claro",
    themeDark: "Oscuro",
    themeSystem: "Sistema",
    
    notificationsEnabled: "Activadas",
    notificationsDisabled: "Desactivadas",
    notificationsDescription: "Recibe alertas de presupuestos y transacciones",
    notificationsComingSoon: "Próximamente",
    
    pinSecurity: "Seguridad PIN",
    pinEnabled: "PIN Activado",
    pinDisabled: "PIN Desactivado",
    changePin: "Cambiar PIN",
    setupPin: "Configurar PIN",
    
    biometric: "Huella Digital",
    biometricEnabled: "Activada",
    biometricDisabled: "Desactivada",
    
    dataBackup: "Respaldo de Datos",
    exportData: "Exportar Datos",
    exportDataSuccess: "Transacciones exportadas exitosamente",
    exportDataEmpty: "No hay transacciones para exportar",
    importData: "Importar Datos",
    
    version: "Versión",
    developer: "Desarrollado por",
    termsAndConditions: "Términos y Condiciones",
    privacyPolicy: "Política de Privacidad",
    
    saved: "Configuración guardada"
  },
  
  voice: {
    title: "Reconocimiento de Voz",
    startListening: "Toca para hablar",
    listening: "Escuchando...",
    processing: "Procesando...",
    tryAgain: "Intentar de nuevo",
    examples: "Ejemplos:",
    example1: "\"Gasté 50 mil en supermercado\"",
    example2: "\"Recibí 2 millones de salario\"",
    example3: "\"Transferí 100 mil a Nequi\"",
    permissionDenied: "Permiso de micrófono denegado",
    notSupported: "Reconocimiento de voz no soportado"
  },
  
  advisor: {
    title: "Asesor Financiero",
    askQuestion: "Pregunta algo...",
    suggestions: "Sugerencias",
    analyzing: "Analizando tus finanzas...",
    examples: {
      "1": "¿Cómo puedo ahorrar más?",
      "2": "Analiza mis gastos del mes",
      "3": "¿Estoy gastando mucho?",
      "4": "Dame consejos para mis finanzas"
    }
  },
  
  chat: {
    title: "Chat con Oti",
    placeholder: "Escribe tu mensaje...",
    send: "Enviar",
    greeting: "¡Hola! Soy Oti, tu asistente financiero. ¿En qué puedo ayudarte?"
  },
  
  errors: {
    generic: "Ocurrió un error. Intenta de nuevo.",
    network: "Error de conexión. Verifica tu internet.",
    unauthorized: "No autorizado. Inicia sesión nuevamente.",
    notFound: "No encontrado.",
    validation: "Error de validación. Verifica los datos.",
    insufficientFunds: "Fondos insuficientes",
    sameAccount: "No puedes transferir a la misma cuenta",
    required: "Este campo es requerido",
    invalidEmail: "Correo electrónico inválido",
    invalidAmount: "Monto inválido",
    passwordMismatch: "Las contraseñas no coinciden",
    passwordTooShort: "La contraseña debe tener al menos 8 caracteres"
  },
  
  months: {
    january: "Enero",
    february: "Febrero",
    march: "Marzo",
    april: "Abril",
    may: "Mayo",
    june: "Junio",
    july: "Julio",
    august: "Agosto",
    september: "Septiembre",
    october: "Octubre",
    november: "Noviembre",
    december: "Diciembre"
  },
  
  days: {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo"
  },
  
  time: {
    today: "Hoy",
    yesterday: "Ayer",
    tomorrow: "Mañana",
    daysAgo: "Hace {{count}} día",
    daysAgo_plural: "Hace {{count}} días",
    weeksAgo: "Hace {{count}} semana",
    weeksAgo_plural: "Hace {{count}} semanas",
    monthsAgo: "Hace {{count}} mes",
    monthsAgo_plural: "Hace {{count}} meses"
  },
  
  tour: {
    welcome: "¡Bienvenido a Xigma Finance!",
    welcomeDescription: "Tu asistente personal de finanzas inteligente",
    skip: "Omitir",
    next: "Siguiente",
    previous: "Anterior",
    finish: "Finalizar",
    step1Title: "Gestiona tus Transacciones",
    step1Description: "Registra ingresos, gastos y transferencias fácilmente",
    step2Title: "Controla tus Presupuestos",
    step2Description: "Establece metas y recibe alertas cuando te acerques al límite",
    step3Title: "Visualiza tus Estadísticas",
    step3Description: "Analiza tus hábitos financieros con gráficos interactivos",
    step4Title: "Usa el Reconocimiento de Voz",
    step4Description: "Crea transacciones hablando naturalmente",
    step5Title: "Consulta al Asesor IA",
    step5Description: "Recibe consejos personalizados con inteligencia artificial"
  }
};