Editor.Panel.extend({
    style: `
    :host { margin: 5px; }
    h2 { color: #f90; }
    td {
        text-align: center;
        width:70;
        height:30;
    }
    #divContainer {
      overflow: auto;
      height: 800px;
    }

    #divContainer::-webkit-scrollbar {
        border-width:1px;
    }
  `,
    template: `
    <div id="divContainer">
        <h2>分组管理</h2>
        <ui-box-container class="layout vertical left" >
          <div>
            <div id="edit_group" align="center"></div>
            <div align="center" style="margin-top: 10px"><ui-button id="btn_add">添加分组</ui-button></div>
          </div>
        </ui-box-container>
        <h2>碰撞管理</h2>
        <ui-box-container class="layout vertical left">
          <div>
            <table><tbody id="table_group"></tbody></table>
          </div>
        </ui-box-container>
        <h2>配置</h2>
        <ui-box-container class="layout vertical left">
          <div>
            <ui-prop id="switch_auto_run" type="boolean" name="自行驱动"></ui-prop>
            <ui-prop id="switch_print_log" type="boolean" name="打印碰撞日志"></ui-prop>
            <ui-prop id="switch_quad_tree" type="boolean" name="开启四叉树"></ui-prop>
            <ui-prop id="max_node_len" type="number" name="节点最大数量" indent="1"></ui-prop>
            <ui-prop id="max_node_level" type="number" name="节点最大深度" indent="1"></ui-prop>
            <ui-prop id="active_area" name="活动区域" indent="1">
                <ui-num-input id="active_area_x"></ui-num-input>
                <ui-num-input id="active_area_y"></ui-num-input>
                <ui-num-input id="active_area_width"></ui-num-input>
                <ui-num-input id="active_area_height"></ui-num-input>
            </ui-prop>
          </div>
        </ui-box-container>
    </div>
    <div align="center" style="margin-top: 10px"><ui-button class="green" id="btn_save">保存</ui-button></div>
  `,

    $: {
        edit_group: '#edit_group',
        table_group: '#table_group',
        btn_save: '#btn_save',
        btn_add: '#btn_add',
        switch_auto_run: '#switch_auto_run',
        switch_print_log: '#switch_print_log',
        switch_quad_tree: '#switch_quad_tree',
        max_node_len: '#max_node_len',
        max_node_level: '#max_node_level',
        active_area: '#active_area',
        active_area_x: '#active_area_x',
        active_area_y: '#active_area_y',
        active_area_width: '#active_area_width',
        active_area_height: '#active_area_height',
    },


    refresh_group() {
        this.sort_data();
        this.$table_group.innerHTML = '';
        const tr = document.createElement("tr");
        tr.appendChild(document.createElement("td"));
        for (let i = 0; i < window.plugin_data.group_arr.length; i++) {
            const data = window.plugin_data.group_arr[i];
            const td = document.createElement("td");
            td.innerText = data.name;
            tr.appendChild(td);
        }
        this.$table_group.appendChild(tr);
        let tr_arr = [];
        for (let i = 0; i < window.plugin_data.group_arr.length; i++) {
            const data = window.plugin_data.group_arr[i];
            const tr = document.createElement("tr");
            tr.uid = data.id;
            const td = document.createElement("td");
            td.innerText = data.name;
            tr.appendChild(td);

            for (let j = 0; j <= i; j++) {
                const data2 = window.plugin_data.group_arr[j];
                const td2 = document.createElement("td");
                const cb = document.createElement("ui-checkbox");
                cb.checked = data.arr.indexOf(data2.id) !== -1;
                cb.uid = data2.id;
                td2.appendChild(cb);
                tr.appendChild(td2);
            }
            tr_arr.push(tr);
        }
        for (let i = tr_arr.length - 1; i >= 0; i--) {
            this.$table_group.appendChild(tr_arr[i]);
        }
    },

    refresh_edit() {
        this.$edit_group.innerHTML = '';
        for (let i = 0; i < window.plugin_data.group_arr.length; i++) {
            const data = window.plugin_data.group_arr[i];
            const div = document.createElement("div");
            div.style = "margin-top: 10px;;margin-left: 50px";

            const input = document.createElement("ui-input");
            input.value = data.name;
            div.appendChild(input);
            input.addEventListener('change', () => {
                data.name = input.value;
                this.refresh_group();
            });
            const btn = document.createElement("ui-button");
            btn.setAttribute("class", "tiny red");
            btn.innerHTML = "删除";
            div.appendChild(btn);
            btn.addEventListener('confirm', () => {
                for (let j = 0; j < window.plugin_data.group_arr.length; j++) {
                    if (data.id === window.plugin_data.group_arr[j].id) {
                        window.plugin_data.group_arr.splice(j, 1);
                        break;
                    }
                }
                this.refresh_edit();
                this.refresh_group();
            });
            this.$edit_group.appendChild(div);
        }
    },

    refresh_set() {
        this.$switch_auto_run.value = !!window.plugin_data.switch_auto_run;
        this.$switch_print_log.value = !!window.plugin_data.switch_print_log;
        this.$switch_quad_tree.value = !!window.plugin_data.switch_quad_tree;
        this.$max_node_len.value = window.plugin_data.max_node_len || 10;
        this.$max_node_level.value = window.plugin_data.max_node_level || 4;
        this.$active_area_x.value = window.plugin_data.active_area_x || 0;
        this.$active_area_y.value = window.plugin_data.active_area_y || 0;
        this.$active_area_width.value = window.plugin_data.active_area_width || 1000;
        this.$active_area_height.value = window.plugin_data.active_area_height || 1000;
        this.$max_node_len.style.display = this.$switch_quad_tree.value ? '' : 'none';
        this.$max_node_level.style.display = this.$switch_quad_tree.value ? '' : 'none';
        this.$active_area.style.display = this.$switch_quad_tree.value ? '' : 'none';
    },
    sort_data() {
        window.plugin_data.group_arr.sort((a, b) => {
            return a.id - b.id;
        });
    },

    make_config_ts() {
        const FS = require('fire-fs');
        let str = 'export enum LQCollideInfoList {\r\n    ';
        for (let i = 0; i < window.plugin_data.group_arr.length; i++) {
            const data = window.plugin_data.group_arr[i];
            if (i > 0) {
                str += ', ';
            }
            str += data.name;
        }
        str += '\r\n}\r\n\r\nexport class LQCollideConfig {';
        str += `\r\n    public static switch_auto_run: boolean = ${window.plugin_data.switch_auto_run ? 'true' : 'false'};`;
        str += `\r\n    public static switch_print_log: boolean = ${window.plugin_data.switch_print_log ? 'true' : 'false'};`;
        str += `\r\n    public static switch_quad_tree: boolean = ${window.plugin_data.switch_quad_tree ? 'true' : 'false'};`;
        str += `\r\n    public static max_node_len: number = ${window.plugin_data.max_node_len};`;
        str += `\r\n    public static max_node_level: number = ${window.plugin_data.max_node_level};`;
        str += `\r\n    public static active_area_x: number = ${window.plugin_data.active_area_x};`;
        str += `\r\n    public static active_area_y: number = ${window.plugin_data.active_area_y};`;
        str += `\r\n    public static active_area_width: number = ${window.plugin_data.active_area_width};`;
        str += `\r\n    public static active_area_height: number = ${window.plugin_data.active_area_height};`;
        str += '\r\n    public static collide_group_map = {';

        let temp_value = {};
        for (let i = 0; i < window.plugin_data.group_arr.length; i++) {
            const data = window.plugin_data.group_arr[i];
            temp_value[data.name] = [i, 1 << i];
        }
        for (let i = 0; i < window.plugin_data.group_arr.length; i++) {
            const data = window.plugin_data.group_arr[i];
            let value = temp_value[data.name];
            let mask = 0;
            for (let j = 0; j < data.arr.length; j++) {
                const data2 = this.get_group(data.arr[j]);
                mask |= temp_value[data2.name][1];
            }
            str += `\r\n        "${data.name}": {id: ${data.id}, category: ${value[1]}, index: ${value[0]}, mask: ${mask}},`;
        }
        str += '\r\n    }';
        str += '\r\n}';

        FS.writeFileSync(Editor.Project.path + '/assets/lq_collide_system/lq_collide_config.ts', str);
        Editor.assetdb.refresh('db://assets/lq_collide_system/lq_collide_config.ts');
        Editor.log("保存成功!");
    },
    get_group(id) {
        for (let i = 0; i < window.plugin_data.group_arr.length; i++) {
            const data = window.plugin_data.group_arr[i];
            if (data.id === id) {
                return data;
            }
        }
    },

    ready() {
        const FS = require('fire-fs');
        const save_path = Editor.Project.path + '/settings/collide_system_cfg.json';
        if (FS.existsSync(save_path)) {
            window.plugin_data = JSON.parse(FS.readFileSync(save_path, 'utf-8').toString());
        } else {
            window.plugin_data = {
                group_arr: [
                    {name: 'default', id: 1, arr: [1]},
                    {name: 'role', id: 2, arr: [4, 5, 6]},
                    {name: 'role_bullet', id: 3, arr: [4]},
                    {name: 'enemy', id: 4, arr: [2, 3]},
                    {name: 'enemy_bullet', id: 5, arr: [2]},
                    {name: 'prop', id: 6, arr: [2]}
                ],
                switch_auto_run: true,
                switch_print_log: true,
                switch_quad_tree: false,
                max_node_len: 10,
                max_node_level: 4,
                active_area_x: 0,
                active_area_y: 0,
                active_area_width: 1000,
                active_area_height: 1000
            }
        }
        this.refresh_group();
        this.refresh_edit();
        this.refresh_set();
        this.$switch_quad_tree.addEventListener('change', () => {
            window.plugin_data.switch_quad_tree = this.$switch_quad_tree.value;
            this.refresh_set();
        });
        this.$btn_add.addEventListener('confirm', () => {
            let name = 'new_group';
            let id = 1;
            for (let i = 0; i < window.plugin_data.group_arr.length; i++) {
                const data = window.plugin_data.group_arr[i];
                if (data.id > id) {
                    id = data.id;
                }
            }
            window.plugin_data.group_arr.push({name: 'new_group', id: id + 1, arr: []});
            this.refresh_group();
            this.refresh_edit();
        });
        this.$btn_save.addEventListener('confirm', () => {
            for (let i = 0; i < window.plugin_data.group_arr.length; i++) {
                const data = window.plugin_data.group_arr[i];
                data.arr = [];
            }
            for (let i = 0; i < this.$table_group.childNodes.length; i++) {
                const tr = this.$table_group.childNodes[i];
                if (!tr.uid) {
                    continue;
                }
                const g1 = this.get_group(tr.uid);
                const r = tr.getElementsByTagName("ui-checkbox");
                for (let j = 0; j < r.length; j++) {
                    const t = r[j];
                    if (t.value) {
                        const g2 = this.get_group(t.uid);
                        if (g1 && g2) {
                            g1.arr.push(t.uid);
                            g2.arr.push(tr.uid);
                        }
                    }
                }
            }
            window.plugin_data.switch_auto_run = this.$switch_auto_run.value;
            window.plugin_data.switch_print_log = this.$switch_print_log.value;
            window.plugin_data.switch_quad_tree = this.$switch_quad_tree.value;
            window.plugin_data.max_node_len = this.$max_node_len.value;
            window.plugin_data.max_node_level = this.$max_node_level.value;
            window.plugin_data.active_area_x = this.$active_area_x.value;
            window.plugin_data.active_area_y = this.$active_area_y.value;
            window.plugin_data.active_area_width = this.$active_area_width.value;
            window.plugin_data.active_area_height = this.$active_area_height.value;

            FS.writeFile(save_path, JSON.stringify(window.plugin_data), (error) => {
                if (!error) {
                    this.make_config_ts();
                } else {
                    Editor.error(error);
                }
            });
        });
    },

    messages: {
        'collide_system:hello'(event) {
            this.$label.innerText = 'Hello!';
        }
    }
})
;