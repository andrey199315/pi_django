let message = "Para adicionar um produto, diga: 'Adicionar [Nome], quantidade [número], preço [valor], validade [data].'<br>" +
        "Para remover um produto, diga: 'Remover [Nome do Produto].'<br>" +
        "Para buscar um produto, diga: 'Buscar [Nome do Produto].'"


// Classe dedicada apenas ao comando de voz
export default class VoiceCommandManager {
  constructor(storage, utility, productManager) {
    this.storage = storage;
    this.utility = utility;
    this.productManager = productManager;
    if (!('webkitSpeechRecognition' in window)) {
      this.recognition = null;
      this.showFeedback(
        'Seu navegador não suporta a API de reconhecimento de voz. Tente usar o Google Chrome v25+ ou Microsoft Edge.'
      );
    } else {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.lang = 'pt-BR';
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this._setupEvents();
    }

  }

      // Eventos do reconhecimento de voz
    btnVoz = document.getElementById("btn-voz");
    if (btnVoz) {
      btnVoz.addEventListener("click", () => {
        this.startVoiceRecognition();
      });
    }

  _setupEvents() {
    this.recognition.onresult = (event) => {
      if (event.results[0].isFinal) {
        const transcript = event.results[0][0].transcript.toLowerCase();
        this.showFeedback(`Comando recebido: "${transcript}"`);
        this.processVoiceCommand(transcript);
        this.recognition.stop();
      }
    };
    this.recognition.onerror = (event) => {
      this.showFeedback('Erro no reconhecimento de voz: ' + event.error);
    };
  }

  showUserGuide() {
    const feedback = document.getElementById('feedback');
    if (feedback) {
      feedback.innerHTML = message
      
    }
  }

  startVoiceRecognition() {
    if (!this.recognition) return;
    this.recognition.start();
    this.showFeedback('Ouvindo... Fale seu comando.');
    this.speak('Ouvindo');
  }

  processVoiceCommand(comando) {
    // Lógica de extração de dados do comando de voz
    // Adapte conforme integração com o restante do sistema
    
    const feedback = document.getElementById('feedback');
    const cleanComando = comando.replace(/ouvindo pode falar seu comando\s*/, '').trim();
    if (cleanComando.startsWith('adicionar') || cleanComando.startsWith('inserir')) {
        // ... lógica para extrair nome, quantidade, preço, validade ...
        const fullCommand = cleanComando.replace("adicionar ", "");

        let quantity = null;
        let price = null;
        let expiry = null;
        let name = fullCommand; // Assume que o nome é a string completa inicialmente

        // Expressões regulares para encontrar cada dado
        const quantityMatch = fullCommand.match(
            /(?:quantidade|quantia)\s+([a-zçãõáéíóúâêô]+|\d+)/i
        );
        const priceMatch = fullCommand.match(/(?:preço|valor|r\$)\s*([\d,.]+)/i);
        const expiryMatch = fullCommand.match(
            /(?:validade|vencimento|vence em|vence|validades|data de validade)\s+(.+)/i
        );

        // Extrai a quantidade e a remove da string principal
        if (quantityMatch) {
            const numStr = quantityMatch[1].toLowerCase();
            const numberWords = {
            um: 1,
            dois: 2,
            três: 3,
            quatro: 4,
            cinco: 5,
            seis: 6,
            sete: 7,
            oito: 8,
            nove: 9,
            dez: 10,
            onze: 11,
            doze: 12,
            treze: 13,
            catorze: 14,
            quinze: 15,
            dezesseis: 16,
            dezessete: 17,
            dezoito: 18,
            dezenove: 19,
            vinte: 20,
            trinta: 30,
            quarenta: 40,
            cinquenta: 50,
            sessenta: 60,
            setenta: 70,
            oitenta: 80,
            noventa: 90,
            cem: 100,
            };
            quantity = numberWords[numStr] || parseInt(numStr);
            name = name.replace(quantityMatch[0], "").trim();
        }

        // Extrai o preço e o remove da string principal
        if (priceMatch) {
            price = parseFloat(priceMatch[1].replace(",", "."));
            name = name.replace(priceMatch[0], "").trim();
        }

        // Extrai a data e a remove da string principal
        if (expiryMatch) {
            const dateString = expiryMatch[1].trim();
            expiry = this.parseVoiceDate(dateString);
            name = name.replace(expiryMatch[0], "").trim();
        }

        // Remove a pontuação e espaços em excesso do nome
        const nome = name.replace(/[,.]/g, "").trim();

        console.log({ nome, quantity, price, expiry });

        if (!nome || quantity === null || price === null || !expiry) {
            this.speak(
            "Não foi possível entender o comando completo. Certifique-se de falar o nome do produto, a quantidade, o preço e a data de validade."
            );
            return;
          }
          this.showUserGuide();
          
        const newProduct = {
        id: Date.now().toString(),
        name: nome,
        category: "Outros", // Categoria padrão
        quantity: quantity,
        price: price,
        expiry: expiry,
        lot: "",
      };
      this.productManager.addProduct(newProduct);
      this.storage.saveToStorage();
      this.storage.renderProducts(this.utility);
      this.utility.updateUI();
      this.speak('Produto adicionado com sucesso!');
      this.showUserGuide();

      //comando para remover produto
    } else if (cleanComando.startsWith("remover") || cleanComando.startsWith("excluir")) {
      const nome = cleanComando
        .replace(/remover (?:o |a |o produto |o item )?/i, "")
        .trim();
      const productIndex = this.storage.products.findIndex(
        (p) => p.name.toLowerCase() === nome
      );
      if (productIndex !== -1) {
        this.storage.products.splice(productIndex, 1);
        this.storage.saveToStorage();
        this.storage.renderProducts(this.utility);
        this.utility.updateUI();
        this.speak(`Produto ${nome} removido com sucesso.`);
        this.showUserGuide();
      } else {
        this.speak(`Produto ${nome} não encontrado.`);
        this.showUserGuide();
      }

      //comando para buscar produto
    } else if (cleanComando.startsWith("buscar") || cleanComando.startsWith("procurar")) {
      const nome = cleanComando
        .replace(/buscar (?:o |a |o produto |o item )?/i, "")
        .trim();
      const product = this.storage.products.find((p) => p.name.toLowerCase() === nome);
      if (product) {
        this.speak(
          `O produto ${product.name} tem ${
            product.quantity
          } unidades em estoque e o preço é ${this.utility.formatPrice(product.price)}.`
        );
        this.showUserGuide();
      } else {
        this.speak(`Produto ${nome} não encontrado.`);
      }
      this.showUserGuide();
    } else {
      this.speak("Desculpe, não entendi o comando. Por favor, tente novamente.");
    }
    this.showUserGuide();
  }

   parseVoiceDate(dateString) {
    const months = {
      janeiro: 0,
      fevereiro: 1,
      março: 2,
      abril: 3,
      maio: 4,
      junho: 5,
      julho: 6,
      agosto: 7,
      setembro: 8,
      outubro: 9,
      novembro: 10,
      dezembro: 11,
    };

    const dateRegex =
      /(\d{1,2})(?: de)?\s+([a-zçãõáéíóúâêô]+)(?: de)?\s+(\d{4})/i;
    const match = dateString.match(dateRegex);

    if (match) {
      const [, day, monthName, year] = match;
      const month = months[monthName.toLowerCase()];
      if (month === undefined) return null;
      const date = new Date(year, month, day);
      if (isNaN(date.getTime())) return null;
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    }

    // Tenta o formato numérico, como "08/09/2026"
    const numericDateRegex = /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/;
    const numericMatch = dateString.match(numericDateRegex);

    if (numericMatch) {
      const [, day, month, year] = numericMatch;
      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) return null;
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    }

    return null;
  }

  //metodo para que o sistema fale algo
  speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
  }

  //mostra feedback na tela, abaixo do botao de voz
  showFeedback(message) {
    const feedback = document.getElementById('feedback');
    if (feedback) {
      feedback.textContent = message;
    }
  }
}
