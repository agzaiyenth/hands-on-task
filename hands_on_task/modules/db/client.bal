import ballerinax/mysql;
import ballerinax/mysql.driver as _;

configurable DatabaseConfig dbConfig = ?;

final mysql:Client dbClient = check initConnection();

function initConnection() returns mysql:Client|error => check new (
	dbConfig.host,
	dbConfig.user,
	dbConfig.password,
	dbConfig.database,
	dbConfig.port
);