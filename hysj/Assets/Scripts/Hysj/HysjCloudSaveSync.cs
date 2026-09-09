using System.Collections;
using UnityEngine;

namespace Hysj
{
    /// <summary>Debounced SaveUserData bridge shared by all three Hysj scenes.</summary>
    public sealed class HysjCloudSaveSync : MonoBehaviour
    {
        private const float UploadDelaySeconds = 0.5f;
        private static HysjCloudSaveSync _instance;

        private HysjServerClient _server;
        private string _activeUserId = string.Empty;
        private bool _initialSyncCompleted;
        private bool _dirty;
        private bool _uploading;
        private float _uploadAt;
        private float _onlineSeconds;
        private string _onlineUserId = string.Empty;

        public static void EnsureLoaded()
        {
            if (_instance != null) return;
            var root = new GameObject("HysjCloudSaveSync");
            _instance = root.AddComponent<HysjCloudSaveSync>();
            DontDestroyOnLoad(root);
        }

        public static void BeginInitialSync()
        {
            EnsureLoaded();
            _instance._activeUserId = HysjDataService.Current.userId ?? string.Empty;
            _instance._initialSyncCompleted = false;
            _instance._dirty = false;
            _instance._onlineUserId = _instance._activeUserId;
            _instance._onlineSeconds = 0f;
        }

        public static void CompleteInitialSync(bool fetchSucceeded, bool localUploadRequired)
        {
            EnsureLoaded();
            var activeUserId = HysjDataService.Current.userId ?? string.Empty;
            var pendingLocalChange = _instance._dirty && _instance._activeUserId == activeUserId;
            _instance._activeUserId = activeUserId;
            _instance._initialSyncCompleted = true;
            _instance._onlineUserId = _instance._activeUserId;
            _instance._onlineSeconds = 0f;
            // An empty cloud slot must be initialized from the account-scoped
            // local save. Also retain a guide-completion save made while the
            // initial request was still finishing.
            _instance._dirty = pendingLocalChange || (fetchSucceeded && localUploadRequired);
            _instance._uploadAt = Time.unscaledTime;
        }

        public static void RequestImmediateUpload()
        {
            EnsureLoaded();
            if (!HasUploadContext()) return;
            var userId = HysjDataService.Current.userId ?? string.Empty;
            if (_instance._activeUserId != userId)
            {
                _instance._activeUserId = userId;
                _instance._initialSyncCompleted = false;
            }
            _instance._dirty = true;
            _instance._uploadAt = Time.unscaledTime;
        }

        public static void ReportLevelResult(int level, int stars)
        {
            EnsureLoaded();
            if (!HasUploadContext())
            {
                Debug.LogWarning("PassLevel skipped: no active server account.");
                return;
            }

            _instance.StartCoroutine(_instance.PostLevelResult(level, stars));
        }

        private void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }

            _instance = this;
            _server = GetComponent<HysjServerClient>() ?? gameObject.AddComponent<HysjServerClient>();
            HysjDataService.Changed += OnLocalDataChanged;
        }

        private void OnDestroy()
        {
            if (_instance != this) return;
            HysjDataService.Changed -= OnLocalDataChanged;
            _instance = null;
        }

        private void Update()
        {
            TrackOnlineTime();
            if (!_dirty || !_initialSyncCompleted || _uploading || Time.unscaledTime < _uploadAt) return;
            if (!HasUploadContext())
            {
                _dirty = false;
                return;
            }

            StartCoroutine(Upload());
        }

        private void TrackOnlineTime()
        {
            // The sync object survives scene changes, so this timer continues
            // through HysjMain -> GardenGameplay without duplicating the main
            // menu timer. The editor can start HysjMain directly, which skips
            // the login coroutine and its initial cloud-sync completion flag.
            // Online time is local account progress, so it must not depend on
            // that upload-only gate.
            if (!HasUploadContext())
            {
                _onlineSeconds = 0f;
                return;
            }

            var userId = HysjDataService.Current.userId ?? string.Empty;
            if (_onlineUserId != userId)
            {
                _onlineUserId = userId;
                _onlineSeconds = 0f;
                return;
            }

            _onlineSeconds += Time.unscaledDeltaTime;
            while (_onlineSeconds >= 60f)
            {
                _onlineSeconds -= 60f;
                HysjDataService.AddOnlineMinute();
            }
        }

        private void OnApplicationPause(bool paused)
        {
            if (paused && _dirty && _initialSyncCompleted && !_uploading && HasUploadContext())
                StartCoroutine(Upload());
        }

        private void OnLocalDataChanged()
        {
            if (!HasUploadContext()) return;
            var userId = HysjDataService.Current.userId ?? string.Empty;
            if (_activeUserId != userId)
            {
                _activeUserId = userId;
                _initialSyncCompleted = false;
                _dirty = false;
                _onlineUserId = userId;
                _onlineSeconds = 0f;
                return;
            }

            if (!_initialSyncCompleted) return;
            _dirty = true;
            _uploadAt = Time.unscaledTime + UploadDelaySeconds;
        }

        private IEnumerator Upload()
        {
            _uploading = true;
            _dirty = false;
            var uploadedUserId = HysjDataService.Current.userId;
            var succeeded = false;
            yield return _server.UploadUserData((ok, _) => succeeded = ok);
            _uploading = false;

            if (!succeeded && HasUploadContext() && HysjDataService.Current.userId == uploadedUserId)
            {
                _dirty = true;
                _uploadAt = Time.unscaledTime + 5f;
            }
        }

        private IEnumerator PostLevelResult(int level, int stars)
        {
            var reportedUserId = HysjDataService.Current.userId;
            var completed = false;
            var succeeded = false;
            yield return _server.PostLevel(level, stars, (ok, _) =>
            {
                completed = true;
                succeeded = ok;
            });

            if (!completed || !succeeded)
            {
                Debug.LogWarning("PassLevel failed for level " + level + ". The local result remains saved and can be synchronized through SaveUserData.");
            }
            else if (!HasUploadContext() || HysjDataService.Current.userId != reportedUserId)
            {
                Debug.LogWarning("PassLevel completed after the active account changed; ignoring the response.");
            }
        }

        private static bool HasUploadContext()
        {
            return HysjDataService.HasAccount &&
                   !string.IsNullOrWhiteSpace(HysjDataService.Current.userId) &&
                   !string.IsNullOrWhiteSpace(HysjDataService.Current.username);
        }
    }
}
