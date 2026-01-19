"""Admin knowledge document endpoints."""

import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional

import aiofiles
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.api.deps.auth import CurrentAdmin
from src.api.schemas.admin import (
    KnowledgeDocumentCreate,
    KnowledgeDocumentResponse,
    KnowledgeDocumentUpdate,
)
from src.config import settings
from src.database.connection import get_db
from src.database.models import KnowledgeChunk, KnowledgeDocument

router = APIRouter(prefix="/knowledge", tags=["admin-knowledge"])

# Ensure upload directory exists
UPLOAD_DIR = Path(settings.upload_dir)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.get("", response_model=list[KnowledgeDocumentResponse])
async def list_documents(
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """List all knowledge documents."""
    result = await db.execute(
        select(KnowledgeDocument).options(selectinload(KnowledgeDocument.chunks))
    )
    documents = result.scalars().all()

    return [
        KnowledgeDocumentResponse(
            id=doc.id,
            title=doc.title,
            content=doc.content[:500] + "..." if len(doc.content) > 500 else doc.content,
            source=doc.source,
            doc_metadata=doc.doc_metadata,
            created_at=doc.created_at,
            updated_at=doc.updated_at,
            chunk_count=len(doc.chunks),
        )
        for doc in documents
    ]


@router.get("/{doc_id}", response_model=KnowledgeDocumentResponse)
async def get_document(
    doc_id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Get knowledge document by ID."""
    result = await db.execute(
        select(KnowledgeDocument)
        .where(KnowledgeDocument.id == doc_id)
        .options(selectinload(KnowledgeDocument.chunks))
    )
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    return KnowledgeDocumentResponse(
        id=doc.id,
        title=doc.title,
        content=doc.content,
        source=doc.source,
        doc_metadata=doc.doc_metadata,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        chunk_count=len(doc.chunks),
    )


@router.post("", response_model=KnowledgeDocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    data: KnowledgeDocumentCreate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Create a new knowledge document."""
    doc = KnowledgeDocument(
        title=data.title,
        content=data.content,
        source=data.source,
        doc_metadata=data.doc_metadata,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    return KnowledgeDocumentResponse(
        id=doc.id,
        title=doc.title,
        content=doc.content,
        source=doc.source,
        doc_metadata=doc.doc_metadata,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        chunk_count=0,
    )


@router.post("/upload", response_model=KnowledgeDocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    admin: CurrentAdmin,
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    source: str = Form("upload"),
    db: AsyncSession = Depends(get_db),
):
    """Upload a document file."""
    # Validate file type
    ext = Path(file.filename).suffix.lower()
    if ext not in settings.allowed_file_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {settings.allowed_file_extensions}",
        )

    # Read and validate file size
    content = await file.read()
    if len(content) > settings.max_upload_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {settings.max_upload_size_mb}MB",
        )

    # Generate unique filename
    file_hash = hashlib.md5(content).hexdigest()[:8]
    safe_filename = f"{file_hash}_{file.filename}"
    file_path = UPLOAD_DIR / safe_filename

    # Save file
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    # Extract text content
    try:
        text_content = await extract_text_content(content, ext)
    except Exception as e:
        # Remove file if extraction fails
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to extract text from file: {str(e)}",
        )

    # Create document
    doc = KnowledgeDocument(
        title=title or Path(file.filename).stem,
        content=text_content,
        source=source,
        doc_metadata={
            "original_filename": file.filename,
            "file_path": str(file_path),
            "file_size": len(content),
        },
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    return KnowledgeDocumentResponse(
        id=doc.id,
        title=doc.title,
        content=doc.content[:500] + "..." if len(doc.content) > 500 else doc.content,
        source=doc.source,
        doc_metadata=doc.doc_metadata,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        chunk_count=0,
    )


@router.put("/{doc_id}", response_model=KnowledgeDocumentResponse)
async def update_document(
    doc_id: int,
    data: KnowledgeDocumentUpdate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Update a knowledge document."""
    result = await db.execute(
        select(KnowledgeDocument)
        .where(KnowledgeDocument.id == doc_id)
        .options(selectinload(KnowledgeDocument.chunks))
    )
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(doc, field, value)
    doc.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(doc)

    return KnowledgeDocumentResponse(
        id=doc.id,
        title=doc.title,
        content=doc.content,
        source=doc.source,
        doc_metadata=doc.doc_metadata,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        chunk_count=len(doc.chunks),
    )


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    doc_id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Delete a knowledge document and its chunks."""
    result = await db.execute(
        select(KnowledgeDocument).where(KnowledgeDocument.id == doc_id)
    )
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    # Delete associated file if exists
    if doc.doc_metadata and "file_path" in doc.doc_metadata:
        file_path = Path(doc.doc_metadata["file_path"])
        file_path.unlink(missing_ok=True)

    # Delete chunks
    await db.execute(
        delete(KnowledgeChunk).where(KnowledgeChunk.document_id == doc_id)
    )

    # Delete document
    await db.delete(doc)
    await db.commit()


@router.post("/{doc_id}/reindex")
async def reindex_document(
    doc_id: int,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
):
    """Re-chunk and re-embed a document."""
    result = await db.execute(
        select(KnowledgeDocument).where(KnowledgeDocument.id == doc_id)
    )
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    # Delete existing chunks
    await db.execute(
        delete(KnowledgeChunk).where(KnowledgeChunk.document_id == doc_id)
    )

    # TODO: Implement chunking and embedding logic
    # This would involve:
    # 1. Split content into chunks
    # 2. Generate embeddings for each chunk
    # 3. Store chunks with embeddings

    await db.commit()

    return {"message": "Document reindexing triggered", "doc_id": doc_id}


async def extract_text_content(content: bytes, ext: str) -> str:
    """Extract text from various file formats."""
    if ext in [".txt", ".md"]:
        return content.decode("utf-8")
    elif ext == ".pdf":
        try:
            import pypdf
            from io import BytesIO

            reader = pypdf.PdfReader(BytesIO(content))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        except ImportError:
            raise ValueError("pypdf not installed for PDF processing")
    elif ext == ".json":
        import json

        data = json.loads(content.decode("utf-8"))
        return json.dumps(data, indent=2)
    elif ext == ".csv":
        return content.decode("utf-8")
    else:
        raise ValueError(f"Unsupported file type: {ext}")
