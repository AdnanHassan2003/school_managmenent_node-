var Admin = require('mongoose').model('admin')
var User = require('mongoose').model('users')
var Studnet = require('mongoose').model('student')
var Class = require('mongoose').model('class')
var Subject = require('mongoose').model('subject')
var Exam = require('mongoose').model('exam')
var Fee = require('mongoose').model('fee')
const Bcrypt = require('bcryptjs');
var moment = require('moment-timezone');
var Excel = require('exceljs');
var fs = require('fs');
var Utils = require('../controller/utils');
var passwordValidator = require('password-validator');
const { body } = require('express-validator');
const _class = require('../model/class');
const { filter } = require('lodash');
const { title } = require('process')
const session = require('express-session')
const { response } = require('express')
// const { utils } = require('xlsx/types')
var ObjectId = require('mongodb').ObjectID;




exports.admin = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            res.render('home')
        } else {
            Utils.redirect_login(req, res);
        }
    });
}

///// check admin credentiale /////
exports.check_admin_login = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (!response.success) {
            var name = req.body.email
            // Encrypt
            var phone = {};
            phone['phone'] = name;
            var email = {};
            email['email'] = name;
            var user_name = {};
            user_name['user_name'] = name;

            Admin.findOne({ $and: [{ $or: [phone, email, user_name] }, { status: 1 }] }).then((admin) => {
                if (!admin) {
                    req.session.error = process.env.user_not_registered;
                    res.redirect("/admin")
                } else {
                    if (!admin.comparePassword((req.body.password).toString())) {
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
                        Admin.updateOne({ _id: admin._id }, { token: token, last_login: new Date(Date.now()), login_attempts: 0 }, { useFindAndModify: false }).then((Admin) => {
                        });
                        res.render('home')
                    }
                }
            });
        } else {
            res.render('home')
        }
    });
};



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
            var  class_id=req.body.class_id
            if (class_id != "ALL" && class_id != undefined  && class_id != "")   {
                filter["$match"]["class_id"] = ObjectId(class_id);
            };

           
            var  status=req.body.status
            if (status != "ALL" && status != undefined  && status != "") {
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
                        //these filter
                        class_id:class_id,
                        status:status,
                        admin_type: req.session.admin.usertype
                    });
                })
            })
        } else {

            Utils.redirect_login(req, res);
        }
    })
}



exports.sreport_list = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            var Filter = {
                $match: {},
            };
            var  class_id=req.body.class_id
            if (class_id != "ALL" && class_id != undefined  && class_id != "")   {
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
               
                  {$unwind: "$Calas_data"},


                  
                  {$group:{
                        _id: {class_name: "$Calas_data.name", textstatus: "$textstatus"},
                         total:{$sum:1}
                          
                      }},
                     
                      
                      
                      {$project:{
                                           
                        _id:0,
                        class_name:"$_id.class_name",
                        textstatus:"$_id.textstatus",
                        total:1
                        

                        
                        
                                           
                      }
                },

             ]).then((student_Array) => {

             res.render('sreport_list', {
                    Student: student_Array,
                    msg: req.session.error,
                    Calas_data:Calas_data,
                    class_id:class_id,
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
    
            var  student_id=req.body.student_id
            if (student_id != "ALL" && student_id != undefined  && student_id != "")   {
                filter["$match"]["student_id"] = ObjectId(student_id);
            };

            var  subject_id=req.body.subject_id
            if (subject_id != "ALL" && subject_id != undefined  && subject_id != "")   {
                filter["$match"]["subject_id"] = ObjectId(subject_id);
            };

            var  status=req.body.status
            if (status != "ALL" && status != undefined  && status != "") {
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
                        Exam: exam_Array,
                        //this lookup
                        student_data: student_data,
                        subject_data: subject_data,
                        msg: req.session.error,
                        moment: moment,
                        //these filter
                        student_id:student_id,
                        subject_id:subject_id,
                        status:status,
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
                                    status:1,
                                    student_name: "$Student_data.name",
                                    class_name: "$Class_data.name",
                                    sequence_id: 1,
                                    create_date: 1
                                }
                            },
        
                        ]).then((fee_Array) => {


                res.render('fee_list', {
                    Fee: fee_Array,
                    msg: req.session.error,
                    student_data:student_data,
                    class_data:class_data,
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




exports.feereport_list = function(req, res){
    Utils.check_admin_token(req.session.admin, function (response){
        if(response.success){
            Class.find({}).then((class_array) => {

                Fee.aggregate([

                {$lookup:
                    {
                       from: "classes",
                       localField: "class_id",
                       foreignField: "_id",
                       as: "Calas_data"
                    }
                 },
                 
                 {$unwind: "$Calas_data"},
                 
                 {$group:
                        {
                          _id:{class_name:"$Calas_data.name"},
                          totalStudent:{$sum:1},
                          totalPayment: {$sum: "$payment"} 
                            
                            
                            }},
                            
                 {$project: {
                    _id:0,
                    class_name:"$_id.class_name",
                    totalPayment: 1,
                    totalStudent:1

                     
                     
                     }} ,          
                            
                            
                            
                
            ]).then((fee_date) => {
                res.render('feereport_list',{

                    Fee:fee_date,
                    class:class_array,
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


exports.add_admin = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            res.render("add_admin", { systen_urls: systen_urls, msg: req.session.error })
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
            

            
               
                res.render("add_student",
                    {
                        systen_urls: systen_urls, msg: req.session.error,
                        class_data: class_Array
                       
                    })
            
        })
        } else {
            Utils.redirect_login(req, res);
        }
    });
};


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
exports.get_all_classess=function(req, res){
    // console.log("jjjjjjjjjjjjjjjjjjjjj", req.body)
    Studnet.findOne({_id: ObjectId(req.body._id)}).then((data)=>{

        Class.find({}).then((cls)=>{

        if(cls.length>0){
            res.send({
                student:data,
                success:true,
                class:cls
               })
        }else{
            res.send({
                student:[],
                success:false,
                class:[]

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
                    Class_data:class_Array
                })
            })   
        })
        } else {
            Utils.redirect_login(req, res);
        }
    });
};




// Handle create admin actions
exports.save_admin_details = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            Admin.findOne({ "phone": req.body.phone }).then((admin) => {
                
                if (admin) {
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
                        var admin = new Admin({
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
                            var image_name = admin._id + Utils.tokenGenerator(4);
                            var url = Utils.getImageFolderPath(1) + image_name + '.jpg';
                            Utils.saveImageIntoFolder(req.files[0].path, image_name + '.jpg', 1);
                            admin.picture = url;
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
                        var name = req.body.name.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ');
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
                            var image_name = user._id + Utils.tokenGenerator(4);
                            var url = Utils.getImageFolderPath(1) + image_name + '.jpg';
                            Utils.saveImageIntoFolder(req.files[0].path, image_name + '.jpg', 1);
                            user.picture = url;
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
                            phone: req.body.phone,
                            status: 1,
                            // textstatus: req.body.textstatus,
                            extra_detail: req.body.extra_detail,
                            class_id: req.body.class_id,
                            picture: "",
                            password: Bcrypt.hashSync(req.body.password, 10)
                        });
                        if (profile_file != undefined && profile_file.length > 0) {
                            var image_name = student._id + Utils.tokenGenerator(4);
                            var url = Utils.getImageFolderPath(1) + image_name + '.jpg';
                            Utils.saveImageIntoFolder(req.files[0].path, image_name + '.jpg', 1);
                            student.picture = url;
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




//  handele create class list
exports.save_class_data = function (req, res) {
    Utils.check_admin_token(req.session.admin, function (response) {
        console.log("body", req.body)
        if (response.success) {
            Class.findOne({ "phone": req.body.phone }).then((clas) => {
                console.log("class", clas)
                if (clas) {
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
                        var name = req.body.name.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ');
                        var clas = new Class({
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
                            var image_name = clas._id + Utils.tokenGenerator(4);
                            var url = Utils.getImageFolderPath(1) + image_name + '.jpg';
                            Utils.saveImageIntoFolder(req.files[0].path, image_name + '.jpg', 1);
                            clas.picture = url;
                        }
                        clas.save().then((admin) => {
                            req.session.error = "Congrates, Admin was created successfully.........";
                            res.redirect("/class_list");
                        });
                    } else {
                        req.session.error = "Please use strong password that contains latrers and Digitals";
                        res.redirect("/add_class")
                    }
                }
            })
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
        
                const class_id =(student.class_id);
             console.log("hhhhhhhhhh", class_id)
            
            Class.find({}).then((class_data) => {
                
             
                if (student) {
                    // console.log("hhhhh",student_data)
                    res.render("add_student", { student_data: student, class_id:class_id.toString(),  Class:class_data,   systen_urls: systen_urls})
                         
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
                    res.render("add_subject", { subject_data:subject , systen_urls: systen_urls })
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
                    res.render("add_exam", { exam_data: exam, Student:student, student_id:exam.student_id.toString(), Subject: subject, subject_id:exam.subject_id.toString(), systen_urls: systen_urls })
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
                    res.render("add_fee", { fee_data: fee, Student:student, student_id:fee.student_id.toString(), Class:clas, class_id:fee.class_id.toString(), systen_urls: systen_urls })
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
    // console.log("jjjjjjj", req.body)
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            var profile_file = req.files;
            req.body.name = req.body.name.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ');
            if (profile_file == '' || profile_file == 'undefined') {
                   
                const status =Number( req.body.status);
                    
                if(status === 1){
                 var data={
                    type:req.body.type,
                    name:req.body.name,
                    email:req.body.email,
                    class_id:req.body.class_id, 
                    status:status,
                    phone:req.body.phone,
                    textstatus:"Active"
                 }
                }
                else if(status === 0){
                    var data={
                        type:req.body.type,
                        name:req.body.name,
                        email:req.body.email,
                        phone:req.body.phone,
                        class_id:req.body.class_id, 
                        status:status,
                        textstatus:"Inactive"
                     }
                }

                Studnet.findByIdAndUpdate(req.body.student_id,data, { useFindAndModify: false }).then((data) => {
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
                    
                        if(status == 1){
                         var data={
                            type:req.body.type,
                            name:req.body.name,
                            email:req.body.email,
                            phone:req.body.phone,
                            class_id:req.body.class_id, 
                            status:status,

                            textstatus:"Active"
                         }
                        }
                        else if(status == 0){
                            var data={
                                type:req.body.type,
                                name:req.body.name,
                                email:req.body.email,
                                class_id:req.body.class_id, 
                                status:status,
                                phone:req.body.phone,
                                textstatus:"Inactive"
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
    console.log("aaaaaaaaa",req.body)
    Utils.check_admin_token(req.session.admin, function (response) {
        if (response.success) {
            var profile_file = req.files;
            // req.body.name = req.body.name.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ');
            if (profile_file == '' || profile_file == 'undefined') {
                Exam.findByIdAndUpdate(req.body.exam_id, req.body, { useFindAndModify: false }).then((data) => {
                    console.log("aaaaaaaaa",data)
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
            User.deleteOne({ _id: req.body.user_id }).then((user) => {//
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