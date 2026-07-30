# Formulário de Qualificação GFE

App web mobile-first que qualifica donos de barbearia através de um questionário de 12 perguntas, calcula a dor financeira predominante e recomenda um dos pacotes de serviço GFE, capturando o lead antes de mostrar o resultado.

Especificação original: `spec-formulario-qualificacao-gfe.md` (não versionada neste repositório).

## Estrutura

- `index.html` — telas do app (intro, captura de lead, questionário, resultado)
- `style.css` — estilos mobile-first
- `app.js` — perguntas, cálculo de scores, lógica de recomendação, navegação
- `config.js` — configurações editáveis: número de WhatsApp e credenciais do Supabase
- `supabase/` — schema SQL e instruções do banco de dados que recebe leads e progresso do funil

## Rodando localmente

Como é um site 100% estático, basta abrir `index.html` no navegador, ou subir um servidor simples:

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Depois acesse `http://localhost:8791`.

## Configuração antes de publicar

Edite `config.js`:

1. `WHATSAPP_NUMERO` — número que recebe o CTA final (DDI+DDD+número, só dígitos).
2. `SUPABASE_URL` e `SUPABASE_ANON_KEY` — credenciais do projeto Supabase (veja `supabase/README.md`).

## Cálculo e recomendação

Ver lógica completa comentada em `app.js` (`avgBloco`, `calcularScores`, `recomendarPacote`). Os limiares (0.4 e 0.55) foram validados manualmente com o caso da PH Barbearia e devem ser recalibrados com mais respostas reais ao longo do tempo.
