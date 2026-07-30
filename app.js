(() => {
  "use strict";

  // ============================================================
  // DADOS — perguntas (fonte: spec-formulario-qualificacao-gfe.md)
  // ============================================================
  const OPTIONS_BIN = [
    { label: "Sim", value: 3 },
    { label: "Não", value: 0 },
  ];

  const OPTIONS_FREQ = [
    { label: "Nunca", value: 0 },
    { label: "Às vezes", value: 1 },
    { label: "Na maioria das vezes", value: 2 },
    { label: "Sempre", value: 3 },
  ];

  const QUESTIONS = [
    { id: 1, bloco: "01", tipo: "bin", texto: "Você sabe, sem consultar nada, quanto entrou e saiu de caixa no mês passado?" },
    { id: 2, bloco: "01", tipo: "bin", texto: "O dinheiro da barbearia está separado do seu dinheiro pessoal?" },
    { id: 3, bloco: "01", tipo: "freq", texto: "O que aparece no seu sistema de agendamento bate com o que cai no banco?" },
    { id: 4, bloco: "01", tipo: "bin", texto: "Você tem um pró-labore definido, separado da comissão que você recebe como barbeiro?", tooltip: "Pró-labore é o salário fixo que você define pra si mesmo como dono, separado do que você ganha cortando cabelo como barbeiro." },
    { id: 5, bloco: "23", tipo: "bin", texto: "Seus preços foram definidos com base em custo real + margem, e não em concorrência ou intuição?" },
    { id: 6, bloco: "23", tipo: "bin", texto: "Você sabe quanto custa cada serviço considerando comissão, taxa de cartão e imposto?" },
    { id: 7, bloco: "23", tipo: "bin", texto: "Seus combos são realmente vantajosos comparados à soma dos serviços avulsos?" },
    { id: 8, bloco: "23", tipo: "freq", texto: "Você consegue prever se vai sobrar ou faltar caixa no fim do mês?" },
    { id: 9, bloco: "23", tipo: "bin", texto: "Você tem um DRE (ou algo parecido) mostrando lucro real, não só faturamento?", tooltip: "DRE é um relatório simples que mostra tudo que entrou, tudo que saiu, e o que sobrou de lucro de verdade no fim do mês." },
    { id: 10, bloco: "45", tipo: "bin", texto: "Sua situação de CNPJ e regime tributário está regularizada e você entende o que ela significa pro seu bolso?" },
    { id: 11, bloco: "45", tipo: "freq", texto: "Você acompanha indicadores do negócio mês a mês, com algum ritual de revisão?" },
    { id: 12, bloco: "45", tipo: "freq", texto: "Você reinveste (equipamento, marketing) com base em número, não em intuição?" },
  ];

  const BLOCO_ORDEM = ["01", "23", "45"];
  const BLOCO_LABELS = { "01": "Organização", "23": "Precificação", "45": "Estratégia" };

  const PACOTES = {
    diagnostico: {
      nome: "Diagnóstico Financeiro",
      descricao: "Antes de qualquer ajuste, falta uma base confiável: separar PF de PJ e conciliar o que entra de verdade no caixa.",
      preco: "R$ 600 a R$ 1.500 (projeto pontual)",
    },
    estruturacao: {
      nome: "Estruturação Financeira",
      descricao: "A base já existe. O ponto de atenção agora é precificação, fluxo de caixa e visão de lucro real.",
      preco: "R$ 2.000 a R$ 5.000 (projeto)",
    },
    gfeFixo: {
      nome: "GFE Fixo / Acompanhamento Estratégico",
      descricao: "A parte técnica está resolvida. Falta rotina e regularização para sustentar o que já foi construído.",
      preco: "R$ 800 a R$ 2.500/mês",
    },
    gfeFixoManutencao: {
      nome: "GFE Fixo / Acompanhamento Estratégico",
      descricao: "A barbearia já está numa boa base financeira. O maior ganho agora vem de manter o acompanhamento para sustentar e crescer.",
      preco: "R$ 800 a R$ 2.500/mês",
    },
    completo: {
      nome: "Projeto Completo",
      descricao: "A dificuldade não está concentrada em um ponto só, está espalhada pelas três frentes. Resolver isoladamente uma parte deixaria as outras travando o resultado.",
      preco: "R$ 3.500 a R$ 9.000",
    },
  };

  // ============================================================
  // ESTADO
  // ============================================================
  const state = {
    lead: { nome: "", whatsapp: "", barbearia: "", cadeiras: "", faturamento: "" },
    respostas: {}, // { [questionId]: valor }
    quizIndex: 0,
  };

  // ============================================================
  // NAVEGAÇÃO DE TELAS
  // ============================================================
  const screens = {
    intro: document.getElementById("screen-intro"),
    lead: document.getElementById("screen-lead"),
    quiz: document.getElementById("screen-quiz"),
    result: document.getElementById("screen-result"),
  };
  function showScreen(name) {
    Object.values(screens).forEach((el) => el.classList.remove("active"));
    screens[name].classList.add("active");
  }

  // ============================================================
  // TELA 1 → 2
  // ============================================================
  document.getElementById("btnStart").addEventListener("click", () => {
    showScreen("lead");
  });

  // ============================================================
  // TELA 2: FORM DE LEAD
  // ============================================================
  const leadForm = document.getElementById("leadForm");
  const leadNome = document.getElementById("leadNome");
  const leadWhats = document.getElementById("leadWhats");
  const leadBarbearia = document.getElementById("leadBarbearia");
  const leadCadeiras = document.getElementById("leadCadeiras");
  const leadFaturamento = document.getElementById("leadFaturamento");

  function setFieldError(input, errId, message) {
    document.getElementById(errId).textContent = message || "";
    input.classList.toggle("invalid", Boolean(message));
  }

  function validateWhats(value) {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 13;
  }

  leadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    if (!leadNome.value.trim()) {
      setFieldError(leadNome, "err-leadNome", "Informe seu nome.");
      valid = false;
    } else {
      setFieldError(leadNome, "err-leadNome", "");
    }

    if (!leadWhats.value.trim()) {
      setFieldError(leadWhats, "err-leadWhats", "Informe seu WhatsApp.");
      valid = false;
    } else if (!validateWhats(leadWhats.value)) {
      setFieldError(leadWhats, "err-leadWhats", "Número inválido. Inclua DDD.");
      valid = false;
    } else {
      setFieldError(leadWhats, "err-leadWhats", "");
    }

    if (!leadFaturamento.value) {
      setFieldError(leadFaturamento, "err-leadFaturamento", "Selecione uma faixa de faturamento.");
      valid = false;
    } else {
      setFieldError(leadFaturamento, "err-leadFaturamento", "");
    }

    if (!valid) return;

    state.lead.nome = leadNome.value.trim();
    state.lead.whatsapp = leadWhats.value.trim();
    state.lead.barbearia = leadBarbearia.value.trim();
    state.lead.cadeiras = leadCadeiras.value.trim();
    state.lead.faturamento = leadFaturamento.value;

    state.quizIndex = 0;
    showScreen("quiz");
    renderQuestion();
  });

  // formatação simples do telefone enquanto digita
  leadWhats.addEventListener("input", () => {
    let d = leadWhats.value.replace(/\D/g, "").slice(0, 11);
    if (d.length > 6) {
      leadWhats.value = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    } else if (d.length > 2) {
      leadWhats.value = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    } else {
      leadWhats.value = d;
    }
  });

  // ============================================================
  // TELA 3: QUESTIONÁRIO
  // ============================================================
  const qCount = document.getElementById("qCount");
  const qText = document.getElementById("qText");
  const qOptions = document.getElementById("qOptions");
  const tooltipBtn = document.getElementById("tooltipBtn");
  const tooltipBox = document.getElementById("tooltipBox");
  const btnBack = document.getElementById("btnBack");
  const quizCardInner = document.getElementById("quizCardInner");
  const quizSwipeArea = document.getElementById("quizSwipeArea");

  function renderProgressSteps() {
    BLOCO_ORDEM.forEach((blocoId) => {
      const perguntasBloco = QUESTIONS.filter((q) => q.bloco === blocoId);
      const primeiroIdx = QUESTIONS.indexOf(perguntasBloco[0]);
      const ultimoIdx = QUESTIONS.indexOf(perguntasBloco[perguntasBloco.length - 1]);

      let progresso;
      if (state.quizIndex > ultimoIdx) progresso = 1;
      else if (state.quizIndex < primeiroIdx) progresso = 0;
      else progresso = (state.quizIndex - primeiroIdx) / perguntasBloco.length;

      const fillEl = document.querySelector(`[data-bloco-fill="${blocoId}"]`);
      fillEl.style.width = `${progresso * 100}%`;

      const stepEl = document.querySelector(`.progress-step[data-bloco="${blocoId}"]`);
      stepEl.classList.toggle("active", state.quizIndex >= primeiroIdx && state.quizIndex <= ultimoIdx);
      stepEl.classList.toggle("done", state.quizIndex > ultimoIdx);
    });
  }

  function renderQuestion(direction) {
    const q = QUESTIONS[state.quizIndex];
    const total = QUESTIONS.length;

    qCount.textContent = `Pergunta ${state.quizIndex + 1} de ${total}`;
    renderProgressSteps();

    qText.textContent = q.texto;

    if (q.tooltip) {
      tooltipBtn.hidden = false;
      tooltipBox.hidden = true;
      tooltipBox.textContent = q.tooltip;
    } else {
      tooltipBtn.hidden = true;
      tooltipBox.hidden = true;
    }

    const options = q.tipo === "bin" ? OPTIONS_BIN : OPTIONS_FREQ;
    qOptions.innerHTML = "";
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "q-option";
      btn.textContent = opt.label;
      if (state.respostas[q.id] === opt.value) btn.classList.add("selected");
      btn.addEventListener("click", () => selectAnswer(q.id, opt.value));
      qOptions.appendChild(btn);
    });

    btnBack.style.visibility = state.quizIndex === 0 ? "hidden" : "visible";

    quizCardInner.classList.remove("enter-next", "enter-prev");
    if (direction) {
      // força reflow para reiniciar a animação mesmo em cliques consecutivos
      void quizCardInner.offsetWidth;
      quizCardInner.classList.add(direction === "back" ? "enter-prev" : "enter-next");
    }
  }

  tooltipBtn.addEventListener("click", () => {
    tooltipBox.hidden = !tooltipBox.hidden;
  });

  function selectAnswer(questionId, value) {
    state.respostas[questionId] = value;
    const total = QUESTIONS.length;

    if (state.quizIndex < total - 1) {
      state.quizIndex += 1;
      renderQuestion("next");
    } else {
      BLOCO_ORDEM.forEach((blocoId) => {
        document.querySelector(`[data-bloco-fill="${blocoId}"]`).style.width = "100%";
      });
      finalizarQuestionario();
    }
  }

  function goBack() {
    if (state.quizIndex > 0) {
      state.quizIndex -= 1;
      renderQuestion("back");
    }
  }

  btnBack.addEventListener("click", goBack);

  // gesto de swipe: arrastar para a direita volta para a pergunta anterior
  let touchStartX = 0;
  let touchStartY = 0;

  quizSwipeArea.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  quizSwipeArea.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (dx > 70 && Math.abs(dy) < 60) {
      goBack();
    }
  }, { passive: true });

  // ============================================================
  // CÁLCULO E RECOMENDAÇÃO
  // ============================================================
  function avgBloco(blocoId) {
    const perguntas = QUESTIONS.filter((q) => q.bloco === blocoId);
    const soma = perguntas.reduce((acc, q) => acc + (state.respostas[q.id] || 0), 0);
    return soma / (perguntas.length * 3);
  }

  function calcularScores() {
    const a01 = avgBloco("01");
    const a23 = avgBloco("23");
    const a45 = avgBloco("45");
    const overall = (a01 + a23 + a45) / 3;
    return { a01, a23, a45, overall };
  }

  function recomendarPacote({ a01, a23, a45, overall }) {
    if (overall < 0.4) return "completo";

    const min = Math.min(a01, a23, a45);

    if (min === a01 && a01 < 0.55) return "diagnostico";
    if (min === a23 && a23 < 0.55) return "estruturacao";
    if (min === a45 && a45 < 0.55) return "gfeFixo";
    return "gfeFixoManutencao";
  }

  // ============================================================
  // FINALIZAÇÃO: CALCULA, ENVIA LEAD, MOSTRA RESULTADO
  // ============================================================
  function finalizarQuestionario() {
    const scores = calcularScores();
    const pacoteKey = recomendarPacote(scores);

    enviarLead({
      ...state.lead,
      respostas: state.respostas,
      scores,
      pacoteRecomendado: PACOTES[pacoteKey].nome,
      timestamp: new Date().toISOString(),
    });

    renderResultado(pacoteKey, scores);
    showScreen("result");
  }

  // ============================================================
  // ENVIO DE LEAD — localStorage sempre; webhook se configurado
  // ============================================================
  function enviarLead(payload) {
    try {
      const historico = JSON.parse(localStorage.getItem("gfe_leads") || "[]");
      historico.push(payload);
      localStorage.setItem("gfe_leads", JSON.stringify(historico));
    } catch (err) {
      console.warn("Não foi possível salvar o lead localmente:", err);
    }

    if (window.CONFIG && CONFIG.LEAD_WEBHOOK_URL) {
      fetch(CONFIG.LEAD_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...payload, token: CONFIG.LEAD_SECRET }),
      }).catch((err) => console.warn("Falha ao enviar lead para o webhook:", err));
    }
  }

  // ============================================================
  // TELA 4: RESULTADO
  // ============================================================

  // gráfico radar (3 eixos) desenhado como SVG puro, sem dependências
  function buildRadarSVG(scores) {
    const cx = 160;
    const cy = 132;
    const r = 62;
    const labelR = r + 30;
    const angles = [-90, 30, 150].map((d) => (d * Math.PI) / 180);
    const valores = [scores.a01, scores.a23, scores.a45];
    const labels = [BLOCO_LABELS["01"], BLOCO_LABELS["23"], BLOCO_LABELS["45"]];
    const anchors = ["middle", "start", "end"];

    const ponto = (angle, fracao, raio) => {
      const x = cx + raio * fracao * Math.cos(angle);
      const y = cy + raio * fracao * Math.sin(angle);
      return [Number(x.toFixed(1)), Number(y.toFixed(1))];
    };

    const grids = [0.25, 0.5, 0.75, 1]
      .map((f) => angles.map((a) => ponto(a, f, r).join(",")).join(" "))
      .map((pts) => `<polygon points="${pts}" class="radar-grid" />`)
      .join("");

    const axisLines = angles
      .map((a) => {
        const [x, y] = ponto(a, 1, r);
        return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="radar-axis" />`;
      })
      .join("");

    // vértice mínimo visível mesmo quando o score é 0
    const fracoes = valores.map((v) => Math.max(v, 0.04));
    const dataPoints = angles.map((a, i) => ponto(a, fracoes[i], r).join(",")).join(" ");

    const dots = angles
      .map((a, i) => {
        const [x, y] = ponto(a, fracoes[i], r);
        return `<circle cx="${x}" cy="${y}" r="4.5" class="radar-dot" />`;
      })
      .join("");

    const axisLabels = angles
      .map((a, i) => {
        const [x, y] = ponto(a, 1, labelR);
        return `<text x="${x}" y="${y}" class="radar-axis-label" text-anchor="${anchors[i]}" dominant-baseline="middle">${labels[i]}</text>`;
      })
      .join("");

    return `
      <svg viewBox="0 0 320 240" class="result-radar" role="img" aria-label="Gráfico com os três blocos avaliados: ${labels.join(", ")}">
        ${grids}
        ${axisLines}
        <polygon points="${dataPoints}" class="radar-data" />
        ${dots}
        ${axisLabels}
      </svg>
    `;
  }

  function renderLegend(scores) {
    const legendEl = document.getElementById("radarLegend");
    legendEl.innerHTML = BLOCO_ORDEM.map((blocoId) => {
      const chave = blocoId === "01" ? "a01" : blocoId === "23" ? "a23" : "a45";
      const pct = Math.round(scores[chave] * 100);
      return `
        <div class="radar-legend-item">
          <span class="legend-value">${pct}%</span>
          <span class="legend-label">${BLOCO_LABELS[blocoId]}</span>
        </div>
      `;
    }).join("");
  }

  function renderSelo(pacoteKey) {
    const sealEl = document.getElementById("resultSeal");
    const sealIcon = document.getElementById("sealIcon");
    const sealLabel = document.getElementById("sealLabel");
    const sealText = document.getElementById("sealText");

    sealEl.classList.remove("seal-alert", "seal-positive");

    if (pacoteKey === "completo") {
      sealEl.classList.add("seal-alert");
      sealIcon.textContent = "!";
      sealLabel.textContent = "Dor predominante";
      sealText.innerHTML = "Espalhada nas <strong>3 frentes</strong>";
      return;
    }

    if (pacoteKey === "gfeFixoManutencao") {
      sealEl.classList.add("seal-positive");
      sealIcon.textContent = "✓";
      sealLabel.textContent = "Diagnóstico";
      sealText.innerHTML = "<strong>Base financeira sólida</strong>";
      return;
    }

    const blocoPorPacote = { diagnostico: "01", estruturacao: "23", gfeFixo: "45" };
    const blocoId = blocoPorPacote[pacoteKey];
    sealEl.classList.add("seal-alert");
    sealIcon.textContent = "!";
    sealLabel.textContent = "Dor predominante";
    sealText.innerHTML = `<strong>${BLOCO_LABELS[blocoId]}</strong>`;
  }

  function renderResultado(pacoteKey, scores) {
    const pacote = PACOTES[pacoteKey];

    document.getElementById("resultNomePacote").textContent = pacote.nome;
    document.getElementById("resultDescricao").textContent = pacote.descricao;

    renderSelo(pacoteKey);
    document.getElementById("resultRadar").innerHTML = buildRadarSVG(scores);
    renderLegend(scores);

    const btnWhats = document.getElementById("btnWhats");
    const mensagem = CONFIG.WHATSAPP_MENSAGEM
      .replace("{{PACOTE}}", pacote.nome)
      .replace("{{NOME}}", state.lead.nome);
    btnWhats.href = `https://wa.me/${CONFIG.WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
  }

  // ============================================================
  // REINICIAR
  // ============================================================
  document.getElementById("btnRestart").addEventListener("click", () => {
    state.respostas = {};
    state.quizIndex = 0;
    leadForm.reset();
    showScreen("intro");
  });
})();
