"""Search-related tools for the AI agent."""

from sqlmodel import Session, select
from src.database.connection import sync_engine
from src.database.models import KnowledgeDocument


def search_projects(query: str, limit: int = 5) -> str:
    """
    Search through project descriptions and information.

    Args:
        query: Search query string
        limit: Maximum number of results

    Returns:
        Formatted string of matching projects
    """
    with Session(sync_engine) as session:
        results = session.exec(
            select(KnowledgeDocument)
            .where(KnowledgeDocument.source == "project")
            .where(KnowledgeDocument.content.ilike(f"%{query}%"))
            .limit(limit)
        ).all()

        if not results:
            return "No matching projects found."

        formatted = []
        for doc in results:
            formatted.append(f"- {doc.title}: {doc.content[:200]}...")

        return "\n".join(formatted)


def search_knowledge(query: str, limit: int = 3) -> str:
    """
    Semantic search through knowledge base using vector embeddings.

    Args:
        query: Natural language query
        limit: Maximum number of results

    Returns:
        Relevant knowledge chunks
    """
    # TODO: Implement vector similarity search with pgvector
    # For now, use simple text search
    with Session(sync_engine) as session:
        results = session.exec(
            select(KnowledgeDocument)
            .where(KnowledgeDocument.content.ilike(f"%{query}%"))
            .limit(limit)
        ).all()

        if not results:
            return f"No knowledge found for: {query}"

        formatted = []
        for doc in results:
            formatted.append(f"[{doc.source}] {doc.title}: {doc.content[:300]}...")

        return "\n".join(formatted)
