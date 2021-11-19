'use strict';
const AWS = require('aws-sdk');
const responseLib = require('./libs/response-lib.js');
const helpers = require('./libs/helpers');

const region = process.env.AWS_REGION;
AWS.config.region = region;
const s3 = new AWS.S3();

const s3DisconnectedChatsBucket = process.env.S3_DISCONNECTED_CHATS !== '[object Object]' ? process.env.S3_DISCONNECTED_CHATS : `${process.env.STAGE}-demo-disconnected-chats-bucket`;

async function putObjectToBucket(bucket, key, body) {
  console.log(`putObjectToBucket(). Bucket: ${bucket}, path: ${key}`);
  try {
    await s3
      .putObject({
        Body: body,
        Key: key,
        Bucket: bucket,
      })
      .promise();
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports.processDisconnectedChat = async (event) => {
  console.log('process started:', event);
  try {
    //#region Validation

    let data;
    if (event.body) {
      data = helpers.getBody(event); // If running on localhost
    } else {
      data = event;
    }
    console.log('data:', data);

    if (!data) {
      console.error('Validation Failed:', data);
      return responseLib.generic(400, {
        message: 'Missing Body Request',
      });
    }

    //#endregion

    await putObjectToBucket(s3DisconnectedChatsBucket, `${data.id}.json`, JSON.stringify(data));
    return responseLib.success({ message: 'Success' });
  } catch (error) {
    console.error(error);
    return responseLib.generic(500, { message: 'Failed' });
  }
};
