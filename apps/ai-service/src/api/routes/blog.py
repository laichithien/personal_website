"""Public blog API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.schemas.portfolio import BlogPostPreviewResponse, BlogPostResponse
from src.database.connection import get_db
from src.database.models import BlogPost

router = APIRouter(prefix="/api/blog", tags=["blog"])


@router.get("", response_model=list[BlogPostPreviewResponse])
async def list_published_posts(
    db: AsyncSession = Depends(get_db),
):
    """List published blog posts."""
    result = await db.execute(
        select(BlogPost)
        .where(BlogPost.is_published == True)
        .order_by(BlogPost.published_at.desc(), BlogPost.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{slug}", response_model=BlogPostResponse)
async def get_published_post(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a single published blog post by slug."""
    result = await db.execute(
        select(BlogPost)
        .where(BlogPost.slug == slug)
        .where(BlogPost.is_published == True)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    return post
