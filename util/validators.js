module.exports.validateRegisterInput = (
  firstName,
  lastName,
  phoneNumber,
  idNumber
) => {
  const errors = {};
  if (firstName.trim() === '') {
    errors.firstName = 'Name must not be empty';
  }
  if (lastName.trim() === '') {
    errors.lastName = 'Surname must not be empty';
  }
  if (idNumber.trim() === '') {
    errors.idNumber = 'ID number must not be empty';
  }
  if (phoneNumber.trim() === '') {
    errors.phoneNumber = 'Phone number must not be empty';
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateLoginInput = (faceHeight, faceWidth) => {
  const errors = {};
  if (faceHeight == '') {
    errors.faceHeight = 'Please scan your face properly';
  }

  if (faceWidth == '') {
    errors.faceWidth = 'Please scan your face properly';
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
