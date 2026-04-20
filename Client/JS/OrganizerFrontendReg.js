// ===== Send OTP =====
async function getOTP() {
  const email = document.getElementById("email").value.trim();
  if (!email) return alert("Enter your email");

  try {
    const res = await fetch("https://YOUR_VERCEL_BACKEND_URL/sendotp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    alert(data.message || data.error);

  } catch (err) {
    console.error(err);
    alert("Error sending OTP");
  }
}

// ===== Verify OTP =====
async function verifyOTP() {
  const email = document.getElementById("email").value.trim();
  const otp = document.getElementById("otp").value.trim();

  if (!otp) return alert("Enter OTP");
  if (!email) return alert("Email missing");

  try {
    const res = await fetch("https://YOUR_VERCEL_BACKEND_URL/verifyotp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
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

// ===== Organizer Registration =====
async function handleOrganizerRegister(e) {
  e.preventDefault();

  const password = document.getElementById("password").value;
  const cpassword = document.getElementById("cpassword").value;
  const mobile = document.getElementById("mobile").value.trim();

  // ✅ Mobile validation (exactly 10 digits)
  if (mobile.length !== 10) {
    return alert("Mobile number must be 10 digits");
  }

  // ✅ Password validation (>6)
  if (password.length <= 6) {
    return alert("Password must be greater than 6 characters");
  }

  // Password match
  if (password !== cpassword) {
    return alert("Passwords do not match");
  }

  // OTP verification
  const otpVerified = await verifyOTP();
  if (!otpVerified) return;

  // Data
  const organizerData = {
    firstName: document.getElementById("firstName").value,
    middleName: document.getElementById("middleName").value,
    surname: document.getElementById("surname").value,
    email: document.getElementById("email").value,
    mobile: mobile,
    password: password,
    otp: document.getElementById("otp").value,

    organizationName: document.getElementById("orgName").value,
    experienceYears: document.getElementById("experience").value,
    address: document.getElementById("address").value,
    websiteOrSocial: document.getElementById("website").value,
    operatingRegion: document.getElementById("region").value,

    emergencyPerson: document.getElementById("emergencyPerson").value,
    emergencyNumber: document.getElementById("emergencyNumber").value,
    safetyCertifications: document.getElementById("certifications").value,
    firstAidAvailable: document.getElementById("firstAid").value,
    medicalSupport: document.getElementById("medical").value,

    // Hardcoded file paths
    personalId: "uploads/id.jpg",
    orgRegistrationDoc: "uploads/regdoc.pdf",
    experienceProof: "uploads/proof.pdf",

    termsAccepted: document.getElementById("terms").checked
  };

  try {
    const res = await fetch("https://YOUR_VERCEL_BACKEND_URL/organizeregistration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(organizerData)
    });

    const data = await res.json();
    alert(data.message || "Registered successfully!");

    if (res.ok) {
      setTimeout(() => {
        window.location.href = "orgnizerhome.html";
      }, 500);
    }

  } catch (err) {
    console.error(err);
    alert("Server error. Try again later.");
  }
}