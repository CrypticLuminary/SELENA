PUBLICATION_MODE_DISABLED = "disabled"
PUBLICATION_MODE_SINGLE = "single_moderator"
PUBLICATION_MODE_DUAL = "dual_control"
PUBLICATION_MODES = {
    PUBLICATION_MODE_DISABLED,
    PUBLICATION_MODE_SINGLE,
    PUBLICATION_MODE_DUAL,
}

MAX_PUBLIC_EXCERPT_LENGTH = 320
PUBLIC_WITHHELD = "withheld"

# Public relationship metadata is deliberately limited to the top-level
# submission categories. More detailed relationship values remain private by
# default under the production data inventory.
PUBLIC_RELATIONSHIPS = {
    "family",
    "partner",
    "friend_acquaintance",
    "authority",
    "stranger",
    "online",
    "other",
    "prefer_not",
    PUBLIC_WITHHELD,
}

REPORT_REASONS = {
    "privacy_concern",
    "content_warning",
    "harmful_content",
    "other",
}
