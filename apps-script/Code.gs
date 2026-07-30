/**
 * Recebe leads e eventos de funil do formulário GFE (POST JSON).
 * Deploy: Extensões > Apps Script > cole este arquivo > Implantar > App da Web.
 *
 * SECRET_TOKEN precisa ser IDÊNTICO ao valor de CONFIG.LEAD_SECRET em config.js.
 * Isso não é sigilo real (o token trafega no corpo da requisição do navegador,
 * então dá pra ver no DevTools), mas bloqueia quem só encontrou a URL do webhook
 * no repositório público e tenta enviar dados falsos sem passar pelo questionário.
 */
var SECRET_TOKEN = "f433d55d0a24ed3e4d33049da0ff10ec0eb2a3e2c1f06f5a";

function doPost(e) {
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

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (data.evento === "funil") {
    registrarFunil(ss, data);
  } else {
    registrarLead(ss, data);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Grava um lead completo na primeira aba da planilha (comportamento original).
 */
function registrarLead(ss, data) {
  var sheet = ss.getActiveSheet();

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
}

/**
 * Grava/atualiza o progresso de uma sessão na aba "Funil" (cria a aba se não existir).
 * Uma linha por sessão (sessionId), atualizada a cada pergunta respondida — assim dá
 * pra ver, mesmo sem a pessoa terminar, até onde ela foi e como entrar em contato.
 *
 * Como várias requisições da mesma sessão podem chegar quase juntas (uma por pergunta
 * respondida), usamos um lock pra serializar a leitura+escrita e evitar corrida: sem
 * isso, duas execuções concorrentes podiam achar que a linha da sessão "ainda não
 * existe" ao mesmo tempo e criar duplicatas, ou uma sobrescrever a atualização da outra.
 */
function registrarFunil(ss, data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = ss.getSheetByName("Funil");
    if (!sheet) {
      sheet = ss.insertSheet("Funil");
      sheet.appendRow([
        "Session ID", "Nome", "WhatsApp", "Início", "Última atualização",
        "Última pergunta respondida", "Total de perguntas", "Completou"
      ]);
    }

    var sessionId = data.sessionId || "";
    var lastRow = sheet.getLastRow();
    var rowIndex = -1;

    if (lastRow > 1 && sessionId) {
      var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        if (ids[i][0] === sessionId) {
          rowIndex = i + 2;
          break;
        }
      }
    }

    var agora = new Date().toISOString();
    var completouTexto = data.completou ? "Sim" : "Não";

    if (rowIndex === -1) {
      sheet.appendRow([
        sessionId,
        data.nome || "",
        data.whatsapp || "",
        agora,
        agora,
        data.perguntaAtual !== undefined ? data.perguntaAtual : "",
        data.totalPerguntas || "",
        completouTexto,
      ]);
    } else {
      var inicioOriginal = sheet.getRange(rowIndex, 4).getValue() || agora;
      sheet.getRange(rowIndex, 1, 1, 8).setValues([[
        sessionId,
        data.nome || "",
        data.whatsapp || "",
        inicioOriginal,
        agora,
        data.perguntaAtual !== undefined ? data.perguntaAtual : "",
        data.totalPerguntas || "",
        completouTexto,
      ]]);
    }
  } finally {
    lock.releaseLock();
  }
}
