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
const { HealthRulesDialog }=require('./healthRulesDialog');
const { ActionSuppressionDialog }=require('./actionSuppressionDialog');

const HEALTHRULES_DIALOG='healthRulesDialog';
const ACTIONSUPPRESSION_DIALOG='actionSuppressionDialog';

const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class AlertRespondDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'alertRespondDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new HealthRulesDialog(HEALTHRULES_DIALOG))
            .addDialog(new ActionSuppressionDialog(ACTIONSUPPRESSION_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.alertTypeStep.bind(this),
                this.actionStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }
    async alertTypeStep(step)
    {   
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please choose the following actions',
            choices: ChoiceFactory.toChoices(['Policies','Health Rules','Anomaly Detection','Actions','Action Suppression','Email Digests'])
        });
    }
    async actionStep(step)
    {
      if(step.result.value=='Policies')
      {

      }
      else if(step.result.value=='Health Rules')
      {
          return await step.beginDialog(HEALTHRULES_DIALOG);
      }
      else if(step.result.value=='Anomaly Detection')
      {
          
      }
      else if(step.result.value=='Actions')
      {
          
      }
      else if(step.result.value=='Action Suppression')
      {
          return await step.beginDialog(ACTIONSUPPRESSION_DIALOG);
      }
      else if(step.result.value=='Email Digests')
      {
          
      }
      else{}
      return await step.endDialog();
    
  }

   }

module.exports.AlertRespondDialog = AlertRespondDialog;
