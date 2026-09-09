using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace Hysj
{
    [Serializable]
    internal sealed class LoginRequest
    {
        public string appid;
        public string openid;
        public string username;
        public string password;
        public int type;
    }

    [Serializable]
    internal sealed class UserDataRequest
    {
        public string appid;
        public string username;
        public string jsondata;
    }

    [Serializable]
    internal sealed class LevelRequest
    {
        public string appid;
        public string username;
        public int rank;
        public int star;
    }

    [Serializable]
    internal sealed class RealNameRequest
    {
        public string appid;
        public string username;
        public string realname;
        public string idnum;
    }

    [Serializable]
    internal sealed class BreatheRequest
    {
        public string appid;
        public string username;
    }

    [Serializable]
    internal sealed class PayDiamondRequest
    {
        public string appid;
        public string username;
        public int diamond;
    }

    [Serializable]
    public sealed class ServerEnvelope
    {
        public int code;
        public string msg;
        public ServerLoginData data;
        public string jsondata;

        [NonSerialized] public bool hasData;
        [NonSerialized] public bool dataIsTruthy;
        [NonSerialized] public bool hasNumericData;
        [NonSerialized] public long numericData;
        [NonSerialized] public bool hasAge;
    }

    [Serializable]
    public sealed class ServerLoginData
    {
        public int accountId;
        public int user_id;
        public int age;
        public int isrealname;
        public int is_real;
        public int diamond;
        public int rank;
        public string jsondata;
    }

    [Serializable]
    internal sealed class ServerStatusEnvelope
    {
        public int code;
        public string msg;
    }

    [Serializable]
    public sealed class RankListResponse
    {
        public int code;
        public string msg;
        public ServerRankData[] data;
    }

    [Serializable]
    public sealed class ServerRankData
    {
        public int accountId;
        public string gsName;
        public int totalLoginNum;
    }

    public sealed class HysjServerClient : MonoBehaviour
    {
        public const string AppId = "yongshigame013";
        private const string Root = "https://pay.szvi-bo.com/v1/testapp/";

        public bool UseRemoteServer
        {
            // The Cocos startup flow always authenticates against GetLogin and
            // RealName. Keep this property for older Inspector bindings, but do
            // not allow the production login path to silently become offline.
            get => true;
            set
            {
                if (!value) Debug.LogWarning("离线登录模式已停用，实名认证必须由服务器确认。");
            }
        }

        public IEnumerator Login(string username, string password, int type, Action<bool, ServerEnvelope> completed)
        {
            var body = new LoginRequest { appid = AppId, openid = username, username = username, password = password, type = type };
            yield return Post("GetLogin", JsonUtility.ToJson(body), (ok, response) =>
            {
                completed?.Invoke(ok, ok ? SafeParse(response) : null);
            });
        }

        public bool ApplyLoginData(string username, string password, ServerEnvelope envelope)
        {
            if (envelope == null || envelope.data == null) return false;

            HysjDataService.LoginLocal(username, password);
            var serverId = envelope.data.accountId > 0 ? envelope.data.accountId : envelope.data.user_id;
            if (serverId > 0)
            {
                HysjDataService.AdoptServerAccountId(serverId.ToString(), username, password);
            }
            var data = HysjDataService.Current;
            if (envelope.hasAge)
            {
                data.isAdult = envelope.data.age == 1;
                PlayerPrefs.SetString(HysjDataService.AgeStatusKey, data.isAdult ? "1" : "0");
            }
            data.realNameVerified = envelope.data.isrealname == 1 || envelope.data.is_real == 1;
            data.realNameVerifiedByServer = data.realNameVerified;
            PlayerPrefs.SetString(HysjDataService.RealNameKey, data.realNameVerified ? "true" : "false");
            // GetLogin can return its default diamond value before SaveUserData
            // has been loaded. Do not destroy a valid account-scoped local balance;
            // the initial GetUserData response remains authoritative when present.
            if (data.updatedAt <= 0)
                data.currentGold = Mathf.Max(0, envelope.data.diamond);
            data.currentLevel = Mathf.Max(data.currentLevel, Mathf.Max(1, envelope.data.rank));
            data.unlockedLevel = Mathf.Max(data.unlockedLevel, envelope.data.rank + 1);
            HysjDataService.Save(false);
            return true;
        }

        public IEnumerator FetchUserData(Action<bool, string> completed)
        {
            yield return FetchUserData(false, (ok, _, message) => completed?.Invoke(ok, message));
        }

        public IEnumerator FetchUserData(Action<bool, bool, string> completed)
        {
            yield return FetchUserData(true, completed);
        }

        private IEnumerator FetchUserData(bool preferNewest, Action<bool, bool, string> completed)
        {
            var body = new UserDataRequest { appid = AppId, username = HysjDataService.Current.username };
            yield return Post("GetUserData", JsonUtility.ToJson(body), (ok, response) =>
            {
                if (!ok) { completed?.Invoke(false, false, response); return; }
                var envelope = SafeParse(response);
                if (envelope == null || envelope.code != 0) { completed?.Invoke(false, false, ErrorMessage(envelope, "服务器数据同步失败")); return; }
                var payload = envelope != null && envelope.data != null ? envelope.data.jsondata : envelope?.jsondata;
                var remoteApplied = false;
                var localUploadRequired = preferNewest && string.IsNullOrWhiteSpace(payload);
                if (!string.IsNullOrWhiteSpace(payload))
                {
                    try
                    {
                        var localUpdatedAt = HysjDataService.Current.updatedAt;
                        var remote = JsonUtility.FromJson<HysjSaveData>(payload);
                        if (remote != null && (!preferNewest || localUpdatedAt <= 0 || remote.updatedAt >= localUpdatedAt))
                        {
                            HysjDataService.ApplyRemote(remote);
                            remoteApplied = true;
                        }
                        else if (remote != null && preferNewest)
                        {
                            localUploadRequired = true;
                        }
                        else if (remote == null && preferNewest)
                        {
                            localUploadRequired = true;
                        }
                    }
                    catch (Exception exception) { Debug.LogWarning("Remote data parse failed: " + exception.Message); }
                }
                var message = remoteApplied ? "服务器数据已同步到本地" : (localUploadRequired ? "本地数据将同步到服务器" : "服务器暂无有效存档");
                completed?.Invoke(true, localUploadRequired, message);
            });
        }

        public IEnumerator UploadUserData(Action<bool, string> completed = null)
        {
            var body = new UserDataRequest
            {
                appid = AppId,
                username = HysjDataService.Current.username,
                jsondata = JsonUtility.ToJson(HysjDataService.Current)
            };
            yield return Post("SaveUserData", JsonUtility.ToJson(body), (ok, response) =>
            {
                if (!ok) { completed?.Invoke(false, response); return; }
                var envelope = SafeParse(response);
                completed?.Invoke(envelope != null && envelope.code == 0, envelope == null || envelope.code == 0 ? "数据已上传" : ErrorMessage(envelope, "数据上传失败"));
            });
        }

        public IEnumerator PostLevel(int level, int stars, Action<bool, string> completed = null)
        {
            var body = new LevelRequest { appid = AppId, username = HysjDataService.Current.username, rank = level, star = stars };
            yield return Post("PassLevel", JsonUtility.ToJson(body), (ok, response) =>
            {
                if (!ok) { completed?.Invoke(false, response); return; }
                var envelope = SafeParse(response);
                completed?.Invoke(envelope != null && envelope.code == 0, envelope == null || envelope.code == 0 ? "关卡结果已上传" : ErrorMessage(envelope, "关卡结果上传失败"));
            });
        }

        public IEnumerator FetchRank(Action<bool, RankListResponse, string> completed)
        {
            var body = "{\"appid\":\"" + AppId + "\"}";
            // The original Cocos leaderboard always reads RankList from the
            // service, even when the rest of the game is using local saves.
            yield return Post("RankList", body, (ok, response) =>
            {
                if (!ok)
                {
                    completed?.Invoke(false, null, response);
                    return;
                }

                var rankList = SafeParseRank(response);
                if (rankList == null)
                {
                    completed?.Invoke(false, null, "排行榜数据解析失败");
                    return;
                }

                if (rankList.code != 0)
                {
                    completed?.Invoke(false, null, string.IsNullOrWhiteSpace(rankList.msg) ? "排行榜请求失败" : rankList.msg);
                    return;
                }

                completed?.Invoke(true, rankList, rankList.msg);
            });
        }

        public IEnumerator RealName(string realName, string idNumber, Action<bool, ServerEnvelope> completed)
        {
            var body = new RealNameRequest
            {
                appid = AppId,
                username = HysjDataService.Current.username,
                realname = realName,
                idnum = idNumber
            };
            yield return Post("RealName", JsonUtility.ToJson(body), (ok, response) =>
            {
                completed?.Invoke(ok, ok ? SafeParse(response) : null);
            });
        }

        public IEnumerator Breathe(Action<bool, ServerEnvelope> completed)
        {
            var username = HysjDataService.Current.username;
            if (string.IsNullOrWhiteSpace(username))
                username = PlayerPrefs.GetString(HysjDataService.UsernameKey, string.Empty);
            var body = new BreatheRequest { appid = AppId, username = username };
            yield return Post("Breathe", JsonUtility.ToJson(body), (ok, response) =>
            {
                completed?.Invoke(ok, ok ? SafeParse(response) : null);
            });
        }

        public IEnumerator PayDiamond(int diamond, Action<bool, ServerEnvelope> completed)
        {
            var body = new PayDiamondRequest
            {
                appid = AppId,
                username = HysjDataService.Current.username,
                diamond = diamond
            };
            yield return Post("PayDiamond", JsonUtility.ToJson(body), (ok, response) =>
            {
                completed?.Invoke(ok, ok ? SafeParse(response) : null);
            });
        }

        private IEnumerator Post(string endpoint, string json, Action<bool, string> completed)
        {
            using (var request = new UnityWebRequest(Root + endpoint, UnityWebRequest.kHttpVerbPOST))
            {
                request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(json));
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");
                request.timeout = 12;
                yield return request.SendWebRequest();
#if UNITY_2020_2_OR_NEWER
                var ok = request.result == UnityWebRequest.Result.Success;
#else
                var ok = !request.isNetworkError && !request.isHttpError;
#endif
                completed?.Invoke(ok, ok ? request.downloadHandler.text : request.error);
            }
        }

        private static ServerEnvelope SafeParse(string json)
        {
            try
            {
                var envelope = JsonUtility.FromJson<ServerEnvelope>(json);
                if (envelope != null) PopulateRawDataState(envelope, json);
                return envelope;
            }
            catch (Exception exception)
            {
                // Breathe returns a numeric data value while GetLogin returns
                // an object. Keep the common code/msg fields available for
                // the former without changing its server response semantics.
                try
                {
                    var status = JsonUtility.FromJson<ServerStatusEnvelope>(json);
                    if (status == null) return null;
                    var envelope = new ServerEnvelope { code = status.code, msg = status.msg };
                    PopulateRawDataState(envelope, json);
                    return envelope;
                }
                catch
                {
                    Debug.LogWarning("Server response parse failed: " + exception.Message);
                    return null;
                }
            }
        }

        private static RankListResponse SafeParseRank(string json)
        {
            try { return JsonUtility.FromJson<RankListResponse>(json); }
            catch (Exception exception)
            {
                Debug.LogWarning("RankList response parse failed: " + exception.Message);
                return null;
            }
        }

        private static string ErrorMessage(ServerEnvelope envelope, string fallback)
        {
            return envelope != null && !string.IsNullOrWhiteSpace(envelope.msg) ? envelope.msg : fallback;
        }

        private static void PopulateRawDataState(ServerEnvelope envelope, string json)
        {
            if (envelope == null || string.IsNullOrWhiteSpace(json)) return;
            var key = json.IndexOf("\"data\"", StringComparison.Ordinal);
            if (key < 0) return;
            var objectEnd = json.IndexOf('}', key + 6);
            var ageKey = json.IndexOf("\"age\"", key + 6, StringComparison.Ordinal);
            envelope.hasAge = ageKey >= 0 && (objectEnd < 0 || ageKey < objectEnd);
            var colon = json.IndexOf(':', key + 6);
            if (colon < 0) return;
            var valueStart = colon + 1;
            while (valueStart < json.Length && char.IsWhiteSpace(json[valueStart])) valueStart++;
            envelope.hasData = valueStart < json.Length && !json.Substring(valueStart).StartsWith("null", StringComparison.OrdinalIgnoreCase);
            if (!envelope.hasData) return;
            var valueEnd = valueStart;
            while (valueEnd < json.Length && char.IsDigit(json[valueEnd])) valueEnd++;
            if (valueEnd > valueStart)
            {
                envelope.hasNumericData = long.TryParse(json.Substring(valueStart, valueEnd - valueStart), out envelope.numericData);
                envelope.dataIsTruthy = !envelope.hasNumericData || envelope.numericData != 0;
                return;
            }

            var rawValue = json.Substring(valueStart);
            envelope.dataIsTruthy = !rawValue.StartsWith("false", StringComparison.OrdinalIgnoreCase) && !rawValue.StartsWith("\"\"", StringComparison.Ordinal);
        }
    }
}
