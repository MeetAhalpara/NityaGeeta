<#
.SYNOPSIS
    Enterprise Desktop Diagnostics & Incident Telemetry Collector (Tier-1/Tier-2 IT Support).

.DESCRIPTION
    WinHealthCheck is an automated, enterprise-grade diagnostic utility designed for Windows
    workstations and servers. It performs non-destructive health inspections across storage,
    critical system services, recent event log errors, and network connectivity.

    Diagnostic Scope:
    1. Storage: Local disk volume allocation, free space percentages, and physical SMART / drive health.
    2. Services: Critical infrastructure service states (Print Spooler, Remote Registry, Windows Update,
       Defender Antivirus, Firewall) and anomaly detection (e.g. Automatic but Stopped).
    3. Event Logs: Last 24 hours of Critical (Level 1) and Error (Level 2) events from Application & System logs.
    4. Network: Active adapter configurations, IPv4/IPv6 bindings, DNS servers, default gateway ping latency,
       and external DNS resolution testing.
    5. Triage Engine: Computes an ITIL-aligned health score (0-100), overall status (HEALTHY, WARNING, CRITICAL),
       and generates step-by-step remediation advice for support analysts.
    6. API Integration: Seamlessly dispatches structured diagnostic JSON to ITSM endpoints (ServiceNow, Jira,
       Datadog, webhooks) via Invoke-TicketAPI.ps1.

.PARAMETER DiskWarningThresholdPercent
    Percentage of free disk space below which a drive is flagged with WARNING. Default is 15.

.PARAMETER DiskCriticalThresholdPercent
    Percentage of free disk space below which a drive is flagged with CRITICAL. Default is 5.

.PARAMETER TargetServices
    Array of service names to monitor. Defaults to standard enterprise baseline:
    Spooler, RemoteRegistry, wuauserv, LanmanWorkstation, Dnscache, Dhcp, WinDefend, MpsSvc.

.PARAMETER EventLogHours
    Lookback window in hours for Application and System Critical/Error event logs. Default is 24.

.PARAMETER MaxEventLogEntries
    Maximum number of individual event records to include in the payload (prevents API bloat). Default is 50.

.PARAMETER OutputPath
    Optional file path where the generated diagnostic JSON report will be saved.

.PARAMETER LogFilePath
    Optional file path for script execution audit logging.

.PARAMETER SendTicket
    When specified, transmits the resulting diagnostic payload to the specified -ApiEndpoint.

.PARAMETER ApiEndpoint
    The HTTPS REST URL for incident ticket creation or telemetry ingestion.

.PARAMETER ApiToken
    SecureString Bearer token for API authentication.

.PARAMETER ApiTokenPlain
    Plain text string Bearer token for API authentication (auto-secured in memory).

.PARAMETER DryRun
    When combined with -SendTicket, simulates the API submission without transmitting data over the network.

.PARAMETER PassThru
    Outputs the final PowerShell diagnostic object to the pipeline.

.PARAMETER AsJson
    Outputs the full diagnostic report as a formatted JSON string to standard output.

.PARAMETER Quiet
    Suppresses console banners and progress text, useful for RMM silent background jobs.

.EXAMPLE
    # Interactive local health audit with console summary
    .\WinHealthCheck.ps1

.EXAMPLE
    # Run diagnostic and export structured JSON report to disk
    .\WinHealthCheck.ps1 -OutputPath "C:\Temp\Diagnostics\Report-20261003.json"

.EXAMPLE
    # Run diagnostic and transmit to ServiceNow incident webhook with DryRun simulation
    .\WinHealthCheck.ps1 -SendTicket `
                         -ApiEndpoint "https://instance.service-now.com/api/now/table/incident" `
                         -ApiTokenPlain "sec_token_993412" `
                         -DryRun

.EXAMPLE
    # Silent invocation by RMM agent returning raw JSON to stdout
    .\WinHealthCheck.ps1 -Quiet -AsJson
#>

[CmdletBinding(SupportsShouldProcess = $false)]
param (
    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 90)]
    [int]$DiskWarningThresholdPercent = 15,

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 50)]
    [int]$DiskCriticalThresholdPercent = 5,

    [Parameter(Mandatory = $false)]
    [string[]]$TargetServices = @(
        'Spooler',           # Print Spooler
        'RemoteRegistry',    # Remote Registry (security baseline check)
        'wuauserv',          # Windows Update
        'LanmanWorkstation', # Workstation / SMB networking
        'Dnscache',          # DNS Client Cache
        'Dhcp',              # DHCP Client
        'WinDefend',         # Microsoft Defender Antivirus
        'MpsSvc'             # Windows Defender Firewall
    ),

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 168)]
    [int]$EventLogHours = 24,

    [Parameter(Mandatory = $false)]
    [ValidateRange(5, 500)]
    [int]$MaxEventLogEntries = 50,

    [Parameter(Mandatory = $false)]
    [string]$OutputPath,

    [Parameter(Mandatory = $false)]
    [string]$LogFilePath,

    [Parameter(Mandatory = $false)]
    [switch]$SendTicket,

    [Parameter(Mandatory = $false)]
    [string]$ApiEndpoint,

    [Parameter(Mandatory = $false)]
    [System.Security.SecureString]$ApiToken,

    [Parameter(Mandatory = $false)]
    [string]$ApiTokenPlain,

    [Parameter(Mandatory = $false)]
    [switch]$DryRun,

    [Parameter(Mandatory = $false)]
    [switch]$PassThru,

    [Parameter(Mandatory = $false)]
    [switch]$AsJson,

    [Parameter(Mandatory = $false)]
    [switch]$Quiet
)

Set-StrictMode -Off

# ==============================================================================
# 1. CORE LOGGING & OUTPUT ROUTINES
# ==============================================================================

function Write-DiagnosticLog {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [ValidateSet('INFO', 'SUCCESS', 'WARN', 'ERROR', 'DEBUG', 'HEADER')]
        [string]$Level,

        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    if ($Quiet -and $Level -ne 'ERROR') { return }

    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $logPrefix = "[$timestamp] [$Level]"

    switch ($Level) {
        'HEADER'  { Write-Host "`n=== $Message ===" -ForegroundColor Magenta }
        'INFO'    { Write-Host "$logPrefix $Message" -ForegroundColor Cyan }
        'SUCCESS' { Write-Host "$logPrefix $Message" -ForegroundColor Green }
        'WARN'    { Write-Host "$logPrefix $Message" -ForegroundColor Yellow }
        'ERROR'   { Write-Host "$logPrefix $Message" -ForegroundColor Red }
        'DEBUG'   { Write-Verbose "$logPrefix $Message" }
    }

    if ($LogFilePath) {
        try {
            $dir = [System.IO.Path]::GetDirectoryName($LogFilePath)
            if ($dir -and -not (Test-Path -Path $dir)) {
                $null = New-Item -ItemType Directory -Path $dir -Force -ErrorAction SilentlyContinue
            }
            "$logPrefix $Message" | Out-File -FilePath $LogFilePath -Append -Encoding UTF8 -ErrorAction SilentlyContinue
        }
        catch {
            Write-Verbose "Could not append log to '$LogFilePath': $($_.Exception.Message)"
        }
    }
}

# ==============================================================================
# 2. SYSTEM METADATA COLLECTOR
# ==============================================================================

function Get-HostMetadata {
    [CmdletBinding()]
    param()

    Write-DiagnosticLog -Level 'DEBUG' -Message "Collecting host system metadata..."
    
    $osInfo = $null
    $csInfo = $null
    $biosInfo = $null

    try {
        $osInfo = Get-CimInstance -ClassName Win32_OperatingSystem -ErrorAction Stop
    }
    catch {
        Write-DiagnosticLog -Level 'WARN' -Message "Failed querying Win32_OperatingSystem: $($_.Exception.Message)"
    }

    try {
        $csInfo = Get-CimInstance -ClassName Win32_ComputerSystem -ErrorAction Stop
    }
    catch {
        Write-DiagnosticLog -Level 'WARN' -Message "Failed querying Win32_ComputerSystem: $($_.Exception.Message)"
    }

    try {
        $biosInfo = Get-CimInstance -ClassName Win32_BIOS -ErrorAction Stop
    }
    catch {
        Write-DiagnosticLog -Level 'WARN' -Message "Failed querying Win32_BIOS: $($_.Exception.Message)"
    }

    $uptimeSpan = if ($osInfo -and $osInfo.LastBootUpTime) {
        (Get-Date) - $osInfo.LastBootUpTime
    } else {
        [TimeSpan]::Zero
    }

    $isElevated = $false
    try {
        $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
        $principal = New-Object Security.Principal.WindowsPrincipal($identity)
        $isElevated = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    }
    catch {
        $isElevated = $false
    }

    $formattedUptime = "{0}d {1}h {2}m" -f [int]$uptimeSpan.TotalDays, $uptimeSpan.Hours, $uptimeSpan.Minutes

    return [PSCustomObject]@{
        Hostname          = $env:COMPUTERNAME
        Domain            = if ($csInfo.PartOfDomain) { $csInfo.Domain } else { "WORKGROUP ($($csInfo.Workgroup))" }
        OperatingSystem   = $osInfo.Caption
        Version           = $osInfo.Version
        BuildNumber       = $osInfo.BuildNumber
        Architecture      = $osInfo.OSArchitecture
        InstallDateUtc    = if ($osInfo.InstallDate) { $osInfo.InstallDate.ToUniversalTime().ToString("o") } else { $null }
        LastBootUpTimeUtc = if ($osInfo.LastBootUpTime) { $osInfo.LastBootUpTime.ToUniversalTime().ToString("o") } else { $null }
        UptimeHours       = [Math]::Round($uptimeSpan.TotalHours, 1)
        UptimeFormatted   = $formattedUptime
        CurrentUser       = if ($csInfo.UserName) { $csInfo.UserName } else { "$env:USERDOMAIN\$env:USERNAME" }
        Manufacturer      = $csInfo.Manufacturer
        Model             = $csInfo.Model
        SystemSerialNumber= if ($biosInfo.SerialNumber) { $biosInfo.SerialNumber.Trim() } else { "UNKNOWN" }
        BIOSVersion       = if ($biosInfo.SMBIOSBIOSVersion) { $biosInfo.SMBIOSBIOSVersion } else { "UNKNOWN" }
        PowerShellVersion = $PSVersionTable.PSVersion.ToString()
        ExecutionElevated = $isElevated
    }
}

# ==============================================================================
# 3. DISK SPACE & SMART STORAGE HEALTH COLLECTOR
# ==============================================================================

function Get-StorageHealthCheck {
    [CmdletBinding()]
    param (
        [int]$WarnPct = 15,
        [int]$CritPct = 5
    )

    Write-DiagnosticLog -Level 'DEBUG' -Message "Inspecting logical volumes and physical disk SMART health..."

    $logicalDisks = @()
    $physicalDrives = @()
    $storageIssues = @()

    # Query Logical Disks (Fixed hard disks: DriveType = 3)
    try {
        $disks = Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DriveType=3" -ErrorAction Stop
        foreach ($d in $disks) {
            $totalBytes = [int64]$d.Size
            $freeBytes = [int64]$d.FreeSpace
            $totalGB = [Math]::Round($totalBytes / 1GB, 2)
            $freeGB = [Math]::Round($freeBytes / 1GB, 2)
            $pctFree = if ($totalBytes -gt 0) { [Math]::Round(($freeBytes / $totalBytes) * 100, 2) } else { 0.0 }

            $status = "OK"
            if ($pctFree -le $CritPct) {
                $status = "CRITICAL"
                $storageIssues += "Volume $($d.DeviceID) is critically low on space ($pctFree% free, threshold $CritPct%)."
            }
            elseif ($pctFree -le $WarnPct) {
                $status = "WARNING"
                $storageIssues += "Volume $($d.DeviceID) is low on space ($pctFree% free, threshold $WarnPct%)."
            }

            $logicalDisks += [PSCustomObject]@{
                DeviceID        = $d.DeviceID
                VolumeName      = if ($d.VolumeName) { $d.VolumeName } else { "(Local Disk)" }
                FileSystem      = $d.FileSystem
                TotalSizeBytes  = $totalBytes
                TotalSizeGB     = $totalGB
                FreeSpaceBytes  = $freeBytes
                FreeSpaceGB     = $freeGB
                PercentFree     = $pctFree
                Status          = $status
            }
        }
    }
    catch {
        Write-DiagnosticLog -Level 'ERROR' -Message "Error inspecting logical disks: $($_.Exception.Message)"
        $storageIssues += "Failed querying Win32_LogicalDisk: $($_.Exception.Message)"
    }

    # Query Physical Disks & SMART Status
    try {
        # Check modern Storage Cmdlets (Get-PhysicalDisk)
        if (Get-Command -Name Get-PhysicalDisk -ErrorAction SilentlyContinue) {
            $pDisks = Get-PhysicalDisk -ErrorAction Stop
            foreach ($pd in $pDisks) {
                $smartFailure = $false
                $health = if ($pd.HealthStatus) { $pd.HealthStatus.ToString() } else { "Unknown" }
                $oper = if ($pd.OperationalStatus) { ($pd.OperationalStatus -join ', ') } else { "Unknown" }

                if ($health -ne 'Healthy' -or ($oper -ne 'OK' -and $oper -ne 'None')) {
                    $smartFailure = $true
                    $storageIssues += "Physical Drive '$($pd.FriendlyName)' reports degraded health: Health=$health, Operational=$oper"
                }

                $sizeGB = if ($pd.Size) { [Math]::Round($pd.Size / 1GB, 2) } else { 0 }
                $physicalDrives += [PSCustomObject]@{
                    DeviceId             = [string]$pd.DeviceId
                    FriendlyName         = $pd.FriendlyName
                    MediaType            = if ($pd.MediaType) { $pd.MediaType.ToString() } else { "Unspecified" }
                    BusType              = if ($pd.BusType) { $pd.BusType.ToString() } else { "Standard" }
                    SizeGB               = $sizeGB
                    OperationalStatus    = $oper
                    HealthStatus         = $health
                    SmartPredictFailure  = $smartFailure
                }
            }
        }
    }
    catch {
        Write-DiagnosticLog -Level 'DEBUG' -Message "Get-PhysicalDisk query unavailable or failed: $($_.Exception.Message). Checking WMI SMART fallback..."
    }

    # Fallback to WMI MSStorageDriver_FailurePredictStatus if physical disk query returned empty
    if ($physicalDrives.Count -eq 0) {
        try {
            $wmiSmart = Get-CimInstance -Namespace "root\wmi" -ClassName MSStorageDriver_FailurePredictStatus -ErrorAction SilentlyContinue
            if ($wmiSmart) {
                foreach ($smart in $wmiSmart) {
                    $predictFail = [bool]$smart.PredictFailure
                    if ($predictFail) {
                        $storageIssues += "WMI SMART failure predictor flagged Drive: $($smart.InstanceName)"
                    }
                    $physicalDrives += [PSCustomObject]@{
                        DeviceId             = $smart.InstanceName
                        FriendlyName         = "Physical Drive ($($smart.InstanceName))"
                        MediaType            = "Unknown"
                        BusType              = "Standard"
                        SizeGB               = 0
                        OperationalStatus    = if ($predictFail) { "PredictFailure" } else { "OK" }
                        HealthStatus         = if ($predictFail) { "Unhealthy" } else { "Healthy" }
                        SmartPredictFailure  = $predictFail
                    }
                }
            }
        }
        catch {
            Write-DiagnosticLog -Level 'DEBUG' -Message "WMI SMART FailurePredictStatus query failed: $($_.Exception.Message)"
        }
    }

    return [PSCustomObject]@{
        Thresholds      = [PSCustomObject]@{
            WarningPercent  = $WarnPct
            CriticalPercent = $CritPct
        }
        LogicalDisks    = $logicalDisks
        PhysicalDrives  = $physicalDrives
        StorageIssues   = $storageIssues
    }
}

# ==============================================================================
# 4. WINDOWS SERVICES HEALTH COLLECTOR
# ==============================================================================

function Get-WindowsServicesHealthCheck {
    [CmdletBinding()]
    param (
        [string[]]$Services
    )

    Write-DiagnosticLog -Level 'DEBUG' -Message "Evaluating status of monitored system services..."

    $serviceResults = @()
    $serviceIssues = @()

    foreach ($svcName in $Services) {
        try {
            $svc = Get-Service -Name $svcName -ErrorAction SilentlyContinue
            if (-not $svc) {
                $serviceResults += [PSCustomObject]@{
                    Name        = $svcName
                    DisplayName = "Service Not Installed"
                    Status      = "NotInstalled"
                    StartType   = "Unknown"
                    StartName   = "N/A"
                    Evaluation  = "NOT_INSTALLED"
                }
                Write-DiagnosticLog -Level 'DEBUG' -Message "Service '$svcName' is not installed."
                continue
            }

            # Retrieve startup type and service account via CIM Win32_Service
            $startType = $svc.StartType.ToString()
            $startName = "LocalSystem"
            try {
                $cimSvc = Get-CimInstance -ClassName Win32_Service -Filter "Name='$svcName'" -ErrorAction SilentlyContinue
                if ($cimSvc) {
                    if ($cimSvc.StartMode) { $startType = $cimSvc.StartMode }
                    if ($cimSvc.StartName) { $startName = $cimSvc.StartName }
                }
            }
            catch {
                Write-DiagnosticLog -Level 'DEBUG' -Message "Could not query Win32_Service for '$svcName': $($_.Exception.Message)"
            }

            $statusStr = $svc.Status.ToString()
            $eval = "HEALTHY"

            # Anomaly rules
            if ($startType -match 'Auto' -and $statusStr -ne 'Running') {
                $eval = "ANOMALY_STOPPED"
                $serviceIssues += "Service '$($svc.DisplayName)' ($svcName) is configured for Automatic start but is currently Stopped."
            }
            elseif ($svcName -eq 'RemoteRegistry' -and $statusStr -eq 'Running') {
                $eval = "SECURITY_REVIEW"
                $serviceIssues += "Remote Registry service is actively Running (Exposes remote attack surface; should normally be Disabled)."
            }
            elseif (($svcName -eq 'WinDefend' -or $svcName -eq 'MpsSvc') -and $statusStr -ne 'Running') {
                $eval = "SECURITY_CRITICAL"
                $serviceIssues += "Critical security component '$($svc.DisplayName)' ($svcName) is NOT running!"
            }
            elseif ($statusStr -eq 'Running') {
                $eval = "HEALTHY"
            }
            else {
                $eval = "STOPPED_INTENTIONAL"
            }

            $serviceResults += [PSCustomObject]@{
                Name        = $svc.Name
                DisplayName = $svc.DisplayName
                Status      = $statusStr
                StartType   = $startType
                StartName   = $startName
                Evaluation  = $eval
            }
        }
        catch {
            Write-DiagnosticLog -Level 'WARN' -Message "Exception reading service '$svcName': $($_.Exception.Message)"
            $serviceIssues += "Error querying service '$svcName': $($_.Exception.Message)"
        }
    }

    $anomaliesCount = @($serviceResults | Where-Object { $_.Evaluation -match 'ANOMALY|SECURITY' }).Count

    return [PSCustomObject]@{
        TotalMonitored  = @($serviceResults).Count
        HealthyCount    = @($serviceResults | Where-Object { $_.Evaluation -eq 'HEALTHY' -or $_.Evaluation -eq 'STOPPED_INTENTIONAL' }).Count
        AnomaliesCount  = $anomaliesCount
        Services        = $serviceResults
        ServiceIssues   = $serviceIssues
    }
}

# ==============================================================================
# 5. RECENT EVENT LOG ERRORS COLLECTOR (LAST 24 HOURS)
# ==============================================================================

function Get-EventLogHealthCheck {
    [CmdletBinding()]
    param (
        [int]$Hours = 24,
        [int]$MaxEntries = 50
    )

    Write-DiagnosticLog -Level 'DEBUG' -Message "Querying Application & System event logs for Critical & Error records in the last $Hours hours..."

    $eventList = @()
    $logIssues = @()
    $startTime = (Get-Date).AddHours(-$Hours)

    $appErrorCount = 0
    $sysErrorCount = 0
    $criticalCount = 0

    $filter = @{
        LogName   = @('System', 'Application')
        Level     = @(1, 2) # 1 = Critical, 2 = Error
        StartTime = $startTime
    }

    try {
        $events = Get-WinEvent -FilterHashtable $filter -MaxEvents $MaxEntries -ErrorAction Stop
        
        foreach ($ev in $events) {
            if ($ev.Level -eq 1) { $criticalCount++ }
            if ($ev.LogName -eq 'Application') { $appErrorCount++ }
            if ($ev.LogName -eq 'System') { $sysErrorCount++ }

            # Sanitize message: strip extraneous carriage returns and truncate to keep payload concise
            $cleanMsg = if ($ev.Message) {
                $ev.Message -replace "[\r\n]+", " " -replace "\s{2,}", " "
            } else {
                "(No message body provided by provider)"
            }

            if ($cleanMsg.Length -gt 350) {
                $cleanMsg = $cleanMsg.Substring(0, 350) + "... [TRUNCATED]"
            }

            $eventList += [PSCustomObject]@{
                TimeCreatedUtc   = $ev.TimeCreated.ToUniversalTime().ToString("o")
                TimeCreatedLocal = $ev.TimeCreated.ToString("yyyy-MM-dd HH:mm:ss")
                LogName          = $ev.LogName
                ProviderName     = $ev.ProviderName
                EventId          = $ev.Id
                Level            = $ev.Level
                LevelDisplayName = if ($ev.LevelDisplayName) { $ev.LevelDisplayName } else { "Level $($ev.Level)" }
                Message          = $cleanMsg
            }
        }

        if ($criticalCount -gt 0) {
            $logIssues += "Detected $criticalCount CRITICAL (Level 1) event log entries in the past $Hours hours."
        }
        if (($appErrorCount + $sysErrorCount) -gt 20) {
            $logIssues += "High volume of system/application errors encountered ($($appErrorCount + $sysErrorCount) errors)."
        }
    }
    catch {
        # Check if error was just 'No events were found that match the specified selection criteria'
        if ($_.Exception.Message -match "No events were found") {
            Write-DiagnosticLog -Level 'DEBUG' -Message "No Critical or Error events recorded in Application/System logs over the last $Hours hours."
        }
        else {
            Write-DiagnosticLog -Level 'WARN' -Message "Could not retrieve event logs via Get-WinEvent: $($_.Exception.Message)"
            $logIssues += "Get-WinEvent query failure: $($_.Exception.Message)"
        }
    }

    # Identify top repeating event IDs
    $topEventSummary = @()
    if ($eventList.Count -gt 0) {
        $topEventSummary = $eventList | Group-Object EventId, ProviderName | 
            Sort-Object Count -Descending | 
            Select-Object -First 5 | 
            ForEach-Object {
                [PSCustomObject]@{
                    EventId      = $_.Group[0].EventId
                    ProviderName = $_.Group[0].ProviderName
                    LogName      = $_.Group[0].LogName
                    Occurrences  = $_.Count
                }
            }
    }

    return [PSCustomObject]@{
        LookbackHours         = $Hours
        TotalErrorsRecorded   = $eventList.Count
        CriticalErrorsCount   = $criticalCount
        ApplicationErrorCount = $appErrorCount
        SystemErrorCount      = $sysErrorCount
        TopRecurringEvents    = $topEventSummary
        Events                = $eventList
        EventLogIssues        = $logIssues
    }
}

# ==============================================================================
# 6. NETWORK ADAPTERS, CONFIG & LATENCY COLLECTOR
# ==============================================================================

function Get-NetworkHealthCheck {
    [CmdletBinding()]
    param()

    Write-DiagnosticLog -Level 'DEBUG' -Message "Gathering network adapter configurations, IP bindings, and gateway ping latency..."

    $activeAdapters = @()
    $networkIssues = @()
    $primaryGateway = $null

    try {
        # Get active network adapters with Link Status Up
        $adapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } -ErrorAction SilentlyContinue

        foreach ($ad in $adapters) {
            $ipConfig = Get-NetIPConfiguration -InterfaceIndex $ad.InterfaceIndex -ErrorAction SilentlyContinue

            $ipv4List = @()
            $ipv6List = @()
            $gateways = @()
            $dnsServers = @()

            if ($ipConfig) {
                # Extract IPv4
                if ($ipConfig.IPv4Address) {
                    $ipv4List = @($ipConfig.IPv4Address | ForEach-Object { $_.IPAddress })
                }
                # Extract IPv6
                if ($ipConfig.IPv6Address) {
                    $ipv6List = @($ipConfig.IPv6Address | ForEach-Object { $_.IPAddress })
                }
                # Extract Gateways
                if ($ipConfig.IPv4DefaultGateway) {
                    $gateways = @($ipConfig.IPv4DefaultGateway | ForEach-Object { $_.NextHop })
                    if (-not $primaryGateway -and $gateways.Count -gt 0) {
                        $primaryGateway = $gateways[0]
                    }
                }
                # Extract DNS
                if ($ipConfig.DnsServer) {
                    $dnsServers = @($ipConfig.DnsServer | ForEach-Object { $_.ServerAddresses } | Where-Object { $_ })
                }
            }

            $activeAdapters += [PSCustomObject]@{
                InterfaceAlias       = $ad.InterfaceAlias
                InterfaceDescription = $ad.InterfaceDescription
                MACAddress           = $ad.MacAddress
                LinkSpeed            = $ad.LinkSpeed
                Status               = $ad.Status
                IPv4Addresses        = $ipv4List
                IPv6Addresses        = $ipv6List
                DefaultGateways      = $gateways
                DnsServers           = $dnsServers
            }
        }
    }
    catch {
        Write-DiagnosticLog -Level 'WARN' -Message "Error inspecting network adapters: $($_.Exception.Message)"
        $networkIssues += "Network adapter enumeration failure: $($_.Exception.Message)"
    }

    # Gateway Latency Ping Diagnostic
    $gatewayPingReport = [PSCustomObject]@{
        TargetGateway       = if ($primaryGateway) { $primaryGateway } else { "None" }
        Reachable           = $false
        PacketsSent         = 4
        PacketsReceived     = 0
        PacketLossPercent   = 100.0
        MinLatencyMs        = 0.0
        MaxLatencyMs        = 0.0
        AverageLatencyMs    = 0.0
        Evaluation          = "UNCONFIGURED"
    }

    if ($primaryGateway) {
        Write-DiagnosticLog -Level 'DEBUG' -Message "Executing latency ping test against default gateway '$primaryGateway'..."
        try {
            $pings = Test-Connection -ComputerName $primaryGateway -Count 4 -ErrorAction SilentlyContinue

            if ($pings -and $pings.Count -gt 0) {
                # Cross-version compatibility: PS 5.1 uses ResponseTime, PS 7 uses Latency
                $latencies = @($pings | ForEach-Object {
                    if ($_.ResponseTime -ne $null) { [double]$_.ResponseTime }
                    elseif ($_.Latency -ne $null) { [double]$_.Latency }
                    else { 0.0 }
                })

                $received = $latencies.Count
                $loss = [Math]::Round(((4 - $received) / 4) * 100, 1)
                $stats = $latencies | Measure-Object -Minimum -Maximum -Average

                $avg = [Math]::Round($stats.Average, 2)
                $min = [Math]::Round($stats.Minimum, 2)
                $max = [Math]::Round($stats.Maximum, 2)

                $eval = "EXCELLENT"
                if ($loss -gt 0) {
                    $eval = "PACKET_LOSS"
                    $networkIssues += "Gateway ping test experienced $loss% packet loss."
                }
                elseif ($avg -gt 80) {
                    $eval = "HIGH_LATENCY"
                    $networkIssues += "High average gateway latency detected (${avg}ms)."
                }
                elseif ($avg -gt 25) {
                    $eval = "FAIR"
                }

                $gatewayPingReport = [PSCustomObject]@{
                    TargetGateway       = $primaryGateway
                    Reachable           = $true
                    PacketsSent         = 4
                    PacketsReceived     = $received
                    PacketLossPercent   = $loss
                    MinLatencyMs        = $min
                    MaxLatencyMs        = $max
                    AverageLatencyMs    = $avg
                    Evaluation          = $eval
                }
            }
            else {
                $gatewayPingReport.Evaluation = "UNREACHABLE"
                $networkIssues += "Default gateway '$primaryGateway' did not respond to ICMP ping (100% loss)."
            }
        }
        catch {
            $gatewayPingReport.Evaluation = "PING_FAILED"
            $networkIssues += "Test-Connection failed against gateway: $($_.Exception.Message)"
        }
    }
    else {
        $networkIssues += "No active IPv4 default gateway configured on any active network adapter."
    }

    # External DNS Resolution Check
    $dnsReport = [PSCustomObject]@{
        TargetDomain     = "dns.google"
        ResolvedIp       = "None"
        ResolutionTimeMs = 0.0
        Successful       = $false
    }

    try {
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        $dnsResult = Resolve-DnsName -Name "dns.google" -ErrorAction SilentlyContinue | Select-Object -First 1
        $sw.Stop()

        if ($dnsResult -and $dnsResult.IPAddress) {
            $dnsReport = [PSCustomObject]@{
                TargetDomain     = "dns.google"
                ResolvedIp       = $dnsResult.IPAddress
                ResolutionTimeMs = [Math]::Round($sw.Elapsed.TotalMilliseconds, 2)
                Successful       = $true
            }
        }
        else {
            $networkIssues += "External DNS resolution failed for 'dns.google'."
        }
    }
    catch {
        $networkIssues += "DNS resolution exception: $($_.Exception.Message)"
    }

    # Overall Network Status
    $overallNetwork = "HEALTHY"
    if (-not $primaryGateway -or $gatewayPingReport.Evaluation -eq 'UNREACHABLE') {
        $overallNetwork = "DISCONNECTED"
    }
    elseif ($networkIssues.Count -gt 0) {
        $overallNetwork = "DEGRADED"
    }

    return [PSCustomObject]@{
        NetworkStatus           = $overallNetwork
        ActiveAdaptersCount     = $activeAdapters.Count
        ActiveAdapters          = $activeAdapters
        DefaultGatewayPingTest  = $gatewayPingReport
        DnsResolutionTest       = $dnsReport
        NetworkIssues           = $networkIssues
    }
}

# ==============================================================================
# 7. AUTOMATED ITIL HEALTH ASSESSMENT & TRIAGE ENGINE
# ==============================================================================

function Invoke-HealthAssessment {
    [CmdletBinding()]
    param (
        [object]$Storage,
        [object]$Services,
        [object]$Events,
        [object]$Network
    )

    Write-DiagnosticLog -Level 'DEBUG' -Message "Executing ITIL desktop health triage engine..."

    $healthScore = 100
    $issues = @()
    $actions = @()

    # 1. Storage Triage
    foreach ($d in $Storage.LogicalDisks) {
        if ($d.Status -eq 'CRITICAL') {
            $healthScore -= 30
            $issues += "Volume $($d.DeviceID) has only $($d.PercentFree)% free space ($($d.FreeSpaceGB) GB remaining)."
            $actions += "Urgent: Clear disk space on $($d.DeviceID) (run cleanmgr.exe /sageset, purge %TEMP%, review user download folder)."
        }
        elseif ($d.Status -eq 'WARNING') {
            $healthScore -= 10
            $issues += "Volume $($d.DeviceID) is approaching threshold with $($d.PercentFree)% free space."
            $actions += "Schedule maintenance to purge temp files and review storage growth on $($d.DeviceID)."
        }
    }

    foreach ($pd in $Storage.PhysicalDrives) {
        if ($pd.SmartPredictFailure) {
            $healthScore -= 40
            $issues += "CRITICAL: Physical disk '$($pd.FriendlyName)' reports SMART Failure Prediction True!"
            $actions += "IMMEDIATE ACTION REQUIRED: Backup drive data immediately and schedule drive replacement."
        }
    }

    # 2. Services Triage
    foreach ($s in $Services.Services) {
        if ($s.Evaluation -eq 'ANOMALY_STOPPED') {
            $healthScore -= 10
            $issues += "Service '$($s.DisplayName)' ($($s.Name)) is configured for Automatic start but is Stopped."
            $actions += "Attempt service recovery: Start-Service -Name '$($s.Name)' and inspect Windows Event Log for crash dumps."
        }
        elseif ($s.Evaluation -eq 'SECURITY_CRITICAL') {
            $healthScore -= 25
            $issues += "Security service '$($s.DisplayName)' ($($s.Name)) is NOT running!"
            $actions += "Escalate to SecOps/Tier-2 immediately to remediate endpoint protection on '$($s.Name)'."
        }
        elseif ($s.Evaluation -eq 'SECURITY_REVIEW') {
            $healthScore -= 5
            $issues += "Service '$($s.DisplayName)' ($($s.Name)) is currently running (potential security policy mismatch)."
            $actions += "Review enterprise baseline: Consider disabling Remote Registry if unneeded."
        }
    }

    # 3. Event Log Triage
    if ($Events.CriticalErrorsCount -gt 0) {
        $healthScore -= ($Events.CriticalErrorsCount * 10)
        $issues += "Found $($Events.CriticalErrorsCount) Critical (Level 1) event log error(s) in past $($Events.LookbackHours) hours."
        $actions += "Inspect Critical event logs using Get-WinEvent to determine root cause of system instability."
    }
    if ($Events.TotalErrorsRecorded -gt 25) {
        $healthScore -= 10
        $issues += "Elevated error log volume ($($Events.TotalErrorsRecorded) errors in $($Events.LookbackHours) hours)."
        $actions += "Investigate recurring event IDs: $($Events.TopRecurringEvents | ForEach-Object { "$($_.ProviderName):$($_.EventId)" } -join ', ')."
    }

    # 4. Network Triage
    if ($Network.NetworkStatus -eq 'DISCONNECTED') {
        $healthScore -= 40
        $issues += "Host is unable to reach the default gateway or has no network route configured."
        $actions += "Verify physical Ethernet/Wi-Fi connection, check DHCP lease, or restart network adapter."
    }
    elseif ($Network.NetworkStatus -eq 'DEGRADED') {
        $healthScore -= 15
        $issues += "Network diagnostics detected degraded connection (Packet Loss: $($Network.DefaultGatewayPingTest.PacketLossPercent)%, Avg Latency: $($Network.DefaultGatewayPingTest.AverageLatencyMs)ms)."
        $actions += "Test local switchport/router performance and check for duplicate IP address or channel interference."
    }

    if (-not $Network.DnsResolutionTest.Successful) {
        $healthScore -= 15
        $issues += "Host failed external DNS resolution for '$($Network.DnsResolutionTest.TargetDomain)'."
        $actions += "Verify DNS server configuration ($($Network.ActiveAdapters.DnsServers -join ', ')) and test flushdns."
    }

    # Clamp health score to [0, 100]
    if ($healthScore -lt 0) { $healthScore = 0 }

    # Determine overall status label
    $overallStatus = "HEALTHY"
    if ($healthScore -le 50 -or (@($issues | Where-Object { $_ -match 'CRITICAL' }).Count -gt 0)) {
        $overallStatus = "CRITICAL"
    }
    elseif ($healthScore -le 85 -or @($issues).Count -gt 0) {
        $overallStatus = "WARNING"
    }

    if (@($issues).Count -eq 0) {
        $issues += "All subsystem metrics are operating within normal enterprise parameters."
        $actions += "No corrective action required. Routine health baseline achieved."
    }

    return [PSCustomObject]@{
        OverallHealth       = $overallStatus
        HealthScore         = $healthScore
        IssueCount          = if ($overallStatus -eq 'HEALTHY') { 0 } else { @($issues).Count }
        IdentifiedIssues    = $issues
        RecommendedActions  = $actions
    }
}

# ==============================================================================
# 8. CONSOLE DASHBOARD DISPLAY ROUTINE
# ==============================================================================

function Show-DiagnosticDashboard {
    param (
        [object]$Report
    )

    if ($Quiet -or $AsJson) { return }

    $meta = $Report.SystemMetadata
    $triage = $Report.TriageSummary
    $storage = $Report.StorageHealth
    $services = $Report.ServiceStates
    $net = $Report.NetworkDiagnostics
    $events = $Report.EventLogErrors

    Write-Host "`n================================================================================" -ForegroundColor Cyan
    Write-Host "                WINDOWS WORKSTATION HEALTH & TRIAGE DASHBOARD                  " -ForegroundColor White
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host " Host: $($meta.Hostname)  |  OS: $($meta.OperatingSystem) ($($meta.Architecture))"
    Write-Host " User: $($meta.CurrentUser)  |  Uptime: $($meta.UptimeFormatted)  |  Elevated: $($meta.ExecutionElevated)"
    Write-Host "--------------------------------------------------------------------------------"

    # Status & Score Banner
    $statusColor = switch ($triage.OverallHealth) {
        'HEALTHY'  { 'Green' }
        'WARNING'  { 'Yellow' }
        'CRITICAL' { 'Red' }
    }
    Write-Host " HEALTH STATUS: " -NoNewline
    Write-Host "[$($triage.OverallHealth)]" -ForegroundColor $statusColor -NoNewline
    Write-Host "   HEALTH SCORE: " -NoNewline
    Write-Host "$($triage.HealthScore)/100" -ForegroundColor $statusColor -NoNewline
    Write-Host "   ISSUES DETECTED: $($triage.IssueCount)"

    Write-Host "`n[1] LOCAL DISK ALLOCATION & DRIVE HEALTH" -ForegroundColor Yellow
    foreach ($d in $storage.LogicalDisks) {
        $diskColor = if ($d.Status -eq 'CRITICAL') { 'Red' } elseif ($d.Status -eq 'WARNING') { 'Yellow' } else { 'Green' }
        Write-Host "  $($d.DeviceID) [$($d.VolumeName)] $($d.FreeSpaceGB) GB free of $($d.TotalSizeGB) GB ($($d.PercentFree)% free) -> [$($d.Status)]" -ForegroundColor $diskColor
    }
    foreach ($pd in $storage.PhysicalDrives) {
        $smartColor = if ($pd.SmartPredictFailure) { 'Red' } else { 'Green' }
        Write-Host "  Disk $($pd.DeviceId): $($pd.FriendlyName) [$($pd.MediaType)/$($pd.BusType)] Health: $($pd.HealthStatus), SMART: $(if ($pd.SmartPredictFailure){'FAILING'}else{'OK'})" -ForegroundColor $smartColor
    }

    Write-Host "`n[2] MONITORED SERVICE STATES" -ForegroundColor Yellow
    foreach ($s in $services.Services) {
        $sColor = switch ($s.Evaluation) {
            'HEALTHY'            { 'Green' }
            'STOPPED_INTENTIONAL'{ 'Gray' }
            'ANOMALY_STOPPED'    { 'Yellow' }
            'SECURITY_CRITICAL'  { 'Red' }
            'SECURITY_REVIEW'    { 'DarkYellow' }
            default              { 'White' }
        }
        Write-Host "  $($s.Name.PadRight(18)) State: $($s.Status.PadRight(10)) Startup: $($s.StartType.PadRight(12)) -> [$($s.Evaluation)]" -ForegroundColor $sColor
    }

    Write-Host "`n[3] NETWORK & GATEWAY LATENCY" -ForegroundColor Yellow
    $netColor = if ($net.NetworkStatus -eq 'HEALTHY') { 'Green' } elseif ($net.NetworkStatus -eq 'DEGRADED') { 'Yellow' } else { 'Red' }
    Write-Host "  Network Status: [$($net.NetworkStatus)]" -ForegroundColor $netColor
    foreach ($ad in $net.ActiveAdapters) {
        Write-Host "  Adapter: $($ad.InterfaceAlias) ($($ad.LinkSpeed)) IPv4: $($ad.IPv4Addresses -join ', ') Gateway: $($ad.DefaultGateways -join ', ')"
    }
    $ping = $net.DefaultGatewayPingTest
    Write-Host "  Gateway Ping ($($ping.TargetGateway)): Loss=$($ping.PacketLossPercent)%, AvgLatency=$($ping.AverageLatencyMs)ms [$($ping.Evaluation)]"
    $dns = $net.DnsResolutionTest
    Write-Host "  DNS Resolution ($($dns.TargetDomain)): $(if ($dns.Successful){"Resolved to $($dns.ResolvedIp) in $($dns.ResolutionTimeMs)ms"}else{"FAILED"})"

    Write-Host "`n[4] EVENT LOG SUMMARY (LAST $($events.LookbackHours) HOURS)" -ForegroundColor Yellow
    Write-Host "  Critical Events: $($events.CriticalErrorsCount)  |  Total Errors: $($events.TotalErrorsRecorded) (App: $($events.ApplicationErrorCount), Sys: $($events.SystemErrorCount))"
    if ($events.TopRecurringEvents.Count -gt 0) {
        Write-Host "  Top Offending Errors:"
        foreach ($top in $events.TopRecurringEvents) {
            Write-Host "    - EventID $($top.EventId) [$($top.ProviderName) in $($top.LogName)]: $($top.Occurrences) occurrence(s)" -ForegroundColor DarkGray
        }
    }

    Write-Host "`n[5] TIER-1 / TIER-2 RECOMMENDED ACTIONS" -ForegroundColor Yellow
    foreach ($act in $triage.RecommendedActions) {
        Write-Host "  -> $act" -ForegroundColor Cyan
    }
    Write-Host "================================================================================`n" -ForegroundColor Cyan
}

# ==============================================================================
# 9. MAIN EXECUTION PIPELINE
# ==============================================================================

try {
    Write-DiagnosticLog -Level 'HEADER' -Message "INITIALIZING WINHEALTHCHECK DIAGNOSTIC SCAN"

    $reportGuid = [System.Guid]::NewGuid().ToString()
    $timestampUtc = (Get-Date).ToUniversalTime().ToString("o")
    $timestampLocal = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss zzz")

    # 1. Gather Subsystem Diagnostics
    $metadata = Get-HostMetadata
    $storage = Get-StorageHealthCheck -WarnPct $DiskWarningThresholdPercent -CritPct $DiskCriticalThresholdPercent
    $services = Get-WindowsServicesHealthCheck -Services $TargetServices
    $events = Get-EventLogHealthCheck -Hours $EventLogHours -MaxEntries $MaxEventLogEntries
    $network = Get-NetworkHealthCheck

    # 2. Compute ITIL Triage & Health Score
    $triage = Invoke-HealthAssessment -Storage $storage -Services $services -Events $events -Network $network

    # 3. Assemble Master Diagnostic Report
    $diagnosticReport = [PSCustomObject]@{
        SchemaVersion      = "2.0"
        ReportId           = $reportGuid
        GeneratedAtUtc     = $timestampUtc
        GeneratedAtLocal   = $timestampLocal
        TriageSummary      = $triage
        SystemMetadata     = $metadata
        StorageHealth      = $storage
        ServiceStates      = $services
        EventLogErrors     = $events
        NetworkDiagnostics = $network
    }

    # 4. Display Visual Dashboard
    Show-DiagnosticDashboard -Report $diagnosticReport

    # 5. Export JSON to Disk if Requested
    if ($OutputPath) {
        Write-DiagnosticLog -Level 'INFO' -Message "Exporting diagnostic JSON report to '$OutputPath'..."
        try {
            $outDir = [System.IO.Path]::GetDirectoryName($OutputPath)
            if ($outDir -and -not (Test-Path -Path $outDir)) {
                $null = New-Item -ItemType Directory -Path $outDir -Force -ErrorAction Stop
            }
            $jsonContent = ConvertTo-Json -InputObject $diagnosticReport -Depth 10
            $jsonContent | Out-File -FilePath $OutputPath -Encoding UTF8 -Force -ErrorAction Stop
            Write-DiagnosticLog -Level 'SUCCESS' -Message "Report successfully saved to '$OutputPath' ($([System.Text.Encoding]::UTF8.GetByteCount($jsonContent)) bytes)."
        }
        catch {
            Write-DiagnosticLog -Level 'ERROR' -Message "Failed saving report to '$OutputPath': $($_.Exception.Message)"
        }
    }

    # 6. Automatic Incident Ticketing / Telemetry Dispatch
    if ($SendTicket) {
        if ([string]::IsNullOrWhiteSpace($ApiEndpoint)) {
            Write-DiagnosticLog -Level 'ERROR' -Message "-SendTicket was specified, but -ApiEndpoint is missing or empty. Skipping dispatch."
        }
        else {
            Write-DiagnosticLog -Level 'INFO' -Message "Dispatching diagnostic payload to incident API: $ApiEndpoint"

            # Locate Invoke-TicketAPI.ps1 in current script directory or PATH
            $dispatcherScript = Join-Path -Path $PSScriptRoot -ChildPath "Invoke-TicketAPI.ps1"
            if (-not (Test-Path -Path $dispatcherScript)) {
                # Fallback to current working directory
                $dispatcherScript = ".\Invoke-TicketAPI.ps1"
            }

            if (-not (Test-Path -Path $dispatcherScript)) {
                Write-DiagnosticLog -Level 'ERROR' -Message "Cannot find Invoke-TicketAPI.ps1 at '$dispatcherScript'. Verify file presence."
            }
            else {
                $ticketParams = @{
                    ApiEndpoint = $ApiEndpoint
                    Payload     = $diagnosticReport
                    PassThru    = $true
                }

                if ($ApiToken) { $ticketParams['BearerToken'] = $ApiToken }
                if ($ApiTokenPlain) { $ticketParams['PlainToken'] = $ApiTokenPlain }
                if ($DryRun) { $ticketParams['DryRun'] = $true }
                if ($LogFilePath) { $ticketParams['LogFilePath'] = $LogFilePath }

                try {
                    $apiResult = & $dispatcherScript @ticketParams
                    if ($apiResult -and $apiResult.Success) {
                        Write-DiagnosticLog -Level 'SUCCESS' -Message "Incident ticket/telemetry dispatch succeeded (Status: $($apiResult.StatusCode))."
                    }
                    else {
                        Write-DiagnosticLog -Level 'WARN' -Message "Incident ticket/telemetry dispatch reported failure."
                    }
                }
                catch {
                    Write-DiagnosticLog -Level 'ERROR' -Message "Exception executing Invoke-TicketAPI.ps1: $($_.Exception.Message)"
                }
            }
        }
    }

    # 7. Output Handling for Automation / Pipelines
    if ($AsJson) {
        ConvertTo-Json -InputObject $diagnosticReport -Depth 10
    }
    elseif ($PassThru) {
        return $diagnosticReport
    }

    Write-DiagnosticLog -Level 'SUCCESS' -Message "WinHealthCheck diagnostic scan finished successfully."
}
catch {
    Write-DiagnosticLog -Level 'ERROR' -Message "Unhandled error in WinHealthCheck execution pipeline: $($_.Exception.Message)"
    throw
}
