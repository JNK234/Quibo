# ABOUTME: This file defines the state management models for the blog refinement agent.
# ABOUTME: It includes state classes for title generation, SEO optimization, and social media content creation.
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from backend.agents.cost_tracking_state import CostTrackingMixin
from backend.models.generation_config import TitleGenerationConfig, SocialMediaConfig

# --- Chunk structure ---
class FormattingChunk(BaseModel):
    """Represents a single formatted chunk."""
    id: int = Field(..., description="Chunk identifier")
    type: str = Field(..., description="Chunk type (intro_with_tldr, body_section, conclusion)")
    content: str = Field(..., description="Formatted content for this chunk")
    success: bool = Field(..., description="Whether formatting succeeded")
    error: Optional[str] = Field(default=None, description="Error if formatting failed")

class TitleOption(BaseModel):
    """Represents a single generated title/subtitle option."""
    title: str = Field(..., description="The main title suggestion.")
    subtitle: Optional[str] = Field(None, description="The corresponding subtitle suggestion.")
    reasoning: str = Field(..., description="Brief explanation of why this title/subtitle is suitable (e.g., SEO focus, catchiness).")

class RefinementResult(BaseModel):
    """Output model containing the refined blog content and metadata."""
    refined_draft: str = Field(..., description="The full blog content with the generated introduction and conclusion integrated.")
    formatted_draft: Optional[str] = Field(default=None, description="The blog draft after formatting pass (with TL;DR, callouts, dividers, etc.)")
    formatting_skipped: bool = Field(default=False, description="Whether formatting was skipped because draft was already well-structured")
    formatting_skip_reason: Optional[str] = Field(default=None, description="Reason why formatting was skipped, if applicable")
    summary: str = Field(..., description="A concise summary of the entire blog post.")
    title_options: List[TitleOption] = Field(..., description="A list of suggested title and subtitle options.")

class BlogRefinementState(CostTrackingMixin, BaseModel):
    """Represents the state managed by the BlogRefinementAgent's graph (if using LangGraph)."""
    original_draft: str
    introduction: Optional[str] = None # Added
    conclusion: Optional[str] = None # Added
    summary: Optional[str] = None
    title_options: Optional[List[TitleOption]] = None
    refined_draft: Optional[str] = None # Added to resolve AttributeError
    formatted_draft: Optional[str] = Field(default=None, description="The blog draft after formatting pass (with TL;DR, callouts, dividers, etc.)")
    formatting_skipped: bool = Field(default=False, description="Whether formatting was skipped because draft was already well-structured")
    formatting_skip_reason: Optional[str] = Field(default=None, description="Reason why formatting was skipped, if applicable")
    clarity_flow_suggestions: Optional[str] = Field(default=None, description="Suggestions for improving clarity and flow of the blog draft.")
    structure_analysis: Optional[Dict[str, Any]] = Field(default=None, description="LLM-generated structure analysis and formatting plan")
    formatting_chunks: Optional[List[Dict[str, Any]]] = Field(default=None, description="List of formatted chunks from parallel formatting")
    error: Optional[str] = None
    model: Optional[Any] = Field(default=None, repr=False)
    persona_service: Optional[Any] = Field(default=None, repr=False)
    persona_name: str = Field(
        default="neuraforge",
        description="Selected persona for content generation voice and style"
    )
    project_id: Optional[str] = Field(default=None)

    # Configuration fields for generation control
    title_config: Optional[TitleGenerationConfig] = Field(
        default=None,
        description="Configuration for title and subtitle generation"
    )
    social_config: Optional[SocialMediaConfig] = Field(
        default=None,
        description="Configuration for social media post generation"
    )

    # Formatting retry tracking
    formatting_attempts: int = Field(default=0, description="Number of formatting attempts made")
    max_formatting_retries: int = Field(default=3, description="Maximum formatting retry attempts (original + 2 retries)")
    formatting_feedback_history: List[Dict[str, Any]] = Field(default_factory=list, description="History of formatting validation feedback")
    formatting_validation_score: Optional[float] = Field(default=None, description="Latest formatting validation score (0.0-1.0)")
    formatting_missing_elements: List[str] = Field(default_factory=list, description="Missing formatting elements from validation")
    formatting_present_elements: List[str] = Field(default_factory=list, description="Present formatting elements from validation")

    # SQL persistence (optional)
    sql_project_manager: Optional[Any] = Field(default=None, description="SQL project manager for milestone persistence")

    def __init__(self, **data):
        super().__init__(**data)
        self.current_agent_name = "BlogRefinementAgent"
        self.current_stage = data.get("current_stage", "refinement")
        if not self.project_id:
            self.project_id = data.get("project_id")
        self.ensure_cost_aggregator(project_id=self.project_id)
        if self.cost_aggregator and self.project_id and not self.cost_aggregator.current_workflow.get("start_time"):
            self.cost_aggregator.start_workflow(project_id=self.project_id)
