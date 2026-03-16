/**
 * Unit Tests - Formatting Utilities
 * 
 * Tests para las funciones de formateo en /utils/formatting.ts
 * 
 * 📊 Cobertura: formatCurrency, formatNumber, formatPercentage,
 *              formatDateShort, formatMonthYear, etc.
 */

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDateShort,
  formatDateLong,
  formatMonthYear,
  formatTransactionType,
  formatBudgetPeriod,
  formatAccountType,
  compactNumber,
} from '@/utils/formatting';

// ============================================
// 🧪 CURRENCY FORMATTING
// ============================================

describe('formatCurrency', () => {
  it('debería formatear correctamente pesos colombianos', () => {
    const result = formatCurrency(50000);
    expect(result).toContain('50.000'); // separador de miles en ES-CO
    expect(result).toContain('$'); // símbolo de pesos
  });

  it('debería formatear números pequeños', () => {
    const result = formatCurrency(100);
    expect(result).toContain('100');
  });

  it('debería formatear números grandes', () => {
    const result = formatCurrency(1000000);
    expect(result).toContain('1.000.000');
  });

  it('debería formatear cero correctamente', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('debería formatear números negativos', () => {
    const result = formatCurrency(-5000);
    expect(result).toContain('-');
    expect(result).toContain('5.000');
  });

  it('debería aceptar currency personalizada', () => {
    const result = formatCurrency(100, 'USD');
    // USD también debe formatearse correctamente
    expect(result).toBeTruthy();
  });
});

// ============================================
// 🧪 NUMBER FORMATTING
// ============================================

describe('formatNumber', () => {
  it('debería formatear con separador de miles', () => {
    const result = formatNumber(1000);
    expect(result).toBe('1.000'); // separador de miles en ES-CO
  });

  it('debería formatear números grandes', () => {
    const result = formatNumber(1234567);
    expect(result).toBe('1.234.567');
  });

  it('debería formatear cero', () => {
    const result = formatNumber(0);
    expect(result).toBe('0');
  });

  it('debería formatear decimales correctamente', () => {
    const result = formatNumber(1234.56);
    expect(result).toContain('1.234');
    expect(result).toContain(',56');
  });
});

// ============================================
// 🧪 PERCENTAGE FORMATTING
// ============================================

describe('formatPercentage', () => {
  it('debería formatear porcentaje básico', () => {
    const result = formatPercentage(75);
    expect(result).toBe('75%');
  });

  it('debería formatear con decimales', () => {
    const result = formatPercentage(75.5, 1);
    expect(result).toBe('75.5%');
  });

  it('debería formatear con 2 decimales', () => {
    const result = formatPercentage(75.567, 2);
    expect(result).toBe('75.57%');
  });

  it('debería formatear cero', () => {
    const result = formatPercentage(0);
    expect(result).toBe('0%');
  });

  it('debería formatear porcentajes mayores a 100', () => {
    const result = formatPercentage(150);
    expect(result).toBe('150%');
  });
});

// ============================================
// 🧪 DATE FORMATTING
// ============================================

describe('formatDateShort', () => {
  it('debería formatear fecha en español', () => {
    const date = new Date('2025-11-30T10:00:00.000Z');
    const result = formatDateShort(date);
    expect(result).toContain('30');
    expect(result).toContain('2025');
    // Mes en español (puede variar según locale)
  });

  it('debería aceptar string ISO', () => {
    const result = formatDateShort('2025-11-30T10:00:00.000Z');
    expect(result).toContain('30');
    expect(result).toContain('2025');
  });

  it('debería formatear diferentes meses', () => {
    const jan = formatDateShort('2025-01-15T10:00:00.000Z');
    const dec = formatDateShort('2025-12-25T10:00:00.000Z');
    expect(jan).not.toBe(dec);
  });
});

describe('formatDateLong', () => {
  it('debería formatear fecha larga en español', () => {
    const date = new Date('2025-11-30T10:00:00.000Z');
    const result = formatDateLong(date);
    expect(result).toContain('30');
    expect(result).toContain('2025');
    expect(result.length).toBeGreaterThan(10); // formato largo
  });

  it('debería aceptar string ISO', () => {
    const result = formatDateLong('2025-11-30T10:00:00.000Z');
    expect(result).toBeTruthy();
  });
});

describe('formatMonthYear', () => {
  it('debería formatear mes y año', () => {
    const result = formatMonthYear(10, 2025); // Noviembre 2025 (0-indexed)
    expect(result).toContain('2025');
    // Primera letra mayúscula
    expect(result[0]).toBe(result[0].toUpperCase());
  });

  it('debería formatear diferentes meses', () => {
    const nov = formatMonthYear(10, 2025);
    const dec = formatMonthYear(11, 2025);
    expect(nov).not.toBe(dec);
  });

  it('debería formatear enero correctamente', () => {
    const result = formatMonthYear(0, 2025);
    expect(result).toContain('2025');
  });
});

// ============================================
// 🧪 TRANSACTION TYPE FORMATTING
// ============================================

describe('formatTransactionType', () => {
  it('debería formatear tipo ingreso', () => {
    const result = formatTransactionType('income');
    expect(result).toBe('Ingreso');
  });

  it('debería formatear tipo gasto', () => {
    const result = formatTransactionType('expense');
    expect(result).toBe('Gasto');
  });

  it('debería formatear tipo transferencia', () => {
    const result = formatTransactionType('transfer');
    expect(result).toBe('Transferencia');
  });
});

// ============================================
// 🧪 BUDGET PERIOD FORMATTING
// ============================================

describe('formatBudgetPeriod', () => {
  it('debería formatear periodo mensual', () => {
    const result = formatBudgetPeriod('monthly');
    expect(result).toBe('Mensual');
  });

  it('debería formatear periodo anual', () => {
    const result = formatBudgetPeriod('yearly');
    expect(result).toBe('Anual');
  });
});

// ============================================
// 🧪 ACCOUNT TYPE FORMATTING
// ============================================

describe('formatAccountType', () => {
  it('debería formatear tipo efectivo', () => {
    const result = formatAccountType('cash');
    expect(result).toBe('Efectivo');
  });

  it('debería formatear tipo banco', () => {
    const result = formatAccountType('bank');
    expect(result).toBe('Banco');
  });

  it('debería formatear tipo tarjeta', () => {
    const result = formatAccountType('card');
    expect(result).toBe('Tarjeta');
  });

  it('debería formatear tipo digital', () => {
    const result = formatAccountType('digital');
    expect(result).toBe('Digital');
  });
});

// ============================================
// 🧪 COMPACT NUMBER
// ============================================

describe('compactNumber', () => {
  it('debería retornar números menores a 1000 sin cambios', () => {
    expect(compactNumber(500)).toBe('500');
    expect(compactNumber(999)).toBe('999');
  });

  it('debería compactar miles', () => {
    expect(compactNumber(1500)).toBe('1.5K');
    expect(compactNumber(5000)).toBe('5.0K');
  });

  it('debería compactar millones', () => {
    expect(compactNumber(1500000)).toBe('1.5M');
    expect(compactNumber(3000000)).toBe('3.0M');
  });

  it('debería compactar billones', () => {
    expect(compactNumber(1500000000)).toBe('1.5B');
  });

  it('debería manejar cero', () => {
    expect(compactNumber(0)).toBe('0');
  });
});
