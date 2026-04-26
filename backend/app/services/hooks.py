# ============================================================
# * PrimeSetu - Shoper9-Based Retail OS
# * Document : backend/app/services/hooks.py
# * Pattern  : Shoper 9 Extension Framework (Levels 1-4)
# ============================================================ #

from typing import Any, Dict, List, Optional, Callable
from fastapi import HTTPException
from pydantic import BaseModel

class HookResponse(BaseModel):
    status: int  # 10: Continue, 20: Recall, 30: Stop
    message: Optional[str] = None
    modified_data: Optional[Dict[str, Any]] = None

class HookEngine:
    """
    Sovereign Hook Engine - Emulates Shoper 9's Extension Framework.
    Allows for Pre-update and Post-update interceptions.
    """
    
    _hooks: Dict[int, List[Callable]] = {1: [], 2: [], 3: [], 4: []}

    @classmethod
    def register(cls, level: int, func: Callable):
        """Register a new hook/extension at a specific level."""
        if level in cls._hooks:
            cls._hooks[level].append(func)

    @classmethod
    async def execute(cls, level: int, data: Any) -> Any:
        """
        Executes all registered hooks for a specific level.
        Follows the Shoper 9 logic: if any hook returns 30 (Stop), we abort.
        """
        current_data = data
        for hook in cls._hooks[level]:
            response: HookResponse = await hook(current_data)
            
            if response.status == 30:
                raise HTTPException(
                    status_code=400, 
                    detail=f"[PrimeSetu Extension Level {level}] Stop: {response.message}"
                )
            
            if response.modified_data:
                # Update data for next hook in chain
                if hasattr(current_data, "dict"): # Pydantic v1/v2
                    # Create a new version of the model with updated fields
                    update_data = current_data.model_dump() if hasattr(current_data, "model_dump") else current_data.dict()
                    update_data.update(response.modified_data)
                    current_data = type(current_data)(**update_data)
                elif isinstance(current_data, dict):
                    current_data.update(response.modified_data)
                elif hasattr(current_data, "__dict__"):
                    for key, value in response.modified_data.items():
                        setattr(current_data, key, value)
        
        return current_data

# ── DEFAULT SYSTEM HOOKS (Parity with Shoper 9) ───────────────────────────────

async def validate_gst_compliance(data: Any) -> HookResponse:
    """Example Level 3 Hook: Ensure GST is never zero for taxable items."""
    # Logic: if total_tax == 0 and taxable_amount > 0, check why.
    return HookResponse(status=10)

async def check_negative_stock(data: Any) -> HookResponse:
    """Example Level 2 Hook: Stop transaction if stock goes below zero."""
    # This would be configurable in GenLookUp
    return HookResponse(status=10)

# Registration
# HookEngine.register(2, check_negative_stock)
# HookEngine.register(3, validate_gst_compliance)
