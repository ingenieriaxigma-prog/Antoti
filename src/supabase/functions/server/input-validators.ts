/**
 * =====================================================
 * INPUT VALIDATORS - Production Ready
 * =====================================================
 * 
 * Validadores de entrada para todos los endpoints.
 * Sanitización y validación robusta de datos.
 * 
 * =====================================================
 */

import { isValidEmail, isValidUuid, sanitizeText } from './schemas.ts';

/**
 * Validate signup input
 */
export function validateSignupInput(body: any) {
  const errors: string[] = [];

  if (!body.email || typeof body.email !== 'string') {
    errors.push('Email es requerido');
  } else if (!isValidEmail(body.email)) {
    errors.push('Email inválido');
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.push('Contraseña es requerida');
  } else if (body.password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  } else if (body.password.length > 72) {
    errors.push('La contraseña no puede exceder 72 caracteres');
  }

  if (body.name && typeof body.name === 'string' && body.name.length > 100) {
    errors.push('El nombre no puede exceder 100 caracteres');
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      email: body.email.trim().toLowerCase(),
      password: body.password,
      name: sanitizeText(body.name) || body.email.split('@')[0]
    } : null
  };
}

/**
 * Validate login input
 */
export function validateLoginInput(body: any) {
  const errors: string[] = [];

  if (!body.email || typeof body.email !== 'string') {
    errors.push('Email es requerido');
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.push('Contraseña es requerida');
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      email: body.email.trim().toLowerCase(),
      password: body.password
    } : null
  };
}

/**
 * Validate forgot password input
 */
export function validateForgotPasswordInput(body: any) {
  const errors: string[] = [];

  if (!body.email || typeof body.email !== 'string') {
    errors.push('Email es requerido');
  } else if (!isValidEmail(body.email)) {
    errors.push('Email inválido');
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      email: body.email.trim().toLowerCase()
    } : null
  };
}

/**
 * Validate reset password input
 */
export function validateResetPasswordInput(body: any) {
  const errors: string[] = [];

  if (!body.newPassword || typeof body.newPassword !== 'string') {
    errors.push('Nueva contraseña es requerida');
  } else if (body.newPassword.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  } else if (body.newPassword.length > 72) {
    errors.push('La contraseña no puede exceder 72 caracteres');
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      newPassword: body.newPassword
    } : null
  };
}

/**
 * Validate refresh token input
 */
export function validateRefreshTokenInput(body: any) {
  const errors: string[] = [];

  if (!body.refresh_token || typeof body.refresh_token !== 'string') {
    errors.push('Refresh token es requerido');
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      refresh_token: body.refresh_token
    } : null
  };
}

/**
 * Validate update profile input
 */
export function validateUpdateProfileInput(body: any) {
  const errors: string[] = [];

  if (body.name !== undefined && body.name !== null) {
    if (typeof body.name !== 'string') {
      errors.push('El nombre debe ser texto');
    } else if (body.name.length > 100) {
      errors.push('El nombre no puede exceder 100 caracteres');
    }
  }

  if (body.phone !== undefined && body.phone !== null) {
    if (typeof body.phone !== 'string') {
      errors.push('El teléfono debe ser texto');
    } else if (body.phone.length > 20) {
      errors.push('El teléfono no puede exceder 20 caracteres');
    }
  }

  if (body.photoUrl !== undefined && body.photoUrl !== null && body.photoUrl !== '') {
    if (typeof body.photoUrl !== 'string') {
      errors.push('La URL de la foto debe ser texto');
    } else if (body.photoUrl.length > 500) {
      errors.push('La URL de la foto es demasiado larga');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      name: sanitizeText(body.name),
      phone: sanitizeText(body.phone),
      dateOfBirth: sanitizeText(body.dateOfBirth),
      address: sanitizeText(body.address),
      occupation: sanitizeText(body.occupation),
      photoUrl: body.photoUrl
    } : null
  };
}

/**
 * Validate chat message input
 */
export function validateChatMessageInput(body: any) {
  const errors: string[] = [];

  if (!body.message || typeof body.message !== 'string') {
    errors.push('Mensaje es requerido');
  } else if (body.message.trim().length === 0) {
    errors.push('El mensaje no puede estar vacío');
  } else if (body.message.length > 2000) {
    errors.push('El mensaje no puede exceder 2000 caracteres');
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      message: sanitizeText(body.message)
    } : null
  };
}

/**
 * Validate UUID parameter
 */
export function validateUuidParam(id: string, paramName: string = 'ID') {
  const errors: string[] = [];

  if (!id) {
    errors.push(`${paramName} es requerido`);
  } else if (!isValidUuid(id)) {
    errors.push(`${paramName} inválido`);
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? id : null
  };
}

/**
 * Generic validation error response helper
 */
export function validationErrorResponse(errors: string[]) {
  return {
    error: errors.length === 1 ? errors[0] : 'Errores de validación',
    details: errors.length > 1 ? errors : undefined
  };
}