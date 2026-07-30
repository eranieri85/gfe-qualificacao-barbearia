# Conectar o formulário a uma planilha Google Sheets

## Passo a passo (2 minutos)

1. Crie uma planilha nova em [sheets.google.com](https://sheets.google.com).
2. No menu, vá em **Extensões > Apps Script**.
3. Apague o conteúdo padrão do editor e cole o conteúdo do arquivo [`Code.gs`](Code.gs) deste repositório.
4. Clique em **Implantar > Nova implantação**.
5. Em "Selecionar tipo", escolha **App da Web**.
6. Configure:
   - **Executar como:** Eu (sua conta)
   - **Quem pode acessar:** Qualquer pessoa
7. Clique em **Implantar** e autorize as permissões solicitadas.
8. Copie a **URL do app da Web** gerada (algo como `https://script.google.com/macros/s/AKfycb.../exec`).
9. Cole essa URL no arquivo [`config.js`](../config.js) do app, na chave `LEAD_WEBHOOK_URL`:

```js
LEAD_WEBHOOK_URL: "https://script.google.com/macros/s/SEU_ID_AQUI/exec",
```

10. Publique novamente o site (ou aguarde o deploy automático, se estiver usando GitHub Pages).

## Testando

Depois de configurar, complete o questionário no app publicado e confira se uma nova linha apareceu na planilha, com nome, WhatsApp, pacote recomendado e os scores calculados.

## Observações

- Toda vez que você editar o `Code.gs` no editor do Apps Script, é preciso criar uma **nova implantação** (ou gerenciar implantações existentes) para que as mudanças valham na URL publicada.
- Os leads também ficam salvos localmente no navegador do usuário (`localStorage`, chave `gfe_leads`) como redundância, mesmo se o webhook falhar.

## Segurança: token compartilhado

O `Code.gs` só grava uma linha na planilha se o campo `token` enviado bater com a constante `SECRET_TOKEN` no topo do arquivo. Esse valor precisa ser **idêntico** ao `CONFIG.LEAD_SECRET` em [`config.js`](../config.js) — os dois já vêm sincronizados neste repositório.

Isso não é sigilo real (o app é 100% estático e público, então o token trafega visível no corpo da requisição — qualquer um com o DevTools aberto consegue ver). O que ele impede é o cenário mais provável de abuso: alguém encontrar a URL do webhook no código-fonte público e mandar requisições diretas pra poluir sua planilha sem nem passar pelo questionário.

Se algum dia esse token vazar ou você quiser trocá-lo:
1. Gere um novo valor aleatório (qualquer string longa serve).
2. Atualize `SECRET_TOKEN` no `Code.gs` **e** `LEAD_SECRET` no `config.js` com o mesmo valor.
3. Crie uma nova implantação do Apps Script (passo 4 acima) e publique o site de novo.
