using UnityEngine.SceneManagement;

namespace Hysj
{
    public static class HysjSceneRouter
    {
        public const string LoadScene = "HysjLoad";
        public const string MainScene = "HysjMain";
        public const string GameplayScene = "GardenGameplay";

        public enum LoadDestination { Automatic, Login, RealName }

        private static LoadDestination pendingLoadDestination;

        public static bool IsLoadScene => SceneManager.GetActiveScene().name == LoadScene;
        public static bool IsMainScene => SceneManager.GetActiveScene().name == MainScene;
        public static bool IsGameplayScene => SceneManager.GetActiveScene().name == GameplayScene;

        public static void LoadLogin() { pendingLoadDestination = LoadDestination.Login; Load(LoadScene); }
        public static void LoadRealName() { pendingLoadDestination = LoadDestination.RealName; Load(LoadScene); }
        public static void LoadMain() { pendingLoadDestination = LoadDestination.Automatic; Load(MainScene); }
        public static void LoadGameplay() => Load(GameplayScene);

        public static LoadDestination ConsumeLoadDestination()
        {
            var destination = pendingLoadDestination;
            pendingLoadDestination = LoadDestination.Automatic;
            return destination;
        }

        private static void Load(string sceneName)
        {
            if (SceneManager.GetActiveScene().name != sceneName)
                SceneManager.LoadScene(sceneName, LoadSceneMode.Single);
        }
    }
}
