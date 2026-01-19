"""Admin portfolio content endpoints."""

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps.auth import CurrentAdmin
from src.api.schemas.portfolio import (
    # Settings
    HeroData,
    AboutData,
    EducationData,
    LifestyleData,
    SocialData,
    PortfolioSettingResponse,
    # Experience
    ExperienceCreate,
    ExperienceUpdate,
    ExperienceResponse,
    # Tech Stack
    TechStackCreate,
    TechStackUpdate,
    TechStackResponse,
    # Project
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    # Publication
    PublicationCreate,
    PublicationUpdate,
    PublicationResponse,
    # Achievement
    AchievementCreate,
    AchievementUpdate,
    AchievementResponse,
    # Course
    CourseCreate,
    CourseUpdate,
    CourseResponse,
    # Reorder
    ReorderRequest,
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

router = APIRouter(prefix="/portfolio", tags=["admin-portfolio"])


# ===========================================
# Portfolio Settings (Singleton Data)
# ===========================================


@router.get("/settings", response_model=list[PortfolioSettingResponse])
async def list_settings(
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """List all portfolio settings."""
    result = await db.execute(select(PortfolioSetting))
    settings = result.scalars().all()
    return [
        PortfolioSettingResponse(
            id=s.id,
            key=s.key,
            value=s.value,
            updated_at=s.updated_at,
        )
        for s in settings
    ]


@router.get("/settings/{key}", response_model=PortfolioSettingResponse)
async def get_setting(
    key: str,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Get a portfolio setting by key."""
    result = await db.execute(
        select(PortfolioSetting).where(PortfolioSetting.key == key)
    )
    setting = result.scalar_one_or_none()

    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Setting '{key}' not found",
        )

    return PortfolioSettingResponse(
        id=setting.id,
        key=setting.key,
        value=setting.value,
        updated_at=setting.updated_at,
    )


@router.put("/settings/{key}", response_model=PortfolioSettingResponse)
async def update_setting(
    key: str,
    value: dict[str, Any],
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Update or create a portfolio setting."""
    result = await db.execute(
        select(PortfolioSetting).where(PortfolioSetting.key == key)
    )
    setting = result.scalar_one_or_none()

    if setting:
        setting.value = value
        setting.updated_at = datetime.utcnow()
    else:
        setting = PortfolioSetting(key=key, value=value)
        db.add(setting)

    await db.commit()
    await db.refresh(setting)

    return PortfolioSettingResponse(
        id=setting.id,
        key=setting.key,
        value=setting.value,
        updated_at=setting.updated_at,
    )


# ===========================================
# Experience Endpoints
# ===========================================


@router.get("/experiences", response_model=list[ExperienceResponse])
async def list_experiences(
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """List all experiences."""
    result = await db.execute(
        select(PortfolioExperience).order_by(PortfolioExperience.display_order)
    )
    return result.scalars().all()


@router.get("/experiences/{id}", response_model=ExperienceResponse)
async def get_experience(
    id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Get experience by ID."""
    result = await db.execute(
        select(PortfolioExperience).where(PortfolioExperience.id == id)
    )
    exp = result.scalar_one_or_none()

    if not exp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found",
        )
    return exp


@router.post("/experiences", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
async def create_experience(
    data: ExperienceCreate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Create a new experience."""
    exp = PortfolioExperience(**data.model_dump())
    db.add(exp)
    await db.commit()
    await db.refresh(exp)
    return exp


@router.put("/experiences/{id}", response_model=ExperienceResponse)
async def update_experience(
    id: int,
    data: ExperienceUpdate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Update an experience."""
    result = await db.execute(
        select(PortfolioExperience).where(PortfolioExperience.id == id)
    )
    exp = result.scalar_one_or_none()

    if not exp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exp, field, value)
    exp.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(exp)
    return exp


@router.delete("/experiences/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_experience(
    id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Delete an experience."""
    result = await db.execute(
        select(PortfolioExperience).where(PortfolioExperience.id == id)
    )
    exp = result.scalar_one_or_none()

    if not exp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found",
        )

    await db.delete(exp)
    await db.commit()


@router.put("/experiences/reorder")
async def reorder_experiences(
    data: ReorderRequest,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Reorder experiences by providing list of IDs in desired order."""
    for order, item_id in enumerate(data.ids):
        result = await db.execute(
            select(PortfolioExperience).where(PortfolioExperience.id == item_id)
        )
        item = result.scalar_one_or_none()
        if item:
            item.display_order = order
            item.updated_at = datetime.utcnow()

    await db.commit()
    return {"message": "Reorder successful"}


# ===========================================
# Tech Stack Endpoints
# ===========================================


@router.get("/tech-stack", response_model=list[TechStackResponse])
async def list_tech_stack(
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """List all tech stack items."""
    result = await db.execute(
        select(PortfolioTechStack).order_by(PortfolioTechStack.display_order)
    )
    return result.scalars().all()


@router.get("/tech-stack/{id}", response_model=TechStackResponse)
async def get_tech_stack(
    id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Get tech stack item by ID."""
    result = await db.execute(
        select(PortfolioTechStack).where(PortfolioTechStack.id == id)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tech stack item not found",
        )
    return item


@router.post("/tech-stack", response_model=TechStackResponse, status_code=status.HTTP_201_CREATED)
async def create_tech_stack(
    data: TechStackCreate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Create a new tech stack item."""
    item = PortfolioTechStack(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.put("/tech-stack/{id}", response_model=TechStackResponse)
async def update_tech_stack(
    id: int,
    data: TechStackUpdate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Update a tech stack item."""
    result = await db.execute(
        select(PortfolioTechStack).where(PortfolioTechStack.id == id)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tech stack item not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    item.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/tech-stack/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tech_stack(
    id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Delete a tech stack item."""
    result = await db.execute(
        select(PortfolioTechStack).where(PortfolioTechStack.id == id)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tech stack item not found",
        )

    await db.delete(item)
    await db.commit()


@router.put("/tech-stack/reorder")
async def reorder_tech_stack(
    data: ReorderRequest,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Reorder tech stack items."""
    for order, item_id in enumerate(data.ids):
        result = await db.execute(
            select(PortfolioTechStack).where(PortfolioTechStack.id == item_id)
        )
        item = result.scalar_one_or_none()
        if item:
            item.display_order = order
            item.updated_at = datetime.utcnow()

    await db.commit()
    return {"message": "Reorder successful"}


# ===========================================
# Project Endpoints
# ===========================================


@router.get("/projects", response_model=list[ProjectResponse])
async def list_projects(
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """List all projects."""
    result = await db.execute(
        select(PortfolioProject).order_by(PortfolioProject.display_order)
    )
    return result.scalars().all()


@router.get("/projects/{id}", response_model=ProjectResponse)
async def get_project(
    id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Get project by ID."""
    result = await db.execute(
        select(PortfolioProject).where(PortfolioProject.id == id)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return item


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Create a new project."""
    item = PortfolioProject(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.put("/projects/{id}", response_model=ProjectResponse)
async def update_project(
    id: int,
    data: ProjectUpdate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Update a project."""
    result = await db.execute(
        select(PortfolioProject).where(PortfolioProject.id == id)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    item.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/projects/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Delete a project."""
    result = await db.execute(
        select(PortfolioProject).where(PortfolioProject.id == id)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    await db.delete(item)
    await db.commit()


@router.put("/projects/reorder")
async def reorder_projects(
    data: ReorderRequest,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Reorder projects."""
    for order, item_id in enumerate(data.ids):
        result = await db.execute(
            select(PortfolioProject).where(PortfolioProject.id == item_id)
        )
        item = result.scalar_one_or_none()
        if item:
            item.display_order = order
            item.updated_at = datetime.utcnow()

    await db.commit()
    return {"message": "Reorder successful"}


# ===========================================
# Publication Endpoints
# ===========================================


@router.get("/publications", response_model=list[PublicationResponse])
async def list_publications(
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """List all publications."""
    result = await db.execute(
        select(PortfolioPublication).order_by(PortfolioPublication.display_order)
    )
    return result.scalars().all()


@router.get("/publications/{id}", response_model=PublicationResponse)
async def get_publication(
    id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Get publication by ID."""
    result = await db.execute(
        select(PortfolioPublication).where(PortfolioPublication.id == id)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found",
        )
    return item


@router.post("/publications", response_model=PublicationResponse, status_code=status.HTTP_201_CREATED)
async def create_publication(
    data: PublicationCreate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Create a new publication."""
    item = PortfolioPublication(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.put("/publications/{id}", response_model=PublicationResponse)
async def update_publication(
    id: int,
    data: PublicationUpdate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Update a publication."""
    result = await db.execute(
        select(PortfolioPublication).where(PortfolioPublication.id == id)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    item.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/publications/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_publication(
    id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Delete a publication."""
    result = await db.execute(
        select(PortfolioPublication).where(PortfolioPublication.id == id)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found",
        )

    await db.delete(item)
    await db.commit()


@router.put("/publications/reorder")
async def reorder_publications(
    data: ReorderRequest,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Reorder publications."""
    for order, item_id in enumerate(data.ids):
        result = await db.execute(
            select(PortfolioPublication).where(PortfolioPublication.id == item_id)
        )
        item = result.scalar_one_or_none()
        if item:
            item.display_order = order
            item.updated_at = datetime.utcnow()

    await db.commit()
    return {"message": "Reorder successful"}


# ===========================================
# Achievement Endpoints
# ===========================================


@router.get("/achievements", response_model=list[AchievementResponse])
async def list_achievements(
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """List all achievements."""
    result = await db.execute(
        select(PortfolioAchievement).order_by(PortfolioAchievement.display_order)
    )
    return result.scalars().all()


@router.get("/achievements/{id}", response_model=AchievementResponse)
async def get_achievement(
    id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Get achievement by ID."""
    result = await db.execute(
        select(PortfolioAchievement).where(PortfolioAchievement.id == id)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Achievement not found",
        )
    return item


@router.post("/achievements", response_model=AchievementResponse, status_code=status.HTTP_201_CREATED)
async def create_achievement(
    data: AchievementCreate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Create a new achievement."""
    item = PortfolioAchievement(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.put("/achievements/{id}", response_model=AchievementResponse)
async def update_achievement(
    id: int,
    data: AchievementUpdate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Update an achievement."""
    result = await db.execute(
        select(PortfolioAchievement).where(PortfolioAchievement.id == id)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Achievement not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    item.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/achievements/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_achievement(
    id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Delete an achievement."""
    result = await db.execute(
        select(PortfolioAchievement).where(PortfolioAchievement.id == id)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Achievement not found",
        )

    await db.delete(item)
    await db.commit()


@router.put("/achievements/reorder")
async def reorder_achievements(
    data: ReorderRequest,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Reorder achievements."""
    for order, item_id in enumerate(data.ids):
        result = await db.execute(
            select(PortfolioAchievement).where(PortfolioAchievement.id == item_id)
        )
        item = result.scalar_one_or_none()
        if item:
            item.display_order = order
            item.updated_at = datetime.utcnow()

    await db.commit()
    return {"message": "Reorder successful"}


# ===========================================
# Course Endpoints
# ===========================================


@router.get("/courses", response_model=list[CourseResponse])
async def list_courses(
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """List all courses."""
    result = await db.execute(
        select(PortfolioCourse).order_by(PortfolioCourse.display_order)
    )
    return result.scalars().all()


@router.get("/courses/{id}", response_model=CourseResponse)
async def get_course(
    id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Get course by ID."""
    result = await db.execute(
        select(PortfolioCourse).where(PortfolioCourse.id == id)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )
    return item


@router.post("/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    data: CourseCreate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Create a new course."""
    item = PortfolioCourse(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.put("/courses/{id}", response_model=CourseResponse)
async def update_course(
    id: int,
    data: CourseUpdate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Update a course."""
    result = await db.execute(
        select(PortfolioCourse).where(PortfolioCourse.id == id)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    item.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/courses/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Delete a course."""
    result = await db.execute(
        select(PortfolioCourse).where(PortfolioCourse.id == id)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    await db.delete(item)
    await db.commit()


@router.put("/courses/reorder")
async def reorder_courses(
    data: ReorderRequest,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Reorder courses."""
    for order, item_id in enumerate(data.ids):
        result = await db.execute(
            select(PortfolioCourse).where(PortfolioCourse.id == item_id)
        )
        item = result.scalar_one_or_none()
        if item:
            item.display_order = order
            item.updated_at = datetime.utcnow()

    await db.commit()
    return {"message": "Reorder successful"}
