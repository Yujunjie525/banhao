@echo off
setlocal
set "JAVA_HOME=E:\Xs\development_environment\jdk8"
set "ANDROID_HOME=E:\Xs\development_environment\android-sdk"
set "ANDROID_SDK_ROOT=E:\Xs\development_environment\android-sdk"
set "NDK_ROOT=E:\Xs\development_environment\android-ndk-r19c"
set "PATH=%JAVA_HOME%\bin;%PATH%"

if not exist "%JAVA_HOME%\bin\java.exe" (
  echo JDK not found: %JAVA_HOME%\bin\java.exe
  pause
  exit /b 1
)

echo JAVA_HOME=%JAVA_HOME%
"%JAVA_HOME%\bin\java.exe" -version
start "Cocos Creator 2.4.6" "E:\Xs\Cocos_Editor\Creator\2.4.6\CocosCreator.exe" --path "E:\Xs\Cocos Project\Game\Game"
endlocal
