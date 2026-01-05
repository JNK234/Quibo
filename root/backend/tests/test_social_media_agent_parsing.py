# -*- coding: utf-8 -*-
from backend.agents.social_media_agent import SocialMediaAgent


def test_parse_llm_response_maps_analysis_phase_to_content_breakdown():
    agent = SocialMediaAgent(model=None)
    response_text = """
<analysis_phase>
Here is my breakdown of the blog and what I would focus on for social.
</analysis_phase>

<linkedin_post>
LinkedIn content.
</linkedin_post>

<x_post>
X content.
</x_post>

<newsletter_content>
Newsletter content.
</newsletter_content>
""".strip()

    parsed = agent._parse_llm_response(response_text)
    assert parsed["content_breakdown"] == "Here is my breakdown of the blog and what I would focus on for social."
    assert parsed["linkedin_post"] == "LinkedIn content."
    assert parsed["x_post"] == "X content."
    assert parsed["newsletter_content"] == "Newsletter content."


def test_parse_llm_response_prefers_content_breakdown_tag_when_present():
    agent = SocialMediaAgent(model=None)
    response_text = """
<analysis_phase>
fallback
</analysis_phase>
<content_breakdown>
primary breakdown
</content_breakdown>
<linkedin_post>LI</linkedin_post>
<x_post>X</x_post>
<newsletter_content>N</newsletter_content>
""".strip()

    parsed = agent._parse_llm_response(response_text)
    assert parsed["content_breakdown"] == "primary breakdown"


