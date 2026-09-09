using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using UnityEngine;

namespace Hysj
{
    [Serializable]
    public sealed class SkillState
    {
        public int id;
        public string name;
        public int level = 1;
        public int maxLevel = 10;
        public string description;
        public int baseEffect;
        public int effectPerLevel;
        public int upgradeCost;
        public int costIncreasePerLevel;

        public int CurrentEffect => baseEffect + (level - 1) * effectPerLevel;
        public int NextCost => upgradeCost + Mathf.Max(0, level - 1) * costIncreasePerLevel;
    }

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
    }

    [Serializable]
    public sealed class WishTownMatchSaveState
    {
        public bool active;
        public int level = 1;
        public int score;
        public float remainingTime;
        public int[] board;
        public string settlementId = string.Empty;
    }

    [Serializable]
    public sealed class WishTownBlocksSaveState
    {
        public bool active;
        public int score;
        public int clearedLines;
        public int combo;
        public int speedLevel = 1;
        public int highestSpeedLevel = 1;
        public int currentPiece;
        public int rotation;
        public int currentX;
        public int currentY;
        public int[] board;
        public List<int> pieceBag = new List<int>();
        public string settlementId = string.Empty;
    }

    [Serializable]
    public sealed class HysjSaveData
    {
        public int version = 1;
        [NonSerialized] public long updatedAt;
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
        [NonSerialized] public long lastRecoverTime;
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
        public int[] levelStars = new int[0];
        public List<int> failedLevels = new List<int>();
        public int warriorRunInfiniteGuideCompleted;
        public int warriorRunLevelGuideCompleted;
        public int tutorialStep;
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
        public List<SkillState> skills = new List<SkillState>();
        public bool storyPopupShown;
        public int[] wishTownBuildingProgress = new int[5];
        public WishTownMatchSaveState activeWishTownMatch;
        public WishTownBlocksSaveState activeWishTownBlocks;
        public int wishTownBlocksHighScore;
        public int wishTownBlocksHighestSpeed;
        public int wishTownBlocksTodayMaterial;
        public string wishTownBlocksMaterialDate = string.Empty;
        public List<string> wishTownSettlementIds = new List<string>();
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
        // Wish Town restores one stamina point every ten minutes, up to the
        // configured formal stamina cap.
        private static int StaminaRecoverySeconds
        {
            get
            {
                var config = WishTownConfigService.GetGlobalConfig();
                return config == null ? 600 : Mathf.Max(60, config.stamina_recovery_minutes * 60);
            }
        }
        private const string SaveEncryptionPrefix = "HYSJ1:";
        private const string SaveEncryptionSecret = "WishTown.LocalSave.2026";
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
            // Keep local storage identical to hysj. The encrypted reader below
            // remains only for one-time migration of older xyxz saves.
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
            var localWishTownBuildings = local.wishTownBuildingProgress == null ? null : (int[])local.wishTownBuildingProgress.Clone();
            var localWishTownHighScore = local.wishTownBlocksHighScore;
            var localWishTownHighestSpeed = local.wishTownBlocksHighestSpeed;
            var localWishTownTodayMaterial = local.wishTownBlocksTodayMaterial;
            var localWishTownMaterialDate = local.wishTownBlocksMaterialDate;
            var localWishTownSettlements = local.wishTownSettlementIds == null ? new List<string>() : new List<string>(local.wishTownSettlementIds);
            var localWishTownMatch = local.activeWishTownMatch;
            var localWishTownBlocks = local.activeWishTownBlocks;
            var localUpdatedAt = local.updatedAt;
            var localOnlineMinutes = local.dailyOnlineMinutes;
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
            EnsureShape(_current);
            // Active runs are crash-recovery checkpoints. Keep a newer local
            // checkpoint when a cloud response is partial or older.
            if (localWishTownMatch != null && (remote.activeWishTownMatch == null || localUpdatedAt >= remote.updatedAt))
                _current.activeWishTownMatch = localWishTownMatch;
            if (localWishTownBlocks != null && (remote.activeWishTownBlocks == null || localUpdatedAt >= remote.updatedAt))
                _current.activeWishTownBlocks = localWishTownBlocks;
            // Keep lifetime progress when the server payload is older or does
            // not yet contain this Unity-side cumulative field.
            _current.totalOnlineMinutes = Mathf.Max(_current.totalOnlineMinutes, localTotalOnlineMinutes);
            // Achievement counters are lifetime-local progress too. Do not let
            // an older or partial remote payload roll them back.
            _current.totalGoldEarned = Mathf.Max(_current.totalGoldEarned, localTotalGoldEarned);
            _current.totalConsumedStamina = Mathf.Max(_current.totalConsumedStamina, localTotalConsumedStamina);
            _current.unlockedLevel = Mathf.Max(_current.unlockedLevel, localUnlockedLevel);
            EnsureShape(_current);
            if (localWishTownBuildings != null)
                for (var i = 0; i < Mathf.Min(localWishTownBuildings.Length, _current.wishTownBuildingProgress.Length); i++) _current.wishTownBuildingProgress[i] = Mathf.Max(_current.wishTownBuildingProgress[i], localWishTownBuildings[i]);
            _current.wishTownBlocksHighScore = Mathf.Max(_current.wishTownBlocksHighScore, localWishTownHighScore);
            _current.wishTownBlocksHighestSpeed = Mathf.Max(_current.wishTownBlocksHighestSpeed, localWishTownHighestSpeed);
            if (string.Equals(_current.wishTownBlocksMaterialDate, localWishTownMaterialDate, StringComparison.Ordinal))
                _current.wishTownBlocksTodayMaterial = Mathf.Max(
                    _current.wishTownBlocksTodayMaterial,
                    localWishTownTodayMaterial);
            else if (!string.IsNullOrWhiteSpace(localWishTownMaterialDate)
                     && string.IsNullOrWhiteSpace(_current.wishTownBlocksMaterialDate))
            {
                _current.wishTownBlocksMaterialDate = localWishTownMaterialDate;
                _current.wishTownBlocksTodayMaterial = localWishTownTodayMaterial;
            }
            _current.wishTownSettlementIds = MergeDistinct(_current.wishTownSettlementIds, localWishTownSettlements);
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

        public static bool CompleteGardenRepairRun(string runId)
        {
            var data = Current;
            var run = data.activeGardenRepairRun;
            if (run == null || !string.Equals(run.runId, runId, StringComparison.Ordinal)) return false;
            if (run.completed) return true;
            run.completed = true;
            data.gardenRepairCompletedRuns++;
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
            level = Mathf.Clamp(level, 1, WishTownConfigService.MaxLevel);
            stars = Mathf.Clamp(stars, 0, 3);
            Current.currentLevel = level;
            Current.bestDistance = Mathf.Max(Current.bestDistance, distance);
            Current.bestScore = Mathf.Max(Current.bestScore, distance);
            Current.levelStars[level - 1] = Mathf.Max(Current.levelStars[level - 1], stars);
            if (passed)
            {
                Current.unlockedLevel = Mathf.Max(Current.unlockedLevel, Mathf.Min(WishTownConfigService.MaxLevel, level + 1));
                Current.currentLevel = Mathf.Min(WishTownConfigService.MaxLevel, level + 1);
                Current.failedLevels.Remove(level);
            }
            else if (!Current.failedLevels.Contains(level))
            {
                Current.failedLevels.Add(level);
            }
            Save();
        }

        public static bool TryClaimWishTownSettlement(string settlementId, int materials, int diamonds)
        {
            if (string.IsNullOrWhiteSpace(settlementId)) return false;
            EnsureShape(Current);
            if (Current.wishTownSettlementIds.Contains(settlementId)) return false;
            Current.wishTownSettlementIds.Add(settlementId);
            var materialSlot = GetWishTownMaterialSlot();
            if (materialSlot >= 0 && materialSlot < Current.itemStock.Length)
            {
                var materialMax = WishTownConfigService.GetItemMaxStack("I001", 99999);
                Current.itemStock[materialSlot] = Mathf.Min(materialMax,
                    Mathf.Max(0, Current.itemStock[materialSlot]) + Mathf.Max(0, materials));
            }
            if (diamonds > 0)
            {
                Current.currentGold += diamonds;
                Current.totalGoldEarned += diamonds;
            }
            Save();
            return true;
        }

        public static int GetWishTownMaterialCount()
        {
            EnsureShape(Current);
            var slot = GetWishTownMaterialSlot();
            return slot >= 0 && slot < Current.itemStock.Length ? Current.itemStock[slot] : 0;
        }

        public static int GetWishTownBlocksTodayMaterial()
        {
            EnsureShape(Current);
            RefreshWishTownBlocksDailyScope();
            return Mathf.Max(0, Current.wishTownBlocksTodayMaterial);
        }

        public static void RecordWishTownBlocksMaterial(int amount)
        {
            if (amount <= 0) return;
            EnsureShape(Current);
            RefreshWishTownBlocksDailyScope();
            Current.wishTownBlocksTodayMaterial += amount;
            Save();
        }

        public static void DiscardWishTownMatch()
        {
            EnsureShape(Current);
            Current.activeWishTownMatch = null;
            Save();
        }

        private static int GetWishTownMaterialSlot()
        {
            var slot = WishTownConfigService.GetItemIndex("I001");
            return slot >= 0 && slot < Current.itemStock.Length ? slot : 0;
        }

        public static bool IsWishTownSideModeUnlocked()
        {
            var configs = WishTownConfigService.GetBuildings();
            var sideMode = WishTownConfigService.GetSideMode();
            if (configs == null || sideMode == null || string.IsNullOrWhiteSpace(sideMode.unlock_building_id)) return false;
            if (sideMode.bypass_unlock) return true;
            for (var i = 0; i < configs.Length; i++)
            {
                var building = configs[i];
                if (building == null || building.building_id != sideMode.unlock_building_id ||
                    GetWishTownBuildingProgress(i) < 100) continue;
                if (building.side_mode_unlock_ids == null || building.side_mode_unlock_ids.Length == 0) return false;
                for (var j = 0; j < building.side_mode_unlock_ids.Length; j++)
                    if (building.side_mode_unlock_ids[j] == sideMode.mode_id) return true;
            }
            return false;
        }

        public static int GetWishTownBuildingProgress(int index)
        {
            EnsureShape(Current);
            return index >= 0 && index < Current.wishTownBuildingProgress.Length ? Current.wishTownBuildingProgress[index] : 0;
        }

        public static int GetWishTownBuildingProgressPercent(int index)
        {
            var configs = WishTownConfigService.GetBuildings();
            if (configs == null || index < 0 || index >= configs.Length || configs[index] == null) return 0;
            return Mathf.Clamp(GetWishTownBuildingProgress(index), 0, 100);
        }

        public static bool TryInjectWishTownBuilding(int index, out string message)
        {
            message = string.Empty;
            var configs = WishTownConfigService.GetBuildings();
            EnsureShape(Current);
            if (configs == null || index < 0 || index >= configs.Length) { message = "建筑配置不存在。"; return false; }
            var config = configs[index];
            if (config == null || config.total_material_cost <= 0 || config.material_cost_per_injection <= 0 ||
                config.progress_per_injection <= 0)
            {
                message = "建筑配置无效，请检查策划数据。";
                return false;
            }
            var prerequisiteIndex = -1;
            if (!string.IsNullOrWhiteSpace(config.prerequisite_building_id))
                for (var i = 0; i < configs.Length; i++) if (configs[i] != null && configs[i].building_id == config.prerequisite_building_id) { prerequisiteIndex = i; break; }
            if (prerequisiteIndex >= 0 && GetWishTownBuildingProgress(prerequisiteIndex) < 100)
            {
                message = "请先完成前置建筑修复。";
                return false;
            }
            var remaining = Mathf.Max(0, 100 - Current.wishTownBuildingProgress[index]);
            if (remaining <= 0) { message = config.name + "已经完成修复。"; return false; }
            var injectionCost = Mathf.Max(1, config.material_cost_per_injection);
            var progressPerInjection = Mathf.Max(1, config.progress_per_injection > 0 ? config.progress_per_injection : injectionCost);
            var materialSlot = GetWishTownMaterialSlot();
            if (Current.itemStock[materialSlot] < injectionCost) { message = "星愿建材不足，先去闯关。"; return false; }
            Current.itemStock[materialSlot] -= injectionCost;
            Current.wishTownBuildingProgress[index] += Mathf.Min(progressPerInjection, remaining);
            if (index == 0 && Current.tutorialStep == 103)
                Current.tutorialStep = 999;
            Save();
            message = Current.wishTownBuildingProgress[index] >= 100 ? config.name + "已完成修复。" : config.name + "修复进度 " + Current.wishTownBuildingProgress[index] + "%";
            return true;
        }

        public static bool TryCompleteWishTownBuilding(int index, out string message)
        {
            message = string.Empty;
            var configs = WishTownConfigService.GetBuildings();
            EnsureShape(Current);
            if (configs == null || index < 0 || index >= configs.Length) { message = "建筑配置不存在。"; return false; }
            var config = configs[index];
            if (config == null || config.total_material_cost <= 0 || config.material_cost_per_injection <= 0 ||
                config.progress_per_injection <= 0)
            {
                message = "建筑配置无效，请检查策划数据。";
                return false;
            }
            var prerequisiteIndex = -1;
            if (!string.IsNullOrWhiteSpace(config.prerequisite_building_id))
                for (var i = 0; i < configs.Length; i++) if (configs[i] != null && configs[i].building_id == config.prerequisite_building_id) { prerequisiteIndex = i; break; }
            if (prerequisiteIndex >= 0 && GetWishTownBuildingProgress(prerequisiteIndex) < 100)
            {
                message = "请先完成前置建筑修复。";
                return false;
            }
            var remaining = Mathf.Max(0, 100 - Current.wishTownBuildingProgress[index]);
            if (remaining <= 0) { message = config.name + "已经完成修复。"; return false; }

            var totalCost = Mathf.Max(1, config.total_material_cost);
            var consumedAtCurrentProgress = Mathf.Clamp(
                Mathf.FloorToInt(totalCost * Mathf.Clamp(Current.wishTownBuildingProgress[index], 0, 100) / 100f),
                0, totalCost);
            var remainingCost = Mathf.Max(0, totalCost - consumedAtCurrentProgress);
            var materialSlot = GetWishTownMaterialSlot();
            var materialCount = materialSlot >= 0 && materialSlot < Current.itemStock.Length
                ? Current.itemStock[materialSlot]
                : 0;
            if (materialCount <= 0)
            {
                message = "星愿建材不足，先去闯关。";
                return false;
            }

            var materialToUse = Mathf.Min(materialCount, remainingCost);
            var consumedAfterUpgrade = consumedAtCurrentProgress + materialToUse;
            Current.itemStock[materialSlot] -= materialToUse;
            Current.wishTownBuildingProgress[index] = Mathf.Clamp(
                Mathf.FloorToInt(consumedAfterUpgrade * 100f / totalCost), 0, 100);
            if (index == 0 && Current.tutorialStep == 103)
                Current.tutorialStep = 999;
            Save();
            message = Current.wishTownBuildingProgress[index] >= 100
                ? config.name + "已完成修复。"
                : config.name + "修复进度 " + Current.wishTownBuildingProgress[index] + "%";
            return true;
        }

        public static bool TryInjectWishTownBuildingMax(int index, out string message)
        {
            message = string.Empty;
            var changed = false;
            var guard = 0;
            while (guard++ < 100)
            {
                string stepMessage;
                if (!TryInjectWishTownBuilding(index, out stepMessage))
                {
                    if (!changed) message = stepMessage;
                    break;
                }
                changed = true;
                message = stepMessage;
                var configs = WishTownConfigService.GetBuildings();
                if (configs == null || index < 0 || index >= configs.Length || configs[index] == null ||
                    GetWishTownBuildingProgress(index) >= 100)
                    break;
            }
            return changed;
        }

        public static void BeginWishTownTutorialIfNeeded()
        {
            if (Current.tutorialStep != 0) return;
            Current.tutorialStep = 101;
            Save();
        }

        public static void AdvanceWishTownTutorial(int expectedStep, int nextStep)
        {
            if (Current.tutorialStep != expectedStep) return;
            Current.tutorialStep = nextStep;
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

        private static void RefreshWishTownBlocksDailyScope()
        {
            var today = DateTime.Now.ToString("yyyy-MM-dd");
            if (Current.wishTownBlocksMaterialDate == today) return;
            Current.wishTownBlocksMaterialDate = today;
            Current.wishTownBlocksTodayMaterial = 0;
        }

        private static HysjSaveData Load(string userId)
        {
            var json = PlayerPrefs.GetString(SaveKey(userId), string.Empty);
            HysjSaveData data = null;
            if (!string.IsNullOrWhiteSpace(json))
            {
                try { data = DeserializeSave(json); }
                catch (Exception exception) { Debug.LogWarning("Invalid local save: " + exception.Message); }
                if (data == null)
                {
                    // A payload that cannot be read by any compatibility
                    // path must not be retried on every startup.
                    PlayerPrefs.DeleteKey(SaveKey(userId));
                    PlayerPrefs.Save();
                    Debug.LogWarning("Invalid local save was cleared; a new default save will be created.");
                }
                else if (json.StartsWith(SaveEncryptionPrefix, StringComparison.Ordinal))
                {
                    // Migrate the previous xyxz encrypted payload to the
                    // same plain JSON storage used by the source hysj project.
                    PlayerPrefs.SetString(SaveKey(userId), JsonUtility.ToJson(data));
                    PlayerPrefs.Save();
                }
            }
            data = data ?? CreateDefaults();
            data.userId = userId;
            data.username = PlayerPrefs.GetString(LocalUsernamePrefix + userId,
                PlayerPrefs.GetString(UsernameKey, data.username));
            if (data.updatedAt <= 0) data.updatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            if (data.lastRecoverTime <= 0) data.lastRecoverTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
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
            data.skills.Add(new SkillState { id = 1, name = "普通导弹", description = "一颗一颗发射", baseEffect = 1, effectPerLevel = 1, upgradeCost = 100, costIncreasePerLevel = 0 });
            data.skills.Add(new SkillState { id = 2, name = "寒冰导弹", description = "集群发射", baseEffect = 1, effectPerLevel = 1, upgradeCost = 100, costIncreasePerLevel = 0 });
            data.skills.Add(new SkillState { id = 3, name = "防护钢板", description = "防护力+3", baseEffect = 3, effectPerLevel = 3, upgradeCost = 100, costIncreasePerLevel = 0 });
            data.skills.Add(new SkillState { id = 4, name = "穿甲弹", description = "攻击力+1", baseEffect = 1, effectPerLevel = 1, upgradeCost = 100, costIncreasePerLevel = 0 });
            data.skills.Add(new SkillState { id = 5, name = "核弹", description = "毁灭性伤害", baseEffect = 1, effectPerLevel = 1, upgradeCost = 100, costIncreasePerLevel = 0 });
            data.skills.Add(new SkillState { id = 6, name = "能量护盾", description = "时间+1秒", baseEffect = 1, effectPerLevel = 1, upgradeCost = 100, costIncreasePerLevel = 0 });
            return data;
        }

        private static void EnsureShape(HysjSaveData data)
        {
            var characterCount = Mathf.Max(1, WishTownConfigService.GetCharacters() == null ? 5 : WishTownConfigService.GetCharacters().Length);
            if (data.unlockedRoles == null || data.unlockedRoles.Length != characterCount)
            {
                var oldRoles = data.unlockedRoles;
                data.unlockedRoles = new bool[characterCount];
                if (oldRoles != null) Array.Copy(oldRoles, data.unlockedRoles, Math.Min(oldRoles.Length, data.unlockedRoles.Length));
            }
            data.unlockedRoles[0] = true;
            var itemCount = Mathf.Max(3, WishTownConfigService.GetItems() == null ? 3 : WishTownConfigService.GetItems().Length);
            if (data.itemStock == null || data.itemStock.Length != itemCount)
            {
                var oldItems = data.itemStock;
                data.itemStock = new int[itemCount];
                if (oldItems != null) Array.Copy(oldItems, data.itemStock, Math.Min(oldItems.Length, data.itemStock.Length));
            }
            var levelCount = WishTownConfigService.MaxLevel;
            if (data.levelStars == null || data.levelStars.Length != levelCount)
            {
                var old = data.levelStars;
                data.levelStars = new int[levelCount];
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
            data.skills = data.skills ?? new List<SkillState>();
            var buildingCount = Mathf.Max(1, WishTownConfigService.GetBuildings() == null ? 5 : WishTownConfigService.GetBuildings().Length);
            if (data.wishTownBuildingProgress == null || data.wishTownBuildingProgress.Length != buildingCount)
            {
                var oldProgress = data.wishTownBuildingProgress;
                data.wishTownBuildingProgress = new int[buildingCount];
                if (oldProgress != null) Array.Copy(oldProgress, data.wishTownBuildingProgress, Math.Min(oldProgress.Length, data.wishTownBuildingProgress.Length));
            }
            for (var i = 0; i < data.wishTownBuildingProgress.Length; i++)
                data.wishTownBuildingProgress[i] = Mathf.Clamp(data.wishTownBuildingProgress[i], 0, 100);
            data.wishTownSettlementIds = data.wishTownSettlementIds ?? new List<string>();
            data.wishTownBlocksHighScore = Mathf.Max(0, data.wishTownBlocksHighScore);
            data.wishTownBlocksHighestSpeed = Mathf.Max(1, data.wishTownBlocksHighestSpeed);
            data.wishTownBlocksTodayMaterial = Mathf.Max(0, data.wishTownBlocksTodayMaterial);
            data.wishTownBlocksMaterialDate = data.wishTownBlocksMaterialDate ?? string.Empty;
            if (data.activeGardenRepairRun != null)
            {
                data.activeGardenRepairRun.flowerIndices = data.activeGardenRepairRun.flowerIndices ?? new List<int>();
                data.activeGardenRepairRun.obstacleIndices = data.activeGardenRepairRun.obstacleIndices ?? new List<int>();
                data.activeGardenRepairRun.solutionIndices = data.activeGardenRepairRun.solutionIndices ?? new List<int>();
            }
            if (data.skills.Count == 0) data.skills = CreateDefaults().skills;
            else if (data.skills.Count < 6)
            {
                var defaults = CreateDefaults().skills;
                for (var i = data.skills.Count; i < defaults.Count; i++) data.skills.Add(defaults[i]);
            }
            var skillNames = new[] { "普通导弹", "寒冰导弹", "防护钢板", "穿甲弹", "核弹", "能量护盾" };
            var skillDescriptions = new[] { "一颗一颗发射", "集群发射", "防护力+3", "攻击力+1", "毁灭性伤害", "时间+1秒" };
            var skillEffects = new[] { 1, 1, 3, 1, 1, 1 };
            for (var i = 0; i < 6; i++)
            {
                data.skills[i].id = i + 1;
                data.skills[i].name = skillNames[i];
                data.skills[i].description = skillDescriptions[i];
                data.skills[i].baseEffect = skillEffects[i];
                data.skills[i].effectPerLevel = skillEffects[i];
                data.skills[i].upgradeCost = 100;
                data.skills[i].costIncreasePerLevel = 0;
                data.skills[i].maxLevel = 10;
            }
            var globalConfig = WishTownConfigService.GetGlobalConfig();
            var configuredMaxStamina = globalConfig == null ? 20 : Mathf.Max(1, globalConfig.stamina_max);
            // Older saves used a five-point cap. Keep the current amount, but
            // migrate the cap to the formal 20-point stamina configuration.
            data.maxStamina = configuredMaxStamina;
            data.currentStamina = Mathf.Clamp(data.currentStamina, 0, data.maxStamina);
            data.totalOnlineMinutes = Mathf.Max(0, data.totalOnlineMinutes);
            data.dailyOnlineMinutes = Mathf.Max(0, data.dailyOnlineMinutes);
            data.unlockedLevel = Mathf.Clamp(data.unlockedLevel, 1, WishTownConfigService.MaxLevel);
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

        private static List<string> MergeDistinct(List<string> primary, List<string> compatibility)
        {
            var merged = primary ?? new List<string>();
            if (compatibility == null) return merged;
            foreach (var value in compatibility)
                if (!string.IsNullOrWhiteSpace(value) && !merged.Contains(value)) merged.Add(value);
            return merged;
        }

        private static string SaveKey(string userId) => "HYSJ_SAVE_" + (string.IsNullOrWhiteSpace(userId) ? "GUEST" : userId);

        private static string SerializeSave(HysjSaveData data)
        {
            // Timestamps are runtime metadata and are intentionally excluded
            // from the persisted JSON via [NonSerialized].
            var json = JsonUtility.ToJson(data);
            using (var aes = Aes.Create())
            {
                aes.Key = DeriveSaveKey();
                aes.GenerateIV();
                using (var encryptor = aes.CreateEncryptor())
                using (var output = new MemoryStream())
                using (var crypto = new CryptoStream(output, encryptor, CryptoStreamMode.Write))
                {
                    var bytes = Encoding.UTF8.GetBytes(json);
                    crypto.Write(bytes, 0, bytes.Length);
                    crypto.FlushFinalBlock();
                    var cipher = output.ToArray();
                    var payload = new byte[aes.IV.Length + cipher.Length];
                    Buffer.BlockCopy(aes.IV, 0, payload, 0, aes.IV.Length);
                    Buffer.BlockCopy(cipher, 0, payload, aes.IV.Length, cipher.Length);
                    return SaveEncryptionPrefix + Convert.ToBase64String(payload);
                }
            }
        }

        private static HysjSaveData DeserializeSave(string serialized)
        {
            try
            {
                if (!serialized.StartsWith(SaveEncryptionPrefix, StringComparison.Ordinal))
                    return ParseSaveJson(serialized);
                var payload = Convert.FromBase64String(serialized.Substring(SaveEncryptionPrefix.Length));
                using (var aes = Aes.Create())
                {
                    aes.Key = DeriveSaveKey();
                    var ivLength = aes.BlockSize / 8;
                    if (payload.Length <= ivLength) return null;
                    aes.IV = new byte[ivLength];
                    Buffer.BlockCopy(payload, 0, aes.IV, 0, ivLength);
                    using (var decryptor = aes.CreateDecryptor())
                    using (var input = new MemoryStream(payload, ivLength, payload.Length - ivLength))
                    using (var crypto = new CryptoStream(input, decryptor, CryptoStreamMode.Read))
                    using (var reader = new StreamReader(crypto, Encoding.UTF8))
                        return ParseSaveJson(reader.ReadToEnd());
                }
            }
            catch (Exception exception)
            {
                Debug.LogWarning("Wish Town save reset: " + exception.Message);
                return null;
            }
        }

        private static HysjSaveData ParseSaveJson(string json)
        {
            try
            {
                return JsonUtility.FromJson<HysjSaveData>(json);
            }
            catch (ArgumentException)
            {
                // Existing saves were written before timestamp compatibility
                // was added. Retry once with the two known long fields
                // normalized instead of discarding the whole account.
                var normalized = NormalizeTimestampJson(json);
                if (!string.Equals(normalized, json, StringComparison.Ordinal))
                {
                    try { return JsonUtility.FromJson<HysjSaveData>(normalized); }
                    catch (ArgumentException) { }
                }

                // Some older Unity JSON readers still reject a 64-bit value
                // even when quoted. Timestamps are derived metadata, so they
                // can be omitted safely and rebuilt on the next save.
                var withoutTimestamps = RemoveTimestampJson(json);
                if (!string.Equals(withoutTimestamps, json, StringComparison.Ordinal))
                {
                    try { return JsonUtility.FromJson<HysjSaveData>(withoutTimestamps); }
                    catch (ArgumentException) { }
                }

                // Legacy Garden/character payloads are not needed by Wish
                // Town and can contain shapes that older JsonUtility builds
                // reject. Keep all Wish Town progress while dropping only
                // those reconstructible legacy properties.
                var withoutLegacy = RemoveJsonProperty(withoutTimestamps, "activeGardenRepairRun");
                withoutLegacy = RemoveJsonProperty(withoutLegacy, "game2HeroTiers");
                withoutLegacy = RemoveJsonProperty(withoutLegacy, "skills");
                try { return JsonUtility.FromJson<HysjSaveData>(withoutLegacy); }
                catch (ArgumentException) { }

                // An interrupted Wish Town run is recoverable only when its
                // board payload parses. If an old reader rejects that nested
                // state, retain account/progression data and start clean.
                withoutLegacy = RemoveJsonProperty(withoutLegacy, "activeWishTownMatch");
                withoutLegacy = RemoveJsonProperty(withoutLegacy, "activeWishTownBlocks");
                try { return JsonUtility.FromJson<HysjSaveData>(withoutLegacy); }
                catch (ArgumentException) { return null; }
            }
        }

        private static string NormalizeTimestampJson(string json)
        {
            if (string.IsNullOrEmpty(json)) return json;
            json = Regex.Replace(
                json,
                "(\\\"(?:updatedAt|lastRecoverTime)\\\"\\s*:\\s*)(-?\\d+)(?=\\s*[,}])",
                "$1\"$2\"");
            return json;
        }

        private static string RemoveTimestampJson(string json)
        {
            json = Regex.Replace(
                json,
                "\\\"updatedAt\\\"\\s*:\\s*(?:\\\"-?\\d+\\\"|-?\\d+)\\s*,?",
                string.Empty);
            json = Regex.Replace(
                json,
                "\\\"lastRecoverTime\\\"\\s*:\\s*(?:\\\"-?\\d+\\\"|-?\\d+)\\s*,?",
                string.Empty);
            return json;
        }

        private static string RemoveJsonProperty(string json, string propertyName)
        {
            if (string.IsNullOrEmpty(json) || string.IsNullOrEmpty(propertyName)) return json;
            var key = "\"" + propertyName + "\"";
            var propertyStart = json.IndexOf(key, StringComparison.Ordinal);
            if (propertyStart < 0) return json;

            var colon = json.IndexOf(':', propertyStart + key.Length);
            if (colon < 0) return json;
            var valueStart = colon + 1;
            while (valueStart < json.Length && char.IsWhiteSpace(json[valueStart])) valueStart++;
            var valueEnd = FindJsonValueEnd(json, valueStart);
            if (valueEnd <= valueStart) return json;

            var removeStart = propertyStart;
            var removeEnd = valueEnd;
            while (removeEnd < json.Length && char.IsWhiteSpace(json[removeEnd])) removeEnd++;
            if (removeEnd < json.Length && json[removeEnd] == ',')
            {
                removeEnd++;
            }
            else
            {
                var previous = propertyStart - 1;
                while (previous >= 0 && char.IsWhiteSpace(json[previous])) previous--;
                if (previous >= 0 && json[previous] == ',') removeStart = previous;
            }
            return json.Remove(removeStart, removeEnd - removeStart);
        }

        private static int FindJsonValueEnd(string json, int valueStart)
        {
            if (valueStart >= json.Length) return valueStart;
            var first = json[valueStart];
            if (first == '\"')
            {
                var escaped = false;
                for (var i = valueStart + 1; i < json.Length; i++)
                {
                    var current = json[i];
                    if (escaped) { escaped = false; continue; }
                    if (current == '\\') { escaped = true; continue; }
                    if (current == '\"') return i + 1;
                }
                return json.Length;
            }
            if (first == '{' || first == '[')
            {
                var depth = 0;
                var inString = false;
                var escaped = false;
                for (var i = valueStart; i < json.Length; i++)
                {
                    var current = json[i];
                    if (inString)
                    {
                        if (escaped) escaped = false;
                        else if (current == '\\') escaped = true;
                        else if (current == '\"') inString = false;
                        continue;
                    }
                    if (current == '\"') { inString = true; continue; }
                    if (current == '{' || current == '[') depth++;
                    else if (current == '}' || current == ']')
                    {
                        depth--;
                        if (depth == 0) return i + 1;
                    }
                }
                return json.Length;
            }

            var end = valueStart;
            while (end < json.Length && json[end] != ',' && json[end] != '}') end++;
            return end;
        }

        private static byte[] DeriveSaveKey()
        {
            using (var sha = SHA256.Create()) return sha.ComputeHash(Encoding.UTF8.GetBytes(SaveEncryptionSecret));
        }

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
