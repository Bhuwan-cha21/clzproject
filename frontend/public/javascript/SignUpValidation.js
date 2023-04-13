function signUpValidation() {
    var username = document.getElementById('name').value;
    var password = document.getElementById('password').value;
    var cpassword = document.getElementById('cpassword').value;

    if (username == "") {
        alert("Enter the fullname.");
        return false;
    }
    else if (username.length >= 40) {
        alert("user name must be under 30")
        return false;
    }

    else if (password == "") {
        alert("Enter the password.")
        return false;

    }

    else if (password != cpassword) {
        alert("password doesnot matched")
        return false;
    }

    else if (password.length <= 7) {
        alert("password must be length of 8")
    }


}