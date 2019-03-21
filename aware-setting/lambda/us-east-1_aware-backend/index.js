const Alexa = require("ask-sdk-core");
const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1"
});

const {
  DynamoDbPersistenceAdapter
} = require("ask-sdk-dynamodb-persistence-adapter");
const persistenceAdapter = new DynamoDbPersistenceAdapter({
  tableName: "aware-table",
  createTable: true
});

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  async handle(handlerInput) {
    const attributes = await handlerInput.attributesManager.getPersistentAttributes();
    if (Object.keys(attributes).length == 0) {
      attributes.user0 = {
        MacAddress: "<Bluetooth Mac Addr>",
        Notification: "on/off",
        PhoneNumber: "",
        UserName: "<USERNAME>"
      };
      console.log("Created an attribute (LaunchRequest):\n", attributes);
    } else {
      console.log("Saved attributes (LaunchRequest):\n", attributes);
    }
    handlerInput.attributesManager.setPersistentAttributes(attributes);
    await handlerInput.attributesManager.savePersistentAttributes();
    return handlerInput.responseBuilder
      .speak(
        "Welcome to Aware Alexa. I can help you edit your information or preference."
      )
      .reprompt("What can I do for you? You can say help for assistance.")
      .withSimpleCard("Aware Alexa", "What can I do for you?")
      .getResponse();
  }
};

let ChangeNameHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "ChangeNameIntent"
    );
  },
  async handle(handlerInput) {
    const UserName = handlerInput.requestEnvelope.request.intent.slots.UserName.value;
    const NewName = handlerInput.requestEnvelope.request.intent.slots.NewName.value;
    const attributes = await handlerInput.attributesManager.getPersistentAttributes();
    console.log("Loaded attributes (ChangeNameHandler):\n", attributes);
    let Msg = "There is no user does with user name " + UserName;
    for (var uid in attributes) {
      if (attributes[uid].UserName === UserName.toLowerCase()) {
        attributes[uid].UserName = NewName.toLowerCase();
        Msg = "Updating username to " + NewName;
        break;
      }
    }
    console.log("Updated attributes (ChangeNameHandler):\n", attributes);
    handlerInput.attributesManager.setPersistentAttributes(attributes);
    await handlerInput.attributesManager.savePersistentAttributes();
    return handlerInput.responseBuilder
      .speak(Msg)
      .reprompt("What else can I do for you?")
      .getResponse();
  }
};

const ChangePhoneHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "ChangePhoneIntent"
    );
  },
  async handle(handlerInput) {
    const UserName = handlerInput.requestEnvelope.request.intent.slots.UserName.value;
    const PhoneNumber = handlerInput.requestEnvelope.request.intent.slots.PhoneNumber.value;
    const attributes = await handlerInput.attributesManager.getPersistentAttributes();
    console.log("Loaded attributes (ChangePhoneHandler):\n", attributes);
    let Msg = "There is no user does with user name " + UserName;
    for (var uid in attributes) {
      if (attributes[uid].UserName === UserName.toLowerCase()) {
        attributes[uid].PhoneNumber = PhoneNumber;
        Msg = "Updating phone number to " + PhoneNumber;
        break;
      }
    }
    console.log("Updated attributes (ChangePhoneHandler):\n", attributes);
    handlerInput.attributesManager.setPersistentAttributes(attributes);
    await handlerInput.attributesManager.savePersistentAttributes();
    return handlerInput.responseBuilder
      .speak(Msg)
      .reprompt("What else can I do for you?")
      .getResponse();
  }
};

const ChangeNotificationHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "ChangeNotificationIntent"
    );
  },
  async handle(handlerInput) {
    const UserName = handlerInput.requestEnvelope.request.intent.slots.UserName.value;
    const Notification = handlerInput.requestEnvelope.request.intent.slots.On_Off.value;
    const attributes = await handlerInput.attributesManager.getPersistentAttributes();
    console.log("Loaded attributes (handlerInput):\n", attributes);
    let Msg = "There is no user does with user name " + UserName;
    for (var uid in attributes) {
      if (attributes[uid].UserName === UserName.toLowerCase()) {
        attributes[uid].Notification = Notification.toLowerCase();
        Msg = "Updating your notification setting to " + Notification;
        break;
      }
    }
    console.log("Updated attributes (ChangeNotificationHandler):\n", attributes);
    handlerInput.attributesManager.setPersistentAttributes(attributes);
    await handlerInput.attributesManager.savePersistentAttributes();
    return handlerInput.responseBuilder
      .speak(Msg)
      .reprompt("What else can I do for you?")
      .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    let helpMsg = 'Tell me your "user name" + "field you want to change" + "new field value"';
    return handlerInput.responseBuilder
      .speak(helpMsg)
      .reprompt(helpMsg)
      .withSimpleCard("Aware Alexa", helpMsg)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      (handlerInput.requestEnvelope.request.intent.name === "AMAZON.CancelIntent" ||
        handlerInput.requestEnvelope.request.intent.name === "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("Goodbye!")
      .withSimpleCard("Aware Alexa", "Goodbye!")
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${ handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    return handlerInput.responseBuilder
      .speak("Sorry, I can't understand the command. Please say again.")
      .reprompt("Sorry, I can't understand the command. Please say again.")
      .getResponse();
  }
};

// MAIN
exports.handler = async (event, context, callback) => {

  // log received events:
  console.log("Received arguments",
    "\nEvent:", JSON.stringify(event),
    "\nContext:", JSON.stringify(context),
    "\nCallback:", JSON.stringify(callback)
  );

  // handle alexa app events
  if (event.hasOwnProperty("request") &&
    (event.request.type === "LaunchRequest" ||
      event.request.type === "IntentRequest" ||
      event.request.type === "SessionEndedRequest")) {
    let skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        ChangeNameHandler,
        ChangePhoneHandler,
        ChangeNotificationHandler,
        LaunchRequestHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler)
      .withPersistenceAdapter(persistenceAdapter)
      .addErrorHandlers(ErrorHandler)
      .create();
    return skill.invoke(event, context);
  }

  // handle api gateway events
  else if (event.httpMethod != undefined) {
    var obj = JSON.parse(event.body);
    var echo = '{"msg":"Invalid body format"}';
    var statusCode = 400;

    if (event.httpMethod === "POST") {
      if (obj.hasOwnProperty("code")) {
        echo = `{"msg":"Not supported"}`;
        statusCode = 200;
        switch (obj.code) {

          case "smartThingsUpdate": // handle event from smartthings hub
            if (obj.hasOwnProperty("deviceId") && obj.hasOwnProperty("contactStatus")) {
              // Door sensor device ID, Door status (open/close)

              const documentClient = new AWS.DynamoDB.DocumentClient();
              const doorState = {
                TableName: "aware-devices",
                Item: {
                  DeviceID: "DoorState",
                  DeviceType: "SmartThings",
                  DeviceState: obj.contactStatus
                }
              };
              documentClient.put(doorState).promise()
                .then(data => {
                  console.log(data);
                })
                .catch(err => {
                  console.log(err);
                });

              // callback message
              echo = `{"msg":"okay","deviceId":"${obj.deviceId}","contactStatus":"${obj.contactStatus}"}`;
            }
            break;


          case "piBlueToothUpdate": // handle event from raspberry pi
            if (obj.hasOwnProperty("deviceAddress") && obj.hasOwnProperty("RSSIstrength") && obj.hasOwnProperty("deviceID")) {
              // Mac address of iphone, RSSI strength, name of PI

              let getAudio = "no";
              const documentClient = new AWS.DynamoDB.DocumentClient();
              const doorState = await documentClient
                .scan({
                  TableName: "aware-devices",
                  FilterExpression: "DeviceID = :id",
                  ExpressionAttributeValues: {
                    ":id": 'DoorState'
                  }
                })
                .promise()
                .then(data => {
                  console.log(data);
                  return data.Items[0].DeviceState;
                }).catch(err => {
                  console.log(err);
                  return undefined;
                });
              console.log('doorState:', doorState);

              // device data @ deviceAddress
              const device_data = await documentClient
                .scan({
                  TableName: "aware-devices",
                  FilterExpression: "DeviceID = :id",
                  ExpressionAttributeValues: {
                    ":id": obj.deviceAddress
                  }
                })
                .promise()
                .then(data => {
                  console.log(data);
                  if (data.Count === 1) {
                    return data.Items[0];
                  } else {
                    return undefined;
                  }
                })
                .catch(err => {
                  console.log(err);
                  return undefined;
                });
              console.log('device_data:', device_data);

              // check/update state of each bluetooth device ?> say stuff
              if (doorState === 'open' && device_data !== undefined) {
                console.log('door open');

                // event from PI at the door
                if (obj.deviceID === 'MyPI1') {
                  console.log('from MyPI1');

                  const setState = {
                    TableName: "aware-devices",
                    Item: device_data
                  };
                  if (obj.RSSIstrength >= 0) {
                    setState.Item.DeviceState = 1;
                    setState['Item'][obj.deviceID] = obj.RSSIstrength;
                  } else {
                    setState.Item.DeviceState = 0;
                    setState['Item'][obj.deviceID] = obj.RSSIstrength;
                  }
                  documentClient
                    .put(setState)
                    .promise()
                    .then(data => {
                      console.log(data);
                    })
                    .catch(err => {
                      console.log(err);
                    });
                }

                // event from PI inside the house
                else if (obj.deviceID === 'MyPI2') {

                  console.log('from MyPI2');

                  // say stuff
                  if (device_data.DeviceState === 1) {

                    let username = await documentClient
                      .scan({
                        TableName: "aware-table"
                      })
                      .promise()
                      .then(data => {
                        console.log(data);
                        if (data.Count > 0) {
                          for (let i in data.Items) {
                            if (data.Items[i].id.slice(0, 9) === "amzn1.ask") {
                              console.log(data.Items[i]);
                              for (var u in data.Items[i].attributes) {
                                if (data.Items[i].attributes[u].MacAddress === obj.deviceAddress) {
                                  return data.Items[i].attributes[u].UserName;
                                }
                              }
                            }
                          }
                        }
                      })
                      .catch(err => {
                        console.log(err);
                        return undefined;
                      }) || "unknown person";

                    console.log(username);

                    if (device_data[obj.deviceID] > -2 && obj.RSSIstrength < -2) {
                      getAudio = "yes";
                      await textToSpeech("Goodbye " + username);
                    }

                    if (device_data[obj.deviceID] < -2 && obj.RSSIstrength > -2) {
                      getAudio = "yes";
                      await textToSpeech("Welcome Home " + username);
                    }

                  }

                  // update database
                  const setState = {
                    TableName: "aware-devices",
                    Item: device_data
                  };
                  setState['Item'][obj.deviceID] = obj.RSSIstrength;
                  documentClient
                    .put(setState)
                    .promise()
                    .then(data => {
                      console.log(data);
                    })
                    .catch(err => {
                      console.log(err);
                    });

                }
              }

              // if door is 'close' reset state of each bluetooth device
              else if (doorState === 'close' && device_data !== undefined) {
                console.log('door close');

                const resetState = {
                  TableName: "aware-devices",
                  Item: device_data
                };
                resetState.Item.DeviceState = 0;
                resetState['Item'][obj.deviceID] = obj.RSSIstrength;

                console.log(resetState);
                await documentClient.put(resetState)
                  .promise()
                  .then(data => {
                    console.log(data);
                  })
                  .catch(err => {
                    console.log(err);
                  });
              }

              // add device to the database
              else {
                const new_device = {
                  TableName: "aware-devices",
                  Item: {}
                };
                new_device['Item']['DeviceID'] = obj.deviceAddress;
                new_device['Item']['DeviceType'] = "Bluetooth";
                new_device['Item']['DeviceState'] = 0;
                new_device['Item'][obj.deviceID] = obj.RSSIstrength;
                documentClient.put(new_device).promise()
                  .then(data => {
                    console.log(data);
                  })
                  .catch(err => {
                    console.log(err);
                  });
              }

              // get a list of mac address for PI to scan
              let macAdrs = await documentClient
                .scan({
                  TableName: "aware-table"
                })
                .promise()
                .then(data => {
                  let adrs = "";
                  console.log(data);
                  if (data.Count > 0) {
                    for (let i in data.Items) {
                      if (data.Items[i].id.slice(0, 9) === "amzn1.ask") {
                        console.log(data.Items[i]);
                        for (var u in data.Items[i].attributes) {
                          adrs += data.Items[i].attributes[u].MacAddress + ",";
                        }
                        break;
                      }
                    }
                  }
                  return adrs;
                })
                .catch(err => {
                  console.log(err);
                  return err;
                });

              // callback message
              echo = `{"msg":"okay","download":"${getAudio}","scanAddress":"${macAdrs}","deviceAddress":"${obj.deviceAddress}","RSSIstrength":"${obj.RSSIstrength}"}`;
            }
            break;


          default:
            break;
        }
      }
    }
    console.log(echo);
    callback(null, {
      statusCode: statusCode,
      body: echo,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};

// use AWS.Polly to synthesize Speech, then upload mp3 to AWS.S3
async function textToSpeech(message) {
  const polly = new AWS.Polly();
  const params = {
    OutputFormat: "mp3",
    SampleRate: "22050",
    Text: message,
    TextType: "text",
    VoiceId: "Joanna"
  };
  await polly.synthesizeSpeech(params, (err, data) => {
    if (err) {
      console.log(err, err.stack);
    } else {
      const s3 = new AWS.S3();
      let s3params = {
        Body: data.AudioStream,
        Bucket: "bucket-202-project",
        Key: "tmp.mp3",
        ACL: "public-read"
      };
      s3.upload(s3params, function (err, data) {
        if (err) console.log(err.message);
        else console.log(data.Location);
      });
    }
  });
}

// // use AWS.SNS to sent text messages
// function sentMessage(number, message) {
//   const sns = new AWS.SNS();
//   const params = {
//     PhoneNumber: number,
//     Message: message
//   };
//   sns.publish(params, (err, data) => {
//     if (err) console.error("Error:", err);
//     else console.log("SNS publish success");
//   });
// }