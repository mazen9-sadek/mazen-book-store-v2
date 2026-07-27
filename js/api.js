// ===============================
// ملف التعامل مع Google Apps Script
// ===============================

async function apiRequest(action, payload = {}) {

  if (!API_URL || API_URL === "PUT_YOUR_GOOGLE_SCRIPT_URL_HERE") {
    console.warn("API_URL غير مضاف في config.js");
    return getOfflineData(action, payload);
  }

  try {

    const url = `${API_URL}?action=${encodeURIComponent(action)}`;

    const postActions = [
      "createOrder",
      "getOrder",
      "updateOrderStatus",
      "addBook",
      "updateBook",
      "deleteBook"
    ];

    const options = {
      method: postActions.includes(action) ? "POST" : "GET"
    };

    if (options.method === "POST") {
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    console.log(action, data);

    return data;

  } catch (error) {

    console.error("API Error:", error);

    return {
      success: false,
      message: "حدث خطأ أثناء الاتصال بالسيرفر"
    };

  }

}


// ===============================
// بيانات مؤقتة في حالة عدم الاتصال
// ===============================

function getOfflineData(action) {

  if (action === "getSettings") {

    return {
      success: true,
      settings: DEFAULT_SETTINGS
    };

  }

  if (action === "getBooks") {

    return {
      success: true,
      books: [
        {
          rowIndex: 2,
          grade: "الصف الأول الابتدائي",
          name: "كتاب اللغة العربية",
          price: 120,
          image: "",
          available: "نعم"
        },
        {
          rowIndex: 3,
          grade: "الصف الأول الابتدائي",
          name: "كتاب الرياضيات",
          price: 110,
          image: "",
          available: "نعم"
        }
      ]
    };

  }

  if (action === "createOrder") {

    return {
      success: true,
      orderNumber: `${ORDER_PREFIX}-${Date.now().toString().slice(-6)}`,
      message: "تم تسجيل الطلب بنجاح"
    };

  }

  if (action === "getOrder") {

    return {
      success: false,
      message: "ميزة تتبع الطلب تحتاج اتصال بالسيرفر"
    };

  }

  if (action === "getDashboard") {

    return {
      success: true,
      dashboard: {
        totalOrders: 0,
        totalSales: 0,
        totalBooks: 0,
        totalCustomers: 0,
        orders: [],
        topBooks: [],
        topGrades: []
      }
    };

  }

  if (
    action === "updateOrderStatus" ||
    action === "addBook" ||
    action === "updateBook" ||
    action === "deleteBook"
  ) {

    return {
      success: true,
      message: "تم تنفيذ العملية بنجاح"
    };

  }

  return {
    success: false,
    message: "Action غير معروف"
  };

}


// ===============================
// API Functions
// ===============================

async function getSettings() {

  const data = await apiRequest("getSettings");

  return data.success
    ? data.settings
    : DEFAULT_SETTINGS;

}

async function getBooks() {

  const data = await apiRequest("getBooks");

  return data.success
    ? data.books
    : [];

}

async function createOrder(order) {

  return await apiRequest("createOrder", order);

}

async function getOrder(orderNumber, phone) {

  return await apiRequest("getOrder", {
    orderNumber,
    phone
  });

}

async function getDashboard() {

  const data = await apiRequest("getDashboard");

  return data.success
    ? data.dashboard
    : null;

}


// ===============================
// تحديث حالة الطلب
// ===============================

async function updateOrderStatus(orderNumber, status) {

  return await apiRequest("updateOrderStatus", {
    orderNumber,
    status
  });

}


// ===============================
// إدارة الكتب
// ===============================

async function addBook(book) {

  return await apiRequest("addBook", book);

}

async function updateBook(book) {

  return await apiRequest("updateBook", book);

}

async function deleteBook(rowIndex) {

  return await apiRequest("deleteBook", {
    rowIndex
  });

}