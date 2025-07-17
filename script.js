const apiKeyInput = document.getElementById("apiKey")
const gameSelect = document.getElementById("gameSelect")
const questionInput = document.getElementById("questionInput")
const askButton = document.getElementById("askButton")
const aiResponse = document.getElementById("aiResponse")
const form = document.getElementById("form")

const markdownToHtml = (text) => {
  const converter = new showdown.Converter()
  return converter.makeHtml(text)
}


//AIzaSyCdX04rX0yI4XZdafw7MadQvgnhbWb1WPk
const perguntarAI = async (apiKey, game, question) => {
  const model = "gemini-2.0-flash"
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const pergunta = `
    ## Especialidade
    Voce é um especialista assitente de meta para o jogo ${game}
    
    ## Tarefa
    Voce debe responder as perguntas do usuario com base no seu conhecimento do jogo, estrategias, builds e dicas
    
    ## Regras
    - Se voce não sabe a resposta, responda com "Não sei" e nao tente inventar uma resposta.
    - Se a pergunta não esta relacionada ao jogo, responda com "essa pergunta no esta relacionada ao jogo".
    - Considere a data atual ${new Date().toLocaleDateString()} 
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coherente.
    - Nunca responda itens que voce não tenha certeza de que existe no patch atual.

    ## Resposta
    - Economice na resposta, seja direto e responda no maximo 500 caracteres. 
    - Responda em markdown.
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que usuario esta querendo.

    ## Exemplo de resposta
    Pergunta do usuario: Melhor build rengar jungle 
    resposta: A build mais atual é: \n\n**Itens:**\n\n coloque os itens aqui. \n\n**Runas:**\n\n exemplo de runa \n\n

    ---
    Aqui esta a pergunta do usuario: ${question}
`
  const contents = [{
    role: "user",
    parts: [{
      text: pergunta
    }]
  }]

  const tools = [{
    google_search: {}
  }]

  //chamada API
  const response = await fetch(geminiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents,
      tools
    })
  })
  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

const enviarFormulario = async (event) => {
  event.preventDefault()
  const apiKey = apiKeyInput.value
  const game = gameSelect.value
  const question = questionInput.value

  if (apiKey == "" || game == "" || question == "") {
    alert("Por favor, preencha todos os campos")
    return
  }
  askButton.disabled = true; // desabilita o botão de enviar
  askButton.textContent = "Perguntando..."
  askButton.classList.add("loading")

  try {
    //perguntar para a IA
    const text = await perguntarAI(apiKey, game, question)
    aiResponse.querySelector(".response-content").innerHTML = markdownToHtml(text)
    aiResponse.classList.remove("hidden")
  } catch (error) {

  } finally {
    askButton.disabled = false
    askButton.textContent = "Perguntar"
    askButton.classList.remove("loading")

  }
}
form.addEventListener("submit", enviarFormulario)