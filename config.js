// ============================================================
// CONFIGURAÇÃO — edite apenas este arquivo para customizar o app
// ============================================================
window.CONFIG = {
  // Número de WhatsApp que recebe o CTA final. Formato: DDI+DDD+número, só dígitos.
  WHATSAPP_NUMERO: "5524992534295",

  // Mensagem pré-preenchida enviada no clique do CTA. {{PACOTE}} e {{NOME}} são substituídos automaticamente.
  WHATSAPP_MENSAGEM: "Olá! Fiz o diagnóstico financeiro da minha barbearia e o resultado indicou o pacote \"{{PACOTE}}\". Meu nome é {{NOME}} e gostaria de agendar uma conversa.",

  // URL do projeto Supabase (banco de dados que recebe leads e progresso do funil).
  // Deixe em branco ("") para desativar o envio remoto — o lead ainda é salvo no localStorage do navegador.
  // Veja detalhes em supabase/README.md
  SUPABASE_URL: "https://cpoexrxupxeybffyyhwx.supabase.co",

  // Chave pública (publishable/anon) do projeto Supabase. É FEITA para ser pública —
  // ao contrário do token do Apps Script, a segurança real vem das políticas do banco
  // (RLS + funções SECURITY DEFINER): essa chave só consegue inserir dados, nunca ler,
  // editar ou apagar nada.
  SUPABASE_ANON_KEY: "sb_publishable_YHuPKmBpDOMlYAFpoobZOA_H_xL2Nlf",
};
