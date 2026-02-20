from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Dashboard_sheet

# Register your models here.

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined']
    list_filter = ['is_staff', 'is_active', 'role']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone_number')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'role', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'first_name', 'last_name'),
        }),
    )


@admin.register(Dashboard_sheet)
class DashboardSheetAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'status', 'point_of_contact', 'email', 'phone', 'meeting_date', 'date_created']
    list_filter = ['status', 'initiated', 'date_created']
    search_fields = ['company_name', 'company_domain', 'point_of_contact', 'email']
    ordering = ['-date_created']
    readonly_fields = ['date_created', 'date_updated']
    
    fieldsets = (
        ('Company Information', {
            'fields': ('initiated', 'company_name', 'company_domain', 'company_website', 'point_of_contact', 'email', 'phone')
        }),
        ('Communication', {
            'fields': ('reply', 'response', 'planning_to_offer', 'follow_ups')
        }),
        ('Meeting Details', {
            'fields': ('availability_for_meeting', 'meeting_date', 'proposed', 'meeting_1', 'meeting_2')
        }),
        ('Business', {
            'fields': ('status', 'quotation')
        }),
        ('Metadata', {
            'fields': ('updated_by', 'date_created', 'date_updated'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change or not obj.updated_by:
            obj.updated_by = request.user
        super().save_model(request, obj, form, change)


# from .models import User, Dashboard_sheet

# admin.site.register(User)
# admin.site.register(Dashboard_sheet)