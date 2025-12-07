// --------------------------------------------------
// MASTER TEMPLATE LISTS (7 human + 6 pet templates)
// --------------------------------------------------

const HUMAN_TEMPLATES = [
  "Golden Legacy template.png",
  "Custom Legacy Noir Template.png",
  "Custom Memorial Product Orders.png",
  "Iris Remembrance Template.png",
  "Legacy Doves.png",
  "Legacy of Rose.png",
  "Legacy Shadow Template.png"
];

const PET_TEMPLATES = [
  "Antique Gold Legacy Frame.png",
  "Legacy Halo Wings.png",
  "Minimalist Tribute.png",
  "Modern Collage Scrapbook.png",
  "Photo Frame Legacy.png",
  "Rainbow Bridge Cloud.png"
];


// --------------------------------------------------
// GLOBAL STATE
// --------------------------------------------------

let projectType = "";
let selectedPersonOrPet = "";
let selectedTemplate = "";
let uploadedImage = null;


// --------------------------------------------------
// STEP NAVIGATION
// --------------------------------------------------

function goToStep(id) {
  document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}


// --------------------------------------------------
// VALIDATE STEP 1
// --------------------------------------------------

function validateStep1() {
  const name = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const selected = document.querySelector("input[name='projectType']:checked");

  if (!name || !email || !selected) {
    alert("Please complete all required fields.");
    return;
  }

  projectType = selected.value;

  if (projectType === "keepsake") {
    goToStep("step2aKeepsake");
  } else {
    alert("Other product types will be added next.");
  }
}


// --------------------------------------------------
// CHOOSE HUMAN or PET
// --------------------------------------------------

function setPersonOrPet(type) {
  selectedPersonOrPet = type;

  document.querySelectorAll("input[name='honorType']").forEach(r => {
    r.checked = (r.value === type);
  });

  loadTemplates();
}


// --------------------------------------------------
// LOAD TEMPLATE GRID
// --------------------------------------------------

function loadTemplates() {
  const container = document.getElementById("templateGrid");
  container.innerHTML = "";

  const list =
    selectedPersonOrPet === "human"
      ? HUMAN_TEMPLATES
      : selectedPersonOrPet === "pet"
      ? PET_TEMPLATES
      : [];

  list.forEach(filename => {
    const card = document.createElement("div");
    card.className = "template-card";

    card.innerHTML = `
      <img src="./templates/${filename}" class="template-thumb">
      <p class="template-title">${filename.replace(".png", "")}</p>
    `;

    card.onclick = () => {
      selectedTemplate = filename;
      highlightSelected(card);
      updateTemplatePreview(filename);
    };

    container.appendChild(card);
  });
}

function highlightSelected(card) {
  document.querySelectorAll(".template-card").forEach(c =>
    c.classList.remove("selected")
  );
  card.classList.add("selected");
}


// --------------------------------------------------
// TEMPLATE PREVIEW
// --------------------------------------------------

function updateTemplatePreview(filename) {
  const preview = document.getElementById("templatePreview");
  preview.src = "./templates/" + filename;
  preview.style.display = "block";
}


// --------------------------------------------------
// IMAGE UPLOAD
// --------------------------------------------------

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    uploadedImage = img;
    updateMockup();
  };
  img.src = URL.createObjectURL(file);
}


// --------------------------------------------------
// LIVE MOCKUP
// --------------------------------------------------

function updateMockup() {
  if (!selectedTemplate || !uploadedImage) return;

  const canvas = document.getElementById("mockupCanvas");
  const ctx = canvas.getContext("2d");

  const template = new Image();
  template.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw template
    ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

    // draw uploaded image
    const w = canvas.width * 0.65;
    const h = w * (uploadedImage.height / uploadedImage.width);
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;

    ctx.drawImage(uploadedImage, x, y, w, h);

    // custom wording
    const text = document.getElementById("customWording")?.value || "";
    if (text) {
      ctx.font = "bold 32px Playfair Display";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(text, canvas.width / 2, canvas.height - 40);
    }

    document.getElementById("mockupPreviewSection").style.display = "block";
  };

  template.src = "./templates/" + selectedTemplate;
}


// --------------------------------------------------
// SUBMIT TO GOOGLE APPS SCRIPT
// --------------------------------------------------

async function submitForm() {
  const WEBHOOK_URL =
    "https://script.google.com/macros/s/AKfycbwPV_iWlvjExlZmbjMGMazZThGdBe7LFarZOsvmDLKCArF0Y-jnb520s3uhoqwqdma5/exec";

  const formData = {
    fullName: document.getElementById("fullName").value,
    email: document.getElementById("email").value,
    projectType,
    selectedPersonOrPet,
    selectedTemplate,
    honoredName: document.getElementById("honoredName")?.value || "",
    customWording: document.getElementById("customWording")?.value || "",
    orderNumber: document.getElementById("orderNumber")?.value || ""
  };

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    goToStep("successScreen");
    setTimeout(() => launchConfetti(), 300);

  } catch (err) {
    console.error(err);
    alert("There was an error submitting your form.");
  }
}


// --------------------------------------------------
// CONFETTI
// --------------------------------------------------

function launchConfetti() {
  const end = Date.now() + 3000;
  const colors = ["#ff0000", "#ff7f00", "#ffff00", "#00ff00",
                  "#00ffff", "#0000ff", "#8b00ff", "#e9c46a",
                  "#ffffff", "#000000", "#9b59b6"];

  (function frame() {
    const p = document.createElement("div");
    p.style.position = "fixed";
    p.style.zIndex = "9999";
    p.style.width = "12px";
    p.style.height = "12px";
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.borderRadius = "50%";
    p.style.top = "-20px";
    p.style.left = Math.random() * window.innerWidth + "px";
    p.style.opacity = "0.95";
    p.style.transition = "transform 3s linear, opacity 3s ease-out";

    document.body.appendChild(p);

    setTimeout(() => {
      p.style.transform = `translateY(${window.innerHeight}px)`;
      p.style.opacity = "0";
    }, 10);

    setTimeout(() => p.remove(), 3000);

    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
