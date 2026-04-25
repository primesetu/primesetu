#!/bin/bash
# ============================================================
# PrimeSetu — Repo Structure Fix Script
# Run from the root of your cloned repo:
#   git clone https://github.com/primesetu/primesetu
#   cd primesetu
#   bash fix_repo_structure.sh
# ============================================================

set -e  # stop on any error

echo "🔧 Step 1: Moving root-level backend files into backend/app/"
mkdir -p backend/app
mkdir -p backend/scripts

# Core app files → backend/app/
for f in main.py models.py schemas.py database.py tally_integration.py; do
  if [ -f "$f" ]; then
    git mv "$f" "backend/app/$f"
    echo "  moved $f → backend/app/$f"
  fi
done

# Dev/ops scripts → backend/scripts/
for f in check_db.py check_db2.py check_db3.py check_user_metadata.py \
          create_admin_final.py fix_registry.py bootstrap_admin.py \
          seed_db.py setup_db.py update_role.py show_menus.py; do
  if [ -f "$f" ]; then
    git mv "$f" "backend/scripts/$f"
    echo "  moved $f → backend/scripts/$f"
  fi
done

echo ""
echo "🔧 Step 2: Moving Shoper9 reference material into docs/reference/"
mkdir -p docs/reference

if [ -f "ShoperPOS.chm" ]; then
  git mv ShoperPOS.chm docs/reference/ShoperPOS.chm
  echo "  moved ShoperPOS.chm → docs/reference/"
fi

if [ -f "shoper-19Aug19.pdf" ]; then
  git mv shoper-19Aug19.pdf docs/reference/shoper-19Aug19.pdf
  echo "  moved shoper-19Aug19.pdf → docs/reference/"
fi

if [ -d "Shoper9" ]; then
  git mv Shoper9 docs/reference/Shoper9
  echo "  moved Shoper9/ → docs/reference/Shoper9/"
fi

if [ -f "primesetu-shoper9-ui.html" ]; then
  git mv primesetu-shoper9-ui.html docs/reference/primesetu-shoper9-ui.html
  echo "  moved primesetu-shoper9-ui.html → docs/reference/"
fi

echo ""
echo "🗑️  Step 3: Removing temp folders and junk files"

for d in temp_chm temp_extract_792 temp_extract_900 temp_extract_902 temp_extract_903 temp_extract_904; do
  if [ -d "$d" ]; then
    git rm -rf "$d"
    echo "  deleted $d/"
  fi
done

if [ -f "skills-lock.json" ]; then
  git rm skills-lock.json
  echo "  deleted skills-lock.json"
fi

echo ""
echo "🔧 Step 4: Adding __init__.py to make backend/app a proper Python package"
touch backend/app/__init__.py
git add backend/app/__init__.py

echo ""
echo "🔧 Step 5: Updating Procfile to point to new app location"
if [ -f "Procfile" ]; then
  # Update uvicorn path from main:app → backend.app.main:app
  sed -i 's|uvicorn main:app|uvicorn backend.app.main:app|g' Procfile
  git add Procfile
  echo "  updated Procfile"
fi

echo ""
echo "🔧 Step 6: Updating render.yaml startCommand if needed"
if [ -f "render.yaml" ]; then
  sed -i 's|uvicorn main:app|uvicorn backend.app.main:app|g' render.yaml
  git add render.yaml
  echo "  updated render.yaml"
fi

echo ""
echo "✅ All moves done. Committing..."
git commit -m "refactor: clean repo structure

- Move backend core files (main.py, models.py, schemas.py, database.py,
  tally_integration.py) into backend/app/
- Move dev scripts (check_db, seed_db, setup_db, etc.) into backend/scripts/
- Move Shoper9 reference material into docs/reference/
- Delete temp_chm, temp_extract_* folders (dev artifacts)
- Delete skills-lock.json
- Add backend/app/__init__.py
- Update Procfile and render.yaml import paths"

echo ""
echo "🚀 Done! Push with: git push origin main"
echo ""
echo "⚠️  IMPORTANT: After this, update any import in backend/app files:"
echo "   from database import ... → from backend.app.database import ..."
echo "   OR run uvicorn from inside the backend/ dir and keep imports relative."
echo "   Recommended: run uvicorn from /backend and use: uvicorn app.main:app"
