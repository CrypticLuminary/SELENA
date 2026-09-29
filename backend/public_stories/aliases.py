import secrets

_ALIAS_WORDS = (
    "Aspen",
    "Birch",
    "Cedar",
    "Cove",
    "Dawn",
    "Fern",
    "Hazel",
    "Ivy",
    "Juniper",
    "Linden",
    "Maple",
    "Marsh",
    "Meadow",
    "Reed",
    "River",
    "Rowan",
    "Sky",
    "Vale",
    "Willow",
    "Wren",
)


def generate_public_alias() -> str:
    """Generate a neutral presentation alias unrelated to submission data."""
    return f"Anonymous {secrets.choice(_ALIAS_WORDS)}"
