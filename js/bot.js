/**
 * bot.js
 * محرك الردود الذكي لوكيل خدمة العملاء.
 *
 * يشتغل بالكامل في المتصفح بدون أي سيرفر أو API خارجي.
 * المنطق: تحليل رسالة العميل بالكلمات المفتاحية -> اختيار الرد المناسب.
 *
 * ملاحظة للمطوّر: لو أردنا لاحقاً ربطه بـ LLM حقيقي (OpenAI / Claude)،
 * نستبدل الدالة getBotReply بنداء fetch إلى الـ API مع الاحتفاظ بنفس الواجهة.
 */

/* ============================================================
   1. النوايا (Intents) — كل نية لها كلمات مفتاحية ورد
   ============================================================ */

const INTENTS = [
  {
    id: "greeting",
    keywords: ["سلام", "مرحبا", "السلام عليكم", "هلا", "صباح", "مساء", "أهلا", "اهلا", "hi", "hello"],
    weight: 1,
    reply: () =>
      `وعليكم السلام ورحمة الله 🌿\nأهلاً بك في ${STORE_INFO.name}.\n\nكيف أقدر أساعدك اليوم؟ تقدر تسألني عن:\n• أنواع الأعشاب المتوفرة\n• أسعار التوابل\n• منتجات العناية والتجميل\n• التوصيل وطرق الدفع`,
  },
  {
    id: "hours",
    keywords: ["وقت", "أوقات", "دوام", "تفتحون", "تسكرون", "مفتوح", "العمل", "ساعات"],
    weight: 2,
    reply: () =>
      `🕐 أوقات عملنا: ${STORE_INFO.hours}\n\nوأنت مرتاح، أقدر أساعدك هنا على مدار الساعة 😊`,
  },
  {
    id: "delivery",
    keywords: ["توصيل", "توصلون", "شحن", "أوصل", "ديليفري", "delivery"],
    weight: 2,
    reply: () =>
      `🚚 ${STORE_INFO.delivery}\n\nللطلبات الكبيرة أو خارج المدينة، تواصل معنا مباشرة: ${STORE_INFO.phone}`,
  },
  {
    id: "payment",
    keywords: ["دفع", "أدفع", "الفلوس", "كاش", "تحويل", "فيزا", "بطاقة", "payment"],
    weight: 2,
    reply: () => `💳 طرق الدفع المتاحة: ${STORE_INFO.payment}`,
  },
  {
    id: "location",
    keywords: ["مكان", "عنوان", "وين", "موقع", "فين", "وصول", "location"],
    weight: 2,
    reply: () =>
      `📍 موقعنا: وسط المدينة، الشارع الرئيسي (بجانب الصيدلية الكبرى).\n\nتحب أرسل لك الموقع على الخريطة؟ تواصل معنا: ${STORE_INFO.phone}`,
  },
  {
    id: "price_list",
    keywords: ["الأسعار كاملة", "قائمة الأسعار", "قائمة اسعار", "برايس ليست", "price list", "كل الاسعار", "جميع الاسعار"],
    weight: 3,
    reply: () => {
      const byCategory = {};
      PRODUCTS.forEach((p) => {
        if (!byCategory[p.category]) byCategory[p.category] = [];
        byCategory[p.category].push(`• ${p.name} — ${p.price} ${STORE_INFO.currency} (${p.unit})`);
      });
      let out = `📋 *قائمة الأسعار*\n\n`;
      for (const [cat, items] of Object.entries(byCategory)) {
        out += `*${cat}:*\n${items.join("\n")}\n\n`;
      }
      out += `للطلب أو الاستفسار عن الكمية، اكتب اسم المنتج مباشرة.`;
      return out;
    },
  },
  {
    id: "thanks",
    keywords: ["شكرا", "شكراً", "مشكور", "تسلم", "يعطيك", "thanks", "thank"],
    weight: 1,
    reply: () =>
      `العفو 🌿 في خدمتك دائماً.\nإذا احتجت أي شي ثاني أنا موجود. دمتم بصحة وعافية!`,
  },
  {
    id: "bye",
    keywords: ["وداعا", "باي", "سلامات", "مع السلامة", "bye"],
    weight: 1,
    reply: () => `مع السلامة 🌿 نتشرف بخدمتك في أي وقت. ${STORE_INFO.name}`,
  },
  {
    id: "human",
    keywords: ["موظف", "بشري", "شخص", "كلمني", "اتصل", "رقم", "إنسان", "انسان", "human"],
    weight: 3,
    reply: () =>
      `📞 أكيد! تقدر تتواصل مع فريقنا مباشرة:\n${STORE_INFO.phone}\n\nأو اترك رقمك ونوع استفسارك، وراح نتواصل معك بأقرب وقت.`,
  },
  {
    id: "offers",
    keywords: ["عروض", "خصم", "تخفيض", "عرض", "خصومات", "offer", "تخفيضات"],
    weight: 2,
    reply: () =>
      `🎁 عروضنا الحالية:\n• خصم 10% على الطلبات فوق 200 ${STORE_INFO.currency}\n• عند شراء 3 أنواع أعشاب، الرابع عليه 50%\n\nالعروض سارية حتى نهاية الشهر.`,
  },
  {
    id: "categories",
    keywords: ["تقسيم", "أقسام", "تصنيفات", "المنتجات", "categories"],
    weight: 2,
    reply: () =>
      `🌿 عندنا ثلاثة أقسام رئيسية:\n\n*1) أعشاب* — للشاي والعلاج الطبيعي\n*2) توابل* — بهارات وخلطات للطبخ\n*3) تجميل* — زيوت وصوابين وعناية بالبشرة\n\nاكتب اسم أي منتج أو الفئة اللي تهمك وأعطيك التفاصيل.`,
  },
];

/* ============================================================
   2. الردود الجاهزة
   ============================================================ */

const FALLBACK_REPLIES = [
  `ما فهمت استفسارك تماماً 🤔\n\nتقدر تسألني عنه:\n• منتج معيّن (مثال: "عندكم زعفران؟")\n• الأسعار\n• التوصيل وطرق الدفع\n• أوقات العمل\n\nأو اكتب "موظف" وأوصلك بشخص من الفريق.`,
  `عذراً، ما عندي معلومة عن هذا الموضوع 🙏\n\nجرّب تسأل بصيغة ثانية، أو اكتب "موظف" للتواصل المباشر مع الفريق.`,
];

/* ============================================================
   3. المحرك الأساسي
   ============================================================ */

// normalizeArabic معرّفة في products.js (يُحمّل قبل هذا الملف)

function countMatches(normalizedMsg, keywords) {
  let score = 0;
  keywords.forEach((kw) => {
    const nk = normalizeArabic(kw);
    if (!nk) return;
    if (normalizedMsg.includes(nk)) score += nk.length > 4 ? 2 : 1;
  });
  return score;
}

/** يبحث عن منتجات ويصيغ رد عرض */
function buildProductReply(matches, customerText) {
  if (matches.length === 0) return null;

  if (matches.length === 1) {
    const p = matches[0];
    let stockNote = "";
    if (p.stock === 0) stockNote = `\n\n⚠️ نفدت الكمية حالياً — اكتب "موظف" ونخبرك عند وصولها.`;
    else if (p.stock < 5) stockNote = `\n\n⏳ الكمية محدودة (${p.stock} متبقي فقط) — أنصحك تحجز.`;

    return (
      `✅ *${p.name}*\n` +
      `الفئة: ${p.category}\n` +
      `السعر: *${p.price} ${STORE_INFO.currency}* / ${p.unit}\n\n` +
      `💡 الفوائد: ${p.benefits}\n` +
      `📖 طريقة الاستخدام: ${p.usage}` +
      stockNote +
      `\n\nتحب أجهّز لك طلب؟ اكتب الكمية المطلوبة.`
    );
  }

  let out = `لقيت ${matches.length} نتائج مطابقة لاستفسارك 🌿\n\n`;
  matches.forEach((p) => {
    out += `• *${p.name}* — ${p.price} ${STORE_INFO.currency} (${p.unit})\n`;
  });
  out += `\nاكتب اسم المنتج اللي يعجبك وأعطيك التفاصيل الكاملة.`;
  return out;
}

/**
 * الدالة الرئيسية: تأخذ رسالة العميل وترجع رد الوكيل.
 * @param {string} message
 * @returns {{text: string, intent: string, delay: number}}
 */
function getBotReply(message) {
  const raw = (message || "").trim();
  if (!raw) {
    return { text: FALLBACK_REPLIES[0], intent: "empty", delay: 400 };
  }

  const norm = normalizeArabic(raw);

  // 1) الأولوية للمنتجات (الأكثر تحديداً)
  const productMatches = searchProducts(raw);
  if (productMatches.length > 0) {
    return {
      text: buildProductReply(productMatches, raw),
      intent: "product",
      delay: 700,
    };
  }

  // 2) ثم النوايا بالكلمات المفتاحية
  let best = null;
  let bestScore = 0;

  INTENTS.forEach((intent) => {
    const score = countMatches(norm, intent.keywords) * intent.weight;
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  });

  if (best && bestScore > 0) {
    return {
      text: typeof best.reply === "function" ? best.reply() : best.reply,
      intent: best.id,
      delay: 500 + Math.random() * 400,
    };
  }

  // 3) لا شي مطابق
  return {
    text: FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)],
    intent: "fallback",
    delay: 800,
  };
}
