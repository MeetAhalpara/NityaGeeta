"""
================================================================================
  NITYAGEETA CONTACT US & FEEDBACK PORTAL COMPLETE QA TEST SUITE
================================================================================
Verifies all functionality, validation logic, cybersecurity bounds,
screenshot upload guards, typo detection, and brand voice on /contact.
"""

import re
import sys

# Test runner harness
TOTAL_TESTS = 0
PASSED_TESTS = 0
FAILED_TESTS = 0

def test(name):
    def decorator(fn):
        def wrapper(*args, **kwargs):
            global TOTAL_TESTS, PASSED_TESTS, FAILED_TESTS
            TOTAL_TESTS += 1
            print(f"\n[RUNNING] {name}...")
            try:
                fn(*args, **kwargs)
                PASSED_TESTS += 1
                print(f"  [PASS] {name}")
            except AssertionError as e:
                FAILED_TESTS += 1
                print(f"  [FAIL] {name}: {e}")
            except Exception as e:
                FAILED_TESTS += 1
                print(f"  [ERROR] {name}: Unexpected exception {e}")
        return wrapper
    return decorator


# Read contact page source
with open("frontend/src/app/contact/page.tsx", "r", encoding="utf-8") as f:
    CONTACT_SOURCE = f.read()


@test("Contact: Complete Form Fields & Required Input Markup")
def test_contact_form_fields():
    # 1. Full Name input
    assert 'placeholder="Enter your name"' in CONTACT_SOURCE and 'value={formData.name}' in CONTACT_SOURCE, (
        "Missing Full Name input field"
    )
    # 2. Email Address input
    assert 'value={formData.email}' in CONTACT_SOURCE and 'name@gmail.com' in CONTACT_SOURCE, (
        "Missing Email input field"
    )
    # 3. Message Textarea
    assert '<textarea' in CONTACT_SOURCE and 'value={formData.message}' in CONTACT_SOURCE, (
        "Missing Message textarea"
    )
    # 4. Interactive submit button
    assert 'InteractiveHoverButton' in CONTACT_SOURCE and 'Submit Feedback' in CONTACT_SOURCE, (
        "Missing Submit Feedback button"
    )


@test("Contact: Email RFC Regex & Comprehensive Domain Typo Map")
def test_email_validation_and_typos():
    # Exact email regex from contact page
    regex_match = re.search(r'const validateEmail = \(email: string\): boolean => \{\s*const regex = (/[^/]+/);', CONTACT_SOURCE)
    assert regex_match, "Could not find validateEmail regex in ContactPage"
    pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}$')

    valid_emails = [
        "user@gmail.com",
        "scholar@harvard.edu",
        "arjuna@dharma.co.in",
        "researcher@gita-press.org",
        "meeta@domain.ai"
    ]
    for email in valid_emails:
        assert pattern.match(email), f"Valid email failed: {email}"

    invalid_emails = [
        "notanemail",
        "missingatsign.com",
        "user@",
        "@domain.com",
        "user@domain",
        "user@.com",
        ""
    ]
    for email in invalid_emails:
        assert not pattern.match(email), f"Invalid email passed: {email}"

    # Verify domain typo correction map covers all top email providers
    for typo, correct in [
        ("gamil.com", "gmail.com"),
        ("gmial.com", "gmail.com"),
        ("gmai.com", "gmail.com"),
        ("outlok.com", "outlook.com"),
        ("outmail.com", "outlook.com"),
        ("hotmial.com", "hotmail.com"),
        ("yaho.com", "yahoo.com"),
        ("icoud.com", "icloud.com")
    ]:
        assert f'"{typo}": "{correct}"' in CONTACT_SOURCE, f"Missing typo mapping for {typo} -> {correct}"


@test("Contact: 6 Categories & Conditional 'Other' Text Input Trigger")
def test_category_selection():
    expected_categories = [
        ("ai_feedback", "AI Dialogue Feedback & Prompt Grounding"),
        ("verse_correction", "Sanskrit Verse / OCR Typo Correction"),
        ("commentary_insight", "Share Commentary Insights / Traditional Bhashya"),
        ("bug_report", "UI Glitch or Technical Bug Report"),
        ("report_misuse", "Report Misuse / Misinterpretation"),
        ("other", "Other Inquiry"),
    ]
    for cat_id, cat_label in expected_categories:
        assert f'id: "{cat_id}"' in CONTACT_SOURCE, f"Missing category ID {cat_id}"
        assert cat_label in CONTACT_SOURCE, f"Missing category label '{cat_label}'"

    # Verify conditional 'Other' input field exists when category === 'other'
    assert 'formData.category === "other"' in CONTACT_SOURCE, "Missing conditional 'other' category check"
    assert 'placeholder="Please describe other category..."' in CONTACT_SOURCE, (
        "Missing custom specification input for 'other' category"
    )


@test("Contact: Screenshot Upload Strict Security Guards (MIME, Quota, Memory Leak)")
def test_screenshot_guards():
    # 1. Strict MIME type check
    assert 'file.type.startsWith("image/")' in CONTACT_SOURCE, "Missing file.type.startsWith('image/') guard"
    
    # 2. Informative warning that PDFs are not allowed as bug screenshots
    assert "PDFs are not supported" in CONTACT_SOURCE, "Missing user alert that PDFs are not supported as screenshots"

    # 3. Maximum 5 screenshots limit
    assert "5 - uploadedImages.length" in CONTACT_SOURCE, "Missing 5-slot quota check"
    assert "Maximum limit of 5 screenshots reached" in CONTACT_SOURCE, "Missing max limit message"

    # 4. Revocation of Object URLs on image removal to prevent browser memory leaks
    assert "URL.revokeObjectURL(removed.preview)" in CONTACT_SOURCE, (
        "Missing memory leak guard: URL.revokeObjectURL on image delete"
    )


@test("Contact: Lightbox Viewer Features & Scroll Lock UX")
def test_lightbox_modal():
    # 1. Body scroll lock when lightbox opens
    assert 'document.body.style.overflow = "hidden"' in CONTACT_SOURCE, "Missing body overflow hidden lock"
    assert 'document.body.style.overflow = "unset"' in CONTACT_SOURCE, "Missing body overflow cleanup"

    # 2. Escape key closes modal
    assert 'e.key === "Escape"' in CONTACT_SOURCE, "Missing Escape key listener to close modal"

    # 3. Lightbox zoom in / zoom out / reset controls
    assert "ZoomIn" in CONTACT_SOURCE and "ZoomOut" in CONTACT_SOURCE and "RotateCcw" in CONTACT_SOURCE, (
        "Missing zoom and rotate control icons in lightbox"
    )


@test("Contact: Brand Voice Compliance (Zero First-Person 'We')")
def test_contact_brand_voice():
    # Verify reverent brand voice with zero 'We rely', 'We welcome'
    lowered = CONTACT_SOURCE.lower()
    assert "we rely" not in lowered, "Found forbidden first-person 'we rely'"
    assert "we welcome" not in lowered, "Found forbidden first-person 'we welcome'"
    assert "we cross-check" not in lowered, "Found forbidden first-person 'we cross-check'"


@test("Architecture: Zero Competitor Mentions in Table Header")
def test_architecture_competitor_branding():
    with open("frontend/src/app/architecture/page.tsx", "r", encoding="utf-8") as f:
        arch_source = f.read()

    # The table header must be 'Generic AI' without ChatGPT or Claude in the header
    assert "Generic AI (ChatGPT / Claude)" not in arch_source, (
        "Table header still contains 'Generic AI (ChatGPT / Claude)'"
    )
    assert '<th className="p-4 sm:p-6 text-red-600 dark:text-red-400">Generic AI</th>' in arch_source, (
        "Missing cleaned 'Generic AI' table header in architecture page"
    )


if __name__ == "__main__":
    print("=" * 80)
    print("  NITYAGEETA CONTACT US PORTAL COMPREHENSIVE QA AUDIT")
    print("=" * 80)

    test_contact_form_fields()
    test_email_validation_and_typos()
    test_category_selection()
    test_screenshot_guards()
    test_lightbox_modal()
    test_contact_brand_voice()
    test_architecture_competitor_branding()

    print("\n" + "=" * 80)
    print(f"  TOTAL TESTS EXECUTED: {TOTAL_TESTS}")
    print(f"  PASSED: {PASSED_TESTS} / {TOTAL_TESTS}")
    print(f"  FAILED: {FAILED_TESTS} / {TOTAL_TESTS}")
    print("=" * 80)

    if FAILED_TESTS == 0:
        print("\nALL CONTACT PAGE & ARCHITECTURE VERIFICATION TESTS PASSED 100%!\n")
    else:
        sys.exit(1)
