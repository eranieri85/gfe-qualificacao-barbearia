// ============================================================
// CONFIGURAÇÃO — edite apenas este arquivo para customizar o app
// ============================================================
const CONFIG = {
  // Número de WhatsApp que recebe o CTA final. Formato: DDI+DDD+número, só dígitos.
  WHATSAPP_NUMERO: "5524992534295",

  // Mensagem pré-preenchida enviada no clique do CTA. {{PACOTE}} e {{NOME}} são substituídos automaticamente.
  WHATSAPP_MENSAGEM: "Olá! Fiz o diagnóstico financeiro da minha barbearia e o resultado indicou o pacote \"{{PACOTE}}\". Meu nome é {{NOME}} e gostaria de agendar uma conversa.",

  // URL do Google Apps Script Web App (webhook) que recebe os leads.
  // Deixe em branco ("") para desativar o envio remoto — o lead ainda é salvo no localStorage do navegador.
  // Veja instruções de deploy em apps-script/README.md
  LEAD_WEBHOOK_URL: "",
};
