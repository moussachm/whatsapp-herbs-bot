@echo off
REM ============================================================
REM  ارفع المشروع على GitHub بنقرة واحدة
REM
REM  الاستخدام:
REM    1. انقر مرتين على هذا الملف
REM    2. الصق التوكن لما يُطلب منك
REM
REM  احصل على التوكن من:
REM    https://github.com/settings/tokens
REM    Generate new token (classic) -> اختار: repo + workflow
REM ============================================================

setlocal

set GITHUB_USER=moussachm
set REPO_NAME=whatsapp-herbs-bot

echo.
echo ============================================
echo   رفع المشروع على GitHub
echo ============================================
echo   الحساب: %GITHUB_USER%
echo   المستودع: %REPO_NAME%
echo ============================================
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo [خطأ] git غير مثبت. حمله من https://git-scm.com
  pause
  exit /b 1
)

REM --- التهيئة ---
if not exist ".git" git init -b main

git config user.name  "%GITHUB_USER%"
git config user.email "%GITHUB_USER%@users.noreply.github.com"

git add -A
git commit -m "chore: تحديث الملفات" >nul 2>nul

REM --- الربط ---
set REMOTE=https://github.com/%GITHUB_USER%/%REPO_NAME%.git

git remote get-url origin >nul 2>nul
if errorlevel 1 (
  git remote add origin %REMOTE%
) else (
  git remote set-url origin %REMOTE%
)

echo.
echo --------------------------------------------
echo  جاري الرفع...
echo.
echo  سيُطلب منك:
echo     Username: %GITHUB_USER%
echo     Password: (الصق التوكن ghp_... هنا)
echo --------------------------------------------
echo.

git push -u origin main

if errorlevel 1 (
  echo.
  echo [فشل الرفع]
  echo.
  echo  تأكد من:
  echo   1. أنك أنشأت المستودع: https://github.com/new
  echo      باسم: %REPO_NAME%  (Public، بدون README)
  echo   2. أنك تستخدم التوكن وليس كلمة المرور
  echo.
  pause
  exit /b 1
)

echo.
echo ============================================
echo   تم الرفع بنجاح!
echo ============================================
echo.
echo   الخطوة الأخيرة (مرة واحدة):
echo.
echo   1. افتح صفحة الإعدادات:
echo      https://github.com/%GITHUB_USER%/%REPO_NAME%/settings/pages
echo.
echo   2. في Source اختار:  GitHub Actions
echo.
echo   3. انتظر دقيقتين، ورابطك:
echo      https://%GITHUB_USER%.github.io/%REPO_NAME%/
echo.
echo ============================================
echo.

start https://github.com/%GITHUB_USER%/%REPO_NAME%/settings/pages
pause
