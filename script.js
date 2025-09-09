const menu = document.getElementById("lista");
const listBtn = document.getElementById("list-btn");
const listModal = document.getElementById("list-modal");
const listItemsContainer = document.getElementById("list-items");
const listTotal = document.getElementById("list-total");
const listCount = document.getElementById("list-count");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const nameInput = document.getElementById("name");
const endressInput = document.getElementById("endress"); 
const nameWarn = document.getElementById("name-warn");
const endressWarn = document.getElementById("endress-warn");

let list = [];
const whatsappNumber = "5511998680448"; // Seu número do WhatsApp

// ===== FUNÇÕES DE PERSISTÊNCIA =====
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

// ===== ABRIR O MODAL =====
listBtn.addEventListener("click", () => {
  updateListModal();
  listModal.style.display = "flex";
});

// ===== FECHAR O MODAL =====
listModal.addEventListener("click", (event) => {
  if (event.target === listModal) {
    listModal.style.display = "none";
  }
});
closeModalBtn.addEventListener("click", () => {
  listModal.style.display = "none";
});

// ===== ADICIONAR ITEM =====
menu.addEventListener("click", (event) => {
  const button = event.target.closest(".add-to-cart-btn");
  if (button) {
    const container = button.closest("div");
    const input = container.querySelector("input");
    const error = container.querySelector("p.text-red-500");

    const quantity = parseInt(input.value);

    if (!input.value || isNaN(quantity) || quantity <= 0) {
      error.classList.remove("hidden");
    } else {
      error.classList.add("hidden");

      const name = button.getAttribute("data-name");
      const price = parseFloat(button.getAttribute("data-price")) || 0;
      addToList(name, price, quantity);

      input.value = ""; // limpa input
    }
  }
});

// ===== ADICIONAR OU INCREMENTAR =====
function addToList(name, price, quantity = 1) {
  const existingItem = list.find(item => item.name === name);
  if (existingItem) {
    existingItem.quantity = Math.max(1, existingItem.quantity + quantity);
  } else {
    list.push({ name, price, quantity });
  }
  updateListModal();
  saveList();
}

// ===== ATUALIZAR LISTA =====
function updateListModal() {
  listItemsContainer.innerHTML = "";
  let total = 0;

  list.forEach(item => {
    const itemElement = document.createElement("div");
    itemElement.classList.add("flex", "justify-between", "mb-2", "flex-col");

    itemElement.innerHTML = `
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b pb-2">
        <div>
          <p class="font-medium text-lg">${item.name}</p>
          <p class="text-sm text-gray-600">Preço: R$ ${item.price.toFixed(2)}</p>
          <p class="text-sm text-gray-600">Subtotal: R$ ${(item.price * item.quantity).toFixed(2)}</p>
        </div>
        <div class="flex flex-col items-end md:items-center gap-1">
          <label class="text-sm text-gray-700">Qtd:</label>
          <input 
            type="number" 
            min="1" 
            class="w-20 border rounded px-2 py-1 text-center quantidade-input"
            data-name="${item.name}"
            value="${item.quantity}"
          />
          <button 
            class="remove-from-list-btn bg-red-500 text-white px-2 py-1 rounded mt-1"
            data-name="${item.name}">
            Excluir
          </button>
        </div>
      </div>
    `;

    total += item.price * item.quantity;
    listItemsContainer.appendChild(itemElement);
  });

  listTotal.textContent = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  const totalQuantity = list.reduce((sum, item) => sum + item.quantity, 0);
  listCount.textContent = totalQuantity;
}

// ===== REMOVER ITEM =====
listItemsContainer.addEventListener("click", (event) => {
  if (event.target.classList.contains("remove-from-list-btn")) {
    const name = event.target.getAttribute("data-name");
    removeItemFromList(name);
  }
});

function removeItemFromList(name) {
  list = list.filter(item => item.name !== name);
  updateListModal();
  saveList();
}

// ===== ATUALIZAR QUANTIDADE =====
listItemsContainer.addEventListener("change", (event) => {
  if (event.target.classList.contains("quantidade-input")) {
    const name = event.target.getAttribute("data-name");
    const newQuantity = parseInt(event.target.value);

    const item = list.find(item => item.name === name);
    if (item) {
      if (newQuantity >= 1) {
        item.quantity = newQuantity;
      } else {
        removeItemFromList(name); 
      }
      updateListModal();
      saveList();
    }
  }
});

// ===== VALIDAÇÃO DO NOME =====
nameInput.addEventListener("input", () => {
  if (nameInput.value.trim() !== "") {
    nameInput.classList.remove("border-red-500");
    nameWarn.classList.add("hidden");
  }
});

// ===== VALIDAÇÃO DO ENDEREÇO =====
endressInput.addEventListener("input", () => {
  if (endressInput.value.trim() !== "") {
    endressInput.classList.remove("border-red-500");
    endressWarn.classList.add("hidden");
  }
});

// ===== ENVIAR PARA WHATSAPP =====
function enviarListaParaWhatsApp() {
  if (list.length === 0) {
    alert("Sua lista está vazia.");
    return false;
  }

  const nomeCliente = nameInput.value.trim();
  if (nomeCliente.length < 3) {
    nameWarn.textContent = "Digite um nome com pelo menos 3 caracteres.";
    nameWarn.classList.remove("hidden");
    nameInput.classList.add("border-red-500");
    return false;
  }

  const endereco = endressInput.value.trim();
  if (endereco === "") {
    endressInput.classList.add("border-red-500");
    endressWarn.classList.remove("hidden");
    return false;
  }

  let mensagem = `🛒 Pedido de: *${nomeCliente}*\n📍 Endereço: ${endereco}\n\n`;

  list.forEach(item => {
    mensagem += `• ${item.name} - Qtd: ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
  });

  const total = list.reduce((sum, item) => sum + item.price * item.quantity, 0);
  mensagem += `\n💰 Total: R$ ${total.toFixed(2)}`;

  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");

  alert("✅ Pedido enviado para o WhatsApp!");
  return true;
}

// ===== FINALIZAR PEDIDO =====
checkoutBtn.addEventListener("click", () => {
  if (enviarListaParaWhatsApp()) {
    // só limpa se enviado com sucesso
    list = [];
    nameInput.value = "";
    endressInput.value = "";
    listCount.textContent = 0; 
    updateListModal();
    saveList();
    listModal.style.display = "none";
  }
});

// ===== CARREGAR LISTA SALVA =====
loadList();



