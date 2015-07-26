var models = require('../models/models.js');

// Autoload - factoriza el código si la ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.findById(quizId).then(
		function(quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			} else { next(new Error('No existe quizId='+quizId)); }
		}
	).catch(function(error) { next(error);});
};

// GET /quizes
exports.index = function(req, res) {
	var filtro = req.query.search;
	var condicion = ('%' + filtro + '%').replace(/ /g,'%');

    if (req.query.search) {
  		  models.Quiz.findAll({
    			where: ["lower(pregunta) like ?", condicion.toLowerCase()],	// Añadimos conversión a minúsculas para evitar problemas con Postgres
    			order: [['pregunta', 'ASC']]}
    			).then(function(quizes) {
    				res.render('quizes/index.ejs', {quizes: quizes, errors:[]});
  		  		}
  		  ).catch(function(error) { next(error); });
	} 
	else {
    	models.Quiz.findAll().then(
	        function(quizes) {
	        	res.render('quizes/index.ejs', { quizes: quizes, errors:[]});
	    	}
    	).catch(function(error){ next(error); })
	}
};

// GET /quizes/:id
exports.show = function(req, res) {
	res.render('quizes/show', {quiz: req.quiz, errors:[]});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto';
		if (req.query.respuesta.toLowerCase() === req.quiz.respuesta.toLowerCase()){ // Añadimos conversión a minúsculas para evitar problemas con las respuestas introducidas
			resultado='Correcto';
		} 	
		res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors:[]});	
};

// GET /quizes/new
exports.new = function(req, res){
	var quiz = models.Quiz.build(	// Creamos objeto quiz
		{pregunta: "Pregunta", respuesta: "Respuesta"}
	);

	res.render('quizes/new', {quiz: quiz, errors:[]});
};

// POST /quizes/create
exports.create = function(req, res){
	var quiz = models.Quiz.build(req.body.quiz);
	
	quiz
	.validate()
	.then(
		function(err){
			if (err) {
				res.render('quizes/new', {quiz: quiz, errors: err.errors});
			} else {
				quiz // save: guarda en DB campos preguntas y respuesta de quiz
				.save({fields: ["pregunta", "respuesta"]})
				.then( function(){ res.redirect('/quizes')})
			}	// res.redirect: Redirección HTTP a la lista de preguntas
		}
	);
};

// GET quizes/:id/edit
exports.edit = function(req, res){
	var quiz = req.quiz; // Autoload de instancia de quiz

	res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res){
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;

	req.quiz
	.validate()
	.then(
		function(err){
			if (err) {
				res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
			} else {
				req.quiz 	// save: guarda campos pregunta y respuesta en DB
				.save( {fields: ["pregunta", "respuesta"]})
				.then( function(){ res.redirect('/quizes');});
			}	// Redirección HTTP a lista de preguntas
		}
	);
};

// DELETE /quizes/:id
exports.destroy = function(req, res){
	req.quiz.destroy().then(function(){
		res.redirect('/quizes');
	}).catch(function(error){next(error)});
};