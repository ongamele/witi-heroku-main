const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  idNumber: String,
  phoneNumber: String,
  faceFileName: String,
  idFileName: String,
});

module.exports = model('User', userSchema);
