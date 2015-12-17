$(function() {

  Parse.$ = jQuery;

  Parse.initialize("AySJAyLdK35ITj2L4d4Ij7ZUj2SW5jDgyoJdXD9P", "sm10PZLfRHdAQpMqPrpe9MPUqT1Ylrby6IDXDrjH");

  // Band Model
  // ----------

  var Band = Parse.Object.extend("Band", {
    defaults: {
      content: "empty live...",
      done: false
    },

    // Ensure that each band created has `content`.
    initialize: function() {
      if (!this.get("content")) {
        this.set({"content": this.defaults.content});
      }
    },

    // Toggle the `done` state of this band item.
    toggle: function() {
      this.save({done: !this.get("done")});
    }
  });


  var AppView = Parse.View.extend({

    events: {
      "click .user_info": "userInfo",
      "click .button.special": "reserve"
    },

    el: ".gig_body",

    initialize: function() {
      this.render();
    },

    userInfo: function() {
      if( Parse.User.current() ) {
        Parse.User.logOut();  
        location.replace("index.html");
      } else {
        location.replace("login.html");
        //location.href = "login.html";
      }
    },

    reserve: function() {
      var self = this;
      if( Parse.User.current() ) {
        self.$(".gig_error").html("아직 예매가 오픈되지 않았습니다.").show();
      } else {
        self.$(".gig_error").html("공연 예매를 위해서는 로그인이 필요합니다.").show();
      }
    },

    render: function() {
      var self = this;
      if( Parse.User.current() ) {
        self.$(".user").html("<a class='user_info' href='#'><i class='fa fa-user'> 로그아웃").show();
      } else {
        self.$(".user").html("<a class='user_info' href='#'><i class='fa fa-user'> 로그인").show();
        self.$(".gig_error").html("공연 예매를 위해서는 로그인이 필요합니다.").show();
      }
    }
  });


  // 로그인
  var LoginView = Parse.View.extend({

    events: {
      "submit form.login-form": "logIn"
    },

    el: ".inner.narrow",

    initialize: function() {
    },

    logIn: function(e) {
      var self = this;
      var username = this.$("#login-username").val();
      var password = this.$("#login-password").val();

      if( username.length <= 0 || username.indexOf('@') < 0 ) {
        self.$(".login-form .error").html("이메일 주소를 입력해주세요.").show();
        return false;
      }
      if( password.length <= 0 ) {
        self.$(".login-form .error").html("비밀번호를 입력해주세요.").show();
        return false;
      }

      var opts = { lines: 9, length: 0, width: 20, radius: 31, scale: 0.4, corners: 1, color: '#000', opacity: 0.2, rotate: 0, direction: 1, speed: 1,
                   trail: 60, fps: 20, zIndex: 2e9, className: 'spinner', top: '50%', left: '50%', shadow: false, hwaccel: false, position: 'absolute' }
      var target = document.getElementById('spin');
      var spinner = new Spinner(opts).spin(target);
      $("#spin").show();

      Parse.User.logIn(username, password, {
        success: function(user) {
          console.log("login success");
          self.undelegateEvents();
          location.replace("index.html");
        },

        error: function(user, error) {
          spinner.stop();
          self.$(".login-form button").removeAttr("disabled");
          switch (error.code) {
            case 209:
              Parse.User.logOut();
              self.$(".login-form .error").html("로그인 에러! 다시 시도해주세요!").show();
              break;

            case 101:
              self.$(".login-form .error").html("이메일이나 비밀번호가 틀렸습니다.").show();
              break;

            default:
              self.$(".login-form .error").html(_.escape(error.message)).show();
              break;
          }
        }
      });

      this.$(".login-form button").attr("disabled", "disabled");

      return false;
    }
  });


  // 회원가입
  var RegisterView = Parse.View.extend({

    events: {
      "submit form.register-form": "signUp"
    },

    el: ".inner.narrow",

    initialize: function() {
    },

    signUp: function(e) {
      var self = this;
      var user = new Parse.User();
      var username = this.$("#register-username").val();
      var password = this.$("#register-password").val();
      var passwordre = this.$("#register-passwordre").val();
      var nickname = this.$("#register-nickname").val();
      var realname = this.$("#register-realname").val();

      if( username.length <= 0 || username.indexOf('@') < 0 ) {
        self.$(".register-form .error").html("이메일 주소를 입력해주세요.").show();
        return false;
      }
      if( password.length <= 0 ) {
        self.$(".register-form .error").html("비밀번호를 입력해주세요.").show();
        return false;
      }
      if( password != passwordre ) {
        self.$(".register-form .error").html("재입력한 비밀번호가 일치하지 않습니다.").show();
        return false;
      }
      if( nickname.length <= 0 ) {
        self.$(".register-form .error").html("닉네임을 입력해주세요.").show();
        return false;
      }
      if( realname.length <= 0 ) {
        self.$(".register-form .error").html("본명(예금주)을 입력해주세요.").show();
        return false;
      }

      var opts = { lines: 9, length: 0, width: 20, radius: 31, scale: 0.4, corners: 1, color: '#000', opacity: 0.2, rotate: 0, direction: 1, speed: 1,
                   trail: 60, fps: 20, zIndex: 2e9, className: 'spinner', top: '50%', left: '50%', shadow: false, hwaccel: false, position: 'absolute' }
      var target = document.getElementById('spin');
      var spinner = new Spinner(opts).spin(target);
      $("#spin").show();

      user.set("username", username);
      user.set("password", password);
      user.set("nickName", nickname);
      user.set("realName", realname);

      user.signUp(null, {
        success: function(user) {
          spinner.stop();
          console.log("sign up success");
          self.undelegateEvents();
          location.replace("login.html");
        },

        error: function(user, error) {
          spinner.stop();
          self.$(".register-form button").removeAttr("disabled");
          switch (error.code) {
            case 209:
              Parse.User.logOut();
              self.$(".register-form .error").html("회원가입 에러! 다시 시도해주세요!").show();
              break;

            case 202:
              self.$(".register-form .error").html("이미 가입된 이메일입니다.").show();
              break;

            default:
              self.$(".register-form .error").html(_.escape(error.message)).show();
              break;
          }
        }
      });

      this.$(".register-form button").attr("disabled", "disabled");

      return false;
    }
  });


  // 비밀번호 찾기
  var PasswordView = Parse.View.extend({

    events: {
      "submit form.password-form": "passwordReset"
    },

    el: ".inner.narrow",

    initialize: function() {
    },

    passwordReset: function(e) {
      var self = this;
      var user = new Parse.User();
      var username = this.$("#password-username").val();

      if( username.length <= 0 || username.indexOf('@') < 0 ) {
        self.$(".password-form .error").html("이메일 주소를 입력해주세요.").show();
        return false;
      }

      var opts = { lines: 9, length: 0, width: 20, radius: 31, scale: 0.4, corners: 1, color: '#000', opacity: 0.2, rotate: 0, direction: 1, speed: 1,
                   trail: 60, fps: 20, zIndex: 2e9, className: 'spinner', top: '50%', left: '50%', shadow: false, hwaccel: false, position: 'absolute' }
      var target = document.getElementById('spin');
      var spinner = new Spinner(opts).spin(target);
      $("#spin").show();

      Parse.User.requestPasswordReset(username, {
        success: function() {
          self.$(".register-form button").removeAttr("disabled");
          spinner.stop();
          self.$(".password-form .error").html("가입한 주소로 이메일을 전송했습니다.").show();
        },
        error: function(error) {
          self.$(".register-form button").removeAttr("disabled");
          spinner.stop();
          self.$(".password-form .error").html("이메일 전송 에러!").show();
        }
      });
      
      this.$(".password-form button").attr("disabled", "disabled");

      return false;
    }
  });

  new AppView;
  new LoginView;
  new RegisterView;
  new PasswordView;
  //Parse.history.start();
});