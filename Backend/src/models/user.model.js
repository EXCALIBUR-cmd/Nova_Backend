const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    Email :{ type: String, required: true, unique: true },
    FullName :{firstname: { type: String, required: true }, 
    lastname: { type: String, required: true } },
    Password :{ type: String }
},
{ timestamps: true });

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;