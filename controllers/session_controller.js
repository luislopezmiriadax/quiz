// MW de autorización de accessos HTTP restringidos
exports.loginRequired = function(req, res, next) {
	if (req.session.user) {
		next();
	} else {
		res.redirect('login');
	}
};

// GET /login -- Formulario de login
exports.new = function(req,res) {
	var errors = req.session.errors || {};
	req.session.errors = {};

	res.render('sessions/new', {errors: errors});
}

// POST /login -- Crear la sesión
exports.create = function(req,res) {
	var login = req.body.login;
	var password = req.body.password;

	var userController = require('./user_controller');
	userController.autenticar(login,password,function(error, user){
		if (error) { // Si hay error retornamos mensajes de error de sesión.
			req.session.errors = [{"message": 'Se ha producido un error '+error}];
			res.redirect("/login");
			return;
		}

		// Crear req.session.user y guardar campos id y username
		// La sesión se define por la existendia de: req.session.user
		req.session.user = {id:user.id, username:user.username};
		res.redirect(req.session.redir.toString()); // Redirección a path anterior a login.
	});
}

// DELETE /logout -- Destruir sesión
exports.destroy = function(req,res){
	delete req.session.user;
	res.redirect(req.session.redir.toString()); // Redirect a path anterior a login.
};

exports.autologout = function(req, res, next) {

	// Dos minutos en milisegundos
    var expiracionMiliSegundos = 120000;

    // Si hay un user logeado.
    if(req.session.user) {
        // Si no existe marca de tiempo inicial.
        if (!req.session.tiempo) {
            req.session.tiempo = (new Date()).getTime();
        } else {
            // Si el tiempo de espera se ha sobrepasado.
            if ((new Date()).getTime() - req.session.tiempo > expiracionMiliSegundos) {
               // Borramos el usuario.
               delete req.session.user;
               // Borramos la marca de tiempo.
               delete req.session.tiempo;
               // Redirigimos al login
               res.redirect('/login');
               return;
            // Si no se ha sobrepasado el tiempo de espera.
            } else { 
            	// Actualizamos la hora de la última transacción.
               req.session.tiempo = (new Date()).getTime();
            }
       }
    }
    next();
  };