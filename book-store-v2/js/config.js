// ===============================
// إعدادات موقع مكتبة مازن - V2
// ===============================

// رابط Google Apps Script Web App
// هنحط الرابط الجديد بعد ما نعمل Apps Script الجديد
const API_URL = "https://script.google.com/macros/s/AKfycbznsA7pNX6Qpp6pF8pWkXvmNQmhLCu2N4CYdNq9-_VRZ3Dy9c2YB_-O1TpEF4f0LBuQ6Q/exec";

// بيانات افتراضية للمكتبة
// لو Google Sheets اشتغل، البيانات دي هتتبدل تلقائيًا من شيت Settings
const DEFAULT_SETTINGS = {
  libraryName: "مكتبة مازن",
  whatsapp: "201554596691",
  address: "مجاورة 27 أمام ناصية المصانع",
  workingHours: "يوميًا من 12 صباحًا إلى 12 مساءً",
  adminPassword: "2006"
};

// الصفوف الدراسية
const GRADES = [
  "الصف الأول الابتدائي",
  "الصف الثاني الابتدائي",
  "الصف الثالث الابتدائي",
  "الصف الرابع الابتدائي",
  "الصف الخامس الابتدائي",
  "الصف السادس الابتدائي",
  "الصف الأول الإعدادي",
  "الصف الثاني الإعدادي",
  "الصف الثالث الإعدادي"
];

// صورة افتراضية للكتب اللي لسه مفيش لها صورة
const DEFAULT_BOOK_IMAGE = "";

// بادئة أرقام الطلبات
const ORDER_PREFIX = "MZN";

// مدة التجهيز
const PREPARATION_TEXT =
  "مدة تجهيز الطلب من 10 إلى 15 يوم، وسيتم التواصل معكم عند جاهزية الطلب.";

// حالة الطلب الافتراضية
const DEFAULT_ORDER_STATUS = "جديد";

// مفتاح حفظ السلة في المتصفح
const CART_STORAGE_KEY = "mazen_book_store_cart_v2";

// مفتاح دخول لوحة الإدارة
const ADMIN_LOGIN_KEY = "mazen_book_store_admin_logged_in";