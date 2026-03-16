# 🛠️ Scripts de Testing

Scripts para correr tests de integridad de datos fácilmente.

---

## 📋 SCRIPTS DISPONIBLES

### 🐧 Linux / Mac
```bash
./scripts/run-integrity-tests.sh
```

### 🪟 Windows
```bash
scripts\run-integrity-tests.bat
```

---

## 🚀 USO

### Correr TODOS los tests
```bash
# Linux/Mac
./scripts/run-integrity-tests.sh

# Windows
scripts\run-integrity-tests.bat
```

### Correr test ESPECÍFICO
```bash
# Linux/Mac
./scripts/run-integrity-tests.sh budget-persistence

# Windows
scripts\run-integrity-tests.bat budget-persistence
```

---

## 📦 CONTENIDO

| Script | Plataforma | Descripción |
|--------|-----------|-------------|
| `run-integrity-tests.sh` | Linux/Mac | Script bash con colores |
| `run-integrity-tests.bat` | Windows | Script batch |

---

## ⚙️ PRIMER USO

### Linux/Mac - Dar permisos de ejecución
```bash
chmod +x scripts/run-integrity-tests.sh
./scripts/run-integrity-tests.sh
```

### Windows - Ejecutar directamente
```bash
scripts\run-integrity-tests.bat
```

---

## ✅ SALIDA ESPERADA

```
🧪 ==============================================
   TESTS DE INTEGRIDAD DE DATOS
   ==============================================

📋 Configuración:
   - Node version: v18.x.x
   - NPM version: 9.x.x

🚀 Iniciando tests...
   Corriendo: TODOS los tests de integridad (20 tests)

✓ tests/integration/data-integrity/budget-persistence.test.tsx (6)
✓ tests/integration/data-integrity/transaction-persistence.test.tsx (6)
✓ tests/integration/data-integrity/account-balance.test.tsx (8)

Test Files  3 passed (3)
     Tests  20 passed (20)
  Duration  15.42s

==============================================
✅ ¡TODOS LOS TESTS PASARON!

   ✓ Datos se guardan correctamente
   ✓ Persistencia verificada
   ✓ Integridad de campos OK
   ✓ La app está lista para deploy

==============================================
```

---

## 📝 DOCUMENTACIÓN

Ver guías completas:
- `/GUIA_SUPER_USUARIO_TESTS.md` - Guía completa de usuario
- `/CONFIGURAR_CI_CD.md` - Configurar tests automáticos
- `/tests/integration/data-integrity/README.md` - Documentación técnica
