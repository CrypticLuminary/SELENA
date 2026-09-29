AGE_GROUPS = {
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
}

SETTINGS = {
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
}

EXPERIENCE_TYPES = {
    "unwanted_contact",
    "sexual_comments",
    "pressure_coercion",
    "threatening",
    "stalking",
    "online_sexual",
    "other",
    "prefer_not",
}

PERSON_RELATIONSHIP_CATEGORIES = {
    "family",
    "partner",
    "friend_acquaintance",
    "authority",
    "stranger",
    "online",
    "other",
    "prefer_not",
}

PERSON_RELATIONSHIP_DETAILS = {
    "",
    "parent",
    "stepparent",
    "sibling",
    "half_sibling",
    "grandparent",
    "uncle",
    "aunt",
    "cousin",
    "nephew_niece",
    "child",
    "other_relative",
    "extended_family",
    "prefer_not",
    "spouse",
    "current_partner",
    "former_partner",
    "dating_partner",
    "former_dating_partner",
    "other",
    "teacher",
    "professor",
    "employer_supervisor",
    "coworker",
    "healthcare_worker",
    "religious_leader",
    "police_security",
    "other_authority",
}

INVOLVEMENT = {"", "primary", "sometimes", "prefer_not"}

PERSON_AGE_BANDS = {
    "",
    "under_13",
    "13_17",
    "18_24",
    "25_34",
    "35_44",
    "45_54",
    "55_plus",
    "dont_know",
    "prefer_not",
}

FREQUENCIES = {
    "",
    "once",
    "more_than_once",
    "repeated_period",
    "unsure",
    "prefer_not",
}

PERIOD_AGE_BANDS = AGE_GROUPS | {""}

DETAILS_BY_RELATIONSHIP = {
    "family": {
        "parent",
        "stepparent",
        "sibling",
        "half_sibling",
        "grandparent",
        "uncle",
        "aunt",
        "cousin",
        "nephew_niece",
        "child",
        "other_relative",
        "extended_family",
        "prefer_not",
    },
    "partner": {
        "spouse",
        "current_partner",
        "former_partner",
        "dating_partner",
        "former_dating_partner",
        "other",
        "prefer_not",
    },
    "authority": {
        "teacher",
        "professor",
        "employer_supervisor",
        "coworker",
        "healthcare_worker",
        "religious_leader",
        "police_security",
        "other_authority",
        "prefer_not",
    },
}
