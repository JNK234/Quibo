# -*- coding: utf-8 -*-
"""
LangGraph definition for the Blog Refinement Agent.
Imports node functions from nodes.py and defines the graph structure.
"""
import logging
from langgraph.graph import StateGraph, END

from backend.agents.blog_refinement.state import BlogRefinementState
from backend.agents.blog_refinement.nodes import (
    generate_introduction_node,
    generate_conclusion_node,
    generate_summary_node,
    generate_titles_node,
    format_draft_node,
    assemble_refined_draft_node
)
from backend.agents.blog_refinement.formatting_validator import validate_formatting_node

logger = logging.getLogger(__name__)


def should_retry_formatting(state: BlogRefinementState) -> str:
    """Determine whether to retry formatting or proceed.

    Returns:
        "retry" if should retry, "complete" if done
    """
    max_attempts = 3
    threshold_score = 0.85

    # Check if we've hit max attempts
    if state.formatting_attempts >= max_attempts:
        logger.warning(
            f"Max formatting attempts ({max_attempts}) reached, "
            f"proceeding with score: {state.formatting_validation_score}"
        )
        return "complete"

    # Check validation score
    if state.formatting_validation_score is not None and state.formatting_validation_score >= threshold_score:
        logger.info(f"Formatting validation passed with score {state.formatting_validation_score:.0%}")
        return "complete"

    # Retry with feedback
    logger.info(
        f"Formatting validation score {state.formatting_validation_score:.0%} "
        f"below threshold, retrying (attempt {state.formatting_attempts + 1})"
    )
    return "retry"


# --- Graph Creation ---

async def create_refinement_graph() -> StateGraph:
    """Creates the LangGraph StateGraph for the blog refinement process."""
    graph = StateGraph(BlogRefinementState)

    graph.add_node("generate_introduction", generate_introduction_node)
    graph.add_node("generate_conclusion", generate_conclusion_node)
    graph.add_node("generate_summary", generate_summary_node)
    graph.add_node("generate_titles", generate_titles_node)
    graph.add_node("format_draft", format_draft_node)
    graph.add_node("assemble_draft", assemble_refined_draft_node)
    graph.add_node("validate_formatting", validate_formatting_node)

    # --- Define Conditional Logic ---
    def should_continue(state: BlogRefinementState) -> str:
        """Determines whether to continue to the next step or end due to error."""
        if state.error:
            logger.error(f"Error detected in state, ending graph execution: {state.error}")
            return "end_due_to_error"
        else:
            return "continue"

    # --- Define Edges with Conditionals ---
    graph.set_entry_point("generate_introduction")
    graph.add_edge("generate_introduction", "generate_conclusion")
    graph.add_edge("generate_conclusion", "generate_summary")
    graph.add_edge("generate_summary", "generate_titles")
    graph.add_edge("generate_titles", "assemble_draft")
    graph.add_edge("assemble_draft", "format_draft")
    # Add validation after formatting
    graph.add_edge("format_draft", "validate_formatting")
    # Conditional retry loop: retry formatting or complete
    graph.add_conditional_edges(
        "validate_formatting",
        should_retry_formatting,
        {
            "retry": "format_draft",
            "complete": END
        }
    )

    # Compile the graph into a runnable application
    app = graph.compile()
    logger.info("Blog Refinement Graph compiled successfully.")
    return app
