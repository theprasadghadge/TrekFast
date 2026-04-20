// Get selected user type
function getUserType() {
  return document.querySelector('input[name="userType"]:checked').value;
}

// ===== Send Reset OTP =====
async function sendResetOTP() {
  const email = document.getElementById("email").value;
  if (!email) return alert("Enter your email");

  const btn = document.getElementById("otpBtn");
  const btnText = document.getElementById("otpBtnText");
  const spinner = document.getElementById("otpSpinner");
  const status = document.getElementById("otpStatus");

  btn.disabled = true;
  btnText.textContent = "Sending...";
  spinner.classList.remove("hidden");
  status.classList.add("hidden");

  try {
    const res = await fetch("https://YOUR_VERCEL_BACKEND_URL/send-reset-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, userType: getUserType() })
    });

    const data = await res.json();

    if (res.ok) {
      btnText.textContent = "Resend";
      status.textContent = "✅ OTP sent to your email!";
      status.className = "mt-1 text-sm text-green-300";
    } else {
      btnText.textContent = "Get OTP";
      status.textContent = `❌ ${data.message}`;
      status.className = "mt-1 text-sm text-red-400";
    }

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


// ===== Reset Password Submit =====
document.getElementById("forgotForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const otp = document.getElementById("otp").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const userType = getUserType();

  if (newPassword !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  const resetBtn = document.getElementById("resetBtn");

  // START SPINNER
  resetBtn.disabled = true;
  resetBtn.innerHTML =
    `Resetting... 
     <span style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;margin-left:5px;"></span>`;

  try {

    // ===== Verify OTP =====
    const verifyRes = await fetch("https://YOUR_VERCEL_BACKEND_URL/verify-reset-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });

    const verifyData = await verifyRes.json();

    if (verifyData.message !== "OTP Verified") {
      alert(verifyData.message || "Invalid OTP");

      // STOP SPINNER BEFORE EXIT
      resetBtn.disabled = false;
      resetBtn.innerHTML = "Reset Password";

      return;
    }

    // ===== Reset Password =====
    const res = await fetch("https://YOUR_VERCEL_BACKEND_URL/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword, userType })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      window.location.href = "login.html";
    }

  } catch (err) {
    console.error(err);
    alert("Server error. Try again later.");
  }

  // STOP SPINNER
  resetBtn.disabled = false;
  resetBtn.innerHTML = "Reset Password";
});