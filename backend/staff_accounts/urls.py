from django.urls import path

from .views import StaffMeView

urlpatterns = [
    path("me/", StaffMeView.as_view(), name="staff-me"),
]
