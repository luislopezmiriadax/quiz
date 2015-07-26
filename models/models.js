var path = require ('path');

var url= process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name = (url[6]||null);
var user = (url[2]||null);
var pwd = (url[3]||null);
var protocol = (url[1]||null);
var dialect = (url[1]||null);
var port = (url[5]||null);
var host = (url[4]||null);
var storage = process.env.DATABASE_STORAGE;

//Cargar Modelo ORM
var Sequelize = require('sequelize');

//Usar BBDD SQLite
var sequelize = new Sequelize(DB_name, user, pwd,
	{	dialect: protocol,
		protocol: protocol,
		port: port,
		host: host,
		storage: storage,	//solo SQLite (.env)
		omitNull: true		//solo PostGres
	}
);

//Importamos definición de la tabla Quiz en quiz.js

var Quiz = sequelize.import(path.join(__dirname,'quiz'));

exports.Quiz = Quiz; //Exportamos definición tabla Quiz

//Inicializamos tabla de preguntas en DB
sequelize.sync().then(function() {
	//Ejecutamos manejador una vez creada la tabla
	Quiz.count().then(function (count){
		if(count===0){	//La tabla se inicializa sólo si está vacía
			Quiz.create({	pregunta: 'Capital de Inglaterra',
							respuesta: 'Londres',
							tema: 'Otro'
						});
			Quiz.create({	pregunta: '¿Quién pintó La Gioconda?',
							respuesta: 'Leonardo Da Vinci',
							tema: 'Humanidades'
						});
			Quiz.create({	pregunta: 'Ganador del último Mundial de fútbol',
							respuesta: 'Alemania',
							tema: 'Ocio'
						});
			Quiz.create({	pregunta: 'Protagonista principal de la saga Street Fighter',
							respuesta: 'Ryu',
							tema: 'Tecnología'
						})
			.then(function(){console.log('Base de datos inicializada')});
		};
	});
});