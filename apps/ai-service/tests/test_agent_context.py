"""Tests for direct portfolio context construction."""

from src.agent.context import build_portfolio_context
from src.database.models import (
    KnowledgeDocument,
    PortfolioExperience,
    PortfolioProject,
    PortfolioSetting,
)


async def test_build_portfolio_context_flattens_core_sections(async_session):
    async_session.add(
        PortfolioSetting(
            key="hero",
            value={
                "name": "Thi",
                "title": "AI Engineer",
                "tagline": "Builds production AI systems",
                "location": "HCMC",
            },
        )
    )
    async_session.add(
        PortfolioSetting(
            key="about",
            value={
                "summary": "Focused on useful systems",
                "highlights": ["LLM apps", "infra"],
            },
        )
    )
    async_session.add(
        PortfolioExperience(
            company="Example Corp",
            role="Engineer",
            period="2024 - now",
            highlights=["Shipped internal AI tooling"],
            is_active=True,
        )
    )
    async_session.add(
        PortfolioProject(
            title="Personal site",
            description="Portfolio with AI chat",
            tags=["nextjs", "fastapi"],
            is_active=True,
        )
    )
    async_session.add(
        KnowledgeDocument(
            title="CV",
            source="cv",
            content="Worked on applied AI and platform engineering.",
        )
    )
    await async_session.commit()

    context = await build_portfolio_context(async_session)

    assert "[Hero]" in context
    assert "Name: Thi" in context
    assert "[About]" in context
    assert "Highlights: LLM apps, infra" in context
    assert "[Experience]" in context
    assert "Engineer @ Example Corp" in context
    assert "[Projects]" in context
    assert "Personal site: Portfolio with AI chat" in context
    assert "[Knowledge Documents]" in context
    assert "CV (cv): Worked on applied AI and platform engineering." in context
