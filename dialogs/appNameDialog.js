// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { InputHints, MessageFactory } = require('botbuilder');
const axios=require('axios');
const {
    AttachmentPrompt,
    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    NumberPrompt,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');

var totalApp='';
var inputApp='';

const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class AppNameDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'appNameDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.appStep.bind(this),
                this.appCheckStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async appStep(step) {
            
        await axios.get(`https://amelia202006281753585.saas.appdynamics.com/controller/rest/applications?output=json`,
        {
          auth:
          {
            username: 'amelia202006281753585@amelia202006281753585',
            password: 'nghn94uju0t8'
          }
        }).then((result) =>{   
         totalApp=result.data;
        });  
        
        for(var i=0;i<totalApp.length;i++)
        {
          step.context.sendActivity(totalApp[i].name);
        }
           return await step.prompt(TEXT_PROMPT,'hello! Please enter app name from above list');
    }

    async appCheckStep(step)
    {
        var flag=-1;
        inputApp=step.result;
        for(var i=0;i<totalApp.length;i++)
        {
          if(totalApp[i].name=inputApp)
          {
            flag=1;
            break;
          }
        } 
        if(flag==-1)
        {
          step.context.sendActivity('Sorry! You entered wrong name');
          return await step.beginDialog('appNameDialog');
        }
        else{
            return await step.endDialog(inputApp);
        }

    }
   }

module.exports.AppNameDialog = AppNameDialog;