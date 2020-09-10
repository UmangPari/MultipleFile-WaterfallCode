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
const { AppNameDialog }=require('./appNameDialog');

const APPNAME_DIALOG='./appNameDialog';
const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

var appdLink='https://charlie202008310330195.saas.appdynamics.com';
var appdUserName='charlie202008310330195@charlie202008310330195';
var appdPassword='5myrxxro74q7';

var appId,info,inputApp;

class ActionDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'actionDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new AppNameDialog(APPNAME_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.choiceStep.bind(this),
                this.appNameStep.bind(this),
                this.appIdStep.bind(this),
                this.actionStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async choiceStep(step)
    {
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Hi! How can I help u with?',
            choices: ChoiceFactory.toChoices(['Show all Actions','Main Menu','BACK'])
        });
    }
    async appNameStep(step)
    {
        info=step.result.value;
        if(info=='Main Menu'||info=='BACK')
        {
            return await step.next();
        }
        else
        {
            return await step.beginDialog(APPNAME_DIALOG, {app : inputApp });
        }   
    }
    async appIdStep(step)
    {
        inputApp=step.result;
        if(info=='Main Menu'||info=='BACK')
        {
            return await step.next();
        }
        else
        {
            
            await axios.get(`${appdLink}/controller/rest/applications/${inputApp}?output=json`,
            {
            auth:
            {
                username: appdUserName,
                password: appdPassword
            }
            }).then((result) =>{   
                appId=result.data[0].id;
            });   
            return await step.next();
        }
    }
    async actionStep(step)
    {
        if(info=='Show all Actions')
        {
            await axios.get(`${appdLink}/controller/alerting/rest/v1/applications/${appId}/actions`,
            {
                auth:
                {
                username: appdUserName,
                password: appdPassword
                }
            }).then((result) =>{   
            var outerData=result.data;
                for(var i=0;i<outerData.length;i++)
                {
                    step.context.sendActivity(outerData[i].actionType);
                    step.context.sendActivity(outerData[i].name);
                }    
            });
            return await step.next();
        }    
        else if(info=='Main Menu')
        {
            return await step.endDialog(0);
        }
        else if(info=='BACK')
        {
            return await step.endDialog(1);
        }
        else {
            return await step.next();
        }
         
  }
  async confirmStep(step)
  {
      
      return await step.prompt(CHOICE_PROMPT, {
          prompt: 'Any more Info about Action?',
          choices: ChoiceFactory.toChoices(['yes', 'no'])
      });
  } 

  async finalStep(step)
  {
      if(step.result.value=='yes')
      {
         return await step.beginDialog('actionDialog');
      }
      else
      {   
          step.context.sendActivity('Bye');
          return await step.endDialog();
      }
  } 
   }

module.exports.ActionDialog = ActionDialog;
