import re
import math
from typing import Optional
from datetime import datetime, timezone
from config import settings

class TextHelpers:
    """Helper functions for text processing"""
    
    @staticmethod
    def truncate_text(text: str, max_length: Optional[int] = None) -> str:
        """Truncate text to specified length"""
        if max_length is None:
            max_length = settings.MAX_TEXT_LENGTH
        
        if len(text) <= max_length:
            return text
        
        return text[:max_length] + "..."
    
    @staticmethod
    def truncate_for_llm(text: str) -> str:
        """Truncate text for LLM processing"""
        return TextHelpers.truncate_text(text, settings.LLM_TEXT_LIMIT)
    
    @staticmethod
    def clean_text(text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ""
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters that might cause issues
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
        
        return text.strip()
    
    @staticmethod
    def extract_keywords(text: str, max_keywords: int = 10) -> list[str]:
        """Extract potential keywords from text"""
        if not text:
            return []
        
        # Simple keyword extraction (you could use more sophisticated NLP here)
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        
        # Remove common stop words
        stop_words = {
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
            'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
            'those', 'was', 'were', 'been', 'have', 'has', 'had', 'will', 'would',
            'could', 'should', 'may', 'might', 'must', 'can', 'shall'
        }
        
        keywords = [word for word in words if word not in stop_words]
        
        # Count frequency and return most common
        from collections import Counter
        word_counts = Counter(keywords)
        return [word for word, _ in word_counts.most_common(max_keywords)]
    
    @staticmethod
    def get_text_stats(text: str) -> dict:
        """Get basic text statistics"""
        if not text:
            return {
                'length': 0,
                'words': 0,
                'lines': 0,
                'sentences': 0
            }
        
        return {
            'length': len(text),
            'words': len(text.split()),
            'lines': len(text.splitlines()),
            'sentences': len(re.split(r'[.!?]+', text))
        }

class ConfidenceHelpers:
    """Helper functions for confidence score processing"""
    
    @staticmethod
    def format_confidence(confidence: float, decimal_places: int = 2) -> str:
        """Format confidence score as string"""
        return f"{confidence:.{decimal_places}f}"
    
    @staticmethod
    def confidence_to_percentage(confidence: float) -> str:
        """Convert confidence to percentage string"""
        return f"{confidence * 100:.1f}%"
    
    @staticmethod
    def get_confidence_level(confidence: float) -> str:
        """Get confidence level description"""
        if confidence >= 0.9:
            return "Very High"
        elif confidence >= 0.75:
            return "High"
        elif confidence >= 0.6:
            return "Medium"
        elif confidence >= 0.4:
            return "Low"
        else:
            return "Very Low"
    
    @staticmethod
    def is_high_confidence(confidence: float, threshold: float = 0.8) -> bool:
        """Check if confidence is above threshold"""
        return confidence >= threshold
    
    @staticmethod
    def calculate_weighted_confidence(scores: list[tuple[float, float]]) -> float:
        """Calculate weighted average confidence from multiple scores
        
        Args:
            scores: List of (confidence, weight) tuples
        
        Returns:
            Weighted average confidence
        """
        if not scores:
            return 0.0
        
        total_weighted = sum(conf * weight for conf, weight in scores)
        total_weight = sum(weight for _, weight in scores)
        
        return total_weighted / total_weight if total_weight > 0 else 0.0

class DateHelpers:
    """Helper functions for date/time processing"""
    
    @staticmethod
    def utc_now() -> datetime:
        """Get current UTC datetime"""
        return datetime.now(timezone.utc)
    
    @staticmethod
    def format_datetime(dt: datetime, format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
        """Format datetime to string"""
        return dt.strftime(format_str)
    
    @staticmethod
    def time_ago(dt: datetime) -> str:
        """Get human-readable time ago string"""
        now = DateHelpers.utc_now()
        
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        
        diff = now - dt
        seconds = diff.total_seconds()
        
        if seconds < 60:
            return "just now"
        elif seconds < 3600:
            minutes = int(seconds / 60)
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        elif seconds < 86400:
            hours = int(seconds / 3600)
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        else:
            days = int(seconds / 86400)
            return f"{days} day{'s' if days != 1 else ''} ago"

class PaginationHelpers:
    """Helper functions for pagination"""
    
    @staticmethod
    def calculate_pagination(total: int, page: int, per_page: int) -> dict:
        """Calculate pagination metadata"""
        total_pages = math.ceil(total / per_page) if per_page > 0 else 0
        
        return {
            'total': total,
            'page': max(1, page),
            'per_page': per_page,
            'total_pages': max(1, total_pages),
            'has_prev': page > 1,
            'has_next': page < total_pages,
            'prev_page': page - 1 if page > 1 else None,
            'next_page': page + 1 if page < total_pages else None
        }
    
    @staticmethod
    def get_offset(page: int, per_page: int) -> int:
        """Calculate offset for database query"""
        return (max(1, page) - 1) * per_page

# Create global instances
text_helpers = TextHelpers()
confidence_helpers = ConfidenceHelpers()
date_helpers = DateHelpers()
pagination_helpers = PaginationHelpers()
