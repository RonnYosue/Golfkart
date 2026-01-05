# Script de Prueba del Sistema de Seguridad - GolfKart
# Encoding: UTF-8

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " PRUEBAS DEL SISTEMA DE SEGURIDAD" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testsPassed = 0
$testsFailed = 0

# PRUEBA 1: Verificar ESLint
Write-Host "PRUEBA 1: Verificando ESLint..." -ForegroundColor Yellow
$eslintVersion = npx eslint --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - ESLint instalado: $eslintVersion" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "FALLO - ESLint no encontrado" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# PRUEBA 2: Verificar Husky
Write-Host "PRUEBA 2: Verificando Husky..." -ForegroundColor Yellow
if (Test-Path ".husky") {
    Write-Host "OK - Husky configurado" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "FALLO - Husky no configurado" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# PRUEBA 3: NPM Audit
Write-Host "PRUEBA 3: Ejecutando npm audit..." -ForegroundColor Yellow
npm audit --audit-level=high 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - No se encontraron vulnerabilidades criticas" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "ADVERTENCIA - Se encontraron vulnerabilidades" -ForegroundColor Yellow
    Write-Host "Ejecuta 'npm audit' para ver detalles" -ForegroundColor Blue
    $testsFailed++
}
Write-Host ""

# PRUEBA 4: Detectar secretos
Write-Host "PRUEBA 4: Buscando contraseñas en texto plano..." -ForegroundColor Yellow
$secretsFound = $false
Get-ChildItem -Path "public" -Filter "*.json" -ErrorAction SilentlyContinue | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match '"password"') {
        $secretsFound = $true
        Write-Host "ADVERTENCIA - Contraseña encontrada en: $($_.Name)" -ForegroundColor Red
    }
}

if ($secretsFound) {
    Write-Host "FALLO - Se encontraron secretos expuestos" -ForegroundColor Red
    $testsFailed++
} else {
    Write-Host "OK - No se encontraron secretos expuestos" -ForegroundColor Green
    $testsPassed++
}
Write-Host ""

# PRUEBA 5: Verificar archivos de configuracion
Write-Host "PRUEBA 5: Verificando archivos de configuracion..." -ForegroundColor Yellow
$configFiles = @(".eslintrc.json", ".github/workflows/security-pipeline.yml", "package.json")
$allExist = $true
foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "OK - $file existe" -ForegroundColor Green
    } else {
        Write-Host "FALLO - $file NO encontrado" -ForegroundColor Red
        $allExist = $false
    }
}
if ($allExist) { $testsPassed++ } else { $testsFailed++ }
Write-Host ""

# RESUMEN
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Pruebas exitosas: $testsPassed" -ForegroundColor Green
Write-Host "Pruebas fallidas: $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "TODAS LAS PRUEBAS PASARON!" -ForegroundColor Green
} else {
    Write-Host "ALGUNAS PRUEBAS FALLARON - Revisa los mensajes" -ForegroundColor Yellow
}
Write-Host ""

# EJEMPLO PRACTICO
Write-Host "========================================" -ForegroundColor Magenta
Write-Host " EJEMPLO PRACTICO DE USO" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Para probar el sistema completo:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Crear archivo limpio:" -ForegroundColor Cyan
Write-Host "   echo 'export const test = 1;' > src/test.ts" -ForegroundColor White
Write-Host "   git add src/test.ts" -ForegroundColor White
Write-Host '   git commit -m "test: archivo limpio"' -ForegroundColor White
Write-Host "   -> Deberia PASAR" -ForegroundColor Green
Write-Host ""
Write-Host "2. Crear archivo con secreto:" -ForegroundColor Cyan
Write-Host '   echo ''{ "password": "123" }'' > public/test.json' -ForegroundColor White
Write-Host "   git add public/test.json" -ForegroundColor White
Write-Host '   git commit -m "test: con secreto"' -ForegroundColor White
Write-Host "   -> Deberia ser BLOQUEADO" -ForegroundColor Red
Write-Host ""
Write-Host "Lee SECURITY_SETUP.md para mas informacion" -ForegroundColor Cyan
Write-Host ""
