document.addEventListener('DOMContentLoaded', function() {
    const formSaida = document.getElementById('formSaidaEstoque');
    const selectProduto = document.getElementById('selectProduto');
    const inputQuantidade = document.getElementById('quantidadeSaida');

    if (formSaida && selectProduto && inputQuantidade) {
        // Validação da quantidade de saída
        formSaida.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const option = selectProduto.selectedOptions[0];
            if (!option) {
                alert('Por favor, selecione um produto.');
                return;
            }

            const quantidadeDisponivel = parseInt(option.dataset.quantidade);
            const quantidadeSaida = parseInt(inputQuantidade.value);

            if (quantidadeSaida > quantidadeDisponivel) {
                alert(`Quantidade insuficiente em estoque. Disponível: ${quantidadeDisponivel}`);
                return;
            }

            if (quantidadeSaida <= 0) {
                alert('A quantidade deve ser maior que zero.');
                return;
            }

            // Se passou por todas as validações, envia o formulário
            this.submit();
        });

        // Atualiza o máximo permitido quando um produto é selecionado
        selectProduto.addEventListener('change', function() {
            const option = this.selectedOptions[0];
            if (option) {
                const quantidadeDisponivel = option.dataset.quantidade;
                inputQuantidade.max = quantidadeDisponivel;
                inputQuantidade.placeholder = `Máx: ${quantidadeDisponivel}`;
            }
        });
    }
});