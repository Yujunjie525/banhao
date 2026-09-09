using System;
using UnityEngine;
using UnityEngine.UI;

namespace Hysj
{
    /// <summary>One persistent Tips/TipsWnd instance shared by every scene.</summary>
    public sealed class HysjMessageUi : MonoBehaviour
    {
        private const string ResourcePath = "HysjCommonMessage";
        private const string AntiAddictionCompositionResource = "HysjLegacy/NewImage/\u6548\u679c\u56fe \u9632\u6c89\u8ff7\u63d0\u793a";
        private const string ConfirmButtonResource = "HysjLegacy/NewImage/anniuqueren";
        private static HysjMessageUi instance;

        public GameObject tips;
        public Text tipsLabel;
        public GameObject tipsWnd;
        public Text tipsWndLabel;
        public Button tipsWndConfirm;

        private Action noticeCloseAction;
        private Sprite confirmSprite;

        private void Awake()
        {
            if (instance != null && instance != this)
            {
                Destroy(gameObject);
                return;
            }

            instance = this;
            DontDestroyOnLoad(gameObject);
            if (tipsWndConfirm != null)
            {
                tipsWndConfirm.onClick.RemoveAllListeners();
                tipsWndConfirm.onClick.AddListener(CloseNoticeInternal);
            }
            ApplyFormalMessageSkin();
            SetActive(tips, false);
            SetActive(tipsWnd, false);
        }

        private void OnDestroy()
        {
            if (instance == this) instance = null;
        }

        public static void ShowTip(string message) => ShowTip(message, 1.3f);

        public static void ShowTip(string message, float seconds)
        {
            var ui = EnsureInstance();
            if (ui == null) return;
            ui.EnsureVisibleLayer();
            if (ui.tipsLabel != null) ui.tipsLabel.text = message ?? string.Empty;
            SetActive(ui.tips, true);
            ui.ResizeTipsToText();
            ui.CancelInvoke(nameof(HideTipInternal));
            ui.Invoke(nameof(HideTipInternal), Mathf.Max(0.1f, seconds));
        }

        public static void ShowNotice(string message, Action closed = null)
        {
            var ui = EnsureInstance();
            if (ui == null) return;
            ui.EnsureVisibleLayer();
            ui.noticeCloseAction = closed;
            if (ui.tipsWndLabel != null) ui.tipsWndLabel.text = message ?? string.Empty;
            ui.ApplyNoticeVisual(message);
            SetActive(ui.tipsWnd, true);
        }

        public static void CloseNotice()
        {
            if (instance != null) instance.CloseNoticeInternal();
        }

        private static HysjMessageUi EnsureInstance()
        {
            if (instance != null) return instance;
            var prefab = Resources.Load<GameObject>(ResourcePath);
            if (prefab == null)
            {
                Debug.LogError("Missing Resources/HysjCommonMessage prefab.");
                return null;
            }
            var created = Instantiate(prefab).GetComponent<HysjMessageUi>();
            if (created == null) Debug.LogError("HysjCommonMessage prefab is missing HysjMessageUi.");
            return created;
        }

        public static void EnsureLoaded() => EnsureInstance();

        private void EnsureVisibleLayer()
        {
            if (!gameObject.activeSelf) gameObject.SetActive(true);
            var canvas = GetComponentInChildren<Canvas>(true);
            if (canvas != null)
            {
                canvas.overrideSorting = true;
                canvas.sortingOrder = 1000;
            }
            transform.SetAsLastSibling();
        }

        private void HideTipInternal() => SetActive(tips, false);

        private void CloseNoticeInternal()
        {
            SetActive(tipsWnd, false);
            var action = noticeCloseAction;
            noticeCloseAction = null;
            action?.Invoke();
        }

        private void ResizeTipsToText()
        {
            if (tips == null || tipsLabel == null) return;
            var backgroundRect = tips.GetComponent<RectTransform>();
            var labelRect = tipsLabel.rectTransform;
            if (backgroundRect == null || labelRect == null) return;

            const float minWidth = 180f;
            const float maxWidth = 660f;
            const float horizontalPadding = 40f;
            const float singleLineHeight = 40f;
            const float verticalPadding = 12f;

            tipsLabel.horizontalOverflow = HorizontalWrapMode.Overflow;
            tipsLabel.verticalOverflow = VerticalWrapMode.Overflow;
            labelRect.sizeDelta = new Vector2(maxWidth, singleLineHeight);
            Canvas.ForceUpdateCanvases();
            var preferredWidth = Mathf.Max(1f, tipsLabel.preferredWidth);
            var desiredWidth = Mathf.Clamp(preferredWidth + horizontalPadding, minWidth, maxWidth);

            if (preferredWidth + horizontalPadding <= maxWidth)
            {
                labelRect.sizeDelta = new Vector2(desiredWidth - horizontalPadding, singleLineHeight - 8f);
                backgroundRect.sizeDelta = new Vector2(desiredWidth, singleLineHeight);
                return;
            }

            var labelWidth = maxWidth - horizontalPadding;
            tipsLabel.horizontalOverflow = HorizontalWrapMode.Wrap;
            labelRect.sizeDelta = new Vector2(labelWidth, 200f);
            Canvas.ForceUpdateCanvases();
            var height = Mathf.Clamp(tipsLabel.preferredHeight + verticalPadding, singleLineHeight, 140f);
            labelRect.sizeDelta = new Vector2(labelWidth, height - verticalPadding);
            backgroundRect.sizeDelta = new Vector2(maxWidth, height);
        }

        private void ApplyFormalMessageSkin()
        {
            var antiAddictionFrame = EnsureFullScreenImage(tipsWnd, "FormalAntiAddictionComposition", AntiAddictionCompositionResource);
            if (antiAddictionFrame != null) antiAddictionFrame.gameObject.SetActive(false);

            var noticeBackground = tipsWnd == null ? null : FindImage(tipsWnd.transform, "NoticeBackground");
            if (noticeBackground != null)
            {
                noticeBackground.enabled = true;
                noticeBackground.sprite = Resources.Load<Sprite>("HysjLegacy/NewImage/beijingdenglu");
                noticeBackground.color = Color.white;
                noticeBackground.preserveAspect = false;
                noticeBackground.type = Image.Type.Simple;
                noticeBackground.raycastTarget = false;
            }

            var noticeMask = tipsWnd == null ? null : FindImage(tipsWnd.transform, "NoticeMask");
            if (noticeMask != null)
            {
                noticeMask.enabled = true;
                noticeMask.sprite = null;
                noticeMask.color = new Color(0f, 0f, 0f, 0.49f);
                noticeMask.raycastTarget = true;
            }

            var noticeFrame = tipsWnd == null ? null : FindImage(tipsWnd.transform, "TipsWndFrame");
            if (noticeFrame != null)
            {
                noticeFrame.sprite = Resources.Load<Sprite>("HysjLegacy/NewImage/tanchuang4");
                noticeFrame.color = Color.white;
                noticeFrame.preserveAspect = true;
                var rect = noticeFrame.rectTransform;
                rect.sizeDelta = new Vector2(586, 478);
                rect.anchoredPosition = new Vector2(0, 20);
            }

            var titleBand = tipsWnd == null ? null : FindImage(tipsWnd.transform, "TitleBand");
            if (titleBand != null)
            {
                // tanchuang4 already contains the formal heart/title banner.
                titleBand.enabled = false;
                titleBand.sprite = null;
                titleBand.color = Color.clear;
                titleBand.raycastTarget = false;
            }

            var noticeTitle = tipsWnd == null ? null : FindTransform(tipsWnd.transform, "TipsWndTitle")?.GetComponent<Text>();
            if (noticeTitle != null)
            {
                noticeTitle.gameObject.SetActive(true);
                if (string.IsNullOrEmpty(noticeTitle.text)) noticeTitle.text = "防沉迷提示";
                noticeTitle.color = Color.white;
                noticeTitle.fontSize = 38;
                noticeTitle.fontStyle = FontStyle.Bold;
                noticeTitle.alignment = TextAnchor.MiddleCenter;
                noticeTitle.horizontalOverflow = HorizontalWrapMode.Overflow;
                noticeTitle.verticalOverflow = VerticalWrapMode.Overflow;
                noticeTitle.raycastTarget = false;
                var titleRect = noticeTitle.rectTransform;
                titleRect.sizeDelta = new Vector2(300, 64);
                titleRect.anchoredPosition = new Vector2(0, 157);
                var outline = noticeTitle.GetComponent<Outline>() ?? noticeTitle.gameObject.AddComponent<Outline>();
                outline.enabled = true;
                outline.effectColor = new Color32(117, 28, 55, 230);
                outline.effectDistance = new Vector2(2, -2);
                outline.useGraphicAlpha = true;
            }

            if (tipsWndLabel != null)
            {
                tipsWndLabel.gameObject.SetActive(true);
                tipsWndLabel.color = new Color32(184, 0, 43, 255);
                tipsWndLabel.fontStyle = FontStyle.Normal;
                tipsWndLabel.alignment = TextAnchor.UpperLeft;
                tipsWndLabel.horizontalOverflow = HorizontalWrapMode.Wrap;
                tipsWndLabel.verticalOverflow = VerticalWrapMode.Overflow;
                tipsWndLabel.lineSpacing = 1.5f;
                tipsWndLabel.raycastTarget = false;
                var labelRect = tipsWndLabel.rectTransform;
                labelRect.sizeDelta = new Vector2(470, 270);
                labelRect.anchoredPosition = new Vector2(0, -24);
                var labelOutline = tipsWndLabel.GetComponent<Outline>();
                if (labelOutline != null) labelOutline.enabled = false;
            }

            ApplyConfirmButtonVisual();

            var tipFrame = tips == null ? null : tips.GetComponent<Image>();
            if (tipFrame == null && tips != null) tipFrame = FindImage(tips.transform, "TipsBackground");
            if (tipFrame != null)
            {
                // Tips is the short message bar; the formal design uses a
                // plain black translucent background rather than a decorative
                // NewImage panel.
                tipFrame.enabled = true;
                tipFrame.sprite = null;
                tipFrame.color = new Color(0f, 0f, 0f, 0.74509805f);
                tipFrame.preserveAspect = false;
                tipFrame.type = Image.Type.Simple;
            }
        }

        // Called by the editor serializer so the anti-addiction composition
        // exists in the prefab before the first runtime notice is shown.
        public void ApplyFormalMessagePrefabUi()
        {
            ApplyFormalMessageSkin();
        }

        private void ApplyNoticeVisual(string message)
        {
            if (tipsWnd == null) return;
            var composition = FindImage(tipsWnd.transform, "FormalAntiAddictionComposition");
            // Keep the notice editable. The baked reference image remains in
            // the prefab for comparison, but is never used as the live UI.
            if (composition != null) composition.gameObject.SetActive(false);

            var frame = FindTransform(tipsWnd.transform, "TipsWndFrame");
            var titleBand = FindTransform(tipsWnd.transform, "TitleBand");
            if (frame != null)
            {
                foreach (var graphic in frame.GetComponentsInChildren<Graphic>(true))
                {
                    if (tipsWndConfirm != null && graphic.transform.IsChildOf(tipsWndConfirm.transform)) continue;
                    if (titleBand != null && (graphic.transform == titleBand || graphic.transform.IsChildOf(titleBand))) continue;
                    graphic.enabled = true;
                }
            }

            var titleBandImage = titleBand == null ? null : titleBand.GetComponent<Image>();
            if (titleBandImage != null) titleBandImage.enabled = false;

            var mask = tipsWnd.transform.Find("NoticeMask");
            if (mask != null)
            {
                var maskGraphic = mask.GetComponent<Graphic>();
                if (maskGraphic != null) maskGraphic.enabled = true;
            }
            if (tipsWndLabel != null) tipsWndLabel.gameObject.SetActive(true);

            ApplyConfirmButtonVisual();
        }

        private void ApplyConfirmButtonVisual()
        {
            if (tipsWndConfirm == null) return;
            tipsWndConfirm.gameObject.SetActive(true);

            var confirmImage = tipsWndConfirm.GetComponent<Image>();
            if (confirmImage == null) return;
            if (confirmSprite == null)
            {
                confirmSprite = Resources.Load<Sprite>(ConfirmButtonResource) ?? confirmImage.sprite;
            }

            confirmImage.enabled = true;
            confirmImage.sprite = confirmSprite;
            confirmImage.color = Color.white;
            confirmImage.preserveAspect = true;
            confirmImage.type = Image.Type.Simple;
            confirmImage.raycastTarget = true;
        }

        private static Image EnsureFullScreenImage(GameObject parent, string name, string resource)
        {
            if (parent == null) return null;
            var node = parent.transform.Find(name);
            if (node == null)
            {
                var go = new GameObject(name, typeof(RectTransform), typeof(Image));
                node = go.transform;
                node.SetParent(parent.transform, false);
            }
            var rect = node as RectTransform;
            if (rect != null)
            {
                rect.anchorMin = Vector2.zero;
                rect.anchorMax = Vector2.one;
                rect.offsetMin = Vector2.zero;
                rect.offsetMax = Vector2.zero;
                rect.pivot = new Vector2(.5f, .5f);
            }
            node.SetSiblingIndex(0);
            var image = node.GetComponent<Image>();
            image.sprite = Resources.Load<Sprite>(resource);
            image.color = Color.white;
            image.preserveAspect = false;
            image.type = Image.Type.Simple;
            image.raycastTarget = false;
            return image;
        }

        private static Image FindImage(Transform root, string name)
        {
            if (root == null) return null;
            if (root.name == name) return root.GetComponent<Image>();
            for (var i = 0; i < root.childCount; i++)
            {
                var found = FindImage(root.GetChild(i), name);
                if (found != null) return found;
            }
            return null;
        }

        private static Transform FindTransform(Transform root, string name)
        {
            if (root == null) return null;
            if (root.name == name) return root;
            for (var i = 0; i < root.childCount; i++)
            {
                var found = FindTransform(root.GetChild(i), name);
                if (found != null) return found;
            }
            return null;
        }

        private static void SetActive(GameObject target, bool value)
        {
            if (target != null) target.SetActive(value);
        }
    }
}
