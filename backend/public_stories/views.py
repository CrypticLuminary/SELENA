from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import JSONParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from staff_accounts.permissions import CanPublishStory

from .exceptions import PublicationWorkflowError
from .models import PublicStory, StoryReport
from .serializers import (
    PublicationInputSerializer,
    PublicStoryDetailSerializer,
    PublicStoryFilterSerializer,
    PublicStoryListSerializer,
    StoryReportInputSerializer,
)
from .services import publish_case
from .throttles import StoryReportAnonThrottle

PUBLIC_STORY_PAGE_SIZE = 20


def _api_no_store(response: Response) -> Response:
    response["Cache-Control"] = "no-store"
    response["Pragma"] = "no-cache"
    response["X-Robots-Tag"] = "noindex"
    return response


def _apply_public_cursor(stories, *, cursor_story, featured_sort: bool):
    if cursor_story is None:
        return stories

    older_same_time = Q(
        published_at=cursor_story.published_at,
        id__lt=cursor_story.id,
    )
    older_time = Q(published_at__lt=cursor_story.published_at)

    if not featured_sort:
        return stories.filter(older_time | older_same_time)

    same_feature_bucket = Q(featured=cursor_story.featured) & (older_time | older_same_time)
    if cursor_story.featured:
        return stories.filter(same_feature_bucket | Q(featured=False))
    return stories.filter(same_feature_bucket)


class PublicStoryListView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        filters = PublicStoryFilterSerializer(data=request.query_params)
        filters.is_valid(raise_exception=True)
        values = filters.validated_data

        stories = PublicStory.objects.filter(is_active=True)
        if relationship := values.get("relationship"):
            stories = stories.filter(relationship=relationship)
        if setting := values.get("setting"):
            stories = stories.filter(setting=setting)
        if age_group := values.get("age_group"):
            stories = stories.filter(age_group=age_group)
        if experience_type := values.get("experience_type"):
            stories = stories.filter(experience_types__contains=[experience_type])

        cursor_story = None
        if cursor_id := values.get("cursor"):
            cursor_story = (
                stories.filter(pk=cursor_id)
                .only(
                    "id",
                    "published_at",
                    "featured",
                )
                .first()
            )
            if cursor_story is None:
                raise ValidationError({"cursor": "Invalid cursor."})

        featured_sort = values.get("sort") == "featured"
        stories = _apply_public_cursor(
            stories,
            cursor_story=cursor_story,
            featured_sort=featured_sort,
        )
        ordering = (
            ("-featured", "-published_at", "-id") if featured_sort else ("-published_at", "-id")
        )

        page_size = values.get("page_size", PUBLIC_STORY_PAGE_SIZE)
        items = list(stories.order_by(*ordering)[: page_size + 1])
        has_more = len(items) > page_size
        page = items[:page_size]
        next_cursor = str(page[-1].id) if has_more and page else None

        return _api_no_store(
            Response(
                {
                    "next_cursor": next_cursor,
                    "results": PublicStoryListSerializer(page, many=True).data,
                }
            )
        )


class PublicStoryDetailView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, story_id):
        story = get_object_or_404(PublicStory, pk=story_id, is_active=True)
        return _api_no_store(Response(PublicStoryDetailSerializer(story).data))


class StoryReportCreateView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    parser_classes = [JSONParser]
    throttle_classes = [StoryReportAnonThrottle]

    def post(self, request, story_id):
        story = get_object_or_404(PublicStory, pk=story_id, is_active=True)
        serializer = StoryReportInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        StoryReport.objects.create(
            story=story,
            reason=serializer.validated_data["reason"],
        )
        return _api_no_store(Response({"received": True}, status=202))


class PublishModerationCaseView(APIView):
    permission_classes = [CanPublishStory]
    parser_classes = [JSONParser]

    def post(self, request, case_id):
        serializer = PublicationInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            story, created = publish_case(
                case_id,
                request.user,
                **serializer.validated_data,
            )
        except PublicationWorkflowError as exc:
            raise ValidationError({"detail": str(exc)}) from exc

        return _api_no_store(
            Response(
                {
                    "id": str(story.id),
                    "alias": story.alias,
                    "published_label": f"Shared in {story.published_at.year}",
                },
                status=201 if created else 200,
            )
        )
