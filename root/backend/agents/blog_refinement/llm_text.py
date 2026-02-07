# -*- coding: utf-8 -*-
# ABOUTME: This file normalizes LLM provider outputs (str vs LangChain messages) into plain text.
# ABOUTME: It lets refinement nodes treat model responses consistently across providers and wrappers.

from typing import Any


def coerce_llm_output_to_text(response: Any) -> str:
    """Convert an LLM response into a plain string."""
    if response is None:
        return ""

    if isinstance(response, str):
        return response

    content = getattr(response, "content", None)
    if isinstance(content, str):
        return content
    if content is not None:
        return str(content)

    return str(response)
