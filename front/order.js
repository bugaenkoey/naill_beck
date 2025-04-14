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

  const phone = document.getElementById("phone");
  phone.value = user.tel;
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
    const formattedDate = `${String(dateObj.getDate()).padStart(
      2,
      "0"
    )}.${String(dateObj.getMonth() + 1).padStart(
      2,
      "0"
    )}.${dateObj.getFullYear()} ${String(dateObj.getHours()).padStart(
      2,
      "0"
    )}:${String(dateObj.getMinutes()).padStart(2, "0")}`;

    listItem.innerHTML = `
    <button onclick="deleteOrder(${order.id})">Видалити</button>
    <button onclick="editOrder(${order.id})">Редагувати</button>
    Дата: ${formattedDate}, Послуга: ${order.service_name}, Майстер: ${order.master_name}
    `;

    ordersList.appendChild(listItem);
  });
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

async function editOrder(orderId) {
  const newDate = prompt("Введіть нову дату (YYYY-MM-DD HH:MM):");
  if (newDate) {
    const response = await fetch(`${apiBaseUrl}/appointments/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ date_time: newDate }),
    });
    if (response.ok) {
      alert("Замовлення оновлено!");
      loadOrders();
    } else {
      alert("Помилка при редагуванні.");
    }
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
