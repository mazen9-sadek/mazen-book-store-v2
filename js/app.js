// ===============================
// تشغيل الصفحة الرئيسية
// ===============================

let siteSettings = DEFAULT_SETTINGS;
let allBooks = [];
let selectedGrade = "";
let selectedStage = "all";

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
  renderGrades();
  renderCart();

  siteSettings = await getSettings();
  applySettings(siteSettings);

  await refreshBooks();

  const searchInput =
    document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener(
      "input",
      renderBooks
    );
  }
}


// ===============================
// إعدادات الموقع
// ===============================

function applySettings(settings) {
  const libraryName =
    document.getElementById("libraryName");

  const workingHours =
    document.getElementById("workingHours");

  const hoursText =
    document.getElementById("hoursText");

  const address =
    document.getElementById("address");

  const whatsappHero =
    document.getElementById("whatsappHero");

  const whatsappContact =
    document.getElementById("whatsappContact");

  if (libraryName) {
    libraryName.textContent =
      settings.libraryName;
  }

  if (workingHours) {
    workingHours.textContent =
      settings.workingHours;
  }

  if (hoursText) {
    hoursText.textContent =
      settings.workingHours;
  }

  if (address) {
    address.textContent =
      settings.address;
  }

  const whatsappLink =
    `https://wa.me/${settings.whatsapp}`;

  if (whatsappHero) {
    whatsappHero.href =
      whatsappLink;
  }

  if (whatsappContact) {
    whatsappContact.href =
      whatsappLink;
  }
}


// ===============================
// تبويبات الموقع
// ===============================

function openSiteTab(tabName, clickedButton) {
  document
    .querySelectorAll(".site-tab-content")
    .forEach(section => {
      section.classList.remove("active");
    });

  document
    .querySelectorAll(".site-tab")
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

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function openSiteTabByName(tabName) {
  const tabButton =
    document.querySelector(
      `.site-tab[data-tab="${tabName}"]`
    );

  openSiteTab(
    tabName,
    tabButton
  );
}


// ===============================
// تحميل الكتب
// ===============================

async function refreshBooks() {
  const booksGrid =
    document.getElementById("booksGrid");

  if (booksGrid) {
    booksGrid.innerHTML = `
      <div class="empty-state">
        جاري تحميل الكتب...
      </div>
    `;
  }

  allBooks = await getBooks();

  renderGrades();
  renderBooks();
}


// ===============================
// المراحل والصفوف
// ===============================

function getGradeStage(grade) {
  const normalizedGrade =
    normalizeArabicText(grade);

  if (
    normalizedGrade.includes("ابتدائي")
  ) {
    return "primary";
  }

  if (
    normalizedGrade.includes("اعدادي")
  ) {
    return "preparatory";
  }

  if (
    normalizedGrade.includes("ثانوي")
  ) {
    return "secondary";
  }

  return "other";
}

function selectStage(stage, clickedButton) {
  selectedStage = stage;
  selectedGrade = "";

  document
    .querySelectorAll(".stage-tab")
    .forEach(button => {
      button.classList.remove("active");
    });

  if (clickedButton) {
    clickedButton.classList.add("active");
  }

  updateBooksHeading();
  updateClearGradeButton();

  renderGrades();
  renderBooks();
}

function renderGrades() {
  const gradesGrid =
    document.getElementById("gradesGrid");

  if (!gradesGrid) {
    return;
  }

  const visibleGrades =
    GRADES.filter(grade => {
      if (selectedStage === "all") {
        return true;
      }

      return (
        getGradeStage(grade) ===
        selectedStage
      );
    });

  if (visibleGrades.length === 0) {
    gradesGrid.innerHTML = `
      <div class="empty-state">
        لا توجد صفوف في هذه المرحلة
      </div>
    `;

    return;
  }

  gradesGrid.innerHTML =
    visibleGrades.map(grade => `
      <button
        type="button"
        class="grade-card ${
          selectedGrade === grade
            ? "active"
            : ""
        }"
        onclick="selectGrade(
          '${escapeJavaScriptText(grade)}'
        )"
      >
        <div class="icon">
          ${getGradeIcon(grade)}
        </div>

        <strong>
          ${escapeHtml(grade)}
        </strong>

        <small>
          ${countAvailableBooksForGrade(grade)}
          كتاب متاح
        </small>
      </button>
    `).join("");
}

function getGradeIcon(grade) {
  const stage =
    getGradeStage(grade);

  if (stage === "primary") {
    return "🟢";
  }

  if (stage === "preparatory") {
    return "🔵";
  }

  if (stage === "secondary") {
    return "🟣";
  }

  return "📘";
}

function countAvailableBooksForGrade(grade) {
  return allBooks.filter(book => {
    const available =
      normalizeArabicText(book.available) ===
      normalizeArabicText("نعم");

    const sameGrade =
      normalizeArabicText(book.grade) ===
      normalizeArabicText(grade);

    return available && sameGrade;
  }).length;
}

function selectGrade(grade) {
  selectedGrade = grade;

  const stage =
    getGradeStage(grade);

  if (
    selectedStage !== "all" &&
    selectedStage !== stage
  ) {
    selectedStage = stage;
  }

  document
    .querySelectorAll(".grade-card")
    .forEach(card => {
      const cardGrade =
        card
          .querySelector("strong")
          ?.textContent
          .trim();

      card.classList.toggle(
        "active",
        cardGrade === grade
      );
    });

  updateBooksHeading();
  updateClearGradeButton();

  renderBooks();

  document
    .getElementById("booksTitle")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
}

function clearSelectedGrade() {
  selectedGrade = "";

  document
    .querySelectorAll(".grade-card")
    .forEach(card => {
      card.classList.remove("active");
    });

  updateBooksHeading();
  updateClearGradeButton();

  renderBooks();
}

function updateBooksHeading() {
  const title =
    document.getElementById("booksTitle");

  const subtitle =
    document.getElementById("booksSubtitle");

  if (!title || !subtitle) {
    return;
  }

  if (selectedGrade) {
    title.textContent =
      `كتب ${selectedGrade}`;

    subtitle.textContent =
      "الكتب المتاحة لهذا الصف.";
    return;
  }

  if (selectedStage === "primary") {
    title.textContent =
      "كتب المرحلة الابتدائية";

    subtitle.textContent =
      "كل الكتب المتاحة للصفوف الابتدائية.";
    return;
  }

  if (selectedStage === "preparatory") {
    title.textContent =
      "كتب المرحلة الإعدادية";

    subtitle.textContent =
      "كل الكتب المتاحة للصفوف الإعدادية.";
    return;
  }

  if (selectedStage === "secondary") {
    title.textContent =
      "كتب المرحلة الثانوية";

    subtitle.textContent =
      "كل الكتب المتاحة للصفوف الثانوية.";
    return;
  }

  title.textContent =
    "الكتب المتاحة";

  subtitle.textContent =
    "يمكنك البحث مباشرة أو اختيار صف دراسي.";
}

function updateClearGradeButton() {
  const button =
    document.getElementById(
      "clearGradeButton"
    );

  if (!button) {
    return;
  }

  button.classList.toggle(
    "hidden",
    !selectedGrade
  );
}


// ===============================
// البحث الذكي
// ===============================

function normalizeArabicText(value) {
  return String(value || "")
    .toLowerCase()
    .trim()

    // توحيد أشكال الألف
    .replace(/[أإآ]/g, "ا")

    // توحيد الياء والألف المقصورة
    .replace(/ى/g, "ي")

    // توحيد التاء المربوطة
    .replace(/ة/g, "ه")

    // إزالة التشكيل
    .replace(/[\u064B-\u065F\u0670]/g, "")

    // إزالة التطويل
    .replace(/ـ/g, "")

    // إزالة الرموز
    .replace(/[^\u0600-\u06FFa-z0-9\s]/g, " ")

    // توحيد المسافات
    .replace(/\s+/g, " ")
    .trim();
}

function expandSearchWords(text) {
  const replacements = {
    اولي: "الصف الاول",
    اولى: "الصف الاول",
    اول: "الصف الاول",

    تانيه: "الصف الثاني",
    تانية: "الصف الثاني",
    ثانيه: "الصف الثاني",
    ثاني: "الصف الثاني",

    تالته: "الصف الثالث",
    تالتة: "الصف الثالث",
    ثالثه: "الصف الثالث",
    ثالث: "الصف الثالث",

    رابعه: "الصف الرابع",
    رابعة: "الصف الرابع",
    رابع: "الصف الرابع",

    خامسه: "الصف الخامس",
    خامسة: "الصف الخامس",
    خامس: "الصف الخامس",

    سادسه: "الصف السادس",
    سادسة: "الصف السادس",
    سادس: "الصف السادس",

    ابتدائي: "الابتدائي",
    ابتدائى: "الابتدائي",

    اعدادي: "الاعدادي",
    اعدادى: "الاعدادي",

    ثانوي: "الثانوي",
    ثانوى: "الثانوي",

    عربي: "اللغه العربيه",
    عربى: "اللغه العربيه",

    انجليزي: "اللغه الانجليزيه",
    انجليزى: "اللغه الانجليزيه",
    انجلش: "اللغه الانجليزيه",

    رياضه: "الرياضيات",
    رياضة: "الرياضيات",
    ماث: "الرياضيات",

    علوم: "العلوم",
    ساينس: "العلوم",

    دراسات: "الدراسات الاجتماعيه",
    اجتماعيات: "الدراسات الاجتماعيه"
  };

  const words =
    normalizeArabicText(text)
      .split(" ")
      .filter(Boolean);

  const expanded = [];

  words.forEach(word => {
    expanded.push(word);

    if (replacements[word]) {
      expanded.push(
        ...normalizeArabicText(
          replacements[word]
        ).split(" ")
      );
    }
  });

  return [...new Set(expanded)];
}

function smartBookMatch(book, searchText) {
  if (!searchText) {
    return true;
  }

  const searchableText =
    normalizeArabicText(`
      ${book.name}
      ${book.grade}
    `);

  const searchWords =
    expandSearchWords(searchText);

  return searchWords.every(word =>
    searchableText.includes(word)
  );
}


// ===============================
// عرض الكتب
// ===============================

function renderBooks() {
  const booksGrid =
    document.getElementById("booksGrid");

  if (!booksGrid) {
    return;
  }

  const searchText =
    document
      .getElementById("searchInput")
      ?.value || "";

  const books =
    allBooks.filter(book => {
      const available =
        normalizeArabicText(book.available) ===
        normalizeArabicText("نعم");

      const matchStage =
        selectedStage === "all"
          ? true
          : getGradeStage(book.grade) ===
            selectedStage;

      const matchGrade =
        selectedGrade
          ? normalizeArabicText(book.grade) ===
            normalizeArabicText(selectedGrade)
          : true;

      const matchSearch =
        smartBookMatch(
          book,
          searchText
        );

      return (
        available &&
        matchStage &&
        matchGrade &&
        matchSearch
      );
    });

  if (books.length === 0) {
    booksGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          📭
        </div>

        <strong>
          لا توجد كتب مطابقة
        </strong>

        <p>
          جرّب تغيير المرحلة أو الصف أو كلمات البحث.
        </p>
      </div>
    `;

    return;
  }

  booksGrid.innerHTML =
    books.map(book => `
      <article class="book-card">

        <div class="book-image">
          ${renderBookImage(book)}
        </div>

        <div class="book-body">

          <span class="book-grade">
            ${escapeHtml(book.grade)}
          </span>

          <h3>
            ${escapeHtml(book.name)}
          </h3>

          <div class="book-price">
            ${formatPrice(book.price)} جنيه
          </div>

          <div class="book-actions">

            <button
              type="button"
              class="add-btn"
              onclick='addBookToCartFromButton(
                ${JSON.stringify(book)}
              )'
            >
              🛒 إضافة للسلة
            </button>

          </div>

        </div>

      </article>
    `).join("");
}

function addBookToCartFromButton(book) {
  addToCart(book);
}

function renderBookImage(book) {
  if (!book.image) {
    return `
      <div class="no-image">
        📕
      </div>
    `;
  }

  return `
    <img
      src="${escapeHtml(book.image)}"
      alt="${escapeHtml(book.name)}"
      loading="lazy"
      onerror="
        this.parentElement.innerHTML =
        '<div class=&quot;no-image&quot;>📕</div>';
      "
    >
  `;
}

function formatPrice(value) {
  return Number(value || 0)
    .toLocaleString("ar-EG");
}


// ===============================
// إرسال الطلب
// ===============================

async function submitOrder() {
  const name =
    document
      .getElementById("customerName")
      .value
      .trim();

  const phone =
    document
      .getElementById("customerPhone")
      .value
      .trim();

  const notes =
    document
      .getElementById("customerNotes")
      .value
      .trim();

  const result =
    document.getElementById(
      "orderResult"
    );

  if (!name || !phone) {
    alert(
      "من فضلك اكتب الاسم ورقم الواتساب."
    );

    return;
  }

  if (!isValidEgyptianPhone(phone)) {
    alert(
      "من فضلك اكتب رقم واتساب صحيح."
    );

    return;
  }

  if (cart.length === 0) {
    alert("السلة فارغة.");
    return;
  }

  result.textContent =
    "جاري إرسال الطلب...";

  const order = {
    name,
    phone,
    notes,
    items: cart,
    total: getCartTotal(),
    status: DEFAULT_ORDER_STATUS
  };

  const response =
    await createOrder(order);

  if (response.success) {
    const total =
      getCartTotal();

    result.innerHTML = `
      <div class="order-success">

        <div class="success-icon">
          ✅
        </div>

        <h3>
          تم استلام طلبك بنجاح
        </h3>

        <p>
          رقم الطلب:
          <strong>
            ${escapeHtml(response.orderNumber)}
          </strong>
        </p>

        <p>
          الإجمالي:
          <strong>
            ${formatPrice(total)} جنيه
          </strong>
        </p>

        <p>
          ${PREPARATION_TEXT}
        </p>

        <a
          href="track.html"
          class="primary-btn"
        >
          تتبع طلبك
        </a>

      </div>
    `;

    cart = [];

    saveCart();
    renderCart();

    document
      .getElementById("customerName")
      .value = "";

    document
      .getElementById("customerPhone")
      .value = "";

    document
      .getElementById("customerNotes")
      .value = "";

  } else {
    result.textContent =
      response.message ||
      "حدث خطأ أثناء إرسال الطلب.";
  }
}

function isValidEgyptianPhone(phone) {
  const digits =
    String(phone || "")
      .replace(/\D/g, "");

  return (
    /^01[0125]\d{8}$/.test(digits) ||
    /^201[0125]\d{8}$/.test(digits)
  );
}


// ===============================
// حماية النصوص
// ===============================

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeJavaScriptText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");
}