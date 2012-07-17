var email = require("mailer");
var sgusername = 'eneli';
var sgpassword = 'sUp3rm4rio';

exports.brag = function(to, from, message){
    email.send({
        host : "smtp.sendgrid.net",
        port : "587",
        domain : "bold-it.com",
        to : to,
        from : "meta4@bold-it.com",
        subject : "Meta4 Message from " + from,
        body: message,
        authentication : "login",
        username : sgusername,
        password : sgpassword
      },
      function(err, result){
        if(err){
          console.log(err);
        }
    });    
}
