import { _decorator, Component, resources, JsonAsset, director } from 'cc';
import { LevelValidator, LevelConfig, generateValidationReport } from './LevelValidator';
const { ccclass, property } = _decorator;

@ccclass('LevelValidatorTest')
export class LevelValidatorTest extends Component {
    @property({ type: LevelValidator })
    validator: LevelValidator = null!;

    @property({ tooltip: '要验证的关卡号，设为0则验证所有关卡' })
    targetLevel: number = 1;

    @property({ tooltip: '是否在启动时自动验证' })
    autoValidate: boolean = true;

    onLoad() {
        if (this.autoValidate) {
            if (this.targetLevel > 0) {
                this.validateSingleLevel(this.targetLevel);
            } else {
                this.runValidation();
            }
        }
    }

    async validateSingleLevel(levelNumber: number) {
        try {
            console.log(`=== 开始校验关卡 ${levelNumber} ===`);
            
            const config = await this.loadConfig();
            const levelConfig = config.levels.find(l => l.level === levelNumber);
            
            if (!levelConfig) {
                console.error(`找不到关卡 ${levelNumber}`);
                return;
            }
            
            const result = this.validator.validateLevel(levelConfig);
            const report = generateValidationReport([result]);
            
            console.log('');
            console.log(report);
            this.displayReport(report);
            
        } catch (error) {
            console.error('校验失败:', error);
        }
    }

    async runValidation() {
        try {
            console.log('=== 开始校验所有关卡 ===');
            const config = await this.loadConfig();
            console.log(`加载到 ${config.levels.length} 个关卡`);
            
            const results = this.validator.validateAllLevels(config);
            const report = generateValidationReport(results);
            
            console.log('');
            console.log(report);
            this.displayReport(report);
            
        } catch (error) {
            console.error('校验失败:', error);
        }
    }

    private loadConfig(): Promise<{ levels: LevelConfig[] }> {
        return new Promise((resolve, reject) => {
            resources.load<JsonAsset>('config/xunguang_levels', (err, asset) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(asset.json as { levels: LevelConfig[] });
            });
        });
    }

    private displayReport(report: string) {
        const style = 'background: #1a1a2e; color: #eaeaea; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; white-space: pre-wrap;';
        console.log(`%c${report}`, style);
    }
}
export async function runLevelValidation(levelNumber?: number) {
    const validator = new LevelValidator();
    try {
        if (levelNumber && levelNumber > 0) {
            console.log(`=== 开始校验关卡 ${levelNumber} ===`);
            
            const config = await new Promise<{ levels: LevelConfig[] }>((resolve, reject) => {
                resources.load<JsonAsset>('config/xunguang_levels', (err, asset) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(asset.json as { levels: LevelConfig[] });
                });
            });
            
            const levelConfig = config.levels.find(l => l.level === levelNumber);
            
            if (!levelConfig) {
                console.error(`找不到关卡 ${levelNumber}`);
                return;
            }
            
            const result = validator.validateLevel(levelConfig);
            const report = generateValidationReport([result]);
            
            console.log(report);
            
            const style = 'background: #1a1a2e; color: #eaeaea; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; white-space: pre-wrap;';
            console.log(`%c${report}`, style);
            
        } else {
            console.log('=== 开始校验所有关卡 ===');
            
            const config = await new Promise<{ levels: LevelConfig[] }>((resolve, reject) => {
                resources.load<JsonAsset>('config/xunguang_levels', (err, asset) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(asset.json as { levels: LevelConfig[] });
                });
            });
            
            console.log(`加载到 ${config.levels.length} 个关卡`);
            
            const results = validator.validateAllLevels(config);
            const report = generateValidationReport(results);
            
            console.log('');
            console.log(report);
            
            const style = 'background: #1a1a2e; color: #eaeaea; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; white-space: pre-wrap;';
            console.log(`%c${report}`, style);
        }
        
    } catch (error) {
        console.error('校验失败:', error);
    }
}

director.on('levelValidation', runLevelValidation);
