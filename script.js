const menu = document.getElementById("lista");
const listBtn = document.getElementById("list-btn");
const listModal = document.getElementById("list-modal");
const listItemsContainer = document.getElementById("list-items");
const listTotal = document.getElementById("list-total");
const listCount = document.getElementById("list-count");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const nameInput = document.getElementById("name");
const addressInput = document.getElementById("address");
const nameWarn = document.getElementById("name-warn");
const addressWarn = document.getElementById("address-warn");

let list = {}; // carrinho como objeto
const whatsappNumber = "5511998680448";

// ===== PERSISTÊNCIA =====
function saveList() {
  localStorage.setItem("carrinho", JSON.stringify(list));
}
function loadList() {
  const saved = localStorage.getItem("carrinho");
  if (saved) {
    list = JSON.parse(saved);
    updateListModal();
  }
}

// ===== MODAL =====
listBtn.addEventListener("click", () => {
  updateListModal();
  listModal.classList.remove("hidden");
  listModal.classList.add("flex");
});
closeModalBtn.addEventListener("click", () => {
  listModal.classList.add("hidden");
  listModal.classList.remove("flex");
});
listModal.addEventListener("click", (e) => {
  if (e.target === listModal) {
    listModal.classList.add("hidden");
    listModal.classList.remove("flex");
  }
});

// ===== FUNÇÃO DE DESCONTO PROGRESSIVO =====
function getDiscountedPrice(basePrice, unitNumber) {
  if (unitNumber === 1) return basePrice;         // 1ª unidade = preço cheio
  else if (unitNumber === 2) return basePrice * 0.5; // 2ª unidade = 50%
  else return basePrice * 0.1;                    // 3ª em diante = 10%
}

// ===== ADICIONAR ITEM =====
menu.addEventListener("click", (e) => {
  const button = e.target.closest(".add-to-cart-btn");
  if (button) {
    const container = button.closest("div");
    const input = container.querySelector("input");
    const error = container.querySelector("p.text-red-500");
    const quantity = parseInt(input.value);

    if (!input.value || isNaN(quantity) || quantity <= 0) {
      error.classList.remove("hidden");
      return;
    }
    error.classList.add("hidden");

    const name = button.dataset.name;
    const basePrice = parseFloat(button.dataset.price) || 0;

    if (!list[name]) list[name] = [];

    for (let i = 0; i < quantity; i++) {
      const unitNumber = list[name].length + 1;
      const finalPrice = getDiscountedPrice(basePrice, unitNumber);
      list[name].push({ name, basePrice, finalPrice });
    }

    updateListModal();
    saveList();
    input.value = "";
  }
});

// ===== ATUALIZAR TOTAL =====
function calculateTotal() {
  return Object.values(list).flat().reduce((sum, item) => sum + item.finalPrice, 0);
}

// ===== ATUALIZAR MODAL =====
function updateListModal() {
  listItemsContainer.innerHTML = "";
  const total = calculateTotal();

  Object.keys(list).forEach((name) => {
    const items = list[name];
    if (items.length === 0) return;

    const subtotal = items.reduce((s, it) => s + it.finalPrice, 0);
    const div = document.createElement("div");
    div.className = "flex flex-col md:flex-row md:items-center justify-between gap-2 border-b pb-2 mb-2";

    div.innerHTML = `
      <div>
        <p class="font-medium text-lg">${name}</p>
        <p class="text-sm text-gray-600">Qtd: ${items.length}</p>
        <p class="text-sm text-gray-600">Subtotal: ${subtotal.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</p>
      </div>
      <div class="flex flex-col items-end md:items-center gap-1">
        <button class="remove-from-list-btn bg-red-500 text-white px-2 py-1 rounded mt-1" data-name="${name}">Excluir</button>
      </div>`;
    listItemsContainer.appendChild(div);
  });

  listTotal.textContent = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  listCount.textContent = Object.values(list).flat().length;
}

// ===== REMOVER ITEM =====
listItemsContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-from-list-btn")) {
    const name = e.target.dataset.name;
    delete list[name];
    updateListModal();
    saveList();
  }
});

// ===== VALIDAÇÃO =====
nameInput.addEventListener("input", () => {
  if (nameInput.value.trim() !== "") {
    nameInput.classList.remove("border-red-500");
    nameWarn.classList.add("hidden");
  }
});
addressInput.addEventListener("input", () => {
  if (addressInput.value.trim() !== "") {
    addressInput.classList.remove("border-red-500");
    addressWarn.classList.add("hidden");
  }
});

// ===== ENVIAR PARA WHATSAPP =====
function enviarListaParaWhatsApp() {
  if (Object.values(list).flat().length === 0) {
    alert("Sua lista está vazia.");
    return;
  }

  const nomeCliente = nameInput.value.trim();
  if (nomeCliente.length < 3) {
    nameWarn.textContent = "Digite um nome com pelo menos 3 caracteres.";
    nameWarn.classList.remove("hidden");
    nameInput.classList.add("border-red-500");
    return;
  }

  const endereco = addressInput.value.trim();
  if (endereco.length < 5) {
    addressWarn.textContent = "Digite um endereço válido.";
    addressWarn.classList.remove("hidden");
    addressInput.classList.add("border-red-500");
    return;
  }

  let mensagem = `🛒 Pedido de: *${nomeCliente}*\n📍 Endereço: ${endereco}\n\n`;

  Object.keys(list).forEach(name => {
    const items = list[name];
    const subtotal = items.reduce((s, it) => s + it.finalPrice, 0);
    mensagem += `• ${name} - Qtd: ${items.length} - ${subtotal.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}\n`;
  });

  const total = calculateTotal();
  mensagem += `\n💰 Total: ${total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}`;

  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
}

// ===== FINALIZAR PEDIDO =====
checkoutBtn.addEventListener("click", () => {
  if (Object.values(list).flat().length === 0) return;

  enviarListaParaWhatsApp();

  // Resetar lista e formulário
  list = {};
  nameInput.value = "";
  addressInput.value = "";
  listCount.textContent = 0; 
  updateListModal();
  saveList();
  listModal.style.display = "none";
});

// ===== CARREGAR LISTA SALVA =====
loadList();
