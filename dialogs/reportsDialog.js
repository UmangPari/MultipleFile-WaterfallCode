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


const APPNAME_DIALOG = 'appNameDialog';


var appdLink='https://chaplin202008130019254.saas.appdynamics.com';
var appdUserName='chaplin202008130019254@chaplin202008130019254';
var appdPassword='lb19y0vkgnwf';

var inputApp='';
var info='';

const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class ReportsDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'reportsDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new AppNameDialog(APPNAME_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.quesStep.bind(this),
                this.appStep.bind(this),
                this.actionStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }
    async quesStep(step)
    {
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please choose the Report u want to know.',
            choices: ChoiceFactory.toChoices(['All App agent Version'])
              });

    }

    async appStep(step)
    {
        info= step.result.value;
        return await step.beginDialog(APPNAME_DIALOG);
    }

    async actionStep(step)
    {
        inputApp=step.result;

        if(info=='All App agent Version')
        {
            await axios.get(`${appdLink}/controller/rest/applications/${inputApp}/nodes?output=json`,
            {
               auth:
                {
                    username: appdUserName,
                    password: appdPassword
                 }
            }).then((result) => 
                 {
                      step.context.sendActivity(result.data[0].appAgentVersion);
                });
        }
      
      return await step.endDialog();
    
  }

   }

module.exports.ReportsDialog = ReportsDialog;
