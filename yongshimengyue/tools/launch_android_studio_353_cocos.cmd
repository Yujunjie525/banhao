@echo off
setlocal

set "JAVA_HOME=E:\Xs\development_environment\jdk8"
set "ANDROID_HOME=E:\Xs\development_environment\android-sdk"
set "ANDROID_SDK_ROOT=E:\Xs\development_environment\android-sdk"
set "ANDROID_NDK_HOME=E:\Xs\development_environment\android-ndk-r19c"
set "NDK_ROOT=E:\Xs\development_environment\android-ndk-r19c"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"

start "Android Studio 3.5.3 - Cocos" "E:\Xs\development_environment\android-studio-3.5.3\bin\studio64.exe" "E:\Xs\Build\jsb-link\frameworks\runtime-src\proj.android-studio"

