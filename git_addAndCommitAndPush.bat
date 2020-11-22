git add --all

@echo off

set /p commitInput="what is the commit?"
git commit -m "%commitInput%"

git push origin main