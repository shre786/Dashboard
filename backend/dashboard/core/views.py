from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone
from datetime import datetime, timedelta
from django.core.paginator import Paginator
from django.db.models import Q

from .models import Dashboard_sheet
from .serializers import (
    UserRegistrationSerializer, UserSerializer, CompanySerializer, NextWeekMeetingSerializer,
    CompanyListSerializer, CompanyStatusUpdateSerializer, UpcomingMeetingSerializer, CompanyResponseSerializer
)

User = get_user_model()


# Authentication Views
class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    "status": "error",
                    "message": "Validation failed",
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if email exists
            if User.objects.filter(email=request.data.get('email')).exists():
                return Response({
                    "status": "error",
                    "message": "User with this email already exists",
                    "errors": {
                        "email": ["A user with this email is already registered."]
                    }
                }, status=status.HTTP_409_CONFLICT)
            
            user = serializer.save()
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                "status": "success",
                "message": "User registered successfully",
                "data": {
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "user_name": user.username,
                        "is_active": user.is_active,
                        "date_joined": user.date_joined,
                        "last_login": user.last_login
                    },
                    "token": {
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                        "expires_in": 3600
                    }
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": "An unexpected error occurred. Please try again later.",
                "error_code": "INTERNAL_SERVER_ERROR"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            
            if not username or not password:
                return Response({
                    "status": "error",
                    "message": "Username and password are required",
                    "error_code": "MISSING_CREDENTIALS"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Try to authenticate with email or username
            user = None
            if '@' in username:
                try:
                    user_obj = User.objects.get(email=username)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
            else:
                user = authenticate(username=username, password=password)
            
            if not user:
                return Response({
                    "status": "error",
                    "message": "Invalid email or password",
                    "error_code": "INVALID_CREDENTIALS"
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            if not user.is_active:
                return Response({
                    "status": "error",
                    "message": "Account is inactive. Please contact support.",
                    "error_code": "ACCOUNT_INACTIVE"
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Update last login
            user.last_login = timezone.now()
            user.save()
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                "status": "success",
                "message": "Login successful",
                "data": {
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "phone_number": user.phone_number,
                        "is_active": user.is_active
                    },
                    "token": {
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                        "expires_in": 3600
                    }
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": "An unexpected error occurred. Please try again later.",
                "error_code": "INTERNAL_SERVER_ERROR"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        # For security, always return success even if email doesn't exist
        return Response({
            "status": "success",
            "message": "Password reset instructions sent to your email"
        }, status=status.HTTP_200_OK)


# Company Management Views
class CompanyCreateView(generics.CreateAPIView):
    queryset = Dashboard_sheet.objects.all()
    permission_classes = [AllowAny]  # Changed to AllowAny for development
    serializer_class = CompanySerializer
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    "status": "error",
                    "message": "Validation failed",
                    "error_code": "VALIDATION_ERROR",
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            company = serializer.save(updated_by=request.user)
            
            return Response({
                "status": "success",
                "message": "Company added successfully",
                "data": {
                    "company": CompanySerializer(company).data
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            if 'unique' in str(e).lower():
                return Response({
                    "status": "error",
                    "message": "Company already exists",
                    "error_code": "COMPANY_ALREADY_EXISTS",
                    "errors": {
                        "CompanyName": ["Company with this name already exists."]
                    }
                }, status=status.HTTP_409_CONFLICT)
            
            return Response({
                "status": "error",
                "message": "An unexpected error occurred. Please try again later.",
                "error_code": "INTERNAL_SERVER_ERROR"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CompanyListView(generics.ListAPIView):
    queryset = Dashboard_sheet.objects.all()
    # permission_classes = [IsAuthenticated]
    serializer_class = CompanyListSerializer
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset().order_by('-date_created')
            
            # Pagination
            page = request.GET.get('page', 1)
            page_size = request.GET.get('page_size', 1000)
            
            paginator = Paginator(queryset, page_size)
            page_obj = paginator.get_page(page)
            
            serializer = self.get_serializer(page_obj, many=True)
            
            return Response({
                "status": "success",
                "data": {
                    "companies": serializer.data,
                    "total": paginator.count,
                    "page": int(page),
                    "pages": paginator.num_pages
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": "An unexpected error occurred. Please try again later.",
                "error_code": "INTERNAL_SERVER_ERROR"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CompanyUpdateView(generics.UpdateAPIView):
    queryset = Dashboard_sheet.objects.all()
    permission_classes = [AllowAny]  # Changed to AllowAny for development
    serializer_class = CompanySerializer

    
    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            
            if not serializer.is_valid():
                return Response({
                    "status": "error",
                    "message": "Validation failed",
                    "error_code": "VALIDATION_ERROR",
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            company = serializer.save(updated_by=request.user if request.user.is_authenticated else None)
            
            return Response({
                "status": "success",
                "message": "Company updated successfully",
                "data": {
                    "company": CompanySerializer(company).data
                }
            }, status=status.HTTP_200_OK)
            
        except Dashboard_sheet.DoesNotExist:
            return Response({
                "status": "error",
                "message": "Company not found",
                "error_code": "COMPANY_NOT_FOUND"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e),
                "error_code": "INTERNAL_SERVER_ERROR"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CompanyStatusUpdateView(APIView):
    permission_classes = [AllowAny]  # Changed to AllowAny for development
    
    def patch(self, request, pk):
        try:
            company = Dashboard_sheet.objects.get(pk=pk)
            serializer = CompanyStatusUpdateSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    "status": "error",
                    "message": "Validation failed",
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            company.status = serializer.validated_data['status']
            company.updated_by = request.user if request.user.is_authenticated else None
            company.save()
            
            return Response({
                "status": "success",
                "message": "Company status updated",
                "data": {
                    "id": company.id,
                    "status": company.status

                }
            }, status=status.HTTP_200_OK)
            
        except Dashboard_sheet.DoesNotExist:
            return Response({
                "status": "error",
                "message": "Company not found",
                "error_code": "COMPANY_NOT_FOUND"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "status": "error",
                "message": "An unexpected error occurred. Please try again later.",
                "error_code": "INTERNAL_SERVER_ERROR"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpcomingMeetingsView(APIView):
    permission_classes = [AllowAny]  # Changed to AllowAny for development
    
    def get(self, request):
        try:
            now = timezone.now()
            limit = request.GET.get('limit', None)
            
            # Get meetings that are today or in the future
            queryset = Dashboard_sheet.objects.filter(
                meeting_date__gte=now.replace(hour=0, minute=0, second=0, microsecond=0)
            ).order_by('meeting_date')
            
            if limit:
                queryset = queryset[:int(limit)]
            
            serializer = UpcomingMeetingSerializer(queryset, many=True)
            
            return Response({
                "status": "success",
                "data": {
                    "meetings": serializer.data,
                    "total": len(serializer.data)
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": "An unexpected error occurred. Please try again later.",
                "error_code": "INTERNAL_SERVER_ERROR"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

class NextWeekMeetingsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            today = timezone.localdate()
            after_7_days = today + timedelta(days=7)

            queryset = Dashboard_sheet.objects.filter(
                meeting_date__date__gt=after_7_days
            ).order_by('meeting_date')[:5] 

            serializer = NextWeekMeetingSerializer(queryset, many=True)

            return Response({
                "status": "success",
                "data": {
                    "updates": serializer.data,
                    "total": queryset.count()  # will be max 5
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e),
                "error_code": "INTERNAL_SERVER_ERROR"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AddCompanyView(generics.CreateAPIView):
    queryset = Dashboard_sheet.objects.all()
    permission_classes = [AllowAny]  # Changed to AllowAny for development
    serializer_class = CompanySerializer
    
    def create(self, request, *args, **kwargs):
        try:
            # Log incoming data for debugging
            print(f"Received data: {request.data}")
            
            serializer = self.get_serializer(data=request.data)
            
            if not serializer.is_valid():
                # Log validation errors
                print(f"Validation errors: {serializer.errors}")
                return Response({
                    "status": "error",
                    "message": "Validation failed",
                    "error_code": "VALIDATION_ERROR",
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            company = serializer.save(updated_by=request.user if request.user.is_authenticated else None)

            return Response({
                "status": "success",
                "message": "Company added successfully",
                "data": {
                    "company": CompanySerializer(company).data
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Log the actual exception
            print(f"Exception occurred: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                "status": "error",
                "message": str(e),
                "error_code": "INTERNAL_SERVER_ERROR"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CompanyResponsesView(APIView):
    permission_classes = [AllowAny]  # change later if needed

    def get(self, request):
        try:
            # Only companies that have valid response
            queryset = Dashboard_sheet.objects.filter(
                Q(response__isnull=False) &
                ~Q(response__exact="") &
                ~Q(response__iexact="na")
            ).order_by('-date_created')

            serializer = CompanyResponseSerializer(queryset, many=True)

            return Response({
                "status": "success",
                "data": {
                    "responses": serializer.data,
                    "total": len(serializer.data),
                    "follow_ups": serializer.data
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": "error",
                "message": "Failed to fetch responses",
                "error_code": "INTERNAL_SERVER_ERROR"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


from django.utils.timezone import localtime, now
from datetime import date


class FollowupMeetingsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            today = date.today()
            current_time = localtime()

            meetings = Dashboard_sheet.objects.filter(
                Next_follow_up_date__isnull=False
            ).order_by("Next_follow_up_date")

            today_meetings = []
            future_meetings = []

            for m in meetings:
                followup_local = localtime(m.Next_follow_up_date)

                if followup_local.date() == today:
                    today_meetings.append({
                        "company_id": m.id,
                        "CompanyName": m.company_name,
                        "meeting_date": followup_local,  # keep key same for frontend
                        "status": m.status
                    })

                elif followup_local.date() > today:
                    future_meetings.append({
                        "company_id": m.id,
                        "CompanyName": m.company_name,
                        "meeting_date": followup_local,
                        "status": m.status
                    })

            # Get nearest future followup
            nearest_meeting = future_meetings[0] if future_meetings else None

            return Response({
                "status": "success",
                "today_count": len(today_meetings),
                "today_meetings": today_meetings,
                "future_meetings": future_meetings,
                "nearest_meeting": nearest_meeting
            })

        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=500)