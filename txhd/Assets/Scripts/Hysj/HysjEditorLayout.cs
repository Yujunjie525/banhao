using UnityEngine;
using UnityEngine.UI;

namespace Hysj
{
    // All base UI objects are serialized in HysjMain.unity. Runtime code only binds these references.
    public sealed class HysjEditorLayout : MonoBehaviour
    {
        [Header("Root screens")]
        public GameObject splashScreen;
        public GameObject loginScreen;
        public GameObject mainScreen;

        [Header("Login")]
        public InputField usernameInput;
        public InputField passwordInput;
        public Toggle agreementToggle;
        public Toggle loginRemoteToggle;
        public Toggle settingsRemoteToggle;
        public Button loginButton;
        public Button registerButton;
        public Button ageTipsButton;
        public GameObject ageTipsPanel;
        public Button ageTipsCloseButton;

        [Header("Main HUD")]
        public Text playerLabel;
        public Text goldLabel;
        public Text staminaLabel;
        public Text staminaRecoveryLabel;
        public Button staminaToggleButton;
        public Text progressLabel;
        public Button startButton;
        public Button infiniteButton;
        public Button levelSelectButton;
        public Button rankButton;
        public Button shopButton;
        public Button rechargeButton;
        public Button achievementsButton;
        public Button weeklyButton;
        public Button onlineButton;
        public Button settingsButton;
        public Button storyButton;

        [Header("Editor-authored module panels")]
        public GameObject levelSelectPanel;
        public GameObject rankPanel;
        public GameObject shopPanel;
        public GameObject rechargePanel;
        public GameObject achievementsPanel;
        public GameObject weeklyPanel;
        public GameObject onlinePanel;
        public GameObject settingsPanel;
        public GameObject storyPanel;
        public Text storyText;
        public Button storySkipButton;
        public GameObject realNamePanel;
        public GameObject gameplayPanel;

        [Header("Editable gameplay UI")]
        public GameObject gardenRuntime;
        public Text gardenTitle;
        public Text gardenStatus;
        public Text gardenMaturityCountdown;
        public Text gardenResource;
        public Button gardenPrimaryButton;
        public Button gardenPauseButton;
        public GameObject gardenPausePopup;
        public GameObject gardenWinPopup;
        public GameObject gardenLosePopup;
        public GameObject gardenRevivePopup;
        public GameObject gardenGameOverPopup;
        public GameObject gardenRepairSuccessPopup;
        public GameObject gardenRepairFailPopup;

        [Header("Editor-authored gameplay boards")]
        public int formalImageVersion;
        public int gardenBoardVersion;
        public GameObject gardenSharedHud;
        public GameObject gardenMainModeRoot;
        public Transform gardenMainGridRoot;
        public Button[] gardenMainCells;
        public Image[] gardenMainEntityIcons;
        public Image[] gardenMainMouseIcons;
        public Transform gardenSeedTrayRoot;
        public ScrollRect gardenSeedScroll;
        public RectTransform gardenSeedContent;
        public Image[] gardenSeedIcons;
        public Button[] gardenSeedButtons;
        public Sprite[] gardenPlantGrowthSprites;
        public Sprite[] gardenPlantBloomSprites;
        public Sprite[] gardenPlantResultSprites;
        public Sprite gardenMouseSprite;
        public Image gardenRoleAnimation;
        public GameObject gardenDeleteZone;
        public GameObject gardenTutorialGuideRoot;
        public Image gardenTutorialMask;
        public Image gardenTutorialBubble;
        public Text gardenTutorialText;
        public Image gardenTutorialFinger;
        public GameObject gardenTutorialSeedVisual;
        public GameObject gardenTutorialButtonVisual;
        public GameObject gardenRepairModeRoot;
        public Transform gardenRepairGridRoot;
        public Button[] gardenRepairCells;
        public GardenWaterFlowGraphic gardenRepairWaterFlow;
        public Sprite gardenRepairLandSprite;
        public Sprite gardenRepairSelectedLandSprite;
        public Sprite gardenRepairPoolSprite;
        public Sprite gardenRepairObstacleSprite;

        [Header("Panel controls")]
        public Button[] closeButtons;
        public Button realNameSubmitButton;
        public Button realNameCancelButton;
        public Button openRealNameButton;
        public Button settingsSyncDownloadButton;
        public Button settingsSyncUploadButton;
        public Button settingsLogoutButton;
        public Toggle musicToggle;
        public Toggle soundToggle;

        [Header("Editable list templates")]
        public Transform levelContent;
        public GameObject levelItemTemplate;
        public Transform rankContent;
        public GameObject rankItemTemplate;
        public Transform shopContent;
        public GameObject shopItemTemplate;
        public Transform rechargeContent;
        public GameObject rechargeItemTemplate;
        public Transform achievementContent;
        public GameObject achievementItemTemplate;
        public Text shopGoldLabel;
        public Text achievementGoldLabel;
        public Transform weeklyContent;
        public GameObject weeklyItemTemplate;
        public Transform onlineContent;
        public GameObject onlineItemTemplate;

        [Header("Popups")]
        public GameObject tips;
        public Text tipsLabel;
        public GameObject tipsWnd;
        public Text tipsWndLabel;
        public Button tipsWndConfirm;

        [Header("Dedicated Cocos confirmation panels")]
        public GameObject shopConfirmPanel;
        public Text shopConfirmLabel;
        public Button shopConfirmButton;
        public Button shopCancelButton;
        public GameObject rechargeConfirmPanel;
        public Text rechargeConfirmLabel;
        public Button rechargeConfirmButton;
        public Button rechargeCancelButton;

        [Header("Login and real-name fields")]
        public InputField realNameInput;
        public InputField idNumberInput;
        public Text realNameHint;

        public void SetAllPanelsInactive()
        {
            SetActive(splashScreen, false);
            SetActive(loginScreen, false);
            SetActive(mainScreen, false);
            SetActive(levelSelectPanel, false);
            SetActive(rankPanel, false);
            SetActive(shopPanel, false);
            SetActive(rechargePanel, false);
            SetActive(achievementsPanel, false);
            SetActive(weeklyPanel, false);
            SetActive(onlinePanel, false);
            SetActive(settingsPanel, false);
            SetActive(storyPanel, false);
            SetActive(realNamePanel, false);
            SetActive(gameplayPanel, false);
            SetActive(ageTipsPanel, false);
            SetActive(tips, false);
            SetActive(tipsWnd, false);
            SetActive(shopConfirmPanel, false);
            SetActive(rechargeConfirmPanel, false);
        }

        private static void SetActive(GameObject target, bool value)
        {
            if (target != null) target.SetActive(value);
        }
    }
}
