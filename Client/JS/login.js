const robotCheck = document.getElementById("robot");
const loginBtn   = document.getElementById("loginBtn");
const form       = document.getElementById("loginForm");

function resetRobotCheck() {
  robotCheck.checked = false;
  loginBtn.classList.add("hidden");
  loginBtn.disabled = false;
  loginBtn.innerHTML = "Login";
}

robotCheck.addEventListener("change", () => {
  loginBtn.classList.toggle("hidden", !robotCheck.checked);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const userType = document.getElementById("trekker").checked ? "trekker" : "organizer";

  loginBtn.disabled = true;
  loginBtn.innerHTML = `Logging in... <span style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-left:4px;"></span>`;

  try {
    const res  = await fetch("https://YOUR_VERCEL_BACKEND_URL/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password, userType }),
    });
    const data = await res.json();

    if (res.ok) {
      // Save JWT token + session info
      localStorage.setItem("token",     data.token);
      localStorage.setItem("userEmail", data.email || email);
      localStorage.setItem("userType",  data.userType || userType);
      localStorage.setItem("userName",  data.name || "");

      alert(data.message);

      if (userType === "trekker") {
        localStorage.removeItem("organizerEmail");
        localStorage.removeItem("organizerName");
        window.location.href = "home.html";
      } else {
        localStorage.setItem("organizerEmail", data.email || email);
        localStorage.setItem("organizerName",  data.name  || "");
        window.location.href = "orgnizerhome.html";
      }
    } else {
      // Wrong credentials — uncheck robot checkbox and hide login button
      alert(data.message || "Invalid username or password.");
      resetRobotCheck();
    }

  } catch (err) {
    alert("Server error. Please try again.");
    resetRobotCheck();
  }
});
