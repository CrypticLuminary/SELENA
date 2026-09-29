from core.throttles import DerivedAnonRateThrottle


class SubmissionAnonThrottle(DerivedAnonRateThrottle):
    scope = "submission"
