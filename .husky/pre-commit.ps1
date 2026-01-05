# PowerShell Pre-commit Hook para Windows
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🔍 ANÁLISIS DE SEGURIDAD PRE-COMMIT                        ║" -ForegroundColor Cyan
Write-Host "║  Espera, voy a revisar los cambios antes de confirmarlos... ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Paso 1/3: Verificando formato del código..." -ForegroundColor Yellow
npx lint-staged

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ ERROR: Problemas de formato detectados" -ForegroundColor Red
    Write-Host "💡 Ejecuta 'npm run lint:fix' para corregir automáticamente" -ForegroundColor Blue
    exit 1
}

Write-Host "✅ Formato correcto" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Paso 2/3: Buscando vulnerabilidades en dependencias..." -ForegroundColor Yellow
$auditResult = npm audit --audit-level=high --json 2>&1 | Out-Null
$auditExitCode = $LASTEXITCODE

if ($auditExitCode -ne 0) {
    Write-Host ""
    Write-Host "⚠️  ADVERTENCIA: Se encontraron vulnerabilidades en las dependencias" -ForegroundColor Yellow
    Write-Host "💡 Ejecuta 'npm audit' para ver detalles" -ForegroundColor Blue
    Write-Host "💡 Ejecuta 'npm audit fix' para intentar corregirlas" -ForegroundColor Blue
    Write-Host ""
}

Write-Host "✅ Análisis de vulnerabilidades completado" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Paso 3/3: Verificando reglas de seguridad en el código..." -ForegroundColor Yellow

# Verificar archivos staged
$stagedFiles = git diff --cached --name-only
$securityIssues = 0

foreach ($file in $stagedFiles) {
    if ($file -match '\.json$' -and (Test-Path $file)) {
        $content = Get-Content $file -Raw
        if ($content -match '"password"\s*:\s*"[^"]*"') {
            Write-Host "⚠️  ADVERTENCIA: Posible contraseña en texto plano detectada en: $file" -ForegroundColor Red
            $securityIssues++
        }
    }
}

if ($securityIssues -gt 0) {
    Write-Host ""
    Write-Host "❌ ERROR CRÍTICO: Se detectaron $securityIssues problema(s) de seguridad" -ForegroundColor Red
    Write-Host "🔒 No se permite almacenar contraseñas en texto plano" -ForegroundColor Red
    Write-Host "💡 Solución: Implementa hash de contraseñas o usa un backend seguro" -ForegroundColor Blue
    Write-Host ""
    exit 1
}

Write-Host "✅ Sin problemas de seguridad detectados" -ForegroundColor Green
Write-Host ""

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ VALIDACIÓN COMPLETADA EXITOSAMENTE                      ║" -ForegroundColor Green
Write-Host "║  Tu código está listo para ser confirmado                    ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

exit 0
