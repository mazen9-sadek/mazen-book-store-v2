// ===============================
// متغيرات لوحة الإدارة
// ===============================

let dashboardData = null;
let adminBooks = [];

let dailySalesChartInstance = null;
let monthlyOrdersChartInstance = null;
let gradesDistributionChartInstance = null;

const ORDER_STATUSES = [
  "جديد",
  "جاري التجهيز",
  "جاهز",
  "تم التسليم",
  "ملغي"
];

document.addEventListener("DOMContentLoaded", initAdmin);


// ===============================
// تشغيل لوحة الإدارة
// ===============================

async function initAdmin() {
  if (isAdminLoggedIn()) {
    await showDashboard();
  }
}

async function showDashboard() {
  document
    .getElementById("loginScreen")
    .classList.add("hidden");

  document
    .getElementById("dashboard")
    .classList.remove("hidden");

  setupAdminEvents();

  await loadAdminData();
}

function setupAdminEvents() {
  const ordersSearch =
    document.getElementById("ordersSearch");

  if (ordersSearch && !ordersSearch.dataset.listenerAdded) {
    ordersSearch.addEventListener(
      "input",
      renderOrders
    );

    ordersSearch.dataset.listenerAdded = "true";
  }

  const booksSearch =
    document.getElementById("booksSearch");

  if (booksSearch && !booksSearch.dataset.listenerAdded) {
    booksSearch.addEventListener(
      "input",
      renderBooksTable
    );

    booksSearch.dataset.listenerAdded = "true";
  }
}

async function loadAdminData() {
  dashboardData = await getDashboard();
  adminBooks = await getBooks();

  if (!dashboardData) {
    alert("تعذر تحميل بيانات لوحة التحكم");
    return;
  }

  renderAllAdminData();
}

function renderAllAdminData() {
  renderStats();

  renderTopBooks();
  renderTopGrades();

  renderOrders();

  fillGradesSelect();
  renderBooksTable();

  renderDashboardCharts();
}


// ===============================
// تحديث البيانات
// ===============================

async function refreshAdminDashboard() {
  const refreshButton =
    document.querySelector(".refresh-btn");

  if (refreshButton) {
    refreshButton.disabled = true;
    refreshButton.textContent = "⏳ جاري التحديث...";
  }

  try {
    await loadAdminData();
  } catch (error) {
    console.error(error);

    alert("حدث خطأ أثناء تحديث البيانات");
  } finally {
    if (refreshButton) {
      refreshButton.disabled = false;
      refreshButton.textContent = "🔄 تحديث البيانات";
    }
  }
}


// ===============================
// التبويبات
// ===============================

function openAdminTab(tabName, clickedButton) {
  document
    .querySelectorAll(".admin-tab-content")
    .forEach(section => {
      section.classList.remove("active");
    });

  document
    .querySelectorAll(".admin-tab")
    .forEach(button => {
      button.classList.remove("active");
    });

  const selectedTab =
    document.getElementById(`${tabName}Tab`);

  if (selectedTab) {
    selectedTab.classList.add("active");
  }

  if (clickedButton) {
    clickedButton.classList.add("active");
  }

  if (tabName === "overview") {
    setTimeout(() => {
      resizeDashboardCharts();
    }, 150);
  }
}


// ===============================
// بطاقات الإحصائيات
// ===============================

function renderStats() {
  document.getElementById("totalOrders").textContent =
    dashboardData.totalOrders;

  document.getElementById("totalSales").textContent =
    `${formatNumber(dashboardData.totalSales)} جنيه`;

  document.getElementById("totalBooks").textContent =
    dashboardData.totalBooks;

  document.getElementById("totalCustomers").textContent =
    dashboardData.totalCustomers;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("ar-EG");
}


// ===============================
// أكثر الكتب والصفوف
// ===============================

function renderTopBooks() {
  renderRankList(
    "topBooks",
    dashboardData.topBooks
  );
}

function renderTopGrades() {
  renderRankList(
    "topGrades",
    dashboardData.topGrades
  );
}

function renderRankList(elementId, items) {
  const element =
    document.getElementById(elementId);

  if (!element) {
    return;
  }

  if (!items || items.length === 0) {
    element.innerHTML =
      "<p>لا توجد بيانات بعد</p>";

    return;
  }

  const max = Math.max(
    ...items.map(item => item.count)
  );

  element.innerHTML = items
    .map((item, index) => {
      const percent =
        max
          ? (item.count / max) * 100
          : 0;

      return `
        <div class="rank-item">

          <div class="rank-top">
            <strong>
              ${index + 1}. ${escapeHtml(item.name)}
            </strong>

            <span>
              ${formatNumber(item.count)}
            </span>
          </div>

          <div class="bar">
            <span style="width:${percent}%"></span>
          </div>

        </div>
      `;
    })
    .join("");
}


// ===============================
// الطلبات
// ===============================

function renderOrders() {
  const tbody =
    document.getElementById("ordersTable");

  if (!tbody || !dashboardData) {
    return;
  }

  const searchText =
    document
      .getElementById("ordersSearch")
      ?.value
      .trim()
      .toLowerCase() || "";

  const statusFilter =
    document
      .getElementById("ordersStatusFilter")
      ?.value || "";

  let orders =
    dashboardData.orders || [];

  if (searchText) {
    orders = orders.filter(order =>
      String(order.orderNumber || "")
        .toLowerCase()
        .includes(searchText) ||

      String(order.name || "")
        .toLowerCase()
        .includes(searchText) ||

      String(order.phone || "")
        .toLowerCase()
        .includes(searchText)
    );
  }

  if (statusFilter) {
    orders = orders.filter(order =>
      String(order.status || "") === statusFilter
    );
  }

  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          لا توجد طلبات مطابقة
        </td>
      </tr>
    `;

    return;
  }

  tbody.innerHTML = orders
    .map(order => `
      <tr>

        <td>
          ${escapeHtml(order.orderNumber)}
        </td>

        <td>
          ${escapeHtml(order.date)}
        </td>

        <td>
          ${escapeHtml(order.name)}
        </td>

        <td>
          <a
            href="https://wa.me/${normalizeWhatsAppNumber(order.phone)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            ${escapeHtml(order.phone)}
          </a>
        </td>

        <td>
          ${formatNumber(order.total)} جنيه
        </td>

        <td>
          <select
            class="status-select"
            onchange="changeOrderStatus(
              '${escapeAttribute(order.orderNumber)}',
              this.value
            )"
          >

            ${ORDER_STATUSES.map(status => `
              <option
                value="${status}"
                ${
                  status === order.status
                    ? "selected"
                    : ""
                }
              >
                ${status}
              </option>
            `).join("")}

          </select>
        </td>

      </tr>
    `)
    .join("");
}

async function changeOrderStatus(
  orderNumber,
  newStatus
) {
  const result =
    await updateOrderStatus(
      orderNumber,
      newStatus
    );

  if (!result.success) {
    alert(
      result.message ||
      "حدث خطأ أثناء تحديث الحالة"
    );

    renderOrders();
    return;
  }

  const order =
    dashboardData.orders.find(
      item =>
        item.orderNumber === orderNumber
    );

  if (order) {
    order.status = newStatus;
  }

  alert("تم تحديث حالة الطلب ✅");
}

function normalizeWhatsAppNumber(phone) {
  const digits =
    String(phone || "")
      .replace(/\D/g, "");

  if (digits.startsWith("20")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `20${digits.slice(1)}`;
  }

  return digits;
}


// ===============================
// الرسوم البيانية
// ===============================

function renderDashboardCharts() {
  if (typeof Chart === "undefined") {
    console.warn("Chart.js لم يتم تحميلها");
    return;
  }

  renderDailySalesChart();
  renderMonthlyOrdersChart();
  renderGradesDistributionChart();
}

function renderDailySalesChart() {
  const canvas =
    document.getElementById("dailySalesChart");

  if (!canvas) {
    return;
  }

  const dailyData =
    buildDailySalesData(
      dashboardData.orders || [],
      7
    );

  if (dailySalesChartInstance) {
    dailySalesChartInstance.destroy();
  }

  dailySalesChartInstance = new Chart(
    canvas,
    {
      type: "line",

      data: {
        labels: dailyData.labels,

        datasets: [
          {
            label: "المبيعات بالجنيه",
            data: dailyData.values,
            borderWidth: 3,
            tension: 0.35,
            fill: true
          }
        ]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            display: true,
            position: "bottom"
          },

          tooltip: {
            callbacks: {
              label(context) {
                return `${formatNumber(context.raw)} جنيه`;
              }
            }
          }
        },

        scales: {
          y: {
            beginAtZero: true,

            ticks: {
              callback(value) {
                return formatNumber(value);
              }
            }
          }
        }
      }
    }
  );
}

function renderMonthlyOrdersChart() {
  const canvas =
    document.getElementById("monthlyOrdersChart");

  if (!canvas) {
    return;
  }

  const monthlyData =
    buildMonthlyOrdersData(
      dashboardData.orders || [],
      6
    );

  if (monthlyOrdersChartInstance) {
    monthlyOrdersChartInstance.destroy();
  }

  monthlyOrdersChartInstance = new Chart(
    canvas,
    {
      type: "bar",

      data: {
        labels: monthlyData.labels,

        datasets: [
          {
            label: "عدد الطلبات",
            data: monthlyData.values,
            borderWidth: 1,
            borderRadius: 8
          }
        ]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            display: true,
            position: "bottom"
          }
        },

        scales: {
          y: {
            beginAtZero: true,

            ticks: {
              precision: 0
            }
          }
        }
      }
    }
  );
}

function renderGradesDistributionChart() {
  const canvas =
    document.getElementById("gradesDistributionChart");

  if (!canvas) {
    return;
  }

  const gradeData =
    buildGradesDistributionData(
      dashboardData.orders || []
    );

  if (gradesDistributionChartInstance) {
    gradesDistributionChartInstance.destroy();
  }

  gradesDistributionChartInstance = new Chart(
    canvas,
    {
      type: "doughnut",

      data: {
        labels: gradeData.labels,

        datasets: [
          {
            label: "عدد الكتب المطلوبة",
            data: gradeData.values,
            borderWidth: 2
          }
        ]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            display: true,
            position: "bottom",

            labels: {
              boxWidth: 15,
              padding: 15
            }
          }
        }
      }
    }
  );
}

function resizeDashboardCharts() {
  if (dailySalesChartInstance) {
    dailySalesChartInstance.resize();
  }

  if (monthlyOrdersChartInstance) {
    monthlyOrdersChartInstance.resize();
  }

  if (gradesDistributionChartInstance) {
    gradesDistributionChartInstance.resize();
  }
}


// ===============================
// تجهيز بيانات المبيعات اليومية
// ===============================

function buildDailySalesData(orders, numberOfDays) {
  const labels = [];
  const values = [];
  const totalsByDate = {};

  orders.forEach(order => {
    const dateKey =
      extractDateKey(order.date);

    if (!dateKey) {
      return;
    }

    totalsByDate[dateKey] =
      (totalsByDate[dateKey] || 0) +
      (Number(order.total) || 0);
  });

  for (
    let index = numberOfDays - 1;
    index >= 0;
    index--
  ) {
    const date = new Date();

    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - index);

    const dateKey =
      formatDateKey(date);

    labels.push(
      date.toLocaleDateString(
        "ar-EG",
        {
          day: "numeric",
          month: "short"
        }
      )
    );

    values.push(
      totalsByDate[dateKey] || 0
    );
  }

  return {
    labels,
    values
  };
}


// ===============================
// تجهيز بيانات الطلبات الشهرية
// ===============================

function buildMonthlyOrdersData(
  orders,
  numberOfMonths
) {
  const labels = [];
  const values = [];
  const ordersByMonth = {};

  orders.forEach(order => {
    const date =
      parseOrderDate(order.date);

    if (!date) {
      return;
    }

    const monthKey =
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

    ordersByMonth[monthKey] =
      (ordersByMonth[monthKey] || 0) + 1;
  });

  for (
    let index = numberOfMonths - 1;
    index >= 0;
    index--
  ) {
    const date = new Date();

    date.setDate(1);
    date.setMonth(
      date.getMonth() - index
    );

    const monthKey =
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

    labels.push(
      date.toLocaleDateString(
        "ar-EG",
        {
          month: "long",
          year: "numeric"
        }
      )
    );

    values.push(
      ordersByMonth[monthKey] || 0
    );
  }

  return {
    labels,
    values
  };
}


// ===============================
// تجهيز توزيع الطلبات حسب الصف
// ===============================

function buildGradesDistributionData(orders) {
  const gradeStats = {};

  orders.forEach(order => {
    const items =
      parseOrderItemsForCharts(
        order.itemsText
      );

    items.forEach(item => {
      const grade =
        item.grade || "غير محدد";

      const quantity =
        Number(item.qty) || 1;

      gradeStats[grade] =
        (gradeStats[grade] || 0) +
        quantity;
    });
  });

  const sortedGrades =
    Object.entries(gradeStats)
      .sort((a, b) => b[1] - a[1]);

  if (sortedGrades.length === 0) {
    return {
      labels: ["لا توجد بيانات"],
      values: [1]
    };
  }

  return {
    labels: sortedGrades.map(
      item => item[0]
    ),

    values: sortedGrades.map(
      item => item[1]
    )
  };
}

function parseOrderItemsForCharts(itemsText) {
  return String(itemsText || "")
    .split("|")
    .map(itemText => {
      const text =
        itemText.trim();

      if (!text) {
        return null;
      }

      const quantityMatch =
        text.match(/×\s*(\d+)/);

      const qty =
        quantityMatch
          ? Number(quantityMatch[1])
          : 1;

      const cleanText =
        text
          .replace(/×\s*\d+/, "")
          .trim();

      const separatorIndex =
        cleanText.indexOf(" - ");

      if (separatorIndex === -1) {
        return {
          grade: "غير محدد",
          qty
        };
      }

      return {
        grade:
          cleanText
            .slice(0, separatorIndex)
            .trim(),

        qty
      };
    })
    .filter(Boolean);
}


// ===============================
// التعامل مع التاريخ
// ===============================

function extractDateKey(dateValue) {
  const date =
    parseOrderDate(dateValue);

  if (!date) {
    return "";
  }

  return formatDateKey(date);
}

function parseOrderDate(dateValue) {
  const text =
    String(dateValue || "").trim();

  if (!text) {
    return null;
  }

  const match =
    text.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2}))?/
    );

  if (!match) {
    return null;
  }

  const year =
    Number(match[1]);

  const month =
    Number(match[2]) - 1;

  const day =
    Number(match[3]);

  const hour =
    Number(match[4] || 0);

  const minute =
    Number(match[5] || 0);

  const date =
    new Date(
      year,
      month,
      day,
      hour,
      minute
    );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatDateKey(date) {
  const year =
    date.getFullYear();

  const month =
    String(date.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(date.getDate())
      .padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// ===============================
// تصدير الطلبات إلى Excel
// ===============================

function exportOrdersToExcel() {
  if (typeof XLSX === "undefined") {
    alert(
      "تعذر تحميل مكتبة Excel. تأكد من اتصال الإنترنت ثم أعد تحميل الصفحة."
    );

    return;
  }

  if (
    !dashboardData ||
    !Array.isArray(dashboardData.orders) ||
    dashboardData.orders.length === 0
  ) {
    alert("لا توجد طلبات لتصديرها.");

    return;
  }

  const excelRows =
    dashboardData.orders.map(
      (order, index) => ({
        "م":
          index + 1,

        "رقم الطلب":
          safeExcelText(
            order.orderNumber
          ),

        "التاريخ":
          safeExcelText(
            order.date
          ),

        "اسم العميل":
          safeExcelText(
            order.name
          ),

        "رقم الواتساب":
          safeExcelText(
            order.phone
          ),

        "محتويات الطلب":
          safeExcelText(
            order.itemsText
          ),

        "الملاحظات":
          safeExcelText(
            order.notes
          ),

        "الإجمالي بالجنيه":
          Number(order.total) || 0,

        "حالة الطلب":
          safeExcelText(
            order.status
          )
      })
    );

  const worksheet =
    XLSX.utils.json_to_sheet(
      excelRows
    );

  worksheet["!cols"] = [
    { wch: 7 },
    { wch: 16 },
    { wch: 22 },
    { wch: 24 },
    { wch: 18 },
    { wch: 60 },
    { wch: 35 },
    { wch: 18 },
    { wch: 18 }
  ];

  worksheet["!autofilter"] = {
    ref: worksheet["!ref"]
  };

  worksheet["!views"] = [
    {
      rightToLeft: true
    }
  ];

  const workbook =
    XLSX.utils.book_new();

  workbook.Workbook = {
    Views: [
      {
        RTL: true
      }
    ]
  };

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "الطلبات"
  );

  const fileName =
    `طلبات-مكتبة-مازن-${getExportDate()}.xlsx`;

  XLSX.writeFile(
    workbook,
    fileName
  );
}

function safeExcelText(value) {
  let text =
    String(value || "").trim();

  if (/^[=+\-@]/.test(text)) {
    text = "'" + text;
  }

  return text;
}

function getExportDate() {
  const date =
    new Date();

  const year =
    date.getFullYear();

  const month =
    String(date.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(date.getDate())
      .padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// ===============================
// قائمة الصفوف
// ===============================

function fillGradesSelect() {
  const select =
    document.getElementById("bookGrade");

  if (!select) {
    return;
  }

  const currentValue =
    select.value;

  select.innerHTML = `
    <option value="">
      اختر الصف
    </option>

    ${GRADES.map(grade => `
      <option value="${grade}">
        ${grade}
      </option>
    `).join("")}
  `;

  if (
    currentValue &&
    GRADES.includes(currentValue)
  ) {
    select.value = currentValue;
  }
}


// ===============================
// جدول الكتب
// ===============================

function renderBooksTable() {
  const tbody =
    document.getElementById("booksTable");

  if (!tbody) {
    return;
  }

  const searchText =
    document
      .getElementById("booksSearch")
      ?.value
      .trim()
      .toLowerCase() || "";

  let books =
    adminBooks || [];

  if (searchText) {
    books = books.filter(book =>
      String(book.name || "")
        .toLowerCase()
        .includes(searchText) ||

      String(book.grade || "")
        .toLowerCase()
        .includes(searchText)
    );
  }

  if (books.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          لا توجد كتب
        </td>
      </tr>
    `;

    return;
  }

  tbody.innerHTML = books
    .map(book => `
      <tr>

        <td>
          ${escapeHtml(book.grade)}
        </td>

        <td>
          ${escapeHtml(book.name)}
        </td>

        <td>
          ${formatNumber(book.price)} جنيه
        </td>

        <td>
          <span class="status">
            ${
              book.available === "نعم"
                ? "متاح"
                : "غير متاح"
            }
          </span>
        </td>

        <td>
          <button
            class="small-btn"
            onclick='editBook(
              ${JSON.stringify(book)}
            )'
          >
            تعديل
          </button>
        </td>

        <td>
          <button
            class="danger-btn"
            onclick="removeBook(
              ${book.rowIndex}
            )"
          >
            حذف
          </button>
        </td>

      </tr>
    `)
    .join("");
}


// ===============================
// إضافة وتعديل الكتب
// ===============================

async function saveBook() {
  const rowIndex =
    document
      .getElementById("bookRowIndex")
      .value;

  const grade =
    document
      .getElementById("bookGrade")
      .value;

  const name =
    document
      .getElementById("bookName")
      .value
      .trim();

  const price =
    document
      .getElementById("bookPrice")
      .value;

  const image =
    document
      .getElementById("bookImage")
      .value
      .trim();

  const available =
    document
      .getElementById("bookAvailable")
      .value;

  if (!grade || !name) {
    alert(
      "من فضلك اختار الصف واكتب اسم الكتاب."
    );

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

  const result =
    rowIndex
      ? await updateBook(book)
      : await addBook(book);

  if (!result.success) {
    alert(
      result.message ||
      "حدث خطأ أثناء حفظ الكتاب"
    );

    return;
  }

  alert(
    rowIndex
      ? "تم تعديل الكتاب ✅"
      : "تم إضافة الكتاب ✅"
  );

  resetBookForm();

  adminBooks =
    await getBooks();

  renderBooksTable();
}

function editBook(book) {
  document
    .getElementById("bookRowIndex")
    .value = book.rowIndex;

  document
    .getElementById("bookGrade")
    .value = book.grade;

  document
    .getElementById("bookName")
    .value = book.name;

  document
    .getElementById("bookPrice")
    .value = book.price;

  document
    .getElementById("bookImage")
    .value = book.image || "";

  document
    .getElementById("bookAvailable")
    .value = book.available || "نعم";

  document
    .getElementById("saveBookBtn")
    .textContent = "حفظ التعديل";

  const booksTabButton =
    document.querySelector(
      '.admin-tab[data-tab="books"]'
    );

  openAdminTab(
    "books",
    booksTabButton
  );

  document
    .getElementById("bookGrade")
    .scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
}

function resetBookForm() {
  document
    .getElementById("bookRowIndex")
    .value = "";

  document
    .getElementById("bookGrade")
    .value = "";

  document
    .getElementById("bookName")
    .value = "";

  document
    .getElementById("bookPrice")
    .value = "";

  document
    .getElementById("bookImage")
    .value = "";

  document
    .getElementById("bookAvailable")
    .value = "نعم";

  document
    .getElementById("saveBookBtn")
    .textContent = "إضافة كتاب";
}


// ===============================
// حذف الكتب
// ===============================

async function removeBook(rowIndex) {
  const confirmDelete =
    confirm(
      "هل أنت متأكد من حذف هذا الكتاب؟"
    );

  if (!confirmDelete) {
    return;
  }

  const result =
    await deleteBook(rowIndex);

  if (!result.success) {
    alert(
      result.message ||
      "حدث خطأ أثناء حذف الكتاب"
    );

    return;
  }

  alert("تم حذف الكتاب ✅");

  adminBooks =
    await getBooks();

  renderBooksTable();
}


// ===============================
// حماية النصوص المعروضة
// ===============================

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");
}