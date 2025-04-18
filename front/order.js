const apiBaseUrl = "http://localhost:3000"; //process.env.BACKEND_HOST;
let services = [];
let masters = [];
let user = {};
let token;
let client_Id; // Ідентифікатор клієнта (можна отримати з сервера)

async function getClientId() {
  token = localStorage.getItem("jwt_token");

  if (!token || token.split(".").length < 3) {
    console.error("Токен некоректний");
    window.location.href = "login.html"; // Перенаправлення на сторінку входу
  } else {
    const payload = JSON.parse(atob(token.split(".")[1]));
    client_Id = payload.id;
    console.log("ID client: ", client_Id);

    console.log("Користувач залогінений, доступ дозволений.");
  }
}

async function fetchData(url) {
  const token = localStorage.getItem("jwt_token"); // Додати оновлення токена

  try {
    let response = await fetch(url, {
      // method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // body: JSON.stringify(orderData),
    });
    if (!response.ok)
      throw new Error(`HTTP помилка! Статус: ${response.status}`);

    const data = await response.json();
    console.log("Отримані дані:", data);
    return data;
  } catch (error) {
    console.error("Помилка запиту:", error);
    return [];
  }
}

async function loadCurrentUser() {
  const patchUserId = `${apiBaseUrl}/users/${client_Id}`;
  const select = await fetchData(patchUserId);
  const { id, username, tel } = select[0];
  user = { id, username, tel };
  console.log(user);

  const userElement = document.getElementById("user");
  userElement.innerHTML = `<p> USER: ${user.username} tel: ${user.tel}</p>`;
}

async function loadServices() {
  services = await fetchData(apiBaseUrl + "/services");

  const select = document.getElementById("service");
  select.innerHTML = ""; // Очищення списку

  services.forEach((service) => {
    const option = document.createElement("option");
    option.value = service.id;
    option.textContent = `${service.name} - ${service.price} грн (${service.duration} хв)`;
    select.appendChild(option);
  });
}

async function loadMasters() {
  masters = await fetchData(apiBaseUrl + "/masters");
  const select = document.getElementById("master");
  if (select) select.innerHTML = "";

  masters.forEach((master) => {
    const option = document.createElement("option");
    option.value = master.id;
    option.textContent = master.specialty;
    // console.log("Елемент select:", select);
    select.appendChild(option);
  });
}

async function submitOrder(event) {
  event.preventDefault();
  const clientId = client_Id;
  const serviceId = document.getElementById("service").value;
  const masterId = document.getElementById("master").value;
  const dateTime = document.getElementById("date").value;

  const orderData = {
    client_id: clientId,
    service_id: serviceId,
    master_id: masterId,
    date_time: dateTime,
  };

  const response = await fetch(apiBaseUrl + "/appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  if (response.ok) {
    alert("Замовлення успішно створено!");
    loadOrders();
  } else {
    alert("Помилка при створенні замовлення.");
  }
}

async function loadOrders() {
  const orders = await fetchData(
    `${apiBaseUrl}/appointments/client/${client_Id}`
  );
  const ordersList = document.getElementById("ordersList");
  ordersList.innerHTML = "";

  if (orders.length === 0) {
    ordersList.innerHTML = "<p>У вас немає замовлень</p>";
    return;
  }

  orders.forEach((order) => {
    const listItem = document.createElement("li");

    // Конвертуємо дату в європейський формат
    const dateObj = new Date(order.date_time);
    const formattedDate = formattedEvroDate(dateObj);

    listItem.innerHTML = `
    <button onclick="deleteOrder(${order.id})">Видалити</button>
    <button onclick="editOrder(${order.id})">Редагувати</button>
    Дата: ${formattedDate}, Послуга: ${order.service_name}, Майстер: ${order.master_name}
    `;

    ordersList.appendChild(listItem);
  });
}

function formattedEvroDate(date) {
  const evroFormatteDate = `${String(date.getDate()).padStart(2, "0")}.${String(
    date.getMonth() + 1
  ).padStart(2, "0")}.${date.getFullYear()} ${String(date.getHours()).padStart(
    2,
    "0"
  )}:${String(date.getMinutes()).padStart(2, "0")}`;
  return evroFormatteDate;
}

async function deleteOrder(orderId) {
  if (confirm("Ви впевнені, що хочете видалити замовлення?")) {
    const response = await fetch(`${apiBaseUrl}/appointments/${orderId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      alert("Замовлення видалено!");
      loadOrders();
    } else {
      alert(`Помилка при видаленні. Код статусу: ${response.status}`);
    }
  }
}

let editedOrderId;

async function editOrder(id) {
  // client_id, master_id, date_time, service_id;
  editedOrderId = id; // Зберігаємо ID замовлення
  const editOrderp = document.getElementById("editOrder");
  const order = await fetchData(`${apiBaseUrl}/appointments/${id}`);
  console.log(order);

  // Конвертуємо дату в європейський формат
  const dateObj = new Date(order.date_time);
  const formattedDate = formattedEvroDate(dateObj);
  editOrderp.innerHTML = `<p> Послуга: ${order.service_name}<br> Майстер: ${order.master_name}<br>Дата: ${formattedDate},</p>`;

  if (!order) {
    alert("Помилка: замовлення не знайдено.");
    return;
  }

  // Завантажуємо послуги та майстрів у модальне вікно
  const servicesSelect = document.getElementById("editService");
  const mastersSelect = document.getElementById("editMaster");
  const dateInput = document.getElementById("editDate");

  // Очищення списків
  servicesSelect.innerHTML = "";
  mastersSelect.innerHTML = "";

  services.forEach((service) => {
    const option = document.createElement("option");
    option.value = service.id;
    option.textContent = `${service.name} - ${service.price} грн`;
    if (service.name === order.service_name) option.selected = true;
    servicesSelect.appendChild(option);
  });

  masters.forEach((master) => {
    const option = document.createElement("option");
    option.value = master.id;
    option.textContent = master.specialty;
    if (master.specialty === order.master_name) option.selected = true;
    mastersSelect.appendChild(option);
  });

  // Встановлюємо поточну дату
  dateInput.value = order.date_time.slice(0, -1);

  // Відкриваємо модальне вікно
  document.getElementById("editModal").style.display = "block";
}

function closeModal() {
  document.getElementById("editModal").style.display = "none";
}

async function saveEditedOrder() {
  const newServiceId = document.getElementById("editService").value;
  const newMasterId = document.getElementById("editMaster").value;
  const newDate = document.getElementById("editDate").value;

  const response = await fetch(`${apiBaseUrl}/appointments/${editedOrderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      client_id: client_Id,
      service_id: newServiceId,
      master_id: newMasterId,
      date_time: newDate,
    }),
  });

  if (response.ok) {
    alert("Замовлення оновлено!");
    closeModal();
    loadOrders();
  } else {
    alert("Помилка при редагуванні.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await getClientId();
  loadCurrentUser();
  loadServices();
  loadMasters();
  loadOrders();
  document.getElementById("orderForm").addEventListener("submit", submitOrder);
});
