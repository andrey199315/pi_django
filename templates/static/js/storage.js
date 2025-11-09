/*Filtra e renderiza os produtos do Array*/

export default class Storage {
    constructor() {
    this.products = JSON.parse(localStorage.getItem("inventory")) || [];
    this.editingId = null;

    }

    //Filtra os produtos com base nos filtros aplicados
    getFilteredProducts() {
    let filtered = [...this.products];
    const categoryFilter = document.getElementById("categoryFilter");
    const statusFilter = document.getElementById("statusFilter");
    const searchInput = document.getElementById("searchInput");

    const categoryValue = categoryFilter ? categoryFilter.value : "";
    const statusValue = statusFilter ? statusFilter.value : "";
    const searchValue = searchInput ? searchInput.value.toLowerCase() : "";

    if (categoryValue && categoryValue !== "" && categoryValue !== "Não selecionado") {
      filtered = filtered.filter((p) => p.category === categoryValue);
    }
    if (statusValue && statusValue !== "" && statusValue !== "não selecionado") {
      filtered = filtered.filter(
        (p) => this.getProductStatus(p.expiry) === statusValue
      );
    }
    if (searchValue && searchValue !== "" && searchValue !== "não selecionado") {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchValue) ||
          p.category.toLowerCase().includes(searchValue) ||
          p.lot.toLowerCase().includes(searchValue)
      );
    }

    return filtered;
  }


  //Mostra os produtos na tabela "Estoque Atual" no final da página
  renderProducts(utility) {
    const tbody = document.getElementById("inventoryBody");
    const filtered = this.getFilteredProducts();


   if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="empty-state"><h3>Nenhum produto encontrado</h3><p>Adicione produtos ao estoque ou ajuste os filtros</p></td></tr>`;
      return;
    }

    tbody.innerHTML = filtered
      .map((product) => {
        const status = utility.getProductStatus(product.expiry);
        const daysUntilExpiry = utility.getDaysUntilExpiry(product.expiry);
        return `
        <tr>
          <td>${product.name}</td>
          <td>${product.category}</td>
          <td>${product.quantity}</td>
          <td>${utility.formatPrice(product.price)}</td>
          <td>${utility.formatDate(product.expiry)}</td>
          <td>
            <span class="status ${status}">${utility.getStatusText(status)}
              ${status !== "expired" ? `(${daysUntilExpiry} dias)` : ""}
            </span>
          </td>
          <td>${product.lot || "-"}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-edit" data-id="${product.id}">Editar</button>
              <button class="btn-delete" data-id="${product.id}">Excluir</button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");

    // Event delegation para editar/excluir
    if (!tbody._delegationAttached) {
      tbody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.btn-edit');
        const deleteBtn = e.target.closest('.btn-delete');
        if (editBtn) {
          const id = editBtn.getAttribute('data-id');
          // Dispara evento personalizado para edição de produto
          window.dispatchEvent(new CustomEvent('edit-product', { detail: { id } }));
        }
        if (deleteBtn) {
          const id = deleteBtn.getAttribute('data-id');
          window.dispatchEvent(new CustomEvent('delete-product', { detail: { id } }));
        }
      });
      tbody._delegationAttached = true;
    }
  }

   saveToStorage() {
    localStorage.setItem("inventory", JSON.stringify(this.products));
  }


  //produtos de exemplo
  addExampleProducts(utility) {
    const exampleProducts = [
      {
        id: "1",
        name: "Leite Integral",
        category: "Alimentos",
        quantity: 24,
        price: 4.5,
        expiry: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        lot: "LT001",
      },
      {
        id: "2",
        name: "Paracetamol 500mg",
        category: "Medicamentos",
        quantity: 100,
        price: 12.9,
        expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        lot: "MED001",
      },
      {
        id: "3",
        name: "Pão de Forma",
        category: "Alimentos",
        quantity: 15,
        price: 6.8,
        expiry: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        lot: "PAO001",
      },
    ];
  this.products = exampleProducts;
  this.saveToStorage();
  this.renderProducts(utility);
  utility.updateUI();
  }
}
