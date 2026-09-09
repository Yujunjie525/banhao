using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace Hysj
{
    [RequireComponent(typeof(CanvasRenderer))]
    public sealed class GardenWaterFlowGraphic : MaskableGraphic
    {
        private readonly List<Vector2> points = new List<Vector2>();
        private readonly List<float> distances = new List<float>();
        private readonly List<int> routePointSamples = new List<int>();
        private float totalDistance;
        private const int SamplesPerCell = 6;

        public float Width { get; set; } = 38f;

        public void SetPath(IList<Vector2> path)
        {
            points.Clear();
            distances.Clear();
            routePointSamples.Clear();
            totalDistance = 0f;
            if (path != null && path.Count > 1)
            {
                points.Add(path[0]);
                routePointSamples.Add(0);
                for (var segment = 0; segment < path.Count - 1; segment++)
                {
                    var p0 = path[Mathf.Max(0, segment - 1)];
                    var p1 = path[segment];
                    var p2 = path[segment + 1];
                    var p3 = path[Mathf.Min(path.Count - 1, segment + 2)];
                    for (var sample = 1; sample <= SamplesPerCell; sample++)
                    {
                        var t = sample / (float)SamplesPerCell;
                        points.Add(CatmullRom(p0, p1, p2, p3, t));
                    }
                    routePointSamples.Add(points.Count - 1);
                }

                ApplyNaturalMeander();
                for (var i = 0; i < points.Count; i++)
                {
                    if (i > 0) totalDistance += Vector2.Distance(points[i - 1], points[i]);
                    distances.Add(totalDistance);
                }
            }
            SetVerticesDirty();
        }

        public float NormalizedDistanceAt(int pointIndex)
        {
            if (totalDistance <= 0f || pointIndex < 0 || pointIndex >= routePointSamples.Count) return 0f;
            var sampleIndex = Mathf.Clamp(routePointSamples[pointIndex], 0, distances.Count - 1);
            return distances[sampleIndex] / totalDistance;
        }

        public void SetReveal(float value)
        {
            if (material != null) material.SetFloat("_Reveal", Mathf.Clamp01(value));
        }

        protected override void OnPopulateMesh(VertexHelper vertexHelper)
        {
            vertexHelper.Clear();
            if (points.Count < 2 || totalDistance <= 0f) return;

            for (var i = 0; i < points.Count; i++)
            {
                var previousDirection = i == 0
                    ? (points[1] - points[0]).normalized
                    : (points[i] - points[i - 1]).normalized;
                var nextDirection = i == points.Count - 1
                    ? previousDirection
                    : (points[i + 1] - points[i]).normalized;
                var previousNormal = new Vector2(-previousDirection.y, previousDirection.x);
                var nextNormal = new Vector2(-nextDirection.y, nextDirection.x);
                var miter = previousNormal + nextNormal;
                if (miter.sqrMagnitude < .001f) miter = nextNormal;
                else miter.Normalize();
                var u = distances[i] / totalDistance;
                var denominator = Mathf.Abs(Vector2.Dot(miter, nextNormal));
                var leftWidth = Width * .5f * (1f + Mathf.Sin(u * 37.1f + .4f) * .10f + Mathf.Sin(u * 91.7f) * .035f);
                var rightWidth = Width * .5f * (1f + Mathf.Sin(u * 29.3f + 2.1f) * .09f + Mathf.Sin(u * 83.9f + 1.4f) * .04f);
                var leftOffset = miter * (leftWidth / Mathf.Max(.72f, denominator));
                var rightOffset = miter * (rightWidth / Mathf.Max(.72f, denominator));
                leftOffset = Vector2.ClampMagnitude(leftOffset, leftWidth * 1.36f);
                rightOffset = Vector2.ClampMagnitude(rightOffset, rightWidth * 1.36f);

                AddVertex(vertexHelper, points[i] + leftOffset, new Vector2(u, 1f));
                AddVertex(vertexHelper, points[i] - rightOffset, new Vector2(u, 0f));
                if (i == 0) continue;
                var first = (i - 1) * 2;
                vertexHelper.AddTriangle(first, first + 2, first + 1);
                vertexHelper.AddTriangle(first + 1, first + 2, first + 3);
            }
        }

        private void ApplyNaturalMeander()
        {
            if (points.Count < 3) return;
            for (var i = 1; i < points.Count - 1; i++)
            {
                var tangent = (points[i + 1] - points[i - 1]).normalized;
                var normal = new Vector2(-tangent.y, tangent.x);
                var progress = i / (float)(points.Count - 1);
                var offset = Mathf.Sin(progress * 31.7f + .8f) * 2.4f + Mathf.Sin(progress * 73.3f + 2.2f) * .9f;
                points[i] += normal * offset;
            }
        }

        private static Vector2 CatmullRom(Vector2 p0, Vector2 p1, Vector2 p2, Vector2 p3, float t)
        {
            var t2 = t * t;
            var t3 = t2 * t;
            return .5f * ((2f * p1) + (-p0 + p2) * t + (2f * p0 - 5f * p1 + 4f * p2 - p3) * t2 + (-p0 + 3f * p1 - 3f * p2 + p3) * t3);
        }

        private void AddVertex(VertexHelper helper, Vector2 position, Vector2 uv)
        {
            var vertex = UIVertex.simpleVert;
            vertex.position = position;
            vertex.color = color;
            vertex.uv0 = uv;
            helper.AddVert(vertex);
        }
    }
}
