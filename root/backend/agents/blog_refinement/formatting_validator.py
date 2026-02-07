# ABOUTME: This file implements the formatting validation judge node for blog refinement.
# ABOUTME: It evaluates blog formatting against required elements like TL;DR, callouts, dividers, etc.
# ABOUTME: Uses fast regex-based validators (not LLM) for consistent, deterministic validation.

import logging
from typing import Dict, Any
from backend.agents.cost_tracking_decorator import track_node_costs
from backend.agents.blog_refinement.state import BlogRefinementState
from backend.agents.blog_refinement.validation_rules import (
    validate_formatting_standards,
    validate_content_preserved,
    validate_latex_preserved,
    ValidationReport
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@track_node_costs("formatting_validator", agent_name="BlogRefinementAgent", stage="refinement")
async def validate_formatting_node(state: BlogRefinementState) -> Dict[str, Any]:
    """
    Validates formatting of the blog draft against required elements using regex validators.

    Checks for:
    - TL;DR section (blockquote with "TL;DR" pattern)
    - Callout boxes (>=2 of 💡, 🎯, ⚠️)
    - Horizontal dividers (--- between sections)
    - Image placeholders ([IMAGE: ...] pattern)
    - Code block lead-ins
    - Content preservation (no deletions during formatting)
    - LaTeX preservation (equations intact through formatting)

    Returns:
        Dict with validation results and updated state fields
    """
    logging.info("Executing node: validate_formatting_node")
    logger.debug(f"Formatting validator - Current attempt: {state.formatting_attempts + 1}")

    if not state.formatted_draft:
        logging.warning("No formatted draft to validate.")
        return {
            "formatting_validation_score": 0.0,
            "formatting_missing_elements": ["all"],
            "formatting_present_elements": [],
            "formatting_feedback_history": state.formatting_feedback_history + [{
                "attempt": state.formatting_attempts + 1,
                "score": 0.0,
                "missing": ["all"],
                "present": [],
                "feedback": "No formatted draft provided"
            }],
            "formatting_attempts": state.formatting_attempts + 1
        }

    formatted_content = state.formatted_draft
    logger.debug(f"Validating formatted draft of length: {len(formatted_content)}")

    try:
        # Run regex-based formatting validation (no LLM call)
        report: ValidationReport = validate_formatting_standards(formatted_content)

        # Run content preservation checks if we have the baseline (refined_draft)
        if state.refined_draft:
            # Content preservation: refined_draft is BASELINE (before formatting)
            # formatted_draft is what we're validating (after formatting)
            # This catches formatting-stage deletions
            preserved_ok, preserve_msg = validate_content_preserved(
                state.refined_draft,  # baseline: content before formatting
                state.formatted_draft  # result: content after formatting
            )
            if not preserved_ok:
                report.failed.append("content_preservation")
                report.feedback["content_preservation"] = preserve_msg
                report.score = report.score * 0.8  # Heavy penalty for content loss
                logger.warning(f"Content preservation check failed: {preserve_msg}")
            else:
                logger.info("Content preservation check passed")

            # LaTeX preservation: same direction (refined -> formatted)
            latex_ok, latex_msg = validate_latex_preserved(
                state.refined_draft,  # baseline: LaTeX before formatting
                state.formatted_draft  # result: LaTeX after formatting
            )
            if not latex_ok:
                report.failed.append("latex_preservation")
                report.feedback["latex_preservation"] = latex_msg
                report.score = report.score * 0.9  # Moderate penalty for LaTeX changes
                logger.warning(f"LaTeX preservation check failed: {latex_msg}")
            else:
                logger.info("LaTeX preservation check passed")

        # Build comprehensive feedback message
        feedback_parts = []
        if report.failed:
            feedback_parts.append(f"Missing elements: {', '.join(report.failed)}")
        if report.feedback:
            for key, msg in report.feedback.items():
                feedback_parts.append(f"{key}: {msg}")
        if not feedback_parts:
            feedback_parts.append("All formatting requirements met")

        feedback_message = " | ".join(feedback_parts)

        logger.info(f"Formatting validation - Score: {report.score:.2%}, "
                   f"Missing: {len(report.failed)}, Present: {len(report.passed)}")

        # Build feedback history entry
        feedback_entry = {
            "attempt": state.formatting_attempts + 1,
            "score": report.score,
            "missing": report.failed,
            "present": report.passed,
            "feedback": feedback_message
        }

        # Update feedback history
        new_history = state.formatting_feedback_history + [feedback_entry]

        # Return complete state update (all fields per RESEARCH.md pitfall 4)
        return {
            "formatting_validation_score": report.score,
            "formatting_missing_elements": report.failed,
            "formatting_present_elements": report.passed,
            "formatting_feedback_history": new_history,
            "formatting_attempts": state.formatting_attempts + 1
        }

    except Exception as e:
        logging.error(f"Error validating formatting: {e}")
        logger.debug(f"Error in formatting validator. Incremented attempt count to: {state.formatting_attempts + 1}")

        # On exception, still increment attempts but return default low score
        return {
            "formatting_validation_score": 0.0,
            "formatting_missing_elements": ["all"],
            "formatting_present_elements": [],
            "formatting_feedback_history": state.formatting_feedback_history + [{
                "attempt": state.formatting_attempts + 1,
                "score": 0.0,
                "missing": ["all"],
                "present": [],
                "feedback": f"Validation error: {str(e)}"
            }],
            "formatting_attempts": state.formatting_attempts + 1
        }
