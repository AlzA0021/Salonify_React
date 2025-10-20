# 📖 مستندات کامل API

## 🔐 Authentication

تمام endpoint‌های محافظت‌شده نیاز به JWT Token دارند.

### Header نمونه:
```
Authorization: Bearer <access_token>
```

---

## 1️⃣ Authentication & User Management

### 1.1 ثبت‌نام کاربر

**Endpoint:** `POST /api/auth/register/`

**Request Body:**
```json
{
  "phone_number": "09123456789",
  "first_name": "علی",
  "last_name": "احمدی",
  "email": "ali@example.com",
  "password": "securepass123"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully. Please verify your phone number.",
  "phone_number": "09123456789"
}
```

### 1.2 ورود کاربر

**Endpoint:** `POST /api/auth/login/`

**Request Body:**
```json
{
  "phone_number": "09123456789",
  "password": "securepass123"
}
```

**Response:** `200 OK`
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "phone_number": "09123456789",
    "email": "ali@example.com",
    "first_name": "علی",
    "last_name": "احمدی",
    "full_name": "علی احمدی",
    "user_type": "customer",
    "is_verified": true
  }
}
```

### 1.3 ارسال کد تایید (OTP)

**Endpoint:** `POST /api/auth/send-otp/`

**Request Body:**
```json
{
  "phone_number": "09123456789"
}
```

**Response:** `200 OK`
```json
{
  "message": "OTP sent successfully",
  "expires_in": 300
}
```

### 1.4 تایید کد OTP

**Endpoint:** `POST /api/auth/verify-otp/`

**Request Body:**
```json
{
  "phone_number": "09123456789",
  "code": "123456"
}
```

### 1.5 دریافت اطلاعات کاربر جاری

**Endpoint:** `GET /api/auth/me/`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 1,
  "phone_number": "09123456789",
  "email": "ali@example.com",
  "first_name": "علی",
  "last_name": "احمدی",
  "full_name": "علی احمدی",
  "user_type": "customer",
  "gender": "male",
  "date_of_birth": "1995-05-15",
  "avatar": "/media/avatars/user1.jpg",
  "is_verified": true,
  "date_joined": "2024-01-15T10:30:00Z"
}
```

### 1.6 بروزرسانی پروفایل

**Endpoint:** `PUT /api/auth/profile/`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "first_name": "علی",
  "last_name": "احمدی",
  "email": "ali.new@example.com",
  "gender": "male",
  "date_of_birth": "1995-05-15"
}
```

---

## 2️⃣ Business/Salon Management (Customer Side)

### 2.1 لیست کسب‌وکارها (با فیلتر و جستجو)

**Endpoint:** `GET /api/businesses/`

**Query Parameters:**
- `category` - فیلتر بر اساس دسته‌بندی
- `city` - فیلتر بر اساس شهر
- `area` - فیلتر بر اساس منطقه
- `gender_target` - فیلتر بر اساس جنسیت (male/female/unisex)
- `min_rating` - حداقل امتیاز
- `min_price` - حداقل قیمت
- `max_price` - حداکثر قیمت
- `search` - جستجو در نام و توضیحات
- `ordering` - مرتب‌سازی: `average_rating`, `-average_rating`, `total_bookings`, etc.

**Example:**
```
GET /api/businesses/?city=1&category=1&min_rating=4&ordering=-average_rating
```

**Response:** `200 OK`
```json
{
  "count": 15,
  "next": "http://api.example.com/businesses/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "slug": "salon-azade",
      "name": "سالن آزاده",
      "logo": "/media/businesses/logos/salon1.jpg",
      "cover_image": "/media/businesses/covers/salon1.jpg",
      "category": {
        "id": 1,
        "name": "آرایشگاه",
        "slug": "salon"
      },
      "city": {
        "id": 1,
        "name": "تهران"
      },
      "area": {
        "id": 1,
        "name": "سعادت‌آباد"
      },
      "address": "خیابان سعادت‌آباد، نبش کوچه دهم",
      "gender_target": "female",
      "average_rating": 4.8,
      "total_reviews": 125,
      "total_bookings": 450,
      "is_featured": true,
      "opens_at": "09:00:00",
      "closes_at": "21:00:00",
      "distance": null
    }
  ]
}
```

### 2.2 جزئیات کسب‌وکار

**Endpoint:** `GET /api/businesses/{id}/`

**Response:** `200 OK`
```json
{
  "id": 1,
  "slug": "salon-azade",
  "name": "سالن آزاده",
  "description": "بهترین سالن زیبایی در منطقه...",
  "logo": "/media/businesses/logos/salon1.jpg",
  "cover_image": "/media/businesses/covers/salon1.jpg",
  "category": {...},
  "city": {...},
  "area": {...},
  "address": "خیابان سعادت‌آباد، نبش کوچه دهم",
  "latitude": "35.7614",
  "longitude": "51.3943",
  "phone": "02122334455",
  "whatsapp": "09123456789",
  "instagram": "salon_azade",
  "website": "https://salon-azade.com",
  "gender_target": "female",
  "opens_at": "09:00:00",
  "closes_at": "21:00:00",
  "closed_days": [6],
  "average_rating": 4.8,
  "total_reviews": 125,
  "total_bookings": 450,
  "is_featured": true,
  "allow_online_booking": true,
  "auto_confirm_booking": true,
  "booking_advance_days": 30,
  "cancellation_deadline_hours": 24,
  "slot_duration_minutes": 30,
  "images": [
    {
      "id": 1,
      "image": "/media/businesses/gallery/img1.jpg",
      "caption": "تصویر داخل سالن"
    }
  ],
  "staff_members": [
    {
      "id": 1,
      "name": "مریم احمدی",
      "gender": "female",
      "avatar": "/media/staff/staff1.jpg",
      "bio": "متخصص مو با 10 سال سابقه",
      "title": "آرایشگر ارشد",
      "experience_years": 10
    }
  ]
}
```

### 2.3 لیست خدمات یک کسب‌وکار

**Endpoint:** `GET /api/businesses/{business_id}/services/`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "کوتاهی مو",
    "description": "کوتاهی و فرم‌دهی مو",
    "category": {
      "id": 1,
      "name": "مو",
      "slug": "hair"
    },
    "price": "200000",
    "discounted_price": "180000",
    "final_price": "180000",
    "discount_percentage": 10,
    "duration_minutes": 45,
    "gender_target": "female",
    "image": "/media/services/service1.jpg",
    "is_popular": true,
    "total_bookings": 350
  }
]
```

### 2.4 لیست کارمندان یک کسب‌وکار

**Endpoint:** `GET /api/businesses/{business_id}/staff/`

### 2.5 لیست نظرات یک کسب‌وکار

**Endpoint:** `GET /api/businesses/{business_id}/reviews/`

**Query Parameters:**
- `ordering` - مرتب‌سازی: `rating`, `-rating`, `created_at`, `-created_at`, `helpful_count`

### 2.6 دریافت ساعات خالی

**Endpoint:** `GET /api/businesses/{business_id}/available-slots/`

**Query Parameters (Required):**
- `service` - شناسه خدمت
- `date` - تاریخ (YYYY-MM-DD)
- `staff` - شناسه کارمند (اختیاری)

**Example:**
```
GET /api/businesses/1/available-slots/?service=1&date=2024-02-01&staff=1
```

**Response:** `200 OK`
```json
{
  "slots": [
    {
      "time": "09:00",
      "available": true
    },
    {
      "time": "09:30",
      "available": true
    },
    {
      "time": "10:00",
      "available": false
    }
  ]
}
```

---

## 3️⃣ Booking Management (Customer)

### 3.1 ایجاد رزرو

**Endpoint:** `POST /api/bookings/`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "business": 1,
  "service": 1,
  "staff": 1,
  "date": "2024-02-15",
  "time": "10:00",
  "notes": "لطفاً قبل از موعد تماس بگیرید"
}
```

**Response:** `201 Created`
```json
{
  "id": 123,
  "business": {...},
  "service": {...},
  "staff": {...},
  "date": "2024-02-15",
  "time": "10:00:00",
  "end_time": "10:45:00",
  "duration_minutes": 45,
  "service_price": "200000",
  "final_price": "180000",
  "discount_amount": "20000",
  "status": "confirmed",
  "notes": "لطفاً قبل از موعد تماس بگیرید",
  "can_cancel": true,
  "created_at": "2024-02-01T14:30:00Z"
}
```

### 3.2 لیست رزروهای من

**Endpoint:** `GET /api/bookings/my-bookings/`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` - فیلتر بر اساس وضعیت: `pending`, `confirmed`, `completed`, `cancelled`
- `date` - فیلتر بر اساس تاریخ

### 3.3 جزئیات رزرو

**Endpoint:** `GET /api/bookings/{id}/`

**Headers:** `Authorization: Bearer <token>`

### 3.4 کنسل کردن رزرو

**Endpoint:** `POST /api/bookings/{id}/cancel/`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reason": "برنامه‌ام تغییر کرد"
}
```

### 3.5 امتیاز دادن به رزرو

**Endpoint:** `POST /api/bookings/{id}/rate/`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rating": 5,
  "service_quality": 5,
  "cleanliness": 5,
  "staff_behavior": 5,
  "value_for_money": 4,
  "title": "عالی بود!",
  "comment": "خدمات خیلی خوبی بود، حتماً دوباره می‌آیم"
}
```

---

## 4️⃣ Partner/Business Owner Panel

### 4.1 آمار داشبورد

**Endpoint:** `GET /api/partner/dashboard/stats/`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period` - بازه زمانی: `week`, `month`, `year`

**Response:** `200 OK`
```json
{
  "total_bookings": 45,
  "completed_bookings": 38,
  "cancelled_bookings": 3,
  "pending_bookings": 4,
  "total_revenue": 8500000,
  "average_rating": 4.7,
  "today_bookings": 5,
  "period": "month"
}
```

### 4.2 لیست رزروها (Partner)

**Endpoint:** `GET /api/partner/bookings/`

**Query Parameters:**
- `status` - فیلتر وضعیت
- `date` - فیلتر تاریخ

### 4.3 تغییر وضعیت رزرو

**Endpoint:** `PATCH /api/partner/bookings/{id}/status/`

**Request Body:**
```json
{
  "status": "completed",
  "notes": "خدمت با موفقیت انجام شد"
}
```

### 4.4 تقویم نوبت‌ها

**Endpoint:** `GET /api/partner/calendar/`

**Query Parameters (Required):**
- `start` - تاریخ شروع (YYYY-MM-DD)
- `end` - تاریخ پایان (YYYY-MM-DD)

### 4.5 مدیریت خدمات

**List:** `GET /api/partner/services/`

**Create:** `POST /api/partner/services/`

**Update:** `PUT /api/partner/services/{id}/`

**Delete:** `DELETE /api/partner/services/{id}/`

### 4.6 مدیریت کارمندان

**List:** `GET /api/partner/staff/`

**Create:** `POST /api/partner/staff/`

**Update:** `PUT /api/partner/staff/{id}/`

**Delete:** `DELETE /api/partner/staff/{id}/`

---

## 📍 Locations & Categories

### دریافت لیست دسته‌بندی‌ها

**Endpoint:** `GET /api/categories/`

### دریافت لیست شهرها

**Endpoint:** `GET /api/locations/cities/`

### دریافت لیست مناطق یک شهر

**Endpoint:** `GET /api/locations/cities/{city_id}/areas/`

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "field_name": ["error message"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error."
}
```

---

## 🔄 Pagination

تمام endpoint‌های لیستی از pagination استفاده می‌کنند:

**Query Parameters:**
- `page` - شماره صفحه (پیش‌فرض: 1)
- `page_size` - تعداد آیتم در هر صفحه (پیش‌فرض: 20، حداکثر: 100)

**Response Format:**
```json
{
  "count": 100,
  "next": "http://api.example.com/endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

---

برای اطلاعات بیشتر به Swagger Documentation مراجعه کنید:
**http://localhost:8000/swagger/**
