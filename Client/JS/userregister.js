// ===== Always reset to Trekker when page loads OR user comes back =====
window.addEventListener("pageshow", function () {
  const trekker = document.getElementById("trekker");
  const organizer = document.getElementById("organizer");
  trekker.checked = true;
  organizer.checked = false;
});

// Instant redirect when Organizer clicked
function goToOrganizer() {
  window.location.href = "organizeregistration.html";
}

// ===== Send OTP with Spinner =====
async function sendOTPWithSpinner() {
  const email = document.getElementById("email").value;
  if (!email) return alert("Enter your email");

  const btn = document.getElementById("otpBtn");
  const btnText = document.getElementById("otpBtnText");
  const spinner = document.getElementById("otpSpinner");
  const status = document.getElementById("otpStatus");

  // Spinner ON
  btn.disabled = true;
  btnText.textContent = "Sending...";
  spinner.classList.remove("hidden");
  status.classList.add("hidden");

  try {
    const res = await fetch("https://YOUR_VERCEL_BACKEND_URL/sendotp", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    btnText.textContent = "Resend";
    status.textContent = "✅ OTP sent to your email!";
    status.className = "mt-1 text-sm text-black-300";
    status.classList.remove("hidden");

  } catch (err) {
    console.error(err);

    btnText.textContent = "Get OTP";
    status.textContent = "❌ Error sending OTP. Try again.";
    status.className = "mt-1 text-sm text-red-400";
    status.classList.remove("hidden");

  } finally {
    spinner.classList.add("hidden");
    btn.disabled = false;
  }
}

// ===== Verify OTP =====
async function verifyOTP() {
  const otp = document.getElementById("otp").value;
  if (!otp) return alert("Enter OTP");

  try {
    const res = await fetch("https://YOUR_VERCEL_BACKEND_URL/verifyotp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp })
    });

    const data = await res.json();
    if (data.message === "OTP Verified") return true;

    alert("Invalid OTP");
    return false;

  } catch (err) {
    console.error(err);
    alert("Error verifying OTP");
    return false;
  }
}

// ===== Trekker Registration =====
async function handleRegister(e) {
  e.preventDefault();

  const password = document.getElementById("pass").value;
  const cpass = document.getElementById("cpass").value;
  const mobile = document.getElementById("mobile").value;

  // Mobile validation (greater than 6 digits)
  if (mobile.length != 10) {
    return alert("Mobile number must be greater than 10 digits");
  }

  //Password validation (greater than 6 characters)
  if (password.length <= 6) {
    return alert("Password must be greater than 6 characters");
  }

  // Password match check
  if (password !== cpass) {
    return alert("Passwords do not match");
  }

  const otpVerified = await verifyOTP();
  if (!otpVerified) return;

  const userData = {
    firstName: document.getElementById("firstName").value,
    middleName: document.getElementById("middleName").value,
    lastName: document.getElementById("lastName").value,
    mobile: mobile,
    email: document.getElementById("email").value,
    password: password
  };

  // ===== Register Spinner ON =====
  const submitBtn = document.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.innerHTML = `Registering... <span id="registerSpinner" style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-left:4px;"></span>`;

  try {
    const res = await fetch("https://YOUR_VERCEL_BACKEND_URL/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      setTimeout(() => {
        window.location.href = "login.html";
      }, 500);
    }

  } catch {
    alert("Server error. Try again later.");

  } finally {
    // ===== Register Spinner OFF =====
    submitBtn.disabled = false;
    submitBtn.innerHTML = "Register";
  }
}