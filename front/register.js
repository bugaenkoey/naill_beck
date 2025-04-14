document
  .getElementById("registerForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const tel = document.getElementById("tel").value;

    /*
 async () => {
    const newService = { username: "Євген-007", password: "evgen@example.com",tel: "+380501112223" };

    const res = await request(app).post("/users/register").send(newService);
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBe("User registered successfully");
  }, 10000);
*/
    const apiBaseUrl = "http://localhost:3000"; //process.env.BACKEND_HOST;

    const response = await fetch(`${apiBaseUrl}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, tel }),
    });

    const data = await response.json();
    alert(data.message);
  });
