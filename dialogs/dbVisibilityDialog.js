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

class DbVisibilityDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'dbVisibilityDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.dbVisibilityApiStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async dbVisibilityApiStep(step)
    {
      await axios.get(`https://davinci202006102213579.saas.appdynamics.com/controller/rest/databases/servers?output=json`,
      {
        auth:
        {
          username: 'davinci202006102213579@davinci202006102213579',
          password: 'gddmj89nwy1k'
        }
      }).then((result) =>{   
       var outerData=result.data;
          step.context.sendActivity(outerData[0].id.toString());
      });
      return await step.endDialog();
    
  }

   }

module.exports.DbVisibilityDialog = DbVisibilityDialog;
