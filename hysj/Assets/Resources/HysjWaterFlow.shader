Shader "UI/HysjWaterFlow"
{
    Properties
    {
        [PerRendererData] _MainTex ("Sprite Texture", 2D) = "white" {}
        _DeepColor ("Deep Water", Color) = (0.035, 0.42, 0.68, 1)
        _ShallowColor ("Shallow Water", Color) = (0.20, 0.78, 0.94, 1)
        _FoamColor ("Flow Highlight", Color) = (0.82, 0.98, 1, 1)
        _Speed ("Flow Speed", Float) = 0.7
        _Reveal ("Reveal", Range(0, 1)) = 1
        _StencilComp ("Stencil Comparison", Float) = 8
        _Stencil ("Stencil ID", Float) = 0
        _StencilOp ("Stencil Operation", Float) = 0
        _StencilWriteMask ("Stencil Write Mask", Float) = 255
        _StencilReadMask ("Stencil Read Mask", Float) = 255
        _ColorMask ("Color Mask", Float) = 15
        [Toggle(UNITY_UI_ALPHACLIP)] _UseUIAlphaClip ("Use Alpha Clip", Float) = 0
    }

    SubShader
    {
        Tags
        {
            "Queue" = "Transparent"
            "IgnoreProjector" = "True"
            "RenderType" = "Transparent"
            "PreviewType" = "Plane"
            "CanUseSpriteAtlas" = "True"
        }

        Stencil
        {
            Ref [_Stencil]
            Comp [_StencilComp]
            Pass [_StencilOp]
            ReadMask [_StencilReadMask]
            WriteMask [_StencilWriteMask]
        }

        Cull Off
        Lighting Off
        ZWrite Off
        ZTest [unity_GUIZTestMode]
        Blend SrcAlpha OneMinusSrcAlpha
        ColorMask [_ColorMask]

        Pass
        {
            Name "WaterFlow"
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma target 2.0
            #include "UnityCG.cginc"
            #include "UnityUI.cginc"
            #pragma multi_compile_local _ UNITY_UI_CLIP_RECT
            #pragma multi_compile_local _ UNITY_UI_ALPHACLIP

            struct appdata_t
            {
                float4 vertex : POSITION;
                fixed4 color : COLOR;
                float2 texcoord : TEXCOORD0;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            struct v2f
            {
                float4 vertex : SV_POSITION;
                fixed4 color : COLOR;
                float2 texcoord : TEXCOORD0;
                float4 worldPosition : TEXCOORD1;
                UNITY_VERTEX_OUTPUT_STEREO
            };

            sampler2D _MainTex;
            fixed4 _TextureSampleAdd;
            fixed4 _DeepColor;
            fixed4 _ShallowColor;
            fixed4 _FoamColor;
            float4 _ClipRect;
            float _Speed;
            float _Reveal;

            v2f vert(appdata_t input)
            {
                v2f output;
                UNITY_SETUP_INSTANCE_ID(input);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(output);
                output.worldPosition = input.vertex;
                output.vertex = UnityObjectToClipPos(input.vertex);
                output.texcoord = input.texcoord;
                output.color = input.color;
                return output;
            }

            fixed4 frag(v2f input) : SV_Target
            {
                float2 uv = input.texcoord;
                float time = _Time.y * _Speed;
                float cross = uv.y * 2.0 - 1.0;
                float bankShift = sin(uv.x * 19.7 + 1.3) * 0.035 + sin(uv.x * 47.3) * 0.014;
                float bankWidth = 0.91 + sin(uv.x * 23.1 + 2.0) * 0.045 + sin(uv.x * 61.7) * 0.018;
                float side = abs(cross - bankShift);
                float alpha = 1.0 - smoothstep(bankWidth - 0.13, bankWidth, side);

                float broadFlow = sin(uv.x * 25.0 - time * 4.8 + sin(uv.y * 5.0 + time) * 0.65);
                float brokenFlow = sin(uv.x * 53.0 - time * 7.2 + uv.y * 8.0 + sin(uv.x * 11.0) * 1.2);
                float waterMix = saturate(0.48 + broadFlow * 0.12 + brokenFlow * 0.055 - side * 0.08);
                float highlight = smoothstep(0.78, 0.98, broadFlow * 0.55 + brokenFlow * 0.45);
                fixed4 water = lerp(_DeepColor, _ShallowColor, waterMix);
                water.rgb = lerp(water.rgb, _FoamColor.rgb, highlight * 0.22 * saturate(1.0 - side));
                alpha *= 1.0 - smoothstep(_Reveal, _Reveal + 0.012, uv.x);

                fixed4 textureColor = tex2D(_MainTex, uv) + _TextureSampleAdd;
                fixed4 color = water * input.color;
                color.a *= textureColor.a * alpha;

                #ifdef UNITY_UI_CLIP_RECT
                color.a *= UnityGet2DClipping(input.worldPosition.xy, _ClipRect);
                #endif

                #ifdef UNITY_UI_ALPHACLIP
                clip(color.a - 0.001);
                #endif

                return color;
            }
            ENDCG
        }
    }
}
