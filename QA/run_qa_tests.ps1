# NityaGeeta Automated QA Test Runner (PowerShell)
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  NITYAGEETA SOFTWARE TESTING & QUALITY ASSURANCE (QA) RUNNER" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# Determine optimal Python executable (.venv if present, otherwise py or python)
$PythonCmd = if (Test-Path ".venv\Scripts\python.exe") { ".venv\Scripts\python.exe" } elseif (Get-Command py -ErrorAction SilentlyContinue) { "py" } else { "python" }

# 1. Run Python Corpus & Component Tests
Write-Host "`n[1/5] Running Canonical Corpus & Code Assertion Tests..." -ForegroundColor Yellow
& $PythonCmd qa/automated_tests.py
$pyExitCode = $LASTEXITCODE

# 2. Run Multi-Scenario Sources QA Test Suite (Happy, Bad, Raining, Worse)
Write-Host "`n[2/5] Running Sources Multi-Scenario Resilience Audit..." -ForegroundColor Yellow
& $PythonCmd qa/test_sources_resilience.py
$sourcesExitCode = $LASTEXITCODE

# 3. Run Multi-Scenario Dilemmas QA Test Suite (Happy, Bad, Raining, Worse)
Write-Host "`n[3/5] Running Dilemmas Multi-Scenario Resilience Audit..." -ForegroundColor Yellow
& $PythonCmd qa/test_dilemmas_suite.py
$dilemmasExitCode = $LASTEXITCODE

# 4. Run Functional REST API Contract & CRUD Test Suite
Write-Host "`n[4/5] Running Functional REST API Contract & CRUD Test Suite..." -ForegroundColor Yellow
& $PythonCmd qa/test_api_endpoints.py
$apiExitCode = $LASTEXITCODE

# 5. Run TypeScript Static Compiler Check
Write-Host "`n[5/5] Running TypeScript Compiler Health Check (tsc --noEmit)..." -ForegroundColor Yellow
Set-Location frontend
npx tsc --noEmit
$tscExitCode = $LASTEXITCODE
Set-Location ..

Write-Host "`n----------------------------------------------------------------------" -ForegroundColor Cyan
if ($pyExitCode -eq 0 -and $sourcesExitCode -eq 0 -and $dilemmasExitCode -eq 0 -and $apiExitCode -eq 0 -and $tscExitCode -eq 0) {
    Write-Host "  ALL QA TESTS PASSED SUCCESSFULLY (READY FOR PRODUCTION - 100% COMPLETE)  " -ForegroundColor Green
} else {
    Write-Host "  QA VERIFICATION DETECTED ISSUES. SEE LOGS ABOVE.                         " -ForegroundColor Red
}
Write-Host "----------------------------------------------------------------------`n" -ForegroundColor Cyan

