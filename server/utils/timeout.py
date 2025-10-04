import concurrent.futures
import functools
import logging
from typing import Any, Callable, Optional, TypeVar
from config import settings

logger = logging.getLogger(__name__)

T = TypeVar('T')

class TimeoutManager:
    """Manage timeouts for long-running operations"""
    
    @staticmethod
    def run_with_timeout(
        func: Callable[..., T], 
        *args, 
        timeout: Optional[int] = None,
        default_return: Any = None,
        **kwargs
    ) -> Optional[T]:
        """Run function with timeout using ThreadPoolExecutor"""
        if timeout is None:
            timeout = settings.DEFAULT_TIMEOUT
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(func, *args, **kwargs)
            try:
                result = future.result(timeout=timeout)
                logger.info(f"Function {func.__name__} completed successfully in {timeout}s")
                return result
            except concurrent.futures.TimeoutError:
                logger.warning(f"Function {func.__name__} timed out after {timeout}s")
                return default_return
            except Exception as e:
                logger.error(f"Function {func.__name__} raised exception: {e}")
                return default_return
    
    @staticmethod
    def timeout_decorator(timeout: Optional[int] = None, default_return: Any = None):
        """Decorator to add timeout to any function"""
        def decorator(func: Callable[..., T]) -> Callable[..., Optional[T]]:
            @functools.wraps(func)
            def wrapper(*args, **kwargs) -> Optional[T]:
                return TimeoutManager.run_with_timeout(
                    func, *args, timeout=timeout, default_return=default_return, **kwargs
                )
            return wrapper
        return decorator
    
    @staticmethod
    def run_llm_with_timeout(func: Callable[..., T], *args, **kwargs) -> Optional[T]:
        """Run LLM function with appropriate timeout"""
        return TimeoutManager.run_with_timeout(
            func, *args, timeout=settings.LLM_TIMEOUT, **kwargs
        )
    
    @staticmethod
    def run_ocr_with_timeout(func: Callable[..., T], *args, **kwargs) -> Optional[T]:
        """Run OCR function with appropriate timeout"""
        return TimeoutManager.run_with_timeout(
            func, *args, timeout=settings.OCR_TIMEOUT, **kwargs
        )

# Create global instance
timeout_manager = TimeoutManager()

# Convenience functions
def safe_run_with_timeout(func: Callable[..., T], *args, timeout: int = 20) -> Optional[T]:
    """Legacy compatibility function"""
    return timeout_manager.run_with_timeout(func, *args, timeout=timeout)

def llm_timeout(default_return: Any = None):
    """Decorator for LLM functions"""
    return TimeoutManager.timeout_decorator(
        timeout=settings.LLM_TIMEOUT, 
        default_return=default_return
    )

def ocr_timeout(default_return: Any = None):
    """Decorator for OCR functions"""
    return TimeoutManager.timeout_decorator(
        timeout=settings.OCR_TIMEOUT, 
        default_return=default_return
    )
