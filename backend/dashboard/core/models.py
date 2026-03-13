from datetime import date
from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

ROLES = (
    ('admin', 'Admin'),
    ('user', 'User'),
)

class User(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=50, choices=ROLES, default='user')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
    
    
STATUS_CHOICES = (
    ('Under Progress', 'Under Progress'),
    ('Interested', 'Interested'),
    ('Awaiting for Meeting', 'Awaiting for Meeting'),
    ('Quotation', 'Quotation'),
    ('Skip', 'Skip'),
    ('Not Interested', 'Not Interested'),
)

class Dashboard_sheet(models.Model):
    initiated = models.BooleanField(default=False)
    company_name = models.CharField(max_length=255, unique=True, db_column='CompanyName')
    company_domain = models.CharField(max_length=255, blank=True)
    company_website = models.URLField(max_length=255, blank=True, null=True)
    point_of_contact = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    reply = models.TextField(blank=True, null=True)
    response = models.TextField(blank=True, null=True)
    planning_to_offer = models.TextField(blank=True, null=True)
    availability_for_meeting = models.TextField(blank=True, null=True, db_column='meetingAvailability')
    meeting_date = models.DateTimeField(blank=True, null=True, db_column='meetingDate')
    meeting_1 = models.TextField(blank=True, null=True, db_column='meet_1')
    meeting_2 = models.TextField(blank=True, null=True, db_column='meet_2')
    meeting_discussion = models.TextField(blank=True, null=True, db_column='meet_discuss')
    quotation = models.TextField(blank=True, null=True, db_column='quotes')
    follow_ups = models.TextField(blank=True, null=True)
    follow_up_1 = models.DateTimeField(blank=True, null=True, db_column='follow_up_1')
    follow_up_2 = models.DateTimeField(blank=True, null=True, db_column='follow_up_2')
    follow_up_3 = models.DateTimeField(blank=True, null=True, db_column='follow_up_3')
    status = models.CharField(max_length=100, blank=True, null=True, choices=STATUS_CHOICES)
    date_created = models.DateTimeField(auto_now_add=True, db_column='created_at')
    date_updated = models.DateTimeField(auto_now=True, db_column='updated_at')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = 'core_dashboard_sheet'

    def __str__(self):
        return self.company_name
