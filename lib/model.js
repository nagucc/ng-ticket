var MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    Db = require('mongodb').Db;
var uuid = require('node-uuid');


/*
 接收两个参数：
    - db 必须的。Db对象，用于进行数据库操作；
    - collection 可选的，指定的用于存放ticket数据的集合，默认为user_tickets
*/
module.exports = function(db, collection) {
    collection = collection || 'user_tickets';

    var connect = function (callback) {
        if(db instanceof Db){                                           // 判断给定的参数db是否正确。
            callback(null, db);
        } else {
            callback('db is not a instance of Db', null);
        }
    };

    var getCollection = function (callback) {
        connect(function (err, db) {                                    // 连接数据库
            if(err) callback(err, null);
            else {
                var col = db.collection(collection);                    // 获取集合实例
                callback(null, col);
            }
        });
    };
    return {

        /*
         生成票据。
            - host 申请生成票据的域名
            - callback 生成票据后的回调函数
        */
        generate: function (host, callback) {
            getCollection(function (err, col) {
                if(err) callback(err, null);
                else {
                    var ticket = {
                        _id: new ObjectID(),
                        host: host,
                        data: uuid.v4(),
                        dateCreated: new Date()
                    };
                    col.insert(ticket,function (err, result) {
                        callback(err, ticket);
                    });
                }
            });
        },

        get: function (data, callback) {
            getCollection(function (err, col) {
                if(err) callback(err);
                else {
                    col.findOne({data: data}, callback);
                }
            });
        },

        /*
         登记用户使用的票据
        */
        use: function (data, userId, callback) {
            getCollection(function (err, col) {
                if(err) callback(err);
                else{
                    col.updateOne({
                            data: data,                     // 可以被使用的票据应该数据正确
                            userId: {$exists: false}        // 且未被使用过
                                                            // 且生成时间小于五分钟（待完成）
                        },    
                        {$set: {userId: userId, dateUsed: new Date() }},
                        function (err, result) {
                            if(err) callback(err);
                            else {
                                callback(null, result);
                            }
                        });
                }
            });
        },

        /*
         检查给定的票据是否已被使用
        */
        check: function (data, callback) {
            getCollection(function (err, col) {
                if(err) callback(err);
                else {
                    col.findOne({
                        data: data,                     // 票据数据正确
                        userId: {$exists: true}         // 已经被使用（已登记使用者）
                                                        // 使用时间距离当前时间不超过5分钟（待完成）
                    }, function (err, doc) {
                        if(err) callback(err);
                        else if(doc) callback(null, true);
                        else callback(null,false);
                    });
                }
            });
        }
    };
};