# 🎨 Fresha Clone - پلتفرم رزرو آنلاین خدمات زیبایی

یک پلتفرم کامل و حرفه‌ای برای رزرو آنلاین خدمات زیبایی و سلامت، شبیه به Fresha

## ✨ ویژگی‌ها

### بخش مشتریان:
- 🔍 جستجوی پیشرفته سالن‌ها و خدمات
- 📅 رزرو آنلاین با انتخاب زمان و متخصص
- 👤 پروفایل کاربری و مدیریت رزروها
- ⭐ امتیازدهی و نظرات
- 📱 رابط کاربری Responsive

### بخش پارتنر (کسب‌وکار):
- 📊 داشبورد مدیریتی کامل
- 📅 تقویم و مدیریت نوبت‌ها
- 💼 مدیریت خدمات و قیمت‌گذاری
- 👥 مدیریت مشتریان و پرسنل
- 📈 گزارش‌گیری و آمار
- ⚙️ تنظیمات کامل کسب‌وکار

## 🛠 تکنولوژی‌های استفاده شده

- **React 18** - فریمورک اصلی
- **Tailwind CSS** - استایل‌دهی
- **React Router DOM** - مسیریابی
- **Axios** - ارتباط با API
- **Zustand** - مدیریت state (اختیاری)
- **React Toastify** - نوتیفیکیشن‌ها
- **Vite** - Build Tool

## 📦 نصب و راه‌اندازی

### پیش‌نیازها:
- Node.js (نسخه 16 یا بالاتر)
- npm یا yarn

### مراحل نصب:

```bash
# 1. کپی کردن فایل‌ها
cd fresha-clone-frontend

# 2. نصب وابستگی‌ها
npm install

# 3. ایجاد فایل .env
cp .env.example .env

# 4. ویرایش فایل .env و تنظیم آدرس API
VITE_API_URL=http://localhost:8000/api

# 5. اجرای پروژه در حالت Development
npm run dev

# 6. Build برای Production
npm run build
```

## 📁 ساختار پروژه

```
fresha-clone-frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── common/          # کامپوننت‌های مشترک
│   │   ├── customer/        # کامپوننت‌های مشتری
│   │   └── partner/         # صفحات پارتنر
│   ├── services/            # API Services
│   ├── contexts/            # React Contexts
│   ├── hooks/               # Custom Hooks
│   ├── utils/               # توابع کمکی
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 🔌 اتصال به Backend

این پروژه برای کار با Django Backend طراحی شده است. مسیرهای API در فایل `src/services/api.js` تعریف شده‌اند.

### نمونه API Endpoints:

```javascript
// Authentication
POST /api/auth/login/
POST /api/auth/register/
GET  /api/auth/me/

// Businesses
GET  /api/businesses/
GET  /api/businesses/:id/
GET  /api/businesses/:id/services/

// Bookings
POST /api/bookings/
GET  /api/bookings/my-bookings/
POST /api/bookings/:id/cancel/

// Partner
GET  /api/partner/dashboard/stats/
GET  /api/partner/bookings/
POST /api/partner/services/
```

## 🎨 طراحی و UI/UX

- **راست‌چین و فارسی**: تمام المان‌ها با RTL طراحی شده‌اند
- **فونت**: استفاده از فونت Vazir
- **رنگ‌بندی**: طیف بنفش و صورتی (قابل تغییر در `tailwind.config.js`)
- **Responsive**: سازگار با موبایل، تبلت و دسکتاپ
- **Dark Mode**: آماده پیاده‌سازی

## 🔐 احراز هویت

پروژه دارای دو سیستم احراز هویت جداگانه است:

1. **مشتریان**: `AuthContext`
2. **پارتنرها**: `PartnerAuthContext`

توکن‌ها در localStorage ذخیره می‌شوند:
- مشتری: `token`
- پارتنر: `partnerToken`

## 📱 صفحات اصلی

### مشتری:
- `/` - صفحه اصلی
- `/search` - جستجو
- `/business/:id` - جزئیات سالن
- `/booking/:businessId` - رزرو نوبت
- `/my-bookings` - رزروهای من
- `/profile` - پروفایل
- `/login` - ورود
- `/register` - ثبت‌نام

### پارتنر:
- `/partner/login` - ورود پارتنر
- `/partner/register` - ثبت کسب‌وکار
- `/partner/dashboard` - داشبورد
- `/partner/calendar` - تقویم
- `/partner/bookings` - مدیریت رزروها
- `/partner/services` - مدیریت خدمات
- `/partner/customers` - مشتریان
- `/partner/staff` - پرسنل
- `/partner/settings` - تنظیمات

## 🚀 ویژگی‌های پیشرفته

### کامپوننت‌های قابل استفاده مجدد:
- Header و Footer
- Protected Routes
- Modal Components
- Form Components
- Loading States
- Toast Notifications

### مدیریت State:
- Context API برای احراز هویت
- Local State برای کامپوننت‌ها
- Zustand (اختیاری) برای state global

## 🧪 تست

```bash
# اجرای تست‌ها (در صورت وجود)
npm test
```

## 📦 Build و Deploy

```bash
# Build برای Production
npm run build

# Preview Build
npm run preview
```

خروجی در پوشه `dist/` قرار می‌گیرد و آماده Deploy است.

### Deploy on Vercel:
```bash
vercel --prod
```

### Deploy on Netlify:
```bash
netlify deploy --prod
```

## 🔧 تنظیمات

### متغیرهای محیطی (.env):
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=فرشا
```

### تغییر رنگ‌ها:
رنگ‌های پروژه در `tailwind.config.js` قابل تغییر هستند:

```javascript
colors: {
  primary: {
    600: '#0ea5e9',  // آبی
    // ...
  },
  secondary: {
    600: '#d946ef',  // بنفش
    // ...
  }
}
```

## 📝 لیست وظایف (Checklist)

- [x] صفحات مشتری
- [x] صفحات پارتنر
- [x] احراز هویت
- [x] رزرو نوبت
- [x] مدیریت خدمات
- [x] تقویم
- [x] طراحی Responsive
- [ ] پرداخت آنلاین
- [ ] نقشه (Google Maps)
- [ ] چت آنلاین
- [ ] اپلیکیشن موبایل (React Native)

## 🤝 مشارکت

برای مشارکت در پروژه:

1. Fork کنید
2. Branch جدید بسازید (`git checkout -b feature/AmazingFeature`)
3. تغییرات را Commit کنید (`git commit -m 'Add AmazingFeature'`)
4. Push کنید (`git push origin feature/AmazingFeature`)
5. Pull Request بسازید

## 📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است.

## 👨‍💻 توسعه‌دهنده

ساخته شده با ❤️ برای جامعه توسعه‌دهندگان ایرانی

## 📞 پشتیبانی

- 📧 Email: support@fresha.ir
- 💬 Telegram: @fresha_support
- 🌐 Website: https://fresha.ir

---

**نکته مهم**: این پروژه یک نسخه Clone برای آموزش و نمایش است. برای استفاده تجاری حتماً تغییرات لازم را اعمال کنید.

## 🎓 منابع آموزشی

- [مستندات React](https://react.dev)
- [مستندات Tailwind CSS](https://tailwindcss.com)
- [مستندات Vite](https://vitejs.dev)

## 🐛 گزارش باگ

اگر باگی پیدا کردید، لطفاً در بخش Issues گزارش دهید.

---

**موفق باشید! 🚀**/         # کامپوننت‌های پارتنر
│   ├── pages/
│   │   ├── customer/        # صفحات مشتری
│   │   └── partner