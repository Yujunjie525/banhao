using System;
using System.Collections.Generic;
using UnityEngine;

namespace Hysj
{
    public static class WishTownBoardLayout
    {
        public const int Columns = 8;
        public const int Rows = 12;
        public const float CellSize = 72.5f;
        public const float BoardLeft = -257f;
        public const float BoardTop = 282f;
    }

    [Serializable]
    public sealed class WishTownGlobalConfig
    {
        public string game_name = "星愿小镇";
        public string version = "1.9.0";
        public string screen_orientation = "portrait";
        public int board_rows = 12;
        public int board_columns = 8;
        public int score_per_eliminated_element = 10;
        public int initial_stamina = 20;
        public int stamina_max = 20;
        public int stamina_recovery_minutes = 10;
        public string monetization_mode = "iap_only";
        public int tutorial_step_count = 3;
        public string default_character_id = "C001";
    }

    [Serializable]
    public sealed class WishTownGlobalConfigAsset
    {
        public WishTownGlobalConfig global_configs;
    }

    [Serializable]
    public sealed class WishTownItemConfig
    {
        public string item_id;
        public string name;
        public string type;
        public string acquisition;
        public string usage;
        public int max_stack;
    }

    [Serializable]
    public sealed class WishTownItemsConfig
    {
        public WishTownItemConfig[] items;
    }

    [Serializable]
    public sealed class WishTownStoreSkuConfig
    {
        public string sku_id;
        public float price_cny;
        // Compatibility field for older local data that stored cents.
        public int price_cents;
        public int diamond_amount;
        public string platform;
    }

    [Serializable]
    public sealed class WishTownStoreSkusConfig
    {
        public WishTownStoreSkuConfig[] store_skus;
    }

    [Serializable]
    public sealed class WishTownStarReward
    {
        public int star;
        public int building_material_amount;
        public int diamond_amount;
    }

    [Serializable]
    public sealed class WishTownLevelConfig
    {
        public int level;
        public string level_id;
        public int time_limit_sec;
        public int element_type_count;
        public string[] element_types;
        [NonSerialized] public int[] resolved_element_types;
        public int star_1_score;
        public int star_2_score;
        public int star_3_score;
        [NonSerialized] public int[] resolved_star_scores;
        public WishTownStarReward[] star_rewards;
    }

    [Serializable]
    public sealed class WishTownLevelsConfig
    {
        public int max_level = 100;
        public WishTownLevelConfig[] levels;
    }

    [Serializable]
    public sealed class WishTownScoreRewardTier
    {
        public int score_threshold;
        public int building_material_amount;
    }

    [Serializable]
    public sealed class WishTownSideModeConfig
    {
        public string mode_id = "SB001";
        public string name = "星愿方块";
        public string mode_type = "endless_falling_block";
        public int board_width = WishTownBoardLayout.Columns;
        public int board_height = WishTownBoardLayout.Rows;
        public string[] piece_types;
        public string piece_randomizer = "seven_bag";
        public int preview_piece_count = 1;
        public bool character_skill_enabled;
        public int stamina_cost = 1;
        public string reward_item_id = "I001";
        public int lines_per_speed_level = 10;
        public float initial_fall_interval_sec = .8f;
        public float minimum_fall_interval_sec = .12f;
        public float fall_interval_step_sec = .04f;
        public int max_speed_level = 20;
        public int[] line_scores = { 0, 80, 200, 350, 600 };
        public WishTownScoreRewardTier[] score_reward_tiers;
        public string unlock_building_id = "B003";
        // Temporary QA switch. Set false to require the configured building
        // repair chain before entering the side mode.
        public bool bypass_unlock;
    }

    [Serializable]
    public sealed class WishTownSideModesConfig
    {
        public WishTownSideModeConfig[] side_modes;
    }

    [Serializable]
    public sealed class WishTownBuildingConfig
    {
        public string building_id;
        public string name;
        public int repair_order;
        public int total_material_cost;
        public int material_cost_per_injection;
        public int progress_per_injection;
        public string prerequisite_building_id;
        public string[] side_mode_unlock_ids;
    }

    [Serializable]
    public sealed class WishTownBuildingsConfig
    {
        public WishTownBuildingConfig[] buildings;
    }

    [Serializable]
    public sealed class WishTownCharacterConfig
    {
        public string entity_id;
        public string name;
        public bool is_default_unlocked;
        public int unlock_cost_diamonds;
        public string skill_id;
        public string skill_type;
        public string skill_name;
        public string skill_description;
        public WishTownSkillParams skill_params;
        public int score_bonus_per_element;
        public int minimum_clear_groups_per_operation;
        public int bonus_score;
        public int bonus_time_sec;
        public int star_score_discount_percent;
    }

    [Serializable]
    public sealed class WishTownSkillParams
    {
        public int score_bonus_per_element;
        public int minimum_clear_groups_per_operation;
        public int bonus_score;
        public int bonus_time_sec;
        public int star_score_discount_percent;
    }

    [Serializable]
    public sealed class WishTownCharactersConfig
    {
        public WishTownCharacterConfig[] characters;
        public string default_character_id;
    }

    public static class WishTownConfigService
    {
        private static WishTownLevelsConfig levels;
        private static WishTownSideModeConfig sideMode;
        private static WishTownBuildingConfig[] buildings;
        private static WishTownCharacterConfig[] characters;
        private static WishTownGlobalConfig globalConfig;
        private static WishTownItemConfig[] items;
        private static WishTownStoreSkuConfig[] storeSkus;

        public static WishTownGlobalConfig GetGlobalConfig()
        {
            Load();
            return globalConfig;
        }

        public static WishTownItemConfig[] GetItems()
        {
            Load();
            return items;
        }

        public static int GetItemIndex(string itemId)
        {
            Load();
            if (string.IsNullOrWhiteSpace(itemId) || items == null) return -1;
            for (var i = 0; i < items.Length; i++)
                if (items[i] != null && items[i].item_id == itemId) return i;
            return -1;
        }

        public static int GetItemMaxStack(string itemId, int fallback)
        {
            Load();
            for (var i = 0; i < (items == null ? 0 : items.Length); i++)
                if (items[i] != null && items[i].item_id == itemId && items[i].max_stack > 0) return items[i].max_stack;
            return fallback;
        }

        public static WishTownStoreSkuConfig[] GetStoreSkus()
        {
            Load();
            return storeSkus;
        }

        public static int ScorePerEliminatedElement => GetGlobalConfig() == null ? 10 : Mathf.Max(1, GetGlobalConfig().score_per_eliminated_element);
        public static int MaxLevel { get { Load(); return Mathf.Max(1, levels == null ? 1 : levels.max_level); } }

        public static WishTownLevelConfig GetLevel(int level)
        {
            Load();
            var maxLevel = levels == null ? 1 : Mathf.Max(1, levels.max_level);
            level = Mathf.Clamp(level, 1, maxLevel);
            if (levels != null && levels.levels != null)
            {
                foreach (var configured in levels.levels)
                    if (configured != null && configured.level == level) return NormalizeLevel(configured, level);
            }
            return null;
        }

        public static WishTownSideModeConfig GetSideMode()
        {
            Load();
            return sideMode;
        }

        public static WishTownBuildingConfig[] GetBuildings()
        {
            Load();
            return buildings;
        }

        public static WishTownCharacterConfig[] GetCharacters()
        {
            Load();
            return characters;
        }

        public static WishTownCharacterConfig GetCharacter(int index)
        {
            Load();
            if (characters == null || index < 0 || index >= characters.Length) return null;
            return characters[index];
        }

        public static bool ValidateLevel(int level, out string error)
        {
            Load();
            error = string.Empty;
            var maxLevel = levels == null ? 1 : Mathf.Max(1, levels.max_level);
            level = Mathf.Clamp(level, 1, maxLevel);
            WishTownLevelConfig configured = null;
            if (levels != null && levels.levels != null)
                foreach (var candidate in levels.levels)
                    if (candidate != null && candidate.level == level) { configured = candidate; break; }
            if (configured == null)
            {
                error = "关卡" + level + "缺少独立配置。";
                return false;
            }
            configured = NormalizeLevel(configured, level);
            if (configured.element_types == null
                || configured.element_types.Length < 3
                || configured.element_type_count != configured.element_types.Length
                || configured.resolved_element_types == null)
            {
                error = configured.element_types != null && configured.element_types.Length < 3
                    ? "关卡" + level + "至少需要3种元素。"
                    : "关卡" + level + "的元素数量配置不一致。";
                return false;
            }
            if (configured.time_limit_sec <= 0 || configured.star_rewards == null || configured.star_rewards.Length < 3)
            {
                error = "关卡" + level + "的时间或奖励配置无效。";
                return false;
            }
            for (var i = 0; i < 3; i++)
                if (configured.star_rewards[i] == null || configured.star_rewards[i].building_material_amount < 0 || configured.star_rewards[i].diamond_amount < 0)
                {
                    error = "关卡" + level + "的星级奖励配置无效。";
                    return false;
                }
            for (var i = 0; i < configured.element_types.Length; i++)
            {
                if (configured.resolved_element_types[i] < 0 || configured.resolved_element_types[i] >= 6)
                {
                    error = "关卡" + level + "包含未知元素类型。";
                    return false;
                }
                for (var j = i + 1; j < configured.element_types.Length; j++)
                    if (configured.resolved_element_types[i] == configured.resolved_element_types[j])
                    {
                        error = "关卡" + level + "的元素类型不能重复。";
                        return false;
                    }
            }
            if (configured.resolved_star_scores == null || configured.resolved_star_scores.Length < 3 ||
                !(configured.resolved_star_scores[0] < configured.resolved_star_scores[1] && configured.resolved_star_scores[1] < configured.resolved_star_scores[2]))
            {
                error = "关卡" + level + "的星级分数线配置无效。";
                return false;
            }
            return true;
        }

        public static bool ValidateSideMode(out string error)
        {
            Load();
            error = string.Empty;
            if (sideMode == null || sideMode.board_width != WishTownBoardLayout.Columns || sideMode.board_height != WishTownBoardLayout.Rows)
            {
                error = "星愿方块棋盘必须为8×12。";
                return false;
            }
            if (sideMode.piece_types == null || sideMode.piece_types.Length == 0 || sideMode.line_scores == null || sideMode.line_scores.Length < 5)
            {
                error = "星愿方块基础配置不完整。";
                return false;
            }
            if (sideMode.lines_per_speed_level <= 0 || sideMode.max_speed_level < 1 ||
                sideMode.initial_fall_interval_sec <= 0f || sideMode.minimum_fall_interval_sec <= 0f ||
                sideMode.minimum_fall_interval_sec > sideMode.initial_fall_interval_sec ||
                sideMode.fall_interval_step_sec < 0f)
            {
                error = "星愿方块速度参数无效。";
                return false;
            }
            var validPieces = new[] { "i_shape", "o_shape", "t_shape", "s_shape", "z_shape", "j_shape", "l_shape" };
            for (var i = 0; i < sideMode.piece_types.Length; i++)
                if (Array.IndexOf(validPieces, sideMode.piece_types[i]) < 0)
                {
                    error = "星愿方块包含未知形状。";
                    return false;
                }
            if (sideMode.piece_randomizer == "seven_bag")
            {
                var uniquePieces = new HashSet<string>(sideMode.piece_types);
                if (sideMode.piece_types.Length != 7 || uniquePieces.Count != 7)
                {
                    error = "星愿方块七袋必须包含7种不重复形状。";
                    return false;
                }
            }
            if (sideMode.score_reward_tiers == null || sideMode.score_reward_tiers.Length == 0)
            {
                error = "星愿方块奖励档位为空。";
                return false;
            }
            var thresholds = new HashSet<int>();
            foreach (var tier in sideMode.score_reward_tiers)
            {
                if (tier == null || tier.score_threshold < 0 || !thresholds.Add(tier.score_threshold) || tier.building_material_amount < 0)
                {
                    error = "星愿方块奖励档位的积分门槛必须唯一且有效。";
                    return false;
                }
            }
            return true;
        }

        private static WishTownLevelConfig NormalizeLevel(WishTownLevelConfig config, int level)
        {
            config.level = level;
            config.level_id = string.IsNullOrWhiteSpace(config.level_id) ? "L" + level.ToString("000") : config.level_id;
            if (config.element_types == null)
            {
                config.resolved_element_types = new int[0];
                return config;
            }
            if (config.element_type_count <= 0) config.element_type_count = config.element_types.Length;
            if (config.element_type_count != config.element_types.Length)
                Debug.LogError("Wish Town level " + level + " element_type_count does not match element_types.length.");
            config.resolved_element_types = new int[config.element_types.Length];
            for (var i = 0; i < config.element_types.Length; i++)
            {
                var element = config.element_types[i] ?? string.Empty;
                config.resolved_element_types[i] = Array.IndexOf(ElementTypeIds, element);
                if (config.resolved_element_types[i] < 0 && int.TryParse(element, out var legacyIndex)) config.resolved_element_types[i] = legacyIndex;
            }
            config.resolved_star_scores = new[] { config.star_1_score, config.star_2_score, config.star_3_score };
            config.star_1_score = config.resolved_star_scores[0]; config.star_2_score = config.resolved_star_scores[1]; config.star_3_score = config.resolved_star_scores[2];
            if (config.star_rewards != null)
                for (var i = 0; i < config.star_rewards.Length && i < 3; i++) if (config.star_rewards[i] != null && config.star_rewards[i].star <= 0) config.star_rewards[i].star = i + 1;
            return config;
        }

        private static readonly string[] ElementTypeIds = { "pink_star", "ribbon_bow", "flower_candy", "heart_candy", "moon_candy", "crystal_candy" };

        private static void Load()
        {
            if (levels != null && sideMode != null && buildings != null && characters != null && globalConfig != null && items != null && storeSkus != null) return;
            levels = LoadJson<WishTownLevelsConfig>("WishTown/levels") ?? new WishTownLevelsConfig();
            var sideModes = LoadJson<WishTownSideModesConfig>("WishTown/side_modes");
            sideMode = sideModes != null && sideModes.side_modes != null && sideModes.side_modes.Length > 0 ? sideModes.side_modes[0] : new WishTownSideModeConfig();
            if (sideMode.score_reward_tiers == null || sideMode.score_reward_tiers.Length == 0)
                sideMode.score_reward_tiers = new[] { new WishTownScoreRewardTier { score_threshold = 500, building_material_amount = 5 } };
            if (sideMode.line_scores == null || sideMode.line_scores.Length < 5)
                sideMode.line_scores = new[] { 0, 80, 200, 350, 600 };
            if (sideMode.piece_types == null || sideMode.piece_types.Length == 0)
                sideMode.piece_types = new[] { "i_shape", "o_shape", "t_shape", "s_shape", "z_shape", "j_shape", "l_shape" };
            var buildingConfig = LoadJson<WishTownBuildingsConfig>("WishTown/buildings");
            buildings = buildingConfig == null || buildingConfig.buildings == null ? new WishTownBuildingConfig[0] : buildingConfig.buildings;
            for (var i = 0; i < buildings.Length; i++)
            {
                if (buildings[i] == null) continue;
            }
            var characterConfig = LoadJson<WishTownCharactersConfig>("WishTown/characters");
            characters = characterConfig == null || characterConfig.characters == null ? CreateDefaultCharacters() : characterConfig.characters;
            for (var i = 0; i < characters.Length; i++)
            {
                var character = characters[i];
                if (character == null) continue;
                character.skill_params = character.skill_params ?? new WishTownSkillParams();
                character.score_bonus_per_element = character.skill_params.score_bonus_per_element != 0 ? character.skill_params.score_bonus_per_element : character.score_bonus_per_element;
                character.minimum_clear_groups_per_operation = character.skill_params.minimum_clear_groups_per_operation != 0 ? character.skill_params.minimum_clear_groups_per_operation : character.minimum_clear_groups_per_operation;
                character.bonus_score = character.skill_params.bonus_score != 0 ? character.skill_params.bonus_score : character.bonus_score;
                character.bonus_time_sec = character.skill_params.bonus_time_sec != 0 ? character.skill_params.bonus_time_sec : character.bonus_time_sec;
                character.star_score_discount_percent = character.skill_params.star_score_discount_percent != 0 ? character.skill_params.star_score_discount_percent : character.star_score_discount_percent;
            }
            var globalAsset = LoadJson<WishTownGlobalConfigAsset>("WishTown/global_configs");
            globalConfig = globalAsset == null || globalAsset.global_configs == null ? new WishTownGlobalConfig() : globalAsset.global_configs;
            var itemAsset = LoadJson<WishTownItemsConfig>("WishTown/items");
            items = itemAsset == null || itemAsset.items == null ? new WishTownItemConfig[0] : itemAsset.items;
            var skuAsset = LoadJson<WishTownStoreSkusConfig>("WishTown/store_skus");
            storeSkus = skuAsset == null || skuAsset.store_skus == null ? new WishTownStoreSkuConfig[0] : skuAsset.store_skus;
            for (var i = 0; i < storeSkus.Length; i++)
            {
                if (storeSkus[i] == null) continue;
                if (storeSkus[i].price_cny <= 0f && storeSkus[i].price_cents > 0)
                    storeSkus[i].price_cny = storeSkus[i].price_cents / 100f;
            }
        }

        private static WishTownCharacterConfig[] CreateDefaultCharacters()
        {
            return new[]
            {
                new WishTownCharacterConfig { entity_id = "C001", name = "暖阳小狗", is_default_unlocked = true, skill_id = null, skill_type = "none", skill_name = "无技能", skill_description = "标准三消体验", skill_params = new WishTownSkillParams() },
                new WishTownCharacterConfig { entity_id = "C002", name = "赤焰狐狸", unlock_cost_diamonds = 100, skill_id = "SK_C002", skill_type = "score_bonus_per_element", skill_name = "额外+1分", skill_description = "每消除一个基础元素额外获得1分", skill_params = new WishTownSkillParams { score_bonus_per_element = 1 }, score_bonus_per_element = 1 },
                new WishTownCharacterConfig { entity_id = "C003", name = "金纹老虎", unlock_cost_diamonds = 200, skill_id = "SK_C003", skill_type = "multi_clear_operation_bonus_score", skill_name = "多消加分", skill_description = "一次操作造成两组及以上消除时额外获得10分", skill_params = new WishTownSkillParams { minimum_clear_groups_per_operation = 2, bonus_score = 10 }, minimum_clear_groups_per_operation = 2, bonus_score = 10 },
                new WishTownCharacterConfig { entity_id = "C004", name = "月影灵猫", unlock_cost_diamonds = 300, skill_id = "SK_C004", skill_type = "level_time_bonus", skill_name = "时光加长", skill_description = "每局基础时间增加30秒", skill_params = new WishTownSkillParams { bonus_time_sec = 30 }, bonus_time_sec = 30 },
                new WishTownCharacterConfig { entity_id = "C005", name = "星愿玉兔", unlock_cost_diamonds = 500, skill_id = "SK_C005", skill_type = "star_score_discount_percent", skill_name = "星级减负", skill_description = "三档星级分数线降低10%", skill_params = new WishTownSkillParams { star_score_discount_percent = 10 }, star_score_discount_percent = 10 }
            };
        }

        private static T LoadJson<T>(string path) where T : class
        {
            var asset = Resources.Load<TextAsset>(path);
            if (asset == null) return null;
            try { return JsonUtility.FromJson<T>(asset.text); }
            catch (Exception exception) { Debug.LogError("Wish Town config parse failed: " + path + " / " + exception.Message); return null; }
        }
    }
}
