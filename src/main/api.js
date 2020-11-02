"use strict";

const {net} = require('electron');
const request = require('request');
const fs = require("fs");

const api = {

    HOST_API: "http://10.11.23.136:8080/holo/",
    // HOST_API: "http://dev.10.11.23.136:8080/",

    /**
     *
     * @param option
     * @returns {Promise<any>}
     */
    ajax: function(option) {
        let req = net.request(option);
        req.chunkedEncoding = true;
        let promise = new Promise(function(resolve,reject) {
            req.on('response', (response) => {
                let chunks = [];
                response.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                response.on('end', () => {
                    let data = null;
                    let size = chunks.length;
                    if (size > 0) {
                        let buffers = Buffer.concat(chunks);
                        data = JSON.parse(buffers.toString("utf-8"));
                    }
                    if (response.statusCode === 200) {
                        resolve(data);
                    } else {
                        reject(data);
                    }
                });
                response.on('error', (error) => {
                    reject(error);
                });
            });
            req.on("error", (error) => {
                reject(error);
            });
            req.end();
        });
        return promise;
    },

    /**
     *
     * @returns {*|Promise<any>}
     */
    getMedias: function(page, size) {
        let url = this.HOST_API + "api/media/getall";
        return this.ajax({
            url: url,
            data: {
                page: page ? page : 0,
                size: size ? size: 10
            }
        });
    },

    /**
     *
     * @param item
     * @param callback
     */
    downloadModule: function(item, callback) {
        let url = this.HOST_API + "api/module/download?id=" + item.id;
        request.head(url, function(err,res,body){
            if (err) {
                console.log(err);
            }
        });

        let img_filename = item.media_keyname + ".zip";
        //通过流的方式，把下载文件写到本地目录下
        request(url)
            .pipe(fs.createWriteStream('./static/remotetemp/'+ img_filename))
            .on("close", callback);
    }
};

module.exports = {api};