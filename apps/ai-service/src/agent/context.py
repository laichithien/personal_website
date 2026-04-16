"""Helpers for building direct portfolio context for the chat agent."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.models import (
    KnowledgeDocument,
    PortfolioAchievement,
    PortfolioCourse,
    PortfolioExperience,
    PortfolioProject,
    PortfolioPublication,
    PortfolioSetting,
    PortfolioTechStack,
)


async def build_portfolio_context(db: AsyncSession) -> str:
    """Load portfolio data from the database and flatten it into a prompt string."""
    sections: list[str] = []

    settings_result = await db.execute(select(PortfolioSetting))
    settings = {item.key: item.value for item in settings_result.scalars().all()}

    hero = settings.get("hero", {})
    if hero:
        sections.append(
            "\n".join(
                [
                    "[Hero]",
                    f"Name: {hero.get('name', '')}",
                    f"Title: {hero.get('title', '')}",
                    f"Tagline: {hero.get('tagline', '')}",
                    f"Location: {hero.get('location', '')}",
                ]
            ).strip()
        )

    about = settings.get("about", {})
    if about:
        highlights = ", ".join(about.get("highlights", []))
        sections.append(
            "\n".join(
                [
                    "[About]",
                    f"Summary: {about.get('summary', '')}",
                    f"Highlights: {highlights}",
                ]
            ).strip()
        )

    education = settings.get("education", {})
    if education:
        sections.append(
            "\n".join(
                [
                    "[Education]",
                    f"School: {education.get('school', '')}",
                    f"Degree: {education.get('degree', '')}",
                    f"Period: {education.get('period', '')}",
                    f"GPA: {education.get('gpa', '')}",
                    f"Rank: {education.get('rank', '')}",
                ]
            ).strip()
        )

    social = settings.get("social", {})
    if social:
        sections.append(
            "\n".join(
                [
                    "[Social]",
                    f"Email: {social.get('email', '')}",
                    f"GitHub: {social.get('github', '')}",
                    f"LinkedIn: {social.get('linkedin', '')}",
                ]
            ).strip()
        )

    lifestyle = settings.get("lifestyle", {})
    if lifestyle:
        sections.append(
            "\n".join(
                [
                    "[Lifestyle]",
                    f"Raw: {lifestyle}",
                ]
            ).strip()
        )

    experiences_result = await db.execute(
        select(PortfolioExperience)
        .where(PortfolioExperience.is_active == True)
        .order_by(PortfolioExperience.display_order)
    )
    experiences = experiences_result.scalars().all()
    if experiences:
        sections.append(
            "\n".join(
                ["[Experience]"]
                + [
                    f"- {item.role} @ {item.company} ({item.period}) | Highlights: {', '.join(item.highlights or [])}"
                    for item in experiences
                ]
            )
        )

    tech_stack_result = await db.execute(
        select(PortfolioTechStack)
        .where(PortfolioTechStack.is_active == True)
        .order_by(PortfolioTechStack.category, PortfolioTechStack.display_order)
    )
    tech_stack = tech_stack_result.scalars().all()
    if tech_stack:
        sections.append(
            "\n".join(
                ["[Tech Stack]"]
                + [f"- {item.name} ({item.category})" for item in tech_stack]
            )
        )

    projects_result = await db.execute(
        select(PortfolioProject)
        .where(PortfolioProject.is_active == True)
        .order_by(PortfolioProject.display_order)
    )
    projects = projects_result.scalars().all()
    if projects:
        sections.append(
            "\n".join(
                ["[Projects]"]
                + [
                    (
                        f"- {item.title}: {item.description} | Tags: {', '.join(item.tags or [])} "
                        f"| Featured: {item.is_featured} | Link: {item.link or ''} | GitHub: {item.github or ''}"
                    )
                    for item in projects
                ]
            )
        )

    publications_result = await db.execute(
        select(PortfolioPublication)
        .where(PortfolioPublication.is_active == True)
        .order_by(PortfolioPublication.year.desc(), PortfolioPublication.display_order)
    )
    publications = publications_result.scalars().all()
    if publications:
        sections.append(
            "\n".join(
                ["[Publications]"]
                + [
                    f"- {item.title} | Venue: {item.venue} | Year: {item.year} | DOI: {item.doi or ''}"
                    for item in publications
                ]
            )
        )

    achievements_result = await db.execute(
        select(PortfolioAchievement)
        .where(PortfolioAchievement.is_active == True)
        .order_by(PortfolioAchievement.year.desc(), PortfolioAchievement.display_order)
    )
    achievements = achievements_result.scalars().all()
    if achievements:
        sections.append(
            "\n".join(
                ["[Achievements]"]
                + [
                    f"- {item.title} | Event: {item.event} | Organization: {item.organization} | Year: {item.year}"
                    for item in achievements
                ]
            )
        )

    courses_result = await db.execute(
        select(PortfolioCourse)
        .where(PortfolioCourse.is_active == True)
        .order_by(PortfolioCourse.year.desc(), PortfolioCourse.display_order)
    )
    courses = courses_result.scalars().all()
    if courses:
        sections.append(
            "\n".join(
                ["[Courses]"]
                + [
                    f"- {item.title} | Year: {item.year} | Focus: {', '.join(item.focus or [])}"
                    for item in courses
                ]
            )
        )

    documents_result = await db.execute(
        select(KnowledgeDocument).order_by(KnowledgeDocument.created_at)
    )
    documents = documents_result.scalars().all()
    if documents:
        sections.append(
            "\n".join(
                ["[Knowledge Documents]"]
                + [
                    f"- {item.title} ({item.source}): {item.content}"
                    for item in documents
                ]
            )
        )

    return "\n\n".join(section for section in sections if section.strip())
