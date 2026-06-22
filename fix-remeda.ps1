Write-Host "Téléchargement de remeda@2.33.4 (très léger, ~150 Ko)..."
Invoke-WebRequest -Uri "https://registry.npmjs.org/remeda/-/remeda-2.33.4.tgz" -OutFile "remeda.tgz"

Write-Host "Extraction du paquet..."
tar -xf remeda.tgz

Write-Host "Remplacement des fichiers corrompus dans node_modules..."
Copy-Item -Path "package\*" -Destination "D:\kaskade\node_modules\.pnpm\remeda@2.33.4\node_modules\remeda" -Recurse -Force

Write-Host "Nettoyage des fichiers temporaires..."
Remove-Item -Path "remeda.tgz" -Force
Remove-Item -Path "package" -Recurse -Force

Write-Host "✅ Réparation terminée ! Tous les fichiers de remeda sont maintenant neufs."
