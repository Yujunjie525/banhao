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
        private const int Image2UiVersion = 8;
        // Main gameplay role/1..5 corresponds to the shop portraits 2,1,3,4,5.
        private static readonly int[] ShopRoleImageNumbers = { 2, 1, 3, 4, 5 };
        public HysjEditorLayout layout;
        public HysjServerClient server;
        public float splashSeconds = 5f;

        private Action _shopConfirmAction;
        private Action _rechargeConfirmAction;
        private Coroutine _storyRoutine;
        private bool _staminaRecoveryVisible;
        private float _hudTimer;
        private int _activeGameplayLevel;
        private float _antiAddictionTimer;
        private bool _mainAntiAddictionPolling;
        private bool _hasShownMinorTimeWarning;
        private bool _isLoadScene;
        private bool _switchingAccount;

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
                // Screen Space Overlay canvases must be scene roots. Keeping
                // one under the HysjLoad Transform makes Android raycasts use
                // the parent's zero-sized rect instead of the screen rect.
                if (canvas.renderMode == RenderMode.ScreenSpaceOverlay && canvas.transform.parent != null &&
                    canvas.transform.parent.GetComponent<RectTransform>() == null)
                    canvas.transform.SetParent(null, true);

                if (canvas.transform.localScale.sqrMagnitude < 0.001f)
                    canvas.transform.localScale = Vector3.one;

                var canvasRect = canvas.GetComponent<RectTransform>();
                if (canvasRect != null)
                {
                    // Keep rendering and GraphicRaycaster coordinates in the
                    // same full-screen rect on Android aspect ratios.
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

            if (layout.formalImageVersion < Image2UiVersion)
            {
                NormalizeScrollViewLayout();
                NormalizeFullScreenBackgrounds();
                NormalizeRankPanel();
                NormalizeRechargeLayout();
                NormalizeRewardCardTemplates();
                NormalizeShopGoldBalance();
                NormalizeStaminaLabel();
            }
            NormalizeFeaturePanelTitles();
            NormalizeMainHudTypography();
            NormalizeShopConfirmPanel();
            NormalizeRechargeConfirmPanel();

            HysjDataService.Changed += RefreshVisibleData;
            HysjGameplayBridge.ResultRecorded += OnGameplayResult;
            BindButtons();
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
            HysjGameplayBridge.ResultRecorded -= OnGameplayResult;
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
            rewardBg.GetComponent<RectTransform>().sizeDelta = new Vector2(190, 63);
            rewardBg.GetComponent<RectTransform>().anchoredPosition = new Vector2(0, isOnlineReward ? 16 : 15);
            rewardBg.GetComponent<Image>().color = Color.clear;
            var coin = CreateRewardImage(rewardBg.transform, "coin", "zuanshi", new Vector2(55, 52),
                new Vector2(isOnlineReward ? -41.616f : -39.99f, isOnlineReward ? -21.97f : -23.885f));
            coin.rectTransform.localScale = new Vector3(1, 1, .65f);
            var amount = CreateRewardText(rewardBg.transform, "rewardLabel", "3000", 30,
                new Vector2(isOnlineReward ? 70.74f : 79.64f, isOnlineReward ? 41.8f : 59.44f),
                new Vector2(isOnlineReward ? 24 : 28, isOnlineReward ? -18 : -20));
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
            grid.cellSize = new Vector2(160, 210);
            grid.spacing = new Vector2(3, 1);
            grid.padding = new RectOffset(8, 8, 0, 8);
            grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
            grid.constraintCount = 3;
            grid.childAlignment = TextAnchor.UpperCenter;
        }

        private void NormalizeShopGoldBalance()
        {
            if (layout.shopPanel == null) return;
            var frame = layout.shopPanel.transform.Find("Frame");
            if (frame == null) return;

            var icon = frame.Find("jinbi");
            if (icon == null)
            {
                CreateRewardImage(frame, "jinbi", "zuanshi", new Vector2(55, 52), new Vector2(-35.836f, 266.179f));
            }

            var labelTransform = frame.Find("zs_num");
            if (labelTransform == null)
            {
                var label = CreateRewardText(frame, "zs_num", string.Empty, 30, new Vector2(160, 45.36f), new Vector2(-.019f, 269.451f));
                label.rectTransform.pivot = new Vector2(0, .5f);
                label.alignment = TextAnchor.MiddleLeft;
                label.color = new Color32(119, 47, 0, 255);
                layout.shopGoldLabel = label;
                return;
            }

            layout.shopGoldLabel = labelTransform.GetComponent<Text>();
        }

        private void NormalizeShopConfirmPanel()
        {
            if (layout == null || layout.shopConfirmPanel == null) return;

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
            NormalizeConfirmButton(layout.shopCancelButton, "取消");
            NormalizeConfirmButton(layout.shopConfirmButton, "确定");

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
            NormalizeConfirmButton(layout.rechargeCancelButton, "取消");
            NormalizeConfirmButton(layout.rechargeConfirmButton, "确定");
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

        private static void NormalizeConfirmButton(Button button, string labelText)
        {
            if (button == null) return;
            var rect = button.transform as RectTransform;
            if (rect != null)
            {
                rect.sizeDelta = new Vector2(201, 81);
                rect.anchoredPosition = new Vector2(labelText == "取消" ? -108 : 108, -124);
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
                viewport.sizeDelta = new Vector2(480, 594);
                viewport.anchoredPosition = new Vector2(0, -52.5f);
            }

            var grid = layout.rechargeContent.GetComponent<GridLayoutGroup>();
            if (grid != null)
            {
                grid.cellSize = new Vector2(192, 198);
                grid.spacing = new Vector2(41, 0);
                grid.padding = new RectOffset(26, 26, 0, 8);
                grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
                grid.constraintCount = 2;
                grid.childAlignment = TextAnchor.UpperCenter;
            }

            var frame = layout.rechargePanel == null ? null : layout.rechargePanel.transform.Find("Frame");
            if (frame == null) return;
            var titleBand = frame.Find("TitleBand") as RectTransform;
            var title = frame.Find("Title") as RectTransform;
            if (titleBand != null) titleBand.anchoredPosition = new Vector2(.5f, 312);
            if (title != null) title.anchoredPosition = new Vector2(.5f, 312);
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
                layout.levelSelectPanel,
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
            image.sprite = Resources.Load<Sprite>("HysjLegacy/image2/" + resourceName);
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
            image.sprite = Resources.Load<Sprite>("HysjLegacy/image2/anniulingqu");
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
            Bind(layout.ageTipsButton, ShowAgeTips);
            Bind(layout.ageTipsCloseButton, HideAgeTips);
            Bind(layout.staminaToggleButton, ToggleStaminaRecovery);
            // The green button is the Garden Repair side mode. The blue button
            // opens the level manager for the main seed-and-defense mode.
            Bind(layout.startButton, () => StartGameplay(1, true));
            Bind(layout.infiniteButton, OpenLevelSelect);
            Bind(layout.levelSelectButton, OpenLevelSelect);
            Bind(layout.rankButton, OpenRank);
            Bind(layout.shopButton, () => OpenShop());
            Bind(layout.rechargeButton, OpenRecharge);
            Bind(layout.achievementsButton, () => OpenAchievements());
            Bind(layout.weeklyButton, () => OpenWeekly());
            Bind(layout.onlineButton, () => OpenOnlineRewards());
            Bind(layout.settingsButton, OpenSettings);
            Bind(layout.storyButton, () => ShowStory());
            Bind(layout.storySkipButton, SkipStory);
            Bind(layout.realNameSubmitButton, SubmitRealName);
            Bind(layout.realNameCancelButton, ShowLogin);
            Bind(layout.openRealNameButton, ShowRealName);
            Bind(layout.settingsSyncDownloadButton, () => StartCoroutine(server.FetchUserData((ok, message) => { ShowTips(message); if (ok) ShowMain(); })));
            Bind(layout.settingsSyncUploadButton, () => StartCoroutine(server.UploadUserData((_, message) => ShowTips(message))));
            Bind(layout.settingsLogoutButton, ResetAccountAndShowLogin);
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
            Set(layout.storySkipButton == null ? null : layout.storySkipButton.gameObject, false);
            _storyRoutine = StartCoroutine(PlayStory());
        }

        private IEnumerator PlayStory()
        {
            const string story = "在四季缓缓流转的小镇边缘，园丁阿澄接手了一座久未打理的花园。播下种子、照看花朵，也赶走偷吃果实的小家伙；当荒地干涸时，沿着旧水渠引来清水，让每一片土地重新开花。每次播种、守护与收获，都会成为花园里独一份的记忆。现在，拿起园艺工具，和阿澄一起写下属于自己的《花园手记》。";
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

        private void OpenLevelSelect()
        {
            ShowOnly(layout.levelSelectPanel);
            Clear(layout.levelContent);
            for (var i = 1; i <= 100; i++)
            {
                var level = i;
                var item = MakeItem(layout.levelItemTemplate, layout.levelContent);
                var stars = HysjDataService.Current.levelStars[i - 1];
                var locked = level > HysjDataService.Current.unlockedLevel;
                SetItem(item, "第" + level + "关", string.Empty, string.Empty);
                ConfigureLevelItem(item, level, stars, locked);
                var button = ItemButton(item);
                button.interactable = true;
                Bind(button, () =>
                {
                    if (level > HysjDataService.Current.unlockedLevel) { ShowTips("关卡未解锁。"); return; }
                    HysjDataService.Current.currentLevel = level;
                    HysjDataService.Save();
                    StartGameplay(level, false);
                });
            }
            RefreshList(layout.levelContent);
            ScrollLevelListToUnlocked();
        }

        private void ScrollLevelListToUnlocked()
        {
            if (layout == null || layout.levelContent == null) return;

            var scroll = layout.levelContent.GetComponentInParent<ScrollRect>();
            var content = layout.levelContent as RectTransform;
            if (scroll == null || content == null || scroll.viewport == null || content.childCount == 0) return;

            Canvas.ForceUpdateCanvases();
            LayoutRebuilder.ForceRebuildLayoutImmediate(content);

            var unlockedLevel = Mathf.Clamp(HysjDataService.Current.unlockedLevel, 1, content.childCount);
            var targetItem = content.GetChild(unlockedLevel - 1) as RectTransform;
            if (targetItem == null) return;

            // Match LevelSelectManager._scrollToUnlockedLevel: center the
            // unlocked card in the viewport and clamp at the list ends.
            var maxOffsetY = Mathf.Max(0f, content.rect.height - scroll.viewport.rect.height);
            var targetOffsetY = Mathf.Clamp(
                -targetItem.anchoredPosition.y - scroll.viewport.rect.height * 0.5f,
                0f,
                maxOffsetY);
            scroll.StopMovement();
            content.anchoredPosition = new Vector2(content.anchoredPosition.x, targetOffsetY);
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
            var scrollOffset = GetScrollOffset(layout.rankContent);
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
                RefreshList(layout.rankContent, true, scrollOffset);
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

            RefreshList(layout.rankContent, true, scrollOffset);
            SetRankSelfInfo(selfRow.rank, selfRow.name, selfRow.level);
        }

        private static int LocalRankLevel()
        {
            var data = HysjDataService.Current;
            // This is only the fallback when RankList has no row for the
            // current account. Keep it aligned with the local unlocked level;
            // server rows use totalLoginNum + 1 above.
            return Mathf.Clamp(data.unlockedLevel, 1, 100);
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

            var background = item.transform.Find("RowBackground")?.GetComponent<Image>();
            if (background != null)
            {
                var spriteName = rank % 2 == 0 ? "dikuangzi" : "dikuanghong";
                var sprite = Resources.Load<Sprite>("HysjLegacy/image2/" + spriteName);
                if (sprite != null) background.sprite = sprite;
            }
            var rankColor = Color.white;
            ConfigureRankText(rankLabel, rank.ToString(), new Vector2(-178, 0), new Vector2(70, 40), 26, false, rankColor);
            ConfigureRankText(nameLabel, playerName, Vector2.zero, new Vector2(150, 40), 26, true, rankColor);
            ConfigureRankText(levelLabel, level.ToString(), new Vector2(178, 0), new Vector2(70, 40), 26, false, rankColor);
        }

        private void SetRankSelfInfo(int rank, string playerName, int level)
        {
            SetPanelText(layout.rankPanel, "RankSelf/RankSelfRank", rank > 0 ? rank.ToString() : "-");
            var nameLabel = layout.rankPanel == null ? null : layout.rankPanel.transform.Find("RankSelf/RankSelfName")?.GetComponent<Text>();
            if (nameLabel != null)
                ConfigureRankText(nameLabel, playerName, Vector2.zero, new Vector2(150, 40), 26, true, nameLabel.color);
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
            var rect = label.rectTransform;
            rect.anchoredPosition = position;
            rect.sizeDelta = size;
        }

        private void OpenShop(bool keepScrollOffset = false, Vector2 scrollOffset = default)
        {
            ShowOnly(layout.shopPanel);
            RefreshHud();
            Clear(layout.shopContent);
            var names = new[] { "浅陌清颜", "夏盏茶烟", "青锋辞月", "星垂云鬓", "云汐月裳" };
            var prices = new[] { 0, 800, 500, 1200, 1000 };
            var effects = new[] { "无技能：标准体验", "植物生长期缩短20%", "空地老鼠停留+0.5秒", "抓鼠钻石收益+20%", "每10秒抵消1次受击" };
            for (var i = 0; i < names.Length; i++)
            {
                var role = i;
                var item = MakeItem(layout.shopItemTemplate, layout.shopContent);
                var unlocked = HysjDataService.Current.unlockedRoles[role];
                var selected = HysjDataService.Current.currentRole == role;
                var actionText = selected ? "使用中" : unlocked ? "使用" : prices[role] + " 钻石";
                SetItem(item, names[role], effects[role], actionText);
                ConfigureShopItem(item, role + 1, false, actionText);
                var button = ItemButton(item);
                // ShopManager.ts keeps the selected role's red 使用中 button
                // visible and touchable; the handler itself is a no-op.
                button.interactable = true;
                Bind(button, () => SelectRole(role, names[role], prices[role]));
            }
            var stamina = MakeItem(layout.shopItemTemplate, layout.shopContent);
            SetItem(stamina, "10 点体力", "体力上限 " + HysjDataService.Current.maxStamina, "100 钻石");
            ConfigureShopItem(stamina, 0, true, "100 钻石");
            Bind(ItemButton(stamina), () =>
            {
                var currentOffset = GetScrollOffset(layout.shopContent);
                if (HysjDataService.Current.currentStamina >= HysjDataService.Current.maxStamina) { ShowTips("体力已满，无需购买。"); return; }
                if (HysjDataService.Current.currentGold < 100) { ShowTips("钻石不足，无法购买体力。"); return; }
                ShowShopConfirm("确定要花费100钻石购买10点体力吗？", () =>
                {
                    if (HysjDataService.Current.currentStamina >= HysjDataService.Current.maxStamina) { ShowTips("体力已满，无需购买。"); return; }
                    if (!HysjDataService.SpendGold(100)) { ShowTips("钻石不足，无法购买体力。"); return; }
                    HysjDataService.Current.currentStamina = Mathf.Min(HysjDataService.Current.maxStamina, HysjDataService.Current.currentStamina + 10);
                    HysjDataService.Save(); OpenShop(true, currentOffset); ShowTips("购买成功！获得10点体力。");
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
                if (HysjDataService.Current.currentGold < price) { ShowTips("钻石不足，无法解锁主角。"); return; }
                ShowShopConfirm("确定要花费" + price + "钻石解锁主角吗？", () =>
                {
                    if (!HysjDataService.SpendGold(price)) { ShowTips("钻石不足，无法解锁主角。"); return; }
                    HysjDataService.Current.unlockedRoles[role] = true;
                    HysjDataService.Current.currentRole = role;
                    HysjDataService.Save(); OpenShop(true, scrollOffset); ShowTips("主角解锁成功！");
                });
                return;
            }
            HysjDataService.Current.currentRole = role;
            HysjDataService.Save();
            OpenShop(true, scrollOffset);
            ShowTips("主角切换成功！");
        }

        private void OpenRecharge()
        {
            ShowOnly(layout.rechargePanel);
            Clear(layout.rechargeContent);
            var prices = new[] { 6, 30, 68, 198, 328, 648 };
            var diamonds = new[] { 60, 300, 680, 1980, 3280, 6480 };
            for (var i = 0; i < prices.Length; i++)
            {
                var index = i;
                var item = MakeItem(layout.rechargeItemTemplate, layout.rechargeContent);
                SetItem(item, diamonds[index].ToString(), "", string.Empty);
                var priceButton = ItemButton(item);
                var priceImage = priceButton == null ? null : priceButton.GetComponent<Image>();
                if (priceImage != null)
                {
                    var priceSprite = Resources.Load<Sprite>("HysjLegacy/image2/￥" + prices[index]);
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
            var description = config.type == "1" ? "通关关卡达到" + config.target + "关" : config.desc;
            return (description ?? string.Empty).Trim().TrimEnd('。').Trim();
        }

        private static bool AchievementDescriptionWraps(Text detail, string description)
        {
            if (detail == null || string.IsNullOrEmpty(description)) return false;
            var settings = detail.GetGenerationSettings(detail.rectTransform.sizeDelta);
            settings.horizontalOverflow = HorizontalWrapMode.Wrap;
            settings.verticalOverflow = VerticalWrapMode.Overflow;
            var generator = new TextGenerator();
            return generator.Populate(description, settings) && generator.lineCount > 1;
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
                var names = new[] { "初入", "花间", "静候", "漫步", "蝶舞", "午后", "花园", "四季", "知己" };
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
                if (claimText != null) claimText.text = countdown;
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

        private void StartGameplay(int level, bool infinite)
        {
            // Garden Repair validates a new random map before charging stamina.
            // Re-entering from the main menu always abandons the previous run.
            if (infinite)
            {
                // A completed repair run has already shown its settlement. Entering
                // again from the main menu must start a new random run instead of
                // restoring the old success popup.
                HysjDataService.AbandonGardenRepairRun();
                if (!HysjDataService.CanEnterGardenRepair()) { ShowTips("体力不足，无法开始荒园修复。"); return; }
            }
            else if (!HysjDataService.ConsumeStamina()) { ShowTips("体力不足，无法开始游戏。"); return; }
            _activeGameplayLevel = level;
            HysjGameplayBridge.Launch(level, infinite);
        }

        private void RefreshHud()
        {
            if (layout.goldLabel != null) layout.goldLabel.text = HysjDataService.Current.currentGold.ToString();
            if (layout.shopGoldLabel != null) layout.shopGoldLabel.text = HysjDataService.Current.currentGold.ToString();
            if (layout.achievementGoldLabel != null) layout.achievementGoldLabel.text = HysjDataService.Current.currentGold.ToString();
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
            if (layout.progressLabel != null)
            {
                // The main HUD reports progression availability, not the last
                // level the player happened to enter.
                var progressRect = layout.progressLabel.rectTransform;
                progressRect.sizeDelta = new Vector2(300f, 52f);
                layout.progressLabel.horizontalOverflow = HorizontalWrapMode.Overflow;
                layout.progressLabel.verticalOverflow = VerticalWrapMode.Overflow;
                layout.progressLabel.resizeTextForBestFit = false;
                layout.progressLabel.alignment = TextAnchor.MiddleCenter;
                layout.progressLabel.text = "当前关卡：" + Mathf.Clamp(HysjDataService.Current.unlockedLevel, 1, 100);
            }
        }

        private void RefreshVisibleData()
        {
            RefreshHud();
            if (layout == null) return;
            if (layout.onlinePanel != null && layout.onlinePanel.activeInHierarchy)
                RefreshOnlineRewardCountdowns();
            if (layout.achievementsPanel != null && layout.achievementsPanel.activeInHierarchy)
            {
                var scrollOffset = GetScrollOffset(layout.achievementContent);
                OpenAchievements(true, scrollOffset);
            }
        }

        private void ToggleStaminaRecovery()
        {
            if (layout.staminaRecoveryLabel == null) return;
            _staminaRecoveryVisible = !_staminaRecoveryVisible;
            RefreshHud();
        }

        private void OnGameplayResult(int level, int stars, int distance, bool passed) => RefreshHud();
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
            Set(layout.splashScreen, false);
            Set(layout.loginScreen, false);
            Set(layout.mainScreen, true);
            Set(layout.levelSelectPanel, false); Set(layout.rankPanel, false); Set(layout.shopPanel, false); Set(layout.rechargePanel, false);
            Set(layout.achievementsPanel, false); Set(layout.weeklyPanel, false); Set(layout.onlinePanel, false);
            Set(layout.settingsPanel, false); Set(layout.storyPanel, false);
            Set(layout.realNamePanel, false); Set(layout.gameplayPanel, false);
            Set(layout.ageTipsPanel, false);
            Set(layout.tipsWnd, false); Set(layout.shopConfirmPanel, false); Set(layout.rechargeConfirmPanel, false);
            Set(panel, true);
        }

        private void CloseTransientPanels()
        {
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

        private void ShowShopConfirm(string message, Action confirmed)
        {
            _shopConfirmAction = confirmed;
            if (layout.shopConfirmLabel != null) layout.shopConfirmLabel.text = message;
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
            // Keep Android's input coordinate orientation aligned with the
            // portrait framebuffer used by the 720x1280 UI.
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

                // Older generated prefabs placed several list viewports near
                // the top of the full-screen popup. Repair both their anchors
                // and vertical offsets so current serialized scenes also work.
                rect.anchorMin = new Vector2(.5f, .5f);
                rect.anchorMax = new Vector2(.5f, .5f);
                rect.pivot = new Vector2(.5f, .5f);
                rect.anchoredPosition = ListViewportPosition(rect.parent == null ? string.Empty : rect.parent.name);
                rect.sizeDelta = ListViewportSize(rect.parent == null ? string.Empty : rect.parent.name);

                if (rect.parent != null && rect.parent.name == "RankPanel" && scroll.content != null)
                {
                    var image = scroll.GetComponent<Image>();
                    if (image != null)
                    {
                        image.color = Color.white;
                    }

                    var mask = scroll.GetComponent<Mask>();
                    if (mask != null) mask.showMaskGraphic = false;

                    var vertical = scroll.content.GetComponent<VerticalLayoutGroup>();
                    if (vertical != null)
                    {
                        vertical.spacing = 4;
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

        private void NormalizeRankPanel()
        {
            if (layout == null || layout.rankPanel == null) return;

            var frame = layout.rankPanel.transform.Find("Frame");
            if (frame != null)
            {
                var titleBand = frame.Find("TitleBand");
                var titleBandImage = titleBand == null ? null : titleBand.GetComponent<Image>();
                if (titleBandImage != null) titleBandImage.enabled = true;

                var title = frame.Find("Title") as RectTransform;
                if (title != null)
                {
                    title.sizeDelta = new Vector2(220, 58);
                    title.anchoredPosition = new Vector2(-.5f, 317);
                }

                var close = frame.Find("Close") as RectTransform;
                if (close != null)
                {
                    close.sizeDelta = new Vector2(84, 87);
                    close.anchoredPosition = new Vector2(253, 372.5f);
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
                titleLabel.fontStyle = FontStyle.Bold;
            }
            var rewardLabel = item.transform.Find("rewardBg/rewardLabel")?.GetComponent<Text>();
            if (rewardLabel != null) rewardLabel.text = reward.ToString();
            var countdownLabel = item.transform.Find("claimButton/claimText")?.GetComponent<Text>();
            if (countdownLabel != null) countdownLabel.text = isOnlineReward ? claimText ?? string.Empty : string.Empty;
        }

        private static void SetRewardButtonSprite(Button button, string action)
        {
            if (button == null) return;
            var path = action == "已领取" ? "HysjLegacy/image2/anniuyilingqu" : action == "未开启" || action == "已错过" || action.Contains("分钟后") ? "HysjLegacy/image2/anniukong" : "HysjLegacy/image2/anniulingqu";
            var sprite = Resources.Load<Sprite>(path);
            var image = button.GetComponent<Image>();
            if (sprite != null && image != null) { image.sprite = sprite; image.color = Color.white; }
        }

        private static void ConfigureOnlineRewardButton(GameObject item, bool claimed, bool available)
        {
            var button = ItemButton(item);
            if (button == null) return;

            var countdownLabel = item.transform.Find("claimButton/claimText")?.GetComponent<Text>();
            if (countdownLabel != null)
            {
                var buttonRect = button.GetComponent<RectTransform>();
                var buttonSize = buttonRect == null ? new Vector2(145, 58) : buttonRect.rect.size;
                countdownLabel.rectTransform.sizeDelta = new Vector2(
                    Mathf.Max(1f, buttonSize.x - 12f), Mathf.Max(1f, buttonSize.y - 12f));
                countdownLabel.rectTransform.anchoredPosition = Vector2.zero;
                countdownLabel.fontSize = 16;
                countdownLabel.resizeTextForBestFit = true;
                countdownLabel.resizeTextMinSize = 12;
                countdownLabel.resizeTextMaxSize = 16;
                countdownLabel.alignment = TextAnchor.MiddleCenter;
                countdownLabel.horizontalOverflow = HorizontalWrapMode.Wrap;
                countdownLabel.verticalOverflow = VerticalWrapMode.Truncate;
            }

            var image = button.GetComponent<Image>();
            var spriteName = claimed ? "anniuyilingqu" : available ? "anniulingqu" : "anniukong";
            var sprite = Resources.Load<Sprite>("HysjLegacy/image2/" + spriteName);
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
            var title = item.transform.Find("Title")?.GetComponent<Text>();
            if (title != null)
            {
                title.fontSize = 26;
                title.fontStyle = FontStyle.Bold;
                title.alignment = TextAnchor.MiddleCenter;
                title.horizontalOverflow = HorizontalWrapMode.Overflow;
                title.verticalOverflow = VerticalWrapMode.Overflow;
                title.color = new Color32(164, 88, 81, 255);
                title.rectTransform.sizeDelta = new Vector2(180, 38);
                title.rectTransform.anchoredPosition = new Vector2(0, 109);
            }

            var detail = item.transform.Find("Detail")?.GetComponent<Text>();
            if (detail != null)
            {
                detail.supportRichText = true;
                detail.fontSize = 20;
                detail.color = new Color32(164, 88, 81, 255);
                detail.alignment = TextAnchor.UpperLeft;
                detail.horizontalOverflow = HorizontalWrapMode.Wrap;
                detail.verticalOverflow = VerticalWrapMode.Overflow;
                detail.lineSpacing = 1.1f;
                detail.rectTransform.sizeDelta = new Vector2(170, 60);
                detail.rectTransform.anchoredPosition = new Vector2(0, 45);
                var progressColor = completed ? "#50a65f" : "#a45851";
                var cleanDescription = (description ?? string.Empty).Trim().TrimEnd('。').Trim();
                var separator = AchievementDescriptionWraps(detail, cleanDescription) ? string.Empty : "\n";
                detail.text = cleanDescription + separator + "<color=" + progressColor + ">("
                    + current + "/" + target + ")</color>。";
            }

            var rewardAmount = item.transform.Find("RewardAmount")?.GetComponent<Text>();
            if (rewardAmount != null)
            {
                rewardAmount.fontSize = 30;
                rewardAmount.rectTransform.sizeDelta = new Vector2(100, 42);
                rewardAmount.rectTransform.anchoredPosition = new Vector2(35, -18);
                var outline = rewardAmount.GetComponent<Outline>() ?? rewardAmount.gameObject.AddComponent<Outline>();
                outline.effectColor = new Color32(187, 41, 70, 255);
                outline.effectDistance = new Vector2(2, -2);
            }

            var claimButton = ItemButton(item);
            var claimedNode = item.transform.Find("claimed") ?? item.transform.Find("Claimed");
            if (claimButton != null)
            {
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
                var claimSprite = Resources.Load<Sprite>("HysjLegacy/image2/anniulingqu");
                if (image != null && claimSprite != null) image.sprite = claimSprite;
                claimButton.gameObject.SetActive(!claimed || claimedNode == null);
                if (claimed && claimedNode == null)
                {
                    var claimedSprite = Resources.Load<Sprite>("HysjLegacy/image2/anniuyilingqu");
                    if (image != null && claimedSprite != null) image.sprite = claimedSprite;
                }
                else if (image != null)
                {
                    image.color = completed ? Color.white : new Color32(128, 128, 128, 255);
                }
            }
            if (claimedNode != null)
            {
                var claimedImage = claimedNode.GetComponent<Image>();
                var claimedSprite = Resources.Load<Sprite>("HysjLegacy/image2/anniuyilingqu");
                if (claimedImage != null && claimedSprite != null) claimedImage.sprite = claimedSprite;
                claimedNode.gameObject.SetActive(claimed);
            }
        }

        private static void ConfigureWeeklyRewardButton(GameObject item, bool claimed, bool available)
        {
            var button = ItemButton(item);
            if (button == null) return;

            var spritePath = "HysjLegacy/image2/" + (claimed ? "anniuyilingqu" : "anniulingqu");
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
            var title = item.transform.Find("Title")?.GetComponent<Text>();
            if (title != null) title.text = "第 " + level + " 关";
            var background = FindImage(item.transform, "LevelBackground");
            var group = Mathf.Clamp(Mathf.CeilToInt(level / 20f), 1, 5);
            var backgroundSprite = Resources.Load<Sprite>("HysjLegacy/image2/guanqiapeitu" + group);
            if (background != null && backgroundSprite != null) background.sprite = backgroundSprite;
            var overlay = item.transform.Find("LockedOverlay");
            if (overlay != null)
            {
                ConfigureLevelLockOverlay(overlay);
                overlay.SetSiblingIndex(background == null ? 0 : background.transform.GetSiblingIndex() + 1);
                overlay.gameObject.SetActive(locked);
            }
            for (var i = 1; i <= 3; i++)
            {
                var star = FindImage(item.transform, "Star" + i);
                var sprite = Resources.Load<Sprite>("HysjLegacy/image2/" + (i <= stars ? "wujiaoxing1" : "wujiaoxing2"));
                if (star != null)
                {
                    star.rectTransform.sizeDelta = new Vector2(51, 50);
                    star.rectTransform.localScale = Vector3.one;
                    star.rectTransform.anchoredPosition = new Vector2((i - 2) * 54f + 3f, -48f);
                    if (sprite != null) star.sprite = sprite;
                    star.gameObject.SetActive(!locked);
                }
            }
        }

        private static void ConfigureLevelLockOverlay(Transform overlay)
        {
            var background = overlay.GetComponent<Image>();
            if (background != null)
            {
                background.color = Color.clear;
                background.raycastTarget = false;
            }

            var mask = EnsureLevelOverlayImage(overlay, "heidi", "heidi", new Vector2(205, 139), Vector2.zero);
            mask.color = new Color32(255, 255, 255, 200);
            mask.raycastTarget = false;
            var lockIcon = EnsureLevelOverlayImage(overlay, "suo", "suo", new Vector2(55, 76), Vector2.zero);
            lockIcon.color = Color.white;
            lockIcon.raycastTarget = false;
        }

        private static Image EnsureLevelOverlayImage(Transform parent, string name, string resourceName, Vector2 size, Vector2 position)
        {
            var child = parent.Find(name);
            if (child == null)
            {
                var node = new GameObject(name, typeof(RectTransform), typeof(Image));
                node.transform.SetParent(parent, false);
                child = node.transform;
            }

            var rect = child.GetComponent<RectTransform>();
            rect.sizeDelta = size;
            rect.anchoredPosition = position;
            var image = child.GetComponent<Image>();
            var sprite = Resources.Load<Sprite>("HysjLegacy/AtlasPicture/" + resourceName);
            if (sprite != null) image.sprite = sprite;
            image.type = Image.Type.Simple;
            image.preserveAspect = false;
            return image;
        }

        private static void ConfigureShopItem(GameObject item, int roleNumber, bool stamina, string action)
        {
            if (item == null) return;
            ConfigureShopRoleName(item.transform.Find("Title")?.GetComponent<Text>());
            var detail = item.transform.Find("Detail");
            if (detail != null) detail.gameObject.SetActive(false);
            var icon = FindImage(item.transform, "ShopIcon");
            var roleIndex = Mathf.Clamp(roleNumber - 1, 0, ShopRoleImageNumbers.Length - 1);
            var iconNumber = ShopRoleImageNumbers[roleIndex];
            var iconSprite = Resources.Load<Sprite>(stamina ? "HysjLegacy/image2/dianchi" : "HysjLegacy/image2/" + iconNumber);
            if (icon != null && iconSprite != null)
            {
                icon.sprite = iconSprite;
                icon.rectTransform.sizeDelta = iconSprite.rect.size;
                var rolePositions = new[]
                {
                    new Vector2(0, 10), new Vector2(0, 0), new Vector2(0, 0),
                    new Vector2(0, 0), new Vector2(0, -5)
                };
                icon.rectTransform.anchoredPosition = stamina ? new Vector2(0, 35) : rolePositions[roleIndex];
            }
            var background = item.transform.Find("ShopBackground")?.GetComponent<Image>();
            if (background != null)
            {
                var cardSprite = Resources.Load<Sprite>("HysjLegacy/image2/" + (stamina ? "dikuangshangdian" : "dikuangshangdian"));
                if (cardSprite != null) background.sprite = cardSprite;
            }
            var button = ItemButton(item);
            if (button == null) return;
            var image = button.GetComponent<Image>();
            var usingRole = action == "使用中";
            var usableRole = action == "使用";
            var spritePath = usingRole ? "HysjLegacy/image2/anniushiyongzhong" : usableRole ? "HysjLegacy/image2/anniushiyong" : "HysjLegacy/image2/anniukong";
            var buttonSprite = Resources.Load<Sprite>(spritePath);
            if (image != null && buttonSprite != null) image.sprite = buttonSprite;
            var priceIcon = button.transform.Find("PriceIcon");
            if (priceIcon != null) priceIcon.gameObject.SetActive(!usingRole && !usableRole);
            var label = button.GetComponentInChildren<Text>(true);
            if (label != null)
            {
                var lockedRole = !usingRole && !usableRole;
                label.gameObject.SetActive(lockedRole);
                label.text = action.Replace(" 钻石", string.Empty);
                label.alignment = TextAnchor.MiddleCenter;
                label.rectTransform.sizeDelta = new Vector2(100, 42);
                label.rectTransform.anchoredPosition = new Vector2(30, 0);
                label.fontSize = lockedRole ? 36 : 30;
                label.fontStyle = lockedRole ? FontStyle.Bold : FontStyle.Normal;
                label.color = Color.white;
                var outline = label.GetComponent<Outline>() ?? label.gameObject.AddComponent<Outline>();
                outline.effectColor = new Color32(187, 41, 70, 255);
                outline.effectDistance = new Vector2(2, -2);
                outline.useGraphicAlpha = false;
            }
        }

        private static void ConfigureShopRoleName(Text title)
        {
            if (title == null) return;
            title.color = new Color32(164, 88, 81, 255);
            title.fontSize = 26;
            title.fontStyle = FontStyle.Bold;
            title.alignByGeometry = true;
            title.alignment = TextAnchor.MiddleCenter;
            title.horizontalOverflow = HorizontalWrapMode.Overflow;
            title.verticalOverflow = VerticalWrapMode.Overflow;
            title.rectTransform.sizeDelta = new Vector2(180, 38);
            title.rectTransform.anchoredPosition = new Vector2(0, 112);
            var outline = title.GetComponent<Outline>();
            if (outline != null) outline.enabled = false;
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
            var resource = isOn ? "HysjLegacy/image2/kognjiankai" : "HysjLegacy/image2/kongjianguan";
            var sprite = Resources.Load<Sprite>(resource);
            if (sprite != null) { image.sprite = sprite; image.color = Color.white; }
        }
    }
}
