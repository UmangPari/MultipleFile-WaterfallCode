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

class ActionSuppressionDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'actionSuppressionDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.quesStep.bind(this),
                this.actionStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async quesStep(step)
    {
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please choose the following actions',
            choices: ChoiceFactory.toChoices(['Add a new Action Suppression','Show All Action Suppression'])
        });
    }

    async actionStep(step)
    {
        if(step.result.value=='Add a new Action Suppression')
        {
        
             await axios.post('https://amelia202006281753585.saas.appdynamics.com/controller/alerting/rest/v1/applications/7960/action-suppressions',
             {
                "name":"Roopam15",
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
        else if(step.result.value=='Show All Action Suppression')
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
        return await step.endDialog();
    }
   }

module.exports.ActionSuppressionDialog = ActionSuppressionDialog;
