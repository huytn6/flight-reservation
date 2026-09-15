import re
import unicodedata


def normalize_search_text(value: str | None) -> str:
    """Normalize Vietnamese text for case- and accent-insensitive search."""
    if not value:
        return ''

    value = value.replace('Đ', 'D').replace('đ', 'd')
    decomposed = unicodedata.normalize('NFD', value)
    without_accents = ''.join(
        character for character in decomposed
        if unicodedata.category(character) != 'Mn'
    )
    return re.sub(r'[^a-z0-9]+', ' ', without_accents.casefold()).strip()
