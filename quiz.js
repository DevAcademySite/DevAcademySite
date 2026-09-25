console.log("Dev Academy: quiz.js carregado");
// 1. Nosso "Banco de Dados" temporário de perguntas
const bancoDePerguntas = [
    {
        pergunta: "O que significa a sigla HTML?",
        alternativas: [
            "Hyper Text Markup Language",
            "High Tech Modern Language",
            "Hyperlink and Text Markup Level",
            "Home Tool Markup Language"
        ],
        respostaCorreta: 0 // Índice da resposta certa (começa a contar do 0)
    },
    {
        pergunta: "Qual estrutura SQL é usada para selecionar dados de uma tabela?",
        alternativas: [
            "UPDATE",
            "INSERT INTO",
            "SELECT",
            "DELETE"
        ],
        respostaCorreta: 2 
    }
];

// 2. Variáveis de controle do jogo
let indiceAtual = 0;
let pontos = 0;

// 3. Capturando os elementos do HTML que vamos modificar
const elementoPergunta = document.getElementById('texto-pergunta');
const caixaAlternativas = document.getElementById('caixa-alternativas');
const elementoProgresso = document.getElementById('progresso');
const elementoPontuacao = document.getElementById('pontuacao');
const falaRobo = document.getElementById('fala-robo');
const imagemRobo = document.getElementById('imagem-robo');

// 4. Função principal para carregar a pergunta na tela
function carregarPergunta() {
    const perguntaAtual = bancoDePerguntas[indiceAtual];
    
    // Atualiza o título da pergunta e o progresso
    elementoPergunta.innerText = perguntaAtual.pergunta;
    elementoProgresso.innerText = `Pergunta ${indiceAtual + 1}/${bancoDePerguntas.length}`;
    
    // Limpa a caixa de botões (remove os botões antigos)
    caixaAlternativas.innerHTML = "";

    // Cria novos botões para as alternativas
    perguntaAtual.alternativas.forEach((textoDaAlternativa, index) => {
        const botao = document.createElement('button');
        botao.classList.add('btn-alternativa');
        botao.innerText = textoDaAlternativa;
        
        // Quando o aluno clicar no botão, verifica a resposta
        botao.addEventListener('click', () => verificarResposta(index));
        
        caixaAlternativas.appendChild(botao); // Adiciona o botão na tela
    });
}

// 5. Função que verifica se o aluno acertou ou errou
function verificarResposta(indiceEscolhido) {
    const perguntaAtual = bancoDePerguntas[indiceAtual];
    const respostaCerta = perguntaAtual.respostaCorreta;

    if (indiceEscolhido === respostaCerta) {
        // Acertou! Aumenta a pontuação e mantém o robô normal
        pontos += 10;
        elementoPontuacao.innerText = `Pontos: ${pontos}`;
        falaRobo.innerHTML = "<p>Muito bem! Resposta exata!</p>";
        imagemRobo.src = "robo.png"; 
    } else {
        // Errou! Troca a imagem para o roboz.png
        falaRobo.innerHTML = "<p>Ops! Resposta incorreta. Preste mais atenção!</p>";
        imagemRobo.src = "roboz.png"; 
    }

    // Avança para a próxima pergunta
    indiceAtual++;
    
    // Espera 2,5 segundos antes de mostrar a próxima pergunta
    setTimeout(() => {
        // Restaura a fala e a imagem do robô para o estado normal
        falaRobo.innerHTML = "<p>Vamos lá! Escolha a resposta correta.</p>";
        imagemRobo.src = "robo.png";

        // Verifica se ainda tem perguntas ou se o jogo acabou
        if (indiceAtual < bancoDePerguntas.length) {
            carregarPergunta();
        } else {
            finalizarQuiz();
        }
    }, 2500); // 2500 milissegundos = 2.5 segundos
}

// 6. Função para finalizar o jogo
function finalizarQuiz() {
    elementoPergunta.innerText = "Fim da Trilha!";
    caixaAlternativas.innerHTML = `<button class="btn-alternativa" onclick="location.reload()">Tentar Novamente</button>`;
    falaRobo.innerHTML = `<p>Parabéns! Você terminou com ${pontos} pontos!</p>`;
}

// 7. Inicia o jogo carregando a primeira pergunta!
carregarPergunta();