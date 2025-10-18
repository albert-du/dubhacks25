import logging
import sys


def configure_logging(level: int = logging.INFO) -> None:
    """Configure root logging for the application.

    Sets a concise format and aligns Flask/Werkzeug logs with the app logger.
    """
    formatter = logging.Formatter(
        fmt="[%(levelname)s] %(asctime)s %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )

    handler = logging.StreamHandler(stream=sys.stdout)
    handler.setFormatter(formatter)
    handler.setLevel(level)

    root = logging.getLogger()
    # Avoid duplicate handlers if called multiple times
    if not any(isinstance(h, logging.StreamHandler) for h in root.handlers):
        root.addHandler(handler)
    root.setLevel(level)

    # Align Flask's werkzeug logger
    logging.getLogger("werkzeug").setLevel(level)
