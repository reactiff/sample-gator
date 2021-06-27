@echo off
set /p pkg="Enter ackage name to upgrade (including scope): "
@echo on

echo ""
echo (1 of 3) - REMOVING "%pkg%"
call yarn remove "%pkg%"

echo ""
echo (2 of 3) - INSTALLING "%pkg%"
call yarn add "%pkg%" --force

echo ""
echo (3 of 3) - RE-BUILDING... (Almost there!)
call yarn rebuild

echo ""
echo Done!
