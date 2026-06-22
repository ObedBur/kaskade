$url = "https://registry.npmjs.org/remeda/-/remeda-2.33.4.tgz"
$file = "remeda.tgz"
$success = $false

Write-Host "La connexion semble instable. Démarrage avec mode anti-coupure..."

for ($i = 1; $i -le 10; $i++) {
    Write-Host "Tentative de téléchargement $i sur 10..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $file -ErrorAction Stop
        
        # On vérifie si l'archive est complète (pas tronquée)
        tar -tf $file > $null 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Téléchargement réussi et fichier complet !"
            $success = $true
            break
        } else {
            Write-Host "Le fichier est incomplet. Nouvelle tentative..."
        }
    } catch {
        Write-Host "Coupure réseau détectée. Nouvelle tentative dans 2 secondes..."
        Start-Sleep -Seconds 2
    }
}

if ($success) {
    Write-Host "Extraction en cours..."
    tar -xf $file
    Write-Host "Remplacement des fichiers..."
    Copy-Item -Path "package\*" -Destination "D:\kaskade\node_modules\.pnpm\remeda@2.33.4\node_modules\remeda" -Recurse -Force
    Remove-Item -Path $file -Force
    Remove-Item -Path "package" -Recurse -Force
    Write-Host "✅ Réparation complètement terminée ! Vous pouvez lancer npx prisma db push."
} else {
    Write-Host "❌ Impossible de télécharger le fichier de 150 Ko après 10 tentatives."
}
