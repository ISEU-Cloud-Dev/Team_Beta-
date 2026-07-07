const form = document.getElementById("loginForm");
const btn = document.querySelector(".login-btn");
const toggle = document.querySelector(".togglePassword");
const password = document.getElementById("password");

if (toggle) {
    toggle.addEventListener("click", () => {
        if (password.type === "password") {
            password.type = "text";
            toggle.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
        } else {
            password.type = "password";
            toggle.innerHTML = '<i class="fa-solid fa-eye"></i>';
        }
    });
}

if (form) {
    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        document.getElementById("emailError").textContent = "";
        document.getElementById("passwordError").textContent = "";

        const email = document.getElementById("email").value.trim();
        const pass = password.value.trim();

        let valid = true;

        if (email === "") {
            document.getElementById("emailError").textContent = "Ingrese su correo";
            valid = false;
        }

        if (pass === "") {
            document.getElementById("passwordError").textContent = "Ingrese su contraseña";
            valid = false;
        }

        if (!valid) return;

        btn.classList.add("loading");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: pass })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error de autenticación");
            }

            window.location.href = data.redirect || "/dashboard";
        } catch (error) {
            document.getElementById("passwordError").textContent = error.message;
        } finally {
            btn.classList.remove("loading");
        }
    });
}