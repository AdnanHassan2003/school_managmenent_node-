var adminController = require('../admin-controller/admin');// admin routes


module.exports = function (app) {
  app.route('/').get(adminController.admin);
  app.route('/admin').post(adminController.check_admin_login);
  app.route('/admin_list').get(adminController.list_admin);
  app.route('/admin_list').post(adminController.list_admin);


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




  app.route('/sreport_list').get(adminController.sreport_list);
  app.route('/sreport_list').post(adminController.sreport_list);
  

 
 
  
  app.route('/class_list').get(adminController.class_list);
  app.route('/class_list').post(adminController.class_list);
  app.route('/add_class').get(adminController.add_class)
  app.route('/add_class').post(adminController.add_class)
  app.route('/save_class_data').post(adminController.save_class_data)
  app.route('/edit_class').post(adminController.edit_class)
  app.route('/update_class_details').post(adminController.update_class_details)
  app.route('/delete_class').post(adminController.delete_class);
  

  


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
  app.route('/update_fee_detail').post(adminController.update_fee_detail)
  app.route('/delete_fee').post(adminController.delete_fee);






  app.route('/feereport_list').get(adminController.feereport_list);
  app.route('/feereport_list').post(adminController.feereport_list);

  


  
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




  // api server checing117
  app.route('/get_all_students').post(adminController.get_all_students)


  //APP Apis 
  app.route("/use_login").get(adminController.use_login)




}