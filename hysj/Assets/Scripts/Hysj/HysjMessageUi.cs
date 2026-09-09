using System;
using UnityEngine;
using UnityEngine.UI;

namespace Hysj
{
    /// <summary>One persistent Tips/TipsWnd instance shared by every scene.</summary>
    public sealed class HysjMessageUi : MonoBehaviour
    {
        private const string ResourcePath = "HysjCommonMessage";
        private static HysjMessageUi instance;

        public GameObject tips;
        public Text tipsLabel;
        public GameObject tipsWnd;
        public Text tipsWndLabel;
        public Button tipsWndConfirm;

        private Action noticeCloseAction;

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

        private static void SetActive(GameObject target, bool value)
        {
            if (target != null) target.SetActive(value);
        }
    }
}
