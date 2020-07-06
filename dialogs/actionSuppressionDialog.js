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

const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';
const APPNAME_DIALOG='appNameDialog';
var asName='Example';
var info, asId,inputApp='null';
class ActionSuppressionDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'actionSuppressionDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.quesStep.bind(this),
                this.asNameStep.bind(this),
                this.actionStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async quesStep(step)
    {
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please choose the following actions',
            choices: ChoiceFactory.toChoices(['Add','Show All','Delete'])
        });
    }

    async asNameStep(step)
    {

        info=step.result.value;
        if(info=='Add')
        {
        return await step.prompt(TEXT_PROMPT,'Enter any Acion Supression Name');
        }
        else if(info=='Delete')
        {
              return await step.prompt(TEXT_PROMPT,'Enter any Acion Supression Name u want to delete');
        }

    }
    async actionStep(step)
    {
      
        if(info=='Add')
        {
            asName=step.result;
             await axios.post('https://amelia202006281753585.saas.appdynamics.com/controller/alerting/rest/v1/applications/7960/action-suppressions',
             {
                 "name":asName,
                "disableAgentReporting":true,
                "startTime":"2018-04-09T12:10:18",
                "endTime":"2018-07-10T12:10:18",
                "affects":{
                     "affectedInfoType":"APPLICATION"
                 }
              },
                {
                    auth:
                    {
                        username: 'amelia202006281753585@amelia202006281753585',
                        password: 'nghn94uju0t8'
                    }
               }).then((result) => 
                {
                    if(result.status==201)
                    {
                        step.context.sendActivity('Added succesfully');
                    }
                    else
                    {
                        step.context.sendActivity('Error');
                    }
                });


        }
        else if(info=='Show All')
        {
            await axios.get('https://amelia202006281753585.saas.appdynamics.com/controller/alerting/rest/v1/applications/7960/action-suppressions',
                {
                    auth:
                    {
                        username: 'amelia202006281753585@amelia202006281753585',
                        password: 'nghn94uju0t8'
                    }
               }).then((result) => 
                {
                    for(var i=0;i<result.data.length;i++)
                    {
                        step.context.sendActivity(result.data[i].name);
                    }     
                });
        }
        else if(info=='Delete')
        {
            asName=step.result;
            await axios.get('https://amelia202006281753585.saas.appdynamics.com/controller/alerting/rest/v1/applications/7960/action-suppressions',
                {
                    auth:
                    {
                        username: 'amelia202006281753585@amelia202006281753585',
                        password: 'nghn94uju0t8'
                    }
               }).then((result) => 
                {
                    for(var i=0;i<result.data.length;i++)
                    {
                   if(asName==result.data[i].name)       
                        {
                            asId=result.data[i].id; 
                            break;
                        }
                        else{step.context.sendActivity('There is no such Action Suppression')}
                
                }
                });

             await axios.delete(`https://amelia202006281753585.saas.appdynamics.com/controller/api/accounts/1414/applications/7960/actionsuppressions/${asId}`,
             {
               auth:
                    {
                        username: 'amelia202006281753585@amelia202006281753585',
                        password: 'nghn94uju0t8'
                    }
               }).then((result) => 
                {
                    if(result.status==204)
                    {
                        step.context.sendActivity('Deleted succesfully');
                    }
                    else
                    {
                        step.context.sendActivity('Error');
                    }
                });


        }
        return await step.endDialog();
    }
   }

module.exports.ActionSuppressionDialog = ActionSuppressionDialog;
