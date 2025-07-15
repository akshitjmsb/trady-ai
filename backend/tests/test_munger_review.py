import unittest
import sys
import os

# Add the parent directory to the Python path to allow for module imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from munger_review_route import parse_munger_response

class TestMungerResponseParser(unittest.TestCase):

    def test_parse_valid_markdown_response(self):
        mock_response = """
### Charlie Munger Management Review – TestCo

| Factor | Explanation | Rating |
| ------ | ----------- | :----: |
| Integrity and honesty in shareholder communications | The team is very clear in their communications. | ★★★★☆ |
| Competence in capital allocation | Excellent track record of deploying capital wisely. | ★★★★★ |
| Long-term vision vs. short-term focus | Always focused on the long-term health of the company. | ★★★★★ |
| Alignment with shareholder interests | Compensation is tied to performance. | ★★★★☆ |
| Track record of value creation | Consistently created immense shareholder value. | ★★★★★ |

**Overall Munger Management Score:** 4.6 ★ – Exceptional

> **Summary:** This is a world-class management team that embodies Charlie Munger's core principles. They have a proven ability to create immense, durable value. **Recommendation:** BUY
"""

        expected_output = {
            'ratings': [
                {'criterion': 'Integrity and honesty in shareholder communications', 'explanation': 'The team is very clear in their communications.', 'rating': 4},
                {'criterion': 'Competence in capital allocation', 'explanation': 'Excellent track record of deploying capital wisely.', 'rating': 5},
                {'criterion': 'Long-term vision vs. short-term focus', 'explanation': 'Always focused on the long-term health of the company.', 'rating': 5},
                {'criterion': 'Alignment with shareholder interests', 'explanation': 'Compensation is tied to performance.', 'rating': 4},
                {'criterion': 'Track record of value creation', 'explanation': 'Consistently created immense shareholder value.', 'rating': 5}
            ],
            'overallScore': 'Exceptional',
            'summary': "This is a world-class management team that embodies Charlie Munger's core principles. They have a proven ability to create immense, durable value.",
            'verdict': 'BUY'
        }

        actual_output = parse_munger_response(mock_response)
        self.assertEqual(actual_output, expected_output)

if __name__ == '__main__':
    unittest.main()
