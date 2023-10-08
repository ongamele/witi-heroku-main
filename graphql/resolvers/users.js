const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server-express');
const { parse, join } = require('path');
const { createWriteStream } = require('fs');

const UserModel = require('../../models/User');

const msRest = require('@azure/ms-rest-js');
const Face = require('@azure/cognitiveservices-face');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      city: user.city,
      car: user.car,
      age: user.age,
      bio: user.bio,
      profilePicture: user.profilePicture,
      username: user.username,
    },
    SECRETE_KEY,
    { expiresIn: '1h' }
  );
}

const {
  validateRegisterInput,
  validateLoginInput,
} = require('../../util/validators');
const User = require('../../models/User');
const { SECRETE_KEY } = require('../../config');
const { GraphQLInt } = require('graphql');

module.exports = {
  Query: {
    async getUser(_, { faceFileName }) {
      try {
        const user = await UserModel.find(faceFileName);
        if (user) {
          return user;
        } else {
          throw new Error('User not found');
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  Mutation: {
    async login(_, { faceFileName }) {
      const endpoint = 'https://witi-face2.cognitiveservices.azure.com/';
      const key = 'fc51e40ddbd24503a9696346090bd590';

      const credentials = new msRest.ApiKeyCredentials({
        inHeader: { 'Ocp-Apim-Subscription-Key': key },
      });
      const client = new Face.FaceClient(credentials, endpoint);
      // const { errors, valid } = validateLoginInput(faceHeight, faceWidth);

      /*if (!valid) {
        throw new UserInputError('Errors', { errors });
      }*/

      async function DetectFaceRecognize(url) {
        // Detect faces from image URL. Since only recognizing, use the recognition model 4.
        // We use detection model 3 because we are not retrieving attributes.
        let detected_faces = await client.face.detectWithUrl(url, {
          detectionModel: 'detection_03',
          recognitionModel: 'recognition_04',
        });
        return detected_faces;
      }

      async function FindSimilar() {
        const target_image_file_names = [];
        const user_images = await User.find();

        for (i = 0; i <= user_images.length - 1; i++) {
          target_image_file_names.push(user_images[i].faceFileName);
        }

        console.log('========FIND SIMILAR========');
        console.log();
        const image_base_url =
          'https://vlxkgewzbkitgpipqpst.supabase.in/storage/v1/object/public/witi-bucket/users/';
        const source_image_file_name = `https://vlxkgewzbkitgpipqpst.supabase.in/storage/v1/object/public/witi-bucket/logins/${faceImage}`;

        let face_data = (
          await Promise.all(
            target_image_file_names.map(async function (
              target_image_file_name
            ) {
              // Detect faces from target image url.
              var faces = await DetectFaceRecognize(
                image_base_url + target_image_file_name
              );
              /*  console.log(
                faces.length +
                  ' face(s) detected from image: ' +
                  faces[count].faceId +
                  ' ' +
                  target_image_file_name +
                  '.'
              );*/

              //faces[0].push(target_image_file_name);
              // faces.push({ faceID: faces[count].faceId });

              const data = [];

              data.push({
                faceID: faces[0].faceId,
                image: target_image_file_name,
              });

              // console.log(data[1]);
              /* return faces.map(function (face) {
                return face;
              });*/

              return data.map(function (face) {
                return face;
              });
            })
          )
        ).flat();

        let target_face_ids = [];
        for (i = 0; i <= face_data.length - 1; i++) {
          target_face_ids.push(face_data[i].faceID);
        }

        //console.log(face_data);

        // Detect faces from source image url.
        let detected_faces = await DetectFaceRecognize(source_image_file_name);

        // Find a similar face(s) in the list of IDs. Comapring only the first in list for testing purposes.
        let results = await client.face.findSimilar(detected_faces[0].faceId, {
          faceIds: target_face_ids,
        });
        results.forEach(function (result) {
          console.log(
            'Faces from: ' +
              source_image_file_name +
              ' and ID: ' +
              result.faceId +
              ' are similar with confidence: ' +
              result.confidence +
              '.'
          );
        });
        for (j = 0; j <= results.length; j++) {
          for (i = 0; i <= face_data.length; i++) {
            if (results[j].faceId == face_data[i].faceID) {
              var user_image = face_data[i].image;
              // console.log(user_image);
              return user_image;
              //break;
            }
          }
        }
        console.log();
      }

      const u_image = await FindSimilar();

      //console.log(u_image);

      const user = await User.findOne({ faceFileName: u_image });

      /* if (!use
        errors.general = 'User not found';
        throw new UserInputError('User not found', { errors });
      }*/

      // const match = await bcrypt.compare(faceHeight, user.faceHeight);
      /* if (!match) {
        errors.general = 'User Not Found';
        throw new UserInputError('Wrong credentials', { errors });
      }*/

      // const token = generateToken(user);
      if (user) {
        return { ...user._doc, id: user._id };
      } else {
        return 'No user found';
      }
    },
    async createUser(
      _,
      {
        registerInput: {
          firstName,
          lastName,
          idNumber,
          phoneNumber,
          faceFileName,
          idFileName,
        },
      }
    ) {
      const endpoint = 'https://witi-face2.cognitiveservices.azure.com/';
      const key = 'fc51e40ddbd24503a9696346090bd590';

      const credentials = new msRest.ApiKeyCredentials({
        inHeader: { 'Ocp-Apim-Subscription-Key': key },
      });
      const client = new Face.FaceClient(credentials, endpoint);
      // const { errors, valid } = validateLoginInput(faceHeight, faceWidth);

      /*if (!valid) {
        throw new UserInputError('Errors', { errors });
      }*/

      const image_base_url =
        'https://vlxkgewzbkitgpipqpst.supabase.in/storage/v1/object/public/witi-bucket/ids/';
      const source_image_file_name_url = `https://vlxkgewzbkitgpipqpst.supabase.in/storage/v1/object/public/witi-bucket/users/`;

      async function DetectFaceRecognize(url) {
        // Detect faces from image URL. Since only recognizing, use the recognition model 4.
        // We use detection model 3 because we are not retrieving attributes.
        let detected_faces = await client.face.detectWithUrl(url, {
          detectionModel: 'detection_03',
          recognitionModel: 'recognition_04',
        });
        return detected_faces;
      }

      async function FindSimilar() {
        console.log('========FIND SIMILAR========');
        console.log();

        const source_image_file_name = faceFileName;
        const target_image_file_names = [idFileName];

        let target_face_ids = (
          await Promise.all(
            target_image_file_names.map(async function (
              target_image_file_name
            ) {
              // Detect faces from target image url.
              var faces = await DetectFaceRecognize(
                image_base_url + target_image_file_name
              );
              console.log(
                faces.length +
                  ' face(s) detected from image: ' +
                  target_image_file_name +
                  '.'
              );
              return faces.map(function (face) {
                return face.faceId;
              });
            })
          )
        ).flat();

        // Detect faces from source image url.
        let detected_faces = await DetectFaceRecognize(
          source_image_file_name_url + source_image_file_name
        );

        // Find a similar face(s) in the list of IDs. Comapring only the first in list for testing purposes.
        let results = await client.face.findSimilar(detected_faces[0].faceId, {
          faceIds: target_face_ids,
        });
        results.forEach(function (result) {
          console.log(
            'Faces from: ' +
              source_image_file_name +
              ' and ID: ' +
              result.faceId +
              ' are similar with confidence: ' +
              result.confidence +
              '.'
          );
        });

        if (results) {
          //TODO Validate user data
          /* const user = await User.findOne({ idNumber });
      if (user) {
        throw new UserInputError('User already registered', {
          errors: {
            id_number: 'This ID number already exists',
          },
        });
      }*/

          console.log(results);
          console.log(firstName);
          console.log(lastName);
          console.log(idNumber);
          console.log(phoneNumber);
          console.log(faceFileName);
          console.log(idFileName);

          const newUser = new User({
            firstName,
            lastName,
            idNumber,
            phoneNumber,
            faceFileName,
            idFileName,
            createdAt: new Date().toISOString(),
          });

          const res = await newUser.save();
          const token = generateToken(res);

          return res;
        } else {
          console.log('No match');
        }
      }

      async function main() {
        await FindSimilar();
        console.log('Done.');
      }

      main();
      // const u_image = await FindSimilar();

      //console.log(u_image);

      /* if (!use
        errors.general = 'User not found';
        throw new UserInputError('User not found', { errors });
      }*/

      // const match = await bcrypt.compare(faceHeight, user.faceHeight);
      /* if (!match) {
        errors.general = 'User Not Found';
        throw new UserInputError('Wrong credentials', { errors });
      }*/

      // const token = generateToken(user);
    },

    async updateUser(
      _,
      { updateInput: { firstName, lastName, idNumber, phoneNumber } }
    ) {
      // const { firstName, lastName, idNumber, phoneNumber } = args;
      const user = await User.findOne({ idNumber });
      User.findOneAndUpdate(
        { idNumber: idNumber },
        { firstName: firstName, lastName: lastName, phoneNumber: phoneNumber },
        null,
        function (err, docs) {
          if (err) {
            console.log(err);
          } else {
            //return user;
          }
        }
      );
      return user;
    },
  },
};
