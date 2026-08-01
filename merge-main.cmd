@echo off
setlocal
set SRC_BRANCH=%~1
if "%SRC_BRANCH%"=="" set SRC_BRANCH=docs

git checkout main || goto :fail
git merge --no-commit --no-ff %SRC_BRANCH%

REM Check if ANY conflicts remain (docs or code)
git diff --name-only --diff-filter=U --quiet
if errorlevel 1 goto :conflicts

REM No conflicts - keep docs off main: remove the whole docs tree, then commit
git rm -rf -q docs 2>nul
git add -A
git commit -q --no-edit
echo.
echo Merge complete. Docs stayed on %SRC_BRANCH%.
goto :eof

:conflicts
echo.
echo CONFLICTS remain. Docs conflicts can be resolved with: git rm -r docs
echo Fix code conflicts manually, then run: git commit
git status --short
goto :eof

:fail
echo FAILED
exit /b 1
