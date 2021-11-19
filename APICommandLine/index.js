const fetch = require('node-fetch');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const clientId = process.env.GENESYS_CLOUD_CLIENT_ID;
const clientSecret = process.env.GENESYS_CLOUD_CLIENT_SECRET;
const environment = process.env.GENESYS_CLOUD_ENVIRONMENT; // expected format: mypurecloud.com

let body = null;

//#region Genesys Cloud Authentication

const params = new URLSearchParams();
params.append('grant_type', 'client_credentials');

fetch(`https://login.${environment}/oauth/token`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${Buffer.from(clientId + ':' + clientSecret).toString('base64')}`,
  },
  body: params,
})
  .then((res) => {
    if (res.ok) {
      return res.json();
    } else {
      throw Error(res.statusText);
    }
  })
  .then((jsonResponse) => {
    console.log('Logged in!\n');
    body = jsonResponse;
    getUserInput();
  })
  .catch((e) => console.error(e));

//#endregion

//#region Questions

rl.on('close', function () {
  console.log('\nBYE BYE !!!');
  process.exit(0);
});

const getUserInput = () => {
  try {
    rl.question('\nWhat do you want to do? (1=GET /topics, 2=GET /triggers, 3=POST /triggers, 4=DELETE /triggers q=quit) ', async function (action) {
      switch (action) {
        case '1':
          const topics = await getTopics();
          console.log(topics?.entities);
          getUserInput();
          break;
        case '2':
          const triggers = await getTriggers();
          console.log(triggers?.entities);
          getUserInput();
          break;
        case '3':
          // eventTTLSeconds must be at least 10 seconds
          await createTrigger({
            target: {
              type: 'Workflow',
              id: '9405b9e3-2399-4a6d-8915-5c3e59b13264',
            },
            enabled: true,
            matchCriteria: [
              {
                jsonPath: "participants[?(@.queue.id == '5c1032fd-c8e8-4957-a675-c97568e6c9d7' && @.state =='disconnected')]",
                operator: 'NotEqual',
                value: '[]',
              },
              {
                jsonPath: "participants[?(@.attributes['Disconnect Processing Completed'] == 'true')]",
                operator: 'Equal',
                value: '[]',
              },
            ],
            name: 'Process disconnected chats',
            topicName: 'v2.organization.conversations.chats',
            eventTTLSeconds: 10,
          });
          getUserInput();
          break;
        case '4':
          await deleteTriggers();
          getUserInput();
          break;
        case 'q':
          rl.close();
          break;
        default:
          console.error('Unknown command:', action);
          break;
      }
    });
  } catch (error) {
    process.exit(1);
  }
};

//#endregion

//#region Topics

function getTopics() {
  return fetch(`https://api.${environment}/api/v2/processautomation/triggers/topics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${body.token_type} ${body.access_token}`,
    },
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw Error(res.statusText);
      }
    })
    .then((jsonResponse) => {
      return jsonResponse;
    })
    .catch((e) => {
      console.error(e);
    });
}

//#endregion

//#region Triggers

function getTriggers() {
  return fetch(`https://api.${environment}/api/v2/processautomation/triggers`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${body.token_type} ${body.access_token}`,
    },
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw Error(res.statusText);
      }
    })
    .then((jsonResponse) => {
      return jsonResponse;
    })
    .catch((e) => console.error(e));
}

function createTrigger(trigger) {
  return fetch(`https://api.${environment}/api/v2/processautomation/triggers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${body.token_type} ${body.access_token}`,
    },
    body: JSON.stringify(trigger),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        console.log(res.headers);
        throw Error(res.statusText);
      }
    })
    .then((jsonResponse) => {
      console.log(JSON.stringify(jsonResponse, null, 2));
      getUserInput();
    })
    .catch((e) => {
      console.error(e);
    });
}

async function deleteTrigger(id) {
  return fetch(`https://api.${environment}/api/v2/processautomation/triggers/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${body.token_type} ${body.access_token}`,
    },
  })
    .then((res) => {
      if (res.status === 204) {
        console.log(`Trigger ${id} deleted`);
        return;
      } else {
        throw Error(res.statusText);
      }
    })
    .catch((e) => {
      console.error(e);
    });
}

async function deleteTriggers() {
  const triggers = await getTriggers();
  console.log(`\nFound ${triggers?.entities?.length} trigger(s)`);
  for (const trigger of triggers?.entities) {
    await deleteTrigger(trigger.id);
  }
}

//#endregion
