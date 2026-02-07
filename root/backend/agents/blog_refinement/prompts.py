# -*- coding: utf-8 -*-
"""
Prompts for the Blog Refinement Agent.
"""

# --- Introduction Generation ---
GENERATE_INTRODUCTION_PROMPT = """
{persona_instructions}

You are an expert technical writer tasked with creating a compelling introduction for a blog post.
The full draft of the blog post is provided below.

**Blog Draft:**
```markdown
{blog_draft}
```

**Task:**
Write a professional, engaging introduction paragraph (typically 3-5 sentences) suitable for direct publication.
The introduction should:
1.  Hook the reader and clearly state the blog post's main topic or purpose.
2.  Briefly mention the key areas or concepts that will be covered.
3.  Set a professional and informative tone for the rest of the article.
4.  Avoid summarizing the entire content; focus on enticing the reader to continue.

**Output:**
Provide *only* the raw text for the introduction paragraph. Do NOT include any markdown formatting (like ```markdown), section headers, or extraneous text.
"""

# --- Conclusion Generation ---
GENERATE_CONCLUSION_PROMPT = """
{persona_instructions}

You are an expert technical writer tasked with creating a concise and impactful conclusion for a blog post.
The full draft of the blog post is provided below.

**Blog Draft:**
```markdown
{blog_draft}
```

**Task:**
Write a professional, concise conclusion paragraph (typically 3-5 sentences) suitable for direct publication.
The conclusion should:
1.  Briefly summarize the main takeaways or key points discussed in the blog post.
2.  Reiterate the significance or implications of the topic.
3.  Offer a final thought, call to action (if appropriate), or suggest next steps for the reader.
4.  Provide a sense of closure.

**Output:**
Provide *only* the raw text for the conclusion paragraph. Do NOT include any markdown formatting (like ```markdown), section headers, or extraneous text.
"""

# --- Summary Generation ---
GENERATE_SUMMARY_PROMPT = """
{persona_instructions}

You are an expert technical writer tasked with creating a concise summary of a blog post.
The full draft of the blog post is provided below.

**Blog Draft:**
```markdown
{blog_draft}
```

**Task:**
Write a concise summary (target 2-4 sentences) of the entire blog post, suitable for direct use (e.g., meta descriptions, social media previews).
The summary should accurately capture the main topic, key concepts covered, and the overall message or outcome of the post.

**Output:**
Provide *only* the raw text for the summary. Do NOT include any markdown formatting (like ```markdown), headers, or extraneous text.
"""

# --- Title/Subtitle Generation ---
GENERATE_TITLES_PROMPT = """
{persona_instructions}

You are an expert copywriter and SEO specialist tasked with generating compelling titles and subtitles for a blog post.
The full draft of the blog post is provided below.

Create compelling titles that reflect how an expert practitioner would share insights with peers. Your titles should communicate clear value and specific outcomes while maintaining the authentic voice of someone sharing hard-earned knowledge.

**EXPERT PRACTITIONER TITLE PHILOSOPHY:**
You're not creating marketing copy—you're offering genuine insights to fellow practitioners who value substance over style. Your titles should reflect the same conversational authority and strategic clarity found in the best technical writing.

**BLOG POST ANALYSIS:**
```markdown
{blog_draft}
```

**QUESTION-BASED COMPARISON PATTERN - PRIMARY APPROACH:**

This pattern works exceptionally well for technical content comparing two approaches, revealing a counter-intuitive finding, or challenging conventional wisdom. It creates immediate curiosity while remaining grounded in the actual topic.

**Pattern:** "{Question Word} {Topic A} {Verb} {Topic B}?"
- Question Word: What, When, Can, Why, Does
- Topic A: The subject/technique being discussed
- Verb: Make, Work, Use, Need, Help, Hurt, Replace, Cost
- Topic B: The comparison point or outcome

**Examples for different content types:**
- Performance comparisons: "What Makes X Faster Than Y?"
- Feasibility questions: "Can X Work Without Y?"
- Timing/conditions: "When Does X Hurt More Than Y?"
- Mechanism questions: "Why Does X Need Y?"
- Cost-benefit: "Does X Always Cost More Than Y?"

**Subtitle Formula:** {Technical difference} + {specific metric} + {what's preserved or the trade-off}
- Keep it factual and specific
- Include numbers when available (8% savings, 90% reduction, 3x faster)
- Mention what stays the same or what the benefit is

**REFERENCE EXAMPLES:**

For RMSNorm content:
- Title: "What Makes RMSNorm Faster Than LayerNorm?"
- Subtitle: "Eliminating mean subtraction cuts computation by 8% while preserving the re-scaling benefits"

For MoE routing content:
- Title: "Can MoE Use Single-Expert Routing?"
- Subtitle: "k=1 selection blocks gradient flow, requiring k≥2 to train all experts effectively"

For KV-Cache content:
- Title: "When Does KV-Cache Hurt More Than Help?"
- Subtitle: "Caching costs 3.2GB for 1K tokens—recomputation reduces memory by 60% with 15% latency trade-off"

**TITLE CREATION PRINCIPLES:**

1. **Direct Value Communication**:
   - Promise specific learning outcomes based on actual content
   - Use concrete language over abstract descriptions
   - Lead with the most valuable insight or practical outcome
   - Reflect the expert practitioner's authentic voice

2. **Contextual Specificity**:
   - Include relevant technical context (when appropriate)
   - Specify the scope and application domain
   - Use precise terminology that signals expertise
   - Avoid generic technology labels when specifics matter

3. **Natural Language Patterns**:
   - Use conversational phrasing that sounds natural, not corporate
   - Apply the narrative elements present in the content
   - Reflect any historical context or evolution presented
   - Match the sophistication level of the content

4. **Engagement Through Curiosity**:
   - Pose questions when content compares two approaches
   - Highlight surprising insights or counterintuitive findings
   - Use comparison/contrast when evaluating alternatives
   - Create intrigue about methodology or implementation details

**PRIORITY APPROACHES:**

1. **Question-Based Comparison** (HIGHEST PRIORITY): Use when content compares two approaches, techniques, or reveals counter-intuitive findings
   - Pattern: "{Question} {Topic A} {Verb} {Topic B}?"
   - Creates immediate engagement while staying grounded in content

2. **Insight Revelation**: Use when content uncovers a non-obvious mechanism or failure mode
   - Pattern: "{What/Why} {Topic} {Unexpected Outcome}?"

3. **Problem-Solution**: Use as fallback when content focuses on solving a specific problem
   - Pattern: "{How} {Problem} {Solution}?"

**OUTPUT FORMAT:**

Generate exactly 3 title options as a JSON array. Each option should follow this exact structure:

```json
[
  {{
    "title": "Your compelling title here",
    "subtitle": "Your informative subtitle that adds context",
    "reasoning": "Brief explanation of why this title works"
  }},
  {{
    "title": "Second title option",
    "subtitle": "Second subtitle option",
    "reasoning": "Brief explanation for second option"
  }},
  {{
    "title": "Third title option",
    "subtitle": "Third subtitle option",
    "reasoning": "Brief explanation for third option"
  }}
]
```

**CRITICAL INSTRUCTIONS:**
- Generate 3 options following the Question-Based Comparison pattern
- Each should be different: vary the question word, comparison point, or angle
- Keep titles concise (5-8 words is ideal)
- Keep subtitles factual and specific (15-25 words)
- Output ONLY the JSON array, no other text
- Ensure proper JSON formatting with double quotes
- Do not include markdown code blocks or any other formatting

Focus on titles that authentically represent both the content depth and the expert practitioner voice—direct, valuable, and reflective of genuine technical insight sharing.
"""

# --- Main Content Formatting ---
FORMAT_MAIN_CONTENT_PROMPT = r"""
You are an expert technical editor and Markdown formatter.
The raw draft of a blog post's main content is provided below.

**Raw Blog Draft Content:**
```markdown
{blog_draft_content}
```

**Task:**
Review and reformat the provided blog draft content to enhance its readability, structure, and overall quality for publication.
Your primary goal is to improve the formatting and structure **based *only* on the provided "Raw Blog Draft Content"**.
Do NOT introduce any new information, facts, or concepts not present in the provided draft.
If the draft is missing information or seems incomplete in certain areas, format it as is, and do not attempt to fill in gaps by inventing content.

Apply the following formatting guidelines:
1.  **Structure and Flow:**
    *   Ensure logical paragraph breaks.
    *   Use Markdown headings (e.g., `## Section Title`, `### Subsection Title`) appropriately to organize content. Do not use H1 (`#`) as that is typically reserved for the main blog title.
    *   Ensure a smooth flow between ideas and sections based on the existing text.
2.  **Markdown Formatting:**
    *   Apply **bold** (`**text**`) to emphasize key terms, concepts, or important takeaways *already present in the text*.
    *   Use *italics* (`*text*` or `_text_`) for definitions, new terms, or subtle emphasis *as appropriate for the existing text*.
    *   Create bulleted (`- item`) or numbered (`1. item`) lists for sequences, steps, or collections of items *if the text implies such a structure*.
3.  **LaTeX Formulas:**
    *   Ensure any mathematical formulas *present in the draft* are correctly enclosed in LaTeX delimiters for Markdown rendering.
    *   Use `$...$` for inline formulas (e.g., `The equation is $E=mc^2$.`).
    *   Use `$$...$$` for block-level formulas (e.g., `$$ \sum_{i=1}^{n} x_i $$`).
    *   Verify that the LaTeX syntax *within the delimiters* is correct based on standard mathematical notation. Do not alter the meaning of the formulas.
4.  **Code Blocks:**
    *   Ensure code snippets *present in the draft* are enclosed in triple backticks (``` ```) with the appropriate language identifier (e.g., ```python).
5.  **Readability:**
    *   Break up long sentences or paragraphs *from the existing text*.
    *   Ensure clarity and conciseness *of the existing text*.
    *   Correct any minor grammatical errors or typos *if obvious and do not change the meaning of the original text*. The primary focus is on formatting and structure, not re-writing.
6.  **Consistency:** Maintain consistent formatting throughout the document.

**Important:**
*   Focus *only* on formatting the main body content provided in "Raw Blog Draft Content".
*   **Crucially, do NOT add any new information, facts, explanations, or concepts that are not explicitly present in the "Raw Blog Draft Content". Your task is to format, not to expand or research.**
*   The output should be the fully formatted Markdown content of the main blog body, derived strictly from the input.

**Output:**
Provide *only* the fully formatted Markdown text for the main blog content. Do NOT include any extraneous text, explanations, or markdown formatting like ```markdown around the entire output.

**Example of Expected Output Formatting (based on hypothetical input):**
```markdown
## Understanding Activation Functions

Activation functions are a **critical component** of neural networks. They introduce non-linearity into the model, allowing it to learn complex patterns.
One common activation function is the *Sigmoid function*, defined as:
$$ \sigma(x) = \frac{1}{1 + e^{-x}} $$
This function squashes any input $x$ to a value between 0 and 1.

### Types of Activation Functions
There are several types of activation functions, including:
- ReLU (Rectified Linear Unit)
- Tanh (Hyperbolic Tangent)
- Softmax

Here's a simple Python code snippet demonstrating ReLU:
```python
def relu(x):
  return max(0, x)
```
Choosing the right activation function is important for model performance.
```
"""

# --- Content Enhancement and Flow Optimization ---
SUGGEST_CLARITY_FLOW_IMPROVEMENTS_PROMPT = """
You are an expert technical editor tasked with enhancing a blog post draft for clarity, flow, and engagement.

**CRITICAL WARNING: You MUST preserve ALL content. Do NOT remove or summarize ANY text.**

This is a flow/CLARITY improvement task, NOT a shortening or summarization task.
The output MUST contain ALL the same content as the input, with ADDITIONS ONLY (transitions, clarity improvements).

**Blog Draft:**
```markdown
{blog_draft}
```

**YOUR TASK:**
Improve the draft's clarity and flow while STRICTLY PRESERVING all content.

**WHAT YOU MAY DO:**
1. Add transitional sentences between disconnected sections
2. Rephrase awkward sentences for better readability (keep same meaning)
3. Fix obvious typos and grammar errors
4. Standardize heading levels (## for sections, ### for subsections)
5. Remove EXACT duplicate paragraphs (keep first instance only)

**ABSOLUTE PRESERVATION REQUIREMENTS (NEVER VIOLATE):**
❌ NEVER remove or summarize technical explanations
❌ NEVER consolidate multiple examples into one
❌ NEVER shorten paragraphs or remove sentences
❌ NEVER alter code blocks (preserve exactly, including comments and whitespace)
❌ NEVER modify LaTeX formulas (keep $...$ and $$...$$ exactly as-is)
❌ NEVER remove or rewrite [IMAGE_PLACEHOLDER: ...] blocks
❌ NEVER remove bullet points or list items
❌ NEVER change technical terminology

**PRESERVATION CHECKLIST (verify before outputting):**
✓ Every code block from input appears in output
✓ Every LaTeX formula from input appears in output
✓ Every [IMAGE_PLACEHOLDER: ...] from input appears in output
✓ Output word count is within ±5% of input (additions OK, reductions NOT OK)
✓ All section headings preserved
✓ All bullet/numbered lists preserved

**Output:**
The COMPLETE improved draft as markdown. Output ONLY the markdown content, no explanations.
"""

# --- Structure Analysis for Intelligent Formatting ---

STRUCTURE_ANALYSIS_PROMPT = """
You are an expert technical editor and content architect tasked with analyzing a blog post structure and creating an intelligent formatting plan.

**Blog Draft to Analyze:**
```markdown
{blog_draft}
```

**YOUR TASK:**
Analyze the blog structure and create a detailed formatting plan that will guide the chunked formatting process. Your analysis must be intelligent and context-aware, not cookie-cutter rules.

**ANALYSIS RESPONSIBILITIES:**

1. **Identify Blog Structure**:
   - Locate introduction section (where does it start/end?)
   - Identify main content sections (what are the H2 headings?)
   - Find conclusion section (where does it start?)
   - Note any special content areas (code-heavy, image-heavy, theory-heavy)

2. **Determine Formatting Strategy**:
   - Where should TL;DR be placed? (always at top, but exact position matters)
   - Which sections need callout boxes? (identify 3-5 key insights worth highlighting)
   - Where should horizontal dividers be placed? (between major sections)
   - Which sentences are pull-quote worthy? (memorable, impactful quotes)
   - Where should image placeholders help? (dense technical sections, workflows)

3. **Create Chunking Plan**:
   - Divide blog into logical chunks for parallel formatting (3-7 chunks typically)
   - Each chunk should be coherent and have a clear purpose
   - Chunks can be: intro + TL;DR, body section 1, body section 2, conclusion
   - Chunk size: 500-1500 words per chunk (optimize for LLM processing)

**ANALYSIS PRINCIPLES:**

- **Context-Aware**: Consider what the blog is ABOUT when making formatting decisions
  - Technical tutorial: Callout for pro tips or warnings
  - Theory explanation: Key insights and definitions
  - Case study: Results and takeaways

- **Content-Aware**: Format based on actual content, not generic rules
  - Dense code sections: Maybe 1 callout + code context, not 3
  - Long explanation: Multiple callouts for different concepts
  - Short post: Focused formatting, don't over-format

- **Flow-Conscious**: Format should enhance flow, not disrupt it
  - Don't put TL;DR in random place - has logical spot
  - Dividers should mark natural content breaks
  - Callouts should complement surrounding text

**NOT HARDCODING:**
- You're NOT using generic rules like "put callouts every 500 words"
- You're analyzing THIS SPECIFIC blog and making CUSTOM decisions
- Your formatting plan should reflect unique structure and content

**OUTPUT FORMAT:**
Provide a JSON response with the analysis:

```json
{{
  "blog_summary": "One-sentence summary of what this blog is about",
  "structure": {{
    "introduction": {{"start_line": 1, "end_line": 25, "main_topic": "..."}},
    "main_sections": [
      {{"heading": "Section Title", "start_line": 26, "end_line": 120, "content_type": "theory|code|mix"}}
    ],
    "conclusion": {{"start_line": 121, "end_line": 140, "key_takeaway": "..."}}
  }},
  "formatting_plan": {{
    "tldr_placement": "after_intro|before_first_section",
    "callouts": [
      {{"type": "pro_tip|key_insight|warning", "location": "section_heading_or_line_range", "reason": "why this insight matters"}}
    ],
    "dividers": [
      {{"place_after": "Section Title", "reason": "major section transition"}}
    ],
    "pull_quotes": [
      {{"line_range": [45, 46], "reason": "memorable insight worth highlighting"}}
    ],
    "image_placeholders": [
      {{"location": "section_heading_or_line_range", "purpose": "what the image should illustrate"}}
    ]
  }},
  "chunking_plan": {{
    "chunks": [
      {{"id": 1, "type": "intro_with_tldr", "content_range": [1, 50], "description": "Introduction + TL;DR section"}},
      {{"id": 2, "type": "body_section", "content_range": [51, 150], "description": "First main content section"}},
      {{"id": 3, "type": "body_section", "content_range": [151, 250], "description": "Second main content section"}},
      ...
    ],
    "total_chunks": N,
    "chunking_rationale": "Why these chunks make sense for this blog"
  }}
}}
```

**CRITICAL OUTPUT REQUIREMENTS:**
- Output ONLY the JSON, no markdown formatting, no explanations
- Ensure line numbers are accurate (you're analyzing the given blog)
- Provide at least 3 callout suggestions (unless blog is very short)
- Provide 2-4 image placeholder suggestions where visuals would help
- Create 3-7 logical chunks based on actual content structure
- All "reason" fields must explain WHY this formatting decision makes sense

**NO COOKIE-CUTTER FORMATTING:**
Your formatting plan must be tailored to THIS SPECIFIC blog based on YOUR analysis of its content, structure, and topic.
"""
