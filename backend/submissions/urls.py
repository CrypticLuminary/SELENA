from django.urls import path

from .views import AnonymousSubmissionView

urlpatterns = [
    path("", AnonymousSubmissionView.as_view(), name="submission-create"),
]
