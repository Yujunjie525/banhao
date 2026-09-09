using UnityEngine;
using UnityEngine.EventSystems;

namespace Hysj
{
    public sealed class GardenRepairCellInput : MonoBehaviour, IPointerDownHandler, IDragHandler, IPointerUpHandler
    {
        private GardenGameplayController controller;
        private int cellIndex;

        public void Initialize(GardenGameplayController owner, int index)
        {
            controller = owner;
            cellIndex = index;
        }

        public void OnPointerDown(PointerEventData eventData)
        {
            if (controller != null) controller.HandleRepairPointerDown(cellIndex);
        }

        public void OnDrag(PointerEventData eventData)
        {
            if (controller != null) controller.HandleRepairPointerDrag(eventData.position, eventData.pressEventCamera);
        }

        public void OnPointerUp(PointerEventData eventData)
        {
            if (controller != null) controller.HandleRepairPointerUp();
        }
    }
}
