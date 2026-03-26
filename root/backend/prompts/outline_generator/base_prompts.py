CONTENT_ANALYSIS_PROMPT = """
Analyze the following content:
<user_content>
<notebook_content>
{notebook_content}
</notebook_content>
<markdown_content>
{markdown_content}
</markdown_content>
</user_content>

Extract:
1. Main topics and concepts
2. Technical complexity
3. Key prerequisites
4. Learning objectives
"""

OUTLINE_STRUCTURE_PROMPT = """
Based on the analyzed content, generate a blog outline with:
1. Title: {title}
2. Difficulty Level: {difficulty}
3. Prerequisites: {prerequisites}
4. Introduction
5. Main Sections (with subsections)
6. Conclusion

Consider:
- Logical flow of topics
- Progressive complexity
- Clear learning path
"""
