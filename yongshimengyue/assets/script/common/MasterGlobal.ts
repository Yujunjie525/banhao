import Config from "./vo/Config";

export default abstract class MasterGlobal {

    public static gameId = 0;

    public static isDebugMode = false;

    public static config: Config = null;

    public static level: number = 1;

    public static difficulty: number = null;

    public static musicon: boolean = true;

    public static isPause: boolean = false;

    public static isOver: boolean = false;

    public static data: Object = {};

}