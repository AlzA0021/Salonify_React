# Salonify Backend API

Backend API برای پلتفرم رزرو آنلاین سالن‌های زیبایی (شبیه فرشا) با استفاده از Django و Django REST Framework.

## ✨ ویژگی‌ها

### برای مشتریان:
- 🔐 ثبت‌نام و ورود با شماره موبایل و OTP
- 🔍 جستجو و فیلتر سالن‌های زیبایی
- 📍 جستجو بر اساس موقعیت جغرافیایی
- 📅 رزرو آنلاین نوبت
- 📱 مدیریت نوبت‌ها (مشاهده، کنسل)
- ⭐ امتیازدهی و نظر دادن
- 👤 مدیریت پروفایل کاربری

### برای صاحبان سالن:
- 🏪 ثبت و مدیریت پروفایل کسب‌وکار
- 💇 مدیریت خدمات و قیمت‌گذاری
- 👥 مدیریت کارمندان و برنامه کاری
- 📊 داشبورد و آمار فروش
- 📆 تقویم نوبت‌ها
- 💬 پاسخ به نظرات

## 🛠️ تکنولوژی‌ها

- **Framework:** Django 5.0.1
- **API:** Django REST Framework 3.14.0
- **Authentication:** JWT (Simple JWT)
- **Database:** PostgreSQL
- **Cache:** Redis
- **Task Queue:** Celery
- **Documentation:** Swagger/ReDoc (drf-yasg)

## 📦 نصب و راه‌اندازی

### پیش‌نیازها

- Python 3.10+
- PostgreSQL 14+
- Redis 6+

### مراحل نصب

1. **کلون کردن پروژه:**
```bash
git clone <repository-url>
cd backend
```

2. **ایجاد محیط مجازی:**
```bash
python -m venv venv
source venv/bin/activate  # در Windows: venv\Scripts\activate
```

3. **نصب وابستگی‌ها:**
```bash
pip install -r requirements.txt
```

4. **تنظیمات محیطی:**
```bash
cp .env.example .env
# ویرایش فایل .env و تنظیم متغیرها
```

5. **ایجاد دیتابیس:**
```bash
# در PostgreSQL
createdb salonify_db
```

6. **اجرای Migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

7. **ایجاد سوپریوزر:**
```bash
python manage.py createsuperuser
```

8. **اجرای سرور:**
```bash
python manage.py runserver
```

سرور روی `http://localhost:8000` در دسترس خواهد بود.

## 📚 مستندات API

بعد از اجرای پروژه، می‌توانید مستندات API را در آدرس‌های زیر مشاهده کنید:

- **Swagger UI:** http://localhost:8000/swagger/
- **ReDoc:** http://localhost:8000/redoc/

## 🔑 API Endpoints اصلی

### Authentication
```
POST   /api/auth/register/          - ثبت‌نام
POST   /api/auth/login/             - ورود
POST   /api/auth/logout/            - خروج
POST   /api/auth/send-otp/          - ارسال کد تایید
POST   /api/auth/verify-otp/        - تایید کد
GET    /api/auth/me/                - اطلاعات کاربر
PUT    /api/auth/profile/           - بروزرسانی پروفایل
POST   /api/auth/change-password/   - تغییر رمز عبور
```

### Business (Customer)
```
GET    /api/businesses/                      - لیست سالن‌ها
GET    /api/businesses/{id}/                 - جزئیات سالن
GET    /api/businesses/{id}/services/        - خدمات سالن
GET    /api/businesses/{id}/staff/           - کارمندان سالن
GET    /api/businesses/{id}/reviews/         - نظرات سالن
GET    /api/businesses/{id}/available-slots/ - ساعات خالی
```

### Bookings (Customer)
```
POST   /api/bookings/                - ایجاد رزرو
GET    /api/bookings/my-bookings/    - لیست رزروهای من
GET    /api/bookings/{id}/           - جزئیات رزرو
POST   /api/bookings/{id}/cancel/    - کنسل رزرو
POST   /api/bookings/{id}/rate/      - امتیاز دادن
```

### Partner (Business Owner)
```
GET    /api/partner/dashboard/stats/        - آمار داشبورد
GET    /api/partner/bookings/               - لیست رزروها
PATCH  /api/partner/bookings/{id}/status/   - تغییر وضعیت رزرو
GET    /api/partner/calendar/               - تقویم نوبت‌ها
GET    /api/partner/services/               - لیست خدمات
POST   /api/partner/services/               - افزودن خدمت
GET    /api/partner/staff/                  - لیست کارمندان
POST   /api/partner/staff/                  - افزودن کارمند
```

## 🗃️ ساختار دیتابیس

پروژه شامل مدل‌های زیر است:

- **User:** کاربران (مشتری، صاحب کسب‌وکار، کارمند)
- **OTP:** کدهای تایید
- **Business:** کسب‌وکارها/سالن‌ها
- **Category:** دسته‌بندی کسب‌وکارها
- **Service:** خدمات
- **Staff:** کارمندان
- **Booking:** رزروها
- **Review:** نظرات و امتیازها
- **City/Area:** شهرها و مناطق

## 🔧 تنظیمات پیشرفته

### اجرای Celery برای Task Queue:
```bash
# Worker
celery -A config worker -l info

# Beat (برای scheduled tasks)
celery -A config beat -l info
```

### اجرای Redis:
```bash
redis-server
```

## 🧪 تست

```bash
python manage.py test
```

## 🚀 استقرار در Production

1. تنظیم `DEBUG=False` در `.env`
2. تنظیم `ALLOWED_HOSTS`
3. جمع‌آوری فایل‌های استاتیک:
```bash
python manage.py collectstatic
```
4. استفاده از Gunicorn:
```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

## 📝 نکات مهم

- همیشه از محیط مجازی (Virtual Environment) استفاده کنید
- فایل `.env` را در گیت کامیت نکنید
- قبل از اجرا حتماً Redis و PostgreSQL را راه‌اندازی کنید
- برای ارسال SMS واقعی، API Key سرویس پیامکی را تنظیم کنید

## 🤝 مشارکت

برای مشارکت در پروژه:
1. Fork کنید
2. Branch جدید بسازید
3. تغییرات را Commit کنید
4. Push کنید
5. Pull Request ایجاد کنید

## 📄 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

## 📧 تماس

برای سوالات و پشتیبانی با ما تماس بگیرید.
