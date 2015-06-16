#!/usr/bin/env node

var fs = require("fs-extra");
var yaml = require("yamljs");
var async = require("async");
var marked = require('marked');
var jade = require('jade');
var highlight = require('highlight.js');

var Dir = {
    posts: "./posts/",
    template: "./template/",
    pages: "./pages/",
    assets: "./assets/",
    public: "./public/",
    publicPosts: "./public/posts/",
    publicPages: "./public/pages/",
    publicAssets: "./public/assets/"
};

var Data = {
    posts: [],
    pages: []
};

function PostClass(url, data, md) {
    this.url = url;
    this.data = data;
    this.html = marked(md); //Перевод markdown в html
}


//  ###                   
// #   #  ###  ####  #   #
// #     #   # #   #  # # 
// #     #   # #   #   #  
// #     #   # ####    #  
// #   # #   # #       #  
//  ###   ###  #       #  

// Копирование файлов из папок в public
function copyFile(CALLBACK) {
    async.parallel([
            function(callback) {
                fs.copy(Dir.posts, Dir.publicPosts, callback);
            },
            function(callback) {
                fs.copy(Dir.pages, Dir.publicPages, callback);
            },
            function(callback) {
                fs.copy(Dir.assets, Dir.publicAssets, callback);
            }
        ],
        function(err) {
            if (err) return console.error(err);
            CALLBACK(null, "copy");
        });
}

// ####                                 
// #   #   #   ####   ###  # #   #  ### 
// #   #  # #  #   # #     # ##  # #   #
// ####  #   # #   #  ###  # # # # #    
// #     ##### ####      # # # # # #  ##
// #     #   # #  #  #   # # #  ## #   #
// #     #   # #   #  ###  # #   #  ### 


function parsingPosts(CALLBACK) {
    // Читаем директорию с постами
    fs.readdir(Dir.posts, function(err, dir) {
        if (err) return console.error(err);
        // Проходимся по каждой папке
        async.each(dir, function(file, callback) {
                // Читаем файл с текстом поста
                fs.readFile(Dir.posts + file + "/index.md", "utf8", function(err, data) {
                    if (err) return console.error(err);

                    // Разделяем на данные о посте и сам текст поста
                    var divider = data.indexOf("---", 2);

                    var dataYAML = data.slice(0, divider); //Тут в начале остается '---', но парсится без ошибок
                    var dataMD = data.slice(divider + 3);

                    Data.posts.push(new PostClass(file, yaml.parse(dataYAML), dataMD));
                    // Переходим к следующему посту
                    callback();
                });
            },
            function(err) {
                if (err) return console.error(err);
                CALLBACK(null);
            });
    });
}

function parsingPages(CALLBACK) {
    // Читаем директорию со страницами
    fs.readdir(Dir.pages, function(err, dir) {
        if (err) return console.error(err);
        // Проходимся по каждой папке
        async.each(dir, function(file, callback) {
                // Читаем файл с текстом страницы
                fs.readFile(Dir.pages + file + "/index.md", "utf8", function(err, data) {
                    if (err) return console.error(err);

                    // Разделяем на данные о посте и сам текст поста
                    var divider = data.indexOf("---", 2);

                    var dataYAML = data.slice(0, divider); //Тут в начале остается '---', но парсится без ошибок
                    var dataMD = data.slice(divider + 3);

                    Data.pages.push(new PostClass(file, yaml.parse(dataYAML), dataMD));
                    // Переходим к следующей страницы
                    callback();
                });
            },
            function(err) {
                if (err) return console.error(err);
                CALLBACK(null);
            });
    });
}


// Парсинг в Data
function parsing(CALLBACK) {
    async.parallel([
        parsingPosts,
        parsingPages
    ], function(err) {
        if (err) return console.error(err);
        CALLBACK(null);
    });

}

//  ###                                                   
// #   # ##### #   # ##### ####    #   ##### #  ###  #   #
// #     #     ##  # #     #   #  # #    #   # #   # ##  #
// #  ## ####  # # # ####  #   # #   #   #   # #   # # # #
// #   # #     # # # #     ####  #####   #   # #   # # # #
// #   # #     #  ## #     #  #  #   #   #   # #   # #  ##
//  ###  ##### #   # ##### #   # #   #   #   #  ###  #   #

function generation(CALLBACK) {

    var str = fs.readFileSync(Dir.template + "page.jade", 'utf8')
    var fn = jade.compile(str, {
        pretty: true
    });

    async.each(Data.posts, function(post, callback) {

            fs.rename(Dir.publicPosts + post.url + "/index.md", Dir.publicPosts + post.url + "/index.html", function(err) {
                if (err) return console.error(err);

                fs.writeFile(Dir.publicPosts + post.url + "/index.html", fn(post), function(err) {
                    if (err) return console.log(err);
                });
            });
        },
        function(err) {
            if (err) return console.error(err);
            CALLBACK(null);
        });
}

//  ###                         
// #   # #####   #   ####  #####
// #       #    # #  #   #   #  
//  ###    #   #   # #   #   #  
//     #   #   ##### ####    #  
// #   #   #   #   # #  #    #  
//  ###    #   #   # #   #   #  


function setOptions(CALLBACK) {
    // Подсветка синтаксиса
    // ```js
    //     console.log("example");
    // ```
    marked.setOptions({
        highlight: function(code, lang) {
            return highlight.highlight(lang, code).value;
        }
    });

    CALLBACK(null);
}

function start() {
    async.series([
        setOptions,
        copyFile,
        parsing,
        generation
    ]);
}

start();
