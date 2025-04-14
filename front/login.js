localStorage.setItem("jwt_token", null);
document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const apiBaseUrl = "http://localhost:3000"; //process.env.BACKEND_HOST;
    // const baseUrl = "http://127.0.0.1:5500";

    const response = await fetch(`${apiBaseUrl}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    const data = await response.json();
    if (data.token) {
      localStorage.setItem("jwt_token", data.token); // Збереження токена
      //   window.location.href = `${baseUrl}/front/order.html`; // Перехід на сторінку замовлення
      window.location.href = "./order.html"; // Перехід на сторінку замовлення
    } else {
      alert("Помилка входу. Перевірте дані!");
    }

    alert(data.message);
  });
