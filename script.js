(function () {
  "use strict";

  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("submit-btn");
  const submitLabel = submitBtn.querySelector(".submit-label");
  const statusEl = document.getElementById("form-status");

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_PATTERN = /^\+?[0-9\s\-()]{7,20}$/;

  // Each validator returns an error message, or "" when the value is valid.
  const validators = {
    name(value) {
      if (!value.trim()) return "Please enter your full name.";
      if (value.trim().length < 2) return "Your name needs at least 2 characters.";
      return "";
    },
    email(value) {
      if (!value.trim()) return "Please enter your email address.";
      if (!EMAIL_PATTERN.test(value.trim())) return "Enter a valid email, like name@example.com.";
      return "";
    },
    phone(value) {
      // Optional: only check the format when something is entered.
      if (value.trim() && !PHONE_PATTERN.test(value.trim())) {
        return "Enter a valid phone number, using digits, spaces, + or dashes.";
      }
      return "";
    },
    service(value) {
      if (!value) return "Please choose the service you need.";
      return "";
    },
  };

  function getGroup(input) {
    return input.closest(".group");
  }

  function showError(input, message) {
    const group = getGroup(input);
    const errorEl = document.getElementById(input.id + "-error");
    group.classList.add("has-error");
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", errorEl.id);
    errorEl.textContent = message;
  }

  function clearError(input) {
    const group = getGroup(input);
    const errorEl = document.getElementById(input.id + "-error");
    group.classList.remove("has-error");
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
    if (errorEl) errorEl.textContent = "";
  }

  function validateField(input) {
    const validate = validators[input.name];
    if (!validate) return true;
    const message = validate(input.value);
    if (message) {
      showError(input, message);
      return false;
    }
    clearError(input);
    return true;
  }

  function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = "status" + (type ? " is-" + type : "");
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitLabel.textContent = isLoading ? "Sending..." : "Submit";
  }

  // Validate a field when the user leaves it; re-check while typing once it has an error.
  Object.keys(validators).forEach(function (name) {
    const input = form.elements[name];
    input.addEventListener("blur", function () {
      validateField(input);
    });
    const eventName = input.tagName === "SELECT" ? "change" : "input";
    input.addEventListener(eventName, function () {
      if (getGroup(input).classList.contains("has-error")) validateField(input);
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    setStatus("", "");

    let firstInvalid = null;
    Object.keys(validators).forEach(function (name) {
      const input = form.elements[name];
      if (!validateField(input) && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    setLoading(true);

    sendMessage(data)
      .then(function () {
        form.reset();
        setStatus("Thanks! Your message has been sent. We'll reply soon.", "success");
      })
      .catch(function () {
        setStatus("Something went wrong and your message wasn't sent. Please try again.", "error");
      })
      .finally(function () {
        setLoading(false);
      });
  });

  /*
   * Replace this function with a real request to your backend, for example:
   *
   * return fetch("/api/contact", {
   *   method: "POST",
   *   headers: { "Content-Type": "application/json" },
   *   body: JSON.stringify(data),
   * }).then(function (res) {
   *   if (!res.ok) throw new Error("Request failed");
   * });
   */
  function sendMessage(data) {
    console.log("Form data:", data);
    return new Promise(function (resolve) {
      setTimeout(resolve, 1200);
    });
  }
})();
