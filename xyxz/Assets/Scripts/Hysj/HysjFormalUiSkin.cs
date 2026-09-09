using UnityEngine;
using UnityEngine.UI;

namespace Hysj
{
    /// <summary>
    /// Applies the supplied NewImage art to the existing serialized UI shell.
    /// Gameplay and login controllers keep ownership of state and callbacks;
    /// this class only owns the visual resource bindings.
    /// </summary>
    public static class HysjFormalUiSkin
    {
        private const string Root = "HysjLegacy/NewImage/";
        private const string MainArtRoot = "NewImage2/";
        private const string PopupArtRoot = "NewImage3/";
        private static readonly Color FeaturePopupTitleColor = new Color32(160, 1, 52, 255);
        // The health notice is supplied as a complete 720x1280 composition.
        // Keeping it as one sprite preserves the authored strawberry pattern,
        // panel opacity, font, line breaks and spacing exactly.
        private const string HealthNoticeResource = "\u6548\u679c\u56fe \u5065\u5eb7\u5fe0\u544a";
        private const string LoginCompositionResource = "\u6548\u679c\u56fe\u767b\u5f55\u6ce8\u518c";
        private const string RealNameCompositionResource = "\u6548\u679c\u56fe \u5b9e\u540d\u8ba4\u8bc1";

        public static void ApplyLogin(HysjEditorLayout layout)
        {
            if (layout == null) return;
            ApplySplashHealthNotice(layout.splashScreen);
            SetBackground(layout.loginScreen, "beijingdenglu");
            SetBackground(layout.realNamePanel, "beijingdenglu");
            SetBackground(layout.ageTipsPanel, "beijingdenglu");

            var loginRoot = layout.loginScreen == null ? null : layout.loginScreen.transform;
            SetSprite(loginRoot, "LoginForm", "tanchuang4", new Vector2(586, 478), new Vector2(0, -105));
            SetSprite(layout.realNamePanel == null ? null : layout.realNamePanel.transform, "RealNameForm", "tanchuang3", new Vector2(586, 863), new Vector2(0, -10));
            SetSprite(layout.ageTipsPanel == null ? null : layout.ageTipsPanel.transform, "AgeTipsForm", "tanchuang2", new Vector2(586, 668), new Vector2(0, 0));

            AddImage(loginRoot, "FormalLoginLogo", "logo", new Vector2(300, 304), new Vector2(0, 390), 1);
            ApplyButton(loginRoot, "LoginButton", "anniudegnlu");
            ApplyButton(loginRoot, "RegisterButton", "anniuzhuce");
            ApplyButton(layout.realNamePanel == null ? null : layout.realNamePanel.transform, "RealNameSubmit", "anniuqueren");
            SetSprite(loginRoot, "AgeMarkAnchor", "16+", new Vector2(76, 98), new Vector2(-292, 540));
            SetInputSprite(loginRoot, "Username", "dikuang 1", new Vector2(373, 71));
            SetInputSprite(loginRoot, "Password", "dikuang 1", new Vector2(373, 71));
            SetInputSprite(layout.realNamePanel == null ? null : layout.realNamePanel.transform, "RealNameInput", "dikuang 1", new Vector2(373, 71));
            SetInputSprite(layout.realNamePanel == null ? null : layout.realNamePanel.transform, "IdNumberInput", "dikuang 1", new Vector2(373, 71));

            ApplyPanelText(layout.realNamePanel, "Title", "实名认证");
            ApplyEditableAgeTips(layout.ageTipsPanel);

            ApplyScreenComposition(layout.loginScreen, "FormalLoginComposition", LoginCompositionResource,
                layout.usernameInput == null ? null : layout.usernameInput.gameObject,
                layout.passwordInput == null ? null : layout.passwordInput.gameObject,
                layout.agreementToggle == null ? null : layout.agreementToggle.gameObject,
                layout.loginRemoteToggle == null ? null : layout.loginRemoteToggle.gameObject,
                layout.settingsRemoteToggle == null ? null : layout.settingsRemoteToggle.gameObject,
                layout.loginButton == null ? null : layout.loginButton.gameObject,
                layout.registerButton == null ? null : layout.registerButton.gameObject,
                layout.privacyButton == null ? null : layout.privacyButton.gameObject,
                layout.ageTipsButton == null ? null : layout.ageTipsButton.gameObject);
            ApplyEditableRealNamePanel(layout.realNamePanel, layout.realNameInput,
                layout.idNumberInput, layout.realNameSubmitButton, layout.realNameCancelButton);
            // Keep the transparent interaction layer aligned with the controls
            // shown in the authored 720x1280 compositions.
            SetRect(loginRoot, "Username", new Vector2(373, 71), new Vector2(0, -85));
            SetRect(loginRoot, "Password", new Vector2(373, 71), new Vector2(0, -172));
            SetRect(loginRoot, "LoginButton", new Vector2(205, 70), new Vector2(114, -288));
            SetRect(loginRoot, "RegisterButton", new Vector2(205, 70), new Vector2(-110, -288));
            ApplyEditableLoginInput(loginRoot, layout.usernameInput, "UsernameLabel", "请输入用户名");
            ApplyEditableLoginInput(loginRoot, layout.passwordInput, "PasswordLabel", "请输入密码");
            var realNameRoot = layout.realNamePanel == null ? null : layout.realNamePanel.transform;
            SetRect(realNameRoot, "RealNameInput", new Vector2(373, 71), new Vector2(0, -22));
            SetRect(realNameRoot, "IdNumberInput", new Vector2(373, 71), new Vector2(0, -118));
            SetRect(realNameRoot, "RealNameSubmit", new Vector2(205, 70), new Vector2(0, -226));
        }

        private static void ApplyEditableLoginInput(Transform root, InputField input, string labelName,
            string defaultPlaceholder)
        {
            if (root == null || input == null) return;

            // The authored reference contains example account digits. This
            // inset cover keeps the rounded field edge from the composition
            // while replacing its static center with a real editable field.
            var cover = AddSolidImage(input.transform, "EditableFieldCover",
                new Color32(224, 151, 165, 255), new Vector2(350, 59), Vector2.zero, 0);
            if (cover != null)
                cover.raycastTarget = false;

            var value = input.textComponent;
            if (value != null)
            {
                value.gameObject.SetActive(true);
                value.color = Color.white;
                value.fontSize = 28;
                value.alignment = TextAnchor.MiddleLeft;
                value.horizontalOverflow = HorizontalWrapMode.Overflow;
                value.verticalOverflow = VerticalWrapMode.Overflow;
                value.raycastTarget = false;
                value.rectTransform.sizeDelta = new Vector2(240, 54);
                value.rectTransform.anchoredPosition = new Vector2(50, 0);
            }

            var placeholder = input.placeholder as Text;
            if (placeholder != null)
            {
                placeholder.gameObject.SetActive(true);
                if (string.IsNullOrEmpty(placeholder.text))
                    placeholder.text = defaultPlaceholder;
                placeholder.color = new Color32(255, 255, 255, 215);
                placeholder.fontSize = 28;
                placeholder.fontStyle = FontStyle.Normal;
                placeholder.alignment = TextAnchor.MiddleLeft;
                placeholder.horizontalOverflow = HorizontalWrapMode.Overflow;
                placeholder.verticalOverflow = VerticalWrapMode.Overflow;
                placeholder.raycastTarget = false;
                placeholder.rectTransform.sizeDelta = new Vector2(240, 54);
                placeholder.rectTransform.anchoredPosition = new Vector2(50, 0);
            }

            var label = FindDeep(root, labelName)?.GetComponent<Text>();
            if (label != null)
            {
                label.gameObject.SetActive(true);
                label.color = Color.white;
                label.fontSize = 28;
                label.fontStyle = FontStyle.Normal;
                var labelOutline = label.GetComponent<Outline>();
                if (labelOutline != null)
                    labelOutline.enabled = false;
                label.alignment = TextAnchor.MiddleCenter;
                label.raycastTarget = false;
                var fieldRect = input.transform as RectTransform;
                label.rectTransform.sizeDelta = new Vector2(100, 54);
                label.rectTransform.anchoredPosition = new Vector2(-130,
                    fieldRect == null ? 0 : fieldRect.anchoredPosition.y);
                label.transform.SetSiblingIndex(Mathf.Min(input.transform.GetSiblingIndex() + 1,
                    root.childCount - 1));
            }

            input.targetGraphic = input.GetComponent<Image>();
            input.ForceLabelUpdate();
        }

        private static void ApplyEditableRealNamePanel(GameObject panel, InputField realNameInput,
            InputField idNumberInput, Button submitButton, Button cancelButton)
        {
            if (panel == null) return;

            var root = panel.transform;
            var composition = FindDeep(root, "FormalRealNameComposition");
            if (composition != null)
                composition.gameObject.SetActive(false);

            var panelImage = panel.GetComponent<Image>();
            if (panelImage != null)
            {
                panelImage.sprite = null;
                panelImage.color = Color.clear;
                panelImage.raycastTarget = false;
            }

            var form = FindDeep(root, "RealNameForm");
            if (form != null)
            {
                form.gameObject.SetActive(true);
                var formImage = form.GetComponent<Image>();
                if (formImage != null)
                {
                    formImage.sprite = Load("tanchuang3");
                    formImage.color = Color.white;
                    formImage.preserveAspect = true;
                    formImage.type = Image.Type.Simple;
                    formImage.raycastTarget = false;
                }
                var formRect = form as RectTransform;
                if (formRect != null)
                {
                    formRect.sizeDelta = new Vector2(586, 863);
                    formRect.anchoredPosition = new Vector2(0, -10);
                }
            }

            var title = FindDeep(root, "Title")?.GetComponent<Text>();
            if (title != null)
            {
                title.gameObject.SetActive(true);
                title.text = "实名认证";
                title.color = FeaturePopupTitleColor;
                title.fontSize = 40;
                title.fontStyle = FontStyle.Bold;
                title.alignment = TextAnchor.MiddleCenter;
                title.horizontalOverflow = HorizontalWrapMode.Overflow;
                title.verticalOverflow = VerticalWrapMode.Overflow;
                title.raycastTarget = false;
                var titleRect = title.rectTransform;
                titleRect.sizeDelta = new Vector2(300, 64);
                titleRect.anchoredPosition = new Vector2(0, 317);
                var outline = title.GetComponent<Outline>() ?? title.gameObject.AddComponent<Outline>();
                outline.enabled = true;
                outline.effectColor = Color.white;
                outline.effectDistance = new Vector2(2, -2);
                outline.useGraphicAlpha = true;
            }

            ApplyTintedImage(root, "RegulationText", new Color32(184, 0, 43, 255));
            ApplyTintedImage(root, "PrivacyPromise", new Color32(116, 167, 64, 255));
            ApplyTintedImage(root, "PrivacyText", Color.white);
            ApplyEditableRealNameInput(realNameInput, "请输入真实姓名");
            ApplyEditableRealNameInput(idNumberInput, "请输入身份证号");

            if (submitButton != null)
            {
                submitButton.gameObject.SetActive(true);
                ApplyButton(root, "RealNameSubmit", "anniuqueren");
            }
            if (cancelButton != null)
                cancelButton.gameObject.SetActive(true);
        }

        private static void ApplyEditableRealNameInput(InputField input, string defaultPlaceholder)
        {
            if (input == null) return;

            var cover = AddSolidImage(input.transform, "EditableFieldCover",
                new Color32(224, 151, 165, 255), new Vector2(350, 59), Vector2.zero, 0);
            if (cover != null)
                cover.raycastTarget = false;

            var value = input.textComponent;
            if (value != null)
            {
                value.gameObject.SetActive(true);
                value.color = Color.white;
                value.fontSize = 28;
                value.fontStyle = FontStyle.Normal;
                value.alignment = TextAnchor.MiddleCenter;
                value.horizontalOverflow = HorizontalWrapMode.Overflow;
                value.verticalOverflow = VerticalWrapMode.Overflow;
                value.raycastTarget = false;
                value.rectTransform.sizeDelta = new Vector2(320, 54);
                value.rectTransform.anchoredPosition = Vector2.zero;
            }

            var placeholder = input.placeholder as Text;
            if (placeholder != null)
            {
                placeholder.gameObject.SetActive(true);
                if (string.IsNullOrEmpty(placeholder.text))
                    placeholder.text = defaultPlaceholder;
                placeholder.color = new Color32(255, 255, 255, 220);
                placeholder.fontSize = 28;
                placeholder.fontStyle = FontStyle.Normal;
                placeholder.alignment = TextAnchor.MiddleCenter;
                placeholder.horizontalOverflow = HorizontalWrapMode.Overflow;
                placeholder.verticalOverflow = VerticalWrapMode.Overflow;
                placeholder.raycastTarget = false;
                placeholder.rectTransform.sizeDelta = new Vector2(320, 54);
                placeholder.rectTransform.anchoredPosition = Vector2.zero;
            }

            var image = input.GetComponent<Image>();
            if (image != null)
                input.targetGraphic = image;
            input.ForceLabelUpdate();
        }

        private static void ApplyTintedImage(Transform root, string nodeName, Color color)
        {
            var image = FindDeep(root, nodeName)?.GetComponent<Image>();
            if (image == null) return;
            image.gameObject.SetActive(true);
            image.color = color;
            image.preserveAspect = true;
            image.raycastTarget = false;
        }

        private static void ApplyEditableAgeTips(GameObject panel)
        {
            if (panel == null) return;

            var root = panel.transform;
            var composition = root.Find("FormalAgeTipsComposition");
            if (composition != null)
                composition.gameObject.SetActive(false);
            var mask = root.Find("AgeTipsMask");
            if (mask != null)
            {
                mask.gameObject.SetActive(true);
                var maskImage = mask.GetComponent<Image>();
                if (maskImage != null)
                {
                    maskImage.color = new Color(0f, 0f, 0f, 0.49f);
                    maskImage.raycastTarget = true;
                }
            }

            var form = FindDeep(root, "AgeTipsForm");
            if (form != null)
            {
                form.gameObject.SetActive(true);
                var formRect = form as RectTransform;
                if (formRect != null)
                {
                    formRect.sizeDelta = new Vector2(586, 668);
                    formRect.anchoredPosition = Vector2.zero;
                }
            }

            var title = FindDeep(root, "AgeTipsTitle")?.GetComponent<Text>();
            if (title != null)
            {
                title.gameObject.SetActive(true);
                if (string.IsNullOrEmpty(title.text))
                    title.text = "适龄提示";
                title.color = FeaturePopupTitleColor;
                title.fontSize = 40;
                title.fontStyle = FontStyle.Bold;
                title.alignment = TextAnchor.MiddleCenter;
                title.horizontalOverflow = HorizontalWrapMode.Overflow;
                title.verticalOverflow = VerticalWrapMode.Overflow;
                title.lineSpacing = 1f;
                var outline = title.GetComponent<Outline>() ?? title.gameObject.AddComponent<Outline>();
                outline.effectColor = Color.white;
                outline.effectDistance = new Vector2(2, -2);
                outline.useGraphicAlpha = true;
            }

            var body = FindDeep(root, "AgeTipsText")?.GetComponent<Text>();
            if (body != null)
            {
                body.gameObject.SetActive(true);
                var bodyRect = body.transform as RectTransform;
                if (bodyRect != null)
                {
                    bodyRect.sizeDelta = new Vector2(470, 390);
                    bodyRect.anchoredPosition = new Vector2(1, -32);
                }
                body.color = new Color32(184, 0, 43, 255);
                // Keep the serialized Text.fontSize so the value can be tuned
                // directly on AgeTipsText without being reset on startup.
                body.fontStyle = FontStyle.Normal;
                body.alignment = TextAnchor.UpperLeft;
                body.horizontalOverflow = HorizontalWrapMode.Wrap;
                body.verticalOverflow = VerticalWrapMode.Overflow;
                body.lineSpacing = 1.08f;
                var bodyOutline = body.GetComponent<Outline>();
                if (bodyOutline != null)
                    bodyOutline.enabled = false;
            }

            var close = FindDeep(root, "AgeTipsClose");
            if (close != null)
            {
                close.gameObject.SetActive(true);
                // Keep the serialized RectTransform as the source of truth.
                // This lets HysjLoad.prefab edits flow into Play Mode instead
                // of being replaced by a fixed runtime position.
                ApplyButton(root, "AgeTipsClose", "anniuqueren");
            }
        }

        private static void ApplySplashHealthNotice(GameObject splash)
        {
            if (splash == null) return;

            // Splash previously combined a city background, game logo and a
            // small legacy text image. The supplied health artwork already
            // contains the complete authored composition, so those layers
            // must not remain visible above or below it.
            var health = AddImage(splash.transform, "FormalHealthNotice", HealthNoticeResource,
                Vector2.zero, Vector2.zero, 0);
            if (health != null)
            {
                health.rectTransform.anchorMin = Vector2.zero;
                health.rectTransform.anchorMax = Vector2.one;
                health.rectTransform.offsetMin = Vector2.zero;
                health.rectTransform.offsetMax = Vector2.zero;
                health.preserveAspect = false;
                health.type = Image.Type.Simple;
                health.raycastTarget = false;
                health.gameObject.SetActive(true);
            }

            var splashImage = splash.GetComponent<Image>();
            if (splashImage != null)
            {
                splashImage.sprite = null;
                splashImage.color = Color.clear;
                splashImage.raycastTarget = false;
            }

            var healthTransform = health == null ? null : health.transform;
            for (var i = 0; i < splash.transform.childCount; i++)
            {
                var child = splash.transform.GetChild(i);
                if (child != healthTransform)
                    child.gameObject.SetActive(false);
            }
        }

        private static void ApplyScreenComposition(GameObject screen, string nodeName, string resource,
            params GameObject[] interactiveObjects)
        {
            if (screen == null) return;

            var composition = AddImage(screen.transform, nodeName, resource, Vector2.zero, Vector2.zero, 0);
            if (composition != null)
            {
                composition.rectTransform.anchorMin = Vector2.zero;
                composition.rectTransform.anchorMax = Vector2.one;
                composition.rectTransform.offsetMin = Vector2.zero;
                composition.rectTransform.offsetMax = Vector2.zero;
                composition.preserveAspect = false;
                composition.type = Image.Type.Simple;
                composition.raycastTarget = false;
                composition.gameObject.SetActive(true);
            }

            var rootImage = screen.GetComponent<Image>();
            if (rootImage != null)
            {
                rootImage.sprite = null;
                rootImage.color = Color.clear;
                rootImage.raycastTarget = false;
            }

            HideScreenVisuals(screen.transform, composition == null ? null : composition.transform, interactiveObjects);
            if (interactiveObjects == null) return;
            foreach (var interactive in interactiveObjects)
                MakeInteractionOnly(interactive);
        }

        private static void HideScreenVisuals(Transform root, Transform composition, GameObject[] interactiveObjects)
        {
            if (root == null) return;
            for (var i = root.childCount - 1; i >= 0; i--)
            {
                var child = root.GetChild(i);
                if (child == composition) continue;
                if (!ContainsInteractive(child, interactiveObjects))
                {
                    child.gameObject.SetActive(false);
                    continue;
                }

                ClearGraphic(child.gameObject);
                HideScreenVisuals(child, composition, interactiveObjects);
            }
        }

        private static bool ContainsInteractive(Transform root, GameObject[] interactiveObjects)
        {
            if (root == null || interactiveObjects == null) return false;
            foreach (var interactive in interactiveObjects)
            {
                if (interactive == null) continue;
                var interactiveTransform = interactive.transform;
                if (interactiveTransform == root || interactiveTransform.IsChildOf(root)) return true;
            }
            return false;
        }

        private static void ClearGraphic(GameObject target)
        {
            if (target == null) return;
            var image = target.GetComponent<Image>();
            if (image != null)
            {
                image.sprite = null;
                image.color = Color.clear;
                image.raycastTarget = false;
            }
            var text = target.GetComponent<Text>();
            if (text != null) text.gameObject.SetActive(false);
        }

        private static void MakeInteractionOnly(GameObject target)
        {
            if (target == null) return;
            var input = target.GetComponent<InputField>();
            if (input != null)
            {
                ClearGraphic(target);
                var inputHit = target.GetComponent<Image>() ?? target.AddComponent<Image>();
                inputHit.raycastTarget = true;
                inputHit.color = Color.clear;
                if (input.placeholder != null) input.placeholder.gameObject.SetActive(false);
                if (input.textComponent != null)
                {
                    input.textComponent.gameObject.SetActive(true);
                    input.textComponent.color = Color.white;
                    input.textComponent.fontSize = 30;
                    input.textComponent.alignment = TextAnchor.MiddleCenter;
                    input.textComponent.horizontalOverflow = HorizontalWrapMode.Overflow;
                    input.textComponent.verticalOverflow = VerticalWrapMode.Overflow;
                }
                return;
            }

            var button = target.GetComponent<Button>();
            var toggle = target.GetComponent<Toggle>();
            ClearGraphic(target);
            if (button != null)
            {
                button.transition = Selectable.Transition.None;
                var buttonHit = target.GetComponent<Image>() ?? target.AddComponent<Image>();
                buttonHit.raycastTarget = true;
                buttonHit.color = Color.clear;
                button.targetGraphic = buttonHit;
            }
            if (toggle != null)
            {
                toggle.transition = Selectable.Transition.None;
                var toggleHit = target.GetComponent<Image>() ?? target.AddComponent<Image>();
                toggleHit.raycastTarget = true;
                toggleHit.color = Color.clear;
                toggle.targetGraphic = toggleHit;
                toggle.graphic = null;
            }

            foreach (var text in target.GetComponentsInChildren<Text>(true))
                text.gameObject.SetActive(false);
            foreach (var image in target.GetComponentsInChildren<Image>(true))
            {
                image.sprite = null;
                image.color = Color.clear;
                image.raycastTarget = false;
            }
            var hitImage = target.GetComponent<Image>();
            if (hitImage != null)
            {
                hitImage.raycastTarget = button != null || toggle != null;
                hitImage.color = Color.clear;
            }
        }

        public static void ApplyMain(HysjEditorLayout layout)
        {
            if (layout == null || layout.mainScreen == null) return;
            // HysjMain's authored scene uses the garden main-menu art. Keep
            // this separate from the login/loading city background.
            SetBackground(layout.mainScreen, MainArtRoot + "ditu");
            var oldLogo = FindDeep(layout.mainScreen.transform, "MainLogo");
            if (oldLogo != null) oldLogo.gameObject.SetActive(false);

            ApplyMainTownBuildings(layout.mainScreen.transform);
            ApplyMainControls(layout);
            ApplyStoryPanel(layout);
            ApplySettingsPanel(layout);
            ApplyMainPopupArt(layout);
        }

        private static void ApplyMainPopupArt(HysjEditorLayout layout)
        {
            ApplyFeaturePanel(layout.rankPanel, "排行榜");
            ApplyFeaturePanel(layout.shopPanel, "商店");
            ApplyFeaturePanel(layout.achievementsPanel, "成就");
            ApplyFeaturePanel(layout.weeklyPanel, "每周奖励");
            ApplyFeaturePanel(layout.onlinePanel, "在线奖励");
            ApplyFeaturePanel(layout.rechargePanel, "钻石商城");

            ApplyPopupTemplateImage(layout.rankItemTemplate, "RowBackground", "dikuangguanqia", new Vector2(469, 54));
            var rankHeader = layout.rankPanel == null ? null : layout.rankPanel.transform.Find("RankHeader");
            if (rankHeader != null)
            {
                SetRect(layout.rankPanel.transform, "RankHeader", new Vector2(474, 55), new Vector2(0, 254));
                var headerBackground = rankHeader.GetComponent<Image>();
                if (headerBackground == null)
                    headerBackground = AddImage(rankHeader, "Background", PopupArtRoot + "biaotiguanqia",
                        new Vector2(474, 55), Vector2.zero, 0);
                if (headerBackground != null)
                {
                    headerBackground.sprite = Load(PopupArtRoot + "biaotiguanqia");
                    headerBackground.color = Color.white;
                    headerBackground.preserveAspect = true;
                    headerBackground.raycastTarget = false;
                    headerBackground.rectTransform.sizeDelta = GetSpritePixelSize(headerBackground.sprite, new Vector2(474, 55));
                }
            }
            ApplyPopupTemplateImage(layout.rankPanel, "SelfBackground", "dikuangguanqiawode", new Vector2(469, 54));
            SetRect(layout.rankPanel == null ? null : layout.rankPanel.transform, "RankSelf", new Vector2(469, 54), new Vector2(0, -318));
            ConfigureRankHeaderText(layout.rankPanel);
            ApplyPopupTemplateImage(layout.shopItemTemplate, "ShopBackground", "dikuangshangdian", new Vector2(188, 167));
            ApplyPopupTemplateImage(layout.achievementItemTemplate, "bg", "dikuangchengjiu", new Vector2(449, 161));
            ApplyPopupTemplateImage(layout.weeklyItemTemplate, "bg", "dikuangziaxianjiangli", new Vector2(172, 222));
            ApplyPopupTemplateImage(layout.onlineItemTemplate, "bg", "dikuangziaxianjiangli", new Vector2(172, 222));
            SetRect(layout.shopItemTemplate == null ? null : layout.shopItemTemplate.transform,
                "ShopBackground", new Vector2(188, 167), new Vector2(0, 35));
            SetRect(layout.achievementItemTemplate == null ? null : layout.achievementItemTemplate.transform,
                "bg", new Vector2(449, 161), Vector2.zero);

            ConfigurePopupItemRect(layout.rankItemTemplate, new Vector2(469, 54));
            ConfigurePopupItemRect(layout.shopItemTemplate, new Vector2(206, 300));
            ConfigurePopupItemRect(layout.achievementItemTemplate, new Vector2(449, 161));
            ConfigureRewardItemRect(layout.weeklyItemTemplate);
            ConfigureRewardItemRect(layout.onlineItemTemplate);

            ApplyRewardButtonTemplate(layout.achievementItemTemplate);
            ApplyRewardButtonTemplate(layout.weeklyItemTemplate);
            ApplyRewardButtonTemplate(layout.onlineItemTemplate);
            ConfigureRechargePanel(layout);
            ConfigureDiamondPopupText(layout);
            ConfigureAchievementClaimButtonTemplate(layout.achievementItemTemplate);
            ConfigurePopupGrid(layout.shopContent, new Vector2(206, 270), new Vector2(29, 8), 2);
            ConfigureShopScrollView(layout.shopContent);
            ConfigureAchievementList(layout.achievementContent);
            ConfigurePopupVerticalList(layout.rankContent, 4);
            SetRect(layout.rankPanel == null ? null : layout.rankPanel.transform,
                "RankContent", new Vector2(469, 516), new Vector2(0, -27));
            SetRect(layout.achievementsPanel == null ? null : layout.achievementsPanel.transform,
                "AchievementContent", new Vector2(500, 650), new Vector2(0, -38));
            ConfigureRewardPopupLayout(layout.weeklyPanel);
            ConfigureRewardPopupLayout(layout.onlinePanel);
            ApplyFeaturePanelTitleColor(layout.rankPanel);
            ApplyFeaturePanelTitleColor(layout.shopPanel);
            ApplyFeaturePanelTitleColor(layout.rechargePanel);
            ApplyFeaturePanelTitleColor(layout.achievementsPanel);
            ApplyFeaturePanelTitleColor(layout.skillsPanel);
            ApplyFeaturePanelTitleColor(layout.weeklyPanel);
            ApplyFeaturePanelTitleColor(layout.onlinePanel);
        }

        private static void ConfigurePopupGrid(Transform content, Vector2 cellSize, Vector2 spacing, int columns)
        {
            var grid = content == null ? null : content.GetComponent<GridLayoutGroup>();
            if (grid == null) return;
            grid.cellSize = cellSize;
            grid.spacing = spacing;
            grid.padding = new RectOffset(0, 0, 0, 0);
            grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
            grid.constraintCount = columns;
            grid.childAlignment = TextAnchor.UpperCenter;
        }

        private static void ConfigureRechargePanel(HysjEditorLayout layout)
        {
            if (layout == null || layout.rechargePanel == null) return;

            var panel = layout.rechargePanel.transform;
            var frame = panel.Find("Frame");
            ConfigurePanelTitle(frame, "钻石商城", new Vector2(0, 344));
            SetSprite(panel, "Close", "guanbi", new Vector2(92, 95), new Vector2(248, 342));

            var template = layout.rechargeItemTemplate;
            if (template != null)
            {
                ConfigurePopupItemRect(template, new Vector2(216, 188));
                ApplyPopupTemplateImage(template, "ChargeBackground", "dikuangzuanshishangcheng",
                    new Vector2(216, 118));
                SetRect(template.transform, "ChargeBackground", new Vector2(216, 118), new Vector2(0, 35));
                SetSprite(template.transform, "ChargeIcon", MainArtRoot + "zuanshi",
                    new Vector2(79, 65), new Vector2(0, 48));
                SetSprite(template.transform, "Action", PopupArtRoot + "￥6",
                    new Vector2(216, 70), new Vector2(0, -59));

                var detail = template.transform.Find("Detail");
                if (detail != null) detail.gameObject.SetActive(false);

                var title = template.transform.Find("Title")?.GetComponent<Text>();
                if (title != null)
                {
                    ConfigureDiamondAmount(title, 36);
                    title.rectTransform.sizeDelta = new Vector2(170, 44);
                    title.rectTransform.anchoredPosition = Vector2.zero;
                }

                var action = template.transform.Find("Action");
                HideLegacyText(action);
                var button = action == null ? null : action.GetComponent<Button>();
                if (button != null)
                {
                    button.targetGraphic = action.GetComponent<Image>();
                    button.transition = Selectable.Transition.ColorTint;
                }
            }

            ConfigurePopupGrid(layout.rechargeContent, new Vector2(216, 188), new Vector2(18, 24), 2);
            var viewport = layout.rechargeContent == null ? null : layout.rechargeContent.parent as RectTransform;
            if (viewport != null)
            {
                viewport.sizeDelta = new Vector2(480, 620);
                viewport.anchoredPosition = new Vector2(0, -38);
            }
        }

        private static void ConfigureShopScrollView(Transform content)
        {
            var rect = content as RectTransform;
            if (rect == null) return;
            // Start.fire uses a 480x620 viewport with its top edge at 232.344
            // px. Keep the Unity centered-pivot equivalent so the visible
            // shop height matches the authored effect image.
            rect.sizeDelta = new Vector2(480, 620);
            rect.anchoredPosition = new Vector2(0, -77.656f);
        }

        private static void ConfigurePopupVerticalList(Transform content, float spacing)
        {
            var list = content == null ? null : content.GetComponent<VerticalLayoutGroup>();
            if (list == null) return;
            list.spacing = spacing;
            list.padding = new RectOffset(0, 0, 0, 0);
            list.childAlignment = TextAnchor.UpperCenter;
            list.childControlWidth = false;
            list.childControlHeight = false;
            list.childForceExpandWidth = false;
            list.childForceExpandHeight = false;
        }

        private static void ConfigureAchievementList(Transform content)
        {
            if (content == null) return;
            var grid = content.GetComponent<GridLayoutGroup>();
            if (grid != null)
            {
                grid.cellSize = new Vector2(449, 161);
                grid.spacing = new Vector2(0, 8);
                grid.padding = new RectOffset(0, 0, 0, 0);
                grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
                grid.constraintCount = 1;
                grid.startCorner = GridLayoutGroup.Corner.UpperLeft;
                grid.startAxis = GridLayoutGroup.Axis.Vertical;
                grid.childAlignment = TextAnchor.UpperCenter;
                return;
            }
            ConfigurePopupVerticalList(content, 8);
        }

        private static void ApplyFeaturePanel(GameObject panel, string title)
        {
            if (panel == null) return;
            var frame = panel.transform.Find("Frame");
            var frameImage = frame == null ? null : frame.GetComponent<Image>();
            if (frameImage != null)
            {
                frameImage.sprite = Load(PopupArtRoot + "tanchuangda");
                frameImage.color = Color.white;
                frameImage.type = Image.Type.Simple;
                frameImage.preserveAspect = true;
                frameImage.raycastTarget = true;
            }
            SetRect(panel.transform, "Frame", GetSpritePixelSize(frameImage == null ? null : frameImage.sprite,
                new Vector2(668, 863)), Vector2.zero);
            HidePanelTitleBand(frame);
            // tanchuangda's authored title band is centered at this local Y.
            // Keep every feature popup on the same baseline as the baked art.
            ConfigurePanelTitle(frame, title, new Vector2(0, 333));
            SetSprite(panel.transform, "Close", "guanbi", new Vector2(92, 95), new Vector2(275, 333));
        }

        private static void ApplyPopupTemplateImage(GameObject template, string nodeName, string resource,
            Vector2 size)
        {
            var image = FindDeep(template == null ? null : template.transform, nodeName)?.GetComponent<Image>();
            if (image == null) return;
            image.sprite = Load(PopupArtRoot + resource);
            image.color = Color.white;
            image.type = Image.Type.Simple;
            image.preserveAspect = true;
            image.raycastTarget = false;
            image.rectTransform.sizeDelta = GetSpritePixelSize(image.sprite, size);
        }

        private static void ConfigurePopupItemRect(GameObject template, Vector2 size)
        {
            if (template == null) return;
            var rect = template.GetComponent<RectTransform>();
            if (rect != null) rect.sizeDelta = size;
            var element = template.GetComponent<LayoutElement>() ?? template.AddComponent<LayoutElement>();
            element.minWidth = element.preferredWidth = size.x;
            element.minHeight = element.preferredHeight = size.y;
            element.flexibleWidth = 0;
            element.flexibleHeight = 0;
        }

        private static void ConfigureRewardItemRect(GameObject template)
        {
            if (template == null) return;
            ConfigurePopupItemRect(template, new Vector2(176, 300));
            var background = FindDeep(template.transform, "bg")?.GetComponent<Image>();
            if (background != null)
            {
                background.preserveAspect = true;
                background.rectTransform.sizeDelta = GetSpritePixelSize(background.sprite, new Vector2(172, 222));
                background.rectTransform.anchoredPosition = new Vector2(0, 36);
            }
            var button = template.transform.Find("claimButton")?.GetComponent<Button>()
                ?? template.GetComponentInChildren<Button>(true);
            var buttonRect = button == null ? null : button.GetComponent<RectTransform>();
            if (buttonRect != null)
            {
                buttonRect.sizeDelta = GetSpritePixelSize(button.GetComponent<Image>()?.sprite, new Vector2(176, 72));
                buttonRect.anchoredPosition = new Vector2(0, -108);
            }
        }

        private static void ConfigureRankHeaderText(GameObject panel)
        {
            if (panel == null) return;
            var color = new Color32(173, 0, 55, 255);
            // biaotiguanqia already contains the three column captions as
            // authored art. Disable the serialized Text overlays so they do
            // not duplicate or misalign the baked labels.
            SetRankHeaderTextVisible(panel, "RankHeaderRank", false);
            SetRankHeaderTextVisible(panel, "RankHeaderName", false);
            SetRankHeaderTextVisible(panel, "RankHeaderLevel", false);
            ConfigureRankLabel(panel.transform.Find("RankSelf/RankSelfRank")?.GetComponent<Text>(), color,
                new Vector2(-178, 0), new Vector2(80, 40));
            ConfigureRankLabel(panel.transform.Find("RankSelf/RankSelfName")?.GetComponent<Text>(), color,
                Vector2.zero, new Vector2(160, 40));
            ConfigureRankLabel(panel.transform.Find("RankSelf/RankSelfLevel")?.GetComponent<Text>(), color,
                new Vector2(178, 0), new Vector2(80, 40));
        }

        private static void SetRankHeaderTextVisible(GameObject panel, string name, bool visible)
        {
            var label = panel.transform.Find("RankHeader/" + name)?.GetComponent<Text>();
            if (label != null) label.gameObject.SetActive(visible);
        }

        private static void ConfigureRankLabel(Text label, Color color, Vector2 position, Vector2 size)
        {
            if (label == null) return;
            label.color = color;
            label.fontSize = 24;
            label.fontStyle = FontStyle.Bold;
            label.alignment = TextAnchor.MiddleCenter;
            label.horizontalOverflow = HorizontalWrapMode.Overflow;
            label.verticalOverflow = VerticalWrapMode.Overflow;
            label.raycastTarget = false;
            label.rectTransform.anchoredPosition = position;
            label.rectTransform.sizeDelta = size;
        }

        private static void ConfigureDiamondPopupText(HysjEditorLayout layout)
        {
            if (layout == null) return;

            ConfigureDiamondAmount(layout.rechargeItemTemplate == null ? null :
                layout.rechargeItemTemplate.transform.Find("Title")?.GetComponent<Text>(), 36);
            ConfigureDiamondAmount(layout.achievementItemTemplate == null ? null :
                layout.achievementItemTemplate.transform.Find("RewardAmount")?.GetComponent<Text>(), 36);
            ConfigureDiamondAmount(layout.weeklyItemTemplate == null ? null :
                layout.weeklyItemTemplate.transform.Find("rewardBg/rewardLabel")?.GetComponent<Text>(), 30);
            ConfigureDiamondAmount(layout.onlineItemTemplate == null ? null :
                layout.onlineItemTemplate.transform.Find("rewardBg/rewardLabel")?.GetComponent<Text>(), 30);

            var shopPrice = layout.shopItemTemplate == null ? null :
                layout.shopItemTemplate.transform.Find("Action/ActionLabel")?.GetComponent<Text>();
            ConfigureShopPrice(shopPrice);

            var shopBalance = layout.shopPanel == null ? null :
                layout.shopPanel.transform.Find("Frame/GoldValue")?.GetComponent<Text>();
            if (shopBalance != null)
            {
                shopBalance.color = new Color32(163, 86, 80, 255);
                shopBalance.fontSize = 30;
                shopBalance.fontStyle = FontStyle.Normal;
                shopBalance.alignment = TextAnchor.MiddleLeft;
                shopBalance.horizontalOverflow = HorizontalWrapMode.Overflow;
                shopBalance.verticalOverflow = VerticalWrapMode.Overflow;
                var outline = shopBalance.GetComponent<Outline>();
                if (outline != null) outline.enabled = false;
                shopBalance.rectTransform.anchoredPosition = new Vector2(-.019f, 257.451f);
            }
            var shopBalanceIcon = layout.shopPanel == null ? null :
                layout.shopPanel.transform.Find("Frame/GoldIcon")?.GetComponent<RectTransform>();
            if (shopBalanceIcon != null)
                shopBalanceIcon.anchoredPosition = new Vector2(-35.836f, 254.179f);
        }

        private static void ConfigureDiamondAmount(Text label, int fontSize)
        {
            if (label == null) return;
            label.color = new Color32(160, 1, 52, 255);
            label.fontSize = fontSize;
            label.fontStyle = FontStyle.Normal;
            label.alignment = TextAnchor.MiddleCenter;
            label.horizontalOverflow = HorizontalWrapMode.Overflow;
            label.verticalOverflow = VerticalWrapMode.Overflow;
            var outline = label.GetComponent<Outline>() ?? label.gameObject.AddComponent<Outline>();
            outline.enabled = true;
            outline.effectColor = Color.white;
            outline.effectDistance = new Vector2(2, -2);
            outline.useGraphicAlpha = true;
        }

        private static void ConfigureShopPrice(Text label)
        {
            if (label == null) return;
            label.color = Color.white;
            label.fontSize = 30;
            label.fontStyle = FontStyle.Normal;
            label.alignment = TextAnchor.MiddleCenter;
            label.horizontalOverflow = HorizontalWrapMode.Overflow;
            label.verticalOverflow = VerticalWrapMode.Overflow;
            var outline = label.GetComponent<Outline>() ?? label.gameObject.AddComponent<Outline>();
            outline.enabled = true;
            outline.effectColor = new Color32(117, 46, 141, 255);
            outline.effectDistance = new Vector2(2, -2);
            outline.useGraphicAlpha = true;
        }

        private static void ApplyRewardButtonTemplate(GameObject template)
        {
            var button = template == null ? null : template.transform.Find("claimButton")?.GetComponent<Button>();
            if (button == null) button = template == null ? null : template.GetComponentInChildren<Button>(true);
            var image = button == null ? null : button.GetComponent<Image>();
            if (image == null) return;
            image.sprite = Load(PopupArtRoot + "anniulingqu");
            image.color = Color.white;
            image.type = Image.Type.Simple;
            image.preserveAspect = true;
            image.rectTransform.sizeDelta = GetSpritePixelSize(image.sprite, new Vector2(176, 72));
            var buttonRect = button.GetComponent<RectTransform>();
            if (buttonRect != null)
            {
                buttonRect.sizeDelta = GetSpritePixelSize(image.sprite, new Vector2(176, 72));
                buttonRect.anchoredPosition = new Vector2(0, -108);
            }
            button.transition = Selectable.Transition.None;
            var label = button.GetComponentInChildren<Text>(true);
            if (label != null) label.gameObject.SetActive(false);
        }

        private static void ConfigureAchievementClaimButtonTemplate(GameObject template)
        {
            var button = template == null ? null : template.transform.Find("claimButton")?.GetComponent<Button>();
            if (button == null) return;
            // anniulingqu/anniuyilingqu are authored at 176x72 in the
            // achievement reference. Keep the template at native size so the
            // cloned rows match the effect image exactly.
            var size = new Vector2(176, 72);
            var rect = button.GetComponent<RectTransform>();
            if (rect != null)
            {
                rect.sizeDelta = size;
                rect.anchoredPosition = new Vector2(125, -30);
            }
            var image = button.GetComponent<Image>();
            if (image != null) image.rectTransform.sizeDelta = size;
        }

        private static void ConfigureRewardPopupLayout(GameObject panel)
        {
            if (panel == null) return;
            var contentRoot = panel.name == "OnlinePanel" ? "OnlineContent" : "WeeklyContent";
            SetRect(panel.transform, contentRoot, new Vector2(560, 650), new Vector2(0, -34));
            var content = panel.transform.Find(contentRoot + "/Content")?.GetComponent<GridLayoutGroup>();
            if (content == null)
            {
                var scroll = panel.transform.Find(contentRoot);
                content = scroll?.Find("Content")?.GetComponent<GridLayoutGroup>();
            }
            if (content != null)
            {
                content.cellSize = new Vector2(176, 300);
                content.spacing = new Vector2(4, 8);
                content.padding = new RectOffset(0, 0, 0, 0);
                content.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
                content.constraintCount = 3;
                content.childAlignment = TextAnchor.UpperCenter;
            }
        }

        public static void ApplyGameplayPausePopup(GameObject popup, bool useEndGameButton = false)
        {
            if (popup == null) return;
            var panel = FindDeep(popup.transform, "Panel") ?? FindDeep(popup.transform, "panel");
            var panelImage = panel == null ? null : panel.GetComponent<Image>();
            if (panelImage != null)
            {
                panelImage.sprite = Resources.Load<Sprite>("HysjLegacy/NewImage/tanchuang4");
                panelImage.color = Color.white;
                panelImage.type = Image.Type.Sliced;
                panelImage.preserveAspect = false;
                panelImage.raycastTarget = true;
                panelImage.rectTransform.anchorMin = new Vector2(.5f, .5f);
                panelImage.rectTransform.anchorMax = new Vector2(.5f, .5f);
                panelImage.rectTransform.pivot = new Vector2(.5f, .5f);
                // Match the compact pause card in the supplied 720x1280
                // composition rather than the taller login-panel height.
                panelImage.rectTransform.sizeDelta = new Vector2(586, 393);
                panelImage.rectTransform.anchoredPosition = new Vector2(0, 0);
                panelImage.rectTransform.localScale = Vector3.one;
            }

            var titleBand = panel == null ? null : panel.Find("TitleBand");
            if (titleBand != null) titleBand.gameObject.SetActive(false);
            var title = FindDeep(popup.transform, "PauseTitle")?.GetComponent<Text>()
                ?? FindDeep(popup.transform, "Title")?.GetComponent<Text>();
            ConfigureGameplayPopupTitle(title, "游戏暂停", new Vector2(0, 93));
            ConfigureGameplayPopupButton(popup, "PrimaryBtn", "Resume", "anniujixuyouxi", new Vector2(111, -58));
            ConfigureGameplayPopupButton(popup, "BackBtn", "PauseBack",
                useEndGameButton ? "anniukong" : "anniufanhuizhujiemian", new Vector2(-110, -58),
                useEndGameButton ? "结束游戏" : null);
        }

        public static void ApplyGameplayResultPopup(GameObject popup, bool success)
        {
            if (popup == null) return;
            var panel = FindDeep(popup.transform, "Panel") ?? FindDeep(popup.transform, "panel");
            var panelImage = panel == null ? null : panel.GetComponent<Image>();
            if (panelImage != null)
            {
                panelImage.sprite = Load("tanchuang2");
                panelImage.color = Color.white;
                panelImage.type = Image.Type.Simple;
                panelImage.preserveAspect = true;
                panelImage.raycastTarget = true;
                var panelRect = panelImage.rectTransform;
                panelRect.anchorMin = panelRect.anchorMax = new Vector2(.5f, .5f);
                panelRect.pivot = new Vector2(.5f, .5f);
                panelRect.sizeDelta = GetSpritePixelSize(panelImage.sprite, new Vector2(586, 668));
                panelRect.anchoredPosition = new Vector2(0, -8);
                panelRect.localScale = Vector3.one;
            }

            var inner = panel == null ? null : panel.Find("dikuangyouxijiesu");
            var innerImage = inner == null ? null : inner.GetComponent<Image>();
            if (innerImage != null)
            {
                innerImage.sprite = Load(PopupArtRoot + "tanchuangneidikuang");
                innerImage.color = Color.white;
                innerImage.type = Image.Type.Simple;
                innerImage.preserveAspect = true;
                innerImage.rectTransform.sizeDelta = GetSpritePixelSize(innerImage.sprite, new Vector2(411, 211));
                innerImage.rectTransform.anchoredPosition = new Vector2(1.5f, -17.5f);
            }
            else if (panel != null)
            {
                innerImage = AddImage(panel, "dikuangyouxijiesu", PopupArtRoot + "tanchuangneidikuang",
                    new Vector2(411, 211), new Vector2(1.5f, -17.5f), 0);
                innerImage.raycastTarget = false;
            }
            if (innerImage != null) innerImage.transform.SetAsFirstSibling();

            var title = FindDeep(popup.transform, "ResultTitle")?.GetComponent<Image>();
            if (title == null && panel != null)
                title = AddImage(panel, "ResultTitle", PopupArtRoot + (success ? "youxichenggongbiaoti" : "youxishibaibiaoti"),
                    new Vector2(400, 145), new Vector2(0, 285), 1);
            if (title != null)
            {
                title.sprite = Load(PopupArtRoot + (success ? "youxichenggongbiaoti" : "youxishibaibiaoti"));
                title.color = Color.white;
                title.type = Image.Type.Simple;
                title.preserveAspect = true;
                title.raycastTarget = false;
                title.rectTransform.sizeDelta = GetSpritePixelSize(title.sprite,
                    success ? new Vector2(488, 174) : new Vector2(488, 178));
                title.rectTransform.anchoredPosition = new Vector2(1, success ? 279 : 277);
            }

            var stars = panel == null ? null : panel.Find("Stars") as RectTransform;
            if (stars != null)
            {
                stars.gameObject.SetActive(success);
                stars.anchorMin = stars.anchorMax = new Vector2(.5f, .5f);
                stars.pivot = new Vector2(.5f, .5f);
                stars.sizeDelta = new Vector2(244, 75);
                stars.anchoredPosition = new Vector2(0, 145.5f);
                for (var i = 0; i < 3; i++)
                {
                    var star = stars.Find("star" + (i + 1))?.GetComponent<Image>();
                    if (star == null) continue;
                    star.sprite = Load("xingxing2");
                    star.color = Color.white;
                    star.type = Image.Type.Simple;
                    star.preserveAspect = true;
                    star.raycastTarget = false;
                    star.rectTransform.sizeDelta = new Vector2(77, 75);
                    star.rectTransform.anchoredPosition = new Vector2(-80.5f + i * 81f, 0);
                }
            }

            var description = panel == null ? null : panel.Find("BestDistanceLabel")?.GetComponent<Text>();
            var rewardPrefix = panel == null ? null : panel.Find("DistanceLabel")?.GetComponent<Text>();
            var rewardAmount = panel == null ? null : panel.Find("GoldLabel")?.GetComponent<Text>();
            ConfigureResultLabel(description, new Vector2(0, 33), new Vector2(400, 40), false);
            ConfigureResultLabel(rewardPrefix, new Vector2(-66, -34), new Vector2(70, 40), true);
            ConfigureResultLabel(rewardAmount, new Vector2(96, -34), new Vector2(90, 40), true);
            if (panel != null && (description != null || rewardPrefix != null || rewardAmount != null))
            {
                var diamond = AddImage(panel, "RewardDiamond", MainArtRoot + "zuanshi",
                    new Vector2(79, 65), new Vector2(11.5f, -37.5f), panel.childCount - 1);
                if (diamond != null)
                {
                    diamond.rectTransform.sizeDelta = GetSpritePixelSize(diamond.sprite, new Vector2(79, 65));
                    diamond.rectTransform.anchoredPosition = new Vector2(11.5f, -37.5f);
                    diamond.preserveAspect = true;
                    diamond.raycastTarget = false;
                }
            }

            ConfigureGameplayPopupButton(popup, "backBtn", "Back", "anniufanhuizhujiemian", new Vector2(-117, -201));
            ConfigureGameplayPopupButton(popup, "nextBtn", "Next", "annniuxiayiguan", new Vector2(104, -201));
            ConfigureGameplayPopupButton(popup, "retryBtn", "Retry", "anniuchongxintiaozhan", new Vector2(104, -201));
            if (title != null) title.transform.SetAsLastSibling();
        }

        private static void ConfigureResultLabel(Text label, Vector2 position, Vector2 size, bool bold)
        {
            if (label == null) return;
            label.gameObject.SetActive(true);
            label.color = FeaturePopupTitleColor;
            label.fontSize = 24;
            label.fontStyle = bold ? FontStyle.Bold : FontStyle.Normal;
            label.alignment = TextAnchor.MiddleCenter;
            label.alignByGeometry = true;
            label.horizontalOverflow = HorizontalWrapMode.Overflow;
            label.verticalOverflow = VerticalWrapMode.Overflow;
            label.raycastTarget = false;
            label.rectTransform.anchorMin = label.rectTransform.anchorMax = new Vector2(.5f, .5f);
            label.rectTransform.pivot = new Vector2(.5f, .5f);
            label.rectTransform.sizeDelta = size;
            label.rectTransform.anchoredPosition = position;
            var shadow = label.GetComponent<Shadow>();
            if (shadow != null) shadow.enabled = false;
        }

        private static void ConfigureGameplayPopupTitle(Text title, string value, Vector2 position)
        {
            if (title == null) return;
            title.gameObject.SetActive(true);
            title.text = value;
            title.color = FeaturePopupTitleColor;
            title.fontSize = 40;
            title.fontStyle = FontStyle.Bold;
            title.alignment = TextAnchor.MiddleCenter;
            title.horizontalOverflow = HorizontalWrapMode.Overflow;
            title.verticalOverflow = VerticalWrapMode.Overflow;
            title.raycastTarget = false;
            title.rectTransform.anchorMin = new Vector2(.5f, .5f);
            title.rectTransform.anchorMax = new Vector2(.5f, .5f);
            title.rectTransform.pivot = new Vector2(.5f, .5f);
            title.rectTransform.localScale = Vector3.one;
            title.rectTransform.sizeDelta = new Vector2(400, 64);
            title.rectTransform.anchoredPosition = position;
            var outline = title.GetComponent<Outline>() ?? title.gameObject.AddComponent<Outline>();
            outline.enabled = true;
            outline.effectColor = Color.white;
            outline.effectDistance = new Vector2(2, -2);
            outline.useGraphicAlpha = true;
        }

        private static void ConfigureGameplayPopupButton(GameObject popup, string primaryName, string fallbackName,
            string resource, Vector2 position, string labelValue = null)
        {
            var button = FindDeep(popup.transform, primaryName)?.GetComponent<Button>()
                ?? FindDeep(popup.transform, fallbackName)?.GetComponent<Button>();
            if (button == null) return;
            var image = button.GetComponent<Image>();
            if (image == null) image = button.gameObject.AddComponent<Image>();
            image.sprite = Load(PopupArtRoot + resource);
            image.color = Color.white;
            image.type = Image.Type.Simple;
            image.preserveAspect = true;
            image.raycastTarget = true;
            button.targetGraphic = image;
            button.transition = Selectable.Transition.None;
            button.gameObject.SetActive(true);
            var rect = button.transform as RectTransform;
            if (rect != null)
            {
                rect.sizeDelta = new Vector2(206, 72);
                rect.anchoredPosition = position;
            }
            if (string.IsNullOrEmpty(labelValue)) HideLegacyText(button.transform);
            else ConfigureGameplayPopupButtonLabel(button.transform, labelValue);
        }

        private static void ConfigureGameplayPopupButtonLabel(Transform button, string value)
        {
            var label = button.Find("Label")?.GetComponent<Text>() ?? button.GetComponentInChildren<Text>(true);
            if (label == null)
            {
                var labelObject = new GameObject("Label", typeof(RectTransform), typeof(Text));
                labelObject.transform.SetParent(button, false);
                label = labelObject.GetComponent<Text>();
            }

            label.gameObject.SetActive(true);
            label.text = value;
            if (label.font == null) label.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            label.fontSize = 24;
            label.fontStyle = FontStyle.Bold;
            label.color = Color.white;
            label.alignment = TextAnchor.MiddleCenter;
            label.horizontalOverflow = HorizontalWrapMode.Overflow;
            label.verticalOverflow = VerticalWrapMode.Overflow;
            label.raycastTarget = false;
            var rect = label.rectTransform;
            rect.anchorMin = rect.anchorMax = new Vector2(.5f, .5f);
            rect.pivot = new Vector2(.5f, .5f);
            rect.sizeDelta = new Vector2(190, 58);
            rect.anchoredPosition = Vector2.zero;
            rect.localScale = Vector3.one;
            var outline = label.GetComponent<Outline>() ?? label.gameObject.AddComponent<Outline>();
            outline.enabled = true;
            outline.effectColor = new Color32(117, 46, 141, 255);
            outline.effectDistance = new Vector2(2, -2);
            outline.useGraphicAlpha = true;
        }

        private static void ApplyStoryPanel(HysjEditorLayout layout)
        {
            var panel = layout.storyPanel;
            if (panel == null) return;

            var panelImage = panel.GetComponent<Image>();
            if (panelImage != null)
            {
                panelImage.sprite = Load(MainArtRoot + "beijinggushi");
                panelImage.color = Color.white;
                panelImage.preserveAspect = false;
                panelImage.raycastTarget = true;
            }

            var storyText = layout.storyText;
            if (storyText != null)
            {
                storyText.gameObject.SetActive(true);
                storyText.color = new Color32(184, 0, 43, 255);
                storyText.fontSize = 28;
                storyText.fontStyle = FontStyle.Normal;
                storyText.alignment = TextAnchor.UpperLeft;
                storyText.horizontalOverflow = HorizontalWrapMode.Wrap;
                storyText.verticalOverflow = VerticalWrapMode.Overflow;
                storyText.lineSpacing = 1.12f;
                storyText.raycastTarget = false;
                storyText.rectTransform.sizeDelta = new Vector2(520, 850);
                storyText.rectTransform.anchoredPosition = new Vector2(0, 48);
            }

            var skip = layout.storySkipButton;
            if (skip != null)
            {
                SetSprite(panel.transform, "StorySkipButton", MainArtRoot + "anniutiaoguo",
                    new Vector2(206, 72), new Vector2(0, -439));
                HideLegacyText(skip.transform);
                skip.transition = Selectable.Transition.None;
                skip.targetGraphic = skip.GetComponent<Image>();
                // The supplied story background already contains the authored
                // button art; this overlay provides the real hit target.
                skip.gameObject.SetActive(true);
            }
        }

        private static void ApplySettingsPanel(HysjEditorLayout layout)
        {
            var panel = layout.settingsPanel;
            if (panel == null) return;

            var dim = panel.GetComponent<Image>();
            if (dim != null)
            {
                dim.sprite = null;
                dim.color = new Color(0f, 0f, 0f, .58f);
                dim.raycastTarget = true;
            }

            var frame = panel.transform.Find("Frame");
            var frameImage = frame == null ? null : frame.GetComponent<Image>();
            if (frameImage != null)
            {
                frameImage.sprite = Load("tanchuang4");
                frameImage.color = Color.white;
                frameImage.preserveAspect = true;
                frameImage.raycastTarget = true;
            }
            SetRect(panel.transform, "Frame", new Vector2(586, 478), new Vector2(0, 0));
            HidePanelTitleBand(frame);
            ConfigurePanelTitle(frame, "设置");
            SetSprite(panel.transform, "Close", "guanbi", new Vector2(92, 95), new Vector2(249, 143));

            SetSprite(panel.transform, "SettingsMusicCard", MainArtRoot + "dikuangshehzi",
                new Vector2(191, 155), new Vector2(-120, -6));
            SetSprite(panel.transform, "SettingsSoundCard", MainArtRoot + "dikuangshehzi",
                new Vector2(191, 155), new Vector2(112, -6));

            SetSprite(panel.transform, "MusicIcon", MainArtRoot + "yinyue2",
                new Vector2(77, 87), new Vector2(-157, 30));
            ConfigureSettingsLabel(panel.transform, "MusicLabel", "音乐", new Vector2(-82, 30));
            SetSprite(panel.transform, "Music", MainArtRoot + "kai",
                new Vector2(113, 49), new Vector2(-120, -42));
            SetSprite(panel.transform, "SoundIcon", MainArtRoot + "yinyue",
                new Vector2(69, 73), new Vector2(81, 30));
            ConfigureSettingsLabel(panel.transform, "SoundLabel", "音效", new Vector2(154, 30));
            SetSprite(panel.transform, "Sound", MainArtRoot + "guan",
                new Vector2(112, 48), new Vector2(112, -42));
            SetSprite(panel.transform, "BtnReset", MainArtRoot + "anniutuichudenglu", new Vector2(206, 72), new Vector2(0, -134));
            var reset = FindDeep(panel.transform, "BtnReset");
            HideLegacyText(reset);
            var resetButton = reset == null ? null : reset.GetComponent<Button>();
            if (resetButton != null)
            {
                resetButton.transition = Selectable.Transition.None;
                resetButton.targetGraphic = reset.GetComponent<Image>();
            }
        }

        private static void HidePanelTitleBand(Transform frame)
        {
            var band = frame == null ? null : frame.Find("TitleBand");
            if (band != null) band.gameObject.SetActive(false);
        }

        private static void ConfigurePanelTitle(Transform frame, string value, Vector2? position = null)
        {
            var title = frame == null ? null : frame.Find("Title")?.GetComponent<Text>();
            if (title == null) return;
            title.gameObject.SetActive(true);
            title.text = value;
            title.color = FeaturePopupTitleColor;
            title.fontSize = value == "在线奖励" || value == "每周奖励" ? 42 : 40;
            title.fontStyle = FontStyle.Bold;
            title.alignment = TextAnchor.MiddleCenter;
            title.horizontalOverflow = HorizontalWrapMode.Overflow;
            title.verticalOverflow = VerticalWrapMode.Overflow;
            title.raycastTarget = false;
            if (position.HasValue)
            {
                var targetPosition = position.Value;
                title.rectTransform.anchorMin = new Vector2(.5f, .5f);
                title.rectTransform.anchorMax = new Vector2(.5f, .5f);
                title.rectTransform.pivot = new Vector2(.5f, .5f);
                title.rectTransform.localScale = Vector3.one;
                title.rectTransform.sizeDelta = new Vector2(340, 72);
                title.rectTransform.anchoredPosition = targetPosition;
                title.rectTransform.localPosition = new Vector3(targetPosition.x, targetPosition.y, 0);
            }
            var outline = title.GetComponent<Outline>() ?? title.gameObject.AddComponent<Outline>();
            outline.enabled = true;
            outline.effectColor = Color.white;
            outline.effectDistance = new Vector2(2, -2);
            outline.useGraphicAlpha = true;
        }

        private static void ApplyFeaturePanelTitleColor(GameObject panel)
        {
            if (panel == null) return;
            var title = panel.transform.Find("Frame/Title")?.GetComponent<Text>();
            if (title == null) return;
            title.color = FeaturePopupTitleColor;
            title.alignment = TextAnchor.MiddleCenter;
            title.rectTransform.anchorMin = new Vector2(.5f, .5f);
            title.rectTransform.anchorMax = new Vector2(.5f, .5f);
            title.rectTransform.pivot = new Vector2(.5f, .5f);
            title.rectTransform.localScale = Vector3.one;
            title.rectTransform.sizeDelta = new Vector2(340, 72);
            title.rectTransform.anchoredPosition = new Vector2(0, 333);
            title.rectTransform.localPosition = new Vector3(0, 333, 0);
            var outline = title.GetComponent<Outline>() ?? title.gameObject.AddComponent<Outline>();
            outline.enabled = true;
            outline.effectColor = Color.white;
            outline.effectDistance = new Vector2(2, -2);
            outline.useGraphicAlpha = true;
        }

        private static void ConfigureSettingsLabel(Transform root, string nodeName, string value, Vector2 position)
        {
            var label = FindDeep(root, nodeName)?.GetComponent<Text>();
            if (label == null) return;
            label.gameObject.SetActive(true);
            label.text = value;
            label.color = new Color32(160, 1, 52, 255);
            label.fontSize = 32;
            label.fontStyle = FontStyle.Normal;
            label.alignment = TextAnchor.MiddleCenter;
            label.horizontalOverflow = HorizontalWrapMode.Overflow;
            label.verticalOverflow = VerticalWrapMode.Overflow;
            label.raycastTarget = false;
            label.rectTransform.sizeDelta = new Vector2(92, 44);
            label.rectTransform.anchoredPosition = position;
            var outline = label.GetComponent<Outline>();
            if (outline != null) outline.enabled = false;
        }

        public static void RefreshMainBuildingProgress(GameObject mainScreen)
        {
            if (mainScreen == null) return;

            var buildings = WishTownConfigService.GetBuildings();
            if (buildings == null) return;
            for (var i = 0; i < buildings.Length && i < 5; i++)
            {
                var letter = ((char)('A' + i)).ToString();
                var building = mainScreen.transform.Find("FormalTownBuildings/TownBuilding_" + letter);
                var mask = building == null ? null : building.Find("LockedMask")?.GetComponent<Image>();
                if (mask == null) continue;

                var progress = Mathf.Clamp(HysjDataService.GetWishTownBuildingProgress(i), 0, 100);
                // The supplied mask represents the unawakened upper section.
                // A top-origin vertical fill leaves the restored lower section
                // fully visible as progress rises from 0 to 100.
                mask.fillAmount = 1f - progress / 100f;
                mask.gameObject.SetActive(mask.fillAmount > 0.001f);
            }
        }

        private struct MainBuildingArt
        {
            public string letter;
            public Vector2 size;

            public MainBuildingArt(string letter, Vector2 size)
            {
                this.letter = letter;
                this.size = size;
            }
        }

        // Building transforms come exclusively from the authored prefab.
        // These sizes are only fallbacks when a child sprite cannot be loaded.
        private static readonly MainBuildingArt[] MainBuildings =
        {
            new MainBuildingArt("A", new Vector2(388, 290)),
            new MainBuildingArt("B", new Vector2(373, 338)),
            new MainBuildingArt("C", new Vector2(383, 331)),
            new MainBuildingArt("D", new Vector2(341, 279)),
            new MainBuildingArt("E", new Vector2(318, 313))
        };

        private static void ApplyMainTownBuildings(Transform main)
        {
            if (main == null) return;
            var townRoot = main.Find("FormalTownBuildings");
            if (townRoot == null)
            {
                var go = new GameObject("FormalTownBuildings", typeof(RectTransform));
                townRoot = go.transform;
                townRoot.SetParent(main, false);
            }

            var townRect = townRoot as RectTransform;
            if (townRect != null)
            {
                townRect.anchorMin = Vector2.zero;
                townRect.anchorMax = Vector2.one;
                townRect.offsetMin = Vector2.zero;
                townRect.offsetMax = Vector2.zero;
                townRect.SetAsFirstSibling();
                townRoot.SetSiblingIndex(Mathf.Min(1, main.childCount - 1));
            }

            foreach (var art in MainBuildings)
            {
                var building = townRoot.Find("TownBuilding_" + art.letter);
                if (building == null) continue;

                var hit = building.GetComponent<Image>();
                hit.color = Color.clear;
                hit.raycastTarget = false;
                hit.sprite = null;
                var button = building.GetComponent<Button>();
                button.transition = Selectable.Transition.None;

                // Keep the authored color art and the locked overlay as two
                // visible, independently sized layers. Both share the same
                // local origin so their source images remain aligned.
                var color = AddImage(building, "Color", MainArtRoot + art.letter,
                    Vector2.zero, Vector2.zero, 0);
                color.rectTransform.anchoredPosition = Vector2.zero;
                color.rectTransform.sizeDelta = GetSpritePixelSize(color.sprite, art.size);
                color.type = Image.Type.Simple;
                color.preserveAspect = false;
                // Use the visible building graphic for pointer hits. A fully
                // transparent parent graphic may be culled by CanvasRenderer,
                // which leaves the authored Button unable to receive clicks.
                color.raycastTarget = true;
                button.targetGraphic = color;
                color.gameObject.SetActive(true);

                var mask = AddImage(building, "LockedMask", MainArtRoot + art.letter + (int)(art.letter[0] - 'A' + 1),
                    Vector2.zero, Vector2.zero, 1);
                mask.rectTransform.anchoredPosition = Vector2.zero;
                mask.rectTransform.sizeDelta = GetSpritePixelSize(mask.sprite, art.size);
                mask.preserveAspect = true;
                mask.type = Image.Type.Filled;
                mask.fillMethod = Image.FillMethod.Vertical;
                mask.fillOrigin = 1;
                mask.fillClockwise = true;
                mask.raycastTarget = false;
                mask.color = Color.white;
            }
        }

        private static Vector2 GetSpritePixelSize(Sprite sprite, Vector2 fallback)
        {
            return sprite == null || sprite.rect.width <= 0f || sprite.rect.height <= 0f
                ? fallback
                : sprite.rect.size;
        }

        private static void ApplyMainControls(HysjEditorLayout layout)
        {
            var main = layout.mainScreen == null ? null : layout.mainScreen.transform;
            if (main == null) return;

            SetSprite(main, "BottomBar", MainArtRoot + "dikuangxiafang", new Vector2(720, 145), new Vector2(0, -569));
            ApplyMainButton(main, "BtnStart2", MainArtRoot + "guanqiamoshi", new Vector2(135, 143), new Vector2(230, -254));
            ApplyMainButton(main, "BtnStart", MainArtRoot + "wujinmoshi", new Vector2(137, 130), new Vector2(230, -400));

            // Pixel-matched to the authored 720x1280 composition: the centre
            // pair rises by 37 px and the outer pair drops by 18 px.
            ApplyMainButton(main, "BtnRank", MainArtRoot + "2", new Vector2(102, 111), new Vector2(-277.5f, -560.5f));
            ApplyMainButton(main, "BtnShop", MainArtRoot + "6", new Vector2(103, 111), new Vector2(-166.5f, -540.5f));
            ApplyMainButton(main, "BtnCJ", MainArtRoot + "5", new Vector2(100, 111), new Vector2(-54.5f, -523.5f));
            ApplyMainButton(main, "BtnDaily", MainArtRoot + "4", new Vector2(100, 111), new Vector2(56f, -523.5f));
            ApplyMainButton(main, "BtnWeek", MainArtRoot + "1", new Vector2(102, 111), new Vector2(166f, -540.5f));
            ApplyMainButton(main, "BtnBGM", MainArtRoot + "3", new Vector2(103, 111), new Vector2(277f, -560.5f));

            SetSprite(main, "GoldFrame", MainArtRoot + "dikuanghei", new Vector2(138, 51), new Vector2(-208, 571));
            SetSprite(main, "GoldIcon", MainArtRoot + "zuanshi", new Vector2(79, 65), new Vector2(-291, 575));
            SetSprite(main, "BtnCharge", MainArtRoot + "jia", new Vector2(65, 70), new Vector2(-125, 575));
            SetSprite(main, "StaminaFrame", MainArtRoot + "dikuanghei", new Vector2(138, 51), new Vector2(255, 571));
            SetSprite(main, "StaminaIcon", MainArtRoot + "tili", new Vector2(47, 75), new Vector2(187, 575));
            HideLegacyText(main, "PlayerLabel");

            ConfigureMainHudText(layout.goldLabel, new Vector2(-208, 571), new Vector2(100, 48));
            ConfigureMainHudText(layout.staminaLabel, new Vector2(268, 571), new Vector2(90, 48));
            SetRect(main, "StaminaRecoveryLabel", new Vector2(160, 32), new Vector2(245, 529));
        }

        private static void ApplyMainButton(Transform root, string nodeName, string resource, Vector2 size, Vector2 position)
        {
            var node = FindDeep(root, nodeName);
            if (node == null) return;
            node.gameObject.SetActive(true);
            SetSprite(root, nodeName, resource, size, position);
            HideLegacyText(node);
            var button = node.GetComponent<Button>();
            if (button != null)
            {
                var image = node.GetComponent<Image>();
                button.targetGraphic = image;
                button.transition = Selectable.Transition.None;
            }
        }

        private static void HideLegacyText(Transform root)
        {
            if (root == null) return;
            foreach (var text in root.GetComponentsInChildren<Text>(true))
                text.gameObject.SetActive(false);
        }

        private static void HideLegacyText(Transform root, string nodeName)
        {
            var node = FindDeep(root, nodeName);
            var text = node == null ? null : node.GetComponent<Text>();
            if (text != null) text.gameObject.SetActive(false);
        }

        private static void ConfigureMainHudText(Text text, Vector2 position, Vector2 size)
        {
            if (text == null) return;
            text.gameObject.SetActive(true);
            text.color = Color.white;
            text.fontSize = 30;
            text.fontStyle = FontStyle.Bold;
            text.alignment = TextAnchor.MiddleCenter;
            text.horizontalOverflow = HorizontalWrapMode.Overflow;
            text.verticalOverflow = VerticalWrapMode.Overflow;
            text.raycastTarget = false;
            text.rectTransform.sizeDelta = size;
            text.rectTransform.anchoredPosition = position;
        }

        private static void SetBackground(GameObject target, string resource)
        {
            if (target == null) return;
            var image = AddImage(target.transform, "FormalBackground", resource, Vector2.zero, Vector2.zero, 0);
            if (image == null) return;
            image.rectTransform.anchorMin = Vector2.zero;
            image.rectTransform.anchorMax = Vector2.one;
            image.rectTransform.offsetMin = Vector2.zero;
            image.rectTransform.offsetMax = Vector2.zero;
            image.preserveAspect = false;
            image.raycastTarget = false;
            image.gameObject.SetActive(true);
        }

        private static void SetSprite(Transform root, string nodeName, string resource, Vector2 size, Vector2 position)
        {
            var node = FindDeep(root, nodeName);
            if (node == null) return;
            var image = node.GetComponent<Image>();
            if (image == null) image = node.gameObject.AddComponent<Image>();
            image.sprite = Load(resource);
            image.color = Color.white;
            image.preserveAspect = true;
            var rect = node as RectTransform;
            if (rect != null)
            {
                rect.sizeDelta = size;
                rect.anchoredPosition = position;
            }
        }

        private static void SetSpriteKeepingPosition(Transform root, string nodeName, string resource, Vector2 size)
        {
            var node = FindDeep(root, nodeName);
            if (node == null) return;
            var image = node.GetComponent<Image>();
            if (image == null) image = node.gameObject.AddComponent<Image>();
            image.sprite = Load(resource);
            image.color = Color.white;
            image.preserveAspect = true;
            image.type = Image.Type.Simple;
            var rect = node as RectTransform;
            if (rect != null) rect.sizeDelta = size;
        }

        private static void SetInputSprite(Transform root, string nodeName, string resource, Vector2 size)
        {
            var node = FindDeep(root, nodeName);
            if (node == null) return;
            var image = node.GetComponent<Image>();
            if (image == null) image = node.gameObject.AddComponent<Image>();
            image.sprite = Load(resource);
            image.color = Color.white;
            image.preserveAspect = false;
            var rect = node as RectTransform;
            if (rect != null) rect.sizeDelta = size;
        }

        private static void SetRect(Transform root, string nodeName, Vector2 size, Vector2 position)
        {
            var rect = FindDeep(root, nodeName) as RectTransform;
            if (rect == null) return;
            rect.sizeDelta = size;
            rect.anchoredPosition = position;
        }

        private static void BringToFront(Transform root, string nodeName)
        {
            var node = FindDeep(root, nodeName);
            if (node != null) node.SetAsLastSibling();
        }

        private static void ApplyButton(Transform root, string nodeName, string resource)
        {
            var node = FindDeep(root, nodeName);
            if (node == null) return;
            var image = node.GetComponent<Image>();
            if (image == null) image = node.gameObject.AddComponent<Image>();
            image.sprite = Load(resource);
            image.color = Color.white;
            image.preserveAspect = true;
            image.type = Image.Type.Simple;
            var button = node.GetComponent<Button>();
            if (button != null)
            {
                button.targetGraphic = image;
                button.transition = Selectable.Transition.ColorTint;
            }
            var text = node.GetComponentInChildren<Text>(true);
            if (text != null) text.gameObject.SetActive(false);
        }

        private static void ApplyPanelText(GameObject panel, string nodeName, string value)
        {
            var text = FindDeep(panel == null ? null : panel.transform, nodeName)?.GetComponent<Text>();
            if (text != null) text.text = value;
        }

        private static Image AddImage(Transform parent, string name, string resource, Vector2 size, Vector2 position, int sibling)
        {
            if (parent == null) return null;
            var node = parent.Find(name);
            var created = false;
            if (node == null)
            {
                var go = new GameObject(name, typeof(RectTransform), typeof(Image));
                node = go.transform;
                node.SetParent(parent, false);
                created = true;
            }
            var rect = node as RectTransform;
            if (rect != null)
            {
                if (created || rect.sizeDelta == Vector2.zero)
                {
                    if (size != Vector2.zero) rect.sizeDelta = size;
                    rect.anchoredPosition = position;
                }
            }
            node.SetSiblingIndex(Mathf.Clamp(sibling, 0, parent.childCount - 1));
            var image = node.GetComponent<Image>();
            image.sprite = Load(resource);
            image.color = Color.white;
            return image;
        }

        private static Image AddSolidImage(Transform parent, string name, Color color, Vector2 size,
            Vector2 position, int sibling)
        {
            if (parent == null) return null;
            var node = parent.Find(name);
            if (node == null)
            {
                var go = new GameObject(name, typeof(RectTransform), typeof(Image));
                node = go.transform;
                node.SetParent(parent, false);
            }

            var rect = node as RectTransform;
            if (rect != null)
            {
                rect.anchorMin = new Vector2(0.5f, 0.5f);
                rect.anchorMax = new Vector2(0.5f, 0.5f);
                rect.sizeDelta = size;
                rect.anchoredPosition = position;
            }
            node.SetSiblingIndex(Mathf.Clamp(sibling, 0, parent.childCount - 1));
            node.gameObject.SetActive(true);
            var image = node.GetComponent<Image>();
            image.sprite = null;
            image.color = color;
            image.type = Image.Type.Simple;
            return image;
        }

        private static Sprite Load(string resource)
        {
            if (string.IsNullOrWhiteSpace(resource)) return null;
            var sprite = Resources.Load<Sprite>(Root + resource);
            if (sprite != null) return sprite;

            // Main-menu parity assets live in the original image/image2
            // folders, while the newer login/gameplay art lives under
            // NewImage. Support both resource layouts.
            if (resource.StartsWith("image/", System.StringComparison.Ordinal)
                || resource.StartsWith("image2/", System.StringComparison.Ordinal)
                || resource.StartsWith("AtlasPicture/", System.StringComparison.Ordinal))
                return Resources.Load<Sprite>("HysjLegacy/" + resource);
            if (resource.StartsWith(MainArtRoot, System.StringComparison.Ordinal))
                return Resources.Load<Sprite>("HysjLegacy/" + resource);
            if (resource.StartsWith(PopupArtRoot, System.StringComparison.Ordinal))
                return Resources.Load<Sprite>("HysjLegacy/" + resource);
            return null;
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
}
