/**
 * Recebe leads do formulário GFE (POST JSON) e grava uma linha na planilha ativa.
 * Deploy: Extensões > Apps Script > cole este arquivo > Implantar > App da Web.
 */
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    data = {};
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp", "Nome", "WhatsApp", "Barbearia",
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
