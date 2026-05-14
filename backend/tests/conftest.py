"""CI conftest: stubs heavy ML deps and sets SQLite DATABASE_URL."""
import os
import sys
import tempfile
from types import ModuleType
from unittest.mock import MagicMock

# --- SQLite test database ---
_TEST_DB_FILE = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
_TEST_DB_FILE.close()
os.environ.setdefault("DATABASE_URL", f"sqlite:///{_TEST_DB_FILE.name}")
os.environ.setdefault("JWT_SECRET", "ci-test-secret")
os.environ.setdefault("ENVIRONMENT", "test")

# --- Stub torch and transformers so imports don’t fail in CI ---
for _mod_name in [
    "torch",
    "torch.nn",
    "torch.optim",
    "transformers",
    "transformers.pipelines",
    "transformers.models",
]:
    if _mod_name not in sys.modules:
        _stub = ModuleType(_mod_name)
        _stub.__spec__ = None  # type: ignore[attr-defined]
        sys.modules[_mod_name] = _stub

# Make torch.Tensor, torch.load etc accessible as MagicMock attributes
sys.modules["torch"].Tensor = MagicMock()  # type: ignore[attr-defined]
sys.modules["torch"].load = MagicMock()    # type: ignore[attr-defined]
sys.modules["torch"].save = MagicMock()    # type: ignore[attr-defined]
sys.modules["transformers"].pipeline = MagicMock()  # type: ignore[attr-defined]
sys.modules["transformers"].AutoTokenizer = MagicMock()  # type: ignore[attr-defined]
sys.modules["transformers"].AutoModelForSequenceClassification = MagicMock()  # type: ignore[attr-defined]
