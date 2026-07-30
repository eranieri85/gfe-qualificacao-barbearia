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
    lead: { nome: "", whatsapp: "", barbearia: "" },
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

    if (!valid) return;

    state.lead.nome = leadNome.value.trim();
    state.lead.whatsapp = leadWhats.value.trim();
    state.lead.barbearia = leadBarbearia.value.trim();

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
        body: JSON.stringify(payload),
      }).catch((err) => console.warn("Falha ao enviar lead para o webhook:", err));
    }
  }

  // ============================================================
  // TELA 4: RESULTADO
  // ============================================================
  function renderResultado(pacoteKey, scores) {
    const pacote = PACOTES[pacoteKey];

    document.getElementById("resultNomePacote").textContent = pacote.nome;
    document.getElementById("resultDescricao").textContent = pacote.descricao;
    document.getElementById("resultPreco").textContent = pacote.preco;

    const blocos = [
      { label: "Organização (base)", value: scores.a01 },
      { label: "Precificação e caixa", value: scores.a23 },
      { label: "Estratégia e rotina", value: scores.a45 },
    ];

    const scoresEl = document.getElementById("resultScores");
    scoresEl.innerHTML = "";
    blocos.forEach((b) => {
      const pct = Math.round(b.value * 100);
      const row = document.createElement("div");
      row.className = "score-row";
      row.innerHTML = `
        <span class="score-label">${b.label}</span>
        <span class="score-track"><span class="score-fill" style="width:${pct}%"></span></span>
        <span class="score-value">${pct}%</span>
      `;
      scoresEl.appendChild(row);
    });

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
