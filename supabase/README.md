# Banco de dados (Supabase)

O app grava leads completos e o progresso do funil direto num projeto Supabase (Postgres gerenciado), via chamadas às funções `registrar_lead` e `registrar_funil`.

## Por que Supabase em vez de Google Sheets/Apps Script

O projeto começou com Google Sheets + Apps Script (ver histórico do repositório). Migrou pra cá porque o Apps Script não foi feito pra escritas concorrentes de verdade: sob volume de requisições simultâneas, o lock manual estourava timeout e descartava dados silenciosamente, e `sendBeacon` não seguia o redirect que as URLs de Web App do Apps Script sempre fazem. O Postgres resolve concorrência nativamente (`ON CONFLICT ... DO UPDATE` é atômico), e a segurança sai de "token escondido no código público" pra políticas de acesso reais no banco.

## Estrutura

- **Tabela `leads`** — um lead por linha, gravado só quando a pessoa termina o questionário.
- **Tabela `funil`** — uma linha por sessão/tentativa, atualizada no início, opcionalmente quando a pessoa sai da página sem terminar, e na conclusão. Mostra até onde cada pessoa foi, mesmo sem terminar — inclusive nome e WhatsApp, pra contato manual.
- **Função `registrar_lead`** e **função `registrar_funil`** — únicos pontos de entrada expostos publicamente. Ver `schema.sql` nesta pasta para o SQL completo.

## Segurança

- RLS (Row Level Security) ativado nas duas tabelas, **sem nenhuma policy** para o papel público (`anon`) — isso bloqueia todo acesso direto: nem `SELECT`, nem `UPDATE`, nem `DELETE`, nem `INSERT` direto na tabela.
- As duas funções são `SECURITY DEFINER` (rodam com privilégio de quem as criou, contornando a RLS internamente) e têm `EXECUTE` liberado só para `anon`. Ou seja: a chave pública do app consegue **apenas inserir/atualizar dados através dessas duas funções específicas** — nada além disso.
- A chave usada em `config.js` (`SUPABASE_ANON_KEY`) é a chave **pública** do projeto — ao contrário do token do Apps Script, ela é *feita* para aparecer no código do navegador. A segurança real está nas políticas acima, não em esconder a chave.

Validado manualmente: uma tentativa de `SELECT`, `UPDATE` ou `DELETE` direto nas tabelas usando essa chave retorna vazio/sem efeito, mesmo com dados existentes no banco.

## Recriando o projeto do zero

1. Crie um projeto novo em [supabase.com/dashboard](https://supabase.com/dashboard) (região South America recomendada).
2. Abra o **SQL Editor** e cole o conteúdo de [`schema.sql`](schema.sql) desta pasta. Execute.
3. Em **Project Settings > API**, copie a **Project URL** e a **anon/publishable key**.
4. Cole os dois valores em [`config.js`](../config.js), nas chaves `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
5. Publique o site de novo.

## Consultando os dados

Use o **Table Editor** do Supabase (interface parecida com planilha) ou o **SQL Editor** para consultas mais elaboradas, por exemplo:

```sql
-- taxa de conclusão do funil
select
  count(*) filter (where completou) as completos,
  count(*) as total,
  round(100.0 * count(*) filter (where completou) / count(*), 1) as taxa_conclusao_pct
from public.funil;

-- em qual pergunta as pessoas mais abandonam
select ultima_pergunta, count(*)
from public.funil
where not completou
group by ultima_pergunta
order by ultima_pergunta;

-- leads dos últimos 7 dias, mais recentes primeiro
select created_at, nome, whatsapp, faturamento, pacote_recomendado
from public.leads
where created_at >= now() - interval '7 days'
order by created_at desc;

-- leads filtrados por faixa de faturamento (troque o valor conforme a faixa
-- que você quer ver: "Até R$ 15.000/mês", "R$ 15.001 a R$ 30.000/mês",
-- "R$ 30.001 a R$ 60.000/mês", "Acima de R$ 60.000/mês", "Prefiro não informar")
select created_at, nome, whatsapp, cadeiras, pacote_recomendado
from public.leads
where faturamento = 'Acima de R$ 60.000/mês'
order by created_at desc;

-- leads de maior potencial: faturamento alto + chegaram nos últimos 14 dias
-- (ajuste o intervalo e a lista de faixas conforme sua definição de "quente")
select created_at, nome, whatsapp, faturamento, pacote_recomendado
from public.leads
where faturamento in ('R$ 30.001 a R$ 60.000/mês', 'Acima de R$ 60.000/mês')
  and created_at >= now() - interval '14 days'
order by created_at desc;
```
