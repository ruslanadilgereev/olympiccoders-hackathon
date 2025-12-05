"""Knowledge Store Tool using ChromaDB for document storage and retrieval."""

import hashlib
import os
from typing import Optional
from datetime import datetime

from langchain_core.tools import tool

try:
    import chromadb
    from chromadb.config import Settings
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False

from app.config import CHROMA_PERSIST_DIR


# Initialize ChromaDB client
_chroma_client = None
_collection = None


def _get_collection():
    """Get or create the ChromaDB collection."""
    global _chroma_client, _collection
    
    if not CHROMADB_AVAILABLE:
        return None
    
    if _collection is None:
        _chroma_client = chromadb.Client(Settings(
            persist_directory=CHROMA_PERSIST_DIR,
            anonymized_telemetry=False,
        ))
        _collection = _chroma_client.get_or_create_collection(
            name="design_knowledge",
            metadata={"description": "Design guidelines, brand docs, and context"}
        )
    
    return _collection


# In-memory fallback when ChromaDB is not available
_memory_store: dict[str, dict] = {}


@tool
def store_knowledge(
    content: str,
    title: str,
    doc_type: str = "guideline",
    tags: Optional[str] = None,
) -> dict:
    """
    Store a document or piece of knowledge for the AI to reference.
    
    Use this to upload brand guidelines, UX documentation, feature specs,
    or any other text content that should inform design generation.
    
    Args:
        content: The full text content to store. This could be:
                - Brand guidelines and style rules
                - UX/UI documentation
                - Feature specifications
                - Domain knowledge articles
                - Design system documentation
        title: A descriptive title for this document.
        doc_type: Category of document. Options:
                 - "guideline": Brand or design guidelines
                 - "spec": Feature or product specifications
                 - "ux_doc": UX/UI documentation
                 - "reference": General reference material
        tags: Optional comma-separated tags for better retrieval.
             Example: "branding,colors,typography"
    
    Returns:
        dict with document ID and confirmation
    """
    # Generate document ID
    content_hash = hashlib.md5(content.encode()).hexdigest()[:8]
    doc_id = f"doc_{doc_type}_{content_hash}"
    
    # Prepare metadata
    metadata = {
        "title": title,
        "doc_type": doc_type,
        "tags": tags or "",
        "created_at": datetime.now().isoformat(),
        "content_length": len(content),
    }
    
    collection = _get_collection()
    
    if collection is not None:
        # Store in ChromaDB
        try:
            collection.upsert(
                ids=[doc_id],
                documents=[content],
                metadatas=[metadata],
            )
            return {
                "success": True,
                "doc_id": doc_id,
                "title": title,
                "doc_type": doc_type,
                "storage": "chromadb",
                "message": f"Document '{title}' stored successfully. Use retrieve_knowledge to search for it.",
            }
        except Exception as e:
            # Fall back to memory store
            pass
    
    # Fallback: store in memory
    _memory_store[doc_id] = {
        "content": content,
        "metadata": metadata,
    }
    
    return {
        "success": True,
        "doc_id": doc_id,
        "title": title,
        "doc_type": doc_type,
        "storage": "memory",
        "message": f"Document '{title}' stored in memory. Use retrieve_knowledge to search for it.",
    }


@tool
def retrieve_knowledge(
    query: str,
    doc_type: Optional[str] = None,
    max_results: int = 5,
) -> dict:
    """
    Search stored knowledge documents for relevant information.
    
    Use this to find brand guidelines, specs, or documentation that should
    inform the current design task.
    
    Args:
        query: Search query describing what information you need.
               Examples: "color guidelines", "button styles", "onboarding flow requirements"
        doc_type: Optional filter by document type (guideline, spec, ux_doc, reference)
        max_results: Maximum number of results to return (default: 5)
    
    Returns:
        dict with relevant document excerpts and their context
    """
    collection = _get_collection()
    
    if collection is not None and collection.count() > 0:
        try:
            # Build query filter
            where_filter = None
            if doc_type:
                where_filter = {"doc_type": doc_type}
            
            # Search ChromaDB
            results = collection.query(
                query_texts=[query],
                n_results=min(max_results, collection.count()),
                where=where_filter,
            )
            
            if results and results["documents"] and results["documents"][0]:
                return {
                    "success": True,
                    "query": query,
                    "results_count": len(results["documents"][0]),
                    "results": [
                        {
                            "doc_id": results["ids"][0][i],
                            "title": results["metadatas"][0][i].get("title", "Untitled"),
                            "doc_type": results["metadatas"][0][i].get("doc_type", "unknown"),
                            "content": results["documents"][0][i],
                            "relevance_score": 1 - (results["distances"][0][i] if results.get("distances") else 0),
                        }
                        for i in range(len(results["documents"][0]))
                    ],
                }
        except Exception:
            pass
    
    # Fallback: search memory store
    if not _memory_store:
        return {
            "success": True,
            "query": query,
            "results_count": 0,
            "results": [],
            "message": "No documents stored yet. Use store_knowledge to add documents.",
        }
    
    # Simple keyword matching for memory store
    query_lower = query.lower()
    matches = []
    
    for doc_id, doc in _memory_store.items():
        content = doc["content"].lower()
        metadata = doc["metadata"]
        
        # Filter by doc_type if specified
        if doc_type and metadata.get("doc_type") != doc_type:
            continue
        
        # Check for keyword matches
        score = sum(1 for word in query_lower.split() if word in content)
        if score > 0 or query_lower in content:
            matches.append({
                "doc_id": doc_id,
                "title": metadata.get("title", "Untitled"),
                "doc_type": metadata.get("doc_type", "unknown"),
                "content": doc["content"],
                "relevance_score": score,
            })
    
    # Sort by relevance
    matches.sort(key=lambda x: x["relevance_score"], reverse=True)
    matches = matches[:max_results]
    
    return {
        "success": True,
        "query": query,
        "results_count": len(matches),
        "results": matches,
    }


@tool
def list_knowledge_documents() -> dict:
    """
    List all stored knowledge documents.
    
    Returns:
        dict with list of all document titles and IDs
    """
    collection = _get_collection()
    documents = []
    
    if collection is not None and collection.count() > 0:
        try:
            all_docs = collection.get()
            for i, doc_id in enumerate(all_docs["ids"]):
                metadata = all_docs["metadatas"][i] if all_docs["metadatas"] else {}
                documents.append({
                    "doc_id": doc_id,
                    "title": metadata.get("title", "Untitled"),
                    "doc_type": metadata.get("doc_type", "unknown"),
                    "tags": metadata.get("tags", ""),
                    "created_at": metadata.get("created_at", ""),
                    "storage": "chromadb",
                })
        except Exception:
            pass
    
    # Add memory store documents
    for doc_id, doc in _memory_store.items():
        metadata = doc["metadata"]
        documents.append({
            "doc_id": doc_id,
            "title": metadata.get("title", "Untitled"),
            "doc_type": metadata.get("doc_type", "unknown"),
            "tags": metadata.get("tags", ""),
            "created_at": metadata.get("created_at", ""),
            "storage": "memory",
        })
    
    return {
        "count": len(documents),
        "documents": documents,
    }


@tool
def get_knowledge_document(doc_id: str) -> dict:
    """
    Retrieve a specific knowledge document by its ID.
    
    Args:
        doc_id: The document ID returned from store_knowledge or list_knowledge_documents
        
    Returns:
        dict with the full document content and metadata
    """
    collection = _get_collection()
    
    if collection is not None:
        try:
            result = collection.get(ids=[doc_id])
            if result and result["documents"] and result["documents"][0]:
                return {
                    "success": True,
                    "doc_id": doc_id,
                    "content": result["documents"][0],
                    "metadata": result["metadatas"][0] if result["metadatas"] else {},
                }
        except Exception:
            pass
    
    # Check memory store
    if doc_id in _memory_store:
        doc = _memory_store[doc_id]
        return {
            "success": True,
            "doc_id": doc_id,
            "content": doc["content"],
            "metadata": doc["metadata"],
        }
    
    return {
        "error": f"Document '{doc_id}' not found",
    }


@tool
def delete_knowledge_document(doc_id: str) -> dict:
    """
    Delete a knowledge document from storage.
    
    Args:
        doc_id: The document ID to delete
        
    Returns:
        dict confirming deletion or error
    """
    collection = _get_collection()
    
    deleted = False
    
    if collection is not None:
        try:
            collection.delete(ids=[doc_id])
            deleted = True
        except Exception:
            pass
    
    if doc_id in _memory_store:
        del _memory_store[doc_id]
        deleted = True
    
    if deleted:
        return {
            "success": True,
            "message": f"Document '{doc_id}' deleted successfully",
        }
    
    return {
        "error": f"Document '{doc_id}' not found",
    }

