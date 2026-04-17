"""Integration tests for public and admin blog API endpoints."""

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.models import BlogPost


async def create_post(
    session: AsyncSession,
    *,
    title: str,
    slug: str,
    is_published: bool,
    content_markdown: str = "# Test post",
    excerpt: str = "",
    published_at=None,
) -> BlogPost:
    post = BlogPost(
        title=title,
        slug=slug,
        excerpt=excerpt,
        content_markdown=content_markdown,
        is_published=is_published,
        published_at=published_at,
    )
    session.add(post)
    await session.commit()
    await session.refresh(post)
    return post


class TestPublicBlogApi:
    async def test_list_only_returns_published_posts(
        self,
        async_client: AsyncClient,
        async_session: AsyncSession,
    ):
        await create_post(
            async_session,
            title="Published",
            slug="published-post",
            is_published=True,
        )
        await create_post(
            async_session,
            title="Draft",
            slug="draft-post",
            is_published=False,
        )

        response = await async_client.get("/api/blog")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["slug"] == "published-post"

    async def test_get_post_returns_404_for_draft(
        self,
        async_client: AsyncClient,
        async_session: AsyncSession,
    ):
        await create_post(
            async_session,
            title="Draft",
            slug="draft-post",
            is_published=False,
        )

        response = await async_client.get("/api/blog/draft-post")

        assert response.status_code == 404


class TestAdminBlogApi:
    async def test_create_published_post_normalizes_timezone_aware_datetime(
        self,
        async_client: AsyncClient,
        test_admin,
        admin_tokens: dict,
    ):
        async_client.cookies.set("access_token", admin_tokens["access_token"])

        response = await async_client.post(
            "/api/admin/blog",
            json={
                "title": "Timezone test",
                "slug": "timezone-test",
                "content_markdown": "# Hello",
                "is_published": True,
                "published_at": "2026-04-16T15:02:03.000Z",
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["slug"] == "timezone-test"
        assert data["published_at"] == "2026-04-16T15:02:03"

    async def test_create_blog_post_rejects_duplicate_slug(
        self,
        async_client: AsyncClient,
        async_session: AsyncSession,
        test_admin,
        admin_tokens: dict,
    ):
        await create_post(
            async_session,
            title="Existing",
            slug="existing-post",
            is_published=True,
        )
        async_client.cookies.set("access_token", admin_tokens["access_token"])

        response = await async_client.post(
            "/api/admin/blog",
            json={
                "title": "Duplicate",
                "slug": "existing-post",
                "content_markdown": "# Duplicate",
            },
        )

        assert response.status_code == 400
        assert response.json()["detail"] == "Slug already exists"
