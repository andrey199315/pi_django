// Main script.js

import Storage from './storage.js';
import ProductManager from './productManager.js';
import UtilityFormat from './utilityFormat.js';
import VoiceCommandManager from './voiceCommand.js';

class InventoryManager {
  constructor(storage, productManager, utility, voiceManager) {
    // Armazena as dependências como propriedades internas da classe
    this.storage = storage;
    this.productManager = productManager;
    this.utility = utility;
    this.voiceManager = voiceManager;

    // Carrega os dados do localStorage ou inicia com um array vazio
    this.storage.products;
    this.storage.editingId;

    this.init();
  
  }

  init() {
    this.bindEvents();
    this.storage.renderProducts(this.utility);
    this.utility.updateStats();
    this.utility.showAlerts();

    //Adiciona produtos de exemplo se o estoque estiver vazio
    if (this.storage.products.length === 0) {
      this.storage.addExampleProducts(this.utility);
    }
    this.voiceManager.showUserGuide();
  }

  bindEvents() {
    // Eventos do formulário e filtros
    const productForm = document.getElementById("productForm");
    if (productForm) {
      productForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.productManager.handleFormSubmit();
      });
    }

    const cancelBtn = document.getElementById("cancelBtn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.productManager.cancelEdit();
      });
    }

    const categoryFilter = document.getElementById("categoryFilter");
    if (categoryFilter) {
      categoryFilter.addEventListener("change", () => this.storage.renderProducts(this.utility));
    }

    const statusFilter = document.getElementById("statusFilter");
    if (statusFilter) {
      statusFilter.addEventListener("change", () => this.storage.renderProducts(this.utility));
    }

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", () => this.storage.renderProducts(this.utility));
    }

    // Evento: Ao clicar em um alerta, edita o produto
    const alertsList = document.getElementById("alertsList");
    if (alertsList) {
      alertsList.addEventListener("click", (e) => {
        const alertItem = e.target.closest(".alert-item");
        if (alertItem) {
          const productId = alertItem.dataset.productId;
          if (productId) {
            this.productManager.editProduct(productId);
            document.getElementById("productForm").scrollIntoView({ behavior: "smooth" });
          }
        }
      });
    }
  }

}

// Inicializa a aplicação
document.addEventListener('DOMContentLoaded', () => {
    
  const storage = new Storage();
  const utility = new UtilityFormat(storage);
  const productManager = new ProductManager(storage, utility);  

  const voiceManager = new VoiceCommandManager(storage, utility, productManager);
  document.getElementById('btn-voz').onclick = () => voiceManager.startVoiceRecognition();

  const inventory = new InventoryManager(storage, productManager, utility, voiceManager);
  
  // Listeners para eventos personalizados dos botões (editar e excluir) da tabela
  window.addEventListener('edit-product', (e) => {
    const id = e.detail.id;
    productManager.editProduct(id);
    document.getElementById("productForm").scrollIntoView({ behavior: "smooth" });
  });
  window.addEventListener('delete-product', (e) => {
    const id = e.detail.id;
    productManager.deleteProduct(id);
  });
});

