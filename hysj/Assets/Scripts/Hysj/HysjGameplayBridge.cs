using System;

namespace Hysj
{
    public static class HysjGameplayBridge
    {
        public struct LaunchRequest
        {
            public int Level;
            public bool InfiniteMode;
            public int RoleIndex;
        }

        public static event Action<LaunchRequest> LaunchRequested;
        public static event Action<int, int, int, bool> ResultRecorded;

        public static LaunchRequest CurrentRequest { get; private set; }
        public static bool HasCurrentRequest { get; private set; }

        public static void Launch(int level, bool infiniteMode)
        {
            CurrentRequest = new LaunchRequest
            {
                Level = level,
                InfiniteMode = infiniteMode,
                RoleIndex = HysjDataService.Current.currentRole
            };
            HasCurrentRequest = true;
            LaunchRequested?.Invoke(CurrentRequest);
            if (!HysjSceneRouter.IsGameplayScene) HysjSceneRouter.LoadGameplay();
        }

        public static void ReportResult(int level, int stars, int distance, bool passed)
        {
            HysjDataService.RecordLevelResult(level, stars, distance, passed);
            if (passed)
                HysjCloudSaveSync.ReportLevelResult(level, stars);
            ResultRecorded?.Invoke(level, stars, distance, passed);
        }
    }
}
