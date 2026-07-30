/**
 * Recebe leads do formulário GFE (POST JSON) e grava uma linha na planilha ativa.
 * Deploy: Extensões > Apps Script > cole este arquivo > Implantar > App da Web.
 *
 * SECRET_TOKEN precisa ser IDÊNTICO ao valor de CONFIG.LEAD_SECRET em config.js.
 * Isso não é sigilo real (o token trafega no corpo da requisição do navegador,
 * então dá pra ver no DevTools), mas bloqueia quem só encontrou a URL do webhook
 * no repositório público e tenta enviar dados falsos sem passar pelo questionário.
 */
var SECRET_TOKEN = "f433d55d0a24ed3e4d33049da0ff10ec0eb2a3e2c1f06f5a";

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    data = {};
  }

  if (data.token !== SECRET_TOKEN) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: "invalid token" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp", "Nome", "WhatsApp", "Barbearia", "Cadeiras ativas", "Faixa de faturamento",
      "Pacote recomendado", "Score Organização", "Score Precificação", "Score Estratégia", "Score Geral",
      "Respostas (JSON)"
    ]);
  }

  var scores = data.scores || {};
  var overall = scores.overall !== undefined
    ? scores.overall
    : ((scores.a01 || 0) + (scores.a23 || 0) + (scores.a45 || 0)) / 3;

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.nome || "",
    data.whatsapp || "",
    data.barbearia || "",
    data.cadeiras || "",
    data.faturamento || "",
    data.pacoteRecomendado || "",
    scores.a01 !== undefined ? scores.a01 : "",
    scores.a23 !== undefined ? scores.a23 : "",
    scores.a45 !== undefined ? scores.a45 : "",
    overall,
    JSON.stringify(data.respostas || {}),
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
