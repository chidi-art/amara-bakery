const connectDb = require('./config/db');
const app = require('./app');
const PORT = process.env.PORT || 5000;

const startServer = async () => {
	await connectDb();
	app.listen(PORT, () => console.log(`Server is listening at PORT ${PORT}...`));
};

startServer().catch((error) => {
	console.error('Unable to start server:', error.message);
	process.exit(1);
});