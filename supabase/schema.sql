-- ============================================================
-- Schema do projeto Supabase (banco de dados de leads e funil)
-- Cole no SQL Editor do seu projeto Supabase para recriar do zero.
-- Veja README.md nesta pasta para o passo a passo completo.
-- ============================================================

-- Tabela de leads completos (quem terminou o questionário)
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text not null,
  whatsapp text not null,
  barbearia text,
  cadeiras text,
  faturamento text,
  pacote_recomendado text,
  score_organizacao numeric,
  score_precificacao numeric,
  score_estrategia numeric,
  score_geral numeric,
  respostas jsonb
);

alter table public.leads enable row level security;
-- Nenhuma policy criada para o papel "anon": acesso direto à tabela fica
-- totalmente bloqueado (nem SELECT, nem UPDATE, nem DELETE). A única porta
-- de entrada é a função registrar_lead, chamada via RPC.

-- Tabela de progresso no funil (uma linha por sessão/tentativa)
create table public.funil (
  session_id text primary key,
  nome text,
  whatsapp text,
  inicio timestamptz not null default now(),
  ultima_atualizacao timestamptz not null default now(),
  ultima_pergunta integer not null default 0,
  total_perguntas integer,
  completou boolean not null default false
);

alter table public.funil enable row level security;
-- Mesma lógica: nenhuma policy para "anon", só via registrar_funil.

-- Grava um lead completo. SECURITY DEFINER roda com o privilégio de quem
-- criou a função (contorna a RLS que bloqueia a tabela pro público), mas só
-- INSERT é possível através dela — nunca SELECT/UPDATE/DELETE.
create or replace function public.registrar_lead(
  p_nome text,
  p_whatsapp text,
  p_barbearia text,
  p_cadeiras text,
  p_faturamento text,
  p_pacote_recomendado text,
  p_score_organizacao numeric,
  p_score_precificacao numeric,
  p_score_estrategia numeric,
  p_score_geral numeric,
  p_respostas jsonb
) returns void
language sql
security definer
set search_path = public
as $$
  insert into public.leads (
    nome, whatsapp, barbearia, cadeiras, faturamento, pacote_recomendado,
    score_organizacao, score_precificacao, score_estrategia, score_geral, respostas
  ) values (
    p_nome, p_whatsapp, p_barbearia, p_cadeiras, p_faturamento, p_pacote_recomendado,
    p_score_organizacao, p_score_precificacao, p_score_estrategia, p_score_geral, p_respostas
  );
$$;

-- Grava/atualiza o progresso de uma sessão no funil. O UPSERT nativo do
-- Postgres resolve, numa única operação atômica, os problemas de concorrência
-- e de ordem de chegada das requisições: "última pergunta" só avança
-- (GREATEST) e "completou" só vira true, nunca regride.
create or replace function public.registrar_funil(
  p_session_id text,
  p_nome text,
  p_whatsapp text,
  p_pergunta_atual integer,
  p_total_perguntas integer,
  p_completou boolean
) returns void
language sql
security definer
set search_path = public
as $$
  insert into public.funil (session_id, nome, whatsapp, ultima_pergunta, total_perguntas, completou, ultima_atualizacao)
  values (p_session_id, p_nome, p_whatsapp, p_pergunta_atual, p_total_perguntas, p_completou, now())
  on conflict (session_id) do update set
    ultima_pergunta = greatest(public.funil.ultima_pergunta, excluded.ultima_pergunta),
    completou = public.funil.completou or excluded.completou,
    ultima_atualizacao = now(),
    nome = excluded.nome,
    whatsapp = excluded.whatsapp,
    total_perguntas = coalesce(excluded.total_perguntas, public.funil.total_perguntas);
$$;

revoke all on function public.registrar_lead from public;
revoke all on function public.registrar_funil from public;
grant execute on function public.registrar_lead to anon;
grant execute on function public.registrar_funil to anon;
