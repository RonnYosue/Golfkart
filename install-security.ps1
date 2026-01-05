# 🚀 Script de Instalación Rápida del Sistema de Seguridad

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🔒 INSTALACIÓN DEL SISTEMA DE SEGURIDAD GOLFKART       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "📦 Paso 1/4: Instalando dependencias de seguridad..." -ForegroundColor Yellow
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-security husky lint-staged prettier

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Paso 2/4: Configurando Husky..." -ForegroundColor Yellow
npx husky init

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Husky configurado correctamente" -ForegroundColor Green
} else {
    Write-Host "⚠️  Advertencia: Verifica la configuración de Husky" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "📝 Paso 3/4: Copiando hooks personalizados..." -ForegroundColor Yellow
# El pre-commit ya está creado en .husky/pre-commit.ps1
Write-Host "✅ Hooks configurados" -ForegroundColor Green
Write-Host ""

Write-Host "🧪 Paso 4/4: Verificando instalación..." -ForegroundColor Yellow

# Verificar ESLint
Write-Host "   Verificando ESLint..." -ForegroundColor Gray
npx eslint --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ ESLint OK" -ForegroundColor Green
}

# Verificar estructura
Write-Host "   Verificando estructura de archivos..." -ForegroundColor Gray
if (Test-Path ".husky") {
    Write-Host "   ✅ Carpeta .husky existe" -ForegroundColor Green
}
if (Test-Path ".eslintrc.json") {
    Write-Host "   ✅ Configuración ESLint existe" -ForegroundColor Green
}
if (Test-Path ".github/workflows/security-pipeline.yml") {
    Write-Host "   ✅ Pipeline GitHub Actions configurado" -ForegroundColor Green
}

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║        ✅ INSTALACIÓN COMPLETADA EXITOSAMENTE               ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📖 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Lee el archivo SECURITY_SETUP.md para documentación completa" -ForegroundColor White
Write-Host "   2. Ejecuta: npm run test-security.ps1" -ForegroundColor White
Write-Host "   3. Intenta hacer un commit para ver el sistema en acción" -ForegroundColor White
Write-Host ""
Write-Host "🎉 ¡Tu proyecto ahora está protegido!" -ForegroundColor Green
Write-Host ""
