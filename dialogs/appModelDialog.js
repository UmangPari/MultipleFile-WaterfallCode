// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { InputHints, MessageFactory } = require('botbuilder');
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
const axios = require('axios');

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

var app='';
var info='';

class AppModelDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'appModelDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.appStep.bind(this),
                this.infoStep.bind(this),
                this.appModelApiStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async appStep(step)
    {
         return await step.prompt(TEXT_PROMPT,'hello! Please enter app name');

    }
    
    async infoStep(step)
    {
        app=step.result;
        
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please enter your info.',
            choices: ChoiceFactory.toChoices(['tiers', 'business-transactions', 'backends','nodes'])
        }); 
    }   
    async appModelApiStep(step)
    {
        info=step.result.value;
       
    await axios.get(`https://davinci202006102213579.saas.appdynamics.com/controller/rest/applications/${app}/${info}?output=json`,
    {
      auth:
      {
        username: 'davinci202006102213579@davinci202006102213579',
        password: 'gddmj89nwy1k'
      }
    }).then((result) =>{   
     var outerData=result.data;
     if(info=='tiers')
     {
         
            step.context.sendActivity(outerData[0].agentType);
              step.context.sendActivity(outerData[0].name);
              step.context.sendActivity(outerData[0].description);
              step.context.sendActivity(outerData[0].id.toString());
              step.context.sendActivity(outerData[0].numberOfNodes.toString());
              step.context.sendActivity(outerData[0].type);
     }
     else if(info=='business-transactions')
     {
         for(var i=0;i<outerData.length;i++)
         {
             step.context.sendActivity(outerData[i].internalName);
             step.context.sendActivity(outerData[i].tierId.toString());
             step.context.sendActivity(outerData[i].entryPointType);
             step.context.sendActivity(outerData[i].background.toString());
             step.context.sendActivity(outerData[i].tierName);
             step.context.sendActivity(outerData[i].name);
             step.context.sendActivity(outerData[i].id.toString());
             step.context.sendActivity(outerData[i].entryPointTypeString);
         }
       } 
       else if(info=='backends')
       {
         for(var i=0;i<outerData.length;i++)
         {
             step.context.sendActivity(outerData[i].exitPointType);
             step.context.sendActivity(outerData[i].tierId.toString());
             step.context.sendActivity(outerData[i].name);
             step.context.sendActivity(outerData[i].applicationComponentNodeId.toString());
             step.context.sendActivity(outerData[i].id.toString());
           for(var j=0;j<outerData[i].properties.length;j++)
           {
             step.context.sendActivity(outerData[i].properties[j].name);
             step.context.sendActivity(outerData[i].properties[j].id.toString());
             step.context.sendActivity(outerData[i].properties[j].value);
           }
       }
     }
       else if(info=='nodes')
       {
        step.context.sendActivity(outerData[0].appAgentVersion);
        step.context.sendActivity(outerData[0].machineAgentVersion);
        step.context.sendActivity(outerData[0].agentType);
        step.context.sendActivity(outerData[0].type);
        step.context.sendActivity(outerData[0].machineName);
        step.context.sendActivity(outerData[0].appAgentPresent.toString());
        step.context.sendActivity(outerData[0].nodeUniqueLocalId);
        step.context.sendActivity(outerData[0].machineId.toString());
        step.context.sendActivity(outerData[0].machineOSType);
        step.context.sendActivity(outerData[0].tierId.toString());
        step.context.sendActivity(outerData[0].tierName);
        step.context.sendActivity(outerData[0].machineAgentPresent.toString());
        step.context.sendActivity(outerData[0].name);
        step.context.sendActivity(outerData[0].ipAddresses);
        step.context.sendActivity(outerData[0].id.toString());
       }
       else
       {
          step.context.sendActivity('no data found');
       }
           
   });
   return await step.endDialog();
   
   
    }
   }

module.exports.AppModelDialog = AppModelDialog;
