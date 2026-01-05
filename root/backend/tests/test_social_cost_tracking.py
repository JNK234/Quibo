# -*- coding: utf-8 -*-
import asyncio

from backend.agents.social_media_agent import SocialMediaAgent


class DummySqlProjectManager:
    def __init__(self):
        self.calls = []

    async def track_cost(
        self,
        project_id: str,
        agent_name: str,
        operation: str,
        input_tokens: int,
        output_tokens: int,
        cost: float,
        model_used: str = None,
        metadata: dict = None,
        duration_seconds: float = None,
    ) -> bool:
        self.calls.append(
            {
                "project_id": project_id,
                "agent_name": agent_name,
                "operation": operation,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "cost": cost,
                "model_used": model_used,
                "metadata": metadata or {},
            }
        )
        return True


class DummyModel:
    def __init__(self):
        self.model_name = "gpt-4"

    async def ainvoke(self, prompt: str, **kwargs):
        # Minimal structured output expected by SocialMediaAgent parser
        return """
<analysis_phase>
Some analysis.
</analysis_phase>
<linkedin_post>LI</linkedin_post>
<x_post>X</x_post>
<x_thread>1. A\n\n2. B</x_thread>
<newsletter_content>N</newsletter_content>
""".strip()


def test_social_media_agent_tracks_cost_to_sql_when_project_id_provided():
    sql_pm = DummySqlProjectManager()
    model = DummyModel()
    agent = SocialMediaAgent(model=model, sql_project_manager=sql_pm)

    # run the async method
    result = asyncio.run(
        agent.generate_comprehensive_content(
            blog_content="Hello",
            blog_title="Title",
            persona="neuraforge",
            project_id="proj_123",
        )
    )

    assert result is not None
    assert len(sql_pm.calls) == 1
    assert sql_pm.calls[0]["project_id"] == "proj_123"
    assert sql_pm.calls[0]["agent_name"] == "SocialMediaAgent"


