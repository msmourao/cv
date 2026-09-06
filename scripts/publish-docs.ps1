# Builds the CV into docs/ for GitHub Pages (base /cv/).
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
npm run build
if ($LASTEXITCODE -ne 0) { throw "vite build failed" }
$nojekyll = Join-Path (Get-Location) 'docs\.nojekyll'
if (-not (Test-Path $nojekyll)) {
  Set-Content -LiteralPath $nojekyll -Value '' -Encoding ascii
}
Write-Host "Published static site to docs/ (GitHub Pages: Settings -> Pages -> /docs)."
