-- ================================================
-- MIGRACIÓN SEGURA: Presupuestos por Mes/Año
-- ================================================
-- Esta versión verifica si las columnas ya existen antes de crearlas
-- Es segura para ejecutar múltiples veces
-- ================================================

-- Paso 1: Agregar columnas month y year (solo si no existen)
DO $$ 
BEGIN
    -- Agregar columna month si no existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'budgets_727b50c3' 
        AND column_name = 'month'
    ) THEN
        ALTER TABLE budgets_727b50c3 
        ADD COLUMN month INTEGER;
        
        RAISE NOTICE 'Columna "month" agregada exitosamente';
    ELSE
        RAISE NOTICE 'Columna "month" ya existe, saltando...';
    END IF;
    
    -- Agregar columna year si no existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'budgets_727b50c3' 
        AND column_name = 'year'
    ) THEN
        ALTER TABLE budgets_727b50c3 
        ADD COLUMN year INTEGER;
        
        RAISE NOTICE 'Columna "year" agregada exitosamente';
    ELSE
        RAISE NOTICE 'Columna "year" ya existe, saltando...';
    END IF;
END $$;

-- Paso 2: Agregar constraints de validación (solo si no existen)
DO $$ 
BEGIN
    -- Constraint para month (0-11)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.constraint_column_usage 
        WHERE constraint_name = 'budgets_727b50c3_month_check'
    ) THEN
        ALTER TABLE budgets_727b50c3
        ADD CONSTRAINT budgets_727b50c3_month_check 
        CHECK (month IS NULL OR (month >= 0 AND month <= 11));
        
        RAISE NOTICE 'Constraint month_check agregado exitosamente';
    ELSE
        RAISE NOTICE 'Constraint month_check ya existe, saltando...';
    END IF;
    
    -- Constraint para year (>= 2020)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.constraint_column_usage 
        WHERE constraint_name = 'budgets_727b50c3_year_check'
    ) THEN
        ALTER TABLE budgets_727b50c3
        ADD CONSTRAINT budgets_727b50c3_year_check 
        CHECK (year IS NULL OR year >= 2020);
        
        RAISE NOTICE 'Constraint year_check agregado exitosamente';
    ELSE
        RAISE NOTICE 'Constraint year_check ya existe, saltando...';
    END IF;
END $$;

-- Paso 3: Actualizar el constraint único
DO $$ 
BEGIN
    -- Primero eliminar el constraint viejo si existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'budgets_727b50c3_user_id_category_id_period_key'
        AND table_name = 'budgets_727b50c3'
    ) THEN
        ALTER TABLE budgets_727b50c3
        DROP CONSTRAINT budgets_727b50c3_user_id_category_id_period_key;
        
        RAISE NOTICE 'Constraint único viejo eliminado';
    END IF;
    
    -- Agregar el nuevo constraint único (con month y year)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'budgets_727b50c3_user_id_category_id_period_month_year_key'
        AND table_name = 'budgets_727b50c3'
    ) THEN
        ALTER TABLE budgets_727b50c3
        ADD CONSTRAINT budgets_727b50c3_user_id_category_id_period_month_year_key 
        UNIQUE (user_id, category_id, period, month, year);
        
        RAISE NOTICE 'Constraint único nuevo agregado exitosamente';
    ELSE
        RAISE NOTICE 'Constraint único nuevo ya existe, saltando...';
    END IF;
END $$;

-- Paso 4: Crear índice para búsquedas por mes/año (solo si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'idx_budgets_727b50c3_month_year'
    ) THEN
        CREATE INDEX idx_budgets_727b50c3_month_year 
        ON budgets_727b50c3(user_id, month, year);
        
        RAISE NOTICE 'Índice month_year creado exitosamente';
    ELSE
        RAISE NOTICE 'Índice month_year ya existe, saltando...';
    END IF;
END $$;

-- Paso 5: Crear comentarios en las columnas
COMMENT ON COLUMN budgets_727b50c3.month IS 'Mes específico (0-11) o NULL para todos los meses';
COMMENT ON COLUMN budgets_727b50c3.year IS 'Año específico (2020+) o NULL para todos los años';

-- ================================================
-- VERIFICACIÓN FINAL
-- ================================================
SELECT 
    'Migración completada exitosamente!' as mensaje,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'budgets_727b50c3' 
     AND column_name IN ('month', 'year')) as columnas_agregadas,
    (SELECT COUNT(*) FROM information_schema.table_constraints 
     WHERE table_name = 'budgets_727b50c3' 
     AND constraint_name LIKE '%month%year%') as constraints_agregados,
    (SELECT COUNT(*) FROM pg_indexes 
     WHERE tablename = 'budgets_727b50c3' 
     AND indexname LIKE '%month%year%') as indices_agregados;

-- Mostrar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'budgets_727b50c3'
ORDER BY ordinal_position;
