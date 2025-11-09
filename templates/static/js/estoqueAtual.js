//funcao que mostra alertas de validade dos produtos na secao de alertas
function AlertaValidade() {
    const jsonScriptTag = document.getElementById('produtos-data');
    if (!jsonScriptTag) return;
    
    let lista_produtos;
    try {
        lista_produtos = JSON.parse(jsonScriptTag.textContent);
    } catch (e) {
        console.error('Erro ao fazer parse do produtos-data:', e, jsonScriptTag.textContent);
        return;
    }

    // Garantir que lista_produtos seja um array
    if (!Array.isArray(lista_produtos)) {
        if (lista_produtos && Array.isArray(lista_produtos.produtos)) {
            lista_produtos = lista_produtos.produtos;
        } else if (lista_produtos && typeof lista_produtos === 'object') {
            // Converter objeto simples para array de valores (fallback)
            lista_produtos = Object.values(lista_produtos);
        } else {
            // Não é um formato esperado
            console.warn('produtos-data não é um array nem um objeto convertível:', lista_produtos);
            return;
        }
    }
    
    // Vencidos
    const vencido = lista_produtos.filter(p => p.is_expired);
    
    // Próximos a vencer
    const prox_vencer = lista_produtos.filter(p => !p.is_expired && p.days_diff <= 10 && p.days_diff > 0);

    const alertsList = document.getElementById('alertsList');
    let alertsHTML = "";

    // Alertas de Vencidos
    if (vencido.length > 0) {
        vencido.forEach((product) => {
            const dias_vencido = Math.abs(product.days_diff);
            alertsHTML += `<div class="alert-item danger" data-product-id="${product.id}"><h4>Produto Vencido</h4><p><strong>${product.name}</strong> - Venceu há ${dias_vencido} dia(s) - Lote: ${product.lot || "N/A"}</p></div>`;
        });
    }

    // Alertas de Próximos ao Vencimento
    if (prox_vencer.length > 0) {
        prox_vencer.forEach((product) => {
            const dias_restantes = product.days_diff;
            alertsHTML += `<div class="alert-item warning" data-product-id="${product.id}"><h4>Produto Próximo ao Vencimento</h4><p><strong>${product.name}</strong> - Vence em ${dias_restantes} dia(s) - Lote: ${product.lot || "N/A"}</p></div>`;
        });
    }

    if (alertsHTML === "") {
        alertsHTML = `<div class="alert-item" style="border-left-color: #27ae60; background: #f0fff4;"><h4>Tudo em ordem!</h4><p>Não há produtos vencidos ou próximos ao vencimento.</p></div>`;
    }
    
    if (alertsList) alertsList.innerHTML = alertsHTML;

    QtdAlertas();
}

// Função para atualizar a contagem da dashboard
function QtdAlertas(){
    const jsonScriptTag = document.getElementById('produtos-data');
    if (!jsonScriptTag) return;
    let lista_produtos;
    try {
        lista_produtos = JSON.parse(jsonScriptTag.textContent);
    } catch (e) {
        console.error('Erro ao fazer parse do produtos-data:', e);
        return;
    }

    if (!Array.isArray(lista_produtos)) {
        if (lista_produtos && Array.isArray(lista_produtos.produtos)) {
            lista_produtos = lista_produtos.produtos;
        } else if (lista_produtos && typeof lista_produtos === 'object') {
            lista_produtos = Object.values(lista_produtos);
        } else {
            console.warn('produtos-data não é um array nem um objeto convertível:', lista_produtos);
            return;
        }
    }

    //total de produtos
    const total_produtos = lista_produtos.length;
    
    // Vencidos
    const vencido = lista_produtos.filter(p => p.is_expired);
    const qtd_vencidos = vencido.length;
    
    // Próximos a vencer
    const prox_vencer = lista_produtos.filter(p => !p.is_expired && p.days_diff <= 10 && p.days_diff > 0);
    const qtd_prox_vencer = prox_vencer.length; 
    
    const totalProductsElement = document.getElementById('totalProducts');
    if (totalProductsElement) {
        totalProductsElement.textContent = total_produtos;
    }

    const expiringSoonElem = document.getElementById('expiringSoon');
    if (expiringSoonElem) {
        expiringSoonElem.textContent = qtd_prox_vencer;
    }
    
    const expiredElement = document.getElementById('expired');
    if (expiredElement) {
        expiredElement.textContent = qtd_vencidos;
    }
}

// Função para buscar produtos
function buscarProdutos(termo) {
    const jsonScriptTag = document.getElementById('produtos-data');
    if (!jsonScriptTag) return;
    
    let lista_produtos;
    try {
        lista_produtos = JSON.parse(jsonScriptTag.textContent);
    } catch (e) {
        console.error('Erro ao fazer parse do produtos-data:', e);
        return;
    }

    if (!Array.isArray(lista_produtos)) {
        if (lista_produtos && Array.isArray(lista_produtos.produtos)) {
            lista_produtos = lista_produtos.produtos;
        } else if (lista_produtos && typeof lista_produtos === 'object') {
            lista_produtos = Object.values(lista_produtos);
        } else {
            console.warn('produtos-data não é um array nem um objeto convertível:', lista_produtos);
            return;
        }
    }

    const resultadosDiv = document.getElementById('resultadosPesquisa');
    if (!resultadosDiv) return;

    // Se o termo de busca estiver vazio, limpa os resultados
    if (!termo.trim()) {
        resultadosDiv.innerHTML = '';
        resultadosDiv.style.display = 'none';
        return;
    }

    // Filtra os produtos que correspondem ao termo de busca
    const resultados = lista_produtos.filter(produto => 
        produto.nome.toLowerCase().includes(termo.toLowerCase()) ||
        produto.categoria.toLowerCase().includes(termo.toLowerCase())
    );

    // Exibe os resultados
    if (resultados.length > 0) {
        let html = '<div class="resultados-pesquisa">';
        resultados.forEach(produto => {
            html += `
                <div class="resultado-item">
                    <div class="produto-info">
                        <span class="produto-nome">${produto.nome}</span>
                        <span class="produto-categoria">${produto.categoria}</span>
                        <span class="produto-quantidade">Qtd: ${produto.quantidade}</span>
                        <span class="produto-preco">R$ ${produto.preco_formatado}</span>
                        <span class="produto-validade">Validade: ${produto.expiry}</span>
                        <span class="produto-lote">Lote: ${produto.lot || "N/A"}</span>
                    </div>
                    <div class="produto-acoes">
                        <a href="/produtos/editar/${produto.id}" class="btn-edit">Editar</a>
                        <a href="/produtos/excluir/${produto.id}" class="btn-delete" 
                           onclick="return confirm('Tem certeza que deseja excluir este produto?');">
                            Excluir
                        </a>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        resultadosDiv.innerHTML = html;
        resultadosDiv.style.display = 'block';
    } else {
        resultadosDiv.innerHTML = '<div class="sem-resultados">Nenhum produto encontrado</div>';
        resultadosDiv.style.display = 'block';
    }
}

// Inicializa as funções quando o documento carrega
document.addEventListener('DOMContentLoaded', function() {
    AlertaValidade();
    QtdAlertas();
    
    // Configura a busca
    const campoBusca = document.getElementById('pesquisaEstoque');
    if (campoBusca) {
        campoBusca.addEventListener('input', function(e) {
            buscarProdutos(e.target.value);
        });
    }

    // Se o usuário clicar em um alerta, rola até o produto correspondente na tabela
    const alertsContainer = document.getElementById('alertsList');
    if (alertsContainer) {
        alertsContainer.addEventListener('click', function(e) {
            const alertItem = e.target.closest('.alert-item');
            if (!alertItem) return;
            const productId = alertItem.getAttribute('data-product-id');
            if (!productId) return;

            // Encontra a linha da tabela com o mesmo data-product-id
            const row = document.querySelector("tr[data-product-id='" + productId + "']");
            if (row) {
                // Rola suavemente até a linha e aplica uma classe de destaque temporária
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                row.classList.add('highlight-row');
                setTimeout(() => row.classList.remove('highlight-row'), 2500);
            } else {
                // Se não encontrou por id, tenta procurar pelo nome no texto do alerta
                const nomeEl = alertItem.querySelector('strong');
                if (nomeEl) {
                    const nome = nomeEl.textContent.trim().toLowerCase();
                    const rows = document.querySelectorAll('#inventoryBody tr');
                    for (const r of rows) {
                        const cellName = (r.cells[0]?.textContent || '').trim().toLowerCase();
                        if (cellName === nome) {
                            r.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            r.classList.add('highlight-row');
                            setTimeout(() => r.classList.remove('highlight-row'), 2500);
                            break;
                        }
                    }
                }
            }
        });
    }
});