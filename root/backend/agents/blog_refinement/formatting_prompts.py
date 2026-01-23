# ABOUTME: Prompts for the blog formatting pass that adds structural elements.
# ABOUTME: Transforms refined drafts into visually engaging, scannable content.
# ABOUTME: Provides base and strict formatting prompts used by the blog refinement pipeline.

from typing import List, Dict, Any
from string import Template

# NOTE: This prompt uses $variable syntax for string.Template substitution
# to avoid conflicts with curly braces in LaTeX formulas like \\frac{a}{b}
BLOG_FORMATTING_PROMPT_TEMPLATE = r"""
<task>
Transform this blog draft into a **scannable, visually structured** document.
</task>

<persona_instructions>
$persona_instructions
</persona_instructions>

<blog_draft>
$blog_draft
</blog_draft>

<formatting_rules>
1. **TL;DR**: Add at the VERY TOP as blockquote: > **TL;DR** followed by > - bullet points (3-5)
2. **BULLETS**: Convert prose lists (3+ items) to bullet points
3. **CALLOUTS**: Add 2-4 callouts using > 💡/⚠️/🎯 **Label:** format where they add value
4. **IMAGES**: Add 2-4 [IMAGE: description] placeholders where visuals help
5. **HEADINGS**: Use H2 for sections, H3 for subsections (no H4+)
6. **DIVIDERS**: Add --- between major H2 sections
7. **CODE**: Ensure each code block has lead-in explanation
8. **EQUATIONS**: Group related equations together in multi-line display blocks using $$ (Substack compatible). Avoid scattering inline equations.
</formatting_rules>

<constraints>
**PRESERVE ALL CONTENT** - Never remove or summarize
**PRESERVE CODE BLOCKS** - Exactly as-is
**PRESERVE LINKS/CITATIONS** - All references intact
**PRESERVE EQUATIONS** - Keep LaTeX syntax unchanged
</constraints>

<output_format>
Output complete formatted markdown. No JSON, no code fences.
</output_format>
"""

# NOTE: This prompt uses $variable syntax for string.Template substitution
# to avoid conflicts with curly braces in LaTeX formulas like \\frac{a}{b}
BLOG_FORMATTING_PROMPT_STRICT_TEMPLATE = r"""
<task>
Transform this blog draft into a **scannable, visually structured** document.
**RETRY ATTEMPT** - Previous attempt incomplete. Focus on missing elements.
</task>

<retry_context>
Attempt: $attempt_number of 3
Previous Score: $previous_score
Missing Elements: $missing_elements
</retry_context>

<persona_instructions>
$persona_instructions
</persona_instructions>

<blog_draft>
$blog_draft
</blog_draft>

<formatting_rules>
1. **TL;DR** (REQUIRED): Add at the VERY TOP as blockquote: > **TL;DR** followed by > - bullet points (3-5)
2. **BULLETS**: Convert prose lists (3+ items) to bullet points
3. **CALLOUTS**: Add 2-4 callouts using > 💡/⚠️/🎯 **Label:** format
4. **IMAGES**: Add 2-4 [IMAGE: description] placeholders
5. **HEADINGS**: Use H2 for sections, H3 for subsections (no H4+)
6. **DIVIDERS**: Add --- between major H2 sections
7. **CODE**: Ensure each code block has lead-in explanation
8. **EQUATIONS**: Group related equations together in multi-line display blocks using $$ (Substack compatible). Avoid scattering inline equations.
</formatting_rules>

<constraints>
**PRESERVE ALL CONTENT** - Never remove or summarize
**PRESERVE CODE BLOCKS** - Exactly as-is
**PRESERVE LINKS/CITATIONS** - All references intact
**PRESERVE EQUATIONS** - Keep LaTeX syntax unchanged
</constraints>

<output_format>
Output complete formatted markdown. No JSON, no code fences.
</output_format>
"""


def build_strict_formatting_prompt(
    blog_draft: str,
    persona_instructions: str,
    missing_elements: List[str],
    feedback_history: List[Dict[str, Any]],
    attempt_number: int
) -> str:
    """
    Builds a stricter formatting prompt for retry attempts based on validation feedback.

    Args:
        blog_draft: The original blog content
        persona_instructions: Persona writing guidelines
        missing_elements: List of elements that were missing in previous attempt
        feedback_history: History of validation feedback
        attempt_number: Current retry attempt (1-based)

    Returns:
        Formatted prompt string with strict instructions
    """
    # Build missing elements context
    missing_context = ""
    if missing_elements:
        missing_context = "\n".join(f"  - {elem}" for elem in missing_elements)
    else:
        missing_context = "  - None reported"

    # Build feedback context from latest feedback
    feedback_context = ""
    if feedback_history:
        latest_feedback = feedback_history[-1]
        score = latest_feedback.get("score", "N/A")
        feedback_context = f"Latest validation score: {score}"

    # Calculate strictness level
    strictness_level = min(attempt_number, 3)

    # Create strict instructions block with retry context
    strict_instructions = f"""
**RETRY ATTEMPT {attempt_number} - STRICT ENFORCEMENT**

Previous Issues:
{missing_context}

{feedback_context}

Strictness Level: {strictness_level}/3
{'This is your FINAL attempt - ensure ALL elements are present.' if attempt_number >= 3 else 'Be thorough and ensure all required elements are included.'}
"""

    # Inject strict instructions into base prompt using .replace()
    prompt = Template(BLOG_FORMATTING_PROMPT_STRICT_TEMPLATE).safe_substitute(
        attempt_number=attempt_number,
        previous_score=feedback_history[-1].get("score", "N/A") if feedback_history else "N/A",
        missing_elements=missing_context,
        persona_instructions=persona_instructions,
        blog_draft=blog_draft
    )

    # Insert the retry-specific instructions before the <task> tag
    prompt = prompt.replace(
        "<task>",
        f"{strict_instructions}\n<task>"
    )

    return prompt


def get_formatting_prompt(
    blog_draft: str,
    persona_instructions: str = "",
    formatting_attempts: int = 0,
    formatting_missing_elements: List[str] = None,
    formatting_feedback_history: List[Dict[str, Any]] = None,
    max_formatting_retries: int = 3
) -> str:
    """
    Selects the appropriate formatting prompt based on retry context.

    Args:
        blog_draft: The blog content to format
        persona_instructions: Persona writing guidelines
        formatting_attempts: Current attempt number
        formatting_missing_elements: Elements missing from validation
        formatting_feedback_history: Feedback from previous attempts
        max_formatting_retries: Maximum retry attempts

    Returns:
        Formatted prompt string
    """
    # Handle None values for lists
    if formatting_missing_elements is None:
        formatting_missing_elements = []
    if formatting_feedback_history is None:
        formatting_feedback_history = []

    # First attempt - use base prompt
    if formatting_attempts == 0:
        return Template(BLOG_FORMATTING_PROMPT_TEMPLATE).safe_substitute(
            persona_instructions=persona_instructions,
            blog_draft=blog_draft
        )

    # Retry attempts - use strict prompt
    if formatting_attempts > 0:
        return build_strict_formatting_prompt(
            blog_draft=blog_draft,
            persona_instructions=persona_instructions,
            missing_elements=formatting_missing_elements,
            feedback_history=formatting_feedback_history,
            attempt_number=formatting_attempts
        )

    # Default fallback (should not reach here)
    return Template(BLOG_FORMATTING_PROMPT_TEMPLATE).safe_substitute(
        persona_instructions=persona_instructions,
        blog_draft=blog_draft
    )
