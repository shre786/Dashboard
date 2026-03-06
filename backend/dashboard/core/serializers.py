from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Dashboard_sheet
from django.utils.timezone import localtime
from rest_framework import serializers
from django.utils import timezone

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    user_name = serializers.CharField(source='username', required=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'first_name', 'last_name', 'user_name']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password']
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='username', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'user_name', 'phone_number', 'is_active', 'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login']


class CompanySerializer(serializers.ModelSerializer):
    CompanyName = serializers.CharField(source='company_name')
    domain = serializers.CharField(source='company_domain', required=False, allow_blank=True)
    website = serializers.URLField(source='company_website', required=False, allow_blank=True, allow_null=True, default='')
    poc = serializers.CharField(source='point_of_contact', required=False, allow_blank=True)
    meetingAvailability = serializers.CharField(
        source='availability_for_meeting',
        required=False,
        allow_blank=True,
        allow_null=True
    )
    
    meetingDate = serializers.DateTimeField(
    source='meeting_date',
    required=False,
    allow_null=True,
    input_formats=[
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%dT%H:%M"
    ]
)
    quotes = serializers.CharField(source='quotation', required=False, allow_blank=True, allow_null=True)
    replied = serializers.CharField(source='reply', required=False, allow_blank=True, allow_null=True)
    meet_1 = serializers.CharField(source='meeting_1', required=False, allow_blank=True, allow_null=True)
    meet_2 = serializers.CharField(source='meeting_2', required=False, allow_blank=True, allow_null=True)
    meeting_discussion = serializers.CharField(
    required=False,
    allow_blank=True,
    allow_null=True
)
    next_follow_up_date = serializers.DateTimeField(
    source='Next_follow_up_date',
    required=False,
    allow_null=True)
    planning_to_offer = serializers.CharField( required=False, allow_blank=True, allow_null=True)
    created_at = serializers.DateTimeField(source='date_created', read_only=True)
    updated_at = serializers.DateTimeField(source='date_updated', read_only=True)
    
    class Meta:
        model = Dashboard_sheet
        fields = [
            'id', 'CompanyName', 'domain', 'website', 'poc', 'email', 'phone', 'meeting_discussion',
            'status', 'meetingAvailability', 'meetingDate', 'quotes', 'next_follow_up_date',
            'replied', 'meet_1', 'meet_2', 'created_at', 'updated_at','planning_to_offer'
        ]
    
    def validate_CompanyName(self, value):
        if not value or value.strip() == '':
            raise serializers.ValidationError("Company name is required.")
        
        # Check for uniqueness on create
        if not self.instance:
            if Dashboard_sheet.objects.filter(company_name=value).exists():
                raise serializers.ValidationError("Company with this name already exists.")
        # Check for uniqueness on update (exclude current instance)
        elif Dashboard_sheet.objects.filter(company_name=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("Company with this name already exists.")
        
        return value
    
    def validate_website(self, value):
        # convert empty/placeholder values to empty string so frontend can ignore them
        if not value or not value.strip() or value.strip().lower() == 'na':
            return ''
        return value

class CompanyListSerializer(serializers.ModelSerializer):
    CompanyName = serializers.CharField(source='company_name')
    domain = serializers.CharField(source='company_domain')
    # expose full website in list so frontend can compute favicons reliably
    website = serializers.URLField(source='company_website', required=False, allow_blank=True, allow_null=True)
    poc = serializers.CharField(source='point_of_contact')


    meetingAvailability = serializers.CharField(
        source='availability_for_meeting',
        required=False,
        allow_blank=True,
        allow_null=True
    )
    quotes = serializers.CharField(source='quotation', required=False, allow_blank=True, allow_null=True)
    meet_1 = serializers.CharField(source='meeting_1', required=False, allow_blank=True, allow_null=True)
    meet_2 = serializers.CharField(source='meeting_2', required=False, allow_blank=True, allow_null=True)
    # response = serializers.CharField(source='response', required=False, allow_blank=True, allow_null=True)
    meeting_discussion = serializers.CharField(
    required=False,
    allow_blank=True,
    allow_null=True
)
    next_follow_up_date = serializers.DateTimeField(
    source='Next_follow_up_date',
    required=False,
    allow_null=True)
    replied = serializers.CharField(source='reply', required=False, allow_blank=True, allow_null=True)
    planning_to_offer = serializers.CharField( required=False, allow_blank=True, allow_null=True)
    meetingDate = serializers.SerializerMethodField()
    def get_meetingDate(self, obj):
        if obj.meeting_date:
            return localtime(obj.meeting_date)
        return None
    
    
    class Meta:
        model = Dashboard_sheet
        fields = [
            'id', 'CompanyName', 'domain', 'website', 'poc', 'email', 'phone', 'meeting_discussion','replied',
            'status','meetingAvailability',  'meetingDate', 'quotes', 'meet_1', 'meet_2', 'planning_to_offer', "next_follow_up_date" #'response',
        ]

class CompanyStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[
        'Under Progress', 'Interested', 'Awaiting for Meeting', 'Quotation', 'Skip', 'Not Interested'
    ])


class UpcomingMeetingSerializer(serializers.ModelSerializer):
    company_id = serializers.IntegerField(source='id')
    CompanyName = serializers.CharField(source='company_name')
    meetingDate = serializers.DateTimeField(
    source='meeting_date',
    required=False,
    allow_null=True,
    input_formats=[
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%dT%H:%M"
    ]
)
    is_today = serializers.SerializerMethodField()
    is_nearest = serializers.SerializerMethodField()

    
    class Meta:
        model = Dashboard_sheet
        fields = ['company_id', 'CompanyName', 'meetingDate', 'is_today', 'is_nearest']
    
    def get_is_today(self, obj):
        from datetime import date
        if obj.meeting_date:
            return obj.meeting_date.date() == date.today()
        return False
    
   

    def get_is_nearest(self, obj):
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        future_meetings = Dashboard_sheet.objects.filter(
            meeting_date__gte=today_start
            ).order_by("meeting_date")
        
        if not future_meetings.exists():
            return False
        
        nearest = future_meetings.first()
        return obj.id == nearest.id
class CompanyResponseSerializer(serializers.ModelSerializer):
    CompanyName = serializers.CharField(source='company_name')
    class Meta:
        model = Dashboard_sheet
        fields = ['id', 'CompanyName', 'response', 'follow_ups']

class NextWeekMeetingSerializer(serializers.ModelSerializer):
    company_id = serializers.IntegerField(source='id')
    CompanyName = serializers.CharField(source='company_name')
    meetingDate = serializers.DateTimeField(source='meeting_date')
    status = serializers.CharField()

    class Meta:
        model = Dashboard_sheet
        fields = ['company_id', 'CompanyName', 'meetingDate', 'status']