param(
  [string]$ApiKey = $env:MBIYO_TEST_API_KEY,
  [ValidateSet("vodacom", "airtel", "orange", "africell")]
  [string]$Network = "airtel",
  [string]$PhoneNumber = "",
  [ValidateSet("USD", "CDF")]
  [string]$Currency = "CDF",
  [decimal]$Amount = 1500,
  [string]$CallbackUrl = "https://example.com/api/v1/payments/webhook/mbiyo",
  [string]$BaseUrl = "https://dashboard.mbiyo.africa"
)

$ErrorActionPreference = "Stop"

if (-not $ApiKey) {
  Write-Host "Missing Mbiyo sandbox API key." -ForegroundColor Red
  Write-Host "Set it first:" -ForegroundColor Yellow
  Write-Host '$env:MBIYO_TEST_API_KEY=""'
  exit 1
}

$defaultPhones = @{
  vodacom = "243970000000"
  airtel = "243971111111"
  orange = "243892222222"
  africell = "243910000000"
}

if (-not $PhoneNumber) {
  $PhoneNumber = $defaultPhones[$Network]
}

$orderId = "KASKADE-SBX-{0}" -f ([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
$endpoint = "$BaseUrl/api/v1/merchant/payin"

$payload = @{
  amount = $Amount
  currency = $Currency
  payment_method = "mobile_money"
  order_id = $orderId
  callback_url = $CallbackUrl
  metadata = @{
    phone_number = $PhoneNumber
    network = $Network
    country_code = "CD"
  }
}

$headers = @{
  Authorization = "Bearer $ApiKey"
  Accept = "application/json"
  "Content-Type" = "application/json"
}

$body = $payload | ConvertTo-Json -Depth 8

Write-Host "Mbiyo sandbox Payin test" -ForegroundColor Cyan
Write-Host "Endpoint : $endpoint"
Write-Host "Order ID : $orderId"
Write-Host "Network  : $Network"
Write-Host "Phone    : $PhoneNumber"
Write-Host "Amount   : $Amount $Currency"
Write-Host ""

try {
  $response = Invoke-RestMethod -Method Post -Uri $endpoint -Headers $headers -Body $body
  $json = $response | ConvertTo-Json -Depth 10
  Write-Host $json

  if ($response.data.status -eq "successful") {
    Write-Host "`nResult: SANDBOX PAYMENT SUCCESSFUL" -ForegroundColor Green
  } elseif ($response.data.status -eq "failed") {
    Write-Host "`nResult: SANDBOX PAYMENT FAILED" -ForegroundColor Yellow
  } else {
    Write-Host "`nResult: $($response.data.status)" -ForegroundColor Yellow
  }
} catch {
  Write-Host "Sandbox request failed." -ForegroundColor Red

  if ($_.Exception.Response) {
    $statusCode = [int]$_.Exception.Response.StatusCode
    Write-Host "HTTP status: $statusCode" -ForegroundColor Yellow

    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream) {
      $reader = New-Object System.IO.StreamReader($stream)
      Write-Host ($reader.ReadToEnd())
    }
  } else {
    Write-Host $_.Exception.Message
  }

  exit 1
}
