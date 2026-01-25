"""Action tools for the AI agent - performs actions on behalf of users."""

import httpx
from datetime import datetime
from typing import Optional
from sqlmodel import Session, select
from src.database.connection import sync_engine
from src.database.models import SystemSetting, ContactLead, PortfolioSetting


def _get_setting(key: str, default: str = "") -> str:
    """Get a system setting value by key."""
    with Session(sync_engine) as session:
        setting = session.exec(
            select(SystemSetting).where(SystemSetting.key == key)
        ).first()
        return setting.value if setting else default


def send_cv() -> str:
    """
    Get the download link for Thiện's CV/Resume.
    Use this when visitors ask to download CV, resume, or want a document about Thiện's background.

    Returns:
        Message with CV download link or instructions
    """
    resume_url = _get_setting("resume_url")

    if not resume_url:
        # Fallback: get contact info to provide alternative
        with Session(sync_engine) as session:
            social = session.exec(
                select(PortfolioSetting).where(PortfolioSetting.key == "social")
            ).first()

            if social and social.value:
                email = social.value.get("email", "")
                linkedin = social.value.get("linkedin", "")

                return (
                    "I apologize, but the CV download link is not currently available. "
                    f"However, you can:\n"
                    f"• View Thiện's full profile on LinkedIn: {linkedin}\n"
                    f"• Request the CV directly via email: {email}\n"
                    "Would you like me to help you with anything else?"
                )

        return (
            "I apologize, but the CV download link is not currently configured. "
            "Please contact Thiện directly or check back later."
        )

    return (
        f"Here's the link to download Thiện's CV/Resume:\n\n"
        f"📄 **[Download CV]({resume_url})**\n\n"
        "The CV includes details about his education, work experience, skills, and projects. "
        "Is there anything specific from the CV you'd like me to highlight?"
    )


def save_contact(
    name: str,
    email: Optional[str] = None,
    company: Optional[str] = None,
    phone: Optional[str] = None,
    purpose: Optional[str] = None,
    message: Optional[str] = None,
    session_id: Optional[str] = None,
) -> str:
    """
    Save visitor contact information for Thiện to follow up later.
    Use this when visitors want to:
    - Leave their contact info
    - Get in touch with Thiện
    - Request a callback or meeting
    - Express interest in hiring or collaboration

    Args:
        name: Visitor's name (required)
        email: Email address (optional but recommended)
        company: Company/organization name (optional)
        phone: Phone number (optional)
        purpose: Reason for contact - "hiring", "collaboration", "project", or "other" (optional)
        message: Additional message or notes (optional)
        session_id: Chat session ID for reference (optional, usually auto-filled)

    Returns:
        Confirmation message
    """
    if not name or not name.strip():
        return "I need at least your name to save your contact information. Could you please provide your name?"

    # Validate purpose if provided
    valid_purposes = ["hiring", "collaboration", "project", "other", None]
    if purpose and purpose.lower() not in valid_purposes:
        purpose = "other"

    with Session(sync_engine) as session:
        contact = ContactLead(
            name=name.strip(),
            email=email.strip() if email else None,
            company=company.strip() if company else None,
            phone=phone.strip() if phone else None,
            purpose=purpose.lower() if purpose else None,
            message=message.strip() if message else None,
            session_id=session_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(contact)
        session.commit()

    # Build confirmation message
    response = f"Thank you, {name}! I've saved your contact information.\n\n"

    if email:
        response += f"📧 Thiện will reach out to you at **{email}**"
    elif phone:
        response += f"📱 Thiện will contact you at **{phone}**"
    else:
        response += "Thiện will review your message"

    if purpose:
        purpose_text = {
            "hiring": " regarding the hiring opportunity",
            "collaboration": " about potential collaboration",
            "project": " about your project inquiry",
            "other": " soon",
        }
        response += purpose_text.get(purpose.lower(), " soon")

    response += ".\n\nIs there anything else I can help you with in the meantime?"

    return response


def schedule_meeting() -> str:
    """
    Get information about scheduling a meeting with Thiện.
    Use this when visitors want to:
    - Schedule a call or meeting
    - Book time to discuss opportunities
    - Set up an interview or consultation

    Returns:
        Meeting scheduling information or Calendly link
    """
    calendly_link = _get_setting("calendly_link")

    if calendly_link:
        return (
            f"You can schedule a meeting with Thiện using the link below:\n\n"
            f"📅 **[Schedule a Meeting]({calendly_link})**\n\n"
            "Available meeting types:\n"
            "• 15-minute quick chat\n"
            "• 30-minute discovery call\n"
            "• 60-minute detailed discussion\n\n"
            "Choose a time that works best for you!"
        )

    # Fallback: get contact info
    with Session(sync_engine) as session:
        social = session.exec(
            select(PortfolioSetting).where(PortfolioSetting.key == "social")
        ).first()

        if social and social.value:
            email = social.value.get("email", "")
            linkedin = social.value.get("linkedin", "")

            return (
                "To schedule a meeting with Thiện, you can:\n\n"
                f"📧 Send an email to: **{email}**\n"
                f"💼 Connect on LinkedIn: {linkedin}\n\n"
                "Please include your preferred times and the topic you'd like to discuss. "
                "Would you like me to save your contact information so Thiện can reach out to you?"
            )

    return (
        "Meeting scheduling is not yet configured. "
        "Please leave your contact information, and Thiện will get back to you to arrange a meeting."
    )


def fetch_github_stats(username: Optional[str] = None) -> str:
    """
    Fetch GitHub statistics and activity for Thiện's profile.
    Use this when visitors ask about:
    - GitHub contributions
    - Open source activity
    - Coding statistics
    - Repository information

    Args:
        username: GitHub username (optional, defaults to configured username)

    Returns:
        GitHub statistics summary
    """
    # Get GitHub username from settings or use default
    github_username = username or _get_setting("github_username", "")
    github_token = _get_setting("github_token")

    if not github_username:
        # Try to get from social settings
        with Session(sync_engine) as session:
            social = session.exec(
                select(PortfolioSetting).where(PortfolioSetting.key == "social")
            ).first()

            if social and social.value:
                github_url = social.value.get("github", "")
                if github_url:
                    # Extract username from URL
                    github_username = github_url.rstrip("/").split("/")[-1]

    if not github_username:
        return "GitHub username is not configured. Please check the system settings."

    try:
        headers = {"Accept": "application/vnd.github.v3+json"}
        if github_token:
            headers["Authorization"] = f"Bearer {github_token}"

        # Fetch user profile
        with httpx.Client(timeout=10.0) as client:
            user_response = client.get(
                f"https://api.github.com/users/{github_username}",
                headers=headers,
            )

            if user_response.status_code == 404:
                return f"GitHub user '{github_username}' not found."

            if user_response.status_code != 200:
                return f"Unable to fetch GitHub data. Please try again later."

            user_data = user_response.json()

            # Fetch repositories
            repos_response = client.get(
                f"https://api.github.com/users/{github_username}/repos",
                params={"per_page": 100, "sort": "updated"},
                headers=headers,
            )
            repos_data = repos_response.json() if repos_response.status_code == 200 else []

        # Calculate statistics
        public_repos = user_data.get("public_repos", 0)
        followers = user_data.get("followers", 0)
        following = user_data.get("following", 0)
        profile_url = user_data.get("html_url", "")
        bio = user_data.get("bio", "")

        # Aggregate repo stats
        total_stars = sum(repo.get("stargazers_count", 0) for repo in repos_data)
        total_forks = sum(repo.get("forks_count", 0) for repo in repos_data)

        # Get top languages
        languages = {}
        for repo in repos_data:
            lang = repo.get("language")
            if lang:
                languages[lang] = languages.get(lang, 0) + 1

        top_languages = sorted(languages.items(), key=lambda x: x[1], reverse=True)[:5]
        lang_str = ", ".join([f"{lang} ({count})" for lang, count in top_languages])

        # Get recent activity (most recently updated repos)
        recent_repos = repos_data[:3] if repos_data else []
        recent_str = "\n".join([
            f"  • {repo['name']}: {repo.get('description', 'No description')[:60]}..."
            for repo in recent_repos
        ])

        return (
            f"**GitHub Profile: [{github_username}]({profile_url})**\n\n"
            f"{bio}\n\n" if bio else f"**GitHub Profile: [{github_username}]({profile_url})**\n\n"
            f"📊 **Statistics:**\n"
            f"• Public Repositories: {public_repos}\n"
            f"• Total Stars: ⭐ {total_stars}\n"
            f"• Total Forks: 🍴 {total_forks}\n"
            f"• Followers: {followers} | Following: {following}\n\n"
            f"💻 **Top Languages:** {lang_str}\n\n"
            f"📁 **Recently Updated:**\n{recent_str}\n\n"
            f"View the full profile at: {profile_url}"
        )

    except httpx.TimeoutException:
        return "Request to GitHub timed out. Please try again later."
    except Exception as e:
        return f"Unable to fetch GitHub stats: {str(e)}"


def calculator(expression: str) -> str:
    """
    Evaluate a mathematical expression.
    Use this for simple calculations during conversation.

    Args:
        expression: Math expression (e.g., "2 + 2", "10 * 5", "100 / 4")

    Returns:
        Calculation result
    """
    try:
        # Safe eval for simple math
        allowed_chars = set("0123456789+-*/.() ")
        if not all(c in allowed_chars for c in expression):
            return "Error: Invalid characters in expression. Only numbers and basic operators (+, -, *, /, .) are allowed."

        result = eval(expression)
        return f"{expression} = {result}"
    except ZeroDivisionError:
        return "Error: Division by zero"
    except Exception as e:
        return f"Error calculating: {str(e)}"
