from django.urls import path

from .views import (
    ComparableRelationshipsView,
    CrossBreakdownView,
    PatternSnapshotView,
)

urlpatterns = [
    path("", PatternSnapshotView.as_view(), name="pattern-snapshot"),
    path(
        "relationships/",
        ComparableRelationshipsView.as_view(),
        name="pattern-comparable-relationships",
    ),
    path("cross/", CrossBreakdownView.as_view(), name="pattern-cross"),
]
