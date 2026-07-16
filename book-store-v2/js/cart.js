// ===============================
// إدارة السلة
// ===============================

let cart = loadCart();

function loadCart() {
  const savedCart = localStorage.getItem(CART_STORAGE_KEY);

  if (!savedCart) {
    return [];
  }

  try {
    return JSON.parse(savedCart);
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function addToCart(book) {
  const existingItem = cart.find(item =>
    item.grade === book.grade && item.name === book.name
  );

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({
      grade: book.grade,
      name: book.name,
      price: Number(book.price),
      image: book.image || "",
      qty: 1
    });
  }

  saveCart();
  renderCart();
}

function increaseQty(index) {
  cart[index].qty += 1;
  saveCart();
  renderCart();
}

function decreaseQty(index) {
  cart[index].qty -= 1;

  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }

  saveCart();
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

function clearCart() {
  if (cart.length === 0) return;

  const confirmClear = confirm("هل تريد إفراغ السلة؟");

  if (!confirmClear) return;

  cart = [];
  saveCart();
  renderCart();
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCart() {
  const cartCount = document.getElementById("cartCount");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  if (!cartCount || !cartItems || !cartTotal) return;

  cartCount.textContent = getCartCount();
  cartTotal.textContent = `${getCartTotal()} جنيه`;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-state">
        السلة فارغة حاليًا
      </div>
    `;
    return;
  }

  cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <h4>${item.name}</h4>
      <small>${item.grade}</small>

      <div class="cart-row">
        <div>
          <strong>${item.price} جنيه</strong>
          <small> × ${item.qty}</small>
        </div>

        <div>
          <button class="qty-btn" onclick="decreaseQty(${index})">-</button>
          <button class="qty-btn" onclick="increaseQty(${index})">+</button>
        </div>
      </div>

      <div class="cart-row">
        <strong>${item.price * item.qty} جنيه</strong>
        <button class="delete-btn" onclick="removeFromCart(${index})">حذف</button>
      </div>
    </div>
  `).join("");
}

function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("overlay").classList.add("show");
}

function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}

function openCheckout() {
  if (cart.length === 0) {
    alert("السلة فارغة.");
    return;
  }

  document.getElementById("checkoutModal").classList.add("show");
}

function closeCheckout() {
  document.getElementById("checkoutModal").classList.remove("show");
}