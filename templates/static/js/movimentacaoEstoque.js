document.addEventListener('DOMContentLoaded', function() {
    // Configuração do formulário de saída
    const formSaida = document.getElementById('formSaidaEstoque');
    const selectProdutoSaida = document.getElementById('selectProdutoSaida');
    const inputQuantidadeSaida = document.getElementById('quantidadeSaida');

    // Configuração do formulário de entrada
    const formEntrada = document.getElementById('formEntradaEstoque');
    const selectProdutoEntrada = document.getElementById('selectProdutoEntrada');
    const inputQuantidadeEntrada = document.getElementById('quantidadeEntrada');

    // Configurar validação para o formulário de saída
    if (formSaida && selectProdutoSaida && inputQuantidadeSaida) {
        formSaida.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const option = selectProdutoSaida.selectedOptions[0];
            if (!option) {
                alert('Por favor, selecione um produto.');
                return;
            }

            const quantidadeDisponivel = parseInt(option.dataset.quantidade);
            const quantidadeSaida = parseInt(inputQuantidadeSaida.value);

            if (quantidadeSaida > quantidadeDisponivel) {
                alert(`Quantidade insuficiente em estoque. Disponível: ${quantidadeDisponivel}`);
                return;
            }

            if (quantidadeSaida <= 0) {
                alert('A quantidade deve ser maior que zero.');
                return;
            }

            this.submit();
        });

        // Atualiza o máximo permitido quando um produto é selecionado
        selectProdutoSaida.addEventListener('change', function() {
            const option = this.selectedOptions[0];
            if (option) {
                const quantidadeDisponivel = option.dataset.quantidade;
                inputQuantidadeSaida.max = quantidadeDisponivel;
                inputQuantidadeSaida.placeholder = `Máx: ${quantidadeDisponivel}`;
            }
        });
    }

    // Configurar validação para o formulário de entrada
    if (formEntrada && selectProdutoEntrada && inputQuantidadeEntrada) {
        formEntrada.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const quantidadeEntrada = parseInt(inputQuantidadeEntrada.value);

            if (quantidadeEntrada <= 0) {
                alert('A quantidade de entrada deve ser maior que zero.');
                return;
            }

            if (quantidadeEntrada > 999999) {
                alert('Quantidade muito alta. Máximo permitido: 999999');
                return;
            }

            this.submit();
        });

        // Configura o placeholder padrão para entrada
        selectProdutoEntrada.addEventListener('change', function() {
            inputQuantidadeEntrada.placeholder = "Quantidade a adicionar";
        });
    }
});