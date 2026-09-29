from submissions.taxonomy import (
    AGE_GROUPS,
    EXPERIENCE_TYPES,
    PERSON_RELATIONSHIP_CATEGORIES,
    SETTINGS,
)

MIN_GROUP_SIZE = 10
SENSITIVE_GROUP_SIZE = 20
CROSS_GROUP_SIZE = 20
MAX_PUBLIC_DIMENSIONS = 2

AGE_ORDER = (
    "under_10",
    "10_12",
    "13_15",
    "16_17",
    "18_20",
    "21_24",
    "25_29",
    "30_39",
    "40_49",
    "50_plus",
    "prefer_not",
)
RELATIONSHIP_ORDER = (
    "family",
    "partner",
    "friend_acquaintance",
    "authority",
    "stranger",
    "online",
    "other",
    "prefer_not",
)
SETTING_ORDER = (
    "home",
    "family_gathering",
    "workplace",
    "school",
    "public_transport",
    "public_place",
    "online",
    "social_gathering",
    "religious_community",
    "other",
    "prefer_not",
)
EXPERIENCE_ORDER = (
    "unwanted_contact",
    "sexual_comments",
    "pressure_coercion",
    "threatening",
    "stalking",
    "online_sexual",
    "other",
    "prefer_not",
)

SENSITIVE_AGE_GROUPS = {"under_10", "10_12", "13_15", "16_17"}
PUBLIC_DIMENSIONS = {"relationship", "age", "setting", "experience"}
CROSS_SECONDARIES = ("age", "setting", "experience")

COUNT_BANDS = (
    (10, 19, "10–19", 1),
    (20, 49, "20–49", 2),
    (50, 99, "50–99", 3),
    (100, 199, "100–199", 4),
    (200, 499, "200–499", 5),
    (500, 999, "500–999", 6),
    (1000, None, "1,000+", 7),
)

DISTRIBUTION_TITLES = {
    "relationship": "By relationship",
    "age": "By age when it happened",
    "setting": "By setting",
    "experience": "By experience type",
}
CROSS_TITLES = {
    "age": "Age distribution",
    "setting": "Settings",
    "experience": "Experience types",
}


def band_for_count(count: int, *, minimum: int) -> str | None:
    if count < minimum:
        return None
    for lower, upper, label, _scale in COUNT_BANDS:
        if count >= lower and (upper is None or count <= upper):
            return label
    raise RuntimeError("Count band configuration does not cover this value.")


def scale_for_band(band: str) -> int:
    for _lower, _upper, label, scale in COUNT_BANDS:
        if label == band:
            return scale
    raise ValueError("Unknown count band.")


assert set(AGE_ORDER) == AGE_GROUPS
assert set(RELATIONSHIP_ORDER) == PERSON_RELATIONSHIP_CATEGORIES
assert set(SETTING_ORDER) == SETTINGS
assert set(EXPERIENCE_ORDER) == EXPERIENCE_TYPES
