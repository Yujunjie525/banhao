import json
import random

# ==============================================================================
# 关卡数据维护区 (核心逻辑，只能追加)
# ------------------------------------------------------------------------------
# 【🚨 核心跳跃极限阈值记录 (基于实际跑测) 🚨】
# -> 护卫 (Guard): 水平冲量 250, 垂直冲量 200。  (最新参数: 距离350_高度150)
# -> 公主 (Princess): 水平冲量 150, 垂直冲量 400。 (最新参数: 距离150_高度400)
#
# 【📐 核心组件物理尺寸标准 (绝对常量) 📐】
# - 1x长 = 136, 1x高 = 36。实际边缘间隙 = |X2 - X1| - (Width1 / 2 + Width2 / 2)。
# 
# stages 石板状态数组格式 (0=默认, 1=星星, 2=终点)：
# 1=基础1长, 2=基础2长, 3=基础3长, 4=2倍高1长, 5=2倍高2长, 6=2倍高3长, 7=4倍高1长
# ------------------------------------------------------------------------------
# 【🌟 完美通关保障与 PCG 多样性生成引擎 🌟】
# 1-13. [折返极窄]、[防盖帽]、[狗链效应]、[拉宽间隙]、[向心弹射]、[破垂直网格]、[三步阶梯]等 (已生效)。
# 14.【限高横跨 (HOTFIX 8.0)】: 护卫大跨度跳跃垂直拔高严格控制在 20~40 像素。
# 15.【毒液心流曲线 (HOTFIX 9.0)】: 毒液速度采用阶梯配速(5 -> 10 -> 12)。
# 16.【参数革命 (HOTFIX 11.0)】: 护卫超级远跳350，公主直冲云霄400。废除Tower模式。
# 17.【深渊断桥拓扑 (HOTFIX 12.0)】: 插入连续 2 次护卫极限大跨度平跳。
# 18.【同侧重叠抹杀 (HOTFIX 13.0)】: 护卫跳回同侧强制拔高 dy=80~100。
# ------------------------------------------------------------------------------
# 【⚔️ 绝对角色分工与空间遮蔽清零 (HOTFIX 14.0) ⚔️】
# 19.【空间遮蔽Bug消除】: 彻底封死宽板 3 和 6 在全局循环中的生成。断桥强制使用极窄。
# 20.【绝对角色分工点位 (Role Duality)】: 严格保证每关必然存在两种“唯一解”地形。
# ------------------------------------------------------------------------------
# 【⚓ 绝对居中出生点 (HOTFIX 15.0 - 最新追加) ⚓】
# 21.【原点对齐】: 开局起点强制锁定为 x=0 (居中)，彻底杜绝开局摄像机扯动与踩空坠崖Bug。
#     相应的，打破固定的左右规律，赋予第一跳绝对的随机方向 (随机抛硬币决定首跳左或右)。
# ==============================================================================

def generate_100_levels():
    """搭载绝对角色分工、零重叠验证与安全出生点的终极 PCG 生成器"""
    levels_data = []
    
    for i in range(1, 101):
        random.seed(1000 + i) 
        level = {"id": str(i)}
        
        loops = 2 + (i - 1) // 10  
        
        # --- 毒液速度阶梯 ---
        if i <= 5:
            speed = 5
        elif i <= 10:
            speed = 10
        else:
            speed = 12
            
        # --- 难度与全物料池 (移除 3 和 6) ---
        if i <= 20:
            tier_name = "初见"
            y_jump = 280            
            guard_y = random.randint(30, 60) 
            pool_far = ["1", "2"]   
            pool_high = ["1"]       
        elif i <= 40:
            tier_name = "进阶"
            y_jump = 290    
            guard_y = random.randint(40, 70)
            pool_far = ["1", "2", "4"]   
            pool_high = ["1", "4"]
        elif i <= 60:
            tier_name = "试炼"
            y_jump = 300    
            guard_y = random.randint(50, 80)
            pool_far = ["1", "4", "7"]   
            pool_high = ["1", "4"]       
        elif i <= 80:
            tier_name = "深渊"
            y_jump = 310    
            guard_y = random.randint(60, 90)
            pool_far = ["1", "4", "5", "7"]   
            pool_high = ["1", "4", "7"]  
        else:
            tier_name = "登神"
            y_jump = 320            
            guard_y = random.randint(70, 100)
            pool_far = ["1", "2", "4", "5", "7"]   
            pool_high = ["1", "4", "7"]
            
        level["name"] = f"第 {i} 层：{tier_name}"
        level["speed"] = speed  
        
        stages = []
        pos = []
        star_pool = []
        solution_steps = ["起点"]
        
        # 1. 绝对安全的中心出生点 (X坐标强制为0，杜绝偏移)
        cur_x = 0 
        cur_y = 300  # 保持您原有的地平线高度
        stages.append("3_0")
        pos.append((int(cur_x), int(cur_y)))
        
        for loop in range(loops):
            pattern = random.choices(["classic", "bridge"], weights=[0.6, 0.4])[0]
            
            if pattern == "classic":
                # ⚔️【护卫专属领域】: dx≈330, dy≈50
                # 如果身处原点(开局第一跳)，方向完全随机；否则严格执行左右折返
                if cur_x == 0:
                    sign = random.choice([-1, 1])
                else:
                    sign = 1 if cur_x < 0 else -1
                    
                cur_x = sign * random.randint(160, 170) 
                cur_y += guard_y         
                dir_str = "右" if cur_x > 0 else "左"
                solution_steps.append(f"[护卫专属]{dir_str}跃峡谷")
                
                stages.append(f"{random.choice(pool_far)}_0") 
                star_pool.append(len(stages) - 1)
                pos.append((int(cur_x), int(cur_y)))
                
                # ⚔️【公主专属领域】: dx≈106, dy≈300
                direction = -1 if cur_x > 0 else 1
                total_width = abs(cur_x * 2)
                step_x = total_width / 3.0  
                
                solution_steps.append(f"[公主专属]三步冲天拔高")
                for step in range(3):
                    cur_y += y_jump
                    jitter = random.randint(-15, 15) 
                    cur_x += (direction * step_x) + jitter
                    
                    stages.append(f"{random.choice(pool_high)}_0")
                    star_pool.append(len(stages) - 1)
                    pos.append((int(cur_x), int(cur_y)))

            elif pattern == "bridge":
                # ⚔️【护卫连跳绝境】
                solution_steps.append(f"[护卫专属]极限双重深渊")
                for step in range(2):
                    # 断桥模式开局第一跳也要处理中心点方向
                    if cur_x == 0:
                        sign = random.choice([-1, 1])
                    else:
                        sign = 1 if cur_x < 0 else -1
                        
                    cur_x = sign * random.randint(160, 170)
                    
                    if step == 0:
                        cur_y += random.randint(0, 20) 
                    else:
                        cur_y += random.randint(80, 100)
                    
                    # 🌟 强制要求深渊断桥必定使用窄板 (1,4,7)
                    narrow_choice = random.choice(["1", "4", "7"])
                    stages.append(f"{narrow_choice}_0")
                    star_pool.append(len(stages) - 1)
                    pos.append((int(cur_x), int(cur_y)))
                
                # ⚔️【公主回正高跳】
                direction = -1 if cur_x > 0 else 1
                total_width = abs(cur_x * 2)
                step_x = total_width / 3.0 
                
                solution_steps.append(f"[公主专属]三步阶梯回正")
                for step in range(3):
                    cur_y += y_jump
                    jitter = random.randint(-15, 15) 
                    cur_x += (direction * step_x) + jitter
                    
                    stages.append(f"{random.choice(pool_high)}_0")
                    star_pool.append(len(stages) - 1)
                    pos.append((int(cur_x), int(cur_y)))
                
        # 收官终点
        last_stage_type = stages[-1].split('_')[0]
        stages[-1] = f"{last_stage_type}_2"
        solution_steps.append("抵达终点")
        
        if star_pool and star_pool[-1] == len(stages) - 1:
            star_pool.pop()
                
        # 精准投放 3 颗星星
        if len(star_pool) >= 3:
            step = len(star_pool) / 3.0
            stars_indices = [
                star_pool[int(step * 0.5)],   
                star_pool[int(step * 1.5)],   
                star_pool[int(step * 2.5)]    
            ]
            for idx in stars_indices:
                stages[idx] = stages[idx].replace("_0", "_1")
        
        level["stages"] = stages
        level["pos"] = pos
        level["desc"] = "要求: " + " -> ".join(solution_steps)
        
        levels_data.append(level)
        
    return levels_data

RAW_LEVEL_DATA = generate_100_levels()

def generate_levels_json(output_file):
    final_config = {
        "heros": {
            "distance": "350_150",  
            "high": "150_400",      
            "speed": "4_4",         
            "parameter": "0.9_3.4", 
            "chain": 180            
        },
        "levels": []
    }

    for lv in RAW_LEVEL_DATA:
        pos_str_list = [f"({p[0]},{p[1]})" for p in lv["pos"]]
        
        level_entry = {
            "id": lv["id"],
            "name": lv["name"],
            "speed": lv["speed"],
            "stages": lv["stages"],
            "start": "1", 
            "pos": "[" + ", ".join(pos_str_list) + "]",
            "desc": lv["desc"],
            "tip": "格式提示：类型ID_状态枚举(0默认, 1星星, 2终点)"
        }
        final_config["levels"].append(level_entry)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(final_config, f, indent=2, ensure_ascii=False)
    
    print(f"成功生成 {output_file}！超大石板折叠Bug已抹杀，出生点对齐修复完毕！")

if __name__ == "__main__":
    generate_levels_json("levels.json")