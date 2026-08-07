"""Local dev launcher. Sets the Windows event loop policy before uvicorn creates its loop.

uvicorn's `Server.run()` calls `asyncio.run()` before importing the app module,
so setting the policy inside main.py happens too late on Windows. Run this
instead of `uvicorn main:app ...` directly during local development.
"""
import os
import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", "3224"))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
