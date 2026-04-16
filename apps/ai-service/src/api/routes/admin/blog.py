"""Admin blog endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps.auth import CurrentAdmin
from src.api.schemas.admin import BlogPostCreate, BlogPostResponse, BlogPostUpdate
from src.database.connection import get_db
from src.database.models import BlogPost

router = APIRouter(prefix="/blog", tags=["admin-blog"])


def to_naive_utc(value: datetime | None) -> datetime | None:
    """Convert timezone-aware datetimes to naive UTC for Postgres TIMESTAMP columns."""
    if value is None:
        return None
    if value.tzinfo is not None:
        return value.astimezone(timezone.utc).replace(tzinfo=None)
    return value


@router.get("", response_model=list[BlogPostResponse])
async def list_blog_posts(
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """List all blog posts, newest first."""
    result = await db.execute(
        select(BlogPost).order_by(BlogPost.updated_at.desc(), BlogPost.id.desc())
    )
    return result.scalars().all()


@router.get("/{post_id}", response_model=BlogPostResponse)
async def get_blog_post(
    post_id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Get a single blog post."""
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    return post


@router.post("", response_model=BlogPostResponse, status_code=status.HTTP_201_CREATED)
async def create_blog_post(
    data: BlogPostCreate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Create a blog post."""
    result = await db.execute(select(BlogPost).where(BlogPost.slug == data.slug))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already exists")

    published_at = to_naive_utc(data.published_at)
    if data.is_published and not published_at:
        published_at = datetime.utcnow()

    post = BlogPost(
        title=data.title,
        slug=data.slug,
        excerpt=data.excerpt,
        cover_image=data.cover_image,
        content_markdown=data.content_markdown,
        tags=data.tags,
        is_published=data.is_published,
        published_at=published_at,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post


@router.put("/{post_id}", response_model=BlogPostResponse)
async def update_blog_post(
    post_id: int,
    data: BlogPostUpdate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Update a blog post."""
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")

    if data.slug and data.slug != post.slug:
        slug_result = await db.execute(select(BlogPost).where(BlogPost.slug == data.slug))
        if slug_result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already exists")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(post, field, value)

    if data.is_published is True and not post.published_at:
        post.published_at = to_naive_utc(data.published_at) or datetime.utcnow()
    elif data.published_at is not None:
        post.published_at = to_naive_utc(data.published_at)
    if data.is_published is False and data.published_at is None:
        post.published_at = None

    post.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog_post(
    post_id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Delete a blog post."""
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    await db.delete(post)
    await db.commit()
