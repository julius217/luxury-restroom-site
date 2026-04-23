/* ========================================
   LuxLoo — JavaScript
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

  // ---- Mobile Navigation Toggle ----
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navLinks.classList.toggle("active");
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
      });
    });
  }

  // ---- Navbar background on scroll ----
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        navbar.style.borderBottomColor = "rgba(243, 202, 98, 0.3)";
      } else {
        navbar.style.borderBottomColor = "rgba(243, 202, 98, 0.15)";
      }
    });
  }

  // ---- Slideshow ----
  document.querySelectorAll("[data-slideshow]").forEach(slideshow => {
    const track = slideshow.querySelector(".slideshow-track");
    const slides = slideshow.querySelectorAll(".slideshow-slide");
    const prevBtn = slideshow.querySelector(".slideshow-prev");
    const nextBtn = slideshow.querySelector(".slideshow-next");
    const dotsContainer = slideshow.querySelector(".slideshow-dots");

    if (!track || !slides.length) return;

    let currentIndex = 0;
    let autoplayTimer;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "slideshow-dot";
      dot.setAttribute("aria-label", `Go to photo ${i + 1}`);
      dot.addEventListener("click", () => { goTo(i); resetAutoplay(); });
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll(".slideshow-dot");

    function goTo(index) {
      currentIndex = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle("active", i === currentIndex));
    }

    function resetAutoplay() {
      clearInterval(autoplayTimer);
      autoplayTimer = setInterval(() => goTo(currentIndex + 1), 6000);
    }

    if (prevBtn) prevBtn.addEventListener("click", () => { goTo(currentIndex - 1); resetAutoplay(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { goTo(currentIndex + 1); resetAutoplay(); });

    slideshow.addEventListener("mouseenter", () => clearInterval(autoplayTimer));
    slideshow.addEventListener("mouseleave", resetAutoplay);

    goTo(0);
    resetAutoplay();
  });

  // ---- Gallery Lightbox ----
  const galleryItems = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("lightbox");
  const lightboxContent = document.getElementById("lightbox-content");
  const lightboxClose = document.getElementById("lightbox-close");

  if (galleryItems.length && lightbox) {
    galleryItems.forEach(item => {
      item.addEventListener("click", () => {
        const caption = item.getAttribute("data-caption") || "Gallery Image";
        const img = item.querySelector("img");

        if (img) {
          lightboxContent.innerHTML = `<img src="${img.src}" alt="${caption}" style="max-width:100%; max-height:80vh; border-radius:4px;">`;
        } else {
          lightboxContent.innerHTML = `<span style="padding:60px 80px; display:block;">${caption}<br><br><span style="color:#555; font-size:0.9rem;">[ Full-size photo will display here once images are added ]</span></span>`;
        }

        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
      });
    });

    // Close lightbox
    const closeLightbox = () => {
      lightbox.classList.remove("active");
      document.body.style.overflow = "";
    };

    if (lightboxClose) {
      lightboxClose.addEventListener("click", closeLightbox);
    }

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("active")) {
        closeLightbox();
      }
    });
  }

  // ---- Form Validation & Submission ----
  function setupForm(formId, successId) {
    const form = document.getElementById(formId);
    const success = document.getElementById(successId);

    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let isValid = true;

      // Clear previous errors
      form.querySelectorAll(".form-group").forEach(group => {
        group.classList.remove("error");
      });

      // Validate required fields
      form.querySelectorAll("[required]").forEach(field => {
        const group = field.closest(".form-group");

        if (field.type === "email") {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(field.value.trim())) {
            group.classList.add("error");
            isValid = false;
          }
        } else if (field.tagName === "SELECT") {
          if (!field.value) {
            group.classList.add("error");
            isValid = false;
          }
        } else {
          if (!field.value.trim()) {
            group.classList.add("error");
            isValid = false;
          }
        }
      });

      if (isValid) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;

        const formData = new FormData(form);

        fetch("https://formspree.io/f/mgopbvqo", {
          method: "POST",
          body: formData,
          headers: { "Accept": "application/json" }
        })
        .then(response => {
          if (response.ok) {
            form.style.display = "none";
            if (success) {
              success.classList.add("active");
            }
            window.scrollTo({
              top: (success || form).offsetTop - 120,
              behavior: "smooth"
            });
          } else {
            throw new Error("Form submission failed");
          }
        })
        .catch(() => {
          alert("Something went wrong. Please try again or call us directly.");
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        });
      } else {
        // Scroll to first error
        const firstError = form.querySelector(".form-group.error");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });

    // Clear error on input
    form.querySelectorAll("input, textarea, select").forEach(field => {
      field.addEventListener("input", () => {
        const group = field.closest(".form-group");
        if (group) group.classList.remove("error");
      });
    });
  }

  setupForm("contact-form", "contact-success");
  setupForm("booking-form", "booking-success");

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

});
