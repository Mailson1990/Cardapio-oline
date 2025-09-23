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

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

// ===== PERSISTÊNCIA =====
function saveList() {
  localStorage.setItem("carrinho", JSON.stringify(list));
}

function loadList() {
  const saved = localStorage.getItem("carrinho");
  if (saved) {
    list = JSON.parse(saved);
    recalculateDiscounts();
    updateListModal();
  }
}

// ===== MODAL =====
function openModal() {
  updateListModal();
  listModal.classList.remove("hidden");
  listModal.classList.add("flex");
}

function closeModal() {
  listModal.classList.add("hidden");
  listModal.classList.remove("flex");
}

listBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
listModal.addEventListener("click", (e) => {
  if (e.target === listModal) closeModal();
});

// Fechar modal com ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ===== DESCONTO GLOBAL =====
function getDiscountedPrice(basePrice, globalUnitNumber) {
  if (globalUnitNumber === 1) return basePrice;      // 1ª unidade preço cheio
  else if (globalUnitNumber === 2) return basePrice * 0.5; // 2ª unidade 50%
  else return basePrice * 0.1;                       // 3ª em diante 10%
}

// ===== REAPLICAR DESCONTO GLOBAL =====
function recalculateDiscounts() {
  let allItems = Object.values(list).flat();
  let counter = 1;
  allItems.forEach((item) => {
    item.finalPrice = getDiscountedPrice(item.basePrice, counter);
    counter++;
  });
}

// ===== ADICIONAR ITEM =====
if (menu) {
  menu.addEventListener("click", (e) => {
    const button = e.target.closest(".add-to-cart-btn");
    if (!button) return;

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
      list[name].push({ name, basePrice, finalPrice: basePrice });
    }

    recalculateDiscounts();
    updateListModal();
    saveList();
    input.value = "";
  });
}

// ===== CALCULAR TOTAL =====
function calculateTotal() {
  return Object.values(list)
    .flat()
    .reduce((sum, item) => sum + item.finalPrice, 0);
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
        <p class="text-sm text-gray-600">Subtotal: ${subtotal.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="decrease-qty-btn bg-green-500 text-black px-4 py-2 rounded" data-name="${name}">-</button>
        <span class="px-2 font-bold">${items.length}</span>
        <button class="increase-qty-btn bg-green-500 text-black px-4 py-2 rounded" data-name="${name}">+</button>
        <button class="remove-from-list-btn bg-red-500 text-black px-4 py-2 rounded" data-name="${name}">Excluir</button>
      </div>`;
    
    listItemsContainer.appendChild(div);
  });

  listTotal.textContent = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  listCount.textContent = Object.values(list).flat().length;
}

// ===== EVENTOS DE BOTÕES DENTRO DO MODAL =====
listItemsContainer.addEventListener("click", (e) => {
  const name = e.target.dataset.name;
  if (!name) return;

  // EXCLUIR PRODUTO (todos de uma vez)
  if (e.target.classList.contains("remove-from-list-btn")) {
    delete list[name];
  }

  // DIMINUIR 1 ITEM
  if (e.target.classList.contains("decrease-qty-btn")) {
    if (list[name] && list[name].length > 0) {
      list[name].pop();
      if (list[name].length === 0) delete list[name];
    }
  }

  // AUMENTAR 1 ITEM
  if (e.target.classList.contains("increase-qty-btn")) {
    if (list[name]) {
      const item = list[name][0];
      list[name].push({ name, basePrice: item.basePrice, finalPrice: item.basePrice });
    }
  }

  recalculateDiscounts();
  updateListModal();
  saveList();
});

// ===== VALIDAÇÃO =====
function validateForm() {
  let valid = true;

  if (nameInput.value.trim().length < 3) {
    nameWarn.textContent = "Digite um nome com pelo menos 3 caracteres.";
    nameWarn.classList.remove("hidden");
    nameInput.classList.add("border-red-500");
    valid = false;
  } else {
    nameWarn.classList.add("hidden");
    nameInput.classList.remove("border-red-500");
  }

  if (addressInput.value.trim().length < 5) {
    addressWarn.textContent = "Digite um endereço válido.";
    addressWarn.classList.remove("hidden");
    addressInput.classList.add("border-red-500");
    valid = false;
  } else {
    addressWarn.classList.add("hidden");
    addressInput.classList.remove("border-red-500");
  }

  return valid;
}

nameInput.addEventListener("input", validateForm);
addressInput.addEventListener("input", validateForm);

// ===== ENVIAR PARA WHATSAPP =====
function enviarListaParaWhatsApp() {
  if (Object.values(list).flat().length === 0) {
    alert("Sua lista está vazia.");
    return false;
  }

  if (!validateForm()) return false;

  const nomeCliente = nameInput.value.trim();
  const endereco = addressInput.value.trim();

  let mensagem = `🛒 Pedido de: *${nomeCliente}*\n📍 Endereço: ${endereco}\n\n`;

  Object.keys(list).forEach((name) => {
    const items = list[name];
    const subtotal = items.reduce((s, it) => s + it.finalPrice, 0);
    mensagem += `• ${name} - Qtd: ${items.length} - ${subtotal.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}\n`;
  });

  const total = calculateTotal();
  mensagem += `\n💰 Total: ${total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}`;

  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");

  return true;
}

// ===== FINALIZAR PEDIDO =====
checkoutBtn.addEventListener("click", () => {
  if (Object.values(list).flat().length === 0) return;

  const enviado = enviarListaParaWhatsApp();
  if (!enviado) return;

  list = {};
  nameInput.value = "";
  addressInput.value = "";
  listCount.textContent = 0;
  updateListModal();
  saveList();
  closeModal();
});

// ===== CARREGAR LISTA SALVA =====
loadList();
