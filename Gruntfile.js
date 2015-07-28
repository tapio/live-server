'use strict';
module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            files: [
                '*.js',
                'bin/*',
                'lib/*.js',
                'test/*.js'
            ]
        },
        eslint: {
            options: {
                configFile: '.eslintrc'
            },
            target: [
                '*.js',
                'bin/*',
                'lib/*.js',
                'test/*.js'
            ]
        },
        simplemocha: {
            options: {
                reporter: 'spec',
                timeout: '15000'
            },
            full: {
                src: ['test/test.js']
            },
            short: {
                options: {
                    reporter: 'dot'
                },
                src: ['test/test.js']
            }
        },
        exec: {
            cover: {
                command: 'STRICT_REQUIRE=1 node node_modules/istanbul/lib/cli.js cover --dir ./test/reports node_modules/mocha/bin/_mocha -- --timeout 30000 -R dot test/test.js'
            },
            coveralls: {
                command: 'node node_modules/.bin/coveralls < test/reports/lcov.info'
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'eslint', 'simplemocha:short']
        }
    });

    grunt.registerTask('test', ['jshint', 'eslint', 'simplemocha:full']);
    grunt.registerTask('cover', 'exec:cover');
    grunt.registerTask('travis', ['jshint', 'exec:cover', 'exec:coveralls']);
    grunt.registerTask('default', 'test');
};
