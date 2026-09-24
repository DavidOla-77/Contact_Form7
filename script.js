(function () {
  "use strict";

  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("submit-btn");
  const submitLabel = submitBtn.querySelector(".submit-label");
  const statusEl = document.getElementById("form-status");

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_PATTERN = /^\+?[0-9\s\-()]{7,20}$/;

  const validators = {
    name(value) {
      if (!value.trim()) {
        return "Please enter your full name.";
      }

      if (value.trim().length < 2) {
        return "Your name needs at least 2 characters.";
      }

      return "";
    },

    email(value) {
      if (!value.trim()) {
        return "Please enter your email address.";
      }

      if (!EMAIL_PATTERN.test(value.trim())) {
        return "Enter a valid email, like name@example.com.";
      }

      return "";
    },

    phone(value) {
      // Phone is optional
      if (value.trim() && !PHONE_PATTERN.test(value.trim())) {
        return "Enter a valid phone number.";
      }

      return "";
    },

    service(value) {
      if (!value) {
        return "Please choose the service you need.";
      }

      return "";
    }
  };

  function getGroup(input) {
    return input.closest(".group");
  }

  function showError(input, message) {
    const group = getGroup(input);
    const errorEl = document.getElementById(input.id + "-error");

    if (!errorEl) return;

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

    if (errorEl) {
      errorEl.textContent = "";
    }
  }

  function validateField(input) {
    const validate = validators[input.name];

    if (!validate) {
      return true;
    }

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

  // Validate fields when the user leaves them
  Object.keys(validators).forEach(function (name) {
    const input = form.elements[name];

    if (!input) return;

    input.addEventListener("blur", function () {
      validateField(input);
    });

    const eventName =
      input.tagName === "SELECT" ? "change" : "input";

    input.addEventListener(eventName, function () {
      if (getGroup(input).classList.contains("has-error")) {
        validateField(input);
      }
    });
  });

  // Submit form
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    setStatus("", "");

    let firstInvalid = null;

    Object.keys(validators).forEach(function (name) {
      const input = form.elements[name];

      if (!validateField(input) && !firstInvalid) {
        firstInvalid = input;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    setLoading(true);

    const formData = new FormData(form);

    fetch(form.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Form submission failed");
        }

        return response.json();
      })
      .then(function () {
        form.reset();

        setStatus(
          "Thanks! Your message has been sent. We'll reply soon.",
          "success"
        );
      })
      .catch(function (error) {
        console.error("Formspree error:", error);

        setStatus(
          "Something went wrong and your message wasn't sent. Please try again.",
          "error"
        );
      })
      .finally(function () {
        setLoading(false);
      });
  });
})();
