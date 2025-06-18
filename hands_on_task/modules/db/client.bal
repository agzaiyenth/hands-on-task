import ballerinax/mysql;

configurable string dbUser = ?;
configurable string dbPassword = ?;
configurable string dbHost = ?;
configurable int dbPort = ?;
configurable string dbName = ?;

public final mysql:Client dbClient = check new (
    host = dbHost,
    user = dbUser,
    password = dbPassword,
    database = dbName,
    port = dbPort
);