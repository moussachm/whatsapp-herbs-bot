#!/usr/bin/env bash
# ============================================================
#  نشر المشروع على GitHub + تشغيل GitHub Pages
#
#  الاستخدام:
#    1. افتح هذا الملف بمحرر، وضع اسم المستخدم في GITHUB_USER
#    2. شغّل:  bash publish.sh
#    3. لما يطلب منك كلمة المرور، اكتب Personal Access Token
#       (مو كلمة مرور الحساب!)
#
#  كيف تجيب التوكن:
#    GitHub -> Settings -> Developer settings -> Personal access tokens
#    -> Tokens (classic) -> Generate new token (classic)
#    -> اختر صلاحية: repo  +  workflow
# ============================================================

set -e

GITHUB_USER="${GITHUB_USER:-moussachm}"
REPO_NAME="${REPO_NAME:-whatsapp-herbs-bot}"

echo "🌿 نشر مشروع: $REPO_NAME"
echo "👤 الحساب:    $GITHUB_USER"
echo ""

# --- 1) تأكد من وجود git ---
if ! command -v git >/dev/null 2>&1; then
  echo "❌ git غير مثبّت. حمّله من https://git-scm.com"
  exit 1
fi

# --- 2) التهيئة والالتزام ---
if [ ! -d ".git" ]; then
  git init -b main
fi

git config user.name  "$GITHUB_USER"
git config user.email "$GITHUB_USER@users.noreply.github.com"

git add -A
git commit -m "chore: تحديث الملفات" || echo "ℹ️  لا يوجد تغييرات جديدة"

# --- 3) الربط بالمستودع البعيد ---
REMOTE="https://github.com/$GITHUB_USER/$REPO_NAME.git"

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE"
else
  git remote add origin "$REMOTE"
fi

echo ""
echo "🚀 جاري الرفع إلى: $REMOTE"
echo "   (سيُطلب منك اسم المستخدم + التوكن)"
echo ""

git push -u origin main

echo ""
echo "✅ تم الرفع بنجاح!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📌 الخطوة الأخيرة (يدوياً مرة واحدة):"
echo ""
echo "   1. افتح: https://github.com/$GITHUB_USER/$REPO_NAME/settings/pages"
echo "   2. في خانة Source اختر:  GitHub Actions"
echo "   3. انتظر دقيقتين، ورابط موقعك يصير:"
echo ""
echo "      🔗 https://$GITHUB_USER.github.io/$REPO_NAME/"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
