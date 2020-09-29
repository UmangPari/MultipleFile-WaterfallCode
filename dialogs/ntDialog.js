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


var appdLink='https://theater202009172349223.saas.appdynamics.com';
var appdUserName='theater202009172349223@theater202009172349223';
var appdPassword='vdrv1icvgblr';

var inputApp='';
var info='';

const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class NtDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'ntDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new AppNameDialog(APPNAME_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.quesStep.bind(this),
                this.appStep.bind(this),
                this.actionStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }
    async quesStep(step)
    {

        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please choose the Report u want to know.',
            choices: ChoiceFactory.toChoices(['Tiers','Nodes','Main Menu','BACK'])
              });

    }
    async appStep(step)
    {
        info= step.result.value;
        if(info=='Main Menu'||info=='BACK')
        {
            return await step.next();
        }
        else
        {
            return await step.beginDialog(APPNAME_DIALOG);
        }    
    }
    async actionStep(step)
    {
        inputApp = step.result;
        
        if(info=='Tiers')
        {

            await axios.get(`${appdLink}/controller/rest/applications/${inputApp}/tiers?output=json`,
            {
               auth:
                {
                    username: appdUserName,
                    password: appdPassword
                 }
            }).then((result) => 
                 {
                      step.context.sendActivity(result.data[0].name);
                });
                return await step.next();
        }
        else if(info=='Nodes')
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
                      step.context.sendActivity(result.data[0].name);
                });
                return await step.next();
        }
        else if(info=='Main Menu')
        {
            return await step.endDialog(0);
        }
        else if(info=='BACK')
        {
            return await step.endDialog(1);
        }
        else {
            return await step.next();
        }
    
  }
  async confirmStep(step)
  {
      
      return await step.prompt(CHOICE_PROMPT, {
          prompt: 'Any more Info about Tiers and Nodes?',
          choices: ChoiceFactory.toChoices(['yes', 'no'])
      });
  } 

  async finalStep(step)
  {
      if(step.result.value=='yes')
      {
         return await step.beginDialog('ntDialog');
      }
      else
      {   
          step.context.sendActivity('Bye');
          return await step.endDialog();
      }
  }

   }

module.exports.NtDialog = NtDialog;
