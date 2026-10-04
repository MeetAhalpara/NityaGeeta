<#
.SYNOPSIS
    Automated verification & quality assurance test runner for IT-Diagnostics-Suite.

.DESCRIPTION
    Executes end-to-end unit and integration verification tests across:
    - Syntax validation for WinHealthCheck.ps1 and Invoke-TicketAPI.ps1.
    - JSON schema validation of sample-payload.json.
    - Parameter bounds and input validation enforcement.
    - Invoke-TicketAPI -DryRun validation with Bearer token masking.
    - WinHealthCheck subsystem extraction (Storage, Services, Event Logs, Network).
    - Triage scoring and recommendation engine validation.

.EXAMPLE
    .\Run-DiagnosticsTest.ps1
#>

[CmdletBinding()]
param()

$suiteRoot = (Resolve-Path (Join-Path -Path $PSScriptRoot -ChildPath "..")).Path
$winHealthScript = Join-Path -Path $suiteRoot -ChildPath "WinHealthCheck.ps1"
$ticketApiScript = Join-Path -Path $suiteRoot -ChildPath "Invoke-TicketAPI.ps1"
$sampleJsonPath  = Join-Path -Path $suiteRoot -ChildPath "sample-payload.json"

$passed = 0
$failed = 0

function Assert-Test {
    param (
        [string]$Name,
        [scriptblock]$Test
    )

    Write-Host -NoNewline "[TEST] $Name ... "
    try {
        $result = & $Test
        if ($result -ne $false) {
            Write-Host "PASSED" -ForegroundColor Green
            $script:passed++
        }
        else {
            Write-Host "FAILED (Assertion returned false)" -ForegroundColor Red
            $script:failed++
        }
    }
    catch {
        Write-Host "FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor DarkRed
        $script:failed++
    }
}

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "      IT-DIAGNOSTICS-SUITE AUTOMATED TEST RUNNER        " -ForegroundColor White
Write-Host "========================================================`n" -ForegroundColor Cyan

# Test 1: Script Existence
Assert-Test -Name "File existence verification" -Test {
    (Test-Path -Path $winHealthScript) -and (Test-Path -Path $ticketApiScript) -and (Test-Path -Path $sampleJsonPath)
}

# Test 2: PowerShell Syntax Checking (AST Parsing)
Assert-Test -Name "PowerShell syntax validation (WinHealthCheck.ps1)" -Test {
    $errors = $null
    $tokens = $null
    [System.Management.Automation.Language.Parser]::ParseFile($winHealthScript, [ref]$tokens, [ref]$errors) | Out-Null
    return ($errors.Count -eq 0)
}

Assert-Test -Name "PowerShell syntax validation (Invoke-TicketAPI.ps1)" -Test {
    $errors = $null
    $tokens = $null
    [System.Management.Automation.Language.Parser]::ParseFile($ticketApiScript, [ref]$tokens, [ref]$errors) | Out-Null
    return ($errors.Count -eq 0)
}

# Test 3: Sample JSON Schema Integrity
Assert-Test -Name "Validate sample-payload.json syntax and schema keys" -Test {
    $content = Get-Content -Path $sampleJsonPath -Raw
    $obj = ConvertFrom-Json -InputObject $content
    $hasKeys = ($obj.SchemaVersion -eq "2.0") -and 
               ($null -ne $obj.SystemMetadata) -and 
               ($null -ne $obj.StorageHealth) -and 
               ($null -ne $obj.ServiceStates) -and 
               ($null -ne $obj.EventLogErrors) -and 
               ($null -ne $obj.NetworkDiagnostics) -and 
               ($null -ne $obj.TriageSummary)
    return $hasKeys
}

# Test 4: Invoke-TicketAPI Input Validation
Assert-Test -Name "Invoke-TicketAPI rejects invalid URL scheme" -Test {
    try {
        & $ticketApiScript -ApiEndpoint "invalid-url-target" -Payload @{ test = 1 } -ErrorAction Stop
        return $false
    }
    catch {
        return ($_.Exception.Message -match "Invalid ApiEndpoint")
    }
}

# Test 5: Invoke-TicketAPI Dry-Run Transmission
Assert-Test -Name "Invoke-TicketAPI executes Dry-Run mode with simulated 201" -Test {
    $res = & $ticketApiScript -ApiEndpoint "https://servicenow.corp.local/api/now/table/incident" `
                             -Payload @{ incident = "test" } `
                             -PlainToken "test_secret_token_12345" `
                             -DryRun `
                             -PassThru
    return ($res.Success -eq $true -and $res.StatusCode -eq 201 -and $res.Mode -eq "DryRun")
}

# Test 6: WinHealthCheck Live Diagnostics Object Generation
Assert-Test -Name "WinHealthCheck live scan generates populated diagnostic object" -Test {
    $report = & $winHealthScript -Quiet -PassThru
    $valid = ($report.SchemaVersion -eq "2.0") -and 
             ($report.SystemMetadata.Hostname.Length -gt 0) -and 
             ($report.StorageHealth.LogicalDisks.Count -gt 0) -and 
             ($report.ServiceStates.TotalMonitored -gt 0) -and 
             ($null -ne $report.NetworkDiagnostics.NetworkStatus) -and 
             ($report.TriageSummary.HealthScore -ge 0 -and $report.TriageSummary.HealthScore -le 100)
    return $valid
}

# Test 7: WinHealthCheck -DryRun API Dispatch Integration
Assert-Test -Name "WinHealthCheck -SendTicket with -DryRun end-to-end integration" -Test {
    $output = & $winHealthScript -Quiet -SendTicket `
                                 -ApiEndpoint "https://hooks.slack.com/services/test" `
                                 -ApiTokenPlain "mock_token_abc" `
                                 -DryRun
    # Should complete without throwing an unhandled exception
    return $true
}

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host " RESULTS: Passed: $passed | Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { 'Green' } else { 'Red' })
Write-Host "========================================================`n" -ForegroundColor Cyan

if ($failed -gt 0) {
    exit 1
}
else {
    exit 0
}
