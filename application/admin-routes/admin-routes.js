var adminController = require('../admin-controller/admin');// admin routes


module.exports = function (app) {
  app.route('/').get(adminController.admin);
  app.route('/admin').post(adminController.check_admin_login);
  app.route('/admin_list').get(adminController.list_admin);
  app.route('/admin_list').post(adminController.list_admin);
  app.route('/add_admin').get(adminController.add_admin)
  app.route('/add_admin').post(adminController.add_admin)
  app.route('/edit_admin').post(adminController.edit_admin)
  app.route('/update_admin_details').post(adminController.update_admin_details)
  app.route('/save_admin_details').post(adminController.save_admin_details)
  app.route('/delete_admin').post(adminController.delete_admin);
  app.route('/log_out').get(adminController.log_out);
  app.route('/genetare_admin_excel').post(adminController.genetare_admin_excel);
  app.route('/get_admin_session').post(adminController.get_admin_session);
  app.route('/admn_change_admin_pass').post(adminController.admn_change_admin_pass);


  app.route('/user_list').get(adminController.user_list);
  app.route('/user_list').post(adminController.user_list);
  app.route('/add_user').get(adminController.add_user)
  app.route('/add_user').post(adminController.add_user)
  app.route('/save_user_data').post(adminController.save_user_data)
  app.route('/edit_user').post(adminController.edit_user)
  app.route('/update_user_detail').post(adminController.update_user_detail)
  app.route('/delete_user').post(adminController.delete_user);
  
  


  app.route('/student_list').get(adminController.student_list);
  app.route('/student_list').post(adminController.student_list);
  app.route('/add_student').get(adminController.add_student)
  app.route('/add_student').post(adminController.add_student)
  app.route('/save_student_data').post(adminController.save_student_data)
  app.route('/edit_student').post(adminController.edit_student)
  app.route('/update_student_details').post(adminController.update_student_details)
  app.route('/delete_student').post(adminController.delete_student);






  
  app.route('/teacher_list').get(adminController.teacher_list)
  app.route('/teacher_list').post(adminController.teacher_list)
  app.route('/add_teacher').get(adminController.add_teacher)
  app.route('/add_teacher').post(adminController.add_teacher)
  app.route('/save_teacher_data').post(adminController.save_teacher_data)
  app.route('/edit_teacher').post(adminController.edit_teacher)
  app.route('/update_teacher_details').post(adminController.update_teacher_details)
  app.route('/delete_teacher').post(adminController.delete_teacher)
  
  
 
  
  
 
  

 
 
  
  app.route('/class_list').get(adminController.class_list);
  app.route('/class_list').post(adminController.class_list);
  app.route('/add_class').get(adminController.add_class)
  app.route('/add_class').post(adminController.add_class)
  app.route('/save_class_data').post(adminController.save_class_data)
  app.route('/edit_class').post(adminController.edit_class)
  app.route('/update_class_details').post(adminController.update_class_details)
  app.route('/delete_class').post(adminController.delete_class);
  




//student report mahaan ee waa class report
  app.route('/sreport_list').get(adminController.sreport_list);
  app.route('/sreport_list').post(adminController.sreport_list);
  




  app.route('/subject_list').get(adminController.subject_list);
  app.route('/subject_list').post(adminController.subject_list);
  app.route('/add_subject').get(adminController.add_subject)
  app.route('/add_subject').post(adminController.add_subject)
  app.route('/save_subject_data').post(adminController.save_subject_data)
  app.route('/edit_subject').post(adminController.edit_subject)
  app.route('/update_subject_detail').post(adminController.update_subject_detail)
  app.route('/delete_subject').post(adminController.delete_subject);
  
  
  
  

  app.route('/exam_list').get(adminController.exam_list);
  app.route('/exam_list').post(adminController.exam_list);
  app.route('/add_exam').get(adminController.add_exam)
  app.route('/add_exam').post(adminController.add_exam)
  app.route('/save_exam_data').post(adminController.save_exam_data)
  app.route('/edit_exam').post(adminController.edit_exam)
  app.route('/update_exam_detail').post(adminController.update_exam_detail)
  app.route('/delete_exam').post(adminController.delete_exam);



 
  

  app.route('/fee_list').get(adminController.fee_list);
  app.route('/fee_list').post(adminController.fee_list);
  app.route('/add_fee').get(adminController.add_fee)
  app.route('/add_fee').post(adminController.add_fee)
  app.route('/get_all_classess').post(adminController.get_all_classess);
  app.route('/save_fee_data').post(adminController.save_fee_data)
  app.route('/edit_fee').post(adminController.edit_fee)
  app.route('/add').post(adminController.add)
  app.route('/added_fee').post(adminController.added_fee)
  app.route('/update_fee_detail').post(adminController.update_fee_detail)
  app.route('/delete_fee').post(adminController.delete_fee);






  app.route('/feereport_list').get(adminController.feereport_list);
  app.route('/feereport_list').post(adminController.feereport_list);

  




  app.route('/message_list').get(adminController.message_list)
  app.route('/message_list').post(adminController.message_list)
  app.route('/add_message').get(adminController.add_message)
  app.route('/add_message').post(adminController.add_message)
  app.route('/save_message_data').post(adminController.save_message_data)
  app.route('/delete_message').post(adminController.delete_message);





  app.route('/quiz_list').get(adminController.quiz_list)
  app.route('/quiz_list').post(adminController.quiz_list)
  app.route('/add_quiz').get(adminController.add_quiz)
  app.route('/add_quiz').post(adminController.add_quiz)
  app.route('/save_quiz_data').post(adminController.save_quiz_data)
  app.route('/delete_quiz').post(adminController.delete_quiz);





  app.route('/resultQuiz_list').get(adminController.resultQuiz_list)
  app.route('/resultQuiz_list').post(adminController.resultQuiz_list)
  

  



  app.route('/typequiz_list').get(adminController.typequiz_list)
  app.route('/typequiz_list').post(adminController.typequiz_list)
  app.route('/add_typequiz').get(adminController.add_typequiz)
  app.route('/add_typequiz').post(adminController.add_typequiz)
  app.route('/save_typequiz_data').post(adminController.save_typequiz_data)
  app.route('/edit_typequiz').post(adminController.edit_typequiz)
  app.route('/update_typequiz_details').post(adminController.update_typequiz_details)
  app.route('/delete_typequiz').post(adminController.delete_typequiz);
  
  
  

  
  
  
  
  //Api for pretical 
  app.route('/get_all_students').post(adminController.get_all_students)



  //APP Apis Login
  app.route("/use_login").post(adminController.use_login)



  //APP Apis Exam Result
  app.route("/exam_result").post(adminController.exam_result)


   //APP Apis all messages
   app.route("/all_messages").post(adminController.all_messages)


   //APP Apis change password
   app.route("/change_password").post(adminController.change_password)



    //APP Apis quiz
    app.route("/read_quiz").post(adminController.read_quiz)




    //APP Apis result quiz
    app.route("/save_result_quiz").post(adminController.save_result_quiz)



    //APP Apis finence
    app.route("/blance_fee").post(adminController.blance_fee)



//--------------------------------------------------------------------------------------------


    app.route("/registration").post(adminController.registration)

    app.route("/login").post(adminController.login)

    app.route("/transectionsave").post(adminController.transectionsave)

    app.route("/transectionread").post(adminController.transectionread)


    app.route("/menu_list").get(adminController.menu_list)
    app.route("/menu_list").post(adminController.menu_list)

    app.route("/add_menu").post(adminController.add_menu)
    app.route("/add_menu").get(adminController.add_menu)
    app.route("/save_menu").post(adminController.save_menu)


    
}
