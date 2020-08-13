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
const { AppNameDialog }=require('./appNameDialog');

const APPNAME_DIALOG = 'appNameDialog';
const TIMERANGE_DIALOG='timeRangeDialog';

const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';


var appdLink='https://chaplin202008130019254.saas.appdynamics.com';
var appdUserName='chaplin202008130019254@chaplin202008130019254';
var appdPassword='lb19y0vkgnwf';

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
            .addDialog(new AppNameDialog(APPNAME_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.questionStep.bind(this),
                this.appStep.bind(this),
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
      return await step.beginDialog(APPNAME_DIALOG);
    }

 
    async timeRangeStep(step)
    {
      inputApp=step.result;
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
        endRange = step.result.split(" ")[1];   
      }
      
        if(info=='All Health Violations')
        {
            await axios.get(`${appdLink}/controller/rest/applications/${inputApp}/problems/healthrule-violations?time-range-type=BEFORE_NOW&duration-in-mins=${startRange}&output=json`,
            {               
              auth:
                {
                  username: appdUserName,
                  password: appdPassword
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
