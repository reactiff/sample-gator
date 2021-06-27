@echo off
set /p pkg="Enter ackage name to upgrade (include=ing scope): "
@echo on

echo
echo (1 of 3) - REMOVING "%pkg%"
echo
call yarn remove "%pkg%"

echo
echo (2 of 3) - INSTALLING "%pkg%"
echo
call yarn add "%pkg%" -D --force

echo
echo (3 of 3) - RE-BUILDING... (Almost there!)
echo
call yarn rebuild

echo
echo Done!
