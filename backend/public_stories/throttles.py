from core.throttles import DerivedAnonRateThrottle


class StoryReportAnonThrottle(DerivedAnonRateThrottle):
    scope = "story_report"
