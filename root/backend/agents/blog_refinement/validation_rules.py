# ABOUTME: This module provides regex-based validation functions for blog formatting standards.
# ABOUTME: Validates TL;DR, heading hierarchy, callouts, code context, images, and content preservation.

import re
import difflib
from typing import Tuple, List, Dict, Any
from dataclasses import dataclass


def mask_code_blocks(content: str) -> Tuple[str, List[str]]:
    """Replace code blocks with placeholders to avoid false positives in validation.

    Args:
        content: Markdown content with code blocks

    Returns:
        Tuple of (masked_content, list_of_original_blocks)
    """
    blocks = []

    def replacer(match):
        blocks.append(match.group(0))
        return f"__CODE_BLOCK_{len(blocks) - 1}__"

    # Match code blocks: triple backticks with optional language, content, closing backticks
    masked = re.sub(
        r'^```[\w]*\n.*?^```\s*$',
        replacer,
        content,
        flags=re.MULTILINE | re.DOTALL
    )

    return masked, blocks


def restore_code_blocks(content: str, blocks: List[str]) -> str:
    """Restore code blocks after validation.

    Args:
        content: Masked content with placeholders
        blocks: List of original code blocks

    Returns:
        Content with code blocks restored
    """
    for i, block in enumerate(blocks):
        content = content.replace(f"__CODE_BLOCK_{i}__", block)
    return content


def validate_tldr_section(content: str) -> Tuple[bool, str]:
    """Check for TL;DR section at top with bullet list format.

    Validates:
    - Blockquote with "TL;DR" header
    - 3-5 bullet points
    - Positioned within first 500 characters

    Args:
        content: Markdown blog content

    Returns:
        (is_valid, feedback_message)
    """
    # Pattern: blockquote with TL;DR followed by bullet lines
    tldr_pattern = r'^>\s*\*\*TL;DR\*\*'

    match = re.search(tldr_pattern, content, re.MULTILINE)
    if not match:
        return False, "Missing TL;DR section with **TL;DR** header in blockquote format"

    # Check position - should be near beginning
    if match.start() > 500:
        return False, f"TL;DR section found at position {match.start()}, should be within first 500 chars"

    # Find the TL;DR block and count bullets
    # Look for consecutive blockquote bullet lines after the TL;DR header
    start_pos = match.start()
    # Extract text from TL;DR start to next non-blockquote line
    remaining = content[start_pos:]
    tldr_block_match = re.search(r'^>.*?(?=\n[^>]|\n$|$)', remaining, re.MULTILINE | re.DOTALL)

    if not tldr_block_match:
        return False, "TL;DR header found but no blockquote content follows"

    tldr_block = tldr_block_match.group(0)

    # Count bullets within the TL;DR block
    bullets = re.findall(r'^>\s*-\s*.+', tldr_block, re.MULTILINE)
    bullet_count = len(bullets)

    if bullet_count < 3:
        return False, f"TL;DR has only {bullet_count} bullet(s), needs 3-5"
    if bullet_count > 5:
        return False, f"TL;DR has {bullet_count} bullets, should be 3-5 for conciseness"

    return True, f"TL;DR section valid with {bullet_count} bullets"


def validate_heading_hierarchy(content: str) -> Tuple[bool, str]:
    """Check heading hierarchy follows H2/H3 pattern (no H4+).

    Validates:
    - No H4 or deeper headings exist
    - At least one H2 heading exists

    Args:
        content: Markdown blog content

    Returns:
        (is_valid, feedback_message)
    """
    # Mask code blocks first to avoid false positives on markdown in code examples
    masked_content, blocks = mask_code_blocks(content)

    # Check for H4+ headings (4 or more # symbols)
    h4_plus_pattern = r'^#{4,}\s+.+$'
    violations = re.findall(h4_plus_pattern, masked_content, re.MULTILINE)

    if violations:
        example = violations[0][:60] + "..." if len(violations[0]) > 60 else violations[0]
        return False, f"Found {len(violations)} H4+ heading(s) - use H2/H3 only. Example: {example}"

    # Check H2 exists (exactly 2 # symbols, not followed by another #)
    h2_pattern = r'^##\s+(?!#).+$'
    h2_matches = re.findall(h2_pattern, masked_content, re.MULTILINE)
    h2_count = len(h2_matches)

    if h2_count == 0:
        return False, "No H2 headings found - need section structure with ## headings"

    # Count H3 headings for feedback
    h3_pattern = r'^###\s+(?!#).+$'
    h3_matches = re.findall(h3_pattern, masked_content, re.MULTILINE)
    h3_count = len(h3_matches)

    return True, f"Heading hierarchy valid: {h2_count} H2 heading(s), {h3_count} H3 heading(s)"


def validate_callouts(content: str) -> Tuple[bool, str]:
    """Check for callout boxes with approved emoji types.

    Validates:
    - Minimum 2 callouts present
    - Uses approved emoji types (💡 Tip, ⚠️ Warning, 📝 Note, 🔑 Key, 📚 Example, 🎯 Insight)

    Args:
        content: Markdown blog content

    Returns:
        (is_valid, feedback_message)
    """
    # Approved callout emojis per CONTEXT.md (including 🎯 Key Insight)
    callout_pattern = r'^>\s*(💡|⚠️|📝|🔑|📚|🎯)\s*\*\*'

    callouts = re.findall(callout_pattern, content, re.MULTILINE)
    callout_count = len(callouts)

    if callout_count < 2:
        return False, f"Only {callout_count} callout(s) found, recommend 2-4 for engagement"

    # Breakdown by type
    breakdown = {
        '💡': callouts.count('💡'),
        '⚠️': callouts.count('⚠️'),
        '📝': callouts.count('📝'),
        '🔑': callouts.count('🔑'),
        '📚': callouts.count('📚'),
        '🎯': callouts.count('🎯'),
    }

    # Build breakdown string
    breakdown_str = ", ".join(f"{emoji}:{count}" for emoji, count in breakdown.items() if count > 0)

    return True, f"Found {callout_count} callout(s): {breakdown_str}"


def validate_code_context(content: str) -> Tuple[bool, str]:
    """Check every code block has surrounding explanation text.

    Validates:
    - Each code block has text within 3 lines before OR after
    - Text must be substantive (not just headings or blank lines)

    Args:
        content: Markdown blog content

    Returns:
        (is_valid, feedback_message)
    """
    # Find code blocks
    code_blocks = list(re.finditer(r'^```[\w]*\n', content, re.MULTILINE))

    if not code_blocks:
        return True, "No code blocks to validate"

    violations = []
    lines = content.split('\n')

    for match in code_blocks:
        line_num = content[:match.start()].count('\n')

        # Check for text before (within 3 lines, skip blank lines and headings)
        has_context_before = False
        for i in range(max(0, line_num - 3), line_num):
            if i < len(lines) and lines[i].strip() and not lines[i].strip().startswith('#'):
                has_context_before = True
                break

        # Check for text after (find closing ```, then check next 3 lines)
        end_match = re.search(r'^```\s*$', content[match.end():], re.MULTILINE)
        has_context_after = False

        if end_match:
            after_line = content[:match.end() + end_match.end()].count('\n')
            for i in range(after_line, min(len(lines), after_line + 3)):
                if i < len(lines) and lines[i].strip() and not lines[i].strip().startswith('#'):
                    has_context_after = True
                    break

        if not has_context_before and not has_context_after:
            violations.append(f"Line {line_num + 1}")

    if violations:
        return False, f"{len(violations)} code block(s) lack context: {', '.join(violations[:3])}" + \
               ("..." if len(violations) > 3 else "")

    return True, f"All {len(code_blocks)} code block(s) have contextual explanation"


def validate_image_placeholders(content: str) -> Tuple[bool, str]:
    """Check for image placeholders with descriptions.

    Validates:
    - Minimum 2 placeholders present
    - No empty placeholders (must have descriptive text)
    - Format: [IMAGE: description]

    Args:
        content: Markdown blog content

    Returns:
        (is_valid, feedback_message)
    """
    # Pattern: [IMAGE: non-empty text]
    placeholder_pattern = r'\[IMAGE:\s*[^\]]+\]'
    placeholders = re.findall(placeholder_pattern, content)
    placeholder_count = len(placeholders)

    if placeholder_count < 2:
        return False, f"Only {placeholder_count} image placeholder(s) found, recommend 2+ for visual engagement"

    # Check for empty placeholders
    empty_pattern = r'\[IMAGE:\s*\]'
    empty = re.findall(empty_pattern, content)
    if empty:
        return False, f"Found {len(empty)} empty image placeholder(s) - must include descriptions"

    return True, f"Found {placeholder_count} image placeholder(s) with descriptions"


def validate_latex_preserved(original: str, formatted: str) -> Tuple[bool, str]:
    """Check LaTeX blocks weren't mangled during formatting.

    Validates equation markers are present but doesn't check content.
    Per RESEARCH.md: validate presence only, not syntax.

    Args:
        original: Content before formatting
        formatted: Content after formatting

    Returns:
        (is_valid, feedback_message)
    """
    # Count inline LaTeX: single dollar signs (exclude double)
    inline_pattern = r'(?<!\$)\$(?!\$)[^\$]+\$(?!\$)'
    orig_inline = len(re.findall(inline_pattern, original))
    fmt_inline = len(re.findall(inline_pattern, formatted))

    # Count display LaTeX: double dollar signs
    display_pattern = r'\$\$[^\$]+\$\$'
    orig_display = len(re.findall(display_pattern, original))
    fmt_display = len(re.findall(display_pattern, formatted))

    # Calculate totals
    total_orig = orig_inline + orig_display
    total_fmt = fmt_inline + fmt_display

    # If no equations in original, nothing to preserve
    if total_orig == 0:
        return True, "No LaTeX equations in original content"

    # Check formatted retains >= 90% of original equation count
    retention_ratio = total_fmt / total_orig if total_orig > 0 else 1.0

    if retention_ratio < 0.90:
        return False, f"LaTeX equations reduced from {total_orig} to {total_fmt} ({retention_ratio:.0%} retention, need ≥90%)"

    return True, f"LaTeX preserved: {fmt_inline} inline, {fmt_display} display (total: {total_fmt})"


def validate_content_preserved(original: str, formatted: str) -> Tuple[bool, str]:
    """Check that formatting preserved all original content.

    Uses word-level comparison to ignore whitespace changes.
    Allows minor trimming (up to 5% word reduction).

    Args:
        original: Content before formatting
        formatted: Content after formatting

    Returns:
        (is_valid, feedback_message)
    """
    # Normalize: lowercase, split to words, remove pure whitespace
    def normalize(text: str) -> List[str]:
        return [w.strip() for w in text.lower().split() if w.strip()]

    orig_words = normalize(original)
    fmt_words = normalize(formatted)

    if not orig_words:
        return True, "No original content to compare"

    # Calculate word retention
    word_retention = len(fmt_words) / len(orig_words)

    if word_retention < 0.95:
        return False, f"Content loss detected: {word_retention:.0%} of original words retained (need ≥95%)"

    # Check for major structural changes using sequence matcher
    matcher = difflib.SequenceMatcher(None, orig_words, fmt_words)
    similarity = matcher.ratio()

    if similarity < 0.90:
        return False, f"Significant content changes detected: {similarity:.0%} similarity (need ≥90%)"

    return True, f"Content preserved: {word_retention:.0%} retention, {similarity:.0%} similarity"


@dataclass
class ValidationReport:
    """Structured validation result."""
    is_valid: bool
    score: float
    passed: List[str]
    failed: List[str]
    feedback: Dict[str, str]


def validate_formatting_standards(content: str, original_content: str = None) -> ValidationReport:
    """Run all validation checks and return comprehensive report.

    Args:
        content: Formatted markdown blog content
        original_content: Original content for preservation check (optional)

    Returns:
        ValidationReport with aggregated results
    """
    # Define validators (order matters for consistency in reports)
    validators = {
        'tldr_section': validate_tldr_section,
        'heading_hierarchy': validate_heading_hierarchy,
        'callouts': validate_callouts,
        'code_context': validate_code_context,
        'image_placeholders': validate_image_placeholders,
    }

    passed = []
    failed = []
    feedback = {}

    # Run each validator on content
    for name, validator in validators.items():
        is_valid, message = validator(content)
        feedback[name] = message

        if is_valid:
            passed.append(name)
        else:
            failed.append(name)

    # Optionally run content preservation check if original provided
    if original_content:
        is_valid, message = validate_content_preserved(original_content, content)
        feedback['content_preservation'] = message

        if is_valid:
            passed.append('content_preservation')
        else:
            failed.append('content_preservation')

    # Calculate score (0.0 to 1.0)
    total_checks = len(validators) + (1 if original_content else 0)
    score = len(passed) / total_checks if total_checks > 0 else 0.0

    # Apply 85% threshold for is_valid
    is_valid = score >= 0.85

    return ValidationReport(
        is_valid=is_valid,
        score=score,
        passed=passed,
        failed=failed,
        feedback=feedback
    )
