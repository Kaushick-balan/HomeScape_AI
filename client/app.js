let chatHistory = [];

// =========================
// HERO HIDE ON SCROLL
// =========================

const heroSection = document.querySelector(".hero-content");

window.addEventListener("scroll", () => {
  // only on homepage
  const homePage = document.getElementById("homePage");

  if (!homePage.classList.contains("activePage")) {
    return;
  }

  if (window.scrollY > 120) {
    heroSection.classList.add("hide-hero");
  } else {
    heroSection.classList.remove("hide-hero");
  }
});

// =========================
// CHAT FUNCTIONS
// =========================

async function sendMessage() {
  const msg = document.getElementById("message").value;
  const chatBox = document.getElementById("chatBox");
  const loader = document.getElementById("loader");

  // ❗ Remove "empty state" text when first message comes
  document.querySelector(".empty")?.remove();

  // Show user message
  chatBox.innerHTML += `<div class="user-msg">${msg}</div>`;

  // Add to chat history
  chatHistory.push({ role: "user", content: msg });

  loader.classList.remove("hidden"); // show loader

  const res = await fetch("http://localhost:5000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history: chatHistory }),
  });

  const data = await res.json();

  loader.classList.add("hidden"); // hide loader

  // Add AI reply to history
  chatHistory.push({ role: "assistant", content: data.reply });

  // Show AI reply
  chatBox.innerHTML += `<div class="ai-msg">${data.reply}</div>`;

  chatBox.scrollTop = chatBox.scrollHeight;

  // Clear input
  document.getElementById("message").value = "";
}

// =========================
// SCROLL TO SERVICES
// =========================

const serviceBtn = document.querySelector("#serviceBtn");

if (serviceBtn) {
  serviceBtn.addEventListener("click", () => {
    document.getElementById("services").scrollIntoView({
      behavior: "smooth",
    });
  });
}

// SHOW ONLY SERVICES PAGE

// =========================
// PAGE NAVIGATION
// =========================

function showServices() {
  document.getElementById("homePage").classList.remove("activePage");

  document.getElementById("servicesPage").classList.add("activePage");
}

function showPage(pageId) {
  console.log("Navigating to:", pageId);

  // Reset hero collapse when changing pages
  const heroSection = document.querySelector(".hero");
  if (heroSection) {
    heroSection.classList.remove("collapsed");
  }

  // Scroll to top when switching pages
  window.scrollTo(0, 0);

  // Hide all pages
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("activePage");
  });

  // Find selected page
  const selectedPage = document.getElementById(pageId);

  if (!selectedPage) {
    console.error("Page not found:", pageId);
    return;
  }

  // Show selected page
  selectedPage.classList.add("activePage");

  // AI Chat Initialization
  if (pageId === "aiChatPage") {
    const chatContainer = document.getElementById("chatContainer");

    // Prevent duplicate initialization
    if (!chatContainer.dataset.initialized) {
      // Force scrollbar to always be visible
      chatContainer.classList.add("always-scroll");
      // Set overflow-y to scroll to always show scrollbar
      chatContainer.style.overflowY = "scroll";

      setTimeout(() => {
        addChatMessage(
          "Hello! I'm your AI home design assistant. I'll help you create your dream space.",
          "ai",
        );

        setTimeout(() => {
          startChatQuestionFlow();
        }, 1000);
      }, 500);

      chatContainer.dataset.initialized = "true";
    }
  }
}
// =========================
// AI CHAT FUNCTIONALITY
// =========================

// AI Questions Flow
const chatQuestions = [
  "What type of room are you designing?",
  "What are room dimensions?",
  "What is your budget?",
  "What is expected project duration?",
  "What design style do you prefer?",
];

let chatCurrentQuestionIndex = 0;
let chatUserResponses = {};
let chatIsAskingQuestions = false;

// Start AI Question Flow
function startChatQuestionFlow() {
  chatCurrentQuestionIndex = 0;
  chatUserResponses = {};
  chatIsAskingQuestions = true;
  askNextChatQuestion();
}

// Ask Next Question
function askNextChatQuestion() {
  if (chatCurrentQuestionIndex < chatQuestions.length) {
    const question = chatQuestions[chatCurrentQuestionIndex];
    showChatTypingIndicator();

    setTimeout(() => {
      hideChatTypingIndicator();
      addChatMessage(question, "ai");
    }, 1000);
  } else {
    // All questions answered
    chatIsAskingQuestions = false;
    showChatTypingIndicator();

    setTimeout(() => {
      hideChatTypingIndicator();
      addChatMessage(
        "Perfect! I have all the information I need. Let me create a personalized design plan for your space. You can now generate a blueprint or ask me any specific questions about your design.",
        "ai",
      );
    }, 1500);
  }
}

// Get Question Key for Storage
function getChatQuestionKey(index) {
  const keys = ["roomType", "dimensions", "budget", "timeline", "style"];
  return keys[index];
}

// Update Project Summary from Responses
function updateChatProjectSummary() {
  if (chatUserResponses.roomType) {
    document.getElementById("roomType").textContent =
      chatUserResponses.roomType;
  }
  if (chatUserResponses.budget) {
    document.getElementById("budget").textContent = chatUserResponses.budget;
  }
  if (chatUserResponses.timeline) {
    document.getElementById("timeline").textContent =
      chatUserResponses.timeline;
  }
  if (chatUserResponses.style) {
    document.getElementById("style").textContent = chatUserResponses.style;
  }
}

// Add Message to Chat
function addChatMessage(text, sender) {
  const chatContainer = document.getElementById("chatContainer");
  const typingIndicator = document.getElementById("typingIndicator");

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;

  const avatarDiv = document.createElement("div");
  avatarDiv.className = "message-avatar";
  avatarDiv.innerHTML =
    sender === "user"
      ? '<i class="fas fa-user"></i>'
      : '<i class="fas fa-robot"></i>';

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";
  contentDiv.innerHTML = text;

  messageDiv.appendChild(avatarDiv);
  messageDiv.appendChild(contentDiv);

  chatContainer.insertBefore(messageDiv, typingIndicator);

  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Show/Hide Typing Indicator
function showChatTypingIndicator() {
  const chatContainer = document.getElementById("chatContainer");
  document.getElementById("typingIndicator").style.display = "flex";

  // Auto-scroll to bottom when typing indicator appears
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function hideChatTypingIndicator() {
  document.getElementById("typingIndicator").style.display = "none";
}

// Handle Enter Key
function handleChatKeyPress(event) {
  if (event.key === "Enter") {
    sendChatMessage();
  }
}

// Send Message Function
function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();

  if (message === "") return;

  // Add user message
  addChatMessage(message, "user");

  chatHistory.push({
    role: "user",
    content: message,
  });
  // Clear input
  input.value = "";

  // Handle response based on current state
  if (false) {
    // Store user response
    const questionKey = getChatQuestionKey(chatCurrentQuestionIndex);
    chatUserResponses[questionKey] = message;

    // Update project summary
    updateChatProjectSummary();

    // Move to next question
    chatCurrentQuestionIndex++;

    // Ask next question after delay
    setTimeout(() => {
      askNextChatQuestion();
    }, 1000);
  } else {
    // Regular AI response
    showChatTypingIndicator();

    setTimeout(() => {
      hideChatTypingIndicator();
      showChatTypingIndicator();

      fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: chatHistory,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          hideChatTypingIndicator();

          addChatMessage(data.reply, "ai");

          chatHistory.push({
            role: "assistant",
            content: data.reply,
          });
        })
        .catch((error) => {
          hideChatTypingIndicator();

          console.error(error);

          addChatMessage("Error connecting to AI server.", "ai");
        });
    }, 1500);
  }
}

// File Attachment Function
function attachChatFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*,.pdf,.doc,.docx";
  input.onchange = function (e) {
    const file = e.target.files[0];
    if (file) {
      addChatMessage(`📎 Attached: ${file.name}`, "user");
      addChatMessage(
        "I've received your file. Let me analyze it and provide design recommendations based on what I see.",
        "ai",
      );
    }
  };
  input.click();
}

// Voice Input Function
function startChatVoiceInput() {
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = function () {
      addChatMessage("🎤 Listening... Speak now!", "ai");
    };

    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript;
      document.getElementById("chatInput").value = transcript;
      addChatMessage(`🎤 Voice input: "${transcript}"`, "user");
      sendChatMessage();
    };

    recognition.onerror = function (event) {
      addChatMessage(
        "❌ Voice recognition error. Please try again or type your message.",
        "ai",
      );
    };

    recognition.start();
  } else {
    addChatMessage(
      "❌ Voice recognition is not supported in your browser. Please use text input instead.",
      "ai",
    );
  }
}

// Generate Blueprint Function
function generateChatBlueprint() {
  if (Object.keys(chatUserResponses).length === 0) {
    showChatPopup(
      "info",
      "Information Required",
      "Please answer AI questions first to generate a personalized blueprint.",
    );
    return;
  }

  showChatPopup(
    "success",
    "Blueprint Generated",
    "Your personalized blueprint is being generated! This would normally include detailed floor plans, 3D visualizations, and material recommendations.",
  );

  // In a real application, this would generate an actual blueprint
  addChatMessage(
    "🏗️ Generating your personalized blueprint with detailed floor plans, 3D visualizations, and material recommendations...",
    "ai",
  );

  setTimeout(() => {
    addChatMessage(
      "✅ Your blueprint is ready! It includes optimized furniture layout, lighting design, color schemes, and a complete materials list.",
      "ai",
    );
  }, 2000);
}

// Popup Functions
function showChatPopup(type, title, message) {
  // Remove existing popup
  const existingPopup = document.querySelector(".chat-popup-overlay");
  if (existingPopup) {
    existingPopup.remove();
  }

  // Create popup
  const popupOverlay = document.createElement("div");
  popupOverlay.className = "chat-popup-overlay";
  popupOverlay.innerHTML = `
        <div class="chat-popup">
            <div class="chat-popup-header">
                <h3>${title}</h3>
                <button class="chat-popup-close" onclick="closeChatPopup()">×</button>
            </div>
            <div class="chat-popup-content">
                <p>${message}</p>
            </div>
            <div class="chat-popup-actions">
                <button class="chat-popup-btn" onclick="closeChatPopup()">OK</button>
            </div>
        </div>
    `;

  document.body.appendChild(popupOverlay);
}

function closeChatPopup() {
  const popup = document.querySelector(".chat-popup-overlay");
  if (popup) {
    popup.remove();
  }
}

// =========================
// DESIGN PAGE (samples + steps)
// =========================
const designData = {
  modernLiving: {
    title: "Modern Living Room",
    subtitle:
      "A simple, realistic workflow to plan layout, materials, lighting, and finishing touches.",
    previewImg:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
    previewAlt: "Modern living room design preview",
    steps: [
      {
        title: "Define your room goal",
        text: "Decide what the space should feel like (calm, bright, cozy) and choose 2-3 priorities (storage, seating comfort, lighting).",
      },
      {
        title: "Plan layout & traffic flow",
        text: "Place the main sofa first, then arrange side tables and a focal element (TV/art) while keeping at least one clear walking path.",
      },
      {
        title: "Pick a style + color palette",
        text: "Choose a base neutral (warm white/greige), add one accent (terracotta/charcoal), and keep finishes consistent (same wood tone).",
      },
      {
        title: "Select key materials & lighting",
        text: "Combine soft surfaces (fabric) with durable ones (wood/metal). Add layered lighting: overhead + floor/lamp for warmth.",
      },
      {
        title: "Add practical finishing touches",
        text: "Use a rug for cohesion, style shelves minimally, and add curtains that match your wall color for a polished look.",
      },
    ],
  },
  scandiBedroom: {
    title: "Scandinavian Bedroom",
    subtitle:
      "A clean and warm step-by-step plan: maximize light, keep clutter low, and build comfort with texture.",
    previewImg:
      "https://images.unsplash.com/photo-1505691723518-36a5ac3b2f5b?auto=format&fit=crop&w=1200&q=80",
    previewAlt: "Scandinavian bedroom design preview",
    steps: [
      {
        title: "Choose a calming mood",
        text: "Pick a vibe: airy and minimal or slightly warmer. This decides your textures, bedding colors, and curtain style.",
      },
      {
        title: "Optimize storage for less clutter",
        text: "Plan closed storage for daily items. Keep surfaces light so the room feels breathable and tidy.",
      },
      {
        title: "Build contrast with light woods",
        text: "Use light oak/birch tones and pair with whites/soft grays. Add one dark element (black frame or lamp base) to anchor the look.",
      },
      {
        title: "Layer textures for comfort",
        text: "Combine linen/cotton bedding with a chunky knit throw and a textured rug. Texture is your “design” in Scandi style.",
      },
      {
        title: "Focus lighting for bedtime",
        text: "Use warm bulbs (2700K), add bedside lamps, and consider a dimmable overhead option to make evenings relaxing.",
      },
    ],
  },
  contempKitchen: {
    title: "Contemporary Kitchen",
    subtitle:
      "A step-by-step kitchen plan focusing on clean lines, durable finishes, and efficient workflow.",
    previewImg:
      "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1200&q=80",
    previewAlt: "Contemporary kitchen design preview",
    steps: [
      {
        title: "Map your kitchen workflow",
        text: "Plan the “work triangle” (sink, stove, fridge). Keep clear counter space between these zones.",
      },
      {
        title: "Choose the cabinet + countertop story",
        text: "Pick one hero material (quartz, marble-look, or solid surface). Keep cabinets simple and consistent in finish.",
      },
      {
        title: "Select modern hardware and lighting",
        text: "Match cabinet hardware to faucet/fixtures. Add task lighting under cabinets and bright, even overhead lighting.",
      },
      {
        title: "Plan backsplashes and durability",
        text: "Use a backsplash that is easy to clean and visually consistent. Consider stain-resistance near cooking areas.",
      },
      {
        title: "Finish with thoughtful details",
        text: "Choose a minimal backsplash profile, add a statement pendant (if layout allows), and keep décor functional (trays, organizers).",
      },
    ],
  },
};

function initDesignPage() {
  const titleEl = document.getElementById("designTitle");
  const subtitleEl = document.getElementById("designSubtitle");
  const previewImg = document.getElementById("designPreviewImg");
  const stepsEl = document.getElementById("designSteps");
  const sampleButtons = document.querySelectorAll(
    ".design-sample-btn[data-design-id]",
  );

  // If the design page isn't on this screen, do nothing.
  if (
    !titleEl ||
    !subtitleEl ||
    !previewImg ||
    !stepsEl ||
    sampleButtons.length === 0
  )
    return;

  const renderDesign = (designId) => {
    const data = designData[designId];
    if (!data) return;

    titleEl.textContent = data.title;
    subtitleEl.textContent = data.subtitle;
    previewImg.src = data.previewImg;
    previewImg.alt = data.previewAlt;

    stepsEl.innerHTML = data.steps
      .map(
        (step, idx) => `
        <div class="design-step">
          <div class="design-step-num">${idx + 1}</div>
          <div>
            <h3>${step.title}</h3>
            <p>${step.text}</p>
          </div>
        </div>
      `,
      )
      .join("");

    sampleButtons.forEach((btn) => {
      const isActive = btn.dataset.designId === designId;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  };

  sampleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const designId = btn.dataset.designId;
      renderDesign(designId);
      stepsEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Initial render (matches the default "active" sample card)
  renderDesign("modernLiving");
}

initDesignPage();
