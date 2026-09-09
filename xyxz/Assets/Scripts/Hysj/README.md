# Hysj non-gameplay migration

`HysjMain.unity` and `HysjMain.prefab` contain the editor-authored non-gameplay shell. `HysjEditorApp` only binds serialized references and toggles panels at runtime; it does not create the base Canvas, panels, buttons, input fields, or popup hierarchy. The former gameplay scene generators and runtime entry points have been removed; only the load/login/main shell remains.

Source Cocos project used for this migration: `E:\yspk`.

## Cocos to Unity mapping

| Cocos Creator 2.4.6 | Unity migration |
| --- | --- |
| `Load/SplashManager.ts` | `HysjEditorApp` bound to the serialized `Login` and `Splash` nodes |
| `Load/GameData.ts` | `HysjGameData.cs` and `HysjDataService` |
| `Manager/UserDataSyncManager.ts` | `HysjServerClient` (`GetUserData`, `SaveUserData`, `PassLevel`) |
| `Manager/RankManager.ts` / `RankPanel.ts` | `HysjEditorApp.OpenRank` and `HysjServerClient.FetchRank` |
| `Manager/ShopManager.ts` | `HysjEditorApp.OpenShop` |
| recharge controls in `LoadManager.ts` | `HysjEditorApp.OpenRecharge` (payment SDK handoff is isolated here) |
| `Manager/DailyRewardManager.ts` | `HysjEditorApp.OpenOnlineRewards` (the original daily panel is driven by online minutes) |
| `Manager/WeeklyRewardManager.ts` | `HysjEditorApp.OpenWeekly` |
| `Manager/OnlineTimeManager.ts` | persistent `HysjCloudSaveSync` timer + `HysjDataService.AddOnlineMinute`; `OpenOnlineRewards` reads the daily scope |
| `Manager/AchieveManager.ts` | `HysjEditorApp.OpenAchievements` and copied `achievement.json` |
| `Manager/SkillManager.ts` | `HysjEditorApp.OpenSkills` |
| `Load/TipsManager.ts` | `HysjEditorApp.ShowTips` |
| `Load/TipsWnd.ts` | `HysjEditorApp.ShowTipsWnd` |

## Runtime and server notes

- Local mode is the default. It uses account-scoped encrypted `PlayerPrefs` payloads (with plaintext migration) and supports offline development.
- Enabling `连接原项目服务器` uses the original `yongshigame006` endpoints and payload shapes.
- Recharge calls the source-compatible `PayDiamond` endpoint and only credits diamonds after a successful server response.

The source resources and the three Cocos JSON configs are under `Assets/Resources/HysjLegacy`.
