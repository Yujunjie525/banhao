using System.Collections.Generic;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace Hysj.Editor
{
    public static class HysjEditorUiBuilder
    {
        private const string ScenePath = "Assets/Scenes/HysjMain.unity";
        private const string PrefabPath = "Assets/Prefabs/HysjMain.prefab";
        private const string LoadScenePath = "Assets/Scenes/HysjLoad.unity";
        private const string GameplayScenePath = "Assets/Scenes/GardenGameplay.unity";
        private const string LoadPrefabPath = "Assets/Prefabs/HysjLoad.prefab";
        private const string GameplayPrefabPath = "Assets/Prefabs/GardenGameplay.prefab";
        private const string CommonMessagePrefabPath = "Assets/Resources/HysjCommonMessage.prefab";
        private const int GameplayBoardVersion = 9;
        private const int FormalImageVersion = 8;
        private static readonly Vector2 GardenRepairGridSize = new Vector2(580, 924);
        private static readonly Vector2 GardenRepairGridPosition = new Vector2(0, -49f);
        private static readonly Vector2 GardenRepairCellSize = new Vector2(139, 155);
        private static readonly Vector2 GardenRepairGridSpacing = new Vector2(-13, -23);
        // The art folders are numeric; map the closest silhouettes to the planner's six seed slots.
        private static readonly string[] SeedArtFolders = { "1", "6", "8", "4", "9", "5" };
        private static Font _font;

        [InitializeOnLoadMethod]
        private static void SplitLegacySceneWhenMissing()
        {
            EditorApplication.delayCall += () =>
            {
                if (EditorApplication.isPlayingOrWillChangePlaymode || !System.IO.File.Exists(PrefabPath)) return;
                if (System.IO.File.Exists(LoadScenePath) && System.IO.File.Exists(GameplayScenePath) && System.IO.File.Exists(LoadPrefabPath) && System.IO.File.Exists(GameplayPrefabPath)) return;
                SplitIntoThreeScenes();
            };
        }

        [InitializeOnLoadMethod]
        private static void UpgradeGardenRepairUiWhenMissing()
        {
            EditorApplication.delayCall += () =>
            {
                if (EditorApplication.isPlayingOrWillChangePlaymode || !System.IO.File.Exists(GameplayPrefabPath)) return;
                var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(GameplayPrefabPath);
                var layout = prefab == null ? null : prefab.GetComponent<HysjEditorLayout>();
                if (layout == null || layout.gardenRuntime == null) return;
                if (layout.gardenRepairSuccessPopup != null && layout.gardenRepairFailPopup != null) return;
                UpgradeGardenRepairUi();
            };
        }

        public static void CreateSharedMessageUi()
        {
            EnsureDirectories();
            var source = PrefabUtility.LoadPrefabContents(PrefabPath);
            try
            {
                var sourceLayout = source.GetComponent<HysjEditorLayout>();
                if (sourceLayout != null && sourceLayout.tips != null && sourceLayout.tipsWnd != null)
                {
                    var root = new GameObject("HysjCommonMessage", typeof(HysjMessageUi));
                    try
                    {
                        var canvas = CreateCanvas(root.transform);
                        canvas.sortingOrder = 1000;
                        var tips = Object.Instantiate(sourceLayout.tips, canvas.transform);
                        var tipsWnd = Object.Instantiate(sourceLayout.tipsWnd, canvas.transform);
                        tips.name = "Tips";
                        tipsWnd.name = "TipsWnd";
                        tips.SetActive(false);
                        tipsWnd.SetActive(false);

                        var message = root.GetComponent<HysjMessageUi>();
                        message.tips = tips;
                        message.tipsLabel = FindDeep(tips.transform, "TipsLabel")?.GetComponent<Text>();
                        message.tipsWnd = tipsWnd;
                        message.tipsWndLabel = FindDeep(tipsWnd.transform, "TipsWndLabel")?.GetComponent<Text>();
                        message.tipsWndConfirm = FindDeep(tipsWnd.transform, "Confirm")?.GetComponent<Button>();
                        if (message.tipsLabel == null || message.tipsWndLabel == null || message.tipsWndConfirm == null)
                            throw new System.InvalidOperationException("The shared message prefab could not bind its required child nodes.");
                        PrefabUtility.SaveAsPrefabAsset(root, CommonMessagePrefabPath);
                    }
                    finally
                    {
                        Object.DestroyImmediate(root);
                    }
                }
                else if (AssetDatabase.LoadAssetAtPath<GameObject>(CommonMessagePrefabPath) == null)
                    throw new System.InvalidOperationException("No source Tips/TipsWnd nodes or existing HysjCommonMessage prefab were found.");
            }
            finally
            {
                PrefabUtility.UnloadPrefabContents(source);
            }

            StripMessageNodes(LoadPrefabPath);
            StripMessageNodes(PrefabPath);
            StripMessageNodes(GameplayPrefabPath);
            CreateSceneFromPrefab(LoadPrefabPath, LoadScenePath);
            CreateSceneFromPrefab(PrefabPath, ScenePath);
            CreateSceneFromPrefab(GameplayPrefabPath, GameplayScenePath);
            SetBuildScenes();
            AssetDatabase.SaveAssets();
            Debug.Log("Created one persistent HysjCommonMessage prefab and removed scene-local Tips/TipsWnd nodes.");
        }

        private static void StripMessageNodes(string prefabPath)
        {
            var root = PrefabUtility.LoadPrefabContents(prefabPath);
            try
            {
                var layout = root.GetComponent<HysjEditorLayout>();
                var canvas = root.GetComponentInChildren<Canvas>(true);
                if (canvas == null) throw new System.InvalidOperationException(prefabPath + " is missing its canvas.");
                var tips = canvas.transform.Find("Tips");
                var tipsWnd = canvas.transform.Find("TipsWnd");
                if (tips != null) Object.DestroyImmediate(tips.gameObject);
                if (tipsWnd != null) Object.DestroyImmediate(tipsWnd.gameObject);
                if (layout != null)
                {
                    layout.tips = null;
                    layout.tipsLabel = null;
                    layout.tipsWnd = null;
                    layout.tipsWndLabel = null;
                    layout.tipsWndConfirm = null;
                    EditorUtility.SetDirty(layout);
                }
                PrefabUtility.SaveAsPrefabAsset(root, prefabPath);
            }
            finally
            {
                PrefabUtility.UnloadPrefabContents(root);
            }
        }

        private static Transform FindDeep(Transform parent, string nodeName)
        {
            if (parent == null) return null;
            if (parent.name == nodeName) return parent;
            for (var i = 0; i < parent.childCount; i++)
            {
                var found = FindDeep(parent.GetChild(i), nodeName);
                if (found != null) return found;
            }
            return null;
        }

        public static void SplitIntoThreeScenes()
        {
            if (EditorApplication.isPlayingOrWillChangePlaymode)
            {
                Debug.LogError("Exit Play Mode before splitting the Hysj scenes.");
                return;
            }

            var source = AssetDatabase.LoadAssetAtPath<GameObject>(PrefabPath);
            var sourceLayout = source == null ? null : source.GetComponent<HysjEditorLayout>();
            if (sourceLayout == null || sourceLayout.splashScreen == null || sourceLayout.mainScreen == null || sourceLayout.gameplayPanel == null)
            {
                Debug.LogError("Split requires the existing full HysjMain prefab as its one-time source.");
                return;
            }

            SaveSceneRolePrefab(PrefabPath, LoadPrefabPath, "HysjLoad", new HashSet<string>
            {
                "Splash", "Login", "RealNamePanel", "Tips", "TipsWnd", "AgeTipsPanel"
            }, false);
            SaveSceneRolePrefab(PrefabPath, GameplayPrefabPath, "GardenGameplay", new HashSet<string>
            {
                "GameplayPanel", "Tips"
            }, true);
            SaveSceneRolePrefab(PrefabPath, PrefabPath, "HysjMain", new HashSet<string>
            {
                "Main", "LevelSelectPanel", "RankPanel", "ShopPanel", "RechargePanel", "AchievementsPanel",
                "WeeklyPanel", "OnlinePanel", "SettingsPanel", "StoryPanel", "Tips", "TipsWnd"
            }, false);

            CreateSharedMessageUi();
            EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            Debug.Log("Split Hysj UI into HysjLoad, HysjMain, and GardenGameplay scenes.");
        }

        public static void ValidateThreeScenes()
        {
            ValidateSceneAsset(LoadScenePath, "HysjLoad");
            ValidateSceneAsset(ScenePath, "HysjMain");
            ValidateSceneAsset(GameplayScenePath, "GardenGameplay");

            var load = RequirePrefab(LoadPrefabPath);
            var main = RequirePrefab(PrefabPath);
            var gameplay = RequirePrefab(GameplayPrefabPath);
            var commonMessage = RequirePrefab(CommonMessagePrefabPath);
            var loadLayout = load.GetComponent<HysjEditorLayout>();
            var mainLayout = main.GetComponent<HysjEditorLayout>();
            var gameplayLayout = gameplay.GetComponent<HysjEditorLayout>();
            if (loadLayout == null || load.GetComponent<HysjEditorApp>() == null || loadLayout.splashScreen == null || loadLayout.loginScreen == null || loadLayout.realNamePanel == null || loadLayout.ageTipsPanel == null)
                throw new System.InvalidOperationException("HysjLoad is missing a required startup UI reference.");
            if (mainLayout == null || main.GetComponent<HysjEditorApp>() == null || mainLayout.mainScreen == null || mainLayout.levelSelectPanel == null || mainLayout.achievementsPanel == null || mainLayout.gameplayPanel != null)
                throw new System.InvalidOperationException("HysjMain has an invalid main-scene UI contract.");
            if (gameplayLayout == null || gameplay.GetComponent<GardenGameplayController>() == null || gameplay.GetComponent<HysjEditorApp>() != null || gameplayLayout.gameplayPanel == null || gameplayLayout.gardenRuntime == null || gameplayLayout.gardenPausePopup == null || gameplayLayout.gardenWinPopup == null || gameplayLayout.gardenLosePopup == null || gameplayLayout.gardenRevivePopup == null || gameplayLayout.gardenGameOverPopup == null || gameplayLayout.gardenRepairSuccessPopup == null || gameplayLayout.gardenRepairFailPopup == null || !HasGameplayBoardContract(gameplayLayout))
                throw new System.InvalidOperationException("GardenGameplay has an invalid gameplay UI contract.");
            var message = commonMessage.GetComponent<HysjMessageUi>();
            if (message == null || message.tips == null || message.tipsLabel == null || message.tipsWnd == null || message.tipsWndLabel == null || message.tipsWndConfirm == null)
                throw new System.InvalidOperationException("HysjCommonMessage has an invalid shared message UI contract.");
            EnsureNoSceneMessageNodes(load, LoadPrefabPath);
            EnsureNoSceneMessageNodes(main, PrefabPath);
            EnsureNoSceneMessageNodes(gameplay, GameplayPrefabPath);

            var expected = new[] { LoadScenePath, ScenePath, GameplayScenePath };
            var scenes = EditorBuildSettings.scenes;
            if (scenes.Length != expected.Length) throw new System.InvalidOperationException("Build Settings does not contain exactly three Hysj scenes.");
            for (var i = 0; i < expected.Length; i++)
                if (!scenes[i].enabled || scenes[i].path != expected[i]) throw new System.InvalidOperationException("Build Settings scene order is invalid at index " + i + ".");
            Debug.Log("Validated HysjLoad, HysjMain, and GardenGameplay scene contracts.");
        }

        private static GameObject RequirePrefab(string path)
        {
            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(path);
            if (prefab == null) throw new System.InvalidOperationException("Missing prefab: " + path);
            return prefab;
        }

        private static void EnsureNoSceneMessageNodes(GameObject prefab, string path)
        {
            var canvas = prefab.GetComponentInChildren<Canvas>(true);
            if (canvas != null && (canvas.transform.Find("Tips") != null || canvas.transform.Find("TipsWnd") != null))
                throw new System.InvalidOperationException(path + " still contains scene-local Tips or TipsWnd.");
        }

        private static void ValidateSceneAsset(string path, string expectedRoot)
        {
            var scene = EditorSceneManager.OpenScene(path, OpenSceneMode.Single);
            var found = false;
            foreach (var root in scene.GetRootGameObjects())
                if (root.name == expectedRoot) found = true;
            if (!found) throw new System.InvalidOperationException(path + " is missing root " + expectedRoot + ".");
        }

        private static void SaveSceneRolePrefab(string sourcePath, string targetPath, string rootName, HashSet<string> keepCanvasChildren, bool gameplay)
        {
            var root = PrefabUtility.LoadPrefabContents(sourcePath);
            try
            {
                root.name = rootName;
                var layout = root.GetComponent<HysjEditorLayout>();
                var canvas = root.GetComponentInChildren<Canvas>(true);
                if (layout == null || canvas == null) throw new System.InvalidOperationException("Hysj prefab is missing its layout or canvas.");

                for (var i = canvas.transform.childCount - 1; i >= 0; i--)
                {
                    var child = canvas.transform.GetChild(i);
                    if (!keepCanvasChildren.Contains(child.name)) Object.DestroyImmediate(child.gameObject);
                }

                var validCloseButtons = new List<Button>();
                if (layout.closeButtons != null)
                {
                    foreach (var button in layout.closeButtons)
                        if (button != null) validCloseButtons.Add(button);
                }
                layout.closeButtons = validCloseButtons.ToArray();

                var app = root.GetComponent<HysjEditorApp>();
                var server = root.GetComponent<HysjServerClient>();
                var controller = root.GetComponent<GardenGameplayController>();
                if (gameplay)
                {
                    if (app != null) Object.DestroyImmediate(app);
                    if (server != null) Object.DestroyImmediate(server);
                    if (controller == null) root.AddComponent<GardenGameplayController>();
                    if (layout.gameplayPanel != null) layout.gameplayPanel.SetActive(true);
                    if (layout.tips != null) layout.tips.SetActive(false);
                }
                else
                {
                    if (controller != null) Object.DestroyImmediate(controller);
                    if (app == null) app = root.AddComponent<HysjEditorApp>();
                    if (server == null) server = root.AddComponent<HysjServerClient>();
                    app.layout = layout;
                    app.server = server;
                    server.UseRemoteServer = true;
                }

                EditorUtility.SetDirty(layout);
                PrefabUtility.SaveAsPrefabAsset(root, targetPath);
            }
            finally
            {
                PrefabUtility.UnloadPrefabContents(root);
            }
        }

        private static void CreateSceneFromPrefab(string prefabPath, string scenePath)
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            CreateCamera();
            CreateEventSystem();
            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(prefabPath);
            PrefabUtility.InstantiatePrefab(prefab, scene);
            EditorSceneManager.SaveScene(scene, scenePath);
        }

        public static void Build()
        {
            EnsureDirectories();
            ConfigureSprites();
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            CreateCamera();
            var root = new GameObject("HysjMain", typeof(HysjEditorApp), typeof(HysjEditorLayout), typeof(HysjServerClient));
            var layout = root.GetComponent<HysjEditorLayout>();
            var app = root.GetComponent<HysjEditorApp>();
            var server = root.GetComponent<HysjServerClient>();
            app.layout = layout;
            app.server = server;
            // Match SplashManager: login and real-name verification are always
            // confirmed by the same service endpoints as the Cocos project.
            server.UseRemoteServer = true;
            var canvas = CreateCanvas(root.transform);
            CreateEventSystem();

            layout.splashScreen = Screen(canvas.transform, "Splash", Color.white, "image/beijingjiankangzhogngao");
            AddSpriteImage(layout.splashScreen.transform, "HealthyGameNotice", "image/wenanjiankang", new Vector2(380, 208), new Vector2(0, 39));

            layout.loginScreen = Screen(canvas.transform, "Login", Color.white, "image/beijingzhuce");
            BuildLogin(layout, layout.loginScreen.transform);

            layout.mainScreen = Screen(canvas.transform, "Main", Color.white, "image2/beijingzhujiemian");
            BuildMain(layout, layout.mainScreen.transform);

            layout.levelSelectPanel = ModulePanel(canvas.transform, "LevelSelectPanel", "关卡选择", out var levelClose);
            BuildListPanel(layout.levelSelectPanel.transform, "LevelContent", out layout.levelContent, out layout.levelItemTemplate, false);
            layout.rankPanel = ModulePanel(canvas.transform, "RankPanel", "排行榜", out var rankClose);
            BuildListPanel(layout.rankPanel.transform, "RankContent", out layout.rankContent, out layout.rankItemTemplate, false);
            layout.shopPanel = ModulePanel(canvas.transform, "ShopPanel", "商店", out var shopClose);
            BuildShopGoldBalance(layout, layout.shopPanel.transform);
            BuildListPanel(layout.shopPanel.transform, "ShopContent", out layout.shopContent, out layout.shopItemTemplate, false);
            layout.rechargePanel = ModulePanel(canvas.transform, "RechargePanel", "钻石商城", out var rechargeClose);
            BuildListPanel(layout.rechargePanel.transform, "RechargeContent", out layout.rechargeContent, out layout.rechargeItemTemplate, true);
            layout.achievementsPanel = ModulePanel(canvas.transform, "AchievementsPanel", "成就", out var achieveClose);
            BuildAchievementGoldBalance(layout, layout.achievementsPanel.transform);
            BuildListPanel(layout.achievementsPanel.transform, "AchievementContent", out layout.achievementContent, out layout.achievementItemTemplate, false);
            layout.weeklyPanel = ModulePanel(canvas.transform, "WeeklyPanel", "每周奖励", out var weeklyClose);
            BuildListPanel(layout.weeklyPanel.transform, "WeeklyContent", out layout.weeklyContent, out layout.weeklyItemTemplate, false);
            layout.onlinePanel = ModulePanel(canvas.transform, "OnlinePanel", "在线奖励", out var onlineClose);
            BuildListPanel(layout.onlinePanel.transform, "OnlineContent", out layout.onlineContent, out layout.onlineItemTemplate, false);
            layout.settingsPanel = ModulePanel(canvas.transform, "SettingsPanel", "设置", out var settingsClose);
            BuildSettings(layout, layout.settingsPanel.transform);
            layout.storyPanel = StoryPanel(canvas.transform, out layout.storySkipButton, out layout.storyText);
            layout.realNamePanel = Screen(canvas.transform, "RealNamePanel", new Color32(0, 0, 0, 155));
            BuildRealName(layout, layout.realNamePanel.transform);
            layout.gameplayPanel = Screen(canvas.transform, "GameplayPanel", new Color32(0, 0, 0, 155));
            BuildGameplay(layout, layout.gameplayPanel.transform);

            BuildPopups(layout, canvas.transform);
            layout.closeButtons = new[] { levelClose, rankClose, shopClose, rechargeClose, achieveClose, weeklyClose, onlineClose, settingsClose };
            layout.SetAllPanelsInactive();
            layout.splashScreen.SetActive(true);

            var prefab = PrefabUtility.SaveAsPrefabAssetAndConnect(root, PrefabPath, InteractionMode.AutomatedAction);
            if (prefab != null)
            {
                NormalizePrefabCanvas();
                Debug.Log("Saved editor-authored UI prefab: " + PrefabPath);
            }
            EditorSceneManager.SaveScene(scene, ScenePath);
            AssetDatabase.SaveAssets();
            SplitIntoThreeScenes();
            Debug.Log("Hysj three-scene editor UI created.");
        }

        public static void UpgradeRewardCardTemplates()
        {
            var root = PrefabUtility.LoadPrefabContents(PrefabPath);
            try
            {
                var layout = root.GetComponent<HysjEditorLayout>();
                if (layout == null || layout.weeklyContent == null || layout.onlineContent == null)
                {
                    Debug.LogError("Hysj reward template upgrade requires the existing HysjMain layout.");
                    return;
                }

                layout.weeklyItemTemplate = ReplaceRewardItemTemplate(layout.weeklyContent, "image2/dikuangjiangli", false);
                layout.onlineItemTemplate = ReplaceRewardItemTemplate(layout.onlineContent, "image2/dikuangjiangli", true);
                UpdateRewardGrid(layout.weeklyContent, false);
                UpdateRewardGrid(layout.onlineContent, true);
                PrefabUtility.SaveAsPrefabAsset(root, PrefabPath);
                Debug.Log("Upgraded weekly and online reward card templates: " + PrefabPath);
            }
            finally
            {
                PrefabUtility.UnloadPrefabContents(root);
            }
        }

        public static void UpgradeEditableGameplayUi()
        {
            ConfigureSprites();
            var targetPath = System.IO.File.Exists(GameplayPrefabPath) ? GameplayPrefabPath : PrefabPath;
            var root = PrefabUtility.LoadPrefabContents(targetPath);
            try
            {
                var layout = root.GetComponent<HysjEditorLayout>();
                if (layout == null || layout.gameplayPanel == null)
                {
                    Debug.LogError("Editable gameplay UI upgrade requires the existing HysjMain layout.");
                    return;
                }

                BuildEditableGameplayUi(layout, layout.gameplayPanel.transform);
                EditorUtility.SetDirty(layout);
                PrefabUtility.SaveAsPrefabAsset(root, targetPath);
                AssetDatabase.SaveAssets();
                Debug.Log("Upgraded editable gameplay UI: " + targetPath);
            }
            finally
            {
                PrefabUtility.UnloadPrefabContents(root);
            }
        }

        public static void UpgradeGardenRepairUi()
        {
            ConfigureSprites();
            var root = PrefabUtility.LoadPrefabContents(GameplayPrefabPath);
            try
            {
                var layout = root.GetComponent<HysjEditorLayout>();
                if (layout == null || layout.gardenRuntime == null)
                {
                    Debug.LogError("Garden Repair UI upgrade requires GardenGameplay/GardenRuntime.");
                    return;
                }
                BuildGardenRepairUi(layout, layout.gardenRuntime.transform);
                EditorUtility.SetDirty(layout);
                PrefabUtility.SaveAsPrefabAsset(root, GameplayPrefabPath);
                AssetDatabase.SaveAssets();
                Debug.Log("Upgraded independent Garden Repair popup nodes: " + GameplayPrefabPath);
            }
            finally
            {
                PrefabUtility.UnloadPrefabContents(root);
            }
        }

        public static void UpgradeGameplayBoardNodes()
        {
            var root = PrefabUtility.LoadPrefabContents(GameplayPrefabPath);
            try
            {
                var layout = root.GetComponent<HysjEditorLayout>();
                if (layout == null || layout.gardenRuntime == null)
                {
                    Debug.LogError("Gameplay board upgrade requires GardenGameplay/GardenRuntime.");
                    return;
                }

                BuildEditorGameplayBoards(layout, layout.gardenRuntime.transform);
                EditorUtility.SetDirty(layout);
                PrefabUtility.SaveAsPrefabAsset(root, GameplayPrefabPath);
                AssetDatabase.SaveAssets();
                CreateSceneFromPrefab(GameplayPrefabPath, GameplayScenePath);
                Debug.Log("Upgraded editor-authored gameplay board nodes: " + GameplayPrefabPath);
            }
            finally
            {
                PrefabUtility.UnloadPrefabContents(root);
            }
        }

        public static void UpgradeFormalImageAssets()
        {
            ConfigureSprites();
            UpgradeFormalLayoutPrefab(LoadPrefabPath, ApplyFormalLoadImages);
            UpgradeFormalLayoutPrefab(GameplayPrefabPath, layout =>
            {
                if (layout.gameplayPanel != null) BuildEditableGameplayUi(layout, layout.gameplayPanel.transform);
            });
            UpgradeFormalLayoutPrefab(PrefabPath, null);
            UpgradeFormalMessagePrefab();
            CreateSceneFromPrefab(LoadPrefabPath, LoadScenePath);
            CreateSceneFromPrefab(GameplayPrefabPath, GameplayScenePath);
            AssetDatabase.SaveAssets();
            Debug.Log("Applied HysjLegacy/image formal art to load, notice, and gameplay UI nodes.");
        }

        public static void UpgradeImage2MainUi()
        {
            ConfigureSprites();
            var root = PrefabUtility.LoadPrefabContents(PrefabPath);
            try
            {
                var layout = root.GetComponent<HysjEditorLayout>();
                if (layout == null || layout.mainScreen == null)
                    throw new System.InvalidOperationException("HysjMain prefab is missing its serialized main layout.");

                var mainImage = layout.mainScreen.GetComponent<Image>();
                if (mainImage != null)
                {
                    mainImage.sprite = Sprite("image2/beijingzhujiemian");
                    mainImage.color = Color.white;
                    mainImage.preserveAspect = false;
                }
                ClearChildren(layout.mainScreen.transform);
                BuildMain(layout, layout.mainScreen.transform);

                RebuildModulePanel(layout.levelSelectPanel, "关卡选择", out var levelClose);
                BuildListPanel(layout.levelSelectPanel.transform, "LevelContent", out layout.levelContent, out layout.levelItemTemplate, false);
                RebuildModulePanel(layout.rankPanel, "排行榜", out var rankClose);
                BuildListPanel(layout.rankPanel.transform, "RankContent", out layout.rankContent, out layout.rankItemTemplate, false);
                RebuildModulePanel(layout.shopPanel, "商店", out var shopClose);
                BuildShopGoldBalance(layout, layout.shopPanel.transform);
                BuildListPanel(layout.shopPanel.transform, "ShopContent", out layout.shopContent, out layout.shopItemTemplate, false);
                RebuildModulePanel(layout.rechargePanel, "钻石商城", out var rechargeClose);
                BuildListPanel(layout.rechargePanel.transform, "RechargeContent", out layout.rechargeContent, out layout.rechargeItemTemplate, true);
                RebuildModulePanel(layout.achievementsPanel, "成就", out var achieveClose);
                BuildAchievementGoldBalance(layout, layout.achievementsPanel.transform);
                BuildListPanel(layout.achievementsPanel.transform, "AchievementContent", out layout.achievementContent, out layout.achievementItemTemplate, false);
                RebuildModulePanel(layout.weeklyPanel, "每周奖励", out var weeklyClose);
                BuildListPanel(layout.weeklyPanel.transform, "WeeklyContent", out layout.weeklyContent, out layout.weeklyItemTemplate, false);
                RebuildModulePanel(layout.onlinePanel, "在线奖励", out var onlineClose);
                BuildListPanel(layout.onlinePanel.transform, "OnlineContent", out layout.onlineContent, out layout.onlineItemTemplate, false);
                RebuildModulePanel(layout.settingsPanel, "设置", out var settingsClose);
                BuildSettings(layout, layout.settingsPanel.transform);

                RebuildStoryPanel(layout);
                BuildShopConfirm(layout, layout.shopPanel.transform);
                BuildRechargeConfirm(layout, layout.rechargePanel.transform);
                layout.closeButtons = new[] { levelClose, rankClose, shopClose, rechargeClose, achieveClose, weeklyClose, onlineClose, settingsClose };
                layout.formalImageVersion = FormalImageVersion;
                layout.SetAllPanelsInactive();
                layout.mainScreen.SetActive(true);
                EditorUtility.SetDirty(layout);
                PrefabUtility.SaveAsPrefabAsset(root, PrefabPath);
            }
            finally
            {
                PrefabUtility.UnloadPrefabContents(root);
            }

            CreateSceneFromPrefab(PrefabPath, ScenePath);
            AssetDatabase.SaveAssets();
            Debug.Log("Applied image2 main interface and popup UI to HysjMain.");
        }

        private static void RebuildModulePanel(GameObject panel, string title, out Button close)
        {
            if (panel == null) throw new System.InvalidOperationException("A HysjMain module panel reference is missing: " + title);
            ClearChildren(panel.transform);
            var image = panel.GetComponent<Image>();
            if (image != null) image.color = new Color32(0, 0, 0, 155);
            PopulateModulePanel(panel, title, out close);
        }

        private static void RebuildStoryPanel(HysjEditorLayout layout)
        {
            if (layout.storyPanel == null) return;
            ClearChildren(layout.storyPanel.transform);
            var image = layout.storyPanel.GetComponent<Image>();
            if (image != null)
            {
                image.sprite = Sprite("image2/beijinggushi");
                image.color = Color.white;
                image.preserveAspect = false;
            }
            BuildStoryContent(layout.storyPanel.transform, out layout.storySkipButton, out layout.storyText);
        }

        private static void UpgradeFormalLayoutPrefab(string prefabPath, System.Action<HysjEditorLayout> apply)
        {
            if (!System.IO.File.Exists(prefabPath)) return;
            var root = PrefabUtility.LoadPrefabContents(prefabPath);
            try
            {
                var layout = root.GetComponent<HysjEditorLayout>();
                if (layout == null) return;
                apply?.Invoke(layout);
                layout.formalImageVersion = FormalImageVersion;
                EditorUtility.SetDirty(layout);
                PrefabUtility.SaveAsPrefabAsset(root, prefabPath);
            }
            finally
            {
                PrefabUtility.UnloadPrefabContents(root);
            }
        }

        private static void ApplyFormalLoadImages(HysjEditorLayout layout)
        {
            SetFormalSprite(layout.splashScreen, "image/beijingjiankangzhogngao");
            SetFormalSprite(FindDeep(layout.splashScreen?.transform, "HealthyGameNotice")?.gameObject, "image/wenanjiankang", new Vector2(380, 208));
            SetRect(FindDeep(layout.splashScreen?.transform, "HealthyGameNotice"), new Vector2(380, 208), new Vector2(0, 39));

            SetFormalSprite(layout.loginScreen, "image/beijingzhuce");
            var login = layout.loginScreen == null ? null : layout.loginScreen.transform;
            SetFormalSprite(FindDeep(login, "LoginForm")?.gameObject, "image/tanchuang1", new Vector2(534, 594));
            SetRect(FindDeep(login, "LoginForm"), new Vector2(534, 594), new Vector2(0, -68));
            SetFormalSprite(FindDeep(login, "AgeMarkAnchor")?.gameObject, "image/logo", new Vector2(578, 271));
            SetRect(FindDeep(login, "AgeMarkAnchor"), new Vector2(578, 271), new Vector2(0, 420.5f));
            var loginRegulation = FindDeep(login, "RegulationNotice")?.GetComponent<Image>();
            if (loginRegulation != null)
            {
                loginRegulation.sprite = Sprite("image/wenangenju");
                loginRegulation.color = Color.white;
                loginRegulation.enabled = true;
            }
            SetRect(FindDeep(login, "RegulationNotice"), new Vector2(458, 138), new Vector2(0, 89));
            SetFormalSprite(FindDeep(login, "UsernameFrame")?.gameObject, "image/dikuangzhuce");
            SetFormalSprite(FindDeep(login, "PasswordFrame")?.gameObject, "image/dikuangzhuce");
            SetRect(FindDeep(login, "UsernameFrame"), new Vector2(317, 62), new Vector2(43.5f, -22));
            SetRect(FindDeep(login, "PasswordFrame"), new Vector2(317, 62), new Vector2(43.5f, -106));
            SetActive(FindDeep(login, "UsernameDivider"), false);
            SetActive(FindDeep(login, "PasswordDivider"), false);
            SetFormalLabel(FindDeep(login, "UsernameLabel")?.GetComponent<Text>(), 28, new Vector2(92, 38), new Vector2(-162, -22));
            SetFormalLabel(FindDeep(login, "PasswordLabel")?.GetComponent<Text>(), 28, new Vector2(72, 38), new Vector2(-164, -106));
            SetRect(layout.usernameInput == null ? null : layout.usernameInput.transform, new Vector2(317, 62), new Vector2(43.5f, -22));
            SetRect(layout.passwordInput == null ? null : layout.passwordInput.transform, new Vector2(317, 62), new Vector2(43.5f, -106));
            SetFormalInput(layout.usernameInput, 28);
            SetFormalInput(layout.passwordInput, 28);
            SetFormalSprite(layout.registerButton?.gameObject, "image/anniuzhuce", new Vector2(201, 81));
            SetFormalSprite(layout.loginButton?.gameObject, "image/anniudenglu", new Vector2(201, 81));
            SetRect(layout.registerButton == null ? null : layout.registerButton.transform, new Vector2(201, 81), new Vector2(-105.5f, -236.5f));
            SetRect(layout.loginButton == null ? null : layout.loginButton.transform, new Vector2(201, 81), new Vector2(106.5f, -236.5f));
            SetFormalSprite(layout.ageTipsButton?.gameObject, "image/16+");
            SetRect(layout.ageTipsButton == null ? null : layout.ageTipsButton.transform, new Vector2(76, 98), new Vector2(-286, 560));
            SetFormalSprite(FindDeep(login, "HealthyGameNotice")?.gameObject, "image/wenandibu");
            SetRect(FindDeep(login, "HealthyGameNotice"), new Vector2(551, 86), new Vector2(.5f, -552));

            var realName = layout.realNamePanel == null ? null : layout.realNamePanel.transform;
            var realNameBackground = FindDeep(realName, "RealNameBackground");
            SetFormalSprite(realNameBackground?.gameObject, "image/beijingzhuce");
            if (realNameBackground != null) realNameBackground.SetAsFirstSibling();
            var realNameMask = FindDeep(realName, "Mask");
            if (realNameMask != null) realNameMask.SetSiblingIndex(1);
            var realNameForm = FindDeep(realName, "RealNameForm");
            SetFormalSprite(realNameForm?.gameObject, "image/tanchuang2", new Vector2(534, 792));
            SetRect(realNameForm, new Vector2(534, 792), Vector2.zero);
            SetFormalSprite(FindDeep(realNameForm, "TitleBand")?.gameObject, "image/biaotidi", new Vector2(223, 58));
            SetRect(FindDeep(realNameForm, "TitleBand"), new Vector2(223, 58), new Vector2(-.5f, 317));
            SetFormalTitle(FindDeep(realNameForm, "Title")?.GetComponent<Text>(), 40, new Vector2(180, 58), new Vector2(-.5f, 317));
            SetFormalSprite(FindDeep(realNameForm, "RegulationText")?.gameObject, "image/wenangenju");
            SetRect(FindDeep(realNameForm, "RegulationText"), new Vector2(458, 138), new Vector2(1, 199));
            SetFormalSprite(layout.realNameInput?.gameObject, "image/dikuangzhuce", new Vector2(317, 62));
            SetFormalSprite(layout.idNumberInput?.gameObject, "image/dikuangzhuce", new Vector2(317, 62));
            SetRect(layout.realNameInput == null ? null : layout.realNameInput.transform, new Vector2(317, 62), new Vector2(-.5f, -23));
            SetRect(layout.idNumberInput == null ? null : layout.idNumberInput.transform, new Vector2(317, 62), new Vector2(-.5f, -102));
            SetFormalInput(layout.realNameInput, 28);
            SetFormalInput(layout.idNumberInput, 28);
            SetFormalSprite(FindDeep(realNameForm, "PrivacyPromise")?.gameObject, "image/wenanweilbaozheng");
            SetRect(FindDeep(realNameForm, "PrivacyPromise"), new Vector2(467, 69), new Vector2(-.5f, 71.5f));
            SetFormalSprite(layout.realNameSubmitButton?.gameObject, "image/anniuqueren", new Vector2(201, 81));
            SetRect(layout.realNameSubmitButton == null ? null : layout.realNameSubmitButton.transform, new Vector2(201, 81), new Vector2(-.5f, -228.5f));
            SetFormalSprite(FindDeep(realNameForm, "PrivacyText")?.gameObject, "image/wennanwomenbaozheng");
            SetRect(FindDeep(realNameForm, "PrivacyText"), new Vector2(411, 24), new Vector2(.5f, -314));
            SetFormalSprite(layout.realNameCancelButton?.gameObject, "image/guanbi", new Vector2(84, 87));
            SetRect(layout.realNameCancelButton == null ? null : layout.realNameCancelButton.transform, new Vector2(84, 87), new Vector2(251, 372.5f));

            var age = layout.ageTipsPanel == null ? null : layout.ageTipsPanel.transform;
            EnsureFormalBackdrop(age, "AgeTips");
            var ageForm = FindDeep(age, "AgeTipsForm");
            SetFormalSprite(ageForm?.gameObject, "image/tanchuang1", new Vector2(534, 594));
            SetRect(ageForm, new Vector2(534, 594), Vector2.zero);
            SetFormalSprite(FindDeep(ageForm, "TitleBand")?.gameObject, "image/biaotidi", new Vector2(223, 58));
            SetRect(FindDeep(ageForm, "TitleBand"), new Vector2(223, 58), new Vector2(-.5f, 218));
            SetFormalTitle(FindDeep(ageForm, "AgeTipsTitle")?.GetComponent<Text>(), 40, new Vector2(180, 58), new Vector2(-.5f, 218));
            var ageText = FindDeep(age, "AgeTipsText")?.GetComponent<Text>();
            if (ageText != null && ageForm != null && ageText.transform.parent != ageForm) ageText.transform.SetParent(ageForm, false);
            SetFormalBody(ageText, 20, new Vector2(470, 423), new Vector2(1, -32), 1.25f);
            SetFormalSprite(layout.ageTipsCloseButton?.gameObject, "image/guanbi", new Vector2(84, 87));
            if (layout.ageTipsCloseButton != null && ageForm != null && layout.ageTipsCloseButton.transform.parent != ageForm) layout.ageTipsCloseButton.transform.SetParent(ageForm, false);
            SetRect(layout.ageTipsCloseButton == null ? null : layout.ageTipsCloseButton.transform, new Vector2(84, 87), new Vector2(262, 281.5f));
        }

        private static void UpgradeFormalMessagePrefab()
        {
            if (!System.IO.File.Exists(CommonMessagePrefabPath)) return;
            var root = PrefabUtility.LoadPrefabContents(CommonMessagePrefabPath);
            try
            {
                var message = root.GetComponent<HysjMessageUi>();
                if (message == null || message.tipsWnd == null) return;
                var notice = message.tipsWnd.transform;
                EnsureFormalBackdrop(notice, "Notice");
                var frame = FindDeep(notice, "TipsWndFrame");
                SetFormalSprite(frame?.gameObject, "image/tanchuang3", new Vector2(534, 424));
                SetRect(frame, new Vector2(534, 424), new Vector2(0, 85));
                SetFormalSprite(FindDeep(frame, "TitleBand")?.gameObject, "image/biaotidi", new Vector2(223, 58));
                SetRect(FindDeep(frame, "TitleBand"), new Vector2(223, 58), new Vector2(-.5f, 129));
                SetFormalTitle(FindDeep(frame, "TipsWndTitle")?.GetComponent<Text>(), 38, new Vector2(210, 58), new Vector2(-.5f, 129));
                SetFormalBody(message.tipsWndLabel, 20, new Vector2(464, 188), new Vector2(0, 0), 1.5f);
                SetFormalSprite(message.tipsWndConfirm?.gameObject, "image/guanbi", new Vector2(84, 87));
                SetRect(message.tipsWndConfirm == null ? null : message.tipsWndConfirm.transform, new Vector2(84, 87), new Vector2(262, 196.5f));
                PrefabUtility.SaveAsPrefabAsset(root, CommonMessagePrefabPath);
            }
            finally
            {
                PrefabUtility.UnloadPrefabContents(root);
            }
        }

        private static void SetFormalSprite(GameObject node, string resourcePath, Vector2? size = null)
        {
            if (node == null) return;
            var image = node.GetComponent<Image>();
            if (image == null) return;
            image.sprite = Sprite(resourcePath);
            image.color = Color.white;
            image.type = Image.Type.Simple;
            image.preserveAspect = true;
            if (size.HasValue) node.GetComponent<RectTransform>().sizeDelta = size.Value;
            EditorUtility.SetDirty(node);
        }

        private static void SetRect(Transform node, Vector2 size, Vector2 position)
        {
            var rect = node as RectTransform;
            if (rect == null) return;
            rect.sizeDelta = size;
            rect.anchoredPosition = position;
        }

        private static void ClearChildren(Transform parent)
        {
            if (parent == null) return;
            for (var i = parent.childCount - 1; i >= 0; i--)
                Object.DestroyImmediate(parent.GetChild(i).gameObject);
        }

        private static void AddTextOutline(Text text, Color color, Vector2 distance)
        {
            if (text == null) return;
            var outline = text.GetComponent<Outline>();
            if (outline == null) outline = text.gameObject.AddComponent<Outline>();
            outline.effectColor = color;
            outline.effectDistance = distance;
            outline.useGraphicAlpha = false;
        }

        private static void ConfigureMainCounterText(Text text)
        {
            if (text == null) return;
            text.font = Font;
            text.fontSize = 30;
            text.fontStyle = FontStyle.Bold;
            text.color = new Color32(137, 76, 20, 255);
            var outline = text.GetComponent<Outline>();
            if (outline != null) outline.enabled = false;
        }

        private static void ConfigureStaminaRecoveryText(Text text)
        {
            if (text == null) return;
            text.font = Font;
            text.fontSize = 22;
            text.fontStyle = FontStyle.Bold;
            text.color = new Color32(169, 59, 47, 255);
            AddTextOutline(text, new Color32(249, 237, 223, 255), new Vector2(2, -2));
        }

        private static void SetActive(Transform node, bool active)
        {
            if (node != null) node.gameObject.SetActive(active);
        }

        private static void SetFormalTitle(Text text, int fontSize, Vector2 size, Vector2 position)
        {
            if (text == null) return;
            SetRect(text.transform, size, position);
            text.fontSize = fontSize;
            text.fontStyle = FontStyle.Bold;
            text.color = new Color32(255, 248, 241, 255);
            text.alignment = TextAnchor.MiddleCenter;
            text.horizontalOverflow = HorizontalWrapMode.Overflow;
            text.verticalOverflow = VerticalWrapMode.Overflow;
        }

        private static void SetFormalBody(Text text, int fontSize, Vector2 size, Vector2 position, float lineSpacing)
        {
            if (text == null) return;
            SetRect(text.transform, size, position);
            text.fontSize = fontSize;
            text.fontStyle = FontStyle.Normal;
            text.color = Color.white;
            text.alignment = TextAnchor.UpperLeft;
            text.horizontalOverflow = HorizontalWrapMode.Wrap;
            text.verticalOverflow = VerticalWrapMode.Overflow;
            text.lineSpacing = lineSpacing;
        }

        private static void SetFormalLabel(Text text, int fontSize, Vector2 size, Vector2 position)
        {
            if (text == null) return;
            SetRect(text.transform, size, position);
            text.fontSize = fontSize;
            text.fontStyle = FontStyle.Bold;
            text.color = new Color32(160, 85, 63, 255);
            text.alignment = TextAnchor.MiddleCenter;
            var outline = text.GetComponent<Outline>();
            if (outline == null) outline = text.gameObject.AddComponent<Outline>();
            outline.effectColor = new Color32(229, 211, 164, 255);
            outline.effectDistance = new Vector2(1.5f, -1.5f);
            outline.useGraphicAlpha = false;
        }

        private static void SetFormalInput(InputField input, int fontSize)
        {
            if (input == null) return;
            var value = input.textComponent;
            var hint = input.placeholder as Text;
            if (value != null)
            {
                SetRect(value.transform, input.GetComponent<RectTransform>().sizeDelta - new Vector2(20, 8), Vector2.zero);
                value.fontSize = fontSize;
                value.fontStyle = FontStyle.Normal;
                value.color = new Color32(160, 85, 63, 255);
                value.alignment = TextAnchor.MiddleCenter;
            }
            if (hint != null)
            {
                SetRect(hint.transform, input.GetComponent<RectTransform>().sizeDelta - new Vector2(20, 8), Vector2.zero);
                hint.fontSize = fontSize;
                hint.fontStyle = FontStyle.Normal;
                hint.color = new Color32(160, 85, 63, 255);
                hint.alignment = TextAnchor.MiddleCenter;
            }
            input.caretColor = new Color32(160, 85, 63, 255);
            input.selectionColor = new Color32(229, 211, 164, 140);
        }

        private static void EnsureFormalBackdrop(Transform root, string prefix)
        {
            if (root == null) return;
            var background = root.Find(prefix + "Background");
            if (background == null)
            {
                var node = new GameObject(prefix + "Background", typeof(RectTransform), typeof(Image));
                node.transform.SetParent(root, false);
                background = node.transform;
            }
            Stretch((RectTransform)background);
            var backgroundImage = background.GetComponent<Image>();
            backgroundImage.sprite = Sprite("image/beijingzhuce");
            backgroundImage.color = Color.white;
            backgroundImage.preserveAspect = false;
            background.SetAsFirstSibling();

            var mask = root.Find(prefix + "Mask");
            if (mask == null)
            {
                var node = new GameObject(prefix + "Mask", typeof(RectTransform), typeof(Image));
                node.transform.SetParent(root, false);
                mask = node.transform;
            }
            Stretch((RectTransform)mask);
            mask.GetComponent<Image>().color = new Color32(0, 0, 0, 125);
            mask.SetSiblingIndex(1);
        }

        private static GameObject ReplaceRewardItemTemplate(Transform content, string cardSprite, bool isOnlineReward)
        {
            for (var i = content.childCount - 1; i >= 0; i--)
            {
                Object.DestroyImmediate(content.GetChild(i).gameObject);
            }
            var template = RewardItemTemplate(content, "ItemTemplate", cardSprite, isOnlineReward);
            template.SetActive(false);
            return template;
        }

        private static void UpdateRewardGrid(Transform content, bool isOnlineReward)
        {
            var grid = content.GetComponent<GridLayoutGroup>();
            if (grid == null) return;
            grid.cellSize = new Vector2(240, 280);
            grid.spacing = isOnlineReward ? new Vector2(14, 34) : new Vector2(0, 24);
            grid.padding = new RectOffset(0, 0, 12, 12);
            grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
            grid.constraintCount = 2;
            grid.childAlignment = TextAnchor.UpperCenter;
        }

        public static void SmokeTest()
        {
            EditorSceneManager.OpenScene(ScenePath);
            EditorApplication.isPlaying = true;
            var endAt = EditorApplication.timeSinceStartup + 3.5;
            EditorApplication.update += () =>
            {
                if (EditorApplication.timeSinceStartup < endAt) return;
                EditorApplication.isPlaying = false;
                if (Application.isBatchMode) EditorApplication.Exit(0);
            };
        }

        public static void SmokeTestSecondaryPanels()
        {
            EditorSceneManager.OpenScene(ScenePath);
            EditorApplication.isPlaying = true;
            var startedAt = EditorApplication.timeSinceStartup;
            var step = 0;
            EditorApplication.update += () =>
            {
                var layout = Object.FindObjectOfType<HysjEditorLayout>();
                if (layout == null || EditorApplication.timeSinceStartup < startedAt + 1 + step * .45) return;
                var buttons = new[] { layout.infiniteButton, layout.rankButton, layout.shopButton, layout.rechargeButton, layout.achievementsButton, layout.weeklyButton, layout.onlineButton, layout.settingsButton };
                if (step < buttons.Length)
                {
                    if (buttons[step] != null) buttons[step].onClick.Invoke();
                    step++;
                    return;
                }
                EditorApplication.isPlaying = false;
                if (Application.isBatchMode) EditorApplication.Exit(0);
            };
        }

        private static void BuildLogin(HysjEditorLayout layout, Transform parent)
        {
            // Values below mirror assets/Scene/Load.fire on its native 720 x 1280 canvas.
            Panel(parent, "LoginForm", new Vector2(534, 594), new Vector2(0, -68), Color.white, "image/tanchuang1");
            AddSpriteImage(parent, "AgeMarkAnchor", "image/logo", new Vector2(578, 271), new Vector2(0, 420.5f));
            var regulationNotice = AddSpriteImage(parent, "RegulationNotice", "image/wenangenju", new Vector2(458, 138), new Vector2(0, 89));
            regulationNotice.enabled = true;
            AddSpriteImage(parent, "UsernameFrame", "image/dikuangzhuce", new Vector2(317, 62), new Vector2(43.5f, -22));
            AddSpriteImage(parent, "PasswordFrame", "image/dikuangzhuce", new Vector2(317, 62), new Vector2(43.5f, -106));
            var usernameLabel = Text(parent, "UsernameLabel", "用户名", 28, new Color32(160, 85, 63, 255), new Vector2(92, 38), new Vector2(-162, -22));
            var passwordLabel = Text(parent, "PasswordLabel", "密码", 28, new Color32(160, 85, 63, 255), new Vector2(72, 38), new Vector2(-164, -106));
            SetFormalLabel(usernameLabel, 28, new Vector2(92, 38), new Vector2(-162, -22));
            SetFormalLabel(passwordLabel, 28, new Vector2(72, 38), new Vector2(-164, -106));
            layout.usernameInput = Input(parent, "Username", "请输入用户名", new Vector2(317, 62), new Vector2(43.5f, -22), false);
            layout.passwordInput = Input(parent, "Password", "请输入密码", new Vector2(317, 62), new Vector2(43.5f, -106), true);
            layout.usernameInput.GetComponent<Image>().color = Color.clear;
            layout.passwordInput.GetComponent<Image>().color = Color.clear;
            SetFormalInput(layout.usernameInput, 28);
            SetFormalInput(layout.passwordInput, 28);
            layout.usernameInput.characterLimit = 16;
            layout.passwordInput.characterLimit = 16;
            layout.registerButton = Button(parent, "RegisterButton", string.Empty, new Vector2(201, 81), new Vector2(-105.5f, -236.5f), Color.white, "image/anniuzhuce");
            layout.loginButton = Button(parent, "LoginButton", string.Empty, new Vector2(201, 81), new Vector2(106.5f, -236.5f), Color.white, "image/anniudenglu");
            layout.agreementToggle = Toggle(parent, "Agreement", string.Empty, true, Vector2.zero);
            layout.agreementToggle.gameObject.SetActive(false);
            layout.ageTipsButton = Button(parent, "AgeTipsButton", string.Empty, new Vector2(76, 98), new Vector2(-286, 560), Color.white, "image/16+");
            AddSpriteImage(parent, "HealthyGameNotice", "image/wenandibu", new Vector2(551, 86), new Vector2(.5f, -552));
        }

        private static void BuildMain(HysjEditorLayout layout, Transform parent)
        {
            AddSpriteImage(parent, "MainLogo", "image/logo", new Vector2(480, 225), new Vector2(0, 293));

            // The labels are baked into the new mode artwork. Keep the existing
            // callback ownership: pink opens levels, blue enters endless mode.
            layout.infiniteButton = Button(parent, "BtnStart2", string.Empty, new Vector2(251, 263), new Vector2(-132.5f, -117.5f), Color.white, "image2/Mguanqiamoshi");
            layout.startButton = Button(parent, "BtnStart", string.Empty, new Vector2(251, 262), new Vector2(127.5f, -118), Color.white, "image2/Mwujinmoshi");

            AddSpriteImage(parent, "BottomBar", "image2/dikuangzhujiemian", new Vector2(720, 127), new Vector2(0, -576.5f));
            layout.shopButton = Button(parent, "BtnShop", string.Empty, new Vector2(119, 128), new Vector2(-268.5f, -557), Color.white, "image2/tubiao4");
            layout.achievementsButton = Button(parent, "BtnCJ", string.Empty, new Vector2(119, 128), new Vector2(-134.5f, -557), Color.white, "image2/tubiao1");
            layout.rankButton = Button(parent, "BtnRank", string.Empty, new Vector2(119, 128), new Vector2(-1.5f, -557), Color.white, "image2/tubiao3");
            layout.onlineButton = Button(parent, "BtnDaily", string.Empty, new Vector2(119, 128), new Vector2(132.5f, -557), Color.white, "image2/tubiao6");
            layout.weeklyButton = Button(parent, "BtnWeek", string.Empty, new Vector2(119, 128), new Vector2(265.5f, -557), Color.white, "image2/tubiao2");
            layout.settingsButton = Button(parent, "BtnBGM", string.Empty, new Vector2(119, 128), new Vector2(265.5f, -424), Color.white, "image2/tubiao5");

            AddSpriteImage(parent, "StaminaFrame", "image2/dikuangtili", new Vector2(161, 54), new Vector2(248.5f, 574));
            AddSpriteImage(parent, "StaminaIcon", "image2/dianchi", new Vector2(49, 82), new Vector2(190.5f, 571));
            layout.staminaLabel = Text(parent, "StaminaLabel", "20/20", 30, new Color32(137, 76, 20, 255), new Vector2(95, 42), new Vector2(264, 574));
            ConfigureMainCounterText(layout.staminaLabel);
            layout.staminaLabel.horizontalOverflow = HorizontalWrapMode.Overflow;
            layout.staminaLabel.verticalOverflow = VerticalWrapMode.Overflow;
            layout.staminaRecoveryLabel = Text(parent, "StaminaRecoveryLabel", "体力已满", 22, new Color32(169, 59, 47, 255), new Vector2(150, 32), new Vector2(252, 530));
            ConfigureStaminaRecoveryText(layout.staminaRecoveryLabel);
            layout.staminaRecoveryLabel.horizontalOverflow = HorizontalWrapMode.Overflow;
            layout.staminaRecoveryLabel.gameObject.SetActive(false);
            layout.staminaToggleButton = Button(parent, "StaminaToggle", string.Empty, new Vector2(180, 90), new Vector2(240, 574), Color.clear);
            var staminaButtonImage = layout.staminaToggleButton.GetComponent<Image>();
            if (staminaButtonImage != null) staminaButtonImage.color = Color.clear;

            AddSpriteImage(parent, "GoldFrame", "image2/dikuangtili", new Vector2(161, 54), new Vector2(-204.5f, 574));
            AddSpriteImage(parent, "GoldIcon", "image2/zuanshi", new Vector2(76, 66), new Vector2(-294, 574));
            layout.goldLabel = Text(parent, "GoldLabel", "3000", 30, new Color32(137, 76, 20, 255), new Vector2(90, 42), new Vector2(-212, 574));
            ConfigureMainCounterText(layout.goldLabel);
            layout.rechargeButton = Button(parent, "BtnCharge", string.Empty, new Vector2(71, 71), new Vector2(-129.5f, 574.5f), Color.white, "image2/jiahao");

            layout.progressLabel = null;

            // These controls are not visible in Start.fire. They remain available
            // through their panels/other flows but are intentionally not added to
            // the visual main scene so no synthetic controls alter the composition.
            layout.playerLabel = null;
            layout.levelSelectButton = null;
            layout.storyButton = null;
        }

        private static void BuildListPanel(Transform panel, string name, out Transform content, out GameObject template, bool twoColumns)
        {
            var scroll = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(ScrollRect), typeof(Mask));
            scroll.transform.SetParent(panel, false);
            var rect = scroll.GetComponent<RectTransform>();
            var panelName = panel.name;
            rect.sizeDelta = ListViewportSize(panelName);
            // List viewport positions are authored relative to the full-screen
            // popup root. Keep them below the title/header and inside the frame.
            rect.anchorMin = new Vector2(.5f, .5f);
            rect.anchorMax = new Vector2(.5f, .5f);
            rect.pivot = new Vector2(.5f, .5f);
            rect.anchoredPosition = ListViewportPosition(panelName);
            var scrollImage = scroll.GetComponent<Image>();
            var scrollMask = scroll.GetComponent<Mask>();
            // The frame supplies every visible panel background. This Image is
            // retained only so Mask can write to the stencil buffer.
            scrollImage.color = Color.white;
            scrollMask.showMaskGraphic = false;
            var contentObject = new GameObject("Content", typeof(RectTransform), typeof(ContentSizeFitter));
            contentObject.transform.SetParent(scroll.transform, false);
            content = contentObject.transform;
            var contentRect = contentObject.GetComponent<RectTransform>(); contentRect.anchorMin = new Vector2(0, 1); contentRect.anchorMax = new Vector2(1, 1); contentRect.pivot = new Vector2(.5f, 1); contentRect.sizeDelta = Vector2.zero;
            if (twoColumns)
            {
                var grid = contentObject.AddComponent<GridLayoutGroup>();
                grid.cellSize = new Vector2(192, 198);
                grid.spacing = new Vector2(41, 0);
                grid.padding = new RectOffset(26, 26, 0, 8);
                grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
                grid.constraintCount = 2;
                grid.childAlignment = TextAnchor.UpperCenter;
            }
            else if (panelName == "LevelSelectPanel")
            {
                var grid = contentObject.AddComponent<GridLayoutGroup>();
                grid.cellSize = new Vector2(209, 192);
                grid.spacing = new Vector2(31, 0);
                grid.padding = new RectOffset(14, 14, 0, 8);
                grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
                grid.constraintCount = 2;
                grid.childAlignment = TextAnchor.UpperCenter;
            }
            else if (panelName == "ShopPanel")
            {
                var grid = contentObject.AddComponent<GridLayoutGroup>();
                grid.cellSize = new Vector2(201, 281);
                grid.spacing = new Vector2(29, 0);
                grid.padding = new RectOffset(21, 21, 0, 8);
                grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
                grid.constraintCount = 2;
                grid.childAlignment = TextAnchor.UpperCenter;
            }
            else if (panelName == "AchievementsPanel")
            {
                var grid = contentObject.AddComponent<GridLayoutGroup>();
                grid.cellSize = new Vector2(201, 272);
                grid.spacing = new Vector2(29, 0);
                grid.padding = new RectOffset(21, 21, 0, 8);
                grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
                grid.constraintCount = 2;
                grid.childAlignment = TextAnchor.UpperCenter;
            }
            else if (panelName == "WeeklyPanel" || panelName == "OnlinePanel")
            {
                var grid = contentObject.AddComponent<GridLayoutGroup>();
                grid.cellSize = new Vector2(160, 210);
                grid.spacing = new Vector2(3, 1);
                grid.padding = new RectOffset(8, 8, 0, 8);
                grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
                grid.constraintCount = 3;
                grid.childAlignment = TextAnchor.UpperCenter;
            }
            else
            {
                var vertical = contentObject.AddComponent<VerticalLayoutGroup>();
                vertical.spacing = panelName == "RankPanel" ? 4 : 16;
                vertical.padding = panelName == "RankPanel" ? new RectOffset(0, 0, 0, 0) : new RectOffset(16, 16, 16, 16);
                vertical.childControlHeight = true;
                vertical.childForceExpandHeight = false;
            }
            contentObject.GetComponent<ContentSizeFitter>().verticalFit = ContentSizeFitter.FitMode.PreferredSize;
            var scrollRect = scroll.GetComponent<ScrollRect>(); scrollRect.content = contentRect; scrollRect.viewport = rect; scrollRect.horizontal = false; scrollRect.vertical = true;
            if (twoColumns) template = RechargeItemTemplate(panel, "ItemTemplate");
            else if (panelName == "LevelSelectPanel") template = LevelItemTemplate(panel, "ItemTemplate");
            else if (panelName == "ShopPanel") template = ShopItemTemplate(panel, "ItemTemplate");
            else if (panelName == "AchievementsPanel") template = AchievementItemTemplate(panel, "ItemTemplate");
            else if (panelName == "WeeklyPanel") template = RewardItemTemplate(panel, "ItemTemplate", "image2/dikuangjiangli", false);
            else if (panelName == "OnlinePanel") template = RewardItemTemplate(panel, "ItemTemplate", "image2/dikuangjiangli", true);
            else if (panelName == "RankPanel") template = RankItemTemplate(panel, "ItemTemplate");
            else template = ItemTemplate(panel, "ItemTemplate", new Vector2(440, 64));
            template.SetActive(false);
        }

        private static Vector2 ListViewportPosition(string panelName)
        {
            if (panelName == "RankPanel") return new Vector2(.5f, -27);
            if (panelName == "LevelSelectPanel") return new Vector2(0, -40);
            if (panelName == "ShopPanel") return new Vector2(0, -58);
            if (panelName == "AchievementsPanel") return new Vector2(0, -66.5f);
            if (panelName == "WeeklyPanel" || panelName == "OnlinePanel") return new Vector2(-.5f, -45);
            if (panelName == "RechargePanel") return new Vector2(0, -52.5f);
            return Vector2.zero;
        }

        private static Vector2 ListViewportSize(string panelName)
        {
            if (panelName == "RankPanel") return new Vector2(467, 516);
            if (panelName == "LevelSelectPanel") return new Vector2(480, 610);
            if (panelName == "ShopPanel") return new Vector2(480, 575);
            if (panelName == "AchievementsPanel") return new Vector2(480, 552);
            if (panelName == "WeeklyPanel" || panelName == "OnlinePanel") return new Vector2(500, 610);
            if (panelName == "RechargePanel") return new Vector2(480, 594);
            return new Vector2(480, 600);
        }

        private static void BuildSettings(HysjEditorLayout layout, Transform parent)
        {
            AddSpriteImage(parent, "MusicIcon", "image2/yinyuefuhao", new Vector2(58, 58), new Vector2(-104, 48));
            AddSpriteImage(parent, "SoundIcon", "image2/yinxiaofuhao", new Vector2(68, 55), new Vector2(-106, -28.5f));
            var musicLabel = Text(parent, "MusicLabel", "音乐", 30, Color.white, new Vector2(70, 42), new Vector2(-35, 48));
            var soundLabel = Text(parent, "SoundLabel", "音效", 30, Color.white, new Vector2(70, 42), new Vector2(-35, -29));
            AddTextOutline(musicLabel, new Color32(164, 76, 65, 255), new Vector2(2, -2));
            AddTextOutline(soundLabel, new Color32(164, 76, 65, 255), new Vector2(2, -2));
            layout.musicToggle = SpriteToggle(parent, "Music", new Vector2(117, 50), new Vector2(67.5f, 48), "image2/kognjiankai");
            layout.soundToggle = SpriteToggle(parent, "Sound", new Vector2(117, 50), new Vector2(67.5f, -29), "image2/kognjiankai");
            layout.settingsRemoteToggle = null;
            layout.settingsSyncDownloadButton = null;
            layout.settingsSyncUploadButton = null;
            layout.openRealNameButton = null;
            layout.settingsLogoutButton = Button(parent, "BtnReset", string.Empty, new Vector2(201, 81), new Vector2(.5f, -121.5f), Color.white, "image2/anniutuichudenglu");
        }

        private static GameObject StoryPanel(Transform canvas, out Button skipButton, out Text storyText)
        {
            var panel = Screen(canvas, "StoryPanel", Color.white, "image2/beijinggushi");
            BuildStoryContent(panel.transform, out skipButton, out storyText);
            return panel;
        }

        private static void BuildStoryContent(Transform parent, out Button skipButton, out Text storyText)
        {
            storyText = Text(parent, "StoryText", string.Empty, 28, new Color32(130, 87, 34, 255), new Vector2(520, 850), new Vector2(0, 50), TextAnchor.UpperLeft, VerticalWrapMode.Overflow);
            storyText.lineSpacing = 1.35f;
            skipButton = Button(parent, "StorySkipButton", string.Empty, new Vector2(201, 81), new Vector2(0, -458), Color.white, "image2/anniutiaoguo");
            skipButton.gameObject.SetActive(false);
        }

        private static void BuildRealName(HysjEditorLayout layout, Transform parent)
        {
            var mask = Panel(parent, "Mask", new Vector2(2000, 2000), Vector2.zero, new Color32(0, 0, 0, 125));
            var background = AddSpriteImage(parent, "RealNameBackground", "image/beijingzhuce", new Vector2(720, 1280), Vector2.zero);
            background.transform.SetAsFirstSibling();
            mask.transform.SetSiblingIndex(1);
            var card = Panel(parent, "RealNameForm", new Vector2(534, 792), Vector2.zero, Color.white, "image/tanchuang2");
            AddSpriteImage(card.transform, "TitleBand", "image/biaotidi", new Vector2(223, 58), new Vector2(-.5f, 317));
            var title = Text(card.transform, "Title", "实名认证", 40, Color.white, new Vector2(180, 58), new Vector2(-.5f, 317));
            SetFormalTitle(title, 40, new Vector2(180, 58), new Vector2(-.5f, 317));
            AddSpriteImage(card.transform, "RegulationText", "image/wenangenju", new Vector2(458, 138), new Vector2(1, 199));
            layout.realNameInput = Input(card.transform, "RealNameInput", "请输入真实姓名", new Vector2(317, 62), new Vector2(-.5f, -23), false, "image/dikuangzhuce");
            layout.idNumberInput = Input(card.transform, "IdNumberInput", "请输入身份证号", new Vector2(317, 62), new Vector2(-.5f, -102), false, "image/dikuangzhuce");
            SetFormalInput(layout.realNameInput, 28);
            SetFormalInput(layout.idNumberInput, 28);
            layout.realNameInput.characterLimit = 16;
            layout.idNumberInput.characterLimit = 18;
            AddSpriteImage(card.transform, "PrivacyPromise", "image/wenanweilbaozheng", new Vector2(467, 69), new Vector2(-.5f, 71.5f));
            layout.realNameSubmitButton = Button(card.transform, "RealNameSubmit", string.Empty, new Vector2(201, 81), new Vector2(-.5f, -228.5f), Color.white, "image/anniuqueren");
            AddSpriteImage(card.transform, "PrivacyText", "image/wennanwomenbaozheng", new Vector2(411, 24), new Vector2(.5f, -314));
            layout.realNameCancelButton = Button(card.transform, "RealNameCancel", string.Empty, new Vector2(84, 87), new Vector2(251, 372.5f), Color.white, "image/guanbi");
        }

        private static void BuildGameplay(HysjEditorLayout layout, Transform parent)
        {
            BuildEditableGameplayUi(layout, parent);
        }

        private static void BuildEditableGameplayUi(HysjEditorLayout layout, Transform parent)
        {
            DestroyChildIfPresent(parent, "GameplayContract");
            DestroyChildIfPresent(parent, "GameplayWin");
            DestroyChildIfPresent(parent, "GameplayFail");
            DestroyChildIfPresent(parent, "GameplayBack");
            DestroyChildIfPresent(parent, "Frame");
            var old = parent.Find("GardenRuntime");
            if (old != null) Object.DestroyImmediate(old.gameObject);

            var runtime = new GameObject("GardenRuntime", typeof(RectTransform), typeof(Image));
            runtime.transform.SetParent(parent, false); Stretch(runtime.GetComponent<RectTransform>());
            var runtimeImage = runtime.GetComponent<Image>(); runtimeImage.sprite = Sprite("image/beijing1"); runtimeImage.color = Color.white; runtimeImage.raycastTarget = false;
            runtimeImage.preserveAspect = false;
            layout.gardenRuntime = runtime;
            AddSpriteImage(runtime.transform, "LevelFrame", "image/dikuangguanqia", new Vector2(218, 92), new Vector2(0, 577));
            layout.gardenTitle = Text(runtime.transform, "Title", "第1关", 40, new Color32(137, 76, 20, 255), new Vector2(210, 82), new Vector2(0, 577));
            layout.gardenTitle.fontStyle = FontStyle.Bold;
            layout.gardenStatus = Text(runtime.transform, "Status", "10秒后开始防守，请拖动进行播种。", 28, new Color32(119, 47, 0, 255), new Vector2(680, 64), new Vector2(0, 494), TextAnchor.MiddleCenter, VerticalWrapMode.Overflow);
            layout.gardenStatus.fontStyle = FontStyle.Bold;
            var statusOutline = layout.gardenStatus.GetComponent<Outline>();
            if (statusOutline == null) statusOutline = layout.gardenStatus.gameObject.AddComponent<Outline>();
            statusOutline.effectColor = new Color32(255, 246, 232, 255);
            statusOutline.effectDistance = new Vector2(2f, -2f);
            statusOutline.useGraphicAlpha = true;
            layout.gardenMaturityCountdown = Text(runtime.transform, "MaturityCountdown", "成熟倒计时：0秒。", 28, new Color32(119, 47, 0, 255), new Vector2(680, 48), new Vector2(0, 430), TextAnchor.MiddleCenter, VerticalWrapMode.Overflow);
            layout.gardenMaturityCountdown.fontStyle = FontStyle.Bold;
            var maturityOutline = layout.gardenMaturityCountdown.GetComponent<Outline>();
            if (maturityOutline == null) maturityOutline = layout.gardenMaturityCountdown.gameObject.AddComponent<Outline>();
            maturityOutline.effectColor = new Color32(255, 246, 232, 255);
            maturityOutline.effectDistance = new Vector2(2f, -2f);
            maturityOutline.useGraphicAlpha = true;
            AddSpriteImage(runtime.transform, "ResourceFrame", "image/dikuang2", new Vector2(190, 80), new Vector2(235, 572));
            AddSpriteImage(runtime.transform, "ResourceIcon", "image/huaduotubiao", new Vector2(45, 46), new Vector2(194.5f, 572));
            layout.gardenResource = Text(runtime.transform, "Resource", "100", 40, new Color32(137, 76, 20, 255), new Vector2(112, 54), new Vector2(260, 572), TextAnchor.MiddleCenter, VerticalWrapMode.Truncate);
            layout.gardenResource.fontStyle = FontStyle.Bold;
            layout.gardenResource.horizontalOverflow = HorizontalWrapMode.Wrap;
            layout.gardenResource.resizeTextForBestFit = true;
            layout.gardenResource.resizeTextMinSize = 16;
            layout.gardenResource.resizeTextMaxSize = 40;
            layout.gardenPrimaryButton = Button(runtime.transform, "Primary", string.Empty, new Vector2(362, 103), new Vector2(-1, -563.5f), Color.white, "image/anniukaishifangshou");
            layout.gardenPauseButton = SpriteButton(runtime.transform, "PauseBtn", new Vector2(95, 93), new Vector2(-287.5f, 571.5f), "image/zanting");
            BuildEditorGameplayBoards(layout, runtime.transform);

            layout.gardenPausePopup = BuildPausePopup(runtime.transform);
            layout.gardenWinPopup = BuildResultPopup(runtime.transform, "WinResultPopup", "image2/tanchuangyouxichenggong", "image2/dikuangyouxichenggong", "image2/anniuxiayiguan", "nextBtn", true);
            layout.gardenLosePopup = BuildResultPopup(runtime.transform, "LoseResultPopup", "image2/tanchuangyouxishibai", "image2/dikuangshibai", "image2/anniuchognxintiaozhan", "retryBtn", false);
            layout.gardenRevivePopup = BuildRevivePopup(runtime.transform);
            layout.gardenGameOverPopup = BuildResultPopup(runtime.transform, "GameOverPopup", "image2/tanchuangyouxishibai", "image2/dikuangshibai", "image2/anniuchognxintiaozhan", "retryBtn", false);
            BuildGardenRepairUi(layout, runtime.transform);
            layout.gardenPausePopup.SetActive(false); layout.gardenWinPopup.SetActive(false); layout.gardenLosePopup.SetActive(false); layout.gardenRevivePopup.SetActive(false); layout.gardenGameOverPopup.SetActive(false);
        }

        private static bool HasGameplayBoardContract(HysjEditorLayout layout)
        {
            return layout != null
                && layout.gardenBoardVersion >= GameplayBoardVersion
                && layout.gardenSharedHud != null
                && layout.gardenMainModeRoot != null
                && layout.gardenMainGridRoot != null
                && HasButtonsWithInput<GardenSeedDragInput>(layout.gardenMainCells, 9)
                && HasImages(layout.gardenMainEntityIcons, 9)
                && HasImages(layout.gardenMainMouseIcons, 9)
                && layout.gardenSeedTrayRoot != null
                && layout.gardenSeedScroll != null
                && layout.gardenSeedContent != null
                && layout.gardenSeedIcons != null
                && layout.gardenSeedIcons.Length == 6
                && HasButtonsWithInput<GardenSeedDragInput>(layout.gardenSeedButtons, 6)
                && HasSprites(layout.gardenPlantGrowthSprites, 6)
                && HasSprites(layout.gardenPlantBloomSprites, 6)
                && HasSprites(layout.gardenPlantResultSprites, 6)
                && layout.gardenMouseSprite != null
                && layout.gardenDeleteZone != null
                && layout.gardenRepairModeRoot != null
                && layout.gardenRepairGridRoot != null
                && HasButtonsWithInput<GardenRepairCellInput>(layout.gardenRepairCells, 35)
                && layout.gardenRepairWaterFlow != null;
        }

        private static bool HasButtons(Button[] buttons, int count)
        {
            if (buttons == null || buttons.Length != count) return false;
            for (var i = 0; i < buttons.Length; i++) if (buttons[i] == null) return false;
            return true;
        }

        private static bool HasImages(Image[] images, int count)
        {
            if (images == null || images.Length != count) return false;
            for (var i = 0; i < images.Length; i++) if (images[i] == null) return false;
            return true;
        }

        private static bool HasSprites(Sprite[] sprites, int count)
        {
            if (sprites == null || sprites.Length != count) return false;
            for (var i = 0; i < sprites.Length; i++) if (sprites[i] == null) return false;
            return true;
        }

        private static bool HasButtonsWithInput<T>(Button[] buttons, int count) where T : Component
        {
            if (!HasButtons(buttons, count)) return false;
            for (var i = 0; i < buttons.Length; i++) if (buttons[i].GetComponent<T>() == null) return false;
            return true;
        }

        private static void BuildEditorGameplayBoards(HysjEditorLayout layout, Transform runtime)
        {
            var sharedHud = EnsureScreenGroup(runtime, "SharedHud");
            layout.gardenSharedHud = sharedHud.gameObject;
            MoveTo(layout.gardenTitle, sharedHud);
            MoveTo(layout.gardenStatus, sharedHud);
            MoveTo(layout.gardenMaturityCountdown, sharedHud);
            MoveTo(layout.gardenResource, sharedHud);
            MoveTo(layout.gardenPauseButton, sharedHud);

            var mainMode = EnsureScreenGroup(runtime, "MainModeRoot");
            layout.gardenMainModeRoot = mainMode.gameObject;
            MoveTo(layout.gardenPrimaryButton, mainMode);
            layout.gardenRoleAnimation = EnsureRoleAnimation(mainMode);

            var mainGrid = EnsureRectGroup(mainMode, "MainGridRoot", new Vector2(495, 545), new Vector2(.5f, 56.5f));
            ConfigureGrid(mainGrid, new Vector2(160, 181), new Vector2(7.5f, 1), 3);
            layout.gardenMainGridRoot = mainGrid;
            layout.gardenMainCells = new Button[9];
            layout.gardenMainEntityIcons = new Image[9];
            layout.gardenMainMouseIcons = new Image[9];
            for (var i = 0; i < layout.gardenMainCells.Length; i++)
            {
                var button = EnsureGameplayButton(mainGrid, "Cell" + i, string.Empty, new Vector2(160, 181), Color.white);
                var land = button.GetComponent<Image>();
                land.sprite = Sprite("image/tiandi");
                land.color = Color.white;
                land.preserveAspect = true;
                if (button.GetComponent<GardenSeedDragInput>() == null) button.gameObject.AddComponent<GardenSeedDragInput>();
                EnsureContentSlot(button.transform);
                layout.gardenMainEntityIcons[i] = EnsureEntityIcon(button.transform);
                layout.gardenMainMouseIcons[i] = EnsureMouseIcon(button.transform);
                EnsureHighlight(button.transform, Color.white, "image/tiandi2");
                ConfigureEntityLabel(button.transform);
                layout.gardenMainCells[i] = button;
            }

            // The role must render above the flower-field grid, but below the seed tray.
            layout.gardenRoleAnimation.transform.SetSiblingIndex(mainGrid.GetSiblingIndex() + 1);

            var seedTray = EnsureRectGroup(mainMode, "SeedTrayRoot", new Vector2(720, 248), new Vector2(0, -375));
            var seedContent = ConfigureSeedScroll(seedTray, out var seedScroll);
            layout.gardenSeedTrayRoot = seedTray;
            layout.gardenSeedScroll = seedScroll;
            layout.gardenSeedContent = seedContent;
            layout.gardenSeedIcons = new Image[6];
            layout.gardenSeedButtons = new Button[6];
            var seedLabels = new[]
            {
                "雏菊\n花币10", "向日葵\n花币30", "郁金香\n花币60",
                "薰衣草\n花币100", "铃兰\n花币180", "星光玫瑰\n花币300"
            };
            var seedEstimatedScores = new[] { 25, 80, 180, 320, 600, 1100 };
            layout.gardenPlantGrowthSprites = new Sprite[6];
            layout.gardenPlantBloomSprites = new Sprite[6];
            layout.gardenPlantResultSprites = new Sprite[6];
            layout.gardenMouseSprite = Sprite("image/老鼠");
            for (var i = 0; i < layout.gardenSeedButtons.Length; i++)
            {
                var existingSeed = seedContent.Find("Seed" + i) ?? seedTray.Find("Seed" + i);
                if (existingSeed != null && existingSeed.parent != seedContent) existingSeed.SetParent(seedContent, false);
                var button = EnsureGameplayButton(seedContent, "Seed" + i, seedLabels[i], new Vector2(135, 195), Color.white);
                var cardImage = button.GetComponent<Image>();
                cardImage.sprite = Sprite("image/kaipai");
                cardImage.color = Color.white;
                cardImage.type = Image.Type.Simple;
                cardImage.preserveAspect = true;
                if (button.GetComponent<GardenSeedDragInput>() == null) button.gameObject.AddComponent<GardenSeedDragInput>();
                var layoutElement = button.GetComponent<LayoutElement>();
                if (layoutElement == null) layoutElement = button.gameObject.AddComponent<LayoutElement>();
                layoutElement.minWidth = layoutElement.preferredWidth = 135;
                layoutElement.minHeight = layoutElement.preferredHeight = 195;
                layoutElement.flexibleWidth = layoutElement.flexibleHeight = 0;
                var artFolder = SeedArtFolders[i];
                var icon = EnsureSeedIcon(button.transform, Sprite("image/icon/" + artFolder + "/huahui1"));
                layout.gardenSeedIcons[i] = icon;
                layout.gardenPlantGrowthSprites[i] = Sprite("image/icon/" + artFolder + "/huahui2");
                layout.gardenPlantBloomSprites[i] = Sprite("image/icon/" + artFolder + "/huahui3");
                layout.gardenPlantResultSprites[i] = Sprite("image/icon/" + artFolder + "/huahui4");
                EnsurePriceIcon(button.transform);
                var text = button.transform.Find("Label")?.GetComponent<Text>();
                if (text != null)
                {
                    var split = seedLabels[i].Split('\n');
                    text.text = split[0];
                    text.fontSize = 22;
                    text.fontStyle = FontStyle.Bold;
                    text.color = new Color32(214, 92, 84, 255);
                    text.horizontalOverflow = HorizontalWrapMode.Overflow;
                    text.verticalOverflow = VerticalWrapMode.Overflow;
                    text.resizeTextForBestFit = false;
                    var textRect = text.rectTransform;
                    textRect.anchorMin = textRect.anchorMax = new Vector2(.5f, .5f);
                    textRect.pivot = new Vector2(.5f, .5f);
                    textRect.sizeDelta = new Vector2(128, 34);
                    textRect.anchoredPosition = new Vector2(0, 73);
                    EnsureSeedPriceLabel(button.transform, split[1].Replace("花币", string.Empty));
                    EnsureSeedEstimatedScoreLabel(button.transform, seedEstimatedScores[i]);
                }
                layout.gardenSeedButtons[i] = button;
            }

            var deleteZone = mainMode.Find("DeleteZone");
            if (deleteZone == null)
            {
                var zone = Panel(mainMode, "DeleteZone", new Vector2(720, 410), new Vector2(0, -435), new Color32(165, 65, 55, 65));
                zone.GetComponent<Image>().raycastTarget = false;
                Text(zone.transform, "Label", "松手删除植物并返还花币。", 28, Color.white, new Vector2(500, 50), new Vector2(0, -145));
                deleteZone = zone.transform;
            }
            deleteZone.SetAsFirstSibling();
            deleteZone.gameObject.SetActive(false);
            layout.gardenDeleteZone = deleteZone.gameObject;
            BuildGardenTutorialGuide(layout, mainMode);

            var repairMode = EnsureScreenGroup(runtime, "RepairModeRoot");
            layout.gardenRepairModeRoot = repairMode.gameObject;
            // Keep both tile sprites at their authored 139x155 size. Their visible
            // alpha bounds are 116x132, so negative spacing closes the margins
            // without changing the hit area or sprite pivot.
            var repairGrid = EnsureRectGroup(repairMode, "RepairGridRoot", GardenRepairGridSize, GardenRepairGridPosition);
            ConfigureGrid(repairGrid, GardenRepairCellSize, GardenRepairGridSpacing, 5);
            layout.gardenRepairGridRoot = repairGrid;
            layout.gardenRepairLandSprite = Sprite("image3/tiaodixiao");
            layout.gardenRepairSelectedLandSprite = Sprite("image3/tiaodifaguang");
            layout.gardenRepairPoolSprite = Sprite("image3/shuichi");
            layout.gardenRepairObstacleSprite = Sprite("image3/laohuda");
            layout.gardenRepairCells = new Button[35];
            for (var i = 0; i < layout.gardenRepairCells.Length; i++)
            {
                var button = EnsureGameplayButton(repairGrid, "Cell" + i, string.Empty, GardenRepairCellSize, Color.white);
                var land = button.GetComponent<Image>();
                land.sprite = layout.gardenRepairLandSprite;
                land.color = Color.white;
                land.type = Image.Type.Simple;
                land.preserveAspect = false;
                if (button.GetComponent<GardenRepairCellInput>() == null) button.gameObject.AddComponent<GardenRepairCellInput>();
                EnsureContentSlot(button.transform);
                EnsureHighlight(button.transform, Color.white, "image3/tiaodifaguang");
                button.transform.Find("Content")?.SetAsLastSibling();
                var highlight = button.transform.Find("Highlight")?.GetComponent<Image>();
                if (highlight != null) highlight.preserveAspect = false;
                EnsureRepairEntityIcon(button.transform);
                var label = button.transform.Find("Label")?.GetComponent<Text>();
                if (label != null)
                {
                    label.text = string.Empty;
                    label.enabled = false;
                }
                layout.gardenRepairCells[i] = button;
            }

            var waterTransform = repairMode.Find("RepairWaterFlowLayer");
            if (waterTransform == null)
            {
                var water = new GameObject("RepairWaterFlowLayer", typeof(RectTransform), typeof(GardenWaterFlowGraphic));
                water.transform.SetParent(repairMode, false);
                Stretch(water.GetComponent<RectTransform>());
                waterTransform = water.transform;
            }
            var waterGraphic = waterTransform.GetComponent<GardenWaterFlowGraphic>();
            if (waterGraphic == null) waterGraphic = waterTransform.gameObject.AddComponent<GardenWaterFlowGraphic>();
            waterGraphic.raycastTarget = false;
            waterGraphic.Width = 38f;
            waterTransform.SetAsLastSibling();
            waterTransform.gameObject.SetActive(false);
            layout.gardenRepairWaterFlow = waterGraphic;
            layout.gardenBoardVersion = GameplayBoardVersion;
            layout.formalImageVersion = FormalImageVersion;

            mainMode.gameObject.SetActive(true);
            repairMode.gameObject.SetActive(false);
            EnsurePausePopupTitleBand(layout.gardenPausePopup);
            EnsureGameplayPopupTitlesNormal(layout);
            MovePopupToTop(layout.gardenPausePopup);
            MovePopupToTop(layout.gardenWinPopup);
            MovePopupToTop(layout.gardenLosePopup);
            MovePopupToTop(layout.gardenRevivePopup);
            MovePopupToTop(layout.gardenGameOverPopup);
            MovePopupToTop(layout.gardenRepairSuccessPopup);
            MovePopupToTop(layout.gardenRepairFailPopup);
        }

        private static Image EnsureRoleAnimation(RectTransform parent)
        {
            var role = parent.Find("RoleAnimation") as RectTransform;
            if (role == null)
            {
                var node = new GameObject("RoleAnimation", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
                node.transform.SetParent(parent, false);
                role = node.GetComponent<RectTransform>();
            }
            role.anchorMin = Vector2.zero;
            role.anchorMax = Vector2.zero;
            role.pivot = Vector2.zero;
            role.sizeDelta = new Vector2(260f, 450f);
            role.anchoredPosition = new Vector2(-65f, 230f);
            role.SetAsFirstSibling();
            var image = role.GetComponent<Image>();
            image.color = Color.white;
            image.enabled = image.sprite != null;
            image.raycastTarget = false;
            image.preserveAspect = true;
            return image;
        }

        private static RectTransform EnsureScreenGroup(Transform parent, string name)
        {
            var existing = parent.Find(name) as RectTransform;
            if (existing != null) return existing;
            var node = new GameObject(name, typeof(RectTransform));
            node.transform.SetParent(parent, false);
            var rect = node.GetComponent<RectTransform>();
            Stretch(rect);
            return rect;
        }

        private static RectTransform EnsureRectGroup(Transform parent, string name, Vector2 size, Vector2 position)
        {
            var rect = parent.Find(name) as RectTransform;
            if (rect == null)
            {
                var node = new GameObject(name, typeof(RectTransform));
                node.transform.SetParent(parent, false);
                rect = node.GetComponent<RectTransform>();
            }
            rect.sizeDelta = size;
            rect.anchoredPosition = position;
            return rect;
        }

        private static void ConfigureGrid(RectTransform root, Vector2 cellSize, Vector2 spacing, int columns)
        {
            var grid = root.GetComponent<GridLayoutGroup>();
            if (grid == null) grid = root.gameObject.AddComponent<GridLayoutGroup>();
            grid.cellSize = cellSize;
            grid.spacing = spacing;
            grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
            grid.constraintCount = columns;
            grid.childAlignment = TextAnchor.UpperCenter;
            grid.startAxis = GridLayoutGroup.Axis.Horizontal;
            grid.startCorner = GridLayoutGroup.Corner.UpperLeft;
        }

        private static RectTransform ConfigureSeedScroll(RectTransform root, out ScrollRect scroll)
        {
            var obsoleteGrid = root.GetComponent<GridLayoutGroup>();
            if (obsoleteGrid != null) Object.DestroyImmediate(obsoleteGrid);

            var rootImage = root.GetComponent<Image>();
            if (rootImage == null) rootImage = root.gameObject.AddComponent<Image>();
            rootImage.sprite = Sprite("image/dikuangxiafang");
            rootImage.color = Color.white;
            rootImage.type = Image.Type.Simple;
            rootImage.preserveAspect = false;
            rootImage.raycastTarget = true;

            scroll = root.GetComponent<ScrollRect>();
            if (scroll == null) scroll = root.gameObject.AddComponent<ScrollRect>();
            scroll.horizontal = true;
            scroll.vertical = false;
            scroll.movementType = ScrollRect.MovementType.Elastic;
            scroll.elasticity = .12f;
            scroll.inertia = true;
            scroll.decelerationRate = .135f;
            scroll.scrollSensitivity = 32f;

            var viewport = root.Find("Viewport") as RectTransform;
            if (viewport == null)
            {
                var viewportNode = new GameObject("Viewport", typeof(RectTransform), typeof(Image), typeof(Mask));
                viewportNode.transform.SetParent(root, false);
                viewport = viewportNode.GetComponent<RectTransform>();
            }
            Stretch(viewport);
            viewport.offsetMin = new Vector2(8, 8);
            // Keep a right gutter so the reference layout opens with four complete cards.
            viewport.offsetMax = new Vector2(-64, -8);
            var viewportImage = viewport.GetComponent<Image>();
            if (viewportImage == null) viewportImage = viewport.gameObject.AddComponent<Image>();
            viewportImage.color = new Color(1f, 1f, 1f, .025f);
            viewportImage.raycastTarget = true;
            var mask = viewport.GetComponent<Mask>();
            if (mask == null) mask = viewport.gameObject.AddComponent<Mask>();
            mask.showMaskGraphic = false;

            var content = viewport.Find("Content") as RectTransform;
            if (content == null)
            {
                var contentNode = new GameObject("Content", typeof(RectTransform), typeof(HorizontalLayoutGroup), typeof(ContentSizeFitter));
                contentNode.transform.SetParent(viewport, false);
                content = contentNode.GetComponent<RectTransform>();
            }
            content.anchorMin = content.anchorMax = new Vector2(0, .5f);
            content.pivot = new Vector2(0, .5f);
            content.anchoredPosition = new Vector2(0, -5.5f);
            content.sizeDelta = new Vector2(0, 195);
            var horizontal = content.GetComponent<HorizontalLayoutGroup>();
            if (horizontal == null) horizontal = content.gameObject.AddComponent<HorizontalLayoutGroup>();
            // Keep the same total content width while moving the first card to
            // the reference image's x ~= 64px start position.
            horizontal.padding = new RectOffset(28, 84, 0, 0);
            horizontal.spacing = 17.5f;
            horizontal.childAlignment = TextAnchor.MiddleLeft;
            horizontal.childControlWidth = true;
            horizontal.childControlHeight = true;
            horizontal.childForceExpandWidth = false;
            horizontal.childForceExpandHeight = false;
            var fitter = content.GetComponent<ContentSizeFitter>();
            if (fitter == null) fitter = content.gameObject.AddComponent<ContentSizeFitter>();
            fitter.horizontalFit = ContentSizeFitter.FitMode.PreferredSize;
            fitter.verticalFit = ContentSizeFitter.FitMode.Unconstrained;

            scroll.viewport = viewport;
            scroll.content = content;
            return content;
        }

        private static Image EnsureSeedIcon(Transform parent, Sprite sprite)
        {
            var iconTransform = parent.Find("SeedIcon") as RectTransform;
            if (iconTransform == null)
            {
                var iconNode = new GameObject("SeedIcon", typeof(RectTransform), typeof(Image));
                iconNode.transform.SetParent(parent, false);
                iconTransform = iconNode.GetComponent<RectTransform>();
            }
            iconTransform.anchorMin = iconTransform.anchorMax = new Vector2(.5f, .5f);
            iconTransform.pivot = new Vector2(.5f, .5f);
            var nativeSize = sprite != null ? sprite.rect.size * 1.5f : new Vector2(48, 66);
            iconTransform.sizeDelta = new Vector2(Mathf.Min(nativeSize.x, 82), Mathf.Min(nativeSize.y, 112));
            iconTransform.anchoredPosition = new Vector2(0, 7);
            iconTransform.SetAsFirstSibling();
            var icon = iconTransform.GetComponent<Image>();
            if (icon == null) icon = iconTransform.gameObject.AddComponent<Image>();
            icon.sprite = sprite;
            icon.color = Color.white;
            icon.raycastTarget = false;
            icon.preserveAspect = true;
            return icon;
        }

        private static Image EnsureEntityIcon(Transform parent)
        {
            var iconTransform = parent.Find("EntityIcon") as RectTransform;
            if (iconTransform == null)
            {
                var iconNode = new GameObject("EntityIcon", typeof(RectTransform), typeof(Image));
                iconNode.transform.SetParent(parent, false);
                iconTransform = iconNode.GetComponent<RectTransform>();
            }
            iconTransform.anchorMin = iconTransform.anchorMax = new Vector2(.5f, .5f);
            iconTransform.pivot = new Vector2(.5f, .5f);
            iconTransform.sizeDelta = new Vector2(118, 128);
            iconTransform.anchoredPosition = new Vector2(0, 2);
            var icon = iconTransform.GetComponent<Image>();
            if (icon == null) icon = iconTransform.gameObject.AddComponent<Image>();
            icon.color = Color.white;
            icon.raycastTarget = false;
            icon.preserveAspect = true;
            icon.enabled = false;
            iconTransform.SetAsLastSibling();
            return icon;
        }

        private static Image EnsureRepairEntityIcon(Transform parent)
        {
            var content = parent.Find("Content") as RectTransform;
            if (content == null) return null;
            var iconTransform = content.Find("RepairEntity") as RectTransform;
            if (iconTransform == null)
            {
                var iconNode = new GameObject("RepairEntity", typeof(RectTransform), typeof(Image));
                iconNode.transform.SetParent(content, false);
                iconTransform = iconNode.GetComponent<RectTransform>();
            }
            iconTransform.anchorMin = iconTransform.anchorMax = new Vector2(.5f, .5f);
            iconTransform.pivot = new Vector2(.5f, .5f);
            iconTransform.sizeDelta = new Vector2(108, 112);
            iconTransform.anchoredPosition = Vector2.zero;
            var icon = iconTransform.GetComponent<Image>();
            if (icon == null) icon = iconTransform.gameObject.AddComponent<Image>();
            icon.sprite = null;
            icon.color = Color.white;
            icon.raycastTarget = false;
            icon.preserveAspect = true;
            icon.enabled = false;
            return icon;
        }

        private static Image EnsureMouseIcon(Transform parent)
        {
            var firstIcon = EnsureMouseHpIcon(parent, "MouseIcon", new Vector2(-48, 48));
            EnsureMouseHpIcon(parent, "MouseIcon2", new Vector2(48, 48));
            EnsureMouseHpIcon(parent, "MouseIcon3", new Vector2(-48, -48));
            EnsureMouseHpIcon(parent, "MouseIcon4", new Vector2(48, -48));
            return firstIcon;
        }

        private static Image EnsureMouseHpIcon(Transform parent, string name, Vector2 position)
        {
            var iconTransform = parent.Find(name) as RectTransform;
            if (iconTransform == null)
            {
                var iconNode = new GameObject(name, typeof(RectTransform), typeof(Image));
                iconNode.transform.SetParent(parent, false);
                iconTransform = iconNode.GetComponent<RectTransform>();
            }
            iconTransform.anchorMin = iconTransform.anchorMax = new Vector2(.5f, .5f);
            iconTransform.pivot = new Vector2(.5f, .5f);
            iconTransform.sizeDelta = new Vector2(62, 53);
            iconTransform.anchoredPosition = position;
            var icon = iconTransform.GetComponent<Image>();
            if (icon == null) icon = iconTransform.gameObject.AddComponent<Image>();
            icon.sprite = Sprite("image/老鼠");
            icon.color = Color.white;
            icon.raycastTarget = false;
            icon.preserveAspect = true;
            icon.enabled = false;
            iconTransform.SetAsLastSibling();
            return icon;
        }

        private static void EnsurePriceIcon(Transform parent)
        {
            var iconTransform = parent.Find("PriceIcon") as RectTransform;
            if (iconTransform == null)
            {
                var iconNode = new GameObject("PriceIcon", typeof(RectTransform), typeof(Image));
                iconNode.transform.SetParent(parent, false);
                iconTransform = iconNode.GetComponent<RectTransform>();
            }
            iconTransform.anchorMin = iconTransform.anchorMax = new Vector2(.5f, .5f);
            iconTransform.pivot = new Vector2(.5f, .5f);
            iconTransform.sizeDelta = new Vector2(30, 31);
            iconTransform.anchoredPosition = new Vector2(-26, -66);
            var image = iconTransform.GetComponent<Image>();
            if (image == null) image = iconTransform.gameObject.AddComponent<Image>();
            image.sprite = Sprite("image/huaduotubiao");
            image.color = Color.white;
            image.raycastTarget = false;
            image.preserveAspect = true;
        }

        private static Text EnsureSeedPriceLabel(Transform parent, string value)
        {
            var label = parent.Find("PriceLabel")?.GetComponent<Text>();
            if (label == null) label = Text(parent, "PriceLabel", value, 30, new Color32(137, 76, 20, 255), new Vector2(76, 38), new Vector2(25, -66));
            label.text = value;
            label.fontSize = 30;
            label.fontStyle = FontStyle.Bold;
            label.color = new Color32(137, 76, 20, 255);
            label.alignment = TextAnchor.MiddleCenter;
            label.horizontalOverflow = HorizontalWrapMode.Overflow;
            label.verticalOverflow = VerticalWrapMode.Overflow;
            SetRect(label.transform, new Vector2(76, 38), new Vector2(25, -66));
            return label;
        }

        private static Text EnsureSeedEstimatedScoreLabel(Transform parent, int value)
        {
            var label = parent.Find("EstimatedScoreLabel")?.GetComponent<Text>();
            if (label == null) label = Text(parent, "EstimatedScoreLabel", string.Empty, 15, new Color32(137, 76, 20, 255), new Vector2(128, 24), new Vector2(0, -38));
            label.text = "预计收益分数：" + value;
            label.fontSize = 15;
            label.fontStyle = FontStyle.Bold;
            label.color = new Color32(137, 76, 20, 255);
            label.alignment = TextAnchor.MiddleCenter;
            label.horizontalOverflow = HorizontalWrapMode.Wrap;
            label.verticalOverflow = VerticalWrapMode.Truncate;
            label.resizeTextForBestFit = true;
            label.resizeTextMinSize = 11;
            label.resizeTextMaxSize = 15;
            label.raycastTarget = false;
            SetRect(label.transform, new Vector2(128, 24), new Vector2(0, -38));
            label.transform.SetAsLastSibling();
            return label;
        }

        private static void BuildGardenTutorialGuide(HysjEditorLayout layout, Transform parent)
        {
            var guide = EnsureScreenGroup(parent, "TutorialGuide");
            layout.gardenTutorialGuideRoot = guide.gameObject;

            var maskTransform = guide.Find("Mask") as RectTransform;
            if (maskTransform == null)
            {
                var maskNode = new GameObject("Mask", typeof(RectTransform), typeof(Image));
                maskNode.transform.SetParent(guide, false);
                maskTransform = maskNode.GetComponent<RectTransform>();
            }
            Stretch(maskTransform);
            layout.gardenTutorialMask = maskTransform.GetComponent<Image>();
            layout.gardenTutorialMask.color = new Color32(0, 0, 0, 150);
            layout.gardenTutorialMask.raycastTarget = false;
            maskTransform.SetAsFirstSibling();

            layout.gardenTutorialSeedVisual = BuildGardenTutorialTargetVisual(
                guide,
                layout.gardenSeedIcons != null && layout.gardenSeedIcons.Length > 0 ? layout.gardenSeedIcons[0].gameObject : null,
                "SeedVisual");
            layout.gardenTutorialButtonVisual = BuildGardenTutorialTargetVisual(
                guide,
                layout.gardenPrimaryButton == null ? null : layout.gardenPrimaryButton.gameObject,
                "ButtonVisual");

            var bubbleTransform = guide.Find("Bubble") as RectTransform;
            if (bubbleTransform == null)
                bubbleTransform = AddSpriteImage(guide, "Bubble", "image/qipao", new Vector2(514, 89), new Vector2(0, 405)).rectTransform;
            SetRect(bubbleTransform, new Vector2(514, 89), new Vector2(0, 405));
            layout.gardenTutorialBubble = bubbleTransform.GetComponent<Image>();
            layout.gardenTutorialBubble.sprite = Sprite("image/qipao");
            layout.gardenTutorialBubble.color = Color.white;
            layout.gardenTutorialBubble.preserveAspect = true;
            layout.gardenTutorialBubble.raycastTarget = false;

            var guideText = guide.Find("Bubble/Text")?.GetComponent<Text>();
            if (guideText == null)
                guideText = Text(bubbleTransform, "Text", "请拖动种子进行播种。", 28, Color.white, new Vector2(480, 66), Vector2.zero);
            guideText.text = "请拖动种子进行播种。";
            guideText.fontSize = 28;
            guideText.fontStyle = FontStyle.Bold;
            guideText.color = Color.white;
            guideText.alignment = TextAnchor.MiddleCenter;
            guideText.horizontalOverflow = HorizontalWrapMode.Wrap;
            guideText.verticalOverflow = VerticalWrapMode.Truncate;
            guideText.resizeTextForBestFit = true;
            guideText.resizeTextMinSize = 20;
            guideText.resizeTextMaxSize = 28;
            guideText.raycastTarget = false;
            SetRect(guideText.transform, new Vector2(480, 66), Vector2.zero);
            AddTextOutline(guideText, Color.black, new Vector2(2, -2));
            layout.gardenTutorialText = guideText;

            var fingerTransform = guide.Find("Finger") as RectTransform;
            if (fingerTransform == null)
                fingerTransform = AddSpriteImage(guide, "Finger", "image/shouzhi", new Vector2(133, 140), Vector2.zero).rectTransform;
            SetRect(fingerTransform, new Vector2(133, 140), Vector2.zero);
            layout.gardenTutorialFinger = fingerTransform.GetComponent<Image>();
            layout.gardenTutorialFinger.sprite = Sprite("image/shouzhi");
            layout.gardenTutorialFinger.color = Color.white;
            layout.gardenTutorialFinger.preserveAspect = true;
            layout.gardenTutorialFinger.raycastTarget = false;

            guide.SetAsLastSibling();
            guide.gameObject.SetActive(false);
        }

        private static GameObject BuildGardenTutorialTargetVisual(Transform parent, GameObject source, string name)
        {
            var existing = parent.Find(name);
            if (existing != null) Object.DestroyImmediate(existing.gameObject);
            if (source == null) return null;

            var visual = Object.Instantiate(source, parent, false);
            visual.name = name;
            var rect = visual.GetComponent<RectTransform>();
            if (rect != null)
            {
                rect.anchorMin = rect.anchorMax = new Vector2(.5f, .5f);
                rect.pivot = new Vector2(.5f, .5f);
                rect.anchoredPosition = Vector2.zero;
                rect.localScale = Vector3.one;
            }
            foreach (var graphic in visual.GetComponentsInChildren<Graphic>(true)) graphic.raycastTarget = false;
            foreach (var selectable in visual.GetComponentsInChildren<Selectable>(true)) Object.DestroyImmediate(selectable);
            foreach (var input in visual.GetComponentsInChildren<GardenSeedDragInput>(true)) Object.DestroyImmediate(input);
            var layoutElement = visual.GetComponent<LayoutElement>();
            if (layoutElement != null) Object.DestroyImmediate(layoutElement);
            visual.SetActive(false);
            return visual;
        }

        private static void ConfigureEntityLabel(Transform parent)
        {
            var label = parent.Find("Label")?.GetComponent<Text>();
            if (label == null) return;
            var rect = label.rectTransform;
            rect.anchorMin = rect.anchorMax = new Vector2(.5f, 0);
            rect.pivot = new Vector2(.5f, 0);
            rect.sizeDelta = new Vector2(140, 30);
            rect.anchoredPosition = new Vector2(0, 12);
            label.fontSize = 20;
            label.color = Color.white;
            label.alignment = TextAnchor.MiddleCenter;
            label.raycastTarget = false;
            rect.SetAsLastSibling();
        }

        private static Button EnsureGameplayButton(Transform parent, string name, string label, Vector2 size, Color color)
        {
            var existing = parent.Find(name);
            Button button;
            if (existing == null) button = Button(parent, name, label, size, Vector2.zero, color);
            else
            {
                button = existing.GetComponent<Button>();
                if (button == null) button = existing.gameObject.AddComponent<Button>();
                var image = existing.GetComponent<Image>();
                if (image == null) image = existing.gameObject.AddComponent<Image>();
                button.targetGraphic = image;
                if (existing.GetComponentInChildren<Text>(true) == null) Text(existing, "Label", label, 26, Color.white, size - new Vector2(8, 8), Vector2.zero);
            }
            var rect = button.GetComponent<RectTransform>();
            if (rect != null) rect.sizeDelta = size;
            button.targetGraphic = button.GetComponent<Image>();
            return button;
        }

        private static void EnsureContentSlot(Transform parent)
        {
            var content = parent.Find("Content") as RectTransform;
            if (content == null)
            {
                var node = new GameObject("Content", typeof(RectTransform));
                node.transform.SetParent(parent, false);
                content = node.GetComponent<RectTransform>();
                Stretch(content);
            }
            content.SetAsFirstSibling();
        }

        private static void EnsureHighlight(Transform parent, Color color, string sprite = null)
        {
            var highlight = parent.Find("Highlight");
            if (highlight == null)
            {
                var node = new GameObject("Highlight", typeof(RectTransform), typeof(Image));
                node.transform.SetParent(parent, false);
                Stretch(node.GetComponent<RectTransform>());
                var image = node.GetComponent<Image>();
                image.color = color;
                image.raycastTarget = false;
                highlight = node.transform;
            }
            var highlightImage = highlight.GetComponent<Image>();
            if (highlightImage != null)
            {
                highlightImage.color = color;
                highlightImage.sprite = string.IsNullOrEmpty(sprite) ? null : Sprite(sprite);
                highlightImage.preserveAspect = !string.IsNullOrEmpty(sprite);
            }
            highlight.SetSiblingIndex(Mathf.Min(1, parent.childCount - 1));
            highlight.gameObject.SetActive(false);
        }

        private static void MoveTo(Component component, Transform parent)
        {
            if (component != null && component.transform.parent != parent) component.transform.SetParent(parent, false);
        }

        private static void MovePopupToTop(GameObject popup)
        {
            if (popup != null) popup.transform.SetAsLastSibling();
        }

        private static void EnsurePausePopupTitleBand(GameObject popup)
        {
            var panel = popup == null ? null : popup.transform.Find("Panel");
            if (panel == null) return;

            var title = panel.Find("Title");
            var band = panel.Find("TitleBand") as RectTransform;
            if (band == null)
            {
                band = AddSpriteImage(panel, "TitleBand", "image/biaotidi", new Vector2(270, 60), new Vector2(0, 67)).rectTransform;
            }
            else
            {
                SetRect(band, new Vector2(270, 60), new Vector2(0, 67));
                var image = band.GetComponent<Image>();
                if (image != null)
                {
                    image.sprite = Sprite("image/biaotidi");
                    image.color = Color.white;
                    image.type = Image.Type.Simple;
                    image.preserveAspect = true;
                }
            }

            // Keep the title artwork behind the text. Setting the same sibling
            // index as the title can leave the band above it after serialization.
            band.SetAsFirstSibling();
            if (title != null) title.SetSiblingIndex(1);
        }

        private static void EnsureGameplayPopupTitlesNormal(HysjEditorLayout layout)
        {
            if (layout == null) return;
            NormalizePopupTitle(layout.gardenPausePopup, "Title");
            NormalizePopupTitle(layout.gardenRevivePopup, "title");
            NormalizePopupTitle(layout.gardenRepairSuccessPopup, "title");
            NormalizePopupTitle(layout.gardenRepairFailPopup, "title");
        }

        private static void NormalizePopupTitle(GameObject popup, string titleName)
        {
            if (popup == null || string.IsNullOrEmpty(titleName)) return;
            var title = popup.transform.Find("Panel/" + titleName) ?? popup.transform.Find("panel/" + titleName);
            var text = title == null ? null : title.GetComponent<Text>();
            if (text != null) text.fontStyle = FontStyle.Normal;
        }

        private static void BuildGardenRepairUi(HysjEditorLayout layout, Transform parent)
        {
            DestroyChildIfPresent(parent, "RepairSuccessPopup");
            DestroyChildIfPresent(parent, "RepairFailPopup");
            layout.gardenRepairSuccessPopup = BuildRepairSuccessPopup(parent);
            layout.gardenRepairFailPopup = BuildRepairFailPopup(parent);
            layout.gardenRepairSuccessPopup.SetActive(false);
            layout.gardenRepairFailPopup.SetActive(false);
        }

        private static GameObject BuildRepairSuccessPopup(Transform parent)
        {
            var popup = BuildResultPopup(parent, "RepairSuccessPopup", "image2/tanchuangyouxichenggong", "image2/dikuangyouxichenggong", "image2/anniukong", "nextBtn", false);
            var button = FindDeep(popup.transform, "nextBtn")?.GetComponent<Button>();
            ConfigurePopupButtonLabel(button, "再来一局");
            return popup;
        }

        private static GameObject BuildRepairFailPopup(Transform parent)
        {
            return BuildResultPopup(parent, "RepairFailPopup", "image2/tanchuangyouxishibai", "image2/dikuangshibai", "image2/anniuchognxintiaozhan", "retryBtn", false);
        }

        private static void DestroyChildIfPresent(Transform parent, string name)
        {
            var child = parent.Find(name);
            if (child != null) Object.DestroyImmediate(child.gameObject);
        }

        private static GameObject BuildPausePopup(Transform parent)
        {
            var root = LegacyPopupRoot(parent, "PopupLayer");
            var panel = Panel(root.transform, "Panel", new Vector2(534, 304), Vector2.zero, Color.white, "image2/dikuangzanting");
            AddSpriteImage(panel.transform, "TitleBand", "image/biaotidi", new Vector2(270, 60), new Vector2(0, 67));
            var title = Text(panel.transform, "Title", "游戏暂停", 34, Color.white, new Vector2(260, 58), new Vector2(0, 67));
            title.fontStyle = FontStyle.Normal;
            AddTextOutline(title, new Color32(126, 72, 69, 255), new Vector2(2, -2));
            SpriteButton(panel.transform, "PrimaryBtn", new Vector2(201, 81), new Vector2(108, -72), "image2/anniujixuyouxi");
            SpriteButton(panel.transform, "BackBtn", new Vector2(201, 81), new Vector2(-108, -72), "image2/anniufanhuizhujiemian");
            return root;
        }

        private static GameObject BuildResultPopup(Transform parent, string name, string bodySprite, string resultBackgroundSprite, string actionSprite, string actionName, bool showStars)
        {
            var root = LegacyPopupRoot(parent, name);
            var panel = Panel(root.transform, "panel", new Vector2(529, 680), Vector2.zero, Color.white, bodySprite);
            var stars = new GameObject("Stars", typeof(RectTransform));
            stars.transform.SetParent(panel.transform, false);
            stars.GetComponent<RectTransform>().anchoredPosition = new Vector2(0, 111);
            stars.SetActive(showStars);
            for (var i = 0; i < 3; i++)
            {
                var star = AddSpriteImage(stars.transform, "star" + (i + 1), "image2/wujiaoxing2", new Vector2(51, 50), new Vector2(-56 + i * 56, 0));
                star.preserveAspect = false;
            }
            AddSpriteImage(panel.transform, "dikuangyouxijiesu", resultBackgroundSprite, new Vector2(424, 197), new Vector2(0, -61));
            var levelLabel = Text(panel.transform, "BestDistanceLabel", showStars ? "本关分数：0。" : string.Empty, 22, Color.white, new Vector2(390, 35), new Vector2(0, -50));
            levelLabel.fontStyle = FontStyle.Bold;
            AddTextOutline(levelLabel, new Color32(126, 72, 69, 255), new Vector2(2, -2));
            var valueLabel = Text(panel.transform, "DistanceLabel", showStars ? "捕获老鼠：0只。" : "当前分数：0。", 22, Color.white, new Vector2(390, 35), showStars ? new Vector2(0, -84) : new Vector2(0, -44));
            valueLabel.fontStyle = FontStyle.Bold;
            AddTextOutline(valueLabel, new Color32(126, 72, 69, 255), new Vector2(2, -2));
            var rewardLabel = Text(panel.transform, "GoldLabel", showStars ? "获得钻石：0。" : "最低通关分数：120。", 22, Color.white, new Vector2(390, 35), showStars ? new Vector2(0, -118) : new Vector2(0, -78));
            rewardLabel.fontStyle = FontStyle.Bold;
            AddTextOutline(rewardLabel, new Color32(126, 72, 69, 255), new Vector2(2, -2));
            SpriteButton(panel.transform, "backBtn", new Vector2(201, 81), new Vector2(-108, -264), "image2/anniufanhuizhujiemian");
            SpriteButton(panel.transform, actionName, new Vector2(201, 81), new Vector2(108, -264), actionSprite);
            return root;
        }

        private static GameObject BuildRevivePopup(Transform parent)
        {
            var root = LegacyPopupRoot(parent, "XuGuanPopup");
            var panel = Panel(root.transform, "panel", new Vector2(548, 445), new Vector2(0, -6), Color.white, "image/tanchuang3");
            AddSpriteImage(panel.transform, "dikuang2", "image/dikuang2", new Vector2(270, 60), new Vector2(0, 135));
            Text(panel.transform, "title", "是否续关", 40, new Color32(119, 47, 0, 255), new Vector2(160, 55), new Vector2(0, 135));
            AddSpriteImage(panel.transform, "peitu3", "image2/guanqiapeitu3", new Vector2(329, 115), new Vector2(-4, 34));
            SpriteButton(panel.transform, "backBtn", new Vector2(217, 95), new Vector2(-115, -135), "image2/anniufanhuizhujiemian");
            var continueButton = SpriteButton(panel.transform, "continueBtn", new Vector2(217, 95), new Vector2(115, -135), "image2/anniukong");
            AddSpriteImage(continueButton.transform, "anniubofang", "image2/jiahao", new Vector2(57, 66), new Vector2(92, 40));
            AddSpriteImage(panel.transform, "dikuangyouxijiesu", "image2/dikuangzi", new Vector2(377, 56), new Vector2(0, -57));
            Text(panel.transform, "DistanceLabel", "售价：0。", 18, new Color32(119, 47, 0, 255), new Vector2(180, 25), new Vector2(0, -46));
            Text(panel.transform, "GoldLabel", "抓捕奖励：0钻石。", 18, new Color32(119, 47, 0, 255), new Vector2(220, 25), new Vector2(0, -69));
            return root;
        }

        private static GameObject LegacyPopupRoot(Transform parent, string name)
        {
            var root = Screen(parent, name, Color.clear); var mask = AddSpriteImage(root.transform, "遮罩", "AtlasPicture/遮罩", new Vector2(2000, 2000), Vector2.zero); mask.color = new Color32(255, 255, 255, 180); return root;
        }

        private static Button SpriteButton(Transform parent, string name, Vector2 size, Vector2 position, string sprite)
        {
            var node = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button)); node.transform.SetParent(parent, false); var rect = node.GetComponent<RectTransform>(); rect.sizeDelta = size; rect.anchoredPosition = position; var image = node.GetComponent<Image>(); image.sprite = Sprite(sprite); image.color = Color.white; image.preserveAspect = true; var button = node.GetComponent<Button>(); button.targetGraphic = image; button.transition = Selectable.Transition.SpriteSwap; return button;
        }

        private static void ConfigurePopupButtonLabel(Button button, string value)
        {
            if (button == null) return;
            var label = button.transform.Find("Label")?.GetComponent<Text>();
            if (label == null) label = Text(button.transform, "Label", value, 30, Color.white, new Vector2(181, 73), Vector2.zero);
            label.font = Font;
            label.text = value;
            label.fontSize = 30;
            label.fontStyle = FontStyle.Normal;
            label.color = Color.white;
            label.alignment = TextAnchor.MiddleCenter;
            label.horizontalOverflow = HorizontalWrapMode.Overflow;
            label.verticalOverflow = VerticalWrapMode.Overflow;
            AddTextOutline(label, new Color32(187, 41, 70, 255), new Vector2(2, -2));
            label.raycastTarget = false;
            label.rectTransform.sizeDelta = new Vector2(181, 73);
            label.rectTransform.anchoredPosition = Vector2.zero;
            label.gameObject.SetActive(true);
        }

        private static void BuildPopups(HysjEditorLayout layout, Transform canvas)
        {
            layout.tips = Popup(canvas, "Tips", new Vector2(300, 40), Vector2.zero, new Color32(0, 0, 0, 190));
            layout.tipsLabel = Text(layout.tips.transform, "TipsLabel", string.Empty, 30, Color.white, new Vector2(600, 37.8f), Vector2.zero);
            layout.tipsWnd = Screen(canvas, "TipsWnd", new Color32(0, 0, 0, 155));
            EnsureFormalBackdrop(layout.tipsWnd.transform, "Notice");
            var tipsFrame = Panel(layout.tipsWnd.transform, "TipsWndFrame", new Vector2(534, 424), new Vector2(0, 85), Color.white, "image/tanchuang3");
            AddSpriteImage(tipsFrame.transform, "TitleBand", "image/biaotidi", new Vector2(223, 58), new Vector2(-.5f, 129));
            var tipsTitle = Text(tipsFrame.transform, "TipsWndTitle", "防沉迷提示", 38, Color.white, new Vector2(210, 58), new Vector2(-.5f, 129));
            SetFormalTitle(tipsTitle, 38, new Vector2(210, 58), new Vector2(-.5f, 129));
            layout.tipsWndLabel = Text(tipsFrame.transform, "TipsWndLabel", string.Empty, 20, Color.white, new Vector2(464, 188), Vector2.zero, TextAnchor.UpperLeft, VerticalWrapMode.Overflow);
            SetFormalBody(layout.tipsWndLabel, 20, new Vector2(464, 188), Vector2.zero, 1.5f);
            layout.tipsWndConfirm = Button(tipsFrame.transform, "Confirm", string.Empty, new Vector2(84, 87), new Vector2(262, 196.5f), Color.white, "image/guanbi");
            BuildShopConfirm(layout, layout.shopPanel.transform);
            BuildRechargeConfirm(layout, layout.rechargePanel.transform);
            layout.ageTipsPanel = Screen(canvas, "AgeTipsPanel", new Color32(0, 0, 0, 155));
            EnsureFormalBackdrop(layout.ageTipsPanel.transform, "AgeTips");
            var ageCard = Panel(layout.ageTipsPanel.transform, "AgeTipsForm", new Vector2(534, 594), Vector2.zero, Color.white, "image/tanchuang1");
            AddSpriteImage(ageCard.transform, "TitleBand", "image/biaotidi", new Vector2(223, 58), new Vector2(-.5f, 218));
            var ageTitle = Text(ageCard.transform, "AgeTipsTitle", "适龄提示", 40, Color.white, new Vector2(180, 58), new Vector2(-.5f, 218));
            SetFormalTitle(ageTitle, 40, new Vector2(180, 58), new Vector2(-.5f, 218));
            var ageText = "(1)本游戏是一款种植防守与休闲益智类游戏，适用于年满16周岁及以上的用户，建议未成年人在家长监护下使用游戏产品。\n" +
                          "(2)游戏有丰富多样的玩法，需要投入一定的时间和精力。\n" +
                          "(3)本游戏中有用户实名认证系统，未成年人的用户将接受以下管理:未成年用户仅可在周五、周六、周日和法定节假日的每日20时至21时体验1小时的网络游戏服务。游戏中部分玩法和道具需要付费。未满8周岁的用户不能付费;8周岁以上未满16周岁的未成年人用户，单次充值金额不得超过50元人民币，每月充值金额累计不得超过200元人民币;16周岁以上的未成年人用户，单次充值金额不得超过100元人民币，每月充值金额累计不得超过400元人民币。\n" +
                          "(4)游戏以花园种植、抓鼠防守和一笔浇灌为主题，能够带给玩家轻松愉悦的游戏体验。";
            var ageBody = Text(ageCard.transform, "AgeTipsText", ageText, 20, Color.white, new Vector2(470, 423), new Vector2(1, -32), TextAnchor.UpperLeft, VerticalWrapMode.Overflow);
            SetFormalBody(ageBody, 20, new Vector2(470, 423), new Vector2(1, -32), 1.25f);
            layout.ageTipsCloseButton = Button(ageCard.transform, "AgeTipsClose", string.Empty, new Vector2(84, 87), new Vector2(262, 281.5f), Color.white, "image/guanbi");
        }

        private static void BuildShopConfirm(HysjEditorLayout layout, Transform parent)
        {
            layout.shopConfirmPanel = Screen(parent, "ShopConfirmPanel", new Color32(255, 255, 255, 150), "AtlasPicture/遮罩");
            layout.shopConfirmPanel.GetComponent<Image>().color = new Color32(255, 255, 255, 150);
            var frame = Panel(layout.shopConfirmPanel.transform, "ShopConfirmFrame", new Vector2(534, 424), Vector2.zero, Color.white, "image/tanchuang3");
            layout.shopConfirmLabel = Text(frame.transform, "ShopConfirmLabel", string.Empty, 24, Color.white, new Vector2(360, 32.76f), new Vector2(0, 64.088f), TextAnchor.MiddleCenter, VerticalWrapMode.Overflow);
            layout.shopConfirmLabel.horizontalOverflow = HorizontalWrapMode.Overflow;
            layout.shopCancelButton = Button(frame.transform, "ShopCancel", "取消", new Vector2(201, 81), new Vector2(-108, -124), Color.white, "image2/anniukong");
            layout.shopConfirmButton = Button(frame.transform, "ShopConfirm", "确定", new Vector2(201, 81), new Vector2(108, -124), Color.white, "image2/anniukong");
        }

        private static void BuildRechargeConfirm(HysjEditorLayout layout, Transform parent)
        {
            layout.rechargeConfirmPanel = Screen(parent, "RechargeConfirmPanel", new Color32(0, 0, 0, 125));
            var frame = Panel(layout.rechargeConfirmPanel.transform, "RechargeConfirmFrame", new Vector2(534, 424), Vector2.zero, Color.white, "image/tanchuang3");
            layout.rechargeConfirmLabel = Text(frame.transform, "RechargeConfirmLabel", string.Empty, 24, Color.white, new Vector2(360, 32.76f), new Vector2(0, 64.088f), TextAnchor.MiddleCenter, VerticalWrapMode.Overflow);
            layout.rechargeCancelButton = Button(frame.transform, "RechargeCancel", "取消", new Vector2(201, 81), new Vector2(-108, -124), Color.white, "image2/anniukong");
            layout.rechargeConfirmButton = Button(frame.transform, "RechargeConfirm", "确定", new Vector2(201, 81), new Vector2(108, -124), Color.white, "image2/anniukong");
        }

        private static GameObject ModulePanel(Transform canvas, string name, string title, out Button close)
        {
            var panel = Screen(canvas, name, new Color32(0, 0, 0, 155));
            PopulateModulePanel(panel, title, out close);
            return panel;
        }

        private static void PopulateModulePanel(GameObject panel, string title, out Button close)
        {
            var name = panel.name;
            var compact = name == "SettingsPanel";
            var frame = Panel(panel.transform, "Frame", compact ? new Vector2(534, 424) : new Vector2(534, 792), Vector2.zero, Color.white, compact ? "image/tanchuang3" : "image/tanchuang2");
            Vector2 titlePosition;
            Vector2 closePosition;
            if (compact)
            {
                titlePosition = new Vector2(.5f, 131);
                closePosition = new Vector2(250, 182.5f);
            }
            else if (name == "LevelSelectPanel")
            {
                titlePosition = new Vector2(-.5f, 317);
                closePosition = new Vector2(251, 372.5f);
            }
            else if (name == "RankPanel")
            {
                titlePosition = new Vector2(-.5f, 317);
                closePosition = new Vector2(253, 372.5f);
            }
            else
            {
                titlePosition = new Vector2(.5f, 312);
                closePosition = new Vector2(250, 377.5f);
            }
            AddSpriteImage(frame.transform, "TitleBand", "image/biaotidi", new Vector2(223, 58), titlePosition);
            var titleLabel = Text(frame.transform, "Title", title, 40, Color.white, new Vector2(220, 58), titlePosition);
            titleLabel.fontStyle = FontStyle.Normal;
            close = Button(frame.transform, "Close", string.Empty, new Vector2(84, 87), closePosition, Color.white, "image/guanbi");
            if (name == "RankPanel")
            {
                var header = Panel(panel.transform, "RankHeader", new Vector2(467, 52), new Vector2(0, 254), Color.clear);
                var headerColor = new Color32(255, 207, 146, 255);
                Text(header.transform, "RankHeaderRank", "排名", 26, headerColor, new Vector2(70, 42), new Vector2(-178, 0));
                Text(header.transform, "RankHeaderName", "玩家名字", 26, headerColor, new Vector2(150, 42), Vector2.zero);
                Text(header.transform, "RankHeaderLevel", "关卡", 26, headerColor, new Vector2(70, 42), new Vector2(178, 0));

                var self = Panel(panel.transform, "RankSelf", new Vector2(467, 62), new Vector2(0, -318), Color.white, "image2/dikuanghong");
                var selfMask = self.AddComponent<Mask>();
                selfMask.showMaskGraphic = false;
                Band(self.transform, "SelfBackground", new Color32(154, 202, 91, 255), Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
                var selfColor = Color.white;
                Text(self.transform, "RankSelfRank", "1", 26, selfColor, new Vector2(70, 40), new Vector2(-178, 0));
                Text(self.transform, "RankSelfName", "玩家名字", 26, selfColor, new Vector2(150, 40), Vector2.zero);
                Text(self.transform, "RankSelfLevel", "1", 26, selfColor, new Vector2(70, 40), new Vector2(178, 0));
            }
        }

        private static GameObject ItemTemplate(Transform parent, string name, Vector2 size)
        {
            var item = Panel(parent, name, size, Vector2.zero, Color.clear);
            LayoutRoot(item, size);
            AddSpriteImage(item.transform, "ItemBackground", "image2/dikuangzi", new Vector2(Mathf.Min(471, size.x + 12), 72), Vector2.zero);
            Text(item.transform, "Title", "标题", 26, Color.white, new Vector2(Mathf.Max(220, size.x - 190), 40), new Vector2(-105, 18), TextAnchor.MiddleLeft);
            Text(item.transform, "Detail", "说明", 20, new Color32(255, 238, 196, 255), new Vector2(Mathf.Max(220, size.x - 190), 36), new Vector2(-105, -18), TextAnchor.MiddleLeft);
            var action = Button(item.transform, "Action", "操作", new Vector2(150, 64), new Vector2(size.x / 2 - 90, 0), Color.white, "image2/anniushiyong");
            action.GetComponentInChildren<Text>().name = "ActionLabel";
            return item;
        }

        private static void BuildShopGoldBalance(HysjEditorLayout layout, Transform panel)
        {
            BuildGoldBalance(panel, out layout.shopGoldLabel);
        }

        private static void BuildAchievementGoldBalance(HysjEditorLayout layout, Transform panel)
        {
            BuildGoldBalance(panel, out layout.achievementGoldLabel);
        }

        private static void BuildGoldBalance(Transform panel, out Text balanceLabel)
        {
            balanceLabel = null;
            var frame = panel == null ? null : panel.Find("Frame");
            if (frame == null) return;
            AddSpriteImage(frame, "GoldIcon", "image2/zuanshi", new Vector2(55, 52), new Vector2(-32, 250));
            var label = Text(frame, "GoldValue", "4000", 30, Color.white, new Vector2(110, 45), new Vector2(-2, 250), TextAnchor.MiddleLeft, VerticalWrapMode.Overflow);
            label.rectTransform.pivot = new Vector2(0, .5f);
            AddTextOutline(label, new Color32(164, 76, 65, 255), new Vector2(2, -2));
            balanceLabel = label;
        }

        private static GameObject RankItemTemplate(Transform parent, string name)
        {
            var item = Panel(parent, name, new Vector2(467, 62), Vector2.zero, Color.clear);
            LayoutRoot(item, new Vector2(467, 62));
            AddSpriteImage(item.transform, "RowBackground", "image2/dikuanghong", new Vector2(467, 62), Vector2.zero);
            var rankColor = Color.white;
            Text(item.transform, "RankValue", "1", 26, rankColor, new Vector2(70, 40), new Vector2(-178, 0));
            Text(item.transform, "PlayerName", "玩家1", 26, rankColor, new Vector2(150, 40), Vector2.zero);
            Text(item.transform, "MaxLevel", "1", 26, rankColor, new Vector2(70, 40), new Vector2(178, 0));
            var action = Button(item.transform, "Action", string.Empty, new Vector2(1, 1), Vector2.zero, Color.clear);
            action.GetComponentInChildren<Text>(true).name = "IgnoreLabel";
            return item;
        }

        private static GameObject LevelItemTemplate(Transform parent, string name)
        {
            var item = Panel(parent, name, new Vector2(209, 192), Vector2.zero, Color.clear);
            LayoutRoot(item, new Vector2(209, 192));
            AddSpriteImage(item.transform, "LevelBackground", "image2/guanqiapeitu1", new Vector2(209, 143), new Vector2(0, 5.5f));
            var locked = Panel(item.transform, "LockedOverlay", new Vector2(205, 139), new Vector2(0, 5.5f), Color.clear);
            var lockedMask = AddSpriteImage(locked.transform, "heidi", "AtlasPicture/heidi", new Vector2(205, 139), Vector2.zero);
            lockedMask.color = new Color32(255, 255, 255, 200);
            lockedMask.raycastTarget = false;
            var lockIcon = AddSpriteImage(locked.transform, "suo", "AtlasPicture/suo", new Vector2(55, 76), Vector2.zero);
            lockIcon.raycastTarget = false;
            AddSpriteImage(item.transform, "LevelBand", "image2/dikuangguanqia", new Vector2(119, 47), new Vector2(1, 71.5f));
            Text(item.transform, "Title", "第 1 关", 28, new Color32(163, 85, 78, 255), new Vector2(120, 40), new Vector2(1, 71.5f));
            AddSpriteImage(item.transform, "Star1", "image2/wujiaoxing2", new Vector2(51, 50), new Vector2(-51, -48));
            AddSpriteImage(item.transform, "Star2", "image2/wujiaoxing2", new Vector2(51, 50), new Vector2(3, -48));
            AddSpriteImage(item.transform, "Star3", "image2/wujiaoxing2", new Vector2(51, 50), new Vector2(57, -48));
            var action = Button(item.transform, "Action", string.Empty, new Vector2(209, 192), Vector2.zero, Color.clear);
            action.GetComponentInChildren<Text>(true).name = "ActionLabel";
            action.GetComponentInChildren<Text>(true).gameObject.SetActive(false);
            return item;
        }

        private static GameObject ShopItemTemplate(Transform parent, string name)
        {
            var item = Panel(parent, name, new Vector2(201, 281), Vector2.zero, Color.clear);
            LayoutRoot(item, new Vector2(201, 281));
            AddSpriteImage(item.transform, "ShopBackground", "image2/dikuangshangdian", new Vector2(201, 189), new Vector2(0, 44.5f));
            AddSpriteImage(item.transform, "ShopIcon", "image2/2", new Vector2(114, 176), new Vector2(0, 31));
            var title = Text(item.transform, "Title", "角色名字", 26, new Color32(164, 88, 81, 255), new Vector2(180, 38), new Vector2(0, 112));
            title.fontStyle = FontStyle.Bold;
            title.alignByGeometry = true;
            title.horizontalOverflow = HorizontalWrapMode.Overflow;
            title.verticalOverflow = VerticalWrapMode.Overflow;
            Text(item.transform, "Detail", string.Empty, 20, new Color32(164, 88, 81, 255), new Vector2(180, 32), new Vector2(0, 10));
            var action = Button(item.transform, "Action", string.Empty, new Vector2(201, 81), new Vector2(0, -69.5f), Color.white, "image2/anniushiyong");
            AddSpriteImage(action.transform, "PriceIcon", "image2/zuanshi", new Vector2(55, 52), new Vector2(-43, 0));
            var actionLabel = action.GetComponentInChildren<Text>(true);
            actionLabel.name = "ActionLabel";
            actionLabel.fontSize = 30;
            actionLabel.rectTransform.sizeDelta = new Vector2(100, 42);
            actionLabel.rectTransform.anchoredPosition = new Vector2(30, 0);
            actionLabel.gameObject.SetActive(false);
            AddTextOutline(actionLabel, new Color32(187, 41, 70, 255), new Vector2(2, -2));
            return item;
        }

        private static GameObject AchievementItemTemplate(Transform parent, string name)
        {
            var item = Panel(parent, name, new Vector2(201, 272), Vector2.zero, Color.clear);
            LayoutRoot(item, new Vector2(201, 272));
            AddSpriteImage(item.transform, "bg", "image2/dikuangshangdian", new Vector2(201, 189), new Vector2(0, 40));
            var title = Text(item.transform, "Title", "任务描述", 26, new Color32(164, 88, 81, 255), new Vector2(180, 38), new Vector2(0, 109));
            title.fontStyle = FontStyle.Bold;
            title.horizontalOverflow = HorizontalWrapMode.Overflow;
            title.verticalOverflow = VerticalWrapMode.Overflow;
            var detail = Text(item.transform, "Detail", "文案描述文案描述", 20, new Color32(164, 88, 81, 255), new Vector2(170, 60), new Vector2(0, 45), TextAnchor.UpperLeft, VerticalWrapMode.Overflow);
            detail.lineSpacing = 1.1f;
            AddSpriteImage(item.transform, "icon", "image2/zuanshi", new Vector2(55, 52), new Vector2(-34, -18));
            var rewardAmount = Text(item.transform, "RewardAmount", "8888", 30, Color.white, new Vector2(90, 42), new Vector2(29, -18));
            AddTextOutline(rewardAmount, new Color32(187, 41, 70, 255), new Vector2(2, -2));
            var claimButtonNode = new GameObject("claimButton", typeof(RectTransform), typeof(Button));
            claimButtonNode.transform.SetParent(item.transform, false);
            var claimButtonRect = claimButtonNode.GetComponent<RectTransform>();
            claimButtonRect.sizeDelta = new Vector2(100, 40);
            claimButtonRect.anchoredPosition = new Vector2(0, -74);
            var claimButton = claimButtonNode.GetComponent<Button>();
            var claimBackground = AddSpriteImage(claimButtonNode.transform, "Background", "image2/anniulingqu", new Vector2(201, 81), Vector2.zero);
            claimBackground.type = Image.Type.Simple;
            claimButton.targetGraphic = claimBackground;
            // Creator uses auto-gray on this button. Unity's color-tint alpha
            // would make the PNG translucent, so gray is applied explicitly
            // by the runtime while this control keeps its original opacity.
            claimButton.transition = Selectable.Transition.None;
            var colors = claimButton.colors;
            colors.normalColor = new Color32(230, 230, 230, 255);
            colors.highlightedColor = Color.white;
            colors.pressedColor = new Color32(200, 200, 200, 255);
            colors.disabledColor = new Color32(128, 128, 128, 255);
            colors.colorMultiplier = 1f;
            colors.fadeDuration = .1f;
            claimButton.colors = colors;
            var claimed = AddSpriteImage(item.transform, "claimed", "image2/anniuyilingqu", new Vector2(201, 81), new Vector2(0, -74));
            claimed.gameObject.SetActive(false);
            return item;
        }

        private static GameObject RechargeItemTemplate(Transform parent, string name)
        {
            var item = Panel(parent, name, new Vector2(192, 198), Vector2.zero, Color.clear);
            LayoutRoot(item, new Vector2(192, 198));
            AddSpriteImage(item.transform, "ChargeBackground", "image2/dikuangzuanshi", new Vector2(192, 149), new Vector2(0, 25));
            AddSpriteImage(item.transform, "ChargeIcon", "image2/zuanshi", new Vector2(55, 52), new Vector2(-35, 25));
            var amount = Text(item.transform, "Title", "8888", 30, Color.white, new Vector2(95, 42), new Vector2(28, 25));
            AddTextOutline(amount, new Color32(187, 41, 70, 255), new Vector2(2, -2));
            Text(item.transform, "Detail", "", 18, new Color32(119, 47, 0, 255), new Vector2(190, 32), new Vector2(0, 8));
            var action = Button(item.transform, "Action", string.Empty, new Vector2(159, 63), new Vector2(0, -37), Color.white, "image2/￥6");
            action.GetComponentInChildren<Text>(true).name = "ActionLabel";
            action.GetComponentInChildren<Text>(true).gameObject.SetActive(false);
            return item;
        }

        private static GameObject RewardItemTemplate(Transform parent, string name, string cardSprite, bool isOnlineReward)
        {
            var item = Panel(parent, name, new Vector2(160, 210), Vector2.zero, Color.clear);
            LayoutRoot(item, new Vector2(160, 210));
            AddSpriteImage(item.transform, "bg", "image2/dikuangjiangli", new Vector2(145, 158), new Vector2(0, 26));

            var title = Text(item.transform, "dayLabel", isOnlineReward ? "初入" : "周一", 26,
                new Color32(164, 88, 81, 255), new Vector2(130, 42), new Vector2(0, 66),
                TextAnchor.MiddleCenter, VerticalWrapMode.Overflow);
            title.fontStyle = FontStyle.Bold;
            title.horizontalOverflow = HorizontalWrapMode.Wrap;

            // rewardBg is intentionally transparent in Start.fire. The prior
            // Unity port added a dark rectangle here, which is not part of the
            // Cocos reward-card artwork.
            var rewardBg = Panel(item.transform, "rewardBg", new Vector2(160, 66), new Vector2(0, 14), Color.clear);
            AddSpriteImage(rewardBg.transform, "coin", "image2/zuanshi", new Vector2(55, 52), new Vector2(-35, 0));
            var rewardLabel = Text(rewardBg.transform, "rewardLabel", "8888", 28, Color.white,
                new Vector2(88, 42), new Vector2(25, 0), TextAnchor.MiddleCenter, VerticalWrapMode.Overflow);
            AddTextOutline(rewardLabel, new Color32(187, 41, 70, 255), new Vector2(2, -2));

            var claimButton = RewardClaimButton(item.transform, new Vector2(0, -48));
            if (isOnlineReward)
            {
                var claimText = Text(claimButton.transform, "claimText", string.Empty, 16, Color.white,
                    new Vector2(133, 40), Vector2.zero, TextAnchor.MiddleCenter, VerticalWrapMode.Truncate);
                AddTextOutline(claimText, new Color32(126, 72, 69, 255), new Vector2(2, -2));
            }
            return item;
        }

        private static Button RewardClaimButton(Transform parent, Vector2 position)
        {
            var node = new GameObject("claimButton", typeof(RectTransform), typeof(Image), typeof(Button));
            node.transform.SetParent(parent, false);
            var rect = node.GetComponent<RectTransform>();
            rect.sizeDelta = new Vector2(145, 58);
            rect.anchoredPosition = position;
            var image = node.GetComponent<Image>();
            image.sprite = Sprite("image2/anniulingqu");
            image.color = Color.white;
            image.type = Image.Type.Simple;
            var button = node.GetComponent<Button>();
            button.targetGraphic = image;
            button.transition = Selectable.Transition.None;
            return button;
        }

        private static GameObject Screen(Transform parent, string name, Color color, string sprite = null)
        {
            var node = new GameObject(name, typeof(RectTransform), typeof(Image)); node.transform.SetParent(parent, false); Stretch(node.GetComponent<RectTransform>()); node.GetComponent<Image>().color = color;
            if (!string.IsNullOrWhiteSpace(sprite)) { var loaded = Sprite(sprite); if (loaded != null) { node.GetComponent<Image>().sprite = loaded; node.GetComponent<Image>().color = Color.white; node.GetComponent<Image>().type = Image.Type.Simple; } }
            return node;
        }

        private static UnityEngine.UI.Image AddSpriteImage(Transform parent, string name, string resourcePath, Vector2 size, Vector2 position, Transform explicitParent = null)
        {
            var targetParent = explicitParent == null ? parent : explicitParent;
            var node = new GameObject(name, typeof(RectTransform), typeof(UnityEngine.UI.Image));
            node.transform.SetParent(targetParent, false);
            var rect = node.GetComponent<RectTransform>();
            rect.sizeDelta = size;
            rect.anchoredPosition = position;
            var image = node.GetComponent<UnityEngine.UI.Image>();
            image.sprite = Sprite(resourcePath);
            image.preserveAspect = true;
            return image;
        }

        private static GameObject Popup(Transform parent, string name, Vector2 size, Vector2 position, Color color)
        {
            var node = Panel(parent, name, size, position, color); return node;
        }

        private static GameObject Panel(Transform parent, string name, Vector2 size, Vector2 position, Color color, string sprite = null)
        {
            var node = new GameObject(name, typeof(RectTransform), typeof(Image)); node.transform.SetParent(parent, false); var rect = node.GetComponent<RectTransform>(); rect.sizeDelta = size; rect.anchoredPosition = position; var image = node.GetComponent<Image>(); image.color = color; var loaded = Sprite(sprite); if (loaded != null) { image.sprite = loaded; image.color = Color.white; image.type = Image.Type.Simple; } return node;
        }

        private static void LayoutRoot(GameObject item, Vector2 size)
        {
            if (item == null) return;
            var layout = item.GetComponent<LayoutElement>();
            if (layout == null) layout = item.AddComponent<LayoutElement>();
            layout.minWidth = size.x;
            layout.preferredWidth = size.x;
            layout.minHeight = size.y;
            layout.preferredHeight = size.y;
        }

        private static GameObject Band(Transform parent, string name, Color color, Vector2 min, Vector2 max, Vector2 offsetMin, Vector2 offsetMax)
        {
            var node = new GameObject(name, typeof(RectTransform), typeof(Image)); node.transform.SetParent(parent, false); var rect = node.GetComponent<RectTransform>(); rect.anchorMin = min; rect.anchorMax = max; rect.offsetMin = offsetMin; rect.offsetMax = offsetMax; node.GetComponent<Image>().color = color; return node;
        }

        private static Text Text(Transform parent, string name, string value, int size, Color color, Vector2 dimensions, Vector2 position, TextAnchor alignment = TextAnchor.MiddleCenter, VerticalWrapMode verticalOverflow = VerticalWrapMode.Truncate)
        {
            var node = new GameObject(name, typeof(RectTransform), typeof(Text)); node.transform.SetParent(parent, false); var rect = node.GetComponent<RectTransform>(); rect.sizeDelta = dimensions; rect.anchoredPosition = position; var text = node.GetComponent<Text>(); text.font = Font; text.text = value; text.fontSize = size; text.color = color; text.alignment = alignment; text.horizontalOverflow = HorizontalWrapMode.Wrap; text.verticalOverflow = verticalOverflow; return text;
        }

        private static Button Button(Transform parent, string name, string label, Vector2 size, Vector2 position, Color color, string sprite = null)
        {
            var node = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button)); node.transform.SetParent(parent, false); var rect = node.GetComponent<RectTransform>(); rect.sizeDelta = size; rect.anchoredPosition = position; var image = node.GetComponent<Image>(); image.color = color; var loaded = Sprite(sprite); if (loaded != null) { image.sprite = loaded; image.color = Color.white; image.type = Image.Type.Simple; } Text(node.transform, "Label", label, 30, Color.white, size - new Vector2(20, 8), Vector2.zero); return node.GetComponent<Button>();
        }

        private static InputField Input(Transform parent, string name, string placeholder, Vector2 size, Vector2 position, bool password, string sprite = null)
        {
            var node = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(InputField)); node.transform.SetParent(parent, false); var rect = node.GetComponent<RectTransform>(); rect.sizeDelta = size; rect.anchoredPosition = position; var image = node.GetComponent<Image>(); image.color = Color.white; var loaded = Sprite(sprite); if (loaded != null) { image.sprite = loaded; image.type = Image.Type.Simple; } var input = node.GetComponent<InputField>(); var value = Text(node.transform, "Text", string.Empty, 26, HysjUiPalette.Ink, size - new Vector2(20, 8), Vector2.zero, TextAnchor.MiddleLeft); var hint = Text(node.transform, "Placeholder", placeholder, 24, new Color32(150, 130, 105, 255), size - new Vector2(20, 8), Vector2.zero, TextAnchor.MiddleLeft); input.textComponent = value; input.placeholder = hint; input.contentType = password ? InputField.ContentType.Password : InputField.ContentType.Standard; return input;
        }

        private static Toggle Toggle(Transform parent, string name, string label, bool value, Vector2 position)
        {
            var node = new GameObject(name, typeof(RectTransform), typeof(Toggle)); node.transform.SetParent(parent, false); var rect = node.GetComponent<RectTransform>(); rect.sizeDelta = new Vector2(520, 64); rect.anchoredPosition = position; var background = Band(node.transform, "Background", new Color32(220, 215, 200, 255), new Vector2(0, .5f), new Vector2(0, .5f), Vector2.zero, Vector2.zero); var bgRect = background.GetComponent<RectTransform>(); bgRect.sizeDelta = new Vector2(52, 52); bgRect.anchoredPosition = new Vector2(26, 0); var check = Band(background.transform, "Checkmark", HysjUiPalette.Jade, Vector2.zero, Vector2.one, new Vector2(8, 8), new Vector2(-8, -8)); var toggle = node.GetComponent<Toggle>(); toggle.targetGraphic = background.GetComponent<Image>(); toggle.graphic = check.GetComponent<Image>(); toggle.isOn = value; Text(node.transform, "Label", label, 30, HysjUiPalette.Ink, new Vector2(430, 60), new Vector2(90, 0)); return toggle;
        }

        private static Toggle SpriteToggle(Transform parent, string name, Vector2 size, Vector2 position, string sprite)
        {
            var node = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Toggle));
            node.transform.SetParent(parent, false);
            var rect = node.GetComponent<RectTransform>(); rect.sizeDelta = size; rect.anchoredPosition = position;
            var image = node.GetComponent<Image>(); image.sprite = Sprite(sprite); image.color = Color.white; image.type = Image.Type.Simple;
            var toggle = node.GetComponent<Toggle>(); toggle.targetGraphic = image; toggle.isOn = true;
            return toggle;
        }

        private static Canvas CreateCanvas(Transform parent)
        {
            var node = new GameObject("HysjCanvas", typeof(RectTransform), typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            node.transform.SetParent(parent, false);
            node.transform.localScale = Vector3.one;
            Stretch(node.GetComponent<RectTransform>());
            var canvas = node.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 50;
            var scaler = node.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(720, 1280);
            // Start.fire Canvas: designResolution 720x1280, fitWidth=true,
            // fitHeight=false.
            scaler.matchWidthOrHeight = 0f;
            return canvas;
        }

        private static void CreateEventSystem()
        {
            if (Object.FindObjectOfType<UnityEngine.EventSystems.EventSystem>() == null) new GameObject("EventSystem", typeof(UnityEngine.EventSystems.EventSystem), typeof(UnityEngine.EventSystems.StandaloneInputModule));
        }

        private static void CreateCamera()
        {
            var cameraObject = new GameObject("Main Camera", typeof(Camera), typeof(AudioListener));
            cameraObject.tag = "MainCamera";
            var camera = cameraObject.GetComponent<Camera>();
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color32(18, 22, 20, 255);
            camera.orthographic = true;
            camera.orthographicSize = 5f;
        }

        private static void Stretch(RectTransform rect) { rect.anchorMin = Vector2.zero; rect.anchorMax = Vector2.one; rect.offsetMin = Vector2.zero; rect.offsetMax = Vector2.zero; }
        private static Font Font => _font ?? (_font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf"));

        private static Sprite Sprite(string resourcePath)
        {
            if (string.IsNullOrWhiteSpace(resourcePath)) return null;
            var assetPath = "Assets/Resources/HysjLegacy/" + resourcePath + ".png";
            return AssetDatabase.LoadAssetAtPath<Sprite>(assetPath);
        }

        private static void EnsureDirectories() { if (!AssetDatabase.IsValidFolder("Assets/Prefabs")) AssetDatabase.CreateFolder("Assets", "Prefabs"); }
        private static void ConfigureSprites()
        {
            var paths = AssetDatabase.FindAssets("t:Texture2D", new[] { "Assets/Resources/HysjLegacy" });
            foreach (var guid in paths)
            {
                var path = AssetDatabase.GUIDToAssetPath(guid); var importer = AssetImporter.GetAtPath(path) as TextureImporter; if (importer == null) continue;
                if (importer.textureType != TextureImporterType.Sprite) { importer.textureType = TextureImporterType.Sprite; importer.spriteImportMode = SpriteImportMode.Single; importer.SaveAndReimport(); }
            }
        }

        private static void SetBuildScenes()
        {
            EditorBuildSettings.scenes = new[]
            {
                new EditorBuildSettingsScene(LoadScenePath, true),
                new EditorBuildSettingsScene(ScenePath, true),
                new EditorBuildSettingsScene(GameplayScenePath, true)
            };
        }

        private static void NormalizePrefabCanvas()
        {
            var prefabRoot = PrefabUtility.LoadPrefabContents(PrefabPath);
            try
            {
                var canvas = prefabRoot.GetComponentInChildren<Canvas>(true);
                if (canvas == null) return;
                canvas.transform.localScale = Vector3.one;
                EditorUtility.SetDirty(canvas.gameObject);
                PrefabUtility.SaveAsPrefabAsset(prefabRoot, PrefabPath);
            }
            finally
            {
                PrefabUtility.UnloadPrefabContents(prefabRoot);
            }
        }
    }
}
