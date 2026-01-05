# 🎯 GUÍA DE PRUEBA PRÁCTICA - Sistema de Seguridad GolfKart

## 🚀 Inicio Rápido - 3 Pasos

### Paso 1: Verificar Instalación (1 minuto)

```powershell
# Abrir PowerShell en la carpeta del proyecto
cd "c:\Users\User\Documents\Angular\GolfKart\Golfkart"

# Ejecutar script de prueba
.\test-security.ps1
```

**Deberías ver:**
```
========================================
 PRUEBAS DEL SISTEMA DE SEGURIDAD
========================================

PRUEBA 1: Verificando ESLint...
✓ OK - ESLint instalado

PRUEBA 2: Verificando Husky...
✓ OK - Husky configurado

...

RESUMEN: X pruebas exitosas
```

---

### Paso 2: Prueba Exitosa - Commit Permitido ✅

```powershell
# 1. Crear un archivo TypeScript limpio
echo "export const securityTest = 'funcionando';" > src/app/security-test.ts

# 2. Agregar al staging
git add src/app/security-test.ts

# 3. Hacer commit (aquí se activa el hook)
git commit -m "test: verificando sistema de seguridad"
```

**Lo que verás en la consola:**

```
╔══════════════════════════════════════════════════════════════╗
║  🔍 ANÁLISIS DE SEGURIDAD PRE-COMMIT                        ║
║  Espera, voy a revisar los cambios antes de confirmarlos... ║
╚══════════════════════════════════════════════════════════════╝

📋 Paso 1/3: Verificando formato del código...
✅ Formato correcto

📋 Paso 2/3: Buscando vulnerabilidades en dependencias...
✅ Sin vulnerabilidades críticas

📋 Paso 3/3: Verificando reglas de seguridad en el código...
✅ Sin problemas de seguridad detectados

╔══════════════════════════════════════════════════════════════╗
║  ✅ VALIDACIÓN COMPLETADA EXITOSAMENTE                      ║
║  Tu código está listo para ser confirmado                    ║
╚══════════════════════════════════════════════════════════════╝

[main a1b2c3d] test: verificando sistema de seguridad
 1 file changed, 1 insertion(+)
 create mode 100644 src/app/security-test.ts
```

🎉 **¡Éxito!** El commit se realizó porque no había problemas de seguridad.

---

### Paso 3: Prueba Bloqueada - Commit Rechazado ❌

```powershell
# 1. Crear un archivo JSON con contraseña (INSEGURO)
@"
{
  "usuario": "testUser",
  "password": "miPassword123"
}
"@ | Out-File -FilePath "public/test-inseguro.json" -Encoding utf8

# 2. Intentar agregarlo
git add public/test-inseguro.json

# 3. Intentar hacer commit
git commit -m "test: intentando subir contraseña"
```

**Lo que verás (BLOQUEADO):**

```
╔══════════════════════════════════════════════════════════════╗
║  🔍 ANÁLISIS DE SEGURIDAD PRE-COMMIT                        ║
║  Espera, voy a revisar los cambios antes de confirmarlos... ║
╚══════════════════════════════════════════════════════════════╝

📋 Paso 1/3: Verificando formato del código...
✅ Formato correcto

📋 Paso 2/3: Buscando vulnerabilidades en dependencias...
✅ Sin vulnerabilidades críticas

📋 Paso 3/3: Verificando reglas de seguridad en el código...
⚠️  ADVERTENCIA: Posible contraseña en texto plano detectada en: public/test-inseguro.json

❌ ERROR CRÍTICO: Se detectaron 1 problema(s) de seguridad
🔒 No se permite almacenar contraseñas en texto plano
💡 Solución: Implementa hash de contraseñas o usa un backend seguro
```

🛑 **¡Bloqueado!** El commit NO se realizó. El sistema protegió el repositorio.

**Limpiar el archivo de prueba:**
```powershell
git reset HEAD public/test-inseguro.json
Remove-Item public/test-inseguro.json
```

---

## 🧪 Pruebas Adicionales

### Prueba 4: Verificar npm audit

```powershell
# Ver vulnerabilidades en dependencias
npm audit

# Intentar arreglarlas automáticamente
npm audit fix
```

---

### Prueba 5: Verificar ESLint

```powershell
# Analizar código TypeScript
npm run lint

# Arreglar problemas automáticamente
npm run lint:fix
```

---

### Prueba 6: Ejecutar check de seguridad completo

```powershell
# Este comando ejecuta audit + lint
npm run security:check
```

Si hay problemas, verás errores. Si todo está bien, continúa sin problemas.

---

### Prueba 7: Probar build con seguridad

```powershell
# Esto ejecuta security:check ANTES del build
npm run build
```

Si hay vulnerabilidades críticas, el build se detendrá.

---

## 📊 Flujo Completo - Caso Real

### Escenario: Añadir nueva funcionalidad

```powershell
# 1. Crear nueva rama
git checkout -b feature/mi-nueva-funcionalidad

# 2. Hacer cambios (editar archivos en src/)
# ... editas tus archivos ...

# 3. Verificar que no hay errores de linting
npm run lint

# 4. Si hay errores, arreglarlos
npm run lint:fix

# 5. Verificar vulnerabilidades
npm audit

# 6. Preparar commit
git add .

# 7. Commit (se ejecuta el hook automáticamente)
git commit -m "feat: añadida nueva funcionalidad X"

# Si todo está bien, verás:
# ✅ VALIDACIÓN COMPLETADA EXITOSAMENTE
# [feature/mi-nueva-funcionalidad abc123] feat: añadida nueva funcionalidad X

# 8. Subir a GitHub (activa el pipeline)
git push origin feature/mi-nueva-funcionalidad

# 9. Ver el pipeline en acción
# Ve a: https://github.com/RonnYosue/Golfkart/actions
```

---

## 🎬 Demo Visual del Pipeline en GitHub

Cuando hagas `git push`, GitHub Actions se activará automáticamente:

1. **Abre tu navegador** en: `https://github.com/RonnYosue/Golfkart/actions`

2. **Verás el workflow ejecutándose:**
   ```
   🔒 Pipeline de Seguridad y Build
   
   ✓ Checkout del repositorio
   ✓ Configurar Node.js
   ✓ Instalar dependencias
   🔍 Análisis de vulnerabilidades (npm audit)
   🔎 ESLint Security Check
   🔐 Detectar secretos
   🏗️ Build de la aplicación
   🧪 Ejecutar tests
   📊 Subir reportes
   ```

3. **Si algo falla:**
   - ❌ El workflow se detiene
   - 📧 Recibes una notificación
   - 🚫 No se permite el deployment

---

## ⚡ Comandos Útiles de Referencia Rápida

```powershell
# Verificar sistema
.\test-security.ps1

# Análisis de código
npm run lint              # Ver problemas
npm run lint:fix          # Arreglar problemas

# Análisis de dependencias
npm audit                 # Ver vulnerabilidades
npm audit fix             # Arreglar vulnerabilidades

# Seguridad completa
npm run security:check    # Audit + Lint

# Forzar commit SIN validación (NO RECOMENDADO)
git commit --no-verify -m "mensaje"

# Ver última ejecución de GitHub Actions
# https://github.com/RonnYosue/Golfkart/actions
```

---

## ❓ Troubleshooting

### "El hook no se ejecuta"
```powershell
npm run prepare
```

### "ESLint no encuentra archivos"
```powershell
# Verificar que existen archivos .ts
ls src/**/*.ts

# Reinstalar
npm install --save-dev eslint
```

### "Husky command not found"
```powershell
npm install --save-dev husky
npx husky init
```

---

## 📝 Checklist de Verificación

Usa esto para asegurarte de que todo funciona:

- [ ] ✅ Ejecutar `.\test-security.ps1` (debe pasar 3+ pruebas)
- [ ] ✅ Crear archivo limpio y hacer commit (debe permitir)
- [ ] ✅ Crear archivo con contraseña y hacer commit (debe bloquear)
- [ ] ✅ Ejecutar `npm run lint` (debe analizar código)
- [ ] ✅ Ejecutar `npm audit` (debe mostrar reporte)
- [ ] ✅ Hacer `git push` y ver pipeline en GitHub Actions
- [ ] ✅ Leer `SECURITY_SETUP.md` para documentación completa

---

## 🎓 Qué aprendiste

Ahora tu proyecto tiene:

1. **Pre-commit hooks** que validan antes de cada commit
2. **Detección automática** de contraseñas y secretos
3. **Análisis de vulnerabilidades** en dependencias
4. **Pipeline CI/CD** en GitHub Actions
5. **Reportes automáticos** de seguridad

---

## 🚀 Próximos Pasos

1. **Corregir la vulnerabilidad crítica:**
   - El archivo `public/usuarios.json` tiene contraseñas en texto plano
   - Implementa backend con hash de contraseñas

2. **Mantener dependencias actualizadas:**
   ```powershell
   npm update
   npm audit fix
   ```

3. **Revisar reportes regularmente:**
   - En GitHub: https://github.com/RonnYosue/Golfkart/actions

---

## 📚 Recursos Adicionales

- **Documentación completa:** `SECURITY_SETUP.md`
- **Configuración ESLint:** `.eslintrc.json`
- **Pipeline CI/CD:** `.github/workflows/security-pipeline.yml`
- **Scripts de prueba:** `test-security.ps1`

---

**¿Necesitas ayuda?** Revisa `SECURITY_SETUP.md` para más detalles y ejemplos.

**¡El sistema está listo para proteger tu código! 🛡️**
