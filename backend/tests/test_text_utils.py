import unittest

from utils.text_utils import normalize_search_text


class NormalizeSearchTextTests(unittest.TestCase):
    def test_removes_vietnamese_diacritics(self):
        self.assertEqual(normalize_search_text('Hà Nội'), 'ha noi')
        self.assertEqual(normalize_search_text('Đà Nẵng'), 'da nang')

    def test_normalizes_case_and_punctuation(self):
        self.assertEqual(normalize_search_text('  SÂN BAY - NỘI BÀI  '), 'san bay noi bai')

    def test_handles_empty_values(self):
        self.assertEqual(normalize_search_text(None), '')
        self.assertEqual(normalize_search_text(''), '')


if __name__ == '__main__':
    unittest.main()
