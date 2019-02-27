const express = require('express');
const static = require('express-static');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const consolidate = require('consolidate');
const mysql = require('mysql');

//创建数据库连接池
const db = mysql.createPool({
		host: 'EnterYourHostIP', 
		user: 'root',
		password: 'EnterYourPassword',
		database: 'javalab'
})

//开启服务器
var server = express();
server.listen(8080)


//1.解析cookie
server.use(cookieParser('sadasdasdfggc3sdfgvzxz'));	//设置签名


//2.使用session
var arr = [];
for(var i=0; i<100000; i++){
arr.push('keys_' + Math.random());
}
server.use(cookieSession({name: 'zns_sess_id', keys: arr, maxAge: 20*3600*1000})); //20分钟


//3.处理post数据，请求时调用req.body
server.use(bodyParser.urlencoded({extended: false}));	//关闭拓展模式


//4.配置模板引擎
///输出什么东西
server.set('view engine', 'html');	//set用来配置全局的server
///模板文件放在template文件夹下
server.set('views', './template');
///那种模板引擎
server.engine('html', consolidate.ejs);


//6.接收用户请求
//访问根目录时==================================================
server.get('/', (req, res)=>{
	res.render('forbidden.ejs')
})

//访问datacapsule时=============================================
///获取已注册人数
server.get('/datacapsule', (req, res, next)=>{
	db.query("SELECT count(id) AS 'count' FROM `user`;", (err, data)=>{
		if(err){
			console.log(err);
			res.status(500).send('database error').end();
		}
		else{
			res.count = data[0].count;
			next();
		}
	})
})
///获取数据
server.get('/datacapsule', (req, res, next)=>{
	db.query("SELECT id, name, sex, stu_num FROM user;", (err, data)=>{
		if(err){
			console.log(err);
			res.status(500).send('database error').end();
		}else{
			res.stu_data = data;
			next();
		}
	});
})
///渲染首页
server.get('/datacapsule', (req, res)=>{
	res.render('javalab_console.ejs', {count: res.count, db: res.stu_data});
})

///访问stu_inf目录时=============================================
server.get('/stu_inf', (req, res, next)=>{
	if(req.query.id){
		var current_id = req.query.id; //获取当前的id
		if(req.query.act){
			if(req.query.act == 'ticket'){
				db.query(`UPDATE user SET ticket=ticket+1 WHERE id=` + current_id + `;`, (err)=>{
					if(err){
						console.log(err);
						res.status(500).send('database error').end();
					}else{
						db.query('SELECT name, ticket FROM user WHERE id=' + current_id + ';', (err, data)=>{
							if(err){
								console.log(err);
								res.status(500).send('database error').end();
							}
							else{
								res.render('ticket_success.ejs', {db: data[0]});
							}
						})
						
					}
				})
			}else if(req.query.act == 'delete'){
				db.query('DELETE FROM user WHERE id=' + current_id + ';', (err)=>{
					if(err){
						console.log(err);
						res.status(500).send('database error').end();
					}else{
						res.redirect('/stu_inf?id=' + current_id);
					}
				})
			}else{
				res.send('操作出错！')
			}
		}else{
			db.query(`SELECT * FROM user WHERE id=${req.query.id};`,(err, data)=>{
			if(err){
					res.status(500).send('数据有问题').end();
					console.log(err);
				}else{
					//判断该ID是否被注册
					if(data.length == 0){
						res.render('no_found.ejs');
					}
					else{
						res.render('stu_inf.ejs', {db: data[0]});
					}
				}
			})
		}
	}else{
		res.send('url不合法');
	}
})

//访问searchmyid================================================
server.get('/searchmyid', (req, res)=>{
	if(req.query.stu_num){
		var num = req.query.stu_num;
		db.query('SELECT name,id FROM user WHERE stu_num=' + num + ';', (err, data)=>{
			console.log(data);
			if(err){
				res.send('数据库出错，请稍候重试');
				console.log(err);
			}else{
				if(data.length == 0){
				res.render('search_success.ejs', {
						title1: 'OOOOPS Σ(;ﾟдﾟ)!!',
						title2: 'NaN',
						title3: '没有找到该条数据哇！',
						title4: '可能是学号输入错误，请返回重试',
						title5: '无法解决请联系QQ：641411169'
					});
				}else{
					res.render('search_success.ejs', {
						title1: data[0].name + '同学，你的ID是',
						title2: data[0].id,
						title3: '我们期待你的表现',
						title4: 'Good Luck :)',
						title5: 'Tips：请记住此ID，并在面试时上报该ID'
					})
				}
			}
		})
	}else{
		db.query('SELECT count(id) AS count FROM user', (err, data)=>{
			if(err){
				res.send('数据库出错，请稍候重试');
				console.log(err);
			}else{
				res.render('searchmyid.ejs', {db: data[0]});
			}
		})
	}
})


//访问超级管理员首页admin时=============================================
///获取已注册人数
server.get('/admin', (req, res, next)=>{
	db.query("SELECT count(id) AS 'count' FROM `user`;", (err, data)=>{
		if(err){
			console.log(err);
			res.status(500).send('database error').end();
		}
		else{
			res.count = data[0].count;
			next();
		}
	})
})
///获取数据
server.get('/admin', (req, res, next)=>{
	db.query("SELECT id, name, sex, stu_num FROM user;", (err, data)=>{
		if(err){
			console.log(err);
			res.status(500).send('database error').end();
		}else{
			res.stu_data = data;
			next();
		}
	});
})
///渲染首页
server.get('/admin', (req, res)=>{
	res.render('admin.ejs', {count: res.count, db: res.stu_data});
})


//访问超级管理员stu_inf_admin时=============================================
server.get('/stu_inf_admin', (req, res, next)=>{
	if(req.query.id){
		var current_id = req.query.id; //获取当前的id
		if(req.query.act){
			if(req.query.act == 'ticket'){
				db.query(`UPDATE user SET ticket=ticket+1 WHERE id=` + current_id + `;`, (err)=>{
					if(err){
						console.log(err);
						res.status(500).send('database error').end();
					}else{
						db.query('SELECT name, ticket FROM user WHERE id=' + current_id + ';', (err, data)=>{
							if(err){
								console.log(err);
								res.status(500).send('database error').end();
							}
							else{
								res.redirect('/stu_inf_admin?id=' + current_id);
							}
						})
						
					}
				})
			}else if(req.query.act == 'arrived'){
				db.query(`UPDATE user SET arrived=2 WHERE id=` + current_id + `;`, (err)=>{
					if(err){
						console.log(err);
						res.status(500).send('database error').end();
					}else{
						res.redirect('/stu_inf_admin?id=' + current_id);
					}
				})
			}else if(req.query.act == 'delete'){
				db.query('DELETE FROM user WHERE id=' + current_id + ';', (err)=>{
					if(err){
						console.log(err);
						res.status(500).send('database error').end();
					}else{
						res.redirect('/admin');
					}
				})
			}else{
				res.send('操作出错！')
			}
		}else{
			db.query(`SELECT * FROM user WHERE id=${req.query.id};`,(err, data)=>{
			if(err){
					res.status(500).send('数据有问题').end();
					console.log(err);
				}else{
					//判断该ID是否被注册
					if(data.length == 0){
						res.render('no_found.ejs');
					}
					else{
						res.render('stu_inf_admin.ejs', {db: data[0]});
					}
				}
			})
		}
	}else{
		res.send('url不合法');
	}
})

//获取邮箱
server.get('/get_email', (req, res, next)=>{
	db.query("SELECT * from `user` where arrived = '2' OR arrived = '1';", (err, data)=>{
		if(err){
			console.log(err);
			res.status(500).send('database error').end();
		}else{
			var email_string = "";
			for(var i=0; i<data.length; i++){
				email_string += data[i].email + ";";
			}
			console.log(email_string);
		}
	})
});

//5.配置static，设置读取静态文件的目录
server.use(static('./www'));
