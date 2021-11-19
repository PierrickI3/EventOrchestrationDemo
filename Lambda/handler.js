'use strict';
const gcLib = require('./libs/gc.js');
const responseLib = require('./libs/response-lib.js');
const dynamoDb = require('./libs/dynamoDb.js');
const moment = require('moment');

module.exports.conversationDump = async (event, context, callback) => {
  console.log('process started');
  try {
  
    let data = event;
    //let data = JSON.parse(event.body); // use for Localhost
    
    
    if (!data) {
      console.error('Validation Failed:', data);
      return responseLib.generic(400, {
        message: 'Missing Body Request',
      });
    }

    if (!data.id) {
      console.error('Validation Failed:', data);
      return responseLib.generic(400, {
        message: 'Missing id in body',
      });
    }

    
    await gcLib.login();
  
    let bSkipUpdate = false;
    let conversation = await gcLib.getConversation(data.id);
    if (!conversation) {    
      return responseLib.generic(400, {
        message: 'Failed to obtain conversationId',
      });
    }

    let messages = await gcLib.getMessagesForConversationId(data.id);
    let messageIds = [];
    
    messages.participants.forEach(async (participant) => {
      let newestMsg = moment('2000-01-01 00:00:00');
      let purpose = participant.purpose;
      let messages = participant.messages;      
      let msgId, msgTime;
      if (messages?.length > 0) {
        messages.forEach(async (message) => {          
          msgTime = moment(message.messageTime);
          if (msgTime.isAfter(newestMsg)) {            
            newestMsg = msgTime;
            msgId = message.messageId;        
          }
        });
      }      
      if (msgId) {
        console.log(`Newest message id for ${purpose} is ${msgId} at ${msgTime}`);
        messageIds.push({
          purpose: purpose,
          messageTime: msgTime,
          messageId: msgId,
        });
      }
    });
    
  
    if (messageIds.length > 0) {
      console.log('try to find newest Message...');
      
      const lastMessage = messageIds.sort((a, b) => {
        return a.messageTime.diff(b.messageTime);
      }).pop();
      

      console.log(`Newest messageId is ${lastMessage.messageId} for purpose: ${lastMessage.purpose}`);

      let message = await gcLib.getConversationMessage(data.id, lastMessage.messageId);
      

      let messageToSave = {
        id: conversation.id,
        awsRequestId: context.awsRequestId,
        startTime: conversation.startTime,
        endTime: conversation.endTime      
      }
      console.log('messageToSave', messageToSave);

      let resp = await dynamoDb.getItem(data.id);
      if (message?.textBody) {
        message = message.textBody;
        console.log('latest message body:', message);
                
        if (resp) {
          // Update existing Item
          messageToSave = resp;
          if (!messageToSave[lastMessage.purpose]) messageToSave[lastMessage.purpose] = [];
         
          console.log('try to find if messageId already exists...');
          let q = messageToSave[lastMessage.purpose].find(x => x.messageId === lastMessage.messageId);
          
          if (!q) {
            messageToSave[lastMessage.purpose].push({
              messageId: lastMessage.messageId,  
              message: message,
              messageTime: moment(lastMessage.messageTime).format('YYYY-MM-DD HH:mm:ss'),
            });
          } else {
            bSkipUpdate = true;
            console.log('MessageId already in Dynamo, skip update.');
          }
              

        }  else 
          messageToSave[lastMessage.purpose] = [{
            messageId: lastMessage.messageId,  
            message: message,
            messageTime: moment(lastMessage.messageTime).format('YYYY-MM-DD HH:mm:ss'),
          }];  
        
        console.log('check if endTime is present', conversation.endTime);
        if (conversation.endTime) {
          console.log('endTime present, save only this')
          messageToSave.endTime = conversation.endTime;
          bSkipUpdate = false;
        }
        console.log('bSkipUpdate',bSkipUpdate);   
        if (!bSkipUpdate) {
          resp = await dynamoDb.save(messageToSave);        
          if (resp)  return responseLib.success({message: 'Success'}) 
          else 
            return responseLib.generic({message: 'Failed to save conversation to DynamoDb'})
        } else 
          return responseLib.success({message: 'MessageId already exists'})        
 
      } 
      
    }


  } catch (error) {
    console.log(error);
    return responseLib.generic(500, {message: "Failed"});
  }
      
};
