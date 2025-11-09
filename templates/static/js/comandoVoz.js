//funcionalidade de acessibilidade por voz

const MESSAGE_GUIDE = `Comandos disponíveis:
'Adicionar [Nome], quantidade [número], preço [valor], validade [data], categoria [nome]' - Para cadastrar novo produto
'Remover [Nome do Produto]' - Para excluir um produto
'Buscar [Nome do Produto]' - Para localizar um produto
'Entrada [Nome do Produto] quantidade [número]' - Para registrar entrada no estoque
'Saída [Nome do Produto] quantidade [número]' - Para registrar saída do estoque`;

// Dicionário de números por extenso
const NUMBER_WORDS = {
  um: 1, dois: 2, três: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10,
  onze: 11, doze: 12, treze: 13, catorze: 14, quinze: 15, dezesseis: 16, dezessete: 17,
  dezoito: 18, dezenove: 19, vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50,
  sessenta: 60, setenta: 70, oitenta: 80, noventa: 90, cem: 100
};

// Dicionário de meses
const MONTHS = {
  janeiro: 0, fevereiro: 1, março: 2, abril: 3, maio: 4, junho: 5,
  julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11
};

document.addEventListener('DOMContentLoaded', function() {
  const btnVoz = document.getElementById('btn-voz');
  const campoBusca = document.getElementById('pesquisaEstoque');
  const feedback = document.getElementById('feedback');

  if (!btnVoz || !campoBusca) return;

  let recognition;
  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
  } else if ('SpeechRecognition' in window) {
    recognition = new SpeechRecognition();
  }

  function speak(text){
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
  }

  if (!recognition) {
    btnVoz.disabled = true;
    if (feedback) feedback.textContent = 'Seu navegador não suporta reconhecimento de voz.';
    return;
  }

  recognition.lang = 'pt-BR';
  recognition.continuous = false;
  recognition.interimResults = false;

  btnVoz.addEventListener('click', () => {
    if (feedback) {
      feedback.innerHTML = MESSAGE_GUIDE;
      speak('Ouvindo.');
    }
    recognition.start();
  });

  // Função para converter data falada em formato ISO
  function parseVoiceDate(dateString) {
    // Tenta primeiro o formato "dia do mês de ano"
    const dateRegexWithDo = /(\d{1,2})(?:\s+(?:do|de))?\s+(\d{1,2}|\w+)(?:\s+(?:do|de))?\s+(\d{4})/i;
    const matchWithDo = dateString.match(dateRegexWithDo);

    if (matchWithDo) {
      const [, day, monthPart, year] = matchWithDo;
      let month;
      
      // Verifica se o mês é numérico ou por extenso
      if (/^\d+$/.test(monthPart)) {
        month = parseInt(monthPart) - 1;
      } else {
        month = MONTHS[monthPart.toLowerCase()];
      }
      
      if (month === undefined || month < 0 || month > 11) return null;
      
      const date = new Date(parseInt(year), month, parseInt(day));
      if (isNaN(date.getTime())) return null;
      return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
    }

    // Tenta o formato numérico "dd/mm/aaaa"
    const numericDateRegex = /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/;
    const numericMatch = dateString.match(numericDateRegex);

    if (numericMatch) {
      const [, day, month, year] = numericMatch;
      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) return null;
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }

    return null;
  }

  // Função para processar os comandos de voz
  function processVoiceCommand(comando) {
    const cleanComando = comando.toLowerCase().trim();

    // Comando de busca
    if (cleanComando.startsWith("buscar") || cleanComando.startsWith("procurar")) {
      const nome = cleanComando.replace(/buscar |procurar /i, "").trim();
      campoBusca.value = nome;
      campoBusca.dispatchEvent(new Event('input', { bubbles: true }));
      speak(`Buscando por ${nome}`);
      const resultadosDiv = document.getElementById('resultadosPesquisa');
      resultadosDiv.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // Comando para adicionar produto
    if (cleanComando.startsWith("adicionar") || cleanComando.startsWith("inserir")) {
      const fullCommand = cleanComando.replace(/adicionar |inserir /i, "").trim();
      
      // Extrai dados do comando usando expressões regulares
      const quantityMatch = fullCommand.match(/quantidade\s+([a-zçãõáéíóúâêô]+|\d+)/i) || 
                           fullCommand.match(/(\d+|[a-zçãõáéíóúâêô]+)\s+(?:unidades?|itens?)/i);
      
      const priceMatch = fullCommand.match(/(?:preço|valor|custa|r\$)\s*([\d,.]+)/i) || 
                        fullCommand.match(/(?:[\d,.]+)\s*reais/i);
      
      const expiryMatch = fullCommand.match(/(?:validade|vencimento|vence\s+(?:em|dia)|data\s+(?:de\s+)?validade)\s+(.+?)(?=\s+(?:quantidade|preço|valor|categoria|$)|$)/i);

      const categoryMatch = fullCommand.match(/categoria\s+([a-zçãõáéíóúâêô\s]+)(?=\s+(?:quantidade|preço|valor|validade|$)|$)/i);
      
      // Remove as partes extraídas para obter o nome
      let name = fullCommand;
      const matches = [
        quantityMatch && quantityMatch[0],
        priceMatch && priceMatch[0],
        expiryMatch && expiryMatch[0],
        categoryMatch && categoryMatch[0]
      ].filter(Boolean);
      
      // Remove cada match do nome, independente da ordem
      matches.forEach(match => {
        if (match) {
          name = name.replace(match, "");
        }
      });
      
      // Limpa o nome de vírgulas e espaços extras
      name = name.replace(/,/g, "")
                 .replace(/\s+/g, " ")
                 .trim();
                 
      // Remova qualquer menção à palavra "categoria" que possa ter sobrado
      name = name.replace(/\bcategoria\b/gi, "").trim();

      // Converte valores
      const quantity = quantityMatch ? (NUMBER_WORDS[quantityMatch[1].toLowerCase()] || parseInt(quantityMatch[1])) : null;
      const price = priceMatch ? parseFloat(priceMatch[1].replace(",", ".")) : null;
      const expiry = expiryMatch ? parseVoiceDate(expiryMatch[1]) : null;
      const category = categoryMatch ? categoryMatch[1].trim() : 'Outros';

      /* Debug log para ver os valores capturados
        console.log('Dados capturados:', {
        comando: fullCommand,
        matches: {
          quantityMatch,
          priceMatch,
          expiryMatch,
          categoryMatch
        },
        valores: {
          name,
          quantity,
          price,
          expiry,
          category
        }
      });*/

      let missingData = [];
      if (!name) missingData.push("nome");
      if (!quantity) missingData.push("quantidade");
      if (!price) missingData.push("preço");
      if (!expiry) missingData.push("validade");

      if (missingData.length > 0) {
        const mensagem = `Por favor, forneça os seguintes dados que estão faltando: ${missingData.join(", ")}.`;
        console.log('Dados faltando:', missingData);
        speak(mensagem);
        return;
      }

      // Preenche o formulário
      const form = document.getElementById("productForm");
      if (!form) {
        console.error("Formulário não encontrado");
        speak("Desculpe, não encontrei o formulário de produto na página.");
        return;
      }

      // Obtém referências para todos os campos
      const nameField = document.getElementById("productName") || document.getElementById("id_nome");
      const quantityField = document.getElementById("productQuantity") || document.getElementById("id_quantidade");
      const priceField = document.getElementById("productPrice") || document.getElementById("id_preco");
      const expiryField = document.getElementById("productExpiry") || document.getElementById("id_validade");
      const categoryField = document.getElementById("productCategory") || document.getElementById("id_categoria");

      // Verifica se todos os campos foram encontrados
      const missingFields = [];
      if (!nameField) missingFields.push("nome");
      if (!quantityField) missingFields.push("quantidade");
      if (!priceField) missingFields.push("preço");
      if (!expiryField) missingFields.push("validade");

      if (missingFields.length > 0) {
        const erro = `Não encontrei os campos: ${missingFields.join(", ")}`;
        console.error(erro);
        speak(erro);
        return;
      }

      // Preenche os campos com os valores
      try {
        nameField.value = name;
        quantityField.value = quantity;
        priceField.value = price;
        expiryField.value = expiry;

        // Preenche o campo select de categoria se existir
        if (categoryField) {
          const cat = (category || 'Outros').toString().toLowerCase().trim();
          let categoryFound = false;

          // Procura por correspondência no texto da opção ou no value
          for (const opt of categoryField.options) {
            const optText = (opt.text || '').toString().toLowerCase();
            const optValue = (opt.value || '').toString().toLowerCase();
            if (optText.includes(cat) || optValue === cat || optValue.includes(cat)) {
              categoryField.value = opt.value;
              categoryFound = true;
              break;
            }
          }

          // Se não encontrou, tenta igualdade exata
          if (!categoryFound) {
            const exact = Array.from(categoryField.options).find(o => {
              const t = (o.text || '').toString().toLowerCase().trim();
              const v = (o.value || '').toString().toLowerCase().trim();
              return t === cat || v === cat;
            });
            if (exact) {
              categoryField.value = exact.value;
              categoryFound = true;
            }
          }

          if (!categoryFound) {
            // fallback para opção 'Outros' se existir
            const fallback = Array.from(categoryField.options).find(o => (o.text || '').toLowerCase().includes('outro') || (o.value || '').toLowerCase().includes('outro'));
            if (fallback) categoryField.value = fallback.value;
          }
        }

        // Rola até o formulário e envia automaticamente após um pequeno atraso
        form.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => {
          const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
          if (submitButton) {
            submitButton.click();
          } else {
            form.submit();
          }
          speak("Produto cadastrado com sucesso.");
        }, 400);

      } catch (error) {
        console.error("Erro ao preencher o formulário:", error);
        speak("Desculpe, ocorreu um erro ao preencher o formulário.");
      }
      return;
    }

    // Comando para remover produto
    if (cleanComando.startsWith("remover") || cleanComando.startsWith("excluir")) {
      const nome = cleanComando.replace(/remover |excluir /i, "").trim();
      const produtos = document.querySelectorAll('tr');
      let encontrado = false;

      produtos.forEach(produto => {
        const nomeProduto = produto.cells[0]?.textContent.toLowerCase();
        if (nomeProduto === nome.toLowerCase()) {
          encontrado = true;      

          const btnExcluir = produto.querySelector('.btn-delete');
          if (btnExcluir) {
            btnExcluir.click();
            speak(`Produto ${nome} removido com sucesso.`);
          }
        }
      });

      if (!encontrado) {
        speak(`Produto ${nome} não encontrado.`);
      }
      return;
    }

    // Comando para entrada de estoque
    if (cleanComando.startsWith("entrada")) {
      const comandoSemEntrada = cleanComando.replace(/entrada /i, "").trim();
      const quantityMatch = comandoSemEntrada.match(/quantidade\s+([a-zçãõáéíóúâêô]+|\d+)/i) || 
                           comandoSemEntrada.match(/(\d+|[a-zçãõáéíóúâêô]+)\s+(?:unidades?|itens?)/i);
      
      let nome = comandoSemEntrada;
      if (quantityMatch) {
        nome = comandoSemEntrada.replace(quantityMatch[0], "").trim();
      }

      const quantidade = quantityMatch ? (NUMBER_WORDS[quantityMatch[1].toLowerCase()] || parseInt(quantityMatch[1])) : null;

      if (!nome || !quantidade) {
        speak("Por favor, especifique o nome do produto e a quantidade para entrada.");
        return;
      }

      // Procura o produto na lista
      let produtoEncontrado = false;
      const selectProduto = document.getElementById('selectProdutoEntrada');
      Array.from(selectProduto.options).forEach(option => {
        if (option.text.toLowerCase().includes(nome.toLowerCase())) {
          selectProduto.value = option.value;
          document.getElementById('quantidadeEntrada').value = quantidade;
          produtoEncontrado = true;
          
          // Simula o envio do formulário
          const form = document.getElementById('formEntradaEstoque');
          if (form) {
            form.dispatchEvent(new Event('submit', { cancelable: true }));
          }
        }
      });

      if (!produtoEncontrado) {
        speak(`Produto ${nome} não encontrado.`);
      }
      return;
    }

    // Comando para saída de estoque
    if (cleanComando.startsWith("saída") || cleanComando.startsWith("saida")) {
      const comandoSemSaida = cleanComando.replace(/saída |saida /i, "").trim();
      const quantityMatch = comandoSemSaida.match(/quantidade\s+([a-zçãõáéíóúâêô]+|\d+)/i) || 
                           comandoSemSaida.match(/(\d+|[a-zçãõáéíóúâêô]+)\s+(?:unidades?|itens?)/i);
      
      let nome = comandoSemSaida;
      if (quantityMatch) {
        nome = comandoSemSaida.replace(quantityMatch[0], "").trim();
      }

      const quantidade = quantityMatch ? (NUMBER_WORDS[quantityMatch[1].toLowerCase()] || parseInt(quantityMatch[1])) : null;

      if (!nome || !quantidade) {
        speak("Por favor, especifique o nome do produto e a quantidade para saída.");
        return;
      }

      // Procura o produto na lista
      let produtoEncontrado = false;
      const selectProduto = document.getElementById('selectProdutoSaida');
      Array.from(selectProduto.options).forEach(option => {
        if (option.text.toLowerCase().includes(nome.toLowerCase())) {
          const quantidadeDisponivel = parseInt(option.dataset.quantidade);
          if (quantidade > quantidadeDisponivel) {
            speak(`Quantidade insuficiente em estoque. Disponível: ${quantidadeDisponivel} unidades.`);
            return;
          }

          selectProduto.value = option.value;
          document.getElementById('quantidadeSaida').value = quantidade;
          produtoEncontrado = true;
          
          // Simula o envio do formulário
          const form = document.getElementById('formSaidaEstoque');
          if (form) {
            form.dispatchEvent(new Event('submit', { cancelable: true }));
          }
        }
      });

      if (!produtoEncontrado) {
        speak(`Produto ${nome} não encontrado.`);
      }
      return;
    }

    speak("Comando não reconhecido. Para ver os comandos disponíveis, clique novamente no botão de voz." );
  }

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    if (feedback) feedback.textContent = `Você disse: "${transcript}"`;
    processVoiceCommand(transcript);
  };

  recognition.onerror = function(event) {
    if (feedback) feedback.textContent = 'Erro ao reconhecer voz. Tente novamente.';
  };

  recognition.onend = function() {
    setTimeout(() => {
      if (feedback) feedback.textContent = 'Clique para iniciar o comando de voz!';
    }, 2500);
  };
});