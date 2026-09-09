//
// function createMethodDecorator(): MethodDecorator {
//     return (target: object, name: string, descriptor: any) => {
//
//     };
// }
//
// function Parse(): ParameterDecorator {
//     return (target: object, name: string, index: number) => {
//
//     };
// }
const property_arr = [];

export function serialize_property(obj?: Object): PropertyDecorator {
    return function (target, name: string) {
        property_arr.push({target, name, obj});
    }
}

export function serialize_class(): ClassDecorator {
    return (target: any) => {
        target.prototype.to_string = function () {
            return JSON.stringify(this.to_obj());
        };
        target.prototype.to_obj = function () {
            const new_obj = {};
            for (let i = 0; i < property_arr.length; i++) {
                const property = property_arr[i];
                if (property.target !== target.prototype) {
                    continue;
                }
                const value = this[property.name];
                if (value || value === 0) {
                    new_obj[property.name] = value;
                }
            }
            return new_obj;
        };
        target.from_obj = function (obj) {
            const new_obj = new target();
            for (let i = 0; i < property_arr.length; i++) {
                const property = property_arr[i];
                if (property.target !== target.prototype) {
                    continue;
                }
                const v = obj[property.name];
                if (property.obj) {
                    if (v instanceof Array) {
                        new_obj[property.name] = [];
                        for (let j = 0; j < v.length; j++) {
                            new_obj[property.name].push(property.obj.from_obj(v[j]));
                        }
                    } else {
                        new_obj[property.name] = property.obj.from_obj(v);
                    }
                } else {
                    new_obj[property.name] = v;
                }
            }
            return new_obj;
        };
        target.from_string = function (str) {
            return target.from_obj(JSON.parse(str));
        };
    };
}

declare global {
    interface Object {
        from_string(str);

        from_obj(obj);

        to_string();

        to_obj();
    }
}