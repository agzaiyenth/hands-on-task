public type User record {|
    int id?;
    string name;
    string email;
    int age;
|};
public type DatabaseConfig record {
    string host;
    string user;
    string password;   
    int port;
    string database;
}; 