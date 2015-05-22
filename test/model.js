var should = require("should");
var MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID;



// 设置环境变量，读取config
process.env.NODE_ENV = 'development';

var mongoClientConfig = {
    server: {
        poolSize: 5,
        socketOptions: { autoReconnect: true }
    }
};

// 初始化需要测试的model

var Ticket = {};

describe("Ticket model test", function() {
	before(function (done) {
        MongoClient.connect('mongodb://127.0.0.1/ynu', mongoClientConfig, function (err, db) {
            Ticket = require('../lib/model')(db, 'tickets');
            done();
        });
	});

    var ticketData;
    it('generate.生成票据', function (done) {
        Ticket.generate('api.ynu.edu.cn', function (err, ticket) {
            should.not.exist(err);
            should.exist(ticket.data);
            ticket.host.should.eql('api.ynu.edu.cn');
            ticketData = ticket.data;
            done();
        });
    });

    it('get.获取当前票据数据', function (done) {
        Ticket.get(ticketData, function (err, ticket) {
            should.not.exist(err);
            ticketData.should.eql(ticket.data);
            ticket.host.should.eql('api.ynu.edu.cn');
            should.not.exist(ticketData.userId);
            done();
        });
    });

    it('check.检查票据', function (done) {
        Ticket.check(ticketData, function (err, used) {
            should.not.exist(err);
            used.should.eql(false);
            done();
        });
    });

    it('use.使用票据', function (done) {
        Ticket.use(ticketData, 'na57', function (err, result) {
            should.not.exist(err);
            done();
        });
    });

    it('check.检查票据', function (done) {
        Ticket.check(ticketData, function (err, used) {
            should.not.exist(err);
            used.should.eql(true);
            done();
        });
    });
});