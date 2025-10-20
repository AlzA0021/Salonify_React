# 🚀 راهنمای کامل نصب و راه‌اندازی بک‌اند Salonify

## 📋 پیش‌نیازها

قبل از شروع نصب، مطمئن شوید که موارد زیر را نصب کرده‌اید:

1. **Python 3.10 یا بالاتر**
   ```bash
   python --version
   ```

2. **PostgreSQL 14 یا بالاتر**
   ```bash
   psql --version
   ```

3. **Redis 6 یا بالاتر**
   ```bash
   redis-server --version
   ```

## 🔧 مراحل نصب گام به گام

### مرحله 1: کلون کردن یا دانلود پروژه

```bash
cd /path/to/your/projects
# اگر پروژه در گیت است
git clone <repository-url>
cd backend
```

### مرحله 2: ایجاد محیط مجازی Python

```bash
# ایجاد محیط مجازی
python -m venv venv

# فعال‌سازی محیط مجازی
# در Linux/Mac:
source venv/bin/activate

# در Windows:
venv\Scripts\activate
```

### مرحله 3: نصب وابستگی‌ها

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### مرحله 4: ایجاد و تنظیم دیتابیس PostgreSQL

```bash
# ورود به PostgreSQL
sudo -u postgres psql

# ایجاد دیتابیس و کاربر
CREATE DATABASE salonify_db;
CREATE USER salonify_user WITH PASSWORD 'your_password_here';
ALTER ROLE salonify_user SET client_encoding TO 'utf8';
ALTER ROLE salonify_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE salonify_user SET timezone TO 'Asia/Tehran';
GRANT ALL PRIVILEGES ON DATABASE salonify_db TO salonify_user;
\q
```

### مرحله 5: تنظیمات محیطی

```bash
# کپی کردن فایل نمونه
cp .env.example .env

# ویرایش فایل .env
nano .env  # یا با ویرایشگر دلخواه
```

محتویات فایل `.env` را با اطلاعات خود پر کنید:

```env
# Django Settings
SECRET_KEY=your-very-long-random-secret-key-here-change-this
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=salonify_db
DB_USER=salonify_user
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# JWT
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440
```

**نکته مهم:** برای تولید SECRET_KEY می‌توانید از دستور زیر استفاده کنید:
```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### مرحله 6: اجرای Migrations

```bash
# ایجاد فایل‌های migration
python manage.py makemigrations

# اعمال migrations به دیتابیس
python manage.py migrate
```

### مرحله 7: ایجاد سوپریوزر (مدیر کل)

```bash
python manage.py createsuperuser

# اطلاعات خواسته شده را وارد کنید:
# شماره تلفن: 09123456789
# رمز عبور: (رمز قوی انتخاب کنید)
```

### مرحله 8: ایجاد داده‌های اولیه (اختیاری)

برای راحتی کار، می‌توانید داده‌های نمونه ایجاد کنید:

```python
# در Django shell
python manage.py shell

# اجرای کدهای زیر:
from businesses.models import Category, City, Area

# ایجاد دسته‌بندی‌ها
Category.objects.create(name='آرایشگاه', name_en='Salon', slug='salon', order=1)
Category.objects.create(name='باشگاه', name_en='Gym', slug='gym', order=2)
Category.objects.create(name='اسپا', name_en='Spa', slug='spa', order=3)

# ایجاد شهرها
tehran = City.objects.create(name='تهران', name_en='Tehran', slug='tehran', province='تهران')
City.objects.create(name='اصفهان', name_en='Isfahan', slug='isfahan', province='اصفهان')

# ایجاد مناطق تهران
Area.objects.create(city=tehran, name='سعادت‌آباد', slug='saadat-abad')
Area.objects.create(city=tehran, name='ونک', slug='vanak')
Area.objects.create(city=tehran, name='نیاوران', slug='niavaran')

exit()
```

### مرحله 9: اجرای سرور توسعه

```bash
python manage.py runserver
```

سرور روی آدرس `http://localhost:8000` در دسترس خواهد بود.

### مرحله 10: بررسی نصب

1. **Admin Panel:** http://localhost:8000/admin/
2. **API Documentation:** http://localhost:8000/swagger/
3. **ReDoc:** http://localhost:8000/redoc/

## 🔄 راه‌اندازی Redis و Celery (برای Task Queue)

### راه‌اندازی Redis:

```bash
# در ترمینال جدا
redis-server
```

### راه‌اندازی Celery Worker:

```bash
# در ترمینال جدا (محیط مجازی فعال باشد)
celery -A config worker -l info
```

### راه‌اندازی Celery Beat (برای scheduled tasks):

```bash
# در ترمینال جدا (محیط مجازی فعال باشد)
celery -A config beat -l info
```

## 🧪 تست کردن API

### با curl:

```bash
# دریافت لیست کسب‌وکارها
curl http://localhost:8000/api/businesses/

# ثبت‌نام کاربر
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "09123456789",
    "first_name": "علی",
    "last_name": "احمدی",
    "password": "securepass123"
  }'
```

### با Postman یا Insomnia:

می‌توانید از Swagger UI در آدرس http://localhost:8000/swagger/ برای تست API استفاده کنید.

## ❗ رفع مشکلات رایج

### مشکل 1: خطای PostgreSQL Connection

```bash
# بررسی کنید PostgreSQL در حال اجرا است
sudo systemctl status postgresql

# اگر خاموش است، روشن کنید
sudo systemctl start postgresql
```

### مشکل 2: خطای Redis Connection

```bash
# بررسی کنید Redis در حال اجرا است
redis-cli ping

# باید پاسخ PONG برگردد
```

### مشکل 3: خطای Import

```bash
# مطمئن شوید محیط مجازی فعال است
which python  # باید مسیر venv را نشان دهد

# اگر فعال نیست:
source venv/bin/activate
```

### مشکل 4: خطای Migration

```bash
# حذف و ایجاد مجدد migrations
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete
python manage.py makemigrations
python manage.py migrate
```

## 📊 ساختار پروژه

```
backend/
├── config/              # تنظیمات اصلی Django
│   ├── settings.py     # تنظیمات پروژه
│   ├── urls.py         # URL routing اصلی
│   ├── wsgi.py         # WSGI config
│   └── celery.py       # تنظیمات Celery
├── accounts/           # مدیریت کاربران
├── businesses/         # مدیریت کسب‌وکارها
├── bookings/           # مدیریت رزروها
├── services/           # مدیریت خدمات
├── reviews/            # مدیریت نظرات
├── notifications/      # سیستم نوتیفیکیشن
├── media/              # فایل‌های آپلود شده
├── staticfiles/        # فایل‌های استاتیک
├── manage.py           # Django CLI
└── requirements.txt    # وابستگی‌ها
```

## 🔐 امنیت

- **هرگز** فایل `.env` را کامیت نکنید
- در production حتماً `DEBUG=False` کنید
- از رمزهای قوی استفاده کنید
- HTTPS را فعال کنید
- CORS را درست تنظیم کنید

## 📱 اتصال به فرانت‌اند React

در فایل `.env` فرانت‌اند:

```env
VITE_API_URL=http://localhost:8000/api
```

## 🚀 استقرار در سرور (Production)

برای استقرار در سرور:

1. تنظیم `DEBUG=False`
2. تنظیم `ALLOWED_HOSTS`
3. استفاده از Gunicorn + Nginx
4. تنظیم SSL/HTTPS
5. استفاده از دیتابیس production
6. تنظیم backup خودکار

## 📞 پشتیبانی

در صورت بروز مشکل:
1. لاگ‌ها را بررسی کنید
2. به مستندات Django مراجعه کنید
3. از ChatGPT کمک بگیرید

---

موفق باشید! 🎉
