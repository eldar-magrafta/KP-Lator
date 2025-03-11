@echo off
cls
echo.
echo =======================================
echo Building and Running KP-Lator Application
echo =======================================
echo.

echo Step 1: Cleaning and packaging with Maven...
call mvn clean package

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Maven build failed! Exiting...
    exit /b %ERRORLEVEL%
)

echo.
echo Step 2: Starting the application...
echo.
echo 8 8888     ,88' 8 888888888o   8 8888                  .8.    8888888 8888888888 ,o888888o.     8 888888888o.   
echo 8 8888    ,88'  8 8888    `88. 8 8888                 .888.         8 8888    . 8888     `88.   8 8888    `88.  
echo 8 8888   ,88'   8 8888     `88 8 8888                :88888.        8 8888   ,8 8888       `8b  8 8888     `88  
echo 8 8888  ,88'    8 8888     ,88 8 8888               . `88888.       8 8888   88 8888        `8b 8 8888     ,88  
echo 8 8888 ,88'     8 8888.   ,88' 8 8888              .8. `88888.      8 8888   88 8888         88 8 8888.   ,88'  
echo 8 8888 88'      8 888888888P'  8 8888             .8`8. `88888.     8 8888   88 8888         88 8 888888888P'   
echo 8 8888888       8 8888         8 8888            .8' `8. `88888.    8 8888   88 8888        ,8P 8 8888`8b       
echo 8 8888 `Y8.     8 8888         8 8888           .8'   `8. `88888.   8 8888   `8 8888       ,8P  8 8888 `8b.     
echo 8 8888   `Y8.   8 8888         8 8888          .888888888. `88888.  8 8888    ` 8888     ,88'   8 8888   `8b.   
echo 8 8888     `Y8. 8 8888         8 888888888888 .8'       `8. `88888. 8 8888       `8888888P'     8 8888     `88. 

echo Please visit http://localhost:8080 in your browser
echo Press Ctrl+C to stop the application
echo.

java -jar target\kp-lator-0.0.1-SNAPSHOT.jar --logging.level.root=ERROR --spring.main.banner-mode=off
                                                                                                             
echo.
echo Application stopped.