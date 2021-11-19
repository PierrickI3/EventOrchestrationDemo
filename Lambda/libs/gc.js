const platformClient = require('purecloud-platform-client-v2');
const Axios = require('axios').default;

// Emeabilling
const env = 'mypurecloud.ie';
const clientId = '1b2d2962-f4fa-4b74-a0bb-5ba225371192';
const clientSecret = 'aY5froP__ofufRJOrDR0IQj7ATES7EIeSHySJROV7M0';


exports.login = async () => {
   
    console.log('login');
    return new Promise(async (resolve, reject) => {
    try {

        // Node.js - Client credentials strategy
        let client = platformClient.ApiClient.instance;

        client.setEnvironment(env);
        client
        .loginClientCredentialsGrant(clientId, clientSecret)
        .then(async function () {
            console.log('Service is connected to Genesys Cloud!');
            console.log('accessToken: ', client.authData.accessToken);
            resolve();
        })
        .catch(function (err) {
            console.error(err);
            reject();
        });
             
    } catch (error) {
      console.error(error);
      reject();
    }
  });
};

exports.getConversation = async (id) => {  
  console.log('getConversation');
  return new Promise(async (resolve, reject) => {
  try {

    let apiInstance = new platformClient.ConversationsApi();
    
    
    apiInstance.getConversation(id)
      .then((data) => {
        console.log('getConversation success!');
        resolve(data);
      })
      .catch((err) => {
        console.log('There was a failure calling getConversation');
        console.error(err);
        reject();
      });
           
  } catch (error) {
    console.error(error);
    reject();
  }
});
};

exports.getMessagesForConversationId = async (id) => {  
  console.log('getMessagesForConversationId', id);
  return new Promise(async (resolve, reject) => {
  try {

    let apiInstance = new platformClient.ConversationsApi();
    
    
    apiInstance.getConversationsMessage(id)
      .then((data) => {
        console.log('getConversationsMessages success!');
        resolve(data);
      })
      .catch((err) => {
        console.log('There was a failure calling getConversation');
        console.error(err);
        reject();
      });
           
  } catch (error) {
    console.error(error);
    reject();
  }
});
};

exports.getConversationMessage = async (conversationId, messageId) => {  
  console.log('getConversationMessage', messageId);
  return new Promise(async (resolve, reject) => {
  try {

    let apiInstance = new platformClient.ConversationsApi();
    
    
    apiInstance.getConversationsMessageMessage(conversationId, messageId)
      .then((data) => {
        console.log('getConversationsMessageMessage success!');
        resolve(data);
      })
      .catch((err) => {
        console.log('There was a failure calling getConversation');
        console.error(err);
        reject();
      });
           
  } catch (error) {
    console.error(error);
    reject();
  }
});
};

//#region Unused

exports.getConversationRecordings = async (id) => {  
  console.log('getConversationRecordings');
  return new Promise(async (resolve, reject) => {
  try {

    let apiInstance = new platformClient.RecordingApi();
    let opts = { 
      'maxWaitMs': 5000, // Number | The maximum number of milliseconds to wait for the recording to be ready. Must be a positive value.
      'formatId': "WEBM" // String | The desired media format
    };
    
    apiInstance.getConversationRecordings(id, opts)
      .then(async (data) => {
        if (!Array.isArray(data)) {
          console.log('202 OK, lets re-try API query after 5 sec...');
          await sleep(5555);
          apiInstance.getConversationRecordings(id, opts)
          .then((data) => {
            console.log('getConversationRecordings success (attempt 2)');   
            resolve( Array.isArray(data) && data.length > 0 ? data[0] : undefined)  
                           
          })
          .catch((err) => {
            console.log('There was a failure calling getConversationRecordings');
            console.error(err);
            reject();
          });

        }  else {
          console.log('getConversationRecordings success! ');               
          resolve(data[0]);   
        }
        
              
      })
      .catch((err) => {
        console.log('There was a failure calling getConversationRecordings');
        console.error(err);
        reject();
      });
           
  } catch (error) {
    console.error(error);
    reject();
  }
});
};

exports.getSpeechTextAnalytics = async (id) => {  
  console.log('getSpeechTextAnalyticsApi()');
  return new Promise(async (resolve, reject) => {
  try {

    let apiInstance = new platformClient.SpeechTextAnalyticsApi();
    apiInstance.getSpeechandtextanalyticsConversation(id)
    .then((data) => {
      console.log('getSpeechandtextanalyticsConversation success!');
      resolve(data);
    })
    .catch((err) => {
      console.log('There was a failure calling getSpeechandtextanalyticsConversation');
      console.error(err);
      reject();
    });
           
  } catch (error) {
    console.error(error);
    reject();
  }
});

};

exports.getTranscriptUrl = async (id, communicationId) => {  
  console.log('getTranscriptUrl()');
  return new Promise(async (resolve, reject) => {
  try {

    let apiInstance = new platformClient.SpeechTextAnalyticsApi();

    apiInstance.getSpeechandtextanalyticsConversationCommunicationTranscripturl(id, communicationId)
    .then((data) => {
      console.log('getSpeechandtextanalyticsConversationCommunicationTranscripturl success!. Download Data');
      resolve(data.url);
    })
    .catch((err) => {
      console.log('There was a failure calling getSpeechandtextanalyticsConversationCommunicationTranscripturl');
      console.error(err);
      reject();
    });
           
  } catch (error) {
    console.error(error);
    reject();
  }
});

};

exports.getUrlContent = async (_url) => {  
  return new Promise(async (resolve, reject) => {
    try {
      return await Axios({
        url: _url,
        method: 'GET',        
      }).then((response) => {
        console.log(response.data);
        resolve(response.data);
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 

//#endregion