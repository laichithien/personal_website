"""Portfolio search tool - Unified RAG-based search for all portfolio information."""

from sqlmodel import Session, select, or_
from src.database.connection import sync_engine
from src.database.models import (
    PortfolioSetting,
    PortfolioExperience,
    PortfolioTechStack,
    PortfolioProject,
    PortfolioPublication,
    PortfolioAchievement,
    PortfolioCourse,
    KnowledgeDocument,
    KnowledgeChunk,
)


def search_profile(query: str) -> str:
    """
    Search through Thiện's complete profile and portfolio information.
    Use this tool for ANY question about Thiện - background, skills, experience, projects, etc.

    This unified search covers:
    - Personal info (name, bio, education, contact)
    - Work experience and career history
    - Technical skills and tech stack
    - Projects and portfolio pieces
    - Achievements and awards
    - Publications and research
    - Courses and certifications
    - Interests and lifestyle

    Args:
        query: Natural language query about Thiện (e.g., "what technologies does he use",
               "work experience", "projects with Python", "contact info")

    Returns:
        Relevant information matching the query, formatted for conversation
    """
    query_lower = query.lower()
    results = []

    with Session(sync_engine) as session:
        # Determine what categories to search based on query keywords
        search_personal = any(kw in query_lower for kw in [
            "who", "about", "bio", "name", "contact", "email", "linkedin", "github",
            "education", "school", "university", "degree", "gpa", "interest", "hobby",
            "music", "guitar", "lifestyle", "thiện", "thien"
        ])

        search_experience = any(kw in query_lower for kw in [
            "experience", "work", "job", "career", "company", "role", "position",
            "employment", "worked", "working"
        ])

        search_skills = any(kw in query_lower for kw in [
            "skill", "technology", "tech", "stack", "language", "framework", "tool",
            "programming", "python", "javascript", "typescript", "react", "ai", "ml",
            "database", "devops", "backend", "frontend", "know", "use", "familiar"
        ])

        search_projects = any(kw in query_lower for kw in [
            "project", "portfolio", "built", "created", "developed", "work sample",
            "example", "demo", "application", "app"
        ])

        search_achievements = any(kw in query_lower for kw in [
            "achievement", "award", "prize", "recognition", "competition", "hackathon",
            "contest", "win", "won"
        ])

        search_publications = any(kw in query_lower for kw in [
            "publication", "paper", "research", "academic", "published", "journal",
            "conference"
        ])

        search_courses = any(kw in query_lower for kw in [
            "course", "certification", "certificate", "training", "learning", "study"
        ])

        # If no specific category detected, search everything
        search_all = not any([
            search_personal, search_experience, search_skills, search_projects,
            search_achievements, search_publications, search_courses
        ])

        # Personal info section
        if search_personal or search_all:
            personal_info = _get_personal_info(session)
            if personal_info:
                results.append(personal_info)

        # Experience section
        if search_experience or search_all:
            experiences = _get_experiences(session, query_lower)
            if experiences:
                results.append(experiences)

        # Skills/Tech Stack section
        if search_skills or search_all:
            tech_stack = _get_tech_stack(session, query_lower)
            if tech_stack:
                results.append(tech_stack)

        # Projects section
        if search_projects or search_all:
            projects = _get_projects(session, query_lower)
            if projects:
                results.append(projects)

        # Achievements section
        if search_achievements or search_all:
            achievements = _get_achievements(session)
            if achievements:
                results.append(achievements)

        # Publications section
        if search_publications or search_all:
            publications = _get_publications(session)
            if publications:
                results.append(publications)

        # Courses section
        if search_courses or search_all:
            courses = _get_courses(session)
            if courses:
                results.append(courses)

        # Also search knowledge base for additional context
        if search_all or len(results) == 0:
            knowledge = _search_knowledge_base(session, query_lower)
            if knowledge:
                results.append(knowledge)

    if not results:
        return f"I couldn't find specific information about '{query}'. Try asking about Thiện's experience, skills, projects, or background."

    return "\n\n---\n\n".join(results)


def _get_personal_info(session: Session) -> str:
    """Get personal information from settings."""
    sections = []

    # Hero info
    hero = session.exec(
        select(PortfolioSetting).where(PortfolioSetting.key == "hero")
    ).first()
    if hero and hero.value:
        h = hero.value
        sections.append(f"**{h.get('name', 'Thiện')}** - {h.get('title', '')}")
        if h.get('tagline'):
            sections.append(h.get('tagline'))

    # About
    about = session.exec(
        select(PortfolioSetting).where(PortfolioSetting.key == "about")
    ).first()
    if about and about.value:
        a = about.value
        if a.get('summary'):
            sections.append(f"\n{a.get('summary')}")
        if a.get('highlights'):
            sections.append("Key highlights: " + ", ".join(a.get('highlights', [])))

    # Education
    education = session.exec(
        select(PortfolioSetting).where(PortfolioSetting.key == "education")
    ).first()
    if education and education.value:
        e = education.value
        edu_text = f"Education: {e.get('degree', '')} at {e.get('school', '')} ({e.get('period', '')})"
        if e.get('gpa'):
            edu_text += f" - GPA: {e.get('gpa')} ({e.get('rank', '')})"
        sections.append(edu_text)

    # Contact
    social = session.exec(
        select(PortfolioSetting).where(PortfolioSetting.key == "social")
    ).first()
    if social and social.value:
        s = social.value
        contacts = []
        if s.get('email'):
            contacts.append(f"Email: {s.get('email')}")
        if s.get('github'):
            contacts.append(f"GitHub: {s.get('github')}")
        if s.get('linkedin'):
            contacts.append(f"LinkedIn: {s.get('linkedin')}")
        if contacts:
            sections.append("Contact: " + " | ".join(contacts))

    # Lifestyle/Interests
    lifestyle = session.exec(
        select(PortfolioSetting).where(PortfolioSetting.key == "lifestyle")
    ).first()
    if lifestyle and lifestyle.value:
        l = lifestyle.value
        music = l.get('music', {})
        if music.get('instruments'):
            sections.append(f"Interests: Music ({', '.join(music.get('instruments', []))})")

    return "\n".join(sections) if sections else ""


def _get_experiences(session: Session, query: str = "") -> str:
    """Get work experiences, optionally filtered by query."""
    experiences = session.exec(
        select(PortfolioExperience)
        .where(PortfolioExperience.is_active == True)
        .order_by(PortfolioExperience.display_order)
    ).all()

    if not experiences:
        return ""

    # Filter by query if specific keywords
    if query:
        filtered = []
        for exp in experiences:
            text = f"{exp.company} {exp.role} {' '.join(exp.highlights or [])}".lower()
            if any(word in text for word in query.split()):
                filtered.append(exp)
        if filtered:
            experiences = filtered

    result = ["**Work Experience:**"]
    for exp in experiences:
        result.append(f"• {exp.role} @ {exp.company} ({exp.period})")
        if exp.highlights:
            for hl in exp.highlights[:3]:  # Limit highlights for brevity
                result.append(f"  - {hl}")

    return "\n".join(result)


def _get_tech_stack(session: Session, query: str = "") -> str:
    """Get tech stack, optionally filtered by query."""
    tech_items = session.exec(
        select(PortfolioTechStack)
        .where(PortfolioTechStack.is_active == True)
        .order_by(PortfolioTechStack.category, PortfolioTechStack.display_order)
    ).all()

    if not tech_items:
        return ""

    # Filter by query if specific tech mentioned
    if query:
        filtered = [t for t in tech_items if t.name.lower() in query or t.category.lower() in query]
        if filtered:
            tech_items = filtered

    # Group by category
    categories: dict[str, list[str]] = {}
    for item in tech_items:
        cat = item.category.title()
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(item.name)

    result = ["**Tech Stack:**"]
    for cat, items in categories.items():
        result.append(f"• {cat}: {', '.join(items)}")

    return "\n".join(result)


def _get_projects(session: Session, query: str = "") -> str:
    """Get projects, optionally filtered by query."""
    projects = session.exec(
        select(PortfolioProject)
        .where(PortfolioProject.is_active == True)
        .order_by(PortfolioProject.display_order)
    ).all()

    if not projects:
        return ""

    # Filter by query if specific keywords
    if query:
        filtered = []
        for proj in projects:
            text = f"{proj.title} {proj.description} {' '.join(proj.tags or [])}".lower()
            if any(word in text for word in query.split()):
                filtered.append(proj)
        if filtered:
            projects = filtered

    result = ["**Projects:**"]
    for proj in projects:
        featured = "⭐ " if proj.is_featured else ""
        result.append(f"• {featured}{proj.title}: {proj.description[:100]}...")
        if proj.tags:
            result.append(f"  Tech: {', '.join(proj.tags)}")
        links = []
        if proj.link:
            links.append(f"[Demo]({proj.link})")
        if proj.github:
            links.append(f"[GitHub]({proj.github})")
        if links:
            result.append(f"  Links: {' | '.join(links)}")

    return "\n".join(result)


def _get_achievements(session: Session) -> str:
    """Get achievements."""
    achievements = session.exec(
        select(PortfolioAchievement)
        .where(PortfolioAchievement.is_active == True)
        .order_by(PortfolioAchievement.year.desc())
    ).all()

    if not achievements:
        return ""

    result = ["**Achievements:**"]
    for ach in achievements:
        result.append(f"• {ach.title} - {ach.event} ({ach.organization}, {ach.year})")

    return "\n".join(result)


def _get_publications(session: Session) -> str:
    """Get publications."""
    pubs = session.exec(
        select(PortfolioPublication)
        .where(PortfolioPublication.is_active == True)
        .order_by(PortfolioPublication.year.desc())
    ).all()

    if not pubs:
        return ""

    result = ["**Publications:**"]
    for pub in pubs:
        pub_text = f"• {pub.title} - {pub.venue} ({pub.year})"
        if pub.doi:
            pub_text += f" [DOI: {pub.doi}]"
        result.append(pub_text)

    return "\n".join(result)


def _get_courses(session: Session) -> str:
    """Get courses."""
    courses = session.exec(
        select(PortfolioCourse)
        .where(PortfolioCourse.is_active == True)
        .order_by(PortfolioCourse.year.desc())
    ).all()

    if not courses:
        return ""

    result = ["**Courses & Certifications:**"]
    for course in courses:
        course_text = f"• {course.title} ({course.year})"
        if course.focus:
            course_text += f" - Focus: {', '.join(course.focus)}"
        result.append(course_text)

    return "\n".join(result)


def _search_knowledge_base(session: Session, query: str) -> str:
    """Search the knowledge base for additional context."""
    results = session.exec(
        select(KnowledgeDocument)
        .where(KnowledgeDocument.content.ilike(f"%{query}%"))
        .limit(3)
    ).all()

    if not results:
        return ""

    formatted = ["**Additional Information:**"]
    for doc in results:
        formatted.append(f"• [{doc.source}] {doc.title}: {doc.content[:200]}...")

    return "\n".join(formatted)
