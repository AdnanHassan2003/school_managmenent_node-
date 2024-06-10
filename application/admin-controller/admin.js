var Admin = require('mongoose').model('admin')
var User = require('mongoose').model('users')
var Studnet = require('mongoose').model('student')
var Teacher = require('mongoose').model('teacher')
var Class = require('mongoose').model('class')
var Subject = require('mongoose').model('subject')
var Exam = require('mongoose').model('exam')
var Fee = require('mongoose').model('fee')
var Message = require('mongoose').model('message')
var Quiz = require('mongoose').model('quiz')
var Result_Quiz = require('mongoose').model('resultQuiz')
var Types_Quiz = require('mongoose').model('typequiz')
var Setting = require('mongoose').model('setting')
var Menu = require('mongoose').model('menu')

const Bcrypt = require('bcryptjs');
var moment = require('moment-timezone');
var Excel = require('exceljs');
var fs = require('fs');
var node_gcm = require("node-gcm")
var crypto = require('crypto');
var Utils = require('../controller/utils');
var passwordValidator = require('password-validator');
const { body } = require('express-validator');
const _class = require('../model/class');
const { filter, flatMap, has, add } = require('lodash');
const { title } = require('process')
const session = require('express-session')
const { response } = require('express')
const { type } = require('os')
const setting = require('../model/setting')
const { each } = require('async')
const { utils } = require('xlsx')
const { group, Console } = require('console')
// const { utils } = require('xlsx/types')
var ObjectId = require('mongodb').ObjectID;




//new app transection
var Login = require('mongoose').model('login')
var Transection = require('mongoose').model('transection')





exports.admin = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {

            Admin.aggregate([

                {$group:{_id:null,
                    Total_Admin:{$sum:1}}},
                    
                    
                  {$project:{
                      _id:0,
                      Total_Admin:1
                      
                      
                      }}
                ]).then((totaladmin) => {


                Studnet.aggregate([

                    {
                        $group: {
                            _id: null,
                            Total_Student: { $sum: 1 }

                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            Total_Student: 1
                        }
                    },


                ]).then((totalsudents) => {

                    Class.aggregate([

                        {
                            $group: {
                                _id: null,
                                Total_Class: { $sum: 1 }

                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                Total_Class: 1
                            }
                        }

                    ]).then((totalcass) => {


                        Fee.aggregate([
                            {
                                $group: {
                                    _id: null,
                                    Total_Payment: { $sum: "$payment" }

                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    Total_Payment: 1
                                }
                            }

                        ]).then((totalpayment) => {


                            res.render('home', {
                                Totaladmin: totaladmin,
                                url_data: req.session.menu_array,
                                Totalsudents: totalsudents,
                                Totalcass: totalcass,
                                Totalpayment: totalpayment

                            })
                        })
                    })
                })
            })

        } else {
            Utils.redirect_login(req, res);
        }
    });
}





///// check admin credentiale /////
exports.check_admin_login = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        var hash = crypto.createHash('md5').update(req.body.password).digest('hex');
        if (!response.success) {
            var name = req.body.email
            // Encrypt
            var phone = {};
            phone['phone'] = name;
            var email = {};
            email['email'] = name;
            var user_name = {};
            user_name['user_name'] = name;
            var password = {};
            password['password'] = hash;
           // console.log("hash", hash)
            Admin.findOne({ $and: [{ $or: [phone, email, user_name] }, { status: 1 }] }).then((admin) => {
              
                if (!admin) {
                    req.session.error = process.env.user_not_registered;
                    res.redirect("/admin")
                } else {
                    if (!admin.comparePassword((req.body.password).toString())) {
                      //!admin.comparePassword((req.body.password).toString())
                      //admin.password != hash
                        var login_attempts = admin.login_attempts + 1;
                        Admin.updateOne({ _id: admin._id }, { login_attempt_time: new Date(Date.now()), login_attempts: login_attempts }, { useFindAndModify: false }).then((Admin) => {
                        });
                        req.session.error = process.env.email_pass_invalid;
                        res.redirect("/admin")
                    } else {

                        var token = Utils.tokenGenerator(36);
                        var admin_data = {
                            usertype: admin.type,
                            name: admin.name,
                            username: admin.user_name,
                            user_id: admin._id,
                            userphone: admin.phone,
                            menu_array: admin.allowed_urls,
                            token: token,
                            picture: admin.picture
                        }
                        req.session.admin = admin_data;
                        Admin.updateOne({ _id: admin._id }, { token: token, last_login: new Date(Date.now()), login_attempts: 0 }, { useFindAndModify: false }).then((Adminn) => {

                            Admin.aggregate([

                                {$group:{_id:null,
                                    Total_Admin:{$sum:1}}},
                                    
                                    
                                  {$project:{
                                      _id:0,
                                      Total_Admin:1
                                      
                                      
                                      }}
                                ]).then((totaladmin) => {
                                    



                                Studnet.aggregate([

                                    {
                                        $group: {
                                            _id: null,
                                            Total_Student: { $sum: 1 }

                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 0,
                                            Total_Student: 1
                                        }
                                    },



                                ]).then((totalsudents) => {

                                    Class.aggregate([

                                        {
                                            $group: {
                                                _id: null,
                                                Total_Class: { $sum: 1 }

                                            }
                                        },
                                        {
                                            $project: {
                                                _id: 0,
                                                Total_Class: 1
                                            }
                                        }

                                    ]).then((totalcass) => {


                                        Fee.aggregate([
                                            {
                                                $group: {
                                                    _id: null,
                                                    Total_Payment: { $sum: "$payment" }

                                                }
                                            },
                                            {
                                                $project: {
                                                    _id: 0,
                                                    Total_Payment: 1
                                                }
                                            }



                                        ]).then((totalpayment) => {
                                            var match = {
                                                $match: {
                                                    parent_menu: null,
                                                },
                                            };
                                            var lookup = {
                                                $lookup: {
                                                    from: "menus",
                                                    let: { menu_id: "$_id" },
                                                    pipeline: [{
                                                        $match: {
                                                            $expr: {
                                                                $eq: [
                                                                    "$parent_menu",
                                                                    "$$menu_id",
                                                                ],
                                                            },
                                                            status: 1
                                                        },
                                                    },],
                                                    as: "menu_details",
                                                },
                                            };
                
                                            if (admin.type != 0) {
                                                const allowed_urls = admin.allowed_urls.map((url) => ObjectId(url));
                                                lookup = {
                                                    $lookup: {
                                                        from: "menus",
                                                        let: { parent_menu: "$_id" },
                                                        pipeline: [{
                                                            $match: {
                                                                $expr: {
                                                                    $and: [{
                                                                        $eq: [
                                                                            "$parent_menu",
                                                                            "$$parent_menu",
                                                                        ],
                                                                    },
                                                                    { $in: ["$_id", allowed_urls] },
                                                                    ],
                                                                },
                                                                status: 1
                                                            },
                                                        },],
                                                        as: "menu_details",
                                                    },
                                                };
                                            }
                                            var project = {
                                                $project: {
                                                    title: 1,
                                                    icon: 1,
                                                    status: 1,
                                                    "menu_details.title": 1,
                                                    "menu_details.icon": 1,
                                                    "menu_details.url": 1,
                                                },
                                            };
                                            Menu.aggregate([ match,lookup, project]).then((menu_array) => {
                                                console.log("menu_array",menu_array)
                                                req.session.menu_array = menu_array;

                                            res.render('home', {

                                                url_data: req.session.menu_array,
                                                Totaladmin: totaladmin,
                                                Totalsudents: totalsudents,
                                                Totalcass: totalcass,
                                                Totalpayment: totalpayment
                                            })
                                        })
                                    })
                                })
                                })
                            })
                        })
                    }
                }
            });
        } else {
            res.render('home')
        }
    });
};


//Api for pretical that get all student
exports.get_all_students = function (req, res) {
    Studnet.find({}).then((std) => {
        if (std.length > 0) {
            res.send({
                success: true,
                record: std
            })
        } else {
            res.send({
                success: false,
                record: []
            })
        }
    })
}


//APP Apis Login that check user or password correct or incorect
exports.use_login = function (req, res) {


    Studnet.find({ email: req.body.email, PassWord: req.body.PassWord }).then((user_name) => {

        if (user_name.length > 0) {
            Studnet.findOneAndUpdate({ email: req.body.email }, { $set: { token: req.body.token } }).then((data) => {


                res.send({
                    success: true,
                    record: user_name
                })
            })
        }
        else {
            res.send({
                success: false,
                record: "username or password incorrect"
            })
        }

    })
}



//APP Apis Exam Result that show subject and marks
exports.exam_result = function (req, res) {
    // console.log("request", req,body)


    Exam.aggregate([

        {
            $match: {
                "student_id": ObjectId(req.body.student_id)
            }
        },
        {
            $lookup: {

                from: "subjects",
                localField: "subject_id",
                foreignField: "_id",
                as: "class_data"

            }
        },

        { $unwind: "$class_data" },


        {
            $project: {
                _id: 0,
                subject: "$class_data.name",
                marks: 1
            }
        }

    ]).then((data) => {
        Exam.aggregate([

            {
                $lookup: {
                    from: "subjects",
                    localField: "subject_id",
                    foreignField: "_id",
                    as: "class_data"
                }
            },

            { $unwind: "$class_data" },

            {
                $match: {
                    student_id: ObjectId(req.body.student_id)
                }
            },

            {
                $group: {
                    _id: null,
                    totalmarks: { $sum: "$marks" },
                    total_sub: { $sum: 1 }
                }

            },
            {
                $project: {
                    _id: 0,
                    totalmarks: 1,
                    total_sub: 1
                }
            }
        ]).then((totalmarks) => {
            if (data.length > 0) {

                res.send({
                    success: true,
                    record: data, totalmarks


                })
            } else {
                res.send({
                    success: false,
                    record: []
                })
            }
        })


    })


}




//Api for messages that send message from web to app
exports.all_messages = function (req, res) {
    Message.find({}).then((messages) => {
        if (messages.length > 0) {
            res.send({
                success: true,
                record: messages
            })
        } else {
            res.send({
                success: false,
                record: []
            })
        }
    })
}



//Api for Change Password means current password to new password
exports.change_password = function (req, res) {
    Studnet.findOneAndUpdate({ _id: req.body._id }, { $set: { PassWord: req.body.PassWord } }).then((data) => {

        res.send({
            success: true,
            record: data
        })
    })



}



//Api for read quiz
exports.read_quiz = function (req, res) {
    Types_Quiz.aggregate([

        {
            $lookup: {

                from: "quizzes",
                localField: "_id",
                foreignField: "quiz_id",
                as: "Datatype"

            }
        },

        { $unwind: "$Datatype" },


        { $match: { status: 1 } },



        {
            $project: {
                _id: 0,
                quetion: "$Datatype.quetion",
                answer1: "$Datatype.answer1",
                answer2: "$Datatype.answer2",
                answer3: "$Datatype.answer3",
                correct: "$Datatype.correct",
                marks: "$Datatype.marks",
                quiz_id: "$Datatype.quiz_id",
                class_id: 1,
                subject_id: 1,
                status: 1,
                name: 1


            }
        }


    ]).then((data) => {




        //   if(Rquiz.length==0){

        if (data.length > 0) {

            Result_Quiz.find({ quiz_id: data[0].quiz_id, student_id: req.body.student_id }).then((Rquiz) => {

                if (Rquiz.length == 0) {


                    res.send({
                        success: true,
                        record: data
                    })

                } else {
                    res.send({
                        success: false,
                        record: []
                    })
                }

            })

        }
        else {
            res.send({
                success: false,
                record: []
            })
        }


    })
}








//Api for save result quiz  
exports.save_result_quiz = function (req, res) {
    console.log("ggggggg", req.body)
    var name = req.body.name
    var resultquiz = new Result_Quiz({

        sequence_id: Utils.get_unique_id(),
        name: name,
        student_id: req.body.student_id,
        quiz_id: req.body.quiz_id,
        class_id: req.body.class_id,
        subject_id: req.body.subject_id,
        correct: req.body.correct,
        wrong: req.body.wrong,
        marks: req.body.marks,

    });

    resultquiz.save().then((result) => {

        if (result.length > 0) {
            res.send({
                success: true,
                record: result
            })
        }

        else {
            res.send({
                success: false,
                record: []
            })
        }

    });


};




//Api for show blance fee for student
exports.blance_fee = function (req, res) {
    Fee.find({ student_id: req.body.student_id }).then((blance) => {

        if (blance.length > 0) {
            res.send({
                success: true,
                record: blance
            })
        }
        else {
            res.send({
                success: false,
                record: []
            })
        }

    })
}



//------------------------------------------------------------------------------------------------------






//Apis is transection app apis
exports.registration = function(req,res){

    console.log("ggggggg", req.body)
    var name = req.body.name
    var registered = new Login({

        sequence_id: Utils.get_unique_id(),
        name: name,
        email: req.body.email,
        phone:req.body.phone,
        password:req.body.password
        
    });

    registered.save().then((result) => {

        if (result.length > 0) {
            res.send({
                success: false,
                record: []
            })
        }

        else {
            res.send({
                success: true,
                record: result
                
            })
        }

    });


}




exports.login = function(req,res){
    Login.find({email:req.body.email, password:req.body.password}).then((Username)=>{
        if(Username.length>0){
            res.send({
                success:true,
                record:Username
            })
        }
        else{
            res.send({
                success: false,
                record: "username or password incorrect"
            })
        }

    })
}





//Apis is transection app apis
exports.transectionsave = function(req,res){

    console.log("ggggggg", req.body)
    var sent = req.body.sent
    var transection = new Transection({

        sequence_id: Utils.get_unique_id(),
        sent: sent,
        received: req.body.received,
        money:req.body.money,
        
    });

    transection.save().then((result) => {

        if (result.length > 0) {
            res.send({
                success: false,
                record: []
            })
        }

        else {
            res.send({
                success: true,
                record: result
                
            })
        }

    });


}


exports.transectionread = function(req,res){
    Transection.find({sent:req.body.sent}).then((transection)=>{
      if(transection.length>0){
        res.send({
            success:true,
            record:transection
        })
      }
      else{
        res.send({
            success:false,
            record:" "
        })
      }
    })
}









exports.list_admin = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            if (req.body.search_item == undefined) {
                search_item = "sequence_id";
                search_value = req.body.search_value;
                start_date = "";
                end_date = "";
            } else {
                search_item = req.body.search_item;
                search_value = req.body.search_value;
                start_date = req.body.start_date;
                end_date = req.body.end_date;
            }
            if (req.body.start_date == undefined && req.body.end_date == undefined) {
                var now = new Date(Date.now());
                var date = now.addHours();
                start_date = date.setHours(0, 0, 0, 0);   // Set hours, minutes and seconds
                start_date = new Date(start_date)

                end_date = date.setHours(23, 59, 59, 59);   // Set hours, minutes and seconds
                end_date = new Date(end_date)
            } else if (req.body.start_date == "" || req.body.end_date == "") {
                var now = new Date(Date.now());
                var date = now.addHours();
                start_date = date.setHours(0, 0, 0, 0);   // Set hours, minutes and seconds
                start_date = new Date(start_date)

                end_date = date.setHours(23, 59, 59, 59);   // Set hours, minutes and seconds
                end_date = new Date(end_date)
            } else {
                var sdate = new Date(req.body.start_date);
                start_date = sdate.setHours(0, 0, 0, 0);   // Set hours, minutes and seconds
                start_date = new Date(start_date)

                var edate = new Date(req.body.end_date);
                end_date = edate.setHours(23, 59, 59, 59);   // Set hours, minutes and seconds
                end_date = new Date(end_date)
            }

            //var date_filter = { "$match": { "create_date": { $gte: start_date, $lte: end_date } } };

            f_start_date = moment(start_date).format("YYYY-MM-DD");
            f_end_date = moment(end_date).format("YYYY-MM-DD");

            //order by sequecy number
            var sort = { "$sort": {} };
            sort["$sort"]["_id"] = parseInt(-1);

            //query search
            var query_search = { "$match": {} };

            if (search_item == 'email') {
                if (search_value != undefined && search_value != '') {
                    search_value = search_value.replace(/^\s+|\s+$/g, '');
                    search_value = search_value.replace(/ +(?= )/g, '');
                    query_search["$match"][search_item] = { $regex: new RegExp(search_value, 'i') };
                }
            } else if (search_item == 'phone') {
                if (search_value != undefined && search_value != '') {
                    search_value = search_value.replace(/\D/g, '');
                    query_search["$match"][search_item] = { $regex: new RegExp(search_value, 'i') };
                }
            } else {
                if (search_value != undefined && search_value != '') {
                    query_search["$match"][search_item] = search_value;
                }
            }

            Admin.aggregate([
                query_search,
                sort
            ]).then((admin_array) => {
                // console.log("lists", admin_array)
                res.render('admin_list', {
                    url_data: req.session.menu_array,
                    admins: admin_array,
                    msg: req.session.error,
                    moment: moment,
                    admin_type: req.session.admin.usertype
                });
            });
        } else {

            Utils.redirect_login(req, res);
        }
    });
};



exports.user_list = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            User.find({}).then((user) => {



                res.render('user_list', {
                    detail: user,
                    msg: req.session.error,
                    moment: moment,
                    admin_type: req.session.admin.usertype
                });
            })
        } else {

            Utils.redirect_login(req, res);
        }
    })
}



exports.student_list = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {

            var filter = {
                $match: {},
            };
            var class_id = req.body.class_id
            if (class_id != "ALL" && class_id != undefined && class_id != "") {
                filter["$match"]["class_id"] = ObjectId(class_id);
            };


            var status = req.body.status
            if (status != "ALL" && status != undefined && status != "") {
                filter["$match"]["status"] = Number(status);
            }

            Class.find({}).then((class_data) => {

                Studnet.aggregate([
                    filter,

                    {
                        $lookup:
                        {
                            from: "classes",
                            localField: "class_id",
                            foreignField: "_id",
                            as: "Calas_data"
                        }
                    },

                    { $unwind: "$Calas_data" },

                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            class_name: "$Calas_data.name",
                            status: 1,
                            sequence_id: 1,
                            email: 1,
                            gender:1,
                            phone: 1,
                            picture: 1,
                            create_date: 1
                        }
                    },

                ]).then((student_Array) => {

                    res.render('student_list', {
                        Student: student_Array,
                        msg: req.session.error,
                        //this lookup
                        class_data: class_data,
                        moment: moment,
                        url_data: req.session.menu_array,

                        //these filter
                        class_id: class_id,
                        status: status,
                        admin_type: req.session.admin.usertype
                    });
                })
            })
        } else {

            Utils.redirect_login(req, res);
        }
    })
}





exports.teacher_list = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Teacher.find({}).then((teacher_data) => {

                res.render('teacher_list', {
                    url_data: req.session.menu_array,
                    Teacher: teacher_data,
                    msg: req.session.error,
                    moment: moment,
                    admin_type: req.session.admin.usertype

                })
            })
        }

    })
}





exports.sreport_list = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            var Filter = {
                $match: {},
            };
            var class_id = req.body.class_id
            if (class_id != "ALL" && class_id != undefined && class_id != "") {
                Filter["$match"]["class_id"] = ObjectId(class_id);
            };
            Class.find({}).then((Calas_data) => {



                Studnet.aggregate([
                    Filter,
                    {
                        $lookup:
                        {
                            from: "classes",
                            localField: "class_id",
                            foreignField: "_id",
                            as: "Calas_data"
                        }
                    },

                    { $unwind: "$Calas_data" },



                    {
                        $group: {
                            _id: { class_name: "$Calas_data.name", textstatus: "$textstatus" },
                            total: { $sum: 1 }

                        }
                    },


                    {$sort:{"_id.class_name":1}},


                    {
                        $project: {

                            _id: 0,
                            class_name: "$_id.class_name",
                            textstatus: "$_id.textstatus",
                            total: 1





                        }
                    },

                ]).then((student_Array) => {

                    res.render('sreport_list', {
                        url_data: req.session.menu_array,
                        Student: student_Array,
                        msg: req.session.error,
                        Calas_data: Calas_data,
                        class_id: class_id,
                        moment: moment,
                        admin_type: req.session.admin.usertype
                    });
                })
            })
        } else {

            Utils.redirect_login(req, res);
        }
    })
}


exports.class_list = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Class.find({}).then((class_Array) => {


                res.render('class_list', {
                    Class: class_Array,
                    msg: req.session.error,
                    url_data: req.session.menu_array,
                    moment: moment,
                    admin_type: req.session.admin.usertype
                });
            })
        } else {

            Utils.redirect_login(req, res);
        }
    })
}





exports.subject_list = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Subject.find({}).then((subject_Array) => {


                res.render('subject_list', {
                    url_data: req.session.menu_array,
                    Subject: subject_Array,
                    msg: req.session.error,
                    moment: moment,
                    admin_type: req.session.admin.usertype
                });
            })
        } else {

            Utils.redirect_login(req, res);
        }
    })
}






// Handle create admin actions

exports.exam_list = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {

            var filter = {
                $match: {},
            };

            var student_id = req.body.student_id
            if (student_id != "ALL" && student_id != undefined && student_id != "") {
                filter["$match"]["student_id"] = ObjectId(student_id);
            };

            var subject_id = req.body.subject_id
            if (subject_id != "ALL" && subject_id != undefined && subject_id != "") {
                filter["$match"]["subject_id"] = ObjectId(subject_id);
            };

            var status = req.body.status
            if (status != "ALL" && status != undefined && status != "") {
                filter["$match"]["status"] = Number(status);
            }


            Studnet.find({}).then((student_data) => {
                Subject.find({}).then((subject_data) => {

                    Exam.aggregate([
                        filter,


                        {
                            $lookup:
                            {
                                from: "students",
                                localField: "student_id",
                                foreignField: "_id",
                                as: "Student_data"
                            }
                        },

                        { $unwind: "$Student_data" },

                        {
                            $lookup:
                            {
                                from: "subjects",
                                localField: "subject_id",
                                foreignField: "_id",
                                as: "Subject_data"
                            }
                        },

                        { $unwind: "$Subject_data" },

                        {
                            $project: {
                                _id: 1,
                                marks: 1,
                                student_name: "$Student_data.name",
                                subject_name: "$Subject_data.name",
                                status: 1,
                                sequence_id: 1,
                                create_date: 1
                            }
                        },


                    ]).then((exam_Array) => {

                        res.render('exam_list', {
                            url_data: req.session.menu_array,
                            Exam: exam_Array,
                            //this lookup
                            student_data: student_data,
                            subject_data: subject_data,
                            msg: req.session.error,
                            moment: moment,
                            //these filter
                            student_id: student_id,
                            subject_id: subject_id,
                            status: status,
                            admin_type: req.session.admin.usertype
                        });

                    })
                })
            })
        } else {

            Utils.redirect_login(req, res);
        }
    })
}



exports.fee_list = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Studnet.find({}).then((student_data) => {
                Class.find({}).then((class_data) => {

                    Fee.aggregate([



                        {
                            $lookup:
                            {
                                from: "students",
                                localField: "student_id",
                                foreignField: "_id",
                                as: "Student_data"
                            }
                        },

                        { $unwind: "$Student_data" },

                        {
                            $lookup:
                            {
                                from: "classes",
                                localField: "class_id",
                                foreignField: "_id",
                                as: "Class_data"
                            }
                        },

                        { $unwind: "$Class_data" },

                        {
                            $project: {
                                _id: 1,
                                payment: 1,
                                status: 1,
                                student_name: "$Student_data.name",
                                class_name: "$Class_data.name",
                                sequence_id: 1,
                                create_date: 1
                            }
                        },

                    ]).then((fee_Array) => {


                        res.render('fee_list', {
                            url_data: req.session.menu_array,
                            Fee: fee_Array,
                            msg: req.session.error,
                            student_data: student_data,
                            class_data: class_data,
                            moment: moment,
                            admin_type: req.session.admin.usertype
                        });
                    })
                })
            })
        } else {

            Utils.redirect_login(req, res);
        }
    })
}




exports.feereport_list = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Class.find({}).then((class_array) => {

                Fee.aggregate([

                    {
                        $lookup:
                        {
                            from: "classes",
                            localField: "class_id",
                            foreignField: "_id",
                            as: "Calas_data"
                        }
                    },

                    { $unwind: "$Calas_data" },

                    {
                        $group:
                        {
                            _id: { class_name: "$Calas_data.name" },
                            totalStudent: { $sum: 1 },
                            totalPayment: { $sum: "$payment" }

                        }
                    },

                    {
                        $project: {
                            _id: 0,
                            class_name: "$_id.class_name",
                            totalPayment: 1,
                            totalStudent: 1


                        }
                    },




                ]).then((fee_date) => {
                    res.render('feereport_list', {
                        url_data: req.session.menu_array,
                        Fee: fee_date,
                        class: class_array,
                        msg: req.session.error,
                        moment: moment,
                        admin_type: req.session.admin.usertype
                    })
                })
            })

        }
        else {
            Utils.redirect_login(req, res);
        }

    })

}





exports.message_list = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Message.find({}).then((message_Array) => {


                res.render('message_list', {
                    url_data: req.session.menu_array,
                    Message: message_Array,
                    msg: req.session.error,
                    moment: moment,
                    admin_type: req.session.admin.usertype
                });
            })
        } else {

            Utils.redirect_login(req, res);
        }
    })
}





exports.quiz_list = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Types_Quiz.find({}).then((quiz_data) => {

                Quiz.aggregate([
                    {
                        $lookup: {
                            from: "typequizzes",
                            localField: "quiz_id",
                            foreignField: "_id",
                            as: "data"

                        }
                    },

                    { $unwind: "$data" },

                    {
                        $project: {
                            _id: 1,
                            sequence_id: 1,
                            quetion: 1,
                            answer1: 1,
                            answer2: 1,
                            answer3: 1,
                            correct: 1,
                            marks: 1,
                            quiz_name: "$data.name",
                            create_date: 1



                        }
                    }

                ]).then((quiz_Array) => {

                    res.render('quiz_list', {
                        url_data: req.session.menu_array,
                        Quiz: quiz_Array,
                        msg: req.session.error,
                        quiz_data: quiz_data,
                        moment: moment,
                        admin_type: req.session.admin.usertype
                    });
                })
            });
        }
        else {
            Utils.redirect_login(req, res);
        }
    })
}





exports.resultQuiz_list = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Class.find({}).then((class_Data) => {


                Result_Quiz.aggregate([

                    {
                        $lookup: {
                            from: "classes",
                            localField: "class_id",
                            foreignField: "_id",
                            as: "class_data"

                        }
                    },

                    { $unwind: "$class_data" },


                    {
                        $lookup: {
                            from: "subjects",
                            localField: "subject_id",
                            foreignField: "_id",
                            as: "subject_data"

                        }
                    },

                    { $unwind: "$subject_data" },

                    {
                        $lookup: {
                            from: "typequizzes",
                            localField: "quiz_id",
                            foreignField: "_id",
                            as: "quiz_data"

                        }
                    },

                    { $unwind: "$quiz_data" },

                    {
                        $project: {
                            _id: 1,
                            sequence_id: 1,
                            name: 1,
                            correct: 1,
                            wrong: 1,
                            marks: 1,
                            create_date: 1,
                            Class_name: "$class_data.name",
                            Subject_name: "$subject_data.name",
                            Quiz_name: "$quiz_data.name"

                        }
                    }


                ]).then((all_data) => {


                    res.render('resultQuiz_list', {
                        url_data: req.session.menu_array,
                        ResultQuiz: all_data,
                        msg: req.session.error,
                        moment: moment,
                        class_Data: class_Data,
                        admin_type: req.session.admin.usertype
                    });
                })
            })
        } else {

            Utils.redirect_login(req, res);
        }
    })
}








exports.typequiz_list = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Class.find({}).then((class_data) => {
                Subject.find({}).then((subject_data) => {



                    Types_Quiz.aggregate([


                        {
                            $lookup: {
                                from: "classes",
                                localField: "class_id",
                                foreignField: "_id",
                                as: "data"


                            }
                        },

                        { $unwind: "$data" },

                        {
                            $lookup: {
                                from: "subjects",
                                localField: "subject_id",
                                foreignField: "_id",
                                as: "Data"


                            }
                        },

                        { $unwind: "$Data" },

                        {
                            $project: {
                                _id: 1,
                                sequence_id: 1,
                                name: 1,
                                status: 1,
                                class_name: "$data.name",
                                subject_name: "$Data.name",
                                create_date: 1


                            }
                        }

                    ]).then((all_data) => {



                        res.render('typequiz_list', {
                            url_data: req.session.menu_array,
                            typequiz: all_data,
                            msg: req.session.error,
                            moment: moment,
                            class_data: class_data,
                            subject_data: subject_data,
                            admin_type: req.session.admin.usertype
                        });
                    })
                })
            })
        } else {

            Utils.redirect_login(req, res);
        }
    })
}




exports.add_admin = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Menu.find({type:1}).then((menu)=>{

       
            res.render("add_admin", { menu: menu, msg: req.session.error })
        })
        } else {
            Utils.redirect_login(req, res);
        }
    });
};




/// ADD USER
exports.add_user = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            res.render("add_user",
                {
                    systen_urls: systen_urls, msg: req.session.error
                })
        } else {
            Utils.redirect_login(req, res);
        }
    });
};



/// ADD Student
exports.add_student = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Class.find({}).then((class_Array) => {
                  
                Class.aggregate([

                    {$match:{status: 1}}
                    
                    ]).then((OnClass)=>{

                    
                res.render("add_student",
                    {
                        systen_urls: systen_urls, msg: req.session.error,
                        class_data: OnClass

                    })
                })

            })
        } else {
            Utils.redirect_login(req, res);
        }
    });
};




exports.add_teacher = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            res.render('add_teacher', {
                systen_urls: systen_urls, msg: req.session.error
            })
        }
        else {
            Utils.redirect_login(req, res)
        }
    })
}






/// ADD Class
exports.add_class = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            res.render("add_class",
                {
                    systen_urls: systen_urls, msg: req.session.error
                })
        } else {
            Utils.redirect_login(req, res);
        }
    });
};



/// ADD Subject
exports.add_subject = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            res.render("add_subject",
                {
                    systen_urls: systen_urls, msg: req.session.error
                })
        } else {
            Utils.redirect_login(req, res);
        }
    });
};


/// ADD Exam
exports.add_exam = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Subject.find({}).then((subject_Array) => {
                Studnet.find({}).then((student_Array) => {


                    res.render("add_exam",
                        {
                            systen_urls: systen_urls, msg: req.session.error,
                            subject_data: subject_Array,
                            student_data: student_Array
                        })

                })
            });

        }


        else {
            Utils.redirect_login(req, res);
        };
    });

}


//Select two dropdown list in add payment
exports.get_all_classess = function (req, res) {
    // console.log("jjjjjjjjjjjjjjjjjjjjj", req.body)
    Studnet.findOne({ _id: ObjectId(req.body._id) }).then((data) => {

        Class.find({}).then((cls) => {

            if (cls.length > 0) {
                res.send({
                    student: data,
                    success: true,
                    class: cls
                })
            } else {
                res.send({
                    student: [],
                    success: false,
                    class: []

                })
            }

        })
    })

}




//ADD FEE
exports.add_fee = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Studnet.find({}).then((student_Array) => {
                Class.find({}).then((class_Array) => {


                    res.render("add_fee",
                        {
                            systen_urls: systen_urls, msg: req.session.error,
                            Student_data: student_Array,
                            Class_data: class_Array
                        })
                })
            })
        } else {
            Utils.redirect_login(req, res);
        }
    });
};







exports.add_message = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            res.render("add_message",
                {
                    systen_urls: systen_urls, msg: req.session.error
                })
        } else {
            Utils.redirect_login(req, res);
        }
    });
};




exports.add_quiz = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Types_Quiz.find({}).then((quiz) => {


                res.render("add_quiz",
                    {
                        systen_urls: systen_urls, msg: req.session.error,
                        Quiz_data: quiz
                    })
            })

        } else {
            Utils.redirect_login(req, res);
        }
    });
};





exports.add_typequiz = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Subject.find({}).then((subject_data) => {
                Class.find({}).then((class_data) => {


                    res.render("add_typequiz",
                        {
                            systen_urls: systen_urls, msg: req.session.error,
                            Subject_data: subject_data,
                            Class_data: class_data
                        })
                })
            })
        } else {
            Utils.redirect_login(req, res);
        }
    });
}





// Handle create admin actions
exports.save_admin_details = function (req, res) {
    console.log("req.body", req.files)
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Admin.findOne({ "phone": req.body.phone }).then((admin) => {

                if (admin) {
                    req.session.error = "Sorry, There is an admin with this phone, please check the phone";
                    Utils.redirect_login(req, res);
                } else {
                    var image_name = ""
                    var url = "";
                    var liner = "";
                    // Create a schema
                    var schema = new passwordValidator();
                    schema.is().min(8)                                 // Minimum length 8
                        .is().max(30)                                  // Maximum length 100
                        .has().lowercase()                             // Must have lowercase letters
                        .has().digits()                                // Must have at least 2 digits
                        .has().not().spaces();                         // Blacklist these values
                    // Validate against a password string
                    if (schema.validate(req.body.password)) {
                        var profile_file = req.files;
                        var name = req.body.name
                        var admin = new Admin({
                            name: name,
                            sequence_id: Utils.get_unique_id(),
                            email: req.body.email,
                            phone: req.body.phone,
                            type:req.body.type,
                            status: 1,
                            allowed_urls:req.body.allowed_urls,
                            extra_detail: req.body.extra_detail,
                            picture: "",
                            password: Bcrypt.hashSync(req.body.password, 10)
                        });
                        if (profile_file != undefined && profile_file.length > 0) {
                            // var image_name = admin._id + Utils.tokenGenerator(4);
                            // var url = Utils.getImageFolderPath(1) + image_name + '.jpg';
                            // Utils.saveImageIntoFolder(req.files[0].path, image_name + '.jpg', 1);


                            /// inser images
                            image_name = Utils.tokenGenerator(29) + '.jpg';
                            //v
                            url = "./uploads/admin_profile/" + image_name;
                            liner = "admin_profile/" + image_name;
                            // console.log("linear", liner)
                            // console.log("url", url)
                            fs.readFile(req.files[0].path, function (err, data) {
                                fs.writeFile(url, data, 'binary', function (err) { });
                                fs.unlink(req.files[0].path, function (err, file) {

                                });
                            });

                            admin.picture = liner;
                        }
                        admin.save().then((admin) => {
                            req.session.error = "Congrates, Admin was created successfully.........";
                            res.redirect("/admin_list");
                        });
                    } else {
                        req.session.error = "Please use strong password that contains latrers and Digitals";
                        res.redirect("/add_admin")
                    }
                }
            })
        } else {
            Utils.redirect_login(req, res);
        }
    });
};




///  handele create user list
exports.save_user_data = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        console.log("body", req.body)
        if (response.success) {
            User.findOne({ "phone": req.body.phone }).then((user) => {
                console.log("user", user)
                if (user) {
                    req.session.error = "Sorry, There is an admin with this phone, please check the phone";
                    Utils.redirect_login(req, res);
                } else {
                    // Create a schema
                    var schema = new passwordValidator();
                    schema.is().min(8)                                 // Minimum length 8
                        .is().max(30)                                  // Maximum length 100
                        .has().lowercase()                             // Must have lowercase letters
                        .has().digits()                                // Must have at least 2 digits
                        .has().not().spaces();                         // Blacklist these values
                    // Validate against a password string
                    if (schema.validate(req.body.password)) {
                        var profile_file = req.files;
                        var name = req.body.name
                        var user = new User({
                            name: name,
                            sequence_id: Utils.get_unique_id(),
                            email: req.body.email,
                            phone: req.body.phone,
                            status: 1,
                            extra_detail: req.body.extra_detail,
                            picture: "",
                            password: Bcrypt.hashSync(req.body.password, 10)
                        });
                        if (profile_file != undefined && profile_file.length > 0) {
                            // var image_name = user._id + Utils.tokenGenerator(4);
                            // var url = Utils.getImageFolderPath(1) + image_name + '.jpg';
                            // Utils.saveImageIntoFolder(req.files[0].path, image_name + '.jpg', 1);


                            /// inser images
                            image_name = Utils.tokenGenerator(29) + '.jpg';
                            //v
                            url = "./uploads/admin_profile/" + image_name;
                            liner = "admin_profile/" + image_name;
                            // console.log("linear", liner)
                            // console.log("url", url)
                            fs.readFile(req.files[0].path, function (err, data) {
                                fs.writeFile(url, data, 'binary', function (err) { });
                                fs.unlink(req.files[0].path, function (err, file) {

                                });
                            });

                            user.picture = liner;
                        }
                        user.save().then((admin) => {
                            req.session.error = "Congrates, Admin was created successfully.........";
                            res.redirect("/user_list");
                        });
                    } else {
                        req.session.error = "Please use strong password that contains latrers and Digitals";
                        res.redirect("/add_user")
                    }
                }
            })
        } else {
            Utils.redirect_login(req, res);
        }
    });
};








//  handele create student list
exports.save_student_data = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        console.log("body", req.body)
        if (response.success) {
            Studnet.findOne({ "phone": req.body.phone }).then((student) => {
                console.log("user", student)
                if (student) {
                    req.session.error = "Sorry, There is an admin with this phone, please check the phone";
                    Utils.redirect_login(req, res);
                } else {
                    // Create a schema
                    var schema = new passwordValidator();
                    schema.is().min(8)                                 // Minimum length 8
                        .is().max(30)                                  // Maximum length 100
                        .has().lowercase()                             // Must have lowercase letters
                        .has().digits()                                // Must have at least 2 digits
                        .has().not().spaces();                         // Blacklist these values
                    // Validate against a password string
                    if (schema.validate(req.body.password)) {
                        var profile_file = req.files;
                        var name = req.body.name
                        var student = new Studnet({
                            name: name,
                            sequence_id: Utils.get_unique_id(),
                            email: req.body.email,
                            gender:req.body.gender,
                            phone: req.body.phone,
                            status: 1,
                            // textstatus: req.body.textstatus,
                            extra_detail: req.body.extra_detail,
                            class_id: req.body.class_id,
                            picture: "",
                            user_name: req.body.user_name,
                            PassWord: req.body.password,
                            password: Bcrypt.hashSync(req.body.password, 10)
                        });
                        if (profile_file != undefined && profile_file.length > 0) {
                            //var image_name = student._id + Utils.tokenGenerator(4);
                            //var url = Utils.getImageFolderPath(1) + image_name + '.jpg';
                            // Utils.saveImageIntoFolder(req.files[0].path, image_name + '.jpg', 1);


                            /// inser images
                            image_name = Utils.tokenGenerator(29) + '.jpg';
                            //v
                            url = "./uploads/admin_profile/" + image_name;
                            liner = "admin_profile/" + image_name;
                            // console.log("linear", liner)
                            // console.log("url", url)
                            fs.readFile(req.files[0].path, function (err, data) {
                                fs.writeFile(url, data, 'binary', function (err) { });
                                fs.unlink(req.files[0].path, function (err, file) {

                                });
                            });

                            student.picture = liner;
                        }
                        student.save().then((admin) => {
                            req.session.error = "Congrates, Admin was created successfully.........";
                            res.redirect("/student_list");
                        });
                    } else {
                        req.session.error = "Please use strong password that contains latrers and Digitals";
                        res.redirect("/add_student")
                    }
                }
            })
        } else {
            Utils.redirect_login(req, res);
        }
    });

};






//  handele create teacher list
exports.save_teacher_data = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        console.log("body", req.body)
        if (response.success) {
            Teacher.findOne({ "phone": req.body.phone }).then((teacher) => {
                console.log("user", teacher)
                if (teacher) {
                    req.session.error = "Sorry, There is an admin with this phone, please check the phone";
                    Utils.redirect_login(req, res);
                } else {
                    // Create a schema
                    var schema = new passwordValidator();
                    schema.is().min(8)                                 // Minimum length 8
                        .is().max(30)                                  // Maximum length 100
                        .has().lowercase()                             // Must have lowercase letters
                        .has().digits()                                // Must have at least 2 digits
                        .has().not().spaces();                         // Blacklist these values
                    // Validate against a password string
                    if (schema.validate(req.body.password)) {
                        var profile_file = req.files;
                        var name = req.body.name
                        var teacher = new Teacher({
                            name: name,
                            sequence_id: Utils.get_unique_id(),
                            email: req.body.email,
                            phone: req.body.phone,
                            fee: req.body.fee,
                            status: 1,
                            extra_detail: req.body.extra_detail,
                            picture: "",
                            user_name: req.body.user_name,
                            PassWord: req.body.password,
                            password: Bcrypt.hashSync(req.body.password, 10)
                        });
                        if (profile_file != undefined && profile_file.length > 0) {
                            //var image_name = student._id + Utils.tokenGenerator(4);
                            //var url = Utils.getImageFolderPath(1) + image_name + '.jpg';
                            // Utils.saveImageIntoFolder(req.files[0].path, image_name + '.jpg', 1);


                            /// inser images
                            image_name = Utils.tokenGenerator(29) + '.jpg';
                            //v
                            url = "./uploads/admin_profile/" + image_name;
                            liner = "admin_profile/" + image_name;
                            // console.log("linear", liner)
                            // console.log("url", url)
                            fs.readFile(req.files[0].path, function (err, data) {
                                fs.writeFile(url, data, 'binary', function (err) { });
                                fs.unlink(req.files[0].path, function (err, file) {

                                });
                            });

                            teacher.picture = liner;
                        }
                        teacher.save().then((admin) => {
                            req.session.error = "Congrates, Admin was created successfully.........";
                            res.redirect("/teacher_list");
                        });
                    } else {
                        req.session.error = "Please use strong password that contains latrers and Digitals";
                        res.redirect("/add_teacher")
                    }
                }
            })
        } else {
            Utils.redirect_login(req, res);
        }
    });

};







//  handele create class list
exports.save_class_data = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        console.log("hhhhhh", req.body)
        if (response.success) {

            // Validate against a password string

            var name = req.body.name
            var clas = new Class({
                name: name,
                sequence_id: Utils.get_unique_id(),
                status: 1
            });

            clas.save().then((admin) => {
                req.session.error = "Congrates, Admin was created successfully.........";
                res.redirect("/class_list");
            });




        } else {
            Utils.redirect_login(req, res);
        }
    });

};






//  handele create subject list
exports.save_subject_data = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        console.log("body", req.body)
        if (response.success) {


            var name = req.body.name
            var subject = new Subject({
                name: name,
                sequence_id: Utils.get_unique_id(),
                status: 1

            });
            subject.save().then((admin) => {
                req.session.error = "Congrates, Admin was created successfully.........";
                res.redirect("/subject_list");
            });



        } else {
            Utils.redirect_login(req, res);
        }
    });

};





//  handele create exam list
exports.save_exam_data = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        console.log("body", req.body)
        if (response.success) {



            var marks = req.body.marks
            var exam = new Exam({

                sequence_id: Utils.get_unique_id(),
                marks: marks,
                status: 1,
                subject_id: req.body.subject_id,
                student_id: req.body.student_id,



            });

            exam.save().then((admin) => {
                req.session.error = "Congrates, Admin was created successfully.........";
                res.redirect("/exam_list");
            });
        }

        else {
            Utils.redirect_login(req, res);
        }
    });

};






exports.save_fee_data = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        console.log("body", req.body)
        if (response.success) {



            var payment = req.body.payment
            var fee = new Fee({

                sequence_id: Utils.get_unique_id(),
                payment: payment,
                status: 1,
                student_id: req.body.student_id,
                class_id: req.body.class_id,


            });

            fee.save().then((admin) => {
                req.session.error = "Congrates, Admin was created successfully.........";
                res.redirect("/fee_list");
            });
        }

        else {
            Utils.redirect_login(req, res);
        }
    });

};







exports.save_message_data = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        console.log("body", req.body)
        if (response.success) {
            Studnet.find({}).then((std) => {
                if (std.length > 0) {
                    std.forEach(each_std => {
                        if (each_std.token) {
                            var data = {
                                "title": req.body.title,
                                "token": each_std.token,
                                "message":req.body.message
                            }
                            Utils.send_notification(data, function (response) {


                            })
                        }

                    })
                }
            })


            var title = req.body.title
            var message = new Message({
                title: title,
                message: req.body.message,
                sequence_id: Utils.get_unique_id(),


            });
            message.save().then((admin) => {
                req.session.error = "Congrates, Admin was created successfully.........";
                res.redirect("/message_list");
            });



        } else {
            Utils.redirect_login(req, res);
        }
    });

};










exports.save_quiz_data = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        console.log("body", req.body)
        if (response.success) {


            var quetion = req.body.quetion
            var quiz = new Quiz({

                sequence_id: Utils.get_unique_id(),
                quetion: quetion,
                answer1: req.body.answer1,
                answer2: req.body.answer2,
                answer3: req.body.answer3,
                correct: req.body.correct,
                marks: req.body.marks,
                quiz_id: req.body.quiz_id,


            });

            quiz.save().then((admin) => {
                req.session.error = "Congrates, Admin was created successfully.........";
                res.redirect("/quiz_list");
            });
        }

        else {
            Utils.redirect_login(req, res);
        }
    });

};








exports.save_typequiz_data = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        console.log("ggg", req.body);
        if (response.success) {


            var name = req.body.name
            var typequiz = new Types_Quiz({

                sequence_id: Utils.get_unique_id(),
                name: name,
                class_id: req.body.class_id,
                subject_id: req.body.subject_id,
                status: 1,


            });

            typequiz.save().then((admin) => {
                req.session.error = "Congrates, Admin was created successfully.........";
                res.redirect("/typequiz_list");
            });
        }

        else {
            Utils.redirect_login(req, res);
        }
    });

};




// Handle update admin info
exports.edit_admin = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Admin.findOne({ _id: req.body.admin_id }, { password: 0 }).then((admin) => {
                if (admin) {
                    // console.log(admin)
                    res.render("add_admin", { admin_data: admin, systen_urls: systen_urls })
                } else {
                    res.redirect("/admin_list")
                }
            });
        } else {
            Utils.redirect_login(req, res);
        }
    });
};



//// handle edit user info
exports.edit_user = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            User.findOne({ _id: req.body.user_id }, { password: 0 }).then((user) => {
                if (user) {
                    // console.log(admin)
                    res.render("add_user", { user_data: user, systen_urls: systen_urls })
                } else {
                    res.redirect("/user_list")
                }
            });
        } else {
            Utils.redirect_login(req, res);
        }
    });
};




//// handle edit student info
exports.edit_student = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {

        if (response.success) {
            Studnet.findOne({ _id: req.body.student_id }, { password: 0 }).then((student) => {

                const class_id = (student.class_id);
                console.log("hhhhhhhhhh", class_id)

                Class.find({}).then((class_data) => {


                    if (student) {
                        // console.log("hhhhh",student_data)
                        res.render("add_student", { student_data: student, class_id: class_id.toString(), Class: class_data, systen_urls: systen_urls })

                    } else {
                        res.redirect("/student_list")
                    }

                })



            });

        } else {
            Utils.redirect_login(req, res);
        }

    });
};




/// handle edit student info
exports.edit_teacher = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Teacher.findOne({ _id: req.body.teacher_id }, { password: 0 }).then((teacher) => {
                if (teacher) {
                    // console.log(admin)
                    res.render("add_teacher", { teacher_data: teacher, systen_urls: systen_urls })
                } else {
                    res.redirect("/teacher_list")
                }
            });
        } else {
            Utils.redirect_login(req, res);
        }
    });
};






//// handle edit student info
exports.edit_class = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Class.findOne({ _id: req.body.class_id }, { password: 0 }).then((clas) => {
                if (clas) {
                    // console.log(admin)
                    res.render("add_class", { class_data: clas, systen_urls: systen_urls })
                } else {
                    res.redirect("/class_list")
                }
            });
        } else {
            Utils.redirect_login(req, res);
        }
    });
};




//// handle edit subject info
exports.edit_subject = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Subject.findOne({ _id: req.body.subject_id }, { password: 0 }).then((subject) => {

                if (subject) {
                    // console.log(admin)
                    res.render("add_subject", { subject_data: subject, systen_urls: systen_urls })
                } else {
                    res.redirect("/subject_list")
                }
            });
        } else {
            Utils.redirect_login(req, res);
        }
    });
};





//// handle edit exam info
exports.edit_exam = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Exam.findOne({ _id: req.body.exam_id }, { password: 0 }).then((exam) => {
                Studnet.find({}).then((student) => {
                    Subject.find({}).then((subject) => {




                        if (exam) {
                            // console.log(admin)
                            res.render("add_exam", { exam_data: exam, Student: student, student_id: exam.student_id.toString(), Subject: subject, subject_id: exam.subject_id.toString(), systen_urls: systen_urls })
                        } else {
                            res.redirect("/exam_list")
                        }
                    })
                })
            });
        } else {
            Utils.redirect_login(req, res);
        }
    });
};






exports.edit_fee = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Fee.findOne({ _id: req.body.fee_id }, { password: 0 }).then((fee) => {
                Studnet.find({}).then((student) => {
                    Class.find({}).then((clas) => {

                        if (fee) {
                            // console.log(admin)
                            res.render("add_fee", { fee_data: fee, Student: student, student_id: fee.student_id.toString(), Class: clas, class_id: fee.class_id.toString(), systen_urls: systen_urls })
                        } else {
                            res.redirect("/fee_list")
                        }
                    })
                })
            });
        } else {
            Utils.redirect_login(req, res);
        }
    });
};



//add other payment or fee
exports.add = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Fee.findOne({_id:req.body.feee_id}).then((data)=>{
            //   console.log("hhhhhhhh",data)
            res.render("add_fee",
                {
                    systen_urls: systen_urls, msg: req.session.error,
                    All_Fee:data
                })
    
            })
        } else {
            res.redirect("/fee_list")
        }
    });
};






//// handle edit typequiz info
exports.edit_typequiz = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Types_Quiz.findOne({ _id: req.body.typequiz_id }, { password: 0 }).then((type) => {
                Class.find({}).then((Class) => {
                    Subject.find({}).then((Subject) => {



                        if (type) {
                            // console.log(admin)
                            res.render("add_typequiz", { typequiz_data: type, Class: Class, class_id: type.class_id.toString(), Subject: Subject, subject_id: type.subject_id.toString(), systen_urls: systen_urls })
                        } else {
                            res.redirect("/typequiz_list")
                        }
                    })
                })
            });
        } else {
            Utils.redirect_login(req, res);
        }
    });
};







// Handle update admin actions
exports.update_admin_details = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            var profile_file = req.files;
            req.body.name = req.body.name.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ');
            if (profile_file == '' || profile_file == 'undefined') {
                Admin.findByIdAndUpdate(req.body.admin_id, req.body, { useFindAndModify: false }).then((data) => {
                    if (data._id.equals(req.session.admin.user_id)) {
                        Utils.redirect_login(req, res);
                    } else {
                        res.redirect("/admin_list");
                    }
                }, (err) => {
                    res.redirect("/admin_list");
                });
            } else {
                Admin.findById(req.body.admin_id).then((admin) => {
                    if (admin.picture) {
                        Utils.deleteImageFromFolderTosaveNewOne(admin.picture, 1);
                    }
                    var image_name = admin._id + Utils.tokenGenerator(4);
                    var url = Utils.getImageFolderPath(1) + image_name + '.jpg';
                    Utils.saveImageIntoFolder(req.files[0].path, image_name + '.jpg', 1);

                    
                   
                            req.body.picture = url;
                    // req.body.passport_expire_date = moment(req.body.passport_expire_date).format("MMM Do YYYY");
                    Admin.findByIdAndUpdate(req.body.admin_id, req.body, { useFindAndModify: false }).then((data) => {
                        if (data._id.equals(req.session.admin.user_id)) {
                            Utils.redirect_login(req, res);
                        } else {
                            res.redirect("/admin_list");
                        }
                    }, (err) => {
                        res.redirect("/admin_list");
                    });
                });
            }
        } else {
            Utils.redirect_login(req, res);
        }
    });
};



/// handle update user info
exports.update_user_detail = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            var profile_file = req.files;
            req.body.name = req.body.name.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ');
            if (profile_file == '' || profile_file == 'undefined') {
                User.findByIdAndUpdate(req.body.user_id, req.body, { useFindAndModify: false }).then((data) => {
                    if (data._id.equals(req.session.admin.user_id)) {
                        Utils.redirect_login(req, res);
                    } else {
                        res.redirect("/user_list");
                    }
                }, (err) => {
                    res.redirect("/user_list");
                });
            } else {
                User.findById(req.body.user_id).then((user) => {
                    if (user.picture) {
                        Utils.deleteImageFromFolderTosaveNewOne(user.picture, 1);
                    }
                    var image_name = user._id + Utils.tokenGenerator(4);
                    var url = Utils.getImageFolderPath(1) + image_name + '.jpg';
                    Utils.saveImageIntoFolder(req.files[0].path, image_name + '.jpg', 1);
                    req.body.picture = url;
                    // req.body.passport_expire_date = moment(req.body.passport_expire_date).format("MMM Do YYYY");
                    User.findByIdAndUpdate(req.body.user_id, req.body, { useFindAndModify: false }).then((data) => {
                        if (data._id.equals(req.session.admin.user_id)) {
                            Utils.redirect_login(req, res);
                        } else {
                            res.redirect("/user_list");
                        }
                    }, (err) => {
                        res.redirect("/user_list");
                    });
                });
            }
        } else {
            Utils.redirect_login(req, res);
        }
    });
};


/// handle update student info
exports.update_student_details = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            var profile_file = req.files;
            req.body.name = req.body.name.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ');
            if (profile_file == '' || profile_file == 'undefined') {

                const status = Number(req.body.status);

                if (status === 1) {
                    var data = {
                        type: req.body.type,
                        name: req.body.name,
                        email: req.body.email,
                        gender:req.body.gender,
                        class_id: req.body.class_id,
                        status: status,
                        phone: req.body.phone,
                        textstatus: "Active"
                    }
                }
                else if (status === 0) {
                    var data = {
                        type: req.body.type,
                        name: req.body.name,
                        email: req.body.email,
                        gender:req.body.gender,
                        phone: req.body.phone,
                        class_id: req.body.class_id,
                        status: status,
                        textstatus: "Inactive"
                    }
                }

                Studnet.findByIdAndUpdate(req.body.student_id, data, { useFindAndModify: false }).then((data) => {
                    if (data._id.equals(req.session.admin.student_id)) {
                        Utils.redirect_login(req, res);
                    } else {
                        res.redirect("/student_list");
                    }
                }, (err) => {
                    res.redirect("/student_list");
                });
            } else {
                Studnet.findById(req.body.student_id).then((student) => {
                    if (user.picture) {
                        Utils.deleteImageFromFolderTosaveNewOne(user.picture, 1);
                    }
                    var image_name = user._id + Utils.tokenGenerator(4);
                    var url = Utils.getImageFolderPath(1) + image_name + '.jpg';
                    Utils.saveImageIntoFolder(req.files[0].path, image_name + '.jpg', 1);
                    req.body.picture = url;

                    const status = req.body.status;

                    if (status == 1) {
                        var data = {
                            type: req.body.type,
                            name: req.body.name,
                            email: req.body.email,
                            gender:req.body.gender,
                            phone: req.body.phone,
                            class_id: req.body.class_id,
                            status: status,

                            textstatus: "Active"
                        }
                    }
                    else if (status == 0) {
                        var data = {
                            type: req.body.type,
                            name: req.body.name,
                            email: req.body.email,
                            gender:req.body.gender,
                            class_id: req.body.class_id,
                            status: status,
                            phone: req.body.phone,
                            textstatus: "Inactive"
                        }
                    }






                    // req.body.passport_expire_date = moment(req.body.passport_expire_date).format("MMM Do YYYY");
                    Studnet.findByIdAndUpdate(req.body.student_id, data, { useFindAndModify: true }).then((status) => {
                        if (status._id.equals(req.session.admin.student_id)) {
                            Utils.redirect_login(req, res);
                        } else {
                            res.redirect("/student_list");
                        }
                    }, (err) => {
                        res.redirect("/student_list");
                    });
                });
            }
        } else {
            Utils.redirect_login(req, res);
        }
    });
};





/// handle update class info
exports.update_teacher_details = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            var profile_file = req.files;
            req.body.name = req.body.name.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ');
            if (profile_file == '' || profile_file == 'undefined') {
                Teacher.findByIdAndUpdate(req.body.teacher_id, req.body, { useFindAndModify: false }).then((data) => {
                    if (data._id.equals(req.session.admin.teacher_id)) {
                        Utils.redirect_login(req, res);
                    } else {
                        res.redirect("/teacher_list");
                    }
                }, (err) => {
                    res.redirect("/teacher_list");
                });
            } else {
                Teacher.findById(req.body.teacher_id).then((teacher) => {
                    if (user.picture) {
                        Utils.deleteImageFromFolderTosaveNewOne(user.picture, 1);
                    }
                    var image_name = user._id + Utils.tokenGenerator(4);
                    var url = Utils.getImageFolderPath(1) + image_name + '.jpg';
                    Utils.saveImageIntoFolder(req.files[0].path, image_name + '.jpg', 1);
                    req.body.picture = url;
                    // req.body.passport_expire_date = moment(req.body.passport_expire_date).format("MMM Do YYYY");
                    Teacher.findByIdAndUpdate(req.body.teacher_id, req.body, { useFindAndModify: false }).then((data) => {
                        if (data._id.equals(req.session.admin.teacher_id)) {
                            Utils.redirect_login(req, res);
                        } else {
                            res.redirect("/teacher_list");
                        }
                    }, (err) => {
                        res.redirect("/teacher_list");
                    });
                });
            }
        } else {
            Utils.redirect_login(req, res);
        }
    });
};






/// handle update class info
exports.update_class_details = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            var profile_file = req.files;
            req.body.name = req.body.name.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ');
            if (profile_file == '' || profile_file == 'undefined') {
                Class.findByIdAndUpdate(req.body.class_id, req.body, { useFindAndModify: false }).then((data) => {
                    if (data._id.equals(req.session.admin.class_id)) {
                        Utils.redirect_login(req, res);
                    } else {
                        res.redirect("/class_list");
                    }
                }, (err) => {
                    res.redirect("/class_list");
                });
            } else {
                Class.findById(req.body.class_id).then((student) => {
                    if (user.picture) {
                        Utils.deleteImageFromFolderTosaveNewOne(user.picture, 1);
                    }
                    var image_name = user._id + Utils.tokenGenerator(4);
                    var url = Utils.getImageFolderPath(1) + image_name + '.jpg';
                    Utils.saveImageIntoFolder(req.files[0].path, image_name + '.jpg', 1);
                    req.body.picture = url;
                    // req.body.passport_expire_date = moment(req.body.passport_expire_date).format("MMM Do YYYY");
                    Class.findByIdAndUpdate(req.body.class_id, req.body, { useFindAndModify: false }).then((data) => {
                        if (data._id.equals(req.session.admin.class_id)) {
                            Utils.redirect_login(req, res);
                        } else {
                            res.redirect("/class_list");
                        }
                    }, (err) => {
                        res.redirect("/class_list");
                    });
                });
            }
        } else {
            Utils.redirect_login(req, res);
        }
    });
};




/// handle update subject info
exports.update_subject_detail = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            var profile_file = req.files;
            req.body.name = req.body.name.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ');
            if (profile_file == '' || profile_file == 'undefined') {
                Subject.findByIdAndUpdate(req.body.subject_id, req.body, { useFindAndModify: false }).then((data) => {
                    if (data._id.equals(req.session.admin.subject_id)) {
                        Utils.redirect_login(req, res);
                    } else {
                        res.redirect("/subject_list");
                    }
                }, (err) => {
                    res.redirect("/subject_list");
                });
            } else {
                Subject.findById(req.body.subject_id).then((student) => {
                    if (user.picture) {
                        Utils.deleteImageFromFolderTosaveNewOne(user.picture, 1);
                    }
                    var image_name = user._id + Utils.tokenGenerator(4);
                    var url = Utils.getImageFolderPath(1) + image_name + '.jpg';
                    Utils.saveImageIntoFolder(req.files[0].path, image_name + '.jpg', 1);
                    req.body.picture = url;
                    // req.body.passport_expire_date = moment(req.body.passport_expire_date).format("MMM Do YYYY");
                    Subject.findByIdAndUpdate(req.body.subject_id, req.body, { useFindAndModify: false }).then((data) => {
                        if (data._id.equals(req.session.admin.subject_id)) {
                            Utils.redirect_login(req, res);
                        } else {
                            res.redirect("/subject_list");
                        }
                    }, (err) => {
                        res.redirect("/subject_list");
                    });
                });
            }
        } else {
            Utils.redirect_login(req, res);
        }
    });
};





/// handle update exam info
exports.update_exam_detail = function (req, res) {
    console.log("aaaaaaaaa", req.body)
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            var profile_file = req.files;
            // req.body.name = req.body.name.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ');
            if (profile_file == '' || profile_file == 'undefined') {
                Exam.findByIdAndUpdate(req.body.exam_id, req.body, { useFindAndModify: false }).then((data) => {
                    console.log("aaaaaaaaa", data)
                    if (data._id.equals(req.session.admin.exam_id)) {
                        Utils.redirect_login(req, res);
                    } else {
                        res.redirect("/exam_list");
                    }
                }, (err) => {
                    res.redirect("/exam_list");
                });
            } else {
                Exam.findById(req.body.exam_id).then((student) => {
                    if (user.picture) {
                        Utils.deleteImageFromFolderTosaveNewOne(user.picture, 1);
                    }
                    var image_name = user._id + Utils.tokenGenerator(4);
                    var url = Utils.getImageFolderPath(1) + image_name + '.jpg';
                    Utils.saveImageIntoFolder(req.files[0].path, image_name + '.jpg', 1);
                    req.body.picture = url;
                    // req.body.passport_expire_date = moment(req.body.passport_expire_date).format("MMM Do YYYY");
                    Exam.findByIdAndUpdate(req.body.exam_id, req.body, { useFindAndModify: false }).then((data) => {
                        if (data._id.equals(req.session.admin.exam_id)) {
                            Utils.redirect_login(req, res);
                        } else {
                            res.redirect("/exam_list");
                        }
                    }, (err) => {
                        res.redirect("/exam_list");
                    });
                });
            }
        } else {
            Utils.redirect_login(req, res);
        }
    });
};





/// handle update exam info
exports.update_fee_detail = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            var profile_file = req.files;
            // req.body.name = req.body.name.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ');
            if (profile_file == '' || profile_file == 'undefined') {
                Fee.findByIdAndUpdate(req.body.fee_id, req.body, { useFindAndModify: false }).then((data) => {
                    if (data._id.equals(req.session.admin.fee_id)) {
                        Utils.redirect_login(req, res);
                    } else {
                        res.redirect("/fee_list");
                    }
                }, (err) => {
                    res.redirect("/fee_list");
                });
            } else {
                Fee.findById(req.body.fee_id).then((student) => {
                    if (user.picture) {
                        Utils.deleteImageFromFolderTosaveNewOne(user.picture, 1);
                    }
                    var image_name = user._id + Utils.tokenGenerator(4);
                    var url = Utils.getImageFolderPath(1) + image_name + '.jpg';
                    Utils.saveImageIntoFolder(req.files[0].path, image_name + '.jpg', 1);
                    req.body.picture = url;
                    // req.body.passport_expire_date = moment(req.body.passport_expire_date).format("MMM Do YYYY");
                    Fee.findByIdAndUpdate(req.body.fee_id, req.body, { useFindAndModify: false }).then((data) => {
                        if (data._id.equals(req.session.admin.fee_id)) {
                            Utils.redirect_login(req, res);
                        } else {
                            res.redirect("/fee_list");
                        }
                    }, (err) => {
                        res.redirect("/fee_list");
                    });
                });
            }
        } else {
            Utils.redirect_login(req, res);
        }
    });
};




/// handle update exam info
exports.added_fee = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {

            //new payment to add old payment store database
            var newPayment = {
                payment:Number(req.body.payment)
            }
            
            //this fuction make to find the old payment to add new payment
            Fee.findById({_id:req.body.feee_id}).then((oldPayment)=>{
                curenPayment = oldPayment.payment
            
                var realPayment = {
                    status:oldPayment.status,
                    payment:newPayment.payment + curenPayment,
                    student_id:oldPayment.student_id,
                    class_id:oldPayment.class_id
                };
                Fee.findByIdAndUpdate(req.body.feee_id, realPayment, { useFindAndModify: false }).then((data) => {
                    if (data._id.equals(req.session.admin.feee_id)) {
                        Utils.redirect_login(req, res);
                    } else {
                        res.redirect("/fee_list");
                    }
                }, (err) => {
                    res.redirect("/fee_list");
                });
            });
            
        } else {
            Utils.redirect_login(req, res);
        }
    });
};






/// handle update exam info
exports.update_typequiz_details = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            var profile_file = req.files;
            // req.body.name = req.body.name.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ');
            if (profile_file == '' || profile_file == 'undefined') {
                Types_Quiz.findByIdAndUpdate(req.body.typequiz_id, req.body, { useFindAndModify: false }).then((type) => {

                    if (type._id.equals(req.session.admin.typequiz_id)) {
                        Utils.redirect_login(req, res);
                    } else {
                        res.redirect("/typequiz_list");
                    }
                }, (err) => {
                    res.redirect("/typequiz_list");
                });
            } else {
                Types_Quiz.findById(req.body.typequiz_id).then((student) => {
                    if (user.picture) {
                        Utils.deleteImageFromFolderTosaveNewOne(user.picture, 1);
                    }
                    var image_name = user._id + Utils.tokenGenerator(4);
                    var url = Utils.getImageFolderPath(1) + image_name + '.jpg';
                    Utils.saveImageIntoFolder(req.files[0].path, image_name + '.jpg', 1);
                    req.body.picture = url;
                    // req.body.passport_expire_date = moment(req.body.passport_expire_date).format("MMM Do YYYY");
                    Types_Quiz.findByIdAndUpdate(req.body.typequiz_id, req.body, { useFindAndModify: false }).then((type) => {
                        if (type._id.equals(req.session.admin.typequiz_id)) {
                            Utils.redirect_login(req, res);
                        } else {
                            res.redirect("/typequiz_list");
                        }
                    }, (err) => {
                        res.redirect("/typequiz_list");
                    });
                });
            }
        } else {
            Utils.redirect_login(req, res);
        }
    });
};




// Handle delete admin
exports.delete_admin = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Admin.findById(req.body.admin_id).then((admin) => {
                if (admin) {
                    Admin.deleteOne({ _id: req.body.admin_id }).then((admin) => {
                        res.json({
                            status: "success",
                            message: 'Admin deleted'
                        });
                    });
                } else {
                    res.json({
                        status: "error",
                        message: "Admin not found",
                    });
                }
            })
        } else {
            Utils.redirect_login(req, res);
        }
    });
};


////  delete user function
exports.delete_user = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            User.deleteOne({ _id: req.body.user_id }).then((user) => {
                res.redirect("/user_list")
            });
        } else {
            Utils.redirect_login(req, res);
        }
    });
};

////  delete studnet function
exports.delete_student = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Studnet.deleteOne({ _id: req.body.student_id }).then((user) => {
                res.redirect("/student_list")
            });
        } else {
            Utils.redirect_login(req, res);
        }
    });
};



////  delete teacher function
exports.delete_teacher = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Teacher.deleteOne({ _id: req.body.teacher_id }).then((user) => {
                res.redirect("/teacher_list")
            });
        } else {
            Utils.redirect_login(req, res);
        }
    });
};



////  delete class function
exports.delete_class = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Class.deleteOne({ _id: req.body.class_id }).then((user) => {
                res.redirect("/class_list")
            });
        } else {
            Utils.redirect_login(req, res);
        }
    });
};


////  delete subject function
exports.delete_subject = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Subject.deleteOne({ _id: req.body.subject_id }).then((user) => {
                res.redirect("/subject_list")
            });
        } else {
            Utils.redirect_login(req, res);
        }
    });
};




////  delete exam function
exports.delete_exam = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Exam.deleteOne({ _id: req.body.exam_id }).then((user) => {
                res.redirect("/exam_list")
            });
        } else {
            Utils.redirect_login(req, res);
        }
    });
};




////  delete fee function
exports.delete_fee = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Fee.deleteOne({ _id: req.body.fee_id }).then((user) => {
                res.redirect("/fee_list")
            });
        } else {
            Utils.redirect_login(req, res);
        }
    });
};






////  delete message function
exports.delete_message = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Message.deleteOne({ _id: req.body.message_id }).then((user) => {
                res.redirect("/message_list")
            });
        } else {
            Utils.redirect_login(req, res);
        }
    });
};




////  delete quiz function
exports.delete_quiz = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Quiz.deleteOne({ _id: req.body.quiz_id }).exec().then((user) => {
                res.redirect("/quiz_list")
            });
        } else {
            Utils.redirect_login(req, res);
        }
    });
};






////  delete typequiz function
exports.delete_typequiz = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Types_Quiz.deleteOne({ _id: req.body.typequiz_id }).exec().then((user) => {
                res.redirect("/typequiz_list")
            });
        } else {
            Utils.redirect_login(req, res);
        }
    });
};



// Handle view admin logout
exports.log_out = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            req.session.destroy(function (err, data) {
                if (err) {
                    //console.log(err);
                } else {
                    //console.log('after'+req.session);
                    res.redirect('/');
                }
            });
        } else {
            Utils.redirect_login(req, res);
        }
    });
};

// Handle view admin excell
exports.genetare_admin_excel = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            if (req.body.search_item != "undefined") {
                search_item = req.body.search_item;
                start_date = req.body.start_date;
                end_date = req.body.end_date;
            } else {
                search_item = "sequence_id";
                start_date = "";
                end_date = "";
            }
            Admin.find({}).then((admins) => {
                if (admins.length > 0) {
                    generate_excel_declined_list(req, res, admins);
                }
            });
        } else {
            Utils.redirect_login(req, res);
        }
    });
};

async function generate_excel_declined_list(req, res, array) {
    var now = new Date(Date.now());
    var date = now.addHours();
    var time = date.getTime()

    const save_path = './data/excell/';
    const file_name = time + '_admin.xlsx';
    const options = {
        filename: save_path + file_name,
        useStyles: true,
        useSharedStrings: true
    };

    var workbook = new Excel.stream.xlsx.WorkbookWriter(options);
    var sheet = workbook.addWorksheet('sheet1');

    sheet.columns = [
        { header: 'ID', key: 'sequence_id' },
        { header: 'Name', key: 'name' },
        { header: 'Phone', key: 'phone' },
        { header: 'Email', key: 'email' },
        { header: 'Status', key: 'status' },
        { header: 'Created Date', key: 'created_date' }
    ];

    array.forEach(function (data, index) {

        let rows = {
            sequence_id: data.sequence_id,
            name: data.name,
            phone: data.phone,
            email: data.email,
            status: data.status,
            created_date: moment(data.created_date).format("hh:mm:a") + ' ' + moment(data.created_date).format("DD MMM YYYY")
        }


        sheet.addRow(rows).commit();

        if (index == array.length - 1) {

            workbook.commit().then(
                function () {
                    //console.log('excel file created');
                    let url = "/excell/" + file_name;
                    res.json(url);
                    setTimeout(function () {
                        fs.unlink(save_path + file_name, function (err, file) { });
                    }, 10000);
                },
                function (err) {
                    res.status(500).json({ status: 500, message: err });
                }
            );
        }

    })
}

// Handle update admin actions
exports.get_admin_session = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            res.json({ success: true, admin: req.session.admin })
        } else {
            res.json({ success: false });
        }
    });
};

// Handle admn_change_admin_pass
exports.admn_change_admin_pass = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Admin.findOne({ _id: req.body.admin_id }).then((admin_data) => {
                if (admin_data) {
                    // Create a schema
                    var schema = new passwordValidator();
                    schema.is().min(8)                                 // Minimum length 8
                        .is().max(30)                                  // Maximum length 100
                        .has().lowercase()                             // Must have lowercase letters
                        .has().digits()                                // Must have at least 2 digits
                        .has().not().spaces();                         // Blacklist these values
                    // Validate against a password string
                    if (schema.validate(req.body.new_pass)) {
                        Admin.findByIdAndUpdate({ _id: admin_data._id }, { password: Bcrypt.hashSync((req.body.new_pass).trim(), 10) }, { useFindAndModify: false }).then((admin) => {
                            res.json({ success: true, message: "Updated Successfully" });
                        })
                    } else {
                        res.json({ success: false, message: "Please use strong password that contains latrers and Digitals" });
                    }
                } else {
                    res.json({ success: false, message: "User info not found" });
                }
            })
        } else {
            res.json({ success: false, message: "Session failed please login" });
        }
    });
};



// Handle menu_list
exports.menu_list = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            
            var menu_lookup = {
                $lookup: {
                    from: 'menus',
                    localField: 'parent_menu',
                    foreignField: '_id',
                    as: 'menu_details'
                }
            }

            var unwind_menu = {
                $unwind: {
                    path: "$menu_details",
                    preserveNullAndEmptyArrays: true
                }
            }  
             var project = {
                $project: {
                    _id: 1,
                    sequence_id: 1,
                    title: 1,
                    type: 1,
                    status: 1,
                    icon: 1,
                    url: 1,
                    create_date: 1,
                    "menu_details.title": 1,
                    "menu_details.status": 1
                }
            }

            Menu.aggregate([
                menu_lookup,
                unwind_menu,
                project
            ]).then((menu) => {
                res.render('menu_list', {
                    url_data: req.session.menu_array,
                    menu: menu,
                    msg: req.session.error,
                    moment: moment,
                    admin_type: req.session.admin.usertype
                });
            })
        } else {
           
            Utils.redirect_login(req, res);
        }
    });
};



exports.add_menu = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            
            Menu.find({type:0 }).then((menu) => {
                res.render('add_menu', {
                    menu: menu,
                    msg: req.session.error,
                    moment: moment,
                    admin_type: req.session.admin.usertype
                });
            })
        } else {
           
            Utils.redirect_login(req, res);
        }
    });
};

exports.save_menu=function(req,res){
    console.log("body", req.body)
    Menu.findOne({
        "title": req.body.title
    }).then((menu) => {
        if (menu) {
            req.session.msg = "Sorry, There is an menu with this title, please check the title";
            res.redirect("/add_menu");
        } else {
            if (req.body.type == 0) {
                req.body.parent_menu = null;
            }
            var menu = new Menu({
                title: req.body.title,
                url: req.body.url,
                icon: req.body.icon,
                status: req.body.status,
                parent_menu: req.body.parent_menu,
                type: req.body.type
            });
            menu.save().then((menu) => {
                req.session.error = "Congrates, menu was created successfully.........";
                res.redirect("/menu_list");
            }, (err) => {
                console.error(err);
                res.redirect("/add_menu")
            });
        }
    })
}