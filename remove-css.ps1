$content = Get-Content index.html -Raw
$pattern = '(?s)(\s*:root \{.*?\}\s*</head>)'
$replacement = '</head>'
$newContent = $content -replace $pattern, $replacement
Set-Content index.html -Value $newContent -NoNewline

