"""
Django management command to generate fake data
Usage: python manage.py generate_fake_data
"""

from django.core.management.base import BaseCommand
import random
from datetime import datetime, timedelta, time
from django.utils import timezone
from django.contrib.auth import get_user_model

from businesses.models import Category, City, Area, Business, Staff, StaffSchedule
from services.models import ServiceCategory, Service, ServiceStaff
from bookings.models import Booking
from reviews.models import Review

User = get_user_model()


class Command(BaseCommand):
    help = 'Generate fake data for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before generating',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('⚠️  Clearing existing data...'))
            Review.objects.all().delete()
            Booking.objects.all().delete()
            Service.objects.all().delete()
            ServiceCategory.objects.all().delete()
            Staff.objects.all().delete()
            Business.objects.all().delete()
            Area.objects.all().delete()
            City.objects.all().delete()
            Category.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
            self.stdout.write(self.style.SUCCESS('✅ Data cleared'))

        self.stdout.write(self.style.SUCCESS('🚀 Starting fake data generation...'))

        # Create users
        self.create_users()
        
        # Create categories and locations
        self.create_categories()
        self.create_locations()
        
        # Create service categories
        self.create_service_categories()
        
        # Create businesses and staff
        self.create_businesses()
        
        # Create services
        self.create_services()
        
        # Create bookings
        self.create_bookings()
        
        # Create reviews
        self.create_reviews()

        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS('🎉 Fake data generation completed!'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.print_summary()

    def create_users(self):
        self.stdout.write('\n👥 Creating users...')
        
        # Admin
        admin, created = User.objects.get_or_create(
            phone_number='09111111111',
            defaults={
                'first_name': 'ادمین',
                'last_name': 'سیستم',
                'user_type': 'customer',
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True,
            }
        )
        if created:
            admin.set_password('admin123456')
            admin.save()
        
        # Customers
        self.customers = []
        customers_data = [
            ('09121111111', 'علی', 'احمدی', 'male'),
            ('09122222222', 'سارا', 'محمدی', 'female'),
            ('09123333333', 'رضا', 'کریمی', 'male'),
            ('09124444444', 'مریم', 'رضایی', 'female'),
            ('09125555555', 'حسین', 'نوری', 'male'),
            ('09126666666', 'زهرا', 'حسینی', 'female'),
        ]
        
        for phone, first, last, gender in customers_data:
            user, _ = User.objects.get_or_create(
                phone_number=phone,
                defaults={
                    'first_name': first,
                    'last_name': last,
                    'gender': gender,
                    'user_type': 'customer',
                    'is_verified': True,
                }
            )
            user.set_password('customer123')
            user.save()
            self.customers.append(user)
        
        # Owners
        self.owners = []
        owners_data = [
            ('09131111111', 'امیر', 'صادقی'),
            ('09132222222', 'نازنین', 'کاظمی'),
            ('09133333333', 'مهدی', 'جعفری'),
            ('09134444444', 'الهام', 'رحیمی'),
        ]
        
        for phone, first, last in owners_data:
            user, _ = User.objects.get_or_create(
                phone_number=phone,
                defaults={
                    'first_name': first,
                    'last_name': last,
                    'user_type': 'business_owner',
                    'is_verified': True,
                }
            )
            user.set_password('owner123')
            user.save()
            self.owners.append(user)
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(self.customers) + len(self.owners) + 1} users'))

    def create_categories(self):
        self.stdout.write('\n📁 Creating categories...')
        
        self.categories = []
        categories_data = [
            ('آرایشگاه زنانه', 'womens-salon', 1),
            ('آرایشگاه مردانه', 'mens-salon', 2),
            ('سالن زیبایی', 'beauty-salon', 3),
            ('اسپا و ماساژ', 'spa-massage', 4),
        ]
        
        for name, slug, order in categories_data:
            cat, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={'name': name, 'order': order, 'is_active': True}
            )
            self.categories.append(cat)
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(self.categories)} categories'))

    def create_locations(self):
        self.stdout.write('\n🏙️ Creating locations...')
        
        # Tehran
        self.tehran, _ = City.objects.get_or_create(
            slug='tehran',
            defaults={'name': 'تهران', 'province': 'تهران', 'is_active': True}
        )
        
        self.tehran_areas = []
        for area_name in ['سعادت‌آباد', 'ونک', 'نیاوران', 'جردن']:
            area, _ = Area.objects.get_or_create(
                city=self.tehran,
                slug=area_name.replace('‌', '-'),
                defaults={'name': area_name, 'is_active': True}
            )
            self.tehran_areas.append(area)
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created locations'))

    def create_service_categories(self):
        self.stdout.write('\n🏷️ Creating service categories...')
        
        self.service_cats = []
        data = [
            (self.categories[0], 'مو', 'hair'),
            (self.categories[0], 'ناخن', 'nails'),
            (self.categories[0], 'آرایش', 'makeup'),
            (self.categories[1], 'کوتاهی', 'haircut'),
            (self.categories[1], 'اصلاح', 'shaving'),
            (self.categories[3], 'ماساژ', 'massage'),
        ]
        
        for cat, name, slug in data:
            sc, _ = ServiceCategory.objects.get_or_create(
                category=cat,
                slug=slug,
                defaults={'name': name, 'is_active': True}
            )
            self.service_cats.append(sc)
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(self.service_cats)} service categories'))

    def create_businesses(self):
        self.stdout.write('\n🏢 Creating businesses...')
        
        self.businesses = []
        self.all_staff = []
        
        businesses_data = [
            {
                'owner': 0, 'name': 'سالن زیبایی آزاده', 'slug': 'salon-azade',
                'category': 0, 'gender': 'female', 'area': 0,
                'staff': [
                    ('مریم احمدی', 'female', 'آرایشگر ارشد', 10),
                    ('فاطمه کریمی', 'female', 'متخصص پوست', 8),
                ]
            },
            {
                'owner': 1, 'name': 'آرایشگاه پرشین', 'slug': 'persian-barber',
                'category': 1, 'gender': 'male', 'area': 1,
                'staff': [
                    ('رضا محمدی', 'male', 'سرپرست', 12),
                    ('علی رضایی', 'male', 'آرایشگر', 7),
                ]
            },
        ]
        
        for data in businesses_data:
            business, _ = Business.objects.get_or_create(
                slug=data['slug'],
                defaults={
                    'owner': self.owners[data['owner']],
                    'name': data['name'],
                    'description': f"بهترین خدمات در {data['name']}",
                    'category': self.categories[data['category']],
                    'gender_target': data['gender'],
                    'city': self.tehran,
                    'area': self.tehran_areas[data['area']],
                    'address': f"تهران، {self.tehran_areas[data['area']].name}",
                    'phone': f"021{random.randint(10000000, 99999999)}",
                    'opens_at': time(9, 0),
                    'closes_at': time(21, 0),
                    'status': 'approved',
                    'is_active': True,
                    'allow_online_booking': True,
                    'average_rating': round(random.uniform(4.2, 4.9), 2),
                }
            )
            self.businesses.append(business)
            
            # Create staff
            business_staff = []
            for name, gender, title, exp in data['staff']:
                staff, _ = Staff.objects.get_or_create(
                    business=business,
                    name=name,
                    defaults={
                        'gender': gender,
                        'title': title,
                        'experience_years': exp,
                        'is_active': True,
                        'can_accept_bookings': True,
                    }
                )
                # Create schedule
                for weekday in range(6):
                    StaffSchedule.objects.get_or_create(
                        staff=staff,
                        weekday=weekday,
                        defaults={
                            'start_time': time(9, 0),
                            'end_time': time(21, 0),
                            'is_available': True,
                        }
                    )
                business_staff.append(staff)
            self.all_staff.append(business_staff)
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(self.businesses)} businesses'))

    def create_services(self):
        self.stdout.write('\n💇 Creating services...')
        
        self.all_services = []
        services_data = [
            # Salon Azade
            [
                ('کوتاهی مو', 0, 200000, 180000, 45, True),
                ('رنگ مو', 0, 500000, 450000, 120, True),
                ('مانیکور', 1, 150000, None, 60, False),
            ],
            # Persian Barber
            [
                ('کوتاهی مردانه', 3, 100000, 90000, 30, True),
                ('اصلاح', 4, 80000, None, 20, True),
            ],
        ]
        
        for idx, business in enumerate(self.businesses):
            business_services = []
            for name, cat_idx, price, discount, duration, popular in services_data[idx]:
                service, _ = Service.objects.get_or_create(
                    business=business,
                    name=name,
                    defaults={
                        'service_category': self.service_cats[cat_idx],
                        'description': f"{name} با بهترین کیفیت",
                        'price': price,
                        'discounted_price': discount,
                        'duration_minutes': duration,
                        'gender_target': business.gender_target,
                        'is_popular': popular,
                        'is_active': True,
                    }
                )
                # Assign staff
                for staff in self.all_staff[idx]:
                    ServiceStaff.objects.get_or_create(
                        service=service,
                        staff=staff
                    )
                business_services.append(service)
            self.all_services.append(business_services)
        
        total = sum(len(s) for s in self.all_services)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {total} services'))

    def create_bookings(self):
        self.stdout.write('\n📅 Creating bookings...')
        
        today = timezone.now().date()
        count = 0
        
        for idx, business in enumerate(self.businesses):
            for _ in range(5):
                date = today + timedelta(days=random.randint(-10, 10))
                Booking.objects.get_or_create(
                    business=business,
                    customer=random.choice(self.customers),
                    service=random.choice(self.all_services[idx]),
                    staff=random.choice(self.all_staff[idx]),
                    date=date,
                    time=time(random.randint(9, 18), random.choice([0, 30])),
                    defaults={
                        'status': 'confirmed' if date >= today else 'completed',
                        'duration_minutes': 45,
                        'service_price': 200000,
                        'final_price': 180000,
                    }
                )
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created {count} bookings'))

    def create_reviews(self):
        self.stdout.write('\n⭐ Creating reviews...')
        
        completed = Booking.objects.filter(status='completed')[:10]
        count = 0
        
        for booking in completed:
            if not hasattr(booking, 'review'):
                Review.objects.create(
                    customer=booking.customer,
                    business=booking.business,
                    booking=booking,
                    rating=random.randint(4, 5),
                    title='خدمات عالی',
                    comment='بسیار راضی بودم',
                    is_approved=True,
                    is_verified=True,
                )
                count += 1
        
        # Update ratings
        for business in self.businesses:
            business.update_stats()
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created {count} reviews'))

    def print_summary(self):
        self.stdout.write(f"""
📊 Summary:
   👥 Users: {len(self.customers)} customers + {len(self.owners)} owners
   📁 Categories: {len(self.categories)}
   🏢 Businesses: {len(self.businesses)}
   💇 Services: {sum(len(s) for s in self.all_services)}
   📅 Bookings: {Booking.objects.count()}
   ⭐ Reviews: {Review.objects.count()}

🔐 Login Info:
   Admin: 09111111111 / admin123456
   Customer: 09121111111 / customer123
   Owner: 09131111111 / owner123
""")
