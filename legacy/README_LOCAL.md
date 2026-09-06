# Como testar localmente

## Opção 1: Servidor HTTP Python (Recomendado)

1. Abra o terminal na pasta do CV
2. Execute: `serve.bat` (Windows) ou `python -m http.server 8000` (Linux/Mac)
3. Acesse: http://localhost:8000

## Opção 2: Live Server (VS Code)

1. Instale a extensão "Live Server" no VS Code
2. Clique com botão direito no `index.html`
3. Selecione "Open with Live Server"

## Opção 3: Servidor Node.js (se tiver Node instalado)

```bash
npx http-server -p 8000
```

## Nota

O servidor local é necessário porque o CV usa `fetch()` para carregar arquivos JSON e templates, o que não funciona com `file://` protocol.

