#!/usr/bin/env node

var fs = require('fs-extra');
var yaml = require('yamljs');
var async = require('async');

var Dir = {
    p: "./posts/",
    t: "./template/",
    t: "./pages/",
    a: "./assets/",
    pub: "./public/"
};

var Data = {
    posts: [],
    pages: []
};

function PostClass(url, data, md) {
    this.url = url
    this.data = data.Title
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

                fs.readFile(output + "/index.md", 'utf8', function(err, data) {
                    if (err) return console.error(err);
                    console.log(data)

                    var divider = data.indexOf("---");
                    var dataYAML = data.slice(0, divider);
                    var dataMD = data.slice(divider + 3);
                    Data.posts.push(new PostClass(dir[end], yaml.parse(dataYAML), dataMD));

                    end++;
                    if(end == dir.length) callback(null);
                });

            });

        };
    });
}


async.parallel({
        Posts: Posts
    },
    function(err, results) {
        console.log(Data);
    });
