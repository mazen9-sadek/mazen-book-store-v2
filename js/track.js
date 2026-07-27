// ===============================
// تتبع الطلب
// ===============================

let librarySettings = DEFAULT_SETTINGS;

document.addEventListener("DOMContentLoaded", initTrackPage);

async function initTrackPage() {

  librarySettings = await getSettings();

  document.getElementById("libraryName").textContent =
    librarySettings.libraryName;

  const footer = document.getElementById("footerLibraryName");

  if (footer) {
    footer.textContent = librarySettings.libraryName;
  }

  document
    .getElementById("trackForm")
    .addEventListener("submit", searchOrder);

}

async function searchOrder(e) {

  e.preventDefault();

  const orderNumber =
    document.getElementById("orderNumber").value.trim();

  const phone =
    document.getElementById("orderPhone").value.trim();

  const message =
    document.getElementById("trackMessage");

  const resultSection =
    document.getElementById("orderResultSection");

  const result =
    document.getElementById("orderResult");

  message.innerHTML = "⏳ جاري البحث...";

  resultSection.classList.add("hidden");

  const response = await getOrder(orderNumber, phone);

  if (!response.success) {

    message.innerHTML =
      "❌ " + response.message;

    return;

  }

  message.innerHTML = "";

  const order = response.order;

  result.innerHTML = `
  
    <div class="track-result-card">

      <h2>✅ تم العثور على الطلب</h2>

      <div class="track-info">

        <p><strong>رقم الطلب:</strong> ${order.orderNumber}</p>

        <p><strong>الاسم:</strong> ${order.name}</p>

        <p><strong>التاريخ:</strong> ${order.date}</p>

        <p><strong>الحالة:</strong> ${order.status}</p>

        <p><strong>الإجمالي:</strong> ${order.total} جنيه</p>

      </div>

      <h3>📚 الكتب</h3>

      <ul class="track-items">
        ${order.items.map(item => `
          <li>
            ${item.grade}
            <br>
            ${item.name}
            × ${item.qty}
          </li>
        `).join("")}
      </ul>

      ${
        order.notes
        ? `
          <h3>📝 الملاحظات</h3>
          <p>${order.notes}</p>
        `
        : ""
      }

    </div>

  `;

  resultSection.classList.remove("hidden");

  resultSection.scrollIntoView({
    behavior: "smooth"
  });

}