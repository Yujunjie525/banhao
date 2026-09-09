using Hysj;
using UnityEditor;
using UnityEngine;
using UnityEngine.UI;

public static class HysjFormalUiSerializer
{
    private const string LoadPrefabPath = "Assets/Prefabs/HysjLoad.prefab";
    private const string MainPrefabPath = "Assets/Prefabs/HysjMain.prefab";
    private const string MessagePrefabPath = "Assets/Resources/HysjCommonMessage.prefab";

    [MenuItem("Hysj/Apply NewImage Formal UI")]
    public static void ApplyFormalUi()
    {
        if (EditorApplication.isPlayingOrWillChangePlaymode) return;

        ApplyLayoutPrefab(LoadPrefabPath, HysjFormalUiSkin.ApplyLogin);
        ApplyLayoutPrefab(MainPrefabPath, HysjFormalUiSkin.ApplyMain);
        ApplyMessagePrefab();
        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        SceneView.RepaintAll();
        Debug.Log("Applied serialized NewImage UI to HysjLoad, HysjMain and shared message UI.");
    }

    [MenuItem("Hysj/Apply All Serialized UI")]
    public static void ApplyAllSerializedUi()
    {
        if (EditorApplication.isPlayingOrWillChangePlaymode) return;
        ApplyFormalUi();
        Hysj.WishTownGameplayStaticUiBuilder.BuildAll();
        Debug.Log("Applied all serialized Hysj UI assets. The open editor will import the changes automatically.");
    }

    private static void ApplyLayoutPrefab(string path, System.Action<HysjEditorLayout> apply)
    {
        var root = PrefabUtility.LoadPrefabContents(path);
        try
        {
            var layout = root.GetComponent<HysjEditorLayout>();
            if (layout == null)
                throw new System.InvalidOperationException(path + " is missing HysjEditorLayout.");

            apply(layout);
            RemoveMissingScripts(root);
            EditorUtility.SetDirty(layout);
            PrefabUtility.SaveAsPrefabAsset(root, path);
        }
        finally
        {
            PrefabUtility.UnloadPrefabContents(root);
        }
    }

    private static void ApplyMessagePrefab()
    {
        var root = PrefabUtility.LoadPrefabContents(MessagePrefabPath);
        try
        {
            var messageUi = root.GetComponent<HysjMessageUi>();
            if (messageUi == null)
                throw new System.InvalidOperationException(MessagePrefabPath + " is missing HysjMessageUi.");

            messageUi.ApplyFormalMessagePrefabUi();
            RemoveMissingScripts(root);
            EditorUtility.SetDirty(messageUi);
            PrefabUtility.SaveAsPrefabAsset(root, MessagePrefabPath);
        }
        finally
        {
            PrefabUtility.UnloadPrefabContents(root);
        }
    }

    private static int RemoveMissingScripts(GameObject root)
    {
        if (root == null) return 0;

        var count = GameObjectUtility.GetMonoBehavioursWithMissingScriptCount(root);
        if (count > 0)
            GameObjectUtility.RemoveMonoBehavioursWithMissingScript(root);
        return count;
    }

    private static bool HasFormalBackground(string path, string screenName)
    {
        var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(path);
        if (prefab == null) return false;
        var root = string.IsNullOrEmpty(screenName) ? prefab.transform : FindDeep(prefab.transform, screenName);
        return root != null && root.Find("FormalBackground") != null;
    }

    private static bool HasFormalMainTown(string path)
    {
        var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(path);
        if (prefab == null) return false;
        var main = FindDeep(prefab.transform, "Main");
        if (main == null || main.Find("FormalTownBuildings") == null) return false;
        for (var i = 0; i < 5; i++)
        {
            var building = main.Find("FormalTownBuildings/TownBuilding_" + (char)('A' + i));
            if (building == null || building.Find("LockedMask") == null)
                return false;
        }
        return true;
    }

    private static bool HasFormalHealthNotice(string path)
    {
        var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(path);
        if (prefab == null) return false;
        var splash = FindDeep(prefab.transform, "Splash");
        return splash != null && splash.Find("FormalHealthNotice") != null;
    }

    private static bool HasFormalComposition(string path, string screenName, string compositionName)
    {
        var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(path);
        if (prefab == null) return false;
        var screen = FindDeep(prefab.transform, screenName);
        return screen != null && screen.Find(compositionName) != null;
    }

    private static bool HasEditableAgeTips(string path)
    {
        var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(path);
        if (prefab == null) return false;
        var panel = FindDeep(prefab.transform, "AgeTipsPanel");
        var composition = panel == null ? null : panel.Find("FormalAgeTipsComposition");
        if (panel == null || (composition != null && composition.gameObject.activeSelf))
            return false;

        var form = FindDeep(panel, "AgeTipsForm");
        var title = FindDeep(panel, "AgeTipsTitle");
        var body = FindDeep(panel, "AgeTipsText");
        var close = FindDeep(panel, "AgeTipsClose");
        return form != null && form.GetComponent<Image>() != null && form.gameObject.activeSelf
            && title != null && title.GetComponent<Text>() != null && title.gameObject.activeSelf
            && body != null && body.GetComponent<Text>() != null && body.gameObject.activeSelf
            && close != null && close.GetComponent<UnityEngine.UI.Button>() != null && close.gameObject.activeSelf;
    }

    private static bool HasEditableLoginInputs(string path)
    {
        var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(path);
        if (prefab == null) return false;
        var username = FindDeep(prefab.transform, "Username")?.GetComponent<InputField>();
        var password = FindDeep(prefab.transform, "Password")?.GetComponent<InputField>();
        return HasEditableInput(username) && HasEditableInput(password);
    }

    private static bool HasEditableInput(InputField input)
    {
        return input != null
            && input.transform.Find("EditableFieldCover") != null
            && input.placeholder != null
            && input.placeholder.gameObject.activeSelf;
    }

    private static bool HasMessageComposition()
    {
        var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(MessagePrefabPath);
        return prefab != null && FindDeep(prefab.transform, "FormalAntiAddictionComposition") != null;
    }

    private static Transform FindDeep(Transform root, string name)
    {
        if (root == null) return null;
        if (root.name == name) return root;
        for (var i = 0; i < root.childCount; i++)
        {
            var found = FindDeep(root.GetChild(i), name);
            if (found != null) return found;
        }
        return null;
    }
}
