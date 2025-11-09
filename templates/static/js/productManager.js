/*Gerencia a adição, edição, exclusão e atualização de produtos no inventário*/

export default class ProductManager {
  constructor(storage, utility) {
    this.storage = storage;
    this.utility = utility;
  }

  handleFormSubmit() {
    const formData = this.utility.getFormData();
    if (this.storage.editingId) {
      this.updateProduct(this.storage.editingId, formData);
    } else {
     this.addProduct(formData);
    }
    this.utility.resetForm();
    this.storage.saveToStorage();
    this.storage.renderProducts(this.utility);
    this.utility.updateUI();
  }

  addProduct(product) {
    this.storage.products.push({ ...product, id: Date.now().toString() });
  }

  updateProduct(id, updatedProduct) {
    const index = this.storage.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.storage.products[index] = { ...this.storage.products[index], ...updatedProduct };
    }
  }

  deleteProduct(id) {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      this.storage.products = this.storage.products.filter((p) => p.id !== id);
      this.storage.saveToStorage();
      this.storage.renderProducts(this.utility);
      this.utility.updateUI();
    }
  }

  editProduct(id) {
    const product = this.storage.products.find((p) => p.id === id);
    if (product) {
      this.storage.editingId = id;
      this.utility.populateForm(product);
      const submitBtn = document.getElementById("submitBtn");
      if (submitBtn) {
        submitBtn.textContent = "Atualizar Produto";
      }
      const cancelBtn = document.getElementById("cancelBtn");
      if (cancelBtn) {
        cancelBtn.style.display = "inline-block";
      }
    }
  }

  cancelEdit() {
    this.storage.editingId = null;
    this.utility.resetForm();
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
      submitBtn.textContent = "Adicionar Produto";
    }
    const cancelBtn = document.getElementById("cancelBtn");
    if (cancelBtn) {
      cancelBtn.style.display = "none";
    }
  }
}
