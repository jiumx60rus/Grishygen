#!/usr/bin/env node

var fs = require("fs-extra");
var yaml = require("yamljs");
var async = require("async");
var marked = require('marked');
var jade = require('jade');

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
                console.log("Copy posts...");
                fs.copy(Dir.posts, Dir.publicPosts, callback);
            },
            function(callback) {
                console.log("Copy pages...");
                fs.copy(Dir.pages, Dir.publicPages, callback);
            },
            function(callback) {
                console.log("Copy assets...");
                fs.copy(Dir.assets, Dir.publicAssets, callback);
            }
        ],
        function(err) {
            if (err) return console.error(err);

            console.log("End copy files");
            console.log("--------------------------------------------------------");

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
    console.log("Parsing posts...");

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


// Парсинг в Data
function parsing(CALLBACK) {
    async.parallel([
        parsingPosts
    ], function(err) {
        if (err) return console.error(err);

        console.log("End parsing files");
        console.log("--------------------------------------------------------");

        CALLBACK(null, "parsing");
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

            console.log("End generation files");
            console.log("--------------------------------------------------------");

            CALLBACK(null, "generation");
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
    marked.setOptions({
        highlight: function(code) {
            return require('highlight.js').highlightAuto(code).value;
        }
    });

    CALLBACK(null, "setOptions");
}

function start() {
    console.log("Start!...");
    async.series([
            setOptions,
            copyFile,
            parsing,
            generation
        ],
        function(err) {
            console.log("End!");
        });
}

start();
