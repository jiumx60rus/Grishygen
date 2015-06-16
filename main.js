#!/usr/bin/env node

var fs = require("fs-extra");
var yaml = require("yamljs");
var async = require("async");

var Dir = {
    posts: "./posts/",
    template: "./template/",
    pages: "./pages/",
    assets: "./assets/",
    public: "./public/",
    publicPosts: "./public/posts/",
    publicPages: "./public/pages/"
};

var Data = {
    posts: [],
    pages: []
};

function PostClass(url, data, md) {
    this.url = url;
    this.data = data;
    this.MD = md;
}


function Posts(callback) {
    console.log("Posts creating...");
    var end = 0;

    fs.readdir(Dir.p, function(err, dir) {
        if (err) return console.error(err);

        for (var p in dir) {
            var output = Dir.pub + "posts/" + dir[end];

            fs.copy(Dir.p + dir[end], output, function(err) {
                if (err) return console.error(err);

                fs.readFile(output + "/index.md", "utf8", function(err, data) {
                    if (err) return console.error(err);
                    console.log(data)

                    var divider = data.indexOf("---");
                    var dataYAML = data.slice(0, divider);
                    var dataMD = data.slice(divider + 3);
                    Data.posts.push(new PostClass(dir[end], yaml.parse(dataYAML), dataMD));

                    end++;
                    if (end == dir.length) callback(null);
                });

            });

        };
    });
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
                fs.copy(Dir.assets, Dir.public, callback);
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

                    // Добавляем в общий объект со всеми постами
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
// #   # #####   #   ####  #####
// #       #    # #  #   #   #  
//  ###    #   #   # #   #   #  
//     #   #   ##### ####    #  
// #   #   #   #   # #  #    #  
//  ###    #   #   # #   #   #  


function start() {
    console.log("Start!...");
    async.series([
            copyFile,
            parsing
        ],
        function(err) {
            console.log("End!");
        });
}

start();
