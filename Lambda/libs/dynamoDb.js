const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const interactionsTable = process.env.CUSTOMCRM_DYNAMODB_TABLE !== '[object Object]' ? process.env.CUSTOMCRM_DYNAMODB_TABLE : 'custom-crm';

AWS.config.region = 'eu-central-1';


exports.save = async function (data) {
    console.log('dbSave...');

    try {
  
      const params = {
        TableName: interactionsTable,
        Item: data,
      };     
      await dynamoDb.put(params).promise();
      console.log('saved.');
      return true
    } catch (error) {
      console.error(error);
      return false
    }
  };


exports.getItem = async function (id) {
  console.log('getItem...', id);

  try {
    const params = {
      TableName: interactionsTable,
      Key: {
        id: id,
      }
    };     
    let resp = await dynamoDb.get(params).promise();
    console.log('item found');    
    return resp?.Item ? resp.Item : undefined
  } catch (error) {
    console.error(error);
    return false
  }
};
