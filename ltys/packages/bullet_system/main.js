'use strict';

module.exports = {
    load() {
        // execute when package loaded
    },

    unload() {
        // execute when package unloaded
    },

    messages: {
    	'set'() {
            Editor.Panel.open('bullet_system');
        },
        'import'() {
            const FS = require('fs');
            let checkDirectory = (dst) => {
                try {
                    FS.accessSync(dst, FS.constants.F_OK);
                } catch (e) {
                    FS.mkdirSync(dst);
                }
            };
            checkDirectory(Editor.Project.path + '/assets/lq_base');
            checkDirectory(Editor.Project.path + '/assets/lq_base/data');
            checkDirectory(Editor.Project.path + '/assets/lq_base/util');
            checkDirectory(Editor.Project.path + '/assets/lq_collide_system');
            checkDirectory(Editor.Project.path + '/assets/lq_bullet_system');
            Editor.assetdb.refresh('db://assets/lq_base');
            Editor.assetdb.refresh('db://assets/lq_collide_system');
            Editor.assetdb.refresh('db://assets/lq_bullet_system');
            const base = Editor.url('packages://bullet_system') + '/src';
            try {
            	Editor.assetdb.import([
                    base + '/lq_bullet_system/lq_bullet_config.ts',
                    base + '/lq_bullet_system/lq_bullet_system.js',
                    base + '/lq_bullet_system/lq_bullet_emitter.ts',
                    base + '/lq_bullet_system/lq_bullet.ts',
                    base + '/lq_bullet_system/lq_bullet_system.d.ts',
                ], 'db://assets/lq_bullet_system');
                Editor.assetdb.import([
                    base + '/lq_collide_system/lq_collide_config.ts',
                    base + '/lq_collide_system/lq_collide_system.js',
                    base + '/lq_collide_system/lq_collide_base.ts',
                    base + '/lq_collide_system/lq_collide.ts',
                    base + '/lq_collide_system/lq_collide_system.d.ts',
                ], 'db://assets/lq_collide_system');

                Editor.assetdb.import([
                    base + '/lq_base/data/lq_const.ts',
                    base + '/lq_base/data/lq_data.ts',
                    base + '/lq_base/data/lq_interface.ts',
                ], 'db://assets/lq_base/data');

                Editor.assetdb.import([
                	base + '/lq_base/util/lq_platform_util.ts',
                    base + '/lq_base/util/lq_base_util.ts',
                    base + '/lq_base/util/lq_math_util.ts',
                    base + '/lq_base/util/lq_pool_util.ts',
                    base + '/lq_base/util/lq_game_util.ts',
                ], 'db://assets/lq_base/util');
            } catch (e) {

            }
        }
    },
};