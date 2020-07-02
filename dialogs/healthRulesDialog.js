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
const { TimeRangeDialog }=require('./timeRangeDialog');

const TIMERANGE_DIALOG='timeRangeDialog';

const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

var inputApp='aa';
var info='';
var totalApp='';
var startRange='0';
var endRange='0';
var finalRange='';
var timeRangeFlag=-1;
var appTier='';

class HealthRulesDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'healthRulesDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new TimeRangeDialog(TIMERANGE_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.questionStep.bind(this),
                this.appStep.bind(this),
                this.appCheckStep.bind(this),
                this.appTierStep.bind(this),
                this.timeRangeStep.bind(this),
                this.actionStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async questionStep(step)
    {
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'please chooose from following:',
            choices: ChoiceFactory.toChoices(['All Health Violations', 'All Health Rules'])
        });
    }
    async appStep(step) {
            
      info=step.result.value;

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
          return await step.beginDialog('applicationDialog');
        }
        else{
            return await step.next();
        }

    }
    async appTierStep(step)
    {
        await axios.get(`https://amelia202006281753585.saas.appdynamics.com/controller/rest/applications/${inputApp}/tiers?output=json`,
        {
          auth:
          {
            username: 'amelia202006281753585@amelia202006281753585',
            password: 'nghn94uju0t8'
          }
        }).then((result) =>{   
            appTier=result.data[0].name;
        });   
        return await step.next();
    }
    async timeRangeStep(step)
    {
     if(info=='All Health Violations')
      {
        timeRangeFlag=1; 
        return await step.beginDialog(TIMERANGE_DIALOG, {range : finalRange});
      }
      
      return await step.next();
    }
    async actionStep(step)
    {
      if(timeRangeFlag==1)
      {
        startRange = step.result.split(" ")[0];
        step.context.sendActivity(startRange);
        endRange = step.result.split(" ")[1];
        step.context.sendActivity(endRange);      
      }
      
        if(info=='All Health Violations')
        {
            await axios.get(`https://amelia202006281753585.saas.appdynamics.com/controller/rest/applications/${inputApp}/problems/healthrule-violations?time-range-type=BEFORE_NOW&duration-in-mins=${startRange}&output=json`,
            {               
              auth:
                {
                  username: 'amelia202006281753585@amelia202006281753585',
                  password: 'nghn94uju0t8'
                }
            }).then((result) =>{
                for(var i=0;i<result.data.length;i++)
                {
                    step.context.sendActivity(result.data[i].description);
                }
            });
        }
        else if(info='All Health Rules')
        {

        }
        return await step.endDialog();
    }
   }

module.exports.HealthRulesDialog = HealthRulesDialog;
