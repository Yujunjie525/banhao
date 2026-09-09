using UnityEngine;

namespace Hysj
{
    /// <summary>Owns the single looping BGM source used by the main scene.</summary>
    public sealed class HysjAudioManager : MonoBehaviour
    {
        private const string MainMusicPath = "HysjLegacy/sound/bgm_02";
        private static HysjAudioManager instance;

        private AudioSource source;

        public static void EnsureLoaded()
        {
            if (instance != null) return;
            var go = new GameObject("HysjAudioManager");
            DontDestroyOnLoad(go);
            instance = go.AddComponent<HysjAudioManager>();
        }

        public static void PlayMainMusic()
        {
            EnsureLoaded();
            // Re-entering from login may retain the same main BGM. In that
            // case keep its current playback position; other scene entries
            // still switch tracks and start from zero.
            instance.PlayClip(MainMusicPath, false);
        }

        public static void StopMusic()
        {
            if (instance == null || instance.source == null) return;
            instance.source.Stop();
            instance.source.clip = null;
        }

        public static void ApplyMusicSetting()
        {
            if (instance == null || instance.source == null) return;
            instance.source.mute = !HysjDataService.Current.musicEnabled;
        }

        private void Awake()
        {
            if (instance != null && instance != this)
            {
                Destroy(gameObject);
                return;
            }

            instance = this;
            source = gameObject.AddComponent<AudioSource>();
            source.playOnAwake = false;
            source.loop = true;
            source.volume = 1f;
            HysjDataService.Changed += OnDataChanged;
            ApplyMusicSetting();
        }

        private void OnDestroy()
        {
            if (instance != this) return;
            HysjDataService.Changed -= OnDataChanged;
            instance = null;
        }

        private void OnDataChanged()
        {
            ApplyMusicSetting();
        }

        private void PlayClip(string resourcePath, bool restartIfAlreadyPlaying)
        {
            var clip = Resources.Load<AudioClip>(resourcePath);
            if (clip == null)
            {
                Debug.LogError("Missing BGM resource: " + resourcePath);
                return;
            }

            if (!restartIfAlreadyPlaying && source.clip == clip && source.isPlaying)
            {
                ApplyMusicSetting();
                return;
            }

            // Switching tracks, or starting a track that is not already
            // active, always starts from time zero.
            source.Stop();
            source.clip = clip;
            source.mute = !HysjDataService.Current.musicEnabled;
            source.Play();
        }
    }
}
