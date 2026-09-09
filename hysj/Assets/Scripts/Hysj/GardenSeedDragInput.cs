using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace Hysj
{
    /// <summary>Routes seed and planted-cell drag gestures to the garden controller.</summary>
    public sealed class GardenSeedDragInput : MonoBehaviour, IPointerDownHandler, IBeginDragHandler, IDragHandler, IEndDragHandler, IPointerClickHandler
    {
        private enum DragMode
        {
            None,
            Seed,
            Plant,
            Scroll
        }

        private GardenGameplayController controller;
        private ScrollRect seedScroll;
        private RectTransform dragPreview;
        private Canvas rootCanvas;
        private int index = -1;
        private bool isPlant;
        private bool suppressClick;
        private DragMode dragMode;

        public void InitializeSeed(GardenGameplayController owner, int seed)
        {
            controller = owner;
            index = seed;
            isPlant = false;
            seedScroll = GetComponentInParent<ScrollRect>();
            dragMode = DragMode.None;
        }

        public void InitializePlant(GardenGameplayController owner, int cell)
        {
            controller = owner;
            index = cell;
            isPlant = true;
            seedScroll = null;
            dragMode = DragMode.None;
        }

        public void OnPointerDown(PointerEventData eventData)
        {
            suppressClick = false;
            dragMode = DragMode.None;
        }

        public void OnBeginDrag(PointerEventData eventData)
        {
            if (controller == null) return;
            if (isPlant)
            {
                dragMode = DragMode.Plant;
                controller.HandlePlantDragBegin(index);
                return;
            }

            seedScroll = seedScroll != null ? seedScroll : GetComponentInParent<ScrollRect>();
            var button = GetComponent<Button>();
            if (button != null && !button.IsInteractable())
            {
                if (seedScroll != null)
                {
                    dragMode = DragMode.Scroll;
                    suppressClick = true;
                    seedScroll.OnInitializePotentialDrag(eventData);
                    seedScroll.OnBeginDrag(eventData);
                }
                return;
            }
            if (seedScroll != null && Mathf.Abs(eventData.delta.x) > Mathf.Abs(eventData.delta.y))
            {
                dragMode = DragMode.Scroll;
                suppressClick = true;
                seedScroll.OnInitializePotentialDrag(eventData);
                seedScroll.OnBeginDrag(eventData);
                return;
            }

            dragMode = DragMode.Seed;
            if (!controller.HandleSeedDragBegin(index))
            {
                dragMode = DragMode.None;
                return;
            }
            CreateDragPreview(eventData);
        }

        public void OnDrag(PointerEventData eventData)
        {
            if (dragMode == DragMode.Scroll) seedScroll?.OnDrag(eventData);
            else if (dragMode == DragMode.Seed)
            {
                UpdateDragPreview(eventData.position, eventData.pressEventCamera);
                controller?.HandleSeedDrag(eventData.position, eventData.pressEventCamera);
            }
            else if (dragMode == DragMode.Plant) controller?.HandleSeedDrag(eventData.position, eventData.pressEventCamera);
        }

        public void OnEndDrag(PointerEventData eventData)
        {
            if (dragMode == DragMode.Scroll) seedScroll?.OnEndDrag(eventData);
            else if (dragMode == DragMode.Seed || dragMode == DragMode.Plant) controller?.HandleSeedDragEnd(eventData.position, eventData.pressEventCamera);
            DestroyDragPreview();
            dragMode = DragMode.None;
        }

        public void OnPointerClick(PointerEventData eventData)
        {
            if (!isPlant && !suppressClick) controller?.SelectSeed(index);
            suppressClick = false;
        }

        private void OnDisable()
        {
            DestroyDragPreview();
            dragMode = DragMode.None;
        }

        private void CreateDragPreview(PointerEventData eventData)
        {
            DestroyDragPreview();
            var sourceIcon = transform.Find("SeedIcon")?.GetComponent<Image>();
            rootCanvas = GetComponentInParent<Canvas>()?.rootCanvas;
            if (sourceIcon == null || rootCanvas == null) return;

            var preview = new GameObject("SeedDragPreview", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image), typeof(CanvasGroup));
            dragPreview = preview.GetComponent<RectTransform>();
            dragPreview.SetParent(rootCanvas.transform, false);
            dragPreview.anchorMin = dragPreview.anchorMax = new Vector2(.5f, .5f);
            dragPreview.pivot = new Vector2(.5f, .5f);
            dragPreview.sizeDelta = sourceIcon.rectTransform.rect.size;
            dragPreview.localScale = Vector3.one * 1.1f;
            dragPreview.SetAsLastSibling();

            var previewImage = preview.GetComponent<Image>();
            previewImage.sprite = sourceIcon.sprite;
            previewImage.color = sourceIcon.color;
            previewImage.material = sourceIcon.material;
            previewImage.type = sourceIcon.type;
            previewImage.preserveAspect = true;
            previewImage.raycastTarget = false;
            var group = preview.GetComponent<CanvasGroup>();
            group.alpha = .92f;
            group.blocksRaycasts = false;
            group.interactable = false;
            UpdateDragPreview(eventData.position, eventData.pressEventCamera);
        }

        private void UpdateDragPreview(Vector2 screenPosition, Camera eventCamera)
        {
            if (dragPreview == null || rootCanvas == null) return;
            var canvasRect = rootCanvas.transform as RectTransform;
            var camera = rootCanvas.renderMode == RenderMode.ScreenSpaceOverlay ? null : eventCamera != null ? eventCamera : rootCanvas.worldCamera;
            if (canvasRect != null && RectTransformUtility.ScreenPointToLocalPointInRectangle(canvasRect, screenPosition, camera, out var localPosition))
                dragPreview.anchoredPosition = localPosition;
        }

        private void DestroyDragPreview()
        {
            if (dragPreview != null) Destroy(dragPreview.gameObject);
            dragPreview = null;
            rootCanvas = null;
        }
    }
}
