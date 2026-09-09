using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace Hysj
{
    [DefaultExecutionOrder(-100)]
    public sealed class HysjEditorApp : MonoBehaviour
    {
        public HysjEditorLayout layout;
        public HysjServerClient server;
        public float splashSeconds = 5f;

        private Action _shopConfirmAction;
        private Action _rechargeConfirmAction;
        private Coroutine _storyRoutine;
        private bool _staminaRecoveryVisible;
        private float _hudTimer;
        private float _antiAddictionTimer;
        private bool _mainAntiAddictionPolling;
        private bool _hasShownMinorTimeWarning;
        private bool _isLoadScene;
        private bool _switchingAccount;
        private Button _wishTownBuildingButton;
        private Text _wishTownBuildingLabel;
        private GameObject _wishTownBuildingPanel;
        private GameObject _wishTownRepairPanel;
        private GameObject _levelSelectPanel;
        private int _selectedWishTownBuilding = -1;

        private sealed class RankRow
        {
            public int order;
            public int rank;
            public string name;
            public int level;
            public bool isSelf;
        }

        [Serializable]
        private sealed class AchievementConfig
        {
            public int id;
            public string name;
            public string desc;
            public int rewardGold;
            public int target;
            public string type;
        }

        [Serializable]
        private sealed class AchievementConfigList
        {
            public AchievementConfig[] items;
        }

        private void Awake()
        {
            if (layout == null) layout = GetComponent<HysjEditorLayout>();
            if (server == null) server = GetComponent<HysjServerClient>() ?? gameObject.AddComponent<HysjServerClient>();
            _isLoadScene = HysjSceneRouter.IsLoadScene;
            HysjMessageUi.EnsureLoaded();
            HysjCloudSaveSync.EnsureLoaded();
            if (HysjSceneRouter.IsMainScene) HysjAudioManager.PlayMainMusic();
            if (layout == null)
            {
                Debug.LogError("HysjEditorApp requires a HysjEditorLayout component with editor-authored references.");
                enabled = false;
                return;
            }

            EnsureMobileUiInput();
            LockPortraitOrientation();

            // A zero-scale Canvas makes the serialized UI appear to be missing.
            // Repair legacy prefab data before any panel is shown.
            foreach (var canvas in GetComponentsInChildren<Canvas>(true))
            {
                // Screen Space Overlay canvases must not inherit a plain
                // Transform's size. On Android that makes the visible UI and
                // GraphicRaycaster hit coordinates diverge.
                if (canvas.renderMode == RenderMode.ScreenSpaceOverlay && canvas.transform.parent != null &&
                    canvas.transform.parent.GetComponent<RectTransform>() == null)
                    canvas.transform.SetParent(null, true);

                if (canvas.transform.localScale.sqrMagnitude < 0.001f)
                    canvas.transform.localScale = Vector3.one;

                var canvasRect = canvas.GetComponent<RectTransform>();
                if (canvasRect != null)
                {
                    canvasRect.anchorMin = Vector2.zero;
                    canvasRect.anchorMax = Vector2.one;
                    canvasRect.offsetMin = Vector2.zero;
                    canvasRect.offsetMax = Vector2.zero;
                    canvasRect.pivot = new Vector2(.5f, .5f);
                }

                var scaler = canvas.GetComponent<CanvasScaler>();
                if (scaler != null)
                {
                    // Match Start.fire's 720x1280 Canvas fitWidth setting.
                    scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
                    scaler.referenceResolution = new Vector2(720, 1280);
                    scaler.matchWidthOrHeight = 0f;
                }
            }

            NormalizeScrollViewLayout();
            NormalizeFullScreenBackgrounds();
            NormalizeRankPanel();
            NormalizeRechargeLayout();
            NormalizeRewardCardTemplates();
            NormalizeShopGoldBalance();
            NormalizeShopConfirmPanel();
            NormalizeRechargeConfirmPanel();
            NormalizeStaminaLabel();
            NormalizeFeaturePanelTitles();
            NormalizeMainHudTypography();
            HysjFormalUiSkin.ApplyLogin(layout);
            HysjFormalUiSkin.ApplyMain(layout);

            HysjDataService.Changed += RefreshVisibleData;
            BindButtons();
            BindGameplayEntryButtons();
            EnsureWishTownBuildingButton();
            layout.SetAllPanelsInactive();
            if (_isLoadScene)
            {
                var destination = HysjSceneRouter.ConsumeLoadDestination();
                if (destination == HysjSceneRouter.LoadDestination.Login) ShowLogin();
                else if (destination == HysjSceneRouter.LoadDestination.RealName) ShowRealName();
                else
                {
                    Set(layout.splashScreen, true);
                    StartCoroutine(Boot());
                }
            }
            else if (HysjSceneRouter.IsMainScene)
            {
                // Starting HysjMain directly from the editor bypasses HysjLoad
                // and would otherwise leave Current as an empty guest save even
                // when PlayerPrefs contains a logged-in account.
                HysjSaveData resumed;
                if (HysjDataService.TryResumeAccount(out resumed)) ShowMain();
                else HysjSceneRouter.LoadLogin();
            }
        }

        private void OnDestroy()
        {
            HysjDataService.Changed -= RefreshVisibleData;
            StopStoryRoutine();
        }

        private void Update()
        {
            if (_mainAntiAddictionPolling && HysjDataService.HasAccount)
            {
                _antiAddictionTimer += Time.unscaledDeltaTime;
                if (_antiAddictionTimer >= 5f)
                {
                    _antiAddictionTimer -= 5f;
                    CheckMainAntiAddiction();
                }
            }

            if (!HysjDataService.HasAccount) return;
            _hudTimer += Time.unscaledDeltaTime;
            if (_hudTimer >= 1f)
            {
                _hudTimer = 0f;
                HysjDataService.RecoverStamina();
                RefreshHud();
                RefreshOnlineRewardCountdowns();
            }
        }

        // Existing HysjMain prefabs were authored with a generic reward card.
        // Rebuild only those hidden templates before any list items are cloned,
        // so a prefab made before the Cocos parity fix renders correctly too.
        private void NormalizeRewardCardTemplates()
        {
            NormalizeRewardCardTemplate(layout.weeklyItemTemplate, false);
            NormalizeRewardCardTemplate(layout.onlineItemTemplate, true);
            NormalizeRewardGrid(layout.weeklyContent, false);
            NormalizeRewardGrid(layout.onlineContent, true);
        }

        private static void NormalizeRewardCardTemplate(GameObject item, bool isOnlineReward)
        {
            if (item == null || item.transform.Find("bg") != null) return;

            var transform = item.transform;
            for (var i = transform.childCount - 1; i >= 0; i--)
            {
                var child = transform.GetChild(i);
                child.SetParent(null, false);
                Destroy(child.gameObject);
            }

            var rect = item.GetComponent<RectTransform>();
            if (rect != null) rect.sizeDelta = new Vector2(240, 280);
            var element = item.GetComponent<LayoutElement>() ?? item.AddComponent<LayoutElement>();
            element.minWidth = element.preferredWidth = 240;
            element.minHeight = element.preferredHeight = 280;
            element.flexibleHeight = 0;

            var cardY = isOnlineReward ? 24f : 23f;
            CreateRewardImage(transform, "bg", "dikuangjiangli", new Vector2(215, 221), new Vector2(0, cardY));
            var title = CreateRewardText(transform, "dayLabel", isOnlineReward ? "初入" : "周一", isOnlineReward ? 30 : 26,
                new Vector2(isOnlineReward ? 120 : 52, 45.36f), new Vector2(0, isOnlineReward ? 79 : 77));
            title.fontStyle = FontStyle.Bold;
            title.horizontalOverflow = HorizontalWrapMode.Wrap;

            var rewardBg = new GameObject("rewardBg", typeof(RectTransform), typeof(Image));
            rewardBg.transform.SetParent(transform, false);
            rewardBg.GetComponent<RectTransform>().sizeDelta = new Vector2(160, 90);
            rewardBg.GetComponent<RectTransform>().anchoredPosition = new Vector2(0, isOnlineReward ? 16 : 15);
            rewardBg.GetComponent<Image>().color = Color.clear;
            var coin = CreateRewardImage(rewardBg.transform, "coin", "zuanshi", new Vector2(55, 52),
                new Vector2(0, isOnlineReward ? 10 : 12));
            coin.rectTransform.localScale = Vector3.one;
            var amount = CreateRewardText(rewardBg.transform, "rewardLabel", "3000", 30,
                new Vector2(100, 38), new Vector2(0, isOnlineReward ? -28 : -30));
            AddBlackOutline(amount.gameObject);

            var claimButton = CreateRewardClaimButton(transform, new Vector2(0, isOnlineReward ? -86 : -90));
            if (isOnlineReward)
            {
                var claimText = CreateRewardText(claimButton.transform, "claimText", string.Empty, 16, new Vector2(133, 40), Vector2.zero);
                AddBlackOutline(claimText.gameObject);
            }
        }

        private static void NormalizeRewardGrid(Transform content, bool isOnlineReward)
        {
            if (content == null) return;
            var grid = content.GetComponent<GridLayoutGroup>();
            if (grid == null) return;
            // NewImage3 reward cards are authored at 172x222 with a 176x72
            // action button. Keep one cell around the complete composition so
            // the scroll view does not overlap or clip adjacent cards.
            grid.cellSize = new Vector2(176, 300);
            grid.spacing = new Vector2(4, 8);
            grid.padding = new RectOffset(0, 0, 0, 0);
            grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
            grid.constraintCount = 3;
            grid.childAlignment = TextAnchor.UpperCenter;
        }

        private void NormalizeShopGoldBalance()
        {
            if (layout.shopPanel == null) return;
            var frame = layout.shopPanel.transform.Find("Frame");
            if (frame == null) return;

            // The formal prefab already contains the shop balance nodes. The
            // old runtime fallback used different names and created a second
            // icon/value pair on top of them.
            var icon = frame.Find("GoldIcon");
            if (icon == null)
            {
                icon = frame.Find("jinbi");
                if (icon == null)
                    icon = CreateRewardImage(frame, "jinbi", "zuanshi", new Vector2(55, 52), new Vector2(-35.836f, 266.179f)).transform;
            }
            var iconImage = icon == null ? null : icon.GetComponent<Image>();
            if (iconImage != null)
            {
                var sprite = Resources.Load<Sprite>("HysjLegacy/NewImage2/zuanshi");
                if (sprite != null) iconImage.sprite = sprite;
                iconImage.preserveAspect = true;
                iconImage.rectTransform.sizeDelta = new Vector2(55, 52);
                iconImage.rectTransform.anchoredPosition = new Vector2(-35.836f, 254.179f);
            }

            var labelTransform = frame.Find("GoldValue");
            if (labelTransform == null) labelTransform = frame.Find("zs_num");
            if (labelTransform == null)
            {
                var label = CreateRewardText(frame, "zs_num", string.Empty, 30, new Vector2(160, 45.36f), new Vector2(-.019f, 269.451f));
                labelTransform = label.transform;
            }

            layout.shopGoldLabel = labelTransform.GetComponent<Text>();
            if (layout.shopGoldLabel != null)
            {
                layout.shopGoldLabel.rectTransform.pivot = new Vector2(0, .5f);
                layout.shopGoldLabel.alignment = TextAnchor.MiddleLeft;
                layout.shopGoldLabel.color = new Color32(163, 86, 80, 255);
                layout.shopGoldLabel.fontStyle = FontStyle.Normal;
                layout.shopGoldLabel.fontSize = 30;
                layout.shopGoldLabel.rectTransform.sizeDelta = new Vector2(160, 45.36f);
                layout.shopGoldLabel.rectTransform.anchoredPosition = new Vector2(-.019f, 257.451f);
                var outline = layout.shopGoldLabel.GetComponent<Outline>();
                if (outline != null) outline.enabled = false;
            }

            // Disable any stale fallback objects left by an already-running
            // scene or an older serialized instance.
            var duplicateIcon = frame.Find("jinbi");
            if (duplicateIcon != null && duplicateIcon != icon) duplicateIcon.gameObject.SetActive(false);
            var duplicateLabel = frame.Find("zs_num");
            if (duplicateLabel != null && duplicateLabel != labelTransform) duplicateLabel.gameObject.SetActive(false);
        }

        private void NormalizeShopConfirmPanel()
        {
            if (layout == null || layout.shopConfirmPanel == null) return;

            // The confirmation panel used to be a child of ShopPanel. That
            // works for purchases, but a building upgrade opens it while the
            // shop is inactive, so the active child remains invisible. Keep
            // the shared confirmation at the canvas level instead.
            var overlayRoot = layout.mainScreen == null ? null : layout.mainScreen.transform.parent;
            if (overlayRoot != null && layout.shopConfirmPanel.transform.parent != overlayRoot)
                layout.shopConfirmPanel.transform.SetParent(overlayRoot, false);
            layout.shopConfirmPanel.transform.SetAsLastSibling();

            var mask = layout.shopConfirmPanel.GetComponent<Image>();
            if (mask != null)
            {
                mask.sprite = Resources.Load<Sprite>("HysjLegacy/AtlasPicture/遮罩");
                mask.color = new Color32(255, 255, 255, 150);
                mask.type = Image.Type.Simple;
                mask.preserveAspect = false;
            }

            var frame = layout.shopConfirmPanel.transform.Find("ShopConfirmFrame");
            NormalizeConfirmFrame(frame);
            NormalizeConfirmButton(layout.shopCancelButton, "取消", true);
            NormalizeConfirmButton(layout.shopConfirmButton, "确定", false);
            NormalizeConfirmLabel(layout.shopConfirmLabel);
        }

        private void NormalizeRechargeConfirmPanel()
        {
            if (layout == null || layout.rechargeConfirmPanel == null) return;
            var frame = layout.rechargeConfirmPanel.transform.Find("RechargeConfirmFrame");
            NormalizeConfirmFrame(frame);
            if (frame != null)
            {
                var messageBand = frame.Find("MessageBand");
                if (messageBand != null) messageBand.gameObject.SetActive(false);
            }
            NormalizeConfirmLabel(layout.rechargeConfirmLabel);
            NormalizeConfirmButton(layout.rechargeCancelButton, "取消", true);
            NormalizeConfirmButton(layout.rechargeConfirmButton, "确定", false);
        }

        private static void NormalizeConfirmLabel(Text label)
        {
            if (label == null) return;
            label.color = Color.white;
            label.fontSize = 24;
            label.fontStyle = FontStyle.Normal;
            label.alignment = TextAnchor.MiddleCenter;
            label.horizontalOverflow = HorizontalWrapMode.Overflow;
            label.verticalOverflow = VerticalWrapMode.Overflow;
            var rect = label.rectTransform;
            rect.sizeDelta = new Vector2(360, 32.76f);
            rect.anchoredPosition = new Vector2(0, 64.088f);
        }

        private static void NormalizeConfirmFrame(Transform frame)
        {
            if (frame == null) return;
            var rect = frame as RectTransform;
            if (rect != null)
            {
                rect.sizeDelta = new Vector2(534, 424);
                rect.anchoredPosition = Vector2.zero;
            }

            var image = frame.GetComponent<Image>();
            var sprite = Resources.Load<Sprite>("HysjLegacy/image/tanchuang3");
            if (image != null && sprite != null)
            {
                image.sprite = sprite;
                image.color = Color.white;
                image.type = Image.Type.Simple;
                image.preserveAspect = false;
            }
        }

        private static void NormalizeConfirmButton(Button button, string labelText, bool isCancel)
        {
            if (button == null) return;
            var rect = button.transform as RectTransform;
            if (rect != null)
            {
                rect.sizeDelta = new Vector2(201, 81);
                rect.anchoredPosition = new Vector2(isCancel ? -108 : 108, -124);
            }
            var image = button.GetComponent<Image>();
            var sprite = Resources.Load<Sprite>("HysjLegacy/image2/anniukong");
            if (image != null && sprite != null)
            {
                image.sprite = sprite;
                image.color = Color.white;
                image.type = Image.Type.Simple;
                image.preserveAspect = true;
            }

            SetConfirmButtonLabel(button, labelText);
        }

        private static void SetConfirmButtonLabel(Button button, string labelText)
        {
            if (button == null) return;
            var label = button.transform.Find("Label")?.GetComponent<Text>() ?? button.GetComponentInChildren<Text>(true);
            if (label == null) return;
            label.text = labelText;
            label.fontSize = 30;
            label.fontStyle = FontStyle.Normal;
            label.color = Color.white;
            label.alignment = TextAnchor.MiddleCenter;
            label.horizontalOverflow = HorizontalWrapMode.Overflow;
            label.verticalOverflow = VerticalWrapMode.Overflow;
            label.rectTransform.sizeDelta = new Vector2(181, 73);
            label.rectTransform.anchoredPosition = Vector2.zero;
            label.gameObject.SetActive(true);
        }

        private void NormalizeRechargeLayout()
        {
            if (layout.rechargeContent == null) return;
            var viewport = layout.rechargeContent.parent as RectTransform;
            if (viewport != null)
            {
                viewport.sizeDelta = new Vector2(480, 620);
                viewport.anchoredPosition = new Vector2(0, -38);
            }

            var grid = layout.rechargeContent.GetComponent<GridLayoutGroup>();
            if (grid != null)
            {
                grid.cellSize = new Vector2(216, 188);
                grid.spacing = new Vector2(18, 24);
                grid.padding = new RectOffset(0, 0, 0, 0);
                grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
                grid.constraintCount = 2;
                grid.childAlignment = TextAnchor.UpperCenter;
            }

            var frame = layout.rechargePanel == null ? null : layout.rechargePanel.transform.Find("Frame");
            if (frame == null) return;
            var titleBand = frame.Find("TitleBand") as RectTransform;
            var title = frame.Find("Title") as RectTransform;
            if (titleBand != null) titleBand.anchoredPosition = new Vector2(0, 344);
            if (title != null) title.anchoredPosition = new Vector2(0, 344);
        }

        private void NormalizeStaminaLabel()
        {
            if (layout.staminaLabel != null)
            {
                layout.staminaLabel.rectTransform.sizeDelta = new Vector2(95, 42);
                layout.staminaLabel.rectTransform.anchoredPosition = new Vector2(264, 574);
                ConfigureMainCounterText(layout.staminaLabel);
                layout.staminaLabel.alignment = TextAnchor.MiddleCenter;
                layout.staminaLabel.horizontalOverflow = HorizontalWrapMode.Overflow;
                layout.staminaLabel.verticalOverflow = VerticalWrapMode.Overflow;
            }

            ConfigureMainCounterText(layout.goldLabel);
            ConfigureStaminaRecoveryText(layout.staminaRecoveryLabel);
        }

        private void NormalizeMainHudTypography()
        {
            ConfigureMainCounterText(layout.goldLabel);
            ConfigureMainCounterText(layout.staminaLabel);
            ConfigureStaminaRecoveryText(layout.staminaRecoveryLabel);
        }

        private void NormalizeFeaturePanelTitles()
        {
            var panels = new[]
            {
                layout.rankPanel,
                layout.shopPanel,
                layout.rechargePanel,
                layout.achievementsPanel,
                layout.weeklyPanel,
                layout.onlinePanel,
                layout.settingsPanel
            };

            foreach (var panel in panels)
            {
                var title = panel == null ? null : panel.transform.Find("Frame/Title")?.GetComponent<Text>();
                if (title != null) title.fontStyle = FontStyle.Normal;
            }
        }

        private static void ConfigureMainCounterText(Text text)
        {
            if (text == null) return;
            text.font = Font.CreateDynamicFontFromOSFont("Arial", 30) ?? Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            text.fontSize = 30;
            text.fontStyle = FontStyle.Bold;
            text.color = new Color32(137, 76, 20, 255);
            var outline = text.GetComponent<Outline>();
            if (outline != null) outline.enabled = false;
        }

        private static void ConfigureDiamondAmountText(Text text, int fontSize = 30)
        {
            if (text == null) return;
            text.color = new Color32(160, 1, 52, 255);
            text.fontSize = fontSize;
            text.fontStyle = FontStyle.Normal;
            text.alignment = TextAnchor.MiddleCenter;
            text.horizontalOverflow = HorizontalWrapMode.Overflow;
            text.verticalOverflow = VerticalWrapMode.Overflow;
            var outline = text.GetComponent<Outline>() ?? text.gameObject.AddComponent<Outline>();
            outline.enabled = true;
            outline.effectColor = Color.white;
            outline.effectDistance = new Vector2(2, -2);
            outline.useGraphicAlpha = true;
        }

        private static void ConfigureShopPriceText(Text text)
        {
            if (text == null) return;
            text.color = Color.white;
            text.fontSize = 30;
            text.fontStyle = FontStyle.Normal;
            text.alignment = TextAnchor.MiddleCenter;
            text.horizontalOverflow = HorizontalWrapMode.Overflow;
            text.verticalOverflow = VerticalWrapMode.Overflow;
            var outline = text.GetComponent<Outline>() ?? text.gameObject.AddComponent<Outline>();
            outline.enabled = true;
            outline.effectColor = new Color32(117, 46, 141, 255);
            outline.effectDistance = new Vector2(2, -2);
            outline.useGraphicAlpha = true;
        }

        private static void ConfigureStaminaRecoveryText(Text text)
        {
            if (text == null) return;
            text.font = Font.CreateDynamicFontFromOSFont("Arial", 30) ?? Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            text.fontSize = 22;
            text.fontStyle = FontStyle.Bold;
            text.color = new Color32(169, 59, 47, 255);
            var outline = text.GetComponent<Outline>() ?? text.gameObject.AddComponent<Outline>();
            outline.effectColor = new Color32(249, 237, 223, 255);
            outline.effectDistance = new Vector2(2, -2);
            outline.useGraphicAlpha = false;
        }

        private static Image CreateRewardImage(Transform parent, string name, string resourceName, Vector2 size, Vector2 position)
        {
            var node = new GameObject(name, typeof(RectTransform), typeof(Image));
            node.transform.SetParent(parent, false);
            var rect = node.GetComponent<RectTransform>();
            rect.sizeDelta = size;
            rect.anchoredPosition = position;
            var image = node.GetComponent<Image>();
            var resourcePath = resourceName == "zuanshi"
                ? "HysjLegacy/NewImage2/zuanshi"
                : "HysjLegacy/image2/" + resourceName;
            image.sprite = Resources.Load<Sprite>(resourcePath);
            image.color = Color.white;
            image.preserveAspect = true;
            return image;
        }

        private static Text CreateRewardText(Transform parent, string name, string value, int fontSize, Vector2 size, Vector2 position)
        {
            var node = new GameObject(name, typeof(RectTransform), typeof(Text));
            node.transform.SetParent(parent, false);
            var rect = node.GetComponent<RectTransform>();
            rect.sizeDelta = size;
            rect.anchoredPosition = position;
            var text = node.GetComponent<Text>();
            text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            text.text = value;
            text.fontSize = fontSize;
            text.color = Color.white;
            text.alignment = TextAnchor.MiddleCenter;
            text.horizontalOverflow = HorizontalWrapMode.Wrap;
            text.verticalOverflow = VerticalWrapMode.Overflow;
            return text;
        }

        private static Button CreateRewardClaimButton(Transform parent, Vector2 position)
        {
            var node = new GameObject("claimButton", typeof(RectTransform), typeof(Image), typeof(Button));
            node.transform.SetParent(parent, false);
            var rect = node.GetComponent<RectTransform>();
            rect.sizeDelta = new Vector2(217, 95);
            rect.anchoredPosition = position;
            var image = node.GetComponent<Image>();
            image.sprite = Resources.Load<Sprite>("HysjLegacy/NewImage3/anniulingqu");
            image.color = Color.white;
            image.preserveAspect = true;
            var button = node.GetComponent<Button>();
            button.targetGraphic = image;
            button.transition = Selectable.Transition.None;
            return button;
        }

        private static void AddBlackOutline(GameObject target)
        {
            var outline = target.GetComponent<Outline>() ?? target.AddComponent<Outline>();
            outline.effectColor = Color.black;
            outline.effectDistance = new Vector2(2, -2);
        }

        private IEnumerator Boot()
        {
            yield return new WaitForSecondsRealtime(splashSeconds);
            HysjSaveData resumed;
            if (HysjDataService.TryResumeAccount(out resumed))
            {
                var savedRealName = PlayerPrefs.GetString(HysjDataService.RealNameKey,
                    resumed.realNameVerified && resumed.realNameVerifiedByServer ? "true" : "false") == "true";
                if (savedRealName)
                {
                    string username;
                    string password;
                    if (HysjDataService.TryGetSavedCredentials(out username, out password)) StartCoroutine(ResumeLogin(username, password));
                    else ShowLogin();
                }
                else ShowRealName();
            }
            else ShowLogin();
        }

        private void BindButtons()
        {
            Bind(layout.loginButton, () => Login(false));
            Bind(layout.registerButton, () => Login(true));
            Bind(layout.privacyButton, () => ShowOnly(layout.privacyPanel));
            Bind(layout.ageTipsButton, ShowAgeTips);
            Bind(layout.ageTipsCloseButton, HideAgeTips);
            Bind(layout.staminaToggleButton, ToggleStaminaRecovery);
            Bind(layout.rankButton, OpenRank);
            Bind(layout.shopButton, () => OpenShop());
            Bind(layout.rechargeButton, OpenRecharge);
            Bind(layout.achievementsButton, () => OpenAchievements());
            Bind(layout.skillsButton, OpenSkills);
            Bind(layout.weeklyButton, () => OpenWeekly());
            Bind(layout.onlineButton, () => OpenOnlineRewards());
            Bind(layout.settingsButton, OpenSettings);
            Bind(layout.storyButton, () => ShowStory());
            Bind(layout.storySkipButton, SkipStory);
            Bind(layout.accountButton, () => ShowOnly(layout.accountPanel));
            Bind(layout.realNameSubmitButton, SubmitRealName);
            Bind(layout.realNameCancelButton, ShowLogin);
            Bind(layout.openRealNameButton, ShowRealName);
            Bind(layout.settingsSyncDownloadButton, () => StartCoroutine(server.FetchUserData((ok, message) => { ShowTips(message); if (ok) ShowMain(); })));
            Bind(layout.settingsSyncUploadButton, () => StartCoroutine(server.UploadUserData((_, message) => ShowTips(message))));
            Bind(layout.settingsLogoutButton, ResetAccountAndShowLogin);
            Bind(layout.accountSyncDownloadButton, () => StartCoroutine(server.FetchUserData((ok, message) => { ShowTips(message); if (ok) ShowMain(); })));
            Bind(layout.accountSyncUploadButton, () => StartCoroutine(server.UploadUserData((_, message) => ShowTips(message))));
            if (layout.closeButtons != null)
            {
                foreach (var button in layout.closeButtons)
                {
                    if (_isLoadScene) Bind(button, ShowLogin);
                    else Bind(button, ShowMain);
                }
            }
            Bind(layout.shopConfirmButton, ConfirmShopAction);
            Bind(layout.shopCancelButton, CancelShopAction);
            Bind(layout.rechargeConfirmButton, ConfirmRechargeAction);
            Bind(layout.rechargeCancelButton, CancelRechargeAction);
            if (layout.loginRemoteToggle != null) layout.loginRemoteToggle.onValueChanged.AddListener(value => server.UseRemoteServer = value);
            if (layout.settingsRemoteToggle != null) layout.settingsRemoteToggle.onValueChanged.AddListener(value => server.UseRemoteServer = value);
            if (layout.musicToggle != null)
            {
                layout.musicToggle.onValueChanged.AddListener(value => { HysjDataService.Current.musicEnabled = value; SetToggleSprite(layout.musicToggle, value); HysjAudioManager.ApplyMusicSetting(); HysjDataService.Save(); });
                SetToggleSprite(layout.musicToggle, layout.musicToggle.isOn);
            }
            if (layout.soundToggle != null)
            {
                layout.soundToggle.onValueChanged.AddListener(value => { HysjDataService.Current.soundEnabled = value; SetToggleSprite(layout.soundToggle, value); HysjDataService.Save(); });
                SetToggleSprite(layout.soundToggle, layout.soundToggle.isOn);
            }
            if (layout.agreementToggle != null) layout.agreementToggle.isOn = true;
        }

        private void BindGameplayEntryButtons()
        {
            if (!HysjSceneRouter.IsMainScene || layout.mainScreen == null) return;
            // The authored main-menu layout uses BtnStart2 for the primary match-three mode.
            BindGameplayEntry("BtnStart", OpenSideMode);
            BindGameplayEntry("BtnStart2", OpenLevelSelect);
        }

        private void OpenSideMode()
        {
            if (!HysjDataService.IsWishTownSideModeUnlocked())
            {
                ShowTips("完成第三个建筑物“观星塔”的修复后，即可解锁无尽模式。");
                return;
            }
            if (!HysjSceneRouter.LoadBlocks())
                ShowTips("体力不足，无法开始游戏。");
        }

        private void OpenLevelSelect()
        {
            // LevelSelectPanel is a sibling of Main under the authored Frame root.
            _levelSelectPanel = layout.mainScreen.transform.parent == null ? null : layout.mainScreen.transform.parent.Find("LevelSelectPanel")?.gameObject;
            if (_levelSelectPanel == null) return;
            var content = _levelSelectPanel.transform.Find("LevelContent/Content");
            var template = _levelSelectPanel.transform.Find("ItemTemplate")?.gameObject;
            if (content == null || template == null) return;
            ClearRuntimeChildren(content);
            var maxLevel = Mathf.Max(1, WishTownConfigService.MaxLevel);
            var unlocked = Mathf.Clamp(HysjDataService.Current.unlockedLevel, 1, maxLevel);
            for (var level = 1; level <= maxLevel; level++)
            {
                var capturedLevel = level;
                var available = level <= unlocked;
                var item = Instantiate(template, content);
                item.name = "Level_" + level;
                item.SetActive(true);
                var stars = HysjDataService.Current.levelStars != null && level <= HysjDataService.Current.levelStars.Length
                    ? HysjDataService.Current.levelStars[level - 1]
                    : 0;
                ConfigureLevelItem(item, level, stars, !available);
                var title = item.transform.Find("Title")?.GetComponent<Text>();
                if (title != null) title.text = "第" + level + "关";
                // The authored level card puts its Button on the Action child.
                // Looking only on the card root silently left every card without
                // a click handler.
                var button = ItemButton(item);
                if (button == null) continue;
                button.interactable = available;
                button.onClick.RemoveAllListeners();
                if (available) button.onClick.AddListener(() => EnterMatch3(capturedLevel));
            }
            var close = _levelSelectPanel.transform.Find("Frame/Close")?.GetComponent<Button>();
            if (close != null) { close.onClick.RemoveAllListeners(); close.onClick.AddListener(CloseLevelSelect); }
            ShowOnly(_levelSelectPanel);
        }

        private void CloseLevelSelect()
        {
            Set(_levelSelectPanel, false);
            Set(layout.mainScreen, true);
        }

        private void EnterMatch3(int level)
        {
            if (HysjSceneRouter.LoadMatch3(level)) return;
            ShowTips("体力不足，无法开始游戏。");
        }

        private void BindGameplayEntry(string objectName, UnityEngine.Events.UnityAction action)
        {
            var node = layout.mainScreen.transform.Find(objectName);
            var button = node == null ? null : node.GetComponent<Button>();
            if (button == null) return;
            button.gameObject.SetActive(true);
            button.onClick.RemoveAllListeners();
            button.onClick.AddListener(action);
        }

        private void Login(bool register)
        {
            var username = layout.usernameInput == null ? string.Empty : layout.usernameInput.text;
            var password = layout.passwordInput == null ? string.Empty : layout.passwordInput.text;
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                ShowTips("请输入用户名和密码。");
                return;
            }
            if (username.Length < 2)
            {
                ShowTips("用户名长度过短。");
                return;
            }
            if (password.Length < 6)
            {
                ShowTips("密码长度过短。");
                return;
            }
            if (layout.agreementToggle == null || !layout.agreementToggle.isOn)
            {
                ShowTips("请勾选同意用户协议。");
                return;
            }

            StartCoroutine(server.Login(username, password, register ? 1 : 2, (transportOk, response) =>
            {
                // SplashManager only logs transport/parse errors. It does not
                // replace them with a client-created message.
                if (!transportOk || response == null) return;
                if (register)
                {
                    ShowTips(response.msg ?? string.Empty);
                    return;
                }

                if (response.code == 0)
                {
                    if (!server.ApplyLoginData(username, password, response)) return;
                    StartCoroutine(FinishInteractiveLogin(response));
                    return;
                }

                if (response.msg == "帐号密码错误" || response.msg == "帐号密码错误。") ShowTips("帐号密码错误。");
                else ShowNotice(response.msg ?? string.Empty);
            }));
        }

        private IEnumerator ResumeLogin(string username, string password)
        {
            var savedRealName = PlayerPrefs.GetString(HysjDataService.RealNameKey, string.Empty) == "true";
            var transportOk = false;
            ServerEnvelope response = null;
            yield return StartCoroutine(server.Login(username, password, 2, (ok, result) =>
            {
                transportOk = ok;
                response = result;
            }));
            // Do not enter the main scene when automatic login failed. The
            // previous fallback left an empty/stale username in the main scene,
            // which made Breathe return "无该用户" and look like a ban.
            if (!transportOk || response == null || !server.ApplyLoginData(username, password, response))
            {
                ShowLogin();
                ShowTips("自动登录失败，请手动登录。");
                yield break;
            }

            yield return StartCoroutine(InitialUserDataSync());
            if (savedRealName)
            {
                HysjDataService.Current.realNameVerified = true;
                HysjDataService.Current.realNameVerifiedByServer = true;
                HysjDataService.Save();
            }
            var breatheOk = false;
            ServerEnvelope breathe = null;
            yield return StartCoroutine(server.Breathe((ok, result) => { breatheOk = ok; breathe = result; }));
            if (!breatheOk || breathe == null)
            {
                ShowLogin();
                ShowTips("自动登录验证失败，请重新登录。");
                yield break;
            }
            if (IsBreatheUserMissing(breathe))
            {
                HandleBreatheUserMissing();
                yield break;
            }
            if (IsAntiAddictionBlocked(breathe))
            {
                ShowNotice(AntiAddictionMessage(breathe), HandleLoginAntiAddictionBlocked);
            }
            else ShowMain();
        }

        private IEnumerator FinishInteractiveLogin(ServerEnvelope response)
        {
            yield return StartCoroutine(InitialUserDataSync());
            var isRealName = response.data.isrealname == 1 || response.data.is_real == 1;
            if (!isRealName)
            {
                ShowRealName();
                yield break;
            }

            var breatheOk = false;
            ServerEnvelope breathe = null;
            yield return StartCoroutine(server.Breathe((ok, result) => { breatheOk = ok; breathe = result; }));
            if (!breatheOk || breathe == null) yield break;
            if (IsBreatheUserMissing(breathe))
            {
                HandleBreatheUserMissing();
                yield break;
            }
            if (IsAntiAddictionBlocked(breathe))
            {
                ShowNotice(AntiAddictionMessage(breathe), HandleLoginAntiAddictionBlocked);
                yield break;
            }

            HysjDataService.Current.realNameVerified = true;
            HysjDataService.Current.realNameVerifiedByServer = true;
            PlayerPrefs.SetString(HysjDataService.RealNameKey, "true");
            HysjDataService.Save();
            ShowTips("登录成功，正在跳转。");
            yield return new WaitForSecondsRealtime(1f);
            ShowMain();
        }

        private IEnumerator InitialUserDataSync()
        {
            HysjCloudSaveSync.BeginInitialSync();
            var fetchSucceeded = false;
            var localUploadRequired = false;
            yield return StartCoroutine(server.FetchUserData((ok, shouldUploadLocal, _) =>
            {
                fetchSucceeded = ok;
                localUploadRequired = shouldUploadLocal;
            }));
            HysjCloudSaveSync.CompleteInitialSync(fetchSucceeded, localUploadRequired);
        }

        private void ShowLogin()
        {
            if (!_isLoadScene || layout.loginScreen == null)
            {
                HysjSceneRouter.LoadLogin();
                return;
            }
            layout.SetAllPanelsInactive();
            Set(layout.loginScreen, true);
            if (layout.usernameInput != null) layout.usernameInput.text = string.Empty;
            if (layout.passwordInput != null) layout.passwordInput.text = string.Empty;
            if (layout.loginRemoteToggle != null) layout.loginRemoteToggle.isOn = server.UseRemoteServer;
        }

        private void ShowRealName()
        {
            if (!_isLoadScene || layout.realNamePanel == null)
            {
                HysjSceneRouter.LoadRealName();
                return;
            }
            layout.SetAllPanelsInactive();
            Set(layout.realNamePanel, true);
            if (layout.realNameInput != null) layout.realNameInput.text = string.Empty;
            if (layout.idNumberInput != null) layout.idNumberInput.text = string.Empty;
        }

        private void ShowAgeTips()
        {
            Set(layout.ageTipsPanel, true);
        }

        private void HideAgeTips()
        {
            Set(layout.ageTipsPanel, false);
        }

        private void ShowMain()
        {
            if (!HysjSceneRouter.IsMainScene || layout.mainScreen == null)
            {
                HysjSceneRouter.LoadMain();
                return;
            }
            CloseTransientPanels();
            HysjDataService.RefreshRewardScopes();
            HysjDataService.BeginWishTownTutorialIfNeeded();
            Set(layout.mainScreen, true);
            _staminaRecoveryVisible = false;
            Set(layout.staminaRecoveryLabel == null ? null : layout.staminaRecoveryLabel.gameObject, false);
            RefreshHud();
            if (!_mainAntiAddictionPolling)
            {
                _mainAntiAddictionPolling = true;
                _antiAddictionTimer = 0f;
                CheckMainAntiAddiction();
            }
            if (!HysjDataService.IsStoryPopupShown())
            {
                HysjDataService.SetStoryPopupShown();
                ShowStory();
            }
        }

        private void ShowStory()
        {
            StopStoryRoutine();
            ShowOnly(layout.storyPanel);
            _staminaRecoveryVisible = false;
            if (layout.storyText != null) layout.storyText.text = string.Empty;
            // The authored NewImage2 story background includes the visible skip
            // button. Keep the real Button hit target active from the first
            // frame so the rendered control is never misleadingly inert.
            Set(layout.storySkipButton == null ? null : layout.storySkipButton.gameObject, true);
            _storyRoutine = StartCoroutine(PlayStory());
        }

        private IEnumerator PlayStory()
        {
            const string story = "星愿小镇曾经是被星光守护的家园，直到一场流星雨让喷泉、花房与观星塔沉入沉睡。收集星愿建材，逐步修复五座小镇建筑，让街道重新亮起灯火。";
            var skipAt = Time.unscaledTime + 3f;
            if (layout.storyText == null) yield break;
            for (var i = 0; i < story.Length; i++)
            {
                layout.storyText.text += story[i];
                if (Time.unscaledTime >= skipAt) Set(layout.storySkipButton == null ? null : layout.storySkipButton.gameObject, true);
                yield return new WaitForSecondsRealtime(.05f);
            }
            while (true)
            {
                if (Time.unscaledTime >= skipAt) Set(layout.storySkipButton == null ? null : layout.storySkipButton.gameObject, true);
                yield return null;
            }
        }

        private void StopStoryRoutine()
        {
            if (_storyRoutine != null) StopCoroutine(_storyRoutine);
            _storyRoutine = null;
        }

        private void SkipStory()
        {
            StopStoryRoutine();
            Set(layout.storyPanel, false);
            Set(layout.storySkipButton == null ? null : layout.storySkipButton.gameObject, false);
            Set(layout.mainScreen, true);
        }

        private void OpenRank()
        {
            ShowOnly(layout.rankPanel);
            Clear(layout.rankContent);
            RefreshList(layout.rankContent);
            SetRankSelfInfo(1, SelfRankName(), LocalRankLevel());
            StartCoroutine(server.FetchRank((ok, response, message) =>
            {
                if (!ok)
                {
                    // RankManager.ts only logs a RankList failure and leaves
                    // the empty list with the local user's footer visible.
                    return;
                }

                RenderRank(response);
            }));
        }

        private void RenderRank(RankListResponse response)
        {
            var rows = new List<RankRow>();
            var selfId = HysjDataService.Current.userId ?? string.Empty;
            var localLevel = LocalRankLevel();
            RankRow selfRow = null;
            var serverRows = response == null ? null : response.data;
            if (serverRows == null)
            {
                // Cocos treats a successful envelope without data as an empty
                // leaderboard; it does not manufacture a list row for self.
                Clear(layout.rankContent);
                RefreshList(layout.rankContent);
                SetRankSelfInfo(1, SelfRankName(), localLevel);
                return;
            }

            for (var i = 0; i < serverRows.Length; i++)
            {
                var source = serverRows[i];
                if (source == null) continue;
                var isSelf = string.Equals(source.accountId.ToString(), selfId, StringComparison.Ordinal);
                var name = RankDisplayName(source.accountId);
                // RankList's totalLoginNum field is the source project's
                // reported highest completed level. Display the next unlocked
                // level, so an unreported account (0) shows 1 and a first-level
                // completion report (1) shows 2.
                var serverLevel = Mathf.Max(1, source.totalLoginNum + 1);
                var row = new RankRow
                {
                    order = i,
                    name = name,
                    // RankManager.ts keeps the locally progressed level
                    // when the server record belongs to the current user.
                    level = isSelf ? Mathf.Max(localLevel, serverLevel) : serverLevel,
                    isSelf = isSelf
                };
                rows.Add(row);
                if (isSelf) selfRow = row;
            }

            // The Cocos implementation always places the current account in
            // the same sorted collection. It is not only a separate footer.
            if (selfRow == null)
            {
                selfRow = new RankRow
                {
                    order = rows.Count,
                    name = SelfRankName(),
                    level = localLevel,
                    isSelf = true
                };
                rows.Add(selfRow);
            }

            rows.Sort((left, right) =>
            {
                var levelOrder = right.level.CompareTo(left.level);
                return levelOrder != 0 ? levelOrder : left.order.CompareTo(right.order);
            });

            Clear(layout.rankContent);
            for (var i = 0; i < rows.Count; i++)
            {
                var row = rows[i];
                row.rank = i + 1;
                var item = MakeItem(layout.rankItemTemplate, layout.rankContent);
                SetRankItem(item, row.rank, row.name, row.level);
                var button = ItemButton(item);
                if (button != null) button.interactable = false;
            }

            RefreshList(layout.rankContent);
            SetRankSelfInfo(selfRow.rank, selfRow.name, selfRow.level);
        }

        private static int LocalRankLevel()
        {
            var data = HysjDataService.Current;
            // This is only the fallback when RankList has no row for the
            // current account. Keep it aligned with the local unlocked level;
            // server rows use totalLoginNum + 1 above.
            return Mathf.Clamp(data.unlockedLevel, 1, WishTownConfigService.MaxLevel);
        }

        private static string SelfRankName()
        {
            var userId = HysjDataService.Current.userId;
            if (string.IsNullOrWhiteSpace(userId))
                userId = PlayerPrefs.GetString(HysjDataService.UserIdKey, string.Empty);
            if (string.IsNullOrWhiteSpace(userId)) userId = HysjDataService.Current.username;
            return "玩家" + (userId ?? string.Empty);
        }

        private static string RankDisplayName(int accountId)
        {
            return "玩家" + accountId;
        }

        private static void SetRankItem(GameObject item, int rank, string playerName, int level)
        {
            if (item == null) return;

            // Support both the current three-column template and older
            // generated prefabs that used the generic list field names.
            var rankLabel = FindItemText(item, "l_rank", "RankValue", "ActionLabel");
            var nameLabel = FindItemText(item, "l_name", "PlayerName", "Title");
            var levelLabel = FindItemText(item, "l_level", "MaxLevel", "Detail");

            // NewImage3 rank rows use a very light pink background. Keep the
            // dynamic values in the authored dark-red text color so they stay
            // legible at the target 720x1280 scale.
            var rankColor = new Color32(173, 0, 55, 255);
            var medalNode = item.transform.Find("RankMedal");
            if (medalNode == null)
            {
                var medalObject = new GameObject("RankMedal", typeof(RectTransform), typeof(Image));
                medalNode = medalObject.transform;
                medalNode.SetParent(item.transform, false);
                medalNode.SetSiblingIndex(1);
            }
            var medal = medalNode.GetComponent<Image>();
            if (medal != null)
            {
                medal.sprite = rank <= 3 ? Resources.Load<Sprite>("HysjLegacy/NewImage3/" + rank) : null;
                medal.color = Color.white;
                medal.type = Image.Type.Simple;
                medal.preserveAspect = true;
                medal.raycastTarget = false;
                medal.rectTransform.sizeDelta = new Vector2(61, 56);
                medal.rectTransform.anchoredPosition = new Vector2(-178, 0);
                medal.gameObject.SetActive(rank <= 3 && medal.sprite != null);
            }
            if (rankLabel != null) rankLabel.gameObject.SetActive(rank > 3);
            ConfigureRankText(rankLabel, rank.ToString(), new Vector2(-178, -2), new Vector2(60, 40), 26, false, rankColor);
            ConfigureRankText(nameLabel, playerName, new Vector2(-2, -3), new Vector2(104, 40), 26, true, rankColor);
            ConfigureRankText(levelLabel, level.ToString(), new Vector2(169, -3), new Vector2(80, 40), 26, false, rankColor);
        }

        private void SetRankSelfInfo(int rank, string playerName, int level)
        {
            SetPanelText(layout.rankPanel, "RankSelf/RankSelfRank", rank > 0 ? rank.ToString() : "-");
            var nameLabel = layout.rankPanel == null ? null : layout.rankPanel.transform.Find("RankSelf/RankSelfName")?.GetComponent<Text>();
            if (nameLabel != null)
                ConfigureRankText(nameLabel, playerName, Vector2.zero, new Vector2(160, 40), 24, true, new Color32(173, 0, 55, 255));
            else SetPanelText(layout.rankPanel, "RankSelf/RankSelfName", playerName);
            SetPanelText(layout.rankPanel, "RankSelf/RankSelfLevel", level.ToString());
        }

        private static Text FindItemText(GameObject item, params string[] names)
        {
            var texts = item.GetComponentsInChildren<Text>(true);
            for (var nameIndex = 0; nameIndex < names.Length; nameIndex++)
            {
                for (var textIndex = 0; textIndex < texts.Length; textIndex++)
                {
                    if (texts[textIndex].name == names[nameIndex]) return texts[textIndex];
                }
            }
            return null;
        }

        private static void ConfigureRankText(Text label, string value, Vector2 position, Vector2 size, int fontSize, bool bestFit, Color color)
        {
            if (label == null) return;
            label.text = value;
            label.color = color;
            label.fontSize = fontSize;
            label.alignment = TextAnchor.MiddleCenter;
            // Cocos Label's overflow NONE leaves a long account id on one
            // line. Do not wrap/truncate it to the 104px source rect.
            label.horizontalOverflow = HorizontalWrapMode.Overflow;
            label.verticalOverflow = VerticalWrapMode.Overflow;
            label.resizeTextForBestFit = bestFit;
            label.resizeTextMinSize = 16;
            label.resizeTextMaxSize = fontSize;
            var outline = label.GetComponent<Outline>() ?? label.gameObject.AddComponent<Outline>();
            outline.enabled = true;
            outline.effectColor = new Color32(255, 239, 244, 210);
            outline.effectDistance = new Vector2(1, -1);
            outline.useGraphicAlpha = true;
            var rect = label.rectTransform;
            rect.anchoredPosition = position;
            rect.sizeDelta = size;
        }

        private void OpenShop(bool keepScrollOffset = false, Vector2 scrollOffset = default)
        {
            ShowOnly(layout.shopPanel);
            RefreshHud();
            Clear(layout.shopContent);
            var characters = WishTownConfigService.GetCharacters();
            for (var i = 0; i < (characters == null ? 0 : characters.Length); i++)
            {
                var role = i;
                var character = characters[i];
                var name = character == null ? "主角" + (i + 1) : character.name;
                var price = character == null ? 0 : character.unlock_cost_diamonds;
                var effect = character == null ? string.Empty : character.skill_description;
                var item = MakeItem(layout.shopItemTemplate, layout.shopContent);
                var unlocked = HysjDataService.Current.unlockedRoles[role];
                var selected = HysjDataService.Current.currentRole == role;
                var actionText = selected ? "使用中" : unlocked ? "使用" : price + " 钻石";
                SetItem(item, name, effect, actionText);
                ConfigureShopItem(item, role + 1, false, actionText);
                var button = ItemButton(item);
                // ShopManager.ts keeps the selected role's red 使用中 button
                // visible and touchable; the handler itself is a no-op.
                button.interactable = true;
                Bind(button, () => SelectRole(role, name, price));
            }
            var stamina = MakeItem(layout.shopItemTemplate, layout.shopContent);
            SetItem(stamina, "补充体力", "体力上限 " + HysjDataService.Current.maxStamina, "100 钻石");
            ConfigureShopItem(stamina, 0, true, "100 钻石");
            Bind(ItemButton(stamina), () =>
            {
                var currentOffset = GetScrollOffset(layout.shopContent);
                if (HysjDataService.Current.currentStamina >= HysjDataService.Current.maxStamina) { ShowTips("体力已满，无需购买。"); return; }
                if (HysjDataService.Current.currentGold < 100) { ShowTips("钻石不足，无法购买体力。"); return; }
                ShowShopConfirm("确定要花费100钻石补充体力吗？", () =>
                {
                    if (HysjDataService.Current.currentStamina >= HysjDataService.Current.maxStamina) { ShowTips("体力已满，无需购买。"); return; }
                    if (!HysjDataService.SpendGold(100)) { ShowTips("钻石不足，无法购买体力。"); return; }
                    var before = HysjDataService.Current.currentStamina;
                    HysjDataService.Current.currentStamina = HysjDataService.Current.maxStamina;
                    HysjDataService.Save(); OpenShop(true, currentOffset); ShowTips("补充成功！获得" + (HysjDataService.Current.currentStamina - before) + "点体力。");
                });
            });
            RefreshList(layout.shopContent, keepScrollOffset, scrollOffset);
        }

        private void SelectRole(int role, string roleName, int price)
        {
            if (HysjDataService.Current.currentRole == role) return;
            var scrollOffset = GetScrollOffset(layout.shopContent);
            if (!HysjDataService.Current.unlockedRoles[role])
            {
                if (HysjDataService.Current.currentGold < price) { ShowTips("钻石不足，无法解锁宠物。"); return; }
                ShowShopConfirm("确定要花费" + price + "钻石解锁宠物吗？", () =>
                {
                    if (!HysjDataService.SpendGold(price)) { ShowTips("钻石不足，无法解锁宠物。"); return; }
                    HysjDataService.Current.unlockedRoles[role] = true;
                    HysjDataService.Current.currentRole = role;
                    HysjDataService.Save(); OpenShop(true, scrollOffset); ShowTips("宠物解锁成功！");
                });
                return;
            }
            HysjDataService.Current.currentRole = role;
            HysjDataService.Save();
            OpenShop(true, scrollOffset);
            ShowTips("宠物切换成功！");
        }

        private void OpenRecharge()
        {
            ShowOnly(layout.rechargePanel);
            Clear(layout.rechargeContent);
            // Keep the recharge cards identical to HysjMain's authored
            // diamond shop. The legacy store config only contains the
            // currently enabled subset and must not change this UI layout.
            var prices = new[] { 6, 30, 68, 198, 328, 648 };
            var diamonds = new[] { 60, 300, 680, 1980, 3280, 6480 };
            for (var i = 0; i < prices.Length; i++)
            {
                var index = i;
                var item = MakeItem(layout.rechargeItemTemplate, layout.rechargeContent);
                SetItem(item, diamonds[index].ToString(), "", string.Empty);
                ConfigureDiamondAmountText(item.transform.Find("Title")?.GetComponent<Text>(), 36);
                var priceButton = ItemButton(item);
                var priceImage = priceButton == null ? null : priceButton.GetComponent<Image>();
                if (priceImage != null)
                {
                    var priceSprite = Resources.Load<Sprite>("HysjLegacy/NewImage3/￥" + prices[index]);
                    if (priceSprite != null) { priceImage.sprite = priceSprite; priceImage.color = Color.white; }
                }
                Bind(priceButton, () => ShowRechargeConfirm("是否确认支付" + prices[index] + "元人民币兑换" + diamonds[index] + "个钻石？", () => StartCoroutine(SubmitRecharge(diamonds[index]))));
            }
            RefreshList(layout.rechargeContent);
        }

        private IEnumerator SubmitRecharge(int diamonds)
        {
            var transportOk = false;
            ServerEnvelope response = null;
            yield return StartCoroutine(server.PayDiamond(diamonds, (ok, result) =>
            {
                transportOk = ok;
                response = result;
            }));

            if (!transportOk || response == null)
            {
                ShowNotice("充值请求失败，请稍后重试。");
                yield break;
            }

            if (response.code != 0)
            {
                ShowNotice(string.IsNullOrEmpty(response.msg) ? "充值失败。" : response.msg);
                yield break;
            }

            HysjDataService.AddGold(diamonds);
            RefreshHud();
            ShowTips("兑换成功！获得" + diamonds + "个钻石。");
        }

        private void OpenAchievements(bool keepScrollOffset = false, Vector2 scrollOffset = default)
        {
            ShowOnly(layout.achievementsPanel);
            HideAchievementBalance();
            Clear(layout.achievementContent);
            var configs = LoadAchievementConfigs();
            if (configs == null) return;

            Array.Sort(configs, (left, right) => left.id.CompareTo(right.id));
            foreach (var config in configs)
            {
                if (config == null || config.id <= 0) continue;
                var id = config.id;
                var reward = config.rewardGold;
                var current = AchievementProgress(config.type);
                var completed = current >= config.target;
                var claimed = HysjDataService.Current.achievementClaims.Contains(config.id);
                var item = MakeItem(layout.achievementItemTemplate, layout.achievementContent);
                SetItem(item, config.name, string.Empty, "领取");
                ConfigureAchievementItem(item, BuildAchievementDescription(config), current, config.target, completed, claimed);
                SetRewardAmount(item, reward);
                var button = ItemButton(item);
                button.interactable = !claimed && completed;
                Bind(button, () =>
                {
                    var currentOffset = GetScrollOffset(layout.achievementContent);
                    HysjDataService.Current.achievementClaims.Add(id);
                    HysjDataService.AddGold(reward);
                    OpenAchievements(true, currentOffset);
                    ShowTips("获得" + reward + "钻石。");
                });
            }
            RefreshList(layout.achievementContent, keepScrollOffset, scrollOffset);
        }

        private static void HideAchievementBalance(GameObject panel)
        {
            if (panel == null) return;
            var frame = panel.transform.Find("Frame");
            if (frame == null) return;
            var names = new[] { "GoldIcon", "GoldValue", "jinbi", "zs_num" };
            foreach (var name in names)
            {
                var node = frame.Find(name);
                if (node != null) node.gameObject.SetActive(false);
            }
        }

        private void HideAchievementBalance()
        {
            HideAchievementBalance(layout == null ? null : layout.achievementsPanel);
        }

        private AchievementConfig[] LoadAchievementConfigs()
        {
            var asset = Resources.Load<TextAsset>("HysjLegacy/config/achievement");
            if (asset == null)
            {
                Debug.LogError("Achievement config not found: HysjLegacy/config/achievement");
                return null;
            }

            var configs = JsonUtility.FromJson<AchievementConfigList>("{\"items\":" + asset.text + "}");
            return configs == null ? null : configs.items;
        }

        private static string BuildAchievementDescription(AchievementConfig config)
        {
            if (config.type == "1") return "通关关卡达到" + config.target + "关";
            return config.desc;
        }

        private void OpenSkills()
        {
            ShowOnly(layout.skillsPanel);
            Clear(layout.skillContent);
            for (var i = 0; i < HysjDataService.Current.skills.Count; i++)
            {
                var selected = HysjDataService.Current.skills[i];
                var item = MakeItem(layout.skillItemTemplate, layout.skillContent);
                SetItem(item, selected.name + " Lv." + selected.level, selected.description + " · 效果 " + selected.CurrentEffect, selected.level >= selected.maxLevel ? "满级" : selected.NextCost + " 钻石");
                ConfigureSkillItem(item, i + 1, selected.level >= selected.maxLevel);
                var button = ItemButton(item);
                button.interactable = selected.level < selected.maxLevel;
                Bind(button, () =>
                {
                    if (!HysjDataService.SpendGold(selected.NextCost)) { ShowTips("钻石不足。"); return; }
                    selected.level++; HysjDataService.Save(); OpenSkills(); ShowTips("升级成功。");
                });
            }
            RefreshList(layout.skillContent);
        }

        private void OpenWeekly(bool keepScrollOffset = false, Vector2 scrollOffset = default)
        {
            ShowOnly(layout.weeklyPanel);
            Clear(layout.weeklyContent);
            HysjDataService.RefreshRewardScopes();
            var today = DateTime.Now.DayOfWeek == DayOfWeek.Sunday ? 7 : (int)DateTime.Now.DayOfWeek;
            var rewards = new[] { 100, 120, 150, 180, 200, 250, 500 };
            for (var i = 1; i <= 7; i++)
            {
                var day = i;
                var claimed = HysjDataService.Current.weeklyRewardClaims.Contains(day);
                var item = MakeItem(layout.weeklyItemTemplate, layout.weeklyContent);
                var available = day == today;
                ConfigureRewardItem(item, new[] { "周一", "周二", "周三", "周四", "周五", "周六", "周日" }[day - 1], rewards[day - 1], false, string.Empty);
                var button = ItemButton(item);
                ConfigureWeeklyRewardButton(item, claimed, available);
                Bind(button, () =>
                {
                    var currentOffset = GetScrollOffset(layout.weeklyContent);
                    HysjDataService.Current.weeklyRewardClaims.Add(day);
                    HysjDataService.AddGold(rewards[day - 1]);
                    OpenWeekly(true, currentOffset);
                    ShowTips("获得" + rewards[day - 1] + "钻石。");
                });
            }
            RefreshList(layout.weeklyContent, keepScrollOffset, scrollOffset);
        }

        private void OpenOnlineRewards(bool keepScrollOffset = false, Vector2 scrollOffset = default)
        {
            ShowOnly(layout.onlinePanel);
            Clear(layout.onlineContent);
            HysjDataService.RefreshRewardScopes();
            for (var i = 1; i <= 9; i++)
            {
                var rewardId = i;
                var required = i * 10;
                var claimed = HysjDataService.Current.onlineRewardClaims.Contains(rewardId);
                var item = MakeItem(layout.onlineItemTemplate, layout.onlineContent);
                var names = new[] { "勇者初临", "征途前行", "勇者历练", "秘境探索", "无畏前行", "坚守之心", "勇者常驻", "传奇之路", "终极勇者" };
                var available = !claimed && HysjDataService.Current.dailyOnlineMinutes >= required;
                var actionText = claimed || available ? string.Empty : Mathf.Max(0, required - HysjDataService.Current.dailyOnlineMinutes) + "分钟后领取";
                ConfigureRewardItem(item, names[i - 1], 200, true, actionText);
                var button = ItemButton(item);
                ConfigureOnlineRewardButton(item, claimed, available);
                Bind(button, () =>
                {
                    var currentOffset = GetScrollOffset(layout.onlineContent);
                    HysjDataService.Current.onlineRewardClaims.Add(rewardId);
                    HysjDataService.AddGold(200);
                    OpenOnlineRewards(true, currentOffset);
                    ShowTips("获得200钻石。");
                });
            }
            RefreshList(layout.onlineContent, keepScrollOffset, scrollOffset);
        }

        private void RefreshOnlineRewardCountdowns()
        {
            if (layout.onlinePanel == null || !layout.onlinePanel.activeInHierarchy || layout.onlineContent == null) return;
            var onlineMinutes = HysjDataService.Current.dailyOnlineMinutes;
            var rewardIndex = 0;
            for (var i = 0; i < layout.onlineContent.childCount; i++)
            {
                var item = layout.onlineContent.GetChild(i).gameObject;
                if (item == layout.onlineItemTemplate || !item.activeSelf) continue;
                rewardIndex++;
                var claimed = HysjDataService.Current.onlineRewardClaims.Contains(rewardIndex);
                var available = !claimed && onlineMinutes >= rewardIndex * 10;
                var countdown = claimed || available ? string.Empty : Mathf.Max(0, rewardIndex * 10 - onlineMinutes) + "分钟后领取";
                var claimText = item.transform.Find("claimButton/claimText")?.GetComponent<Text>();
                if (claimText != null)
                {
                    claimText.text = countdown;
                    claimText.gameObject.SetActive(!claimed && !available && !string.IsNullOrEmpty(countdown));
                }
                ConfigureOnlineRewardButton(item, claimed, available);
            }
        }

        private void OpenSettings()
        {
            ShowOnly(layout.settingsPanel);
            if (layout.settingsRemoteToggle != null) layout.settingsRemoteToggle.isOn = server.UseRemoteServer;
            if (layout.musicToggle != null) layout.musicToggle.isOn = HysjDataService.Current.musicEnabled;
            if (layout.soundToggle != null) layout.soundToggle.isOn = HysjDataService.Current.soundEnabled;
        }

        private void SubmitRealName()
        {
            var realName = layout.realNameInput == null ? string.Empty : layout.realNameInput.text;
            var idNumber = layout.idNumberInput == null ? string.Empty : layout.idNumberInput.text;
            if (string.IsNullOrEmpty(realName) || string.IsNullOrEmpty(idNumber)) { ShowTips("请输入真实姓名和身份证号。"); return; }
            if (idNumber.Length != 18) { ShowTips("身份证号格式不正确。"); return; }
            StartCoroutine(SubmitRealNameToServer(realName, idNumber));
        }

        private IEnumerator SubmitRealNameToServer(string realName, string idNumber)
        {
            var transportOk = false;
            ServerEnvelope response = null;
            yield return StartCoroutine(server.RealName(realName, idNumber, (ok, result) =>
            {
                transportOk = ok;
                response = result;
            }));
            if (!transportOk || response == null) yield break;
            if (response.code != 0)
            {
                ShowTips(response.msg ?? string.Empty);
                yield break;
            }

            HysjDataService.Current.realNameVerified = true;
            HysjDataService.Current.realNameVerifiedByServer = true;
            PlayerPrefs.SetString(HysjDataService.RealNameKey, "true");
            HysjDataService.Save();
            ShowTips("实名认证成功，正在跳转。");
            yield return new WaitForSecondsRealtime(1f);
            ShowMain();
        }

        private void RefreshHud()
        {
            if (layout.goldLabel != null) layout.goldLabel.text = HysjDataService.Current.currentGold.ToString();
            if (layout.shopGoldLabel != null) layout.shopGoldLabel.text = HysjDataService.Current.currentGold.ToString();
            if (layout.staminaLabel != null)
            {
                layout.staminaLabel.text = HysjDataService.Current.currentStamina + "/" + HysjDataService.Current.maxStamina;
            }
            if (layout.staminaRecoveryLabel != null)
            {
                var full = HysjDataService.Current.currentStamina >= HysjDataService.Current.maxStamina;
                var remaining = HysjDataService.TimeUntilNextStamina();
                layout.staminaRecoveryLabel.text = full ? "体力已满" : "下次体力恢复:" + remaining.Minutes.ToString("00") + ":" + remaining.Seconds.ToString("00");
                layout.staminaRecoveryLabel.gameObject.SetActive(_staminaRecoveryVisible);
            }
            HysjFormalUiSkin.RefreshMainBuildingProgress(layout.mainScreen);
            RefreshWishTownBuildingButton();
        }

        private void EnsureWishTownBuildingButton()
        {
            if (!HysjSceneRouter.IsMainScene || layout == null || layout.mainScreen == null || _wishTownBuildingButton != null) return;

            var authoredBuildings = layout.mainScreen.transform.Find("FormalTownBuildings");
            if (authoredBuildings != null)
            {
                for (var i = 0; i < 5; i++)
                {
                    var building = authoredBuildings.Find("TownBuilding_" + (char)('A' + i));
                    var button = building == null ? null : building.GetComponent<Button>();
                    if (button == null) continue;
                    var buildingIndex = i;
                    button.onClick.RemoveAllListeners();
                    button.onClick.AddListener(() => OpenWishTownBuildingUpgradeConfirm(buildingIndex));
                    button.interactable = true;
                    var hitImage = building.GetComponent<Image>();
                    if (hitImage != null) hitImage.raycastTarget = false;
                    var colorImage = building.Find("Color")?.GetComponent<Image>();
                    if (colorImage != null)
                    {
                        colorImage.raycastTarget = true;
                        button.targetGraphic = colorImage;
                    }
                }
            }

            // Keep the old text action as a compatibility fallback for scenes
            // serialized before the authored five-building layer was added.
            var node = new GameObject("WishTownBuildingButton", typeof(RectTransform), typeof(Image), typeof(Button));
            node.transform.SetParent(layout.mainScreen.transform, false);
            var rect = node.GetComponent<RectTransform>(); rect.anchorMin = new Vector2(.5f, .5f); rect.anchorMax = new Vector2(.5f, .5f); rect.pivot = new Vector2(.5f, .5f); rect.anchoredPosition = new Vector2(205f, -405f); rect.sizeDelta = new Vector2(210f, 68f);
            var image = node.GetComponent<Image>(); image.color = new Color32(125, 203, 181, 255);
            _wishTownBuildingButton = node.GetComponent<Button>(); _wishTownBuildingButton.targetGraphic = image; _wishTownBuildingButton.onClick.AddListener(OpenWishTownBuildingMap);
            var labelNode = new GameObject("Label", typeof(RectTransform), typeof(Text)); labelNode.transform.SetParent(node.transform, false);
            var labelRect = labelNode.GetComponent<RectTransform>(); labelRect.anchorMin = Vector2.zero; labelRect.anchorMax = Vector2.one; labelRect.offsetMin = Vector2.zero; labelRect.offsetMax = Vector2.zero;
            _wishTownBuildingLabel = labelNode.GetComponent<Text>(); _wishTownBuildingLabel.font = Font.CreateDynamicFontFromOSFont(new[] { "Microsoft YaHei", "Arial" }, 22); _wishTownBuildingLabel.fontSize = 22; _wishTownBuildingLabel.alignment = TextAnchor.MiddleCenter; _wishTownBuildingLabel.color = Color.white; _wishTownBuildingLabel.resizeTextForBestFit = true;
            if (authoredBuildings != null) node.SetActive(false);
        }

        private void OpenWishTownBuildingUpgradeConfirm(int index)
        {
            var buildings = WishTownConfigService.GetBuildings();
            if (buildings == null || index < 0 || index >= buildings.Length || buildings[index] == null)
            {
                ShowTips("建筑配置不存在。");
                return;
            }

            var config = buildings[index];
            var progress = HysjDataService.GetWishTownBuildingProgress(index);
            if (progress >= 100)
            {
                ShowTips(config.name + "已经完成修复。");
                return;
            }
            if (!IsWishTownBuildingAvailable(index))
            {
                ShowTips("请先完成前置建筑修复。");
                return;
            }

            var materialCount = HysjDataService.GetWishTownMaterialCount();
            var totalMaterialCost = Mathf.Max(1, config.total_material_cost);
            var totalMaterialNeeded = Mathf.Max(0, Mathf.CeilToInt(
                totalMaterialCost * (100 - Mathf.Clamp(progress, 0, 100)) / 100f));
            var message = config.name
                + "\n\n进度：" + progress + "%" + "。"
                + "\n建筑材料：" + materialCount + "/" + totalMaterialNeeded + "。";
            ShowShopConfirm(message, () => ConfirmWishTownBuildingUpgrade(index), "升级", "关闭", true);
        }

        private void ConfirmWishTownBuildingUpgrade(int index)
        {
            string message;
            var changed = HysjDataService.TryCompleteWishTownBuilding(index, out message);
            ShowTips(message);
            if (!changed) return;

            RefreshHud();
            if (HysjDataService.GetWishTownBuildingProgress(index) >= 100)
                ShowTips("建筑修复完成，新的小镇节点已解锁。");
        }

        private void RefreshWishTownBuildingButton()
        {
            if (_wishTownBuildingButton == null || _wishTownBuildingLabel == null) return;
            var buildings = WishTownConfigService.GetBuildings();
            if (buildings == null || buildings.Length == 0)
            {
                _wishTownBuildingLabel.text = "小镇修缮配置缺失";
                _wishTownBuildingButton.interactable = false;
                return;
            }
            var target = -1;
            for (var i = 0; i < buildings.Length; i++)
                if (buildings[i] != null && HysjDataService.GetWishTownBuildingProgress(i) < 100 && IsWishTownBuildingAvailable(i)) { target = i; break; }
            if (target < 0) { _wishTownBuildingLabel.text = "小镇已全彩唤醒"; _wishTownBuildingButton.interactable = false; return; }
            var progress = HysjDataService.GetWishTownBuildingProgress(target);
            var percent = Mathf.Clamp(progress, 0, 100);
            _wishTownBuildingLabel.text = "小镇修缮 " + buildings[target].name + " " + percent + "%";
            _wishTownBuildingButton.interactable = true;
        }

        private void OpenWishTownBuildingMap()
        {
            if (ShouldShowWishTownRepairPanels())
            {
                OpenWishTownBuildingMapLegacy();
                return;
            }
            Set(_wishTownBuildingPanel, false);
            Set(_wishTownRepairPanel, false);
        }

        private void OpenWishTownBuildingMapLegacy()
        {
            if (_wishTownBuildingPanel == null)
                _wishTownBuildingPanel = CreateWishTownRuntimePanel("WishTownBuildingPanel", new Vector2(620, 900), new Vector2(0, 0));
            Set(_wishTownRepairPanel, false);
            ClearRuntimeChildren(_wishTownBuildingPanel.transform);
            CreateWishTownRuntimeText(_wishTownBuildingPanel.transform, "Title", "小镇修缮", 34, new Vector2(500, 60), new Vector2(0, 390));
            var close = CreateWishTownRuntimeButton(_wishTownBuildingPanel.transform, "Close", "关闭", new Vector2(140, 54), new Vector2(215, 390), new Color32(231, 115, 163, 255));
            close.onClick.AddListener(() => Set(_wishTownBuildingPanel, false));
            var buildings = WishTownConfigService.GetBuildings();
            for (var i = 0; i < buildings.Length; i++)
            {
                if (buildings[i] == null) continue;
                var progress = HysjDataService.GetWishTownBuildingProgress(i);
                var complete = progress >= 100;
                var available = IsWishTownBuildingAvailable(i);
                var label = buildings[i].name + "  " + progress + "%" + (complete ? "  已完成" : available ? "  可修缮" : "  等待前置建筑");
                var row = CreateWishTownRuntimeButton(_wishTownBuildingPanel.transform, "Building_" + i, label, new Vector2(500, 64), new Vector2(0, 300 - i * 82), complete ? new Color32(125, 203, 181, 255) : available ? new Color32(242, 153, 181, 255) : new Color32(170, 170, 170, 255));
                row.interactable = complete || available;
                var index = i;
                row.onClick.AddListener(() => OpenWishTownRepair(index));
            }
            Set(_wishTownBuildingPanel, true);
        }

        private void OpenWishTownRepair(int index)
        {
            if (ShouldShowWishTownRepairPanels())
            {
                OpenWishTownRepairLegacy(index);
                return;
            }
            Set(_wishTownBuildingPanel, false);
            Set(_wishTownRepairPanel, false);
        }

        private void OpenWishTownRepairLegacy(int index)
        {
            var buildings = WishTownConfigService.GetBuildings();
            if (buildings == null || index < 0 || index >= buildings.Length || buildings[index] == null) return;
            if (!IsWishTownBuildingAvailable(index) && HysjDataService.GetWishTownBuildingProgress(index) < 100)
            {
                ShowTips("请先完成前置建筑修复。");
                return;
            }
            _selectedWishTownBuilding = index;
            if (_wishTownRepairPanel == null)
                _wishTownRepairPanel = CreateWishTownRuntimePanel("WishTownRepairPanel", new Vector2(620, 520), new Vector2(0, 0));
            Set(_wishTownBuildingPanel, false);
            ClearRuntimeChildren(_wishTownRepairPanel.transform);
            var config = buildings[index];
            var progress = HysjDataService.GetWishTownBuildingProgress(index);
            var complete = progress >= 100;
            CreateWishTownRuntimeText(_wishTownRepairPanel.transform, "Title", "建筑修缮：" + config.name, 32, new Vector2(520, 58), new Vector2(0, 185));
            CreateWishTownRuntimeText(_wishTownRepairPanel.transform, "Progress", "上色进度 " + progress + "%\n每次消耗 " + config.material_cost_per_injection + " 建材，增加 " + config.progress_per_injection + "%", 24, new Vector2(520, 100), new Vector2(0, 90));
            CreateWishTownRuntimeText(_wishTownRepairPanel.transform, "Material", "持有星愿建材 " + HysjDataService.GetWishTownMaterialCount() + "\n总成本 " + config.total_material_cost, 22, new Vector2(520, 80), new Vector2(0, 5));
            var inject = CreateWishTownRuntimeButton(_wishTownRepairPanel.transform, "Inject", "注入建材", new Vector2(210, 62), new Vector2(-115, -100), new Color32(242, 153, 181, 255));
            inject.interactable = !complete && HysjDataService.GetWishTownMaterialCount() >= config.material_cost_per_injection;
            inject.onClick.AddListener(() => InjectSelectedWishTownBuilding(false));
            var injectAll = CreateWishTownRuntimeButton(_wishTownRepairPanel.transform, "InjectAll", "一键注入", new Vector2(210, 62), new Vector2(115, -100), new Color32(125, 203, 181, 255));
            injectAll.interactable = !complete && HysjDataService.GetWishTownMaterialCount() > 0;
            injectAll.onClick.AddListener(() => InjectSelectedWishTownBuilding(true));
            var close = CreateWishTownRuntimeButton(_wishTownRepairPanel.transform, "Close", complete ? "返回建筑列表" : "关闭", new Vector2(220, 52), new Vector2(0, -185), new Color32(231, 115, 163, 255));
            close.onClick.AddListener(OpenWishTownBuildingMap);
            Set(_wishTownRepairPanel, true);
        }

        private static bool ShouldShowWishTownRepairPanels()
        {
            return false;
        }

        private void InjectSelectedWishTownBuilding(bool injectAll)
        {
            if (_selectedWishTownBuilding < 0) return;
            string message;
            bool changed;
            if (injectAll)
                changed = HysjDataService.TryInjectWishTownBuildingMax(_selectedWishTownBuilding, out message);
            else
                changed = HysjDataService.TryInjectWishTownBuilding(_selectedWishTownBuilding, out message);
            ShowTips(message);
            if (changed)
            {
                RefreshHud();
                if (HysjDataService.GetWishTownBuildingProgress(_selectedWishTownBuilding) >= 100)
                    ShowTips("建筑修复完成，新的小镇节点已解锁。");
                OpenWishTownRepair(_selectedWishTownBuilding);
            }
        }

        private bool IsWishTownBuildingAvailable(int index)
        {
            var buildings = WishTownConfigService.GetBuildings();
            if (buildings == null || index < 0 || index >= buildings.Length || buildings[index] == null) return false;
            var prerequisite = buildings[index].prerequisite_building_id;
            if (string.IsNullOrWhiteSpace(prerequisite)) return true;
            for (var i = 0; i < buildings.Length; i++)
                if (buildings[i] != null && buildings[i].building_id == prerequisite)
                    return HysjDataService.GetWishTownBuildingProgress(i) >= 100;
            return false;
        }

        private GameObject CreateWishTownRuntimePanel(string name, Vector2 size, Vector2 position)
        {
            var panel = new GameObject(name, typeof(RectTransform), typeof(Image));
            panel.transform.SetParent(layout.mainScreen.transform, false);
            var rect = panel.GetComponent<RectTransform>(); rect.sizeDelta = size; rect.anchoredPosition = position;
            panel.GetComponent<Image>().color = new Color32(255, 255, 255, 248);
            return panel;
        }

        private static Text CreateWishTownRuntimeText(Transform parent, string name, string value, int size, Vector2 dimensions, Vector2 position)
        {
            var node = new GameObject(name, typeof(RectTransform), typeof(Text)); node.transform.SetParent(parent, false);
            var rect = node.GetComponent<RectTransform>(); rect.sizeDelta = dimensions; rect.anchoredPosition = position;
            var text = node.GetComponent<Text>(); text.text = value; text.font = Font.CreateDynamicFontFromOSFont(new[] { "Microsoft YaHei", "Arial" }, size); text.fontSize = size; text.alignment = TextAnchor.MiddleCenter; text.color = new Color32(87, 61, 92, 255); text.resizeTextForBestFit = true; return text;
        }

        private static Button CreateWishTownRuntimeButton(Transform parent, string name, string label, Vector2 dimensions, Vector2 position, Color color)
        {
            var node = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button)); node.transform.SetParent(parent, false);
            var rect = node.GetComponent<RectTransform>(); rect.sizeDelta = dimensions; rect.anchoredPosition = position;
            var image = node.GetComponent<Image>(); image.color = color;
            var button = node.GetComponent<Button>(); button.targetGraphic = image;
            var text = CreateWishTownRuntimeText(node.transform, "Label", label, 22, dimensions - new Vector2(12, 8), Vector2.zero); text.color = Color.white;
            return button;
        }

        private static void ClearRuntimeChildren(Transform parent)
        {
            for (var i = parent.childCount - 1; i >= 0; i--) Destroy(parent.GetChild(i).gameObject);
        }

        private void RefreshVisibleData()
        {
            RefreshHud();
            if (layout == null) return;
            if (layout.onlinePanel != null && layout.onlinePanel.activeInHierarchy)
                RefreshOnlineRewardCountdowns();
            if (layout.achievementsPanel != null && layout.achievementsPanel.activeInHierarchy)
                OpenAchievements();
        }

        private void ToggleStaminaRecovery()
        {
            if (layout.staminaRecoveryLabel == null) return;
            _staminaRecoveryVisible = !_staminaRecoveryVisible;
            RefreshHud();
        }

        private int AchievementProgress(string type)
        {
            if (type == "1") return Mathf.Max(0, HysjDataService.Current.unlockedLevel - 1);
            if (type == "2") return HysjDataService.Current.totalOnlineMinutes;
            if (type == "3") return HysjDataService.Current.totalGoldEarned;
            if (type == "4") return HysjDataService.Current.totalConsumedStamina;
            return 0;
        }

        private void ShowOnly(GameObject panel)
        {
            Set(_wishTownBuildingPanel, false); Set(_wishTownRepairPanel, false);
            Set(_levelSelectPanel, false);
            Set(layout.splashScreen, false);
            Set(layout.loginScreen, false);
            Set(layout.mainScreen, true);
            Set(layout.rankPanel, false); Set(layout.shopPanel, false); Set(layout.rechargePanel, false);
            Set(layout.achievementsPanel, false); Set(layout.skillsPanel, false); Set(layout.weeklyPanel, false); Set(layout.onlinePanel, false);
            Set(layout.settingsPanel, false); Set(layout.storyPanel, false); Set(layout.accountPanel, false); Set(layout.privacyPanel, false);
            Set(layout.realNamePanel, false);
            Set(layout.ageTipsPanel, false);
            Set(layout.tipsWnd, false); Set(layout.shopConfirmPanel, false); Set(layout.rechargeConfirmPanel, false);
            Set(panel, true);
        }

        private void CloseTransientPanels()
        {
            Set(_wishTownBuildingPanel, false); Set(_wishTownRepairPanel, false);
            Set(_levelSelectPanel, false);
            layout.SetAllPanelsInactive();
            Set(layout.mainScreen, true);
        }

        private void ShowTips(string message)
        {
            HysjMessageUi.ShowTip(message);
        }

        private void CheckMainAntiAddiction()
        {
            StartCoroutine(server.Breathe((transportOk, response) =>
            {
                if (!transportOk || response == null) return;
                if (IsBreatheUserMissing(response))
                {
                    HandleBreatheUserMissing();
                    return;
                }
                if (IsAntiAddictionBlocked(response))
                {
                    _mainAntiAddictionPolling = false;
                    ShowNotice(AntiAddictionMessage(response), ReturnToLoginAfterAntiAddiction);
                    return;
                }
                ShowMinorTimeWarningIfNeeded(response);
            }));
        }

        private static bool IsAntiAddictionBlocked(ServerEnvelope response)
        {
            return response != null && response.dataIsTruthy && response.code == -1 && !IsBreatheUserMissing(response);
        }

        private static bool IsBreatheUserMissing(ServerEnvelope response)
        {
            if (response == null || response.code != -1) return false;
            var message = response.msg ?? string.Empty;
            return message.IndexOf("无该用户", StringComparison.OrdinalIgnoreCase) >= 0 ||
                   message.IndexOf("用户不存在", StringComparison.OrdinalIgnoreCase) >= 0 ||
                   message.IndexOf("没有用户", StringComparison.OrdinalIgnoreCase) >= 0 ||
                   message.IndexOf("user not found", StringComparison.OrdinalIgnoreCase) >= 0;
        }

        private void HandleBreatheUserMissing()
        {
            Debug.LogWarning("Breathe 未找到当前登录用户，返回登录界面重新认证。服务器消息: " + (HysjDataService.Current.username ?? string.Empty));
            _mainAntiAddictionPolling = false;
            HysjDataService.ClearCredentialsForMainAntiAddiction();
            ShowLogin();
        }

        private static string AntiAddictionMessage(ServerEnvelope response)
        {
            return !string.IsNullOrEmpty(response == null ? null : response.msg) ? response.msg : "未成年用户禁止进入游戏。";
        }

        private void ReturnToLoginAfterAntiAddiction()
        {
            _mainAntiAddictionPolling = false;
            // Match the source main-scene callback: remove credentials so the
            // next launch cannot auto-login, but keep the server-backed
            // real-name status instead of forcing a second real-name prompt.
            HysjDataService.ClearCredentialsForMainAntiAddiction();
            ShowLogin();
        }

        private void HandleLoginAntiAddictionBlocked()
        {
            HysjDataService.ClearCredentialsForAntiAddiction();
            ShowLogin();
        }

        private void ShowMinorTimeWarningIfNeeded(ServerEnvelope response)
        {
            if (_hasShownMinorTimeWarning || response == null || !response.hasNumericData ||
                PlayerPrefs.GetString(HysjDataService.AgeStatusKey, string.Empty) == "1") return;
            try
            {
                var serverTime = DateTimeOffset.FromUnixTimeSeconds(response.numericData).LocalDateTime;
                if (serverTime.Hour != 20 || serverTime.Minute < 45 || serverTime.Minute > 46) return;
                ShowNotice("您目前为未成年人账号，已被纳入防沉迷系统。根据《国家新闻出版署关于进一步严格管理 切实防止未成年人沉迷网络游戏的通知》，每周五、周六、周日和法定节假日每日20时至21时向未成年人提供1小时网络游戏服务。\n您当日剩余时长不足15分钟。");
                _hasShownMinorTimeWarning = true;
            }
            catch (ArgumentOutOfRangeException)
            {
                // The Cocos implementation also only logs invalid timestamps.
            }
        }

        private static void ResizeMessageBandToText(Text label, string backgroundName, float minWidth, float maxWidth, float horizontalPadding, float singleLineHeight, float maxHeight)
        {
            if (label == null || label.transform == null) return;
            var labelRect = label.rectTransform;
            if (labelRect == null) return;

            var parent = label.transform.parent;
            var background = parent == null ? null : parent.Find(backgroundName);
            var backgroundRect = background == null ? null : background as RectTransform;
            if (backgroundRect == null) return;

            var backgroundImage = background.GetComponent<Image>();
            if (backgroundImage != null)
            {
                backgroundImage.type = Image.Type.Sliced;
            }

            label.horizontalOverflow = HorizontalWrapMode.Overflow;
            label.verticalOverflow = VerticalWrapMode.Overflow;
            labelRect.sizeDelta = new Vector2(maxWidth - horizontalPadding, singleLineHeight);
            Canvas.ForceUpdateCanvases();

            var preferredWidth = Mathf.Max(1f, label.preferredWidth);
            var desiredWidth = Mathf.Clamp(preferredWidth + horizontalPadding, minWidth, maxWidth);

            if (preferredWidth + horizontalPadding <= maxWidth)
            {
                labelRect.sizeDelta = new Vector2(desiredWidth - horizontalPadding, singleLineHeight - 8f);
                backgroundRect.sizeDelta = new Vector2(desiredWidth, singleLineHeight);
                return;
            }

            label.horizontalOverflow = HorizontalWrapMode.Wrap;
            labelRect.sizeDelta = new Vector2(maxWidth - horizontalPadding, 200f);
            Canvas.ForceUpdateCanvases();
            var height = Mathf.Clamp(label.preferredHeight + 12f, singleLineHeight, maxHeight);
            labelRect.sizeDelta = new Vector2(maxWidth - horizontalPadding, height - 12f);
            backgroundRect.sizeDelta = new Vector2(maxWidth, height);
        }

        private void ShowShopConfirm(string message, Action confirmed, string confirmLabel = "确定",
            string cancelLabel = "取消", bool expandedMessage = false)
        {
            _shopConfirmAction = confirmed;
            SetConfirmButtonLabel(layout.shopConfirmButton, confirmLabel);
            SetConfirmButtonLabel(layout.shopCancelButton, cancelLabel);
            if (layout.shopConfirmLabel != null)
            {
                layout.shopConfirmLabel.text = message;
                var rect = layout.shopConfirmLabel.rectTransform;
                rect.sizeDelta = expandedMessage ? new Vector2(440, 170) : new Vector2(360, 32.76f);
                rect.anchoredPosition = expandedMessage ? new Vector2(0, 52) : new Vector2(0, 64.088f);
                layout.shopConfirmLabel.horizontalOverflow = expandedMessage
                    ? HorizontalWrapMode.Wrap
                    : HorizontalWrapMode.Overflow;
                layout.shopConfirmLabel.verticalOverflow = VerticalWrapMode.Overflow;
                layout.shopConfirmLabel.lineSpacing = expandedMessage ? 1.08f : 1f;
            }
            if (layout.shopConfirmPanel != null) layout.shopConfirmPanel.transform.SetAsLastSibling();
            Set(layout.shopConfirmPanel, true);
        }

        private void ConfirmShopAction()
        {
            Set(layout.shopConfirmPanel, false);
            var action = _shopConfirmAction; _shopConfirmAction = null; action?.Invoke();
        }

        private void CancelShopAction() { _shopConfirmAction = null; Set(layout.shopConfirmPanel, false); }

        private void ShowRechargeConfirm(string message, Action confirmed)
        {
            _rechargeConfirmAction = confirmed;
            Set(layout.rechargeConfirmPanel, true);
            if (layout.rechargeConfirmLabel != null)
            {
                layout.rechargeConfirmLabel.text = message;
                ResizeMessageBandToText(layout.rechargeConfirmLabel, "MessageBand", 430f, 660f, 40f, 93f, 132f);
            }
        }

        private void ConfirmRechargeAction()
        {
            Set(layout.rechargeConfirmPanel, false);
            var action = _rechargeConfirmAction; _rechargeConfirmAction = null; action?.Invoke();
        }

        private void CancelRechargeAction() { _rechargeConfirmAction = null; Set(layout.rechargeConfirmPanel, false); }

        private void ShowNotice(string message, Action closed = null)
        {
            HysjMessageUi.ShowNotice(message, closed);
        }

        private void ResetAccountAndShowLogin()
        {
            if (_switchingAccount) return;
            StopStoryRoutine();
            StartCoroutine(SyncCurrentAccountAndShowLogin());
        }

        private IEnumerator SyncCurrentAccountAndShowLogin()
        {
            _switchingAccount = true;
            var uploadSucceeded = true;
            if (HysjDataService.HasAccount && server != null)
                yield return StartCoroutine(server.UploadUserData((ok, _) => uploadSucceeded = ok));

            HysjDataService.ResetAccountForLogin();
            _staminaRecoveryVisible = false;
            _switchingAccount = false;
            if (!uploadSucceeded) ShowTips("云端同步失败，本地账号数据已保留。");
            ShowLogin();
        }

        private static void Bind(Button button, UnityEngine.Events.UnityAction action)
        {
            if (button == null) return;
            button.onClick.RemoveAllListeners();
            if (action != null) button.onClick.AddListener(action);
        }

        private static void Set(GameObject target, bool value) { if (target != null) target.SetActive(value); }

        private static void EnsureMobileUiInput()
        {
            // Some Android emulators expose neither a mouse nor a usable touch
            // device to StandaloneInputModule until the module is forced active.
            Input.simulateMouseWithTouches = true;
            var eventSystem = EventSystem.current ?? FindObjectOfType<EventSystem>();
            if (eventSystem == null)
            {
                var eventSystemObject = new GameObject("EventSystem");
                eventSystem = eventSystemObject.AddComponent<EventSystem>();
            }

            var inputModule = eventSystem.GetComponent<StandaloneInputModule>();
            if (inputModule == null) inputModule = eventSystem.gameObject.AddComponent<StandaloneInputModule>();
            inputModule.forceModuleActive = true;
            eventSystem.enabled = true;
        }

        private static void LockPortraitOrientation()
        {
            // Keep Android input coordinates aligned with the 720x1280 UI.
            Screen.autorotateToPortrait = true;
            Screen.autorotateToPortraitUpsideDown = false;
            Screen.autorotateToLandscapeLeft = false;
            Screen.autorotateToLandscapeRight = false;
            Screen.orientation = ScreenOrientation.Portrait;
        }

        private void NormalizeScrollViewLayout()
        {
            var scrollViews = GetComponentsInChildren<ScrollRect>(true);
            foreach (var scroll in scrollViews)
            {
                var rect = scroll == null ? null : scroll.GetComponent<RectTransform>();
                if (rect == null) continue;

                // LevelSelectPanel is authored directly in the prefab. Its
                // viewport, anchors and scroll height must remain exactly as
                // edited there; only its runtime entries are regenerated.
                if (rect.parent != null && rect.parent.name == "LevelSelectPanel")
                    continue;

                // Older generated prefabs placed several list viewports near
                // the top of the full-screen popup. Repair both their anchors
                // and vertical offsets so current serialized scenes also work.
                rect.anchorMin = new Vector2(.5f, .5f);
                rect.anchorMax = new Vector2(.5f, .5f);
                rect.pivot = new Vector2(.5f, .5f);
                rect.anchoredPosition = ListViewportPosition(rect.parent == null ? string.Empty : rect.parent.name);

                if (rect.parent != null && rect.parent.name == "RankPanel" && scroll.content != null)
                {
                    var image = scroll.GetComponent<Image>();
                    if (image != null)
                    {
                        // The viewport is only a mask for the native 469x54
                        // row backgrounds. Do not stretch the old one-piece
                        // list frame across the entire scrolling height.
                        image.sprite = null;
                        image.color = Color.clear;
                        image.raycastTarget = false;
                    }

                    var mask = scroll.GetComponent<Mask>();
                    if (mask != null) mask.showMaskGraphic = true;

                    var vertical = scroll.content.GetComponent<VerticalLayoutGroup>();
                    if (vertical != null)
                    {
                        vertical.spacing = 0;
                        vertical.padding = new RectOffset(0, 0, 0, 0);
                        vertical.childAlignment = TextAnchor.UpperCenter;
                    }
                }
            }
        }

        private void NormalizeFullScreenBackgrounds()
        {
            // Screen() creates these roots with stretch anchors. Reapply that
            // setup for old serialized prefabs so the main-scene backdrop also
            // covers the complete current Canvas rect behind every popup.
            NormalizeFullScreenRect(layout == null ? null : layout.mainScreen);
            NormalizeFullScreenRect(layout == null ? null : layout.loginScreen);
            NormalizeFullScreenRect(layout == null ? null : layout.splashScreen);
        }

        private static void NormalizeFullScreenRect(GameObject target)
        {
            if (target == null) return;
            var rect = target.GetComponent<RectTransform>();
            if (rect == null) return;
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            rect.pivot = new Vector2(.5f, .5f);
        }

        private static Vector2 ListViewportPosition(string panelName)
        {
            if (panelName == "RankPanel") return new Vector2(0, -64.24f);
            // Start.fire ShopPanel/scrollView: top pivot Y=232.344, height=620.
            // Unity uses a centered pivot, so 232.344 - 620 / 2 = -77.656.
            if (panelName == "ShopPanel") return new Vector2(0, -77.656f);
            if (panelName == "AchievementsPanel") return new Vector2(0, -36.811f);
            if (panelName == "SkillsPanel") return new Vector2(0, 82.335f);
            if (panelName == "WeeklyPanel" || panelName == "OnlinePanel") return new Vector2(0, -32);
            if (panelName == "RechargePanel") return new Vector2(0, -63.5f);
            return Vector2.zero;
        }

        private void NormalizeRankPanel()
        {
            if (layout == null || layout.rankPanel == null) return;

            var frame = layout.rankPanel.transform.Find("Frame");
            if (frame != null)
            {
                var titleBand = frame.Find("TitleBand");
                var titleBandImage = titleBand == null ? null : titleBand.GetComponent<Image>();
                if (titleBandImage != null) titleBandImage.enabled = false;

                var title = frame.Find("Title") as RectTransform;
                if (title != null)
                {
                    title.sizeDelta = new Vector2(120, 50.4f);
                    title.anchoredPosition = new Vector2(0, 335.94f);
                }

                var close = frame.Find("Close") as RectTransform;
                if (close != null)
                {
                    close.sizeDelta = new Vector2(81, 84);
                    close.anchoredPosition = new Vector2(259.627f, 413.62f);
                }
            }

            var headerLevel = layout.rankPanel.transform.Find("RankHeader/RankHeaderLevel") as RectTransform;
            if (headerLevel != null) headerLevel.sizeDelta = new Vector2(52, 42.84f);
        }

        private static void Clear(Transform parent)
        {
            if (parent == null) return;
            for (var i = parent.childCount - 1; i >= 0; i--) Destroy(parent.GetChild(i).gameObject);
        }

        private static Vector2 GetScrollOffset(Transform content)
        {
            var scroll = content == null ? null : content.GetComponentInParent<ScrollRect>();
            return scroll == null || scroll.content == null ? Vector2.zero : scroll.content.anchoredPosition;
        }

        private static void RefreshList(Transform content, bool keepScrollOffset = false, Vector2 scrollOffset = default)
        {
            if (content == null) return;
            var contentRect = content as RectTransform;
            if (contentRect != null)
            {
                contentRect.anchorMin = new Vector2(0f, 1f);
                contentRect.anchorMax = new Vector2(1f, 1f);
                contentRect.pivot = new Vector2(.5f, 1f);
                contentRect.anchoredPosition = Vector2.zero;
            }

            Canvas.ForceUpdateCanvases();
            if (contentRect != null) LayoutRebuilder.ForceRebuildLayoutImmediate(contentRect);
            var scroll = content.GetComponentInParent<ScrollRect>();
            if (scroll != null)
            {
                scroll.StopMovement();
                if (keepScrollOffset && scroll.content != null)
                {
                    // WeeklyRewardManager.ts and DailyRewardManager.ts restore
                    // the exact cc.ScrollView offset after a claim refresh.
                    scroll.content.anchoredPosition = scrollOffset;
                }
                else
                {
                    scroll.verticalNormalizedPosition = 1f;
                }
            }
        }

        private static GameObject MakeItem(GameObject template, Transform parent)
        {
            if (template == null || parent == null)
            {
                Debug.LogError("Hysj editor UI list template or content reference is missing.");
                return null;
            }
            var item = Instantiate(template, parent, false);
            var rect = item.transform as RectTransform;
            var itemLayout = item.GetComponent<LayoutElement>();
            if (rect != null && itemLayout == null)
            {
                // Older serialized templates predate LayoutRoot(). Without a
                // LayoutElement, VerticalLayoutGroup reads a preferred height
                // of zero and stacks every cloned row at the same position.
                itemLayout = item.AddComponent<LayoutElement>();
                itemLayout.minWidth = rect.sizeDelta.x;
                itemLayout.preferredWidth = rect.sizeDelta.x;
                itemLayout.minHeight = rect.sizeDelta.y;
                itemLayout.preferredHeight = rect.sizeDelta.y;
                itemLayout.flexibleHeight = 0;
            }
            item.SetActive(true);
            return item;
        }

        private static void SetItem(GameObject item, string title, string detail, string action)
        {
            if (item == null) return;
            var texts = item.GetComponentsInChildren<Text>(true);
            foreach (var text in texts)
            {
                if (text.name == "Title") text.text = title;
                else if (text.name == "Detail") text.text = detail;
                else if (text.name == "ActionLabel") text.text = action;
            }
        }

        private static void SetRewardAmount(GameObject item, int reward)
        {
            if (item == null) return;
            var amount = item.transform.Find("RewardAmount");
            if (amount != null)
            {
                var label = amount.GetComponent<Text>();
                if (label != null) label.text = reward.ToString();
            }
        }

        private static void SetPanelText(GameObject panel, string childPath, string value)
        {
            if (panel == null) return;
            var text = panel.transform.Find(childPath)?.GetComponent<Text>();
            if (text != null) text.text = value ?? string.Empty;
        }

        private static Button ItemButton(GameObject item) => item == null ? null : item.GetComponentInChildren<Button>(true);

        private static void ConfigureRewardItem(GameObject item, string title, int reward, bool isOnlineReward, string claimText)
        {
            if (item == null) return;
            var titleLabel = item.transform.Find("dayLabel")?.GetComponent<Text>();
            if (titleLabel != null)
            {
                titleLabel.text = title ?? string.Empty;
                titleLabel.color = new Color32(198, 135, 19, 255);
                titleLabel.fontSize = 26;
                titleLabel.fontStyle = FontStyle.Bold;
                titleLabel.alignment = TextAnchor.MiddleCenter;
                titleLabel.horizontalOverflow = HorizontalWrapMode.Overflow;
                titleLabel.verticalOverflow = VerticalWrapMode.Overflow;
                titleLabel.rectTransform.sizeDelta = new Vector2(130, 42);
                titleLabel.rectTransform.anchoredPosition = new Vector2(0, 66);
            }
            var rewardLabel = item.transform.Find("rewardBg/rewardLabel")?.GetComponent<Text>();
            if (rewardLabel != null)
            {
                rewardLabel.text = reward.ToString();
                ConfigureDiamondAmountText(rewardLabel, 30);
                rewardLabel.rectTransform.sizeDelta = new Vector2(100, 38);
                rewardLabel.rectTransform.anchoredPosition = new Vector2(0, -28);
            }
            var rewardBg = item.transform.Find("rewardBg") as RectTransform;
            if (rewardBg != null)
            {
                rewardBg.sizeDelta = new Vector2(160, 90);
                rewardBg.anchoredPosition = new Vector2(0, 14);
            }
            var coin = item.transform.Find("rewardBg/coin")?.GetComponent<Image>();
            if (coin != null)
            {
                var coinSprite = Resources.Load<Sprite>("HysjLegacy/NewImage2/zuanshi");
                if (coinSprite != null) coin.sprite = coinSprite;
                coin.preserveAspect = true;
                coin.rectTransform.sizeDelta = new Vector2(55, 52);
                coin.rectTransform.anchoredPosition = new Vector2(0, 12);
                coin.rectTransform.localScale = Vector3.one;
            }
            var countdownLabel = item.transform.Find("claimButton/claimText")?.GetComponent<Text>();
            if (countdownLabel != null)
            {
                var countdown = isOnlineReward ? claimText ?? string.Empty : string.Empty;
                countdownLabel.text = countdown;
                countdownLabel.gameObject.SetActive(isOnlineReward && !string.IsNullOrEmpty(countdown));
                countdownLabel.color = Color.white;
                countdownLabel.fontSize = 18;
                countdownLabel.alignment = TextAnchor.MiddleCenter;
                countdownLabel.horizontalOverflow = HorizontalWrapMode.Overflow;
                countdownLabel.verticalOverflow = VerticalWrapMode.Overflow;
                countdownLabel.rectTransform.sizeDelta = new Vector2(160, 36);
                countdownLabel.rectTransform.anchoredPosition = Vector2.zero;
            }
        }

        private static void SetRewardButtonSprite(Button button, string action)
        {
            if (button == null) return;
            var path = action == "已领取" ? "HysjLegacy/NewImage3/anniuyilingqu" : action == "未开启" || action == "已错过" || action.Contains("分钟后") ? "HysjLegacy/NewImage3/anniukong" : "HysjLegacy/NewImage3/anniulingqu";
            var sprite = Resources.Load<Sprite>(path);
            var image = button.GetComponent<Image>();
            if (sprite != null && image != null) { image.sprite = sprite; image.color = Color.white; }
        }

        private static void ConfigureOnlineRewardButton(GameObject item, bool claimed, bool available)
        {
            var button = ItemButton(item);
            if (button == null) return;
            var image = button.GetComponent<Image>();
            var spriteName = claimed ? "anniuyilingqu" : available ? "anniulingqu" : "anniukong";
            var sprite = Resources.Load<Sprite>("HysjLegacy/NewImage3/" + spriteName);
            if (image != null && sprite != null)
            {
                image.sprite = sprite;
                image.color = Color.white;
            }
            button.interactable = !claimed && available;
        }

        private static void ConfigureAchievementItem(GameObject item, string description, int current, int target, bool completed, bool claimed)
        {
            if (item == null) return;
            var achievementButtonSize = new Vector2(176, 72);
            var achievementButtonPosition = new Vector2(125, -30);
            // These were introduced by the initial Unity-only template. The
            // Cocos AchieveItem prefab has no assigned frame, icon, or name-band
            // sprite at these positions, so they must not be rendered here.
            Set(item.transform.Find("SkillFrame")?.gameObject, false);
            Set(item.transform.Find("SkillIcon")?.gameObject, false);
            Set(item.transform.Find("NameBand")?.gameObject, false);
            var title = item.transform.Find("Title")?.GetComponent<Text>();
            if (title != null)
            {
                title.fontSize = 26;
                title.alignment = TextAnchor.MiddleCenter;
                title.color = new Color32(145, 76, 60, 255);
                title.horizontalOverflow = HorizontalWrapMode.Overflow;
                title.verticalOverflow = VerticalWrapMode.Overflow;
                title.rectTransform.sizeDelta = new Vector2(205, 38);
                title.rectTransform.anchoredPosition = new Vector2(-80, 43);
            }

            var detail = item.transform.Find("Detail")?.GetComponent<Text>();
            if (detail != null)
            {
                detail.supportRichText = true;
                detail.fontSize = 20;
                detail.color = new Color32(145, 76, 60, 255);
                detail.alignment = TextAnchor.MiddleLeft;
                detail.horizontalOverflow = HorizontalWrapMode.Wrap;
                detail.verticalOverflow = VerticalWrapMode.Overflow;
                detail.lineSpacing = 1.1f;
                detail.rectTransform.sizeDelta = new Vector2(205, 58);
                detail.rectTransform.anchoredPosition = new Vector2(-80, 2);
                // Keep progress on its own line so the counter cannot be
                // split away from the description by the narrow card width.
                detail.text = (description ?? string.Empty) + "\n(" + current + "/" + target + ")。";
            }

            var rewardAmount = item.transform.Find("RewardAmount")?.GetComponent<Text>();
            if (rewardAmount != null)
            {
                ConfigureDiamondAmountText(rewardAmount, 36);
                rewardAmount.rectTransform.sizeDelta = new Vector2(84.09f, 41.8f);
                rewardAmount.rectTransform.anchoredPosition = new Vector2(135, 43);
            }

            var rewardIcon = item.transform.Find("icon")?.GetComponent<Image>();
            if (rewardIcon != null)
            {
                var diamondSprite = Resources.Load<Sprite>("HysjLegacy/NewImage2/zuanshi");
                if (diamondSprite != null) rewardIcon.sprite = diamondSprite;
                rewardIcon.preserveAspect = true;
                rewardIcon.rectTransform.sizeDelta = new Vector2(55, 52);
                rewardIcon.rectTransform.anchoredPosition = new Vector2(75, 43);
            }

            var claimButton = ItemButton(item);
            var claimedNode = item.transform.Find("claimed") ?? item.transform.Find("Claimed");
            if (claimButton != null)
            {
                var claimRect = claimButton.GetComponent<RectTransform>();
                if (claimRect != null)
                {
                    claimRect.sizeDelta = achievementButtonSize;
                    claimRect.anchoredPosition = achievementButtonPosition;
                }
                var colors = claimButton.colors;
                colors.normalColor = new Color32(230, 230, 230, 255);
                colors.highlightedColor = Color.white;
                colors.pressedColor = new Color32(200, 200, 200, 255);
                colors.disabledColor = new Color32(128, 128, 128, 255);
                colors.colorMultiplier = 1f;
                colors.fadeDuration = .1f;
                claimButton.colors = colors;
                claimButton.transition = Selectable.Transition.None;
                var actionLabel = claimButton.GetComponentInChildren<Text>(true);
                if (actionLabel != null) actionLabel.gameObject.SetActive(false);
                var image = claimButton.targetGraphic as Image ?? claimButton.GetComponent<Image>();
                var claimSprite = Resources.Load<Sprite>("HysjLegacy/NewImage3/anniulingqu");
                if (image != null)
                {
                    image.rectTransform.sizeDelta = achievementButtonSize;
                    if (claimSprite != null) image.sprite = claimSprite;
                }
                claimButton.gameObject.SetActive(!claimed || claimedNode == null);
                if (claimed && claimedNode == null)
                {
                    var claimedSprite = Resources.Load<Sprite>("HysjLegacy/NewImage3/anniuyilingqu");
                    if (image != null && claimedSprite != null) image.sprite = claimedSprite;
                }
                else if (image != null)
                {
                    image.color = completed ? Color.white : new Color32(128, 128, 128, 255);
                }
            }
            if (claimedNode != null)
            {
                var claimedRect = claimedNode.GetComponent<RectTransform>();
                if (claimedRect != null)
                {
                    claimedRect.sizeDelta = achievementButtonSize;
                    claimedRect.anchoredPosition = achievementButtonPosition;
                }
                var claimedImage = claimedNode.GetComponent<Image>();
                var claimedSprite = Resources.Load<Sprite>("HysjLegacy/NewImage3/anniuyilingqu");
                if (claimedImage != null)
                {
                    claimedImage.rectTransform.sizeDelta = achievementButtonSize;
                    if (claimedSprite != null) claimedImage.sprite = claimedSprite;
                }
                claimedNode.gameObject.SetActive(claimed);
            }
        }

        private static void ConfigureWeeklyRewardButton(GameObject item, bool claimed, bool available)
        {
            var button = ItemButton(item);
            if (button == null) return;

            var spritePath = "HysjLegacy/NewImage3/" + (claimed ? "anniuyilingqu" : "anniulingqu");
            var sprite = Resources.Load<Sprite>(spritePath);
            var image = button.GetComponent<Image>();
            if (image != null)
            {
                if (sprite != null) image.sprite = sprite;
                image.color = claimed || available ? Color.white : new Color32(120, 120, 120, 255);
            }
            button.interactable = !claimed && available;
            var label = button.GetComponentInChildren<Text>(true);
            if (label != null) label.gameObject.SetActive(false);
        }

        private static void ConfigureLevelItem(GameObject item, int level, int stars, bool locked)
        {
            if (item == null) return;
            // LevelSelectPanel visuals are authored in HysjMain.prefab. Do
            // not replace their sprites or RectTransforms here; this method
            // only applies the data-dependent lock state.
            var overlay = item.transform.Find("LockedOverlay");
            if (overlay != null)
            {
                var overlayImage = overlay.GetComponent<Image>();
                if (overlayImage != null)
                {
                    overlayImage.enabled = true;
                }
                var darkMask = overlay.Find("heidi");
                if (darkMask != null) darkMask.gameObject.SetActive(false);
                var lockIcon = overlay.Find("suo");
                if (lockIcon != null) lockIcon.gameObject.SetActive(locked);
                overlay.gameObject.SetActive(locked);
            }
            for (var i = 1; i <= 3; i++)
            {
                var star = FindImage(item.transform, "Star" + i);
                if (star != null) star.gameObject.SetActive(i <= Mathf.Clamp(stars, 0, 3));
            }
        }

        private static void ConfigureShopItem(GameObject item, int roleNumber, bool stamina, string action)
        {
            if (item == null) return;
            var detail = item.transform.Find("Detail");
            if (detail != null) detail.gameObject.SetActive(false);
            var defaultBadge = item.transform.Find("DefaultBadge");
            if (defaultBadge != null) defaultBadge.gameObject.SetActive(false);
            var icon = FindImage(item.transform, "ShopIcon");
            var roleSprites = new[] { "juesegougou", "juesehuli", "jueselaohu", "juesemaomao", "juesetutu" };
            var iconSprite = Resources.Load<Sprite>(stamina
                ? "HysjLegacy/NewImage2/tili"
                : "HysjLegacy/NewImage3/" + roleSprites[Mathf.Clamp(roleNumber - 1, 0, roleSprites.Length - 1)]);
            if (icon != null && iconSprite != null)
            {
                icon.sprite = iconSprite;
                icon.color = Color.white;
                icon.preserveAspect = true;
                // The five authored role sprites intentionally have different
                // native heights. Keep those source dimensions instead of
                // stretching them into the old 102x179 placeholder.
                icon.rectTransform.sizeDelta = stamina
                    ? new Vector2(80, 100)
                    : iconSprite.rect.size;
                var iconPosition = icon.rectTransform.anchoredPosition;
                iconPosition.y -= 15f;
                icon.rectTransform.anchoredPosition = iconPosition;
            }
            var button = ItemButton(item);
            if (button == null) return;
            var buttonRect = button.GetComponent<RectTransform>();
            if (buttonRect != null)
            {
                buttonRect.sizeDelta = new Vector2(206, 72);
                // Lift the action strip so it overlaps the lower edge of the
                // 188x167 authored character card by a few pixels.
                buttonRect.anchoredPosition = new Vector2(0, -77);
            }
            var image = button.GetComponent<Image>();
            var usingRole = action == "使用中";
            var usableRole = action == "使用";
            var spritePath = usingRole ? "HysjLegacy/NewImage3/anniushiyongzhong" : usableRole ? "HysjLegacy/NewImage3/annniushiyong" : "HysjLegacy/NewImage3/anniukong";
            var buttonSprite = Resources.Load<Sprite>(spritePath);
            if (image != null && buttonSprite != null) image.sprite = buttonSprite;
            var priceIcon = button.transform.Find("PriceIcon");
            if (priceIcon != null)
            {
                var priceImage = priceIcon.GetComponent<Image>();
                var diamondSprite = Resources.Load<Sprite>("HysjLegacy/NewImage2/zuanshi");
                if (priceImage != null && diamondSprite != null) priceImage.sprite = diamondSprite;
                priceIcon.gameObject.SetActive(!usingRole && !usableRole);
            }
            var label = button.GetComponentInChildren<Text>(true);
            if (label != null)
            {
                label.gameObject.SetActive(!usingRole && !usableRole);
                label.text = action.Replace(" 钻石", string.Empty);
                ConfigureShopPriceText(label);
                label.rectTransform.sizeDelta = new Vector2(84.09f, 41.8f);
                label.rectTransform.anchoredPosition = new Vector2(22.415f, 3.847f);
            }

            var title = item.transform.Find("Title")?.GetComponent<Text>();
            if (title != null)
            {
                // The dikuangshangdian ribbon is centered lower than the old
                // placeholder title. Match the authored ribbon instead of
                // leaving role names floating above the character art.
                title.rectTransform.anchoredPosition = new Vector2(0, 97);
            }
        }

        private static void ConfigureSkillItem(GameObject item, int skillNumber, bool maxLevel)
        {
            if (item == null) return;
            var icon = FindImage(item.transform, "SkillIcon");
            var sprite = Resources.Load<Sprite>("HysjLegacy/NewImage2/zuanshi");
            if (icon != null && sprite != null) icon.sprite = sprite;
            var priceIcon = item.transform.Find("Action/PriceIcon");
            if (priceIcon != null) priceIcon.gameObject.SetActive(!maxLevel);
        }

        private static Image FindImage(Transform parent, string childName)
        {
            var child = parent == null ? null : parent.Find(childName);
            return child == null ? null : child.GetComponent<Image>();
        }

        private static void SetToggleSprite(Toggle toggle, bool isOn)
        {
            if (toggle == null) return;
            var image = toggle.GetComponent<Image>();
            if (image == null) return;
            var resource = isOn ? "HysjLegacy/NewImage2/kai" : "HysjLegacy/NewImage2/guan";
            var sprite = Resources.Load<Sprite>(resource);
            if (sprite != null)
            {
                image.sprite = sprite;
                image.color = Color.white;
                image.preserveAspect = true;
                image.rectTransform.sizeDelta = isOn ? new Vector2(113, 49) : new Vector2(112, 48);
            }
        }
    }
}
