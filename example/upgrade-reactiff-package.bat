@echo off
set /p pkg="Enter @reactiff package name to upgrade: @reactiff/"
@echo on

echo ""
echo (1 of 3) - REMOVING "@reactiff/%pkg%"
call yarn remove "@reactiff/%pkg%"

echo ""
echo (2 of 3) - INSTALLING "@reactiff/%pkg%"
call yarn add "@reactiff/%pkg%" --force

echo ""
echo (3 of 3) - RE-BUILDING... (Almost there!)
call yarn rebuild

echo ""
echo Done!
