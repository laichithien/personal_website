"""Portfolio API Pydantic schemas."""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


# ==========================================
# Portfolio Settings Schemas (Singleton data)
# ==========================================


class HeroData(BaseModel):
    """Hero section data."""

    name: str
    title: str
    tagline: str
    avatar: Optional[str] = None
    location: Optional[str] = None


class AboutData(BaseModel):
    """About section data."""

    summary: str
    highlights: list[str] = []


class EducationData(BaseModel):
    """Education section data."""

    school: str
    degree: str
    period: str
    gpa: Optional[str] = None
    rank: Optional[str] = None
    coursework: list[str] = []


class LifestyleData(BaseModel):
    """Lifestyle section data."""

    music: dict[str, Any] = {}
    routines: list[str] = []


class SocialData(BaseModel):
    """Social links data."""

    github: Optional[str] = None
    linkedin: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    twitter: Optional[str] = None
    website: Optional[str] = None


class PortfolioSettingResponse(BaseModel):
    """Portfolio setting response."""

    id: int
    key: str
    value: dict[str, Any]
    updated_at: datetime

    model_config = {"from_attributes": True}


# ==========================================
# Experience Schemas
# ==========================================


class ExperienceCreate(BaseModel):
    """Create experience entry."""

    company: str = Field(..., min_length=1, max_length=100)
    role: str = Field(..., min_length=1, max_length=100)
    period: str = Field(..., min_length=1, max_length=50)
    highlights: list[str] = []
    display_order: int = 0
    is_active: bool = True


class ExperienceUpdate(BaseModel):
    """Update experience entry."""

    company: Optional[str] = None
    role: Optional[str] = None
    period: Optional[str] = None
    highlights: Optional[list[str]] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class ExperienceResponse(BaseModel):
    """Experience response."""

    id: int
    company: str
    role: str
    period: str
    highlights: list[str]
    display_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ==========================================
# Tech Stack Schemas
# ==========================================


class TechStackCreate(BaseModel):
    """Create tech stack item."""

    name: str = Field(..., min_length=1, max_length=50)
    icon: str = Field(..., min_length=1, max_length=50)
    category: str = Field(..., min_length=1, max_length=50)  # language, ai, backend, frontend, database, devops
    display_order: int = 0
    is_active: bool = True


class TechStackUpdate(BaseModel):
    """Update tech stack item."""

    name: Optional[str] = None
    icon: Optional[str] = None
    category: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class TechStackResponse(BaseModel):
    """Tech stack response."""

    id: int
    name: str
    icon: str
    category: str
    display_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ==========================================
# Project Schemas
# ==========================================


class ProjectCreate(BaseModel):
    """Create project entry."""

    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    tags: list[str] = []
    image: Optional[str] = None
    link: Optional[str] = None
    github: Optional[str] = None
    is_featured: bool = False
    display_order: int = 0
    is_active: bool = True


class ProjectUpdate(BaseModel):
    """Update project entry."""

    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[list[str]] = None
    image: Optional[str] = None
    link: Optional[str] = None
    github: Optional[str] = None
    is_featured: Optional[bool] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class ProjectResponse(BaseModel):
    """Project response."""

    id: int
    title: str
    description: str
    tags: list[str]
    image: Optional[str]
    link: Optional[str]
    github: Optional[str]
    is_featured: bool
    display_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ==========================================
# Publication Schemas
# ==========================================


class PublicationCreate(BaseModel):
    """Create publication entry."""

    title: str = Field(..., min_length=1, max_length=500)
    venue: str = Field(..., min_length=1, max_length=200)
    doi: Optional[str] = None
    year: int = Field(..., ge=1900, le=2100)
    display_order: int = 0
    is_active: bool = True


class PublicationUpdate(BaseModel):
    """Update publication entry."""

    title: Optional[str] = None
    venue: Optional[str] = None
    doi: Optional[str] = None
    year: Optional[int] = Field(default=None, ge=1900, le=2100)
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class PublicationResponse(BaseModel):
    """Publication response."""

    id: int
    title: str
    venue: str
    doi: Optional[str]
    year: int
    display_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ==========================================
# Achievement Schemas
# ==========================================


class AchievementCreate(BaseModel):
    """Create achievement entry."""

    title: str = Field(..., min_length=1, max_length=200)
    event: str = Field(..., min_length=1, max_length=200)
    organization: str = Field(..., min_length=1, max_length=200)
    year: int = Field(..., ge=1900, le=2100)
    display_order: int = 0
    is_active: bool = True


class AchievementUpdate(BaseModel):
    """Update achievement entry."""

    title: Optional[str] = None
    event: Optional[str] = None
    organization: Optional[str] = None
    year: Optional[int] = Field(default=None, ge=1900, le=2100)
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class AchievementResponse(BaseModel):
    """Achievement response."""

    id: int
    title: str
    event: str
    organization: str
    year: int
    display_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ==========================================
# Course Schemas
# ==========================================


class CourseCreate(BaseModel):
    """Create course entry."""

    title: str = Field(..., min_length=1, max_length=200)
    year: int = Field(..., ge=1900, le=2100)
    focus: list[str] = []
    display_order: int = 0
    is_active: bool = True


class CourseUpdate(BaseModel):
    """Update course entry."""

    title: Optional[str] = None
    year: Optional[int] = Field(default=None, ge=1900, le=2100)
    focus: Optional[list[str]] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class CourseResponse(BaseModel):
    """Course response."""

    id: int
    title: str
    year: int
    focus: list[str]
    display_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ==========================================
# Reorder Schema
# ==========================================


class ReorderRequest(BaseModel):
    """Reorder items request."""

    ids: list[int]  # List of IDs in the desired order


# ==========================================
# Full Portfolio Response (Public API)
# ==========================================


class PortfolioFullResponse(BaseModel):
    """Complete portfolio data for public API."""

    hero: dict[str, Any]
    about: dict[str, Any]
    education: dict[str, Any]
    experience: list[ExperienceResponse]
    techStack: list[TechStackResponse]
    projects: list[ProjectResponse]
    publications: list[PublicationResponse]
    achievements: list[AchievementResponse]
    courses: list[CourseResponse]
    lifestyle: dict[str, Any]
    social: dict[str, Any]
