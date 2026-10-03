param([ValidateSet('api','web')][string]$Service='web')
$ErrorActionPreference='Stop'
$taskRoot=Split-Path -Parent $PSScriptRoot
$runtimeRoot=Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies'
$nodeFolder=Join-Path $runtimeRoot 'node\bin'
if(Test-Path -LiteralPath $nodeFolder){$env:Path=$nodeFolder+';'+$env:Path}
Set-Location -LiteralPath $taskRoot
if($Service -eq 'api'){
  $pythonPath=Join-Path $taskRoot '.venv\Scripts\python.exe'
  if(-not(Test-Path -LiteralPath $pythonPath)){throw 'Install the API dependencies using IMPLEMENTATION-NOTES.md first.'}
  Set-Location -LiteralPath (Join-Path $taskRoot 'services\api')
  & $pythonPath -m uvicorn app.main:create_app --factory --host 127.0.0.1 --port 8000
}else{
  $pnpmCommand=Get-Command pnpm -ErrorAction SilentlyContinue
  $pnpmPath=if($pnpmCommand){$pnpmCommand.Source}else{Join-Path $runtimeRoot 'bin\fallback\pnpm.cmd'}
  if(-not(Test-Path -LiteralPath $pnpmPath)){throw 'Install pnpm 11.19.0 first.'}
  $env:Path=(Split-Path -Parent $pnpmPath)+';'+$env:Path
  $env:NEXT_TELEMETRY_DISABLED='1'
  & $pnpmPath dev
}
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
