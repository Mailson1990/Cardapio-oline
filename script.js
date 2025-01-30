const menu = document.getElementById("menu")
const cartBtn = document.getElementById("cart-btn")
const cartModal = document.getElementById("cart-modal")
const cartItensContainer = document.getElementById("cart-itens")
const cartTotal = document.getElementById("cart-total")
const checkoutBtn = document.getElementById("checkout-btn")
const closeModalBtn = document.getElementById("close-modal-btn")
const cartCounter = document.getElementById("cart-count")
const nameInput = document.getElementById("name")
const nameWarn = document.getElementById("name-warn")

let cart = []

cartBtn.addEventListener("click", function() {
    cartModal.style.display = "flex"
})

cartModal.addEventListener("click", function(event) {
if(event.target === cartModal){
    cartModal.style.display = "none"
}

})
closeModalBtn.addEventListener("click", function() {
    cartModal.style.display = "none"
})

menu.addEventListener("click", function(event) {
let parentButton = event.target.closest(".add-to-cart-btn")
if(parentButton){
    const name = parentButton.getAttribute("data-name")
    const price = parseFloat(parentButton.getAttribute("data-price"))
    
    addToCart(name, price)

}
})

function addToCart(name, price){
const existingItem = cart.find(item => item.name === name)
if(existingItem){
existingItem.quantity +=1;
}else{

cart.push({
name,
price,
quantity: 1,

})
}
updateCartModal()

}

function updateCartModal(){
cartItensContainer.innerHTML = "";
let total = 0;

cart.forEach(item => {
const cartItemElement = document.createElement("div");

cartItemElement.innerHTML =`
<div>
   <div>
   <p>${item.name}</p>
   <p>${item.quantity}</p>
   <p>${item.price}</p>
</div>

<div>
  <button>
   Remover
  </button>
</div>
</div>
`
cartItensContainer.appendChild(cartItemElement)

})

}
