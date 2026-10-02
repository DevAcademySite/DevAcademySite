// Banco local de perguntas: respostaCorreta é a posição, começando em 0.
const bancoDePerguntas = [
  {
    pergunta: "O que significa a sigla HTML?",
    alternativas: ["Linguagem de Marcação de Hipertexto", "Linguagem Moderna de Alta Tecnologia", "Nível de Hiperlink e Marcação de Texto", "Linguagem de Marcação de Ferramentas Domésticas"],
    respostaCorreta: 0,
    explicacao: 'HTML significa HyperText Markup Language, ou Linguagem de Marcação de Hipertexto. Ele organiza o conteúdo da página com elementos como títulos, parágrafos, imagens e links. Por exemplo: <h1>Dev Academy</h1> define um título principal.'
  },
  {
    pergunta: "Qual estrutura SQL é usada para selecionar dados de uma tabela?",
    alternativas: ["UPDATE", "INSERT INTO", "SELECT", "DELETE"],
    respostaCorreta: 2,
    explicacao: 'SELECT é o comando SQL usado para consultar dados. Por exemplo: SELECT nome FROM estudantes; busca a coluna nome da tabela estudantes. Já INSERT INTO insere registros, UPDATE altera dados e DELETE remove registros.'
  }
];

let indiceAtual = 0;
let pontos = 0;
let respostaBloqueada = false;

const elementoPergunta = document.getElementById('texto-pergunta');
const caixaAlternativas = document.getElementById('caixa-alternativas');
const elementoProgresso = document.getElementById('progresso');
const elementoPontuacao = document.getElementById('pontuacao');
const falaRobo = document.getElementById('fala-robo');
const imagemRobo = document.getElementById('imagem-robo');
const roboReserva = document.getElementById('robo-reserva');
const caixaExplicacao = document.getElementById('explicacao');
const textoExplicacao = document.getElementById('texto-explicacao');
const botaoProxima = document.getElementById('proxima-pergunta');

botaoProxima.addEventListener('click', () => {
  if (!respostaBloqueada || indiceAtual >= bancoDePerguntas.length) return;
  indiceAtual++;
  if (indiceAtual < bancoDePerguntas.length) carregarPergunta();
  else finalizarQuiz();
  elementoPergunta.focus();
});

imagemRobo.addEventListener('load', () => {
  imagemRobo.hidden = false;
  roboReserva.hidden = true;
});
imagemRobo.addEventListener('error', () => {
  imagemRobo.hidden = true;
  roboReserva.hidden = false;
});
function atualizarRobo(arquivo) {
  imagemRobo.hidden = true;
  roboReserva.hidden = false;
  imagemRobo.src = arquivo;
}

function carregarPergunta() {
  respostaBloqueada = false;
  caixaExplicacao.hidden = true;
  textoExplicacao.textContent = '';
  botaoProxima.hidden = true;
  const perguntaAtual = bancoDePerguntas[indiceAtual];
  elementoPergunta.textContent = perguntaAtual.pergunta;
  elementoProgresso.textContent = `Pergunta ${indiceAtual + 1}/${bancoDePerguntas.length}`;
  elementoPontuacao.textContent = `Pontos: ${pontos}`;
  falaRobo.textContent = 'Vamos lá! Escolha a resposta correta.';
  atualizarRobo('../img/robo.png');
  caixaAlternativas.replaceChildren();

  perguntaAtual.alternativas.forEach((texto, indice) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'btn-alternativa';
    botao.textContent = texto;
    botao.addEventListener('click', () => verificarResposta(indice));
    caixaAlternativas.appendChild(botao);
  });
}

function verificarResposta(indiceEscolhido) {
  if (respostaBloqueada) return;
  respostaBloqueada = true;
  const perguntaAtual = bancoDePerguntas[indiceAtual];
  const respostaCerta = perguntaAtual.respostaCorreta;
  const botoes = caixaAlternativas.querySelectorAll('button');
  botoes.forEach(botao => { botao.disabled = true; });
  botoes[respostaCerta].classList.add('correta');

  if (indiceEscolhido === respostaCerta) {
    pontos += 10;
    elementoPontuacao.textContent = `Pontos: ${pontos}`;
    falaRobo.textContent = 'Muito bem! Resposta exata! +10 pontos.';
    atualizarRobo('../img/robo.png');
  } else {
    botoes[indiceEscolhido].classList.add('errada');
    falaRobo.textContent = `Vamos aprender! A resposta correta é: ${perguntaAtual.alternativas[respostaCerta]}.`;
    atualizarRobo('../img/robo.png');
  }

  textoExplicacao.textContent = perguntaAtual.explicacao;
  caixaExplicacao.hidden = false;
  botaoProxima.textContent = indiceAtual === bancoDePerguntas.length - 1
    ? 'Ver resultado' : 'Próxima pergunta';
  botaoProxima.hidden = false;
  botaoProxima.focus();
}

function finalizarQuiz() {
  caixaExplicacao.hidden = true;
  botaoProxima.hidden = true;
  elementoPergunta.textContent = 'Fim da Trilha!';
  elementoProgresso.textContent = 'Trilha concluída';
  falaRobo.textContent = `Parabéns! Você terminou com ${pontos} de ${bancoDePerguntas.length * 10} pontos!`;
  atualizarRobo('../img/robo.png');
  caixaAlternativas.replaceChildren();
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'btn-alternativa';
  botao.textContent = 'Tentar novamente';
  botao.addEventListener('click', () => {
    indiceAtual = 0;
    pontos = 0;
    carregarPergunta();
    elementoPergunta.focus();
  });
  caixaAlternativas.appendChild(botao);
}

carregarPergunta();
