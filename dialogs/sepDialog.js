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


var appdLink='https://charlie202008310330195.saas.appdynamics.com';
var appdUserName='charlie202008310330195@charlie202008310330195';
var appdPassword='5myrxxro74q7';

var inputApp='';
var tiers='';

const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class SepDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'sepDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.appStep.bind(this),
                this.actionStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }


    async appStep(step)
    {
      return await step.beginDialog(APPNAME_DIALOG);
    }
    async actionStep(step)
    {
            inputApp=step.result;
            await axios.get(`${appdLink}/controller/rest/applications/${inputApp}/tiers?output=json`,
            {
               auth:
                {
                    username: appdUserName,
                    password: appdPassword
                 }
            }).then((result) => 
                 {
                     // For multiple Tiers ,we should take user choice Here.
                      tiers=result.data[0].name;
                     
                 });
            await axios.get(`${appdLink}/controller/rest/applications/${inputApp}/metrics?metric-path=Service%20Endpoints%7C${tiers}&time-range-type=BEFORE_NOW&duration-in-mins=1440&output=json`,
            {
               auth:
                {
                    username: appdUserName,
                    password: appdPassword
                 }
            }).then((result) => 
                 {
                     if(result.data.length!=0)
                     {
                      step.context.sendActivity("All Available service End Points :"+"\r\n"+result.data[0].name);
                     }
                     else
                     {
                         step.context.sendActivity('No service end points available for now')
                     }
                });
        
        
      
      return await step.endDialog();
    
  }

   }

module.exports.SepDialog = SepDialog;
