let dashboardData = null;
let adminBooks = [];

const ORDER_STATUSES = [
  "جديد",
  "جاري التجهيز",
  "جاهز",
  "تم التسليم",
  "ملغي"
];

document.addEventListener("DOMContentLoaded", initAdmin);

async function initAdmin() {
  if (isAdminLoggedIn()) {
    showDashboard();
  }
}

async function showDashboard() {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");

  dashboardData = await getDashboard();
  adminBooks = await getBooks();

  if (!dashboardData) {
    alert("تعذر تحميل بيانات لوحة التحكم");
    return;
  }

  renderStats();
  renderTopBooks();
  renderTopGrades();
  renderOrders();

  fillGradesSelect();
  renderBooksTable();

  const ordersSearch = document.getElementById("ordersSearch");
  if (ordersSearch) {
    ordersSearch.addEventListener("input", renderOrders);
  }

  const booksSearch = document.getElementById("booksSearch");
  if (booksSearch) {
    booksSearch.addEventListener("input", renderBooksTable);
  }
}

function renderStats() {
  document.getElementById("totalOrders").textContent = dashboardData.totalOrders;
  document.getElementById("totalSales").textContent = `${dashboardData.totalSales} جنيه`;
  document.getElementById("totalBooks").textContent = dashboardData.totalBooks;
  document.getElementById("totalCustomers").textContent = dashboardData.totalCustomers;
}

function renderTopBooks() {
  renderRankList("topBooks", dashboardData.topBooks);
}

function renderTopGrades() {
  renderRankList("topGrades", dashboardData.topGrades);
}

function renderRankList(elementId, items) {
  const element = document.getElementById(elementId);

  if (!items || items.length === 0) {
    element.innerHTML = "<p>لا توجد بيانات بعد</p>";
    return;
  }

  const max = Math.max(...items.map(item => item.count));

  element.innerHTML = items.map((item, index) => {
    const percent = max ? (item.count / max) * 100 : 0;

    return `
      <div class="rank-item">
        <div class="rank-top">
          <strong>${index + 1}. ${item.name}</strong>
          <span>${item.count}</span>
        </div>
        <div class="bar">
          <span style="width:${percent}%"></span>
        </div>
      </div>
    `;
  }).join("");
}

function renderOrders() {
  const tbody = document.getElementById("ordersTable");
  const searchText = document.getElementById("ordersSearch")?.value.trim().toLowerCase() || "";

  let orders = dashboardData.orders || [];

  if (searchText) {
    orders = orders.filter(order =>
      String(order.orderNumber).toLowerCase().includes(searchText) ||
      String(order.name).toLowerCase().includes(searchText) ||
      String(order.phone).toLowerCase().includes(searchText)
    );
  }

  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">لا توجد طلبات</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td>${order.orderNumber}</td>
      <td>${order.date}</td>
      <td>${order.name}</td>
      <td>${order.phone}</td>
      <td>${order.total} جنيه</td>
      <td>
        <select class="status-select" onchange="changeOrderStatus('${order.orderNumber}', this.value)">
          ${ORDER_STATUSES.map(status => `
            <option value="${status}" ${status === order.status ? "selected" : ""}>
              ${status}
            </option>
          `).join("")}
        </select>
      </td>
    </tr>
  `).join("");
}

async function changeOrderStatus(orderNumber, newStatus) {
  const result = await updateOrderStatus(orderNumber, newStatus);

  if (!result.success) {
    alert(result.message || "حدث خطأ أثناء تحديث الحالة");
    return;
  }

  const order = dashboardData.orders.find(item => item.orderNumber === orderNumber);

  if (order) {
    order.status = newStatus;
  }

  alert("تم تحديث حالة الطلب ✅");
}

function fillGradesSelect() {
  const select = document.getElementById("bookGrade");

  select.innerHTML = `
    <option value="">اختر الصف</option>
    ${GRADES.map(grade => `
      <option value="${grade}">${grade}</option>
    `).join("")}
  `;
}

function renderBooksTable() {
  const tbody = document.getElementById("booksTable");
  const searchText = document.getElementById("booksSearch")?.value.trim().toLowerCase() || "";

  let books = adminBooks || [];

  if (searchText) {
    books = books.filter(book =>
      String(book.name).toLowerCase().includes(searchText) ||
      String(book.grade).toLowerCase().includes(searchText)
    );
  }

  if (books.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">لا توجد كتب</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = books.map(book => `
    <tr>
      <td>${book.grade}</td>
      <td>${book.name}</td>
      <td>${book.price} جنيه</td>
      <td>
        <span class="status">${book.available === "نعم" ? "متاح" : "غير متاح"}</span>
      </td>
      <td>
        <button class="small-btn" onclick='editBook(${JSON.stringify(book)})'>تعديل</button>
      </td>
      <td>
        <button class="danger-btn" onclick="removeBook(${book.rowIndex})">حذف</button>
      </td>
    </tr>
  `).join("");
}

async function saveBook() {
  const rowIndex = document.getElementById("bookRowIndex").value;
  const grade = document.getElementById("bookGrade").value;
  const name = document.getElementById("bookName").value.trim();
  const price = document.getElementById("bookPrice").value;
  const image = document.getElementById("bookImage").value.trim();
  const available = document.getElementById("bookAvailable").value;

  if (!grade || !name) {
    alert("من فضلك اختار الصف واكتب اسم الكتاب.");
    return;
  }

  const book = {
    rowIndex,
    grade,
    name,
    price,
    image,
    available
  };

  const result = rowIndex
    ? await updateBook(book)
    : await addBook(book);

  if (!result.success) {
    alert(result.message || "حدث خطأ أثناء حفظ الكتاب");
    return;
  }

  alert(rowIndex ? "تم تعديل الكتاب ✅" : "تم إضافة الكتاب ✅");

  resetBookForm();

  adminBooks = await getBooks();
  renderBooksTable();
}

function editBook(book) {
  document.getElementById("bookRowIndex").value = book.rowIndex;
  document.getElementById("bookGrade").value = book.grade;
  document.getElementById("bookName").value = book.name;
  document.getElementById("bookPrice").value = book.price;
  document.getElementById("bookImage").value = book.image || "";
  document.getElementById("bookAvailable").value = book.available || "نعم";

  document.getElementById("saveBookBtn").textContent = "حفظ التعديل";

  document.getElementById("bookGrade").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

function resetBookForm() {
  document.getElementById("bookRowIndex").value = "";
  document.getElementById("bookGrade").value = "";
  document.getElementById("bookName").value = "";
  document.getElementById("bookPrice").value = "";
  document.getElementById("bookImage").value = "";
  document.getElementById("bookAvailable").value = "نعم";
  document.getElementById("saveBookBtn").textContent = "إضافة كتاب";
}

async function removeBook(rowIndex) {
  const confirmDelete = confirm("هل أنت متأكد من حذف هذا الكتاب؟");

  if (!confirmDelete) return;

  const result = await deleteBook(rowIndex);

  if (!result.success) {
    alert(result.message || "حدث خطأ أثناء حذف الكتاب");
    return;
  }

  alert("تم حذف الكتاب ✅");

  adminBooks = await getBooks();
  renderBooksTable();
}