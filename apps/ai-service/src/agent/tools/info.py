"""Information retrieval tools for the AI agent."""


def get_cv_info() -> str:
    """
    Get comprehensive CV/resume information about Thiện.

    Returns:
        Formatted CV information
    """
    return """
    Name: Lai Chi Thiện (Thiện)
    Role: AI Engineer @ Vexere
    Email: contact@yourdomain.com
    GitHub: github.com/laichithien
    LinkedIn: linkedin.com/in/chi-thien-lai

    Experience:
    - AI/ML system development
    - Data pipeline architecture with PySpark
    - Agentic AI systems and RAG implementations
    - Full-stack development (Python, TypeScript)

    Skills:
    - Languages: Python, TypeScript, SQL
    - AI/ML: Pydantic-AI, LangChain, RAG, Embeddings
    - Data: PySpark, PostgreSQL, pgvector
    - DevOps: Docker, Kubernetes, Terraform
    - Frontend: Next.js, React, Tailwind CSS

    Interests:
    - Homelab & Self-hosting
    - Game Development
    - Music (Guitar, Piano)
    """


def get_contact_info() -> str:
    """
    Get contact information.

    Returns:
        Contact details
    """
    return """
    Email: contact@yourdomain.com
    GitHub: github.com/laichithien
    LinkedIn: linkedin.com/in/chi-thien-lai
    """


def get_tech_stack() -> str:
    """
    Get detailed technology stack information.

    Returns:
        Technology stack details
    """
    return """
    Backend:
    - Python 3.11+ with FastAPI
    - Pydantic-AI for agent orchestration
    - SQLModel + PostgreSQL + pgvector

    Frontend:
    - Next.js 14 with App Router
    - Tailwind CSS + shadcn/ui
    - Framer Motion for animations

    Infrastructure:
    - Docker Compose orchestration
    - Cloudflare Tunnel for secure exposure
    - Self-hosted on homelab
    """


def calculator(expression: str) -> str:
    """
    Evaluate a mathematical expression.

    Args:
        expression: Math expression (e.g., "2 + 2", "10 * 5")

    Returns:
        Calculation result
    """
    try:
        # Safe eval for simple math
        allowed_chars = set("0123456789+-*/.() ")
        if not all(c in allowed_chars for c in expression):
            return "Error: Invalid characters in expression"

        result = eval(expression)
        return f"{expression} = {result}"
    except Exception as e:
        return f"Error calculating: {str(e)}"
