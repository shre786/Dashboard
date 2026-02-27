"""
URL configuration for core app.
"""
from django.urls import path
from .views import *

urlpatterns = [
    # Root API endpoint - redirect to companies list
    path('', CompanyListView.as_view(), name='api-root'),
    
    # Authentication endpoints
    path('auth/register', UserRegistrationView.as_view(), name='user-register'),
    path('auth/login', UserLoginView.as_view(), name='user-login'),
    path('auth/forgot-password', ForgotPasswordView.as_view(), name='forgot-password'),
    
    # Company management endpoints
    path('companies', CompanyCreateView.as_view(), name='company-create'),
    path('companies/', CompanyListView.as_view(), name='company-list'),
    path('companies/<int:pk>', CompanyUpdateView.as_view(), name='company-update'),
    path("companies/followups/", FollowupMeetingsView.as_view(), name="followups"),
    path('companies/<int:pk>/status', CompanyStatusUpdateView.as_view(), name='company-status-update'),
    path('companies/upcoming-meetings', UpcomingMeetingsView.as_view(), name='upcoming-meetings'),
    path('companies/updates', NextWeekMeetingsView.as_view(), name='next-week-meetings'),
    path("responses/", CompanyResponsesView.as_view(), name="company-responses"),
    path('addcompany', AddCompanyView.as_view(), name='add-company'),

]
