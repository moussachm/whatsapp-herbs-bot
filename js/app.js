/**
 * app.js
 * يربط واجهة المحادثة بمحرك الردود في bot.js
 */

const chatBody   = document.getElementById("chatBody");
const chatForm   = document.getElementById("chatForm");
const userInput  = document.getElementById("userInput");
const typingEl   = document.getElementById("typing");
const resetBtn   = document.getElementById("resetBtn");
const suggestionsEl = document.getElementById("suggestions");

/* ===== اقتراحات جاهزة للعميل ===== */
const SUGGESTIONS = [
  "السلام عليكم",
  "عندكم زعفران؟",
  "بكم زيت الأرغان؟",
  "إيش أقسامكم؟",
  "قائمة الأسعار",
  "توصلون للبيت؟",
  "عندكم شي للنوم؟",
  "أبغى أتكلم مع موظف",
];

function renderSuggestions() {
  suggestionsEl.innerHTML = "";
  SUGGESTIONS.forEach((text) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = text;
    btn.addEventListener("click", () => {
      userInput.value = text;
      chatForm.requestSubmit();
    });
    suggestionsEl.appendChild(btn);
  });
}

/* ===== أدوات مساعدة ===== */

function nowTime() {
  return new Date().toLocaleTimeString("ar-LY", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scrollToBottom() {
  chatBody.scrollTop = chatBody.scrollHeight;
}

/**
 * إضافة رسالة للمحادثة.
 * يدعم *النص* للتشديد كما في واتساب.
 */
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `msg ${sender}`;

  const safe = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const html = safe.replace(/\*(.+?)\*/g, "<strong>$1</strong>");

  div.innerHTML = `${html}<span class="msg-time">${nowTime()}</span>`;
  chatBody.appendChild(div);
  scrollToBottom();
}

function showTyping(show) {
  typingEl.hidden = !show;
  if (show) scrollToBottom();
}

/* ===== إرسال الرسالة ===== */

let isReplying = false;

function handleSend(text) {
  const cleaned = text.trim();
  if (!cleaned || isReplying) return;

  addMessage(cleaned, "user");
  userInput.value = "";

  const { text: reply, delay } = getBotReply(cleaned);

  isReplying = true;
  showTyping(true);

  setTimeout(() => {
    showTyping(false);
    addMessage(reply, "bot");
    isReplying = false;
  }, Math.min(delay, 1100));
}

/* ===== الأحداث ===== */

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSend(userInput.value);
});

resetBtn.addEventListener("click", startConversation);

function startConversation() {
  chatBody.innerHTML = "";
  isReplying = false;
  showTyping(false);

  addMessage(
    `أهلاً وسهلاً بك في ${STORE_INFO.name} 🌿\n\nأنا المساعد الذكي للمحل، أقدر أجاوبك عن:\n• المنتجات والأسعار\n• الفوائد وطريقة الاستخدام\n• التوصيل وطرق الدفع\n\nاكتب استفسارك أو اختر من الاقتراحات 👈`,
    "bot"
  );
}

/* ===== الإقلاع ===== */

renderSuggestions();
startConversation();
userInput.focus();
