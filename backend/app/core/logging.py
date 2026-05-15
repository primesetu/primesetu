import logging
import structlog
import sys
from asgi_correlation_id.context import correlation_id
from app.core.config import settings

def _mask_pii(logger, log_method, event_dict):
    """
    Governance Note: Structured logging must NEVER expose sensitive fields.
    This masks JWT tokens, PINs, Authorization headers, and payment secrets.
    """
    sensitive_keys = {
        "jwt", "token", "password", "pin", "authorization",
        "secret", "payment", "card", "cvv", "api_key"
    }

    for key, value in event_dict.items():
        if any(sensitive in key.lower() for sensitive in sensitive_keys):
            if isinstance(value, str):
                event_dict[key] = "***MASKED***"
            elif isinstance(value, dict):
                event_dict[key] = "***MASKED_DICT***"

    # Also check if it's nested (simple one level)
    for key, value in event_dict.items():
        if isinstance(value, dict):
            for sub_key in list(value.keys()):
                if any(sensitive in sub_key.lower() for sensitive in sensitive_keys):
                    value[sub_key] = "***MASKED***"

    return event_dict

def _add_correlation_id(logger, log_method, event_dict):
    """Injects the request correlation_id from asgi_correlation_id."""
    req_id = correlation_id.get()
    if req_id:
        event_dict["request_id"] = req_id
    return event_dict

def configure_logging():
    # Base logging configuration
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.INFO if settings.environment == "production" else logging.DEBUG,
    )

    processors = [
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        _add_correlation_id,
        _mask_pii,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    if settings.environment == "production":
        processors.append(structlog.processors.JSONRenderer())
    else:
        processors.append(structlog.dev.ConsoleRenderer(colors=True))

    structlog.configure(
        processors=processors,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Bind node identity unconditionally at the root
    log = structlog.get_logger()
    log = log.bind(node_id=settings.node_id)
    return log

# Create a singleton logger to be used across the app
logger = configure_logging()
