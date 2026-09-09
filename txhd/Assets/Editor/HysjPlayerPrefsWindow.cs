using UnityEditor;
using UnityEngine;

namespace Hysj
{
    /// <summary>Editor-only inspection and reset tools for the local PlayerPrefs saves.</summary>
    public sealed class HysjPlayerPrefsWindow : EditorWindow
    {
        private Vector2 _scroll;
        private string _userId = string.Empty;
        private string _username = string.Empty;
        private string _saveJson = string.Empty;
        private HysjSaveData _saveData;

        [MenuItem("Hysj/调试/本地存储 PlayerPrefs")]
        private static void Open()
        {
            var window = GetWindow<HysjPlayerPrefsWindow>("Hysj 本地存储");
            window.minSize = new Vector2(560f, 500f);
            window.Refresh();
        }

        private void OnGUI()
        {
            EditorGUILayout.HelpBox(
                "这里直接查看 Unity Editor 当前项目的 PlayerPrefs。清除后请停止 Play 模式并重新运行，以刷新运行时内存。",
                MessageType.Info);

            using (new EditorGUILayout.HorizontalScope())
            {
                EditorGUILayout.LabelField("项目", Application.productName);
                EditorGUILayout.LabelField("平台", Application.platform.ToString());
                if (GUILayout.Button("刷新", GUILayout.Width(70f))) Refresh();
            }

            EditorGUILayout.Space(4f);
            EditorGUILayout.LabelField("当前登录账号", string.IsNullOrWhiteSpace(_username) ? "未登录" : _username);
            EditorGUILayout.LabelField("当前服务端 ID", string.IsNullOrWhiteSpace(_userId) ? "未设置" : _userId);
            EditorGUILayout.LabelField("存档键", string.IsNullOrWhiteSpace(_userId) ? "无" : SaveKey(_userId));

            if (_saveData != null)
            {
                EditorGUILayout.Space(4f);
                using (new EditorGUILayout.VerticalScope(EditorStyles.helpBox))
                {
                    EditorGUILayout.LabelField("钻石", _saveData.currentGold.ToString());
                    EditorGUILayout.LabelField("当前关卡", _saveData.currentLevel.ToString());
                    EditorGUILayout.LabelField("已解锁关卡", _saveData.unlockedLevel.ToString());
                    EditorGUILayout.LabelField("成就领取数", (_saveData.achievementClaims == null ? 0 : _saveData.achievementClaims.Count).ToString());
                    EditorGUILayout.LabelField("累计获得钻石", _saveData.totalGoldEarned.ToString());
                    EditorGUILayout.LabelField("累计在线分钟", _saveData.totalOnlineMinutes.ToString());
                    EditorGUILayout.LabelField("当天在线分钟", _saveData.dailyOnlineMinutes.ToString());
                }
            }

            EditorGUILayout.Space(6f);
            EditorGUILayout.LabelField("当前账号原始 JSON");
            _scroll = EditorGUILayout.BeginScrollView(_scroll, GUILayout.MinHeight(180f));
            EditorGUILayout.SelectableLabel(string.IsNullOrWhiteSpace(_saveJson) ? "当前账号没有本地存档。" : _saveJson,
                EditorStyles.textArea, GUILayout.ExpandHeight(true));
            EditorGUILayout.EndScrollView();

            EditorGUILayout.Space(6f);
            using (new EditorGUILayout.HorizontalScope())
            {
                using (new EditorGUI.DisabledScope(string.IsNullOrWhiteSpace(_userId)))
                {
                    if (GUILayout.Button("清除当前账号存档", GUILayout.Height(28f))) ClearCurrentSave();
                }

                if (GUILayout.Button("清除当前登录凭据", GUILayout.Height(28f))) ClearCredentials();
            }

            var oldColor = GUI.backgroundColor;
            GUI.backgroundColor = new Color(1f, .65f, .65f);
            if (GUILayout.Button("清除本项目全部 PlayerPrefs", GUILayout.Height(28f))) ClearAll();
            GUI.backgroundColor = oldColor;
        }

        private void Refresh()
        {
            _username = PlayerPrefs.GetString("SLS_USERNAME", string.Empty);
            _userId = PlayerPrefs.GetString("SLS_USER_ID", string.Empty);
            _saveJson = string.IsNullOrWhiteSpace(_userId) ? string.Empty : PlayerPrefs.GetString(SaveKey(_userId), string.Empty);
            _saveData = null;
            if (!string.IsNullOrWhiteSpace(_saveJson))
            {
                try { _saveData = JsonUtility.FromJson<HysjSaveData>(_saveJson); }
                catch (System.SystemException exception) { Debug.LogWarning("PlayerPrefs 存档解析失败: " + exception.Message); }
            }
            Repaint();
        }

        private void ClearCurrentSave()
        {
            if (string.IsNullOrWhiteSpace(_userId)) return;
            if (!EditorUtility.DisplayDialog("清除当前账号存档", "只删除当前服务端账号的本地存档和剧情弹窗状态，是否继续？", "清除", "取消")) return;

            PlayerPrefs.DeleteKey(SaveKey(_userId));
            PlayerPrefs.DeleteKey("StoryPopupShown_" + _userId);
            PlayerPrefs.Save();
            Refresh();
        }

        private void ClearCredentials()
        {
            if (!EditorUtility.DisplayDialog("清除登录凭据", "下次运行需要重新登录，是否继续？", "清除", "取消")) return;

            PlayerPrefs.DeleteKey("SLS_USERNAME");
            PlayerPrefs.DeleteKey("SLS_PASSWORD");
            PlayerPrefs.DeleteKey("SLS_USER_ID");
            PlayerPrefs.Save();
            Refresh();
        }

        private void ClearAll()
        {
            if (!EditorUtility.DisplayDialog("清除全部 PlayerPrefs", "这会删除本项目的全部本地存储，包括所有账号、设置和登录凭据。是否继续？", "全部清除", "取消")) return;

            PlayerPrefs.DeleteAll();
            PlayerPrefs.Save();
            Refresh();
        }

        private static string SaveKey(string userId)
        {
            return "HYSJ_SAVE_" + (string.IsNullOrWhiteSpace(userId) ? "GUEST" : userId);
        }
    }
}
