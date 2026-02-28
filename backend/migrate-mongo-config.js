module.exports = {
    mongodb: {
        url: process.env.MONGODB_URI || 'mongodb://db:27017/',
        databaseName: 'loganalyzer',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },
    migrationsDir: 'src/db/migrations',
    changelogCollectionName: 'changelog',
    migrationFileExtension: '.js',
    useFileHash: false,
    moduleSystem: 'commonjs',
};
