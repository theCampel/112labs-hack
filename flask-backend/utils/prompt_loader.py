"""
🎯 Prompt Loader Utility
Loads prompt templates from markdown files to keep prompts externalized and maintainable.
"""

import os


def load_prompt(prompt_name: str) -> str:
    """
    Load a prompt template from the prompts directory.
    
    Args:
        prompt_name: Name of the prompt file (without .md extension)
        
    Returns:
        str: The prompt content
        
    Raises:
        FileNotFoundError: If the prompt file doesn't exist
    """
    # Get the directory of this file (utils/)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Go up one level to flask-backend/ then into prompts/
    prompts_dir = os.path.join(os.path.dirname(current_dir), "prompts")
    
    # Build the full path to the prompt file
    prompt_path = os.path.join(prompts_dir, f"{prompt_name}.md")
    
    if not os.path.exists(prompt_path):
        raise FileNotFoundError(f"Prompt file not found: {prompt_path}")
    
    with open(prompt_path, "r", encoding="utf-8") as f:
        return f.read().strip()


def format_prompt(prompt_template: str, **kwargs) -> str:
    """
    Format a prompt template with the provided variables.
    
    Args:
        prompt_template: The prompt template string
        **kwargs: Variables to substitute in the template
        
    Returns:
        str: The formatted prompt
    """
    return prompt_template.format(**kwargs)


def load_and_format_prompt(prompt_name: str, **kwargs) -> str:
    """
    Load a prompt template and format it with variables in one step.
    
    Args:
        prompt_name: Name of the prompt file (without .md extension)
        **kwargs: Variables to substitute in the template
        
    Returns:
        str: The loaded and formatted prompt
    """
    template = load_prompt(prompt_name)
    return format_prompt(template, **kwargs) 