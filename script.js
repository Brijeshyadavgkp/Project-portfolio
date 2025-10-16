// Smooth Scroll Reveal
window.addEventListener("scroll", revealSections);
function revealSections() {
  const reveals = document.querySelectorAll(".reveal");
  for (let i = 0; i < reveals.length; i++) {
    const windowHeight = window.innerHeight;
    const revealTop = reveals[i].getBoundingClientRect().top;
    const revealPoint = 120;
    if (revealTop < windowHeight - revealPoint) {
      reveals[i].classList.add("active");
    }
  }
}

// Typing Effect
const typing = document.getElementById("typing");
const text = "Data Analyst & Business Intelligence";
let index = 0;

function typeEffect() {
  if (index < text.length) {
    typing.innerHTML += text.charAt(index);
    index++;
    setTimeout(typeEffect, 80);
  }
}
window.onload = typeEffect;

// Dark Mode Toggle
const toggleBtn = document.getElementById("theme-toggle");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  toggleBtn.textContent = document.body.classList.contains("dark-mode")
    ? "☀️"
    : "🌙";
});
// Contact Form Submission
const form = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!name || !email || !subject || !message) {
    formMessage.style.color = "red";
    formMessage.textContent = "Please fill out all fields.";
    return;
  }

  // Send form data to backend
  fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, subject, message })
  })
    .then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Server error');
      }
      formMessage.style.color = 'green';
      formMessage.textContent = 'Message sent successfully!';
      form.reset();
      setTimeout(() => { formMessage.textContent = ''; }, 4000);
    })
    .catch((err) => {
      console.error('Contact form error:', err);
      formMessage.style.color = 'red';
      formMessage.textContent = 'Failed to send message. Please try again later.';
    });
});
