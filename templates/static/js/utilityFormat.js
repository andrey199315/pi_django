/*Funções utilitárias para formatação e manipulação de dados*/

export default class UtilityFormat {
  constructor(storage) {
    this.storage = storage;
  }

  updateUI() {
    this.updateStats();
    this.showAlerts();
  }

  getFormData() {
    const productName = document.getElementById("productName");
    const productCategory = document.getElementById("productCategory");
    const productQuantity = document.getElementById("productQuantity");
    const productPrice = document.getElementById("productPrice");
    const productExpiry = document.getElementById("productExpiry");
    const productLot = document.getElementById("productLot");
    return {
      name: productName ? productName.value : "",
      category: productCategory ? productCategory.value : "",
      quantity: productQuantity ? (parseInt(productQuantity.value) || 0) : 0,
      price: productPrice ? (parseFloat(productPrice.value) || 0 ) : 0,
      expiry: productExpiry ? productExpiry.value : "",
      lot: productLot ? productLot.value : "",
    };
  }

  populateForm(product) {
    const productName = document.getElementById("productName");
    const productCategory = document.getElementById("productCategory");
    const productQuantity = document.getElementById("productQuantity");
    const productPrice = document.getElementById("productPrice");
    const productExpiry = document.getElementById("productExpiry");
    const productLot = document.getElementById("productLot");
    if (productName) productName.value = product.name;
    if (productCategory) productCategory.value = product.category;
    if (productQuantity) productQuantity.value = product.quantity;
    if (productPrice) productPrice.value = product.price;
    if (productExpiry) productExpiry.value = product.expiry;
    if (productLot) productLot.value = product.lot;
  }

  resetForm() {
    const productForm = document.getElementById("productForm");
    if (productForm) {
      productForm.reset();
    }
  }

  getProductStatus(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) return "expired";
    if (daysUntilExpiry <= 7) return "expiring";
    return "valid";
  }

  getStatusText(status) {
    const statusMap = {
      valid: "Válido",
      expiring: "Próximo ao vencimento",
      expired: "Vencido",
    };
    return statusMap[status] || "Desconhecido";
  }

  getDaysUntilExpiry(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  }

  formatPrice(price) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  }

  updateStats() {
    const total = this.storage.products.length;
    
    const expiring = this.storage.products.filter(
      (p) => this.getProductStatus(p.expiry) === "expiring"
    ).length;
    const expired = this.storage.products.filter(
      (p) => this.getProductStatus(p.expiry) === "expired"
    ).length;

    const totalProducts = document.getElementById("totalProducts");
    if (totalProducts) totalProducts.textContent = total;

    const expiringSoon = document.getElementById("expiringSoon");
    if (expiringSoon) expiringSoon.textContent = expiring;

    const expiredCount = document.getElementById("expired");
    if (expiredCount) expiredCount.textContent = expired;
  }

  showAlerts() {
    const alertsList = document.getElementById("alertsList");
    const expiring = this.storage.products.filter(
      (p) => this.getProductStatus(p.expiry) === "expiring"
    );
    const expired = this.storage.products.filter(
      (p) => this.getProductStatus(p.expiry) === "expired"
    );
    let alertsHTML = "";

    if (expired.length > 0) {
      expired.forEach((product) => {
        const daysExpired = Math.abs(this.getDaysUntilExpiry(product.expiry));
        alertsHTML += `<div class="alert-item danger" data-product-id="${product.id}"><h4>🚨 Produto Vencido</h4><p><strong>${product.name}</strong> - Venceu há ${daysExpired} dia(s) - Lote: ${product.lot || "N/A"}</p></div>`;
      });
    }
    if (expiring.length > 0) {
      expiring.forEach((product) => {
        const daysUntilExpiry = this.getDaysUntilExpiry(product.expiry);
        alertsHTML += `<div class="alert-item warning" data-product-id="${product.id}"><h4>⚠️ Produto Próximo ao Vencimento</h4><p><strong>${product.name}</strong> - Vence em ${daysUntilExpiry} dia(s) - Lote: ${product.lot || "N/A"}</p></div>`;
      });
    }
    if (alertsHTML === "") {
      alertsHTML = `<div class="alert-item" style="border-left-color: #27ae60; background: #f0fff4;"><h4>✅ Tudo em ordem!</h4><p>Não há produtos vencidos ou próximos ao vencimento.</p></div>`;
    }
    if (alertsList) alertsList.innerHTML = alertsHTML;
  }
}
