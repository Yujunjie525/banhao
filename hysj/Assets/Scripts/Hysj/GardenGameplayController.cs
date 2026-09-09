using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace Hysj
{
    /// <summary>Runtime core loop for the level mode and the Garden Repair side mode.</summary>
    public sealed class GardenGameplayController : MonoBehaviour
    {
        // The current design only supports retry or return after failure.
        private static readonly bool ReviveFeatureEnabled = false;
        private const int RepairWidth = 5;
        private const int RepairHeight = 7;
        private const int RepairCellCount = RepairWidth * RepairHeight;
        private static readonly Vector2 RepairGridSize = new Vector2(580, 924);
        private static readonly Vector2 RepairGridPosition = new Vector2(0, -49f);
        private static readonly Vector2 RepairCellSize = new Vector2(139, 155);
        private static readonly Vector2 RepairGridSpacing = new Vector2(-13, -23);
        private const int RepairSolverVersion = 3;
        private const int EditorBoardVersion = 9;
        private const int MouseHpIconCapacity = 4;
        private const int TutorialPlotIndex = 4;
        private static readonly Vector2 TutorialFingerTipOffset = new Vector2(43f, -43f);
        private static readonly string[] MainGameplayBackgroundPaths =
        {
            "HysjLegacy/image/beijing1",
            "HysjLegacy/image/beijing2",
            "HysjLegacy/image/beijing3",
            "HysjLegacy/image/beijing4",
            "HysjLegacy/image/beijing5"
        };
        private static readonly int[] LevelStartCoins = { 100, 200, 350 };
        private static readonly float[] LevelBaseSpawnIntervals = { 3f, 2.5f, 2f };
        private static readonly int[] LevelMouseCaps = { 2, 3, 4 };
        private static readonly int[] LevelStarOne = { 25, 300, 600 };
        private static readonly int[] LevelStarTwo = { 180, 450, 900 };
        private static readonly int[] LevelStarThree = { 225, 600, 1150 };
        private static readonly SeedDefinition[] Seeds =
        {
            new SeedDefinition("雏菊", 10, 25, 5f, 5f), new SeedDefinition("向日葵", 30, 80, 10f, 10f),
            new SeedDefinition("郁金香", 60, 180, 15f, 15f), new SeedDefinition("薰衣草", 100, 320, 20f, 20f),
            new SeedDefinition("铃兰", 180, 600, 25f, 25f), new SeedDefinition("星光玫瑰", 300, 1100, 30f, 30f)
        };
        private static readonly MouseDefinition[] Mice =
        {
            new MouseDefinition("偷吃家鼠", 1, 1.5f, 45), new MouseDefinition("迅捷飞鼠", 1, 1f, 35),
            new MouseDefinition("盔甲田鼠", 3, 2f, 25), new MouseDefinition("盗贼松鼠", 2, .8f, 15)
        };
        private static readonly RoleLayout[] RoleLayouts =
        {
            // Each role keeps its own position; the frame controller supplies the native resource size.
            new RoleLayout(-120f, 261f),
            new RoleLayout(-100f, 160f),
            new RoleLayout(-120f, 180f),
            new RoleLayout(-65f, 230f),
            new RoleLayout(-130f, 150f)
        };

        public Action ReturnToMain;
        public Action<string> ShowTip;

        private HysjEditorLayout layout;
        private GameObject root;
        private Text title;
        private Text status;
        private Text maturityCountdown;
        private Text resource;
        private Image gameplayBackground;
        private Button primary;
        private Button pauseButton;
        private GameObject pausePopup;
        private GameObject winPopup;
        private GameObject losePopup;
        private GameObject revivePopup;
        private GameObject gameOverPopup;
        private GameObject repairSuccessPopup;
        private GameObject repairFailPopup;
        private readonly List<Button> cells = new List<Button>();
        private readonly List<int> route = new List<int>();
        private readonly HashSet<int> flowers = new HashSet<int>();
        private readonly HashSet<int> obstacles = new HashSet<int>();
        private readonly HashSet<int> wateredCells = new HashSet<int>();
        private readonly HashSet<int> maturedFlowers = new HashSet<int>();
        private readonly Dictionary<int, Plant> plants = new Dictionary<int, Plant>();
        private readonly Dictionary<int, Mouse> mice = new Dictionary<int, Mouse>();
        private int selectedSeed = -1;
        private int draggedSeed = -1;
        private int draggedPlant = -1;
        private bool seedDragActive;
        private bool plantDragActive;
        private int activeLevel;
        private bool repair;
        private bool defending;
        private bool finished;
        private bool paused;
        private bool reviveUsed;
        private int matchCoins;
        private int capturedMice;
        private float prepTimer;
        private float spawnTimer;
        private float elapsed;
        private System.Random random;
        private GardenRepairRunState repairRun;
        private bool repairDragging;
        private bool repairResolving;
        private bool tutorialActive;
        // Step progress belongs to the current run; only completion is account data.
        private int tutorialStep;
        private GameObject tutorialGuideRoot;
        private Image tutorialGuideMask;
        private Image tutorialGuideBubble;
        private Text tutorialGuideText;
        private Image tutorialGuideFinger;
        private GameObject tutorialGuideSeedVisual;
        private GameObject tutorialGuideButtonVisual;
        private float tutorialGuideElapsed;
        private int tutorialGuideStep = -1;
        private Coroutine repairWatering;
        private RectTransform repairWaterFlowLayer;
        private GardenWaterFlowGraphic repairWaterGraphic;
        private Material repairWaterMaterial;
        private HysjFrameAnimationController[] plantFrameAnimations;
        private HysjFrameAnimationController[] mouseFrameAnimations;
        private Image roleAnimationImage;
        private HysjFrameAnimationController roleFrameAnimation;
        private Sprite emptyLandSprite;
        private Sprite plantedLandSprite;
        private Sprite repairLandSprite;
        private Sprite repairSelectedLandSprite;
        private Sprite repairPoolSprite;
        private Sprite repairObstacleSprite;
        private int activeRoleIndex;

        private readonly struct SeedDefinition
        {
            public readonly string name; public readonly int buyPrice; public readonly int sellPrice; public readonly float growthTime; public readonly float bloomTime;
            public SeedDefinition(string name, int buyPrice, int sellPrice, float growthTime, float bloomTime) { this.name = name; this.buyPrice = buyPrice; this.sellPrice = sellPrice; this.growthTime = growthTime; this.bloomTime = bloomTime; }
        }

        private readonly struct MouseDefinition
        {
            public readonly string name; public readonly int hp; public readonly float attackInterval; public readonly int weight;
            public MouseDefinition(string name, int hp, float attackInterval, int weight) { this.name = name; this.hp = hp; this.attackInterval = attackInterval; this.weight = weight; }
        }

        private readonly struct RoleLayout
        {
            public readonly float x;
            public readonly float y;
            public RoleLayout(float x, float y) { this.x = x; this.y = y; }
        }

        private sealed class Plant { public int seed; public int hits; public float age; public int stage; public float lastProtectedAt = -10f; }
        private sealed class Mouse { public int type; public float age; public float attack; public int hp; public bool planted; }

        private void Awake()
        {
            if (HysjSceneRouter.IsGameplayScene) HysjAudioManager.PlayGameplayMusic();
            layout = GetComponent<HysjEditorLayout>();
            HysjGameplayBridge.LaunchRequested += OnLaunch;
            EnsureUi();
            if (root != null) root.SetActive(false);
            ShowTip = HysjMessageUi.ShowTip;
            if (HysjSceneRouter.IsGameplayScene)
            {
                if (HysjGameplayBridge.HasCurrentRequest) OnLaunch(HysjGameplayBridge.CurrentRequest);
                else OnLaunch(new HysjGameplayBridge.LaunchRequest
                {
                    Level = Mathf.Max(1, HysjDataService.Current.currentLevel),
                    InfiniteMode = false,
                    RoleIndex = HysjDataService.Current.currentRole
                });
            }
        }

        private void OnDestroy()
        {
            HysjGameplayBridge.LaunchRequested -= OnLaunch;
            if (repairWaterMaterial != null) Destroy(repairWaterMaterial);
        }

        public void LaunchRepair()
        {
            HysjDataService.AbandonGardenRepairRun();
            if (!HysjDataService.CanEnterGardenRepair()) { ShowMessage("体力不足，无法开始荒园修复。"); return; }
            HysjGameplayBridge.Launch(0, true);
        }

        private void OnLaunch(HysjGameplayBridge.LaunchRequest request)
        {
            activeLevel = request.Level;
            repair = request.InfiniteMode;
            activeRoleIndex = Mathf.Clamp(request.RoleIndex, 0, 4);
            defending = false;
            elapsed = 0f;
            if (root != null) root.SetActive(true);
            if (repair) BeginRepair(); else BeginMain(request.Level);
        }

        private void EnsureUi()
        {
            if (layout == null || layout.gameplayPanel == null) return;
            root = layout.gameplayPanel;
            if (TryBindEditorUi()) return;
            Debug.LogError("GameplayPanel is missing its editor-authored GardenRuntime contract. Run Hysj/Upgrade Gameplay Board Nodes.");
        }

        private bool TryBindEditorUi()
        {
            if (layout.gardenRuntime == null || layout.gardenPausePopup == null || layout.gardenWinPopup == null || layout.gardenLosePopup == null || layout.gardenRevivePopup == null || layout.gardenGameOverPopup == null) return false;
            if (!HasEditorBoardContract()) return false;
            gameplayBackground = layout.gardenRuntime.GetComponent<Image>();
            title = layout.gardenTitle; status = layout.gardenStatus; maturityCountdown = layout.gardenMaturityCountdown; resource = layout.gardenResource;
            primary = layout.gardenPrimaryButton; pauseButton = layout.gardenPauseButton;
            pausePopup = layout.gardenPausePopup; winPopup = layout.gardenWinPopup; losePopup = layout.gardenLosePopup; revivePopup = layout.gardenRevivePopup; gameOverPopup = layout.gardenGameOverPopup;
            // Both modes use the same authored result popups so the panel art,
            // layout, and overlay stay identical. Repair-specific text and the
            // replay button are applied only while the repair mode is active.
            repairSuccessPopup = winPopup;
            repairFailPopup = losePopup;
            if (title == null || status == null || resource == null || primary == null || pauseButton == null || repairSuccessPopup == null || repairFailPopup == null) return false;
            EnsureMaturityCountdown();
            status.fontStyle = FontStyle.Bold;
            EnsureFrameAnimationControllers();
            EnsureTutorialGuide();
            primary.onClick.RemoveAllListeners(); primary.onClick.AddListener(OnPrimary);
            pauseButton.onClick.RemoveAllListeners(); pauseButton.onClick.AddListener(ShowPausePopup);
            BindPopupButton(pausePopup, "PrimaryBtn", ResumeFromPause); BindPopupButton(pausePopup, "BackBtn", ReturnToMenu);
            BindPopupButton(winPopup, "nextBtn", HandleWinAction); BindPopupButton(winPopup, "backBtn", ReturnToMenu);
            BindPopupButton(losePopup, "retryBtn", HandleLoseAction); BindPopupButton(losePopup, "backBtn", ReturnToMenu);
            BindPopupButton(repairSuccessPopup, "nextBtn", HandleWinAction); BindPopupButton(repairSuccessPopup, "backBtn", ReturnToMenu);
            BindPopupButton(repairFailPopup, "retryBtn", HandleLoseAction); BindPopupButton(repairFailPopup, "backBtn", ReturnToMenu);
            if (ReviveFeatureEnabled)
            {
                BindPopupButton(revivePopup, "continueBtn", ContinueAfterRevive); BindPopupButton(revivePopup, "backBtn", EndWithoutRevive);
                BindPopupButton(gameOverPopup, "retryBtn", RetryLevel); BindPopupButton(gameOverPopup, "backBtn", ReturnToMenu);
            }
            pauseButton.gameObject.SetActive(false); HideAllPopups();
            return true;
        }

        private void EnsureMaturityCountdown()
        {
            if (maturityCountdown == null && status != null)
            {
                var copy = Instantiate(status.gameObject, status.transform.parent, false);
                copy.name = "MaturityCountdown";
                maturityCountdown = copy.GetComponent<Text>();
            }
            if (maturityCountdown == null) return;
            maturityCountdown.text = "成熟倒计时：0秒。";
            maturityCountdown.fontStyle = FontStyle.Bold;
            maturityCountdown.color = status == null ? new Color32(119, 47, 0, 255) : status.color;
            maturityCountdown.rectTransform.sizeDelta = new Vector2(680, 48);
            maturityCountdown.rectTransform.anchoredPosition = new Vector2(0, 430);
            maturityCountdown.raycastTarget = false;
            maturityCountdown.gameObject.SetActive(false);
        }

        private void EnsureTutorialGuide()
        {
            if (layout.gardenMainModeRoot == null) return;
            var parent = layout.gardenMainModeRoot.transform;
            var guideRect = layout.gardenTutorialGuideRoot == null
                ? parent.Find("TutorialGuide") as RectTransform
                : layout.gardenTutorialGuideRoot.GetComponent<RectTransform>();
            if (guideRect == null)
            {
                var guideNode = new GameObject("TutorialGuide", typeof(RectTransform));
                guideNode.transform.SetParent(parent, false);
                guideRect = guideNode.GetComponent<RectTransform>();
            }
            StretchRect(guideRect);
            tutorialGuideRoot = guideRect.gameObject;
            layout.gardenTutorialGuideRoot = tutorialGuideRoot;

            tutorialGuideMask = layout.gardenTutorialMask != null
                ? layout.gardenTutorialMask
                : EnsureGuideImage(guideRect, "Mask", null, Vector2.zero, Vector2.zero);
            StretchRect(tutorialGuideMask.rectTransform);
            tutorialGuideMask.color = new Color32(0, 0, 0, 150);
            tutorialGuideMask.raycastTarget = false;
            tutorialGuideMask.transform.SetAsFirstSibling();
            layout.gardenTutorialMask = tutorialGuideMask;

            tutorialGuideSeedVisual = EnsureTutorialTargetVisual(
                guideRect,
                layout.gardenTutorialSeedVisual,
                layout.gardenSeedIcons != null && layout.gardenSeedIcons.Length > 0 ? layout.gardenSeedIcons[0].gameObject : null,
                "SeedVisual");
            tutorialGuideButtonVisual = EnsureTutorialTargetVisual(
                guideRect,
                layout.gardenTutorialButtonVisual,
                primary == null ? null : primary.gameObject,
                "ButtonVisual");
            layout.gardenTutorialSeedVisual = tutorialGuideSeedVisual;
            layout.gardenTutorialButtonVisual = tutorialGuideButtonVisual;

            tutorialGuideBubble = layout.gardenTutorialBubble != null
                ? layout.gardenTutorialBubble
                : EnsureGuideImage(guideRect, "Bubble", Resources.Load<Sprite>("HysjLegacy/image/qipao"), new Vector2(514, 89), new Vector2(0, 405));
            ConfigureGuideRect(tutorialGuideBubble.rectTransform, new Vector2(514, 89), new Vector2(0, 405));
            tutorialGuideBubble.sprite = Resources.Load<Sprite>("HysjLegacy/image/qipao");
            tutorialGuideBubble.color = Color.white;
            tutorialGuideBubble.preserveAspect = true;
            tutorialGuideBubble.raycastTarget = false;
            layout.gardenTutorialBubble = tutorialGuideBubble;

            tutorialGuideText = layout.gardenTutorialText != null
                ? layout.gardenTutorialText
                : tutorialGuideBubble.transform.Find("Text")?.GetComponent<Text>();
            if (tutorialGuideText == null)
            {
                var textNode = new GameObject("Text", typeof(RectTransform), typeof(Text));
                textNode.transform.SetParent(tutorialGuideBubble.transform, false);
                tutorialGuideText = textNode.GetComponent<Text>();
            }
            ConfigureGuideRect(tutorialGuideText.rectTransform, new Vector2(480, 66), Vector2.zero);
            tutorialGuideText.font = status != null && status.font != null
                ? status.font : Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            tutorialGuideText.fontSize = 28;
            tutorialGuideText.fontStyle = FontStyle.Bold;
            tutorialGuideText.color = Color.white;
            tutorialGuideText.alignment = TextAnchor.MiddleCenter;
            tutorialGuideText.horizontalOverflow = HorizontalWrapMode.Wrap;
            tutorialGuideText.verticalOverflow = VerticalWrapMode.Truncate;
            tutorialGuideText.resizeTextForBestFit = true;
            tutorialGuideText.resizeTextMinSize = 20;
            tutorialGuideText.resizeTextMaxSize = 28;
            tutorialGuideText.raycastTarget = false;
            var outline = tutorialGuideText.GetComponent<Outline>();
            if (outline == null) outline = tutorialGuideText.gameObject.AddComponent<Outline>();
            outline.effectColor = Color.black;
            outline.effectDistance = new Vector2(2, -2);
            outline.useGraphicAlpha = false;
            layout.gardenTutorialText = tutorialGuideText;

            tutorialGuideFinger = layout.gardenTutorialFinger != null
                ? layout.gardenTutorialFinger
                : EnsureGuideImage(guideRect, "Finger", Resources.Load<Sprite>("HysjLegacy/image/shouzhi"), new Vector2(133, 140), Vector2.zero);
            ConfigureGuideRect(tutorialGuideFinger.rectTransform, new Vector2(133, 140), Vector2.zero);
            tutorialGuideFinger.sprite = Resources.Load<Sprite>("HysjLegacy/image/shouzhi");
            tutorialGuideFinger.color = Color.white;
            tutorialGuideFinger.preserveAspect = true;
            tutorialGuideFinger.raycastTarget = false;
            tutorialGuideFinger.transform.SetAsLastSibling();
            layout.gardenTutorialFinger = tutorialGuideFinger;

            tutorialGuideRoot.transform.SetAsLastSibling();
            tutorialGuideRoot.SetActive(false);
        }

        private static GameObject EnsureTutorialTargetVisual(Transform parent, GameObject existing, GameObject source, string name)
        {
            var visual = existing != null ? existing : parent.Find(name)?.gameObject;
            if (visual != null && source != null)
            {
                var visualImage = visual.GetComponent<Image>();
                var sourceImage = source.GetComponent<Image>();
                if (visualImage != null && sourceImage != null && visualImage.sprite != sourceImage.sprite)
                {
                    Destroy(visual);
                    visual = null;
                }
            }
            if (visual == null && source != null)
            {
                visual = Instantiate(source, parent, false);
                visual.name = name;
            }
            if (visual == null) return null;

            foreach (var graphic in visual.GetComponentsInChildren<Graphic>(true)) graphic.raycastTarget = false;
            foreach (var selectable in visual.GetComponentsInChildren<Selectable>(true))
            {
                selectable.interactable = false;
                selectable.enabled = false;
            }
            foreach (var input in visual.GetComponentsInChildren<GardenSeedDragInput>(true)) input.enabled = false;
            var layoutElement = visual.GetComponent<LayoutElement>();
            if (layoutElement != null) layoutElement.enabled = false;
            visual.SetActive(false);
            return visual;
        }

        private static Image EnsureGuideImage(Transform parent, string name, Sprite sprite, Vector2 size, Vector2 position)
        {
            var child = parent.Find(name);
            if (child == null)
            {
                var node = new GameObject(name, typeof(RectTransform), typeof(Image));
                node.transform.SetParent(parent, false);
                child = node.transform;
            }
            var image = child.GetComponent<Image>();
            if (image == null) image = child.gameObject.AddComponent<Image>();
            image.sprite = sprite;
            ConfigureGuideRect(image.rectTransform, size, position);
            return image;
        }

        private static void ConfigureGuideRect(RectTransform rect, Vector2 size, Vector2 position)
        {
            rect.anchorMin = rect.anchorMax = new Vector2(.5f, .5f);
            rect.pivot = new Vector2(.5f, .5f);
            rect.sizeDelta = size;
            rect.anchoredPosition = position;
        }

        private static void StretchRect(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        private void BeginMain(int level)
        {
            repair = false; defending = false; finished = false; paused = false; reviveUsed = false; capturedMice = 0; matchCoins = StartCoinsForLevel(level); prepTimer = 10f; spawnTimer = 0f; selectedSeed = -1; draggedSeed = -1; draggedPlant = -1; seedDragActive = false; plantDragActive = false; plants.Clear(); mice.Clear();
            ApplyMainGameplayBackground(level);
            RestoreMainSuccessPopup();
            SetFrameAnimationsPaused(false);
            tutorialActive = level == 1 && !HysjDataService.Current.tutorialCompleted;
            tutorialStep = 0;
            tutorialGuideStep = -1;
            tutorialGuideElapsed = 0f;
            HideAllPopups();
            if (pauseButton != null) pauseButton.gameObject.SetActive(true);
            primary.onClick.RemoveAllListeners(); primary.onClick.AddListener(OnPrimary);
            ApplyBottomSafeLayout(false);
            if (status != null)
            {
                status.rectTransform.anchoredPosition = new Vector2(0, 494);
                status.gameObject.SetActive(true);
            }
            if (maturityCountdown != null) maturityCountdown.gameObject.SetActive(false);
            title.text = "第" + level + "关"; primary.gameObject.SetActive(true); primary.interactable = true;
            var primaryLabel = primary.GetComponentInChildren<Text>(true);
            if (primaryLabel != null) primaryLabel.text = string.Empty;
            if (layout.gardenSeedTrayRoot != null) layout.gardenSeedTrayRoot.gameObject.SetActive(true);
            if (!BindGameplayBoard(false)) return;
            SetDropHighlights(-1);
            UpdateMainUi();
            RefreshTutorialGuide();
        }

        private void ApplyMainGameplayBackground(int level)
        {
            if (gameplayBackground == null || MainGameplayBackgroundPaths.Length == 0) return;
            var normalizedLevel = Mathf.Clamp(level, 1, 100);
            var backgroundIndex = Mathf.Clamp((normalizedLevel - 1) / 20, 0, MainGameplayBackgroundPaths.Length - 1);
            var path = MainGameplayBackgroundPaths[backgroundIndex];
            var sprite = Resources.Load<Sprite>(path);
            if (sprite == null)
            {
                Debug.LogError("Missing main gameplay background: " + path);
                return;
            }

            gameplayBackground.sprite = sprite;
            gameplayBackground.color = Color.white;
            gameplayBackground.type = Image.Type.Simple;
            gameplayBackground.preserveAspect = false;
        }

        private void Update()
        {
            if (root == null || !root.activeSelf) return;
            var dt = Time.unscaledDeltaTime;
            UpdateTutorialGuideAnimation(dt);
            if (finished || paused) return;
            elapsed += dt;
            if (repair) { UpdateRepair(); return; }
            if (!defending)
            {
                if (!tutorialActive || tutorialStep >= 2) prepTimer -= dt;
                if (prepTimer <= 0f) StartDefense(true); else UpdateMainUi();
                return;
            }
            spawnTimer -= dt; if (spawnTimer <= 0f) { SpawnMouse(); spawnTimer = Mathf.Max(.8f, BaseSpawnInterval() / (1f + .001f * TotalSeedBaseSellValue())); }
            foreach (var pair in plants)
            {
                var plant = pair.Value;
                if (plant.hits >= 50) continue;
                plant.age += dt;
                var definition = Seeds[Mathf.Clamp(plant.seed, 0, Seeds.Length - 1)];
                var growthTime = definition.growthTime * (HysjDataService.Current.currentRole == 1 ? .8f : 1f);
                plant.stage = plant.age < growthTime ? 0 : plant.age < growthTime + definition.bloomTime ? 1 : 2;
            }
            var mouseIds = new List<int>(mice.Keys);
            foreach (var id in mouseIds)
            {
                var mouse = mice[id]; mouse.age += dt;
                var emptyLeaveTime = HysjDataService.Current.currentRole == 2 ? 3.5f : 3f;
                if (!mouse.planted) { if (mouse.age >= emptyLeaveTime) RemoveMouse(id); continue; }
                mouse.attack -= dt; if (mouse.attack <= 0f)
                {
                    mouse.attack = Mice[Mathf.Clamp(mouse.type, 0, Mice.Length - 1)].attackInterval;
                    var plant = plants[id];
                    if (HysjDataService.Current.currentRole == 4 && elapsed - plant.lastProtectedAt >= 10f) { plant.lastProtectedAt = elapsed; continue; }
                    plant.hits++;
                    if (plant.hits >= 50) RemoveMouse(id);
                }
            }
            var matured = 0;
            var alive = 0;
            foreach (var plant in plants.Values)
            {
                if (plant.hits >= 50) continue;
                alive++;
                if (plant.stage >= 2) matured++;
            }
            UpdateMainUi();
            if (alive == 0)
            {
                FinishMain(false, false, true);
            }
            else if (matured == alive)
            {
                var passed = TotalActualValue() >= StarOneThreshold();
                FinishMain(passed, !passed, false);
            }
        }

        private void StartDefense(bool preparationExpired = false)
        {
            if (finished || paused) return;
            if (plants.Count == 0)
            {
                if (!preparationExpired)
                {
                    ShowMessage("先种下一颗种子。");
                    UpdateMainUi();
                    return;
                }

                defending = true;
                FinishMain(false, true, false);
                return;
            }

            defending = true;
            prepTimer = 0f;
            if (tutorialActive && tutorialStep == 1) tutorialStep = 2;
            primary.gameObject.SetActive(false);
            if (layout.gardenSeedTrayRoot != null) layout.gardenSeedTrayRoot.gameObject.SetActive(false);
            UpdateMainUi();
            RefreshTutorialGuide();
        }

        private void OnPrimary() { if (!repair) StartDefense(); }

        private void ShowPausePopup()
        {
            if (finished || paused || pausePopup == null) return;
            paused = true; SetFrameAnimationsPaused(true); HideAllPopups(); RefreshTutorialGuide(); ShowPopupOnTop(pausePopup);
        }

        private void ShowRevivePopup()
        {
            paused = true; SetFrameAnimationsPaused(true); HideAllPopups(); FillPopupResult(revivePopup, 0); ShowPopupOnTop(revivePopup);
        }

        private void ShowResultPopup(bool passed, int stars)
        {
            paused = true; SetFrameAnimationsPaused(true); HideAllPopups(); var target = passed ? winPopup : (ReviveFeatureEnabled && reviveUsed ? gameOverPopup : losePopup); FillPopupResult(target, stars); ShowPopupOnTop(target);
        }

        private void ResumeFromPause()
        {
            HideAllPopups();
            paused = false;
            SetFrameAnimationsPaused(false);
            if (repair) UpdateRepairUi(); else UpdateMainUi();
            RefreshTutorialGuide();
        }
        private void ReturnToMenu()
        {
            if (repair) HysjDataService.AbandonGardenRepairRun();
            if (ReturnToMain != null) ReturnToMain();
            else HysjSceneRouter.LoadMain();
        }
        private void HandleWinAction() { if (repair) StartNewRepairRound(); else StartNextLevel(); }
        private void HandleLoseAction() { if (repair) RetryRepairRound(); else RetryLevel(); }
        private void StartNextLevel() { if (activeLevel >= 100) ReturnToMenu(); else StartResultLevel(activeLevel + 1); }
        private void RetryLevel() { StartResultLevel(activeLevel); }
        private void EndWithoutRevive() { FinishMain(false, true, false); }

        private void StartResultLevel(int level)
        {
            if (!HysjDataService.ConsumeStamina()) { ShowMessage("体力不足，无法开始游戏。"); return; }
            HysjGameplayBridge.Launch(Mathf.Clamp(level, 1, 100), false);
        }

        private void ContinueAfterRevive()
        {
            if (plants.Count == 0)
            {
                HideAllPopups();
                paused = false;
                defending = false;
                finished = false;
                prepTimer = 10f;
                primary.gameObject.SetActive(true);
                ShowMessage("场上没有可恢复的植物，请先播种。");
                UpdateMainUi();
                return;
            }

            reviveUsed = true; paused = false; HideAllPopups(); defending = true; spawnTimer = 2.5f;
            foreach (var plant in plants.Values) { plant.hits = 0; plant.age = 0f; plant.stage = 0; plant.lastProtectedAt = -10f; }
            mice.Clear(); UpdateMainUi();
        }

        private bool HasEditorBoardContract()
        {
            return layout.gardenBoardVersion >= EditorBoardVersion
                && layout.gardenSharedHud != null
                && layout.gardenMainModeRoot != null
                && layout.gardenMainGridRoot != null
                && HasButtons(layout.gardenMainCells, 9)
                && HasImages(layout.gardenMainEntityIcons, 9)
                && HasImages(layout.gardenMainMouseIcons, 9)
                && layout.gardenSeedTrayRoot != null
                && layout.gardenSeedScroll != null
                && layout.gardenSeedContent != null
                && layout.gardenSeedIcons != null
                && layout.gardenSeedIcons.Length == Seeds.Length
                && HasButtons(layout.gardenSeedButtons, Seeds.Length)
                && HasSprites(layout.gardenPlantGrowthSprites, Seeds.Length)
                && HasSprites(layout.gardenPlantBloomSprites, Seeds.Length)
                && HasSprites(layout.gardenPlantResultSprites, Seeds.Length)
                && layout.gardenMouseSprite != null
                && layout.gardenDeleteZone != null
                && layout.gardenRepairModeRoot != null
                && layout.gardenRepairGridRoot != null
                && HasButtons(layout.gardenRepairCells, RepairCellCount)
                && layout.gardenRepairWaterFlow != null;
        }

        private static bool HasButtons(Button[] buttons, int expectedCount)
        {
            if (buttons == null || buttons.Length != expectedCount) return false;
            for (var i = 0; i < buttons.Length; i++) if (buttons[i] == null) return false;
            return true;
        }

        private static bool HasImages(Image[] images, int expectedCount)
        {
            if (images == null || images.Length != expectedCount) return false;
            for (var i = 0; i < images.Length; i++) if (images[i] == null) return false;
            return true;
        }

        private static bool HasSprites(Sprite[] sprites, int expectedCount)
        {
            if (sprites == null || sprites.Length != expectedCount) return false;
            for (var i = 0; i < sprites.Length; i++) if (sprites[i] == null) return false;
            return true;
        }

        private void EnsureFrameAnimationControllers()
        {
            EnsureRoleAnimationController();
            var entityIcons = layout.gardenMainEntityIcons;
            var mouseIcons = layout.gardenMainMouseIcons;
            plantFrameAnimations = new HysjFrameAnimationController[entityIcons == null ? 0 : entityIcons.Length];
            mouseFrameAnimations = new HysjFrameAnimationController[mouseIcons == null ? 0 : mouseIcons.Length];
            for (var i = 0; i < plantFrameAnimations.Length; i++)
            {
                var image = entityIcons[i];
                if (image == null) continue;
                var controller = image.GetComponent<HysjFrameAnimationController>();
                if (controller == null) controller = image.gameObject.AddComponent<HysjFrameAnimationController>();
                controller.SetFallback(image.sprite);
                plantFrameAnimations[i] = controller;
            }
            for (var i = 0; i < mouseFrameAnimations.Length; i++)
            {
                var image = mouseIcons[i];
                if (image == null) continue;
                var controller = image.GetComponent<HysjFrameAnimationController>();
                if (controller == null) controller = image.gameObject.AddComponent<HysjFrameAnimationController>();
                controller.SetFallback(layout.gardenMouseSprite != null ? layout.gardenMouseSprite : image.sprite);
                // Keep each mouse animation frame at its authored source size.
                // The cell button remains the hit area, so this does not change
                // grid selection or mouse-click routing.
                controller.SetUseFrameResourceSize(true);
                mouseFrameAnimations[i] = controller;
            }
        }

        private void EnsureRoleAnimationController()
        {
            roleAnimationImage = layout.gardenRoleAnimation;
            if (roleAnimationImage != null && layout.gardenMainGridRoot != null)
                roleAnimationImage.transform.SetSiblingIndex(layout.gardenMainGridRoot.GetSiblingIndex() + 1);
            if (roleAnimationImage == null && layout.gardenMainModeRoot != null)
            {
                var node = new GameObject("RoleAnimation", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
                node.transform.SetParent(layout.gardenMainModeRoot.transform, false);
                var rect = node.GetComponent<RectTransform>();
                rect.anchorMin = Vector2.zero;
                rect.anchorMax = Vector2.zero;
                rect.pivot = Vector2.zero;
                rect.sizeDelta = new Vector2(260f, 450f);
                rect.anchoredPosition = new Vector2(-65f, 230f);
                if (layout.gardenMainGridRoot != null)
                    rect.SetSiblingIndex(layout.gardenMainGridRoot.GetSiblingIndex() + 1);
                roleAnimationImage = node.GetComponent<Image>();
                roleAnimationImage.color = Color.white;
                roleAnimationImage.enabled = false;
                roleAnimationImage.raycastTarget = false;
                roleAnimationImage.preserveAspect = true;
            }
            if (roleAnimationImage == null) return;
            roleAnimationImage.enabled = false;
            roleAnimationImage.raycastTarget = false;
            roleFrameAnimation = roleAnimationImage.GetComponent<HysjFrameAnimationController>();
            if (roleFrameAnimation == null) roleFrameAnimation = roleAnimationImage.gameObject.AddComponent<HysjFrameAnimationController>();
            roleFrameAnimation.SetUseFrameResourceSize(true);
            roleFrameAnimation.SetFallback(null);
        }

        private void SetFrameAnimationsPaused(bool value)
        {
            if (plantFrameAnimations != null)
                for (var i = 0; i < plantFrameAnimations.Length; i++) if (plantFrameAnimations[i] != null) plantFrameAnimations[i].SetPaused(value);
            if (mouseFrameAnimations != null)
                for (var i = 0; i < mouseFrameAnimations.Length; i++) if (mouseFrameAnimations[i] != null) mouseFrameAnimations[i].SetPaused(value);
            if (roleFrameAnimation != null) roleFrameAnimation.SetPaused(value);
        }

        private bool BindGameplayBoard(bool repairMode)
        {
            var boardButtons = repairMode ? layout.gardenRepairCells : layout.gardenMainCells;
            var expectedCount = repairMode ? RepairCellCount : 9;
            if (!HasButtons(boardButtons, expectedCount))
            {
                Debug.LogError("GardenGameplay editor board references are incomplete. Run Hysj/Upgrade Gameplay Board Nodes.");
                return false;
            }

            if (repairMode) ConfigureRepairGridLayout();

            layout.gardenMainModeRoot.SetActive(!repairMode);
            layout.gardenRepairModeRoot.SetActive(repairMode);
            layout.gardenDeleteZone.SetActive(false);
            cells.Clear();
            if (!repairMode) EnsureMainLandSprites();
            for (var i = 0; i < boardButtons.Length; i++)
            {
                var button = boardButtons[i];
                var index = i;
                button.gameObject.SetActive(true);
                button.interactable = true;
                button.onClick.RemoveAllListeners();
                SetCellHighlight(button, false);
                if (repairMode)
                {
                    EnsureRepairSprites();
                    button.transform.Find("Content")?.SetAsLastSibling();
                    var land = button.GetComponent<Image>();
                    if (land != null)
                    {
                        land.sprite = repairLandSprite;
                        land.color = Color.white;
                        land.preserveAspect = false;
                    }
                    var selectedLand = button.transform.Find("Highlight")?.GetComponent<Image>();
                    if (selectedLand != null)
                    {
                        selectedLand.sprite = repairSelectedLandSprite;
                        selectedLand.color = Color.white;
                        selectedLand.preserveAspect = false;
                    }
                    var input = button.GetComponent<GardenRepairCellInput>();
                    if (input == null)
                    {
                        Debug.LogError(button.name + " is missing GardenRepairCellInput in the editor-authored prefab.");
                        return false;
                    }
                    input.Initialize(this, index);
                }
                else
                {
                    var land = button.GetComponent<Image>();
                    if (land != null && emptyLandSprite != null) land.sprite = emptyLandSprite;
                    var highlightImage = button.transform.Find("Highlight")?.GetComponent<Image>();
                    if (highlightImage != null)
                    {
                        highlightImage.sprite = plantedLandSprite;
                        highlightImage.color = Color.white;
                        highlightImage.preserveAspect = true;
                    }
                    button.onClick.AddListener(() => OnCell(index));
                    var input = button.GetComponent<GardenSeedDragInput>();
                    if (input == null)
                    {
                        Debug.LogError(button.name + " is missing GardenSeedDragInput in the editor-authored prefab.");
                        return false;
                    }
                    input.InitializePlant(this, index);
                }
                cells.Add(button);
            }

            if (!repairMode)
            {
                var allowedSeeds = AllowedSeedCountForLevel(activeLevel);
                for (var i = 0; i < layout.gardenSeedButtons.Length; i++)
                {
                    var button = layout.gardenSeedButtons[i];
                    var input = button.GetComponent<GardenSeedDragInput>();
                    if (input == null)
                    {
                        Debug.LogError(button.name + " is missing GardenSeedDragInput in the editor-authored prefab.");
                        return false;
                    }
                    input.InitializeSeed(this, i);
                    var label = button.transform.Find("Label")?.GetComponent<Text>();
                    var priceLabel = button.transform.Find("PriceLabel")?.GetComponent<Text>();
                    var estimatedScoreLabel = EnsureSeedEstimatedScoreLabel(button.transform, priceLabel);
                    var allowed = i < allowedSeeds;
                    if (label != null) label.text = Seeds[i].name;
                    if (priceLabel != null) priceLabel.text = Seeds[i].buyPrice.ToString();
                    if (estimatedScoreLabel != null) estimatedScoreLabel.text = "预计收益分数：" + Seeds[i].sellPrice;
                    button.gameObject.SetActive(allowed);
                    button.interactable = allowed;
                }
                Canvas.ForceUpdateCanvases();
                if (layout.gardenSeedScroll != null) layout.gardenSeedScroll.horizontalNormalizedPosition = 0f;
            }

            if (repairMode) BindRepairWaterFlow();
            MovePopupsToTop();
            return true;
        }

        private void OnCell(int index)
        {
            if (repair) { ExtendRepair(index); return; }
            if (defending)
            {
                if (mice.ContainsKey(index)) CaptureMouse(index);
                else ShowMessage("这里没有老鼠，点击出现老鼠的格子。");
                return;
            }
            if (plants.ContainsKey(index)) { ShowMessage("请拖拽植物换位，或拖到底部删除区退款。"); return; }
            ShowMessage("请拖拽下方种子到空地播种。");
        }

        public void SelectSeed(int seed)
        {
            if (repair || defending || finished || paused || seed < 0 || seed >= Seeds.Length) return;
            if (seed >= AllowedSeedCountForLevel(activeLevel)) return;
            if (tutorialActive && tutorialStep == 0 && seed != 0) { ShowMessage("请先选择雏菊种子。"); return; }
            selectedSeed = seed;
            UpdateMainUi();
        }

        public bool HandleSeedDragBegin(int seed)
        {
            if (repair || defending || finished || paused) return false;
            if (seed < 0 || seed >= Seeds.Length) return false;
            if (seed >= AllowedSeedCountForLevel(activeLevel)) return false;
            if (tutorialActive && tutorialStep == 0 && seed != 0)
            {
                ShowMessage("请先选择雏菊种子。");
                draggedSeed = -1;
                seedDragActive = false;
                return false;
            }
            selectedSeed = seed;
            UpdateMainUi();
            draggedSeed = seed;
            draggedPlant = -1;
            seedDragActive = draggedSeed >= 0;
            plantDragActive = false;
            SetDropHighlights(-1);
            return seedDragActive;
        }

        public void HandlePlantDragBegin(int cell)
        {
            if (repair || defending || finished || paused || !plants.ContainsKey(cell)) return;
            draggedPlant = cell;
            draggedSeed = -1;
            plantDragActive = true;
            seedDragActive = false;
            SetDropHighlights(cell);
        }

        public void HandleSeedDrag(Vector2 screenPosition, Camera eventCamera)
        {
            if (!seedDragActive && !plantDragActive) return;
            SetDropHighlights(CellAtScreen(screenPosition, eventCamera));
        }

        public void HandleSeedDragEnd(Vector2 screenPosition, Camera eventCamera)
        {
            if (!seedDragActive && !plantDragActive) return;
            var seed = draggedSeed;
            var plant = draggedPlant;
            var target = CellAtScreen(screenPosition, eventCamera);
            var delete = plant >= 0 && target < 0 && IsDeleteZone(screenPosition, eventCamera);
            draggedSeed = -1;
            draggedPlant = -1;
            seedDragActive = false;
            plantDragActive = false;
            SetDropHighlights(-1);
            UpdateMainUi();
            if (seed >= 0)
            {
                if (target >= 0) PlantSeedAt(target, seed);
                else ShowMessage("请把种子拖到空地。");
            }
            else if (plant >= 0)
            {
                if (delete) RemovePlantAndRefund(plant);
                else if (target >= 0) MovePlant(plant, target);
                else ShowMessage("请把植物拖到其他地块或底部删除区。");
            }
        }

        private int CellAtScreen(Vector2 screenPosition, Camera eventCamera)
        {
            for (var i = 0; i < cells.Count; i++)
            {
                var rect = cells[i].transform as RectTransform;
                if (rect != null && RectTransformUtility.RectangleContainsScreenPoint(rect, screenPosition, eventCamera)) return i;
            }
            return -1;
        }

        private bool IsDeleteZone(Vector2 screenPosition, Camera eventCamera)
        {
            var rect = layout.gardenDeleteZone == null ? null : layout.gardenDeleteZone.GetComponent<RectTransform>();
            return rect != null
                ? RectTransformUtility.RectangleContainsScreenPoint(rect, screenPosition, eventCamera)
                : screenPosition.y <= Screen.height * .32f;
        }

        private void SetDropHighlights(int target)
        {
            if (layout.gardenDeleteZone != null) layout.gardenDeleteZone.SetActive(plantDragActive);
            var tutorialTargetVisible = tutorialActive
                && !defending
                && tutorialStep == 0;
            for (var i = 0; i < cells.Count; i++)
            {
                var highlighted = tutorialTargetVisible
                    ? i == TutorialPlotIndex
                    : seedDragActive
                        ? i == target && !plants.ContainsKey(i)
                        : plantDragActive && i == target && i != draggedPlant;
                SetCellHighlight(cells[i], highlighted);
            }
        }

        private static void SetCellHighlight(Button button, bool visible)
        {
            if (button == null) return;
            var highlight = button.transform.Find("Highlight");
            if (highlight != null) highlight.gameObject.SetActive(visible);
        }

        private void EnsureMainLandSprites()
        {
            if (emptyLandSprite == null) emptyLandSprite = Resources.Load<Sprite>("HysjLegacy/image/tiandi");
            if (plantedLandSprite == null) plantedLandSprite = Resources.Load<Sprite>("HysjLegacy/image/tiandi2");
        }

        private void UpdateCellLand(int index)
        {
            if (index < 0 || index >= cells.Count) return;
            EnsureMainLandSprites();
            var land = cells[index] == null ? null : cells[index].GetComponent<Image>();
            var sprite = plants.ContainsKey(index) ? plantedLandSprite : emptyLandSprite;
            if (land != null && sprite != null && land.sprite != sprite) land.sprite = sprite;
        }

        private void PlantSeedAt(int index, int seed)
        {
            if (plants.ContainsKey(index)) { ShowMessage("请把种子拖到空地。"); return; }
            if (tutorialActive && tutorialStep == 0 && index != TutorialPlotIndex) { ShowMessage("请把雏菊种到高亮花田。"); return; }
            var cost = Seeds[Mathf.Clamp(seed, 0, Seeds.Length - 1)].buyPrice;
            if (matchCoins < cost) { ShowMessage("花币不足：需要" + cost + "，当前只有" + matchCoins + "。"); return; }
            matchCoins -= cost;
            plants[index] = new Plant { seed = seed };
            selectedSeed = -1;
            if (tutorialActive && tutorialStep == 0) tutorialStep = 1;
            SetDropHighlights(-1);
            UpdateMainUi();
            RefreshTutorialGuide();
        }

        private void MovePlant(int from, int to)
        {
            if (from == to || !plants.ContainsKey(from)) return;
            var plant = plants[from];
            if (plants.ContainsKey(to))
            {
                var targetPlant = plants[to];
                plants[to] = plant;
                plants[from] = targetPlant;
            }
            else
            {
                plants.Remove(from);
                plants[to] = plant;
            }
            UpdateMainUi();
        }

        private void RemovePlantAndRefund(int index)
        {
            if (!plants.TryGetValue(index, out var plant)) return;
            plants.Remove(index);
            matchCoins += Seeds[Mathf.Clamp(plant.seed, 0, Seeds.Length - 1)].buyPrice;
            selectedSeed = -1;
            ShowMessage("植物已移除，返还花币" + Seeds[Mathf.Clamp(plant.seed, 0, Seeds.Length - 1)].buyPrice + "。");
            UpdateMainUi();
        }

        private void SpawnMouse()
        {
            if (tutorialActive && tutorialStep == 2 && mice.Count == 0)
            {
                if (plants.ContainsKey(TutorialPlotIndex))
                {
                    mice[TutorialPlotIndex] = new Mouse { type = 0, hp = 1, planted = true, attack = 999f };
                    UpdateMainUi();
                    return;
                }
            }
            var cap = MouseCapForLevel(activeLevel);
            if (mice.Count >= cap) return;
            var available = new List<int>(); for (var i = 0; i < cells.Count; i++) if (!mice.ContainsKey(i) && (!plants.ContainsKey(i) || plants[i].hits < 50)) available.Add(i); if (available.Count == 0) return;
            var allowedCount = AllowedMouseTypesForLevel(activeLevel);
            var totalWeight = 0; for (var i = 0; i < allowedCount; i++) totalWeight += Mice[i].weight;
            var roll = UnityEngine.Random.Range(0, totalWeight); var type = 0;
            for (var i = 0; i < allowedCount; i++) { if (roll < Mice[i].weight) { type = i; break; } roll -= Mice[i].weight; }
            var index = available[UnityEngine.Random.Range(0, available.Count)];
            mice[index] = new Mouse { type = type, hp = Mice[type].hp, planted = plants.ContainsKey(index), attack = Mice[type].attackInterval };
            UpdateMainUi();
        }

        private void CaptureMouse(int index)
        {
            if (!mice.TryGetValue(index, out var mouse)) return;
            mouse.hp--;
            if (mouse.hp > 0) { UpdateMainUi(); return; }
            mice.Remove(index); capturedMice++; HysjDataService.RecordMainCapture(); HysjDataService.AddGold(1);
            if (HysjDataService.Current.currentRole == 3 && capturedMice % 5 == 0) HysjDataService.AddGold(1);
            if (tutorialActive && tutorialStep == 2)
            {
                tutorialStep = 3;
                if (HysjDataService.CompleteGardenTutorial()) HysjCloudSaveSync.RequestImmediateUpload();
                tutorialActive = false;
                RefreshTutorialGuide();
            }
            ShowMessage("抓捕成功！+1钻石。"); UpdateMainUi();
        }
        private void RemoveMouse(int index) { mice.Remove(index); }
        private int TotalSeedBaseSellValue() { var total = 0; foreach (var p in plants.Values) total += Seeds[Mathf.Clamp(p.seed, 0, Seeds.Length - 1)].sellPrice; return total; }
        private int TotalActualValue() { var total = 0; foreach (var p in plants.Values) if (p.hits < 50 && p.stage >= 2) total += Mathf.Max(0, Seeds[Mathf.Clamp(p.seed, 0, Seeds.Length - 1)].sellPrice * (100 - p.hits) / 100); return total; }
        private int MainLevelDiamondReward() { return capturedMice + (HysjDataService.Current.currentRole == 3 ? capturedMice / 5 : 0); }
        // Levels 1-3 retain their authored values; levels 4-100 extrapolate
        // those values so difficulty rises without inventing new level data.
        private static int StartCoinsForLevel(int level)
        {
            level = Mathf.Clamp(level, 1, 100);
            return level <= 3 ? LevelStartCoins[level - 1] : LevelStartCoins[2] + (level - 3) * 20;
        }

        private static float SpawnIntervalForLevel(int level)
        {
            level = Mathf.Clamp(level, 1, 100);
            if (level <= 3) return LevelBaseSpawnIntervals[level - 1];
            return Mathf.Max(.75f, LevelBaseSpawnIntervals[2] / (1f + (level - 3) * .025f));
        }

        private static int MouseCapForLevel(int level)
        {
            level = Mathf.Clamp(level, 1, 100);
            return level <= 3 ? LevelMouseCaps[level - 1] : Mathf.Min(9, LevelMouseCaps[2] + Mathf.CeilToInt((level - 3) / 8f));
        }

        private static int AllowedMouseTypesForLevel(int level)
        {
            level = Mathf.Clamp(level, 1, 100);
            return Mathf.Clamp(level == 1 ? 2 : level == 2 ? 3 : 4, 1, Mice.Length);
        }

        private static int AllowedSeedCountForLevel(int level)
        {
            return Mathf.Clamp(level == 1 ? 2 : level == 2 ? 4 : 6, 1, Seeds.Length);
        }

        private static int StarOneThresholdForLevel(int level)
        {
            level = Mathf.Clamp(level, 1, 100);
            return level <= 3 ? LevelStarOne[level - 1] : LevelStarOne[2] + (level - 3) * 30;
        }

        private static int StarTwoThresholdForLevel(int level)
        {
            level = Mathf.Clamp(level, 1, 100);
            return level <= 3 ? LevelStarTwo[level - 1] : LevelStarTwo[2] + (level - 3) * 50;
        }

        private static int StarThreeThresholdForLevel(int level)
        {
            level = Mathf.Clamp(level, 1, 100);
            return level <= 3 ? LevelStarThree[level - 1] : LevelStarThree[2] + (level - 3) * 70;
        }

        private float BaseSpawnInterval() { return SpawnIntervalForLevel(activeLevel); }
        private int StarOneThreshold() { return StarOneThresholdForLevel(activeLevel); }
        private void FinishMain(bool passed) { FinishMain(passed, false, false); }

        private void FinishMain(bool passed, bool forceFinal, bool allowRevive)
        {
            if ((!defending && !forceFinal) || finished) return;
            defending = false;
            if (!passed && ReviveFeatureEnabled && allowRevive && !reviveUsed && !forceFinal) { ShowRevivePopup(); return; }
            finished = true; var stars = passed ? (TotalActualValue() >= StarThreeThresholdForLevel(activeLevel) ? 3 : TotalActualValue() >= StarTwoThresholdForLevel(activeLevel) ? 2 : 1) : 0;
            if (stars > 0) HysjDataService.RecordMainWin(TotalActualValue());
            HysjGameplayBridge.ReportResult(activeLevel, stars, TotalActualValue(), passed);
            status.text = passed ? "通关！" : "本局结束。"; primary.gameObject.SetActive(false); if (pauseButton != null) pauseButton.gameObject.SetActive(false);
            if (maturityCountdown != null) maturityCountdown.gameObject.SetActive(false);
            RefreshTutorialGuide();
            ShowResultPopup(passed, stars);
        }

        private void BeginRepair()
        {
            ApplyBottomSafeLayout(true);
            title.text = "荒园修复";
            ConfigureRepairSuccessPopup();
            if (status != null)
            {
                status.text = "拖一条引水渠灌溉花朵。";
                status.rectTransform.anchoredPosition = new Vector2(0, -570);
                status.gameObject.SetActive(true);
            }
            if (maturityCountdown != null) maturityCountdown.gameObject.SetActive(false);
            finished = false;
            paused = false;
            RefreshTutorialGuide();
            repairDragging = false;
            repairResolving = false;
            HideAllPopups();
            primary.onClick.RemoveAllListeners();
            primary.gameObject.SetActive(false);
            pauseButton.gameObject.SetActive(true);
            pauseButton.interactable = true;
            route.Clear();
            flowers.Clear();
            obstacles.Clear();
            wateredCells.Clear();
            maturedFlowers.Clear();

            repairRun = HysjDataService.Current.activeGardenRepairRun;
            if (repairRun != null && !ValidateRepairRun(repairRun))
            {
                HysjDataService.DiscardInvalidGardenRepairRun();
                repairRun = null;
            }

            if (repairRun == null)
            {
                if (!TryGenerateRepairRun(out repairRun))
                {
                    ShowMessage("地图生成或唯一解校验失败，本次未扣体力。请重新进入。");
                    ReturnToMenu();
                    return;
                }
                if (!HysjDataService.TryStartGardenRepairRun(repairRun, out var message))
                {
                    ShowMessage(message);
                    ReturnToMenu();
                    return;
                }
            }

            LoadRepairRun(repairRun);
            if (!BindGameplayBoard(true)) return;
            resource.text = "8000";
            UpdateRepairUi();
            if (repairRun.completed)
            {
                if (!repairRun.rewardGranted)
                {
                    var rewardGold = repairRun.flowerIndices != null ? repairRun.flowerIndices.Count * 10 : 0;
                    if (HysjDataService.CompleteGardenRepairRun(repairRun.runId, rewardGold))
                        repairRun = HysjDataService.Current.activeGardenRepairRun;
                }
                finished = true;
                ShowRepairSuccessPopup();
            }
        }

        private void ApplyBottomSafeLayout(bool repairMode)
        {
            SetGardenResourceHudVisible(!repairMode);
            var resourceIcon = FindDeep(layout.gardenRuntime.transform, "ResourceIcon");
            if (resourceIcon != null) resourceIcon.gameObject.SetActive(!repairMode);
            if (resource != null)
            {
                resource.rectTransform.anchoredPosition = new Vector2(260f, 572f);
                resource.rectTransform.sizeDelta = new Vector2(112f, 54f);
                resource.fontSize = 40;
                resource.fontStyle = FontStyle.Bold;
                resource.color = new Color32(137, 76, 20, 255);
                resource.alignment = TextAnchor.MiddleCenter;
                resource.horizontalOverflow = HorizontalWrapMode.Overflow;
                resource.verticalOverflow = VerticalWrapMode.Truncate;
                resource.lineSpacing = 1f;
                resource.resizeTextForBestFit = !repairMode;
                resource.resizeTextMinSize = 16;
                resource.resizeTextMaxSize = 40;
            }
            if (primary != null) primary.GetComponent<RectTransform>().anchoredPosition = new Vector2(-1f, -563.5f);
        }

        private void SetGardenResourceHudVisible(bool visible)
        {
            if (layout == null || layout.gardenRuntime == null) return;
            var frame = FindDeep(layout.gardenRuntime.transform, "ResourceFrame");
            var icon = FindDeep(layout.gardenRuntime.transform, "ResourceIcon");
            if (frame != null) frame.gameObject.SetActive(visible);
            if (icon != null) icon.gameObject.SetActive(visible);
            if (resource != null) resource.gameObject.SetActive(visible);
        }

        public void HandleRepairPointerDown(int index)
        {
            if (!repair || finished || paused || repairResolving || index != repairRun.poolIndex) return;
            repairDragging = true;
            route.Clear();
            route.Add(index);
            pauseButton.interactable = false;
            ResetRepairWaterFlow();
            UpdateRepairUi();
        }

        public void HandleRepairPointerDrag(Vector2 screenPosition, Camera eventCamera)
        {
            if (!repairDragging || paused || repairResolving) return;
            var nearestIndex = -1;
            var nearestDistance = float.MaxValue;
            for (var i = 0; i < cells.Count; i++)
            {
                var rect = cells[i].transform as RectTransform;
                if (rect != null && RectTransformUtility.RectangleContainsScreenPoint(rect, screenPosition, eventCamera))
                {
                    var center = RectTransformUtility.WorldToScreenPoint(eventCamera, rect.TransformPoint(rect.rect.center));
                    var distance = ((Vector2)center - screenPosition).sqrMagnitude;
                    if (distance < nearestDistance)
                    {
                        nearestDistance = distance;
                        nearestIndex = i;
                    }
                }
            }
            if (nearestIndex >= 0) ExtendRepair(nearestIndex);
        }

        public void HandleRepairPointerUp()
        {
            if (!repairDragging || paused || repairResolving) return;
            repairDragging = false;
            pauseButton.interactable = true;
            SubmitRepair();
        }

        private void ExtendRepair(int index)
        {
            if (!repairDragging || route.Count == 0 || obstacles.Contains(index)) return;
            if (route.Count > 1 && route[route.Count - 2] == index) route.RemoveAt(route.Count - 1);
            else if (!route.Contains(index) && IsAdjacent(route[route.Count - 1], index)) route.Add(index);
            UpdateRepairRoutePreview();
            UpdateRepairUi();
        }
        private static bool IsAdjacent(int a, int b)
        {
            if (a < 0 || a >= RepairCellCount || b < 0 || b >= RepairCellCount) return false;
            var ax = a % RepairWidth;
            var ay = a / RepairWidth;
            var bx = b % RepairWidth;
            var by = b / RepairWidth;
            return Mathf.Abs(ax - bx) + Mathf.Abs(ay - by) == 1;
        }
        private void SubmitRepair()
        {
            if (finished || repairResolving) return;
            var valid = route.Count > 1 && route[0] == repairRun.poolIndex && flowers.IsSubsetOf(new HashSet<int>(route)) && flowers.Contains(route[route.Count - 1]);
            if (!valid)
            {
                finished = true;
                paused = true;
                ShowRepairFailPopup();
                return;
            }
            repairWatering = StartCoroutine(PlayRepairWatering());
        }

        private IEnumerator PlayRepairWatering()
        {
            repairResolving = true;
            pauseButton.interactable = false;
            ResetRepairWaterFlow();
            repairWaterGraphic.Width = 38f;
            repairWaterGraphic.color = Color.white;
            var flowPoints = new List<Vector2>(route.Count);
            foreach (var cellIndex in route) flowPoints.Add(CellPosition(cellIndex));
            repairWaterGraphic.SetPath(flowPoints);
            repairWaterGraphic.SetReveal(0f);
            repairWaterGraphic.gameObject.SetActive(true);
            wateredCells.Add(route[0]);
            UpdateRepairUi();
            yield return new WaitForSecondsRealtime(.12f);
            for (var routeIndex = 1; routeIndex < route.Count; routeIndex++)
            {
                var index = route[routeIndex];
                yield return AnimateRepairWaterSegment(routeIndex - 1, routeIndex);
                wateredCells.Add(index);
                UpdateRepairUi();
                if (flowers.Contains(index))
                {
                    yield return new WaitForSecondsRealtime(.12f);
                    maturedFlowers.Add(index);
                    UpdateRepairUi();
                    yield return new WaitForSecondsRealtime(.18f);
                }
            }

            yield return new WaitForSecondsRealtime(.3f);

            var flowerCount = repairRun != null && repairRun.flowerIndices != null
                ? repairRun.flowerIndices.Count : CountFlowersInRoute();
            var rewardGold = flowerCount * 10;
            if (!HysjDataService.CompleteGardenRepairRun(repairRun.runId, rewardGold))
            {
                repairResolving = false;
                pauseButton.interactable = true;
                ShowMessage("修复结果保存失败，请重新进入后继续结算。");
                yield break;
            }

            repairRun = HysjDataService.Current.activeGardenRepairRun;
            repairResolving = false;
            finished = true;
            pauseButton.gameObject.SetActive(false);
            ShowRepairSuccessPopup();
        }

        private void UpdateRepair() { }
        private void UpdateRepairUi()
        {
            EnsureRepairSprites();
            for (var i = 0; i < cells.Count; i++)
            {
                var image = cells[i].GetComponent<Image>();
                var highlight = cells[i].transform.Find("Highlight")?.GetComponent<Image>();
                var entity = cells[i].transform.Find("Content/RepairEntity")?.GetComponent<Image>();
                if (image != null)
                {
                    image.sprite = repairLandSprite;
                    image.color = Color.white;
                    image.preserveAspect = false;
                }
                if (highlight != null)
                {
                    highlight.sprite = repairSelectedLandSprite;
                    highlight.color = Color.white;
                    highlight.preserveAspect = false;
                    highlight.gameObject.SetActive(route.Contains(i));
                }
                if (entity != null)
                {
                    entity.enabled = true;
                    entity.sprite = null;
                    entity.preserveAspect = true;
                }
                if (obstacles.Contains(i))
                {
                    if (entity != null) entity.sprite = repairObstacleSprite;
                }
                else if (i == repairRun.poolIndex)
                {
                    if (entity != null) entity.sprite = repairPoolSprite;
                }
                else if (flowers.Contains(i))
                {
                    var flowerIndex = repairRun.flowerIndices.IndexOf(i);
                    var seed = Mathf.Clamp(flowerIndex, 0, layout.gardenPlantBloomSprites.Length - 1);
                    if (entity != null) entity.sprite = maturedFlowers.Contains(i)
                        ? layout.gardenPlantResultSprites[seed]
                        : layout.gardenPlantBloomSprites[seed];
                }
                if (entity != null) entity.enabled = entity.sprite != null;
                // Input is blocked by the repair state. Keeping buttons interactable avoids
                // Unity's disabled tint washing the entire board gray during watering.
                cells[i].interactable = true;
            }
            resource.text = "8000";
        }

        private void EnsureRepairSprites()
        {
            if (repairLandSprite == null)
            {
                var source = layout.gardenRepairLandSprite ?? Resources.Load<Sprite>("HysjLegacy/image3/tiaodixiao");
                repairLandSprite = source;
            }
            if (repairSelectedLandSprite == null)
            {
                var source = layout.gardenRepairSelectedLandSprite ?? Resources.Load<Sprite>("HysjLegacy/image3/tiaodifaguang");
                repairSelectedLandSprite = source;
            }
            if (repairPoolSprite == null) repairPoolSprite = layout.gardenRepairPoolSprite ?? Resources.Load<Sprite>("HysjLegacy/image3/shuichi");
            if (repairObstacleSprite == null) repairObstacleSprite = layout.gardenRepairObstacleSprite ?? Resources.Load<Sprite>("HysjLegacy/image3/laohuda");
        }

        private void ConfigureRepairGridLayout()
        {
            if (layout == null || layout.gardenRepairGridRoot == null) return;
            var root = layout.gardenRepairGridRoot as RectTransform;
            if (root != null)
            {
                root.sizeDelta = RepairGridSize;
                root.anchoredPosition = RepairGridPosition;
            }
            var grid = layout.gardenRepairGridRoot.GetComponent<GridLayoutGroup>();
            if (grid != null)
            {
                grid.cellSize = RepairCellSize;
                grid.spacing = RepairGridSpacing;
                grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
                grid.constraintCount = RepairWidth;
            }
            for (var i = 0; i < layout.gardenRepairCells.Length; i++)
            {
                var cellRect = layout.gardenRepairCells[i] == null ? null : layout.gardenRepairCells[i].GetComponent<RectTransform>();
                if (cellRect != null) cellRect.sizeDelta = RepairCellSize;
            }
        }

        private void BindRepairWaterFlow()
        {
            EnsureRepairWaterMaterials();
            repairWaterGraphic = layout.gardenRepairWaterFlow;
            repairWaterFlowLayer = repairWaterGraphic == null ? null : repairWaterGraphic.rectTransform;
            if (repairWaterGraphic == null) return;
            repairWaterGraphic.raycastTarget = false;
            repairWaterGraphic.Width = 38f;
            repairWaterGraphic.material = repairWaterMaterial;
            repairWaterFlowLayer.SetAsLastSibling();
            repairWaterGraphic.gameObject.SetActive(false);
        }

        private void ResetRepairWaterFlow()
        {
            if (repairWaterFlowLayer == null || repairWaterGraphic == null) return;
            repairWaterGraphic.SetPath(null);
            repairWaterGraphic.SetReveal(0f);
            repairWaterGraphic.gameObject.SetActive(false);
        }

        private void UpdateRepairRoutePreview()
        {
            if (!repairDragging || repairWaterGraphic == null || route.Count < 2)
            {
                ResetRepairWaterFlow();
                return;
            }

            var flowPoints = new List<Vector2>(route.Count);
            foreach (var cellIndex in route) flowPoints.Add(CellPosition(cellIndex));
            repairWaterGraphic.Width = 38f;
            repairWaterGraphic.color = Color.white;
            repairWaterGraphic.SetPath(flowPoints);
            repairWaterGraphic.SetReveal(1f);
            repairWaterGraphic.gameObject.SetActive(true);
        }

        private Vector2 CellPosition(int index)
        {
            if (index < 0 || index >= cells.Count || repairWaterFlowLayer == null) return Vector2.zero;
            var cellRect = cells[index].GetComponent<RectTransform>();
            return repairWaterFlowLayer.InverseTransformPoint(cellRect.TransformPoint(cellRect.rect.center));
        }

        private IEnumerator AnimateRepairWaterSegment(int fromPointIndex, int toPointIndex)
        {
            var from = repairWaterGraphic.NormalizedDistanceAt(fromPointIndex);
            var to = repairWaterGraphic.NormalizedDistanceAt(toPointIndex);
            var duration = .16f * Mathf.Max(.75f, (to - from) * route.Count);
            var elapsedTime = 0f;
            while (elapsedTime < duration)
            {
                elapsedTime += Time.unscaledDeltaTime;
                var progress = Mathf.SmoothStep(0f, 1f, Mathf.Clamp01(elapsedTime / duration));
                repairWaterGraphic.SetReveal(Mathf.Lerp(from, to, progress));
                yield return null;
            }
            repairWaterGraphic.SetReveal(to);
        }

        private void EnsureRepairWaterMaterials()
        {
            if (repairWaterMaterial != null) return;
            var shader = Resources.Load<Shader>("HysjWaterFlow");
            if (shader == null) shader = Shader.Find("UI/HysjWaterFlow");
            if (shader == null)
            {
                Debug.LogError("Missing Resources/HysjWaterFlow shader.");
                return;
            }
            repairWaterMaterial = new Material(shader) { name = "Hysj Water Flow (Runtime)", hideFlags = HideFlags.DontSave };
            repairWaterMaterial.SetFloat("_Reveal", 0f);
        }

        private bool TryGenerateRepairRun(out GardenRepairRunState generated)
        {
            generated = null;
            var watch = System.Diagnostics.Stopwatch.StartNew();
            for (var attempt = 0; attempt < 100 && watch.ElapsedMilliseconds < 1500; attempt++)
            {
                var seed = unchecked(Environment.TickCount ^ Guid.NewGuid().GetHashCode() ^ attempt * 486187739);
                var candidateRandom = new System.Random(seed);
                var path = new List<int>();
                var used = new HashSet<int>();
                var edges = EdgeCells();
                var start = edges[candidateRandom.Next(edges.Count)];
                path.Add(start);
                used.Add(start);
                var targetLength = candidateRandom.Next(17, 25);
                var searchSteps = 0;
                if (!GrowInducedPath(path, used, targetLength, candidateRandom, watch, ref searchSteps)) continue;

                List<int> obstacleList;
                if (!TryBuildRepairObstacles(used, candidateRandom, out obstacleList)) continue;

                var flowerList = new List<int> { path[path.Count - 1] };
                var flowerCount = candidateRandom.Next(1, 5);
                while (flowerList.Count < flowerCount)
                {
                    var candidate = path[candidateRandom.Next(1, path.Count - 1)];
                    if (!flowerList.Contains(candidate)) flowerList.Add(candidate);
                }

                var run = new GardenRepairRunState
                {
                    runId = Guid.NewGuid().ToString("N"),
                    seed = seed,
                    solverVersion = RepairSolverVersion,
                    poolIndex = start,
                    flowerIndices = flowerList,
                    obstacleIndices = obstacleList,
                    solutionIndices = path
                };
                run.mapHash = RepairMapHash(run);
                if (!IsValidRepairSolution(run) || CountRepairSolutions(run, 2) != 1) continue;
                generated = run;
                return true;
            }
            return false;
        }

        private static bool TryBuildRepairObstacles(HashSet<int> answerPath, System.Random generator, out List<int> obstacles)
        {
            obstacles = null;
            var offPath = new List<int>();
            var safeOpenCandidates = new List<int>();
            for (var cell = 0; cell < RepairCellCount; cell++)
            {
                if (answerPath.Contains(cell)) continue;
                offPath.Add(cell);
                if (CountUsedNeighbors(cell, answerPath) <= 1) safeOpenCandidates.Add(cell);
            }

            var maxOpenCount = Mathf.Min(6, offPath.Count - 6);
            if (maxOpenCount < 2) return false;
            var targetOpenCount = generator.Next(2, maxOpenCount + 1);
            Shuffle(safeOpenCandidates, generator);
            var openLand = new HashSet<int>();
            foreach (var candidate in safeOpenCandidates)
            {
                var touchesOpenLand = false;
                foreach (var neighbor in RepairNeighbors(candidate))
                {
                    if (!openLand.Contains(neighbor)) continue;
                    touchesOpenLand = true;
                    break;
                }
                if (touchesOpenLand) continue;
                openLand.Add(candidate);
                if (openLand.Count >= targetOpenCount) break;
            }
            if (openLand.Count < 2) return false;

            obstacles = new List<int>();
            foreach (var cell in offPath) if (!openLand.Contains(cell)) obstacles.Add(cell);
            return obstacles.Count >= 6 && obstacles.Count <= 18;
        }

        private bool GrowInducedPath(List<int> path, HashSet<int> used, int targetLength, System.Random generator, System.Diagnostics.Stopwatch watch, ref int searchSteps)
        {
            if (path.Count >= targetLength) return true;
            if (watch.ElapsedMilliseconds >= 1500 || searchSteps++ >= 6000) return false;
            var neighbors = RepairNeighbors(path[path.Count - 1]);
            Shuffle(neighbors, generator);
            foreach (var next in neighbors)
            {
                if (used.Contains(next) || CountUsedNeighbors(next, used) != 1) continue;
                used.Add(next);
                path.Add(next);
                if (GrowInducedPath(path, used, targetLength, generator, watch, ref searchSteps)) return true;
                path.RemoveAt(path.Count - 1);
                used.Remove(next);
            }
            return false;
        }

        private static int CountUsedNeighbors(int cell, HashSet<int> used)
        {
            var count = 0;
            foreach (var neighbor in RepairNeighbors(cell)) if (used.Contains(neighbor)) count++;
            return count;
        }

        private static List<int> EdgeCells()
        {
            var result = new List<int>();
            for (var i = 0; i < RepairCellCount; i++)
            {
                var x = i % RepairWidth;
                var y = i / RepairWidth;
                if (x == 0 || x == RepairWidth - 1 || y == 0 || y == RepairHeight - 1) result.Add(i);
            }
            return result;
        }

        private static List<int> RepairNeighbors(int cell)
        {
            var result = new List<int>(4);
            var x = cell % RepairWidth;
            var y = cell / RepairWidth;
            if (x > 0) result.Add(cell - 1);
            if (x < RepairWidth - 1) result.Add(cell + 1);
            if (y > 0) result.Add(cell - RepairWidth);
            if (y < RepairHeight - 1) result.Add(cell + RepairWidth);
            return result;
        }

        private static void Shuffle(List<int> values, System.Random generator)
        {
            for (var i = values.Count - 1; i > 0; i--)
            {
                var target = generator.Next(i + 1);
                var value = values[i];
                values[i] = values[target];
                values[target] = value;
            }
        }

        private static int CountRepairSolutions(GardenRepairRunState run, int stopAfter)
        {
            var blocked = new HashSet<int>(run.obstacleIndices);
            var flowerSet = new HashSet<int>(run.flowerIndices);
            var visited = new HashSet<int> { run.poolIndex };
            var solutions = 0;
            CountRepairSolutionsFrom(run.poolIndex, blocked, flowerSet, visited, 0, stopAfter, ref solutions);
            return solutions;
        }

        private static void CountRepairSolutionsFrom(int cell, HashSet<int> blocked, HashSet<int> flowerSet, HashSet<int> visited, int covered, int stopAfter, ref int solutions)
        {
            if (solutions >= stopAfter) return;
            if (flowerSet.Contains(cell)) covered++;
            if (covered == flowerSet.Count && flowerSet.Contains(cell)) solutions++;
            if (solutions >= stopAfter) return;
            foreach (var next in RepairNeighbors(cell))
            {
                if (blocked.Contains(next) || visited.Contains(next)) continue;
                visited.Add(next);
                CountRepairSolutionsFrom(next, blocked, flowerSet, visited, covered, stopAfter, ref solutions);
                visited.Remove(next);
                if (solutions >= stopAfter) return;
            }
        }

        private static bool ValidateRepairRun(GardenRepairRunState run)
        {
            if (run == null || run.solverVersion != RepairSolverVersion || run.poolIndex < 0 || run.poolIndex >= RepairCellCount) return false;
            if (run.flowerIndices == null || run.flowerIndices.Count < 1 || run.flowerIndices.Count > 4) return false;
            if (run.obstacleIndices == null || run.obstacleIndices.Count < 6 || run.obstacleIndices.Count > 18) return false;
            if (run.solutionIndices == null || run.solutionIndices.Count < 8 || run.solutionIndices.Count > 24) return false;
            if (run.obstacleIndices.Count + run.solutionIndices.Count >= RepairCellCount) return false;
            var x = run.poolIndex % RepairWidth;
            var y = run.poolIndex / RepairWidth;
            if (x != 0 && x != RepairWidth - 1 && y != 0 && y != RepairHeight - 1) return false;
            if (!string.Equals(run.mapHash, RepairMapHash(run), StringComparison.Ordinal)) return false;
            return IsValidRepairSolution(run) && CountRepairSolutions(run, 2) == 1;
        }

        private static bool IsValidRepairSolution(GardenRepairRunState run)
        {
            if (run == null || run.solutionIndices == null || run.solutionIndices.Count < 2) return false;
            if (run.flowerIndices == null || run.obstacleIndices == null) return false;
            if (run.solutionIndices[0] != run.poolIndex) return false;

            var blocked = new HashSet<int>(run.obstacleIndices);
            var visited = new HashSet<int>();
            var coveredFlowers = new HashSet<int>();
            for (var i = 0; i < run.solutionIndices.Count; i++)
            {
                var cell = run.solutionIndices[i];
                if (cell < 0 || cell >= RepairCellCount || blocked.Contains(cell) || !visited.Add(cell)) return false;
                if (i > 0 && !IsAdjacent(run.solutionIndices[i - 1], cell)) return false;
                if (run.flowerIndices.Contains(cell)) coveredFlowers.Add(cell);
            }

            var lastCell = run.solutionIndices[run.solutionIndices.Count - 1];
            return run.flowerIndices.Contains(lastCell) && coveredFlowers.Count == new HashSet<int>(run.flowerIndices).Count;
        }

        private static string RepairMapHash(GardenRepairRunState run)
        {
            unchecked
            {
                uint hash = 2166136261;
                Action<int> add = value => { hash = (hash ^ (uint)value) * 16777619; };
                add(run.seed);
                add(run.poolIndex);
                foreach (var value in run.flowerIndices) add(value + 101);
                foreach (var value in run.obstacleIndices) add(value + 211);
                foreach (var value in run.solutionIndices) add(value + 307);
                return hash.ToString("X8");
            }
        }

        private void LoadRepairRun(GardenRepairRunState run)
        {
            flowers.Clear();
            obstacles.Clear();
            foreach (var value in run.flowerIndices) flowers.Add(value);
            foreach (var value in run.obstacleIndices) obstacles.Add(value);
        }

        private void RetryRepairRound()
        {
            if (!HysjDataService.TryRetryGardenRepair(out var message))
            {
                ShowMessage(message);
                return;
            }
            finished = false;
            paused = false;
            repairDragging = false;
            route.Clear();
            wateredCells.Clear();
            maturedFlowers.Clear();
            ResetRepairWaterFlow();
            HideAllPopups();
            pauseButton.gameObject.SetActive(true);
            pauseButton.interactable = true;
            UpdateRepairUi();
        }

        private void StartNewRepairRound()
        {
            HysjDataService.RecoverStamina();
            if (HysjDataService.Current.currentStamina < 1)
            {
                ShowMessage("体力不足，无法再来一局。");
                return;
            }
            HysjDataService.AbandonGardenRepairRun();
            BeginRepair();
        }

        private void ReturnAfterRepairSuccess()
        {
            HysjDataService.AbandonGardenRepairRun();
            ReturnToMenu();
        }

        private void ShowRepairSuccessPopup()
        {
            paused = true;
            HideAllPopups();
            FillRepairResultPopup(repairSuccessPopup, true);
            ShowPopupOnTop(repairSuccessPopup);
        }

        private void ShowRepairFailPopup()
        {
            HideAllPopups();
            FillRepairResultPopup(repairFailPopup, false);
            ShowPopupOnTop(repairFailPopup);
        }

        private void FillRepairResultPopup(GameObject popup, bool success)
        {
            var stars = FindDeep(popup == null ? null : popup.transform, "Stars");
            if (stars != null) stars.gameObject.SetActive(false);
            if (success)
            {
                var flowerCount = repairRun != null && repairRun.flowerIndices != null
                    ? repairRun.flowerIndices.Count : CountFlowersInRoute();
                SetDeepText(popup, "BestDistanceLabel", string.Empty);
                SetDeepText(popup, "DistanceLabel", "灌溉花朵：" + flowerCount + "。");
                SetDeepText(popup, "GoldLabel", "获得钻石：" + (flowerCount * 10) + "。");
                SetDeepPosition(popup, "DistanceLabel", new Vector2(0, -30));
                SetDeepPosition(popup, "GoldLabel", new Vector2(0, -72));
            }
            else
            {
                SetDeepText(popup, "BestDistanceLabel", "荒园修复");
                SetDeepText(popup, "DistanceLabel", "路线未满足修复条件。");
                SetDeepText(popup, "GoldLabel", "请重新连接水池和花朵。");
                SetDeepPosition(popup, "DistanceLabel", new Vector2(0, -52));
                SetDeepPosition(popup, "GoldLabel", new Vector2(0, -94));
            }
        }
        private void ConfigureRepairSuccessPopup()
        {
            var buttonTransform = FindDeep(repairSuccessPopup == null ? null : repairSuccessPopup.transform, "nextBtn");
            var button = buttonTransform == null ? null : buttonTransform.GetComponent<Button>();
            if (button == null) return;

            var image = button.GetComponent<Image>();
            var sprite = Resources.Load<Sprite>("HysjLegacy/image2/anniukong");
            if (image != null && sprite != null)
            {
                image.sprite = sprite;
                image.color = Color.white;
                image.type = Image.Type.Simple;
                image.preserveAspect = true;
            }

            var label = FindDeep(button.transform, "Label")?.GetComponent<Text>();
            if (label == null)
            {
                var labelNode = new GameObject("Label", typeof(RectTransform), typeof(Text));
                labelNode.transform.SetParent(button.transform, false);
                label = labelNode.GetComponent<Text>();
            }
            label.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            label.text = "再来一局";
            label.fontSize = 30;
            label.fontStyle = FontStyle.Normal;
            label.color = Color.white;
            label.alignment = TextAnchor.MiddleCenter;
            label.horizontalOverflow = HorizontalWrapMode.Overflow;
            label.verticalOverflow = VerticalWrapMode.Overflow;
            var outline = label.GetComponent<Outline>() ?? label.gameObject.AddComponent<Outline>();
            outline.effectColor = new Color32(187, 41, 70, 255);
            outline.effectDistance = new Vector2(2, -2);
            outline.useGraphicAlpha = false;
            label.raycastTarget = false;
            label.rectTransform.sizeDelta = new Vector2(181, 73);
            label.rectTransform.anchoredPosition = Vector2.zero;
            label.gameObject.SetActive(true);
        }
        private void RestoreMainSuccessPopup()
        {
            var buttonTransform = FindDeep(winPopup == null ? null : winPopup.transform, "nextBtn");
            var button = buttonTransform == null ? null : buttonTransform.GetComponent<Button>();
            if (button == null) return;
            var image = button.GetComponent<Image>();
            var sprite = Resources.Load<Sprite>("HysjLegacy/image2/anniuxiayiguan");
            if (image != null && sprite != null)
            {
                image.sprite = sprite;
                image.color = Color.white;
                image.type = Image.Type.Simple;
                image.preserveAspect = true;
            }
            var label = FindDeep(button.transform, "Label");
            if (label != null) label.gameObject.SetActive(false);
        }
        private int CountFlowersInRoute() { var count = 0; foreach (var f in flowers) if (route.Contains(f)) count++; return count; }
        private void UpdateMaturityCountdown()
        {
            if (maturityCountdown == null) return;
            var hasPlant = false;
            var longestRemaining = 0f;
            foreach (var plant in plants.Values)
            {
                if (plant.hits >= 50) continue;
                hasPlant = true;
                var definition = Seeds[Mathf.Clamp(plant.seed, 0, Seeds.Length - 1)];
                var growthTime = definition.growthTime * (HysjDataService.Current.currentRole == 1 ? .8f : 1f);
                var remaining = Mathf.Max(0f, growthTime + definition.bloomTime - plant.age);
                longestRemaining = Mathf.Max(longestRemaining, remaining);
            }
            var shouldShow = !repair && defending && !finished && hasPlant;
            maturityCountdown.gameObject.SetActive(shouldShow);
            if (shouldShow)
                maturityCountdown.text = "成熟倒计时：" + Mathf.CeilToInt(longestRemaining) + "秒。";
        }
        private void UpdateMainUi()
        {
            UpdateRoleAnimation();
            if (status != null)
            {
                status.text = defending ? "防守中 · 点击出现老鼠的格子进行抓捕。" : Mathf.CeilToInt(Mathf.Max(0, prepTimer)) + "秒后开始防守，请拖动进行播种。";
            }
            UpdateMaturityCountdown();
            resource.text = matchCoins.ToString();
            for (var i = 0; i < cells.Count; i++)
            {
                UpdateCellLand(i);
                var label = cells[i].transform.Find("Label")?.GetComponent<Text>();
                var entity = i < layout.gardenMainEntityIcons.Length ? layout.gardenMainEntityIcons[i] : null;
                var mouseIcon = i < layout.gardenMainMouseIcons.Length ? layout.gardenMainMouseIcons[i] : null;
                if (plants.ContainsKey(i))
                {
                    if (entity != null)
                    {
                        var plantSprite = PlantStageSprite(plants[i]);
                        var animation = plantFrameAnimations != null && i < plantFrameAnimations.Length ? plantFrameAnimations[i] : null;
                        if (animation != null)
                        {
                            animation.SetFallback(plantSprite);
                            animation.Play(FlowerSequencePath(plants[i]));
                            animation.SetPaused(paused || finished);
                            entity.enabled = true;
                        }
                        else
                        {
                            entity.sprite = plantSprite;
                            entity.enabled = entity.sprite != null;
                        }
                    }
                }
                else if (entity != null)
                {
                    var animation = plantFrameAnimations != null && i < plantFrameAnimations.Length ? plantFrameAnimations[i] : null;
                    if (animation != null) animation.Stop(false);
                    entity.enabled = false;
                }

                Mouse mouse;
                var mouseHp = mice.TryGetValue(i, out mouse) ? mouse.hp : 0;
                if (mouse != null && mouseIcon != null)
                {
                    var animation = mouseFrameAnimations != null && i < mouseFrameAnimations.Length ? mouseFrameAnimations[i] : null;
                    if (animation != null)
                    {
                        animation.SetFallback(layout.gardenMouseSprite);
                        animation.Play(MouseSequencePath(mouse));
                        animation.SetPaused(paused || finished);
                        mouseIcon.enabled = true;
                    }
                    else
                    {
                        mouseIcon.sprite = layout.gardenMouseSprite;
                        mouseIcon.enabled = true;
                    }
                }
                else if (mouseIcon != null)
                {
                    var animation = mouseFrameAnimations != null && i < mouseFrameAnimations.Length ? mouseFrameAnimations[i] : null;
                    if (animation != null) animation.Stop(false);
                }
                SetMouseHpIcons(i, mouseIcon, mouseHp);
                if (label != null)
                {
                    var plant = plants.ContainsKey(i) ? plants[i] : null;
                    label.text = plant != null && plant.hits > 0 ? "受击 " + plant.hits : string.Empty;
                }
            }
        }

        private void RefreshTutorialGuide()
        {
            if (tutorialGuideRoot == null) EnsureTutorialGuide();
            if (tutorialGuideRoot == null) return;
            var step = tutorialStep;
            var visible = tutorialActive && !repair && !defending && !finished && !paused && (step == 0 || step == 1);
            tutorialGuideRoot.SetActive(visible);
            if (!visible)
            {
                if (tutorialGuideSeedVisual != null) tutorialGuideSeedVisual.SetActive(false);
                if (tutorialGuideButtonVisual != null) tutorialGuideButtonVisual.SetActive(false);
                tutorialGuideStep = -1;
                return;
            }

            tutorialGuideRoot.transform.SetAsLastSibling();
            if (tutorialGuideStep != step)
            {
                tutorialGuideStep = step;
                tutorialGuideElapsed = 0f;
            }
            if (tutorialGuideText != null)
                tutorialGuideText.text = step == 0
                    ? "请拖动种子进行播种。"
                    : "开启防守后请拍打来偷花的老鼠。";
            UpdateTutorialTargetVisuals(tutorialGuideRoot.GetComponent<RectTransform>());
            UpdateTutorialGuideAnimation(0f);
        }

        private void UpdateTutorialGuideAnimation(float deltaTime)
        {
            if (tutorialGuideRoot == null || !tutorialGuideRoot.activeSelf || tutorialGuideFinger == null) return;
            tutorialGuideElapsed += deltaTime;
            var guideRect = tutorialGuideRoot.GetComponent<RectTransform>();
            if (guideRect == null) return;
            UpdateTutorialTargetVisuals(guideRect);
            if (tutorialGuideStep == 0)
            {
                if (!TryGetTutorialTarget(layout.gardenSeedIcons, 0, guideRect, out var start)
                    || !TryGetTutorialTarget(layout.gardenMainCells, TutorialPlotIndex, guideRect, out var end)) return;
                var cycle = Mathf.Repeat(tutorialGuideElapsed, 2f);
                var progress = cycle < .3f ? 0f : cycle < 1.45f ? Mathf.SmoothStep(0f, 1f, (cycle - .3f) / 1.15f) : 1f;
                tutorialGuideFinger.rectTransform.anchoredPosition = Vector2.Lerp(start, end, progress) + TutorialFingerTipOffset;
                tutorialGuideFinger.rectTransform.localScale = Vector3.one;
                return;
            }
            if (tutorialGuideStep == 1 && primary != null)
            {
                var primaryRect = primary.GetComponent<RectTransform>();
                if (primaryRect == null) return;
                var target = TutorialTargetPosition(primaryRect, guideRect);
                tutorialGuideFinger.rectTransform.anchoredPosition = target + TutorialFingerTipOffset;
                var pulse = 1f + Mathf.Sin(tutorialGuideElapsed * 5f) * .06f;
                tutorialGuideFinger.rectTransform.localScale = Vector3.one * pulse;
            }
        }

        private void UpdateTutorialTargetVisuals(RectTransform guideRect)
        {
            if (guideRect == null) return;
            var showSeed = tutorialGuideStep == 0;
            var showButton = tutorialGuideStep == 1;
            SetTutorialTargetVisual(tutorialGuideSeedVisual, layout.gardenSeedIcons, 0, guideRect, showSeed);
            SetTutorialTargetVisual(tutorialGuideButtonVisual, primary, guideRect, showButton);
            if (tutorialGuideBubble != null) tutorialGuideBubble.transform.SetAsLastSibling();
            if (tutorialGuideFinger != null) tutorialGuideFinger.transform.SetAsLastSibling();
        }

        private static void SetTutorialTargetVisual(GameObject visual, Image[] sources, int index, RectTransform guideRect, bool visible)
        {
            var source = sources != null && index >= 0 && index < sources.Length ? sources[index] : null;
            SetTutorialTargetVisual(visual, source == null ? null : source.rectTransform, guideRect, visible);
        }

        private static void SetTutorialTargetVisual(GameObject visual, Button source, RectTransform guideRect, bool visible)
        {
            SetTutorialTargetVisual(visual, source == null ? null : source.GetComponent<RectTransform>(), guideRect, visible);
        }

        private static void SetTutorialTargetVisual(GameObject visual, RectTransform sourceRect, RectTransform guideRect, bool visible)
        {
            if (visual == null) return;
            visible = visible && sourceRect != null;
            visual.SetActive(visible);
            if (!visible) return;
            var visualRect = visual.GetComponent<RectTransform>();
            if (visualRect == null) return;
            visualRect.anchorMin = visualRect.anchorMax = new Vector2(.5f, .5f);
            visualRect.pivot = new Vector2(.5f, .5f);
            visualRect.sizeDelta = sourceRect.rect.size;
            visualRect.anchoredPosition = TutorialTargetPosition(sourceRect, guideRect);
            visualRect.localScale = Vector3.one;
        }

        private static bool TryGetTutorialTarget(Button[] buttons, int index, RectTransform guideRect, out Vector2 position)
        {
            position = Vector2.zero;
            if (buttons == null || index < 0 || index >= buttons.Length || buttons[index] == null) return false;
            var target = buttons[index].GetComponent<RectTransform>();
            if (target == null) return false;
            position = TutorialTargetPosition(target, guideRect);
            return true;
        }

        private static bool TryGetTutorialTarget(Image[] images, int index, RectTransform guideRect, out Vector2 position)
        {
            position = Vector2.zero;
            if (images == null || index < 0 || index >= images.Length || images[index] == null) return false;
            position = TutorialTargetPosition(images[index].rectTransform, guideRect);
            return true;
        }

        private static Vector2 TutorialTargetPosition(RectTransform target, RectTransform guideRect)
        {
            var worldCenter = target.TransformPoint(target.rect.center);
            return guideRect.InverseTransformPoint(worldCenter);
        }

        private void UpdateRoleAnimation()
        {
            if (roleAnimationImage == null || roleFrameAnimation == null) return;
            if (defending)
            {
                roleFrameAnimation.SetPaused(true);
                roleAnimationImage.enabled = false;
                return;
            }
            if (HysjDataService.Current != null) activeRoleIndex = Mathf.Clamp(HysjDataService.Current.currentRole, 0, 4);
            ApplyRoleAnimationLayout();
            var loaded = roleFrameAnimation.Play("role/" + (activeRoleIndex + 1));
            roleFrameAnimation.SetPaused(paused || finished);
            roleAnimationImage.enabled = loaded;
        }

        private void ApplyRoleAnimationLayout()
        {
            if (roleAnimationImage == null) return;
            var index = Mathf.Clamp(activeRoleIndex, 0, RoleLayouts.Length - 1);
            var layoutData = RoleLayouts[index];
            var rect = roleAnimationImage.rectTransform;
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.zero;
            rect.pivot = Vector2.zero;
            rect.anchoredPosition = new Vector2(layoutData.x, layoutData.y);
        }

        private static string FlowerSequencePath(Plant plant)
        {
            var seed = Mathf.Clamp(plant.seed, 0, Seeds.Length - 1);
            var stage = Mathf.Clamp(plant.stage + 1, 1, 3);
            return "flower/" + (seed + 1) + "/" + stage;
        }

        private static string MouseSequencePath(Mouse mouse)
        {
            if (mouse.age < .35f) return "laoshu/up";
            return mouse.planted ? "laoshu/bite" : "laoshu/down";
        }

        private void SetMouseHpIcons(int cellIndex, Image firstIcon, int hp)
        {
            hp = Mathf.Clamp(hp, 0, MouseHpIconCapacity);
            var cell = cellIndex >= 0 && cellIndex < layout.gardenMainCells.Length ? layout.gardenMainCells[cellIndex] : null;
            for (var slot = 0; slot < MouseHpIconCapacity; slot++)
            {
                var icon = slot == 0
                    ? firstIcon
                    : cell == null ? null : cell.transform.Find("MouseIcon" + (slot + 1))?.GetComponent<Image>();
                if (icon == null) continue;
                if (slot != 0 || cellIndex < 0 || mouseFrameAnimations == null || cellIndex >= mouseFrameAnimations.Length || mouseFrameAnimations[cellIndex] == null || !mouseFrameAnimations[cellIndex].IsPlaying)
                    icon.sprite = layout.gardenMouseSprite;
                icon.enabled = slot < hp;
            }
        }

        private Sprite PlantStageSprite(Plant plant)
        {
            var seed = Mathf.Clamp(plant.seed, 0, Seeds.Length - 1);
            if (plant.stage <= 0) return layout.gardenPlantGrowthSprites[seed];
            if (plant.stage == 1) return layout.gardenPlantBloomSprites[seed];
            return layout.gardenPlantResultSprites[seed];
        }
        private static Text EnsureSeedEstimatedScoreLabel(Transform seedCard, Text priceLabel)
        {
            if (seedCard == null) return null;
            var label = seedCard.Find("EstimatedScoreLabel")?.GetComponent<Text>();
            if (label == null)
            {
                var node = new GameObject("EstimatedScoreLabel", typeof(RectTransform), typeof(CanvasRenderer), typeof(Text));
                node.transform.SetParent(seedCard, false);
                label = node.GetComponent<Text>();
            }
            label.font = priceLabel != null && priceLabel.font != null
                ? priceLabel.font : Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            label.fontSize = 15;
            label.fontStyle = FontStyle.Bold;
            label.color = priceLabel != null ? priceLabel.color : new Color32(137, 76, 20, 255);
            label.alignment = TextAnchor.MiddleCenter;
            label.horizontalOverflow = HorizontalWrapMode.Wrap;
            label.verticalOverflow = VerticalWrapMode.Truncate;
            label.resizeTextForBestFit = true;
            label.resizeTextMinSize = 11;
            label.resizeTextMaxSize = 15;
            label.raycastTarget = false;
            var rect = label.rectTransform;
            rect.anchorMin = rect.anchorMax = new Vector2(.5f, .5f);
            rect.pivot = new Vector2(.5f, .5f);
            rect.sizeDelta = new Vector2(128, 24);
            rect.anchoredPosition = new Vector2(0, -38);
            rect.SetAsLastSibling();
            return label;
        }
        private void ShowMessage(string message) { if (ShowTip != null) ShowTip(message); else if (status != null) status.text = message; }
        private void HideAllPopups()
        {
            if (pausePopup != null) pausePopup.SetActive(false); if (winPopup != null) winPopup.SetActive(false); if (losePopup != null) losePopup.SetActive(false); if (revivePopup != null) revivePopup.SetActive(false); if (gameOverPopup != null) gameOverPopup.SetActive(false);
            if (repairSuccessPopup != null) repairSuccessPopup.SetActive(false); if (repairFailPopup != null) repairFailPopup.SetActive(false);
        }
        private void MovePopupsToTop()
        {
            MoveToTop(pausePopup); MoveToTop(winPopup); MoveToTop(losePopup); MoveToTop(revivePopup); MoveToTop(gameOverPopup);
            MoveToTop(repairSuccessPopup); MoveToTop(repairFailPopup);
        }
        private static void ShowPopupOnTop(GameObject popup)
        {
            if (popup == null) return;
            popup.transform.SetAsLastSibling();
            popup.SetActive(true);
        }
        private static void MoveToTop(GameObject popup)
        {
            if (popup != null) popup.transform.SetAsLastSibling();
        }
        private static void BindPopupButton(GameObject popupRoot, string buttonName, UnityEngine.Events.UnityAction action) { var button = FindDeep(popupRoot == null ? null : popupRoot.transform, buttonName); var component = button == null ? null : button.GetComponent<Button>(); if (component == null) return; component.onClick.RemoveAllListeners(); component.onClick.AddListener(action); }
        private static Transform FindDeep(Transform parent, string nodeName) { if (parent == null) return null; if (parent.name == nodeName) return parent; for (var i = 0; i < parent.childCount; i++) { var found = FindDeep(parent.GetChild(i), nodeName); if (found != null) return found; } return null; }
        private static void SetDeepPosition(GameObject popupRoot, string name, Vector2 position) { var node = FindDeep(popupRoot == null ? null : popupRoot.transform, name) as RectTransform; if (node != null) node.anchoredPosition = position; }
        private void FillPopupResult(GameObject popupRoot, int stars)
        {
            var isFailurePopup = popupRoot != null && (popupRoot == losePopup || popupRoot == gameOverPopup);
            if (isFailurePopup)
            {
                SetDeepText(popupRoot, "BestDistanceLabel", string.Empty);
                SetDeepText(popupRoot, "DistanceLabel", "当前分数：" + TotalActualValue() + "。");
                SetDeepText(popupRoot, "GoldLabel", "最低通关分数：" + StarOneThreshold() + "。");
                SetDeepPosition(popupRoot, "DistanceLabel", new Vector2(0, -44));
                SetDeepPosition(popupRoot, "GoldLabel", new Vector2(0, -78));
            }
            else if (popupRoot == winPopup)
            {
                SetDeepText(popupRoot, "BestDistanceLabel", "本关分数：" + TotalActualValue() + "。");
                SetDeepText(popupRoot, "DistanceLabel", "捕获老鼠：" + capturedMice + "只。");
                SetDeepText(popupRoot, "GoldLabel", "获得钻石：" + MainLevelDiamondReward() + "。");
                SetDeepPosition(popupRoot, "BestDistanceLabel", new Vector2(0, -50));
                SetDeepPosition(popupRoot, "DistanceLabel", new Vector2(0, -84));
                SetDeepPosition(popupRoot, "GoldLabel", new Vector2(0, -118));
            }
            else
            {
                SetDeepText(popupRoot, "DistanceLabel", "本关成熟花朵价值：" + TotalActualValue() + "花币。");
                SetDeepText(popupRoot, "GoldLabel", "捕获老鼠：" + capturedMice + "只，获得" + capturedMice + "钻石。");
                SetDeepText(popupRoot, "BestDistanceLabel", "第" + activeLevel + "关");
            }
            var showStars = popupRoot == winPopup;
            var starsRoot = FindDeep(popupRoot == null ? null : popupRoot.transform, "Stars");
            if (starsRoot != null) starsRoot.gameObject.SetActive(showStars);
            for (var i = 1; i <= 3; i++)
            {
                var star = FindDeep(popupRoot == null ? null : popupRoot.transform, "star" + i);
                var image = star == null ? null : star.GetComponent<Image>();
                if (image != null)
                {
                    image.sprite = Resources.Load<Sprite>("HysjLegacy/image2/" + (i <= stars ? "wujiaoxing1" : "wujiaoxing2"));
                    image.color = Color.white;
                }
            }
        }
        private static void SetDeepText(GameObject popupRoot, string name, string value) { var node = FindDeep(popupRoot == null ? null : popupRoot.transform, name); var text = node == null ? null : node.GetComponent<Text>(); if (text != null) text.text = value; }
    }
}
