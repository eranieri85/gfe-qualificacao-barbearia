// ============================================================
// CONFIGURAÇÃO — edite apenas este arquivo para customizar o app
// ============================================================
window.CONFIG = {
  // Número de WhatsApp que recebe o CTA final. Formato: DDI+DDD+número, só dígitos.
  WHATSAPP_NUMERO: "5524992534295",

  // Mensagem pré-preenchida enviada no clique do CTA. {{PACOTE}} e {{NOME}} são substituídos automaticamente.
  WHATSAPP_MENSAGEM: "Olá! Fiz o diagnóstico financeiro da minha barbearia e o resultado indicou o pacote \"{{PACOTE}}\". Meu nome é {{NOME}} e gostaria de agendar uma conversa.",

  // URL do Google Apps Script Web App (webhook) que recebe os leads.
  // Deixe em branco ("") para desativar o envio remoto — o lead ainda é salvo no localStorage do navegador.
  // Veja instruções de deploy em apps-script/README.md
  LEAD_WEBHOOK_URL: "https://script.google.com/macros/s/AKfycbydlx60fdokfOPQuoSANxjmNQnsCgQVfA06Uugoh_vbqmqKcoEznK_VSESFX75fBQcT/exec",

  // Token enviado junto com cada lead para o Apps Script validar antes de gravar na planilha.
  // Precisa ser IDÊNTICO ao SECRET_TOKEN configurado no Code.gs (veja apps-script/README.md).
  // Não é sigilo real (qualquer um que abrir o site consegue ver), mas impede que alguém
  // envie dados falsos direto pro webhook sem nem passar pelo questionário.
  LEAD_SECRET: "f433d55d0a24ed3e4d33049da0ff10ec0eb2a3e2c1f06f5a",
};
