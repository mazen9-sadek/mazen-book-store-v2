// ===============================
// تشغيل الصفحة الرئيسية
// ===============================

let siteSettings = DEFAULT_SETTINGS;
let allBooks = [];
let selectedGrade = "";

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
  renderGrades();
  renderCart();

  siteSettings = await getSettings();
  applySettings(siteSettings);

  await refreshBooks();

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", renderBooks);
  }
}

function applySettings(settings) {
  document.getElementById("libraryName").textContent = settings.libraryName;
  document.getElementById("workingHours").textContent = settings.workingHours;
  document.getElementById("hoursText").textContent = settings.workingHours;
  document.getElementById("address").textContent = settings.address;

  const whatsappLink = `https://wa.me/${settings.whatsapp}`;

  document.getElementById("whatsappHero").href = whatsappLink;
  document.getElementById("whatsappContact").href = whatsappLink;
}

async function refreshBooks() {
  const booksGrid = document.getElementById("booksGrid");

  booksGrid.innerHTML = `
    <div class="empty-state">
      جاري تحميل الكتب...
    </div>
  `;

  allBooks = await getBooks();
  renderBooks();
}

function renderGrades() {
  const gradesGrid = document.getElementById("gradesGrid");

  gradesGrid.innerHTML = GRADES.map(grade => `
    <div class="grade-card" onclick="selectGrade('${grade}')">
      <div class="icon">📘</div>
      <strong>${grade}</strong>
    </div>
  `).join("");
}

function selectGrade(grade) {
  selectedGrade = grade;

  document.querySelectorAll(".grade-card").forEach(card => {
    card.classList.toggle("active", card.textContent.includes(grade));
  });

  document.getElementById("booksTitle").textContent = `كتب ${grade}`;

  renderBooks();

  document.getElementById("booksTitle").scrollIntoView({
    behavior: "smooth"
  });
}

function renderBooks() {
  const booksGrid = document.getElementById("booksGrid");
  const searchText = document.getElementById("searchInput")?.value.trim().toLowerCase() || "";

  let books = allBooks.filter(book => {
    const available = String(book.available || "").trim() === "نعم";
    const matchGrade = selectedGrade ? book.grade === selectedGrade : true;

    const matchSearch =
      String(book.name).toLowerCase().includes(searchText) ||
      String(book.grade).toLowerCase().includes(searchText);

    return available && matchGrade && matchSearch;
  });

  if (books.length === 0) {
    booksGrid.innerHTML = `
      <div class="empty-state">
        لا توجد كتب للعرض حاليًا
      </div>
    `;
    return;
  }

  booksGrid.innerHTML = books.map(book => `
    <div class="book-card">
      <div class="book-image">
        ${renderBookImage(book)}
      </div>

      <div class="book-body">
        <span class="book-grade">${book.grade}</span>
        <h3>${book.name}</h3>
        <div class="book-price">${book.price} جنيه</div>

        <div class="book-actions">
          <button class="add-btn" onclick='addToCart(${JSON.stringify(book)})'>
            إضافة للسلة
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

function renderBookImage(book) {
  if (!book.image) {
    return `<div class="no-image">📕</div>`;
  }

  return `
    <img 
      src="${book.image}" 
      alt="${book.name}" 
      onerror="this.parentElement.innerHTML='<div class=&quot;no-image&quot;>📕</div>';"
    >
  `;
}

async function submitOrder() {
  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const notes = document.getElementById("customerNotes").value.trim();
  const result = document.getElementById("orderResult");

  if (!name || !phone) {
    alert("من فضلك اكتب الاسم ورقم الواتساب.");
    return;
  }

  if (cart.length === 0) {
    alert("السلة فارغة.");
    return;
  }

  result.textContent = "جاري إرسال الطلب...";

  const order = {
    name,
    phone,
    notes,
    items: cart,
    total: getCartTotal(),
    status: DEFAULT_ORDER_STATUS
  };

  const response = await createOrder(order);

  if (response.success) {
    result.innerHTML = `
      ✅ تم استلام طلبك بنجاح<br>
      رقم الطلب: <strong>${response.orderNumber}</strong><br>
      الإجمالي: <strong>${getCartTotal()} جنيه</strong><br>
      ${PREPARATION_TEXT}
    `;

    cart = [];
    saveCart();
    renderCart();

    document.getElementById("customerName").value = "";
    document.getElementById("customerPhone").value = "";
    document.getElementById("customerNotes").value = "";
  } else {
    result.textContent = response.message || "حدث خطأ أثناء إرسال الطلب.";
  }
}