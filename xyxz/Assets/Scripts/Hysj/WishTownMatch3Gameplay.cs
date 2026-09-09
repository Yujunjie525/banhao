using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace Hysj
{
    /// <summary>Standalone level-mode match-three board. It owns its entire canvas and state.</summary>
    public sealed class WishTownMatch3Gameplay : MonoBehaviour
    {
        private const int Columns = WishTownBoardLayout.Columns;
        private const int Rows = WishTownBoardLayout.Rows;
        // The authored level board is fully playable; no non-interactive rows are reserved above it.
        private const int PlayableTopRow = 0;
        private const float CellSize = WishTownBoardLayout.CellSize;
        private const float BoardLeft = WishTownBoardLayout.BoardLeft;
        // Match the authored gameplay composition: the board starts lower,
        // leaving the three-star strip clear above it.
        private const float BoardTop = WishTownBoardLayout.BoardTop;
        private readonly int[,] board = new int[Rows, Columns];
        private readonly Image[,] tileImages = new Image[Rows, Columns];
        private readonly Button[,] tileButtons = new Button[Rows, Columns];
        private readonly System.Random random = new System.Random();
        private Canvas canvas;
        private Text scoreLabel;
        private Text timerLabel;
        private Text levelLabel;
        private Text progressLabel;
        private Image selectedRoleImage;
        private GameObject resultPanel;
        private GameObject legacyResultPanel;
        private GameObject winResultPopup;
        private GameObject loseResultPopup;
        private Text winBestDistanceLabel;
        private Text winDistanceLabel;
        private Text winGoldLabel;
        private Text winMaterialLabel;
        private Text loseBestDistanceLabel;
        private Text loseDistanceLabel;
        private Text loseGoldLabel;
        private Image[] winStars;
        private GameObject pausePanel;
        private Transform boardGrid;
        private WishTownLevelConfig levelConfig;
        private int level;
        private int score;
        private int eliminatedCount;
        private float remaining;
        private int selectedRow = -1;
        private int selectedColumn = -1;
        private bool busy;
        private bool paused;
        private string settlementId;

        private readonly struct FallMove
        {
            public readonly int row;
            public readonly int column;
            public readonly int sourceRow;

            public FallMove(int targetRow, int targetColumn, int fromRow)
            {
                row = targetRow;
                column = targetColumn;
                sourceRow = fromRow;
            }
        }

        private readonly string[] iconPaths =
        {
            "HysjLegacy/NewImage/icon/7", "HysjLegacy/NewImage/icon/9",
            "HysjLegacy/NewImage/icon/5", "HysjLegacy/NewImage/icon/4",
            "HysjLegacy/NewImage/icon/8", "HysjLegacy/NewImage/icon/15",
            "HysjLegacy/NewImage/icon/3", "HysjLegacy/NewImage/icon/18"
        };

        private static readonly string[] roleSpritePaths =
        {
            "HysjLegacy/NewImage3/juesegougou",
            "HysjLegacy/NewImage3/juesehuli",
            "HysjLegacy/NewImage3/jueselaohu",
            "HysjLegacy/NewImage3/juesemaomao",
            "HysjLegacy/NewImage3/juesetutu"
        };

        private void Awake()
        {
            level = HysjSceneRouter.ConsumeMatch3Level();
            settlementId = "L" + level.ToString("000") + "_" + Guid.NewGuid().ToString("N");
            levelConfig = WishTownConfigService.GetLevel(level) ?? new WishTownLevelConfig
            {
                level = level,
                time_limit_sec = 30,
                element_type_count = 4,
                star_1_score = 30,
                star_2_score = 180,
                star_3_score = 300
            };
            remaining = Mathf.Max(10, levelConfig.time_limit_sec);
            EnsureEventSystem();
            if (!TryBindStaticLayout())
            {
                BuildCanvas();
                BuildBoard();
            }
            else
            {
                BindStaticButtons();
                InitializeStaticBoardState();
                RedrawBoard();
            }
            StartCoroutine(Clock());
        }

        private bool TryBindStaticLayout()
        {
            var staticCanvas = transform.Find("GameplayCanvas");
            if (staticCanvas == null) return false;
            canvas = staticCanvas.GetComponent<Canvas>();
            if (canvas == null) return false;
            scoreLabel = staticCanvas.Find("Score")?.GetComponent<Text>();
            timerLabel = staticCanvas.Find("Timer")?.GetComponent<Text>();
            levelLabel = staticCanvas.Find("Level")?.GetComponent<Text>();
            if (levelLabel != null)
            {
                // The serialized gameplay prefab defaults to "第1关". Always
                // overwrite it with the level selected by the scene router.
                levelLabel.text = "第" + level + "关";
                levelLabel.alignment = TextAnchor.MiddleCenter;
                levelLabel.alignByGeometry = true;
                levelLabel.horizontalOverflow = HorizontalWrapMode.Overflow;
                levelLabel.verticalOverflow = VerticalWrapMode.Overflow;
                levelLabel.rectTransform.anchorMin = new Vector2(.5f, .5f);
                levelLabel.rectTransform.anchorMax = new Vector2(.5f, .5f);
                levelLabel.rectTransform.pivot = new Vector2(.5f, .5f);
                levelLabel.rectTransform.sizeDelta = new Vector2(200, 60);
                levelLabel.rectTransform.anchoredPosition = new Vector2(0, 550);
            }
            progressLabel = staticCanvas.Find("Goal")?.GetComponent<Text>();
            var legacyGoal = staticCanvas.Find("Goal");
            if (legacyGoal != null)
            {
                Destroy(legacyGoal.gameObject);
                progressLabel = null;
            }
            legacyResultPanel = staticCanvas.Find("ResultPanel")?.gameObject;
            resultPanel = legacyResultPanel;
            pausePanel = staticCanvas.Find("PausePanel")?.gameObject;
            EnsurePausePanel(staticCanvas.transform);
            boardGrid = staticCanvas.Find("BoardGrid") ?? staticCanvas;
            for (var row = 0; row < Rows; row++)
                for (var column = 0; column < Columns; column++)
                {
                    var cell = boardGrid.Find("Cell_" + row + "_" + column);
                    if (cell == null) return false;
                    tileButtons[row, column] = cell.GetComponent<Button>();
                    tileImages[row, column] = cell.Find("Icon")?.GetComponent<Image>();
                    if (tileButtons[row, column] == null || tileImages[row, column] == null) return false;
            }
            EnsureResultPopups(staticCanvas.transform);
            EnsureSelectedRoleImage(staticCanvas.transform);
            return resultPanel != null && winResultPopup != null && loseResultPopup != null && pausePanel != null;
        }

        private void BindStaticButtons()
        {
            for (var row = 0; row < Rows; row++)
                for (var column = 0; column < Columns; column++)
                {
                    BindCellInput(tileButtons[row, column], row, column);
                }
            var pauseButton = canvas.transform.Find("PauseButton")?.GetComponent<Button>();
            if (pauseButton != null) { pauseButton.onClick.RemoveAllListeners(); pauseButton.onClick.AddListener(TogglePause); }
            BindResultButtons();
            var resume = FindPopupButton(pausePanel, "PrimaryBtn", "Resume");
            if (resume != null) { resume.onClick.RemoveAllListeners(); resume.onClick.AddListener(TogglePause); }
            var pauseBack = FindPopupButton(pausePanel, "BackBtn", "PauseBack");
            if (pauseBack != null) { pauseBack.onClick.RemoveAllListeners(); pauseBack.onClick.AddListener(ReturnToMain); }
        }

        private Button FindPopupButton(GameObject popup, string primaryName, string fallbackName)
        {
            if (popup == null) return null;
            var button = popup.transform.Find(primaryName)?.GetComponent<Button>() ?? popup.transform.Find("panel/" + primaryName)?.GetComponent<Button>() ?? popup.transform.Find("Panel/" + primaryName)?.GetComponent<Button>();
            return button ?? popup.transform.Find(fallbackName)?.GetComponent<Button>() ?? popup.transform.Find("panel/" + fallbackName)?.GetComponent<Button>() ?? popup.transform.Find("Panel/" + fallbackName)?.GetComponent<Button>();
        }

        private void BindCellInput(Button button, int row, int column)
        {
            if (button == null) return;
            button.onClick.RemoveAllListeners();
            var input = button.GetComponent<WishTownMatch3CellInput>() ?? button.gameObject.AddComponent<WishTownMatch3CellInput>();
            input.Bind(this, row, column);
        }

        internal void SwapFromDrag(int row, int column, Vector2 delta)
        {
            if (busy || paused || resultPanel == null || resultPanel.activeSelf || board[row, column] < 0) return;
            var targetRow = row;
            var targetColumn = column;
            if (Mathf.Abs(delta.x) >= Mathf.Abs(delta.y)) targetColumn += delta.x >= 0f ? 1 : -1;
            else targetRow += delta.y >= 0f ? -1 : 1;
            if (targetRow < 0 || targetRow >= Rows || targetColumn < 0 || targetColumn >= Columns || board[targetRow, targetColumn] < 0) return;
            StartCoroutine(SwapAndResolve(row, column, targetRow, targetColumn));
        }

        private void Update()
        {
            if (Input.GetKeyDown(KeyCode.Escape))
                TogglePause();
        }

        private void BuildCanvas()
        {
            EnsureEventSystem();
            var canvasObject = new GameObject("Match3Canvas", typeof(RectTransform), typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            canvasObject.transform.SetParent(transform, false);
            var canvasRect = canvasObject.GetComponent<RectTransform>();
            canvasRect.anchorMin = new Vector2(0.5f, 0.5f);
            canvasRect.anchorMax = new Vector2(0.5f, 0.5f);
            canvasRect.pivot = new Vector2(0.5f, 0.5f);
            canvasRect.anchoredPosition = Vector2.zero;
            canvasRect.sizeDelta = new Vector2(720f, 1280f);
            canvasRect.localScale = Vector3.one;
            canvas = canvasObject.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 20;
            var scaler = canvasObject.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(720, 1280);
            scaler.matchWidthOrHeight = 0f;
            BuildCanvasContents();
        }

        private void EnsureEventSystem()
        {
            if (EventSystem.current == null)
            {
                var eventObject = new GameObject("GameplayEventSystem", typeof(EventSystem), typeof(StandaloneInputModule));
                eventObject.transform.SetParent(transform, false);
            }
        }

        private void BuildCanvasContents()
        {

            var background = CreateImage("Background", canvas.transform, "HysjLegacy/NewImage/beijing", new Vector2(720, 1280), Vector2.zero);
            background.rectTransform.anchorMin = Vector2.zero;
            background.rectTransform.anchorMax = Vector2.one;
            background.rectTransform.offsetMin = Vector2.zero;
            background.rectTransform.offsetMax = Vector2.zero;

            var timerPlate = CreateImage("TimerPlate", canvas.transform, "HysjLegacy/NewImage/dikuang", new Vector2(155, 61), new Vector2(-236, 555));
            CreateImage("TimerIcon", canvas.transform, "HysjLegacy/NewImage/shijian", new Vector2(62, 83), new Vector2(-307, 555));
            timerLabel = CreateText("Timer", canvas.transform, "00:30", 30, new Vector2(125, 45), new Vector2(-225, 555), new Color32(225, 59, 59, 255), TextAnchor.MiddleCenter);
            timerLabel.fontStyle = FontStyle.Bold;

            CreateImage("LevelPlate", canvas.transform, "HysjLegacy/NewImage/dikuang2", new Vector2(245, 97), new Vector2(0, 562));
            levelLabel = CreateText("Level", canvas.transform, "第" + level + "关", 34, new Vector2(200, 60), new Vector2(0, 550), new Color32(224, 45, 102, 255), TextAnchor.MiddleCenter);
            levelLabel.fontStyle = FontStyle.Bold;
            levelLabel.alignByGeometry = true;
            levelLabel.horizontalOverflow = HorizontalWrapMode.Overflow;
            levelLabel.verticalOverflow = VerticalWrapMode.Overflow;
            levelLabel.rectTransform.anchorMin = new Vector2(.5f, .5f);
            levelLabel.rectTransform.anchorMax = new Vector2(.5f, .5f);
            levelLabel.rectTransform.pivot = new Vector2(.5f, .5f);
            levelLabel.rectTransform.anchoredPosition = new Vector2(0, 550);

            CreateImage("ScorePlate", canvas.transform, "HysjLegacy/NewImage/dikuang3", new Vector2(167, 106), new Vector2(245, 550));
            scoreLabel = CreateText("Score", canvas.transform, "0", 40, new Vector2(120, 48), new Vector2(245, 540), new Color32(222, 44, 103, 255), TextAnchor.MiddleCenter);
            scoreLabel.fontStyle = FontStyle.Bold;
            CreateText("ScoreTitle", canvas.transform, "分数", 20, new Vector2(90, 25), new Vector2(245, 576), new Color32(222, 44, 103, 255), TextAnchor.MiddleCenter);
            EnsureSelectedRoleImage(canvas.transform);

            CreateImage("StarPlate", canvas.transform, "HysjLegacy/NewImage/dikuang4", new Vector2(287, 48), new Vector2(0, 438));
            for (var i = 0; i < 3; i++)
                CreateImage("Star" + i, canvas.transform, "HysjLegacy/NewImage/xingxing2", new Vector2(58, 55), new Vector2((i - 1) * 75f, 438));
            CreateImage("PauseButton", canvas.transform, "HysjLegacy/NewImage/zanting", new Vector2(88, 91), new Vector2(-286, 447)).gameObject.AddComponent<Button>().onClick.AddListener(TogglePause);

            var frame = CreateImage("BoardFrame", canvas.transform, "HysjLegacy/NewImage/dafangkuang", new Vector2(615, 914), new Vector2(0, -122));
            frame.raycastTarget = false;
            EnsureResultPopups(canvas.transform);

            EnsurePausePanel(canvas.transform);
        }

        private void EnsureSelectedRoleImage(Transform parent)
        {
            if (parent == null) return;
            selectedRoleImage = parent.Find("SelectedRole")?.GetComponent<Image>();
            if (selectedRoleImage == null)
            {
                selectedRoleImage = CreateImage("SelectedRole", parent, string.Empty, Vector2.zero, Vector2.zero);
                selectedRoleImage.raycastTarget = false;
            }

            var role = HysjDataService.Current.currentRole;
            role = Mathf.Clamp(role, 0, roleSpritePaths.Length - 1);
            var sprite = Resources.Load<Sprite>(roleSpritePaths[role]);
            if (sprite == null)
            {
                selectedRoleImage.gameObject.SetActive(false);
                return;
            }

            selectedRoleImage.gameObject.SetActive(true);
            selectedRoleImage.sprite = sprite;
            selectedRoleImage.preserveAspect = true;
            selectedRoleImage.color = Color.white;
            var rect = selectedRoleImage.rectTransform;
            rect.anchorMin = rect.anchorMax = new Vector2(.5f, .5f);
            rect.pivot = new Vector2(.5f, .5f);
            // The reference composition places the selected pet below the score plate.
            // The static gameplay canvas inherits a reduced parent scale, so compensate
            // locally to match the pet's visible size in the reference image.
            var nativeSize = sprite.rect.size;
            var scale = Mathf.Min(.6f, 200f / Mathf.Max(1f, nativeSize.x), 240f / Mathf.Max(1f, nativeSize.y));
            rect.sizeDelta = nativeSize * scale;
            // Three times the authored UI size matches the effect image and lets
            // the board cover roughly the lower third of the enlarged pet.
            rect.localScale = Vector3.one * 3f;
            rect.anchoredPosition = new Vector2(250f, 405f);
            PlaceSelectedRoleBelowBoard(parent);
        }

        private void PlaceSelectedRoleBelowBoard(Transform parent)
        {
            if (selectedRoleImage == null || parent == null) return;
            var coverIndex = parent.childCount;
            var boardFrame = parent.Find("BoardFrame");
            var board = parent.Find("BoardGrid");
            if (boardFrame != null) coverIndex = Mathf.Min(coverIndex, boardFrame.GetSiblingIndex());
            if (board != null) coverIndex = Mathf.Min(coverIndex, board.GetSiblingIndex());
            if (coverIndex < parent.childCount)
                selectedRoleImage.transform.SetSiblingIndex(coverIndex);
        }

        private void BuildBoard()
        {
            boardGrid = new GameObject("BoardGrid", typeof(RectTransform)).transform;
            boardGrid.SetParent(canvas.transform, false);
            var gridRect = boardGrid.GetComponent<RectTransform>();
            gridRect.anchorMin = gridRect.anchorMax = new Vector2(.5f, .5f);
            gridRect.sizeDelta = new Vector2(720, 1280);
            gridRect.anchoredPosition = Vector2.zero;
            var types = Mathf.Clamp(levelConfig.element_type_count, 3, iconPaths.Length);
            for (var row = 0; row < Rows; row++)
            {
                for (var column = 0; column < Columns; column++)
                {
                    if (row < PlayableTopRow)
                    {
                        board[row, column] = -1;
                        var emptyButton = CreateButton("Cell_" + row + "_" + column, boardGrid, string.Empty, new Vector2(CellSize, CellSize), new Vector2(BoardLeft + column * CellSize, BoardTop - row * CellSize), Color.clear);
                        emptyButton.transition = Selectable.Transition.None;
                        BindCellInput(emptyButton, row, column);
                        tileButtons[row, column] = emptyButton;
                        var emptyIcon = CreateImage("Icon", emptyButton.transform, string.Empty, new Vector2(59, 62), Vector2.zero);
                        emptyIcon.raycastTarget = false;
                        tileImages[row, column] = emptyIcon;
                        continue;
                    }
                    var value = 0;
                    do
                    {
                        value = random.Next(types);
                    } while ((column >= 2 && board[row, column - 1] == value && board[row, column - 2] == value) ||
                             (row >= 2 && board[row - 1, column] == value && board[row - 2, column] == value));
                    board[row, column] = value;
                    var cellRow = row;
                    var cellColumn = column;
                    var button = CreateButton("Cell_" + cellRow + "_" + cellColumn, boardGrid, string.Empty, new Vector2(CellSize, CellSize), new Vector2(BoardLeft + cellColumn * CellSize, BoardTop - cellRow * CellSize), Color.clear);
                    button.transition = Selectable.Transition.None;
                    BindCellInput(button, cellRow, cellColumn);
                    tileButtons[cellRow, cellColumn] = button;
                    var icon = CreateImage("Icon", button.transform, IconPath(value), new Vector2(59, 62), Vector2.zero);
                    icon.raycastTarget = false;
                    tileImages[cellRow, cellColumn] = icon;
                }
            }
        }

        private void InitializeStaticBoardState()
        {
            var types = Mathf.Clamp(levelConfig.element_type_count, 3, iconPaths.Length);
            for (var row = 0; row < Rows; row++)
                for (var column = 0; column < Columns; column++)
                {
                    if (row < PlayableTopRow)
                    {
                        board[row, column] = -1;
                        continue;
                    }
                    var value = 0;
                    do
                    {
                        value = random.Next(types);
                    } while ((column >= 2 && board[row, column - 1] == value && board[row, column - 2] == value) ||
                             (row >= 2 && board[row - 1, column] == value && board[row - 2, column] == value));
                    board[row, column] = value;
                }
        }

        private IEnumerator Clock()
        {
            while (true)
            {
                yield return null;
                if (busy || paused || resultPanel.activeSelf) continue;
                remaining -= Time.unscaledDeltaTime;
                if (remaining <= 0f)
                {
                    remaining = 0f;
                    UpdateHud();
                    Finish();
                }
                else UpdateHud();
            }
        }

        internal void SelectCell(int row, int column)
        {
            if (busy || paused || resultPanel.activeSelf) return;
            if (board[row, column] < 0) return;
            if (selectedRow < 0)
            {
                selectedRow = row;
                selectedColumn = column;
                tileImages[row, column].color = new Color32(255, 255, 255, 190);
                return;
            }

            var oldRow = selectedRow;
            var oldColumn = selectedColumn;
            tileImages[oldRow, oldColumn].color = Color.white;
            selectedRow = -1;
            selectedColumn = -1;
            if (board[row, column] < 0) return;
            if (Mathf.Abs(oldRow - row) + Mathf.Abs(oldColumn - column) != 1) return;
            StartCoroutine(SwapAndResolve(oldRow, oldColumn, row, column));
        }

        private IEnumerator SwapAndResolve(int firstRow, int firstColumn, int secondRow, int secondColumn)
        {
            busy = true;
            Swap(firstRow, firstColumn, secondRow, secondColumn);
            var matches = FindMatches();
            var valid = matches.Count > 0;
            Swap(firstRow, firstColumn, secondRow, secondColumn);

            // Match ltys: show the attempted swap first, then either settle it
            // or play the short return animation when it cannot make a triple.
            yield return AnimateSwap(firstRow, firstColumn, secondRow, secondColumn, valid);
            if (matches.Count == 0)
            {
                busy = false;
                yield break;
            }

            Swap(firstRow, firstColumn, secondRow, secondColumn);
            RedrawBoard();
            while (matches.Count > 0)
            {
                eliminatedCount += matches.Count;
                score += matches.Count * Mathf.Max(1, WishTownConfigService.ScorePerEliminatedElement);
                yield return AnimateEliminated(matches);
                foreach (var position in matches) board[position.x, position.y] = -1;
                var fallMoves = CollapseAndFill();
                PrepareFallVisuals(fallMoves);
                yield return AnimateFall(fallMoves);
                matches = FindMatches();
            }
            busy = false;
            UpdateHud();
        }

        private List<FallMove> CollapseAndFill()
        {
            var types = Mathf.Clamp(levelConfig.element_type_count, 3, iconPaths.Length);
            var moves = new List<FallMove>(Rows * Columns);
            for (var column = 0; column < Columns; column++)
            {
                var kept = new List<KeyValuePair<int, int>>(Rows);
                for (var row = Rows - 1; row >= PlayableTopRow; row--)
                    if (board[row, column] >= 0) kept.Add(new KeyValuePair<int, int>(board[row, column], row));

                var write = Rows - 1;
                for (var index = 0; index < kept.Count; index++)
                {
                    var item = kept[index];
                    board[write, column] = item.Key;
                    moves.Add(new FallMove(write, column, item.Value));
                    write--;
                }
                var spawnRow = PlayableTopRow - 1;
                while (write >= PlayableTopRow)
                {
                    board[write, column] = random.Next(types);
                    moves.Add(new FallMove(write, column, spawnRow));
                    write--;
                    spawnRow--;
                }
                for (var row = 0; row < PlayableTopRow; row++) board[row, column] = -1;
            }
            return moves;
        }

        private IEnumerator AnimateSwap(int firstRow, int firstColumn, int secondRow, int secondColumn, bool valid)
        {
            var first = tileButtons[firstRow, firstColumn]?.GetComponent<RectTransform>();
            var second = tileButtons[secondRow, secondColumn]?.GetComponent<RectTransform>();
            if (first == null || second == null) yield break;

            var firstPosition = first.anchoredPosition;
            var secondPosition = second.anchoredPosition;
            var duration = valid ? .10f : .08f;

            IEnumerator Move(Vector2 from, Vector2 to, float seconds)
            {
                var elapsed = 0f;
                while (elapsed < seconds)
                {
                    elapsed += Time.unscaledDeltaTime;
                    var t = Mathf.Clamp01(elapsed / seconds);
                    var eased = 1f - Mathf.Pow(1f - t, 3f);
                    first.anchoredPosition = Vector2.LerpUnclamped(from, to, eased);
                    second.anchoredPosition = Vector2.LerpUnclamped(to, from, eased);
                    yield return null;
                }
            }

            yield return Move(firstPosition, secondPosition, duration);
            if (!valid) yield return Move(secondPosition, firstPosition, duration);
            first.anchoredPosition = firstPosition;
            second.anchoredPosition = secondPosition;
        }

        private IEnumerator AnimateEliminated(List<Vector2Int> matches)
        {
            const float duration = .12f;
            var elapsed = 0f;
            while (elapsed < duration)
            {
                elapsed += Time.unscaledDeltaTime;
                var t = Mathf.Clamp01(elapsed / duration);
                var scale = Mathf.Lerp(1f, .82f, t);
                var alpha = Mathf.Lerp(1f, 0f, t);
                foreach (var position in matches)
                {
                    var image = tileImages[position.x, position.y];
                    if (image == null) continue;
                    image.rectTransform.localScale = Vector3.one * scale;
                    var color = image.color;
                    color.a = alpha;
                    image.color = color;
                }
                yield return null;
            }
        }

        private void PrepareFallVisuals(List<FallMove> moves)
        {
            for (var row = 0; row < Rows; row++)
                for (var column = 0; column < Columns; column++)
                {
                    var image = tileImages[row, column];
                    if (image == null) continue;
                    image.rectTransform.anchoredPosition = Vector2.zero;
                    image.rectTransform.localScale = Vector3.one;
                    image.color = Color.white;
                    var value = board[row, column];
                    image.sprite = value < 0 ? null : Resources.Load<Sprite>(IconPath(value));
                }

            foreach (var move in moves)
            {
                var image = tileImages[move.row, move.column];
                if (image == null) continue;
                var distance = move.sourceRow - move.row;
                image.rectTransform.anchoredPosition = new Vector2(0f, -distance * CellSize);
            }
        }

        private IEnumerator AnimateFall(List<FallMove> moves)
        {
            var durations = new float[moves.Count];
            var starts = new Vector2[moves.Count];
            var totalDuration = 0f;
            for (var i = 0; i < moves.Count; i++)
            {
                var move = moves[i];
                var distanceRows = Mathf.Abs(move.row - move.sourceRow);
                durations[i] = Mathf.Min(.36f, .10f + distanceRows * .055f);
                starts[i] = tileImages[move.row, move.column].rectTransform.anchoredPosition;
                totalDuration = Mathf.Max(totalDuration, durations[i]);
            }

            var elapsed = 0f;
            while (elapsed < totalDuration)
            {
                elapsed += Time.unscaledDeltaTime;
                for (var i = 0; i < moves.Count; i++)
                {
                    var move = moves[i];
                    var image = tileImages[move.row, move.column];
                    if (image == null) continue;
                    var t = Mathf.Clamp01(elapsed / Mathf.Max(.01f, durations[i]));
                    var eased = 1f - Mathf.Pow(1f - t, 3f);
                    image.rectTransform.anchoredPosition = Vector2.LerpUnclamped(starts[i], Vector2.zero, eased);
                }
                yield return null;
            }

            foreach (var move in moves)
            {
                var image = tileImages[move.row, move.column];
                if (image != null) image.rectTransform.anchoredPosition = Vector2.zero;
            }
        }

        private List<Vector2Int> FindMatches()
        {
            var matches = new HashSet<Vector2Int>();
            for (var row = 0; row < Rows; row++)
            {
                var start = 0;
                while (start < Columns)
                {
                    var value = board[row, start];
                    var end = start + 1;
                    while (end < Columns && value >= 0 && board[row, end] == value) end++;
                    if (value >= 0 && end - start >= 3)
                        for (var column = start; column < end; column++) matches.Add(new Vector2Int(row, column));
                    start = end;
                }
            }
            for (var column = 0; column < Columns; column++)
            {
                var start = 0;
                while (start < Rows)
                {
                    var value = board[start, column];
                    var end = start + 1;
                    while (end < Rows && value >= 0 && board[end, column] == value) end++;
                    if (value >= 0 && end - start >= 3)
                        for (var row = start; row < end; row++) matches.Add(new Vector2Int(row, column));
                    start = end;
                }
            }
            return new List<Vector2Int>(matches);
        }

        private void Swap(int firstRow, int firstColumn, int secondRow, int secondColumn)
        {
            var value = board[firstRow, firstColumn];
            board[firstRow, firstColumn] = board[secondRow, secondColumn];
            board[secondRow, secondColumn] = value;
        }

        private void RedrawBoard()
        {
            for (var row = 0; row < Rows; row++)
                for (var column = 0; column < Columns; column++)
                {
                    var value = board[row, column];
                    tileImages[row, column].sprite = value < 0 ? null : Resources.Load<Sprite>(IconPath(value));
                    tileImages[row, column].color = Color.white;
                }
        }

        private void UpdateHud()
        {
            if (scoreLabel != null) scoreLabel.text = score.ToString();
            if (levelLabel != null) levelLabel.text = "第" + level + "关";
            if (timerLabel != null)
            {
                var seconds = Mathf.CeilToInt(remaining);
                timerLabel.text = string.Format("{0:00}:{1:00}", seconds / 60, seconds % 60);
            }
            if (progressLabel != null) progressLabel.text = "目标 " + Mathf.Max(1, levelConfig.star_3_score) + "    当前 " + score;
            var stars = score >= levelConfig.star_3_score ? 3 : score >= levelConfig.star_2_score ? 2 : score >= levelConfig.star_1_score ? 1 : 0;
            for (var i = 0; i < 3; i++)
            {
                var star = canvas.transform.Find("Star" + i)?.GetComponent<Image>();
                if (star != null) star.sprite = Resources.Load<Sprite>("HysjLegacy/NewImage/" + (i < stars ? "xingxing1" : "xingxing2"));
            }
        }

        private void Finish()
        {
            if (resultPanel != null && resultPanel.activeSelf) return;
            busy = true;
            var stars = CalculateStars();
            var success = stars > 0;
            var reward = GetConfiguredStarReward(stars);
            var materialReward = reward == null ? 0 : Mathf.Max(0, reward.building_material_amount);
            var diamondReward = reward == null ? 0 : Mathf.Max(0, reward.diamond_amount);
            var popup = success ? winResultPopup : loseResultPopup;
            if (popup == null) return;
            resultPanel = popup;
            if (legacyResultPanel != null) legacyResultPanel.SetActive(false);
            if (success)
            {
                winBestDistanceLabel.text = "本关分数 " + score + "，消除 " + eliminatedCount + " 个方块。";
                winDistanceLabel.text = "获得";
                winGoldLabel.text = diamondReward.ToString() + "。";
                if (winMaterialLabel != null) winMaterialLabel.text = "建筑材料 +" + materialReward + "。";
                for (var i = 0; i < winStars.Length; i++)
                {
                    winStars[i].sprite = Resources.Load<Sprite>("HysjLegacy/NewImage/" + (i < stars ? "xingxing1" : "xingxing2"));
                    winStars[i].gameObject.SetActive(true);
                }
            }
            else
            {
                loseBestDistanceLabel.text = "当前分数 " + score + "，最低通关分数 " + Mathf.Max(1, levelConfig.star_1_score);
                loseDistanceLabel.text = "获得";
                loseGoldLabel.text = "0";
            }
            HysjDataService.RecordLevelResult(level, stars, score, success);
            popup.SetActive(true);
            if (success)
                HysjDataService.TryClaimWishTownSettlement(settlementId, materialReward, diamondReward);
        }

        private int CalculateStars()
        {
            return score >= levelConfig.star_3_score ? 3
                : score >= levelConfig.star_2_score ? 2
                : score >= levelConfig.star_1_score ? 1
                : 0;
        }

        private WishTownStarReward GetConfiguredStarReward(int stars)
        {
            if (stars <= 0 || levelConfig == null || levelConfig.star_rewards == null) return null;
            foreach (var reward in levelConfig.star_rewards)
                if (reward != null && reward.star == stars) return reward;

            Debug.LogError("关卡" + level + "缺少" + stars + "星奖励配置，本局不发放奖励。");
            return null;
        }

        private void TogglePause()
        {
            if (resultPanel.activeSelf) return;
            paused = !paused;
            pausePanel.SetActive(paused);
        }

        private void Restart()
        {
            if (!HysjSceneRouter.LoadMatch3(level)) ReturnToMain();
        }

        private void ReturnToMain()
        {
            HysjSceneRouter.LoadMain();
        }

        private void BindResultButtons()
        {
            BindResultButton(winResultPopup, "nextBtn", LoadNextLevel);
            BindResultButton(winResultPopup, "backBtn", ReturnToMain);
            BindResultButton(loseResultPopup, "retryBtn", Restart);
            BindResultButton(loseResultPopup, "backBtn", ReturnToMain);
        }

        private void BindResultButton(GameObject popup, string path, UnityEngine.Events.UnityAction action)
        {
            var button = FindPopupButton(popup, path, path);
            if (button == null) return;
            button.onClick.RemoveAllListeners();
            button.onClick.AddListener(action);
        }

        private void LoadNextLevel()
        {
            var nextLevel = level + 1;
            if (WishTownConfigService.GetLevel(nextLevel) == null) ReturnToMain();
            else if (!HysjSceneRouter.LoadMatch3(nextLevel)) ReturnToMain();
        }

        private void EnsureResultPopups(Transform parent)
        {
            if (winResultPopup == null) winResultPopup = parent.Find("WinResultPopup")?.gameObject;
            if (loseResultPopup == null) loseResultPopup = parent.Find("LoseResultPopup")?.gameObject;
            if (winResultPopup == null) winResultPopup = BuildResultPopup(parent, true);
            if (loseResultPopup == null) loseResultPopup = BuildResultPopup(parent, false);
            HysjFormalUiSkin.ApplyGameplayResultPopup(winResultPopup, true);
            HysjFormalUiSkin.ApplyGameplayResultPopup(loseResultPopup, false);
            EnsureWinMaterialLabel(winResultPopup);
            BindResultPopupReferences();
            if (legacyResultPanel != null) legacyResultPanel.SetActive(false);
            resultPanel = winResultPopup;
            BindResultButtons();
        }

        private void EnsurePausePanel(Transform parent)
        {
            if (pausePanel == null) pausePanel = parent.Find("PausePanel")?.gameObject;
            if (pausePanel != null && pausePanel.transform.Find("Panel/PrimaryBtn") == null && pausePanel.transform.Find("PrimaryBtn") == null)
            {
                pausePanel.SetActive(false);
                pausePanel = null;
            }
            if (pausePanel == null) pausePanel = BuildPausePopup(parent);
            var pausePanelImage = pausePanel.transform.Find("Panel")?.GetComponent<Image>();
            if (pausePanelImage != null)
            {
                pausePanelImage.sprite = Resources.Load<Sprite>("HysjLegacy/NewImage/tanchuang4");
                pausePanelImage.type = Image.Type.Sliced;
                pausePanelImage.preserveAspect = false;
                var pauseRect = pausePanelImage.rectTransform;
                pauseRect.anchorMin = pauseRect.anchorMax = new Vector2(.5f, .5f);
                pauseRect.pivot = new Vector2(.5f, .5f);
                pauseRect.sizeDelta = new Vector2(586, 393);
                pauseRect.anchoredPosition = Vector2.zero;
                pauseRect.localScale = Vector3.one;
            }
            var pauseTitleBand = pausePanel.transform.Find("Panel/TitleBand")?.GetComponent<Image>();
            if (pauseTitleBand != null)
            {
                pauseTitleBand.sprite = Resources.Load<Sprite>("HysjLegacy/image/biaotidi");
                pauseTitleBand.preserveAspect = true;
                pauseTitleBand.rectTransform.sizeDelta = new Vector2(270, 60);
                pauseTitleBand.rectTransform.anchoredPosition = new Vector2(0, 67);
            }
            var resume = FindPopupButton(pausePanel, "PrimaryBtn", "Resume");
            if (resume != null) { resume.onClick.RemoveAllListeners(); resume.onClick.AddListener(TogglePause); }
            var back = FindPopupButton(pausePanel, "BackBtn", "PauseBack");
            if (back != null) { back.onClick.RemoveAllListeners(); back.onClick.AddListener(ReturnToMain); }
            HysjFormalUiSkin.ApplyGameplayPausePopup(pausePanel);
            pausePanel.SetActive(false);
        }

        private GameObject BuildPausePopup(Transform parent)
        {
            var root = new GameObject("PausePanel", typeof(RectTransform));
            root.transform.SetParent(parent, false);
            var rootRect = root.GetComponent<RectTransform>();
            rootRect.anchorMin = Vector2.zero; rootRect.anchorMax = Vector2.one;
            rootRect.offsetMin = Vector2.zero; rootRect.offsetMax = Vector2.zero;
            var mask = CreateImage("遮罩", root.transform, "HysjLegacy/AtlasPicture/遮罩", new Vector2(2000, 2000), Vector2.zero);
            mask.color = new Color(1f, 1f, 1f, .72f); mask.raycastTarget = true;
            var panel = CreateImage("Panel", root.transform, "HysjLegacy/NewImage/tanchuang4", new Vector2(586, 393), Vector2.zero);
            panel.raycastTarget = true;
            CreateImage("TitleBand", panel.transform, "HysjLegacy/image/biaotidi", new Vector2(270, 60), new Vector2(0, 67));
            var title = CreateText("Title", panel.transform, "游戏暂停", 34, new Vector2(260, 58), new Vector2(0, 93), Color.white, TextAnchor.MiddleCenter);
            var outline = title.gameObject.AddComponent<Outline>();
            outline.effectColor = new Color32(126, 72, 69, 255);
            outline.effectDistance = new Vector2(2, -2);
            CreatePopupButton("BackBtn", panel.transform, "HysjLegacy/image2/anniufanhuizhujiemian", new Vector2(-110, -58), ReturnToMain);
            CreatePopupButton("PrimaryBtn", panel.transform, "HysjLegacy/image2/anniujixuyouxi", new Vector2(111, -58), TogglePause);
            root.SetActive(false);
            return root;
        }

        private void BindResultPopupReferences()
        {
            var winPanel = winResultPopup?.transform.Find("panel");
            var losePanel = loseResultPopup?.transform.Find("panel");
            winBestDistanceLabel = winPanel?.Find("BestDistanceLabel")?.GetComponent<Text>();
            winDistanceLabel = winPanel?.Find("DistanceLabel")?.GetComponent<Text>();
            winGoldLabel = winPanel?.Find("GoldLabel")?.GetComponent<Text>();
            winMaterialLabel = winPanel?.Find("MaterialLabel")?.GetComponent<Text>();
            loseBestDistanceLabel = losePanel?.Find("BestDistanceLabel")?.GetComponent<Text>();
            loseDistanceLabel = losePanel?.Find("DistanceLabel")?.GetComponent<Text>();
            loseGoldLabel = losePanel?.Find("GoldLabel")?.GetComponent<Text>();
            if (winPanel != null)
            {
                winStars = new Image[3];
                for (var i = 0; i < winStars.Length; i++)
                    winStars[i] = winPanel.Find("Stars/star" + (i + 1))?.GetComponent<Image>();
            }
        }

        private void EnsureWinMaterialLabel(GameObject popup)
        {
            if (popup == null) return;
            var panel = popup.transform.Find("panel") ?? popup.transform.Find("Panel");
            if (panel == null) return;

            winMaterialLabel = panel.Find("MaterialLabel")?.GetComponent<Text>();
            if (winMaterialLabel == null)
                winMaterialLabel = CreateText("MaterialLabel", panel, string.Empty, 24,
                    new Vector2(400, 40), new Vector2(0, -84),
                    new Color32(160, 1, 52, 255), TextAnchor.MiddleCenter);

            winMaterialLabel.alignment = TextAnchor.MiddleCenter;
            winMaterialLabel.alignByGeometry = true;
            winMaterialLabel.horizontalOverflow = HorizontalWrapMode.Overflow;
            winMaterialLabel.verticalOverflow = VerticalWrapMode.Overflow;
            winMaterialLabel.resizeTextForBestFit = true;
            winMaterialLabel.rectTransform.anchorMin = winMaterialLabel.rectTransform.anchorMax = new Vector2(.5f, .5f);
            winMaterialLabel.rectTransform.pivot = new Vector2(.5f, .5f);
            winMaterialLabel.rectTransform.sizeDelta = new Vector2(400, 40);
            winMaterialLabel.rectTransform.anchoredPosition = new Vector2(0, -84);
            winMaterialLabel.gameObject.SetActive(true);
        }

        private GameObject BuildResultPopup(Transform parent, bool success)
        {
            var root = new GameObject(success ? "WinResultPopup" : "LoseResultPopup", typeof(RectTransform));
            root.transform.SetParent(parent, false);
            var rootRect = root.GetComponent<RectTransform>();
            rootRect.anchorMin = Vector2.zero;
            rootRect.anchorMax = Vector2.one;
            rootRect.offsetMin = Vector2.zero;
            rootRect.offsetMax = Vector2.zero;

            var mask = CreateImage("遮罩", root.transform, "HysjLegacy/AtlasPicture/遮罩", new Vector2(2000, 2000), Vector2.zero);
            mask.color = new Color(1f, 1f, 1f, .72f);
            mask.raycastTarget = true;

            var panel = CreateImage("panel", root.transform, "HysjLegacy/NewImage/tanchuang2",
                new Vector2(586, 668), new Vector2(0, -8));
            panel.raycastTarget = true;
            var panelTransform = panel.transform;
            CreateImage("dikuangyouxijiesu", panelTransform,
                success ? "HysjLegacy/image2/dikuangyouxichenggong" : "HysjLegacy/image2/dikuangshibai",
                new Vector2(411, 211), new Vector2(1.5f, -17.5f));

            var resultColor = new Color32(160, 1, 52, 255);
            var best = CreateText("BestDistanceLabel", panelTransform, string.Empty, 24, new Vector2(400, 40), new Vector2(0, 33), resultColor, TextAnchor.MiddleCenter);
            var distance = CreateText("DistanceLabel", panelTransform, string.Empty, 24, new Vector2(70, 40), new Vector2(-66, -34), resultColor, TextAnchor.MiddleCenter);
            var gold = CreateText("GoldLabel", panelTransform, string.Empty, 24, new Vector2(90, 40), new Vector2(96, -34), resultColor, TextAnchor.MiddleCenter);
            CreateImage("RewardDiamond", panelTransform, "HysjLegacy/NewImage2/zuanshi", new Vector2(79, 65), new Vector2(11.5f, -37.5f));

            if (success)
            {
                var stars = new GameObject("Stars", typeof(RectTransform));
                stars.transform.SetParent(panelTransform, false);
                var starsRect = stars.GetComponent<RectTransform>();
                starsRect.anchorMin = starsRect.anchorMax = new Vector2(.5f, .5f);
                starsRect.sizeDelta = new Vector2(244, 75);
                starsRect.anchoredPosition = new Vector2(0, 145.5f);
                winStars = new Image[3];
                for (var i = 0; i < 3; i++)
                {
                    winStars[i] = CreateImage("star" + (i + 1), stars.transform, "HysjLegacy/NewImage/xingxing2", new Vector2(77, 75), new Vector2(-80.5f + i * 81f, 0));
                }
                CreatePopupButton("backBtn", panelTransform, "HysjLegacy/image2/anniufanhuizhujiemian", new Vector2(-117, -201), ReturnToMain);
                CreatePopupButton("nextBtn", panelTransform, "HysjLegacy/image2/anniuxiayiguan", new Vector2(104, -201), LoadNextLevel);
                winBestDistanceLabel = best;
                winDistanceLabel = distance;
                winGoldLabel = gold;
            }
            else
            {
                CreatePopupButton("backBtn", panelTransform, "HysjLegacy/image2/anniufanhuizhujiemian", new Vector2(-117, -201), ReturnToMain);
                CreatePopupButton("retryBtn", panelTransform, "HysjLegacy/image2/anniuchognxintiaozhan", new Vector2(104, -201), Restart);
                loseBestDistanceLabel = best;
                loseDistanceLabel = distance;
                loseGoldLabel = gold;
            }
            root.SetActive(false);
            return root;
        }

        private Button CreatePopupButton(string name, Transform parent, string resource, Vector2 position, UnityEngine.Events.UnityAction action)
        {
            var buttonObject = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button));
            buttonObject.transform.SetParent(parent, false);
            var rect = buttonObject.GetComponent<RectTransform>();
            rect.anchorMin = rect.anchorMax = new Vector2(.5f, .5f);
            rect.sizeDelta = new Vector2(201, 81);
            rect.anchoredPosition = position;
            var image = buttonObject.GetComponent<Image>();
            image.sprite = Resources.Load<Sprite>(resource);
            image.preserveAspect = true;
            var button = buttonObject.GetComponent<Button>();
            button.targetGraphic = image;
            button.onClick.AddListener(action);
            return button;
        }

        private string IconPath(int value)
        {
            return iconPaths[Mathf.Abs(value) % iconPaths.Length];
        }

        private GameObject CreateOverlay(string name)
        {
            var panel = new GameObject(name, typeof(RectTransform), typeof(Image));
            panel.transform.SetParent(canvas.transform, false);
            var rect = panel.GetComponent<RectTransform>();
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            var image = panel.GetComponent<Image>();
            image.color = new Color(0.12f, 0.05f, 0.16f, .94f);
            return panel;
        }

        private Image CreateImage(string name, Transform parent, string resource, Vector2 size, Vector2 position)
        {
            var node = new GameObject(name, typeof(RectTransform), typeof(Image));
            node.transform.SetParent(parent, false);
            var rect = node.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(.5f, .5f);
            rect.anchorMax = new Vector2(.5f, .5f);
            rect.pivot = new Vector2(.5f, .5f);
            rect.sizeDelta = size;
            rect.anchoredPosition = position;
            var image = node.GetComponent<Image>();
            image.sprite = Resources.Load<Sprite>(resource);
            image.preserveAspect = true;
            return image;
        }

        private Text CreateText(string name, Transform parent, string value, int size, Vector2 dimensions, Vector2 position, Color color, TextAnchor alignment)
        {
            var node = new GameObject(name, typeof(RectTransform), typeof(Text));
            node.transform.SetParent(parent, false);
            var rect = node.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(.5f, .5f);
            rect.anchorMax = new Vector2(.5f, .5f);
            rect.sizeDelta = dimensions;
            rect.anchoredPosition = position;
            var text = node.GetComponent<Text>();
            text.text = value;
            text.font = Font.CreateDynamicFontFromOSFont(new[] { "Microsoft YaHei", "Arial" }, size) ?? Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            text.fontSize = size;
            text.color = color;
            text.alignment = alignment;
            text.resizeTextForBestFit = true;
            text.raycastTarget = false;
            return text;
        }

        private Button CreateButton(string name, Transform parent, string label, Vector2 size, Vector2 position, Color color)
        {
            var node = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button));
            node.transform.SetParent(parent, false);
            var rect = node.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(.5f, .5f);
            rect.anchorMax = new Vector2(.5f, .5f);
            rect.sizeDelta = size;
            rect.anchoredPosition = position;
            var image = node.GetComponent<Image>();
            image.color = color;
            var button = node.GetComponent<Button>();
            button.targetGraphic = image;
            if (!string.IsNullOrEmpty(label))
            {
                var text = CreateText("Label", node.transform, label, 24, size - new Vector2(12, 8), Vector2.zero, Color.white, TextAnchor.MiddleCenter);
                text.fontStyle = FontStyle.Bold;
            }
            return button;
        }
    }

    internal sealed class WishTownMatch3CellInput : MonoBehaviour, IPointerDownHandler, IPointerUpHandler, IPointerClickHandler
    {
        private WishTownMatch3Gameplay owner;
        private int row;
        private int column;
        private Vector2 pointerDownPosition;
        private bool dragged;

        public void Bind(WishTownMatch3Gameplay gameplay, int cellRow, int cellColumn)
        {
            owner = gameplay;
            row = cellRow;
            column = cellColumn;
        }

        public void OnPointerDown(PointerEventData eventData)
        {
            pointerDownPosition = eventData.position;
            dragged = false;
        }

        public void OnPointerUp(PointerEventData eventData)
        {
            var delta = eventData.position - pointerDownPosition;
            if (delta.sqrMagnitude < 22f * 22f) return;
            dragged = true;
            owner?.SwapFromDrag(row, column, delta);
        }

        public void OnPointerClick(PointerEventData eventData)
        {
            if (dragged) return;
            owner?.SelectCell(row, column);
        }
    }
}
