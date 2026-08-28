const dns = require('node:dns');
const mongoose = require('mongoose');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const connectDb = async ()=>{
	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI is not configured');
	}
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("Connection Successful")
	} catch (error) {
		throw error;
	}
}
module.exports = connectDb