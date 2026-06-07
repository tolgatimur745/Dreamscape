$modules = @(
  "nav_fix.js",
  "cyber_spy.js",
  "node_hacker.js",
  "brain_games.js",
  "new_features_a.js",
  "new_features_b.js",
  "beatmaker_v2.js",
  "simulation_upgrades.js"
)

foreach ($mod in $modules) {
  if (Test-Path $mod) {
    $lines = Get-Content $mod -Encoding UTF8
    Add-Content -Path app.js -Value $lines -Encoding UTF8
    Write-Output "Added: $mod ($($lines.Count) lines)"
  } else {
    Write-Output "MISSING: $mod"
  }
}

Write-Output "--- Done. Total app.js lines: $((Get-Content app.js -Encoding UTF8).Count)"
