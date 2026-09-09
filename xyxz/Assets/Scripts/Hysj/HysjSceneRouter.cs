using UnityEngine;
using UnityEngine.SceneManagement;

namespace Hysj
{
    public static class HysjSceneRouter
    {
        public const string LoadScene = "HysjLoad";
        public const string MainScene = "HysjMain";
        public const string Match3Scene = "WishTownMatch3";
        public const string BlocksScene = "WishTownBlocks";

        public enum LoadDestination { Automatic, Login, RealName }

        private static LoadDestination pendingLoadDestination;
        private static int pendingMatch3Level = 1;
        public static bool IsLoadScene => SceneManager.GetActiveScene().name == LoadScene;
        public static bool IsMainScene => SceneManager.GetActiveScene().name == MainScene;
        public static bool IsMatch3Scene => SceneManager.GetActiveScene().name == Match3Scene;
        public static bool IsBlocksScene => SceneManager.GetActiveScene().name == BlocksScene;

        public static void LoadLogin() { pendingLoadDestination = LoadDestination.Login; Load(LoadScene); }
        public static void LoadRealName() { pendingLoadDestination = LoadDestination.RealName; Load(LoadScene); }
        public static void LoadMain() { pendingLoadDestination = LoadDestination.Automatic; Load(MainScene); }
        public static bool LoadMatch3(int level)
        {
            // Every new main-mode entry (including retry and next level) costs
            // one stamina. Charge before changing scenes so a failed entry does
            // not consume anything and the menu HUD remains authoritative.
            if (!HysjDataService.ConsumeStamina()) return false;
            pendingMatch3Level = Mathf.Max(1, level);
            Load(Match3Scene, true);
            return true;
        }

        public static int ConsumeMatch3Level()
        {
            var level = pendingMatch3Level;
            pendingMatch3Level = 1;
            return level;
        }

        public static bool LoadBlocks()
        {
            var config = WishTownConfigService.GetSideMode();
            var staminaCost = config == null ? 1 : Mathf.Max(1, config.stamina_cost);
            if (!HysjDataService.ConsumeStamina(staminaCost)) return false;
            Load(BlocksScene, true);
            return true;
        }

        public static LoadDestination ConsumeLoadDestination()
        {
            var destination = pendingLoadDestination;
            pendingLoadDestination = LoadDestination.Automatic;
            return destination;
        }

        private static void Load(string sceneName, bool forceReload = false)
        {
            if (forceReload || SceneManager.GetActiveScene().name != sceneName)
                SceneManager.LoadScene(sceneName, LoadSceneMode.Single);
        }
    }
}
