using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace Hysj
{
    /// <summary>
    /// Plays a sampled frame sequence from Resources/HysjLegacy/anim.
    /// The manifest stores the source-frame span so skipped frames do not speed up playback.
    /// </summary>
    public sealed class HysjFrameAnimationController : MonoBehaviour
    {
        private const string ResourceRoot = "HysjLegacy/anim";

        [SerializeField] private Image uiTarget;
        [SerializeField] private SpriteRenderer spriteTarget;
        [SerializeField] private string sequencePath;
        [SerializeField] private Sprite fallbackSprite;
        [SerializeField] private bool playOnEnable = true;
        [SerializeField] private bool loop = true;

        private static readonly Dictionary<string, FrameClip> Clips = new Dictionary<string, FrameClip>(StringComparer.OrdinalIgnoreCase);
        private static readonly Dictionary<string, Texture2D> Textures = new Dictionary<string, Texture2D>(StringComparer.OrdinalIgnoreCase);
        private static readonly Dictionary<string, Sprite> Sprites = new Dictionary<string, Sprite>(StringComparer.OrdinalIgnoreCase);
        private static AnimationManifest manifest;
        private static bool manifestLoaded;

        private FrameClip clip;
        private int frameIndex;
        private float frameTime;
        private bool playing;
        private bool paused;
        private bool useFrameResourceSize;

        [Serializable]
        private sealed class AnimationManifest
        {
            public List<SequenceManifest> sequences = new List<SequenceManifest>();
        }

        [Serializable]
        private sealed class SequenceManifest
        {
            public string source;
            public float sourceFps = 24f;
            public List<FrameManifest> frames = new List<FrameManifest>();
        }

        [Serializable]
        private sealed class FrameManifest
        {
            public string file;
            public int durationFrames = 1;
        }

        private sealed class FrameClip
        {
            public readonly string path;
            public readonly float fps;
            public readonly FrameManifest[] frames;

            public FrameClip(string path, float fps, List<FrameManifest> frames)
            {
                this.path = path;
                this.fps = fps > 0f ? fps : 24f;
                this.frames = frames == null ? new FrameManifest[0] : frames.ToArray();
            }
        }

        public string SequencePath { get { return sequencePath; } }
        public bool IsPlaying { get { return playing && clip != null; } }

        private void Awake()
        {
            if (uiTarget == null) uiTarget = GetComponent<Image>();
            if (spriteTarget == null) spriteTarget = GetComponent<SpriteRenderer>();
        }

        private void OnEnable()
        {
            if (playOnEnable && !string.IsNullOrEmpty(sequencePath)) Play(sequencePath);
        }

        private void Update()
        {
            if (!playing || paused || clip == null || clip.frames.Length == 0) return;
            frameTime += Time.unscaledDeltaTime;
            var guard = clip.frames.Length + 1;
            while (guard-- > 0 && frameTime >= CurrentDuration())
            {
                frameTime -= CurrentDuration();
                if (frameIndex + 1 < clip.frames.Length) frameIndex++;
                else if (loop) frameIndex = 0;
                else { playing = false; break; }
                ApplyFrame();
            }
        }

        public bool Play(string path)
        {
            path = NormalizePath(path);
            if (string.IsNullOrEmpty(path)) { Stop(false); return false; }
            if (clip == null || !string.Equals(clip.path, path, StringComparison.OrdinalIgnoreCase))
            {
                clip = LoadClip(path);
                sequencePath = path;
                frameIndex = 0;
                frameTime = 0f;
            }
            if (clip == null || clip.frames.Length == 0)
            {
                playing = false;
                ApplyFallback();
                return false;
            }
            playing = true;
            ApplyFrame();
            return true;
        }

        public void Stop(bool clearTarget)
        {
            playing = false;
            frameIndex = 0;
            frameTime = 0f;
            if (clearTarget) SetTargetSprite(null);
        }

        public void SetPaused(bool value) { paused = value; }

        /// <summary>
        /// Uses the source frame canvas size in UI pixels instead of fitting every frame into the existing target rect.
        /// </summary>
        public void SetUseFrameResourceSize(bool value)
        {
            useFrameResourceSize = value;
            if (useFrameResourceSize && uiTarget != null && uiTarget.sprite != null) ApplyFrameResourceSize(uiTarget.sprite);
        }

        public void SetFallback(Sprite sprite)
        {
            fallbackSprite = sprite;
            if (clip == null || !playing) ApplyFallback();
        }

        private float CurrentDuration()
        {
            if (clip == null || clip.frames.Length == 0) return 1f / 24f;
            return Mathf.Max(1, clip.frames[frameIndex].durationFrames) / clip.fps;
        }

        private void ApplyFrame()
        {
            if (clip == null || frameIndex < 0 || frameIndex >= clip.frames.Length) { ApplyFallback(); return; }
            var frame = clip.frames[frameIndex];
            var sprite = LoadSprite(clip.path + "/" + frame.file);
            if (sprite != null)
            {
                SetTargetSprite(sprite);
                if (useFrameResourceSize) ApplyFrameResourceSize(sprite);
            }
            else SetTargetSprite(fallbackSprite);
        }

        private void ApplyFallback()
        {
            if (fallbackSprite != null) SetTargetSprite(fallbackSprite);
        }

        private void SetTargetSprite(Sprite sprite)
        {
            if (uiTarget != null) uiTarget.sprite = sprite;
            if (spriteTarget != null) spriteTarget.sprite = sprite;
        }

        private void ApplyFrameResourceSize(Sprite sprite)
        {
            if (uiTarget == null || sprite == null) return;
            // Animation textures use the project's reference-resolution pixel coordinates.
            uiTarget.rectTransform.sizeDelta = sprite.rect.size;
        }

        private static FrameClip LoadClip(string path)
        {
            FrameClip cached;
            if (Clips.TryGetValue(path, out cached)) return cached;
            EnsureManifest();
            if (manifest == null || manifest.sequences == null) return null;
            for (var i = 0; i < manifest.sequences.Count; i++)
            {
                var sequence = manifest.sequences[i];
                if (sequence == null || !string.Equals(NormalizePath(sequence.source), path, StringComparison.OrdinalIgnoreCase)) continue;
                cached = new FrameClip(path, sequence.sourceFps, sequence.frames);
                Clips[path] = cached;
                return cached;
            }
            return null;
        }

        private static void EnsureManifest()
        {
            if (manifestLoaded) return;
            manifestLoaded = true;
            var asset = Resources.Load<TextAsset>(ResourceRoot + "/animation_manifest");
            if (asset == null)
            {
                Debug.LogWarning("Hysj animation manifest is missing at Resources/" + ResourceRoot + "/animation_manifest");
                return;
            }
            try { manifest = JsonUtility.FromJson<AnimationManifest>(asset.text); }
            catch (Exception error) { Debug.LogError("Failed to parse Hysj animation manifest: " + error.Message); }
        }

        private static Sprite LoadSprite(string relativePath)
        {
            relativePath = NormalizePath(relativePath);
            Sprite sprite;
            if (Sprites.TryGetValue(relativePath, out sprite)) return sprite;
            var resourcePath = ResourceRoot + "/" + relativePath;
            if (resourcePath.EndsWith(".png", StringComparison.OrdinalIgnoreCase)) resourcePath = resourcePath.Substring(0, resourcePath.Length - 4);
            var texture = LoadTexture(resourcePath);
            if (texture == null) return null;
            sprite = Sprite.Create(texture, new Rect(0f, 0f, texture.width, texture.height), new Vector2(.5f, .5f), 100f, 0, SpriteMeshType.FullRect);
            sprite.name = "HysjAnim_" + relativePath.Replace('/', '_');
            Sprites[relativePath] = sprite;
            return sprite;
        }

        private static Texture2D LoadTexture(string resourcePath)
        {
            Texture2D texture;
            if (Textures.TryGetValue(resourcePath, out texture)) return texture;
            texture = Resources.Load<Texture2D>(resourcePath);
            if (texture != null) Textures[resourcePath] = texture;
            return texture;
        }

        private static string NormalizePath(string value)
        {
            return string.IsNullOrEmpty(value) ? string.Empty : value.Replace('\\', '/').Trim('/');
        }
    }
}
