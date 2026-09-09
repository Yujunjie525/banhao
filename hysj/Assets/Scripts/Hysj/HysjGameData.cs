using System;
using System.Collections.Generic;
using UnityEngine;

namespace Hysj
{
    [Serializable]
    public sealed class HeroTierState
    {
        public string heroId;
        public int tier;
    }

    [Serializable]
    public sealed class GardenRepairRunState
    {
        public string runId = string.Empty;
        public int seed;
        public string mapHash = string.Empty;
        public int solverVersion = 1;
        public int poolIndex = -1;
        public List<int> flowerIndices = new List<int>();
        public List<int> obstacleIndices = new List<int>();
        public List<int> solutionIndices = new List<int>();
        public bool completed;
        public bool rewardGranted;
    }

    [Serializable]
    public sealed class HysjSaveData
    {
        public int version = 1;
        public long updatedAt;
        public string username = string.Empty;
        public string userId = string.Empty;
        public bool realNameVerified;
        public bool realNameVerifiedByServer;
        public bool isAdult = true;
        public bool musicEnabled = true;
        public bool soundEnabled = true;
        public int currentGold;
        public int totalGoldEarned;
        public int shenpo;
        public List<HeroTierState> game2HeroTiers = new List<HeroTierState>();
        public string game2EquippedSkinId = "Skin_01";
        public int currentStamina = 20;
        public int maxStamina = 20;
        public long lastRecoverTime;
        public int totalConsumedStamina;
        public int bestDistance;
        public int bestScore;
        public int mainLevelsWon;
        public int mainMiceCaptured;
        public int mainBestActualValue;
        public int gardenRepairCompletedRuns;
        public GardenRepairRunState activeGardenRepairRun;
        public int currentLevel = 1;
        public int unlockedLevel = 1;
        public int currentRole;
        public bool[] unlockedRoles = { true, false, false, false, false };
        public int[] itemStock = { 0, 0, 0 };
        public int[] levelStars = new int[100];
        public List<int> failedLevels = new List<int>();
        public int warriorRunInfiniteGuideCompleted;
        public int warriorRunLevelGuideCompleted;
        public bool tutorialCompleted;
        public List<int> achievementClaims = new List<int>();
        public List<int> achieveClaimedList = new List<int>();
        public List<int> weeklyRewardClaims = new List<int>();
        public List<int> weeklyRewardClaimedList = new List<int>();
        public string weeklyRewardWeekStart = string.Empty;
        public List<int> onlineRewardClaims = new List<int>();
        public List<int> dailyRewardClaimedList = new List<int>();
        public string onlineRewardDate = string.Empty;
        public string dailyRewardDate = string.Empty;
        // Account lifetime online time, independent from the daily reward scope.
        public int totalOnlineMinutes;
        public int dailyOnlineMinutes;
        public bool storyPopupShown;
    }

    public static class HysjDataService
    {
        internal const string UsernameKey = "SLS_USERNAME";
        internal const string PasswordKey = "SLS_PASSWORD";
        internal const string RealNameKey = "SLS_REALNAME";
        internal const string UserIdKey = "SLS_USER_ID";
        internal const string AgeStatusKey = "SLS_AGE_STATUS";
        private const string LocalUsernamePrefix = "SLS_USERNAME_";
        private const string LocalPasswordPrefix = "SLS_PASSWORD_";
        private const string LegacyActiveUserKey = "HYSJ_ACTIVE_USER";
        private const string LegacyActivePasswordKey = "HYSJ_ACTIVE_PASSWORD";
        // Mirrors GameData.ts: StoryPopupShown is local and scoped per user.
        private const string StoryPopupShownKey = "StoryPopupShown";
        // Garden Notes restores one stamina point every fifteen minutes.
        private const int StaminaRecoverySeconds = 900;
        private static HysjSaveData _current;

        public static event Action Changed;
        public static HysjSaveData Current => _current ?? (_current = CreateDefaults());
        public static bool HasAccount
        {
            get
            {
                MigrateLegacyCredentials();
                return !string.IsNullOrWhiteSpace(PlayerPrefs.GetString(UsernameKey, string.Empty)) &&
                       !string.IsNullOrWhiteSpace(PlayerPrefs.GetString(PasswordKey, string.Empty));
            }
        }

        public static HysjSaveData LoginLocal(string username, string password)
        {
            if (string.IsNullOrWhiteSpace(username)) throw new ArgumentException("请输入账号");
            if (string.IsNullOrWhiteSpace(password)) throw new ArgumentException("请输入密码");

            var userId = StableUserId(username.Trim());
            PlayerPrefs.SetString(UsernameKey, username.Trim());
            PlayerPrefs.SetString(PasswordKey, password);
            PlayerPrefs.SetString(UserIdKey, userId);
            PlayerPrefs.SetString(LocalUsernamePrefix + userId, username.Trim());
            PlayerPrefs.SetString(LocalPasswordPrefix + userId, password);
            PlayerPrefs.SetString(RealNameKey, Current.realNameVerified ? "true" : "false");
            _current = Load(userId);
            _current.username = username.Trim();
            _current.userId = userId;
            Save(false);
            return _current;
        }

        public static void AdoptServerAccountId(string serverUserId, string username, string password)
        {
            if (string.IsNullOrWhiteSpace(serverUserId)) return;

            // LoginLocal initially loads the username-hash save so the login
            // form can proceed before GetLogin returns the server account ID.
            // That object belongs to the previous local identity, however, and
            // must never become the first save for a different server account.
            // Only resume data that is already scoped to this exact server ID;
            // otherwise start from a clean account default.
            HysjSaveData scopedData = null;
            if (PlayerPrefs.HasKey(SaveKey(serverUserId)))
            {
                var candidate = Load(serverUserId);
                if (string.IsNullOrWhiteSpace(candidate.username) ||
                    string.Equals(candidate.username, username, StringComparison.OrdinalIgnoreCase))
                    scopedData = candidate;
            }
            _current = scopedData ?? CreateDefaults();
            _current.userId = serverUserId;
            _current.username = username ?? string.Empty;
            PlayerPrefs.SetString(UsernameKey, _current.username);
            PlayerPrefs.SetString(PasswordKey, password ?? string.Empty);
            PlayerPrefs.SetString(UserIdKey, serverUserId);
            PlayerPrefs.SetString(LocalUsernamePrefix + serverUserId, _current.username);
            PlayerPrefs.SetString(LocalPasswordPrefix + serverUserId, password ?? string.Empty);
            Save(false);
        }

        public static bool IsStoryPopupShown()
        {
            var key = StoryPopupKey(Current.userId);
            if (PlayerPrefs.GetString(key, string.Empty) == "true") return true;
            if (!Current.storyPopupShown) return false;

            // Migrate the earlier Unity save field to Cocos' scoped key once.
            PlayerPrefs.SetString(key, "true");
            PlayerPrefs.Save();
            return true;
        }

        public static void SetStoryPopupShown()
        {
            PlayerPrefs.SetString(StoryPopupKey(Current.userId), "true");
            Current.storyPopupShown = true;
            Save();
        }

        public static bool RegisterLocal(string username, string password, out string message)
        {
            username = username == null ? string.Empty : username.Trim();
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                message = "请输入账号和密码";
                return false;
            }

            var userId = StableUserId(username);
            var passwordKey = LocalPasswordPrefix + userId;
            if (!string.IsNullOrEmpty(PlayerPrefs.GetString(passwordKey, string.Empty)))
            {
                message = "账号已存在，请直接登录";
                return false;
            }

            PlayerPrefs.SetString(passwordKey, password);
            PlayerPrefs.SetString(LocalUsernamePrefix + userId, username);
            PlayerPrefs.Save();
            message = "注册成功，请使用新账号登录";
            return true;
        }

        public static bool ValidateLocalLogin(string username, string password, out string message)
        {
            username = username == null ? string.Empty : username.Trim();
            var userId = StableUserId(username);
            var savedPassword = PlayerPrefs.GetString(LocalPasswordPrefix + userId, string.Empty);
            if (string.IsNullOrEmpty(savedPassword) || !string.Equals(savedPassword, password, StringComparison.Ordinal))
            {
                message = "账号或密码错误";
                return false;
            }

            LoginLocal(username, password);
            message = "本地模式登录成功";
            return true;
        }

        public static bool TryResumeAccount(out HysjSaveData data)
        {
            MigrateLegacyCredentials();
            var username = PlayerPrefs.GetString(UsernameKey, string.Empty);
            var password = PlayerPrefs.GetString(PasswordKey, string.Empty);
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                data = null;
                return false;
            }

            var userId = PlayerPrefs.GetString(UserIdKey, string.Empty);
            if (string.IsNullOrWhiteSpace(userId)) userId = StableUserId(username);
            _current = Load(userId);
            _current.username = username;
            data = _current;
            return true;
        }

        public static bool TryGetSavedCredentials(out string username, out string password)
        {
            username = string.Empty;
            password = string.Empty;
            HysjSaveData data;
            if (!TryResumeAccount(out data)) return false;
            username = data.username;
            password = PlayerPrefs.GetString(PasswordKey, PlayerPrefs.GetString(LocalPasswordPrefix + data.userId, string.Empty));
            return !string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password);
        }

        public static void Logout()
        {
            Save();
            PlayerPrefs.DeleteKey(UsernameKey);
            PlayerPrefs.DeleteKey(PasswordKey);
            PlayerPrefs.DeleteKey(UserIdKey);
            DeleteLegacyCredentials();
            _current = null;
            Changed?.Invoke();
        }

        public static void Save(bool updateTimestamp = true)
        {
            var data = Current;
            EnsureShape(data);
            if (updateTimestamp) data.updatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            PlayerPrefs.SetString(SaveKey(data.userId), JsonUtility.ToJson(data));
            PlayerPrefs.Save();
            Changed?.Invoke();
        }

        public static void ApplyRemote(HysjSaveData remote)
        {
            if (remote == null) return;
            var local = Current;
            var localUser = local.username;
            var localId = local.userId;
            var localIsAdult = local.isAdult;
            var localAgeStatus = PlayerPrefs.GetString(AgeStatusKey, string.Empty);
            var localRealNameVerified = local.realNameVerified;
            var localRealNameVerifiedByServer = local.realNameVerifiedByServer;
            var localStoryPopupShown = IsStoryPopupShown();
            var localAchievementClaims = new List<int>(local.achievementClaims ?? new List<int>());
            var localWeeklyClaims = new List<int>(local.weeklyRewardClaims ?? new List<int>());
            var localOnlineClaims = new List<int>(local.onlineRewardClaims ?? new List<int>());
            var localUnlockedRoles = local.unlockedRoles == null ? null : (bool[])local.unlockedRoles.Clone();
            var localWeeklyScope = local.weeklyRewardWeekStart;
            var localOnlineScope = local.onlineRewardDate;
            var localTotalOnlineMinutes = local.totalOnlineMinutes;
            var localTotalGoldEarned = local.totalGoldEarned;
            var localTotalConsumedStamina = local.totalConsumedStamina;
            var localUnlockedLevel = local.unlockedLevel;
            var localLevelStars = local.levelStars == null ? null : (int[])local.levelStars.Clone();
            var localOnlineMinutes = local.dailyOnlineMinutes;
            var localTutorialCompleted = local.tutorialCompleted;
            _current = remote;
            // GetUserData is requested for the current username. Do not let a
            // malformed/stale payload replace that identity with an account ID
            // or another user's name, otherwise the next Breathe call fails.
            _current.username = string.IsNullOrWhiteSpace(localUser) ||
                                string.IsNullOrWhiteSpace(remote.username) ||
                                string.Equals(remote.username, localUser, StringComparison.OrdinalIgnoreCase)
                ? (string.IsNullOrWhiteSpace(remote.username) ? localUser : remote.username)
                : localUser;
            _current.userId = string.IsNullOrWhiteSpace(remote.userId) ? localId : remote.userId;
            // GetLogin's age/real-name result is authoritative for this login;
            // older cloud JSON must not roll it back during initial sync.
            if (localAgeStatus == "1") _current.isAdult = true;
            else if (localAgeStatus == "0") _current.isAdult = false;
            else _current.isAdult = localIsAdult || _current.isAdult;
            _current.realNameVerified = localRealNameVerified || _current.realNameVerified;
            _current.realNameVerifiedByServer = localRealNameVerifiedByServer || _current.realNameVerifiedByServer;
            // Cocos' remote payload does not include StoryPopupShown. Keep the
            // per-user local value rather than treating an omitted JSON field as false.
            _current.storyPopupShown = localStoryPopupShown || _current.storyPopupShown;
            // Tutorial completion is an account-lifetime flag. An older cloud
            // payload must never make a completed account run the guide again.
            _current.tutorialCompleted = localTutorialCompleted || _current.tutorialCompleted;
            EnsureShape(_current);
            // Keep lifetime progress when the server payload is older or does
            // not yet contain this Unity-side cumulative field.
            _current.totalOnlineMinutes = Mathf.Max(_current.totalOnlineMinutes, localTotalOnlineMinutes);
            // Achievement counters are lifetime-local progress too. Do not let
            // an older or partial remote payload roll them back.
            _current.totalGoldEarned = Mathf.Max(_current.totalGoldEarned, localTotalGoldEarned);
            _current.totalConsumedStamina = Mathf.Max(_current.totalConsumedStamina, localTotalConsumedStamina);
            _current.unlockedLevel = Mathf.Max(_current.unlockedLevel, localUnlockedLevel);
            if (localLevelStars != null)
            {
                for (var i = 0; i < Mathf.Min(_current.levelStars.Length, localLevelStars.Length); i++)
                    _current.levelStars[i] = Mathf.Max(_current.levelStars[i], localLevelStars[i]);
            }
            _current.achievementClaims = MergeDistinct(_current.achievementClaims, localAchievementClaims);
            if (_current.weeklyRewardWeekStart == localWeeklyScope)
                _current.weeklyRewardClaims = MergeDistinct(_current.weeklyRewardClaims, localWeeklyClaims);
            if (_current.onlineRewardDate == localOnlineScope)
            {
                _current.onlineRewardClaims = MergeDistinct(_current.onlineRewardClaims, localOnlineClaims);
                _current.dailyOnlineMinutes = Mathf.Max(_current.dailyOnlineMinutes, localOnlineMinutes);
            }
            if (localUnlockedRoles != null)
            {
                for (var i = 0; i < Mathf.Min(_current.unlockedRoles.Length, localUnlockedRoles.Length); i++)
                    _current.unlockedRoles[i] = _current.unlockedRoles[i] || localUnlockedRoles[i];
            }
            Save(false);
        }

        public static void AddGold(int amount)
        {
            if (amount <= 0) return;
            Current.currentGold += amount;
            Current.totalGoldEarned += amount;
            Save();
        }

        public static bool CompleteGardenTutorial()
        {
            if (Current.tutorialCompleted) return false;
            Current.tutorialCompleted = true;
            Save();
            return true;
        }

        public static bool SpendGold(int amount)
        {
            if (amount < 0 || Current.currentGold < amount) return false;
            Current.currentGold -= amount;
            Save();
            return true;
        }

        public static bool ConsumeStamina(int amount = 1)
        {
            RecoverStamina();
            if (amount <= 0 || Current.currentStamina < amount) return false;
            Current.currentStamina -= amount;
            Current.totalConsumedStamina += amount;
            if (Current.lastRecoverTime <= 0) Current.lastRecoverTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            Save();
            return true;
        }

        public static bool CanEnterGardenRepair()
        {
            RecoverStamina();
            return Current.currentStamina > 0;
        }

        public static bool TryStartGardenRepairRun(GardenRepairRunState run, out string message)
        {
            message = string.Empty;
            if (run == null || string.IsNullOrWhiteSpace(run.runId))
            {
                message = "地图生成失败，请重新进入荒园修复。";
                return false;
            }

            RecoverStamina();
            var data = Current;
            if (data.currentStamina < 1)
            {
                message = "体力不足，无法开始荒园修复。";
                return false;
            }

            data.currentStamina--;
            data.totalConsumedStamina++;
            if (data.lastRecoverTime <= 0) data.lastRecoverTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            // Starting from the main menu always replaces any abandoned repair run.
            data.activeGardenRepairRun = run;
            Save();
            return true;
        }

        public static bool TryRetryGardenRepair(out string message)
        {
            message = string.Empty;
            RecoverStamina();
            var data = Current;
            if (data.activeGardenRepairRun == null || data.activeGardenRepairRun.completed)
            {
                message = "当前没有可以重试的荒园地图。";
                return false;
            }
            if (data.currentStamina < 1)
            {
                message = "体力不足，无法重试。";
                return false;
            }

            data.currentStamina--;
            data.totalConsumedStamina++;
            if (data.lastRecoverTime <= 0) data.lastRecoverTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            Save();
            return true;
        }

        public static bool CompleteGardenRepairRun(string runId, int rewardGold)
        {
            var data = Current;
            var run = data.activeGardenRepairRun;
            if (run == null || !string.Equals(run.runId, runId, StringComparison.Ordinal)) return false;
            if (run.completed && run.rewardGranted) return true;
            if (!run.completed)
            {
                run.completed = true;
                data.gardenRepairCompletedRuns++;
            }
            if (!run.rewardGranted)
            {
                var reward = Mathf.Max(0, rewardGold);
                data.currentGold += reward;
                data.totalGoldEarned += reward;
                run.rewardGranted = true;
            }
            Save();
            return true;
        }

        public static void AbandonGardenRepairRun()
        {
            if (Current.activeGardenRepairRun == null) return;
            Current.activeGardenRepairRun = null;
            Save();
        }

        public static void DiscardInvalidGardenRepairRun()
        {
            var data = Current;
            if (data.activeGardenRepairRun == null) return;
            data.activeGardenRepairRun = null;
            data.currentStamina = Mathf.Min(data.maxStamina, data.currentStamina + 1);
            data.totalConsumedStamina = Mathf.Max(0, data.totalConsumedStamina - 1);
            Save();
        }

        public static void RecoverStamina()
        {
            var data = Current;
            var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            if (data.lastRecoverTime <= 0) data.lastRecoverTime = now;
            if (data.currentStamina >= data.maxStamina)
            {
                data.currentStamina = data.maxStamina;
                data.lastRecoverTime = now;
                return;
            }

            var recovered = (int)((now - data.lastRecoverTime) / StaminaRecoverySeconds);
            if (recovered <= 0) return;
            data.currentStamina = Mathf.Min(data.maxStamina, data.currentStamina + recovered);
            data.lastRecoverTime += recovered * StaminaRecoverySeconds;
            Save();
        }

        public static TimeSpan TimeUntilNextStamina()
        {
            if (Current.currentStamina >= Current.maxStamina) return TimeSpan.Zero;
            var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var remaining = StaminaRecoverySeconds - Math.Max(0, now - Current.lastRecoverTime);
            return TimeSpan.FromSeconds(Math.Max(0, remaining));
        }

        public static bool ResetAccountForLogin()
        {
            if (!HasAccount) return false;
            var data = Current;
            data.realNameVerified = false;
            data.realNameVerifiedByServer = false;
            PlayerPrefs.SetString(RealNameKey, "false");
            Save();
            PlayerPrefs.DeleteKey(UsernameKey);
            PlayerPrefs.DeleteKey(PasswordKey);
            PlayerPrefs.DeleteKey(UserIdKey);
            DeleteLegacyCredentials();
            _current = null;
            Changed?.Invoke();
            return true;
        }

        public static void ClearCredentialsForAntiAddiction()
        {
            PlayerPrefs.DeleteKey(UsernameKey);
            PlayerPrefs.DeleteKey(PasswordKey);
            PlayerPrefs.DeleteKey(UserIdKey);
            DeleteLegacyCredentials();
            _current = null;
            Changed?.Invoke();
        }

        public static void ClearCredentialsForMainAntiAddiction()
        {
            PlayerPrefs.DeleteKey(UsernameKey);
            PlayerPrefs.DeleteKey(PasswordKey);
            DeleteLegacyCredentials();
            _current = null;
            Changed?.Invoke();
        }

        public static void RecordLevelResult(int level, int stars, int distance, bool passed)
        {
            level = Mathf.Clamp(level, 1, 100);
            stars = Mathf.Clamp(stars, 0, 3);
            Current.currentLevel = level;
            Current.bestDistance = Mathf.Max(Current.bestDistance, distance);
            Current.bestScore = Mathf.Max(Current.bestScore, distance);
            Current.levelStars[level - 1] = Mathf.Max(Current.levelStars[level - 1], stars);
            if (passed)
            {
                Current.unlockedLevel = Mathf.Max(Current.unlockedLevel, Mathf.Min(100, level + 1));
                Current.failedLevels.Remove(level);
            }
            else if (!Current.failedLevels.Contains(level))
            {
                Current.failedLevels.Add(level);
            }
            Save();
        }

        public static void RecordMainCapture()
        {
            Current.mainMiceCaptured++;
            Save();
        }

        public static void RecordMainWin(int actualValue)
        {
            Current.mainLevelsWon++;
            Current.mainBestActualValue = Mathf.Max(Current.mainBestActualValue, actualValue);
            Save();
        }

        public static void RecordRepairWin()
        {
            Current.gardenRepairCompletedRuns++;
            Save();
        }

        public static void AddOnlineMinute()
        {
            RefreshDailyScope();
            Current.totalOnlineMinutes++;
            Current.dailyOnlineMinutes++;
            Save();
        }

        public static void RefreshRewardScopes()
        {
            RefreshDailyScope();
            var weekStart = StartOfWeek(DateTime.Now).ToString("yyyy-MM-dd");
            if (Current.weeklyRewardWeekStart == weekStart) return;
            Current.weeklyRewardWeekStart = weekStart;
            Current.weeklyRewardClaims.Clear();
            Current.weeklyRewardClaimedList.Clear();
            Save();
        }

        private static void RefreshDailyScope()
        {
            var today = DateTime.Now.ToString("yyyy-MM-dd");
            if (Current.onlineRewardDate == today) return;
            Current.onlineRewardDate = today;
            Current.dailyRewardDate = today;
            Current.dailyOnlineMinutes = 0;
            Current.onlineRewardClaims.Clear();
            Current.dailyRewardClaimedList.Clear();
            Save();
        }

        private static HysjSaveData Load(string userId)
        {
            var json = PlayerPrefs.GetString(SaveKey(userId), string.Empty);
            HysjSaveData data = null;
            if (!string.IsNullOrWhiteSpace(json))
            {
                try { data = JsonUtility.FromJson<HysjSaveData>(json); }
                catch (Exception exception) { Debug.LogWarning("Invalid local save: " + exception.Message); }
            }
            data = data ?? CreateDefaults();
            data.userId = userId;
            data.username = PlayerPrefs.GetString(LocalUsernamePrefix + userId,
                PlayerPrefs.GetString(UsernameKey, data.username));
            EnsureShape(data);
            return data;
        }

        private static void MigrateLegacyCredentials()
        {
            if (!string.IsNullOrWhiteSpace(PlayerPrefs.GetString(UsernameKey, string.Empty))) return;

            var legacyUserId = PlayerPrefs.GetString(LegacyActiveUserKey, string.Empty);
            var legacyUsername = string.IsNullOrWhiteSpace(legacyUserId)
                ? string.Empty
                : PlayerPrefs.GetString(LocalUsernamePrefix + legacyUserId,
                    PlayerPrefs.GetString("HYSJ_USERNAME_" + legacyUserId, string.Empty));
            var legacyPassword = PlayerPrefs.GetString(LegacyActivePasswordKey, string.Empty);
            if (string.IsNullOrWhiteSpace(legacyPassword) && !string.IsNullOrWhiteSpace(legacyUserId))
                legacyPassword = PlayerPrefs.GetString("HYSJ_PASSWORD_" + legacyUserId, string.Empty);
            if (string.IsNullOrWhiteSpace(legacyUsername) || string.IsNullOrWhiteSpace(legacyPassword)) return;

            PlayerPrefs.SetString(UsernameKey, legacyUsername);
            PlayerPrefs.SetString(PasswordKey, legacyPassword);
            if (!string.IsNullOrWhiteSpace(legacyUserId))
            {
                PlayerPrefs.SetString(UserIdKey, legacyUserId);
                PlayerPrefs.SetString(LocalUsernamePrefix + legacyUserId, legacyUsername);
                PlayerPrefs.SetString(LocalPasswordPrefix + legacyUserId, legacyPassword);
            }
            DeleteLegacyCredentials(legacyUserId);
            PlayerPrefs.Save();
        }

        private static void DeleteLegacyCredentials(string legacyUserId = null)
        {
            if (string.IsNullOrWhiteSpace(legacyUserId))
                legacyUserId = PlayerPrefs.GetString(LegacyActiveUserKey, string.Empty);
            PlayerPrefs.DeleteKey(LegacyActiveUserKey);
            PlayerPrefs.DeleteKey(LegacyActivePasswordKey);
            if (string.IsNullOrWhiteSpace(legacyUserId)) return;
            PlayerPrefs.DeleteKey("HYSJ_USERNAME_" + legacyUserId);
            PlayerPrefs.DeleteKey("HYSJ_PASSWORD_" + legacyUserId);
        }

        private static HysjSaveData CreateDefaults()
        {
            var data = new HysjSaveData { lastRecoverTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds() };
            return data;
        }

        private static void EnsureShape(HysjSaveData data)
        {
            if (data.unlockedRoles == null || data.unlockedRoles.Length != 5) data.unlockedRoles = new[] { true, false, false, false, false };
            if (data.itemStock == null || data.itemStock.Length != 3) data.itemStock = new int[3];
            if (data.levelStars == null || data.levelStars.Length != 100)
            {
                var old = data.levelStars;
                data.levelStars = new int[100];
                if (old != null) Array.Copy(old, data.levelStars, Math.Min(old.Length, data.levelStars.Length));
            }
            data.failedLevels = data.failedLevels ?? new List<int>();
            data.game2HeroTiers = data.game2HeroTiers ?? new List<HeroTierState>();
            data.achievementClaims = MergeDistinct(data.achievementClaims, data.achieveClaimedList);
            data.achieveClaimedList = new List<int>(data.achievementClaims);
            data.weeklyRewardClaims = MergeDistinct(data.weeklyRewardClaims, data.weeklyRewardClaimedList);
            data.weeklyRewardClaimedList = new List<int>(data.weeklyRewardClaims);
            data.onlineRewardClaims = MergeDistinct(data.onlineRewardClaims, data.dailyRewardClaimedList);
            data.dailyRewardClaimedList = new List<int>(data.onlineRewardClaims);
            if (string.IsNullOrWhiteSpace(data.onlineRewardDate)) data.onlineRewardDate = data.dailyRewardDate ?? string.Empty;
            data.dailyRewardDate = data.onlineRewardDate ?? string.Empty;
            if (data.activeGardenRepairRun != null)
            {
                data.activeGardenRepairRun.flowerIndices = data.activeGardenRepairRun.flowerIndices ?? new List<int>();
                data.activeGardenRepairRun.obstacleIndices = data.activeGardenRepairRun.obstacleIndices ?? new List<int>();
                data.activeGardenRepairRun.solutionIndices = data.activeGardenRepairRun.solutionIndices ?? new List<int>();
            }
            // The design fixes the stamina cap at 20. Upgrade older saves that
            // still carry the former lower cap before clamping the current value.
            data.maxStamina = 20;
            data.currentStamina = Mathf.Clamp(data.currentStamina, 0, data.maxStamina);
            data.totalOnlineMinutes = Mathf.Max(0, data.totalOnlineMinutes);
            data.dailyOnlineMinutes = Mathf.Max(0, data.dailyOnlineMinutes);
            data.unlockedLevel = Mathf.Clamp(data.unlockedLevel, 1, 100);
            data.currentRole = Mathf.Clamp(data.currentRole, 0, data.unlockedRoles.Length - 1);
            // GameData.ts initializes a missing cumulative diamond counter from
            // the account's current balance so migrated accounts keep progress.
            if (data.totalGoldEarned <= 0 && data.currentGold > 0) data.totalGoldEarned = data.currentGold;
        }

        private static List<int> MergeDistinct(List<int> primary, List<int> compatibility)
        {
            var merged = primary ?? new List<int>();
            if (compatibility == null) return merged;
            foreach (var value in compatibility)
                if (!merged.Contains(value)) merged.Add(value);
            return merged;
        }

        private static string SaveKey(string userId) => "HYSJ_SAVE_" + (string.IsNullOrWhiteSpace(userId) ? "GUEST" : userId);

        private static string StoryPopupKey(string userId) => StoryPopupShownKey + "_" + (string.IsNullOrWhiteSpace(userId) ? "GUEST" : userId);

        private static string StableUserId(string username)
        {
            unchecked
            {
                uint hash = 2166136261;
                foreach (var c in username) hash = (hash ^ c) * 16777619;
                return hash.ToString("X8");
            }
        }

        private static DateTime StartOfWeek(DateTime date)
        {
            var diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
            return date.Date.AddDays(-diff);
        }

    }
}
