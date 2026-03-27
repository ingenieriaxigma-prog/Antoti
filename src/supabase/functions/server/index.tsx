// BACKEND VERSION 3.2 - PRODUCTION READY with Security Enhancements
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as db from "./database.ts";
import { translateWithOpenAI } from "./translate.ts";
import * as familyDb from './family-db.ts';
import * as invitationsDb from './invitations-db.ts';
import * as notificationsDb from './notifications-db.ts';
import * as devicesDb from './devices-db.ts';
import { verifyUser, verifySuperUser, isSuperUser, createAnonClient, createServiceClient } from './auth-helpers.ts';
import { parseUserAgent, saveDeviceInfo } from './device-helpers.ts';
import * as inputValidators from './input-validators.ts';

// ⚠️ NOTA: Rate limiter está preparado en archivo separado
// pero Figma Maker no permite importarlo en el backend.
// Cuando descargues el ZIP, descomenta estas líneas:
// import { rateLimiter, RateLimitPresets } from './rate-limiter.ts';

const app = new Hono();

console.log('🚀 SERVER STARTING - VERSION 3.2 - Security Enhanced');

// ====================
// FETCH WITH TIMEOUT HELPER
// ====================
/**
 * Fetch with timeout to prevent hanging connections
 * Supabase Edge Functions have a 150s timeout, so we set 120s for safety
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 120000 // 120 seconds
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// ====================
// SUPER USER CONFIGURATION
// ====================
// ✅ SECURITY FIX: Read from environment variable instead of hardcoding
const SUPER_USERS = (Deno.env.get('SUPER_USER_EMAILS') || 
  // Fallback para desarrollo local (REMOVER en producción)
  'ingenieriaxigma@gmail.com,ingenieriaxima@gmail.com')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);

console.log('🔐 Super users configured:', SUPER_USERS.length);
// ⚠️ NEVER log the actual emails in production

// Helper function to check if user is super user
function isSuperUser(email: string | null | undefined): boolean {
  if (!email) return false;
  return SUPER_USERS.includes(email.toLowerCase());
}

// Helper functions are now imported from auth-helpers.ts
// (verifySuperUser, verifyUser, isSuperUser, etc.)

// ====================
// DEVICE INFO HELPERS
// ====================

// Device helpers are now imported from device-helpers.ts
// (parseUserAgent, saveDeviceInfo, DeviceInfo interface)

// ⚠️ LOGGER DESHABILITADO - Causaba broken pipe errors por exceso de logs
// app.use('*', logger(console.log));

// =====================================================
// ⚠️ RATE LIMITING (Preparado para después del ZIP)
// =====================================================
// Código preparado pero comentado porque Figma Maker no permite
// importar archivos externos en el backend.
//
// CUANDO DESCARGUES EL ZIP, descomenta estas líneas:
/*
// Global rate limiting (all endpoints)
app.use('/make-server-727b50c3/*', rateLimiter(RateLimitPresets.global));

// Strict rate limiting for AI endpoints (expensive)
app.use('/make-server-727b50c3/oti/*', rateLimiter(RateLimitPresets.ai));

// Admin endpoints (moderate)
app.use('/make-server-727b50c3/admin/*', rateLimiter(RateLimitPresets.admin));

// Upload endpoints (strict)
app.use('/make-server-727b50c3/upload/*', rateLimiter(RateLimitPresets.upload));

console.log('🛡️  Rate limiting enabled:');
console.log('   - Global: 100 req/min');
console.log('   - AI: 10 req/min');
console.log('   - Admin: 20 req/min');
console.log('   - Upload: 5 req/min');
*/

// =====================================================
// REQUEST TRACKING
// =====================================================

// Request tracking middleware - ensure response completion
app.use('*', async (c, next) => {
  const requestId = Math.random().toString(36).substring(2, 9);
  const method = c.req.method;
  const url = new URL(c.req.url).pathname;
  const startTime = Date.now();
  
  // Silently track requests without excessive logging
  
  try {
    await next();
    const duration = Date.now() - startTime;
    // Only log slow requests (>1000ms)
    if (duration > 1000) {
      console.log(`⚠️ [${requestId}] SLOW: ${method} ${url} - ${duration}ms`);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Handle broken pipe silently
    if (error && typeof error === 'object' && 'code' in error && error.code === 'EPIPE') {
      // Client disconnected - don't log, don't throw
      return;
    }
    
    console.error(`❌ [${requestId}] ${method} ${url} - ERROR (${duration}ms):`, error);
    throw error;
  }
});

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Add timeout middleware to prevent hanging connections
app.use('*', async (c, next) => {
  let timeoutId: number | undefined;
  
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, 30000); // 30 second timeout
  });
  
  try {
    const result = await Promise.race([next(), timeoutPromise]);
    // Clear timeout if request completes successfully
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    return result;
  } catch (error) {
    // Clear timeout on error
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    
    // ✅ FIX: Handle broken pipe errors gracefully - SILENTLY
    if (error && typeof error === 'object' && 'code' in error && error.code === 'EPIPE') {
      // Client disconnected - silently ignore, don't respond
      return new Response(null, { status: 499 });
    }
    
    if (error instanceof Error && error.message === 'Request timeout') {
      return c.json({ error: 'Request timeout - por favor intenta nuevamente' }, 504);
    }
    
    // Re-throw other errors for onError handler
    throw error;
  }
});

// Error handling middleware - catch any unhandled errors
app.onError((err, c) => {
  // ✅ FIX: Handle broken pipe errors gracefully - SILENTLY
  if (err && typeof err === 'object' && 'code' in err && err.code === 'EPIPE') {
    // Client disconnected - return empty response without logging
    return new Response(null, { status: 499 });
  }
  
  // Only log real errors (not client disconnections)
  console.error('❌ UNHANDLED ERROR');
  console.error('Method:', c.req.method);
  console.error('URL:', c.req.url);
  console.error('Error:', err.message);
  
  // Make sure we always return a response
  try {
    return c.json({ 
      error: 'Error interno del servidor', 
      details: err.message || 'Error desconocido',
      path: c.req.url
    }, 500);
  } catch (jsonError) {
    // If even JSON serialization fails, return plain response
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
});

// 404 handler - catch any undefined routes
app.notFound((c) => {
  console.log(`⚠️ 404: ${c.req.method} ${c.req.url}`);
  return c.json({ error: 'Not found', path: c.req.url }, 404);
});

// Health check endpoint
app.get("/make-server-727b50c3/health", (c) => {
  return c.json({ status: "ok" });
});

// ====================
// DEBUG ENDPOINTS
// ====================

// Debug: List all keys in KV Store (ADMIN ONLY)
app.get("/make-server-727b50c3/debug/list-keys", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { email } = authResult;
    
    // Verificar que es super user
    if (!isSuperUser(email)) {
      return c.json({ error: 'Acceso denegado: Solo super usuarios' }, 403);
    }
    
    // Obtener datos directamente de la tabla kv_store
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data: allKeys, error } = await supabase
      .from('kv_store_727b50c3')
      .select('key, value')
      .like('key', 'user:%');
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Agrupar por tipo
    const grouped: Record<string, any[]> = {
      accounts: [],
      categories: [],
      transactions: [],
      budgets: [],
      settings: [],
      other: []
    };
    
    for (const item of (allKeys || [])) {
      const key = item.key;
      if (key.includes(':accounts')) grouped.accounts.push(item);
      else if (key.includes(':categories')) grouped.categories.push(item);
      else if (key.includes(':transactions')) grouped.transactions.push(item);
      else if (key.includes(':budgets')) grouped.budgets.push(item);
      else if (key.includes(':settings')) grouped.settings.push(item);
      else grouped.other.push(item);
    }
    
    return c.json({
      totalKeys: allKeys?.length || 0,
      grouped: {
        accounts: grouped.accounts.length,
        categories: grouped.categories.length,
        transactions: grouped.transactions.length,
        budgets: grouped.budgets.length,
        settings: grouped.settings.length,
        other: grouped.other.length,
      },
      keys: (allKeys || []).map(item => ({
        key: item.key,
        hasValue: !!item.value,
        valuePreview: typeof item.value === 'string' 
          ? item.value.substring(0, 100)
          : JSON.stringify(item.value).substring(0, 100)
      }))
    });
  } catch (error) {
    console.error('Error listing keys:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Debug: Check Postgres data (ADMIN ONLY)
app.get("/make-server-727b50c3/debug/check-postgres", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId, email } = authResult;
    
    // Verificar que es super user
    if (!isSuperUser(email)) {
      return c.json({ error: 'Acceso denegado: Solo super usuarios' }, 403);
    }
    
    // Verificar datos en Postgres
    const accounts = await db.getAccounts(userId);
    const categories = await db.getCategories(userId);
    const transactions = await db.getTransactions(userId);
    const budgets = await db.getBudgets(userId);
    
    return c.json({
      userId,
      email,
      postgres: {
        accounts: accounts.length,
        categories: categories.length,
        transactions: transactions.length,
        budgets: budgets.length,
      },
      samples: {
        firstAccount: accounts[0] || null,
        firstCategory: categories[0] || null,
        firstTransaction: transactions[0] || null,
        firstBudget: budgets[0] || null,
      }
    });
  } catch (error) {
    console.error('Error checking postgres:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ====================
// AUTHENTICATION ENDPOINTS
// ====================

// Signup endpoint - Create new user
app.post("/make-server-727b50c3/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return c.json({ error: 'Email y contraseña son requeridos' }, 400);
    }

    // Signup attempt

    // Use ANON_KEY for signup to trigger automatic email verification
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Use signUp instead of admin.createUser to trigger automatic email verification
    // This respects the "Confirm email" setting in Supabase Dashboard
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          name: name || email.split('@')[0] 
        },
      },
    });

    if (error) {
      // Handle specific error cases
      if (error.message?.includes('User already registered')) {
        // User already exists
        return c.json({ error: 'Este correo ya está registrado. Intenta iniciar sesión.' }, 400);
      }
      
      if (error.message?.includes('password')) {
        console.log(`⚠️  Signup attempt with invalid password format for: ${email}`);
        return c.json({ error: 'La contraseña no cumple los requisitos mínimos' }, 400);
      }
      
      console.error('Signup error:', error);
      return c.json({ error: error.message || 'Error al crear usuario' }, 400);
    }

    console.log(`User created successfully: ${data.user?.id}`);
    
    // Check if email confirmation is required
    // If "Confirm email" is enabled in Supabase, the user will NOT have a session yet
    if (!data.session) {
      console.log('📧 Verification email sent');
      // User needs to verify email before logging in
      return c.json({
        success: true,
        message: '✅ Cuenta creada exitosamente. Por favor revisa tu email para verificar tu cuenta antes de iniciar sesión.',
        email: email,
        requiresVerification: true,
      });
    }

    // If email confirmation is disabled, user gets a session immediately
    console.log('✅ User auto-logged in (email confirmation disabled)');
    
    const photoUrl = await db.getUserPhotoUrl(data.user.id);
    
    return c.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name,
        photoUrl: photoUrl || null,
      },
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Error al crear usuario' }, 500);
  }
});

// Login endpoint
app.post("/make-server-727b50c3/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email y contraseña son requeridos' }, 400);
    }

    // Try with service role key first to check if user exists
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Check if user exists
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      return c.json({ error: 'Error al verificar usuario' }, 500);
    }
    
    const userExists = users?.users?.find(u => u.email === email);
    
    if (!userExists) {
      return c.json({ 
        error: 'Esta cuenta no existe. Por favor regístrate primero usando la pestaña "Registrarse".' 
      }, 401);
    }

    // Check if user is enabled (not disabled by admin) - FROM POSTGRES
    const isDisabled = await db.isUserDisabled(userExists.id);
    
    if (isDisabled) {
      console.log(`🚫 User is DISABLED by admin: ${userExists.id}`);
      console.log(`========================================\n`);
      return c.json({ 
        error: '🚫 Tu cuenta ha sido deshabilitada por el administrador. Por favor contacta al soporte para más información.' 
      }, 403);
    }

    console.log(`✅ User status: enabled`);

    // ✅ FIX: Ensure email is confirmed before login
    if (!userExists.email_confirmed_at) {
      console.log(`⚠️ Email not confirmed, auto-confirming...`);
      try {
        await supabaseAdmin.auth.admin.updateUserById(userExists.id, {
          email_confirm: true,
        });
        console.log(`✅ Email auto-confirmed successfully`);
      } catch (confirmError) {
        console.error('❌ Error auto-confirming email:', confirmError);
      }
    }

    // First verify password with regular client
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    console.log(`🔑 Verifying password...`);

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Login error:', error.message);
      console.error('   Error code:', error.code);
      console.error('   Error status:', error.status);
      console.log(`========================================\n`);
      
      // Provide more helpful error message based on the error
      if (error.message.includes('Invalid login credentials')) {
        // Since we already checked the user exists, this must be wrong password
        return c.json({ 
          error: `❌ Contraseña incorrecta

Por favor verifica que hayas ingresado tu contraseña correctamente.

💡 Tip: Las contraseñas distinguen entre mayúsculas y minúsculas.

¿Olvidaste tu contraseña? Comunícate con el administrador para restablecerla.`
        }, 401);
      }
      
      if (error.message.includes('Email not confirmed')) {
        // This shouldn't happen since we set email_confirm: true, but just in case
        // Auto-confirm the email using admin API
        console.log('⚠️ Email not confirmed, auto-confirming...');
        try {
          await supabaseAdmin.auth.admin.updateUserById(userExists.id, {
            email_confirm: true,
          });
          console.log('✅ Email auto-confirmed, please retry login');
          
          return c.json({ 
            error: `📧 Email confirmado

Tu email ha sido confirmado automáticamente. Por favor intenta iniciar sesión nuevamente.`
          }, 401);
        } catch (confirmError) {
          console.error('❌ Error confirming email:', confirmError);
          return c.json({ 
            error: `📧 Email no confirmado

Por favor contacta al administrador para confirmar tu email.`
          }, 401);
        }
      }
      
      // Generic error with helpful context
      return c.json({ 
        error: `❌ Error de autenticación

${error.message}

Por favor verifica tus credenciales e intenta nuevamente.`
      }, 401);
    }

    console.log(`��� Login successful for user: ${data.user.id}`);
    console.log(`   Access token generated`);
    
    // Capture and save device information
    const userAgent = c.req.header('user-agent') || 'Unknown';
    try {
      const deviceInfo = await saveDeviceInfo(data.user.id, userAgent);
      console.log(`📱 Device info saved: ${deviceInfo.deviceType} - ${deviceInfo.browser} on ${deviceInfo.os}`);
    } catch (error) {
      console.error('⚠️  Error saving device info:', error);
      // Don't fail login if device info save fails
    }
    
    console.log(`========================================\n`);

    const photoUrl = await db.getUserPhotoUrl(data.user.id);
    
    return c.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name || email.split('@')[0],
        photoUrl: photoUrl || null,
      },
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  } catch (error) {
    console.error('❌ Unexpected login error:', error);
    console.log(`========================================\n`);
    return c.json({ error: 'Error al iniciar sesión' }, 500);
  }
});

// Refresh token endpoint - Get new access token using refresh token
app.post("/make-server-727b50c3/refresh-token", async (c) => {
  try {
    const body = await c.req.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return c.json({ error: 'Refresh token es requerido' }, 400);
    }

    console.log('🔄 Refreshing access token...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error || !data.session) {
      console.error('Error refreshing token:', error);
      return c.json({ error: 'Token inválido o expirado' }, 401);
    }

    console.log('✅ Token refreshed successfully');

    return c.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name || data.user.email.split('@')[0],
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return c.json({ error: 'Error al refrescar token' }, 500);
  }
});

// Password reset callback endpoint - Handles Supabase redirect and extracts tokens
// This endpoint receives the redirect from Supabase's email verification
app.get("/make-server-727b50c3/auth/callback", async (c) => {
  try {
    console.log('🔗 [Callback] Received auth callback request');
    console.log('🔗 [Callback] Query params:', c.req.query());
    console.log('🔗 [Callback] Full URL:', c.req.url);
    
    // Supabase sends tokens as hash parameters, but we need to handle them server-side
    // Get the token_hash from query params (if using email verification flow)
    const tokenHash = c.req.query('token_hash');
    const type = c.req.query('type');
    const redirectTo = c.req.query('redirect_to');
    
    console.log('🔗 [Callback] Token hash:', tokenHash ? 'present' : 'missing');
    console.log('🔗 [Callback] Type:', type);
    console.log('🔗 [Callback] Redirect to:', redirectTo);
    
    if (!tokenHash || type !== 'recovery') {
      console.log('⚠️ [Callback] Invalid callback - missing token_hash or wrong type');
      // Redirect to app without tokens
      return c.redirect(redirectTo || 'https://www.finanzapersonal.com');
    }
    
    // Verify the token with Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    console.log('🔐 [Callback] Verifying token with Supabase...');
    
    // Use verifyOtp to exchange the token_hash for a session
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'recovery',
    });
    
    if (error || !data.session) {
      console.error('❌ [Callback] Token verification failed:', error);
      // Redirect to app with error
      const errorUrl = new URL(redirectTo || 'https://www.finanzapersonal.com');
      errorUrl.searchParams.set('error', 'invalid_token');
      return c.redirect(errorUrl.toString());
    }
    
    console.log('✅ [Callback] Token verified successfully!');
    console.log('🔑 [Callback] Access token preview:', data.session.access_token.substring(0, 20) + '...');
    
    // Redirect to app with the tokens in the hash (standard OAuth flow)
    const finalUrl = new URL(redirectTo || 'https://www.finanzapersonal.com');
    finalUrl.hash = `access_token=${data.session.access_token}&token_type=bearer&type=recovery`;
    
    console.log('🚀 [Callback] Redirecting to:', finalUrl.toString().substring(0, 100) + '...');
    
    return c.redirect(finalUrl.toString());
    
  } catch (error) {
    console.error('❌ [Callback] Unexpected error:', error);
    return c.redirect('https://www.finanzapersonal.com?error=server_error');
  }
});

// Forgot password endpoint - Send password reset email
app.post("/make-server-727b50c3/forgot-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: 'Email es requerido' }, 400);
    }

    console.log('📧 [ForgotPassword] Password reset request received for:', email);

    // 🔥 NUEVO: Rate limit por email individual (3 intentos por hora)
    const rateLimitKey = `password_reset_attempts:${email}`;
    const attemptsData = await kv.get(rateLimitKey);
    
    let attempts = 0;
    let firstAttemptTime = Date.now();
    
    if (attemptsData) {
      try {
        const parsed = JSON.parse(attemptsData);
        attempts = parsed.attempts || 0;
        firstAttemptTime = parsed.firstAttemptTime || Date.now();
        
        // Si han pasado más de 1 hora, resetear el contador
        const oneHourInMs = 60 * 60 * 1000;
        if (Date.now() - firstAttemptTime > oneHourInMs) {
          console.log('⏰ [RateLimit] 1 hora transcurrida, reseteando contador para:', email);
          attempts = 0;
          firstAttemptTime = Date.now();
        }
      } catch (parseError) {
        console.error('❌ [RateLimit] Error parsing attempts data:', parseError);
        attempts = 0;
        firstAttemptTime = Date.now();
      }
    }
    
    console.log(`�� [RateLimit] Intentos actuales para ${email}: ${attempts}/3`);
    
    // Si ya alcanzó el límite de 3 intentos
    if (attempts >= 3) {
      const timeRemaining = Math.ceil((60 * 60 * 1000 - (Date.now() - firstAttemptTime)) / 60000); // en minutos
      console.log(`❌ [RateLimit] Límite alcanzado para ${email}. Tiempo restante: ${timeRemaining} minutos`);
      
      return c.json({ 
        error: '⏱️ Límite de intentos alcanzado',
        message: `Has alcanzado el límite de 3 intentos por hora. Por favor espera ${timeRemaining} minutos antes de intentar nuevamente. Si ya recibiste un correo, revisa tu bandeja de entrada o carpeta de spam.`,
        code: 'USER_RATE_LIMIT_EXCEEDED',
        retryAfter: timeRemaining * 60, // en segundos
        attemptsRemaining: 0,
        maxAttempts: 3
      }, 429);
    }

    console.log('Password reset request received');

    // Check if user exists first
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = users?.users?.find(u => u.email === email);
    
    if (!userExists) {
      console.log('Password reset request for non-existent user');
      // For security, we still return success even if user doesn't exist
      // This prevents email enumeration attacks
      // PERO incrementamos el contador para evitar spam
      await kv.set(rateLimitKey, JSON.stringify({
        attempts: attempts + 1,
        firstAttemptTime: firstAttemptTime
      }));
      
      return c.json({ 
        message: 'Si el correo existe en nuestro sistema, recibirás un enlace de recuperación.' 
      });
    }

    console.log(`User found: ${userExists.id}, sending password reset email...`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Redirect URL MUST include /reset-password path for PKCE flow
    const appUrl = Deno.env.get('APP_URL') || 'https://www.finanzapersonal.com';
    const REDIRECT_URL = `${appUrl}/reset-password`;
    
    console.log('📧 [ForgotPassword] Sending password reset email');
    console.log('📧 [ForgotPassword] Redirect URL:', REDIRECT_URL);
    console.log('🔥 [ForgotPassword] El frontend procesará el code con exchangeCodeForSession');

    // Send password reset email using PKCE flow
    // Supabase will send an email with {{ .ConfirmationURL }} which contains:
    // https://www.finanzapersonal.com/reset-password?code=XXXXX&type=recovery
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: REDIRECT_URL,
    });

    if (error) {
      console.error('❌ [Supabase] Password reset error:', error);
      console.error('❌ [Supabase] Error message:', error.message);
      console.error('❌ [Supabase] Error code:', error.code);
      console.error('❌ [Supabase] Error status:', error.status);
      
      // Handle rate limit error (too many requests)
      if (error.message?.includes('rate limit') || error.code === 'over_email_send_rate_limit') {
        console.error('❌ [Supabase] RATE LIMIT EXCEEDED - Este es un límite de Supabase (no de la app)');
        console.error('❌ [Supabase] El límite es por PROYECTO, afecta a todos los usuarios');
        console.error('❌ [Supabase] Solución: Aumentar en Dashboard > Auth > Rate Limits a 50-100');
        
        return c.json({ 
          error: '⏱️ Límite del servidor alcanzado',
          message: 'El servidor ha alcanzado el límite de correos por hora. Este es un límite de seguridad de Supabase que afecta a todo el proyecto. Por favor contacta al administrador o espera 1 hora.',
          code: 'SERVER_RATE_LIMIT_EXCEEDED',
          retryAfter: 3600 // 1 hora en segundos
        }, 429);
      }
      
      // Check if it's an email configuration error
      if (error.message?.includes('email') || error.message?.includes('SMTP')) {
        console.error('SMTP configuration error detected. Full error details:', JSON.stringify(error));
        return c.json({ 
          error: `El servidor de correo no está configurado correctamente. Detalles: ${error.message}` 
        }, 500);
      }
      
      return c.json({ error: `Error al enviar correo de recuperación: ${error.message}` }, 500);
    }

    // 🔥 ÉXITO: Incrementar el contador de intentos
    const newAttempts = attempts + 1;
    await kv.set(rateLimitKey, JSON.stringify({
      attempts: newAttempts,
      firstAttemptTime: firstAttemptTime
    }));
    
    console.log(`✅ [ForgotPassword] Password reset email sent successfully to ${email}`);
    console.log(`✅ [RateLimit] Intentos actualizados: ${newAttempts}/3`);

    return c.json({ 
      message: 'Correo de recuperación enviado. Por favor revisa tu bandeja de entrada.',
      attemptsRemaining: 3 - newAttempts,
      maxAttempts: 3
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return c.json({ error: 'Error al procesar solicitud' }, 500);
  }
});

// 🔥 Auth verification endpoint - Converts token from email to session
// This endpoint receives the token from the email link and redirects to the app with a valid session
// ⚠️ This endpoint is PUBLIC and does not require authentication
app.options("/make-server-727b50c3/auth/verify", (c) => {
  return c.text('', 204);
});

app.get("/make-server-727b50c3/auth/verify", async (c) => {
  try {
    const token = c.req.query('token');
    const type = c.req.query('type');
    const redirectTo = c.req.query('redirect_to') || 'https://www.finanzapersonal.com';

    console.log('🔐 [AuthVerify] Token verification request');
    console.log('🔐 [AuthVerify] Type:', type);
    console.log('🔐 [AuthVerify] Redirect to:', redirectTo);

    if (!token) {
      console.error('❌ [AuthVerify] No token provided');
      return c.redirect(`${redirectTo}?error=missing_token`);
    }

    if (!type) {
      console.error('❌ [AuthVerify] No type provided');
      return c.redirect(`${redirectTo}?error=missing_type`);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Verify the OTP token and get the session
    console.log('🔐 [AuthVerify] Verifying OTP token...');
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as 'recovery' | 'signup' | 'email',
    });

    if (error) {
      console.error('❌ [AuthVerify] Verification error:', error.message);
      return c.redirect(`${redirectTo}?error=invalid_token&message=${encodeURIComponent(error.message)}`);
    }

    if (!data?.session) {
      console.error('❌ [AuthVerify] No session returned');
      return c.redirect(`${redirectTo}?error=no_session`);
    }

    console.log('✅ [AuthVerify] Token verified successfully');
    console.log('✅ [AuthVerify] User ID:', data.user?.id);
    console.log('✅ [AuthVerify] Session type:', type);

    // Redirect to the app with session tokens in the URL hash (standard OAuth flow)
    const redirectUrl = `${redirectTo}#access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}&type=${type}&expires_in=${data.session.expires_in}`;
    
    console.log('🔄 [AuthVerify] Redirecting to app with session');
    return c.redirect(redirectUrl);

  } catch (error) {
    console.error('❌ [AuthVerify] Unexpected error:', error);
    const redirectTo = c.req.query('redirect_to') || 'https://www.finanzapersonal.com';
    return c.redirect(`${redirectTo}?error=server_error&message=${encodeURIComponent(String(error))}`);
  }
});

// Reset password endpoint - Update user password with token from email
app.post("/make-server-727b50c3/reset-password", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Token de autenticación requerido' }, 401);
    }

    const body = await c.req.json();
    const { newPassword } = body;

    if (!newPassword) {
      return c.json({ error: 'Nueva contraseña es requerida' }, 400);
    }

    if (newPassword.length < 6) {
      return c.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, 400);
    }

    console.log('Updating password for user with recovery token...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Update the user's password using the access token from the email link
    const { data, error } = await supabase.auth.updateUser(
      { password: newPassword },
      { accessToken }
    );

    if (error) {
      console.error('Password update error:', error);
      
      if (error.message?.includes('token') || error.message?.includes('expired')) {
        return c.json({ 
          error: 'El enlace de recuperación ha expirado o es inválido. Por favor solicita uno nuevo.' 
        }, 401);
      }
      
      return c.json({ error: 'Error al actualizar la contraseña' }, 500);
    }

    if (!data.user) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }

    console.log(`Password updated successfully for user: ${data.user.id}`);

    return c.json({ 
      message: 'Contraseña actualizada exitosamente',
      user: {
        id: data.user.id,
        email: data.user.email,
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return c.json({ error: 'Error al procesar solicitud' }, 500);
  }
});

// Get session endpoint - Verify if user has active session
app.get("/make-server-727b50c3/session", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      // Don't log this as an error - it's normal when token is invalid/expired
      console.log('Session verification failed: Token is invalid or expired');
      return c.json({ error: 'Sesión inválida' }, 401);
    }

    // Get profile photo URL from Postgres
    const photoUrl = await db.getUserPhotoUrl(user.id);

    // Capture device info on session verification (non-blocking)
    const userAgent = c.req.header('user-agent') || 'Unknown';
    saveDeviceInfo(user.id, userAgent).catch(err => {
      console.error('⚠️  Error saving device info during session check:', err);
    });

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata.name || user.email?.split('@')[0],
        photoUrl: photoUrl || null,
      },
    });
  } catch (error) {
    // Only log unexpected errors
    console.error('Unexpected session verification error:', error);
    return c.json({ error: 'Error al verificar sesión' }, 500);
  }
});

// Capture device info endpoint - Can be called anytime to update device info
app.post("/make-server-727b50c3/capture-device", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Sesión inválida' }, 401);
    }

    // Capture and save device information
    const userAgent = c.req.header('user-agent') || 'Unknown';
    
    let deviceInfo;
    try {
      deviceInfo = await saveDeviceInfo(user.id, userAgent);
    } catch (saveError) {
      console.error('Error saving device info (non-critical):', saveError);
      // Parse device info anyway even if save fails
      deviceInfo = parseUserAgent(userAgent);
    }

    return c.json({
      success: true,
      device: deviceInfo,
    });
  } catch (error) {
    console.error('Error capturing device info:', error);
    return c.json({ error: 'Error al capturar información del dispositivo' }, 500);
  }
});

// Update profile endpoint - Update user name and/or photo
app.post("/make-server-727b50c3/update-profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.error('Auth error in update-profile:', authError);
      return c.json({ error: 'Sesión inválida' }, 401);
    }

    const body = await c.req.json();
    const { name, photoUrl, phone, dateOfBirth, address, occupation } = body;

    console.log(`Updating profile for user: ${user.id}, name: ${name}, photoUrl: ${photoUrl ? 'provided' : 'not provided'}`);

    // Update user metadata in Supabase if any fields are provided
    const metadataUpdates: any = {};
    if (name) metadataUpdates.name = name;
    if (phone) metadataUpdates.phone = phone;
    if (dateOfBirth) metadataUpdates.dateOfBirth = dateOfBirth;
    if (address) metadataUpdates.address = address;
    if (occupation) metadataUpdates.occupation = occupation;
    
    if (Object.keys(metadataUpdates).length > 0) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { user_metadata: { ...user.user_metadata, ...metadataUpdates } }
      );

      if (updateError) {
        console.error('Error updating user metadata:', updateError);
        return c.json({ error: 'Error al actualizar perfil' }, 500);
      }

      console.log(`User metadata updated successfully:`, metadataUpdates);
    }

    // Store photo URL in Postgres if provided
    if (photoUrl !== undefined) {
      if (photoUrl === null || photoUrl === '') {
        // Delete photo
        await db.setUserPhotoUrl(user.id, null);
        console.log(`User photo removed for: ${user.id}`);
      } else {
        // Save photo URL
        await db.setUserPhotoUrl(user.id, photoUrl);
        console.log(`User photo updated for: ${user.id}`);
      }
    }

    // Get updated photo URL
    const currentPhotoUrl = await db.getUserPhotoUrl(user.id);

    // Get fresh user metadata after updates
    const { data: { user: updatedUser } } = await supabase.auth.getUser(accessToken);

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: updatedUser?.user_metadata?.name || name || user.email?.split('@')[0],
        photoUrl: currentPhotoUrl || null,
        phone: updatedUser?.user_metadata?.phone || null,
        dateOfBirth: updatedUser?.user_metadata?.dateOfBirth || null,
        address: updatedUser?.user_metadata?.address || null,
        occupation: updatedUser?.user_metadata?.occupation || null,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ error: 'Error al actualizar perfil' }, 500);
  }
});

// Upload profile photo endpoint - Upload photo to Supabase Storage
app.post("/make-server-727b50c3/upload-photo", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      console.error('No access token provided');
      return c.json({ error: 'No autorizado' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.error('Auth error in upload-photo:', authError);
      return c.json({ error: 'Sesión inválida' }, 401);
    }

    // Get the uploaded file from form data
    const formData = await c.req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      console.error('No file found in form data');
      return c.json({ error: 'No se encontró archivo' }, 400);
    }

    console.log(`Uploading photo for user: ${user.id}, file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.error(`Invalid file type: ${file.type}`);
      return c.json({ error: 'Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, GIF, WEBP)' }, 400);
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error(`File too large: ${file.size} bytes`);
      return c.json({ error: 'El archivo es demasiado grande. Máximo 5MB' }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Create bucket if it doesn't exist
    const bucketName = 'make-727b50c3-profile-photos';
    console.log(`Checking if bucket exists: ${bucketName}`);
    
    const { data: buckets, error: listBucketsError } = await supabaseAdmin.storage.listBuckets();
    
    if (listBucketsError) {
      console.error('Error listing buckets:', listBucketsError);
      return c.json({ error: `Error al verificar almacenamiento: ${listBucketsError.message}` }, 500);
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Creating storage bucket: ${bucketName}`);
      const { data: createBucketData, error: createBucketError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: maxSize,
      });
      
      if (createBucketError) {
        console.error('Error creating bucket:', createBucketError);
        return c.json({ error: `Error al crear almacenamiento: ${createBucketError.message}` }, 500);
      }
      
      console.log('Bucket created successfully:', createBucketData);
    } else {
      console.log('Bucket already exists');
    }

    // Delete old photo if exists
    const oldPhotoUrl = await db.getUserPhotoUrl(user.id);
    
    if (oldPhotoUrl && typeof oldPhotoUrl === 'string') {
      // Extract file path from URL
      const match = oldPhotoUrl.match(/\/object\/sign\/[^/]+\/(.+)\?/);
      if (match) {
        const oldFilePath = match[1];
        console.log(`Deleting old photo: ${oldFilePath}`);
        const { error: deleteError } = await supabaseAdmin.storage.from(bucketName).remove([oldFilePath]);
        if (deleteError) {
          console.error('Error deleting old photo (non-critical):', deleteError);
        }
      }
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    console.log(`Uploading file with name: ${fileName}`);

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, uint8Array, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return c.json({ error: `Error al subir archivo: ${uploadError.message}` }, 500);
    }

    console.log(`File uploaded successfully: ${fileName}`, uploadData);

    // Create signed URL (valid for 1 year)
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from(bucketName)
      .createSignedUrl(fileName, 365 * 24 * 60 * 60); // 1 year in seconds

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError);
      return c.json({ error: `Error al crear URL de acceso: ${signedUrlError.message}` }, 500);
    }

    const photoUrl = signedUrlData.signedUrl;
    
    console.log(`Signed URL created: ${photoUrl}`);

    // Store photo URL in users_data table
    await db.setUserPhotoUrl(user.id, photoUrl);

    console.log(`Photo uploaded and saved successfully for user: ${user.id}`);

    return c.json({
      success: true,
      photoUrl,
    });
  } catch (error) {
    console.error('Error uploading photo (caught in catch):', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return c.json({ error: `Error al subir foto: ${errorMessage}` }, 500);
  }
});

// ====================
// DEVELOPMENT ENDPOINTS (Remove in production)
// ====================

// ADMIN: Complete cleanup - Delete ALL users and ALL data
app.post("/make-server-727b50c3/admin/cleanup-all", async (c) => {
  try {
    const authResult = await verifySuperUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    console.log('🧹 Starting complete database cleanup...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Step 1: Delete all Postgres data (transactions, budgets, accounts, categories)
    console.log('Step 1: Cleaning Postgres tables...');
    
    // Count records first
    const { count: transactionsCount } = await supabase
      .from('transactions_727b50c3')
      .select('*', { count: 'exact', head: true });
    
    const { count: budgetsCount } = await supabase
      .from('budgets_727b50c3')
      .select('*', { count: 'exact', head: true });
    
    const { count: accountsCount } = await supabase
      .from('accounts_727b50c3')
      .select('*', { count: 'exact', head: true });
    
    const { count: categoriesCount } = await supabase
      .from('categories_727b50c3')
      .select('*', { count: 'exact', head: true });
    
    const { count: subcategoriesCount } = await supabase
      .from('subcategories_727b50c3')
      .select('*', { count: 'exact', head: true });

    console.log(`Found: ${transactionsCount} transactions, ${budgetsCount} budgets, ${accountsCount} accounts, ${categoriesCount} categories, ${subcategoriesCount} subcategories`);

    // Delete in correct order (respect foreign keys: transactions first, then budgets, accounts, subcategories, categories)
    // Get all IDs first, then delete them
    
    // Delete transactions
    if (transactionsCount && transactionsCount > 0) {
      const { data: transactionsData } = await supabase
        .from('transactions_727b50c3')
        .select('id');
      
      if (transactionsData && transactionsData.length > 0) {
        const transactionIds = transactionsData.map(t => t.id);
        const { error: deleteTransactionsError } = await supabase
          .from('transactions_727b50c3')
          .delete()
          .in('id', transactionIds);

        if (deleteTransactionsError) {
          console.error('Error deleting transactions:', deleteTransactionsError);
          return c.json({ error: 'Error al eliminar transacciones', details: deleteTransactionsError }, 500);
        }
        console.log(`✓ Deleted ${transactionsCount} transactions`);
      }
    } else {
      console.log(`✓ No transactions to delete`);
    }

    // Delete budgets
    if (budgetsCount && budgetsCount > 0) {
      const { data: budgetsData } = await supabase
        .from('budgets_727b50c3')
        .select('id');
      
      if (budgetsData && budgetsData.length > 0) {
        const budgetIds = budgetsData.map(b => b.id);
        const { error: deleteBudgetsError } = await supabase
          .from('budgets_727b50c3')
          .delete()
          .in('id', budgetIds);

        if (deleteBudgetsError) {
          console.error('Error deleting budgets:', deleteBudgetsError);
          return c.json({ error: 'Error al eliminar presupuestos', details: deleteBudgetsError }, 500);
        }
        console.log(`✓ Deleted ${budgetsCount} budgets`);
      }
    } else {
      console.log(`✓ No budgets to delete`);
    }

    // Delete accounts
    if (accountsCount && accountsCount > 0) {
      const { data: accountsData } = await supabase
        .from('accounts_727b50c3')
        .select('id');
      
      if (accountsData && accountsData.length > 0) {
        const accountIds = accountsData.map(a => a.id);
        const { error: deleteAccountsError } = await supabase
          .from('accounts_727b50c3')
          .delete()
          .in('id', accountIds);

        if (deleteAccountsError) {
          console.error('Error deleting accounts:', deleteAccountsError);
          return c.json({ error: 'Error al eliminar cuentas', details: deleteAccountsError }, 500);
        }
        console.log(`✓ Deleted ${accountsCount} accounts`);
      }
    } else {
      console.log(`✓ No accounts to delete`);
    }

    // Delete subcategories
    if (subcategoriesCount && subcategoriesCount > 0) {
      const { data: subcategoriesData } = await supabase
        .from('subcategories_727b50c3')
        .select('id');
      
      if (subcategoriesData && subcategoriesData.length > 0) {
        const subcategoryIds = subcategoriesData.map(s => s.id);
        const { error: deleteSubcategoriesError } = await supabase
          .from('subcategories_727b50c3')
          .delete()
          .in('id', subcategoryIds);

        if (deleteSubcategoriesError) {
          console.error('Error deleting subcategories:', deleteSubcategoriesError);
          return c.json({ error: 'Error al eliminar subcategorías', details: deleteSubcategoriesError }, 500);
        }
        console.log(`✓ Deleted ${subcategoriesCount} subcategories`);
      }
    } else {
      console.log(`✓ No subcategories to delete`);
    }

    // Delete categories
    if (categoriesCount && categoriesCount > 0) {
      const { data: categoriesData } = await supabase
        .from('categories_727b50c3')
        .select('id');
      
      if (categoriesData && categoriesData.length > 0) {
        const categoryIds = categoriesData.map(c => c.id);
        const { error: deleteCategoriesError } = await supabase
          .from('categories_727b50c3')
          .delete()
          .in('id', categoryIds);

        if (deleteCategoriesError) {
          console.error('Error deleting categories:', deleteCategoriesError);
          return c.json({ error: 'Error al eliminar categorías', details: deleteCategoriesError }, 500);
        }
        console.log(`✓ Deleted ${categoriesCount} categories`);
      }
    } else {
      console.log(`✓ No categories to delete`);
    }

    // Delete users_data (photo URLs and disabled status)
    const { count: usersDataCount } = await supabase
      .from('users_data')
      .select('*', { count: 'exact', head: true });

    if (usersDataCount && usersDataCount > 0) {
      const { error: deleteUsersDataError } = await supabase
        .from('users_data')
        .delete()
        .neq('user_id', '__impossible_id__'); // Delete all rows

      if (deleteUsersDataError) {
        console.error('Error deleting users_data:', deleteUsersDataError);
        return c.json({ error: 'Error al eliminar datos de usuarios', details: deleteUsersDataError }, 500);
      }
      console.log(`✓ Deleted ${usersDataCount} users_data entries`);
    } else {
      console.log(`✓ No users_data to delete`);
    }

    // Step 2: Delete all users (except the super user executing the cleanup)
    console.log('Step 2: Fetching all users...');
    const { data: userData, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return c.json({ error: 'Error al listar usuarios' }, 500);
    }

    // Get the super user who is executing the cleanup
    const executingUserId = authResult.userId;
    console.log(`Executing user ID: ${executingUserId} - This user will NOT be deleted`);

    const totalUsers = userData.users.length;
    console.log(`Found ${totalUsers} users total`);

    let deletedUsers = 0;
    let failedUsers = 0;
    let skippedSuperUser = false;

    // Delete each user (except the super user)
    for (const user of userData.users) {
      // Skip the super user who is executing the cleanup
      if (user.id === executingUserId) {
        console.log(`⚠️ Skipping super user: ${user.email} (${user.id})`);
        skippedSuperUser = true;
        continue;
      }

      try {
        // Use shouldSoftDelete: false to ensure complete removal
        const { error: deleteError } = await supabase.auth.admin.deleteUser(
          user.id,
          false // shouldSoftDelete = false (hard delete)
        );
        if (deleteError) {
          console.error(`Failed to delete user ${user.email}:`, deleteError);
          console.error(`   Error details:`, JSON.stringify(deleteError, null, 2));
          failedUsers++;
        } else {
          console.log(`✓ Deleted user: ${user.email} (${user.id})`);
          deletedUsers++;
        }
      } catch (error) {
        console.error(`Exception deleting user ${user.email}:`, error);
        console.error(`   Error details:`, error instanceof Error ? error.message : String(error));
        failedUsers++;
      }
    }

    const summary = {
      postgres: {
        transactions: transactionsCount || 0,
        budgets: budgetsCount || 0,
        accounts: accountsCount || 0,
        categories: categoriesCount || 0,
        subcategories: subcategoriesCount || 0,
      },
      users: {
        total: totalUsers,
        deleted: deletedUsers,
        failed: failedUsers,
        skippedSuperUser: skippedSuperUser,
      },
      success: failedUsers === 0,
    };

    console.log('✅ Cleanup completed:', summary);

    return c.json({
      message: '✅ Limpieza completa exitosa',
      summary,
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    return c.json({ error: 'Error durante la limpieza' }, 500);
  }
});

// List all users (for testing/debugging only)
app.get("/make-server-727b50c3/dev/users", async (c) => {
  try {
    const authResult = await verifySuperUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    // Get pagination parameters from query string
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '10', 10);
    
    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 per page

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get ALL users first to get total count
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error listing users:', error);
      return c.json({ error: 'Error al listar usuarios' }, 500);
    }

    // Get status for all users from SQL
    const usersWithStatus = await Promise.all(
      data.users.map(async (u) => {
        // Query users_data table for disabled status
        const { data: userData } = await supabase
          .from('users_data')
          .select('disabled')
          .eq('id', u.id)
          .maybeSingle();
        
        return {
          id: u.id,
          email: u.email,
          name: u.user_metadata?.name,
          photoUrl: u.user_metadata?.photoUrl,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          email_confirmed_at: u.email_confirmed_at,
          enabled: !(userData?.disabled === true), // enabled by default unless explicitly disabled in DB
        };
      })
    );

    // Sort by creation date (newest first)
    usersWithStatus.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Calculate pagination
    const totalUsers = usersWithStatus.length;
    const totalPages = Math.ceil(totalUsers / validLimit);
    const startIndex = (validPage - 1) * validLimit;
    const endIndex = startIndex + validLimit;
    
    // Get paginated slice
    const paginatedUsers = usersWithStatus.slice(startIndex, endIndex);

    return c.json({ 
      users: paginatedUsers,
      pagination: {
        page: validPage,
        limit: validLimit,
        total: totalUsers,
        totalPages,
        hasMore: validPage < totalPages,
        hasPrevious: validPage > 1,
      }
    });
  } catch (error) {
    console.error('Error listing users:', error);
    return c.json({ error: 'Error al listar usuarios' }, 500);
  }
});

// Get user details with statistics
app.get("/make-server-727b50c3/admin/users/:userId", async (c) => {
  try {
    console.log('📥 GET /admin/users/:userId - Request received');
    
    const authResult = await verifySuperUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      console.log('❌ Auth failed:', authResult.error);
      return c.json({ error: authResult.error }, authResult.status);
    }

    const userId = c.req.param('userId');
    console.log('🔍 Fetching details for userId:', userId);

    if (!userId) {
      return c.json({ error: 'User ID es requerido' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get user info
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !userData?.user) {
      console.error('❌ Error getting user:', userError);
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }

    const user = userData.user;
    console.log('✅ User found:', user.email);

    // Get user's data from SQL tables
    const { data: transactionsData, error: txError } = await supabase
      .from('transactions_727b50c3')
      .select('*')
      .eq('user_id', userId);

    const { data: accountsData, error: accError } = await supabase
      .from('accounts_727b50c3')
      .select('*')
      .eq('user_id', userId);

    const { data: categoriesData, error: catError } = await supabase
      .from('categories_727b50c3')
      .select('*')
      .eq('user_id', userId);

    const { data: budgetsData, error: budError } = await supabase
      .from('budgets_727b50c3')
      .select('*')
      .eq('user_id', userId);

    if (txError) console.error(`Error fetching transactions for user ${userId}:`, txError);
    if (accError) console.error(`Error fetching accounts for user ${userId}:`, accError);
    if (catError) console.error(`Error fetching categories for user ${userId}:`, catError);
    if (budError) console.error(`Error fetching budgets for user ${userId}:`, budError);

    // ✅ MIGRATED: Get device data from SQL table
    const deviceInfo = await devicesDb.getUserDeviceInfo(supabase, userId);
    
    const transactions = transactionsData || [];
    const accounts = accountsData || [];
    const categories = categoriesData || [];
    const budgets = budgetsData || [];

    console.log('📊 Data loaded - Transactions:', transactions.length, 'Accounts:', accounts.length);
    if (deviceInfo) {
      console.log('📱 Device info:', deviceInfo.deviceType, '-', deviceInfo.browser, 'on', deviceInfo.os);
    }

    // Calculate statistics
    const totalIncome = transactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalExpense = transactions.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalTransfers = transactions.filter((t: any) => t.type === 'transfer').length;

    const userDetails = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name,
      photoUrl: user.user_metadata?.photoUrl,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
      statistics: {
        transactions: {
          total: transactions.length,
          income: transactions.filter((t: any) => t.type === 'income').length,
          expense: transactions.filter((t: any) => t.type === 'expense').length,
          transfers: totalTransfers,
        },
        amounts: {
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
        },
        accounts: accounts.length,
        categories: categories.length,
        budgets: budgets.length,
      },
      device: deviceInfo,
    };

    console.log('✅ Sending user details response');
    return c.json({ user: userDetails });
  } catch (error) {
    console.error('❌ Error getting user details:', error);
    return c.json({ error: 'Error al obtener detalles del usuario' }, 500);
  }
});

// Search users by email or name
app.get("/make-server-727b50c3/admin/users/search/:query", async (c) => {
  try {
    const authResult = await verifySuperUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const query = c.req.param('query')?.toLowerCase();

    if (!query) {
      return c.json({ error: 'Consulta de búsqueda es requerida' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error listing users:', error);
      return c.json({ error: 'Error al buscar usuarios' }, 500);
    }

    const filteredUsers = data.users.filter(u => {
      const email = u.email?.toLowerCase() || '';
      const name = u.user_metadata?.name?.toLowerCase() || '';
      return email.includes(query) || name.includes(query);
    });

    // Get status for all filtered users from SQL
    const usersWithStatus = await Promise.all(
      filteredUsers.map(async (u) => {
        // Query users_data table for disabled status
        const { data: userData } = await supabase
          .from('users_data')
          .select('disabled')
          .eq('id', u.id)
          .maybeSingle();
        
        return {
          id: u.id,
          email: u.email,
          name: u.user_metadata?.name,
          photoUrl: u.user_metadata?.photoUrl,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          enabled: !(userData?.disabled === true),
        };
      })
    );

    return c.json({ users: usersWithStatus, total: usersWithStatus.length });
  } catch (error) {
    console.error('Error searching users:', error);
    return c.json({ error: 'Error al buscar usuarios' }, 500);
  }
});

// Get system statistics
app.get("/make-server-727b50c3/admin/stats", async (c) => {
  try {
    const authResult = await verifySuperUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get all users
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error listing users:', error);
      return c.json({ error: 'Error al obtener estadísticas' }, 500);
    }

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activeUsers24h = data.users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > last24h).length;
    const activeUsers7days = data.users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > last7days).length;
    const activeUsers30days = data.users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > last30days).length;

    const newUsers24h = data.users.filter(u => new Date(u.created_at) > last24h).length;
    const newUsers7days = data.users.filter(u => new Date(u.created_at) > last7days).length;
    const newUsers30days = data.users.filter(u => new Date(u.created_at) > last30days).length;

    // ✅ FIX: Query actual tables instead of KV store
    let totalTransactions = 0;
    let totalAccounts = 0;
    let totalCategories = 0;
    let totalBudgets = 0;
    
    try {
      // Query transactions table
      const { count: transactionsCount, error: transactionsError } = await supabase
        .from('transactions_727b50c3')
        .select('*', { count: 'exact', head: true });
      
      if (!transactionsError) {
        totalTransactions = transactionsCount || 0;
      }

      // Query accounts table
      const { count: accountsCount, error: accountsError } = await supabase
        .from('accounts_727b50c3')
        .select('*', { count: 'exact', head: true });
      
      if (!accountsError) {
        totalAccounts = accountsCount || 0;
      }

      // Query categories table
      const { count: categoriesCount, error: categoriesError } = await supabase
        .from('categories_727b50c3')
        .select('*', { count: 'exact', head: true });
      
      if (!categoriesError) {
        totalCategories = categoriesCount || 0;
      }

      // Query budgets table
      const { count: budgetsCount, error: budgetsError } = await supabase
        .from('budgets_727b50c3')
        .select('*', { count: 'exact', head: true });
      
      if (!budgetsError) {
        totalBudgets = budgetsCount || 0;
      }

      console.log(`📊 System stats: ${totalTransactions} transactions, ${totalAccounts} accounts, ${totalCategories} categories, ${totalBudgets} budgets`);
    } catch (error) {
      console.error('Error fetching system data:', error);
      // Continue with 0 values if query fails
    }

    const stats = {
      users: {
        total: data.users.length,
        active24h: activeUsers24h,
        active7days: activeUsers7days,
        active30days: activeUsers30days,
        new24h: newUsers24h,
        new7days: newUsers7days,
        new30days: newUsers30days,
      },
      data: {
        totalTransactions,
        totalAccounts,
        totalCategories,
        totalBudgets,
      },
      timestamp: new Date().toISOString(),
    };

    return c.json({ stats });
  } catch (error) {
    console.error('Error getting system stats:', error);
    return c.json({ error: 'Error al obtener estadísticas del sistema' }, 500);
  }
});

// Get user growth data for charts (last 30 days)
app.get("/make-server-727b50c3/admin/growth-data", async (c) => {
  try {
    console.log('📊 GET /admin/growth-data - Fetching user growth data');
    
    const authResult = await verifySuperUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    // Get filter parameters
    const dateRange = c.req.query('dateRange') || '30d';
    const customStartDate = c.req.query('startDate');
    const customEndDate = c.req.query('endDate');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error listing users:', error);
      return c.json({ error: 'Error al listar usuarios' }, 500);
    }

    // Calculate date range based on filter
    let daysToShow = 30;
    let startDate = new Date();
    let endDate = new Date();

    if (customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      daysToShow = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    } else {
      switch (dateRange) {
        case '7d': daysToShow = 7; break;
        case '30d': daysToShow = 30; break;
        case '3m': daysToShow = 90; break;
        case '6m': daysToShow = 180; break;
        case '1y': daysToShow = 365; break;
        default: daysToShow = 30;
      }
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - daysToShow + 1);
    }

    // Get data for the date range
    const growthData = [];
    
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      // Count users created on this day
      const usersOnDay = data.users.filter((u) => {
        const createdAt = new Date(u.created_at);
        return createdAt >= date && createdAt < nextDate;
      }).length;

      // Count active users on this day (last_sign_in_at)
      const activeOnDay = data.users.filter((u) => {
        if (!u.last_sign_in_at) return false;
        const lastSignIn = new Date(u.last_sign_in_at);
        return lastSignIn >= date && lastSignIn < nextDate;
      }).length;

      growthData.push({
        date: date.toISOString().split('T')[0],
        newUsers: usersOnDay,
        activeUsers: activeOnDay,
        totalUsers: data.users.filter((u) => new Date(u.created_at) <= nextDate).length,
      });
    }

    console.log(`✅ Growth data calculated for ${daysToShow} days`);
    return c.json({ growthData });
  } catch (error) {
    console.error('Error getting growth data:', error);
    return c.json({ error: 'Error al obtener datos de crecimiento' }, 500);
  }
});

// Get global financial statistics
app.get("/make-server-727b50c3/admin/financial-stats", async (c) => {
  try {
    console.log('💰 GET /admin/financial-stats - Fetching financial statistics');
    
    const authResult = await verifySuperUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    // Get filter parameters
    const dateRange = c.req.query('dateRange') || 'all';
    const customStartDate = c.req.query('startDate');
    const customEndDate = c.req.query('endDate');
    const userStatus = c.req.query('userStatus') || 'all';
    const transactionType = c.req.query('transactionType') || 'all';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error listing users:', error);
      return c.json({ error: 'Error al listar usuarios' }, 500);
    }

    // Calculate date filter range
    let filterStartDate: Date | null = null;
    let filterEndDate: Date | null = null;

    if (dateRange !== 'all') {
      if (customStartDate && customEndDate) {
        filterStartDate = new Date(customStartDate);
        filterEndDate = new Date(customEndDate);
        filterEndDate.setHours(23, 59, 59, 999);
      } else {
        filterEndDate = new Date();
        filterStartDate = new Date();
        switch (dateRange) {
          case '7d': filterStartDate.setDate(filterStartDate.getDate() - 7); break;
          case '30d': filterStartDate.setDate(filterStartDate.getDate() - 30); break;
          case '3m': filterStartDate.setMonth(filterStartDate.getMonth() - 3); break;
          case '6m': filterStartDate.setMonth(filterStartDate.getMonth() - 6); break;
          case '1y': filterStartDate.setFullYear(filterStartDate.getFullYear() - 1); break;
        }
      }
    }

    let totalIncome = 0;
    let totalExpense = 0;
    let totalTransactions = 0;
    let totalAccounts = 0;
    let totalCategories = 0;
    let totalBudgets = 0;
    let usersWithTransactions = 0;
    let maxBalance = 0;
    let minBalance = 0;
    let maxBalanceUser = '';
    let minBalanceUser = '';
    let largestTransaction = 0;

    // Filter users by status
    let filteredUsers = data.users;
    if (userStatus === 'enabled') {
      filteredUsers = data.users.filter(u => u.user_metadata?.enabled !== false);
    } else if (userStatus === 'disabled') {
      filteredUsers = data.users.filter(u => u.user_metadata?.enabled === false);
    }

    // Process each user's data
    for (const user of filteredUsers) {
      try {
        // Query SQL tables instead of KV Store
        const { data: transactionsData, error: txError } = await supabase
          .from('transactions_727b50c3')
          .select('*')
          .eq('user_id', user.id);

        const { data: accountsData, error: accError } = await supabase
          .from('accounts_727b50c3')
          .select('*')
          .eq('user_id', user.id);

        const { data: categoriesData, error: catError } = await supabase
          .from('categories_727b50c3')
          .select('*')
          .eq('user_id', user.id);

        const { data: budgetsData, error: budError } = await supabase
          .from('budgets_727b50c3')
          .select('*')
          .eq('user_id', user.id);

        if (txError) console.error(`Error fetching transactions for user ${user.id}:`, txError);
        if (accError) console.error(`Error fetching accounts for user ${user.id}:`, accError);
        if (catError) console.error(`Error fetching categories for user ${user.id}:`, catError);
        if (budError) console.error(`Error fetching budgets for user ${user.id}:`, budError);
        
        let transactions = transactionsData || [];
        const accounts = accountsData || [];
        const categories = categoriesData || [];
        const budgets = budgetsData || [];

        // Apply date filter to transactions
        if (filterStartDate && filterEndDate) {
          transactions = transactions.filter((t: any) => {
            const transDate = new Date(t.date);
            return transDate >= filterStartDate && transDate <= filterEndDate;
          });
        }

        // Apply transaction type filter
        if (transactionType === 'income') {
          transactions = transactions.filter((t: any) => t.type === 'income');
        } else if (transactionType === 'expense') {
          transactions = transactions.filter((t: any) => t.type === 'expense');
        }

        totalAccounts += accounts.length;
        totalCategories += categories.length;
        totalBudgets += budgets.length;
        totalTransactions += transactions.length;

        if (transactions.length > 0) {
          usersWithTransactions++;
        }

        const userIncome = transactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + t.amount, 0);
        const userExpense = transactions.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + t.amount, 0);
        const userBalance = userIncome - userExpense;

        totalIncome += userIncome;
        totalExpense += userExpense;

        // Track max/min balances
        if (userBalance > maxBalance || maxBalanceUser === '') {
          maxBalance = userBalance;
          maxBalanceUser = user.user_metadata?.name || user.email || 'Usuario sin nombre';
        }
        if (userBalance < minBalance || minBalanceUser === '') {
          minBalance = userBalance;
          minBalanceUser = user.user_metadata?.name || user.email || 'Usuario sin nombre';
        }

        // Track largest transaction
        transactions.forEach((t: any) => {
          if (t.amount > largestTransaction) {
            largestTransaction = t.amount;
          }
        });
      } catch (parseError) {
        console.error(`Error processing user ${user.id}:`, parseError);
        // Skip this user and continue
        continue;
      }
    }

    const avgTransactionsPerUser = filteredUsers.length > 0 ? totalTransactions / filteredUsers.length : 0;
    const systemBalance = totalIncome - totalExpense;

    const financialStats = {
      totals: {
        income: totalIncome,
        expense: totalExpense,
        balance: systemBalance,
        transactions: totalTransactions,
        accounts: totalAccounts,
        categories: totalCategories,
        budgets: totalBudgets,
      },
      averages: {
        transactionsPerUser: avgTransactionsPerUser,
        incomePerUser: filteredUsers.length > 0 ? totalIncome / filteredUsers.length : 0,
        expensePerUser: filteredUsers.length > 0 ? totalExpense / filteredUsers.length : 0,
      },
      extremes: {
        maxBalance,
        maxBalanceUser,
        minBalance,
        minBalanceUser,
        largestTransaction,
      },
      engagement: {
        usersWithTransactions,
        usersWithoutTransactions: filteredUsers.length - usersWithTransactions,
      },
    };

    console.log('✅ Financial statistics calculated with filters');
    return c.json({ stats: financialStats });
  } catch (error) {
    console.error('Error getting financial stats:', error);
    return c.json({ error: 'Error al obtener estadísticas financieras' }, 500);
  }
});

// Get top active users
app.get("/make-server-727b50c3/admin/top-users", async (c) => {
  try {
    console.log('🏆 GET /admin/top-users - Fetching top active users');
    
    const authResult = await verifySuperUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    // Get filter parameters
    const dateRange = c.req.query('dateRange') || 'all';
    const customStartDate = c.req.query('startDate');
    const customEndDate = c.req.query('endDate');
    const userStatus = c.req.query('userStatus') || 'all';
    const sortBy = c.req.query('sortBy') || 'activity';
    const sortOrder = c.req.query('sortOrder') || 'desc';
    const searchQuery = c.req.query('search') || '';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error listing users:', error);
      return c.json({ error: 'Error al listar usuarios' }, 500);
    }

    // Calculate date filter range
    let filterStartDate: Date | null = null;
    let filterEndDate: Date | null = null;

    if (dateRange !== 'all') {
      if (customStartDate && customEndDate) {
        filterStartDate = new Date(customStartDate);
        filterEndDate = new Date(customEndDate);
        filterEndDate.setHours(23, 59, 59, 999);
      } else {
        filterEndDate = new Date();
        filterStartDate = new Date();
        switch (dateRange) {
          case '7d': filterStartDate.setDate(filterStartDate.getDate() - 7); break;
          case '30d': filterStartDate.setDate(filterStartDate.getDate() - 30); break;
          case '3m': filterStartDate.setMonth(filterStartDate.getMonth() - 3); break;
          case '6m': filterStartDate.setMonth(filterStartDate.getMonth() - 6); break;
          case '1y': filterStartDate.setFullYear(filterStartDate.getFullYear() - 1); break;
        }
      }
    }

    // Filter users by status and search
    let filteredUsers = data.users;
    
    if (userStatus === 'enabled') {
      filteredUsers = filteredUsers.filter(u => u.user_metadata?.enabled !== false);
    } else if (userStatus === 'disabled') {
      filteredUsers = filteredUsers.filter(u => u.user_metadata?.enabled === false);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        (u.user_metadata?.name?.toLowerCase() || '').includes(query) ||
        (u.email?.toLowerCase() || '').includes(query)
      );
    }

    // Build user statistics
    const userStats = [];

    for (const user of filteredUsers) {
      try {
        // Query SQL table instead of KV Store
        const { data: transactionsData, error: txError } = await supabase
          .from('transactions_727b50c3')
          .select('*')
          .eq('user_id', user.id);

        if (txError) console.error(`Error fetching transactions for user ${user.id}:`, txError);

        let transactions = transactionsData || [];

        // Apply date filter to transactions
        if (filterStartDate && filterEndDate) {
          transactions = transactions.filter((t: any) => {
            const transDate = new Date(t.date);
            return transDate >= filterStartDate && transDate <= filterEndDate;
          });
        }

        const income = transactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + t.amount, 0);
        const expense = transactions.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + t.amount, 0);

        userStats.push({
          id: user.id,
          name: user.user_metadata?.name || 'Sin nombre',
          email: user.email,
          transactionCount: transactions.length,
          balance: income - expense,
          lastActivity: user.last_sign_in_at || user.created_at,
          createdAt: user.created_at,
        });
      } catch (parseError) {
        console.error(`Error processing user ${user.id} for rankings:`, parseError);
        // Skip this user and continue
        continue;
      }
    }

    // Sort based on sortBy parameter
    let sortedStats = [...userStats];
    switch (sortBy) {
      case 'transactions':
        sortedStats.sort((a, b) => b.transactionCount - a.transactionCount);
        break;
      case 'balance':
        sortedStats.sort((a, b) => b.balance - a.balance);
        break;
      case 'createdAt':
        sortedStats.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'activity':
      default:
        sortedStats.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
        break;
    }

    // Apply sort order
    if (sortOrder === 'asc') {
      sortedStats.reverse();
    }

    // Get top rankings for display
    const topByTransactions = [...userStats]
      .sort((a, b) => b.transactionCount - a.transactionCount)
      .slice(0, 10);

    const topByBalance = [...userStats]
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 10);

    const topByActivity = [...userStats]
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
      .slice(0, 10);

    const oldest = [...userStats]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, 10);

    console.log('✅ Top users calculated with filters');
    return c.json({
      topByTransactions,
      topByBalance,
      topByActivity,
      oldest,
      filtered: sortedStats, // All filtered users in the requested sort order
    });
  } catch (error) {
    console.error('Error getting top users:', error);
    return c.json({ error: 'Error al obtener usuarios destacados' }, 500);
  }
});

// Get detailed metrics for admin dashboard
app.get("/make-server-727b50c3/admin/detailed-metrics", async (c) => {
  try {
    console.log('📊 GET /admin/detailed-metrics - Fetching detailed metrics');
    
    const authResult = await verifySuperUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error listing users:', error);
      return c.json({ error: 'Error al listar usuarios' }, 500);
    }

    // Initialize metrics
    const categoryExpenses: Record<string, { count: number; total: number }> = {};
    const categoryIncome: Record<string, { count: number; total: number }> = {};
    const monthlyData: Record<string, { income: number; expense: number; count: number }> = {};
    const dayOfWeekData: Record<string, { count: number; totalAmount: number }> = {};
    const transactionRanges: Record<string, number> = {
      '0-50k': 0,
      '50k-200k': 0,
      '200k-500k': 0,
      '500k-1M': 0,
      '1M-5M': 0,
      '5M+': 0,
    };

    let totalIncome = 0;
    let totalExpense = 0;
    let totalTransactions = 0;
    let usersWithTransactions = 0;

    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Process each user's transactions
    for (const user of data.users) {
      try {
        // Query SQL table instead of KV Store
        const { data: transactionsData, error: txError } = await supabase
          .from('transactions_727b50c3')
          .select('*')
          .eq('user_id', user.id);

        if (txError) console.error(`Error fetching transactions for user ${user.id}:`, txError);

        const transactions = transactionsData || [];

        if (transactions.length > 0) {
          usersWithTransactions++;
        }

        for (const transaction of transactions) {
          totalTransactions++;
          const amount = transaction.amount || 0;
          const type = transaction.type;
          const category = transaction.category || 'Sin categoría';
          const date = new Date(transaction.date);

          // Track totals
          if (type === 'income') {
            totalIncome += amount;
            
            // Category tracking
            if (!categoryIncome[category]) {
              categoryIncome[category] = { count: 0, total: 0 };
            }
            categoryIncome[category].count++;
            categoryIncome[category].total += amount;
          } else if (type === 'expense') {
            totalExpense += amount;
            
            // Category tracking
            if (!categoryExpenses[category]) {
              categoryExpenses[category] = { count: 0, total: 0 };
            }
            categoryExpenses[category].count++;
            categoryExpenses[category].total += amount;
          }

          // Monthly trends (last 6 months)
          const monthKey = date.toISOString().substring(0, 7); // YYYY-MM
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { income: 0, expense: 0, count: 0 };
          }
          monthlyData[monthKey].count++;
          if (type === 'income') {
            monthlyData[monthKey].income += amount;
          } else if (type === 'expense') {
            monthlyData[monthKey].expense += amount;
          }

          // Day of week patterns
          const dayOfWeek = dayNames[date.getDay()];
          if (!dayOfWeekData[dayOfWeek]) {
            dayOfWeekData[dayOfWeek] = { count: 0, totalAmount: 0 };
          }
          dayOfWeekData[dayOfWeek].count++;
          dayOfWeekData[dayOfWeek].totalAmount += amount;

          // Transaction distribution by amount
          if (amount < 50000) transactionRanges['0-50k']++;
          else if (amount < 200000) transactionRanges['50k-200k']++;
          else if (amount < 500000) transactionRanges['200k-500k']++;
          else if (amount < 1000000) transactionRanges['500k-1M']++;
          else if (amount < 5000000) transactionRanges['1M-5M']++;
          else transactionRanges['5M+']++;
        }
      } catch (parseError) {
        console.error(`Error processing user ${user.id} for metrics:`, parseError);
        continue;
      }
    }

    // Calculate top expense categories
    const topExpenseCategories = Object.entries(categoryExpenses)
      .map(([category, data]) => ({
        category,
        count: data.count,
        total: data.total,
        percentage: totalExpense > 0 ? (data.total / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // Calculate top income categories
    const topIncomeCategories = Object.entries(categoryIncome)
      .map(([category, data]) => ({
        category,
        count: data.count,
        total: data.total,
        percentage: totalIncome > 0 ? (data.total / totalIncome) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // Calculate monthly trends (last 6 months)
    const monthlyTrends = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        balance: data.income - data.expense,
        transactionCount: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months

    // Calculate behavior patterns
    const behaviorPatterns = dayNames.map(day => ({
      dayOfWeek: day,
      transactionCount: dayOfWeekData[day]?.count || 0,
      avgAmount: dayOfWeekData[day] 
        ? dayOfWeekData[day].totalAmount / dayOfWeekData[day].count 
        : 0,
    }));

    // Calculate health indicators
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
    const avgTransactionSize = totalTransactions > 0 ? (totalIncome + totalExpense) / totalTransactions : 0;
    const transactionFrequency = data.users.length > 0 ? totalTransactions / data.users.length : 0;
    const activeUserRate = data.users.length > 0 ? (usersWithTransactions / data.users.length) * 100 : 0;

    // Calculate transaction distribution
    const transactionDistribution = Object.entries(transactionRanges).map(([range, count]) => ({
      range,
      count,
      percentage: totalTransactions > 0 ? (count / totalTransactions) * 100 : 0,
    }));

    const metrics = {
      topExpenseCategories,
      topIncomeCategories,
      monthlyTrends,
      behaviorPatterns,
      healthIndicators: {
        savingsRate,
        expenseRatio,
        avgTransactionSize,
        transactionFrequency,
        activeUserRate,
      },
      transactionDistribution,
    };

    console.log('✅ Detailed metrics calculated');
    return c.json({ metrics });
  } catch (error) {
    console.error('Error getting detailed metrics:', error);
    return c.json({ error: 'Error al obtener métricas detalladas' }, 500);
  }
});

// Toggle user enabled/disabled status
app.post("/make-server-727b50c3/admin/users/:userId/toggle-status", async (c) => {
  try {
    const authResult = await verifySuperUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const userId = c.req.param('userId');

    if (!userId) {
      return c.json({ error: 'User ID es requerido' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Check if user exists
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !userData?.user) {
      console.error('Error getting user:', userError);
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }

    // Toggle status using database.ts helper
    const isNowDisabled = await db.toggleUserDisabled(userId);

    if (isNowDisabled) {
      console.log(`🚫 User DISABLED by admin: ${userId} (${userData.user.email})`);
    } else {
      console.log(`✅ User ENABLED by admin: ${userId} (${userData.user.email})`);
    }

    return c.json({
      success: true,
      userId,
      email: userData.user.email,
      disabled: isNowDisabled,
      message: isNowDisabled 
        ? 'Usuario deshabilitado exitosamente' 
        : 'Usuario habilitado exitosamente'
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    return c.json({ error: 'Error al cambiar el estado del usuario' }, 500);
  }
});

// ADMIN: Clean invalid data for a specific user
app.post("/make-server-727b50c3/admin/clean-invalid-data/:userId", async (c) => {
  try {
    const authResult = await verifySuperUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const userId = c.req.param('userId');

    if (!userId) {
      return c.json({ error: 'User ID es requerido' }, 400);
    }

    console.log(`\n========================================`);
    console.log(`🧹 CLEANING INVALID DATA`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Requested by: ${authResult.email}`);
    console.log(`========================================\n`);

    // Call the cleanup function
    const result = await db.cleanInvalidUserData(userId);

    console.log(`\n========================================`);
    console.log(`✅ CLEANUP COMPLETED`);
    console.log(`   Deleted Accounts: ${result.deletedAccounts}`);
    console.log(`   Deleted Categories: ${result.deletedCategories}`);
    console.log(`   Deleted Subcategories: ${result.deletedSubcategories}`);
    console.log(`   Deleted Transactions: ${result.deletedTransactions}`);
    console.log(`   Deleted Budgets: ${result.deletedBudgets}`);
    console.log(`========================================\n`);

    return c.json({
      success: true,
      userId,
      result,
      message: 'Datos inválidos eliminados exitosamente'
    });
  } catch (error) {
    console.error('❌ Error cleaning invalid data:', error);
    console.error('   Error details:', error instanceof Error ? error.message : String(error));
    console.error('   Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return c.json({ error: 'Error al limpiar datos inválidos' }, 500);
  }
});

// ADMIN: Complete user cleanup - Delete all user data (Postgres + Auth)
app.delete("/make-server-727b50c3/admin/users/cleanup/:email", async (c) => {
  try {
    const authResult = await verifySuperUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const email = c.req.param('email');

    if (!email) {
      return c.json({ error: 'Email es requerido' }, 400);
    }

    console.log(`\n========================================`);
    console.log(`🗑️  COMPLETE USER CLEANUP REQUEST`);
    console.log(`========================================\n`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // 1. Find user in Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      return c.json({ error: 'Error al buscar usuario' }, 500);
    }
    
    const user = users?.find(u => u.email === email);
    
    let authDeleted = false;
    let postgresDeleted = false;
    
    // 2. Delete from Postgres (if user ID exists)
    if (user) {
      console.log(`📝 User found in Auth: ${user.id}`);
      
      try {
        await db.deleteAllUserData(user.id);
        postgresDeleted = true;
        console.log(`✅ All Postgres data deleted for user: ${user.id}`);
      } catch (error) {
        console.error('❌ Error deleting Postgres data:', error);
        // Continue to try deleting from Auth anyway
      }
      
      // 3. Delete from Supabase Auth
      try {
        console.log(`🗑️  Attempting to delete user from Auth...`);
        // Use shouldSoftDelete: false to ensure complete removal
        const { error: deleteError } = await supabase.auth.admin.deleteUser(
          user.id,
          false // shouldSoftDelete = false (hard delete)
        );
        
        if (deleteError) {
          console.error('❌ Error deleting user from Auth:', deleteError);
          console.error('   Error message:', deleteError.message);
          console.error('   Error code:', deleteError.code);
          console.error('   Error status:', deleteError.status);
          
          // Don't return error - report what was deleted
          authDeleted = false;
        } else {
          authDeleted = true;
          console.log(`✅ User deleted from Supabase Auth: ${user.id}`);
        }
      } catch (error) {
        console.error('❌ Unexpected error deleting user from Auth:', error);
        console.error('   Error details:', error instanceof Error ? error.message : String(error));
        console.error('   Stack trace:', error instanceof Error ? error.stack : 'N/A');
        authDeleted = false;
      }
    } else {
      console.log(`⚠️  User NOT found in Supabase Auth: ${email}`);
      
      // Try to find orphaned data in Postgres by searching all users
      console.log(`🔍 Searching for orphaned Postgres data...`);
      
      // We can't directly find the user_id without Auth data
      // But we can report that no user was found
    }
    
    console.log(`\n========================================`);
    console.log(`🎉 CLEANUP COMPLETED`);
    console.log(`   Auth deleted: ${authDeleted ? 'YES' : 'NO (not found or error)'}`);
    console.log(`   Postgres deleted: ${postgresDeleted ? 'YES' : 'NO (not found or error)'}`);
    console.log(`========================================\n`);

    return c.json({
      success: true,
      email,
      authDeleted,
      postgresDeleted,
      message: authDeleted 
        ? '��� Usuario y todos sus datos eliminados completamente. Ahora puedes registrarte de nuevo desde cero.' 
        : postgresDeleted
          ? '⚠️ Datos de Postgres eliminados pero falló eliminación de Auth. Ve a Authentication en Supabase y elimina manualmente el usuario.'
          : '⚠️ No se encontró el usuario en Auth. Verifica que el email sea correcto.',
    });
  } catch (error) {
    console.error('❌ Error in complete user cleanup:', error);
    console.error('   Error details:', error instanceof Error ? error.message : String(error));
    console.error('   Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return c.json({ error: 'Error al limpiar usuario' }, 500);
  }
});

// Delete a user by email (for testing/debugging only)
app.delete("/make-server-727b50c3/dev/users/:email", async (c) => {
  try {
    const email = c.req.param('email');

    if (!email) {
      return c.json({ error: 'Email es requerido' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // First, find the user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return c.json({ error: 'Error al buscar usuario' }, 500);
    }

    const user = users.find(u => u.email === email);

    if (!user) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }

    console.log(`Deleting user and all associated data: ${email} (${user.id})`);

    // Step 1: Delete all user data using the centralized function
    await db.deleteAllUserData(user.id);
    
    console.log(`✓ Deleted user's all data (Postgres, devices, notifications, KV store)`);

    // Step 2: Delete the user from Auth
    // Use shouldSoftDelete: false to ensure complete removal
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      user.id,
      false // shouldSoftDelete = false (hard delete)
    );

    if (deleteError) {
      console.error('Error deleting user from Auth:', deleteError);
      console.error('Error details:', JSON.stringify(deleteError, null, 2));
      return c.json({ 
        error: 'Error al eliminar usuario de Auth', 
        details: deleteError.message,
        code: deleteError.code || 'unknown'
      }, 500);
    }

    console.log(`✓ User deleted from Auth: ${email} (${user.id})`);

    return c.json({ 
      message: 'Usuario y sus datos eliminados exitosamente',
      email: email,
      id: user.id,
      deletedData: {
        message: 'All user data deleted (transactions, budgets, accounts, categories, devices, notifications, KV store)'
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return c.json({ 
      error: 'Error al eliminar usuario',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ====================
// CATEGORIES ENDPOINTS
// ====================

// Helper function to verify user authentication
async function verifyUser(authHeader: string | undefined) {
  const accessToken = authHeader?.split(' ')[1];
  
  if (!accessToken) {
    console.log('🔒 verifyUser: No access token in header');
    return { error: 'No autorizado', status: 401 };
  }

  console.log('🔑 verifyUser: Token present, length:', accessToken.length);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error) {
      console.error('🔒 verifyUser: getUser error:', error.message, 'Status:', error.status);
    }

    // Check for specific error: user_not_found
    if (error) {
      // Handle deleted user case specifically (this is an expected case, not an error)
      if (error.status === 403 && error.code === 'user_not_found') {
        console.log('🔒 Auth rejected: User from token does not exist (stale token)');
        return { 
          error: 'Usuario no encontrado. Tu sesión es inválida. Por favor inicia sesión nuevamente.', 
          status: 401,
          userNotFound: true // Special flag for frontend to handle
        };
      }
      
      // Other auth errors
      console.log('🔒 Auth rejected: Invalid session');
      return { error: 'Sesión inválida', status: 401 };
    }
    
    if (!user) {
      console.log('🔒 Auth rejected: No user found');
      return { error: 'Sesión inválida', status: 401 };
    }

    console.log('✅ verifyUser: Success - User ID:', user.id);
    return { userId: user.id, email: user.email ?? '' };
  } catch (error) {
    // Only log unexpected errors
    console.error('❌ Unexpected error in verifyUser:', error);
    return { error: 'Error de autenticación', status: 401 };
  }
}

// Clean invalid data for the authenticated user (self-service)
app.post("/make-server-727b50c3/user/clean-invalid-data", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId } = authResult;

    console.log(`🧹 User ${userId} requested data cleanup`);

    // Call the cleanup function
    const result = await db.cleanInvalidUserData(userId);

    console.log(`✅ Cleanup complete for user ${userId}:`, result);

    return c.json({
      success: true,
      result,
      message: 'Datos inválidos eliminados exitosamente'
    });
  } catch (error) {
    console.error('❌ Error cleaning invalid data:', error);
    return c.json({ error: 'Error al limpiar datos inválidos' }, 500);
  }
});

// Get all categories for the authenticated user
app.get("/make-server-727b50c3/categories", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId } = authResult;

    console.log(`Getting categories for user: ${userId}`);

    // Leer directamente de Postgres
    const categoriesData = await db.getCategories(userId);
    
    // Transform snake_case to camelCase for subcategories
    const categories = categoriesData.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      type: cat.type,
      icon: cat.icon,
      color: cat.color,
      emoji: cat.emoji,
      subcategories: (cat.subcategories_727b50c3 || []).map((sub: any) => ({
        id: sub.id,
        categoryId: sub.category_id,
        name: sub.name,
        emoji: sub.emoji,
      })),
    }));

    return c.json({ categories });
  } catch (error) {
    console.error('Error getting categories:', error);
    return c.json({ error: 'Error al obtener categor��as' }, 500);
  }
});

// Save/update categories for the authenticated user
app.post("/make-server-727b50c3/categories", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId } = authResult;
    const body = await c.req.json();
    const { categories } = body;

    if (!categories || !Array.isArray(categories)) {
      return c.json({ error: 'Categorías inválidas' }, 400);
    }

    const key = `user:${userId}:categories`;

    console.log(`📥 Saving ${categories.length} categories for user: ${userId}`);

    // ✅ NUEVO: Obtener categorías existentes y determinar cuáles borrar
    const existingCategories = await db.getCategories(userId);
    const categoryIdsToKeep = new Set(categories.map(c => c.id));
    const categoriesToDelete = existingCategories.filter(c => !categoryIdsToKeep.has(c.id));

    console.log(`   📊 Categories summary:`);
    console.log(`      - Existing in DB: ${existingCategories.length}`);
    console.log(`      - Received from client: ${categories.length}`);
    console.log(`      - To delete: ${categoriesToDelete.length}`);

    // Borrar categorías que ya no están en el array recibido
    for (const cat of categoriesToDelete) {
      console.log(`   🗑️  Deleting category: ${cat.name} (${cat.id})`);
      await db.deleteCategory(cat.id, userId);
    }

    // Use UPSERT for all categories (createCategory now uses UPSERT)
    for (const cat of categories) {
      console.log(`  💾 Saving category: ${cat.name} (${cat.id})`);
      await db.createCategory({
        id: cat.id,
        user_id: userId,
        name: cat.name,
        type: cat.type,
        icon: cat.icon || null,
        color: cat.color || '#6b7280',
        emoji: cat.emoji || null,
      });

      // ✅ PRIMERO: Borrar todas las subcategorías existentes de esta categoría
      // Esto previene errores de duplicado con la restricción unique (category_id, name)
      await db.deleteSubcategoriesByCategoryId(cat.id);

      // Create/update subcategories if they exist
      if (cat.subcategories && Array.isArray(cat.subcategories)) {
        console.log(`    📂 Saving ${cat.subcategories.length} subcategories for ${cat.name}`);
        for (const sub of cat.subcategories) {
          await db.createSubcategory({
            id: sub.id || crypto.randomUUID(),
            category_id: cat.id,
            name: sub.name || sub,
            // ⚠️ NO guardamos emoji porque la tabla en BD no tiene esa columna
            // Los emojis se agregan en el frontend después de cargar desde BD
          });
        }
      }
    }

    console.log(`✅ Categories saved to Postgres: ${categories.length} categories, ${categoriesToDelete.length} deleted`);

    return c.json({ 
      message: 'Categorías guardadas exitosamente',
      categories,
    });
  } catch (error) {
    console.error('Error saving categories:', error);
    return c.json({ error: 'Error al guardar categorías' }, 500);
  }
});

// Delete a specific category
app.delete("/make-server-727b50c3/categories/:categoryKey", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId } = authResult;
    const categoryKey = c.req.param('categoryKey');

    if (!categoryKey) {
      return c.json({ error: 'Category key es requerida' }, 400);
    }

    console.log(`Deleting category ${categoryKey} for user: ${userId}`);

    // Eliminar de Postgres
    await db.deleteCategory(categoryKey, userId);

    // Obtener categorías actualizadas
    const categories = await db.getCategories(userId);

    console.log(`✅ Category deleted from Postgres: ${categoryKey}`);

    return c.json({ 
      message: 'Categoría eliminada exitosamente',
      categories,
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return c.json({ error: 'Error al eliminar categoría' }, 500);
  }
});

// Delete ALL categories for a user (used for reset)
app.delete("/make-server-727b50c3/categories", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId } = authResult;

    console.log(`🗑️ Deleting ALL categories for user: ${userId}`);

    // Get all categories for this user
    const categories = await db.getCategories(userId);
    console.log(`Found ${categories.length} categories to delete`);

    // Delete each category using the existing deleteCategory function
    for (const category of categories) {
      try {
        await db.deleteCategory(category.id, userId);
        console.log(`✅ Deleted category: ${category.name} (${category.id})`);
      } catch (error) {
        console.error(`❌ Error deleting category ${category.id}:`, error);
        // Continue with next category even if one fails
      }
    }

    console.log(`✅ All categories deleted for user: ${userId}`);

    return c.json({ 
      message: 'Todas las categorías eliminadas exitosamente',
      categories: [],
      deleted: categories.length
    });
  } catch (error: any) {
    console.error('Error deleting all categories:', error);
    return c.json({ error: `Error al eliminar categorías: ${error?.message || error}` }, 500);
  }
});

// ====================
// ACCOUNTS ENDPOINTS
// ====================

// Get all accounts for the authenticated user
app.get("/make-server-727b50c3/accounts", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId } = authResult;

    console.log(`Getting accounts for user: ${userId}`);

    // Leer directamente de Postgres
    const accounts = await db.getAccounts(userId);

    return c.json({ accounts });
  } catch (error) {
    console.error('Error getting accounts:', error);
    return c.json({ error: 'Error al obtener cuentas' }, 500);
  }
});

// Save/update accounts for the authenticated user
app.post("/make-server-727b50c3/accounts", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId } = authResult;
    const body = await c.req.json();
    const { accounts } = body;

    if (!accounts || !Array.isArray(accounts)) {
      return c.json({ error: 'Cuentas inválidas' }, 400);
    }

    console.log(`📤 POST /accounts - Saving ${accounts.length} accounts for user: ${userId.substring(0, 8)}...`);

    // Get existing accounts to determine deletions
    const { data: existingAccountsRaw } = await (createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    ))
      .from('accounts_727b50c3')
      .select('id, name')
      .eq('user_id', userId);
    
    const existingAccounts = existingAccountsRaw || [];
    const accountIdsToKeep = new Set(accounts.map((a: any) => a.id));
    const accountsToDelete = existingAccounts.filter(a => !accountIdsToKeep.has(a.id));

    console.log(`   📊 Summary: ${existingAccounts.length} existing, ${accounts.length} received, ${accountsToDelete.length} to delete`);

    // Delete accounts no longer in the list
    for (const acc of accountsToDelete) {
      console.log(`   🗑️  Deleting: ${acc.name}`);
      await db.deleteAccount(acc.id, userId);
    }

    // ✅ SIMPLIFICADO: Solo guardar metadata (name, type, icon, color)
    // El balance se calcula en GET /accounts desde las transacciones
    console.log(`   💾 Saving metadata only (balances calculated on GET)`);
    
    for (const acc of accounts) {
      await db.createAccount({
        id: acc.id,
        user_id: userId,
        name: acc.name,
        type: acc.type,
        balance: 0,  // ✅ Cache - se recalcula en GET
        icon: acc.icon ?? null,
        color: acc.color ?? '#3b82f6',
      });
    }

    console.log(`✅ Accounts saved: ${accounts.length} accounts`);

    return c.json({ 
      message: 'Cuentas guardadas exitosamente',
      accounts,
    });
  } catch (error) {
    console.error('❌ Error saving accounts:', error);
    console.error('   Error details:', error instanceof Error ? error.message : String(error));
    console.error('   Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return c.json({ error: 'Error al guardar cuentas' }, 500);
  }
});

// Delete a specific account
app.delete("/make-server-727b50c3/accounts/:accountId", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId } = authResult;
    const accountId = c.req.param('accountId');

    if (!accountId) {
      return c.json({ error: 'Account ID es requerido' }, 400);
    }

    console.log(`Deleting account ${accountId} for user: ${userId}`);

    // Eliminar de Postgres
    await db.deleteAccount(accountId, userId);

    // Obtener cuentas actualizadas
    const accounts = await db.getAccounts(userId);

    console.log(`✅ Account deleted from Postgres: ${accountId}`);

    return c.json({ 
      message: 'Cuenta eliminada exitosamente',
      accounts,
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return c.json({ error: 'Error al eliminar cuenta' }, 500);
  }
});

// ====================
// TRANSACTIONS ENDPOINTS
// ====================

/**
 * Helper function to map DB transaction format to frontend format
 * ✅ FIX v2.6: Map database field names to frontend field names
 */
function mapDbTransactionToFrontend(tx: any) {
  return {
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    category: tx.category_id || undefined,
    subcategory: tx.subcategory_id || undefined,
    account: tx.account_id ?? undefined, // ✅ Map account_id -> account
    toAccount: tx.to_account_id || undefined, // ✅ Map to_account_id -> toAccount
    date: tx.date,
    note: tx.description || undefined,
    receiptUrl: tx.receipt_url || undefined, // ✨ Map receipt_url -> receiptUrl
    tags: tx.tags || [],
    createdAt: tx.created_at,
    updatedAt: tx.updated_at,
  };
}

// Get all transactions for the authenticated user
app.get("/make-server-727b50c3/transactions", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId, email } = authResult;
    const limitParam = c.req.query('limit');
    const offsetParam = c.req.query('offset');
    const orderBy = c.req.query('orderBy');
    const orderDirection = c.req.query('orderDirection');

    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const offset = offsetParam ? parseInt(offsetParam, 10) : undefined;

    const transactionOptions = {
      limit: Number.isFinite(limit) && limit! > 0 ? limit : undefined,
      offset: Number.isFinite(offset) && offset! >= 0 ? offset : undefined,
    };

    console.log(`\n========================================`);
    console.log(`📥 GET TRANSACTIONS REQUEST`);
    console.log(`   User: ${email}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Query params:`, {
      limit: transactionOptions.limit ?? null,
      offset: transactionOptions.offset ?? null,
      orderBy: orderBy || null,
      orderDirection: orderDirection || null,
    });
    console.log(`========================================`);

    // Leer directamente de Postgres
    const dbTransactions = await db.getTransactions(userId, transactionOptions);

    console.log(`✅ Retrieved ${dbTransactions.length} transactions from database`);
    if (dbTransactions.length > 0) {
      console.log(`   📊 First transaction: ${dbTransactions[0].id.substring(0, 8)}...`);
      console.log(`   📊 Last transaction: ${dbTransactions[dbTransactions.length - 1].id.substring(0, 8)}...`);
    } else {
      console.log(`   ⚠️  No transactions found for user ${userId}`);
    }
    console.log(`========================================\n`);

    // Mapear campos de DB a formato frontend
    const transactions = dbTransactions.map(mapDbTransactionToFrontend);
    
    // ✅ DEBUG: Log para verificar que el mapeo funciona correctamente [v2.6]
    if (transactions.length > 0) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🟡 [STEP 9] SERVER - Mapping DB format to frontend format`);
      console.log(`🟡 After mapping, first transaction:`, {
        id: transactions[0].id?.substring(0, 8) + '...',
        account: transactions[0].account || 'MISSING ❌',
        toAccount: transactions[0].toAccount || null,
        category: transactions[0].category || null,
      });
      console.log(`🟡 CRITICAL: Mapped "account" field exists?`, {
        hasAccountField: 'account' in transactions[0],
        accountValue: transactions[0].account,
      });
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    }

    return c.json({ transactions });
  } catch (error) {
    console.error('❌ Error getting transactions:', error);
    console.error('   Stack:', error instanceof Error ? error.stack : 'N/A');
    return c.json({ error: 'Error al obtener transacciones' }, 500);
  }
});

// Save/update transactions for the authenticated user
app.post("/make-server-727b50c3/transactions", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId } = authResult;
    const body = await c.req.json();
    const { transactions } = body;

    if (!transactions || !Array.isArray(transactions)) {
      return c.json({ error: 'Transacciones inválidas' }, 400);
    }

    console.log(`Saving ${transactions.length} transactions for user: ${userId}`);

    // ✅ NUEVO: Log detallado de la primera transacción recibida
    if (transactions.length > 0) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🟢 [STEP 5] SERVER - Received transactions from frontend`);
      console.log(`🟢 First transaction received:`, {
        id: transactions[0].id.substring(0, 8) + '...',
        account: transactions[0].account || 'MISSING ❌',
        toAccount: transactions[0].toAccount || null,
        category: transactions[0].category || null,
        amount: transactions[0].amount,
        type: transactions[0].type,
      });
      console.log(`🟢 CRITICAL: Server received "account" field?`, {
        hasAccountField: 'account' in transactions[0],
        accountValue: transactions[0].account,
        accountIsNull: transactions[0].account === null,
        accountIsUndefined: transactions[0].account === undefined,
      });
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    }

    // ✅ VALIDACIÓN: Obtener categorías y subcategorías válidas para este usuario
    const userCategories = await db.getCategories(userId);
    const validCategoryIds = new Set(userCategories.map(c => c.id));
    const validSubcategoryIds = new Set(
      userCategories.flatMap(c => 
        (c.subcategories_727b50c3 || []).map((sub: any) => sub.id)
      )
    );

    console.log(`   📊 User has ${validCategoryIds.size} valid categories and ${validSubcategoryIds.size} valid subcategories`);
    console.log(`   📊 Valid category IDs:`, Array.from(validCategoryIds));

    // ✅ FIX CRÍTICO: Obtener cuentas del usuario y crear mapa de IDs antiguos → nuevos
    // Esto soluciona el bug donde las transacciones tienen IDs hardcodeados (ac111111-...)
    // pero las cuentas en BD tienen IDs generados por Supabase (1e95ab3f-...)
    const userAccounts = await db.getAccounts(userId);
    const accountNameToIdMap: Record<string, string> = {};
    const oldIdToNewIdMap: Record<string, string> = {};
    
    // IDs hardcodeados de cuentas default (usados en transacciones antiguas)
    const defaultAccountIds: Record<string, string> = {
      'ac111111-0000-4000-a000-000000000001': 'Efectivo',
      'ac111111-0000-4000-a000-000000000002': 'Bancolombia',
      'ac111111-0000-4000-a000-000000000003': 'Falabella',
      'ac111111-0000-4000-a000-000000000004': 'BBVA',
      'ac111111-0000-4000-a000-000000000005': 'Nequi',
      'ac111111-0000-4000-a000-000000000006': 'DaviPlata',
      'ac111111-0000-4000-a000-000000000007': 'Tarjeta de Crédito',
    };
    
    // Crear mapa nombre → ID real de la BD
    userAccounts.forEach(acc => {
      accountNameToIdMap[acc.name.toLowerCase()] = acc.id;
    });
    
    // Crear mapa ID antiguo → ID nuevo
    Object.entries(defaultAccountIds).forEach(([oldId, accountName]) => {
      const normalizedName = accountName.toLowerCase();
      // Buscar cuenta con nombre similar
      for (const [name, newId] of Object.entries(accountNameToIdMap)) {
        if (name.includes(normalizedName) || normalizedName.includes(name)) {
          oldIdToNewIdMap[oldId] = newId;
          break;
        }
      }
    });
    
    console.log(`   🔄 Account ID remapping:`, oldIdToNewIdMap);
    
    // ✅ REMAP: Actualizar IDs de cuentas en las transacciones recibidas
    const remappedTransactions = transactions.map(tx => {
      const remapped = { ...tx };
      
      // Remap account ID
      if (remapped.account && oldIdToNewIdMap[remapped.account]) {
        console.log(`   🔄 Remapping account ${remapped.account.substring(0, 8)}... → ${oldIdToNewIdMap[remapped.account].substring(0, 8)}...`);
        remapped.account = oldIdToNewIdMap[remapped.account];
      }
      
      // Remap toAccount ID (para transferencias)
      if (remapped.toAccount && oldIdToNewIdMap[remapped.toAccount]) {
        console.log(`   🔄 Remapping toAccount ${remapped.toAccount.substring(0, 8)}... → ${oldIdToNewIdMap[remapped.toAccount].substring(0, 8)}...`);
        remapped.toAccount = oldIdToNewIdMap[remapped.toAccount];
      }
      
      return remapped;
    });

    // Obtener transacciones existentes de Postgres
    const existingTransactions = await db.getTransactions(userId);
    const existingIds = new Set(existingTransactions.map(t => t.id));

    const newTransactions = remappedTransactions.filter(t => !existingIds.has(t.id));
    const updatedTransactions = remappedTransactions.filter(t => existingIds.has(t.id));
    
    // ✅ NUEVO: Identificar transacciones a BORRAR (están en BD pero NO en el array recibido)
    const transactionIdsToKeep = new Set(remappedTransactions.map(t => t.id));
    const transactionsToDelete = existingTransactions.filter(t => !transactionIdsToKeep.has(t.id));

    console.log(`   📊 Transactions summary:`);
    console.log(`      - Existing in DB: ${existingTransactions.length}`);
    console.log(`      - Received from client: ${transactions.length}`);
    console.log(`      - New to create: ${newTransactions.length}`);
    console.log(`      - To update: ${updatedTransactions.length}`);
    console.log(`      - To delete: ${transactionsToDelete.length}`);

    // ✅ Función helper para limpiar referencias inválidas
    // ⚠️ DESHABILITADO TEMPORALMENTE: NO limpiar categorías durante el guardado
    // Las categorías pueden crearse después de las transacciones, especialmente en el primer login
    const cleanTransactionReferences = (tx: any) => {
      const cleaned = { ...tx };
      
      console.log(`   🔍 Processing transaction ${tx.id.substring(0, 8)} with category: ${tx.category || 'NONE'}, account: ${tx.account || 'NONE'}`);
      
      // ❌ DESHABILITADO: NO limpiar categorías durante el guardado
      // El problema es que las categorías se guardan DESPUÉS de las transacciones en el primer login
      // Esto causaba que todas las transacciones perdieran sus categorías
      /*
      // Limpiar categoría si no existe
      if (cleaned.category && !validCategoryIds.has(cleaned.category)) {
        console.log(`   🧹 Cleaning invalid category ${cleaned.category.substring(0, 8)} from transaction ${cleaned.id.substring(0, 8)}`);
        cleaned.category = null;
        cleaned.subcategory = null; // Si la categoría no existe, la subcategoría tampoco
      }
      
      // Limpiar subcategoría si no existe
      if (cleaned.subcategory && !validSubcategoryIds.has(cleaned.subcategory)) {
        console.log(`   🧹 Cleaning invalid subcategory ${cleaned.subcategory.substring(0, 8)} from transaction ${cleaned.id.substring(0, 8)}`);
        cleaned.subcategory = null;
      }
      */
      
      return cleaned;
    };

    // Insertar nuevas (con limpieza)
    for (const tx of newTransactions) {
      const cleanedTx = cleanTransactionReferences(tx);
      
      // ✅ FIX: Log para debug - ver qué valores tienen los campos
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`   🟣 [STEP 6] Inserting NEW transaction to DB`);
      console.log(`   🟣 Transaction ID: ${cleanedTx.id.substring(0, 8)}...`);
      console.log(`   🟣 Frontend field "account": ${cleanedTx.account || 'MISSING ❌'}`);
      console.log(`   🟣 Will map to DB field "account_id": ${cleanedTx.account ?? 'null'}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      
      await db.createTransaction({
        id: cleanedTx.id,
        user_id: userId,
        account_id: cleanedTx.account ?? null, // ✅ Map frontend field -> DB field
        category_id: cleanedTx.category ?? null,
        subcategory_id: cleanedTx.subcategory ?? null,
        to_account_id: cleanedTx.toAccount ?? null,
        type: cleanedTx.type,
        amount: cleanedTx.amount,
        date: cleanedTx.date,
        description: cleanedTx.note ?? null,
        receipt_url: cleanedTx.receiptUrl ?? null, // ✨ Comprobante adjunto
        tags: cleanedTx.tags || [],
      });
    }

    // Actualizar existentes (con limpieza)
    for (const tx of updatedTransactions) {
      const cleanedTx = cleanTransactionReferences(tx);
      
      // ✅ FIX: Log para debug - ver qué valores tienen los campos
      console.log(`   🔄 Updating transaction ${cleanedTx.id.substring(0, 8)} with account: ${cleanedTx.account || 'NONE'}`);
      
      await db.updateTransaction(cleanedTx.id, userId, {
        account_id: cleanedTx.account ?? null, // ✅ Map frontend field -> DB field
        category_id: cleanedTx.category ?? null,
        subcategory_id: cleanedTx.subcategory ?? null,
        to_account_id: cleanedTx.toAccount ?? null,
        type: cleanedTx.type,
        amount: cleanedTx.amount,
        date: cleanedTx.date,
        description: cleanedTx.note ?? null,
        receipt_url: cleanedTx.receiptUrl ?? null, // ✨ Comprobante adjunto
        tags: cleanedTx.tags || [],
      });
    }

    // ✅ NUEVO: Borrar transacciones que ya no están en el array recibido
    for (const tx of transactionsToDelete) {
      console.log(`   🗑️  Deleting transaction ${tx.id.substring(0, 8)}...`);
      await db.deleteTransaction(tx.id, userId);
    }

    console.log(`✅ Transactions saved to Postgres: ${newTransactions.length} new, ${updatedTransactions.length} updated, ${transactionsToDelete.length} deleted`);

    return c.json({ 
      message: 'Transacciones guardadas exitosamente',
      transactions,
    });
  } catch (error) {
    console.error('❌ Error saving transactions:', error);
    console.error('   Error details:', error instanceof Error ? error.message : String(error));
    console.error('   Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return c.json({ error: 'Error al guardar transacciones' }, 500);
  }
});

// Delete a specific transaction
app.delete("/make-server-727b50c3/transactions/:transactionId", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId } = authResult;
    const transactionId = c.req.param('transactionId');

    if (!transactionId) {
      return c.json({ error: 'Transaction ID es requerido' }, 400);
    }

    console.log(`Deleting transaction ${transactionId} for user: ${userId}`);

    // Eliminar de Postgres
    await db.deleteTransaction(transactionId, userId);

    // Obtener transacciones actualizadas
    const dbTransactions = await db.getTransactions(userId);
    
    // Mapear campos de DB a formato frontend
    const transactions = dbTransactions.map(mapDbTransactionToFrontend);

    console.log(`��� Transaction deleted from Postgres: ${transactionId}`);

    return c.json({ 
      message: 'Transacción eliminada exitosamente',
      transactions: transactions,
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return c.json({ error: 'Error al eliminar transacción' }, 500);
  }
});

// ====================
// BUDGETS ENDPOINTS
// ====================

// Get all budgets for the authenticated user
app.get("/make-server-727b50c3/budgets", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId } = authResult;

    console.log(`Getting budgets for user: ${userId}`);

    // Leer directamente de Postgres
    const budgets = await db.getBudgets(userId);

    // Transform snake_case to camelCase for frontend
    const transformedBudgets = budgets.map(b => ({
      id: b.id,
      categoryId: b.category_id,
      amount: b.amount,
      period: b.period,
      month: b.month ?? null,           // ✨ NEW: Include month field
      year: b.year ?? null,             // ✨ NEW: Include year field
      alertThreshold: b.alert_threshold ?? 80, // Default to 80 if undefined
    }));

    return c.json({ budgets: transformedBudgets });
  } catch (error) {
    console.error('Error getting budgets:', error);
    return c.json({ error: 'Error al obtener presupuestos' }, 500);
  }
});

// Save/update budgets for the authenticated user
app.post("/make-server-727b50c3/budgets", async (c) => {
  try {
    console.log('========================================');
    console.log('💾 POST /budgets REQUEST');
    console.log('========================================');
    
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      console.error('❌ Authorization failed in POST /budgets:', authResult.error);
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId } = authResult;
    const body = await c.req.json();
    const { budgets } = body;

    console.log(`User ID: ${userId}`);
    console.log(`Budgets received from client: ${budgets?.length || 0}`);

    if (!budgets || !Array.isArray(budgets)) {
      console.error('❌ Invalid budgets - not an array');
      return c.json({ error: 'Presupuestos inválidos' }, 400);
    }

    const key = `user:${userId}:budgets`;

    console.log(`Saving ${budgets.length} budgets for user: ${userId}`);

    // ✅ FIX: Si se recibe array vacío, NO borrar todos los presupuestos
    // Solo procesar si hay presupuestos para guardar
    if (budgets.length === 0) {
      console.log(`⚠️ Received empty budgets array - skipping (to avoid accidental deletion)`);
      return c.json({ 
        message: 'No budgets to save',
        budgets: await db.getBudgets(userId), // Return existing budgets
      });
    }

    // ✅ NUEVO: Obtener presupuestos existentes y determinar cuáles borrar
    const existingBudgets = await db.getBudgets(userId);
    const budgetIdsToKeep = new Set(budgets.map(b => b.id));
    const budgetsToDelete = existingBudgets.filter(b => !budgetIdsToKeep.has(b.id));

    console.log(`   📊 Budgets summary:`);
    console.log(`      - Existing in DB: ${existingBudgets.length}`);
    console.log(`      - Received from client: ${budgets.length}`);
    console.log(`      - To delete: ${budgetsToDelete.length}`);

    // ✅ IMPORTANTE: Solo borrar si realmente hay presupuestos nuevos (no array vacío)
    // Borrar presupuestos que ya no están en el array recibido
    for (const budget of budgetsToDelete) {
      console.log(`   🗑️  Deleting budget: ${budget.id}`);
      await db.deleteBudget(budget.id, userId);
    }

    // Use UPSERT for all budgets (createBudget now uses UPSERT)
    // This automatically handles both new budgets and updates to existing ones
    for (const budget of budgets) {
      // ✅ FIX: Log para debug - ver datos de cada presupuesto
      console.log(`   💾 Saving budget ${budget.id.substring(0, 8)}: categoryId = ${budget.categoryId}, amount = ${budget.amount}, period = ${budget.period}, month = ${budget.month ?? 'null'}, year = ${budget.year ?? 'null'}`);
      
      await db.createBudget({
        id: budget.id,
        user_id: userId,
        category_id: budget.categoryId,
        amount: budget.amount,
        period: budget.period ?? 'monthly', // ✅ FIX: Use ?? to preserve valid values
        month: budget.month ?? null,         // ✨ NEW: Map month field
        year: budget.year ?? null,           // ✨ NEW: Map year field
        alert_threshold: budget.alertThreshold ?? 80, // ✅ FIX: Use ?? to preserve valid values
      });
    }

    console.log(`✅ Budgets saved to Postgres: ${budgets.length} budgets (upserted), ${budgetsToDelete.length} deleted`);

    return c.json({ 
      message: 'Presupuestos guardados exitosamente',
      budgets,
    });
  } catch (error) {
    console.error('❌ Error saving budgets:', error);
    console.error('   Error details:', error instanceof Error ? error.message : String(error));
    
    // Check if error is related to missing columns (migration not run)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('column') && (errorMessage.includes('month') || errorMessage.includes('year'))) {
      return c.json({ 
        error: '⚠️ MIGRACIÓN REQUERIDA: Las columnas month/year no existen en la tabla budgets. Por favor ejecuta el archivo /sql-migrations/07-budgets-month-year-SAFE.sql en Supabase SQL Editor.' 
      }, 500);
    }
    
    return c.json({ 
      error: `Error al guardar presupuestos: ${errorMessage}` 
    }, 500);
  }
});

// Delete a specific budget
app.delete("/make-server-727b50c3/budgets/:budgetId", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId } = authResult;
    const budgetId = c.req.param('budgetId');

    if (!budgetId) {
      return c.json({ error: 'Budget ID es requerido' }, 400);
    }

    console.log(`Deleting budget ${budgetId} for user: ${userId}`);

    // Eliminar de Postgres
    await db.deleteBudget(budgetId, userId);

    // Obtener presupuestos actualizados
    const budgets = await db.getBudgets(userId);

    console.log(`✅ Budget deleted from Postgres: ${budgetId}`);

    return c.json({ 
      message: 'Presupuesto eliminado exitosamente',
      budgets,
    });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return c.json({ error: 'Error al eliminar presupuesto' }, 500);
  }
});

// ====================
// DATA MIGRATION ENDPOINT
// ====================
// LEGACY MIGRATION ENDPOINTS (DISABLED - No longer needed after full SQL migration)
// ====================

// LEGACY ENDPOINT DISABLED: This endpoint migrated KV to KV format
// All data is now in SQL tables with _727b50c3 suffix, so this is no longer needed
// Kept commented for historical reference

// ====================
// AI ENDPOINTS
// ====================

// Analyze bank statement endpoint
app.post("/make-server-727b50c3/analyze-bank-statement", async (c) => {
  try {
    // Get form data
    const formData = await c.req.formData();
    const files = formData.getAll('files[]') as File[];
    const accountId = formData.get('accountId') as string;

    if (!files.length || !accountId) {
      return c.json({ error: 'Missing files or accountId' }, 400);
    }

    console.log(`Analyzing ${files.length} bank statement(s)`);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    // Process all files
    const allTransactions = [];

    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
      const file = files[fileIndex];
      console.log(`Processing file ${fileIndex + 1}/${files.length}: ${file.name}, size: ${file.size}`);

      // Convert file to base64 for OpenAI
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Convert to base64 in chunks to avoid call stack overflow
      let base64 = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        base64 += String.fromCharCode(...chunk);
      }
      base64 = btoa(base64);
      
      const fileType = file.type;
      const isImage = fileType.startsWith('image/');

      if (!isImage) {
        console.log(`Skipping non-image file: ${file.name}`);
        continue;
      }

      // Use GPT-4 Vision for images
      const imageUrl = `data:${fileType};base64,${base64}`;
      
      const openaiResponse = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analiza este extracto bancario y extrae todas las transacciones. Para cada transacción, identifica:
- Fecha (formato YYYY-MM-DD)
- Descripción
- Monto (solo el número, sin símbolos)
- Tipo: "income" para ingresos/depósitos/abonos o "expense" para gastos/cargos/retiros

Responde ÚNICAMENTE con un JSON válido en este formato exacto:
{
  "transactions": [
    {
      "date": "2025-11-05",
      "description": "Pago salario",
      "amount": 2500000,
      "type": "income"
    }
  ]
}

Si no encuentras transacciones, responde: {"transactions": []}`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl,
                  },
                },
              ],
            },
          ],
          max_tokens: 2000,
        }),
      });

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error(`OpenAI API error for file ${file.name}:`, errorText);
        continue; // Skip this file and continue with others
      }

      const openaiData = await openaiResponse.json();
      const content = openaiData.choices?.[0]?.message?.content;

      if (!content) {
        console.error(`No content in OpenAI response for file ${file.name}`);
        continue;
      }

      // Parse JSON from response
      let parsedData;
      try {
        // Try to extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
        const jsonString = jsonMatch ? jsonMatch[1] : content;
        parsedData = JSON.parse(jsonString);
        
        if (parsedData.transactions && parsedData.transactions.length > 0) {
          console.log(`Extracted ${parsedData.transactions.length} transactions from ${file.name}`);
          allTransactions.push(...parsedData.transactions);
        }
      } catch (e) {
        console.error(`Error parsing OpenAI response for ${file.name}:`, e);
        continue;
      }
    }

    console.log(`Successfully extracted ${allTransactions.length} total transactions from ${files.length} files`);

    return c.json({ transactions: allTransactions });
  } catch (error) {
    console.error('Error analyzing bank statement:', error);
    if (error instanceof Error && error.message.includes('timeout')) {
      return c.json({ error: 'La solicitud tardó demasiado. Por favor intenta con un archivo más pequeño.' }, 408);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Financial advice endpoint
app.post("/make-server-727b50c3/financial-advice", async (c) => {
  try {
    const body = await c.req.json();
    const {
      totalIncome,
      totalExpenses,
      balance,
      categorySpending,
      budgetAnalysis,
      accountBalances,
      transactionCount,
    } = body;

    console.log('Generating financial advice...');

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    // Format the data for the AI
    const categoryBreakdown = Object.entries(categorySpending as Record<string, number>)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([category, amount]) => `${category}: $${(amount || 0).toLocaleString()}`)
      .join('\n');

    const budgetStatus = (budgetAnalysis as any[])
      .filter(b => b && b.category && b.spent != null && b.budget != null)
      .map(b => `${b.category}: $${(b.spent || 0).toLocaleString()} de $${(b.budget || 0).toLocaleString()} (${(b.percentage || 0).toFixed(1)}%)`)
      .join('\n');

    const accountInfo = (accountBalances as any[])
      .filter(a => a && a.name && a.type != null)
      .map(a => `${a.name} (${a.type}): $${(a.balance || 0).toLocaleString()}`)
      .join('\n');

    const prompt = `Eres un asesor financiero experto. Analiza la siguiente información financiera de los últimos 3 meses y proporciona consejos personalizados en español.

INFORMACIÓN FINANCIERA:
- Ingresos totales: $${(totalIncome || 0).toLocaleString()}
- Gastos totales: $${(totalExpenses || 0).toLocaleString()}
- Balance: $${(balance || 0).toLocaleString()} ${balance >= 0 ? '(Positivo ✓)' : '(Negativo ⚠️)'}
- Total de transacciones: ${transactionCount || 0}

GASTOS POR CATEGORÍA:
${categoryBreakdown || 'Sin datos'}

ESTADO DE PRESUPUESTOS:
${budgetStatus || 'Sin presupuestos definidos'}

CUENTAS:
${accountInfo}

Por favor proporciona un análisis detallado que incluya:
1. Un resumen general de la situación financiera (2-3 oraciones)
2. Insights sobre patrones de gasto (3-5 puntos clave)
3. Alertas sobre problemas o riesgos financieros (si aplica)
4. Recomendaciones específicas para mejorar la salud financiera
5. Un plan de acción concreto con pasos a seguir

Responde ÚNICAMENTE con un JSON válido en este formato:
{
  "summary": "Resumen de 2-3 oraciones sobre la situación financiera general",
  "insights": [
    "Insight 1 sobre patrones de gasto",
    "Insight 2",
    "Insight 3"
  ],
  "warnings": [
    "Alerta 1 sobre problemas financieros",
    "Alerta 2"
  ],
  "recommendations": [
    "Recomendación 1 específica",
    "Recomendación 2"
  ],
  "actionPlan": [
    "Paso 1 del plan de acción",
    "Paso 2",
    "Paso 3"
  ]
}

IMPORTANTE: 
- Sé específico con los números cuando sea relevante
- Menciona categorías concretas donde se gasta más
- Si el balance es negativo, enfócate en reducción de gastos y aumento de ingresos
- Si hay presupuestos excedidos, menciónalos específicamente
- Proporciona consejos prácticos y accionables, no genéricos`;

    const openaiResponse = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Eres un asesor financiero profesional experto en finanzas personales. Respondes siempre en JSON válido y en español.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      return c.json({ error: 'Error generating advice' }, 500);
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in OpenAI response');
      return c.json({ error: 'No response from AI' }, 500);
    }

    // Parse JSON from response
    let advice;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      advice = JSON.parse(jsonString);
    } catch (e) {
      console.error('Error parsing OpenAI response:', e, 'Content:', content);
      return c.json({ error: 'Failed to parse AI response' }, 500);
    }

    console.log('Financial advice generated successfully');
    return c.json({ advice });
  } catch (error) {
    console.error('Error generating financial advice:', error);
    if (error instanceof Error && error.message.includes('timeout')) {
      return c.json({ error: 'La solicitud tardó demasiado. Por favor intenta nuevamente.' }, 408);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Parse voice command with GPT-4
app.post("/make-server-727b50c3/parse-voice-command", async (c) => {
  try {
    const body = await c.req.json();
    const { text, accounts, categories } = body;

    console.log('🎤 [parse-voice-command] Raw body received:', JSON.stringify(body, null, 2));
    console.log('🎤 [parse-voice-command] text:', text);
    console.log('🎤 [parse-voice-command] accounts type:', typeof accounts);
    console.log('🎤 [parse-voice-command] accounts isArray:', Array.isArray(accounts));
    console.log('🎤 [parse-voice-command] accounts length:', accounts?.length);
    console.log('🎤 [parse-voice-command] categories type:', typeof categories);
    console.log('🎤 [parse-voice-command] categories isArray:', Array.isArray(categories));
    console.log('🎤 [parse-voice-command] categories length:', categories?.length);

    if (!text) {
      return c.json({ error: 'Text is required' }, 400);
    }

    // ✅ FIX: Validate accounts and categories are provided
    if (!accounts || !Array.isArray(accounts)) {
      console.error('❌ Missing or invalid accounts array');
      console.error('   Accounts value:', accounts);
      console.error('   Type:', typeof accounts);
      return c.json({ error: 'Missing or invalid accounts array' }, 400);
    }

    if (!categories || !Array.isArray(categories)) {
      console.error('❌ Missing or invalid categories array');
      console.error('   Categories value:', categories);
      console.error('   Type:', typeof categories);
      return c.json({ error: 'Missing or invalid categories array' }, 400);
    }

    console.log('✅ Validation passed:', accounts.length, 'accounts,', categories.length, 'categories');
    console.log('Voice command parse request:', text);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    // Build system prompt with available accounts and categories
    const systemPrompt = `Eres un asistente especializado en parsear comandos de voz para una aplicación de finanzas personales en Colombia y Latinoamérica.

TAREA: Analiza el comando de voz y extrae la información estructurada para crear una transacción.

CUENTAS DISPONIBLES:
${accounts.map((acc: any) => `- ${acc.name} (ID: ${acc.id}, Tipo: ${acc.type})`).join('\n')}

CATEGORÍAS DISPONIBLES:
${categories.map((cat: any) => {
  const subs = cat.subcategories?.map((s: any) => `${s.name} (ID: ${s.id})`).join(', ') || 'sin subcategorías';
  return `- ${cat.name} (ID: ${cat.id}, Tipo: ${cat.type}) - Subcategorías: ${subs}`;
}).join('\n')}

REGLAS DE INTERPRETACIÓN:

1. **TIPO DE TRANSACCIÓN** (OBLIGATORIO - NUNCA null):
   - INGRESO (income): "recibí", "me pagaron", "cobré", "ingreso", "ganancia", "gané", "me dieron", "vendí", "devengué"
   - GASTO (expense): "compré", "gasté", "pagué", "compra", "gasto", "di", "salida", "consumí"
   - TRANSFERENCIA (transfer): "transferí", "moví", "pasé", "transferencia", "transfiero"
   - **Si no se menciona explícitamente, infiere por contexto:**
     - Si menciona algo que se compra/adquiere → expense
     - Si menciona algo que se vende/recibe → income
     - Si menciona mover dinero entre cuentas → transfer

2. **MONTO** (OBLIGATORIO - NUNCA null):
   - Números escritos: "dos millones" = 2000000, "150 mil" = 150000
   - Variaciones: "millón y medio" = 1500000, "medio millón" = 500000, "2 millones y medio" = 2500000
   - Combinados: "2 millones" = 2000000, "50 mil" = 50000, "un millón quinientos" = 1500000
   - Directos: "10000", "5000000", "100", "1500"
   - Ignora "pesos", "cop", "plata" al final
   - **IMPORTANTE: SIEMPRE debe haber un número. Si no detectas monto explícito, busca cualquier número en el texto.**
   - Ejemplos:
     - "compré un balón" → Busca si hay números cerca
     - "balón de fútbol" → Si NO hay números, responde con {"error": "No se detectó un monto"}
     - "gasté 50 mil en un balón" → amount: 50000

3. **CATEGORÍA** (Usa contexto inteligente):
   
   **INGRESOS:**
   - "Salario": sueldo, nómina, pago mensual, quincenal, prima, bonificación
   - "Freelance/Independiente": proyecto, consultoría, trabajo independiente
   - "Ventas": vendí, venta de producto, emprendimiento, comercio
   - "Regalos y Extras": regalo, bono, lotería, rifa, aguinaldo
   - "Inversiones": dividendos, intereses, rendimientos, acciones, cripto
   - "Arrendamiento": arriendo, alquiler, renta de propiedad
   
   **GASTOS:**
   - "Vivienda": arriendo, hipoteca, predial, administración, condominio
   - "Hogar": mercado, supermercado, empleada doméstica, aseo, muebles
   - "Servicios": luz, agua, gas, internet, celular, netflix, streaming
   - "Alimentación": comida, restaurante, almuerzo, cena, café, domicilio
   - "Transporte": taxi, uber, bus, metro, gasolina, peaje, parqueadero
   - "Salud": médico, eps, medicina, farmacia, gimnasio, dentista
   - "Educación": colegio, universidad, curso, libro, matrícula, pensión
   - "Ropa y Cuidado Personal": ropa, zapatos, peluquería, salón de belleza
   - "Entretenimiento": cine, concierto, fiesta, salida, videojuego, balón, juguetes
   - "Tecnología": celular, computador, tablet, app, software
   - "Ayudas y Regalos": ayuda familiar, prestado, donación, regalo
   - "Préstamos y Créditos": préstamo, crédito, deuda, tarjeta, banco, cuota, amigo, familia, hipoteca
   
   - Prioriza menciones explícitas: "categoría comida", "en transporte"
   - Infiere inteligentemente por contexto y keywords
   - Solo categorías del tipo correcto (expense/income)
   - Si detectas subcategoría mencionada, inclúyela

4. **CUENTA** (Intenta detectar, si no → primera cuenta disponible):
   - Busca menciones: "de efectivo", "desde banco", "con tarjeta", "desde Nequi"
   - Si no se menciona, usa la primera cuenta disponible (NO dejes null)
   - Para transferencias, identifica "de X a Y"

5. **NOTA**:
   - Extrae información adicional relevante
   - Ejemplo: "compré pan en la panadería" → nota: "pan en la panadería"
   - "balón de fútbol" → nota: "balón de fútbol"
   - Limpia palabras clave del comando

RESPUESTA:
Debes responder SOLO con un JSON válido (sin markdown, sin comentarios) con esta estructura exacta:
{
  "type": "income" | "expense" | "transfer",
  "amount": number,
  "category": "category_id" | null,
  "subcategory": "subcategory_id" | null,
  "account": "account_id" | null,
  "toAccount": "account_id" | null,
  "note": "texto" | null
}

IMPORTANTE:
- Usa los IDs exactos de las cuentas, categorías y subcategorías proporcionadas
- **type NUNCA puede ser null - siempre infiere del contexto**
- **amount NUNCA puede ser null - si no hay número en el texto, responde con {"error": "No se detectó un monto"}**
- **subcategory NUNCA puede tener el mismo ID que category - usa el ID de la subcategoría listada o usa null**
- Si no puedes determinar categoría/cuenta con confianza, usa null
- Si no hay una subcategoría relevante mencionada, usa null para subcategory (NO uses el ID de la categoría)
- toAccount solo para transferencias
- category y subcategory solo para income/expense (no transfer)
- Sé inteligente con el contexto latinoamericano y colombiano

EJEMPLOS:
- "gasté 50 mil en transporte" → {"type":"expense","amount":50000,"category":"[id transporte]",...}
- "balón de fútbol" → {"error":"No se detectó un monto"} (falta monto)
- "compré un balón por 80 mil" → {"type":"expense","amount":80000,"category":"[id entretenimiento]","note":"balón",...}`;

    // Call OpenAI API
    const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.3, // Lower temperature for more consistent parsing
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return c.json({ error: 'Failed to parse voice command' }, 500);
    }

    const data = await response.json();
    const parsedContent = data.choices[0].message.content.trim();
    
    console.log('GPT-4 response:', parsedContent);

    // Parse the JSON response
    let parsedCommand;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = parsedContent.replace(/```json\n?|\n?```/g, '').trim();
      parsedCommand = JSON.parse(cleanedContent);
    } catch (e) {
      console.error('Failed to parse GPT-4 response as JSON:', e);
      return c.json({ error: 'Invalid response format from AI' }, 500);
    }

    // Check if GPT-4 returned an error response
    if (parsedCommand.error) {
      console.error('GPT-4 returned error:', parsedCommand.error);
      return c.json({ error: parsedCommand.error }, 400);
    }

    // Validate required fields
    if (!parsedCommand.type) {
      console.error('Missing type in parsed command:', parsedCommand);
      return c.json({ error: 'No pude detectar el tipo de transacción. Intenta decir "gasté", "compré", "recibí" o "transferí".' }, 400);
    }

    if (!parsedCommand.amount || parsedCommand.amount === null) {
      console.error('Missing amount in parsed command:', parsedCommand);
      return c.json({ error: 'No detecté un monto válido. Por favor menciona la cantidad (ej: "50 mil", "2 millones", "100000").' }, 400);
    }

    // Auto-assign first account if none specified (for better UX)
    if (!parsedCommand.account && accounts.length > 0) {
      console.log('No account specified, using first available account');
      parsedCommand.account = accounts[0].id;
    }

    // ✅ FIX: Clean invalid subcategories (when subcategory ID = category ID)
    if (parsedCommand.category && parsedCommand.subcategory && parsedCommand.category === parsedCommand.subcategory) {
      console.log('🧹 [Server] Cleaning invalid subcategory (same as category) - GPT-4 error');
      parsedCommand.subcategory = null;
    }

    return c.json({ command: parsedCommand });
  } catch (error) {
    console.error('Error parsing voice command:', error);
    if (error instanceof Error && error.message.includes('timeout')) {
      return c.json({ error: 'La solicitud tardó demasiado. Por favor intenta nuevamente.' }, 408);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Parse budget voice command with GPT-4
app.post("/make-server-727b50c3/parse-budget-voice-command", async (c) => {
  try {
    const body = await c.req.json();
    const { text, categories, currentMonth, currentYear } = body;

    console.log('🎤 [parse-budget-voice-command] Raw body received:', JSON.stringify(body, null, 2));
    console.log('🎤 [parse-budget-voice-command] text:', text);
    console.log('🎤 [parse-budget-voice-command] categories type:', typeof categories);
    console.log('🎤 [parse-budget-voice-command] categories isArray:', Array.isArray(categories));
    console.log('🎤 [parse-budget-voice-command] categories length:', categories?.length);
    console.log('🎤 [parse-budget-voice-command] currentMonth:', currentMonth);
    console.log('🎤 [parse-budget-voice-command] currentYear:', currentYear);

    if (!text) {
      return c.json({ error: 'Text is required' }, 400);
    }

    // ✅ FIX: Validate categories are provided
    if (!categories || !Array.isArray(categories)) {
      console.error('❌ Missing or invalid categories array');
      console.error('   Categories value:', categories);
      console.error('   Type:', typeof categories);
      return c.json({ error: 'Missing or invalid categories array' }, 400);
    }

    console.log('✅ Validation passed:', categories.length, 'categories');
    console.log('Budget voice command parse request:', text);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    // Obtener nombres de meses en español
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Build system prompt with available categories
    const systemPrompt = `Eres un asistente especializado en parsear comandos de voz para crear presupuestos en una aplicación de finanzas personales en Colombia y Latinoamérica.

TAREA: Analiza el comando de voz y extrae la información estructurada para crear un presupuesto.

CATEGORÍAS DE GASTO DISPONIBLES:
${categories.filter((cat: any) => cat.type === 'expense').map((cat: any) => `- ${cat.name} (ID: ${cat.id})`).join('\n')}

CONTEXTO TEMPORAL:
- Mes actual: ${monthNames[currentMonth]} (${currentMonth})
- Año actual: ${currentYear}

REGLAS DE INTERPRETACIÓN:

1. **CATEGORÍA** (OBLIGATORIO - NUNCA null):
   - Busca la categoría mencionada explícitamente: "presupuesto para mercado", "de transporte"
   - Infiere por contexto si no se menciona explícitamente
   - SOLO acepta categorías de tipo "expense" (gasto)
   - Usa el ID exacto de la categoría de la lista proporcionada
   - Ejemplos de categorías comunes:
     * "Mercado/Supermercado" → Hogar
     * "Transporte/Taxi/Uber" → Transporte
     * "Ropa/Vestido" → Ropa y Cuidado Personal
     * "Comida/Restaurante" → Alimentación
     * "Entretenimiento/Diversión" → Entretenimiento
     * "Salud/Médico" → Salud

2. **MONTO** (OBLIGATORIO - NUNCA null):
   - Números escritos: "quinientos mil" = 500000, "un millón" = 1000000
   - Variaciones: "millón y medio" = 1500000, "medio millón" = 500000
   - Combinados: "500 mil" = 500000, "1 millón" = 1000000
   - Directos: "100000", "500000", "1000000"
   - Ignora "pesos", "cop", "plata" al final
   - **SIEMPRE debe haber un monto. Si no lo detectas, responde con {"error": "No se detectó un monto"}**

3. **MES** (Opcional - puede ser null):
   - Detecta menciones explícitas: "para enero", "en diciembre", "de febrero"
   - Frases: "este mes" = mes actual (${currentMonth})
   - Si no se menciona específicamente = null (presupuesto recurrente para todos los meses)
   - Usa el número del mes (0-11): Enero=0, Febrero=1, Marzo=2, etc.

4. **AÑO** (Opcional - puede ser null):
   - Detecta menciones explícitas: "para 2025", "en el 2024", "del año 2026"
   - "Este año" = año actual (${currentYear})
   - Si no se menciona específicamente = null (presupuesto recurrente para todos los años)
   - Usa el número completo del año: 2024, 2025, etc.

5. **UMBRAL DE ALERTA** (Opcional):
   - Por defecto: 80 (80%)
   - Si se menciona: "alerta al 90%", "notificarme al 75%"
   - Valor entre 0 y 100

RESPUESTA:
Debes responder SOLO con un JSON válido (sin markdown, sin comentarios) con esta estructura exacta:
{
  "categoryId": "category_id",
  "amount": number,
  "month": number | null,
  "year": number | null,
  "alertThreshold": number
}

IMPORTANTE:
- Usa los IDs exactos de las categorías proporcionadas
- **categoryId NUNCA puede ser null - siempre debe ser una categoría de gasto**
- **amount NUNCA puede ser null - si no hay número, responde con {"error": "No se detectó un monto"}**
- month puede ser null (presupuesto recurrente mensual)
- year puede ser null (presupuesto recurrente anual)
- alertThreshold por defecto es 80
- Si no encuentras la categoría mencionada, intenta inferir la más cercana del contexto

EJEMPLOS:
- "crear presupuesto de 500 mil para mercado" → {"categoryId":"[id hogar]","amount":500000,"month":null,"year":null,"alertThreshold":80}
- "presupuesto de 200 mil para transporte este mes" → {"categoryId":"[id transporte]","amount":200000,"month":${currentMonth},"year":${currentYear},"alertThreshold":80}
- "asignar 1 millón a entretenimiento en enero" → {"categoryId":"[id entretenimiento]","amount":1000000,"month":0,"year":null,"alertThreshold":80}
- "medio millón para ropa en diciembre 2024" → {"categoryId":"[id ropa]","amount":500000,"month":11,"year":2024,"alertThreshold":80}
- "presupuesto para comida" → {"error":"No se detectó un monto"} (falta monto)`;

    // Call OpenAI API
    const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.3, // Lower temperature for more consistent parsing
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return c.json({ error: 'Failed to parse budget voice command' }, 500);
    }

    const data = await response.json();
    const parsedContent = data.choices[0].message.content.trim();
    
    console.log('GPT-4 budget response:', parsedContent);

    // Parse the JSON response
    let parsedCommand;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = parsedContent.replace(/```json\n?|\n?```/g, '').trim();
      parsedCommand = JSON.parse(cleanedContent);
    } catch (e) {
      console.error('Failed to parse GPT-4 response as JSON:', e);
      return c.json({ error: 'Invalid response format from AI' }, 500);
    }

    // Check if GPT-4 returned an error response
    if (parsedCommand.error) {
      console.error('GPT-4 returned error:', parsedCommand.error);
      return c.json({ error: parsedCommand.error }, 400);
    }

    // Validate required fields
    if (!parsedCommand.categoryId) {
      console.error('Missing categoryId in parsed command:', parsedCommand);
      return c.json({ error: 'No pude detectar la categoría. Intenta decir "presupuesto para [categoría]".' }, 400);
    }

    if (!parsedCommand.amount || parsedCommand.amount === null) {
      console.error('Missing amount in parsed command:', parsedCommand);
      return c.json({ error: 'No detecté un monto válido. Por favor menciona la cantidad (ej: "500 mil", "1 millón", "200000").' }, 400);
    }

    // Ensure alertThreshold has a default value
    if (!parsedCommand.alertThreshold) {
      parsedCommand.alertThreshold = 80;
    }

    return c.json({ command: parsedCommand });
  } catch (error) {
    console.error('Error parsing budget voice command:', error);
    if (error instanceof Error && error.message.includes('timeout')) {
      return c.json({ error: 'La solicitud tardó demasiado. Por favor intenta nuevamente.' }, 408);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Parse receipt/invoice image with GPT-4 Vision
app.post("/make-server-727b50c3/parse-receipt-image", async (c) => {
  try {
    const body = await c.req.json();
    const { imageBase64, categories } = body;

    console.log('📸 [parse-receipt-image] Processing receipt image');
    console.log('📸 [parse-receipt-image] Categories count:', categories?.length);
    console.log('📸 [parse-receipt-image] Image size:', imageBase64?.length);

    if (!imageBase64) {
      return c.json({ error: 'Image is required' }, 400);
    }

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return c.json({ error: 'Categories are required' }, 400);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('❌ OPENAI_API_KEY not configured');
      return c.json({ error: 'AI service not configured' }, 500);
    }

    // Construir lista de categorías disponibles
    const categoriesList = categories
      .map(cat => {
        const subcats = cat.subcategories && cat.subcategories.length > 0
          ? `\n      Subcategorías: ${cat.subcategories.map((sub: any) => `"${sub.name}" (${sub.id})`).join(', ')}`
          : '';
        return `  - "${cat.name}" (${cat.id}) [${cat.type}]${subcats}`;
      })
      .join('\n');

    const systemPrompt = `Eres un asistente de IA especializado en extraer información de recibos, facturas, tickets y comprobantes de pago.

Tu tarea es analizar la imagen y extraer información financiera útil. IMPORTANTE: Sé FLEXIBLE y tolerante. Si la imagen contiene información de compra, pago, o transacción financiera, SIEMPRE intenta extraer la información.

1. **TIPO DE TRANSACCIÓN**: Determina si es un gasto (expense) o ingreso (income)
   - La mayoría de recibos, facturas, tickets son gastos
   - Comprobantes de pago recibido, depósitos = income
   - Si no estás seguro, asume "expense"

2. **MONTO TOTAL**: El valor total a pagar o pagado
   - Busca "Total", "Total a Pagar", "Total Pagado", "Valor Total", "Importe", "Amount", etc.
   - Acepta diferentes formatos: 50.000, 50,000, 50000, $50, etc.
   - Ignora símbolos de moneda ($, COP, USD, etc.)
   - Si hay varios totales, usa el más grande o el que dice "Total Final"

3. **CATEGORÍA**: Infiere la categoría más apropiada basándote en:
   - El nombre del establecimiento
   - Los productos/servicios visibles
   - El contexto general
   
   ⚠️ IMPORTANTE: Debes usar el ID (UUID) de la categoría, NO el nombre.
   
Categorías disponibles:
${categoriesList}

4. **DESCRIPCIÓN**: Genera una descripción corta:
   - Nombre del establecimiento si es visible
   - Tipo de compra o servicio
   - Si no hay info clara, describe lo que ves
   - Ejemplos: "Compra en supermercado", "Pago de servicios", "Restaurante", "Compra general"

5. **FECHA**: Si está visible (formato YYYY-MM-DD)
   - Si no está clara, usa null

RESPUESTA:
Debes responder SOLO con un JSON válido (sin markdown, sin comentarios):
{
  "type": "expense" | "income",
  "amount": number,
  "category": "category_uuid" | null,  // ⚠️ Usa el UUID de la categoría, NO el nombre
  "subcategory": "subcategory_uuid" | null,  // ⚠️ Usa el UUID de la subcategoría, NO el nombre
  "description": "texto descriptivo" | null,
  "date": "YYYY-MM-DD" | null
}

REGLAS IMPORTANTES:
✅ SÉ FLEXIBLE: Si ves números y texto que parezca un recibo/ticket, PROCÉSALO
✅ Si no estás 100% seguro de algo, usa null o un valor predeterminado razonable
✅ SOLO devuelve error si la imagen está completamente en blanco, corrupta, o no contiene ningún texto financiero
❌ NO devuelvas error solo porque el formato es poco convencional o la calidad es baja
❌ NO seas demasiado estricto con la validación

Ejemplos de imágenes VÁLIDAS para procesar:
- Recibos de supermercado, tiendas, restaurantes
- Facturas de servicios (luz, agua, internet)
- Tickets de compra
- Extractos bancarios con transacciones
- Comprobantes de pago
- Screenshots de pagos digitales
- Fotos de notas de compra manuscritas

Solo devuelve {"error": "No se pudo detectar el monto total"} si realmente no hay números visibles.
Solo devuelve {"error": "La imagen no parece ser un recibo o factura válida"} si la imagen no contiene absolutamente nada relacionado con finanzas.`;

    console.log('📸 Calling GPT-4 Vision API...');

    // Call OpenAI Vision API
    const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt 
          },
          { 
            role: 'user', 
            content: [
              {
                type: 'text',
                text: 'Analiza esta imagen y extrae toda la información financiera que puedas. Sé flexible y tolerante con diferentes formatos. Si ves números y texto que parezcan un recibo o compra, procésalo.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI Vision API error:', errorText);
      return c.json({ error: 'Error procesando la imagen con IA' }, 500);
    }

    const data = await response.json();
    console.log('✅ GPT-4 Vision response received');
    console.log('📊 Full response data:', JSON.stringify(data, null, 2));
    
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      console.error('❌ No content in GPT-4 Vision response');
      return c.json({ error: 'La IA no pudo procesar la imagen' }, 500);
    }
    console.log('📸 GPT-4 Vision content:', content);

    // Parse JSON response
    let parsedReceipt;
    try {
      // Remove markdown code blocks if present
      const jsonString = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedReceipt = JSON.parse(jsonString);
      console.log('✅ Parsed receipt:', JSON.stringify(parsedReceipt, null, 2));
    } catch (e) {
      console.error('❌ Error parsing GPT-4 Vision response:', e, 'Content:', content);
      return c.json({ error: 'Error al interpretar la respuesta de la IA' }, 500);
    }

    // Check if GPT-4 returned an error
    if (parsedReceipt.error) {
      console.error('❌ GPT-4 Vision returned error:', parsedReceipt.error);
      // Dar contexto adicional al usuario
      const userFriendlyError = parsedReceipt.error.includes('no parece ser un recibo') 
        ? 'La imagen no parece contener un recibo válido. Intenta con una foto más clara donde se vea el texto y los números.'
        : parsedReceipt.error;
      return c.json({ error: userFriendlyError }, 400);
    }

    // Validate required fields con mejor feedback
    if (!parsedReceipt.type || !parsedReceipt.amount) {
      console.error('❌ Missing required fields in parsed receipt:', parsedReceipt);
      const missingFields = [];
      if (!parsedReceipt.type) missingFields.push('tipo de transacción');
      if (!parsedReceipt.amount) missingFields.push('monto');
      return c.json({ 
        error: `No se pudo extraer la siguiente información: ${missingFields.join(', ')}. Asegúrate de que la imagen sea clara.` 
      }, 400);
    }

    // Validate and map category/subcategory names to UUIDs
    // GPT-4 sometimes returns names instead of IDs, so we need to map them
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (parsedReceipt.category && !uuidRegex.test(parsedReceipt.category)) {
      console.log(`🔄 Category is not a UUID, mapping name "${parsedReceipt.category}" to ID`);
      const matchedCategory = categories.find(
        (cat: any) => cat.name.toLowerCase() === parsedReceipt.category.toLowerCase()
      );
      if (matchedCategory) {
        console.log(`✅ Mapped category "${parsedReceipt.category}" -> ${matchedCategory.id}`);
        parsedReceipt.category = matchedCategory.id;
      } else {
        console.log(`⚠️ Category "${parsedReceipt.category}" not found, setting to null`);
        parsedReceipt.category = null;
      }
    }
    
    if (parsedReceipt.subcategory && !uuidRegex.test(parsedReceipt.subcategory)) {
      console.log(`🔄 Subcategory is not a UUID, mapping name "${parsedReceipt.subcategory}" to ID`);
      // Find the subcategory within the matched category
      const parentCategory = categories.find((cat: any) => cat.id === parsedReceipt.category);
      if (parentCategory?.subcategories) {
        const matchedSubcategory = parentCategory.subcategories.find(
          (sub: any) => sub.name.toLowerCase() === parsedReceipt.subcategory.toLowerCase()
        );
        if (matchedSubcategory) {
          console.log(`✅ Mapped subcategory "${parsedReceipt.subcategory}" -> ${matchedSubcategory.id}`);
          parsedReceipt.subcategory = matchedSubcategory.id;
        } else {
          console.log(`⚠️ Subcategory "${parsedReceipt.subcategory}" not found, setting to null`);
          parsedReceipt.subcategory = null;
        }
      } else {
        console.log(`⚠️ No parent category found for subcategory, setting to null`);
        parsedReceipt.subcategory = null;
      }
    }

    // Clean invalid subcategories
    if (parsedReceipt.category && parsedReceipt.subcategory && 
        parsedReceipt.category === parsedReceipt.subcategory) {
      console.log('🧹 Cleaning invalid subcategory (same as category)');
      parsedReceipt.subcategory = null;
    }

    console.log('✅ Receipt parsed successfully:', parsedReceipt);
    return c.json({ receipt: parsedReceipt });

  } catch (error) {
    console.error('❌ Error parsing receipt image:', error);
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

// Upload receipt image to Supabase Storage (supports both authenticated and anonymous users)
app.post("/make-server-727b50c3/upload-receipt-image", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    console.log('📤 [upload-receipt-image] Auth header present:', !!authHeader);
    
    // Try to get authenticated user, fallback to anonymous
    let userId = 'anonymous';
    const accessToken = authHeader?.split(' ')[1];
    
    if (accessToken && accessToken !== Deno.env.get('SUPABASE_ANON_KEY')) {
      // This is a real user token, verify it
      const supabaseAuth = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      );
      
      const { data: { user }, error } = await supabaseAuth.auth.getUser(accessToken);
      if (!error && user) {
        userId = user.id;
        console.log('✅ [upload-receipt-image] Authenticated user:', userId);
      } else {
        console.log('⚠️ [upload-receipt-image] Invalid user token, using anonymous mode');
      }
    } else {
      console.log('📝 [upload-receipt-image] Anonymous upload mode');
    }
    const body = await c.req.json();
    const { imageBase64, fileName, contentType } = body;

    console.log('📤 [upload-receipt-image] Uploading receipt for user:', userId);
    console.log('📤 [upload-receipt-image] File name:', fileName);
    console.log('📤 [upload-receipt-image] Content type:', contentType);
    console.log('📤 [upload-receipt-image] Image base64 length:', imageBase64?.length);

    if (!imageBase64 || !fileName) {
      return c.json({ error: 'Image data and file name are required' }, 400);
    }

    // Create bucket if it doesn't exist
    const bucketName = 'make-727b50c3-receipts';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log('📦 Creating receipts bucket...');
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: false, // Private bucket
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      });
      
      if (createError) {
        console.error('❌ Error creating bucket:', createError);
        return c.json({ error: 'Error al crear el almacenamiento' }, 500);
      }
      console.log('✅ Bucket created successfully');
    }

    // Convert base64 to buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Upload file with user ID in path for security
    const filePath = `${userId}/${fileName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: contentType || 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ Error uploading to storage:', uploadError);
      return c.json({ error: 'Error al subir la imagen' }, 500);
    }

    console.log('✅ File uploaded successfully:', uploadData.path);
    console.log('📦 Upload details - User:', userId, 'Path:', filePath);

    // Get signed URL (valid for 1 year)
    const { data: signedUrlData, error: signedError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(uploadData.path, 365 * 24 * 60 * 60);

    if (signedError) {
      console.error('❌ Error creating signed URL:', signedError);
      return c.json({ error: 'Error al generar URL de imagen' }, 500);
    }

    console.log('✅ Signed URL created');
    return c.json({ 
      path: uploadData.path,
      signedUrl: signedUrlData.signedUrl 
    });

  } catch (error) {
    console.error('❌ Error in upload-receipt-image:', error);
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

// ====================
// OTI CHAT ENDPOINTS
// ====================

// Get financial context for Oti (authenticated)
app.get("/make-server-727b50c3/oti-context", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId } = authResult;

    console.log(`📊 Fetching financial context for user: ${userId}`);

    // Obtener datos financieros del usuario
    const accounts = await db.getAccounts(userId);
    const transactions = await db.getTransactions(userId);
    const categories = await db.getCategories(userId);
    const budgets = await db.getBudgets(userId);

    // Calcular balance total
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Calcular ingresos y gastos del mes actual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    const monthTransactions = transactions.filter(t => t.date >= firstDayOfMonth);
    const monthlyIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calcular tasa de ahorro
    const savingsRate = monthlyIncome > 0 
      ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 
      : 0;

    // Categorías con más gastos (top 3)
    const expensesByCategory: Record<string, number> = {};
    monthTransactions
      .filter(t => t.type === 'expense' && t.category_id)
      .forEach(t => {
        expensesByCategory[t.category_id!] = (expensesByCategory[t.category_id!] || 0) + t.amount;
      });

    const topExpenseCategories = Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          name: category?.name || 'Sin categoría',
          amount,
          percentage: monthlyExpenses > 0 ? (amount / monthlyExpenses) * 100 : 0,
        };
      });

    // Analizar presupuestos
    const budgetsWithSpending = budgets.map(budget => {
      const spent = monthTransactions
        .filter(t => t.type === 'expense' && t.category_id === budget.category_id)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const category = categories.find(c => c.id === budget.category_id);
      
      return {
        category: category?.name || 'Sin categoría',
        spent,
        limit: budget.amount,
        percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
      };
    });

    const budgetsOverLimit = budgetsWithSpending.filter(b => b.percentage > 100).length;

    // Estadísticas de transacciones
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const lastTransactionDate = sortedTransactions.length > 0 
      ? sortedTransactions[0].date 
      : null;

    const averageTransactionAmount = transactions.length > 0
      ? transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length
      : 0;

    // Alertas y insights
    const hasOverspending = budgetsOverLimit > 0;
    const hasBudgets = budgets.length > 0;
    const hasRecentActivity = lastTransactionDate 
      ? (new Date().getTime() - new Date(lastTransactionDate).getTime()) < 7 * 24 * 60 * 60 * 1000 // última semana
      : false;

    // Construir contexto
    const context = {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      accountCount: accounts.length,
      accounts: accounts.map(acc => ({
        name: acc.name,
        type: acc.type,
        balance: acc.balance,
      })),
      topExpenseCategories,
      budgetCount: budgets.length,
      budgetsOverLimit,
      budgets: budgetsWithSpending,
      transactionCount: transactions.length,
      lastTransactionDate,
      averageTransactionAmount,
      hasOverspending,
      hasBudgets,
      hasRecentActivity,
    };

    console.log(`✅ Financial context generated successfully`);

    return c.json({ context });
  } catch (error) {
    console.error('❌ Error getting financial context:', error);
    return c.json({ error: 'Error al obtener contexto financiero' }, 500);
  }
});

// Oti Chat endpoint (with optional context)
app.post("/make-server-727b50c3/oti-chat", async (c) => {
  try {
    const body = await c.req.json();
    const { message, history, contextData, requestStructured = false, groupId } = body; // 🆕 NUEVO: groupId para contexto de grupos

    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    console.log('💬 Oti chat request received');
    if (contextData) {
      console.log('   📊 With financial context');
    }
    if (requestStructured) {
      console.log('   📋 Structured response requested');
    }
    if (groupId) {
      console.log('   👥 Group context requested:', groupId);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    // 🆕 NUEVO: Cargar contexto del grupo si se proporciona groupId
    let groupContextText = '';
    if (groupId) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );

        // Cargar información del grupo
        const group = await familyDb.getGroupById(supabase, groupId);
        if (group) {
          // Cargar miembros del grupo
          const members = await familyDb.getGroupMembers(supabase, groupId);
          
          // Cargar transacciones del grupo (últimas 100)
          const transactions = await familyDb.getGroupTransactions(supabase, groupId, { 
            limit: 100
          });

          // Calcular estadísticas del grupo
          const totalExpenses = transactions
            .filter((t: any) => t.transaction_type === 'expense')
            .reduce((sum: number, t: any) => sum + t.amount, 0);
          
          const totalIncome = transactions
            .filter((t: any) => t.transaction_type === 'income')
            .reduce((sum: number, t: any) => sum + t.amount, 0);

          const categoriesMap = new Map<string, number>();
          transactions
            .filter((t: any) => t.transaction_type === 'expense' && t.category)
            .forEach((t: any) => {
              const current = categoriesMap.get(t.category) || 0;
              categoriesMap.set(t.category, current + t.amount);
            });

          const topCategories = Array.from(categoriesMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, amount]) => ({ name, amount }));

          // Construir texto de contexto del grupo
          groupContextText = `

👥 CONTEXTO DEL GRUPO FAMILIAR/COMPARTIDO:

📋 Información del Grupo:
- Nombre: ${group.emoji} ${group.name}
- Miembros activos: ${members.length}
- Moneda: ${group.currency}

👤 Miembros del Grupo:
${members.map((m: any) => `- ${m.emoji} ${m.nickname} (${m.role})`).join('\n')}

💰 Resumen Financiero del Grupo:
- Total de transacciones compartidas: ${transactions.length}
- Total gastos compartidos: $${totalExpenses.toLocaleString('es-CO')}
- Total ingresos compartidos: $${totalIncome.toLocaleString('es-CO')}
- Balance neto: $${(totalIncome - totalExpenses).toLocaleString('es-CO')}

${topCategories.length > 0 ? `📊 Categorías de gasto más usadas en el grupo:
${topCategories.map((cat: any, i: number) => `${i + 1}. ${cat.name}: $${cat.amount.toLocaleString('es-CO')}`).join('\n')}` : ''}

${transactions.length > 0 ? `📝 Últimas transacciones compartidas:
${transactions.slice(0, 5).map((t: any) => {
  const member = members.find((m: any) => m.user_id === t.shared_by_user_id);
  return `- ${t.transaction_date}: ${t.transaction_type === 'expense' ? '-' : '+'}$${t.amount.toLocaleString('es-CO')} - ${t.description || t.category} (compartido por ${member?.nickname || 'Usuario'})`;
}).join('\n')}` : ''}

🎯 IMPORTANTE SOBRE EL CONTEXTO DE GRUPOS:
- Estás en el contexto de un grupo familiar/compartido
- Todas las preguntas del usuario son sobre ESTE GRUPO ESPECÍFICO
- Puedes analizar los gastos compartidos del grupo
- Puedes identificar quién gasta más o menos
- Puedes dar recomendaciones para optimizar finanzas grupales
- Tienes acceso completo a todas las transacciones, miembros y estadísticas del grupo

⚡ ACCIONES EN CONTEXTO DE GRUPOS:
- Cuando generes acciones, ten en cuenta que el usuario está en la pantalla del grupo
- NO uses "navigate" con target "transactions" porque eso saldría del grupo
- En su lugar, usa acciones tipo "view" con descripción clara (ej: "Ver detalles de las transacciones del grupo")
- El usuario puede revisar las transacciones del grupo cerrando el chat
`;
        }
      } catch (error) {
        console.error('⚠️ Error loading group context:', error);
      }
    }

    // ✨ NUEVO: Construir contexto financiero si está disponible
    let financialContextText = '';
    if (contextData) {
      financialContextText = `

DATOS FINANCIEROS ACTUALES DEL USUARIO:

📊 Resumen General:
- Balance total: $${contextData.totalBalance.toLocaleString('es-CO')}
- Ingresos mensuales: $${contextData.monthlyIncome.toLocaleString('es-CO')}
- Gastos mensuales: $${contextData.monthlyExpenses.toLocaleString('es-CO')}
- Tasa de ahorro: ${contextData.savingsRate.toFixed(1)}%

💰 Cuentas (${contextData.accountCount} total):
${contextData.accounts.map((acc: any) => `- ${acc.name} (${acc.type}): $${acc.balance.toLocaleString('es-CO')}`).join('\n')}

${contextData.topExpenseCategories.length > 0 ? `📈 Categorías con más gastos:
${contextData.topExpenseCategories.map((cat: any, i: number) => `${i + 1}. ${cat.name}: $${cat.amount.toLocaleString('es-CO')} (${cat.percentage.toFixed(1)}%)`).join('\n')}` : ''}

${contextData.budgetCount > 0 ? `🎯 Presupuestos (${contextData.budgetCount} total, ${contextData.budgetsOverLimit} excedidos):
${contextData.budgets.map((b: any) => `- ${b.category}: $${b.spent.toLocaleString('es-CO')} / $${b.limit.toLocaleString('es-CO')} (${b.percentage.toFixed(1)}%)`).join('\n')}` : ''}

📝 Estadísticas:
- Total de transacciones: ${contextData.transactionCount}
- Última transacción: ${contextData.lastTransactionDate || 'N/A'}
- Promedio por transacción: $${contextData.averageTransactionAmount.toLocaleString('es-CO')}

⚠️ Alertas:
${contextData.hasOverspending ? '- ⚠️ Hay gastos excesivos detectados' : '- ✅ Gastos dentro de límites'}
${contextData.hasBudgets ? '- ✅ Tiene presupuestos configurados' : '- ⚠️ No tiene presupuestos configurados'}
${contextData.hasRecentActivity ? '- ✅ Actividad reciente detectada' : '- ⚠️ Sin actividad reciente'}

IMPORTANTE: Usa estos datos REALES para dar respuestas personalizadas y precisas. Menciona números específicos cuando sea relevante.
`;
    }

    // ✨ NUEVO: Prompt para respuestas estructuradas
    const structuredInstructions = requestStructured ? `

FORMATO DE RESPUESTA ESTRUCTURADA:
Debes responder en formato JSON con la siguiente estructura:
{
  "type": "structured",
  "summary": "Resumen corto de 1-2 líneas",
  "sections": [
    {
      "type": "diagnosis" | "recommendation" | "action" | "insight" | "warning" | "success",
      "title": "Título de la sección",
      "content": "Contenido detallado",
      "icon": "emoji opcional",
      "items": ["item 1", "item 2"] (opcional, para listas)
    }
  ],
  "actions": [
    {
      "id": "unique-id",
      "type": "navigate" | "create" | "view" | "edit" | "external",
      "label": "Texto del botón",
      "description": "Descripción corta",
      "icon": "emoji opcional",
      "target": "nombre de pantalla" (para navigate),
      "params": {} (opcional)
    }
  ],
  "footer": "Nota final opcional"
}

TIPOS DE SECCIONES:
- "diagnosis": Análisis de la situación actual (azul)
- "recommendation": Recomendaciones y consejos (verde)
- "action": Acciones específicas que puede tomar (morado)
- "insight": Insights basados en datos (ámbar)
- "warning": Advertencias importantes (rojo)
- "success": Mensajes de éxito (verde)

TIPOS DE ACCIONES:
- "navigate": Navegar a pantalla (target: "dashboard" | "transactions" | "accounts" | "categories" | "budgets" | "statistics" | "settings")
  * IMPORTANTE: En contexto de grupos, evita usar "navigate" a "transactions"
- "create": Crear nuevo elemento
- "view": Ver detalles (útil en contexto de grupos para sugerir revisar información sin salir)
- "edit": Editar algo
- "external": Abrir URL externa

CUÁNDO USAR RESPUESTA ESTRUCTURADA:
- Usa respuesta estructurada cuando la pregunta requiere análisis, diagnóstico o recomendaciones
- Usa secciones para organizar información compleja
- Incluye acciones cuando el usuario puede hacer algo directamente
- Para preguntas simples que solo requieren 1-2 párrafos, responde con formato simple JSON: { "type": "simple", "content": "texto" }

IMPORTANTE:
- SIEMPRE responde con JSON válido
- NO incluyas markdown ni texto adicional fuera del JSON
- Si no estás seguro, usa formato simple` : '';

    // Build conversation history
    const messages = [
      {
        role: 'system',
        content: `Eres "Oti", un asistente virtual experto en finanzas personales y guía de uso de la aplicación de finanzas.${groupContextText}${financialContextText}

SOBRE TI:
- Tu nombre es "Oti" y eres un experto financiero amigable y profesional
- Ayudas a los usuarios con preguntas sobre finanzas personales y cómo usar la aplicación
- Respondes de manera clara, concisa y personalizada
- Usas un tono amigable pero profesional
- Cuando sea apropiado, incluyes emojis para hacer la conversación más amigable

SOBRE LA APP:
La app de finanzas personales tiene las siguientes funciones principales:

1. **Dashboard**: Muestra el resumen financiero con balance total, ingresos, gastos y gráficos
2. **Transacciones**: 
   - Ver historial de todas las transacciones
   - Agregar ingresos, gastos o transferencias
   - Editar transacciones haciendo clic en ellas
   - Usar reconocimiento de voz para registrar transacciones habladas
3. **Cuentas**: 
   - Crear cuentas de efectivo, bancos, tarjetas o billeteras digitales
   - Ver saldos de cada cuenta
   - Gestionar múltiples cuentas
   - ⚠️ IMPORTANTE: Las cuentas SIEMPRE inician en $0 (el balance inicial está deshabilitado)
   - TODO saldo debe registrarse como TRANSACCIÓN para mantener trazabilidad completa
4. **Categorías**: 
   - Categorías predeterminadas para Colombia (Servicios, Comida, Transporte, Salud, etc.)
   - Crear categorías personalizadas con emojis y colores
   - Agregar subcategorías a cada categoría
5. **Presupuestos**: 
   - Crear presupuestos mensuales por categoría
   - Recibir alertas cuando se está cerca del límite
   - Ver progreso del gasto vs presupuesto
6. **Estadísticas**: 
   - Gráficos circulares de gastos por categoría
   - Gráficos de barras de evolución mensual
   - Análisis detallado de patrones de gasto
7. **Carga de Extractos Bancarios**: 
   - Subir fotos de extractos bancarios
   - IA reconoce y extrae automáticamente las transacciones
   - Ahorra tiempo en registro manual
8. **Asesor Financiero con IA**: 
   - Analiza los últimos 3 meses de finanzas
   - Proporciona consejos personalizados
   - Identifica patrones de gasto y da recomendaciones
9. **Grupos Familiares/Compartidos**: 
   - Crear grupos familiares o con amigos para compartir finanzas
   - Compartir transacciones opcionalmente con el grupo
   - Ver gastos compartidos y estadísticas grupales
   - Reaccionar con emojis y comentar transacciones de otros miembros
   - Recibir notificaciones de actividad del grupo
   - Roles: admin, miembro, visor
10. **Configuración**: 
   - Cambiar temas de color
   - Modo oscuro/claro
   - Exportar datos a CSV
   - Reiniciar datos de demostración

CÓMO RESPONDER:
- Si te preguntan sobre finanzas personales: da consejos expertos, prácticos y personalizados
- Si te preguntan cómo usar la app: explica las funciones de manera clara y paso a paso
- Si no estás seguro de algo específico de la app, sé honesto pero ofrece alternativas
- Mantén respuestas concisas (2-4 párrafos máximo)
- Usa listas cuando sea apropiado para mayor claridad
- Siempre sé positivo y motivador

MONEDA Y FORMATO:
- La aplicación está diseñada para Colombia 🇨🇴
- SIEMPRE usa pesos colombianos (COP) como moneda
- Formato de números: usa punto (.) como separador de miles (ej: 1.000.000 COP)
- NO uses dólares ($) ni otras monedas, solo pesos colombianos
- Cuando hables de cantidades, di "pesos" o "COP" (ej: "50.000 pesos" o "1.500.000 COP")
- Si el usuario menciona dólares, conviértelo a contexto colombiano

CÓMO REGISTRAR PRÉSTAMOS Y DEUDAS:

📤 PARA DEUDAS INICIALES (dinero que ya gastaste y debes):
1. Crear cuenta de deuda (Banco/Digital/Tarjeta según corresponda)
2. Registrar un GASTO con categoría "💳 Préstamos y Créditos"
3. Resultado: cuenta con saldo NEGATIVO (correcto, debes dinero)
4. Para pagar: usar TRANSFERENCIA desde tu cuenta con dinero hacia la cuenta de deuda

💰 PARA PRÉSTAMOS NUEVOS (acabas de recibir el dinero):
⚠️ IMPORTANTE: NO registrar como INGRESO porque no se registraría la deuda
✅ USA TRANSFERENCIA:
1. Crear cuenta "Préstamo Banco X" (inicia en $0)
2. Registrar TRANSFERENCIA:
   - Desde: "Préstamo Banco X" (origen de la deuda)
   - Hacia: "Banco Principal" (donde recibiste el dinero)
   - Monto: cantidad del préstamo
3. Resultado:
   - Cuenta "Préstamo Banco X": saldo NEGATIVO (debes)
   - Cuenta "Banco Principal": saldo POSITIVO (tienes)
   - Balance neto: $0 (correcto, porque debes lo que tienes)
4. Cuando gastes ese dinero: se registra normalmente desde "Banco Principal"
5. Para pagar cuota: TRANSFERENCIA desde cuenta con dinero hacia "Préstamo Banco X"

📊 DIFERENCIA CLAVE:
- INGRESO = Dinero realmente tuyo (salario, regalo, venta) → aumenta patrimonio
- TRANSFERENCIA = Dinero de DEUDA (préstamo) → NO aumenta patrimonio (solo cambia de forma)

Ejemplo completo:
"Recibí préstamo de $1.500.000"
→ Crear cuenta "Préstamo Banco X"
→ TRANSFERENCIA: "Préstamo Banco X" → "Banco Principal" ($1.500.000)
→ Resultado: -$1.500.000 en préstamo, +$1.500.000 en banco, balance neto $0

IMPORTANTE:
- NO inventes funciones que no existen en la app
- NO des consejos financieros que puedan ser peligrosos o ilegales
- Si una pregunta está fuera de tu alcance (finanzas o uso de la app), dirígelos amablemente a otros recursos${structuredInstructions}`,
      },
      ...history.slice(-10), // Keep last 10 messages for context
      {
        role: 'user',
        content: message,
      },
    ];

    const openaiResponse = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
        max_tokens: requestStructured ? 1000 : 500, // ✨ Más tokens para respuestas estructuradas
        response_format: requestStructured ? { type: "json_object" } : undefined, // ✨ Forzar JSON
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      return c.json({ error: 'Error communicating with AI service' }, 500);
    }

    const openaiData = await openaiResponse.json();
    const response = openaiData.choices[0].message.content;

    // ✨ NUEVO: Si se solicitó estructurado, intentar parsear JSON
    if (requestStructured) {
      try {
        const parsedResponse = JSON.parse(response);
        console.log('✅ Oti structured response generated successfully');
        return c.json({ 
          response,
          isStructured: true,
          structuredResponse: parsedResponse 
        });
      } catch (error) {
        console.error('⚠️ Failed to parse structured response, returning as simple text:', error);
        // Si falla el parseo, devolver como respuesta simple
        return c.json({ 
          response,
          isStructured: false
        });
      }
    }

    console.log('✅ Oti chat response generated successfully');

    return c.json({ response });
  } catch (error) {
    console.error('Error in Oti chat:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ====================
// USER DATA CLEANUP ENDPOINTS
// ====================

// PUBLIC: Clean invalid data for the authenticated user
app.post("/make-server-727b50c3/cleanup-invalid-data", async (c) => {
  try {
    // Verify user authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return c.json({ error: 'Sesión inválida' }, 401);
    }

    console.log(`\n========================================`);
    console.log(`🧹 USER DATA CLEANUP`);
    console.log(`   User: ${user.email}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`========================================\n`);

    // Call the cleanup function
    const result = await db.cleanInvalidUserData(user.id);

    const totalDeleted = result.deletedAccounts + result.deletedCategories + 
                        result.deletedSubcategories + result.deletedTransactions + 
                        result.deletedBudgets;

    console.log(`\n========================================`);
    console.log(`✅ CLEANUP COMPLETED`);
    console.log(`   Deleted Accounts: ${result.deletedAccounts}`);
    console.log(`   Deleted Categories: ${result.deletedCategories}`);
    console.log(`   Deleted Subcategories: ${result.deletedSubcategories}`);
    console.log(`   Deleted Transactions: ${result.deletedTransactions}`);
    console.log(`   Deleted Budgets: ${result.deletedBudgets}`);
    console.log(`   Total Items: ${totalDeleted}`);
    console.log(`========================================\n`);

    return c.json({
      success: true,
      message: totalDeleted > 0 
        ? `Se eliminaron ${totalDeleted} elementos inválidos`
        : 'No se encontraron datos inválidos',
      details: {
        deletedAccounts: result.deletedAccounts,
        deletedCategories: result.deletedCategories,
        deletedSubcategories: result.deletedSubcategories,
        deletedTransactions: result.deletedTransactions,
        deletedBudgets: result.deletedBudgets,
      }
    });
  } catch (error) {
    console.error('��� Error cleaning invalid data:', error);
    console.error('   Error details:', error instanceof Error ? error.message : String(error));
    return c.json({ error: 'Error al limpiar datos inválidos' }, 500);
  }
});

// PUBLIC: Check if user has invalid data
app.get("/make-server-727b50c3/check-invalid-data", async (c) => {
  try {
    // Verify user authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Sesión inválida' }, 401);
    }

    // Quick check for invalid data (just check if any exist)
    const serviceRoleSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Check for accounts with invalid IDs
    const { data: invalidAccounts } = await serviceRoleSupabase
      .from('accounts_727b50c3')
      .select('id')
      .eq('user_id', user.id)
      .or('id.is.null,id.eq.')
      .limit(1);

    // Check for categories with invalid IDs
    const { data: invalidCategories } = await serviceRoleSupabase
      .from('categories_727b50c3')
      .select('id')
      .eq('user_id', user.id)
      .or('id.is.null,id.eq.')
      .limit(1);

    const hasInvalidData = (invalidAccounts && invalidAccounts.length > 0) || 
                          (invalidCategories && invalidCategories.length > 0);

    return c.json({
      hasInvalidData,
      message: hasInvalidData 
        ? 'Se encontraron datos inválidos' 
        : 'No hay datos inválidos'
    });
  } catch (error) {
    console.error('Error checking invalid data:', error);
    return c.json({ error: 'Error al verificar datos' }, 500);
  }
});

// ====================
// 🔥 NUCLEAR RESET - LIMPIEZA TOTAL DEL SISTEMA
// ====================
// ⚠️ Este endpoint elimina TODO: usuarios, datos, configuraciones
app.post("/make-server-727b50c3/admin/nuclear-reset", async (c) => {
  try {
    console.log('🔥 INICIANDO LIMPIEZA NUCLEAR DEL SISTEMA...');

    const serviceRoleSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // PASO 1: Eliminar TODOS los datos de TODAS las tablas
    console.log('🗑️ Paso 1: Eliminando todos los datos de las tablas...');
    
    const tables = [
      'transactions_727b50c3',
      'budgets_727b50c3',
      'subcategories_727b50c3',
      'categories_727b50c3',
      'accounts_727b50c3',
      'user_growth_data_727b50c3',
      'user_devices_727b50c3',
      'tax_declarations_727b50c3',
      'chat_conversations_727b50c3',  // Chat (CASCADE deletes messages)
      'users_data',                    // User profiles
      'group_members_727b50c3',        // Group memberships (CRITICAL: before groups)
      'family_groups_727b50c3',        // Groups (CASCADE handles dependencies including invitations)
    ];

    let deletedRecords = 0;
    for (const table of tables) {
      try {
        const { count, error } = await serviceRoleSupabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except impossible ID
        
        if (error) {
          console.error(`❌ Error eliminando ${table}:`, error);
        } else {
          console.log(`✅ ${table}: ${count || 0} registros eliminados`);
          deletedRecords += count || 0;
        }
      } catch (err) {
        console.error(`❌ Error en tabla ${table}:`, err);
      }
    }

    // PASO 2: Eliminar TODOS los usuarios de Auth
    console.log('👥 Paso 2: Eliminando todos los usuarios de Auth...');
    
    const { data: allUsers, error: listError } = await serviceRoleSupabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listando usuarios:', listError);
    } else if (allUsers && allUsers.users) {
      console.log(`📋 Se encontraron ${allUsers.users.length} usuarios para eliminar`);
      
      let deletedUsers = 0;
      for (const user of allUsers.users) {
        try {
          const { error: deleteError } = await serviceRoleSupabase.auth.admin.deleteUser(user.id);
          if (deleteError) {
            console.error(`❌ Error eliminando usuario ${user.email}:`, deleteError);
          } else {
            console.log(`✅ Usuario eliminado: ${user.email}`);
            deletedUsers++;
          }
        } catch (err) {
          console.error(`❌ Error eliminando usuario ${user.email}:`, err);
        }
      }
      
      console.log(`🎯 Total de usuarios eliminados: ${deletedUsers}/${allUsers.users.length}`);
    }

    console.log('✅ ¡LIMPIEZA NUCLEAR COMPLETADA!');
    console.log(`📊 Resumen:`);
    console.log(`   - Registros eliminados: ${deletedRecords}`);
    console.log(`   - Usuarios eliminados: ${allUsers?.users?.length || 0}`);
    console.log(`   - Sistema completamente limpio y listo para usar`);

    return c.json({
      success: true,
      message: '🔥 Sistema completamente limpio',
      details: {
        deletedRecords,
        deletedUsers: allUsers?.users?.length || 0,
        clearedTables: tables,
      }
    });

  } catch (error) {
    console.error('💥 ERROR CRÍTICO en limpieza nuclear:', error);
    return c.json({ 
      error: 'Error durante la limpieza nuclear', 
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Translate i18n objects using OpenAI GPT-4
app.post("/make-server-727b50c3/translate", async (c) => {
  try {
    console.log('🌍 POST /translate - Translation request received');
    
    const body = await c.req.json();
    const { sourceText, targetLanguage } = body;

    if (!sourceText || !targetLanguage) {
      return c.json({ 
        error: 'Missing required parameters: sourceText and targetLanguage' 
      }, 400);
    }

    if (!['en', 'pt'].includes(targetLanguage)) {
      return c.json({ 
        error: 'Invalid targetLanguage. Must be "en" or "pt"' 
      }, 400);
    }

    console.log(`   Translating to ${targetLanguage}...`);
    const translated = await translateWithOpenAI(sourceText, targetLanguage);

    console.log('✅ Translation completed successfully');
    return c.json({
      success: true,
      translated,
    });

  } catch (error) {
    console.error('❌ Error in translation:', error);
    return c.json({ 
      error: 'Translation failed', 
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ====================
// OTI CONVERSATIONS ENDPOINTS
// ====================

// Helper: Generate conversation title using GPT-4o
async function generateTitleFromMessage(message: string): Promise<string> {
  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return 'Nueva conversación';
    }

    const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Genera un título corto (máximo 5 palabras) para una conversación basado en el primer mensaje del usuario. Responde SOLO con el título, sin comillas ni explicaciones.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 20,
      }),
    });

    if (!response.ok) {
      return 'Nueva conversación';
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating title:', error);
    return 'Nueva conversación';
  }
}

// POST /conversations - Create new conversation
app.post("/make-server-727b50c3/conversations", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId } = authResult;
    const body = await c.req.json();
    const { title, initialMessage } = body;

    console.log(`💬 Creating new conversation for user: ${userId}`);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Generate conversation ID
    const conversationId = crypto.randomUUID();
    
    // Generate title if not provided
    let conversationTitle = title;
    if (!conversationTitle && initialMessage) {
      conversationTitle = await generateTitleFromMessage(initialMessage);
    }
    if (!conversationTitle) {
      conversationTitle = 'Nueva conversación';
    }

    // Create conversation in database
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations_727b50c3')
      .insert({
        id: conversationId,
        user_id: userId,
        title: conversationTitle,
      })
      .select()
      .single();

    if (convError) {
      console.error('Error creating conversation:', convError);
      if (convError.message?.includes('relation') || convError.message?.includes('does not exist')) {
        return c.json({ 
          error: 'Las tablas de chat aún no han sido creadas. Por favor ejecuta el Script 5 en Supabase Dashboard.' 
        }, 503);
      }
      return c.json({ error: 'Error al crear conversación' }, 500);
    }

    // Add initial message if provided
    const messages = [];
    if (initialMessage) {
      const messageId = crypto.randomUUID();
      const { data: message, error: msgError } = await supabase
        .from('chat_messages_727b50c3')
        .insert({
          id: messageId,
          conversation_id: conversationId,
          role: 'user',
          content: initialMessage,
        })
        .select()
        .single();

      if (msgError) {
        console.error('Error creating initial message:', msgError);
        // Continue without throwing - conversation was created
      } else {
        messages.push(message);
      }
    }

    console.log(`✅ Conversation created: ${conversationId}`);

    return c.json({ 
      conversation: {
        ...conversation,
        messages,
      }
    });
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    return c.json({ error: 'Error al crear conversación' }, 500);
  }
});

// GET /conversations - List all conversations for user
app.get("/make-server-727b50c3/conversations", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId } = authResult;

    console.log(`📋 Listing conversations for user: ${userId}`);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Use the view with preview
    const { data: conversations, error } = await supabase
      .from('chat_conversations_with_preview')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error listing conversations:', error);
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return c.json({ 
          error: 'Las tablas de chat aún no han sido creadas. Por favor ejecuta el Script 5 en Supabase Dashboard.',
          conversations: [] 
        }, 200); // Return empty array instead of error for better UX
      }
      return c.json({ error: 'Error al listar conversaciones' }, 500);
    }

    // Helper function to extract clean preview from message content
    const getCleanPreview = (content: string, maxLength = 100): string => {
      if (!content) return '';
      try {
        // Try to parse as JSON (structured response)
        const parsed = JSON.parse(content);
        
        // If it's a structured response, extract the message text
        if (parsed.type === 'structured' && parsed.message) {
          return parsed.message.slice(0, maxLength);
        } else if (parsed.type === 'simple' && parsed.message) {
          return parsed.message.slice(0, maxLength);
        } else if (parsed.summary) {
          return parsed.summary.slice(0, maxLength);
        }
        
        // If it's JSON but not structured response, return content as is (truncated)
        return content.slice(0, maxLength);
      } catch (e) {
        // Not JSON, return plain text (truncated)
        return content.slice(0, maxLength);
      }
    };

    // Format for frontend
    const summaries = conversations.map((conv: any) => ({
      id: conv.id,
      userId: conv.user_id,
      title: conv.title,
      messageCount: conv.message_count,
      lastMessagePreview: getCleanPreview(conv.last_message_preview, 100),
      createdAt: conv.created_at,
      updatedAt: conv.updated_at,
    }));

    console.log(`✅ Found ${summaries.length} conversations`);

    return c.json({ conversations: summaries });
  } catch (error) {
    console.error('❌ Error listing conversations:', error);
    return c.json({ error: 'Error al listar conversaciones' }, 500);
  }
});

// GET /conversations/:id - Get specific conversation
app.get("/make-server-727b50c3/conversations/:id", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId } = authResult;
    const conversationId = c.req.param('id');

    console.log(`📖 Getting conversation: ${conversationId}`);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get conversation
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations_727b50c3')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (convError || !conversation) {
      return c.json({ error: 'Conversación no encontrada' }, 404);
    }

    // Get messages
    const { data: messages, error: msgError } = await supabase
      .from('chat_messages_727b50c3')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('Error getting messages:', msgError);
      return c.json({ error: 'Error al obtener mensajes' }, 500);
    }

    console.log(`✅ Conversation retrieved with ${messages.length} messages`);

    return c.json({ 
      conversation: {
        id: conversation.id,
        userId: conversation.user_id,
        title: conversation.title,
        messages: messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.created_at,
        })),
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
      }
    });
  } catch (error) {
    console.error('❌ Error getting conversation:', error);
    return c.json({ error: 'Error al obtener conversación' }, 500);
  }
});

// PATCH /conversations/:id - Update conversation title
app.patch("/make-server-727b50c3/conversations/:id", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId } = authResult;
    const conversationId = c.req.param('id');
    const body = await c.req.json();
    const { title } = body;

    if (!title) {
      return c.json({ error: 'Título requerido' }, 400);
    }

    console.log(`✏️ Updating conversation: ${conversationId}`);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Update conversation
    const { data: conversation, error } = await supabase
      .from('chat_conversations_727b50c3')
      .update({ title })
      .eq('id', conversationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !conversation) {
      return c.json({ error: 'Conversación no encontrada' }, 404);
    }

    console.log(`✅ Conversation updated`);

    return c.json({ 
      conversation: {
        id: conversation.id,
        userId: conversation.user_id,
        title: conversation.title,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
      }
    });
  } catch (error) {
    console.error('❌ Error updating conversation:', error);
    return c.json({ error: 'Error al actualizar conversación' }, 500);
  }
});

// DELETE /conversations/:id - Delete conversation
app.delete("/make-server-727b50c3/conversations/:id", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId } = authResult;
    const conversationId = c.req.param('id');

    console.log(`🗑️ Deleting conversation: ${conversationId}`);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Delete conversation (messages will be deleted automatically via CASCADE)
    const { error } = await supabase
      .from('chat_conversations_727b50c3')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting conversation:', error);
      return c.json({ error: 'Error al eliminar conversación' }, 500);
    }

    console.log(`✅ Conversation deleted`);

    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting conversation:', error);
    return c.json({ error: 'Error al eliminar conversación' }, 500);
  }
});

// POST /conversations/:id/messages - Add message to conversation
app.post("/make-server-727b50c3/conversations/:id/messages", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const { userId } = authResult;
    const conversationId = c.req.param('id');
    const body = await c.req.json();
    const { role, content, tokensUsed } = body;

    if (!role || !content) {
      return c.json({ error: 'Role y content requeridos' }, 400);
    }

    console.log(`➕ Adding message to conversation: ${conversationId}`);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify conversation exists and belongs to user
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations_727b50c3')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (convError || !conversation) {
      return c.json({ error: 'Conversación no encontrada' }, 404);
    }

    // Add message
    const messageId = crypto.randomUUID();
    const { data: message, error: msgError } = await supabase
      .from('chat_messages_727b50c3')
      .insert({
        id: messageId,
        conversation_id: conversationId,
        role,
        content,
        tokens_used: tokensUsed || null,
      })
      .select()
      .single();

    if (msgError) {
      console.error('Error adding message:', msgError);
      return c.json({ error: 'Error al agregar mensaje' }, 500);
    }

    console.log(`✅ Message added`);

    // Return message in frontend format
    return c.json({ 
      message: {
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.created_at,
      }
    });
  } catch (error) {
    console.error('❌ Error adding message:', error);
    return c.json({ error: 'Error al agregar mensaje' }, 500);
  }
});

// POST /conversations/generate-title - Generate title from message
app.post("/make-server-727b50c3/conversations/generate-title", async (c) => {
  try {
    const authResult = await verifyUser(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const body = await c.req.json();
    const { message } = body;

    if (!message) {
      return c.json({ error: 'Mensaje requerido' }, 400);
    }

    console.log(`🏷️ Generating title from message`);

    const title = await generateTitleFromMessage(message);

    console.log(`✅ Title generated: ${title}`);

    return c.json({ title });
  } catch (error) {
    console.error('❌ Error generating title:', error);
    return c.json({ error: 'Error al generar título' }, 500);
  }
});

// ====================
// 👥 FAMILY GROUPS ROUTES
// ====================

// Helper function to verify user for family routes
async function verifyUserForFamily(authHeader: string | undefined) {
  const accessToken = authHeader?.split(' ')[1];
  
  if (!accessToken) {
    return { error: 'No autorizado', status: 401 };
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return { error: 'Sesión inválida', status: 401 };
  }

  return { userId: user.id, email: user.email };
}

// POST /family/groups - Crear nuevo grupo familiar
app.post('/make-server-727b50c3/family/groups', async (c) => {
  try {
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const body = await c.req.json();
    const { name, emoji, config } = body;

    // Validar nombre
    if (!familyDb.validateGroupName(name)) {
      return c.json({ error: 'Nombre debe tener entre 3 y 100 caracteres' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Crear grupo
    const group = await familyDb.createFamilyGroup(supabase, {
      name: name.trim(),
      emoji: emoji || '🏠',
      created_by: authResult.userId!,
      require_approval_to_join: config?.requireApprovalToJoin ?? true,
      allow_guest_view: config?.allowGuestView ?? false,
      currency: config?.currency || 'COP',
    });

    // Agregar creador como admin
    const member = await familyDb.addGroupMember(supabase, {
      group_id: group.id,
      user_id: authResult.userId!,
      role: 'admin',
      status: 'active',
      nickname: 'Admin',
      emoji: '👨‍💼',
    });

    console.log(`✅ Family group created: ${group.id} by ${authResult.email}`);

    return c.json({ group, member });
  } catch (error) {
    console.error('❌ Error creating family group:', error);
    return c.json({ error: 'Error al crear grupo familiar' }, 500);
  }
});

// GET /family/groups - Listar grupos del usuario
app.get('/make-server-727b50c3/family/groups', async (c) => {
  try {
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Obtener grupos del usuario
    const groups = await familyDb.getUserGroups(supabase, authResult.userId!);

    // Para cada grupo, obtener miembros
    const groupsWithMembers = await Promise.all(
      groups.map(async (group: any) => {
        const members = await familyDb.getGroupMembers(supabase, group.id, true);
        return {
          ...group,
          memberCount: members.length,
          members: members.map((m: any) => ({
            id: m.id,
            userId: m.user_id,
            nickname: m.nickname,
            emoji: m.emoji,
            role: m.role,
          })),
        };
      })
    );

    return c.json({ groups: groupsWithMembers });
  } catch (error) {
    console.error('❌ Error listing family groups:', error);
    return c.json({ error: 'Error al listar grupos' }, 500);
  }
});

// GET /family/groups/:id - Obtener detalles de un grupo
app.get('/make-server-727b50c3/family/groups/:id', async (c) => {
  try {
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const groupId = c.req.param('id');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificar que usuario es miembro
    const isMember = await familyDb.isUserGroupMember(supabase, groupId, authResult.userId!);
    
    if (!isMember) {
      return c.json({ error: 'No eres miembro de este grupo' }, 403);
    }

    // Obtener grupo
    const group = await familyDb.getGroupById(supabase, groupId);
    
    if (!group) {
      return c.json({ error: 'Grupo no encontrado' }, 404);
    }

    // Obtener miembros
    const members = await familyDb.getGroupMembers(supabase, groupId, true);

    return c.json({ 
      group: {
        ...group,
        members,
      },
    });
  } catch (error) {
    console.error('❌ Error getting group details:', error);
    return c.json({ error: 'Error al obtener detalles del grupo' }, 500);
  }
});

// POST /family/groups/:id/transactions - Compartir transacción en grupo
app.post('/make-server-727b50c3/family/groups/:id/transactions', async (c) => {
  try {
    console.log('📥 ========== SHARE TRANSACTION REQUEST ==========');
    
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      console.log('❌ Auth failed:', authResult.error);
      return c.json({ error: authResult.error }, authResult.status);
    }

    const groupId = c.req.param('id');
    
    let body;
    try {
      body = await c.req.json();
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return c.json({ error: 'Formato de datos inválido' }, 400);
    }
    
    // Validar datos requeridos
    if (!body.type || !body.amount || !body.date) {
      console.error('❌ Missing required fields:', { type: body.type, amount: body.amount, date: body.date });
      return c.json({ error: 'Faltan campos requeridos (type, amount, date)' }, 400);
    }
    
    console.log('📝 Request data:', {
      groupId,
      userId: authResult.userId,
      type: body.type,
      amount: body.amount,
      category: body.category,
      subcategory: body.subcategory,
      date: body.date,
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificar que usuario es miembro
    console.log('👥 Checking membership...');
    const isMember = await familyDb.isUserGroupMember(supabase, groupId, authResult.userId!);
    
    if (!isMember) {
      console.log('❌ User is not a member of group:', groupId);
      return c.json({ error: 'No eres miembro de este grupo' }, 403);
    }
    
    console.log('✅ User is member, sharing transaction...');

    // Compartir transacción
    let transaction;
    try {
      transaction = await familyDb.shareTransactionToGroup(supabase, {
        group_id: groupId,
        original_transaction_id: body.originalTransactionId || null,
        shared_by_user_id: authResult.userId!,
        transaction_type: body.type,
        amount: parseFloat(body.amount),
        category: body.category || null,
        subcategory: body.subcategory || null,
        description: body.description || null,
        transaction_date: body.date,
        visibility: body.visibility || 'all',
        receipt_url: body.receiptUrl || null, // ✨ Comprobante adjunto
      });
      console.log('✅ Transaction created in DB:', transaction.id);
    } catch (dbError) {
      console.error('❌ Database error while sharing transaction:', dbError);
      return c.json({ 
        error: 'Error al guardar transacción en la base de datos',
        details: dbError instanceof Error ? dbError.message : String(dbError)
      }, 500);
    }

    console.log('✅ Transaction shared, creating notification...');

    // Crear notificación (no bloquear si falla)
    try {
      const members = await familyDb.getGroupMembers(supabase, groupId, true);
      const sharedByMember = members.find((m: any) => m.user_id === authResult.userId);
      
      await familyDb.createNotification(supabase, {
        group_id: groupId,
        notification_type: 'new_transaction',
        triggered_by_user_id: authResult.userId!,
        message: `${sharedByMember?.nickname || 'Un miembro'} compartió una transacción: ${body.description || 'Sin descripción'}`,
        group_transaction_id: transaction.id,
      });
      console.log('✅ Notification created');
    } catch (notifError) {
      console.error('⚠️  Error creating notification (non-critical):', notifError);
      // No fallar la request si la notificación falla
    }

    console.log(`✅ Transaction shared to group ${groupId} successfully`);

    // Mapear snake_case a camelCase para el frontend
    const mappedTransaction = {
      id: transaction.id,
      groupId: transaction.group_id,
      originalTransactionId: transaction.original_transaction_id,
      sharedByUserId: transaction.shared_by_user_id,
      transactionType: transaction.transaction_type,
      amount: transaction.amount,
      category: transaction.category,
      subcategory: transaction.subcategory,
      description: transaction.description,
      transactionDate: transaction.transaction_date,
      visibility: transaction.visibility,
      isIntrafamilyTransfer: transaction.is_intrafamily_transfer,
      involvedMembers: transaction.involved_members,
      receiptUrl: transaction.receipt_url, // ✨ Comprobante adjunto
      createdAt: transaction.created_at,
    };

    console.log('📤 Sending response with transaction:', mappedTransaction.id);
    const response = c.json({ transaction: mappedTransaction });
    console.log('✅ Response created successfully');
    console.log('========== END SHARE TRANSACTION REQUEST ==========');
    return response;
  } catch (error) {
    console.error('❌ ========== ERROR IN SHARE TRANSACTION ==========');
    console.error('❌ Error type:', error?.constructor?.name);
    console.error('❌ Error message:', error instanceof Error ? error.message : String(error));
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('❌ ================================================');
    
    return c.json({ 
      error: 'Error al compartir transacción',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// GET /family/groups/:id/transactions - Obtener transacciones del grupo
app.get('/make-server-727b50c3/family/groups/:id/transactions', async (c) => {
  try {
    console.log('📥 ========== GET GROUP TRANSACTIONS ==========');
    
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      console.log('❌ Auth failed:', authResult.error);
      return c.json({ error: authResult.error }, authResult.status);
    }

    const groupId = c.req.param('id');
    const limit = parseInt(c.req.query('limit') || '50', 10);
    const offset = parseInt(c.req.query('offset') || '0', 10);
    
    console.log('📝 Request params:', { groupId, limit, offset, userId: authResult.userId });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificar que usuario es miembro
    console.log('👥 Checking membership...');
    const isMember = await familyDb.isUserGroupMember(supabase, groupId, authResult.userId!);
    
    if (!isMember) {
      console.log('❌ User is not member of group');
      return c.json({ error: 'No eres miembro de este grupo' }, 403);
    }
    
    console.log('✅ User is member, fetching transactions...');

    // Obtener transacciones
    const transactions = await familyDb.getGroupTransactions(supabase, groupId, {
      limit,
      offset,
    });
    
    console.log(`📊 Found ${transactions.length} transactions from DB`);
    console.log('📊 Transactions order (should be newest first):');
    transactions.forEach((t: any, idx: number) => {
      console.log(`  ${idx}: ${t.id.substring(0, 8)}... ${t.transaction_date} - ${t.description || 'No desc'} - receipt: ${t.receipt_url ? 'YES' : 'NO'}`);
    });

    // Obtener miembros del grupo para agregar información de sharedByMember
    console.log('👥 Fetching group members...');
    const members = await familyDb.getGroupMembers(supabase, groupId, true);
    console.log(`✅ Found ${members.length} members`);

    // Para cada transacción, obtener reacciones y comentarios Y mapear a camelCase
    console.log('🔄 Processing transactions with details...');
    const transactionsWithDetails = await Promise.all(
      transactions.map(async (t: any) => {
        const reactionsRaw = await familyDb.getReactions(supabase, t.id);
        const commentsRaw = await familyDb.getComments(supabase, t.id);
        
        // Transformar reacciones a camelCase
        const reactions = reactionsRaw.map((r: any) => ({
          id: r.id,
          groupTransactionId: r.group_transaction_id,
          userId: r.user_id,
          emoji: r.emoji,
          createdAt: r.created_at,
          userNickname: r.userNickname,
          userEmoji: r.userEmoji,
        }));

        // Transformar comentarios a camelCase
        const comments = commentsRaw.map((c: any) => ({
          id: c.id,
          groupTransactionId: c.group_transaction_id,
          userId: c.user_id,
          text: c.text,
          createdAt: c.created_at,
          userNickname: c.userNickname,
          userEmoji: c.userEmoji,
        }));

        // Buscar información del miembro que compartió la transacción
        const sharedByMember = members.find((m: any) => m.user_id === t.shared_by_user_id);
        
        // Mapear snake_case a camelCase para el frontend
        return {
          id: t.id,
          groupId: t.group_id,
          originalTransactionId: t.original_transaction_id,
          sharedByUserId: t.shared_by_user_id,
          transactionType: t.transaction_type,
          amount: t.amount,
          category: t.category,
          subcategory: t.subcategory,
          description: t.description,
          transactionDate: t.transaction_date,
          visibility: t.visibility,
          isIntrafamilyTransfer: t.is_intrafamily_transfer,
          involvedMembers: t.involved_members,
          receiptUrl: t.receipt_url, // ✨ Comprobante adjunto
          createdAt: t.created_at,
          reactions,
          comments,
          sharedByMember: sharedByMember ? {
            userId: sharedByMember.user_id,
            nickname: sharedByMember.nickname,
            emoji: sharedByMember.emoji,
            role: sharedByMember.role,
          } : undefined,
        };
      })
    );

    console.log(`✅ Processed ${transactionsWithDetails.length} transactions`);
    console.log('📤 Sending response...');
    console.log('========== END GET GROUP TRANSACTIONS ==========');
    
    return c.json({ transactions: transactionsWithDetails });
  } catch (error) {
    console.error('❌ Error getting group transactions:', error);
    return c.json({ error: 'Error al obtener transacciones del grupo' }, 500);
  }
});

// PUT /family/groups/:groupId/transactions/:transactionId - Actualizar transacción
app.put('/make-server-727b50c3/family/groups/:groupId/transactions/:transactionId', async (c) => {
  try {
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const groupId = c.req.param('groupId');
    const transactionId = c.req.param('transactionId');
    const body = await c.req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificar que usuario es miembro
    const isMember = await familyDb.isUserGroupMember(supabase, groupId, authResult.userId!);
    
    if (!isMember) {
      return c.json({ error: 'No eres miembro de este grupo' }, 403);
    }

    // Obtener la transacción para verificar que el usuario es el creador
    const { data: transaction, error: fetchError } = await supabase
      .from('group_transactions_727b50c3')
      .select('shared_by_user_id')
      .eq('id', transactionId)
      .eq('group_id', groupId)
      .single();

    if (fetchError || !transaction) {
      return c.json({ error: 'Transacción no encontrada' }, 404);
    }

    // Verificar que el usuario actual es quien creó la transacción
    if (transaction.shared_by_user_id !== authResult.userId) {
      return c.json({ error: 'Solo puedes editar tus propias transacciones' }, 403);
    }

    // Validar datos
    if (body.amount !== undefined && (isNaN(body.amount) || body.amount <= 0)) {
      return c.json({ error: 'Monto inválido' }, 400);
    }

    // Actualizar transacción
    const updates: any = {};
    if (body.amount !== undefined) updates.amount = body.amount;
    if (body.category !== undefined) updates.category = body.category;
    if (body.subcategory !== undefined) updates.subcategory = body.subcategory;
    if (body.description !== undefined) updates.description = body.description;
    if (body.transactionDate !== undefined) updates.transaction_date = body.transactionDate;
    if (body.transactionType !== undefined) updates.transaction_type = body.transactionType;

    const updatedTransaction = await familyDb.updateGroupTransaction(supabase, transactionId, updates);

    console.log(`✅ Transaction ${transactionId} updated by user ${authResult.userId}`);

    return c.json({ transaction: updatedTransaction });
  } catch (error) {
    console.error('❌ Error updating group transaction:', error);
    return c.json({ error: 'Error al actualizar transacción' }, 500);
  }
});

// DELETE /family/groups/:groupId/transactions/:transactionId - Eliminar transacción
app.delete('/make-server-727b50c3/family/groups/:groupId/transactions/:transactionId', async (c) => {
  try {
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const groupId = c.req.param('groupId');
    const transactionId = c.req.param('transactionId');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificar que usuario es miembro
    const isMember = await familyDb.isUserGroupMember(supabase, groupId, authResult.userId!);
    
    if (!isMember) {
      return c.json({ error: 'No eres miembro de este grupo' }, 403);
    }

    // Obtener la transacción para verificar que el usuario es el creador
    const { data: transaction, error: fetchError } = await supabase
      .from('group_transactions_727b50c3')
      .select('shared_by_user_id')
      .eq('id', transactionId)
      .eq('group_id', groupId)
      .single();

    if (fetchError || !transaction) {
      return c.json({ error: 'Transacción no encontrada' }, 404);
    }

    // Verificar que el usuario actual es quien creó la transacción
    if (transaction.shared_by_user_id !== authResult.userId) {
      return c.json({ error: 'Solo puedes eliminar tus propias transacciones' }, 403);
    }

    // Eliminar transacción (incluyendo reacciones y comentarios)
    await familyDb.deleteGroupTransaction(supabase, transactionId);

    console.log(`✅ Transaction ${transactionId} deleted by user ${authResult.userId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting group transaction:', error);
    return c.json({ error: 'Error al eliminar transacción' }, 500);
  }
});

// POST /family/groups/:groupId/transactions/:transactionId/reactions - Agregar reacción
app.post('/make-server-727b50c3/family/groups/:groupId/transactions/:transactionId/reactions', async (c) => {
  try {
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const groupId = c.req.param('groupId');
    const transactionId = c.req.param('transactionId');
    const body = await c.req.json();
    const { emoji } = body;

    console.log('🎭 POST reaction request:', { 
      groupId, 
      transactionId, 
      emoji, 
      userId: authResult.userId 
    });

    if (!emoji) {
      return c.json({ error: 'Emoji requerido' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificar que usuario es miembro
    const isMember = await familyDb.isUserGroupMember(supabase, groupId, authResult.userId!);
    
    if (!isMember) {
      return c.json({ error: 'No eres miembro de este grupo' }, 403);
    }

    // Verificar si el usuario ya tiene una reacción
    const existingReactions = await familyDb.getReactions(supabase, transactionId);
    const userReaction = existingReactions.find((r: any) => r.user_id === authResult.userId);

    console.log('🔍 Checking existing reactions:', { 
      totalReactions: existingReactions.length,
      userHasReaction: !!userReaction,
      userCurrentEmoji: userReaction?.emoji,
      newEmoji: emoji,
      isSameEmoji: userReaction?.emoji === emoji
    });

    let reactionRaw;
    let action = 'added';

    if (userReaction) {
      // Si ya tiene una reacción con el mismo emoji, la eliminamos (toggle)
      if (userReaction.emoji === emoji) {
        await familyDb.removeReaction(supabase, transactionId, authResult.userId!);
        console.log(`✅ Reaction removed (toggle): ${emoji}`);
        return c.json({ reaction: null, action: 'removed' });
      } else {
        // Si tiene una reacción diferente, la actualizamos
        await familyDb.removeReaction(supabase, transactionId, authResult.userId!);
        reactionRaw = await familyDb.addReaction(supabase, {
          group_transaction_id: transactionId,
          user_id: authResult.userId!,
          emoji,
        });
        action = 'updated';
        console.log(`✅ Reaction updated: ${userReaction.emoji} → ${emoji}`);
      }
    } else {
      // Agregar nueva reacción
      reactionRaw = await familyDb.addReaction(supabase, {
        group_transaction_id: transactionId,
        user_id: authResult.userId!,
        emoji,
      });
      console.log(`✅ Reaction added: ${emoji}`);
    }

    // Transformar reacción a camelCase
    const reaction = {
      id: reactionRaw.id,
      groupTransactionId: reactionRaw.group_transaction_id,
      userId: reactionRaw.user_id,
      emoji: reactionRaw.emoji,
      createdAt: reactionRaw.created_at,
      userNickname: reactionRaw.userNickname,
      userEmoji: reactionRaw.userEmoji,
    };

    // Crear notificación solo para nuevas reacciones (no bloquear si falla)
    if (action === 'added') {
      try {
        const members = await familyDb.getGroupMembers(supabase, groupId, true);
        const reactionAuthor = members.find((m: any) => m.user_id === authResult.userId);
        const otherMembers = members.filter((m: any) => m.user_id !== authResult.userId);
        
        const notification = await familyDb.createNotification(supabase, {
          group_id: groupId,
          notification_type: 'reaction',
          triggered_by_user_id: authResult.userId!,
          message: `${reactionAuthor?.nickname || 'Un miembro'} reaccionó con ${emoji}`,
          group_transaction_id: transactionId,
        });
        
        console.log(`🔔 Notification created for reaction on transaction ${transactionId}:`, {
          notificationId: notification.id,
          groupId: groupId,
          triggeredBy: authResult.userId,
          triggeredByNickname: reactionAuthor?.nickname,
          emoji: emoji,
          totalMembers: members.length,
          otherMembers: otherMembers.length,
          shouldNotify: otherMembers.map((m: any) => `${m.nickname} (${m.user_id})`).join(', '),
          message: notification.message,
        });
      } catch (notifError) {
        console.error('⚠️  Error creating reaction notification (non-critical):', notifError);
      }
    }

    return c.json({ reaction, action });
  } catch (error) {
    console.error('❌ Error adding reaction:', error);
    return c.json({ error: 'Error al agregar reacción' }, 500);
  }
});

// DELETE /family/groups/:groupId/transactions/:transactionId/reactions - Eliminar reacción
app.delete('/make-server-727b50c3/family/groups/:groupId/transactions/:transactionId/reactions', async (c) => {
  try {
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const groupId = c.req.param('groupId');
    const transactionId = c.req.param('transactionId');

    console.log('🗑️  Removing reaction:', { 
      groupId, 
      transactionId, 
      userId: authResult.userId 
    });

    // Verificar que el usuario es miembro del grupo
    const member = await familyDb.getGroupMemberByUserId(supabase, groupId, authResult.userId!);
    if (!member) {
      console.log('❌ User is not a member of the group');
      return c.json({ error: 'No eres miembro de este grupo' }, 403);
    }

    console.log('✅ User is member, proceeding to remove reaction...');

    // Eliminar la reacción del usuario
    // Si no existe, no pasa nada (idempotente)
    await familyDb.removeReaction(supabase, transactionId, authResult.userId!);

    console.log(`✅ Reaction removed by user ${authResult.userId} from transaction ${transactionId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Error removing reaction:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return c.json({ error: 'Error al eliminar reacción' }, 500);
  }
});

// POST /family/groups/:groupId/transactions/:transactionId/comments - Agregar comentario
app.post('/make-server-727b50c3/family/groups/:groupId/transactions/:transactionId/comments', async (c) => {
  try {
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const groupId = c.req.param('groupId');
    const transactionId = c.req.param('transactionId');
    const body = await c.req.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return c.json({ error: 'Texto del comentario requerido' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificar que usuario es miembro del grupo
    const isMember = await familyDb.isUserGroupMember(supabase, groupId, authResult.userId!);
    
    if (!isMember) {
      return c.json({ error: 'No eres miembro de este grupo' }, 403);
    }

    // Agregar comentario
    const commentRaw = await familyDb.addComment(supabase, {
      group_transaction_id: transactionId,
      user_id: authResult.userId!,
      text: text.trim(),
    });

    // Transformar comentario a camelCase
    const comment = {
      id: commentRaw.id,
      groupTransactionId: commentRaw.group_transaction_id,
      userId: commentRaw.user_id,
      text: commentRaw.text,
      createdAt: commentRaw.created_at,
      userNickname: commentRaw.userNickname,
      userEmoji: commentRaw.userEmoji,
    };

    console.log(`✅ Comment added to transaction ${transactionId}`);

    // Crear notificación para otros miembros (no bloquear si falla)
    try {
      const members = await familyDb.getGroupMembers(supabase, groupId, true);
      const commentAuthor = members.find((m: any) => m.user_id === authResult.userId);
      const otherMembers = members.filter((m: any) => m.user_id !== authResult.userId);
      
      const notification = await familyDb.createNotification(supabase, {
        group_id: groupId,
        notification_type: 'comment',
        triggered_by_user_id: authResult.userId!,
        message: `${commentAuthor?.nickname || 'Un miembro'} comentó: "${text.trim().substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
        group_transaction_id: transactionId,
      });
      
      console.log(`🔔 Notification created for comment on transaction ${transactionId}:`, {
        notificationId: notification.id,
        groupId: groupId,
        triggeredBy: authResult.userId,
        triggeredByNickname: commentAuthor?.nickname,
        totalMembers: members.length,
        otherMembers: otherMembers.length,
        shouldNotify: otherMembers.map((m: any) => `${m.nickname} (${m.user_id})`).join(', '),
        message: notification.message.substring(0, 80),
      });
    } catch (notifError) {
      console.error('⚠️  Error creating comment notification (non-critical):', notifError);
    }

    return c.json({ comment });
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    return c.json({ error: 'Error al agregar comentario' }, 500);
  }
});

// GET /family/database/check - Verificar columnas de la base de datos
app.get('/make-server-727b50c3/family/database/check', async (c) => {
  try {
    console.log('🔍 ========== DATABASE STRUCTURE CHECK ==========');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const results: any = {
      timestamp: new Date().toISOString(),
      tables: {},
    };

    // Verificar columnas en group_transactions_727b50c3
    console.log('📊 Checking group_transactions_727b50c3 table...');
    
    const tablesToCheck = [
      { name: 'group_transactions_727b50c3', columns: ['subcategory', 'receipt_url'] },
      { name: 'transactions_727b50c3', columns: ['receipt_url'] },
    ];

    for (const table of tablesToCheck) {
      console.log(`\n🔍 Checking table: ${table.name}`);
      results.tables[table.name] = { columns: {} };
      
      for (const column of table.columns) {
        console.log(`  → Checking column: ${column}`);
        const { error } = await supabase
          .from(table.name)
          .select(column)
          .limit(1);

        if (error) {
          if (error.message?.includes(`column "${column}" does not exist`)) {
            console.log(`  ❌ Column "${column}" DOES NOT EXIST`);
            results.tables[table.name].columns[column] = {
              exists: false,
              error: error.message,
              sqlToFix: `ALTER TABLE ${table.name} ADD COLUMN ${column} TEXT;`,
            };
          } else {
            console.log(`  ⚠️  Unknown error checking "${column}":`, error.message);
            results.tables[table.name].columns[column] = {
              exists: 'unknown',
              error: error.message,
            };
          }
        } else {
          console.log(`  ✅ Column "${column}" EXISTS`);
          results.tables[table.name].columns[column] = {
            exists: true,
          };
        }
      }
    }

    console.log('\n📋 Check completed');
    console.log('='.repeat(50));

    return c.json(results);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    return c.json({ error: 'Error al verificar base de datos' }, 500);
  }
});

// GET /family/notifications - Obtener notificaciones del usuario
app.get('/make-server-727b50c3/family/notifications', async (c) => {
  try {
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const limit = parseInt(c.req.query('limit') || '50', 10);
    const groupId = c.req.query('groupId'); // Opcional: filtrar por grupo específico

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Obtener notificaciones
    let notifications = await familyDb.getUserGroupNotifications(supabase, authResult.userId!, limit);

    // Si se especifica un groupId, filtrar solo las de ese grupo
    if (groupId) {
      notifications = notifications.filter((n: any) => n.group_id === groupId);
    }

    // Calcular no leídas
    const unreadCount = notifications.filter((n: any) => 
      !n.read_by || !n.read_by[authResult.userId!]
    ).length;

    console.log(`📬 Notifications fetched: ${notifications.length} total${groupId ? ` (filtered by group ${groupId})` : ''}, ${unreadCount} unread`);

    return c.json({ 
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('❌ Error getting notifications:', error);
    return c.json({ error: 'Error al obtener notificaciones' }, 500);
  }
});

// =====================================================
// INVITACIONES
// =====================================================

// POST /family/invitations - Enviar invitación por email
app.post('/make-server-727b50c3/family/invitations', async (c) => {
  try {
    console.log('📨 ========== SEND INVITATION REQUEST ==========');
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      console.error('❌ Auth error:', authResult.error);
      return c.json({ error: authResult.error }, authResult.status);
    }

    console.log('✅ Auth verified:', authResult);

    const { groupId, email } = await c.req.json();
    console.log('📩 Invitation request:', { groupId, email });

    if (!groupId || !email) {
      return c.json({ error: 'groupId y email son requeridos' }, 400);
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Email inválido' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificar que usuario es admin del grupo
    console.log('🔍 Checking if user is admin...');
    const member = await familyDb.getGroupMemberByUserId(supabase, groupId, authResult.userId!);
    console.log('👤 Member found:', member);
    
    if (!member || member.role !== 'admin') {
      console.error('❌ User is not admin');
      return c.json({ error: 'Solo los administradores pueden enviar invitaciones' }, 403);
    }
    console.log('✅ User is admin');

    // Verificar que el email no sea ya miembro
    console.log('🔍 Checking if user already exists...');
    const { data: existingUserData } = await supabase.auth.admin.listUsers();
    const existingUser = existingUserData?.users.find((u: any) => u.email === email);
    console.log('👤 Existing user:', existingUser ? 'Found' : 'Not found');
    
    if (existingUser) {
      const isAlreadyMember = await familyDb.isUserGroupMember(supabase, groupId, existingUser.id);
      if (isAlreadyMember) {
        return c.json({ error: 'Este usuario ya es miembro del grupo' }, 400);
      }
    }

    // Verificar si ya existe una invitación pendiente
    const hasPending = await invitationsDb.hasPendingInvitation(supabase, groupId, email);

    if (hasPending) {
      return c.json({ error: 'Ya existe una invitación pendiente para este email' }, 400);
    }

    // Crear invitación
    const invitationId = crypto.randomUUID();
    const invitationCode = `FAM-${invitationId.substring(0, 8).toUpperCase()}`;
    
    const invitation = await invitationsDb.createInvitation(supabase, {
      group_id: groupId,
      email: email.toLowerCase(),
      invited_by: authResult.userId!,
      invited_by_email: authResult.email!,
      code: invitationCode,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
    });

    // Crear notificación para el invitado (si tiene cuenta)
    if (existingUser) {
      const group = await familyDb.getGroupById(supabase, groupId);
      const existingUserId = String(existingUser.id);
      
      // Crear notificación usando el nuevo sistema
      await notificationsDb.createNotification(supabase, {
        user_id: existingUserId,
        type: 'invitation_received',
        title: `Invitación a ${group?.name || 'un grupo'}`,
        message: `${authResult.email} te invitó a unirte`,
        data: { invitationId: invitation.id, groupId },
        priority: 'normal',
        created_by: authResult.userId!,
        related_entity_type: 'family_invitation',
        related_entity_id: invitation.id,
      });
    }

    console.log(`✅ Invitation sent for group ${groupId}${existingUser ? ' (user exists)' : ' (user not registered yet)'}`);

    // Mapear campos SQL a formato esperado por el frontend
    return c.json({ 
      invitation: {
        id: invitation.id,
        groupId: invitation.group_id,
        email: invitation.email,
        invitedBy: invitation.invited_by,
        invitedByEmail: invitation.invited_by_email,
        status: invitation.status,
        code: invitation.code,
        createdAt: invitation.created_at,
        expiresAt: invitation.expires_at,
      },
      userExists: !!existingUser, // Indicar si el usuario ya existe
      notificationSent: !!existingUser, // Indicar si se envió notificación
    });
  } catch (error) {
    console.error('❌ Error sending invitation:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('❌ Error message:', error instanceof Error ? error.message : String(error));
    return c.json({ 
      error: 'Error al enviar invitación',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// GET /family/invitations - Obtener invitaciones recibidas
app.get('/make-server-727b50c3/family/invitations', async (c) => {
  try {
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Obtener email del usuario
    const userEmail = authResult.email?.toLowerCase();

    if (!userEmail) {
      return c.json({ error: 'No se pudo obtener el email del usuario' }, 400);
    }

    // Obtener invitaciones pendientes del usuario
    const userInvitations = await invitationsDb.getUserPendingInvitations(supabase, userEmail);

    // Agregar información del grupo a cada invitación
    const invitationsWithGroupInfo = await Promise.all(
      userInvitations.map(async (inv) => {
        const group = await familyDb.getGroupById(supabase, inv.group_id);
        return {
          id: inv.id,
          groupId: inv.group_id,
          email: inv.email,
          invitedBy: inv.invited_by,
          invitedByEmail: inv.invited_by_email,
          status: inv.status,
          code: inv.code,
          createdAt: inv.created_at,
          expiresAt: inv.expires_at,
          groupName: group?.name || 'Grupo desconocido',
          groupEmoji: group?.emoji || '🏠',
        };
      })
    );

    return c.json({ invitations: invitationsWithGroupInfo });
  } catch (error) {
    console.error('❌ Error getting invitations:', error);
    return c.json({ error: 'Error al obtener invitaciones' }, 500);
  }
});

// POST /family/invitations/:id/accept - Aceptar invitación
app.post('/make-server-727b50c3/family/invitations/:id/accept', async (c) => {
  try {
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const invitationId = c.req.param('id');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Buscar la invitación
    const invitation = await invitationsDb.getInvitationById(supabase, invitationId);

    if (!invitation) {
      return c.json({ error: 'Invitación no encontrada' }, 404);
    }

    // Verificar que la invitación es para este usuario
    if (invitation.email.toLowerCase() !== authResult.email?.toLowerCase()) {
      return c.json({ error: 'Esta invitación no es para ti' }, 403);
    }

    // Verificar que está pendiente
    if (invitation.status !== 'pending') {
      return c.json({ error: 'Esta invitación ya fue procesada' }, 400);
    }

    // Verificar que no ha expirado
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < new Date()) {
      return c.json({ error: 'Esta invitación ha expirado' }, 400);
    }

    // Verificar que no es ya miembro ACTIVO
    const isAlreadyMember = await familyDb.isUserGroupMember(supabase, invitation.group_id, authResult.userId!);
    if (isAlreadyMember) {
      return c.json({ error: 'Ya eres miembro de este grupo' }, 400);
    }

    // Verificar si existe un registro previo (incluso si está inactivo)
    const { data: existingMember } = await supabase
      .from('group_members_727b50c3')
      .select('*')
      .eq('group_id', invitation.group_id)
      .eq('user_id', authResult.userId!)
      .maybeSingle();

    let member;
    if (existingMember) {
      // Actualizar el registro existente a activo
      console.log('📝 User has previous membership, reactivating...');
      const { data, error } = await supabase
        .from('group_members_727b50c3')
        .update({
          status: 'active',
          role: 'member',
          nickname: authResult.email?.split('@')[0] || 'Usuario',
        })
        .eq('id', existingMember.id)
        .select()
        .single();
      
      if (error) throw error;
      member = data;
    } else {
      // Crear nuevo miembro
      console.log('➕ Creating new member...');
      member = await familyDb.addGroupMember(supabase, {
        group_id: invitation.group_id,
        user_id: authResult.userId!,
        role: 'member',
        status: 'active',
        nickname: authResult.email?.split('@')[0] || 'Usuario',
        emoji: '👤',
      });
    }

    // Actualizar estado de la invitación
    const updatedInvitation = await invitationsDb.acceptInvitation(
      supabase,
      invitationId,
      authResult.userId!
    );

    // Crear notificación para el que invitó
    const group = await familyDb.getGroupById(supabase, invitation.group_id);
    const memberId = String(member.id);
    const invitedByUserId = String(invitation.invited_by);
    
    await notificationsDb.createNotification(supabase, {
      user_id: invitedByUserId,
      type: 'invitation_accepted',
      title: `${authResult.email} se unió al grupo`,
      message: `${authResult.email} aceptó la invitación a ${group?.name || 'el grupo'}`,
      data: { memberId, groupId: invitation.group_id },
      priority: 'normal',
      created_by: authResult.userId!,
      related_entity_type: 'group_member',
      related_entity_id: memberId,
    });

    console.log(`✅ Invitation accepted: ${invitationId} by ${authResult.email}`);

    return c.json({ member, group });
  } catch (error) {
    console.error('❌ Error accepting invitation:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    
    // Mensaje de error más descriptivo
    const errorMessage = error instanceof Error ? error.message : 'Error al aceptar invitación';
    return c.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.stack : String(error) 
    }, 500);
  }
});

// POST /family/invitations/:id/reject - Rechazar invitación
app.post('/make-server-727b50c3/family/invitations/:id/reject', async (c) => {
  try {
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const invitationId = c.req.param('id');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Buscar la invitación
    const invitation = await invitationsDb.getInvitationById(supabase, invitationId);

    if (!invitation) {
      return c.json({ error: 'Invitación no encontrada' }, 404);
    }

    // Verificar que la invitación es para este usuario
    if (invitation.email.toLowerCase() !== authResult.email?.toLowerCase()) {
      return c.json({ error: 'Esta invitación no es para ti' }, 403);
    }

    // Verificar que está pendiente
    if (invitation.status !== 'pending') {
      return c.json({ error: 'Esta invitación ya fue procesada' }, 400);
    }

    // Actualizar estado de la invitación
    await invitationsDb.rejectInvitation(supabase, invitationId);

    console.log(`✅ Invitation rejected: ${invitationId} by ${authResult.email}`);

    return c.json({ message: 'Invitación rechazada' });
  } catch (error) {
    console.error('❌ Error rejecting invitation:', error);
    return c.json({ error: 'Error al rechazar invitación' }, 500);
  }
});

// POST /family/join/:code - Unirse a grupo con c��digo
app.post('/make-server-727b50c3/family/join/:code', async (c) => {
  try {
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const code = c.req.param('code').toUpperCase();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Buscar invitación por código
    const invitation = await invitationsDb.getInvitationByCode(supabase, code);

    if (!invitation) {
      return c.json({ error: 'Código de invitación inválido' }, 404);
    }

    // Verificar que está pendiente
    if (invitation.status !== 'pending') {
      return c.json({ error: 'Este código ya fue utilizado' }, 400);
    }

    // Verificar que no ha expirado
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < new Date()) {
      return c.json({ error: 'Este código ha expirado' }, 400);
    }

    // Verificar que no es ya miembro ACTIVO
    const isAlreadyMember = await familyDb.isUserGroupMember(supabase, invitation.group_id, authResult.userId!);
    if (isAlreadyMember) {
      return c.json({ error: 'Ya eres miembro de este grupo' }, 400);
    }

    // Si el grupo requiere aprobación, verificar
    const group = await familyDb.getGroupById(supabase, invitation.group_id);
    if (group?.require_approval_to_join && invitation.email.toLowerCase() !== authResult.email?.toLowerCase()) {
      return c.json({ error: 'Este grupo requiere invitación directa por email' }, 403);
    }

    // Verificar si existe un registro previo (incluso si está inactivo)
    const { data: existingMember } = await supabase
      .from('group_members_727b50c3')
      .select('*')
      .eq('group_id', invitation.group_id)
      .eq('user_id', authResult.userId!)
      .maybeSingle();

    let member;
    if (existingMember) {
      // Actualizar el registro existente a activo
      console.log('📝 User has previous membership (join by code), reactivating...');
      const { data, error } = await supabase
        .from('group_members_727b50c3')
        .update({
          status: 'active',
          role: 'member',
          nickname: authResult.email?.split('@')[0] || 'Usuario',
        })
        .eq('id', existingMember.id)
        .select()
        .single();
      
      if (error) throw error;
      member = data;
    } else {
      // Crear nuevo miembro
      console.log('➕ Creating new member (join by code)...');
      member = await familyDb.addGroupMember(supabase, {
        group_id: invitation.group_id,
        user_id: authResult.userId!,
        role: 'member',
        status: 'active',
        nickname: authResult.email?.split('@')[0] || 'Usuario',
        emoji: '👤',
      });
    }

    // Actualizar estado de la invitación
    await invitationsDb.acceptInvitation(supabase, invitation.id, authResult.userId!);

    // Crear notificación para el que invitó
    const memberId = String(member.id);
    const invitedByUserId = String(invitation.invited_by);
    
    await notificationsDb.createNotification(supabase, {
      user_id: invitedByUserId,
      type: 'member_joined',
      title: `${authResult.email} se unió al grupo`,
      message: `${authResult.email} usó el código para unirse a ${group?.name || 'el grupo'}`,
      data: { memberId, groupId: invitation.group_id },
      priority: 'normal',
      created_by: authResult.userId!,
      related_entity_type: 'group_member',
      related_entity_id: memberId,
    });

    console.log(`✅ User joined via code ${code}: ${authResult.email}`);

    return c.json({ member, group });
  } catch (error) {
    console.error('❌ Error joining with code:', error);
    return c.json({ error: 'Error al unirse con código' }, 500);
  }
});

// PATCH /family/groups/:groupId - Actualizar grupo (solo admin)
app.patch('/make-server-727b50c3/family/groups/:groupId', async (c) => {
  try {
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const groupId = c.req.param('groupId');
    const body = await c.req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificar que el usuario es admin del grupo
    const currentMember = await familyDb.getGroupMemberByUserId(supabase, groupId, authResult.userId!);
    
    if (!currentMember || currentMember.role !== 'admin') {
      return c.json({ error: 'Solo los administradores pueden actualizar el grupo' }, 403);
    }

    // Preparar datos de actualización
    const updateData: any = {};
    
    if (body.name !== undefined) {
      // Validar nombre
      if (!body.name.trim() || body.name.trim().length < 3 || body.name.trim().length > 100) {
        return c.json({ error: 'El nombre debe tener entre 3 y 100 caracteres' }, 400);
      }
      updateData.name = body.name.trim();
    }
    
    if (body.emoji !== undefined) {
      updateData.emoji = body.emoji;
    }
    
    if (body.currency !== undefined) {
      updateData.currency = body.currency;
    }
    
    if (body.requireApprovalToJoin !== undefined) {
      updateData.require_approval_to_join = body.requireApprovalToJoin;
    }
    
    if (body.allowGuestView !== undefined) {
      updateData.allow_guest_view = body.allowGuestView;
    }

    // Actualizar grupo
    const { data: updatedGroup, error: updateError } = await supabase
      .from('family_groups_727b50c3')
      .update(updateData)
      .eq('id', groupId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating group:', updateError);
      throw new Error('Error al actualizar el grupo');
    }

    console.log(`✅ Group ${groupId} updated by admin ${authResult.userId}`);

    return c.json({ group: updatedGroup });
  } catch (error) {
    console.error('❌ Error updating group:', error);
    return c.json({ error: 'Error al actualizar el grupo' }, 500);
  }
});

// DELETE /family/groups/:groupId - Eliminar grupo completo (solo admin)
app.delete('/make-server-727b50c3/family/groups/:groupId', async (c) => {
  try {
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const groupId = c.req.param('groupId');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificar que el usuario actual es admin del grupo
    console.log(`🔍 Verificando permisos para eliminar grupo ${groupId}...`);
    console.log(`   Usuario actual: ${authResult.userId}`);
    
    const currentMember = await familyDb.getGroupMemberByUserId(supabase, groupId, authResult.userId!);
    
    console.log(`   Miembro encontrado:`, currentMember);
    
    if (!currentMember) {
      console.log('❌ Usuario no es miembro del grupo');
      return c.json({ error: 'No eres miembro de este grupo' }, 403);
    }
    
    if (currentMember.role !== 'admin') {
      console.log(`❌ Usuario no es admin. Rol actual: ${currentMember.role}`);
      return c.json({ error: 'Solo los administradores pueden eliminar el grupo' }, 403);
    }
    
    console.log(`✅ Usuario verificado como admin`);
    console.log(`🗑️  Iniciando eliminación del grupo ${groupId}...`);

    // 1. Obtener todas las transacciones del grupo
    console.log('  1️⃣  Obteniendo transacciones del grupo...');
    const { data: transactions, error: fetchError } = await supabase
      .from('group_transactions_727b50c3')
      .select('id')
      .eq('group_id', groupId);

    if (fetchError) {
      console.error('  ❌ Error obteniendo transacciones:', {
        message: fetchError.message,
        details: fetchError.details,
        hint: fetchError.hint,
        code: fetchError.code
      });
      // No lanzar error, continuar con la eliminación
      console.log('  ⚠️  Continuando sin obtener transacciones...');
    }

    console.log(`  �� Encontradas ${transactions?.length || 0} transacciones`);

    // 2. Eliminar reacciones y comentarios
    console.log('  2️⃣  Eliminando reacciones y comentarios...');
    
    // Si tenemos la lista de transacciones, eliminar sus reacciones y comentarios
    if (transactions && transactions.length > 0) {
      const txIds = transactions.map(tx => tx.id);
      
      // Eliminar reacciones
      const { error: reactionsError } = await supabase
        .from('group_reactions_727b50c3')
        .delete()
        .in('group_transaction_id', txIds);

      if (reactionsError && reactionsError.code !== 'PGRST116') {
        console.error('  ⚠️  Error eliminando reacciones:', reactionsError.message);
      }

      // Eliminar comentarios
      const { error: commentsError } = await supabase
        .from('group_comments_727b50c3')
        .delete()
        .in('group_transaction_id', txIds);

      if (commentsError && commentsError.code !== 'PGRST116') {
        console.error('  ⚠️  Error eliminando comentarios:', commentsError.message);
      }
    } else {
      console.log('  ℹ️  No hay transacciones para procesar');
    }
    console.log('  ✅ Reacciones y comentarios procesados');

    // 3. Eliminar transacciones compartidas
    console.log('  3️⃣  Eliminando transacciones compartidas...');
    const { error: txError } = await supabase
      .from('group_transactions_727b50c3')
      .delete()
      .eq('group_id', groupId);

    if (txError) {
      console.error('  ❌ Error eliminando transacciones:', {
        message: txError.message,
        details: txError.details,
        hint: txError.hint,
        code: txError.code
      });
      // No lanzar error si no hay transacciones
      if (txError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw new Error(`Error al eliminar transacciones: ${txError.message}`);
      }
    }
    console.log('  ✅ Transacciones eliminadas');

    // 4. Eliminar invitaciones
    console.log('  4️⃣  Eliminando invitaciones...');
    try {
      const deletedInvCount = await invitationsDb.deleteGroupInvitations(supabase, groupId);
      console.log(`  ✅ ${deletedInvCount} invitaciones eliminadas`);
    } catch (invError) {
      console.error('  ⚠️  Error eliminando invitaciones (continuando):', invError);
      // No lanzar error aquí, continuar con la eliminación
    }

    // 5. Eliminar notificaciones del grupo
    console.log('  5️⃣  Eliminando notificaciones del grupo...');
    try {
      const deletedNotifCount = await notificationsDb.deleteRelatedNotifications(supabase, 'family_group', groupId);
      console.log(`  ✅ ${deletedNotifCount} notificaciones eliminadas`);
    } catch (notifError) {
      console.error('  ⚠️  Error eliminando notificaciones (continuando):', notifError);
    }

    // 6. Eliminar miembros del grupo
    console.log('  6️⃣  Eliminando miembros del grupo...');
    const { error: membersError } = await supabase
      .from('group_members_727b50c3')
      .delete()
      .eq('group_id', groupId);

    if (membersError) {
      console.error('  ❌ Error eliminando miembros:', {
        message: membersError.message,
        details: membersError.details,
        hint: membersError.hint,
        code: membersError.code
      });
      throw new Error(`Error al eliminar miembros: ${membersError.message}`);
    }
    console.log('  ✅ Miembros eliminados');

    // 7. Eliminar el grupo
    console.log('  7️⃣  Eliminando el grupo...');
    const { error: groupError } = await supabase
      .from('family_groups_727b50c3')
      .delete()
      .eq('id', groupId);

    if (groupError) {
      console.error('  ❌ Error eliminando grupo:', {
        message: groupError.message,
        details: groupError.details,
        hint: groupError.hint,
        code: groupError.code
      });
      throw new Error(`Error al eliminar el grupo: ${groupError.message}`);
    }
    console.log('  ✅ Grupo eliminado');

    console.log(`✅ Group ${groupId} deleted by user ${authResult.userId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('��� Error deleting group:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el grupo';
    return c.json({ error: errorMessage }, 400);
  }
});

// PATCH /family/groups/:groupId/members/:memberId - Actualizar miembro
app.patch('/make-server-727b50c3/family/groups/:groupId/members/:memberId', async (c) => {
  try {
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const groupId = c.req.param('groupId');
    const memberId = c.req.param('memberId');
    const body = await c.req.json();

    console.log('🔍 [PATCH Member] Request:', {
      groupId,
      memberId,
      body,
      userId: authResult.userId
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Obtener el miembro actual
    const currentMember = await familyDb.getGroupMemberByUserId(supabase, groupId, authResult.userId!);
    
    console.log('🔍 [PATCH Member] Current member:', currentMember);
    
    if (!currentMember) {
      return c.json({ error: 'No eres miembro de este grupo' }, 403);
    }

    // Obtener el miembro a actualizar por ID
    const { data: targetMember, error: memberError } = await supabase
      .from('group_members_727b50c3')
      .select('*')
      .eq('id', memberId)
      .eq('group_id', groupId)
      .eq('status', 'active')
      .single();
    
    console.log('🔍 [PATCH Member] Target member query result:', {
      targetMember,
      memberError,
      query: {
        id: memberId,
        group_id: groupId,
        status: 'active'
      }
    });
    
    if (memberError || !targetMember) {
      // Intentar buscar todos los miembros del grupo para debugging
      const { data: allMembers } = await supabase
        .from('group_members_727b50c3')
        .select('id, user_id, nickname, status')
        .eq('group_id', groupId);
      
      console.error('❌ [PATCH Member] Member not found. All members in group:', allMembers);
      return c.json({ error: 'Miembro no encontrado' }, 404);
    }

    const isAdmin = currentMember.role === 'admin';
    const isUpdatingSelf = currentMember.id === memberId;

    // Verificar permisos:
    // - Admins pueden actualizar a cualquiera (incluyendo rol)
    // - Usuarios normales solo pueden actualizar su propio nickname/emoji (NO rol)
    if (!isAdmin && !isUpdatingSelf) {
      return c.json({ error: 'Solo puedes editar tu propio perfil' }, 403);
    }

    // Si no es admin pero está actualizando su perfil, no permitir cambio de rol
    if (!isAdmin && body.role && body.role !== currentMember.role) {
      return c.json({ error: 'No puedes cambiar tu propio rol' }, 403);
    }

    // Preparar datos de actualización
    const updateData: any = {};
    if (body.nickname !== undefined) updateData.nickname = body.nickname;
    if (body.emoji !== undefined) updateData.emoji = body.emoji;
    
    // Solo admins pueden cambiar roles
    if (isAdmin && body.role !== undefined) {
      updateData.role = body.role;
    }

    // Actualizar miembro
    await familyDb.updateGroupMember(supabase, memberId, updateData);

    console.log(`✅ Member ${memberId} updated in group ${groupId} by ${isAdmin ? 'admin' : 'self'}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Error updating member:', error);
    return c.json({ error: 'Error al actualizar miembro' }, 500);
  }
});

// DELETE /family/groups/:groupId/members/:memberId - Remover miembro (solo admin)
app.delete('/make-server-727b50c3/family/groups/:groupId/members/:memberId', async (c) => {
  try {
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const groupId = c.req.param('groupId');
    const memberId = c.req.param('memberId');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificar que el usuario actual es admin del grupo
    const currentMember = await familyDb.getGroupMemberByUserId(supabase, groupId, authResult.userId!);
    
    if (!currentMember || currentMember.role !== 'admin') {
      return c.json({ error: 'Solo los administradores pueden remover miembros' }, 403);
    }

    // Remover miembro
    await familyDb.removeGroupMember(supabase, memberId);

    console.log(`✅ Member ${memberId} removed from group ${groupId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Error removing member:', error);
    return c.json({ error: 'Error al remover miembro' }, 500);
  }
});

// POST /family/groups/:groupId/leave - Salir del grupo (usuario abandona por su cuenta)
app.post('/make-server-727b50c3/family/groups/:groupId/leave', async (c) => {
  try {
    console.log('🚪 User attempting to leave group...');
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      console.error('❌ Auth error:', authResult.error);
      return c.json({ error: authResult.error }, authResult.status);
    }

    const groupId = c.req.param('groupId');
    console.log('🚪 GroupId:', groupId, 'UserId:', authResult.userId);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Obtener el miembro actual
    console.log('🔍 Looking for current member...');
    const currentMember = await familyDb.getGroupMemberByUserId(supabase, groupId, authResult.userId!);
    
    if (!currentMember) {
      console.error('❌ User is not a member of this group');
      return c.json({ error: 'No eres miembro de este grupo' }, 404);
    }
    
    console.log('✅ Found member:', currentMember.id, 'Role:', currentMember.role);

    // Verificar si es el único admin
    console.log('🔍 Checking if user is the only admin...');
    const { data: allMembers, error: membersError } = await supabase
      .from('group_members_727b50c3')
      .select('role, status')
      .eq('group_id', groupId)
      .eq('status', 'active');

    if (membersError) {
      console.error('❌ Error fetching members:', membersError);
      throw new Error('Error al verificar miembros del grupo');
    }

    const activeAdmins = allMembers?.filter(m => m.role === 'admin') || [];
    console.log('👥 Active admins count:', activeAdmins.length);

    if (currentMember.role === 'admin' && activeAdmins.length === 1) {
      console.warn('⚠️ User is the only admin, cannot leave');
      return c.json({ 
        error: 'Eres el único administrador. Asigna otro administrador antes de salir o elimina el grupo.' 
      }, 400);
    }

    // Remover al usuario del grupo
    console.log('🗑️ Removing member from group...');
    await familyDb.removeGroupMember(supabase, currentMember.id);

    console.log(`✅ User ${authResult.userId} left group ${groupId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Error leaving group:', error);
    return c.json({ error: 'Error al salir del grupo' }, 500);
  }
});

// POST /family/groups/:groupId/invitations - Crear invitación
app.post('/make-server-727b50c3/family/groups/:groupId/invitations', async (c) => {
  try {
    const authResult = await verifyUserForFamily(c.req.header('Authorization'));
    
    if ('error' in authResult) {
      return c.json({ error: authResult.error }, authResult.status);
    }

    const groupId = c.req.param('groupId');
    const body = await c.req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificar que el usuario es miembro del grupo
    const isMember = await familyDb.isUserGroupMember(supabase, groupId, authResult.userId!);
    
    if (!isMember) {
      return c.json({ error: 'No eres miembro de este grupo' }, 403);
    }

    // Generar código único
    const code = `FAM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Crear invitación
    const invitation = await familyDb.createInvitation(supabase, {
      group_id: groupId,
      email: body.email,
      invited_by: authResult.userId!,
      code,
    });

    console.log(`✅ Invitation created for ${body.email} to group ${groupId}`);

    return c.json({ 
      code,
      invitationId: invitation.id 
    });
  } catch (error) {
    console.error('❌ Error creating invitation:', error);
    return c.json({ error: 'Error al crear invitación' }, 500);
  }
});

console.log('✅ Family routes configured');

// ====================
// DATABASE MIGRATIONS
// ====================
async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Migración: Agregar columna subcategory a group_transactions_727b50c3
    try {
      console.log('  → Checking if subcategory column exists...');
      
      const { data, error: selectError } = await supabase
        .from('group_transactions_727b50c3')
        .select('subcategory')
        .limit(1);

      if (selectError && selectError.message.includes('column "subcategory" does not exist')) {
        console.log('  ⚠️  Subcategory column does not exist');
        console.log('  🔧 Attempting to create column using raw SQL...');
        
        // Intentar crear usando la API de Postgres directamente
        try {
          // Usar el client de Postgres para ejecutar DDL
          const { error: createError } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE group_transactions_727b50c3 ADD COLUMN IF NOT EXISTS subcategory TEXT;'
          });
          
          if (createError) {
            console.log('  ❌ Could not create column automatically');
            console.log('  📋 Please run this SQL manually in Supabase dashboard:');
            console.log('      ALTER TABLE group_transactions_727b50c3 ADD COLUMN subcategory TEXT;');
          } else {
            console.log('  ✅ Subcategory column created successfully');
          }
        } catch (rpcErr) {
          console.log('  ❌ RPC not available, manual migration needed');
          console.log('  📋 Please run this SQL manually in Supabase dashboard:');
          console.log('      ALTER TABLE group_transactions_727b50c3 ADD COLUMN subcategory TEXT;');
        }
      } else {
        console.log('  ✅ Subcategory column exists');
      }
    } catch (err) {
      console.log('  ℹ️  Migration check completed (column may already exist)');
    }

    // Migración: Agregar columna receipt_url a group_transactions_727b50c3
    try {
      console.log('  → Checking if receipt_url column exists...');
      
      const { data, error: selectError } = await supabase
        .from('group_transactions_727b50c3')
        .select('receipt_url')
        .limit(1);

      if (selectError && selectError.message.includes('column "receipt_url" does not exist')) {
        console.log('  ⚠️  receipt_url column does not exist');
        console.log('  🔧 Attempting to create column using raw SQL...');
        
        try {
          const { error: createError } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE group_transactions_727b50c3 ADD COLUMN IF NOT EXISTS receipt_url TEXT;'
          });
          
          if (createError) {
            console.log('  ❌ Could not create column automatically');
            console.log('  📋 Please run this SQL manually in Supabase dashboard:');
            console.log('      ALTER TABLE group_transactions_727b50c3 ADD COLUMN receipt_url TEXT;');
          } else {
            console.log('  ✅ receipt_url column created successfully');
          }
        } catch (rpcErr) {
          console.log('  ❌ RPC not available, manual migration needed');
          console.log('  📋 Please run this SQL manually in Supabase dashboard:');
          console.log('      ALTER TABLE group_transactions_727b50c3 ADD COLUMN receipt_url TEXT;');
        }
      } else {
        console.log('  ✅ receipt_url column exists');
      }
    } catch (err) {
      console.log('  ℹ️  Migration check completed (column may already exist)');
    }

    // Migración: Agregar columna receipt_url a transactions_727b50c3 (tabla personal)
    try {
      console.log('  → Checking if receipt_url column exists in transactions table...');
      
      const { data, error: selectError } = await supabase
        .from('transactions_727b50c3')
        .select('receipt_url')
        .limit(1);

      if (selectError && selectError.message.includes('column "receipt_url" does not exist')) {
        console.log('  ⚠️  receipt_url column does not exist in transactions table');
        console.log('  🔧 Attempting to create column using raw SQL...');
        
        try {
          const { error: createError } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE transactions_727b50c3 ADD COLUMN IF NOT EXISTS receipt_url TEXT;'
          });
          
          if (createError) {
            console.log('  ❌ Could not create column automatically');
            console.log('  📋 Please run this SQL manually in Supabase dashboard:');
            console.log('      ALTER TABLE transactions_727b50c3 ADD COLUMN receipt_url TEXT;');
          } else {
            console.log('  ✅ receipt_url column created in transactions table successfully');
          }
        } catch (rpcErr) {
          console.log('  ❌ RPC not available, manual migration needed');
          console.log('  📋 Please run this SQL manually in Supabase dashboard:');
          console.log('      ALTER TABLE transactions_727b50c3 ADD COLUMN receipt_url TEXT;');
        }
      } else {
        console.log('  ✅ receipt_url column exists in transactions table');
      }
    } catch (err) {
      console.log('  ℹ️  Migration check completed (column may already exist)');
    }

    console.log('✅ Migrations completed');
  } catch (error) {
    console.error('❌ Migration error (non-critical):', error);
    // No fallar el servidor si la migración falla
  }
}

// ====================
// STORAGE BUCKETS SETUP
// ====================
async function setupStorageBuckets() {
  try {
    console.log('🪣 Setting up storage buckets...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const bucketName = 'make-727b50c3-receipts';

    // Verificar si el bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      console.log(`📦 Creating bucket: ${bucketName}`);
      
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: false, // Privado - requiere URLs firmadas
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/heic'],
      });

      if (createError) {
        console.error('❌ Error creating bucket:', createError);
      } else {
        console.log(`✅ Bucket created: ${bucketName}`);
      }
    } else {
      console.log(`✅ Bucket already exists: ${bucketName}`);
    }
  } catch (error) {
    console.error('❌ Storage setup error (non-critical):', error);
  }
}

// Ejecutar migraciones y setup al inicio
runMigrations().catch(err => console.error('Migration startup error:', err));
// setupStorageBuckets().catch(err => console.error('Storage setup error:', err)); // ❌ DISABLED: Causes startup errors with Storage API
console.log('⚠️  Storage buckets will be created on-demand when needed (not at startup)');

// =====================================================
// SETUP - Endpoint para crear tablas
// =====================================================
app.get('/make-server-727b50c3/setup/create-tables', async (c) => {
  try {
    console.log('🔧 ========== CREATING TABLES ==========');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificar si la tabla existe
    const { data: existingTable, error: checkError } = await supabase
      .from('family_invitations_727b50c3')
      .select('id')
      .limit(1);

    if (!checkError) {
      return c.json({ 
        message: 'La tabla family_invitations_727b50c3 ya existe',
        status: 'ok'
      });
    }

    console.log('⚠️ Table does not exist, needs manual creation via Supabase Dashboard');
    console.log('📋 Please run this SQL in your Supabase SQL Editor:');
    console.log(`
CREATE TABLE IF NOT EXISTS family_invitations_727b50c3 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES family_groups_727b50c3(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  invited_by TEXT NOT NULL,
  invited_by_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by TEXT,
  rejected_at TIMESTAMPTZ
);

CREATE INDEX idx_family_invitations_email ON family_invitations_727b50c3(email);
CREATE INDEX idx_family_invitations_code ON family_invitations_727b50c3(code);
CREATE INDEX idx_family_invitations_group ON family_invitations_727b50c3(group_id);
CREATE INDEX idx_family_invitations_status ON family_invitations_727b50c3(status);
    `);

    return c.json({ 
      error: 'La tabla family_invitations_727b50c3 no existe',
      message: 'Por favor ejecuta el SQL en el Dashboard de Supabase',
      sql: `CREATE TABLE IF NOT EXISTS family_invitations_727b50c3 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES family_groups_727b50c3(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  invited_by TEXT NOT NULL,
  invited_by_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by TEXT,
  rejected_at TIMESTAMPTZ
);

CREATE INDEX idx_family_invitations_email ON family_invitations_727b50c3(email);
CREATE INDEX idx_family_invitations_code ON family_invitations_727b50c3(code);
CREATE INDEX idx_family_invitations_group ON family_invitations_727b50c3(group_id);
CREATE INDEX idx_family_invitations_status ON family_invitations_727b50c3(status);`
    }, 400);
  } catch (error) {
    console.error('❌ Error checking/creating tables:', error);
    return c.json({ error: 'Error al verificar tablas' }, 500);
  }
});

// ✅ GLOBAL ERROR FILTER: Suppress connection closed errors from Deno runtime
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Check if this is a connection closed error from Deno runtime
  const errorStr = args.map(arg => String(arg)).join(' ');
  
  // Suppress these specific errors:
  // - "Http: connection closed before message completed"
  // - EPIPE errors
  // - Any "connection closed" from ext:runtime
  const shouldSuppress = 
    errorStr.includes('connection closed before message completed') ||
    errorStr.includes('EPIPE') ||
    (errorStr.includes('connection closed') && errorStr.includes('ext:runtime'));
  
  // Only log if it's NOT a connection error
  if (!shouldSuppress) {
    originalConsoleError.apply(console, args);
  }
};

// Wrapper to ensure all requests get a response with timeout protection
Deno.serve(async (req) => {
  // Create a timeout promise (30 seconds - fail fast)
  const timeoutPromise = new Promise<Response>((resolve) => {
    setTimeout(() => {
      // ✅ FIX: Use console.debug instead of console.error
      // Timeouts are expected when no auth token, don't pollute console
      console.debug('⏱️ REQUEST TIMEOUT - 30 seconds exceeded for:', req.url);
      resolve(new Response(
        JSON.stringify({ 
          error: 'Request timeout', 
          message: 'The server took too long to respond',
          url: req.url
        }),
        {
          status: 504,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      ));
    }, 30000); // 30 seconds - fail fast
  });

  try {
    // Race between the actual request and timeout
    const response = await Promise.race([
      app.fetch(req),
      timeoutPromise
    ]);
    
    // Ensure response is valid
    if (!response) {
      console.error('⚠️ No response generated - returning 500');
      return new Response(
        JSON.stringify({ error: 'Internal server error - no response generated' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    // ✅ CRITICAL FIX: Try to return response, but handle connection errors gracefully
    try {
      return response;
    } catch (pipeError) {
      // If returning the response fails (connection closed), just log silently
      // Detect: EPIPE errors, HTTP connection errors, or any "connection closed" message
      const isConnectionError = 
        (pipeError && typeof pipeError === 'object' && 'code' in pipeError && pipeError.code === 'EPIPE') ||
        (pipeError && typeof pipeError === 'object' && 'name' in pipeError && pipeError.name === 'Http') ||
        (pipeError instanceof Error && pipeError.message && pipeError.message.includes('connection closed'));
      
      if (isConnectionError) {
        // Silently ignore - connection is dead, no need to log
        return new Response(null);
      }
      throw pipeError;
    }
    
  } catch (error) {
    // ✅ FIX: Handle connection errors gracefully (client closed connection)
    // This is normal when client times out or navigates away
    // Detect: EPIPE errors, HTTP connection errors, or any "connection closed" message
    const isConnectionError = 
      (error && typeof error === 'object' && 'code' in error && error.code === 'EPIPE') ||
      (error && typeof error === 'object' && 'name' in error && error.name === 'Http') ||
      (error instanceof Error && error.message && error.message.includes('connection closed'));
    
    if (isConnectionError) {
      // Silently ignore - no logging, just return null response
      // This prevents error logs for normal client disconnections
      return new Response(null);
    }
    
    // For other errors, log and TRY to return error response
    console.error('❌ CRITICAL ERROR in Deno.serve wrapper:', error);
    
    try {
      return new Response(
        JSON.stringify({ 
          error: 'Critical server error', 
          details: error instanceof Error ? error.message : String(error) 
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } catch (responseError) {
      // If we can't even send an error response, connection is probably closed
      // Silently ignore - no logging
      return new Response(null);
    }
  }
});
