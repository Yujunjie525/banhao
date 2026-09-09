using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace Hysj
{
    /// <summary>Standalone falling-block side mode. Its board and canvas never coexist with match-three.</summary>
    public sealed class WishTownBlocksGameplay : MonoBehaviour
    {
        private const int Columns = WishTownBoardLayout.Columns;
        private const int Rows = WishTownBoardLayout.Rows;
        private const float CellSize = WishTownBoardLayout.CellSize;
        private const float BoardLeft = WishTownBoardLayout.BoardLeft;
        // Keep the side-mode board on the same authored composition as match-three.
        private const float BoardTop = WishTownBoardLayout.BoardTop;
        private const float BoardShiftUp = 60f;
        private const float PreviewCellSize = CellSize * .6f;
        private const float PreviewCenterY = 445f;
        private readonly int[,] locked = new int[Rows, Columns];
        private readonly Image[,] cells = new Image[Rows, Columns];
        private readonly List<Vector2Int>[] shapes =
        {
            new List<Vector2Int> { new Vector2Int(0, 1), new Vector2Int(1, 1), new Vector2Int(2, 1), new Vector2Int(3, 1) },
            new List<Vector2Int> { new Vector2Int(0, 0), new Vector2Int(1, 0), new Vector2Int(0, 1), new Vector2Int(1, 1) },
            new List<Vector2Int> { new Vector2Int(1, 0), new Vector2Int(0, 1), new Vector2Int(1, 1), new Vector2Int(2, 1) },
            new List<Vector2Int> { new Vector2Int(1, 0), new Vector2Int(2, 0), new Vector2Int(0, 1), new Vector2Int(1, 1) },
            new List<Vector2Int> { new Vector2Int(0, 0), new Vector2Int(1, 0), new Vector2Int(1, 1), new Vector2Int(2, 1) },
            new List<Vector2Int> { new Vector2Int(0, 0), new Vector2Int(0, 1), new Vector2Int(1, 1), new Vector2Int(2, 1) },
            new List<Vector2Int> { new Vector2Int(2, 0), new Vector2Int(0, 1), new Vector2Int(1, 1), new Vector2Int(2, 1) }
        };
        private readonly System.Random random = new System.Random();
        private readonly Sprite[] styleSprites = new Sprite[7];
        private readonly Image[] nextPieceCells = new Image[4];
        private Canvas canvas;
        private Text scoreLabel;
        private Text resultLabel;
        private GameObject resultPanel;
        private GameObject pausePanel;
        private Transform nextPiecePreview;
        private WishTownSideModeConfig config;
        private int pieceType;
        private int nextPieceType;
        private bool hasNextPiece;
        private int rotation;
        private Vector2Int piecePosition;
        private float fallTimer;
        private int score;
        private int lines;
        private int speedLevel = 1;
        private bool paused;
        private bool ended;

        private void Awake()
        {
            config = WishTownConfigService.GetSideMode() ?? new WishTownSideModeConfig();
            LoadStyleSprites();
            for (var row = 0; row < Rows; row++)
                for (var column = 0; column < Columns; column++) locked[row, column] = -1;
            EnsureEventSystem();
            if (!TryBindStaticLayout())
            {
                BuildCanvas();
                BuildBoard();
            }
            else BindStaticButtons();
            SpawnPiece();
        }

        private bool TryBindStaticLayout()
        {
            var staticCanvas = transform.Find("GameplayCanvas");
            if (staticCanvas == null) return false;
            canvas = staticCanvas.GetComponent<Canvas>();
            if (canvas == null) return false;
            scoreLabel = staticCanvas.Find("Score")?.GetComponent<Text>();
            resultPanel = staticCanvas.Find("ResultPanel")?.gameObject;
            if (resultPanel != null)
            {
                EnsureStyledResultPopup(resultPanel);
                HysjFormalUiSkin.ApplyGameplayResultPopup(resultPanel, false);
                NormalizeResultText(resultPanel);
            }
            resultLabel = resultPanel?.transform.Find("panel/Result")?.GetComponent<Text>() ?? resultPanel?.transform.Find("Result")?.GetComponent<Text>();
            pausePanel = staticCanvas.Find("PausePanel")?.gameObject;
            EnsurePausePanel(staticCanvas);
            for (var row = 0; row < Rows; row++)
                for (var column = 0; column < Columns; column++)
                {
                    var cell = staticCanvas.Find("Cell_" + row + "_" + column)?.GetComponent<Image>();
                    if (cell == null) return false;
                    cells[row, column] = cell;
            }
            NormalizeStaticBoardLayout(staticCanvas);
            EnsureNextPiecePreview(staticCanvas);
            return resultPanel != null && resultLabel != null && pausePanel != null;
        }

        private void NormalizeStaticBoardLayout(Transform staticCanvas)
        {
            NormalizeGameplayHud(staticCanvas);
            var boardPanel = staticCanvas.Find("BoardPanel")?.GetComponent<RectTransform>();
            if (boardPanel != null)
            {
                boardPanel.sizeDelta = new Vector2(615f, 914f);
                boardPanel.anchoredPosition = new Vector2(0f, -122f + BoardShiftUp);
                var boardImage = boardPanel.GetComponent<Image>();
                if (boardImage != null)
                {
                    boardImage.sprite = Resources.Load<Sprite>("HysjLegacy/NewImage/dafangkuang");
                    boardImage.color = Color.white;
                    boardImage.preserveAspect = true;
                    boardImage.raycastTarget = false;
                }
            }
            foreach (Transform child in staticCanvas)
            {
                if (!child.name.StartsWith("Cell_", System.StringComparison.Ordinal)) continue;
                var parts = child.name.Split('_');
                if (parts.Length != 3 || !int.TryParse(parts[1], out var row) || !int.TryParse(parts[2], out var column)) continue;
                var active = row >= 0 && row < Rows && column >= 0 && column < Columns;
                child.gameObject.SetActive(active);
                if (!active) continue;
                var rect = child.GetComponent<RectTransform>();
                if (rect == null) continue;
                rect.sizeDelta = new Vector2(CellSize, CellSize);
                rect.anchoredPosition = new Vector2(BoardLeft + column * CellSize, BoardTop + BoardShiftUp - row * CellSize);
                var image = child.GetComponent<Image>();
                if (image != null)
                {
                    // The main-mode board frame already contains the authored
                    // 8x12 rounded grid cells. Keep these runtime cells
                    // transparent so they only render falling-block sprites.
                    image.sprite = null;
                    image.color = Color.clear;
                    image.raycastTarget = false;
                    var outline = child.GetComponent<Outline>();
                    if (outline != null) outline.enabled = false;
                }
            }
        }

        private void NormalizeGameplayHud(Transform staticCanvas)
        {
            SetVisible(staticCanvas, "Timer", false);
            SetVisible(staticCanvas, "TimerPlate", false);
            SetVisible(staticCanvas, "TimerIcon", false);
            SetVisible(staticCanvas, "StarPlate", false);
            SetVisible(staticCanvas, "Star0", false);
            SetVisible(staticCanvas, "Star1", false);
            SetVisible(staticCanvas, "Star2", false);
            SetVisible(staticCanvas, "Hint", false);

            var background = staticCanvas.Find("Background")?.GetComponent<Image>();
            if (background != null)
            {
                background.sprite = Resources.Load<Sprite>("HysjLegacy/NewImage/beijing");
                background.color = Color.white;
                background.preserveAspect = true;
            }

            SetPosition(staticCanvas, "LevelPlate", new Vector2(0f, 562f), new Vector2(245f, 97f));
            SetPosition(staticCanvas, "Level", new Vector2(0f, 550f), new Vector2(200f, 60f));
            SetPosition(staticCanvas, "ScorePlate", new Vector2(245f, 550f), new Vector2(167f, 106f));
            SetPosition(staticCanvas, "ScoreTitle", new Vector2(245f, 576f), new Vector2(90f, 25f));
            SetPosition(staticCanvas, "Score", new Vector2(245f, 540f), new Vector2(120f, 48f));
            SetVisible(staticCanvas, "SpeedPlate", false);
            SetVisible(staticCanvas, "Speed", false);
            SetVisible(staticCanvas, "Lines", false);
            SetPosition(staticCanvas, "PauseButton", new Vector2(-286f, 447f), new Vector2(88f, 91f));
            SetPosition(staticCanvas, "Left", new Vector2(-180f, -585f), new Vector2(112f, 58f));
            SetPosition(staticCanvas, "Right", new Vector2(-60f, -585f), new Vector2(112f, 58f));
            SetPosition(staticCanvas, "Rotate", new Vector2(60f, -585f), new Vector2(112f, 58f));
            SetPosition(staticCanvas, "Drop", new Vector2(180f, -585f), new Vector2(112f, 58f));

            var level = staticCanvas.Find("Level")?.GetComponent<Text>();
            if (level != null) level.fontSize = 34;
            var scoreTitle = staticCanvas.Find("ScoreTitle")?.GetComponent<Text>();
            if (scoreTitle != null) scoreTitle.fontSize = 20;
            var score = staticCanvas.Find("Score")?.GetComponent<Text>();
            if (score != null) score.fontSize = 40;
        }

        private static void SetVisible(Transform parent, string name, bool visible)
        {
            var node = parent.Find(name);
            if (node != null) node.gameObject.SetActive(visible);
        }

        private static void SetPosition(Transform parent, string name, Vector2 position, Vector2 size)
        {
            var node = parent.Find(name);
            var rect = node?.GetComponent<RectTransform>();
            if (rect == null) return;
            rect.anchorMin = rect.anchorMax = new Vector2(.5f, .5f);
            rect.anchoredPosition = position;
            rect.sizeDelta = size;
        }

        private void BindStaticButtons()
        {
            var pauseButton = canvas.transform.Find("PauseButton")?.GetComponent<Button>();
            if (pauseButton != null) { pauseButton.onClick.RemoveAllListeners(); pauseButton.onClick.AddListener(TogglePause); }
            var retry = FindButton(resultPanel, "retryBtn", "Retry");
            if (retry != null) { retry.onClick.RemoveAllListeners(); retry.onClick.AddListener(Restart); }
            var back = FindButton(resultPanel, "backBtn", "Back");
            if (back != null) { back.onClick.RemoveAllListeners(); back.onClick.AddListener(ReturnToMain); }
            var resume = FindButton(pausePanel, "PrimaryBtn", "Resume");
            if (resume != null) { resume.onClick.RemoveAllListeners(); resume.onClick.AddListener(TogglePause); }
            var pauseBack = FindButton(pausePanel, "BackBtn", "PauseBack");
            if (pauseBack != null) { pauseBack.onClick.RemoveAllListeners(); pauseBack.onClick.AddListener(EndCurrentGame); }
            HysjFormalUiSkin.ApplyGameplayPausePopup(pausePanel, true);
            BindControl("Left", () => Move(-1, 0));
            BindControl("Rotate", Rotate);
            BindControl("Right", () => Move(1, 0));
            BindControl("Drop", DropOne);
        }

        private void BindControl(string name, UnityEngine.Events.UnityAction action)
        {
            var button = canvas.transform.Find(name)?.GetComponent<Button>();
            if (button == null) return;
            button.onClick.RemoveAllListeners();
            button.onClick.AddListener(action);
        }

        private void EnsureEventSystem()
        {
            if (EventSystem.current != null) return;
            var eventObject = new GameObject("GameplayEventSystem", typeof(EventSystem), typeof(StandaloneInputModule));
            eventObject.transform.SetParent(transform, false);
        }

        private Button FindButton(GameObject root, params string[] names)
        {
            if (root == null) return null;
            foreach (var name in names)
            {
                var direct = root.transform.Find(name)?.GetComponent<Button>();
                if (direct != null) return direct;
                var nested = root.transform.Find("panel/" + name)?.GetComponent<Button>();
                if (nested != null) return nested;
                var capitalNested = root.transform.Find("Panel/" + name)?.GetComponent<Button>();
                if (capitalNested != null) return capitalNested;
            }
            return null;
        }

        private void EnsurePausePanel(Transform parent)
        {
            if (pausePanel == null) pausePanel = parent.Find("PausePanel")?.gameObject;
            // Older side-mode prefabs used PausePanel itself as a dark full-screen
            // overlay and placed Resume/PauseBack directly under it. Require the
            // authored Panel hierarchy so that legacy layouts are replaced by the
            // same compact popup used by the main mode.
            if (pausePanel != null && (pausePanel.transform.Find("Panel/PrimaryBtn") == null || pausePanel.transform.Find("Panel/BackBtn") == null))
            {
                pausePanel.SetActive(false);
                pausePanel = null;
            }
            if (pausePanel == null) pausePanel = BuildPausePopup(parent);

            var resume = FindButton(pausePanel, "PrimaryBtn", "Resume");
            if (resume != null)
            {
                resume.onClick.RemoveAllListeners();
                resume.onClick.AddListener(TogglePause);
            }
            var back = FindButton(pausePanel, "BackBtn", "PauseBack");
            if (back != null)
            {
                back.onClick.RemoveAllListeners();
                back.onClick.AddListener(EndCurrentGame);
            }
            HysjFormalUiSkin.ApplyGameplayPausePopup(pausePanel, true);
            pausePanel.SetActive(false);
        }

        private GameObject BuildPausePopup(Transform parent)
        {
            var root = new GameObject("PausePanel", typeof(RectTransform));
            root.transform.SetParent(parent, false);
            var rootRect = root.GetComponent<RectTransform>();
            rootRect.anchorMin = Vector2.zero;
            rootRect.anchorMax = Vector2.one;
            rootRect.offsetMin = Vector2.zero;
            rootRect.offsetMax = Vector2.zero;

            var mask = CreateImage("遮罩", root.transform, "HysjLegacy/AtlasPicture/遮罩", new Vector2(2000, 2000), Vector2.zero, Color.white);
            mask.color = new Color(1f, 1f, 1f, .72f);
            mask.raycastTarget = true;
            var panel = CreateImage("Panel", root.transform, "HysjLegacy/NewImage/tanchuang4", new Vector2(586, 393), Vector2.zero, Color.white);
            panel.raycastTarget = true;
            CreateImage("TitleBand", panel.transform, "HysjLegacy/image/biaotidi", new Vector2(270, 60), new Vector2(0, 67), Color.white);
            CreateText("Title", panel.transform, "游戏暂停", 34, new Vector2(260, 58), new Vector2(0, 93), Color.white, TextAnchor.MiddleCenter);
            var endGameButton = CreatePopupButton("BackBtn", panel.transform, "HysjLegacy/NewImage3/anniukong", new Vector2(-110, -58));
            var endGameLabel = CreateText("Label", endGameButton.transform, "结束游戏", 24,
                new Vector2(190, 58), Vector2.zero, Color.white, TextAnchor.MiddleCenter);
            endGameLabel.fontStyle = FontStyle.Bold;
            var endGameOutline = endGameLabel.gameObject.AddComponent<Outline>();
            endGameOutline.effectColor = new Color32(117, 46, 141, 255);
            endGameOutline.effectDistance = new Vector2(2, -2);
            CreatePopupButton("PrimaryBtn", panel.transform, "HysjLegacy/image2/anniujixuyouxi", new Vector2(111, -58));
            root.SetActive(false);
            return root;
        }

        private void Update()
        {
            if (Input.GetKeyDown(KeyCode.Escape)) TogglePause();
            if (paused || ended) return;
            if (Input.GetKeyDown(KeyCode.LeftArrow)) Move(-1, 0);
            if (Input.GetKeyDown(KeyCode.RightArrow)) Move(1, 0);
            if (Input.GetKeyDown(KeyCode.DownArrow)) DropOne();
            if (Input.GetKeyDown(KeyCode.UpArrow)) Rotate();
            fallTimer += Time.unscaledDeltaTime;
            if (fallTimer >= FallInterval())
            {
                fallTimer = 0f;
                DropOne();
            }
        }

        private void BuildCanvas()
        {
            EnsureEventSystem();
            var canvasObject = new GameObject("BlocksCanvas", typeof(RectTransform), typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
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

            var background = CreateImage("Background", canvas.transform, "HysjLegacy/NewImage/beijing", new Vector2(720, 1280), Vector2.zero, Color.white);
            background.rectTransform.anchorMin = Vector2.zero;
            background.rectTransform.anchorMax = Vector2.one;
            background.rectTransform.offsetMin = Vector2.zero;
            background.rectTransform.offsetMax = Vector2.zero;
            background.color = Color.white;

            CreateImage("LevelPlate", canvas.transform, "HysjLegacy/NewImage/dikuang2", new Vector2(245, 97), new Vector2(0, 562), Color.white);
            CreateText("Level", canvas.transform, "星愿方块", 30, new Vector2(210, 55), new Vector2(0, 550), new Color32(224, 45, 102, 255), TextAnchor.MiddleCenter);
            CreateImage("ScorePlate", canvas.transform, "HysjLegacy/NewImage/dikuang3", new Vector2(167, 106), new Vector2(245, 550), Color.white);
            CreateText("ScoreTitle", canvas.transform, "分数", 20, new Vector2(90, 25), new Vector2(245, 576), new Color32(222, 44, 103, 255), TextAnchor.MiddleCenter);
            scoreLabel = CreateText("Score", canvas.transform, "0", 40, new Vector2(120, 48), new Vector2(245, 540), new Color32(222, 44, 103, 255), TextAnchor.MiddleCenter);
            scoreLabel.fontStyle = FontStyle.Bold;
            EnsureNextPiecePreview(canvas.transform);
            CreateImage("PauseButton", canvas.transform, "HysjLegacy/NewImage/zanting", new Vector2(88, 91), new Vector2(-286, 447), Color.white).gameObject.AddComponent<Button>().onClick.AddListener(TogglePause);
            resultPanel = CreateResultPopup();
            resultLabel = resultPanel.transform.Find("panel/Result")?.GetComponent<Text>();
            HysjFormalUiSkin.ApplyGameplayResultPopup(resultPanel, false);
            NormalizeResultText(resultPanel);

            pausePanel = BuildPausePopup(canvas.transform);
            EnsurePausePanel(canvas.transform);

            CreateButton("Left", canvas.transform, "左", new Vector2(112, 58), new Vector2(-180, -585), new Color32(214, 89, 147, 230)).onClick.AddListener(() => Move(-1, 0));
            CreateButton("Right", canvas.transform, "右", new Vector2(112, 58), new Vector2(-60, -585), new Color32(214, 89, 147, 230)).onClick.AddListener(() => Move(1, 0));
            CreateButton("Rotate", canvas.transform, "旋转", new Vector2(112, 58), new Vector2(60, -585), new Color32(214, 89, 147, 230)).onClick.AddListener(Rotate);
            CreateButton("Drop", canvas.transform, "下落", new Vector2(112, 58), new Vector2(180, -585), new Color32(214, 89, 147, 230)).onClick.AddListener(DropOne);
        }

        private void BuildBoard()
        {
            var panel = CreateImage("BoardPanel", canvas.transform, "HysjLegacy/NewImage/dafangkuang", new Vector2(615, 914), new Vector2(0, -122 + BoardShiftUp), Color.white);
            panel.raycastTarget = false;
            for (var row = 0; row < Rows; row++)
                for (var column = 0; column < Columns; column++)
                {
                    var cell = CreateImage("Cell_" + row + "_" + column, canvas.transform, null, new Vector2(CellSize, CellSize), new Vector2(BoardLeft + column * CellSize, BoardTop + BoardShiftUp - row * CellSize), Color.clear);
                    cell.raycastTarget = false;
                    cells[row, column] = cell;
                }
        }

        private void SpawnPiece()
        {
            if (!hasNextPiece)
            {
                pieceType = random.Next(shapes.Length);
                nextPieceType = random.Next(shapes.Length);
                hasNextPiece = true;
            }
            else
            {
                pieceType = nextPieceType;
                nextPieceType = random.Next(shapes.Length);
            }
            rotation = 0;
            var found = false;
            for (var column = 0; column < Columns && !found; column++)
            {
                var candidate = new Vector2Int(column, 0);
                if (!CanPlace(candidate, rotation)) continue;
                piecePosition = candidate;
                found = true;
            }
            if (!found) { EndGame(); return; }
            UpdateNextPiecePreview();
            Redraw();
        }

        private void Move(int dx, int dy)
        {
            var next = piecePosition + new Vector2Int(dx, dy);
            if (!CanPlace(next, rotation)) return;
            piecePosition = next;
            Redraw();
        }

        private void DropOne()
        {
            if (ended || paused) return;
            // Board rows increase from top to bottom, so a falling piece advances to the next row.
            var next = piecePosition + Vector2Int.up;
            if (CanPlace(next, rotation)) piecePosition = next;
            else LockPiece();
            Redraw();
        }

        private void Rotate()
        {
            var nextRotation = (rotation + 1) % 4;
            if (!CanPlace(piecePosition, nextRotation)) return;
            rotation = nextRotation;
            Redraw();
        }

        private bool CanPlace(Vector2Int position, int targetRotation)
        {
            foreach (var cell in RotatedShape(targetRotation))
            {
                var x = position.x + cell.x;
                var y = position.y + cell.y;
                if (x < 0 || x >= Columns || y < 0 || y >= Rows) return false;
                if (locked[y, x] >= 0) return false;
            }
            return true;
        }

        private List<Vector2Int> RotatedShape(int targetRotation)
        {
            var result = new List<Vector2Int>();
            foreach (var source in shapes[pieceType])
            {
                var value = source;
                for (var i = 0; i < targetRotation; i++) value = new Vector2Int(-value.y, value.x);
                result.Add(value);
            }
            var minX = int.MaxValue;
            var minY = int.MaxValue;
            foreach (var value in result) { minX = Mathf.Min(minX, value.x); minY = Mathf.Min(minY, value.y); }
            for (var i = 0; i < result.Count; i++) result[i] -= new Vector2Int(minX, minY);
            return result;
        }

        private void LockPiece()
        {
            foreach (var cell in RotatedShape(rotation))
            {
                var x = piecePosition.x + cell.x;
                var y = piecePosition.y + cell.y;
                if (x >= 0 && x < Columns && y >= 0 && y < Rows) locked[y, x] = pieceType;
            }
            ClearLines();
            SpawnPiece();
        }

        private void ClearLines()
        {
            var cleared = 0;
            for (var row = Rows - 1; row >= 0; row--)
            {
                var full = true;
                for (var column = 0; column < Columns; column++) if (locked[row, column] < 0) { full = false; break; }
                if (!full) continue;
                cleared++;
                for (var moveRow = row; moveRow > 0; moveRow--)
                    for (var column = 0; column < Columns; column++) locked[moveRow, column] = locked[moveRow - 1, column];
                for (var column = 0; column < Columns; column++) locked[0, column] = -1;
                row++;
            }
            if (cleared <= 0) return;
            lines += cleared;
            score += cleared;
            speedLevel = Mathf.Clamp(1 + lines / Mathf.Max(1, config.lines_per_speed_level), 1, Mathf.Max(1, config.max_speed_level));
            UpdateHud();
        }

        private void Redraw()
        {
            for (var row = 0; row < Rows; row++)
                for (var column = 0; column < Columns; column++)
                {
                    cells[row, column].sprite = null;
                    cells[row, column].color = Color.clear;
                }
            for (var row = 0; row < Rows; row++)
                for (var column = 0; column < Columns; column++) DrawBlock(row, column, locked[row, column]);
            if (!ended)
                foreach (var cell in RotatedShape(rotation)) DrawBlock(piecePosition.y + cell.y, piecePosition.x + cell.x, pieceType);
            UpdateHud();
        }

        private void DrawBlock(int row, int column, int value)
        {
            if (row < 0 || row >= Rows || column < 0 || column >= Columns || value < 0) return;
            var sprite = value < styleSprites.Length ? styleSprites[value] : null;
            cells[row, column].sprite = sprite;
            cells[row, column].color = sprite == null ? Color.clear : Color.white;
        }

        private void LoadStyleSprites()
        {
            for (var style = 0; style < styleSprites.Length; style++)
                styleSprites[style] = Resources.Load<Sprite>("HysjLegacy/NewImage/icon/" + (style + 1));
        }

        private void EnsureNextPiecePreview(Transform parent)
        {
            if (parent == null) return;
            nextPiecePreview = parent.Find("NextPiecePreview");
            if (nextPiecePreview == null)
            {
                var node = new GameObject("NextPiecePreview", typeof(RectTransform));
                node.transform.SetParent(parent, false);
                nextPiecePreview = node.transform;
            }

            var previewRect = nextPiecePreview.GetComponent<RectTransform>();
            previewRect.anchorMin = previewRect.anchorMax = new Vector2(.5f, .5f);
            previewRect.pivot = new Vector2(.5f, .5f);
            previewRect.sizeDelta = new Vector2(240f, 190f);
            previewRect.anchoredPosition = new Vector2(0f, PreviewCenterY);
            previewRect.localScale = Vector3.one;

            for (var i = 0; i < nextPieceCells.Length; i++)
            {
                var child = nextPiecePreview.Find("Cell_" + i);
                if (child == null)
                {
                    var image = CreateImage("Cell_" + i, nextPiecePreview, null, new Vector2(PreviewCellSize, PreviewCellSize), Vector2.zero, Color.clear);
                    image.raycastTarget = false;
                    nextPieceCells[i] = image;
                }
                else
                {
                    var image = child.GetComponent<Image>();
                    nextPieceCells[i] = image;
                    if (image != null)
                    {
                        image.raycastTarget = false;
                        image.rectTransform.sizeDelta = new Vector2(PreviewCellSize, PreviewCellSize);
                    }
                }
            }
            nextPiecePreview.gameObject.SetActive(true);
        }

        private void UpdateNextPiecePreview()
        {
            if (nextPiecePreview == null) return;
            var shape = shapes[Mathf.Clamp(nextPieceType, 0, shapes.Length - 1)];
            var minX = int.MaxValue; var maxX = int.MinValue;
            var minY = int.MaxValue; var maxY = int.MinValue;
            foreach (var cell in shape)
            {
                minX = Mathf.Min(minX, cell.x); maxX = Mathf.Max(maxX, cell.x);
                minY = Mathf.Min(minY, cell.y); maxY = Mathf.Max(maxY, cell.y);
            }
            var width = (maxX - minX + 1) * PreviewCellSize;
            var height = (maxY - minY + 1) * PreviewCellSize;
            for (var i = 0; i < nextPieceCells.Length; i++)
            {
                var image = nextPieceCells[i];
                if (image == null) continue;
                if (i >= shape.Count)
                {
                    image.gameObject.SetActive(false);
                    continue;
                }
                var cell = shape[i];
                var rect = image.rectTransform;
                rect.sizeDelta = new Vector2(PreviewCellSize, PreviewCellSize);
                rect.anchoredPosition = new Vector2(
                    (cell.x - minX + .5f) * PreviewCellSize - width * .5f,
                    -((cell.y - minY + .5f) * PreviewCellSize - height * .5f));
                image.sprite = styleSprites[Mathf.Clamp(nextPieceType, 0, styleSprites.Length - 1)];
                image.color = image.sprite == null ? Color.clear : Color.white;
                image.gameObject.SetActive(true);
            }
        }

        private float FallInterval()
        {
            var initial = config.initial_fall_interval_sec <= 0 ? .8f : config.initial_fall_interval_sec;
            var step = Mathf.Max(0f, config.fall_interval_step_sec);
            var minimum = config.minimum_fall_interval_sec <= 0 ? .12f : config.minimum_fall_interval_sec;
            return Mathf.Max(minimum, initial - (speedLevel - 1) * step);
        }

        private void UpdateHud()
        {
            if (scoreLabel != null) scoreLabel.text = score.ToString();
        }

        private static void NormalizeResultText(GameObject popup)
        {
            var result = popup?.transform.Find("panel/Result")?.GetComponent<Text>()
                ?? popup?.transform.Find("Panel/Result")?.GetComponent<Text>();
            if (result == null) return;
            result.gameObject.SetActive(true);
            result.color = new Color32(160, 1, 52, 255);
            result.fontSize = 24;
            result.fontStyle = FontStyle.Normal;
            result.alignment = TextAnchor.MiddleCenter;
            result.alignByGeometry = true;
            result.horizontalOverflow = HorizontalWrapMode.Overflow;
            result.verticalOverflow = VerticalWrapMode.Overflow;
            result.raycastTarget = false;
            var rect = result.rectTransform;
            rect.anchorMin = rect.anchorMax = new Vector2(.5f, .5f);
            rect.pivot = new Vector2(.5f, .5f);
            rect.sizeDelta = new Vector2(360f, 145f);
            // Center the multiline side-mode result inside the same pink
            // reward frame used by the main-mode result popup.
            rect.anchoredPosition = new Vector2(0f, -17.5f);
            var outline = result.GetComponent<Outline>();
            if (outline != null) outline.enabled = false;
            var shadow = result.GetComponent<Shadow>();
            if (shadow != null) shadow.enabled = false;
        }

        private void EndGame()
        {
            if (ended) return;
            ended = true;
            resultLabel.text = "挑战结束\n分数 " + score +"。" + "\n消除 " + lines + " 行。";
            resultPanel.SetActive(true);
            HysjDataService.RecordWishTownBlocksMaterial(score / 500);
        }

        private void TogglePause()
        {
            if (ended) return;
            paused = !paused;
            pausePanel.SetActive(paused);
        }

        private void EndCurrentGame()
        {
            paused = false;
            if (pausePanel != null) pausePanel.SetActive(false);
            EndGame();
        }

        private void Restart()
        {
            if (!HysjSceneRouter.LoadBlocks()) ReturnToMain();
        }
        private void ReturnToMain() { HysjSceneRouter.LoadMain(); }

        private GameObject CreateResultPopup()
        {
            var root = new GameObject("ResultPanel", typeof(RectTransform));
            root.transform.SetParent(canvas.transform, false);
            var rootRect = root.GetComponent<RectTransform>();
            rootRect.anchorMin = Vector2.zero; rootRect.anchorMax = Vector2.one;
            rootRect.offsetMin = Vector2.zero; rootRect.offsetMax = Vector2.zero;

            var mask = CreateImage("遮罩", root.transform, "HysjLegacy/AtlasPicture/遮罩", new Vector2(2000, 2000), Vector2.zero, Color.white);
            mask.color = new Color(1f, 1f, 1f, .72f); mask.raycastTarget = true;
            var panel = CreateImage("panel", root.transform, "HysjLegacy/NewImage/tanchuang2", new Vector2(586, 668), Vector2.zero, Color.white);
            panel.raycastTarget = true;
            CreateImage("dikuangyouxijiesu", panel.transform, "HysjLegacy/image2/dikuangshibai", new Vector2(424, 197), new Vector2(0, -61), Color.white);
            CreateText("Result", panel.transform, string.Empty, 30, new Vector2(390, 120), new Vector2(0, 20), Color.white, TextAnchor.MiddleCenter);
            CreatePopupButton("backBtn", panel.transform, "HysjLegacy/image2/anniufanhuizhujiemian", new Vector2(-108, -264));
            CreatePopupButton("retryBtn", panel.transform, "HysjLegacy/image2/anniuchognxintiaozhan", new Vector2(108, -264));
            root.SetActive(false);
            return root;
        }

        private void EnsureStyledResultPopup(GameObject root)
        {
            if (root == null || root.transform.Find("panel") != null) return;
            var oldImage = root.GetComponent<Image>();
            if (oldImage != null) { oldImage.sprite = Resources.Load<Sprite>("HysjLegacy/AtlasPicture/遮罩"); oldImage.color = new Color(1f, 1f, 1f, .72f); oldImage.raycastTarget = true; }
            for (var i = 0; i < root.transform.childCount; i++) root.transform.GetChild(i).gameObject.SetActive(false);
            var panel = CreateImage("panel", root.transform, "HysjLegacy/NewImage/tanchuang2", new Vector2(586, 668), Vector2.zero, Color.white);
            panel.raycastTarget = true;
            CreateImage("dikuangyouxijiesu", panel.transform, "HysjLegacy/image2/dikuangshibai", new Vector2(424, 197), new Vector2(0, -61), Color.white);
            CreateText("Result", panel.transform, string.Empty, 30, new Vector2(390, 120), new Vector2(0, 20), Color.white, TextAnchor.MiddleCenter);
            CreatePopupButton("backBtn", panel.transform, "HysjLegacy/image2/anniufanhuizhujiemian", new Vector2(-108, -264));
            CreatePopupButton("retryBtn", panel.transform, "HysjLegacy/image2/anniuchognxintiaozhan", new Vector2(108, -264));
        }

        private Button CreatePopupButton(string name, Transform parent, string resource, Vector2 position)
        {
            var node = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button));
            node.transform.SetParent(parent, false);
            var rect = node.GetComponent<RectTransform>();
            rect.anchorMin = rect.anchorMax = new Vector2(.5f, .5f);
            rect.sizeDelta = new Vector2(201, 81); rect.anchoredPosition = position;
            var image = node.GetComponent<Image>(); image.sprite = Resources.Load<Sprite>(resource); image.preserveAspect = true;
            var button = node.GetComponent<Button>(); button.targetGraphic = image; button.transition = Selectable.Transition.None;
            return button;
        }

        private Image CreateImage(string name, Transform parent, string resource, Vector2 size, Vector2 position, Color color)
        {
            var node = new GameObject(name, typeof(RectTransform), typeof(Image)); node.transform.SetParent(parent, false);
            var rect = node.GetComponent<RectTransform>(); rect.anchorMin = new Vector2(.5f, .5f); rect.anchorMax = new Vector2(.5f, .5f); rect.sizeDelta = size; rect.anchoredPosition = position;
            var image = node.GetComponent<Image>(); image.color = color; image.preserveAspect = true; if (!string.IsNullOrEmpty(resource)) image.sprite = Resources.Load<Sprite>(resource); return image;
        }

        private Text CreateText(string name, Transform parent, string value, int size, Vector2 dimensions, Vector2 position, Color color, TextAnchor alignment)
        {
            var node = new GameObject(name, typeof(RectTransform), typeof(Text)); node.transform.SetParent(parent, false);
            var rect = node.GetComponent<RectTransform>(); rect.anchorMin = new Vector2(.5f, .5f); rect.anchorMax = new Vector2(.5f, .5f); rect.sizeDelta = dimensions; rect.anchoredPosition = position;
            var text = node.GetComponent<Text>(); text.text = value; text.font = Font.CreateDynamicFontFromOSFont(new[] { "Microsoft YaHei", "Arial" }, size) ?? Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf"); text.fontSize = size; text.color = color; text.alignment = alignment; text.resizeTextForBestFit = true; text.raycastTarget = false; return text;
        }

        private Button CreateButton(string name, Transform parent, string label, Vector2 size, Vector2 position, Color color)
        {
            var node = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button)); node.transform.SetParent(parent, false);
            var rect = node.GetComponent<RectTransform>(); rect.anchorMin = new Vector2(.5f, .5f); rect.anchorMax = new Vector2(.5f, .5f); rect.sizeDelta = size; rect.anchoredPosition = position;
            var image = node.GetComponent<Image>(); image.color = color; var button = node.GetComponent<Button>(); button.targetGraphic = image;
            if (!string.IsNullOrEmpty(label)) { var text = CreateText("Label", node.transform, label, 24, size - new Vector2(12, 8), Vector2.zero, Color.white, TextAnchor.MiddleCenter); text.fontStyle = FontStyle.Bold; }
            return button;
        }
    }
}
