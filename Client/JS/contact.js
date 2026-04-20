const form = document.getElementById("contactForm");
const btn = document.getElementById("sendBtn");
const spinner = document.getElementById("spinner");
const btnText = document.getElementById("btnText");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  // show spinner
  spinner.classList.remove("hidden");
  btnText.textContent = "Sending...";
  btn.disabled = true;

  const formData = {
    fullName: document.getElementById("fullName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    subject: document.getElementById("subject").value,
    message: document.getElementById("message").value
  };

  try {

    const response = await fetch("https://YOUR_VERCEL_BACKEND_URL/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    alert(result.message || "Message Sent Successfully");

    form.reset();

  } catch (error) {

    alert("Something went wrong");

  }
  // hide spinner
  spinner.classList.add("hidden");
  btnText.textContent = "Send Message";
  btn.disabled = false;

});