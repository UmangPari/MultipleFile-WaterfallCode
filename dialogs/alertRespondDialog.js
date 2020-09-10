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
const { PolicyDialog }=require('./policyDialog');
const { EmailDigestDialog }=require('./emailDigestDialog');
const { ActionDialog }=require('./actionDialog');

var recurFlag;
const ACTION_DIALOG='actionDialog';
const EMAILDIGEST_DIALOG='emailDigestDialog';
const POLICY_DIALOG='policyDialog';
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
            .addDialog(new PolicyDialog(POLICY_DIALOG))
            .addDialog(new EmailDigestDialog(EMAILDIGEST_DIALOG))
            .addDialog(new ActionDialog(ACTION_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.alertTypeStep.bind(this),
                this.actionStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }
    async alertTypeStep(step)
    {   
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please choose the following actions',
            choices: ChoiceFactory.toChoices(['Policies','Health Rules','Actions','Action Suppression','Email Digests','Main Menu','BACK'])
        });
       }
    async actionStep(step)
    {
      if(step.result.value=='Policies')
      {
        return await step.beginDialog(POLICY_DIALOG);
      }
      else if(step.result.value=='Health Rules')
      {
          return await step.beginDialog(HEALTHRULES_DIALOG);
      }
     /* else if(step.result.value=='(Anomaly Detection)')
      {
        step.context.sendActivity("Work in Progress");
        return await step.next();
      }*/
      else if(step.result.value=='Actions')
      { 
        return await step.beginDialog(ACTION_DIALOG);
      }
      else if(step.result.value=='Action Suppression')
      {
          return await step.beginDialog(ACTIONSUPPRESSION_DIALOG);
      }
      else if(step.result.value=='Email Digests')
      {
        return await step.beginDialog(EMAILDIGEST_DIALOG);
      }
      else if(step.result.value=='Main Menu')
      {
          return await step.endDialog(0);
      }
      else if(step.result.value=='BACK')
      {
        return await step.endDialog(1);
      }
      else
      {
        return await step.next();
      }
  }
  async confirmStep(step)
  {
      if(step.result==1)
      {
          return await step.beginDialog('alertRespondDialog');
          
      }
      else if(step.result==0)
      {
          return await step.endDialog(0);
      }
      else
      {
        return await step.prompt(CHOICE_PROMPT, {
           prompt: 'Any more Info about Alert and respond?',
           choices: ChoiceFactory.toChoices(['yes', 'no'])
      });
    }
  } 

  async finalStep(step)
  {
      if(step.result==0)
      {
          return await step.endDialog(0);
      }
      else if(step.result==1)
      {
          return await step.endDialog(0);
      }
      else if(step.result.value=='yes')
      {
         return await step.beginDialog('alertRespondDialog');
      }
      else 
      {   
          return await step.endDialog();
      }
      
  } 

   }

module.exports.AlertRespondDialog = AlertRespondDialog;
