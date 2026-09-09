using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;

public static class HysjAndroidBuild
{
    private const string ProductName = "心愿小镇";
    private const string DefaultOutputPath = "Builds/Android/心愿小镇.apk";

    private static readonly string[] IconPaths =
    {
        "Assets/Branding/GardenNotesIcon/192x192.png",
        "Assets/Branding/GardenNotesIcon/144x144.png",
        "Assets/Branding/GardenNotesIcon/96x96.png",
        "Assets/Branding/GardenNotesIcon/72x72.png",
        "Assets/Branding/GardenNotesIcon/48x48.png"
    };

    public static void BuildAndroid()
    {
        PlayerSettings.productName = ProductName;
        ConfigureAndroidBranding();

        var scenes = EditorBuildSettings.scenes
            .Where(scene => scene.enabled && !string.IsNullOrEmpty(scene.path))
            .Select(scene => scene.path)
            .ToArray();
        if (scenes.Length == 0)
            throw new InvalidOperationException("No enabled scenes are configured for the Android build.");

        var outputPath = GetArgument("-buildOutput") ?? DefaultOutputPath;
        if (!Path.IsPathRooted(outputPath))
            outputPath = Path.GetFullPath(outputPath);
        var outputDirectory = Path.GetDirectoryName(outputPath);
        if (!string.IsNullOrEmpty(outputDirectory))
            Directory.CreateDirectory(outputDirectory);

        Debug.Log("Building Android APK: " + outputPath);
        Debug.Log("Scenes: " + string.Join(", ", scenes));
        var report = BuildPipeline.BuildPlayer(scenes, outputPath, BuildTarget.Android, BuildOptions.None);
        if (report.summary.result != BuildResult.Succeeded)
            throw new BuildFailedException("Android build failed: " + report.summary.result);

        Debug.Log("Android APK created: " + report.summary.outputPath + " (" + report.summary.totalSize + " bytes)");
    }

    private static void ConfigureAndroidBranding()
    {
        var icons = IconPaths
            .Select(path => AssetDatabase.LoadAssetAtPath<Texture2D>(path))
            .ToArray();
        if (icons.Any(icon => icon == null))
            throw new InvalidOperationException("One or more Android icon assets could not be loaded from Assets/Branding/GardenNotesIcon.");

        PlayerSettings.SetIconsForTargetGroup(BuildTargetGroup.Android, icons);
        PlayerSettings.SetIconsForTargetGroup(BuildTargetGroup.Android, icons, IconKind.Application);
        AssetDatabase.SaveAssets();
    }

    private static string GetArgument(string name)
    {
        var args = Environment.GetCommandLineArgs();
        for (var i = 0; i < args.Length - 1; i++)
        {
            if (string.Equals(args[i], name, StringComparison.OrdinalIgnoreCase))
                return args[i + 1];
        }
        return null;
    }
}
