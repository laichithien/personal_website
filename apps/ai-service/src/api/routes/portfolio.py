"""Public portfolio API endpoints."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.schemas.portfolio import (
    ExperienceResponse,
    TechStackResponse,
    ProjectResponse,
    PublicationResponse,
    AchievementResponse,
    CourseResponse,
    PortfolioFullResponse,
)
from src.database.connection import get_db
from src.database.models import (
    PortfolioSetting,
    PortfolioExperience,
    PortfolioTechStack,
    PortfolioProject,
    PortfolioPublication,
    PortfolioAchievement,
    PortfolioCourse,
)

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


async def get_setting_value(db: AsyncSession, key: str) -> dict[str, Any]:
    """Get a portfolio setting value by key."""
    result = await db.execute(
        select(PortfolioSetting).where(PortfolioSetting.key == key)
    )
    setting = result.scalar_one_or_none()
    return setting.value if setting else {}


@router.get("", response_model=PortfolioFullResponse)
async def get_full_portfolio(
    db: AsyncSession = Depends(get_db),
):
    """Get complete portfolio data."""
    # Get all settings
    hero = await get_setting_value(db, "hero")
    about = await get_setting_value(db, "about")
    education = await get_setting_value(db, "education")
    lifestyle = await get_setting_value(db, "lifestyle")
    social = await get_setting_value(db, "social")

    # Get all active collection items ordered by display_order
    experiences_result = await db.execute(
        select(PortfolioExperience)
        .where(PortfolioExperience.is_active == True)
        .order_by(PortfolioExperience.display_order)
    )
    experiences = experiences_result.scalars().all()

    tech_stack_result = await db.execute(
        select(PortfolioTechStack)
        .where(PortfolioTechStack.is_active == True)
        .order_by(PortfolioTechStack.display_order)
    )
    tech_stack = tech_stack_result.scalars().all()

    projects_result = await db.execute(
        select(PortfolioProject)
        .where(PortfolioProject.is_active == True)
        .order_by(PortfolioProject.display_order)
    )
    projects = projects_result.scalars().all()

    publications_result = await db.execute(
        select(PortfolioPublication)
        .where(PortfolioPublication.is_active == True)
        .order_by(PortfolioPublication.display_order)
    )
    publications = publications_result.scalars().all()

    achievements_result = await db.execute(
        select(PortfolioAchievement)
        .where(PortfolioAchievement.is_active == True)
        .order_by(PortfolioAchievement.display_order)
    )
    achievements = achievements_result.scalars().all()

    courses_result = await db.execute(
        select(PortfolioCourse)
        .where(PortfolioCourse.is_active == True)
        .order_by(PortfolioCourse.display_order)
    )
    courses = courses_result.scalars().all()

    return PortfolioFullResponse(
        hero=hero,
        about=about,
        education=education,
        experience=experiences,
        techStack=tech_stack,
        projects=projects,
        publications=publications,
        achievements=achievements,
        courses=courses,
        lifestyle=lifestyle,
        social=social,
    )


@router.get("/hero")
async def get_hero(
    db: AsyncSession = Depends(get_db),
):
    """Get hero section data."""
    return await get_setting_value(db, "hero")


@router.get("/about")
async def get_about(
    db: AsyncSession = Depends(get_db),
):
    """Get about section data."""
    return await get_setting_value(db, "about")


@router.get("/education")
async def get_education(
    db: AsyncSession = Depends(get_db),
):
    """Get education section data."""
    return await get_setting_value(db, "education")


@router.get("/lifestyle")
async def get_lifestyle(
    db: AsyncSession = Depends(get_db),
):
    """Get lifestyle section data."""
    return await get_setting_value(db, "lifestyle")


@router.get("/social")
async def get_social(
    db: AsyncSession = Depends(get_db),
):
    """Get social links data."""
    return await get_setting_value(db, "social")


@router.get("/experience", response_model=list[ExperienceResponse])
async def get_experience(
    db: AsyncSession = Depends(get_db),
):
    """Get all active experiences."""
    result = await db.execute(
        select(PortfolioExperience)
        .where(PortfolioExperience.is_active == True)
        .order_by(PortfolioExperience.display_order)
    )
    return result.scalars().all()


@router.get("/tech-stack", response_model=list[TechStackResponse])
async def get_tech_stack(
    db: AsyncSession = Depends(get_db),
):
    """Get all active tech stack items."""
    result = await db.execute(
        select(PortfolioTechStack)
        .where(PortfolioTechStack.is_active == True)
        .order_by(PortfolioTechStack.display_order)
    )
    return result.scalars().all()


@router.get("/projects", response_model=list[ProjectResponse])
async def get_projects(
    db: AsyncSession = Depends(get_db),
    featured_only: bool = False,
):
    """Get all active projects."""
    query = select(PortfolioProject).where(PortfolioProject.is_active == True)
    if featured_only:
        query = query.where(PortfolioProject.is_featured == True)
    query = query.order_by(PortfolioProject.display_order)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/projects/{id}", response_model=ProjectResponse)
async def get_project_by_id(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a single project by ID."""
    result = await db.execute(
        select(PortfolioProject)
        .where(PortfolioProject.id == id)
        .where(PortfolioProject.is_active == True)
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project


@router.get("/publications", response_model=list[PublicationResponse])
async def get_publications(
    db: AsyncSession = Depends(get_db),
):
    """Get all active publications."""
    result = await db.execute(
        select(PortfolioPublication)
        .where(PortfolioPublication.is_active == True)
        .order_by(PortfolioPublication.display_order)
    )
    return result.scalars().all()


@router.get("/achievements", response_model=list[AchievementResponse])
async def get_achievements(
    db: AsyncSession = Depends(get_db),
):
    """Get all active achievements."""
    result = await db.execute(
        select(PortfolioAchievement)
        .where(PortfolioAchievement.is_active == True)
        .order_by(PortfolioAchievement.display_order)
    )
    return result.scalars().all()


@router.get("/courses", response_model=list[CourseResponse])
async def get_courses(
    db: AsyncSession = Depends(get_db),
):
    """Get all active courses."""
    result = await db.execute(
        select(PortfolioCourse)
        .where(PortfolioCourse.is_active == True)
        .order_by(PortfolioCourse.display_order)
    )
    return result.scalars().all()
