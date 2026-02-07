# -*- coding: utf-8 -*-
"""
ABOUTME: Auto-save manager for automatically saving generated content at each stage
ABOUTME: Provides utilities for saving outlines, drafts, refined content and loading them back
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime

logger = logging.getLogger(__name__)

class AutoSaveManager:
    """Manages automatic saving and loading of generated content at each stage."""
    
    def __init__(self, base_save_dir: str = None):
        """
        Initialize the AutoSaveManager.
        
        Args:
            base_save_dir: Base directory for saving content. Defaults to root/data/uploads/
        """
        if base_save_dir is None:
            # Default to root/data/uploads/ (same as where uploaded files are saved)
            current_dir = Path(__file__).parent
            self.base_save_dir = current_dir.parent / "data" / "uploads"
        else:
            self.base_save_dir = Path(base_save_dir)
        
        # Ensure the base directory exists
        self.base_save_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"AutoSaveManager initialized with base directory: {self.base_save_dir}")
    
    def _get_project_dir(self, project_name: str) -> Path:
        """Get the directory path for a specific project."""
        # Sanitize project name for filesystem
        safe_name = "".join(c if c.isalnum() or c in ('-', '_', ' ') else '_' for c in project_name)
        project_dir = self.base_save_dir / safe_name
        project_dir.mkdir(parents=True, exist_ok=True)
        return project_dir
    
    def _add_timestamp_to_filename(self, filename: str) -> str:
        """Add timestamp to filename to avoid overwrites."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        name, ext = os.path.splitext(filename)
        return f"{name}_{timestamp}{ext}"
    
    def save_outline(self, project_name: str, outline_data: Dict[str, Any], 
                    job_id: str = None, add_timestamp: bool = True) -> str:
        """
        Save generated outline to file.
        
        Args:
            project_name: Name of the project
            outline_data: The outline dictionary from session state
            job_id: Optional job ID to include in filename
            add_timestamp: Whether to add timestamp to avoid overwrites
        
        Returns:
            Path to the saved file
        """
        try:
            project_dir = self._get_project_dir(project_name)
            
            # Create filename
            if job_id:
                filename = f"outline_{job_id}.json"
            else:
                filename = "outline.json"
            
            if add_timestamp:
                filename = self._add_timestamp_to_filename(filename)
            
            file_path = project_dir / filename
            
            # Add metadata
            save_data = {
                "project_name": project_name,
                "job_id": job_id,
                "saved_at": datetime.now().isoformat(),
                "stage": "outline",
                "outline": outline_data
            }
            
            # Save to JSON file
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(save_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Outline saved to: {file_path}")
            return str(file_path)
            
        except Exception as e:
            logger.error(f"Failed to save outline for project {project_name}: {e}")
            raise
    
    def save_blog_draft(self, project_name: str, draft_content: str, 
                       job_id: str = None, add_timestamp: bool = True) -> str:
        """
        Save generated blog draft to file.
        
        Args:
            project_name: Name of the project
            draft_content: The compiled blog draft content
            job_id: Optional job ID to include in filename
            add_timestamp: Whether to add timestamp to avoid overwrites
        
        Returns:
            Path to the saved file
        """
        try:
            project_dir = self._get_project_dir(project_name)
            
            # Create filename
            if job_id:
                filename = f"blog_draft_{job_id}.md"
            else:
                filename = "blog_draft.md"
            
            if add_timestamp:
                filename = self._add_timestamp_to_filename(filename)
            
            file_path = project_dir / filename
            
            # Create metadata header
            metadata_header = f"""<!--
Project: {project_name}
Job ID: {job_id or 'N/A'}
Saved at: {datetime.now().isoformat()}
Stage: blog_draft
-->

"""
            
            # Save to Markdown file with metadata
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(metadata_header + draft_content)
            
            logger.info(f"Blog draft saved to: {file_path}")
            return str(file_path)
            
        except Exception as e:
            logger.error(f"Failed to save blog draft for project {project_name}: {e}")
            raise
    
    def save_refined_blog(self, project_name: str, content: str,
                         summary: str = None, title_options: List[Dict] = None,
                         project_id: str = None, job_id: str = None,
                         add_timestamp: bool = True) -> str:
        """
        Save refined blog content (formatted version) along with summary and title options.

        Args:
            project_name: Name of the project
            content: The formatted refined blog content
            summary: Generated summary
            title_options: List of title/subtitle options
            project_id: Project ID
            job_id: Optional job ID
            add_timestamp: Whether to add timestamp to avoid overwrites

        Returns:
            Path to the saved file
        """
        try:
            project_dir = self._get_project_dir(project_name)
            
            # Create filename
            if job_id:
                filename = f"refined_blog_{job_id}.md"
            else:
                filename = "refined_blog.md"
            
            if add_timestamp:
                filename = self._add_timestamp_to_filename(filename)
            
            file_path = project_dir / filename
            
            # Save content to JSON for easy retrieval
            save_data = {
                "project_name": project_name,
                "project_id": project_id,
                "job_id": job_id,
                "saved_at": datetime.now().isoformat(),
                "stage": "refined_blog",
                "content": content,
                "summary": summary,
                "title_options": title_options
            }

            # Save to JSON file
            json_file_path = file_path.with_suffix('.json')
            with open(json_file_path, 'w', encoding='utf-8') as f:
                json.dump(save_data, f, indent=2, ensure_ascii=False)

            # Also save a markdown file with the content
            content_parts = []

            # Metadata header
            content_parts.append(f"""<!--
Project: {project_name}
Job ID: {job_id or 'N/A'}
Saved at: {datetime.now().isoformat()}
Stage: refined_blog
-->

""")

            # Add title options if available
            if title_options:
                content_parts.append("<!-- TITLE OPTIONS:\n")
                for i, option in enumerate(title_options):
                    content_parts.append(f"Option {i+1}:")
                    content_parts.append(f"  Title: {option.get('title', 'N/A')}")
                    content_parts.append(f"  Subtitle: {option.get('subtitle', 'N/A')}")
                    content_parts.append(f"  Reasoning: {option.get('reasoning', 'N/A')}")
                    content_parts.append("")
                content_parts.append("-->\n\n")

            # Add summary if available
            if summary:
                content_parts.append(f"<!-- SUMMARY: {summary} -->\n\n")

            # Add the content
            content_parts.append(content)

            # Save to markdown file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write("".join(content_parts))
            
            logger.info(f"Refined blog saved to: {file_path}")
            return str(file_path)
            
        except Exception as e:
            logger.error(f"Failed to save refined blog for project {project_name}: {e}")
            raise
    
    def list_saved_outlines(self, project_name: str) -> List[Dict[str, Any]]:
        """List all saved outlines for a project."""
        try:
            project_dir = self._get_project_dir(project_name)
            outlines = []
            
            for file_path in project_dir.glob("outline*.json"):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    outlines.append({
                        "file_path": str(file_path),
                        "filename": file_path.name,
                        "saved_at": data.get("saved_at"),
                        "job_id": data.get("job_id"),
                        "title": data.get("outline", {}).get("title", "Unknown Title")
                    })
                except Exception as e:
                    logger.warning(f"Could not read outline file {file_path}: {e}")
            
            # Sort by saved_at timestamp, newest first
            outlines.sort(key=lambda x: x.get("saved_at", ""), reverse=True)
            return outlines
            
        except Exception as e:
            logger.error(f"Failed to list outlines for project {project_name}: {e}")
            return []
    
    def list_saved_drafts(self, project_name: str) -> List[Dict[str, Any]]:
        """List all saved blog drafts for a project."""
        try:
            project_dir = self._get_project_dir(project_name)
            drafts = []
            
            for file_path in project_dir.glob("blog_draft*.md"):
                try:
                    # Read the first few lines to get metadata
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read(1000)  # Read first 1000 chars for metadata
                    
                    # Extract metadata from HTML comments
                    saved_at = "Unknown"
                    job_id = None
                    if "Saved at:" in content:
                        import re
                        saved_match = re.search(r'Saved at: ([^\n]+)', content)
                        if saved_match:
                            saved_at = saved_match.group(1)
                        
                        job_match = re.search(r'Job ID: ([^\n]+)', content)
                        if job_match and job_match.group(1) != 'N/A':
                            job_id = job_match.group(1)
                    
                    drafts.append({
                        "file_path": str(file_path),
                        "filename": file_path.name,
                        "saved_at": saved_at,
                        "job_id": job_id
                    })
                except Exception as e:
                    logger.warning(f"Could not read draft file {file_path}: {e}")
            
            # Sort by modification time, newest first
            drafts.sort(key=lambda x: os.path.getmtime(x["file_path"]), reverse=True)
            return drafts
            
        except Exception as e:
            logger.error(f"Failed to list drafts for project {project_name}: {e}")
            return []
    
    def list_saved_refined_blogs(self, project_name: str) -> List[Dict[str, Any]]:
        """List all saved refined blogs for a project."""
        import re
        try:
            project_dir = self._get_project_dir(project_name)
            refined_blogs = []

            # Look for JSON files first (new format with formatted_content)
            for file_path in project_dir.glob("refined_blog*.json"):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)

                    refined_blogs.append({
                        "file_path": str(file_path),
                        "filename": file_path.name,
                        "saved_at": data.get("saved_at"),
                        "job_id": data.get("job_id"),
                        "project_id": data.get("project_id")
                    })
                except Exception as e:
                    logger.warning(f"Could not read refined blog JSON file {file_path}: {e}")

            # Also look for old MD files (for backward compatibility)
            for file_path in project_dir.glob("refined_blog*.md"):
                # Skip if there's a corresponding JSON file
                json_path = file_path.with_suffix('.json')
                if json_path.exists():
                    continue

                try:
                    # Read the first few lines to get metadata
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read(1000)  # Read first 1000 chars for metadata

                    # Extract metadata from HTML comments
                    saved_at = "Unknown"
                    job_id = None
                    if "Saved at:" in content:
                        saved_match = re.search(r'Saved at: ([^\n]+)', content)
                        if saved_match:
                            saved_at = saved_match.group(1)

                        job_match = re.search(r'Job ID: ([^\n]+)', content)
                        if job_match and job_match.group(1) != 'N/A':
                            job_id = job_match.group(1)

                    refined_blogs.append({
                        "file_path": str(file_path),
                        "filename": file_path.name,
                        "saved_at": saved_at,
                        "job_id": job_id,
                        "project_id": None
                    })
                except Exception as e:
                    logger.warning(f"Could not read refined blog file {file_path}: {e}")

            # Sort by modification time, newest first
            refined_blogs.sort(key=lambda x: os.path.getmtime(x["file_path"]), reverse=True)
            return refined_blogs

        except Exception as e:
            logger.error(f"Failed to list refined blogs for project {project_name}: {e}")
            return []
    
    def load_outline(self, file_path: str) -> Dict[str, Any]:
        """Load a saved outline from file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            return data.get("outline", {})
            
        except Exception as e:
            logger.error(f"Failed to load outline from {file_path}: {e}")
            raise
    
    def load_draft_content(self, file_path: str) -> str:
        """Load blog draft content from file, removing metadata header."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Remove metadata header (everything before the first actual content)
            if content.startswith("<!--"):
                # Find the end of the comment block
                end_comment = content.find("-->")
                if end_comment != -1:
                    content = content[end_comment + 3:].strip()
            
            return content
            
        except Exception as e:
            logger.error(f"Failed to load draft content from {file_path}: {e}")
            raise
    
    def load_refined_content(self, file_path: str) -> str:
        """Load refined blog content from file, removing metadata header."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Remove metadata header and title/summary comments
            lines = content.split('\n')
            content_lines = []
            in_comment = False

            for line in lines:
                if line.strip().startswith('<!--'):
                    in_comment = True
                elif line.strip().endswith('-->'):
                    in_comment = False
                    continue
                elif not in_comment:
                    content_lines.append(line)

            return '\n'.join(content_lines).strip()

        except Exception as e:
            logger.error(f"Failed to load refined content from {file_path}: {e}")
            raise

    def load_refined_blog_data(self, file_path: str) -> Dict[str, Any]:
        """
        Load full refined blog data from JSON file.

        Returns a dictionary with keys: content, summary, title_options, project_id
        For backward compatibility, also handles old MD files.
        """
        try:
            path = Path(file_path)

            # New JSON format
            if path.suffix == '.json':
                with open(path, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                return {
                    "content": data.get("content"),
                    "summary": data.get("summary"),
                    "title_options": data.get("title_options"),
                    "project_id": data.get("project_id")
                }

            # Old MD format - backward compatibility
            else:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Remove metadata header and title/summary comments
                lines = content.split('\n')
                content_lines = []
                in_comment = False

                for line in lines:
                    if line.strip().startswith('<!--'):
                        in_comment = True
                    elif line.strip().endswith('-->'):
                        in_comment = False
                        continue
                    elif not in_comment:
                        content_lines.append(line)

                content = '\n'.join(content_lines).strip()

                return {
                    "content": content,
                    "summary": None,
                    "title_options": None,
                    "project_id": None
                }

        except Exception as e:
            logger.error(f"Failed to load refined blog data from {file_path}: {e}")
            raise