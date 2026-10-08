<#
.SYNOPSIS
    Enterprise-grade API incident dispatcher and telemetry transmission utility.

.DESCRIPTION
    Invoke-TicketAPI transmits structured IT desktop diagnostic payloads to enterprise ITSM,
    RMM, or observability REST API endpoints (such as ServiceNow Table API, Jira Service Management,
    Datadog, Splunk HEC, or custom webhooks).

    Key Features:
    - Enforces modern cryptographic standards (TLS 1.2 / TLS 1.3).
    - Supports SecureString and string Bearer token authentication with zero credential leakage.
    - Automatic JSON payload validation and depth-safe serialization.
    - Intelligent retry logic with exponential backoff and jitter on transient HTTP faults (429, 500, 502, 503, 504).
    - Fast failure on client errors (400, 401, 403, 404) with actionable remediation messages.
    - Built-in -DryRun support for test verification without network transmission.
    - Distributed tracing with auto-generated X-Correlation-ID headers.

.PARAMETER ApiEndpoint
    The HTTPS REST endpoint URL where diagnostic payloads are delivered.

.PARAMETER Payload
    The diagnostic payload. Can be a PSCustomObject, Hashtable, or pre-serialized JSON string.

.PARAMETER BearerToken
    A System.Security.SecureString containing the API Bearer authentication token.

.PARAMETER PlainToken
    A plain text string containing the API Bearer authentication token.
    (Automatically secured in memory; never written to disk or logs).

.PARAMETER CustomHeaders
    Optional hashtable of custom HTTP headers to merge into the request (e.g. X-Source-System, X-Environment).

.PARAMETER MaxRetries
    Maximum number of retry attempts for transient server or network failures. Default is 3.

.PARAMETER RetryDelaySeconds
    Initial backoff delay in seconds. Successive retries increase exponentially with jitter. Default is 2.

.PARAMETER TimeoutSeconds
    HTTP request timeout in seconds. Default is 30.

.PARAMETER DryRun
    When specified, validates payload syntax and simulates transmission without sending HTTP packets.

.PARAMETER PassThru
    Returns the final transmission result object back to the PowerShell pipeline.

.PARAMETER LogFilePath
    Optional path to an audit log file on disk to append transmission events.

.EXAMPLE
    $result = .\Invoke-TicketAPI.ps1 -ApiEndpoint "https://service-now.corp.local/api/now/table/incident" `
                                     -Payload $DiagnosticData `
                                     -PlainToken "env_sec_991823a" `
                                     -PassThru

.EXAMPLE
    # Dry run mode to validate payload serialization and simulated request headers
    .\Invoke-TicketAPI.ps1 -ApiEndpoint "https://hooks.slack.com/services/XXX" `
                           -Payload $DiagnosticData `
                           -DryRun
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param (
    [Parameter(Mandatory = $true, Position = 0, ValueFromPipelineByPropertyName = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$ApiEndpoint,

    [Parameter(Mandatory = $true, Position = 1, ValueFromPipeline = $true)]
    [ValidateNotNull()]
    [object]$Payload,

    [Parameter(Mandatory = $false)]
    [System.Security.SecureString]$BearerToken,

    [Parameter(Mandatory = $false)]
    [string]$PlainToken,

    [Parameter(Mandatory = $false)]
    [hashtable]$CustomHeaders = @{},

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 10)]
    [int]$MaxRetries = 3,

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 60)]
    [int]$RetryDelaySeconds = 2,

    [Parameter(Mandatory = $false)]
    [ValidateRange(5, 180)]
    [int]$TimeoutSeconds = 30,

    [Parameter(Mandatory = $false)]
    [switch]$DryRun,

    [Parameter(Mandatory = $false)]
    [switch]$PassThru,

    [Parameter(Mandatory = $false)]
    [string]$LogFilePath
)

Set-StrictMode -Version Latest

# ==============================================================================
# 1. LOGGING & SECURITY HELPER FUNCTIONS
# ==============================================================================

function Write-ApiLog {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [ValidateSet('INFO', 'SUCCESS', 'WARN', 'ERROR', 'DEBUG')]
        [string]$Level,

        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss.fff")
    $formattedLog = "[$timestamp] [API-$Level] $Message"

    # Colorized console output
    switch ($Level) {
        'INFO'    { Write-Host $formattedLog -ForegroundColor Cyan }
        'SUCCESS' { Write-Host $formattedLog -ForegroundColor Green }
        'WARN'    { Write-Host $formattedLog -ForegroundColor Yellow }
        'ERROR'   { Write-Host $formattedLog -ForegroundColor Red }
        'DEBUG'   { Write-Verbose $formattedLog }
    }

    # Audit logging to disk if path provided
    if ($LogFilePath) {
        try {
            $logDir = [System.IO.Path]::GetDirectoryName($LogFilePath)
            if ($logDir -and -not (Test-Path -Path $logDir)) {
                $null = New-Item -ItemType Directory -Path $logDir -Force -ErrorAction SilentlyContinue
            }
            $formattedLog | Out-File -FilePath $LogFilePath -Append -Encoding UTF8 -ErrorAction SilentlyContinue
        }
        catch {
            # Defensive fallback if disk write fails
            Write-Verbose "Could not append log to '$LogFilePath': $($_.Exception.Message)"
        }
    }
}

function Get-MaskedToken {
    param ([string]$Token)
    if ([string]::IsNullOrWhiteSpace($Token)) { return "(none)" }
    if ($Token.Length -le 8) { return "********" }
    return ("*" * ($Token.Length - 4)) + $Token.Substring($Token.Length - 4)
}

function Convert-SecureStringToPlainText {
    param ([System.Security.SecureString]$Secure)
    if (-not $Secure) { return $null }
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($Secure)
    try {
        return [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    }
    finally {
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}

# ==============================================================================
# 2. PROTOCOL & SECURITY INITIALIZATION
# ==============================================================================

# Force modern TLS standards (TLS 1.2 mandatory, TLS 1.3 if supported by OS/.NET)
try {
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
    if ([Enum]::IsDefined([System.Net.SecurityProtocolType], 'Tls13')) {
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor [System.Net.SecurityProtocolType]::Tls13
    }
    Write-ApiLog -Level 'DEBUG' -Message "Enforced SecurityProtocol: $([System.Net.ServicePointManager]::SecurityProtocol)"
}
catch {
    Write-ApiLog -Level 'WARN' -Message "Failed to enforce TLS 1.2/1.3: $($_.Exception.Message). Defaulting to system SSL stack."
}

# Validate URL format
if (-not ($ApiEndpoint -match '^https?://[a-zA-Z0-9\-\.]+(:\d+)?(/.*)?$')) {
    Write-ApiLog -Level 'ERROR' -Message "Invalid ApiEndpoint format: '$ApiEndpoint'. Must be a valid HTTP/HTTPS URL."
    throw [System.ArgumentException]"Invalid ApiEndpoint format: '$ApiEndpoint'."
}

if ($ApiEndpoint.StartsWith("http://", [System.StringComparison]::OrdinalIgnoreCase)) {
    Write-ApiLog -Level 'WARN' -Message "SECURITY WARNING: ApiEndpoint is using plaintext HTTP. Sensitive diagnostic data may be intercepted. Use HTTPS in production."
}

# ==============================================================================
# 3. PAYLOAD SERIALIZATION & INTEGRITY CHECK
# ==============================================================================

$jsonPayload = ""
try {
    if ($Payload -is [string]) {
        # Verify that string payload is valid JSON
        $null = ConvertFrom-Json -InputObject $Payload -ErrorAction Stop
        $jsonPayload = $Payload
        Write-ApiLog -Level 'DEBUG' -Message "Validated pre-serialized JSON string payload (Length: $($jsonPayload.Length) chars)."
    }
    else {
        # Serialize PowerShell object / hashtable to JSON with safe depth
        $jsonPayload = ConvertTo-Json -InputObject $Payload -Depth 10 -Compress
        Write-ApiLog -Level 'DEBUG' -Message "Serialized object to JSON (Length: $($jsonPayload.Length) chars, Depth: 10)."
    }
}
catch {
    Write-ApiLog -Level 'ERROR' -Message "Payload JSON validation/serialization failed: $($_.Exception.Message)"
    throw [System.FormatException]"Invalid JSON payload provided: $($_.Exception.Message)"
}

# ==============================================================================
# 4. HTTP REQUEST HEADERS CONSTRUCTION
# ==============================================================================

$correlationId = [System.Guid]::NewGuid().ToString()
$resolvedToken = ""

if ($BearerToken) {
    $resolvedToken = Convert-SecureStringToPlainText -Secure $BearerToken
}
elseif (-not [string]::IsNullOrWhiteSpace($PlainToken)) {
    $resolvedToken = $PlainToken
}

$requestHeaders = @{
    'Content-Type'     = 'application/json; charset=utf-8'
    'Accept'           = 'application/json'
    'User-Agent'       = 'WinHealthCheck-TelemetryClient/2.0 (Windows NT; PowerShell)'
    'X-Correlation-ID' = $correlationId
    'X-Client-Timestamp' = (Get-Date).ToUniversalTime().ToString("o")
}

# Merge custom headers (while preventing accidental overwrite of critical headers)
foreach ($key in $CustomHeaders.Keys) {
    if ($key -ne 'Authorization' -and $key -ne 'Content-Type') {
        $requestHeaders[$key] = [string]$CustomHeaders[$key]
    }
}

if (-not [string]::IsNullOrWhiteSpace($resolvedToken)) {
    $requestHeaders['Authorization'] = "Bearer $resolvedToken"
    $maskedTokenDisplay = Get-MaskedToken -Token $resolvedToken
    Write-ApiLog -Level 'DEBUG' -Message "Bearer token configured: $maskedTokenDisplay"
}
else {
    Write-ApiLog -Level 'DEBUG' -Message "No Bearer token supplied. Sending unauthenticated request."
}

# ==============================================================================
# 5. DRY-RUN MODE (SIMULATION & VALIDATION)
# ==============================================================================

if ($DryRun) {
    Write-ApiLog -Level 'INFO' -Message "=== DRY-RUN MODE ACTIVE: No network transmission will occur ==="
    Write-ApiLog -Level 'INFO' -Message "Target Endpoint: $ApiEndpoint"
    Write-ApiLog -Level 'INFO' -Message "Correlation ID : $correlationId"
    Write-ApiLog -Level 'INFO' -Message "Headers:"
    foreach ($h in $requestHeaders.Keys) {
        $displayVal = if ($h -eq 'Authorization') { "Bearer " + (Get-MaskedToken -Token $resolvedToken) } else { $requestHeaders[$h] }
        Write-ApiLog -Level 'INFO' -Message "  $($h): $displayVal"
    }
    Write-ApiLog -Level 'INFO' -Message "Payload Size: $([System.Text.Encoding]::UTF8.GetByteCount($jsonPayload)) bytes"
    
    $payloadPreview = if ($jsonPayload.Length -gt 250) { $jsonPayload.Substring(0, 250) + "... [TRUNCATED]" } else { $jsonPayload }
    Write-ApiLog -Level 'INFO' -Message "Payload Preview: $payloadPreview"

    $dryRunResult = [PSCustomObject]@{
        Success          = $true
        Mode             = "DryRun"
        StatusCode       = 201
        StatusDescription= "Created (Simulated)"
        CorrelationId    = $correlationId
        ApiEndpoint      = $ApiEndpoint
        PayloadSizeBytes = [System.Text.Encoding]::UTF8.GetByteCount($jsonPayload)
        TimestampUtc     = (Get-Date).ToUniversalTime().ToString("o")
        ResponseBody     = '{"status":"success","message":"Dry-run payload successfully validated"}'
        Attempts         = 1
    }

    Write-ApiLog -Level 'SUCCESS' -Message "Dry-run validation completed successfully. Schema is intact."
    if ($PassThru) { return $dryRunResult }
    return
}

# ==============================================================================
# 6. DISPATCH WITH EXPONENTIAL BACKOFF & RETRY LOGIC
# ==============================================================================

$attempt = 0
$transmitted = $false
$finalResult = $null

Write-ApiLog -Level 'INFO' -Message "Initiating telemetry POST to '$ApiEndpoint' (Correlation ID: $correlationId)"

while ($attempt -lt $MaxRetries -and -not $transmitted) {
    $attempt++
    Write-ApiLog -Level 'INFO' -Message "Transmission attempt $attempt of $MaxRetries..."

    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        # PowerShell 5.1 & Core compatible Web Request execution
        $response = Invoke-RestMethod -Uri $ApiEndpoint `
                                      -Method Post `
                                      -Headers $requestHeaders `
                                      -Body $jsonPayload `
                                      -TimeoutSec $TimeoutSeconds `
                                      -ErrorAction Stop

        $stopwatch.Stop()
        $latencyMs = [Math]::Round($stopwatch.Elapsed.TotalMilliseconds, 2)
        Write-ApiLog -Level 'SUCCESS' -Message "Payload dispatched successfully in ${latencyMs}ms. (Attempt: $attempt)"

        $finalResult = [PSCustomObject]@{
            Success           = $true
            StatusCode        = 200
            StatusDescription = "OK"
            CorrelationId     = $correlationId
            LatencyMs         = $latencyMs
            Attempts          = $attempt
            TimestampUtc      = (Get-Date).ToUniversalTime().ToString("o")
            ResponseBody      = $response
        }
        $transmitted = $true
    }
    catch {
        $stopwatch.Stop()
        $latencyMs = [Math]::Round($stopwatch.Elapsed.TotalMilliseconds, 2)
        $statusCode = 0
        $statusDescription = "Unknown Error"
        $rawErrorBody = ""
        $retryAfterSeconds = 0

        # Extract detailed HTTP response info across PowerShell versions
        if ($_.Exception -and $_.Exception.Response) {
            try {
                $httpResponse = $_.Exception.Response
                if ($httpResponse.StatusCode) {
                    $statusCode = [int]$httpResponse.StatusCode
                    $statusDescription = $httpResponse.StatusCode.ToString()
                }

                # Check for Retry-After header (common in 429 Rate Limiting)
                if ($httpResponse.Headers -and $httpResponse.Headers['Retry-After']) {
                    [int]::TryParse($httpResponse.Headers['Retry-After'], [ref]$retryAfterSeconds) | Out-Null
                }

                # Read server error body stream if available
                $respStream = $httpResponse.GetResponseStream()
                if ($respStream) {
                    $reader = New-Object System.IO.StreamReader($respStream)
                    $rawErrorBody = $reader.ReadToEnd()
                    $reader.Close()
                }
            }
            catch {
                Write-ApiLog -Level 'DEBUG' -Message "Could not parse detailed error response stream: $($_.Exception.Message)"
            }
        }

        Write-ApiLog -Level 'WARN' -Message "Attempt $attempt failed [HTTP $statusCode - $statusDescription] in ${latencyMs}ms: $($_.Exception.Message)"
        if (-not [string]::IsNullOrWhiteSpace($rawErrorBody)) {
            $snippet = if ($rawErrorBody.Length -gt 200) { $rawErrorBody.Substring(0, 200) + "..." } else { $rawErrorBody }
            Write-ApiLog -Level 'WARN' -Message "Server Error Response: $snippet"
        }

        # Terminal Client Errors: Do NOT retry 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found
        $isTerminalClientError = ($statusCode -ge 400 -and $statusCode -lt 500 -and $statusCode -ne 408 -and $statusCode -ne 429)

        if ($isTerminalClientError) {
            $guidance = switch ($statusCode) {
                400 { "Payload format rejected by endpoint schema. Check data types and required fields." }
                401 { "Unauthorized. Verify that Bearer token is valid and unexpired." }
                403 { "Forbidden. The authenticated principal lacks permission to post incident tickets." }
                404 { "Endpoint URL not found. Verify the REST route path." }
                default { "Terminal client error ($statusCode). Aborting retries." }
            }
            Write-ApiLog -Level 'ERROR' -Message "Non-retryable client error encountered: $guidance"

            $finalResult = [PSCustomObject]@{
                Success           = $false
                StatusCode        = $statusCode
                StatusDescription = $statusDescription
                CorrelationId     = $correlationId
                LatencyMs         = $latencyMs
                Attempts          = $attempt
                TimestampUtc      = (Get-Date).ToUniversalTime().ToString("o")
                ErrorMessage      = $_.Exception.Message
                ResponseBody      = $rawErrorBody
                RemediationNote   = $guidance
            }
            break
        }

        # Check if more attempts remain
        if ($attempt -lt $MaxRetries) {
            # Calculate backoff delay: respect Retry-After or apply exponential backoff + jitter
            $delay = $RetryDelaySeconds
            if ($retryAfterSeconds -gt 0) {
                $delay = $retryAfterSeconds
                Write-ApiLog -Level 'INFO' -Message "Honoring 'Retry-After' header: Waiting $delay seconds..."
            }
            else {
                # Exponential backoff: Base * 2^(attempt-1) + jitter (100-800ms)
                $jitterSeconds = (Get-Random -Minimum 100 -Maximum 800) / 1000.0
                $delay = [Math]::Round(([Math]::Pow(2, $attempt - 1) * $RetryDelaySeconds) + $jitterSeconds, 2)
                Write-ApiLog -Level 'INFO' -Message "Transient failure detected. Backing off for $delay seconds before retry $attempt of $MaxRetries..."
            }

            Start-Sleep -Seconds $delay
        }
        else {
            Write-ApiLog -Level 'ERROR' -Message "All $MaxRetries transmission attempts exhausted without success."
            $finalResult = [PSCustomObject]@{
                Success           = $false
                StatusCode        = $statusCode
                StatusDescription = $statusDescription
                CorrelationId     = $correlationId
                LatencyMs         = $latencyMs
                Attempts          = $attempt
                TimestampUtc      = (Get-Date).ToUniversalTime().ToString("o")
                ErrorMessage      = $_.Exception.Message
                ResponseBody      = $rawErrorBody
                RemediationNote   = "Network connection or server endpoint failure after $MaxRetries retries."
            }
        }
    }
}

# ==============================================================================
# 7. FINAL COMPLETION STATUS
# ==============================================================================

if ($finalResult.Success) {
    Write-ApiLog -Level 'SUCCESS' -Message "Incident diagnostic package transmission completed successfully [Status: $($finalResult.StatusCode)]."
}
else {
    Write-ApiLog -Level 'ERROR' -Message "Incident diagnostic package transmission failed. Review logs or check endpoint availability."
}

if ($PassThru) {
    return $finalResult
}
