using System.Collections.Generic;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace Hysj
{
    /// <summary>Serializes both gameplay layouts so Prefab Mode and Scene view have a real UI before Play Mode.</summary>
    public static class WishTownGameplayStaticUiBuilder
    {
        private const string MatchPrefabPath = "Assets/Prefabs/WishTownMatch3Gameplay.prefab";
        private const string BlocksPrefabPath = "Assets/Prefabs/WishTownBlocksGameplay.prefab";
        private const string MatchScenePath = "Assets/Scenes/WishTownMatch3.unity";
        private const string BlocksScenePath = "Assets/Scenes/WishTownBlocks.unity";
        private static readonly string[] MatchIcons = { "7", "9", "5", "4", "8", "15", "3", "18" };
        private static bool buildInProgress;

        [MenuItem("Hysj/Create Gameplay UI Assets")]
        public static void BuildAll()
        {
            BuildAllInternal(true);
        }

        private static void BuildAllInternal(bool refreshAssetDatabase)
        {
            if (EditorApplication.isPlayingOrWillChangePlaymode || buildInProgress) return;
            buildInProgress = true;
            var previousScenePath = SceneManager.GetActiveScene().path;
            try
            {
                BuildMatchPrefab();
                BuildBlocksPrefab();
                BuildScene(MatchScenePath, MatchPrefabPath);
                BuildScene(BlocksScenePath, BlocksPrefabPath);
                AssetDatabase.SaveAssets();
                // Refresh is optional so the menu can also be used by callers
                // that already have a current AssetDatabase view.
                if (refreshAssetDatabase)
                    AssetDatabase.Refresh();
                Debug.Log("WishTown gameplay static UI assets created.");
            }
            finally
            {
                buildInProgress = false;
                if (!string.IsNullOrEmpty(previousScenePath) && System.IO.File.Exists(previousScenePath))
                    EditorSceneManager.OpenScene(previousScenePath, OpenSceneMode.Single);
            }
        }

        private static bool PrefabHasCanvas(string path)
        {
            var root = PrefabUtility.LoadPrefabContents(path);
            if (root == null) return false;
            var canvas = root.transform.Find("GameplayCanvas");
            var scale = canvas == null ? Vector3.zero : canvas.localScale;
            var size = canvas == null ? Vector2.zero : canvas.GetComponent<RectTransform>().sizeDelta;
            var valid = canvas != null && scale.sqrMagnitude > 0.9f && size.x >= 719f && size.y >= 1279f;
            PrefabUtility.UnloadPrefabContents(root);
            return valid;
        }

        private static bool PrefabHasLegacyGoal(string path)
        {
            var root = PrefabUtility.LoadPrefabContents(path);
            if (root == null) return false;
            var valid = root.transform.Find("GameplayCanvas/Goal") != null;
            PrefabUtility.UnloadPrefabContents(root);
            return valid;
        }

        private static bool PrefabHasResultPopups(string path)
        {
            var root = PrefabUtility.LoadPrefabContents(path);
            if (root == null) return false;
            var canvas = root.transform.Find("GameplayCanvas");
            var valid = canvas != null && canvas.Find("BoardGrid/Cell_0_0") != null && canvas.Find("WinResultPopup/panel/nextBtn") != null && canvas.Find("LoseResultPopup/panel/retryBtn") != null && canvas.Find("PausePanel/Panel/PrimaryBtn") != null;
            PrefabUtility.UnloadPrefabContents(root);
            return valid;
        }

        private static bool PrefabHasBlocksResultPopup(string path)
        {
            var root = PrefabUtility.LoadPrefabContents(path);
            if (root == null) return false;
            var canvas = root.transform.Find("GameplayCanvas");
            var valid = canvas != null && canvas.Find("ResultPanel/panel/retryBtn") != null && canvas.Find("ResultPanel/panel/backBtn") != null;
            PrefabUtility.UnloadPrefabContents(root);
            return valid;
        }

        private static bool SceneHasCamera(string path)
        {
            var scene = EditorSceneManager.OpenScene(path, OpenSceneMode.Additive);
            var valid = scene.IsValid() && scene.GetRootGameObjects().Length > 0 && Object.FindObjectsOfType<Camera>().Length > 0;
            EditorSceneManager.CloseScene(scene, true);
            return valid;
        }

        private static bool SceneHasAudioListener(string path)
        {
            var scene = EditorSceneManager.OpenScene(path, OpenSceneMode.Additive);
            var valid = false;
            if (scene.IsValid())
            {
                foreach (var root in scene.GetRootGameObjects())
                    if (root.GetComponent<AudioListener>() != null || root.GetComponentInChildren<AudioListener>(true) != null) { valid = true; break; }
            }
            EditorSceneManager.CloseScene(scene, true);
            return valid;
        }

        private static void BuildMatchPrefab()
        {
            var root = NewRoot("WishTownMatch3Gameplay");
            root.AddComponent<WishTownMatch3Gameplay>();
            var canvas = CreateCanvas(root.transform);
            AddImage("Background", canvas.transform, "beijing", new Vector2(720, 1280), Vector2.zero, Color.white, true);
            AddImage("TimerPlate", canvas.transform, "dikuang", new Vector2(155, 61), new Vector2(-236, 555), Color.white, true);
            AddImage("TimerIcon", canvas.transform, "shijian", new Vector2(62, 83), new Vector2(-307, 555), Color.white, true);
            AddText("Timer", canvas.transform, "00:30", 30, new Vector2(125, 45), new Vector2(-225, 555), new Color32(225, 59, 59, 255));
            AddImage("LevelPlate", canvas.transform, "dikuang2", new Vector2(245, 97), new Vector2(0, 562), Color.white, true);
            AddText("Level", canvas.transform, "第1关", 34, new Vector2(200, 60), new Vector2(0, 562), new Color32(224, 45, 102, 255));
            AddImage("ScorePlate", canvas.transform, "dikuang3", new Vector2(167, 106), new Vector2(245, 550), Color.white, true);
            AddText("Score", canvas.transform, "0", 40, new Vector2(120, 48), new Vector2(245, 540), new Color32(222, 44, 103, 255));
            AddText("ScoreTitle", canvas.transform, "分数", 20, new Vector2(90, 25), new Vector2(245, 576), new Color32(222, 44, 103, 255));
            AddImage("StarPlate", canvas.transform, "dikuang4", new Vector2(287, 48), new Vector2(0, 438), Color.white, true);
            for (var i = 0; i < 3; i++) AddImage("Star" + i, canvas.transform, "xingxing2", new Vector2(58, 55), new Vector2((i - 1) * 75f, 438), Color.white, true);
            AddButton("PauseButton", canvas.transform, "zanting", string.Empty, new Vector2(88, 91), new Vector2(-286, 447), Color.white);
            AddImage("BoardFrame", canvas.transform, "dafangkuang", new Vector2(615, 914), new Vector2(0, -122), Color.white, false);
            BuildMatchBoard(canvas.transform);
            BuildMatchResultPopups(canvas.transform);
            BuildMatchPausePopup(canvas.transform, false);
            SavePrefab(root, MatchPrefabPath);
        }

        private static void BuildMatchResultPopups(Transform parent)
        {
            BuildMatchResultPopup(parent, true);
            BuildMatchResultPopup(parent, false);
        }

        private static void BuildMatchResultPopup(Transform parent, bool success)
        {
            var root = new GameObject(success ? "WinResultPopup" : "LoseResultPopup", typeof(RectTransform));
            root.transform.SetParent(parent, false);
            var rootRect = root.GetComponent<RectTransform>();
            rootRect.anchorMin = Vector2.zero; rootRect.anchorMax = Vector2.one;
            rootRect.offsetMin = Vector2.zero; rootRect.offsetMax = Vector2.zero;

            var mask = AddImage("遮罩", root.transform, "AtlasPicture/遮罩", new Vector2(2000, 2000), Vector2.zero, new Color(1f, 1f, 1f, .72f), true);
            mask.raycastTarget = true;
            var panel = AddImage("panel", root.transform, success ? "image2/tanchuangyouxichenggong" : "image2/tanchuangyouxishibai", new Vector2(529, 680), Vector2.zero, Color.white, true);
            panel.raycastTarget = true;
            var panelTransform = panel.transform;
            AddImage("dikuangyouxijiesu", panelTransform, success ? "image2/dikuangyouxichenggong" : "image2/dikuangshibai", new Vector2(424, 197), new Vector2(0, -61), Color.white, true);
            AddText("BestDistanceLabel", panelTransform, string.Empty, 24, new Vector2(370, 35), new Vector2(0, -8), Color.white);
            AddText("DistanceLabel", panelTransform, string.Empty, 24, new Vector2(390, 35), new Vector2(0, -52), Color.white);
            AddText("GoldLabel", panelTransform, string.Empty, 24, new Vector2(390, 35), new Vector2(0, -94), Color.white);

            if (success)
            {
                var stars = new GameObject("Stars", typeof(RectTransform));
                stars.transform.SetParent(panelTransform, false);
                var starsRect = stars.GetComponent<RectTransform>(); starsRect.anchorMin = starsRect.anchorMax = new Vector2(.5f, .5f); starsRect.sizeDelta = new Vector2(100, 100); starsRect.anchoredPosition = new Vector2(0, 111);
                for (var i = 0; i < 3; i++) AddImage("star" + (i + 1), stars.transform, "image2/wujiaoxing2", new Vector2(51, 50), new Vector2((i - 1) * 56f, 0), Color.white, true);
                AddButton("backBtn", panelTransform, "image2/anniufanhuizhujiemian", string.Empty, new Vector2(201, 81), new Vector2(-108, -264), Color.white);
                AddButton("nextBtn", panelTransform, "image2/anniuxiayiguan", string.Empty, new Vector2(201, 81), new Vector2(108, -264), Color.white);
            }
            else
            {
                AddButton("backBtn", panelTransform, "image2/anniufanhuizhujiemian", string.Empty, new Vector2(201, 81), new Vector2(-108, -264), Color.white);
                AddButton("retryBtn", panelTransform, "image2/anniuchognxintiaozhan", string.Empty, new Vector2(201, 81), new Vector2(108, -264), Color.white);
            }
            root.SetActive(false);
        }

        private static void BuildMatchBoard(Transform parent)
        {
            var grid = new GameObject("BoardGrid", typeof(RectTransform));
            grid.transform.SetParent(parent, false);
            var gridRect = grid.GetComponent<RectTransform>();
            gridRect.anchorMin = gridRect.anchorMax = new Vector2(.5f, .5f);
            gridRect.sizeDelta = new Vector2(720, 1280);
            gridRect.anchoredPosition = Vector2.zero;
            for (var row = 0; row < WishTownBoardLayout.Rows; row++)
                for (var column = 0; column < WishTownBoardLayout.Columns; column++)
                {
                    var button = AddButton("Cell_" + row + "_" + column, grid.transform, null, string.Empty, new Vector2(WishTownBoardLayout.CellSize, WishTownBoardLayout.CellSize), new Vector2(WishTownBoardLayout.BoardLeft + column * WishTownBoardLayout.CellSize, WishTownBoardLayout.BoardTop - row * WishTownBoardLayout.CellSize), Color.clear);
                    var icon = AddImage("Icon", button.transform, "icon/" + MatchIcons[(row * 8 + column) % MatchIcons.Length], new Vector2(59, 62), Vector2.zero, Color.white, true);
                    icon.raycastTarget = false;
                }
        }

        private static void BuildBlocksPrefab()
        {
            var root = NewRoot("WishTownBlocksGameplay");
            root.AddComponent<WishTownBlocksGameplay>();
            var canvas = CreateCanvas(root.transform);
            AddImage("Background", canvas.transform, "beijing 1", new Vector2(720, 1280), Vector2.zero, new Color(0.32f, 0.11f, 0.25f, .32f), true);
            AddImage("LevelPlate", canvas.transform, "dikuang2", new Vector2(245, 97), new Vector2(-95, 555), Color.white, true);
            AddText("Level", canvas.transform, "星愿方块", 30, new Vector2(210, 55), new Vector2(-95, 555), new Color32(224, 45, 102, 255));
            AddImage("ScorePlate", canvas.transform, "dikuang3", new Vector2(167, 106), new Vector2(225, 550), Color.white, true);
            AddText("ScoreTitle", canvas.transform, "分数", 19, new Vector2(95, 26), new Vector2(225, 579), new Color32(222, 44, 103, 255));
            AddText("Score", canvas.transform, "0", 34, new Vector2(125, 48), new Vector2(225, 542), new Color32(222, 44, 103, 255));
            BuildBlocksNextPiecePreview(canvas.transform);
            AddButton("PauseButton", canvas.transform, "zanting", string.Empty, new Vector2(88, 91), new Vector2(268, 452), Color.white);
            AddText("Hint", canvas.transform, "方向键移动 · 上键旋转 · 下键加速", 16, new Vector2(420, 28), new Vector2(0, -525), new Color32(255, 241, 247, 255));
            AddImage("BoardPanel", canvas.transform, null, new Vector2(615, 914), new Vector2(0, -122), new Color32(245, 157, 63, 255), false);
            for (var row = 0; row < WishTownBoardLayout.Rows; row++)
                for (var column = 0; column < WishTownBoardLayout.Columns; column++)
                    AddImage("Cell_" + row + "_" + column, canvas.transform, null, new Vector2(WishTownBoardLayout.CellSize, WishTownBoardLayout.CellSize), new Vector2(WishTownBoardLayout.BoardLeft + column * WishTownBoardLayout.CellSize, WishTownBoardLayout.BoardTop - row * WishTownBoardLayout.CellSize), new Color32(63, 56, 100, 255), false);
            BuildBlocksResultPopup(canvas.transform);
            BuildMatchPausePopup(canvas.transform, true);
            AddButton("Left", canvas.transform, null, "左", new Vector2(112, 58), new Vector2(-180, -585), new Color32(214, 89, 147, 230));
            AddButton("Rotate", canvas.transform, null, "旋转", new Vector2(112, 58), new Vector2(-60, -585), new Color32(214, 89, 147, 230));
            AddButton("Right", canvas.transform, null, "右", new Vector2(112, 58), new Vector2(60, -585), new Color32(214, 89, 147, 230));
            AddButton("Drop", canvas.transform, null, "下落", new Vector2(112, 58), new Vector2(180, -585), new Color32(214, 89, 147, 230));
            SavePrefab(root, BlocksPrefabPath);
        }

        private static void BuildBlocksNextPiecePreview(Transform parent)
        {
            var preview = new GameObject("NextPiecePreview", typeof(RectTransform));
            preview.transform.SetParent(parent, false);
            var previewRect = preview.GetComponent<RectTransform>();
            previewRect.anchorMin = previewRect.anchorMax = new Vector2(.5f, .5f);
            previewRect.pivot = new Vector2(.5f, .5f);
            previewRect.sizeDelta = new Vector2(240f, 190f);
            previewRect.anchoredPosition = new Vector2(0f, 445f);
            for (var i = 0; i < 4; i++)
                AddImage("Cell_" + i, preview.transform, "icon/1", new Vector2(43.5f, 43.5f), new Vector2((i - 1.5f) * 43.5f, 0f), Color.white, true);
        }

        private static void BuildBlocksResultPopup(Transform parent)
        {
            var root = new GameObject("ResultPanel", typeof(RectTransform));
            root.transform.SetParent(parent, false);
            var rootRect = root.GetComponent<RectTransform>();
            rootRect.anchorMin = Vector2.zero; rootRect.anchorMax = Vector2.one;
            rootRect.offsetMin = Vector2.zero; rootRect.offsetMax = Vector2.zero;
            var mask = AddImage("遮罩", root.transform, "AtlasPicture/遮罩", new Vector2(2000, 2000), Vector2.zero, new Color(1f, 1f, 1f, .72f), true);
            mask.raycastTarget = true;
            var panel = AddImage("panel", root.transform, "image2/tanchuangyouxishibai", new Vector2(529, 680), Vector2.zero, Color.white, true);
            panel.raycastTarget = true;
            AddImage("dikuangyouxijiesu", panel.transform, "image2/dikuangshibai", new Vector2(424, 197), new Vector2(0, -61), Color.white, true);
            AddText("Result", panel.transform, string.Empty, 30, new Vector2(390, 120), new Vector2(0, 20), Color.white);
            AddButton("backBtn", panel.transform, "image2/anniufanhuizhujiemian", string.Empty, new Vector2(201, 81), new Vector2(-108, -264), Color.white);
            AddButton("retryBtn", panel.transform, "image2/anniuchognxintiaozhan", string.Empty, new Vector2(201, 81), new Vector2(108, -264), Color.white);
            root.SetActive(false);
        }

        private static void BuildMatchPausePopup(Transform parent, bool useEndGameButton)
        {
            var root = new GameObject("PausePanel", typeof(RectTransform));
            root.transform.SetParent(parent, false);
            var rootRect = root.GetComponent<RectTransform>();
            rootRect.anchorMin = Vector2.zero; rootRect.anchorMax = Vector2.one;
            rootRect.offsetMin = Vector2.zero; rootRect.offsetMax = Vector2.zero;
            var mask = AddImage("遮罩", root.transform, "AtlasPicture/遮罩", new Vector2(2000, 2000), Vector2.zero, new Color(1f, 1f, 1f, .72f), true);
            mask.raycastTarget = true;
            var panel = AddImage("Panel", root.transform, "image2/dikuangzanting", new Vector2(534, 304), Vector2.zero, Color.white, true);
            panel.raycastTarget = true;
            AddImage("TitleBand", panel.transform, "image/biaotidi", new Vector2(270, 60), new Vector2(0, 67), Color.white, true);
            var title = AddText("Title", panel.transform, "游戏暂停", 34, new Vector2(260, 58), new Vector2(0, 67), Color.white);
            var outline = title.gameObject.AddComponent<Outline>();
            outline.effectColor = new Color32(126, 72, 69, 255);
            outline.effectDistance = new Vector2(2, -2);
            var back = AddButton("BackBtn", panel.transform,
                useEndGameButton ? "NewImage3/anniukong" : "image2/anniufanhuizhujiemian",
                useEndGameButton ? "结束游戏" : string.Empty,
                useEndGameButton ? new Vector2(206, 72) : new Vector2(201, 81), new Vector2(-108, -72), Color.white);
            if (useEndGameButton)
            {
                var label = back.transform.Find("Label")?.GetComponent<Text>();
                if (label != null)
                {
                    label.fontStyle = FontStyle.Bold;
                    var labelOutline = label.gameObject.AddComponent<Outline>();
                    labelOutline.effectColor = new Color32(117, 46, 141, 255);
                    labelOutline.effectDistance = new Vector2(2, -2);
                }
            }
            AddButton("PrimaryBtn", panel.transform, "image2/anniujixuyouxi", string.Empty, new Vector2(201, 81), new Vector2(108, -72), Color.white);
            root.SetActive(false);
        }

        private static void BuildOverlay(Transform parent, string name, string title)
        {
            var panel = AddImage(name, parent, null, Vector2.zero, Vector2.zero, new Color(0.1f, 0.03f, 0.14f, .94f), false).gameObject;
            var rect = panel.GetComponent<RectTransform>(); rect.anchorMin = Vector2.zero; rect.anchorMax = Vector2.one; rect.offsetMin = Vector2.zero; rect.offsetMax = Vector2.zero;
            AddText("Result", panel.transform, string.Empty, 34, new Vector2(500, 120), new Vector2(0, 115), Color.white);
            if (!string.IsNullOrEmpty(title)) AddText("PauseTitle", panel.transform, title, 38, new Vector2(500, 80), new Vector2(0, 105), Color.white);
            if (name == "ResultPanel")
            {
                AddButton("Retry", panel.transform, null, "再来一次", new Vector2(190, 62), new Vector2(-110, -15), new Color32(242, 153, 181, 255));
                AddButton("Back", panel.transform, null, "返回小镇", new Vector2(190, 62), new Vector2(110, -15), new Color32(125, 203, 181, 255));
            }
            else
            {
                AddButton("Resume", panel.transform, null, "继续游戏", new Vector2(190, 62), new Vector2(-110, -15), new Color32(242, 153, 181, 255));
                AddButton("PauseBack", panel.transform, null, "返回小镇", new Vector2(190, 62), new Vector2(110, -15), new Color32(125, 203, 181, 255));
            }
            panel.SetActive(false);
        }

        private static GameObject NewRoot(string name)
        {
            var root = new GameObject(name);
            root.transform.localScale = Vector3.one;
            return root;
        }

        private static Canvas CreateCanvas(Transform parent)
        {
            var go = new GameObject("GameplayCanvas", typeof(RectTransform), typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>();
            // Keep the serialized canvas visible in Scene/Prefab Mode before CanvasScaler runs.
            rect.anchorMin = new Vector2(0.5f, 0.5f);
            rect.anchorMax = new Vector2(0.5f, 0.5f);
            rect.pivot = new Vector2(0.5f, 0.5f);
            rect.anchoredPosition = Vector2.zero;
            rect.sizeDelta = new Vector2(720f, 1280f);
            rect.localScale = Vector3.one;
            var canvas = go.GetComponent<Canvas>(); canvas.renderMode = RenderMode.ScreenSpaceOverlay; canvas.sortingOrder = 20;
            var scaler = go.GetComponent<CanvasScaler>(); scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize; scaler.referenceResolution = new Vector2(720, 1280); scaler.matchWidthOrHeight = 0;
            return canvas;
        }

        private static Image AddImage(string name, Transform parent, string resource, Vector2 size, Vector2 position, Color color, bool preserveAspect)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image)); go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>(); rect.anchorMin = rect.anchorMax = new Vector2(.5f, .5f); rect.sizeDelta = size; rect.anchoredPosition = position;
            if (size == Vector2.zero) { rect.anchorMin = Vector2.zero; rect.anchorMax = Vector2.one; rect.offsetMin = rect.offsetMax = Vector2.zero; }
            var image = go.GetComponent<Image>(); image.color = color; image.preserveAspect = preserveAspect; image.raycastTarget = false;
            if (!string.IsNullOrEmpty(resource)) image.sprite = LoadUiSprite(resource);
            return image;
        }

        private static Text AddText(string name, Transform parent, string value, int size, Vector2 dimensions, Vector2 position, Color color)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Text)); go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>(); rect.anchorMin = rect.anchorMax = new Vector2(.5f, .5f); rect.sizeDelta = dimensions; rect.anchoredPosition = position;
            var text = go.GetComponent<Text>(); text.text = value; text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf"); text.fontSize = size; text.color = color; text.alignment = TextAnchor.MiddleCenter; text.resizeTextForBestFit = true; text.raycastTarget = false;
            return text;
        }

        private static Button AddButton(string name, Transform parent, string resource, string label, Vector2 size, Vector2 position, Color color)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button)); go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>(); rect.anchorMin = rect.anchorMax = new Vector2(.5f, .5f); rect.sizeDelta = size; rect.anchoredPosition = position;
            var image = go.GetComponent<Image>(); image.color = color; image.raycastTarget = true; image.preserveAspect = true;
            if (!string.IsNullOrEmpty(resource)) image.sprite = LoadUiSprite(resource);
            var button = go.GetComponent<Button>(); button.targetGraphic = image; button.transition = Selectable.Transition.None;
            if (!string.IsNullOrEmpty(label)) AddText("Label", go.transform, label, 24, size - new Vector2(12, 8), Vector2.zero, Color.white);
            return button;
        }

        private static Sprite LoadUiSprite(string resource)
        {
            var normalized = resource.Replace('\\', '/');
            var candidates = new[]
            {
                "Assets/Resources/HysjLegacy/NewImage/" + normalized + ".png",
                "Assets/Resources/HysjLegacy/" + normalized + ".png",
                "Assets/Resources/HysjLegacy/image2/" + normalized + ".png"
            };
            foreach (var path in candidates)
            {
                var sprite = AssetDatabase.LoadAssetAtPath<Sprite>(path);
                if (sprite != null) return sprite;
            }
            return null;
        }

        private static void SavePrefab(GameObject root, string path)
        {
            PrefabUtility.SaveAsPrefabAsset(root, path);
            Object.DestroyImmediate(root);
        }

        private static void BuildScene(string scenePath, string prefabPath)
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            var camera = new GameObject("Main Camera", typeof(Camera), typeof(AudioListener));
            camera.tag = "MainCamera";
            var cam = camera.GetComponent<Camera>(); cam.clearFlags = CameraClearFlags.SolidColor; cam.backgroundColor = Color.black; cam.orthographic = true; cam.orthographicSize = 5;
            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(prefabPath);
            if (prefab != null) PrefabUtility.InstantiatePrefab(prefab, scene);
            EditorSceneManager.SaveScene(scene, scenePath);
        }
    }
}
