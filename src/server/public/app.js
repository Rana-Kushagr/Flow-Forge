/**
 * FlowForge Client Controller
 * Lightweight, accessible interactions for the high-contrast B2B website.
 */

document.addEventListener("DOMContentLoaded", () => {

  // =========================================================================
  // 1. SELECTABLE AREA PILLS IN CONTACT FORM
  // =========================================================================
  const pillOptions = document.querySelectorAll("#automation-areas .pill-option");

  pillOptions.forEach(pill => {
    pill.addEventListener("click", () => {
      pill.classList.toggle("selected");
    });
  });

  // =========================================================================
  // 2. CONTACT / GET STARTED FORM SUBMISSION
  // =========================================================================
  const form = document.getElementById("lead-contact-form");
  const confirmationBox = document.getElementById("contact-confirmation");
  const btnSubmit = document.getElementById("btn-submit-contact");
  const btnSendAnother = document.getElementById("btn-send-another");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("user-name");
      const contactInput = document.getElementById("user-contact");
      const businessInput = document.getElementById("user-business");
      const problemInput = document.getElementById("user-problem");

      const name = nameInput ? nameInput.value.trim() : "";
      const contact = contactInput ? contactInput.value.trim() : "";
      const business = businessInput ? businessInput.value.trim() : "";
      const problem = problemInput ? problemInput.value.trim() : "";

      if (!name || !contact || !problem) {
        alert("Please complete your Name, Email or Phone, and a description of your repetitive task.");
        return;
      }

      const selectedAreas = Array.from(document.querySelectorAll("#automation-areas .pill-option.selected"))
        .map(pill => pill.dataset.value);

      btnSubmit.disabled = true;
      btnSubmit.textContent = "Sending...";

      try {
        await fetch("/api/diagnostic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email: contact,
            company: business,
            description: problem,
            bottlenecks: selectedAreas
          })
        }).catch(() => null);

        // Show confirmation box
        form.style.display = "none";
        if (confirmationBox) {
          confirmationBox.classList.add("active");
        }
      } catch (err) {
        console.warn("Contact submission:", err);
        form.style.display = "none";
        if (confirmationBox) {
          confirmationBox.classList.add("active");
        }
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Send Message \u2192";
      }
    });
  }

  if (btnSendAnother) {
    btnSendAnother.addEventListener("click", () => {
      if (confirmationBox) confirmationBox.classList.remove("active");
      if (form) {
        form.reset();
        form.style.display = "block";
      }
    });
  }

});
